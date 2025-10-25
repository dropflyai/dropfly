import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createSubscriptionCheckoutSession,
  createTokenPurchaseCheckoutSession,
  TIER_PRICING,
} from '@/lib/stripe/stripe-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, tier, tokenAmount, priceId, planName } = body;

    // Get user email
    const userEmail = user.email!;

    // Build success and cancel URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${origin}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/dashboard/billing/canceled`;

    let session;

    // Support both new and legacy checkout flows
    if (type === 'subscription' || planName) {
      const subscriptionTier = tier || planName;

      // Validate tier
      if (!subscriptionTier || !TIER_PRICING[subscriptionTier as keyof typeof TIER_PRICING]) {
        return NextResponse.json(
          { error: 'Invalid subscription tier' },
          { status: 400 }
        );
      }

      if (subscriptionTier === 'free') {
        return NextResponse.json(
          { error: 'Free tier does not require checkout' },
          { status: 400 }
        );
      }

      // Create subscription checkout session
      session = await createSubscriptionCheckoutSession({
        userId: user.id,
        userEmail,
        tier: subscriptionTier as 'starter' | 'creator' | 'pro' | 'agency' | 'enterprise',
        successUrl,
        cancelUrl,
      });
    } else if (type === 'token_purchase') {
      // Validate token amount
      if (!tokenAmount || tokenAmount < 100) {
        return NextResponse.json(
          { error: 'Minimum purchase is 100 tokens' },
          { status: 400 }
        );
      }

      if (tokenAmount > 100000) {
        return NextResponse.json(
          { error: 'Maximum purchase is 100,000 tokens' },
          { status: 400 }
        );
      }

      // Create token purchase checkout session
      session = await createTokenPurchaseCheckoutSession({
        userId: user.id,
        userEmail,
        tokenAmount,
        successUrl,
        cancelUrl,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid checkout type. Must be "subscription" or "token_purchase"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Stripe checkout error:', err);

    return NextResponse.json(
      {
        error: err.message || 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
