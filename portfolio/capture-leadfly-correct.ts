import { chromium } from 'playwright';

const screenshots = [
  {
    name: 'dashboard',
    url: 'http://localhost:3004/demo-dashboard',
    path: 'public/screenshots/leadfly/dashboard.png',
    waitTime: 3000
  },
  {
    name: 'leads',
    url: 'http://localhost:3004/demo-dashboard/leads',
    path: 'public/screenshots/leadfly/leads.png',
    waitTime: 3000
  },
  {
    name: 'analytics',
    url: 'http://localhost:3004/demo-dashboard/analytics',
    path: 'public/screenshots/leadfly/analytics.png',
    waitTime: 3000
  },
  {
    name: 'voice-agent',
    url: 'http://localhost:3004/demo-dashboard/voice-agent',
    path: 'public/screenshots/leadfly/voice-agent.png',
    waitTime: 3000
  },
];

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  for (const screenshot of screenshots) {
    console.log(`\nCapturing ${screenshot.name}...`);
    const page = await context.newPage();

    try {
      await page.goto(screenshot.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(screenshot.waitTime);

      await page.screenshot({
        path: screenshot.path,
        fullPage: false
      });

      console.log(`✓ Saved ${screenshot.name} to ${screenshot.path}`);
    } catch (error) {
      console.error(`✗ Failed to capture ${screenshot.name}:`, error.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n✓ All screenshots captured!');
}

captureScreenshots().catch(console.error);
