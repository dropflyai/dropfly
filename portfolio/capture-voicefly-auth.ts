import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const screenshots = [
  {
    name: 'dashboard',
    url: 'http://localhost:3020/dashboard',
    path: 'public/screenshots/voicefly/dashboard.png',
    description: 'VoiceFly main dashboard'
  },
  {
    name: 'customers',
    url: 'http://localhost:3020/customers',
    path: 'public/screenshots/voicefly/customers.png',
    description: 'VoiceFly customers page'
  },
  {
    name: 'services',
    url: 'http://localhost:3020/services',
    path: 'public/screenshots/voicefly/services.png',
    description: 'VoiceFly services management'
  },
  {
    name: 'analytics',
    url: 'http://localhost:3020/analytics',
    path: 'public/screenshots/voicefly/analytics.png',
    description: 'VoiceFly analytics dashboard'
  },
];

async function takeScreenshots() {
  console.log('🎬 Starting authenticated screenshot capture for VoiceFly...\n');

  // Create screenshots directory
  await mkdir(join(process.cwd(), 'public', 'screenshots', 'voicefly'), { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Log in first
    console.log('🔐 Logging in with demo credentials...');
    await page.goto('http://localhost:3020/login', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Fill in login credentials
    await page.fill('input[type="email"], input[name="email"]', 'admin@eliteauto.com');
    await page.fill('input[type="password"], input[name="password"]', 'Auto2024!');

    // Click login button
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log in")');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    await page.waitForTimeout(3000); // Let dashboard load

    console.log('✅ Logged in successfully!\n');

    // Now capture screenshots of each page
    for (const screenshot of screenshots) {
      console.log(`📸 Capturing: ${screenshot.description}`);
      console.log(`   URL: ${screenshot.url}`);

      try {
        await page.goto(screenshot.url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(3000);

        // Take screenshot
        await page.screenshot({
          path: screenshot.path,
          fullPage: true
        });

        console.log(`   ✅ Saved: ${screenshot.path}\n`);
      } catch (error: any) {
        console.error(`   ❌ Error capturing ${screenshot.name}:`, error.message, '\n');
      }
    }

  } catch (error: any) {
    console.error('❌ Authentication or screenshot error:', error.message);
  }

  await browser.close();
  console.log('✨ Screenshot capture complete!');
}

takeScreenshots().catch(console.error);
