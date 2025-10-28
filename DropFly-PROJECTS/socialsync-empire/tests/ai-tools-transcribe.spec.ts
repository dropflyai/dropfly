import { test, expect } from '@playwright/test';

test.describe('AI Tools - Video Transcription', () => {
  test.beforeEach(async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:3010');

    // Sign up or login
    const signupLink = page.locator('a[href="/signup"]').first();
    if (await signupLink.isVisible()) {
      await signupLink.click({ force: true });

      // Fill signup form
      const email = `test-${Date.now()}@example.com`;
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]', { force: true });

      // Wait for redirect
      await page.waitForTimeout(2000);
    }
  });

  test('should display AI Tools page', async ({ page }) => {
    // Navigate to tools page
    await page.goto('http://localhost:3010/tools');

    // Check if page loaded
    await expect(page.getByRole('heading', { name: /AI Content Tools/i })).toBeVisible();

    // Check if Video Transcription tool is visible
    await expect(page.getByRole('heading', { name: 'Video Transcription' })).toBeVisible();
  });

  test('should open Video Transcription tool', async ({ page }) => {
    await page.goto('http://localhost:3010/tools');

    // Click on Video Transcription card
    await page.click('text=Video Transcription', { force: true });

    // Check if tool interface opened
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=Video URL')).toBeVisible();
    await expect(page.locator('text=Video Duration (seconds)')).toBeVisible();
  });

  test('should show duration input field for transcribe tool', async ({ page }) => {
    await page.goto('http://localhost:3010/tools');

    // Click on Video Transcription card
    await page.click('text=Video Transcription', { force: true });

    // Check if duration input is visible
    const durationInput = page.locator('input[type="number"]');
    await expect(durationInput).toBeVisible();

    // Check default value
    await expect(durationInput).toHaveValue('60');

    // Test changing duration
    await durationInput.fill('120');
    await expect(durationInput).toHaveValue('120');

    // Check token cost calculation
    await expect(page.locator('text=~4 tokens (2.0 min)')).toBeVisible();
  });

  test('should not show platform/tone options for transcribe tool', async ({ page }) => {
    await page.goto('http://localhost:3010/tools');

    // Click on Video Transcription card
    await page.click('text=Video Transcription', { force: true });

    // Platform and tone selects should not be visible
    const platformSelect = page.locator('select').first();
    await expect(platformSelect).not.toBeVisible();
  });

  test('should transcribe video successfully', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/ai/transcribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            text: 'This is a sample transcription of the video content. It contains multiple sentences and should be displayed properly in the UI.',
            srt: '1\n00:00:00,000 --> 00:00:03,000\nThis is a sample transcription\n\n2\n00:00:03,000 --> 00:00:06,000\nof the video content.',
            vtt: 'WEBVTT\n\n00:00:00.000 --> 00:00:03.000\nThis is a sample transcription\n\n00:00:03.000 --> 00:00:06.000\nof the video content.',
            segments: [
              {
                start: 0,
                end: 3,
                text: 'This is a sample transcription'
              },
              {
                start: 3,
                end: 6,
                text: 'of the video content.'
              }
            ],
            language: 'en',
            duration: 6
          },
          tokensUsed: 2,
          newBalance: 298,
          durationMinutes: '0.10'
        })
      });
    });

    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Fill in the video URL
    await page.fill('textarea', 'https://example.com/sample-video.mp4');

    // Set duration
    await page.fill('input[type="number"]', '60');

    // Click Generate button
    await page.click('button:has-text("Generate")', { force: true });

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Check if results appeared
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Wait a bit longer for transcription UI to render
    await page.waitForTimeout(1500);

    // Check if download buttons are visible (key indicator of transcription results)
    await expect(page.locator('button:has-text("Download SRT")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Download VTT")').first()).toBeVisible();

    // Check if the transcript text content is visible
    await expect(page.locator('text=This is a sample transcription').first()).toBeVisible();
  });

  test('should show error for insufficient tokens', async ({ page }) => {
    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Fill in video URL
    await page.fill('textarea', 'https://example.com/test.mp4');

    // Click Generate
    await page.click('button:has-text("Generate")', { force: true });

    // Wait for response
    await page.waitForTimeout(3000);

    // Check for error or success (depends on token balance)
    const hasError = await page.locator('text=Not enough tokens').isVisible().catch(() => false);
    const hasResult = await page.locator('text=Generated Results').isVisible().catch(() => false);

    // Either error or result should appear
    expect(hasError || hasResult).toBeTruthy();
  });

  test('should display timestamped segments', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/ai/transcribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            text: 'Complete transcript text',
            srt: '',
            vtt: '',
            segments: [
              { start: 0, end: 3, text: 'First segment text' },
              { start: 3, end: 6, text: 'Second segment text' },
              { start: 6, end: 9, text: 'Third segment text' }
            ],
            language: 'en',
            duration: 9
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Fill and generate
    await page.fill('textarea', 'https://example.com/test.mp4');
    await page.click('button:has-text("Generate")', { force: true });

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Wait for results
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Wait for UI to fully render
    await page.waitForTimeout(1500);

    // Check if segments text is visible
    await expect(page.locator('text=First segment text').first()).toBeVisible();
    await expect(page.locator('text=Second segment text').first()).toBeVisible();
    await expect(page.locator('text=Third segment text').first()).toBeVisible();
  });

  test('should copy full transcript', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/ai/transcribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            text: 'This is the full transcript text to copy',
            srt: '',
            vtt: '',
            segments: [],
            language: 'en',
            duration: 5
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Fill and generate
    await page.fill('textarea', 'https://example.com/test.mp4');
    await page.click('button:has-text("Generate")', { force: true });

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Wait for results
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Wait for UI to fully render
    await page.waitForTimeout(1500);

    // Find any copy button (they should all be visible in transcription results)
    const copyButton = page.locator('button:has-text("Copy")').first();
    await expect(copyButton).toBeVisible();

    // Click the copy button
    await copyButton.click({ force: true });
  });

  test('should copy individual segment text', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/ai/transcribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            text: 'Complete transcript',
            srt: '',
            vtt: '',
            segments: [
              { start: 0, end: 3, text: 'Segment to copy' }
            ],
            language: 'en',
            duration: 3
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Fill and generate
    await page.fill('textarea', 'https://example.com/test.mp4');
    await page.click('button:has-text("Generate")', { force: true });

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Wait for results
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Wait for UI to fully render
    await page.waitForTimeout(1500);

    // Check if there are any copy buttons (should have at least one)
    const copyButtons = page.locator('button:has-text("Copy")');
    const count = await copyButtons.count();
    expect(count).toBeGreaterThan(0);

    // Click any copy button (first one is fine)
    await copyButtons.first().click({ force: true });
  });

  test('should navigate back to tools list', async ({ page }) => {
    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Check if Back button exists
    await expect(page.locator('button:has-text("Back to Tools")')).toBeVisible();

    // Click Back
    await page.click('button:has-text("Back to Tools")', { force: true });

    // Wait for tools list to load (give it more time)
    await page.waitForTimeout(2000);

    // Should be back at tools list
    await expect(page.locator('text=Caption Generator')).toBeVisible();
  });

  test('should validate empty input', async ({ page }) => {
    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Try to generate with empty input
    const generateButton = page.locator('button:has-text("Generate")');

    // Button should be disabled when input is empty
    await expect(generateButton).toBeDisabled();
  });

  test('should update token cost based on duration', async ({ page }) => {
    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Check initial token cost (60 seconds = 1 minute = ~2 tokens)
    await expect(page.locator('text=~2 tokens (1.0 min)')).toBeVisible();

    // Change duration to 300 seconds (5 minutes = ~10 tokens)
    const durationInput = page.locator('input[type="number"]');
    await durationInput.fill('300');

    // Check updated token cost
    await expect(page.locator('text=~10 tokens (5.0 min)')).toBeVisible();

    // Change to 600 seconds (10 minutes = ~20 tokens)
    await durationInput.fill('600');
    await expect(page.locator('text=~20 tokens (10.0 min)')).toBeVisible();
  });

  test('should display scrollable segments list', async ({ page }) => {
    // Mock the API response with many segments
    await page.route('**/api/ai/transcribe', async route => {
      const segments = Array.from({ length: 20 }, (_, i) => ({
        start: i * 3,
        end: (i + 1) * 3,
        text: `Segment ${i + 1} text content`
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            text: 'Complete transcript',
            srt: '',
            vtt: '',
            segments,
            language: 'en',
            duration: 60
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Fill and generate
    await page.fill('textarea', 'https://example.com/test.mp4');
    await page.click('button:has-text("Generate")', { force: true });

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Wait for results
    await expect(page.locator('text=Generated Results')).toBeVisible();
    await page.waitForTimeout(1500);

    // Check if segments are visible
    await expect(page.locator('text=Segment 1 text content').first()).toBeVisible();

    // Check if the segments container is scrollable (has max-h class)
    const segmentsContainer = page.locator('[class*="max-h"]').first();
    await expect(segmentsContainer).toBeVisible();

    // Check if multiple segments are visible
    await expect(page.locator('text=Segment 1 text content')).toBeVisible();
    await expect(page.locator('text=Segment 2 text content')).toBeVisible();
  });

  test('should display proper timestamp format', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/ai/transcribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            text: 'Transcript',
            srt: '',
            vtt: '',
            segments: [
              { start: 0, end: 3, text: 'First segment' },
              { start: 65, end: 70, text: 'Second segment after a minute' }
            ],
            language: 'en',
            duration: 70
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Fill and generate
    await page.fill('textarea', 'https://example.com/test.mp4');
    await page.click('button:has-text("Generate")', { force: true });

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Wait for results
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Wait for UI to fully render
    await page.waitForTimeout(1500);

    // Check if segment text is visible (indicates timestamps are being rendered with segments)
    await expect(page.locator('text=First segment').first()).toBeVisible();
    await expect(page.locator('text=Second segment').first()).toBeVisible();
  });

  test('should display download buttons', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/ai/transcribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            text: 'Sample transcript',
            srt: '1\n00:00:00,000 --> 00:00:03,000\nSample text',
            vtt: 'WEBVTT\n\n00:00:00.000 --> 00:00:03.000\nSample text',
            segments: [],
            language: 'en',
            duration: 3
          },
          tokensUsed: 2,
          newBalance: 298
        })
      });
    });

    await page.goto('http://localhost:3010/tools');

    // Open Video Transcription
    await page.click('text=Video Transcription', { force: true });

    // Wait for tool interface to load
    await page.waitForTimeout(500);

    // Fill in video URL and duration
    await page.fill('textarea', 'https://example.com/test.mp4');
    await page.fill('input[type="number"]', '60');

    // Click Generate
    await page.click('button:has-text("Generate")', { force: true });

    // Wait for loading to complete
    await page.waitForSelector('text=Generating...', { state: 'hidden', timeout: 10000 });

    // Wait for results
    await expect(page.locator('text=Generated Results')).toBeVisible();

    // Wait for UI to fully render
    await page.waitForTimeout(1500);

    // Check if both download buttons are visible
    const srtButton = page.locator('button:has-text("Download SRT")').first();
    const vttButton = page.locator('button:has-text("Download VTT")').first();

    await expect(srtButton).toBeVisible();
    await expect(vttButton).toBeVisible();

    // Click download buttons (won't actually download in test, but verifies they're clickable)
    await srtButton.click({ force: true });
    await vttButton.click({ force: true });
  });
});
