import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

// Demo credentials from CodeFly project
const STUDENT_EMAIL = 'demo.student@codefly.com';
const STUDENT_PASSWORD = 'CodeFly!Agent2025$Demo';
const TEACHER_EMAIL = 'demo.teacher@codefly.com';
const TEACHER_PASSWORD = 'CodeFly!Command2025$Demo';

const screenshots = [
  {
    name: 'game-ide',
    url: 'http://localhost:3002/ide-demo',
    path: 'public/screenshots/codefly/game-ide.png',
    description: 'CodeFly Game IDE',
    requiresAuth: 'student',
  },
  {
    name: 'mission-map',
    url: 'http://localhost:3002/mission-objectives',
    path: 'public/screenshots/codefly/mission-map.png',
    description: 'Mission Objectives Map',
    requiresAuth: 'student',
  },
  {
    name: 'agent-academy',
    url: 'http://localhost:3002/mission/agent-academy',
    path: 'public/screenshots/codefly/agent-academy.png',
    description: 'Agent Academy Mission',
    requiresAuth: 'student',
  },
  {
    name: 'teacher-dashboard',
    url: 'http://localhost:3002/teacher-dashboard-v2',
    path: 'public/screenshots/codefly/teacher-dashboard.png',
    description: 'Teacher Dashboard V2',
    requiresAuth: 'teacher',
  },
];

async function loginAsStudent(page: any) {
  console.log('🔐 Logging in as student...');
  await page.goto('http://localhost:3002/auth', { waitUntil: 'networkidle' });

  // Fill in login form
  await page.fill('input[type="email"]', STUDENT_EMAIL);
  await page.fill('input[type="password"]', STUDENT_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect after login
  await page.waitForTimeout(3000);
  console.log('✅ Student logged in');
}

async function loginAsTeacher(page: any) {
  console.log('🔐 Logging in as teacher...');
  await page.goto('http://localhost:3002/auth', { waitUntil: 'networkidle' });

  // Fill in login form
  await page.fill('input[type="email"]', TEACHER_EMAIL);
  await page.fill('input[type="password"]', TEACHER_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect after login
  await page.waitForTimeout(3000);
  console.log('✅ Teacher logged in');
}

async function captureScreenshots() {
  console.log('🎬 Capturing CodeFly authenticated screenshots...\n');

  await mkdir(join(process.cwd(), 'public', 'screenshots', 'codefly'), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  let currentAuth: string | null = null;

  for (const screenshot of screenshots) {
    console.log(`📸 ${screenshot.description}`);
    console.log(`   ${screenshot.url}`);

    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      // Login if needed
      if (screenshot.requiresAuth !== currentAuth) {
        if (screenshot.requiresAuth === 'student') {
          await loginAsStudent(page);
        } else if (screenshot.requiresAuth === 'teacher') {
          await loginAsTeacher(page);
        }
        currentAuth = screenshot.requiresAuth;
      }

      // Navigate to the target page
      await page.goto(screenshot.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000);

      // Take screenshot
      await page.screenshot({ path: screenshot.path, fullPage: false });
      console.log(`   ✅ ${screenshot.path}\n`);
    } catch (error: any) {
      console.error(`   ❌ ${error.message}\n`);
    }

    await page.close();
  }

  await browser.close();
  console.log('✨ Done!');
}

captureScreenshots().catch(console.error);
