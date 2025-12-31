import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

// Use production Vercel site
const BASE_URL = 'https://curriculum-pilot-mvp.vercel.app';

// Demo credentials from auth page code
const TEACHER_EMAIL = 'teacher@codefly.demo';
const TEACHER_PASSWORD = 'demo123';

const screenshots = [
  {
    name: 'game-ide',
    url: `${BASE_URL}/ide-demo`,
    path: 'public/screenshots/codefly/game-ide.png',
    description: 'CodeFly Game IDE',
  },
  {
    name: 'demo-lesson',
    url: `${BASE_URL}/demo-lesson`,
    path: 'public/screenshots/codefly/demo-lesson.png',
    description: 'Demo Lesson',
  },
  {
    name: 'curriculum',
    url: `${BASE_URL}/curriculum/agent-academy`,
    path: 'public/screenshots/codefly/curriculum.png',
    description: 'Agent Academy Curriculum',
  },
  {
    name: 'teacher-dashboard',
    url: `${BASE_URL}/teacher-dashboard-v2`,
    path: 'public/screenshots/codefly/teacher-dashboard.png',
    description: 'Teacher Dashboard V2',
    requiresAuth: true,
  },
];

async function captureScreenshots() {
  console.log(`🎬 Capturing CodeFly screenshots from PRODUCTION: ${BASE_URL}\n`);

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
        await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        await page.fill('input[type="email"]', TEACHER_EMAIL);
        await page.fill('input[type="password"]', TEACHER_PASSWORD);
        await page.click('button[type="submit"]');

        // Wait for login to complete
        await page.waitForTimeout(8000);
        teacherLoggedIn = true;
        console.log('   ✅ Teacher logged in');
      }

      // Navigate to target page
      await page.goto(screenshot.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(5000);

      // Extra wait for teacher dashboard
      if (screenshot.requiresAuth) {
        console.log('   ⏳ Waiting for dashboard content...');
        await page.waitForTimeout(10000);
      }

      const currentUrl = page.url();
      if (currentUrl.includes('/auth') && screenshot.requiresAuth) {
        console.error(`   ❌ FAILED - Redirected to login`);
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
  console.log('\n\n✨ Screenshot capture complete from PRODUCTION!');
}

captureScreenshots().catch(console.error);
