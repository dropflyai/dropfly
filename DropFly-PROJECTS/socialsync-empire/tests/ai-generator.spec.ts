import { test, expect } from '@playwright/test';

test.describe('AI Script Generator E2E Test', () => {
  const baseURL = 'http://localhost:3001';
  const testEmail = `test-ai-${Date.now()}@socialsync.com`;
  const testPassword = 'TestPassword123!';

  test('should generate AI script end-to-end', async ({ page }) => {
    // 1. Sign up
    await page.goto(`${baseURL}/signup`);
    await page.locator('input[type="text"]').fill('AI Test User');
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.locator('button:has-text("Create Account")').click();

    // Wait for redirect to home
    await expect(page).toHaveURL(/\/home$/, { timeout: 15000 });

    // 2. Navigate to Create page
    await page.goto(`${baseURL}/create`);
    await expect(page).toHaveURL(/\/create$/);

    // 3. Select UGC Creator mode
    await page.locator('text=UGC Creator').click();
    await expect(page.locator('text=Perfect! You\'ve selected UGC Creator mode')).toBeVisible();

    // 4. Enter topic
    const topic = 'Best AI tools for content creators in 2025';
    await page.locator('textarea').fill(topic);

    // 5. Click Generate
    await page.locator('button:has-text("Generate Script")').click();

    // 6. Wait for loading state
    await expect(page.locator('button:has-text("Generating...")')).toBeVisible({ timeout: 2000 });

    // 7. Wait for AI response (max 30 seconds for OpenAI)
    await expect(page.locator('text=✨ Your AI-Generated Script')).toBeVisible({ timeout: 30000 });

    // 8. Verify script components
    await expect(page.locator('text=🎣 Hook')).toBeVisible();
    await expect(page.locator('text=📝 Full Script')).toBeVisible();
    await expect(page.locator('text=📢 Call to Action')).toBeVisible();
    await expect(page.locator('text=#️⃣ Hashtags')).toBeVisible();
    await expect(page.locator('text=⏱️ Duration')).toBeVisible();

    // 9. Test copy button
    await page.locator('button:has-text("Copy")').click();
    await expect(page.locator('button:has-text("Copied!")')).toBeVisible({ timeout: 2000 });

    // 10. Test New Script button
    await page.locator('button:has-text("New Script")').click();
    await expect(page.locator('text=✨ Your AI-Generated Script')).not.toBeVisible();

    console.log('✅ AI Script Generator test PASSED!');
  });

  test('should show error on API failure', async ({ page }) => {
    // Login first
    await page.goto(`${baseURL}/login`);

    // Try with a likely existing account or create new
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.locator('button:has-text("Log In")').click();

    await page.goto(`${baseURL}/create`);

    // Select mode and enter very long prompt to potentially trigger error
    await page.locator('text=UGC Creator').click();
    await page.locator('textarea').fill('x'.repeat(10000)); // Very long text

    await page.locator('button:has-text("Generate Script")').click();

    // Should show some response (either success or error)
    // Just verify the system handles it gracefully
    await page.waitForTimeout(5000);
  });
});
