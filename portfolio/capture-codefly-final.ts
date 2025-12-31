import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const TEACHER_EMAIL = 'demo.teacher@codefly.com';
const TEACHER_PASSWORD = 'CodeFly!Command2025$Demo';

const screenshots = [
  {
    name: 'game-ide',
    url: 'http://localhost:3002/ide-demo',
    path: 'public/screenshots/codefly/game-ide.png',
    description: 'CodeFly Game IDE',
    waitFor: 'networkidle',
  },
  {
    name: 'demo-lesson',
    url: 'http://localhost:3002/demo-lesson',
    path: 'public/screenshots/codefly/demo-lesson.png',
    description: 'Demo Lesson',
    waitFor: 'networkidle',
  },
  {
    name: 'curriculum',
    url: 'http://localhost:3002/curriculum/agent-academy',
    path: 'public/screenshots/codefly/curriculum.png',
    description: 'Agent Academy Curriculum',
    waitFor: 'networkidle',
  },
  {
    name: 'teacher-dashboard',
    url: 'http://localhost:3002/teacher-dashboard-v2',
    path: 'public/screenshots/codefly/teacher-dashboard.png',
    description: 'Teacher Dashboard V2',
    waitFor: 'domcontentloaded', // Don't wait for networkidle, wait for DOM
    requiresAuth: true,
    waitForContent: true, // Wait for actual content to load
  },
];

async function captureScreenshots() {
  console.log('🎬 Capturing CodeFly screenshots with proper load waits...\n');

  await mkdir(join(process.cwd(), 'public', 'screenshots', 'codefly'), { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  let teacherLoggedIn = false;

  for (const screenshot of screenshots) {
    console.log(`\n📸 ${screenshot.description}`);
    console.log(`   URL: ${screenshot.url}`);

    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      // Login as teacher if needed
      if (screenshot.requiresAuth && !teacherLoggedIn) {
        console.log('   🔐 Logging in as teacher...');
        await page.goto('http://localhost:3002/auth', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        await page.fill('input[type="email"]', TEACHER_EMAIL);
        await page.fill('input[type="password"]', TEACHER_PASSWORD);
        await page.click('button[type="submit"]');

        // Wait for login to complete
        await page.waitForTimeout(5000);
        teacherLoggedIn = true;
        console.log('   ✅ Teacher logged in');
      }

      // Navigate to target page
      await page.goto(screenshot.url, {
        waitUntil: screenshot.waitFor as any,
        timeout: 60000
      });

      // Wait for initial load
      await page.waitForTimeout(3000);

      // If this page needs to wait for content (not just "Loading...")
      if (screenshot.waitForContent) {
        console.log('   ⏳ Waiting for content to load...');

        // Wait for "Loading Dashboard..." to disappear
        try {
          await page.waitForFunction(
            () => !document.body.textContent?.includes('Loading Dashboard'),
            { timeout: 15000 }
          );
          console.log('   ✅ Content loaded');
        } catch (e) {
          console.log('   ⚠️  Timeout waiting for content, proceeding anyway');
        }

        // Extra wait for data to render
        await page.waitForTimeout(5000);
      }

      const currentUrl = page.url();
      if (currentUrl.includes('/auth') && screenshot.requiresAuth) {
        console.error(`   ❌ FAILED - Still at login page`);
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
  console.log('\n\n✨ Screenshot capture complete!');
}

captureScreenshots().catch(console.error);
