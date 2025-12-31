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
    role: 'student',
  },
  {
    name: 'mission-map',
    url: 'http://localhost:3002/mission-objectives',
    path: 'public/screenshots/codefly/mission-map.png',
    description: 'Mission Objectives Map',
    role: 'student',
  },
  {
    name: 'agent-academy',
    url: 'http://localhost:3002/mission/agent-academy',
    path: 'public/screenshots/codefly/agent-academy.png',
    description: 'Agent Academy Mission',
    role: 'student',
  },
  {
    name: 'teacher-dashboard',
    url: 'http://localhost:3002/teacher-dashboard-v2',
    path: 'public/screenshots/codefly/teacher-dashboard.png',
    description: 'Teacher Dashboard V2',
    role: 'teacher',
  },
];

async function captureScreenshots() {
  console.log('🎬 Capturing CodeFly authenticated screenshots with proper session handling...\n');

  await mkdir(join(process.cwd(), 'public', 'screenshots', 'codefly'), { recursive: true });

  const browser = await chromium.launch({ headless: false }); // Set to false to debug

  // Student screenshots
  console.log('\n📱 === STUDENT SCREENSHOTS ===\n');
  const studentContext = await browser.newContext();
  const studentPage = await studentContext.newPage();
  await studentPage.setViewportSize({ width: 1920, height: 1080 });

  // Login as student
  console.log('🔐 Logging in as student...');
  await studentPage.goto('http://localhost:3002/auth', { waitUntil: 'networkidle', timeout: 30000 });
  await studentPage.waitForTimeout(2000);

  await studentPage.fill('input[type="email"]', STUDENT_EMAIL);
  await studentPage.fill('input[type="password"]', STUDENT_PASSWORD);
  await studentPage.click('button[type="submit"]');

  // Wait for successful login and redirect
  await studentPage.waitForTimeout(5000);
  console.log('✅ Student logged in, current URL:', studentPage.url());

  // Capture student screenshots
  for (const screenshot of screenshots.filter(s => s.role === 'student')) {
    console.log(`\n📸 ${screenshot.description}`);
    console.log(`   Navigating to: ${screenshot.url}`);

    try {
      await studentPage.goto(screenshot.url, { waitUntil: 'networkidle', timeout: 30000 });
      await studentPage.waitForTimeout(4000); // Wait for content to load

      const currentUrl = studentPage.url();
      console.log(`   Current URL: ${currentUrl}`);

      // Check if we got redirected to login
      if (currentUrl.includes('/auth')) {
        console.error(`   ❌ REDIRECTED TO LOGIN - Session not working`);
      } else {
        await studentPage.screenshot({ path: screenshot.path, fullPage: false });
        console.log(`   ✅ Saved: ${screenshot.path}`);
      }
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  await studentPage.close();
  await studentContext.close();

  // Teacher screenshots
  console.log('\n\n🎓 === TEACHER SCREENSHOTS ===\n');
  const teacherContext = await browser.newContext();
  const teacherPage = await teacherContext.newPage();
  await teacherPage.setViewportSize({ width: 1920, height: 1080 });

  // Login as teacher
  console.log('🔐 Logging in as teacher...');
  await teacherPage.goto('http://localhost:3002/auth', { waitUntil: 'networkidle', timeout: 30000 });
  await teacherPage.waitForTimeout(2000);

  await teacherPage.fill('input[type="email"]', TEACHER_EMAIL);
  await teacherPage.fill('input[type="password"]', TEACHER_PASSWORD);
  await teacherPage.click('button[type="submit"]');

  // Wait for successful login and redirect
  await teacherPage.waitForTimeout(5000);
  console.log('✅ Teacher logged in, current URL:', teacherPage.url());

  // Capture teacher screenshots
  for (const screenshot of screenshots.filter(s => s.role === 'teacher')) {
    console.log(`\n📸 ${screenshot.description}`);
    console.log(`   Navigating to: ${screenshot.url}`);

    try {
      await teacherPage.goto(screenshot.url, { waitUntil: 'networkidle', timeout: 30000 });
      await teacherPage.waitForTimeout(4000); // Wait for content to load

      const currentUrl = teacherPage.url();
      console.log(`   Current URL: ${currentUrl}`);

      // Check if we got redirected to login
      if (currentUrl.includes('/auth')) {
        console.error(`   ❌ REDIRECTED TO LOGIN - Session not working`);
      } else {
        await teacherPage.screenshot({ path: screenshot.path, fullPage: false });
        console.log(`   ✅ Saved: ${screenshot.path}`);
      }
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  await teacherPage.close();
  await teacherContext.close();
  await browser.close();

  console.log('\n\n✨ Screenshot capture complete!');
}

captureScreenshots().catch(console.error);
