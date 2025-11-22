import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get token balance and daily limit info
    const balance = await tokenService.getBalance(user.id);
    const dailyInfo = await tokenService.getDailyLimitInfo(user.id);

    return NextResponse.json({
      id: profile.id,
      email: user.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      subscription_tier: profile.subscription_tier || 'free',
      tokenBalance: {
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
    console.error('Get profile error:', err);
    return NextResponse.json(
      { error: 'Failed to get profile', details: err.message },
      { status: 500 }
    );
  }
}
