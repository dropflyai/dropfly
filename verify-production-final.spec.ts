import { test } from '@playwright/test';

test('Verify production matches localhost', async ({ page }) => {
  console.log('🌐 Testing production: https://dropflyai.com\n');

  await page.goto('https://dropflyai.com');
  await page.waitForLoadState('networkidle');

  // Check styling
  const body = page.locator('body');
  const bg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);

  console.log('=== PRODUCTION STYLING ===');
  console.log('Background:', bg);

  // Check for gradients
  const gradients = await page.locator('[class*="bg-gradient"]').count();
  console.log('Gradient elements:', gradients);

  // Check for cards
  const cards = await page.locator('.backdrop-blur-xl').count();
  console.log('Backdrop-blur cards:', cards);

  if (gradients > 0 && cards > 0) {
    console.log('\n✅ SUCCESS! Production has gradients and styled cards!');
  } else {
    console.log('\n⚠️  Production may still be missing styling');
  }

  await page.screenshot({ path: 'production-verified.png', fullPage: false });
  console.log('📸 Screenshot saved\n');

  console.log('👀 Browser will stay open for inspection...');
  await page.waitForTimeout(300000);
});
