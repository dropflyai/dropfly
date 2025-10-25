import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { falImageClient, ImageGenerationRequest } from '@/lib/image-engines/fal-image-client';
import { tokenService } from '@/lib/tokens/token-service';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ImageGenerationRequest = await req.json();

    if (!body.prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check if user has enough tokens
    const numImages = body.numImages || 1;
    const tokensNeeded = numImages; // 1 token per image

    const hasTokens = await tokenService.checkBalance(user.id, tokensNeeded);
    if (!hasTokens) {
      return NextResponse.json(
        { error: 'Insufficient tokens. Please purchase more tokens to continue.' },
        { status: 402 }
      );
    }

    // Generate image
    const result = await falImageClient.generateImage(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Deduct tokens
    await tokenService.deductTokens(user.id, tokensNeeded, 'image_generation', {
      model: body.model || 'flux-dev',
      numImages: numImages,
      cost: result.cost,
    });

    return NextResponse.json({
      success: true,
      images: result.images,
      seed: result.seed,
      model: result.model,
      cost: result.cost,
      tokensUsed: tokensNeeded,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Image generation failed' },
      { status: 500 }
    );
  }
}
