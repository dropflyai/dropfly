import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAyrshareClient } from '@/lib/ayrshare/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, platforms, mediaUrls, scheduleDate } = body;

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content and platforms are required' },
        { status: 400 }
      );
    }

    // Post to social media via Ayrshare
    const ayrshare = getAyrshareClient();
    const result = await ayrshare.post({
      post: content,
      platforms,
      mediaUrls,
      scheduleDate,
    });

    // Save to database
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

    return NextResponse.json({
      success: true,
      post: savedPost,
      ayrshareResult: result,
    });
  } catch (error: any) {
    console.error('Social post error:', error);
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
