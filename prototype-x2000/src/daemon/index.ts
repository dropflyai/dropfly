/**
 * X2000 Daemon Service
 *
 * Runs X2000 as a background service (like OpenClaw).
 * Uses launchd on macOS, systemd on Linux.
 */

import { spawn, execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ============================================================================
// Constants
// ============================================================================

const SERVICE_LABEL = 'ai.x2000.gateway';
const X2000_DIR = join(homedir(), '.x2000');
const LOGS_DIR = join(X2000_DIR, 'logs');
const PLIST_PATH = join(homedir(), 'Library', 'LaunchAgents', `${SERVICE_LABEL}.plist`);
const PID_FILE = join(X2000_DIR, 'gateway.pid');

// ============================================================================
// Ensure directories exist
// ============================================================================

function ensureDirs(): void {
  if (!existsSync(X2000_DIR)) {
    mkdirSync(X2000_DIR, { recursive: true });
  }
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }
  const launchAgentsDir = join(homedir(), 'Library', 'LaunchAgents');
  if (!existsSync(launchAgentsDir)) {
    mkdirSync(launchAgentsDir, { recursive: true });
  }
}

// ============================================================================
// Generate launchd plist
// ============================================================================

function generatePlist(gatewayScript: string, env: Record<string, string> = {}): string {
  const envEntries = Object.entries(env)
    .map(([key, value]) => `      <key>${key}</key>\n      <string>${value}</string>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${SERVICE_LABEL}</string>

  <key>ProgramArguments</key>
  <array>
    <string>${process.execPath}</string>
    <string>${gatewayScript}</string>
  </array>

  <key>RunAtLoad</key>
  <true/>

  <key>KeepAlive</key>
  <true/>

  <key>StandardOutPath</key>
  <string>${join(LOGS_DIR, 'gateway.log')}</string>

  <key>StandardErrorPath</key>
  <string>${join(LOGS_DIR, 'gateway.err.log')}</string>

  <key>WorkingDirectory</key>
  <string>${X2000_DIR}</string>

  <key>EnvironmentVariables</key>
  <dict>
${envEntries}
  </dict>
</dict>
</plist>`;
}

// ============================================================================
// Service Management
// ============================================================================

export async function install(gatewayScript: string, env: Record<string, string> = {}): Promise<void> {
  ensureDirs();

  console.log('[Daemon] Installing X2000 service...');

  // Stop if already running
  if (await isRunning()) {
    await stop();
  }

  // Write plist
  const plist = generatePlist(gatewayScript, env);
  writeFileSync(PLIST_PATH, plist);
  console.log(`[Daemon] Wrote plist to ${PLIST_PATH}`);

  // Load service
  try {
    execSync(`launchctl load ${PLIST_PATH}`, { stdio: 'inherit' });
    console.log('[Daemon] Service installed and started');
  } catch (err) {
    console.error('[Daemon] Failed to load service:', err);
    throw err;
  }
}

export async function uninstall(): Promise<void> {
  console.log('[Daemon] Uninstalling X2000 service...');

  // Unload service
  if (existsSync(PLIST_PATH)) {
    try {
      execSync(`launchctl unload ${PLIST_PATH}`, { stdio: 'inherit' });
    } catch {
      // Service might not be loaded
    }
    unlinkSync(PLIST_PATH);
    console.log('[Daemon] Service uninstalled');
  } else {
    console.log('[Daemon] Service not installed');
  }
}

export async function start(): Promise<void> {
  if (!existsSync(PLIST_PATH)) {
    throw new Error('Service not installed. Run "x2000 daemon install" first.');
  }

  console.log('[Daemon] Starting X2000 service...');
  execSync(`launchctl start ${SERVICE_LABEL}`, { stdio: 'inherit' });
  console.log('[Daemon] Service started');
}

export async function stop(): Promise<void> {
  console.log('[Daemon] Stopping X2000 service...');
  try {
    execSync(`launchctl stop ${SERVICE_LABEL}`, { stdio: 'inherit' });
    console.log('[Daemon] Service stopped');
  } catch {
    console.log('[Daemon] Service was not running');
  }
}

export async function restart(): Promise<void> {
  await stop();
  await start();
}

export async function isRunning(): Promise<boolean> {
  try {
    const result = execSync(`launchctl list | grep ${SERVICE_LABEL}`, { encoding: 'utf-8' });
    return result.includes(SERVICE_LABEL);
  } catch {
    return false;
  }
}

export async function status(): Promise<{
  installed: boolean;
  running: boolean;
  pid?: number;
  logPath: string;
  errLogPath: string;
}> {
  const installed = existsSync(PLIST_PATH);
  const running = await isRunning();

  let pid: number | undefined;
  if (existsSync(PID_FILE)) {
    try {
      pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim());
    } catch {
      // Invalid PID file
    }
  }

  return {
    installed,
    running,
    pid,
    logPath: join(LOGS_DIR, 'gateway.log'),
    errLogPath: join(LOGS_DIR, 'gateway.err.log'),
  };
}

export async function logs(follow = false): Promise<void> {
  const logPath = join(LOGS_DIR, 'gateway.log');

  if (!existsSync(logPath)) {
    console.log('[Daemon] No logs yet');
    return;
  }

  if (follow) {
    const tail = spawn('tail', ['-f', logPath], { stdio: 'inherit' });
    process.on('SIGINT', () => tail.kill());
  } else {
    const content = readFileSync(logPath, 'utf-8');
    console.log(content);
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

export async function runDaemonCommand(command: string, args: string[] = []): Promise<void> {
  switch (command) {
    case 'install': {
      const gatewayScript = args[0] || join(process.cwd(), 'dist', 'gateway', 'index.js');
      await install(gatewayScript);
      break;
    }
    case 'uninstall':
      await uninstall();
      break;
    case 'start':
      await start();
      break;
    case 'stop':
      await stop();
      break;
    case 'restart':
      await restart();
      break;
    case 'status': {
      const s = await status();
      console.log('\nX2000 Daemon Status:');
      console.log(`  Installed: ${s.installed ? 'Yes' : 'No'}`);
      console.log(`  Running:   ${s.running ? 'Yes' : 'No'}`);
      if (s.pid) console.log(`  PID:       ${s.pid}`);
      console.log(`  Logs:      ${s.logPath}`);
      console.log(`  Errors:    ${s.errLogPath}`);
      break;
    }
    case 'logs':
      await logs(args.includes('-f') || args.includes('--follow'));
      break;
    default:
      console.log(`
X2000 Daemon Commands:
  install [script]  Install and start the daemon service
  uninstall         Remove the daemon service
  start             Start the service
  stop              Stop the service
  restart           Restart the service
  status            Show service status
  logs [-f]         Show logs (use -f to follow)
`);
  }
}
