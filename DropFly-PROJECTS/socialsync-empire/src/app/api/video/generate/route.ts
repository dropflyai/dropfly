import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { videoService } from '@/lib/video-engines/video-service';
import { tokenService } from '@/lib/tokens/token-service';
import { VideoGenerationRequest } from '@/types/video-engine';
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
    const body = (await request.json()) as VideoGenerationRequest;
    const { engine, prompt, duration, resolution, aspectRatio, includeAudio } = body;

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
      duration: duration || 5,
    });

    // Get current token balance and daily limit info
    const balance = await tokenService.getBalance(user.id);
    const dailyInfo = await tokenService.getDailyLimitInfo(user.id);

    if (!balance || !dailyInfo) {
      return NextResponse.json(
        { error: 'Unable to fetch token balance' },
        { status: 500 }
      );
    }

    // Deduct tokens BEFORE generating video
    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation: 'video_generation',
      cost: tokenCost,
      description: `Video generation: ${prompt.substring(0, 50)}`,
      metadata: {
        engine: actualEngine,
        duration: duration || 5,
        prompt: prompt.substring(0, 100),
      },
    });

    // Handle token deduction errors (insufficient balance or daily limit exceeded)
    if (!deductionResult.success) {
      const errorMessages: Record<string, string> = {
        INSUFFICIENT_TOKENS: `Not enough tokens. Required: ${tokenCost}, Available: ${balance.balance}`,
        DAILY_LIMIT_EXCEEDED: deductionResult.error || 'Daily token limit exceeded',
        USER_NOT_FOUND: 'User token account not found',
        INVALID_OPERATION: 'Invalid token operation',
      };

      return NextResponse.json(
        {
          error: errorMessages[deductionResult.errorCode || 'INVALID_OPERATION'],
          errorCode: deductionResult.errorCode,
          tokenCost,
          balance: balance.balance,
          dailyRemaining: dailyInfo.dailyRemaining,
          dailyLimit: dailyInfo.dailyLimit,
        },
        { status: 403 }
      );
    }

    // Generate video (tokens already deducted)
    const result = await videoService.generate(
      {
        engine: selectedEngine,
        prompt,
        duration,
        resolution,
        aspectRatio,
        includeAudio,
      },
      userTier
    );

    // If video generation failed, refund the tokens
    if (!result.success && deductionResult.transaction) {
      await tokenService.refundTokens(
        user.id,
        deductionResult.transaction.id,
        `Video generation failed: ${result.error}`
      );

      return NextResponse.json(
        {
          error: result.error,
          errorCode: result.errorCode,
          tokensRefunded: tokenCost,
        },
        { status: 400 }
      );
    }

    // Save to content library
    await supabase.from('content').insert({
      user_id: user.id,
      title: prompt.substring(0, 100),
      type: 'video',
      content: {
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        prompt,
        engine: result.engine,
        engineName: result.engineName,
      },
      metadata: {
        ...result.metadata,
        duration: result.duration,
        cost: result.cost,
        tokensSpent: tokenCost,
        transactionId: deductionResult.transaction?.id,
      },
      status: 'draft',
    });

    // Get updated balance and daily info
    const updatedBalance = await tokenService.getBalance(user.id);
    const updatedDailyInfo = await tokenService.getDailyLimitInfo(user.id);

    return NextResponse.json({
      success: true,
      video: result,
      tokens: {
        spent: tokenCost,
        balance: updatedBalance?.balance || 0,
        dailySpent: updatedDailyInfo?.dailySpent || 0,
        dailyLimit: updatedDailyInfo?.dailyLimit || 0,
        dailyRemaining: updatedDailyInfo?.dailyRemaining || 0,
        transactionId: deductionResult.transaction?.id,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Video generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate video', details: err.message },
      { status: 500 }
    );
  }
}

// GET endpoint to list available engines for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const userTier = profile?.subscription_tier || 'free';

    // Get available engines
    const engines = videoService.getAvailableEngines(userTier);

    // Get token balance and daily limit info
    const balance = await tokenService.getBalance(user.id);
    const dailyInfo = await tokenService.getDailyLimitInfo(user.id);

    return NextResponse.json({
      engines,
      tier: userTier,
      tokens: {
        balance: balance?.balance || 0,
        dailySpent: dailyInfo?.dailySpent || 0,
        dailyLimit: dailyInfo?.dailyLimit || 0,
        dailyRemaining: dailyInfo?.dailyRemaining || 0,
        dailyPercentageUsed: dailyInfo?.percentageUsed || 0,
        resetsAt: dailyInfo?.resetsAt,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Get engines error:', err);
    return NextResponse.json({ error: 'Failed to get engines' }, { status: 500 });
  }
}
