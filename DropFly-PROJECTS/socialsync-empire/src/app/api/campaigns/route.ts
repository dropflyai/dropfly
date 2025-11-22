import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';

// GET /api/campaigns - List user's campaigns
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('[Campaigns GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      niche,
      description,
      platforms,
      frequency,
      post_times,
      timezone,
      creator_mode,
      video_engine,
      video_duration_min,
      video_duration_max,
      content_style,
      target_audience,
      key_messages
    } = body;

    // Validation
    if (!name || !niche || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Name, niche, and at least one platform are required' },
        { status: 400 }
      );
    }

    if (!frequency || !post_times || post_times.length === 0) {
      return NextResponse.json(
        { error: 'Frequency and post times are required' },
        { status: 400 }
      );
    }

    // Calculate token requirements
    const postsPerMonth = frequency === 'daily' ? 30 : frequency === '3x_week' ? 12 : 4;
    const tokensPerPost = 7; // MVP: Just script generation
    const monthlyTokens = postsPerMonth * tokensPerPost;

    // Check if user has enough tokens for at least 1 week
    const weeklyTokens = Math.ceil(monthlyTokens / 4);
    const balance = await tokenService.getBalance(user.id);

    if (balance < weeklyTokens) {
      return NextResponse.json({
        error: 'Insufficient tokens',
        required: weeklyTokens,
        current: balance,
        message: `You need at least ${weeklyTokens} tokens to run this campaign for 1 week`
      }, { status: 403 });
    }

    // Calculate next post time
    const nextPostAt = new Date();
    const [hours, minutes] = post_times[0].split(':').map(Number);
    nextPostAt.setHours(hours, minutes, 0, 0);
    if (nextPostAt < new Date()) {
      nextPostAt.setDate(nextPostAt.getDate() + 1);
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name,
        niche,
        description,
        platforms,
        frequency,
        post_times,
        timezone: timezone || 'America/New_York',
        creator_mode: creator_mode || 'ugc',
        video_engine: video_engine || 'kling-2.1',
        video_duration_min: video_duration_min || 30,
        video_duration_max: video_duration_max || 60,
        content_style,
        target_audience,
        key_messages,
        status: 'active',
        next_post_at: nextPostAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      campaign,
      estimated_monthly_cost: monthlyTokens,
      estimated_weekly_cost: weeklyTokens
    });

  } catch (error: any) {
    console.error('[Campaigns POST] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
