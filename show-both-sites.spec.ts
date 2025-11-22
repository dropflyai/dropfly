import { test } from '@playwright/test';

test('Show both sites in browser', async ({ page, context }) => {
  // Open production in first tab
  console.log('Opening production site: https://dropflyai.com');
  await page.goto('https://dropflyai.com');
  await page.waitForLoadState('networkidle');

  // Open localhost in second tab
  console.log('Opening localhost: http://localhost:3001');
  const page2 = await context.newPage();
  await page2.goto('http://localhost:3001');
  await page2.waitForLoadState('networkidle');

  console.log('\n✅ Both sites are now open in Chromium');
  console.log('👉 Compare the styling between the two tabs');
  console.log('   Tab 1: Production (dropflyai.com)');
  console.log('   Tab 2: Localhost (localhost:3001)');

  // Keep browser open for 5 minutes
  await page.waitForTimeout(300000);
});
