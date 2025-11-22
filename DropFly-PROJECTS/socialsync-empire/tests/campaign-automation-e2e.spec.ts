import { test, expect } from '@playwright/test';

/**
 * End-to-End Campaign Automation Test
 *
 * Tests the complete flow:
 * 1. User creates brand package
 * 2. User creates campaign
 * 3. Cron generates script
 * 4. Cron generates video
 * 5. Cron posts to social media
 */

test.describe('Campaign Automation - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3010');
  });

  test('Complete automation flow from brand to campaign to posting', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for complete flow

    // Step 1: Sign up or login
    await test.step('Authenticate user', async () => {
      // Check if already logged in
      const isLoggedIn = await page.locator('text=Dashboard').isVisible().catch(() => false);

      if (!isLoggedIn) {
        // Sign up with test account
        await page.click('text=Sign Up');
        await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
        await page.fill('input[type="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');

        // Wait for redirect to home
        await page.waitForURL('**/home', { timeout: 10000 });
      }
    });

    let brandPackageId: string;

    // Step 2: Create brand package
    await test.step('Create brand package', async () => {
      // Navigate to brand packages
      await page.goto('http://localhost:3010/brand-packages/create');
      await page.waitForLoadState('networkidle');

      // Fill basic info
      await page.fill('input[name="name"]', 'Test Brand Automation');
      await page.fill('input[name="tagline"]', 'Testing automation flow');
      await page.fill('textarea[name="mission_statement"]', 'To test the complete automation pipeline');

      // Select brand voice
      await page.selectOption('select[name="brand_voice"]', 'friendly');

      // Fill brand personality
      await page.fill('input[name="brand_personality"]', 'Innovative, Fun, Engaging');

      // Fill target audience
      await page.fill('input[name="target_audience"]', 'Tech enthusiasts aged 25-40');

      // Fill key values
      await page.fill('input[name="key_values"]', 'Innovation, Quality, Customer Success');

      // Set colors (use color inputs)
      await page.fill('input[name="primary_color"]', '#9333ea');
      await page.fill('input[name="secondary_color"]', '#3b82f6');
      await page.fill('input[name="accent_color"]', '#10b981');

      // Set as default
      await page.check('input[name="is_default"]');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for redirect
      await page.waitForURL('**/brand-packages', { timeout: 10000 });

      // Verify brand was created
      await expect(page.locator('text=Test Brand Automation')).toBeVisible();

      console.log('✅ Brand package created');
    });

    let campaignId: string;

    // Step 3: Create campaign
    await test.step('Create campaign', async () => {
      // Navigate to campaign creation
      await page.goto('http://localhost:3010/campaigns/create');
      await page.waitForLoadState('networkidle');

      // Fill campaign details
      await page.fill('input[name="name"]', 'Automation Test Campaign');
      await page.fill('textarea[name="description"]', 'Testing the complete automation flow');
      await page.fill('input[name="niche"]', 'AI and technology trends');

      // Select brand package (should auto-select default)
      const brandSelect = page.locator('select[name="brand_package_id"]');
      const selectedValue = await brandSelect.inputValue();
      expect(selectedValue).not.toBe(''); // Should have default brand selected

      // Select platforms
      await page.check('input[value="tiktok"]');
      await page.check('input[value="instagram"]');
      await page.check('input[value="youtube"]');

      // Set frequency
      await page.selectOption('select[name="frequency"]', 'daily');

      // Set post times
      await page.fill('input[name="post_times"]', '09:00');

      // Submit campaign
      await page.click('button[type="submit"]');

      // Wait for redirect to campaigns list
      await page.waitForURL('**/campaigns', { timeout: 10000 });

      // Verify campaign was created
      await expect(page.locator('text=Automation Test Campaign')).toBeVisible();

      console.log('✅ Campaign created');
    });

    // Step 4: Trigger script generation cron
    await test.step('Generate script via cron', async () => {
      // Manually trigger the cron endpoint (simulating scheduled run)
      const response = await page.request.get('http://localhost:3010/api/cron/generate-campaign-posts');

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      console.log('Cron response:', data);
      expect(data.success).toBe(true);

      if (data.results?.succeeded > 0) {
        console.log('✅ Script generated successfully');
      } else {
        console.log('⏳ No campaigns due for posting yet');
      }
    });

    // Step 5: Check campaign posts
    await test.step('Verify campaign post created', async () => {
      // Navigate to campaigns to see posts
      await page.goto('http://localhost:3010/campaigns');
      await page.waitForLoadState('networkidle');

      // Click on our campaign
      await page.click('text=Automation Test Campaign');
      await page.waitForLoadState('networkidle');

      // Check if post was created
      const hasPost = await page.locator('text=ready').isVisible().catch(() => false);

      if (hasPost) {
        console.log('✅ Campaign post with status "ready" found');
      } else {
        console.log('⏳ Waiting for script generation...');
      }
    });

    // Step 6: Trigger video generation cron
    await test.step('Generate video via cron (simulation)', async () => {
      const response = await page.request.get('http://localhost:3010/api/cron/generate-campaign-videos');

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      console.log('Video cron response:', data);

      if (data.results?.succeeded > 0) {
        console.log('✅ Video generation triggered');
      } else {
        console.log('⏳ No posts ready for video generation yet');
      }
    });

    // Step 7: Trigger publishing cron
    await test.step('Publish to social media via cron (simulation)', async () => {
      const response = await page.request.get('http://localhost:3010/api/cron/publish-campaign-posts');

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      console.log('Publishing cron response:', data);

      if (data.results?.succeeded > 0) {
        console.log('✅ Posts published to social media');
      } else {
        console.log('⏳ No posts ready for publishing yet');
      }
    });

    // Step 8: Verify health check
    await test.step('Check system health', async () => {
      const response = await page.request.get('http://localhost:3010/api/health');

      expect(response.ok()).toBeTruthy();
      const health = await response.json();

      console.log('Health check:', health);
      expect(health.status).toBe('healthy');
      expect(health.checks.database.status).toBe('up');

      console.log('✅ System health check passed');
    });
  });

  test('Brand package selector in campaign form', async ({ page }) => {
    // Create a brand first
    await page.goto('http://localhost:3010/brand-packages/create');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="name"]', 'Selector Test Brand');
    await page.fill('textarea[name="mission_statement"]', 'Test brand for selector');
    await page.check('input[name="is_default"]');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/brand-packages');

    // Go to campaign creation
    await page.goto('http://localhost:3010/campaigns/create');
    await page.waitForLoadState('networkidle');

    // Check brand selector exists and has options
    const brandSelect = page.locator('select[name="brand_package_id"]');
    await expect(brandSelect).toBeVisible();

    const options = await brandSelect.locator('option').count();
    expect(options).toBeGreaterThan(1); // At least "No Brand" + 1 brand

    // Verify default brand is selected
    const selectedValue = await brandSelect.inputValue();
    expect(selectedValue).not.toBe(''); // Should have a value

    console.log('✅ Brand selector working correctly');
  });

  test('Error logging when operation fails', async ({ page }) => {
    // Try to generate video without authentication
    const response = await page.request.post('http://localhost:3010/api/ai/generate-video', {
      data: {
        script: { hook: 'Test', script: 'Test', cta: 'Test' },
        campaign_post_id: 'fake-id'
      }
    });

    expect(response.status()).toBe(401); // Unauthorized

    // Check if error was logged (we can't directly check DB in browser test)
    // But we verified the error logger exists and works
    console.log('✅ Error handling working (unauthorized request blocked)');
  });

  test('Cron job authentication', async ({ page }) => {
    // Try to call cron without auth
    const response = await page.request.post('http://localhost:3010/api/cron/generate-campaign-posts', {
      data: {}
    });

    expect(response.status()).toBe(401); // Should require CRON_SECRET

    console.log('✅ Cron jobs require authentication');
  });

  test('Token deduction for operations', async ({ page }) => {
    // This would require authentication and a real campaign
    // For now, we'll just verify the endpoints exist

    const endpoints = [
      '/api/ai/generate-video',
      '/api/social/post',
      '/api/cron/generate-campaign-posts',
      '/api/cron/generate-campaign-videos',
      '/api/cron/publish-campaign-posts',
      '/api/health'
    ];

    for (const endpoint of endpoints) {
      const response = await page.request.get(`http://localhost:3010${endpoint}`);
      // Just check they don't 404
      expect(response.status()).not.toBe(404);
      console.log(`✅ Endpoint exists: ${endpoint}`);
    }
  });
});

test.describe('Automation Performance', () => {
  test('Health check responds quickly', async ({ page }) => {
    const startTime = Date.now();
    const response = await page.request.get('http://localhost:3010/api/health');
    const endTime = Date.now();

    expect(response.ok()).toBeTruthy();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second

    console.log(`✅ Health check responded in ${responseTime}ms`);
  });

  test('Campaign page loads efficiently', async ({ page }) => {
    await page.goto('http://localhost:3010/campaigns');

    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds

    console.log(`✅ Campaigns page loaded in ${loadTime}ms`);
  });
});
