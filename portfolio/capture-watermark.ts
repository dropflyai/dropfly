import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const screenshots = [
  {
    name: 'watermark-home',
    url: 'http://localhost:3010',
    path: 'public/screenshots/watermark/home.png',
    viewport: { width: 1920, height: 1080 },
    description: 'Watermark Remover home page'
  },
  {
    name: 'watermark-upload',
    url: 'http://localhost:3010',
    path: 'public/screenshots/watermark/upload.png',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000,
    description: 'Watermark Remover upload interface'
  },
  {
    name: 'watermark-editor',
    url: 'http://localhost:3010',
    path: 'public/screenshots/watermark/editor.png',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000,
    description: 'Watermark Remover editor'
  },
  {
    name: 'watermark-features',
    url: 'http://localhost:3010',
    path: 'public/screenshots/watermark/features.png',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000,
    description: 'Watermark Remover features'
  },
];

async function takeScreenshots() {
  console.log('🎬 Starting screenshot capture for WatermarkRemover...\n');

  // Create screenshots directory
  await mkdir(join(process.cwd(), 'public', 'screenshots', 'watermark'), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();

  for (const screenshot of screenshots) {
    console.log(`📸 Capturing: ${screenshot.description}`);
    console.log(`   URL: ${screenshot.url}`);

    const page = await context.newPage();
    await page.setViewportSize(screenshot.viewport);

    try {
      // Navigate to page
      await page.goto(screenshot.url, { waitUntil: 'networkidle', timeout: 60000 });

      // Wait for page to be fully loaded
      const waitTime = screenshot.waitFor || 3000;
      await page.waitForTimeout(waitTime);

      // Take screenshot
      await page.screenshot({
        path: screenshot.path,
        fullPage: screenshot.fullPage !== false
      });

      console.log(`   ✅ Saved: ${screenshot.path}\n`);
    } catch (error: any) {
      console.error(`   ❌ Error capturing ${screenshot.name}:`, error.message, '\n');
    }

    await page.close();
  }

  await browser.close();
  console.log('✨ Screenshot capture complete!');
}

takeScreenshots().catch(console.error);
