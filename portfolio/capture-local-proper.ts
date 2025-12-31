import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

// Demo credentials
const TEACHER_EMAIL = 'teacher@codefly.demo';
const TEACHER_PASSWORD = 'demo123';

const screenshots = [
  {
    name: 'game-ide',
    url: 'http://localhost:3002/ide-demo',
    path: 'public/screenshots/codefly/game-ide.png',
    description: 'CodeFly Game IDE',
    waitTime: 5000,
  },
  {
    name: 'demo-lesson',
    url: 'http://localhost:3002/demo-lesson',
    path: 'public/screenshots/codefly/demo-lesson.png',
    description: 'Demo Lesson',
    waitTime: 5000,
  },
  {
    name: 'curriculum',
    url: 'http://localhost:3002/curriculum/agent-academy',
    path: 'public/screenshots/codefly/curriculum.png',
    description: 'Agent Academy Curriculum',
    waitTime: 5000,
  },
  {
    name: 'teacher-dashboard',
    url: 'http://localhost:3002/teacher-dashboard-v2',
    path: 'public/screenshots/codefly/teacher-dashboard.png',
    description: 'Teacher Dashboard',
    requiresAuth: true,
    waitTime: 15000, // Wait longer for dashboard data to load
    checkForContent: true,
  },
];

async function captureScreenshots() {
  console.log('🎬 Capturing screenshots from localhost:3002...\n');

  await mkdir(join(process.cwd(), 'public', 'screenshots', 'codefly'), { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down to see what's happening
  });

  const context = await browser.newContext();
  let teacherLoggedIn = false;

  for (const screenshot of screenshots) {
    console.log(`\n📸 ${screenshot.description}`);
    console.log(`   URL: ${screenshot.url}`);

    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      // Login if needed
      if (screenshot.requiresAuth && !teacherLoggedIn) {
        console.log('   🔐 Logging in as teacher...');
        await page.goto('http://localhost:3002/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Fill and submit login form
        await page.fill('input[type="email"]', TEACHER_EMAIL);
        await page.waitForTimeout(500);
        await page.fill('input[type="password"]', TEACHER_PASSWORD);
        await page.waitForTimeout(500);
        await page.click('button[type="submit"]');

        // Wait for redirect after login
        await page.waitForTimeout(5000);

        const currentUrl = page.url();
        console.log(`   Current URL after login: ${currentUrl}`);

        if (currentUrl.includes('teacher-dashboard')) {
          teacherLoggedIn = true;
          console.log('   ✅ Teacher logged in successfully');
        } else {
          console.log('   ⚠️  Login may not have worked, continuing anyway...');
        }
      }

      // Navigate to target page
      await page.goto(screenshot.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      console.log(`   ⏳ Waiting ${screenshot.waitTime/1000}s for content to load...`);
      await page.waitForTimeout(screenshot.waitTime);

      // Check if we're still on auth page
      const finalUrl = page.url();
      console.log(`   Final URL: ${finalUrl}`);

      if (finalUrl.includes('/auth')) {
        console.error(`   ❌ SKIPPED - Still on login page`);
      } else if (screenshot.checkForContent) {
        // Check if loading state is gone
        const bodyText = await page.textContent('body');
        if (bodyText?.includes('Loading Dashboard') || bodyText?.includes('Loading...')) {
          console.error(`   ❌ SKIPPED - Still showing loading state`);
        } else {
          await page.screenshot({ path: screenshot.path, fullPage: false });
          console.log(`   ✅ Saved: ${screenshot.path}`);
        }
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
