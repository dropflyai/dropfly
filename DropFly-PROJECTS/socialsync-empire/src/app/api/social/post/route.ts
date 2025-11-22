import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAyrshareClient } from '@/lib/ayrshare/client';
import { tokenService } from '@/lib/tokens/token-service';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const body = await request.json();
    const {
      content,
      platforms,
      mediaUrls,
      scheduleDate,
      campaign_post_id, // NEW: For campaign posts
      video_url // NEW: Alias for mediaUrls
    } = body;

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content and platforms are required' },
        { status: 400 }
      );
    }

    // 3. Calculate token cost: 8 tokens per platform
    const tokenCost = platforms.length * 8;

    console.log(`[Social Post] Posting to ${platforms.length} platform(s), Cost: ${tokenCost} tokens`);

    // 4. Deduct tokens BEFORE posting
    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation: 'social_posting',
      cost: tokenCost,
      description: `Post to ${platforms.join(', ')}`,
      metadata: {
        platforms,
        content: content.substring(0, 100),
        hasMedia: !!(mediaUrls || video_url),
        scheduled: !!scheduleDate,
        campaign_post_id,
      }
    });

    if (!deductionResult.success) {
      return NextResponse.json(
        {
          error: deductionResult.error || 'Insufficient tokens',
          errorCode: deductionResult.errorCode,
          required: tokenCost
        },
        { status: 403 }
      );
    }

    try {
      // 5. Post to social media via Ayrshare
      const ayrshare = getAyrshareClient();
      const mediaToUse = mediaUrls || (video_url ? [video_url] : undefined);

      const result = await ayrshare.post({
        post: content,
        platforms,
        mediaUrls: mediaToUse,
        scheduleDate,
      });

      // 6. If this is a campaign post, update campaign_posts table
      if (campaign_post_id) {
        const { error: updateError } = await supabase
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
          .eq('id', campaign_post_id);

        if (updateError) {
          console.error('[Social Post] Error updating campaign_posts:', updateError);
        }
      } else {
        // 6b. Save to posts table (for non-campaign posts)
        const { data: savedPost, error: dbError } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            content,
            platforms,
            media_urls: mediaToUse || [],
            scheduled_for: scheduleDate || new Date().toISOString(),
            ayrshare_id: result.id,
            status: scheduleDate ? 'scheduled' : 'published',
          })
          .select()
          .single();

        if (dbError) {
          console.error('[Social Post] Database error:', dbError);
          // Don't fail the request if DB save fails
        }
      }

      // 7. Return success
      return NextResponse.json({
        success: true,
        postIds: result.postIds,
        tokensUsed: tokenCost,
        newBalance: deductionResult.newBalance,
      });

    } catch (apiError: any) {
      console.error('[Social Post] Ayrshare API Error:', apiError);

      // Refund tokens on API failure
      if (deductionResult.transaction?.id) {
        await tokenService.refundTokens(
          user.id,
          deductionResult.transaction.id,
          'Social posting failed'
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to post to social media. Your tokens have been refunded.',
          details: apiError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[Social Post] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to post to social media',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's posts from database
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
