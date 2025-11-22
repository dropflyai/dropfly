import { test, expect } from '@playwright/test';

test('Check if dropflyai.com has proper CSS styling', async ({ page }) => {
  // Go to production site
  await page.goto('https://dropflyai.com');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Take a screenshot
  await page.screenshot({ path: 'production-site.png', fullPage: true });

  // Check if the body has a black background (should have bg-black class)
  const body = page.locator('body');
  const bodyClasses = await body.getAttribute('class');
  console.log('Body classes:', bodyClasses);

  // Check if main div has expected Tailwind classes
  const mainDiv = page.locator('div').first();
  const mainClasses = await mainDiv.getAttribute('class');
  console.log('Main div classes:', mainClasses);

  // Check computed background color of body
  const backgroundColor = await body.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });
  console.log('Body background color:', backgroundColor);

  // Check if it's black (rgb(0, 0, 0)) or has some color
  console.log('Is background black?', backgroundColor === 'rgb(0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 1)');

  // Check if hero text has gradient classes
  const heroText = page.locator('h1').first();
  const heroClasses = await heroText.getAttribute('class');
  console.log('Hero h1 classes:', heroClasses);

  // Report results
  if (backgroundColor === 'rgb(255, 255, 255)' || backgroundColor === 'rgba(255, 255, 255, 1)') {
    console.log('❌ FAIL: Page has WHITE background - CSS NOT loading');
  } else if (backgroundColor === 'rgb(0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 1)') {
    console.log('✅ PASS: Page has BLACK background - CSS is loading correctly');
  } else {
    console.log('⚠️  UNKNOWN: Background color is', backgroundColor);
  }
});
