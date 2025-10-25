import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('SocialSync Video Tools E2E Tests', () => {
  const baseURL = 'http://localhost:3001';
  const testVideoPath = '/tmp/socialsync-test/test-720p.mp4';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test('should load homepage and navigate', async ({ page }) => {
    // Check page loaded
    await expect(page).toHaveTitle(/Create Next App/);

    // Should redirect to /home
    await expect(page).toHaveURL(/\/home$/);

    // Check key elements exist
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=SocialSync')).toBeVisible();
  });

  test('should navigate to all main pages', async ({ page }) => {
    // Test Create page
    await page.click('text=Create');
    await expect(page).toHaveURL(/\/create$/);
    await expect(page.locator('text=Create AI Content')).toBeVisible();

    // Test Post page
    await page.click('text=Post');
    await expect(page).toHaveURL(/\/post$/);
    await expect(page.locator('text=Post Schedule')).toBeVisible();

    // Test Manage page
    await page.click('text=Manage');
    await expect(page).toHaveURL(/\/manage$/);
    await expect(page.locator('text=Video Tools')).toBeVisible();

    // Test More page
    await page.click('text=More');
    await expect(page).toHaveURL(/\/more$/);
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should access Video Downloader tool', async ({ page }) => {
    // Navigate to Manage
    await page.goto(`${baseURL}/manage`);

    // Click Video Downloader
    await page.locator('text=Video Downloader').click();
    await page.locator('button:has-text("Launch Tool")').first().click();

    // Should navigate to downloader
    await expect(page).toHaveURL(/\/tools\/downloader$/);

    // Check tool loaded
    await expect(page.locator('text=Download')).toBeVisible();
  });

  test('should access Format Converter tool', async ({ page }) => {
    // Navigate directly to converter
    await page.goto(`${baseURL}/tools/converter`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check converter loaded
    await expect(page.locator('text=Format')).toBeVisible();
  });

  test('should access Watermark Remover tool', async ({ page }) => {
    // Navigate to watermark remover
    await page.goto(`${baseURL}/tools/watermark`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Page should load without errors
    await expect(page).toHaveURL(/\/tools\/watermark$/);
  });

  test('should access all 6 video tools', async ({ page }) => {
    const tools = [
      'downloader',
      'watermark',
      'cropper',
      'converter',
      'thumbnail',
      'coverart'
    ];

    for (const tool of tools) {
      await page.goto(`${baseURL}/tools/${tool}`);
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      await expect(page).toHaveURL(new RegExp(`/tools/${tool}$`));

      // Should not have error
      const errorElements = await page.locator('text=/error|failed/i').count();
      expect(errorElements).toBe(0);
    }
  });

  test('should display tool cards on Manage page', async ({ page }) => {
    await page.goto(`${baseURL}/manage`);

    // Check all 6 tools are displayed
    await expect(page.locator('text=Video Downloader')).toBeVisible();
    await expect(page.locator('text=Watermark Remover')).toBeVisible();
    await expect(page.locator('text=Social Cropper')).toBeVisible();
    await expect(page.locator('text=Format Converter')).toBeVisible();
    await expect(page.locator('text=Thumbnail Generator')).toBeVisible();
    await expect(page.locator('text=Cover Art Creator')).toBeVisible();

    // Check all have Launch Tool buttons
    const launchButtons = page.locator('button:has-text("Launch Tool")');
    await expect(launchButtons).toHaveCount(6);
  });

  test('should have working navigation between tools', async ({ page }) => {
    // Start at converter
    await page.goto(`${baseURL}/tools/converter`);
    await expect(page).toHaveURL(/\/tools\/converter$/);

    // Navigate back to Manage via sidebar
    await page.click('text=Manage');
    await expect(page).toHaveURL(/\/manage$/);

    // Navigate to downloader
    await page.goto(`${baseURL}/tools/downloader`);
    await expect(page).toHaveURL(/\/tools\/downloader$/);
  });

  test('should have no console errors on tool pages', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Visit each tool page
    const tools = ['downloader', 'watermark', 'cropper', 'converter', 'thumbnail', 'coverart'];

    for (const tool of tools) {
      await page.goto(`${baseURL}/tools/${tool}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Wait for any async errors
    }

    // Filter out known warnings (like the workspace root warning)
    const criticalErrors = errors.filter(e =>
      !e.includes('workspace root') &&
      !e.includes('lockfiles') &&
      !e.includes('[HMR]')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('Creator Mode selection on Create page', async ({ page }) => {
    await page.goto(`${baseURL}/create`);

    // Check creator modes are visible
    await expect(page.locator('text=UGC Creator')).toBeVisible();
    await expect(page.locator('text=Educational')).toBeVisible();

    // Try clicking a mode
    await page.locator('text=UGC Creator').click();

    // Should show description
    await expect(page.locator('text=trending topics')).toBeVisible();
  });

  test('Calendar visible on Post page', async ({ page }) => {
    await page.goto(`${baseURL}/post`);

    // Check calendar elements
    await expect(page.locator('text=October 2025')).toBeVisible();
    await expect(page.locator('text=Today')).toBeVisible();

    // Check days of week
    await expect(page.locator('text=Mon')).toBeVisible();
    await expect(page.locator('text=Tue')).toBeVisible();
  });
});

test.describe('API Integration Tests', () => {
  test('Video Downloader API should return video info', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/download-video', {
      params: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      timeout: 30000
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('author');
    expect(data).toHaveProperty('formats');
    expect(Array.isArray(data.formats)).toBeTruthy();
  });

  test('API routes should be accessible', async ({ request }) => {
    const routes = [
      '/api/download-video?url=https://youtube.com/watch?v=test',
      '/api/convert-video',
      '/api/crop-video',
      '/api/process-video'
    ];

    for (const route of routes) {
      const response = await request.get(`http://localhost:3001${route}`);
      // Should not be 404
      expect(response.status()).not.toBe(404);
    }
  });
});
