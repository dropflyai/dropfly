/**
 * Desktop Activity Monitor
 * Tracks active applications and window titles
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class ActivityMonitor {
  constructor() {
    this.activities = [];
    this.currentActivity = null;
    this.isMonitoring = false;
    this.intervalId = null;
    this.pollInterval = 5000; // Check every 5 seconds
  }

  /**
   * Get the currently active window (macOS using AppleScript)
   */
  async getActiveWindowMac() {
    return new Promise((resolve, reject) => {
      const script = `
        tell application "System Events"
          set frontApp to first application process whose frontmost is true
          set appName to name of frontApp
          try
            set windowTitle to name of front window of frontApp
          on error
            set windowTitle to ""
          end try
        end tell
        return appName & "|" & windowTitle
      `;

      exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        const [appName, windowTitle] = stdout.trim().split('|');
        resolve({
          application: appName || 'Unknown',
          windowTitle: windowTitle || 'Unknown',
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  /**
   * Get the currently active window (Windows using PowerShell)
   */
  async getActiveWindowWindows() {
    return new Promise((resolve, reject) => {
      const script = `
        Add-Type @"
          using System;
          using System.Runtime.InteropServices;
          using System.Text;
          public class Win32 {
            [DllImport("user32.dll")]
            public static extern IntPtr GetForegroundWindow();
            [DllImport("user32.dll")]
            public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
            [DllImport("user32.dll", SetLastError=true)]
            public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
          }
"@
        $hwnd = [Win32]::GetForegroundWindow()
        $title = New-Object System.Text.StringBuilder 256
        [void][Win32]::GetWindowText($hwnd, $title, $title.Capacity)
        $processId = 0
        [void][Win32]::GetWindowThreadProcessId($hwnd, [ref]$processId)
        $process = Get-Process -Id $processId
        Write-Output "$($process.ProcessName)|$($title.ToString())"
      `;

      exec(`powershell -Command "${script}"`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        const [appName, windowTitle] = stdout.trim().split('|');
        resolve({
          application: appName || 'Unknown',
          windowTitle: windowTitle || 'Unknown',
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  /**
   * Get the currently active window (cross-platform)
   */
  async getActiveWindow() {
    try {
      if (process.platform === 'darwin') {
        return await this.getActiveWindowMac();
      } else if (process.platform === 'win32') {
        return await this.getActiveWindowWindows();
      } else {
        // Linux support can be added here using xdotool or similar
        throw new Error('Unsupported platform. Only macOS and Windows are currently supported.');
      }
    } catch (error) {
      console.error('Error getting active window:', error.message);
      return null;
    }
  }

  /**
   * Check if activity has changed
   */
  activityChanged(newActivity) {
    if (!this.currentActivity) return true;

    return (
      this.currentActivity.application !== newActivity.application ||
      this.currentActivity.windowTitle !== newActivity.windowTitle
    );
  }

  /**
   * Save current activity and start tracking new one
   */
  async saveAndStartNew(newActivity) {
    if (this.currentActivity) {
      // Calculate duration
      const startTime = new Date(this.currentActivity.timestamp);
      const endTime = new Date();
      const durationMinutes = Math.round((endTime - startTime) / 1000 / 60);

      // Only save activities that lasted at least 1 minute
      if (durationMinutes >= 1) {
        const activity = {
          ...this.currentActivity,
          duration: durationMinutes,
          endTime: endTime.toISOString()
        };

        this.activities.push(activity);
        console.log(`✓ Logged: ${activity.application} - ${activity.windowTitle} (${durationMinutes} min)`);
      }
    }

    this.currentActivity = newActivity;
  }

  /**
   * Start monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('Already monitoring...');
      return;
    }

    console.log('🔍 Starting activity monitoring...');
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Poll interval: ${this.pollInterval / 1000}s`);
    console.log('   Press Ctrl+C to stop\n');

    this.isMonitoring = true;

    // Initial check
    const initialActivity = await this.getActiveWindow();
    if (initialActivity) {
      this.currentActivity = initialActivity;
      console.log(`📍 Current activity: ${initialActivity.application} - ${initialActivity.windowTitle}\n`);
    }

    // Poll for changes
    this.intervalId = setInterval(async () => {
      const newActivity = await this.getActiveWindow();

      if (newActivity && this.activityChanged(newActivity)) {
        await this.saveAndStartNew(newActivity);
      }
    }, this.pollInterval);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await this.stopMonitoring();
      process.exit(0);
    });
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring() {
    if (!this.isMonitoring) return;

    console.log('\n\n⏹️  Stopping activity monitoring...');

    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Save final activity
    await this.saveAndStartNew(null);

    // Save all activities to file
    await this.saveActivities();

    console.log(`\n✅ Monitoring stopped. Total activities logged: ${this.activities.length}`);
  }

  /**
   * Save activities to file
   */
  async saveActivities() {
    const dataDir = path.join(__dirname, '../data');
    const filename = `activities-${Date.now()}.json`;
    const filepath = path.join(dataDir, filename);

    await fs.writeFile(filepath, JSON.stringify(this.activities, null, 2));

    console.log(`💾 Activities saved to: data/${filename}`);
    console.log(`\nYou can now run: npm run categorize ${filename}`);
  }

  /**
   * Get activity summary
   */
  getSummary() {
    const totalActivities = this.activities.length;
    const totalMinutes = this.activities.reduce((sum, a) => sum + a.duration, 0);
    const uniqueApps = new Set(this.activities.map(a => a.application)).size;

    return {
      totalActivities,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(2),
      uniqueApps,
      activities: this.activities
    };
  }
}

// CLI usage
if (require.main === module) {
  (async () => {
    const monitor = new ActivityMonitor();
    await monitor.startMonitoring();
  })();
}

module.exports = ActivityMonitor;
