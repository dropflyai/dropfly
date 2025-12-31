import { test } from '@playwright/test';

test('View updated local site', async ({ page }) => {
  console.log('🌐 Opening http://localhost:3001\n');

  await page.goto('http://localhost:3001', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  console.log('✅ Site loaded - browser will stay open for inspection\n');
  console.log('New content to review:');
  console.log('- No more fake stats (removed "200+ AI Solutions", "500+ Enterprise Clients")');
  console.log('- No more fake awards (removed Gartner, TechCrunch, Inc. 5000)');
  console.log('- Added real tech stack info (Claude, GPT-4, DeepSeek-R1, VAPI)');
  console.log('- Added emerging AI technology insights\n');
  console.log('Scroll down to see the "Why We\'re Your AI Implementation Partner" section\n');

  // Keep browser open for 10 minutes
  await page.waitForTimeout(600000);
});
