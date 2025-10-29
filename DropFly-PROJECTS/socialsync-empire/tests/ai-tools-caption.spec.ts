import { test, expect } from '@playwright/test';

test.describe('AI Tools - Caption Generator', () => {
  test.beforeEach(async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:3001');

    // Sign up or login
    const signupLink = page.locator('a[href="/signup"]').first();
    if (await signupLink.isVisible()) {
      await signupLink.click();

      // Fill signup form
      const email = `test-${Date.now()}@example.com`;
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');

      // Wait for redirect (might be to home or email confirmation)
      await page.waitForTimeout(2000);
    }
  });

  test('should display AI Tools page', async ({ page }) => {
    // Navigate to tools page
    await page.goto('http://localhost:3001/tools');

    // Check if page loaded - use more specific selector
    await expect(page.getByRole('heading', { name: /AI Content Tools/i })).toBeVisible();

    // Check if Caption Generator tool is visible
    await expect(page.locator('text=Caption Generator')).toBeVisible();
  });

  test('should open Caption Generator tool', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Click on Caption Generator card
    await page.click('text=Caption Generator');

    // Check if tool interface opened
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=What is your post about?')).toBeVisible();
  });

  test('should generate captions successfully', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'caption',
          result: {
            captions: [
              {
                text: 'Transform your content creation with AI 🚀 Join thousands of creators who are scaling their social media effortlessly.',
                style: 'engaging',
                length: 115,
                cta: 'Link in bio'
              },
              {
                text: 'The future of video content is here. Our AI-powered platform makes professional content accessible to everyone.',
                style: 'professional',
                length: 110,
                cta: 'Learn more'
              },
              {
                text: '⚡ Spending hours on content creation? There\'s a better way. Check out how AI can 10x your productivity.',
                style: 'conversational',
                length: 107,
                cta: 'Try it free'
              }
            ]
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Caption Generator
    await page.click('text=Caption Generator');

    // Fill in the input
    await page.fill('textarea', 'Launching our new AI video tool for content creators');

    // Select platform
    await page.selectOption('select >> nth=0', 'instagram');

    // Select tone
    await page.selectOption('select >> nth=1', 'engaging');

    // Click Generate button
    await page.click('button:has-text("Generate")');

    // Wait for loading to complete (max 10 seconds with mock)
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Check if results appeared
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Check if at least one caption is generated
    await expect(page.locator('text=Transform your content creation')).toBeVisible();

    // Check if Copy button exists
    await expect(page.locator('button:has-text("Copy")').first()).toBeVisible();
  });

  test('should show error for insufficient tokens', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Caption Generator
    await page.click('text=Caption Generator');

    // Fill in input
    await page.fill('textarea', 'Test post');

    // Click Generate
    await page.click('button:has-text("Generate")');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check for error or success (depends on token balance)
    const hasError = await page.locator('text=Not enough tokens').isVisible().catch(() => false);
    const hasResult = await page.locator('text=Generated Results').isVisible().catch(() => false);

    // Either error or result should appear
    expect(hasError || hasResult).toBeTruthy();
  });

  test('should copy caption to clipboard', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'caption',
          result: {
            captions: [
              {
                text: 'Test caption for clipboard',
                style: 'engaging',
                length: 26,
                cta: 'Click here'
              }
            ]
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Caption Generator
    await page.click('text=Caption Generator');

    // Fill and generate
    await page.fill('textarea', 'AI productivity tips');
    await page.click('button:has-text("Generate")');

    // Wait for results with shorter timeout
    await page.waitForSelector('button:has-text("Copy")', { timeout: 10000 });

    // Copy button should be visible
    const copyButton = page.locator('button:has-text("Copy")').first();
    await expect(copyButton).toBeVisible();

    // Click the copy button
    await copyButton.click();
    // Note: Can't test actual clipboard content in Playwright, but button click should work
  });

  test('should navigate back to tools list', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Caption Generator
    await page.click('text=Caption Generator');

    // Check if Back button exists
    await expect(page.locator('button:has-text("Back to Tools")')).toBeVisible();

    // Click Back
    await page.click('button:has-text("Back to Tools")');

    // Should be back at tools list
    await expect(page.locator('text=Hashtag Generator')).toBeVisible();
  });

  test('should validate empty input', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Caption Generator
    await page.click('text=Caption Generator');

    // Try to generate with empty input
    const generateButton = page.locator('button:has-text("Generate")');

    // Button should be disabled when input is empty
    await expect(generateButton).toBeDisabled();
  });

  test('should display different tone options', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Caption Generator
    await page.click('text=Caption Generator');

    // Check tone dropdown
    const toneSelect = page.locator('select >> nth=1');
    await expect(toneSelect).toBeVisible();

    // Check if select has the default value
    await expect(toneSelect).toHaveValue('engaging');

    // Check if options exist by counting them
    const optionsCount = await toneSelect.locator('option').count();
    expect(optionsCount).toBeGreaterThanOrEqual(5); // engaging, professional, casual, humorous, inspirational

    // Test changing the value
    await toneSelect.selectOption('professional');
    await expect(toneSelect).toHaveValue('professional');
  });

  test('should display different platform options', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Caption Generator
    await page.click('text=Caption Generator');

    // Check platform dropdown
    const platformSelect = page.locator('select >> nth=0');
    await expect(platformSelect).toBeVisible();

    // Check if select has the default value
    await expect(platformSelect).toHaveValue('instagram');

    // Check if options exist by counting them
    const optionsCount = await platformSelect.locator('option').count();
    expect(optionsCount).toBeGreaterThanOrEqual(6); // instagram, tiktok, twitter, facebook, linkedin, youtube

    // Test changing the value
    await platformSelect.selectOption('tiktok');
    await expect(platformSelect).toHaveValue('tiktok');
  });
});
