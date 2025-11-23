import { test } from '@playwright/test';

test('View scaled design on localhost', async ({ page }) => {
  console.log('🌐 Opening scaled localhost design: http://localhost:3001\n');

  // Test home page
  await page.goto('http://localhost:3001', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  console.log('=== HOME PAGE ===');
  console.log('✅ Loaded home page with scaled styling');

  // Take screenshot
  await page.screenshot({ path: 'scaled-home.png', fullPage: false });
  console.log('📸 Screenshot saved: scaled-home.png\n');

  // Wait to inspect
  await page.waitForTimeout(5000);

  // Test products page
  console.log('=== PRODUCTS PAGE ===');
  await page.goto('http://localhost:3001/products', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  console.log('✅ Loaded products page with scaled styling');

  // Take screenshot
  await page.screenshot({ path: 'scaled-products.png', fullPage: false });
  console.log('📸 Screenshot saved: scaled-products.png\n');

  console.log('👀 Browser will stay open for 5 minutes to inspect the sleek, minimalist design...');
  await page.waitForTimeout(300000);
});
