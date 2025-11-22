import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Generate DropFly Ad Video
 * This test automates the complete ad video generation process
 */

test.describe('Generate DropFly Ad Video', () => {
  test('Create complete ad video for SocialSync Empire', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes for complete process

    console.log('\n🚀 AUTOMATED AD VIDEO GENERATION\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Load the ad script
    const scriptPath = path.join(__dirname, '..', 'AD-SCRIPT-ONLY.json');
    const scriptData = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));
    const adScript = scriptData.ad_script;

    console.log('📝 Ad Script Loaded:');
    console.log(`   Hook: ${adScript.hook}`);
    console.log(`   Hashtags: ${adScript.hashtags.join(', ')}\n`);

    // STEP 1: Navigate to home
    console.log('🌐 STEP 1: Opening SocialSync Empire...\n');
    await page.goto('http://localhost:3010');
    await page.waitForLoadState('networkidle');

    // Check if logged in
    const isLoggedIn = await page.locator('text=AI Tools').isVisible().catch(() => false);

    if (!isLoggedIn) {
      console.log('🔐 Not logged in, signing up...\n');

      // Sign up
      await page.click('text=Sign Up');
      await page.fill('input[type="email"]', `dropfly-test-${Date.now()}@example.com`);
      await page.fill('input[type="password"]', 'DropFly2025!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/home', { timeout: 15000 });

      console.log('✅ Signed up successfully!\n');
    } else {
      console.log('✅ Already logged in!\n');
    }

    // STEP 2: Navigate to AI Tools
    console.log('🛠️  STEP 2: Opening AI Tools...\n');
    await page.goto('http://localhost:3010/ai-tools');
    await page.waitForLoadState('networkidle');

    // STEP 3: Find Video Generation tool
    console.log('🎬 STEP 3: Locating Video Generation tool...\n');

    // Look for video generation section or button
    const videoSection = page.locator('text=Generate Video').or(page.locator('text=Video Generation'));
    await expect(videoSection).toBeVisible({ timeout: 10000 });

    console.log('✅ Video tool found!\n');

    // STEP 4: Fill in the script
    console.log('📝 STEP 4: Entering ad script...\n');

    // Create the full prompt for video generation
    const videoPrompt = `${adScript.script}

Visual Style: Modern, professional, purple and blue gradient overlays. Show transformation from frustrated to successful entrepreneur. Fast-paced cuts. Display automation in action.

Brand: DropFly - Elite AI development company
Product: SocialSync Empire - 10/10 automation platform`;

    // Find and fill the prompt/script textarea
    const promptField = page.locator('textarea').first();
    await promptField.fill(videoPrompt);

    console.log('✅ Script entered!\n');

    // STEP 5: Generate the video
    console.log('🎬 STEP 5: Generating video...\n');
    console.log('   (This may take 1-2 minutes...)\n');

    const generateButton = page.locator('button:has-text("Generate")').first();
    await generateButton.click();

    // Wait for generation to complete
    console.log('⏳ Waiting for video generation...\n');

    // Look for success indicators
    await page.waitForSelector('video, [data-video-url], text=Download', {
      timeout: 180000 // 3 minutes max
    });

    console.log('✅ Video generated successfully!\n');

    // STEP 6: Download the video
    console.log('📥 STEP 6: Downloading video...\n');

    // Try to find download button or video URL
    const downloadButton = page.locator('button:has-text("Download")').or(
      page.locator('a:has-text("Download")')
    );

    if (await downloadButton.isVisible()) {
      // Start waiting for download
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      const download = await downloadPromise;

      // Save the download
      const downloadPath = path.join(__dirname, '..', 'public', 'ads', `dropfly-ad-${Date.now()}.mp4`);
      await download.saveAs(downloadPath);

      console.log(`✅ Video downloaded to: ${downloadPath}\n`);

      // STEP 7: Create final package
      console.log('📦 STEP 7: Creating final ad package...\n');

      const finalPackage = {
        brand: 'DropFly',
        product: 'SocialSync Empire',
        ad_script: adScript,
        video: {
          path: downloadPath,
          format: 'mp4',
          aspect_ratio: '9:16',
          duration: '50 seconds'
        },
        caption: `${adScript.hook}

${adScript.cta}

${adScript.hashtags.join(' ')}`,
        platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
        status: 'READY_TO_POST',
        generated_at: new Date().toISOString()
      };

      const packagePath = path.join(__dirname, '..', 'FINAL-AD-COMPLETE.json');
      fs.writeFileSync(packagePath, JSON.stringify(finalPackage, null, 2));

      console.log('✅ Final package created!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🎉 YOUR AD IS COMPLETE!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`📹 Video: ${downloadPath}`);
      console.log(`📋 Package: ${packagePath}\n`);
      console.log('📱 READY TO POST!\n');
      console.log('Upload this video to:');
      console.log('  ✅ TikTok');
      console.log('  ✅ Instagram Reels');
      console.log('  ✅ YouTube Shorts\n');
      console.log('Use the caption from FINAL-AD-COMPLETE.json\n');

    } else {
      // Try to get video URL from the page
      const videoElement = page.locator('video').first();
      if (await videoElement.isVisible()) {
        const videoSrc = await videoElement.getAttribute('src');
        console.log(`✅ Video URL: ${videoSrc}\n`);
        console.log('   Download this video and use it for your ad!\n');
      }
    }

    console.log('✅ Process complete!\n');
  });
});
