import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const screenshots = [
  {
    name: 'voicefly-dashboard',
    url: 'https://voicefly-hza1tgr9p-dropflyai.vercel.app',
    path: 'public/screenshots/voicefly/dashboard.png',
    viewport: { width: 1920, height: 1080 },
    description: 'VoiceFly dashboard'
  },
  {
    name: 'voicefly-agents',
    url: 'https://voicefly-hza1tgr9p-dropflyai.vercel.app',
    path: 'public/screenshots/voicefly/agents.png',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000,
    description: 'VoiceFly voice agents section'
  },
  {
    name: 'voicefly-analytics',
    url: 'https://voicefly-hza1tgr9p-dropflyai.vercel.app',
    path: 'public/screenshots/voicefly/analytics.png',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000,
    description: 'VoiceFly analytics'
  },
  {
    name: 'voicefly-settings',
    url: 'https://voicefly-hza1tgr9p-dropflyai.vercel.app',
    path: 'public/screenshots/voicefly/settings.png',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000,
    description: 'VoiceFly settings'
  },
  {
    name: 'pdf-editor-dashboard',
    url: 'https://pdf-editor-83ks5svlg-dropflyai.vercel.app',
    path: 'public/screenshots/pdf-doc-sign/dashboard.png',
    viewport: { width: 1920, height: 1080 },
    description: 'PDF Doc Sign dashboard'
  },
  {
    name: 'pdf-editor-editor',
    url: 'https://pdf-editor-83ks5svlg-dropflyai.vercel.app',
    path: 'public/screenshots/pdf-doc-sign/editor.png',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000,
    description: 'PDF Doc Sign editor view'
  },
  {
    name: 'pdf-editor-signature',
    url: 'https://pdf-editor-83ks5svlg-dropflyai.vercel.app',
    path: 'public/screenshots/pdf-doc-sign/signature.png',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000,
    description: 'PDF Doc Sign e-signature feature'
  },
  {
    name: 'pdf-editor-documents',
    url: 'https://pdf-editor-83ks5svlg-dropflyai.vercel.app',
    path: 'public/screenshots/pdf-doc-sign/documents.png',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000,
    description: 'PDF Doc Sign documents library'
  },
];

async function takeScreenshots() {
  console.log('🎬 Starting screenshot capture for VoiceFly and PDF Doc Sign...\n');

  // Create screenshots directories
  await mkdir(join(process.cwd(), 'public', 'screenshots', 'voicefly'), { recursive: true });
  await mkdir(join(process.cwd(), 'public', 'screenshots', 'pdf-doc-sign'), { recursive: true });

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
    } catch (error: any) {
      console.error(`   ❌ Error capturing ${screenshot.name}:`, error.message, '\n');
    }

    await page.close();
  }

  await browser.close();
  console.log('✨ Screenshot capture complete!');
}

takeScreenshots().catch(console.error);
