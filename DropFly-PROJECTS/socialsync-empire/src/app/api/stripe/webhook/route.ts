import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { tokenService } from '@/lib/tokens/token-service';

// Lazy-load Stripe client to avoid build-time execution
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
  });
}

// Lazy-load Supabase client to avoid build-time execution
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const type = session.metadata?.type;

      if (!userId) break;

      // Handle subscription checkout
      if (type === 'subscription') {
        const tier = session.metadata?.tier;

        if (tier) {
          // Update user subscription in database
          await supabase
            .from('users')
            .update({
              subscription_tier: tier,
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_expires_at: null, // Clear expiration for active subscription
            })
            .eq('id', userId);

          // Update profile tier
          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
            })
            .eq('id', userId);

          console.log(`✅ Subscription activated for user ${userId}: ${tier}`);
        }
      }
      // Handle token purchase
      else if (type === 'token_purchase') {
        const tokenAmount = parseInt(session.metadata?.tokenAmount || '0', 10);

        if (tokenAmount > 0) {
          // Add tokens to user's balance
          const result = await tokenService.addTokens({
            userId,
            operation: 'token_purchase',
            amount: tokenAmount,
            description: `Purchased ${tokenAmount.toLocaleString()} tokens via Stripe`,
            metadata: {
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent,
              amount_paid: session.amount_total,
            },
          });

          if (result.success) {
            console.log(`✅ ${tokenAmount} tokens added to user ${userId}`);
          } else {
            console.error(`❌ Failed to add tokens to user ${userId}:`, result.error);
          }
        }
      }
      // Legacy support for old checkout flow
      else {
        const planName = session.metadata?.planName;
        if (planName) {
          await supabase
            .from('users')
            .update({
              subscription_tier: planName,
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', userId);
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find user by Stripe customer ID
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({
            subscription_status: subscription.status,
          })
          .eq('id', user.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
          })
          .eq('id', user.id);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({
            subscription_status: 'past_due',
          })
          .eq('id', user.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
