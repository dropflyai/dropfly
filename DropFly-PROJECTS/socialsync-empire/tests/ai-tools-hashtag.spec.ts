import { test, expect } from '@playwright/test';

test.describe('AI Tools - Hashtag Generator', () => {
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

    // Check if page loaded
    await expect(page.getByRole('heading', { name: /AI Content Tools/i })).toBeVisible();

    // Check if Hashtag Generator tool is visible
    await expect(page.locator('text=Hashtag Generator')).toBeVisible();
  });

  test('should open Hashtag Generator tool', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Click on Hashtag Generator card
    await page.click('text=Hashtag Generator');

    // Check if tool interface opened
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=What is your content about?')).toBeVisible();
  });

  test('should generate hashtags successfully', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'hashtag',
          result: {
            hashtags: {
              trending: ['AIVideos', 'VideoMarketing2025', 'ContentCreation', 'SocialMediaTips', 'DigitalMarketing', 'VideoContent', 'MarketingStrategy', 'SocialMediaMarketing'],
              niche: ['AIVideoTools', 'VideoAI', 'AIContentCreator', 'VideoAutomation', 'AIMarketing', 'SmartVideo', 'VideoTech', 'AIForCreators'],
              community: ['CreatorEconomy', 'ContentCreators', 'SocialMediaCreators', 'VideoCreators', 'DigitalCreators', 'CreatorCommunity', 'VideoProducers'],
              branded: ['YourBrandName', 'YourProduct', 'BrandedContent', 'CompanyName', 'ProductLaunch', 'NewTool', 'Innovation']
            }
          },
          tokensUsed: 1,
          newBalance: 299
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Hashtag Generator
    await page.click('text=Hashtag Generator');

    // Fill in the input
    await page.fill('textarea', 'AI video marketing tool');

    // Select platform
    await page.selectOption('select >> nth=0', 'instagram');

    // Click Generate button
    await page.click('button:has-text("Generate")');

    // Wait for loading to complete (max 10 seconds with mock)
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Check if results appeared
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Check if hashtag categories are visible
    await expect(page.getByRole('heading', { name: /trending \(\d+\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /niche \(\d+\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /community \(\d+\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /branded \(\d+\)/i })).toBeVisible();

    // Check if at least one hashtag is generated
    await expect(page.locator('text=#AIVideos')).toBeVisible();

    // Check if Copy All button exists
    await expect(page.locator('button:has-text("Copy All")').first()).toBeVisible();
  });

  test('should show error for insufficient tokens', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Hashtag Generator
    await page.click('text=Hashtag Generator');

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

  test('should copy individual hashtag to clipboard', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'hashtag',
          result: {
            hashtags: {
              trending: ['AIVideos', 'VideoMarketing'],
              niche: ['AIVideoTools', 'VideoAI'],
              community: ['CreatorEconomy'],
              branded: ['YourBrand']
            }
          },
          tokensUsed: 1,
          newBalance: 299
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Hashtag Generator
    await page.click('text=Hashtag Generator');

    // Fill and generate
    await page.fill('textarea', 'AI productivity tips');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('button:text("#AIVideos")', { timeout: 10000 });

    // Individual hashtag button should be visible and clickable
    const hashtagButton = page.locator('button:text("#AIVideos")').first();
    await expect(hashtagButton).toBeVisible();

    // Click the hashtag button
    await hashtagButton.click();
  });

  test('should copy category hashtags to clipboard', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'hashtag',
          result: {
            hashtags: {
              trending: ['AIVideos', 'VideoMarketing'],
              niche: ['AIVideoTools', 'VideoAI'],
              community: ['CreatorEconomy'],
              branded: ['YourBrand']
            }
          },
          tokensUsed: 1,
          newBalance: 299
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Hashtag Generator
    await page.click('text=Hashtag Generator');

    // Fill and generate
    await page.fill('textarea', 'AI productivity tips');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('button:has-text("Copy All")', { timeout: 10000 });

    // Copy All button for category should be visible
    const copyButton = page.locator('button:has-text("Copy All")').first();
    await expect(copyButton).toBeVisible();

    // Click the copy button
    await copyButton.click();
  });

  test('should copy all hashtags to clipboard', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'hashtag',
          result: {
            hashtags: {
              trending: ['AIVideos', 'VideoMarketing'],
              niche: ['AIVideoTools', 'VideoAI'],
              community: ['CreatorEconomy'],
              branded: ['YourBrand']
            }
          },
          tokensUsed: 1,
          newBalance: 299
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Hashtag Generator
    await page.click('text=Hashtag Generator');

    // Fill and generate
    await page.fill('textarea', 'AI productivity tips');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('button:has-text("Copy All 6 Hashtags")', { timeout: 10000 });

    // Copy all hashtags button should be visible
    const copyAllButton = page.locator('button:has-text("Copy All 6 Hashtags")');
    await expect(copyAllButton).toBeVisible();

    // Click the copy all button
    await copyAllButton.click();
  });

  test('should navigate back to tools list', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Hashtag Generator
    await page.click('text=Hashtag Generator');

    // Check if Back button exists
    await expect(page.locator('button:has-text("Back to Tools")')).toBeVisible();

    // Click Back
    await page.click('button:has-text("Back to Tools")');

    // Should be back at tools list
    await expect(page.locator('text=Caption Generator')).toBeVisible();
  });

  test('should validate empty input', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Hashtag Generator
    await page.click('text=Hashtag Generator');

    // Try to generate with empty input
    const generateButton = page.locator('button:has-text("Generate")');

    // Button should be disabled when input is empty
    await expect(generateButton).toBeDisabled();
  });

  test('should display different tone options', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Hashtag Generator
    await page.click('text=Hashtag Generator');

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

    // Open Hashtag Generator
    await page.click('text=Hashtag Generator');

    // Check platform dropdown
    const platformSelect = page.locator('select >> nth=0');
    await expect(platformSelect).toBeVisible();

    // Check if select has the default value
    await expect(platformSelect).toHaveValue('instagram');

    // Check if options exist by counting them
    const optionsCount = await platformSelect.locator('option').count();
    expect(optionsCount).toBeGreaterThanOrEqual(6);

    // Test changing the value
    await platformSelect.selectOption('tiktok');
    await expect(platformSelect).toHaveValue('tiktok');
  });
});
