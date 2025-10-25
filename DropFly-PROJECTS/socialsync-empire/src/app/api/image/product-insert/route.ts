import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { falImageClient, ProductInsertionRequest } from '@/lib/image-engines/fal-image-client';
import { tokenService } from '@/lib/tokens/token-service';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ProductInsertionRequest = await req.json();

    if (!body.productImage || !body.backgroundPrompt) {
      return NextResponse.json(
        { error: 'Product image and background prompt are required' },
        { status: 400 }
      );
    }

    // Check if user has enough tokens (product insertion costs 2 tokens)
    const tokensNeeded = 2;

    const hasTokens = await tokenService.checkBalance(user.id, tokensNeeded);
    if (!hasTokens) {
      return NextResponse.json(
        { error: 'Insufficient tokens. Please purchase more tokens to continue.' },
        { status: 402 }
      );
    }

    // Insert product into scene
    const result = await falImageClient.insertProduct(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Deduct tokens
    await tokenService.deductTokens(user.id, tokensNeeded, 'product_insertion', {
      productName: body.productName,
      backgroundPrompt: body.backgroundPrompt,
      style: body.style,
      cost: result.cost,
    });

    return NextResponse.json({
      success: true,
      image: result.image,
      cost: result.cost,
      tokensUsed: tokensNeeded,
    });
  } catch (error: any) {
    console.error('Product insertion error:', error);
    return NextResponse.json(
      { error: error.message || 'Product insertion failed' },
      { status: 500 }
    );
  }
}
