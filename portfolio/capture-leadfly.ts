import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const screenshots = [
  {
    name: 'dashboard',
    url: 'http://localhost:3004',
    path: 'public/screenshots/leadfly/dashboard.png',
    description: 'LeadFly Dashboard',
    waitTime: 5000,
  },
  {
    name: 'leads',
    url: 'http://localhost:3004/leads',
    path: 'public/screenshots/leadfly/leads.png',
    description: 'Leads Page',
    waitTime: 5000,
  },
  {
    name: 'campaigns',
    url: 'http://localhost:3004/campaigns',
    path: 'public/screenshots/leadfly/campaigns.png',
    description: 'Campaigns Page',
    waitTime: 5000,
  },
  {
    name: 'analytics',
    url: 'http://localhost:3004/analytics',
    path: 'public/screenshots/leadfly/analytics.png',
    description: 'Analytics Page',
    waitTime: 5000,
  },
];

async function captureScreenshots() {
  console.log('🎬 Capturing LeadFly screenshots from localhost:3004...\n');

  await mkdir(join(process.cwd(), 'public', 'screenshots', 'leadfly'), { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  for (const screenshot of screenshots) {
    console.log(`\n📸 ${screenshot.description}`);
    console.log(`   URL: ${screenshot.url}`);

    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      await page.goto(screenshot.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      console.log(`   ⏳ Waiting ${screenshot.waitTime/1000}s for content...`);
      await page.waitForTimeout(screenshot.waitTime);

      const finalUrl = page.url();
      console.log(`   Final URL: ${finalUrl}`);

      if (finalUrl.includes('/sign-in') || finalUrl.includes('/login')) {
        console.error(`   ❌ SKIPPED - Redirected to login page`);
      } else {
        await page.screenshot({ path: screenshot.path, fullPage: false });
        console.log(`   ✅ Saved: ${screenshot.path}`);
      }
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('\n\n✨ LeadFly screenshot capture complete!');
}

captureScreenshots().catch(console.error);
