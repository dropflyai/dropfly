import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const screenshots = [
  {
    name: 'student-dashboard',
    url: 'http://localhost:3002/demo-lesson',
    path: 'public/screenshots/codefly/student-dashboard.png',
  },
  {
    name: 'teacher-dashboard',
    url: 'http://localhost:3002/teacher-dashboard-v2',
    path: 'public/screenshots/codefly/teacher-dashboard.png',
  },
  {
    name: 'agent-academy',
    url: 'http://localhost:3002/curriculum/agent-academy',
    path: 'public/screenshots/codefly/agent-academy.png',
  },
  {
    name: 'student-badges',
    url: 'http://localhost:3002/student/badges',
    path: 'public/screenshots/codefly/student-badges.png',
  },
];

async function captureScreenshots() {
  console.log('🎬 Capturing CodeFly screenshots...\n');

  await mkdir(join(process.cwd(), 'public', 'screenshots', 'codefly'), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();

  for (const screenshot of screenshots) {
    console.log(`📸 ${screenshot.name}`);
    console.log(`   ${screenshot.url}`);

    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      await page.goto(screenshot.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: screenshot.path, fullPage: false });
      console.log(`   ✅ ${screenshot.path}\n`);
    } catch (error) {
      console.error(`   ❌ ${error.message}\n`);
    }

    await page.close();
  }

  await browser.close();
  console.log('✨ Done!');
}

captureScreenshots().catch(console.error);
