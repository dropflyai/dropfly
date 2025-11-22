import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, campaign_post_id, brand_colors, engine, duration, tokenCost: clientTokenCost } = await request.json();

    // Token cost for video generation - use client-provided cost or fallback to default
    // Client sends calculated cost based on engine and duration with 70% margin
    const tokenCost = clientTokenCost || 75;

    // Deduct tokens
    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation: 'video_generation',
      cost: tokenCost,
      description: `Video generation (${engine || 'auto'}, ${duration || 6}s)`,
      metadata: {
        campaign_post_id,
        engine,
        duration,
        tokenCost
      }
    });

    if (!deductionResult.success) {
      return NextResponse.json({
        error: 'Insufficient tokens',
        required: tokenCost
      }, { status: 403 });
    }

    try {
      // Call FAL.AI API
      const falResponse = await fetch('https://fal.run/fal-ai/fast-sdxl', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.FAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: buildVideoPrompt(script, brand_colors),
          num_inference_steps: 25,
          guidance_scale: 7.5,
          num_images: 1
        })
      });

      const videoData = await falResponse.json();

      // Upload to Supabase Storage
      const videoBlob = await fetch(videoData.images[0].url).then(r => r.blob());
      const fileName = `${user.id}/${campaign_post_id}/${Date.now()}.mp4`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-videos')
        .upload(fileName, videoBlob, {
          contentType: 'video/mp4'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-videos')
        .getPublicUrl(fileName);

      // Update campaign post with video URL
      await supabase
        .from('campaign_posts')
        .update({
          video_url: publicUrl,
          status: 'video_ready'
        })
        .eq('id', campaign_post_id);

      return NextResponse.json({
        success: true,
        video_url: publicUrl,
        tokensUsed: tokenCost
      });

    } catch (apiError: any) {
      // Refund tokens on failure
      if (deductionResult.transaction?.id) {
        await tokenService.refundTokens(
          user.id,
          deductionResult.transaction.id,
          'Video generation failed'
        );
      }
      throw apiError;
    }

  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Video generation failed'
    }, { status: 500 });
  }
}

function buildVideoPrompt(script: any, brandColors: any) {
  return `Create a dynamic social media video with:
- Hook: ${script.hook}
- Main message: ${script.script}
- CTA: ${script.cta}
- Style: Modern, engaging, mobile-optimized
- Colors: ${brandColors?.primary || '#9333ea'}, ${brandColors?.secondary || '#3b82f6'}
- Duration: 30-60 seconds
- Format: 9:16 (vertical for TikTok/Instagram)`;
}
