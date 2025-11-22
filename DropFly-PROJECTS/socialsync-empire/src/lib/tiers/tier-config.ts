/**
 * Subscription Tier Configuration
 * Defines all tiers, their features, and limits
 */

export type TierName = 'free' | 'starter' | 'creator' | 'pro' | 'enterprise';

export interface TierFeatures {
  // Token System
  monthlyTokens: number;
  dailyTokenLimit: number;
  canBuyTokens: boolean;

  // AI Features
  aiScriptGeneration: boolean;
  aiCaptionGeneration: boolean;
  aiHashtagGeneration: boolean;
  aiHookGeneration: boolean;
  aiThumbnailText: boolean;
  aiContentCalendar: boolean;
  aiTranscription: boolean;

  // Video Features
  videoGeneration: boolean;
  videoDownload: boolean;
  videoCrop: boolean;
  videoConvert: boolean;
  maxVideoLength: number; // in seconds

  // Image Features
  imageGeneration: boolean;
  productImageInsert: boolean;
  maxImagesPerMonth: number;

  // Social Features
  socialPlatforms: number; // max number of connected platforms
  scheduledPosts: number; // max scheduled posts
  crossPosting: boolean;
  analyticsAccess: boolean;
  advancedAnalytics: boolean;

  // Content Library
  savedContent: number; // max saved content items
  contentTemplates: boolean;
  brandKit: boolean;

  // Support
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  customBranding: boolean;
}

export interface Tier {
  name: TierName;
  displayName: string;
  price: number; // monthly price in USD
  yearlyPrice: number; // yearly price in USD
  description: string;
  popular?: boolean;
  features: TierFeatures;
}

