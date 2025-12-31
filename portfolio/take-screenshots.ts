import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const screenshots = [
  {
    name: 'codefly-landing',
    url: 'http://localhost:3001/products/codefly',
    path: 'public/screenshots/codefly-landing.png',
    viewport: { width: 1920, height: 1080 },
    description: 'CodeFly landing page'
  },
  {
    name: 'codefly-game',
    url: 'http://localhost:3001/products/codefly',
    path: 'public/screenshots/codefly-game.png',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    scrollTo: '.black-cipher', // Scroll to game section
    description: 'CodeFly Black Cipher game section'
  },
  {
    name: 'codefly-teacher-dashboard',
    url: 'http://localhost:3001/products/codefly',
    path: 'public/screenshots/codefly-teacher-dashboard.png',
    viewport: { width: 1920, height: 1080 },
    scrollTo: '.teacher-control', // Scroll to teacher dashboard
    description: 'CodeFly teacher dashboard and controls'
  }
];

async function takeScreenshots() {
  console.log('🎬 Starting screenshot capture...\n');

  // Create screenshots directory
  await mkdir(join(process.cwd(), 'public', 'screenshots'), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();

  for (const screenshot of screenshots) {
    console.log(`📸 Capturing: ${screenshot.description}`);
    console.log(`   URL: ${screenshot.url}`);

    const page = await context.newPage();
    await page.setViewportSize(screenshot.viewport);

    try {
      // Navigate to page
      await page.goto(screenshot.url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for page to be fully loaded
      await page.waitForTimeout(2000);

      // Scroll to specific section if specified
      if (screenshot.scrollTo) {
        try {
          await page.locator(screenshot.scrollTo).first().scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log(`   ⚠️  Could not scroll to ${screenshot.scrollTo}, using default view`);
        }
      }

      // Take screenshot
      await page.screenshot({
        path: screenshot.path,
        fullPage: screenshot.fullPage !== false
      });

      console.log(`   ✅ Saved: ${screenshot.path}\n`);
    } catch (error) {
      console.error(`   ❌ Error capturing ${screenshot.name}:`, error.message, '\n');
    }

    await page.close();
  }

  await browser.close();
  console.log('✨ Screenshot capture complete!');
}

takeScreenshots().catch(console.error);
