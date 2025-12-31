import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

// Define all screenshots to capture
const screenshots = [
  // CodeFly Curriculum App (port 3002)
  {
    product: 'codefly',
    name: 'student-dashboard',
    url: 'http://localhost:3002/demo-lesson',
    path: 'public/screenshots/codefly/student-dashboard.png',
    viewport: { width: 1920, height: 1080 },
  },
  {
    product: 'codefly',
    name: 'teacher-dashboard',
    url: 'http://localhost:3002/teacher-dashboard-v2',
    path: 'public/screenshots/codefly/teacher-dashboard.png',
    viewport: { width: 1920, height: 1080 },
  },
  {
    product: 'codefly',
    name: 'agent-academy',
    url: 'http://localhost:3002/curriculum/agent-academy',
    path: 'public/screenshots/codefly/agent-academy.png',
    viewport: { width: 1920, height: 1080 },
  },
  {
    product: 'codefly',
    name: 'student-badges',
    url: 'http://localhost:3002/student/badges',
    path: 'public/screenshots/codefly/student-badges.png',
    viewport: { width: 1920, height: 1080 },
  },

  // TradeFly Frontend (port 3003)
  {
    product: 'tradefly',
    name: 'dashboard',
    url: 'http://localhost:3003',
    path: 'public/screenshots/tradefly/dashboard.png',
    viewport: { width: 1920, height: 1080 },
  },
  {
    product: 'tradefly',
    name: 'signals',
    url: 'http://localhost:3003/signals',
    path: 'public/screenshots/tradefly/signals.png',
    viewport: { width: 1920, height: 1080 },
  },
  {
    product: 'tradefly',
    name: 'portfolio',
    url: 'http://localhost:3003/portfolio',
    path: 'public/screenshots/tradefly/portfolio.png',
    viewport: { width: 1920, height: 1080 },
  },

  // VoiceFly (port 3004)
  {
    product: 'voicefly',
    name: 'dashboard',
    url: 'http://localhost:3004',
    path: 'public/screenshots/voicefly/dashboard.png',
    viewport: { width: 1920, height: 1080 },
  },
  {
    product: 'voicefly',
    name: 'calls',
    url: 'http://localhost:3004/calls',
    path: 'public/screenshots/voicefly/calls.png',
    viewport: { width: 1920, height: 1080 },
  },

  // FitFly (port 3005)
  {
    product: 'fitfly',
    name: 'dashboard',
    url: 'http://localhost:3005',
    path: 'public/screenshots/fitfly/dashboard.png',
    viewport: { width: 1920, height: 1080 },
  },
  {
    product: 'fitfly',
    name: 'workouts',
    url: 'http://localhost:3005/workouts',
    path: 'public/screenshots/fitfly/workouts.png',
    viewport: { width: 1920, height: 1080 },
  },
];

async function captureScreenshots() {
  console.log('🎬 Starting product screenshot capture...\n');

  // Create screenshot directories
  const products = [...new Set(screenshots.map(s => s.product))];
  for (const product of products) {
    await mkdir(join(process.cwd(), 'public', 'screenshots', product), { recursive: true });
    console.log(`📁 Created directory for ${product}`);
  }
  console.log('');

  const browser = await chromium.launch();
  const context = await browser.newContext();

  let successCount = 0;
  let failCount = 0;

  for (const screenshot of screenshots) {
    console.log(`📸 Capturing: ${screenshot.product} - ${screenshot.name}`);
    console.log(`   URL: ${screenshot.url}`);

    const page = await context.newPage();
    await page.setViewportSize(screenshot.viewport);

    try {
      // Navigate to page with longer timeout for dev servers
      await page.goto(screenshot.url, {
        waitUntil: 'networkidle',
        timeout: 60000
      });

      // Wait for page to be fully loaded
      await page.waitForTimeout(3000);

      // Take screenshot
      await page.screenshot({
        path: screenshot.path,
        fullPage: false // Just above-the-fold view
      });

      console.log(`   ✅ Saved: ${screenshot.path}\n`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      failCount++;
    }

    await page.close();
  }

  await browser.close();

  console.log('✨ Screenshot capture complete!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${screenshots.length}`);
}

captureScreenshots().catch(console.error);
