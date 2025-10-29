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
    const { content, platforms, mediaUrls, scheduleDate } = body;

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content and platforms are required' },
        { status: 400 }
      );
    }

    // 3. Determine token cost based on number of platforms
    const operation = platforms.length > 1 ? 'social_post_multi_platform' : 'social_post';
    const tokenCost = tokenService.calculateCost(operation);

    console.log(`[Social Post] Posting to ${platforms.length} platform(s), Cost: ${tokenCost} tokens`);

    // 4. Deduct tokens BEFORE posting
    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation,
      cost: tokenCost,
      description: `Social post to ${platforms.join(', ')}`,
      metadata: {
        platforms,
        content: content.substring(0, 100),
        hasMedia: !!mediaUrls && mediaUrls.length > 0,
        scheduled: !!scheduleDate,
      }
    });

    if (!deductionResult.success) {
      return NextResponse.json(
        {
          error: deductionResult.error || 'Insufficient tokens',
          errorCode: deductionResult.errorCode
        },
        { status: 403 }
      );
    }

    try {
      // 5. Post to social media via Ayrshare
      const ayrshare = getAyrshareClient();
      const result = await ayrshare.post({
        post: content,
        platforms,
        mediaUrls,
        scheduleDate,
      });

      // 6. Save to database
      const { data: savedPost, error: dbError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          platforms,
          media_urls: mediaUrls || [],
          scheduled_for: scheduleDate || new Date().toISOString(),
          ayrshare_id: result.id,
          status: scheduleDate ? 'scheduled' : 'published',
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Don't fail the request if DB save fails
      }

      // 7. Return success
      return NextResponse.json({
        success: true,
        post: savedPost,
        ayrshareResult: result,
        tokensUsed: tokenCost,
        newBalance: deductionResult.newBalance,
      });

    } catch (apiError: any) {
      console.error('[Social Post] Ayrshare API Error:', apiError);

      // Refund tokens on API failure
      await tokenService.refundTokens({
        userId: user.id,
        amount: tokenCost,
        reason: 'Social posting API failure',
        originalOperation: operation
      });

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
