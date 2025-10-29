import { test, expect } from '@playwright/test';

test.describe('AI Tools - Hook Generator', () => {
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

      // Wait for redirect
      await page.waitForTimeout(2000);
    }
  });

  test('should display AI Tools page', async ({ page }) => {
    // Navigate to tools page
    await page.goto('http://localhost:3001/tools');

    // Check if page loaded
    await expect(page.getByRole('heading', { name: /AI Content Tools/i })).toBeVisible();

    // Check if Hook Generator tool is visible
    await expect(page.locator('text=Hook Generator')).toBeVisible();
  });

  test('should open Hook Generator tool', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Click on Hook Generator card
    await page.click('text=Hook Generator');

    // Check if tool interface opened
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=What is your video about?')).toBeVisible();
  });

  test('should generate hooks successfully', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'hook',
          result: {
            hooks: [
              {
                text: 'Stop scrolling if you want to 10x your productivity with AI',
                type: 'pattern interrupt',
                context: 'Creates urgency and addresses viewer pain point'
              },
              {
                text: 'This AI tool will change how you work forever',
                type: 'bold claim',
                context: 'Makes a transformative promise'
              },
              {
                text: 'I wasted 3 years doing this the hard way...',
                type: 'story',
                context: 'Personal experience creates relatability'
              },
              {
                text: 'What if I told you there\'s a better way to create content?',
                type: 'question',
                context: 'Engages curiosity'
              },
              {
                text: 'The secret that top creators don\'t want you to know',
                type: 'secret reveal',
                context: 'Implies insider knowledge'
              },
              {
                text: '99% of people are making this mistake with AI',
                type: 'mistake reveal',
                context: 'Highlights common error'
              },
              {
                text: 'Watch this before you waste money on expensive tools',
                type: 'warning',
                context: 'Creates urgency to prevent loss'
              }
            ]
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Hook Generator
    await page.click('text=Hook Generator');

    // Fill in the input
    await page.fill('textarea', 'AI productivity tips for content creators');

    // Select platform
    await page.selectOption('select >> nth=0', 'tiktok');

    // Click Generate button
    await page.click('button:has-text("Generate")');

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Check if results appeared
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Check if at least one hook is generated
    await expect(page.locator('text=Stop scrolling if you want to 10x')).toBeVisible();

    // Check if hook type badges are visible
    await expect(page.locator('text=Hook #1')).toBeVisible();
    await expect(page.locator('text=pattern interrupt')).toBeVisible();

    // Check if Copy button exists
    await expect(page.locator('button:has-text("Copy")').first()).toBeVisible();
  });

  test('should show error for insufficient tokens', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Hook Generator
    await page.click('text=Hook Generator');

    // Fill in input
    await page.fill('textarea', 'Test video');

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

  test('should copy hook to clipboard', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'hook',
          result: {
            hooks: [
              {
                text: 'Test hook for clipboard',
                type: 'question',
                context: 'Testing copy functionality'
              }
            ]
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Hook Generator
    await page.click('text=Hook Generator');

    // Fill and generate
    await page.fill('textarea', 'AI productivity tips');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('button:has-text("Copy")', { timeout: 10000 });

    // Copy button should be visible
    const copyButton = page.locator('button:has-text("Copy")').first();
    await expect(copyButton).toBeVisible();

    // Click the copy button
    await copyButton.click();
  });

  test('should display all 7 hooks', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'hook',
          result: {
            hooks: [
              { text: 'Hook 1', type: 'pattern interrupt', context: 'Context 1' },
              { text: 'Hook 2', type: 'bold claim', context: 'Context 2' },
              { text: 'Hook 3', type: 'story', context: 'Context 3' },
              { text: 'Hook 4', type: 'question', context: 'Context 4' },
              { text: 'Hook 5', type: 'secret reveal', context: 'Context 5' },
              { text: 'Hook 6', type: 'mistake reveal', context: 'Context 6' },
              { text: 'Hook 7', type: 'warning', context: 'Context 7' }
            ]
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Hook Generator
    await page.click('text=Hook Generator');

    // Fill and generate
    await page.fill('textarea', 'AI productivity');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('text=Hook #1', { timeout: 10000 });

    // Check if all 7 hooks are visible
    await expect(page.locator('text=Hook #1')).toBeVisible();
    await expect(page.locator('text=Hook #2')).toBeVisible();
    await expect(page.locator('text=Hook #3')).toBeVisible();
    await expect(page.locator('text=Hook #4')).toBeVisible();
    await expect(page.locator('text=Hook #5')).toBeVisible();
    await expect(page.locator('text=Hook #6')).toBeVisible();
    await expect(page.locator('text=Hook #7')).toBeVisible();
  });

  test('should display hook type badges', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'hook',
          result: {
            hooks: [
              { text: 'Test hook 1', type: 'pattern interrupt', context: 'Test context' },
              { text: 'Test hook 2', type: 'bold claim', context: 'Test context' }
            ]
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Hook Generator
    await page.click('text=Hook Generator');

    // Fill and generate
    await page.fill('textarea', 'AI productivity');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('text=pattern interrupt', { timeout: 10000 });

    // Check if hook type badges are visible
    await expect(page.locator('text=pattern interrupt')).toBeVisible();
    await expect(page.locator('text=bold claim')).toBeVisible();
  });

  test('should navigate back to tools list', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Hook Generator
    await page.click('text=Hook Generator');

    // Check if Back button exists
    await expect(page.locator('button:has-text("Back to Tools")')).toBeVisible();

    // Click Back
    await page.click('button:has-text("Back to Tools")');

    // Should be back at tools list
    await expect(page.locator('text=Caption Generator')).toBeVisible();
  });

  test('should validate empty input', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Hook Generator
    await page.click('text=Hook Generator');

    // Try to generate with empty input
    const generateButton = page.locator('button:has-text("Generate")');

    // Button should be disabled when input is empty
    await expect(generateButton).toBeDisabled();
  });

  test('should display different tone options', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Hook Generator
    await page.click('text=Hook Generator');

    // Check tone dropdown
    const toneSelect = page.locator('select >> nth=1');
    await expect(toneSelect).toBeVisible();

    // Check if select has the default value
    await expect(toneSelect).toHaveValue('engaging');

    // Check if options exist by counting them
    const optionsCount = await toneSelect.locator('option').count();
    expect(optionsCount).toBeGreaterThanOrEqual(5);

    // Test changing the value
    await toneSelect.selectOption('professional');
    await expect(toneSelect).toHaveValue('professional');
  });

  test('should display different platform options', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Hook Generator
    await page.click('text=Hook Generator');

    // Check platform dropdown
    const platformSelect = page.locator('select >> nth=0');
    await expect(platformSelect).toBeVisible();

    // Check if select has the default value
    await expect(platformSelect).toHaveValue('instagram');

    // Check if options exist by counting them
    const optionsCount = await platformSelect.locator('option').count();
    expect(optionsCount).toBeGreaterThanOrEqual(6);

    // Test changing the value
    await platformSelect.selectOption('youtube');
    await expect(platformSelect).toHaveValue('youtube');
  });
});
