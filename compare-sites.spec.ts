import { test } from '@playwright/test';

test('Take side-by-side screenshots', async ({ page, context }) => {
  // Screenshot production
  console.log('📸 Taking production screenshot...');
  await page.goto('https://dropflyai.com');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'production-full.png', fullPage: false });
  console.log('✅ Production screenshot saved');

  // Screenshot localhost
  console.log('📸 Taking localhost screenshot...');
  const page2 = await context.newPage();
  await page2.goto('http://localhost:3001', { timeout: 10000 });
  await page2.waitForLoadState('networkidle');
  await page2.screenshot({ path: 'localhost-full.png', fullPage: false });
  console.log('✅ Localhost screenshot saved');

  // Get some styling info
  const prodBg = await page.locator('body').evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  const localBg = await page2.locator('body').evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  console.log('\n=== COMPARISON ===');
  console.log('Production background:', prodBg);
  console.log('Localhost background:', localBg);
  console.log('Match?', prodBg === localBg);
});
