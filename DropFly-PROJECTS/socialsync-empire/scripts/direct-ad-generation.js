/**
 * DIRECT AD GENERATION - NO AUTH REQUIRED
 *
 * This script uses the video generation API endpoint directly
 * to create the DropFly ad video from the existing script.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadVideo(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function generateAdVideo() {
  console.log('\n🚀 DIRECT AD VIDEO GENERATION\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Load the ad script
  const scriptPath = path.join(__dirname, '..', 'AD-SCRIPT-ONLY.json');
  const scriptData = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));
  const adScript = scriptData.ad_script;

  console.log('📝 Ad Script Loaded:\n');
  console.log(`Hook: ${adScript.hook}\n`);
  console.log(`Hashtags: ${adScript.hashtags.join(', ')}\n`);

  // Create video prompt
  const videoPrompt = `${adScript.script}

Visual Style:
- Modern, professional aesthetic
- Purple (#9333ea) and blue (#3b82f6) gradient overlays
- Show transformation from frustrated to successful entrepreneur
- Fast-paced, energetic cuts
- Display automation in action (AI writing, creating videos, posting to platforms)
- Professional quality with DropFly branding

Brand: DropFly - Elite AI development company
Product: SocialSync Empire - 10/10 automation platform
Duration: 5 seconds (demo - full version would be 50 seconds)
Aspect Ratio: 9:16 (vertical for TikTok/Instagram/YouTube Shorts)`;

  console.log('🎬 Generating video with FAL.AI...\n');

  try {
    // Call the video generation API directly
    const fal = require('@fal-ai/serverless-client');
    fal.config({
      credentials: process.env.FAL_KEY
    });

    const result = await fal.subscribe('fal-ai/hunyuan-video', {
      input: {
        prompt: videoPrompt,
        num_inference_steps: 50,
        guidance_scale: 6,
        num_frames: 129, // ~5 seconds at 25 fps
        video_size: {
          height: 1920,
          width: 1080
        }
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log(`   Progress: ${update.logs?.slice(-1)[0] || 'Processing...'}`);
        }
      }
    });

    const videoUrl = result.video.url;
    console.log('\n✅ Video generated successfully!\n');
    console.log(`Video URL: ${videoUrl}\n`);

    // Download the video
    console.log('📥 Downloading video...\n');

    const videoDir = path.join(__dirname, '..', 'public', 'ads');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    const timestamp = Date.now();
    const videoPath = path.join(videoDir, `dropfly-socialsync-ad-${timestamp}.mp4`);
    await downloadVideo(videoUrl, videoPath);

    console.log(`✅ Video downloaded: ${videoPath}\n`);

    // Create final package
    const finalPackage = {
      brand: {
        name: 'DropFly',
        tagline: 'Building Elite Applications with Precision and Excellence',
        colors: {
          primary: '#9333ea',
          secondary: '#3b82f6',
          accent: '#10b981'
        }
      },
      product: {
        name: 'SocialSync Empire',
        description: 'AI-Powered Social Media Management Platform',
        automation_level: '10/10',
        url: 'http://localhost:3010'
      },
      ad: {
        hook: adScript.hook,
        script: adScript.script,
        cta: adScript.cta,
        hashtags: adScript.hashtags,
        duration: '5 seconds (demo)',
        full_duration: '50 seconds',
        platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts']
      },
      video: {
        url: videoUrl,
        local_path: videoPath,
        format: 'mp4',
        aspect_ratio: '9:16',
        resolution: '1080x1920'
      },
      caption: `${adScript.hook}

${adScript.cta}

${adScript.hashtags.map(tag => `#${tag}`).join(' ')}`,
      posting: {
        platforms_ready: ['TikTok', 'Instagram', 'YouTube'],
        best_times: ['9 AM EST', '3 PM EST', '7 PM EST']
      },
      generated_at: new Date().toISOString(),
      status: 'READY_TO_POST'
    };

    const packagePath = path.join(__dirname, '..', 'FINAL-AD-COMPLETE.json');
    fs.writeFileSync(packagePath, JSON.stringify(finalPackage, null, 2));

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 AD VIDEO COMPLETE!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📦 FILES CREATED:\n');
    console.log(`   ✅ Video: ${videoPath}`);
    console.log(`   ✅ Package: ${packagePath}\n`);

    console.log('📱 READY TO POST:\n');
    console.log(`   Use the caption from ${packagePath}`);
    console.log(`   Upload the video to:`);
    console.log(`     • TikTok`);
    console.log(`     • Instagram Reels`);
    console.log(`     • YouTube Shorts\n`);

    console.log('🎬 VIDEO DETAILS:\n');
    console.log(`   • Duration: 5 seconds (demo)`);
    console.log(`   • Format: 9:16 vertical`);
    console.log(`   • Resolution: 1080x1920`);
    console.log(`   • File: ${path.basename(videoPath)}\n`);

    console.log('✅ Process complete! Your ad is ready to post.\n');

    return finalPackage;

  } catch (error) {
    console.error('\n❌ Error generating video:', error.message);
    console.log('\n💡 Alternative: Use the script at AD-SCRIPT-ONLY.json');
    console.log('   and create the video manually at http://localhost:3010/ai-tools\n');
    throw error;
  }
}

// Run it
generateAdVideo()
  .then(() => {
    console.log('✅ Success!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
