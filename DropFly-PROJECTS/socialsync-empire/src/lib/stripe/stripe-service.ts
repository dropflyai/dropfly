import Stripe from 'stripe';

/**
 * Stripe Service for SocialSync
 * Handles subscriptions and one-time token purchases
 */

// Lazy-load Stripe client to avoid build-time execution
export function getStripeClient(): Stripe {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }

  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });
}

// Stripe Price IDs for each subscription tier
// You'll need to create these in Stripe Dashboard and update here
export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
  creator: process.env.STRIPE_PRICE_CREATOR || 'price_creator_placeholder',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
  agency: process.env.STRIPE_PRICE_AGENCY || 'price_agency_placeholder',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder',
} as const;

// Tier pricing (monthly)
export const TIER_PRICING = {
  free: 0,
  starter: 29,
  creator: 49,
  pro: 99,
  agency: 199,
  enterprise: 399,
} as const;

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  tier: keyof typeof STRIPE_PRICE_IDS;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateTokenPurchaseSessionParams {
  userId: string;
  userEmail: string;
  tokenAmount: number;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createSubscriptionCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const { userId, userEmail, tier, successUrl, cancelUrl } = params;

  const priceId = STRIPE_PRICE_IDS[tier];

  if (!priceId || priceId.includes('placeholder')) {
    throw new Error(`Stripe price ID not configured for tier: ${tier}`);
  }

  const session = await getStripeClient().checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      tier,
      type: 'subscription',
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Create a Stripe Checkout session for one-time token purchase
 */
export async function createTokenPurchaseCheckoutSession(
  params: CreateTokenPurchaseSessionParams
): Promise<Stripe.Checkout.Session> {
  const { userId, userEmail, tokenAmount, successUrl, cancelUrl } = params;

  // Token packages: 1000 tokens = $10
  const priceInCents = tokenAmount * 1; // 1 token = $0.01
  const dollarAmount = priceInCents / 100;

  const session = await getStripeClient().checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tokenAmount.toLocaleString()} SocialSync Tokens`,
            description: `One-time purchase of ${tokenAmount.toLocaleString()} tokens for AI video generation`,
            images: ['https://socialsync.ai/token-icon.png'],
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      tokenAmount: tokenAmount.toString(),
      type: 'token_purchase',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

/**
 * Get or create Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  // Search for existing customer by email
  const existingCustomers = await getStripeClient().customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await getStripeClient().customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await getStripeClient().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Immediately cancel a subscription
 */
export async function cancelSubscriptionImmediately(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await getStripeClient().subscriptions.cancel(subscriptionId);
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await getStripeClient().subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await getStripeClient().subscriptions.retrieve(subscriptionId);
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await getStripeClient().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return getStripeClient().webhooks.constructEvent(payload, signature, secret);
}
