import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { falImageClient, ImageGenerationRequest } from '@/lib/image-engines/fal-image-client';
import { tokenService } from '@/lib/tokens/token-service';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const body: ImageGenerationRequest = await req.json();

    if (!body.prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 3. Calculate token cost (5 tokens per image)
    const numImages = body.numImages || 1;
    const tokenCost = tokenService.calculateCost('image_generation') * numImages;

    console.log(`[Image Generation] Generating ${numImages} image(s), Cost: ${tokenCost} tokens`);

    // 4. Deduct tokens BEFORE calling FAL
    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation: 'image_generation',
      cost: tokenCost,
      description: `Image generation: ${body.prompt.substring(0, 50)}...`,
      metadata: {
        prompt: body.prompt,
        model: body.model || 'flux-dev',
        numImages: numImages,
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
      // 5. Generate image via FAL
      const result = await falImageClient.generateImage(body);

      if (!result.success) {
        throw new Error(result.error || 'Image generation failed');
      }

      // 6. Return success
      return NextResponse.json({
        success: true,
        images: result.images,
        seed: result.seed,
        model: result.model,
        cost: result.cost,
        tokensUsed: tokenCost,
        newBalance: deductionResult.newBalance,
      });

    } catch (apiError: any) {
      console.error('[Image Generation] FAL API Error:', apiError);

      // Refund tokens on API failure
      await tokenService.refundTokens({
        userId: user.id,
        amount: tokenCost,
        reason: 'Image generation API failure',
        originalOperation: 'image_generation'
      });

      return NextResponse.json(
        {
          error: 'Failed to generate image. Your tokens have been refunded.',
          details: apiError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[Image Generation] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Image generation failed' },
      { status: 500 }
    );
  }
}
