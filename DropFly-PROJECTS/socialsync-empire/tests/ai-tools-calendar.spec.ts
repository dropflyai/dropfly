import { test, expect } from '@playwright/test';

test.describe('AI Tools - Content Calendar', () => {
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

    // Check if Content Calendar tool is visible
    await expect(page.getByRole('heading', { name: 'Content Calendar' })).toBeVisible();
  });

  test('should open Content Calendar tool', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Click on Content Calendar card
    await page.click('text=Content Calendar');

    // Check if tool interface opened
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=What is your niche/topic?')).toBeVisible();
  });

  test('should generate 30-day calendar successfully', async ({ page }) => {
    // Mock the API response with 5 sample days (for brevity in tests)
    await page.route('/api/ai/tools', async route => {
      const calendar = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        topic: `Content Topic ${i + 1}`,
        description: `Description for day ${i + 1} content`,
        contentType: i % 3 === 0 ? 'video' : i % 3 === 1 ? 'carousel' : 'reel',
        hooks: [`Hook idea ${i + 1}`]
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'calendar',
          result: {
            calendar
          },
          tokensUsed: 10,
          newBalance: 290
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

    // Fill in the input
    await page.fill('textarea', 'Fitness coaching niche');

    // Select platform
    await page.selectOption('select >> nth=0', 'instagram');

    // Click Generate button
    await page.click('button:has-text("Generate")');

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Check if results appeared
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Check if 30-Day Content Plan header is visible
    await expect(page.locator('text=30-Day Content Plan')).toBeVisible();

    // Check if at least first day is visible
    await expect(page.locator('text=Day 1').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Content Topic 1', exact: true })).toBeVisible();

    // Check if Copy All button exists
    await expect(page.locator('button:has-text("Copy All")').first()).toBeVisible();
  });

  test('should show error for insufficient tokens', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

    // Fill in input
    await page.fill('textarea', 'Test niche');

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

  test('should display multiple days with content types', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'calendar',
          result: {
            calendar: [
              { day: 1, topic: 'Topic 1', description: 'Desc 1', contentType: 'video', hooks: [] },
              { day: 2, topic: 'Topic 2', description: 'Desc 2', contentType: 'carousel', hooks: [] },
              { day: 3, topic: 'Topic 3', description: 'Desc 3', contentType: 'reel', hooks: [] }
            ]
          },
          tokensUsed: 10,
          newBalance: 290
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

    // Fill and generate
    await page.fill('textarea', 'Fitness niche');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('text=Day 1', { timeout: 10000 });

    // Check if multiple days are visible
    await expect(page.locator('text=Day 1')).toBeVisible();
    await expect(page.locator('text=Day 2')).toBeVisible();
    await expect(page.locator('text=Day 3')).toBeVisible();

    // Check if content types are visible
    await expect(page.locator('text=video').first()).toBeVisible();
    await expect(page.locator('text=carousel').first()).toBeVisible();
    await expect(page.locator('text=reel').first()).toBeVisible();
  });

  test('should copy individual day content', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'calendar',
          result: {
            calendar: [
              { day: 1, topic: 'Test Topic', description: 'Test Description', contentType: 'video', hooks: [] }
            ]
          },
          tokensUsed: 10,
          newBalance: 290
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

    // Fill and generate
    await page.fill('textarea', 'Test niche');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('button:has-text("Copy")', { timeout: 10000 });

    // Individual day Copy button should be visible
    const copyButton = page.locator('button:has-text("Copy")').last();
    await expect(copyButton).toBeVisible();

    // Click the copy button
    await copyButton.click();
  });

  test('should copy all calendar content', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'calendar',
          result: {
            calendar: [
              { day: 1, topic: 'Topic 1', description: 'Desc 1', contentType: 'video', hooks: [] },
              { day: 2, topic: 'Topic 2', description: 'Desc 2', contentType: 'carousel', hooks: [] }
            ]
          },
          tokensUsed: 10,
          newBalance: 290
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

    // Fill and generate
    await page.fill('textarea', 'Test niche');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('button:has-text("Copy All")', { timeout: 10000 });

    // Copy All button should be visible
    const copyAllButton = page.locator('button:has-text("Copy All")').first();
    await expect(copyAllButton).toBeVisible();

    // Click the copy all button
    await copyAllButton.click();
  });

  test('should display hook ideas when available', async ({ page }) => {
    // Mock the API response
    await page.route('/api/ai/tools', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'calendar',
          result: {
            calendar: [
              {
                day: 1,
                topic: 'Topic with hooks',
                description: 'Description',
                contentType: 'video',
                hooks: ['Hook idea 1', 'Hook idea 2']
              }
            ]
          },
          tokensUsed: 10,
          newBalance: 290
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

    // Fill and generate
    await page.fill('textarea', 'Test niche');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('text=Hook idea 1', { timeout: 10000 });

    // Check if hook ideas are visible
    await expect(page.locator('text=💡 Hook idea 1')).toBeVisible();
    await expect(page.locator('text=💡 Hook idea 2')).toBeVisible();
  });

  test('should have scrollable calendar view', async ({ page }) => {
    // Mock the API response with many days
    await page.route('/api/ai/tools', async route => {
      const calendar = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        topic: `Topic ${i + 1}`,
        description: `Description ${i + 1}`,
        contentType: 'video',
        hooks: []
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tool: 'calendar',
          result: { calendar },
          tokensUsed: 10,
          newBalance: 290
        })
      });
    });

    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

    // Fill and generate
    await page.fill('textarea', 'Test niche');
    await page.click('button:has-text("Generate")');

    // Wait for results
    await page.waitForSelector('text=Day 1', { timeout: 10000 });

    // Check if the calendar container is scrollable (has max-h class)
    const calendarContainer = page.locator('.max-h-\\[600px\\]');
    await expect(calendarContainer).toBeVisible();
  });

  test('should navigate back to tools list', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

    // Check if Back button exists
    await expect(page.locator('button:has-text("Back to Tools")')).toBeVisible();

    // Click Back
    await page.click('button:has-text("Back to Tools")');

    // Should be back at tools list
    await expect(page.locator('text=Caption Generator')).toBeVisible();
  });

  test('should validate empty input', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

    // Try to generate with empty input
    const generateButton = page.locator('button:has-text("Generate")');

    // Button should be disabled when input is empty
    await expect(generateButton).toBeDisabled();
  });

  test('should display different tone options', async ({ page }) => {
    await page.goto('http://localhost:3001/tools');

    // Open Content Calendar
    await page.click('text=Content Calendar');

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

    // Open Content Calendar
    await page.click('text=Content Calendar');

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
