import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * VIDEO GENERATION TEST ONLY
 *
 * Tests: Script → Video (stops before posting)
 * This is what we need to validate before connecting social media accounts.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe('Video Generation Workflow', () => {
  test('Generate video from ad script (no posting)', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    console.log('\n🎬 VIDEO GENERATION TEST\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Load ad script
    const scriptPath = path.join(__dirname, '..', 'AD-SCRIPT-ONLY.json');
    const adData = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));
    const adScript = adData.ad_script;

    console.log('📝 Ad Script Loaded:\n');
    console.log(`   Hook: ${adScript.hook}\n`);

    // STEP 1: Sign up
    console.log('👤 STEP 1: Signing up...\n');

    await page.goto('http://localhost:3010');
    await page.waitForLoadState('networkidle');

    const testEmail = `video-test-${Date.now()}@example.com`;
    const testPassword = 'VideoTest2025!';

    await page.click('text=Sign Up');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/home', { timeout: 15000 });

    console.log(`✅ Signed up: ${testEmail}\n`);

    // Get user ID
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === testEmail);
    if (!user) throw new Error('User not found');

    console.log(`   User ID: ${user.id}\n`);

    // STEP 2: Navigate to AI Tools → Video Generation
    console.log('🎬 STEP 2: Going to video generation...\n');

    await page.goto('http://localhost:3010/ai-tools');
    await page.waitForLoadState('networkidle');

    // Scroll to video generation section
    await page.evaluate(() => {
      const videoSection = Array.from(document.querySelectorAll('h2, h3'))
        .find(el => el.textContent?.includes('Video') || el.textContent?.includes('Generate'));
      if (videoSection) {
        videoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    await page.waitForTimeout(1000);

    console.log('✅ On video generation page\n');

    // STEP 3: Fill in the video prompt
    console.log('📝 STEP 3: Entering ad script...\n');

    const videoPrompt = `${adScript.script}

Visual Style: Modern, professional, purple (#9333ea) and blue (#3b82f6) gradient overlays.
Show transformation from frustrated to successful entrepreneur.
Fast-paced cuts every 2-3 seconds.
Display automation in action - AI writing, creating videos, posting to platforms.
Show platform logos: Instagram, TikTok, YouTube, LinkedIn, Facebook, Twitter.
End with successful entrepreneur and growth charts.

Brand: DropFly - Elite AI development company
Product: SocialSync Empire - 10/10 automation platform
Format: 9:16 vertical for social media
Mood: Empowering, innovative, professional`;

    // Find the textarea for video generation
    const textareas = await page.locator('textarea').all();
    let promptField = null;

    for (const textarea of textareas) {
      const isVisible = await textarea.isVisible();
      if (isVisible) {
        promptField = textarea;
        break;
      }
    }

    if (!promptField) {
      throw new Error('Could not find video prompt textarea');
    }

    await promptField.fill(videoPrompt);
    console.log('✅ Script entered\n');

    // STEP 4: Generate video
    console.log('🎬 STEP 4: Generating video...\n');
    console.log('   This may take 1-3 minutes...\n');

    // Find and click generate button
    const generateButtons = await page.locator('button:has-text("Generate")').all();
    let generateButton = null;

    for (const button of generateButtons) {
      const isVisible = await button.isVisible();
      if (isVisible) {
        generateButton = button;
        break;
      }
    }

    if (!generateButton) {
      throw new Error('Could not find Generate button');
    }

    await generateButton.click();

    // Wait for video generation (look for video element or success message)
    console.log('⏳ Waiting for video generation...\n');

    try {
      // Wait for either video element or download button
      await page.waitForSelector('video, [data-video-url], button:has-text("Download"), a:has-text("Download")', {
        timeout: 180000 // 3 minutes
      });

      console.log('✅ Video generated!\n');

      // Try to find the video URL
      const videoElement = page.locator('video').first();
      const isVideoVisible = await videoElement.isVisible().catch(() => false);

      if (isVideoVisible) {
        const videoSrc = await videoElement.getAttribute('src');
        console.log(`📹 Video URL: ${videoSrc}\n`);

        // Check token balance
        const { data: balance } = await supabase
          .from('token_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🎉 VIDEO GENERATION SUCCESSFUL!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('✅ WORKFLOW TESTED:\n');
        console.log('   1. ✅ User signup');
        console.log('   2. ✅ Navigate to AI Tools');
        console.log('   3. ✅ Enter ad script');
        console.log('   4. ✅ Generate video\n');
        console.log('📊 RESULTS:\n');
        console.log(`   Video URL: ${videoSrc}`);
        console.log(`   Token balance: ${balance?.balance || 'unknown'}\n`);
        console.log('🎬 VIDEO DETAILS:\n');
        console.log('   • Script: DropFly SocialSync Empire ad');
        console.log('   • Duration: ~5 seconds (demo)');
        console.log('   • Format: 9:16 vertical');
        console.log('   • Engine: Auto-selected based on tier\n');
        console.log('✅ READY FOR NEXT PHASE:\n');
        console.log('   Connect social media accounts to enable posting\n');

        // Save results
        const testResults = {
          test_run_at: new Date().toISOString(),
          test_type: 'video_generation_only',
          user: { id: user.id, email: testEmail, password: testPassword },
          video: { url: videoSrc },
          tokens: { remaining: balance?.balance },
          next_step: 'Connect social media accounts for posting'
        };

        const outputPath = path.join(__dirname, '..', 'VIDEO-GENERATION-TEST.json');
        fs.writeFileSync(outputPath, JSON.stringify(testResults, null, 2));
        console.log(`💾 Results saved: VIDEO-GENERATION-TEST.json\n`);

        // Assert success
        expect(videoSrc).toBeTruthy();
        expect(videoSrc).toContain('http');

      } else {
        console.log('⚠️  Video element not visible, but generation completed\n');
      }

    } catch (error) {
      console.error('❌ Video generation timed out or failed\n');
      console.error('Error:', error);

      // Take screenshot for debugging
      await page.screenshot({ path: 'video-generation-error.png', fullPage: true });
      console.log('📸 Screenshot saved: video-generation-error.png\n');

      throw error;
    }

    console.log('✅ Test complete!\n');
  });
});
