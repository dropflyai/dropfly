/**
 * Complete Ad Generation Process
 *
 * This script does EVERYTHING:
 * 1. Creates test user
 * 2. Creates DropFly brand package
 * 3. Creates SocialSync Empire campaign
 * 4. Generates ad script
 * 5. Generates video
 * 6. Saves final ad package
 */

const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const fal = require('@fal-ai/serverless-client');
const fs = require('fs');
const https = require('https');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configure FAL client
fal.config({
  credentials: process.env.FAL_API_KEY
});

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

async function completeAdGeneration() {
  console.log('🚀 COMPLETE AD GENERATION PROCESS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // STEP 1: Get or create user
  console.log('👤 STEP 1: Setting up test user...');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  let userId;
  if (profiles && profiles.length > 0) {
    userId = profiles[0].id;
    console.log(`✅ Using existing user: ${userId}\n`);
  } else {
    console.log('❌ No user found. Please sign up at http://localhost:3010 first.\n');
    process.exit(1);
  }

  // STEP 2: Create DropFly brand package
  console.log('📦 STEP 2: Creating DropFly brand package...');

  const brandData = {
    user_id: userId,
    name: 'DropFly',
    tagline: 'Building Elite Applications with Precision and Excellence',
    mission_statement: 'DropFly empowers entrepreneurs and businesses to launch sophisticated AI-powered applications without requiring a technical team. We democratize access to elite software development, enabling anyone with a vision to compete in the modern digital economy.',
    brand_voice: 'professional',
    brand_personality: 'Innovative, Professional, Fast, Empowering, Reliable',
    target_audience: 'Entrepreneurs, startup founders, small business owners, and non-technical founders aged 25-45 who want to build AI apps quickly',
    key_values: 'Innovation, Excellence, Speed, Accessibility, Empowerment',
    primary_color: '#9333ea',
    secondary_color: '#3b82f6',
    accent_color: '#10b981',
    is_default: true
  };

  let brand;
  const { data: newBrand, error: brandError } = await supabase
    .from('brand_packages')
    .insert([brandData])
    .select()
    .single();

  if (brandError) {
    if (brandError.code === '23505') {
      // Brand already exists, get it
      const { data: existingBrand } = await supabase
        .from('brand_packages')
        .select('*')
        .eq('user_id', userId)
        .eq('name', 'DropFly')
        .single();

      if (existingBrand) {
        console.log('✅ Using existing DropFly brand package\n');
        brand = existingBrand;
      }
    } else {
      console.error('❌ Error creating brand:', brandError.message);
      process.exit(1);
    }
  } else {
    console.log('✅ DropFly brand package created\n');
    brand = newBrand;
  }

  // STEP 3: Create campaign
  console.log('📢 STEP 3: Creating SocialSync Empire campaign...');

  const campaignData = {
    user_id: userId,
    brand_package_id: brand.id,
    name: 'SocialSync Empire Launch Campaign',
    description: 'Promote SocialSync Empire - the world\'s first 10/10 automation social media platform that handles everything from script writing to video creation to multi-platform posting',
    niche: 'SaaS, Social Media Marketing, AI Automation, Content Creation, Productivity Tools',
    platforms: ['tiktok', 'instagram', 'youtube'],
    frequency: 'daily',
    post_times: ['09:00', '15:00', '19:00'],
    status: 'active'
  };

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert([campaignData])
    .select()
    .single();

  if (campaignError) {
    console.error('❌ Error creating campaign:', campaignError.message);
    process.exit(1);
  }

  console.log('✅ Campaign created successfully\n');

  // STEP 4: Generate ad script
  console.log('🤖 STEP 4: Generating ad script with AI...');

  const scriptPrompt = `You are a social media ad copywriter for DropFly, an elite development company.

**BRAND: DropFly**
- Tagline: "Building elite applications with precision and excellence"
- Mission: Empower entrepreneurs to launch AI-powered apps without technical teams
- Voice: Professional, Innovative, Empowering, Fast
- Colors: Purple (#9333ea), Blue (#3b82f6), Green (#10b981)

**PRODUCT: SocialSync Empire**
- The world's first 10/10 automation social media platform
- AI generates script → AI creates video → AI posts to 6 platforms
- Saves 20+ hours per week
- Truly hands-free automation

Create a compelling 45-50 second ad script for TikTok/Instagram Reels.

Format as JSON:
{
  "hook": "Attention-grabbing opening (1 sentence)",
  "script": "Main body with visual directions in [brackets]",
  "cta": "Strong call-to-action",
  "hashtags": ["5-8 hashtags"],
  "visual_style": "Description of video style and aesthetics"
}`;

  const scriptMessage = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: scriptPrompt
    }]
  });

  const scriptResponse = scriptMessage.content[0].text;
  const scriptMatch = scriptResponse.match(/\{[\s\S]*\}/);

  if (!scriptMatch) {
    console.error('❌ Could not parse script response');
    process.exit(1);
  }

  const adScript = JSON.parse(scriptMatch[0]);
  console.log('✅ Ad script generated\n');

  // STEP 5: Create campaign post
  console.log('💾 STEP 5: Saving campaign post to database...');

  const postData = {
    campaign_id: campaign.id,
    user_id: userId,
    script: {
      hook: adScript.hook,
      script: adScript.script,
      cta: adScript.cta
    },
    status: 'ready',
    scheduled_for: new Date().toISOString()
  };

  const { data: post, error: postError } = await supabase
    .from('campaign_posts')
    .insert([postData])
    .select()
    .single();

  if (postError) {
    console.error('❌ Error creating post:', postError.message);
    process.exit(1);
  }

  console.log('✅ Campaign post created\n');

  // STEP 6: Generate video
  console.log('🎬 STEP 6: Generating video with FAL.AI...');
  console.log('   (This may take 1-2 minutes...)\n');

  const videoPrompt = `Professional social media ad for SocialSync Empire:

${adScript.hook}

${adScript.script}

${adScript.cta}

Style: Modern, sleek, professional. Purple and blue gradient overlays. Fast-paced cuts showing before/after transformation. Show frustrated entrepreneur becoming successful. Display UI elements and automation in action.`;

  try {
    const result = await fal.subscribe('fal-ai/minimax-video/image-to-video', {
      input: {
        prompt: videoPrompt,
        duration: '5', // 5 seconds
        aspect_ratio: '9:16' // Vertical for social media
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log(`   Progress: ${update.logs?.[update.logs.length - 1]?.message || 'Generating...'}`);
        }
      }
    });

    if (result.data && result.data.video) {
      const videoUrl = result.data.video.url;
      console.log('\n✅ Video generated successfully!');
      console.log(`   Video URL: ${videoUrl}\n`);

      // Download the video
      console.log('📥 STEP 7: Downloading video...');
      const videoDir = path.join(__dirname, '..', 'public', 'ads');
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }

      const videoPath = path.join(videoDir, `dropfly-socialsync-ad-${Date.now()}.mp4`);
      await downloadVideo(videoUrl, videoPath);
      console.log(`✅ Video downloaded to: ${videoPath}\n`);

      // Update post with video URL
      await supabase
        .from('campaign_posts')
        .update({
          video_url: videoUrl,
          status: 'video_ready'
        })
        .eq('id', post.id);

      // STEP 8: Create final package
      console.log('📦 STEP 8: Creating final ad package...');

      const finalAd = {
        brand: {
          name: brand.name,
          tagline: brand.tagline,
          colors: {
            primary: brand.primary_color,
            secondary: brand.secondary_color,
            accent: brand.accent_color
          }
        },
        product: {
          name: 'SocialSync Empire',
          description: 'AI-Powered Social Media Management Platform',
          automation_level: '10/10'
        },
        campaign: {
          id: campaign.id,
          name: campaign.name,
          platforms: campaign.platforms
        },
        ad_script: adScript,
        video: {
          url: videoUrl,
          local_path: videoPath,
          duration: 5,
          aspect_ratio: '9:16',
          format: 'mp4'
        },
        post: {
          id: post.id,
          status: 'video_ready',
          created_at: post.created_at
        },
        generated_at: new Date().toISOString(),
        ready_to_post: true
      };

      const adPackagePath = path.join(__dirname, '..', 'DROPFLY-SOCIALSYNC-FINAL-AD.json');
      fs.writeFileSync(adPackagePath, JSON.stringify(finalAd, null, 2));

      console.log('✅ Final ad package created\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🎉 SUCCESS! YOUR AD IS COMPLETE!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('📋 AD SCRIPT:\n');
      console.log(`🎯 Hook: ${adScript.hook}\n`);
      console.log(`📜 Script:\n${adScript.script}\n`);
      console.log(`📣 CTA: ${adScript.cta}\n`);
      console.log(`#️⃣  Hashtags: ${adScript.hashtags.join(', ')}\n`);

      console.log('🎬 VIDEO:\n');
      console.log(`   URL: ${videoUrl}`);
      console.log(`   Local: ${videoPath}`);
      console.log(`   Format: 9:16 vertical (perfect for TikTok/Instagram Reels)\n`);

      console.log('📦 FILES CREATED:\n');
      console.log(`   ✅ ${videoPath}`);
      console.log(`   ✅ ${adPackagePath}\n`);

      console.log('📊 DATABASE:\n');
      console.log(`   ✅ Brand Package ID: ${brand.id}`);
      console.log(`   ✅ Campaign ID: ${campaign.id}`);
      console.log(`   ✅ Campaign Post ID: ${post.id}\n`);

      console.log('🚀 NEXT STEPS:\n');
      console.log('   1. Watch the video: ' + videoPath);
      console.log('   2. Review the ad package: DROPFLY-SOCIALSYNC-FINAL-AD.json');
      console.log('   3. Post to TikTok, Instagram, YouTube\n');
      console.log('   Or use the automation: Trigger /api/cron/publish-campaign-posts\n');

      return finalAd;

    } else {
      throw new Error('No video URL in response');
    }

  } catch (error) {
    console.error('❌ Error generating video:', error.message);
    console.log('\n⚠️  Video generation failed, but script is ready!\n');
    console.log('📋 You can still use the ad script:\n');
    console.log(`Hook: ${adScript.hook}`);
    console.log(`Script: ${adScript.script}`);
    console.log(`CTA: ${adScript.cta}\n`);

    // Save script-only package
    const scriptPackage = {
      brand: {
        name: brand.name,
        tagline: brand.tagline
      },
      ad_script: adScript,
      campaign: {
        id: campaign.id,
        name: campaign.name
      },
      generated_at: new Date().toISOString(),
      video_generation_failed: true,
      error: error.message
    };

    fs.writeFileSync('DROPFLY-SOCIALSYNC-SCRIPT.json', JSON.stringify(scriptPackage, null, 2));
    console.log('✅ Script saved to: DROPFLY-SOCIALSYNC-SCRIPT.json\n');
  }
}

// Run the complete process
completeAdGeneration()
  .then(() => {
    console.log('✅ Complete ad generation finished!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
