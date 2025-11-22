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

    const { prompt, duration = 5 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Token cost: 75 tokens for video generation
    const tokenCost = 75;

    // Check and deduct tokens
    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation: 'video_generation',
      cost: tokenCost,
      description: `Simple video: ${prompt.substring(0, 50)}...`,
      metadata: { prompt, duration }
    });

    if (!deductionResult.success) {
      return NextResponse.json({
        error: 'Insufficient tokens',
        required: tokenCost,
        balance: deductionResult.balance
      }, { status: 403 });
    }

    try {
      console.log('🎬 Generating video with FAL.AI...');

      // Use Minimax Video (fast and good quality)
      const response = await fetch('https://queue.fal.run/fal-ai/minimax-video', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.FAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: duration // 5 or 10 seconds
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('FAL.AI Error:', errorText);
        throw new Error(`FAL.AI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('FAL.AI Response:', result);

      // FAL.AI queue system - need to poll for result
      const requestId = result.request_id;
      if (!requestId) {
        throw new Error('No request ID returned from FAL.AI');
      }

      // Poll for completion
      let videoUrl = null;
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max

      while (!videoUrl && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        const statusResponse = await fetch(`https://queue.fal.run/fal-ai/minimax-video/requests/${requestId}`, {
          headers: {
            'Authorization': `Key ${process.env.FAL_API_KEY}`
          }
        });

        const statusData = await statusResponse.json();
        console.log(`Attempt ${attempts + 1}:`, statusData.status);

        if (statusData.status === 'COMPLETED') {
          videoUrl = statusData.video?.url;
          break;
        } else if (statusData.status === 'FAILED') {
          throw new Error('Video generation failed');
        }

        attempts++;
      }

      if (!videoUrl) {
        throw new Error('Video generation timed out');
      }

      console.log('✅ Video generated:', videoUrl);

      return NextResponse.json({
        success: true,
        videoUrl,
        tokensUsed: tokenCost,
        prompt
      });

    } catch (apiError: any) {
      console.error('Video generation error:', apiError);

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
    console.error('API Error:', error);
    return NextResponse.json({
      error: error.message || 'Video generation failed'
    }, { status: 500 });
  }
}