export const TIER_CONFIG: Record<TierName, Tier> = {
  free: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'Perfect for trying out SocialSync Empire',
    features: {
      // Tokens
      monthlyTokens: 100,
      dailyTokenLimit: 50,
      canBuyTokens: false,

      // AI Features
      aiScriptGeneration: true,
      aiCaptionGeneration: true,
      aiHashtagGeneration: true,
      aiHookGeneration: false,
      aiThumbnailText: false,
      aiContentCalendar: false,
      aiTranscription: false,

      // Video
      videoGeneration: false,
      videoDownload: false,
      videoCrop: false,
      videoConvert: false,
      maxVideoLength: 0,

      // Image
      imageGeneration: false,
      productImageInsert: false,
      maxImagesPerMonth: 0,

      // Social
      socialPlatforms: 1,
      scheduledPosts: 5,
      crossPosting: false,
      analyticsAccess: false,
      advancedAnalytics: false,

      // Content
      savedContent: 10,
      contentTemplates: false,
      brandKit: false,

      // Support
      supportLevel: 'community',
      customBranding: false,
    },
  },

  starter: {
    name: 'starter',
    displayName: 'Starter',
    price: 19,
    yearlyPrice: 190, // ~16/mo
    description: 'Great for solo creators getting started',
    features: {
      // Tokens
      monthlyTokens: 500,
      dailyTokenLimit: 200,
      canBuyTokens: true,

      // AI Features
      aiScriptGeneration: true,
      aiCaptionGeneration: true,
      aiHashtagGeneration: true,
      aiHookGeneration: true,
      aiThumbnailText: true,
      aiContentCalendar: true,
      aiTranscription: true,

      // Video
      videoGeneration: true,
      videoDownload: true,
      videoCrop: true,
      videoConvert: true,
      maxVideoLength: 60, // 1 minute

      // Image
      imageGeneration: true,
      productImageInsert: true,
      maxImagesPerMonth: 50,

      // Social
      socialPlatforms: 3,
      scheduledPosts: 30,
      crossPosting: true,
      analyticsAccess: true,
      advancedAnalytics: false,

      // Content
      savedContent: 100,
      contentTemplates: true,
      brandKit: false,

      // Support
      supportLevel: 'email',
      customBranding: false,
    },
  },

  creator: {
    name: 'creator',
    displayName: 'Creator',
    price: 49,
    yearlyPrice: 490, // ~41/mo
    description: 'For serious content creators',
    popular: true,
    features: {
      // Tokens
      monthlyTokens: 2000,
      dailyTokenLimit: 500,
      canBuyTokens: true,

      // AI Features
      aiScriptGeneration: true,
      aiCaptionGeneration: true,
      aiHashtagGeneration: true,
      aiHookGeneration: true,
      aiThumbnailText: true,
      aiContentCalendar: true,
      aiTranscription: true,

      // Video
      videoGeneration: true,
      videoDownload: true,
      videoCrop: true,
      videoConvert: true,
      maxVideoLength: 300, // 5 minutes

      // Image
      imageGeneration: true,
      productImageInsert: true,
      maxImagesPerMonth: 200,

      // Social
      socialPlatforms: 6,
      scheduledPosts: 100,
      crossPosting: true,
      analyticsAccess: true,
      advancedAnalytics: true,

      // Content
      savedContent: 500,
      contentTemplates: true,
      brandKit: true,

      // Support
      supportLevel: 'priority',
      customBranding: false,
    },
  },

  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 99,
    yearlyPrice: 990, // ~83/mo
    description: 'For professional creators and teams',
    features: {
      // Tokens
      monthlyTokens: 5000,
      dailyTokenLimit: 1000,
      canBuyTokens: true,

      // AI Features (all enabled)
      aiScriptGeneration: true,
      aiCaptionGeneration: true,
      aiHashtagGeneration: true,
      aiHookGeneration: true,
      aiThumbnailText: true,
      aiContentCalendar: true,
      aiTranscription: true,

      // Video
      videoGeneration: true,
      videoDownload: true,
      videoCrop: true,
      videoConvert: true,
      maxVideoLength: 600, // 10 minutes

      // Image
      imageGeneration: true,
      productImageInsert: true,
      maxImagesPerMonth: 1000,

      // Social
      socialPlatforms: 10,
      scheduledPosts: 500,
      crossPosting: true,
      analyticsAccess: true,
      advancedAnalytics: true,

      // Content
      savedContent: 2000,
      contentTemplates: true,
      brandKit: true,

      // Support
      supportLevel: 'priority',
      customBranding: true,
    },
  },

  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 299,
    yearlyPrice: 2990, // ~249/mo
    description: 'For agencies and large teams',
    features: {
      // Tokens
      monthlyTokens: 20000,
      dailyTokenLimit: 5000,
      canBuyTokens: true,

      // AI Features (all enabled)
      aiScriptGeneration: true,
      aiCaptionGeneration: true,
      aiHashtagGeneration: true,
      aiHookGeneration: true,
      aiThumbnailText: true,
      aiContentCalendar: true,
      aiTranscription: true,

      // Video
      videoGeneration: true,
      videoDownload: true,
      videoCrop: true,
      videoConvert: true,
      maxVideoLength: 1800, // 30 minutes

      // Image
      imageGeneration: true,
      productImageInsert: true,
      maxImagesPerMonth: 10000,

      // Social
      socialPlatforms: 999, // unlimited
      scheduledPosts: 9999, // unlimited
      crossPosting: true,
      analyticsAccess: true,
      advancedAnalytics: true,

      // Content
      savedContent: 99999, // unlimited
      contentTemplates: true,
      brandKit: true,

      // Support
      supportLevel: 'dedicated',
      customBranding: true,
    },
  },
};

/**
 * Get tier configuration by name
 */
export function getTierConfig(tierName: TierName): Tier {
  return TIER_CONFIG[tierName];
}

/**
 * Check if a feature is available for a tier
 */
export function hasFeature(tierName: TierName, feature: keyof TierFeatures): boolean {
  const tier = getTierConfig(tierName);
  const value = tier.features[feature];

  // For boolean features
  if (typeof value === 'boolean') {
    return value;
  }

  // For number features (check if > 0)
  if (typeof value === 'number') {
    return value > 0;
  }

  // For string features (check if not empty)
  return Boolean(value);
}

/**
 * Get feature limit for a tier
 */
export function getFeatureLimit(tierName: TierName, feature: keyof TierFeatures): number {
  const tier = getTierConfig(tierName);
  const value = tier.features[feature];

  if (typeof value === 'number') {
    return value;
  }

  return 0;
}

/**
 * Format tier name for display
 */
export function formatTierName(tierName: TierName): string {
  return TIER_CONFIG[tierName].displayName;
}
