export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    priceId: 'free', // No Stripe price needed for free tier
    monthly: 0,
    annual: 0,
    features: [
      '300 tokens/month (~3-6 videos)',
      '1 social account',
      '5 budget AI engines',
      'Up to 10s videos',
      '1080p quality',
      'Community support',
    ],
    limits: {
      monthlyTokens: 300,
      socialAccounts: 1,
      maxResolution: '1080p',
    },
  },
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    monthly: 29,
    annual: 276, // 20% off = $23/month
    features: [
      '2,000 tokens/month (~20-40 videos)',
      '2 social accounts',
      '12 professional engines',
      'Up to 30s videos',
      'No watermark',
      'Multi-platform posting',
      'Priority email support',
    ],
    limits: {
      monthlyTokens: 2000,
      socialAccounts: 2,
      maxResolution: '1080p',
    },
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
    monthly: 99,
    annual: 950, // 20% off = $79/month
    features: [
      '6,000 tokens/month (~60-120 videos)',
      '5 social accounts',
      'ALL 25 video engines',
      'OpenAI Sora 2 & Sora 2 Pro',
      'Google Veo 3.1 access',
      'Up to 148s videos',
      '1080p HDR output',
      'API access (basic)',
      'Advanced analytics',
      'Commercial license',
    ],
    limits: {
      monthlyTokens: 6000,
      socialAccounts: 5,
      maxResolution: '1080p-hdr',
    },
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    monthly: 299,
    annual: 2868, // 20% off = $239/month
    features: [
      '20,000 tokens/month (custom available)',
      'Unlimited social accounts',
      'Unlimited team members',
      'ALL 25 engines (token-based)',
      'White-label branding',
      'Dedicated account manager',
      'Custom integrations',
      'API access (advanced + priority)',
      'SLA guarantees (99.9%)',
      'SSO & enterprise security',
    ],
    limits: {
      monthlyTokens: 20000, // High but not unlimited - premium engines are expensive
      socialAccounts: -1, // unlimited
      teamMembers: -1, // unlimited
      maxResolution: '1080p-hdr',
    },
  },
};

export type PlanTier = keyof typeof STRIPE_PLANS;
