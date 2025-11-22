import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';
import { getAnthropicClient } from '@/lib/anthropic';

// This endpoint should be called by Vercel Cron hourly
// Security: Verify CRON_SECRET header
export async function POST(request: NextRequest) {
  try {
    // 1. Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Cron] Unauthorized request - invalid secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting campaign post generation...');

    // 2. Initialize Supabase with service role for cron access
    const supabase = await createClient();

    // 3. Find all active campaigns where next_post_at is due
    const now = new Date().toISOString();
    const { data: dueCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .lte('next_post_at', now)
      .order('next_post_at', { ascending: true });

    if (campaignsError) {
      console.error('[Cron] Error fetching campaigns:', campaignsError);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    if (!dueCampaigns || dueCampaigns.length === 0) {
      console.log('[Cron] No campaigns due for posting');
      return NextResponse.json({
        success: true,
        message: 'No campaigns due',
        processed: 0
      });
    }

    console.log(`[Cron] Found ${dueCampaigns.length} campaigns due for posting`);

    // 4. Process each campaign
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      paused: 0,
      details: [] as any[]
    };

    for (const campaign of dueCampaigns) {
      results.processed++;
      console.log(`[Cron] Processing campaign: ${campaign.name} (${campaign.id})`);

      try {
        // Check user's token balance
        const balance = await tokenService.getBalance(campaign.user_id);
        const scriptCost = 7; // Cost for script generation

        if (balance < scriptCost) {
          // Insufficient tokens - pause campaign
          console.log(`[Cron] Insufficient tokens for campaign ${campaign.id}. Pausing...`);

          await supabase
            .from('campaigns')
            .update({
              status: 'paused',
              updated_at: new Date().toISOString()
            })
            .eq('id', campaign.id);

          results.paused++;
          results.details.push({
            campaignId: campaign.id,
            campaignName: campaign.name,
            status: 'paused',
            reason: 'Insufficient tokens'
          });

          continue;
        }

        // Generate AI script
        const scriptData = await generateCampaignScript(campaign, supabase);

        // Deduct tokens
        const deductionResult = await tokenService.deductTokens({
          userId: campaign.user_id,
          operation: 'script_generation',
          cost: scriptCost,
          description: `Campaign: ${campaign.name}`,
          metadata: {
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            niche: campaign.niche
          }
        });

        if (!deductionResult.success) {
          throw new Error('Token deduction failed');
        }

        // Save to campaign_posts table
        const { data: campaignPost, error: postError } = await supabase
          .from('campaign_posts')
          .insert({
            campaign_id: campaign.id,
            topic: scriptData.topic,
            script: scriptData.script,
            status: 'ready',
            scheduled_for: campaign.next_post_at,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (postError) {
          console.error('[Cron] Error saving campaign post:', postError);
          throw postError;
        }

        // Calculate next post time
        const nextPostAt = calculateNextPostTime(campaign);

        // Update campaign
        await supabase
          .from('campaigns')
          .update({
            next_post_at: nextPostAt.toISOString(),
            last_post_at: new Date().toISOString(),
            total_posts: campaign.total_posts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign.id);

        results.succeeded++;
        results.details.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          status: 'success',
          postId: campaignPost.id,
          nextPostAt: nextPostAt.toISOString()
        });

        console.log(`[Cron] ✅ Successfully generated post for campaign: ${campaign.name}`);

      } catch (error: any) {
        console.error(`[Cron] Error processing campaign ${campaign.id}:`, error);

        // Update campaign status to error
        await supabase
          .from('campaigns')
          .update({
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign.id);

        results.failed++;
        results.details.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('[Cron] Campaign processing complete:', results);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} campaigns`,
      results
    });

  } catch (error: any) {
    console.error('[Cron] Fatal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper: Generate script for campaign
async function generateCampaignScript(campaign: any, supabase: any) {
  const anthropic = getAnthropicClient();

  // Fetch brand package if campaign has one
  let brandContext = '';
  if (campaign.brand_package_id) {
    const { data: brandPackage } = await supabase
      .from('brand_packages')
      .select('*')
      .eq('id', campaign.brand_package_id)
      .single();

    if (brandPackage) {
      brandContext = `

BRAND IDENTITY:
- Brand: ${brandPackage.name}
${brandPackage.mission_statement ? `- Mission: ${brandPackage.mission_statement}` : ''}
- Voice: ${brandPackage.brand_voice || 'professional'}
- Personality: ${brandPackage.brand_personality || 'professional'}
- Target Audience: ${brandPackage.target_audience || 'general audience'}
${brandPackage.key_values?.length ? `- Key Values: ${brandPackage.key_values.join(', ')}` : ''}

IMPORTANT: Match this brand's voice and align with their mission.
`;
    }
  }

  // Build prompt based on campaign settings
  const prompt = `You are an expert ${campaign.creator_mode || 'ugc'} content creator.${brandContext}

Create a viral video script for a campaign about: "${campaign.niche}"

Campaign Details:
- Target Platforms: ${campaign.platforms.join(', ')}
- Content Style: ${campaign.content_style || 'engaging and authentic'}
- Target Audience: ${campaign.target_audience || 'general audience'}
${campaign.key_messages?.length > 0 ? `- Key Messages: ${campaign.key_messages.join(', ')}` : ''}

Format the response as JSON with this structure:
{
  "topic": "Specific topic for this video",
  "hook": "The first 3 seconds that grab attention",
  "script": "The full video script",
  "cta": "Call to action at the end",
  "hashtags": ["relevant", "hashtags"],
  "duration": "30-60 seconds"
}

Make it conversational, authentic, and optimized for high engagement.`;

  const completion = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    temperature: 0.8,
    system: 'You are an expert content creator who generates viral video scripts. Always respond with valid JSON only, no additional text.',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = completion.content[0]?.type === 'text' ? completion.content[0].text : null;

  if (!content) {
    throw new Error('No content generated from AI');
  }

  // Parse JSON response
  let scriptData;
  try {
    scriptData = JSON.parse(content);
  } catch (e) {
    // If Claude didn't return valid JSON, extract it
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      scriptData = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid JSON response from AI');
    }
  }

  return scriptData;
}

// Helper: Calculate next post time based on campaign frequency
function calculateNextPostTime(campaign: any): Date {
  const now = new Date();
  const nextPost = new Date(campaign.next_post_at);

  if (campaign.frequency === 'daily') {
    // Add 1 day
    nextPost.setDate(nextPost.getDate() + 1);
  } else if (campaign.frequency === '3x_week') {
    // Add ~2.3 days (Mon/Wed/Fri pattern)
    nextPost.setDate(nextPost.getDate() + 2);
  } else if (campaign.frequency === 'weekly') {
    // Add 7 days
    nextPost.setDate(nextPost.getDate() + 7);
  }

  // If calculated time is in the past, use next available slot from now
  if (nextPost < now) {
    const postTimes = campaign.post_times || ['09:00'];
    const [hours, minutes] = postTimes[0].split(':').map(Number);
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);

    if (next < now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  return nextPost;
}

// Allow GET for testing (remove in production)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  console.log('[Cron] Manual trigger via GET');
  return POST(request);
}
