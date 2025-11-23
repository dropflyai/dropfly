import { test } from '@playwright/test';

test('Check console errors on localhost', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ CONSOLE ERROR:', msg.text());
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      console.log('⚠️  CONSOLE WARNING:', msg.text());
      warnings.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('❌ PAGE ERROR:', error.message);
    errors.push(error.message);
  });

  console.log('🌐 Loading http://localhost:3001...\n');

  try {
    await page.goto('http://localhost:3001', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  } catch (e) {
    console.log('❌ Failed to load page:', e);
  }

  await page.waitForTimeout(5000);

  console.log('\n=== SUMMARY ===');
  console.log('Total errors:', errors.length);
  console.log('Total warnings:', warnings.length);

  // Take screenshot
  await page.screenshot({ path: 'localhost-with-errors.png', fullPage: false });
  console.log('\n📸 Screenshot saved to localhost-with-errors.png');

  console.log('\n👀 Browser will stay open for 5 minutes so you can inspect...');
  await page.waitForTimeout(300000);
});
