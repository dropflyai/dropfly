import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This endpoint should be called by Vercel Cron every 30 minutes
// Security: Verify CRON_SECRET header
export async function POST(request: NextRequest) {
  try {
    // 1. Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Publish Cron] Unauthorized request - invalid secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Publish Cron] Starting campaign post publishing...');

    // 2. Initialize Supabase
    const supabase = await createClient();

    // 3. Find posts ready to publish (status='video_ready' and no published_at)
    const { data: readyPosts, error: postsError } = await supabase
      .from('campaign_posts')
      .select('*, campaigns!inner(*)')
      .eq('status', 'video_ready')
      .is('published_at', null)
      .limit(20);

    if (postsError) {
      console.error('[Publish Cron] Error fetching posts:', postsError);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    if (!readyPosts || readyPosts.length === 0) {
      console.log('[Publish Cron] No posts ready to publish');
      return NextResponse.json({
        success: true,
        message: 'No posts ready to publish',
        processed: 0
      });
    }

    console.log(`[Publish Cron] Found ${readyPosts.length} posts ready to publish`);

    // 4. Process each post
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      details: [] as any[]
    };

    for (const post of readyPosts) {
      results.processed++;
      console.log(`[Publish Cron] Publishing post: ${post.id}`);

      try {
        // Build caption from script
        const script = post.script;
        const caption = `${script.hook}\n\n${script.cta}\n\n${script.hashtags.map((h: string) => `#${h}`).join(' ')}`;

        // Instead of calling the API endpoint, we'll use the internal logic directly
        // to avoid authentication issues with cron jobs
        const { tokenService } = await import('@/lib/tokens/token-service');
        const { getAyrshareClient } = await import('@/lib/ayrshare/client');

        // Calculate token cost: 8 tokens per platform
        const platforms = post.campaigns.platforms;
        const tokenCost = platforms.length * 8;

        // Deduct tokens
        const deductionResult = await tokenService.deductTokens({
          userId: post.campaigns.user_id,
          operation: 'social_posting',
          cost: tokenCost,
          description: `Auto-publish to ${platforms.join(', ')}`,
          metadata: {
            campaign_post_id: post.id,
            campaign_id: post.campaign_id,
            platforms
          }
        });

        if (!deductionResult.success) {
          throw new Error(`Token deduction failed: ${deductionResult.error}`);
        }

        try {
          // Post to social media via Ayrshare
          const ayrshare = getAyrshareClient();
          const result = await ayrshare.post({
            post: caption,
            platforms,
            mediaUrls: post.video_url ? [post.video_url] : undefined,
          });

          // Update campaign post status
          await supabase
            .from('campaign_posts')
            .update({
              status: 'published',
              published_at: new Date().toISOString(),
              metadata: {
                ayrshare_result: result,
                platforms,
                post_ids: result.postIds,
              }
            })
            .eq('id', post.id);

          results.succeeded++;
          results.details.push({
            postId: post.id,
            campaignId: post.campaign_id,
            status: 'success',
            platforms,
            postIds: result.postIds,
            tokensUsed: tokenCost
          });
          console.log(`[Publish Cron] Successfully published post ${post.id}`);

        } catch (apiError: any) {
          // Refund tokens on failure
          if (deductionResult.transaction?.id) {
            await tokenService.refundTokens(
              post.campaigns.user_id,
              deductionResult.transaction.id,
              'Social posting failed in cron'
            );
          }
          throw apiError;
        }

      } catch (error: any) {
        results.failed++;
        results.details.push({
          postId: post.id,
          campaignId: post.campaign_id,
          status: 'error',
          error: error.message
        });
        console.error(`[Publish Cron] Error publishing post ${post.id}:`, error);
      }
    }

    console.log('[Publish Cron] Publishing complete:', results);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} posts`,
      results
    });

  } catch (error: any) {
    console.error('[Publish Cron] Fatal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for testing (remove in production)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  console.log('[Publish Cron] Manual trigger via GET');
  return POST(request);
}
