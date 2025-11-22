/**
 * Generate DropFly Ad for SocialSync Empire
 * Creates brand package, campaign, and generates ad script directly
 */

const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

async function generateDropFlyAd() {
  console.log('🚀 Generating DropFly Ad for SocialSync Empire...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Just use the brand analysis to generate the ad directly
  console.log('📋 DropFly Brand Identity:\n');
  console.log('   Company: DropFly - Elite Development Company');
  console.log('   Tagline: "Building elite applications with precision and excellence"');
  console.log('   Colors: Purple (#9333ea), Blue (#3b82f6), Green (#10b981)');
  console.log('   Voice: Professional, Innovative, Empowering, Fast\n');

  console.log('🎯 Product: SocialSync Empire');
  console.log('   Description: AI-Powered Social Media Management Platform');
  console.log('   Automation: 10/10 - Fully autonomous content creation and posting');
  console.log('   Features: Script generation → Video creation → Multi-platform posting\n');

  // Generate ad script using Claude
  console.log('🤖 Generating ad script with Claude AI...\n');

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `You are a social media ad copywriter for DropFly, an elite development company.

**BRAND: DropFly**
- Company Type: Elite AI development company
- Tagline: "Building elite applications with precision and excellence"
- Mission: Empower entrepreneurs and businesses to launch sophisticated AI-powered applications without requiring a technical team
- Voice: Professional, Innovative, Empowering, Fast
- Colors: Purple (#9333ea), Blue (#3b82f6), Green (#10b981)
- Target Audience: Non-technical entrepreneurs, startup founders, small business owners aged 25-45
- Key Values: Innovation, Excellence, Speed, Accessibility, Empowerment

**PRODUCT: SocialSync Empire**
- Type: AI-Powered Social Media Management Platform
- Main Feature: 10/10 automation - fully autonomous from content creation to posting
- Process: AI generates script → AI creates video → AI posts to multiple platforms
- Platforms: TikTok, Instagram, YouTube, Facebook, Twitter, LinkedIn
- USP: Truly hands-free social media - no manual work required
- Benefit: Save 20+ hours per week on social media management

**CAMPAIGN GOAL**: Attract users to SocialSync Empire by highlighting its revolutionary automation

**TARGET PLATFORMS**: TikTok, Instagram Reels, YouTube Shorts

Create a compelling 45-60 second social media ad script that:

1. **Hook (5 seconds)**: Grab attention with a relatable pain point or surprising stat
2. **Problem (10 seconds)**: Show the struggle of manual social media management
3. **Solution (20 seconds)**: Introduce SocialSync Empire and its 10/10 automation
4. **Proof (10 seconds)**: Showcase what it does (writes → creates → posts)
5. **CTA (5 seconds)**: Strong call-to-action to try it

**TONE**:
- Start relatable and slightly frustrated (problem)
- Shift to excited and empowered (solution)
- End confident and inviting (CTA)

**KEY MESSAGES TO INCLUDE**:
- "10/10 automation" or "truly hands-free"
- Save time (20+ hours/week)
- Built by DropFly (credibility)
- AI does everything
- Multi-platform posting

**STYLE**:
- Fast-paced, energetic
- Use questions to engage
- Show transformation (before/after feeling)
- Make it aspirational

Format your response as JSON:
{
  "hook": "Opening line that grabs attention (1-2 sentences)",
  "script": "Main body with scene/visual descriptions in [brackets]. Tell a story. Show the transformation. Make it visual and engaging.",
  "cta": "Strong call-to-action (1-2 sentences)",
  "hashtags": ["5-8 relevant hashtags"],
  "music_style": "upbeat/epic/inspiring",
  "target_duration": 45-60,
  "visual_notes": "Key visual elements to include in the video"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Parse the JSON response
    const scriptMatch = responseText.match(/\{[\s\S]*\}/);
    if (scriptMatch) {
      const adScript = JSON.parse(scriptMatch[0]);

      console.log('✅ Ad Script Generated!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🎯 HOOK:\n');
      console.log(adScript.hook);
      console.log('\n📜 SCRIPT:\n');
      console.log(adScript.script);
      console.log('\n📣 CALL-TO-ACTION:\n');
      console.log(adScript.cta);
      console.log('\n#️⃣ HASHTAGS:\n');
      console.log(adScript.hashtags.join(', '));
      console.log(`\n🎵 MUSIC: ${adScript.music_style}`);
      console.log(`⏱️  DURATION: ${adScript.target_duration} seconds`);
      console.log('\n🎬 VISUAL NOTES:\n');
      console.log(adScript.visual_notes);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Save to file
      const fs = require('fs');
      const adData = {
        brand: {
          name: 'DropFly',
          tagline: 'Building elite applications with precision and excellence',
          colors: {
            primary: '#9333ea',
            secondary: '#3b82f6',
            accent: '#10b981'
          },
          voice: 'professional, innovative, empowering, fast'
        },
        product: {
          name: 'SocialSync Empire',
          description: 'AI-Powered Social Media Management Platform',
          automation_level: '10/10',
          key_features: [
            'AI script generation',
            'Automated video creation',
            'Multi-platform posting',
            'Brand-aware content',
            'Truly hands-free'
          ]
        },
        ad_script: adScript,
        generated_at: new Date().toISOString(),
        platforms: ['tiktok', 'instagram', 'youtube'],
        target_audience: 'Entrepreneurs, startup founders, content creators, small business owners aged 25-45'
      };

      fs.writeFileSync(
        'DROPFLY-SOCIALSYNC-AD.json',
        JSON.stringify(adData, null, 2)
      );

      console.log('\n💾 Ad saved to: DROPFLY-SOCIALSYNC-AD.json');
      console.log('\n📋 NEXT STEPS:');
      console.log('   1. Review the ad script above');
      console.log('   2. Use this script to create a video');
      console.log('   3. Post to TikTok, Instagram, YouTube');
      console.log('   4. Track engagement and conversions');
      console.log('\n✨ This ad is ready to attract users to SocialSync Empire!');

      return adData;
    } else {
      throw new Error('Could not parse JSON from Claude response');
    }

  } catch (error) {
    console.error('❌ Error generating script:', error.message);
    throw error;
  }
}

// Run the script
generateDropFlyAd()
  .then(() => {
    console.log('\n✅ Ad generation complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
