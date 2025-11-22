import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AnalyticsService } from '@/lib/analytics/analytics-service';

/**
 * GET /api/user/stats
 * Returns REAL user statistics from social media platforms
 * Analytics data comes from Ayrshare API (real-time social media data)
 * Content counts come from database
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get content count by type
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, type')
      .eq('user_id', user.id);

    if (contentError) {
      console.error('Error fetching content:', contentError);
    }

    const totalFiles = content?.length || 0;
    const videoCount = content?.filter(c => c.type === 'video').length || 0;
    const imageCount = content?.filter(c => c.type === 'image').length || 0;

    // Get avatar count (from profiles or content)
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    const avatarCount = profile?.avatar_url ? 1 : 0;

    // ✨ REAL-TIME ANALYTICS FROM SOCIAL MEDIA PLATFORMS ✨
    // Fetch analytics from Ayrshare API (views, engagement, reach from actual social platforms)
    const analyticsData = await AnalyticsService.getUserAnalytics(user.id, 7);

    console.log('[Stats API] Real-time analytics from social platforms:', {
      views: analyticsData.views,
      engagement: analyticsData.engagement,
      reach: analyticsData.reach,
    });

    return NextResponse.json({
      mediaLibrary: {
        total: totalFiles,
        videos: videoCount,
        images: imageCount,
      },
      avatars: {
        count: avatarCount,
        max: 2, // Based on plan
      },
      analytics: {
        views: analyticsData.views,
        engagement: analyticsData.engagement,
        reach: analyticsData.reach,
        avgRating: analyticsData.avgRating,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Get stats error:', err);
    return NextResponse.json(
      { error: 'Failed to get stats', details: err.message },
      { status: 500 }
    );
  }
}
