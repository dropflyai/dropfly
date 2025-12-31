import { test } from '@playwright/test';

test('Show production site with styling', async ({ page }) => {
  console.log('🌐 Opening production site: https://dropflyai.com');
  await page.goto('https://dropflyai.com');
  await page.waitForLoadState('networkidle');

  // Check styling
  const body = page.locator('body');
  const bg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);

  console.log('\n=== STYLING CHECK ===');
  console.log('Background color:', bg);

  if (bg === 'rgb(0, 0, 0)' || bg === 'rgba(0, 0, 0, 1)') {
    console.log('✅ BLACK BACKGROUND - CSS IS LOADING!');
  } else if (bg === 'rgb(255, 255, 255)' || bg === 'rgba(255, 255, 255, 1)') {
    console.log('❌ WHITE BACKGROUND - CSS NOT LOADING');
  } else {
    console.log('⚠️  Unknown background:', bg);
  }

  // Check for gradient text
  const h1 = page.locator('h1').first();
  const h1Classes = await h1.getAttribute('class');
  console.log('Hero classes:', h1Classes);
  console.log('Has gradient?', h1Classes?.includes('bg-gradient'));

  // Keep open for inspection
  console.log('\n👀 Browser will stay open for 5 minutes for inspection...');
  await page.waitForTimeout(300000);
});
