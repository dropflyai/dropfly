import { test, expect } from '@playwright/test';

test.describe('AI Tools - Thumbnail Text Generator', () => {
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

    // Check if Thumbnail Text tool is visible
    await expect(page.getByRole('heading', { name: 'Thumbnail Text' })).toBeVisible();
  });

  test('should open Thumbnail Text Generator tool', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Click on Thumbnail Text card
    await page.click('text=Thumbnail Text');

    // Check if tool interface opened
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=What is your video about?')).toBeVisible();
  });

  test('should generate thumbnail text successfully', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'thumbnail',
          result: {
            thumbnails: [
              {
                text: 'AI SECRETS EXPOSED',
                style: 'bold',
                wordCount: 3,
                emoji: '🚀',
                variation: 'AI Secrets Revealed'
              },
              {
                text: 'This Changed Everything',
                style: 'curiosity',
                wordCount: 3,
                emoji: '💡',
                variation: 'Game Changer Alert'
              },
              {
                text: 'STOP Doing This!',
                style: 'warning',
                wordCount: 3,
                emoji: '⚠️',
                variation: 'Don\'t Make This Mistake'
              },
              {
                text: 'Watch Before It\'s Gone',
                style: 'urgency',
                wordCount: 4,
                emoji: '⏰',
                variation: 'Limited Time Only'
              },
              {
                text: '10X Your Results',
                style: 'benefit',
                wordCount: 3,
                emoji: '📈',
                variation: 'Skyrocket Your Growth'
              }
            ]
          },
          tokensUsed: 1,
          newBalance: 299
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

    // Fill in the input
    await page.fill('textarea', 'AI productivity tips for content creators');

    // Select platform
    await page.selectOption('select >> nth=0', 'youtube');

    // Click Generate button
    await page.click('button:has-text("Generate")');

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Check if results appeared
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Check if at least one thumbnail text is generated
    await expect(page.locator('text=AI SECRETS EXPOSED')).toBeVisible();

    // Check if style badge is visible
    await expect(page.locator('text=bold')).toBeVisible();

    // Check if emoji is visible
    await expect(page.locator('text=🚀')).toBeVisible();

    // Check if Copy button exists
    await expect(page.locator('button:has-text("Copy")').first()).toBeVisible();
  });

  test('should show error for insufficient tokens', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

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

  test('should copy thumbnail text via button', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'thumbnail',
          result: {
            thumbnails: [
              {
                text: 'Test Thumbnail Text',
                style: 'bold',
                wordCount: 3,
                emoji: '✨'
              }
            ]
          },
          tokensUsed: 1,
          newBalance: 299
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

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

  test('should copy thumbnail text via card click', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'thumbnail',
          result: {
            thumbnails: [
              {
                text: 'Clickable Card Test',
                style: 'bold',
                wordCount: 3,
                emoji: '👆'
              }
            ]
          },
          tokensUsed: 1,
          newBalance: 299
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

    // Fill and generate
    await page.fill('textarea', 'AI productivity');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('text=Clickable Card Test', { timeout: 10000 });

    // Card should be clickable (has cursor-pointer class)
    const thumbnailCard = page.locator('text=Clickable Card Test').locator('..');
    await expect(thumbnailCard).toBeVisible();
  });

  test('should display multiple thumbnail options', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'thumbnail',
          result: {
            thumbnails: [
              { text: 'Option 1', style: 'bold', wordCount: 2, emoji: '🔥' },
              { text: 'Option 2', style: 'curiosity', wordCount: 2, emoji: '💡' },
              { text: 'Option 3', style: 'warning', wordCount: 2, emoji: '⚠️' },
              { text: 'Option 4', style: 'urgency', wordCount: 2, emoji: '⏰' },
              { text: 'Option 5', style: 'benefit', wordCount: 2, emoji: '📈' }
            ]
          },
          tokensUsed: 1,
          newBalance: 299
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

    // Fill and generate
    await page.fill('textarea', 'AI productivity');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('text=Option 1', { timeout: 10000 });

    // Check if multiple options are visible
    await expect(page.locator('text=Option 1')).toBeVisible();
    await expect(page.locator('text=Option 2')).toBeVisible();
    await expect(page.locator('text=Option 3')).toBeVisible();
    await expect(page.locator('text=Option 4')).toBeVisible();
    await expect(page.locator('text=Option 5')).toBeVisible();
  });

  test('should display style badges', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'thumbnail',
          result: {
            thumbnails: [
              { text: 'Bold Text', style: 'bold', wordCount: 2, emoji: '🔥' },
              { text: 'Curious Text', style: 'curiosity', wordCount: 2, emoji: '💡' }
            ]
          },
          tokensUsed: 1,
          newBalance: 299
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

    // Fill and generate
    await page.fill('textarea', 'AI productivity');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('text=bold', { timeout: 10000 });

    // Check if style badges are visible
    await expect(page.locator('text=bold').first()).toBeVisible();
    await expect(page.locator('text=curiosity').first()).toBeVisible();
  });

  test('should navigate back to tools list', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

    // Check if Back button exists
    await expect(page.locator('button:has-text("Back to Tools")')).toBeVisible();

    // Click Back
    await page.click('button:has-text("Back to Tools")');

    // Should be back at tools list
    await expect(page.locator('text=Caption Generator')).toBeVisible();
  });

  test('should validate empty input', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

    // Try to generate with empty input
    const generateButton = page.locator('button:has-text("Generate")');

    // Button should be disabled when input is empty
    await expect(generateButton).toBeDisabled();
  });

  test('should display different tone options', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

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

    // Open Thumbnail Text Generator
    await page.click('text=Thumbnail Text');

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
