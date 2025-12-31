import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

// Use ONLY public routes that don't require authentication
// Based on middleware.ts ROUTE_PROTECTION.public
const screenshots = [
  {
    name: 'game-ide',
    url: 'http://localhost:3002/ide-demo',
    path: 'public/screenshots/codefly/game-ide.png',
    description: 'CodeFly Game IDE (Public Demo)',
  },
  {
    name: 'mission-map',
    url: 'http://localhost:3002/mission-objectives',
    path: 'public/screenshots/codefly/mission-map.png',
    description: 'Mission Objectives Map (Public)',
  },
  {
    name: 'demo-lesson',
    url: 'http://localhost:3002/demo-lesson',
    path: 'public/screenshots/codefly/demo-lesson.png',
    description: 'Demo Lesson (Public)',
  },
  {
    name: 'curriculum',
    url: 'http://localhost:3002/curriculum/agent-academy',
    path: 'public/screenshots/codefly/curriculum.png',
    description: 'Agent Academy Curriculum Overview (Public)',
  },
];

async function captureScreenshots() {
  console.log('🎬 Capturing CodeFly PUBLIC screenshots (no auth required)...\n');

  await mkdir(join(process.cwd(), 'public', 'screenshots', 'codefly'), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (const screenshot of screenshots) {
    console.log(`📸 ${screenshot.description}`);
    console.log(`   ${screenshot.url}`);

    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      await page.goto(screenshot.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      if (currentUrl.includes('/auth')) {
        console.error(`   ❌ Redirected to login -route is not actually public`);
      } else {
        await page.screenshot({ path: screenshot.path, fullPage: false });
        console.log(`   ✅ ${screenshot.path}`);
      }
    } catch (error: any) {
      console.error(`   ❌ ${error.message}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('\n✨ Done!');
}

captureScreenshots().catch(console.error);
