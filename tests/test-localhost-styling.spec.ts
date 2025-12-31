import { test, expect } from '@playwright/test';

test('Check localhost:3001 styling', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({ path: 'localhost-site.png', fullPage: true });

  // Check background
  const body = page.locator('body');
  const backgroundColor = await body.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });
  console.log('Localhost background:', backgroundColor);

  // Check for gradient elements
  const gradients = await page.locator('.bg-gradient-to-br, .bg-gradient-to-r').count();
  console.log('Number of gradient elements:', gradients);

  // Check for colored cards
  const cards = await page.locator('.backdrop-blur-xl').count();
  console.log('Number of backdrop-blur cards:', cards);
});

test('Compare production to localhost', async ({ page }) => {
  await page.goto('https://dropflyai.com');
  await page.waitForLoadState('networkidle');

  const prodGradients = await page.locator('.bg-gradient-to-br, .bg-gradient-to-r').count();
  console.log('Production gradient elements:', prodGradients);

  const prodCards = await page.locator('.backdrop-blur-xl').count();
  console.log('Production backdrop-blur cards:', prodCards);
});
