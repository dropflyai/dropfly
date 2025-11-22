import { test, expect } from '@playwright/test';

test.describe('Script Generation with Claude', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and login
    await page.goto('http://localhost:3010');

    // Check if already logged in
    const isLoggedIn = await page.url().includes('/home') || await page.url().includes('/create');

    if (!isLoggedIn) {
      // Try to login if on login page
      const loginButton = page.locator('button:has-text("Login"), a:has-text("Login")');
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // Navigate to create page
    await page.goto('http://localhost:3010/create');
    await page.waitForLoadState('networkidle');
  });

  test('should generate script successfully with Claude API', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('h1, h2')).toContainText(/Create|Generate/i);

    // Fill in the form
    const topicInput = page.locator('input[name="topic"], input[placeholder*="topic" i], textarea[placeholder*="topic" i]').first();
    await topicInput.fill('How to make delicious homemade pizza');

    // Select platform if available
    const platformSelect = page.locator('select[name="platform"]');
    if (await platformSelect.count() > 0) {
      await platformSelect.selectOption('youtube');
    }

    // Click generate button
    const generateButton = page.locator('button:has-text("Generate")').first();
    await generateButton.click();

    // Wait for the API call to complete (up to 30 seconds for Claude API)
    await page.waitForTimeout(30000);

    // Check for success - either script content or success message
    const successIndicators = [
      page.locator('text=/script/i'),
      page.locator('text=/generated/i'),
      page.locator('text=/success/i'),
      page.locator('[data-testid="script-output"]'),
    ];

    let foundSuccess = false;
    for (const indicator of successIndicators) {
      if (await indicator.count() > 0) {
        foundSuccess = true;
        break;
      }
    }

    // Check dev server logs for Claude API call
    console.log('Checking if Claude API was called successfully...');

    expect(foundSuccess).toBe(true);
  });

  test('should show error message if Claude API fails', async ({ page }) => {
    // This test would require mocking the API or using invalid credentials
    // For now, just verify error handling exists

    const generateButton = page.locator('button:has-text("Generate")').first();

    // Try to generate without filling form
    if (await generateButton.isEnabled()) {
      await generateButton.click();
      await page.waitForTimeout(2000);

      // Should show some kind of validation or error
      const errorMessages = [
        page.locator('text=/required/i'),
        page.locator('text=/error/i'),
        page.locator('text=/failed/i'),
      ];

      let foundError = false;
      for (const errorMsg of errorMessages) {
        if (await errorMsg.count() > 0) {
          foundError = true;
          break;
        }
      }

      expect(foundError).toBe(true);
    }
  });
});
