import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { videoService } from '@/lib/video-engines/video-service';
import { tokenService } from '@/lib/tokens/token-service';
import { VideoEngine } from '@/types/video-engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { engine, duration = 5 } = body;

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const userTier = profile?.subscription_tier || 'free';

    // Determine which engine to use
    const selectedEngine = (engine || 'auto') as VideoEngine;
    const actualEngine = selectedEngine === 'auto'
      ? videoService.getAutoEngine(userTier)
      : selectedEngine;

    // Calculate token cost for this video
    const tokenCost = tokenService.calculateCost('video_generation', {
      engine: actualEngine,
      duration,
    });

    // Get current token balance and daily limit info
    const balance = await tokenService.getBalance(user.id);
    const dailyInfo = await tokenService.getDailyLimitInfo(user.id);

    return NextResponse.json({
      cost: tokenCost,
      engine: actualEngine,
      duration,
      balance: balance?.balance || 0,
      dailyRemaining: dailyInfo?.dailyRemaining || 0,
      canAfford: (balance?.balance || 0) >= tokenCost && (dailyInfo?.dailyRemaining || 0) >= tokenCost,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Cost estimation error:', err);
    return NextResponse.json(
      { error: 'Failed to estimate cost', details: err.message },
      { status: 500 }
    );
  }
}
