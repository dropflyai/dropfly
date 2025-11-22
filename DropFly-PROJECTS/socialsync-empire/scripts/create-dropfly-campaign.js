/**
 * Create DropFly Brand Package and SocialSync Empire Campaign
 *
 * This script creates:
 * 1. A brand package for DropFly
 * 2. A campaign to promote SocialSync Empire
 * 3. Generates an initial ad script
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createDropFlyCampaign() {
  console.log('🚀 Creating DropFly Campaign for SocialSync Empire...\n');

  // Initialize Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get or create a test user
  let userId;

  // Check if test user exists
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (profiles && profiles.length > 0) {
    userId = profiles[0].id;
    console.log(`✅ Using existing user: ${profiles[0].email || profiles[0].id}`);
  } else {
    console.log('❌ No user found. Please sign up first at http://localhost:3010');
    process.exit(1);
  }

  // Step 1: Create DropFly Brand Package
  console.log('\n📦 Creating DropFly brand package...');

  const brandPackage = {
    user_id: userId,
    name: 'DropFly',
    tagline: 'Build AI-Powered Apps in Minutes',
    mission_statement: 'DropFly empowers entrepreneurs and businesses to create sophisticated AI-powered applications without coding. Our mission is to democratize app development and enable anyone to turn their ideas into reality.',
    brand_voice: 'professional',
    brand_personality: 'Innovative, Empowering, Fast, Reliable, User-Friendly',
    target_audience: 'Entrepreneurs, startup founders, small business owners, and non-technical founders aged 25-45 who want to build AI apps quickly',
    key_values: 'Innovation, Accessibility, Speed, Quality, Empowerment',
    primary_color: '#9333ea', // Purple
    secondary_color: '#3b82f6', // Blue
    accent_color: '#10b981', // Green
    is_default: true
  };

  const { data: brand, error: brandError } = await supabase
    .from('brand_packages')
    .insert([brandPackage])
    .select()
    .single();

  if (brandError) {
    console.error('❌ Error creating brand:', brandError.message);
    process.exit(1);
  }

  console.log(`✅ Brand package created: ${brand.name}`);
  console.log(`   ID: ${brand.id}`);
  console.log(`   Voice: ${brand.brand_voice}`);
  console.log(`   Colors: ${brand.primary_color}, ${brand.secondary_color}, ${brand.accent_color}`);

  // Step 2: Create SocialSync Empire Campaign
  console.log('\n📢 Creating SocialSync Empire campaign...');

  const campaign = {
    user_id: userId,
    brand_package_id: brand.id,
    name: 'SocialSync Empire Launch',
    description: 'Promote SocialSync Empire - an automated social media content creation and posting platform that helps businesses maintain consistent social media presence',
    niche: 'SaaS, Social Media Marketing, AI Automation, Content Creation',
    platforms: ['tiktok', 'instagram', 'youtube'],
    frequency: 'daily',
    post_times: ['09:00', '15:00', '19:00'],
    status: 'active',
    last_posted_at: null
  };

  const { data: campaignData, error: campaignError } = await supabase
    .from('campaigns')
    .insert([campaign])
    .select()
    .single();

  if (campaignError) {
    console.error('❌ Error creating campaign:', campaignError.message);
    process.exit(1);
  }

  console.log(`✅ Campaign created: ${campaignData.name}`);
  console.log(`   ID: ${campaignData.id}`);
  console.log(`   Platforms: ${campaignData.platforms.join(', ')}`);
  console.log(`   Frequency: ${campaignData.frequency}`);
  console.log(`   Post times: ${campaignData.post_times.join(', ')}`);

  // Step 3: Generate initial ad script using Claude
  console.log('\n🤖 Generating ad script with Claude AI...');

  const Anthropic = require('@anthropic-ai/sdk');
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `You are a social media ad copywriter for ${brand.name}.

Brand Details:
- Name: ${brand.name}
- Tagline: ${brand.tagline}
- Mission: ${brand.mission_statement}
- Voice: ${brand.brand_voice}
- Personality: ${brand.brand_personality}
- Target Audience: ${brand.target_audience}
- Key Values: ${brand.key_values}

Campaign:
- Product: SocialSync Empire
- Description: ${campaign.description}
- Niche: ${campaign.niche}
- Platforms: ${campaign.platforms.join(', ')}

Create a compelling 30-60 second social media ad script for SocialSync Empire that will attract users.

The ad should:
1. Start with an attention-grabbing hook (3-5 seconds)
2. Present the problem and solution (15-20 seconds)
3. Show key benefits and features (20-30 seconds)
4. End with a strong call-to-action (5-10 seconds)

Format your response as JSON:
{
  "hook": "Opening hook that grabs attention",
  "script": "Main body of the ad script with scene descriptions",
  "cta": "Call to action",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "music_style": "upbeat/dramatic/calm",
  "target_duration": 30-60
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    console.log('\n📝 Generated Ad Script:\n');
    console.log(responseText);

    // Parse the JSON response
    const scriptMatch = responseText.match(/\{[\s\S]*\}/);
    if (scriptMatch) {
      const scriptData = JSON.parse(scriptMatch[0]);

      // Step 4: Create campaign post with the script
      console.log('\n💾 Saving campaign post...');

      const campaignPost = {
        campaign_id: campaignData.id,
        user_id: userId,
        script: scriptData,
        status: 'ready',
        scheduled_for: new Date().toISOString()
      };

      const { data: post, error: postError } = await supabase
        .from('campaign_posts')
        .insert([campaignPost])
        .select()
        .single();

      if (postError) {
        console.error('❌ Error creating post:', postError.message);
      } else {
        console.log(`✅ Campaign post created with ID: ${post.id}`);
        console.log(`   Status: ${post.status}`);

        console.log('\n🎬 Ad Content Preview:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n🎯 HOOK:\n${scriptData.hook}\n`);
        console.log(`📜 SCRIPT:\n${scriptData.script}\n`);
        console.log(`📣 CTA:\n${scriptData.cta}\n`);
        console.log(`#️⃣ HASHTAGS:\n${scriptData.hashtags?.join(', ') || 'N/A'}\n`);
        console.log(`🎵 MUSIC STYLE: ${scriptData.music_style || 'N/A'}`);
        console.log(`⏱️ TARGET DURATION: ${scriptData.target_duration || 'N/A'} seconds`);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
    }

  } catch (error) {
    console.error('❌ Error generating script:', error.message);
  }

  // Summary
  console.log('\n\n✨ Setup Complete! ✨\n');
  console.log('📊 Summary:');
  console.log(`   ✅ Brand: ${brand.name}`);
  console.log(`   ✅ Campaign: ${campaignData.name}`);
  console.log(`   ✅ Ad script generated and saved`);
  console.log(`\n🎯 Next Steps:`);
  console.log(`   1. View campaign at: http://localhost:3010/campaigns`);
  console.log(`   2. Generate video: Trigger /api/cron/generate-campaign-videos`);
  console.log(`   3. Post to social: Trigger /api/cron/publish-campaign-posts`);
  console.log(`\n💡 Or let the automation run on schedule!`);
}

// Run the script
createDropFlyCampaign()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
