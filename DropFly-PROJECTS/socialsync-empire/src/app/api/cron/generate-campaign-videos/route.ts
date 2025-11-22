import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Find posts with scripts ready but no video
    const { data: readyPosts } = await supabase
      .from('campaign_posts')
      .select('*, campaigns!inner(*)')
      .eq('status', 'ready')
      .is('video_url', null)
      .limit(10); // Process 10 at a time

    if (!readyPosts?.length) {
      return NextResponse.json({
        success: true,
        message: 'No posts ready for video generation',
        processed: 0
      });
    }

    const results = {
      processed: readyPosts.length,
      succeeded: 0,
      failed: 0
    };

    for (const post of readyPosts) {
      try {
        // Get brand colors if available
        let brandColors = null;
        if (post.campaigns.brand_package_id) {
          const { data: brand } = await supabase
            .from('brand_packages')
            .select('primary_color, secondary_color, accent_color')
            .eq('id', post.campaigns.brand_package_id)
            .single();
          brandColors = brand;
        }

        // Call video generation API
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/ai/generate-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: post.script,
            campaign_post_id: post.id,
            brand_colors: brandColors
          })
        });

        if (response.ok) {
          results.succeeded++;
        } else {
          results.failed++;
        }

      } catch (error) {
        results.failed++;
        console.error(`Failed to generate video for post ${post.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
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
