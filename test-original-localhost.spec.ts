import { test } from '@playwright/test';

test('Show ORIGINAL localhost design', async ({ page }) => {
  console.log('🌐 Opening ORIGINAL localhost design: http://localhost:3001');
  await page.goto('http://localhost:3001', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Check styling
  const body = page.locator('body');
  const bg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);

  console.log('\n=== ORIGINAL LOCALHOST STYLING ===');
  console.log('Background color:', bg);

  // Check for gradients
  const gradients = await page.locator('[class*="bg-gradient"]').count();
  console.log('Gradient elements found:', gradients);

  // Check for backdrop blur (cards)
  const cards = await page.locator('.backdrop-blur-xl').count();
  console.log('Backdrop-blur cards found:', cards);

  console.log('\n✅ THIS IS THE ORIGINAL DESIGN');
  console.log('👀 Browser will stay open for 5 minutes...');
  console.log('   Please verify this is the correct design you want!');

  await page.waitForTimeout(300000);
});
