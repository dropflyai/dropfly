import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const screenshots = [
  {
    name: 'game-ide',
    url: 'http://localhost:3002/ide-demo',
    path: 'public/screenshots/codefly/game-ide.png',
    description: 'CodeFly Game IDE',
  },
  {
    name: 'mission-map',
    url: 'http://localhost:3002/mission-objectives',
    path: 'public/screenshots/codefly/mission-map.png',
    description: 'Mission Objectives Map',
  },
  {
    name: 'agent-academy',
    url: 'http://localhost:3002/mission/agent-academy',
    path: 'public/screenshots/codefly/agent-academy.png',
    description: 'Agent Academy Mission',
  },
  {
    name: 'teacher-dashboard',
    url: 'http://localhost:3002/teacher-dashboard-v2',
    path: 'public/screenshots/codefly/teacher-dashboard.png',
    description: 'Teacher Dashboard V2',
  },
];

async function captureScreenshots() {
  console.log('🎬 Capturing CodeFly production screenshots from localhost:3002...\n');

  await mkdir(join(process.cwd(), 'public', 'screenshots', 'codefly'), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();

  for (const screenshot of screenshots) {
    console.log(`📸 ${screenshot.description}`);
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
