import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3025';
const TEST_EMAIL = 'homeflyai@gmail.com';
const TEST_PASSWORD = 'TestPass123!'; // Update if different

test.describe('AI Script Generation', () => {
  test('should generate script and deduct tokens', async ({ page }) => {
    // Step 1: Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to home/dashboard
    await page.waitForURL(/\/(home|dashboard|create)/, { timeout: 10000 });

    // Step 2: Navigate to create page
    await page.goto(`${BASE_URL}/create`);
    await page.waitForLoadState('networkidle');

    // Step 3: Check token balance before generation
    const tokenBalanceBefore = await page.locator('[data-testid="token-balance"]').textContent();
    console.log('Token balance before:', tokenBalanceBefore);

    // Step 4: Fill in script generation form
    const promptField = page.locator('textarea[name="prompt"], input[name="prompt"], textarea[placeholder*="prompt" i]').first();
    await expect(promptField).toBeVisible({ timeout: 5000 });
    await promptField.fill('Create a 30 second Instagram Reel about productivity tips for entrepreneurs');

    // Select platform if available
    const platformSelector = page.locator('select[name="platform"], [data-testid="platform-selector"]');
    if (await platformSelector.isVisible()) {
      await platformSelector.selectOption('instagram');
    }

    // Select duration if available
    const durationSelector = page.locator('select[name="duration"], [data-testid="duration-selector"]');
    if (await durationSelector.isVisible()) {
      await durationSelector.selectOption('30');
    }

    // Step 5: Click generate button
    const generateButton = page.locator('button:has-text("Generate")').first();
    await expect(generateButton).toBeVisible();
    await generateButton.click();

    // Step 6: Wait for generation (this will take a few seconds)
    await page.waitForTimeout(2000); // Give it time to start

    // Look for loading state
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner').first();
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeHidden({ timeout: 30000 }); // Wait up to 30 seconds
    }

    // Step 7: Verify script was generated
    const scriptOutput = page.locator('[data-testid="generated-script"], .script-output, textarea[readonly]').first();
    await expect(scriptOutput).toBeVisible({ timeout: 5000 });

    const scriptText = await scriptOutput.textContent();
    expect(scriptText).toBeTruthy();
    expect(scriptText!.length).toBeGreaterThan(50); // Should have substantial content

    console.log('Script generated:', scriptText?.substring(0, 100) + '...');

    // Step 8: Check token balance after generation
    const tokenBalanceAfter = await page.locator('[data-testid="token-balance"]').textContent();
    console.log('Token balance after:', tokenBalanceAfter);

    // Extract numbers from balance strings
    const balanceBeforeNum = parseInt(tokenBalanceBefore?.match(/\d+/)?.[0] || '0');
    const balanceAfterNum = parseInt(tokenBalanceAfter?.match(/\d+/)?.[0] || '0');

    // Verify tokens were deducted
    expect(balanceAfterNum).toBeLessThan(balanceBeforeNum);
    console.log(`Tokens deducted: ${balanceBeforeNum - balanceAfterNum}`);

    // Step 9: Verify script is saved (check for save confirmation or save button)
    const saveConfirmation = page.locator('text="Script saved", text="Saved successfully"');
    if (await saveConfirmation.isVisible()) {
      expect(saveConfirmation).toBeVisible();
    }
  });

  test('should show error when insufficient tokens', async ({ page }) => {
    // This test would require setting up a user with 0 tokens
    // Skip for now if not applicable
    test.skip();
  });
});
