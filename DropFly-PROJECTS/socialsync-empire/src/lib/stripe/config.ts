export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    monthly: 29,
    annual: 276, // 20% off = $23/month
    features: [
      '50 video downloads/month',
      '20 AI videos/month',
      '5 social accounts',
      'Up to 1080p quality',
      'Basic analytics',
      'Email support',
    ],
    limits: {
      aiGenerations: 20,
      videoDownloads: 50,
      socialAccounts: 5,
      maxResolution: '1080p',
    },
  },
  creator: {
    name: 'Creator',
    priceId: process.env.STRIPE_PRICE_CREATOR || 'price_creator',
    monthly: 79,
    annual: 756, // 20% off = $63/month
    features: [
      '200 video downloads/month',
      '100 AI videos/month',
      '15 social accounts',
      'Up to 4K quality',
      'Advanced analytics',
      'Priority support',
      'Custom watermarks',
      'Trending topics AI',
    ],
    limits: {
      aiGenerations: 100,
      videoDownloads: 200,
      socialAccounts: 15,
      maxResolution: '4K',
    },
    popular: true,
  },
  agency: {
    name: 'Agency',
    priceId: process.env.STRIPE_PRICE_AGENCY || 'price_agency',
    monthly: 199,
    annual: 1908, // 20% off = $159/month
    features: [
      'Unlimited downloads',
      'Unlimited AI videos',
      '50 social accounts',
      'Up to 8K quality',
      'White-label reports',
      '24/7 priority support',
      'Team collaboration',
      'API access',
      'Custom integrations',
    ],
    limits: {
      aiGenerations: -1, // unlimited
      videoDownloads: -1, // unlimited
      socialAccounts: 50,
      maxResolution: '8K',
    },
  },
  free: {
    name: 'Free',
    priceId: 'free', // No Stripe price needed for free tier
    monthly: 0,
    annual: 0,
    features: [
      '5 AI video generations/month',
      '10 video downloads/month',
      '1 social account',
      'Up to 720p quality',
      'Basic scheduling',
      'Community support',
    ],
    limits: {
      aiGenerations: 5,
      videoDownloads: 10,
      socialAccounts: 1,
      maxResolution: '720p',
    },
  },
};

export type PlanTier = keyof typeof STRIPE_PLANS;
