import { TokenCost, TokenPackage, SubscriptionTokenAllocation } from '@/types/token-system';
import { VideoEngine } from '@/types/video-engine';
import { VIDEO_ENGINES } from '@/lib/video-engines/config';

// Token costs for all operations
export const TOKEN_COSTS: TokenCost[] = [
  // VIDEO GENERATION - Variable cost based on engine and duration
  {
    operation: 'video_generation',
    baseTokens: 0, // Calculated dynamically
    description: 'AI video generation',
    variableCost: (params) => {
      const engine = params.engine as VideoEngine;
      const duration = params.duration as number;
      const engineConfig = VIDEO_ENGINES[engine];

      if (!engineConfig) return 100; // Default fallback

      // Convert dollar cost to tokens (1 token = $0.01)
      const dollarCost = engineConfig.pricePerSecond * duration;
      const tokens = Math.ceil(dollarCost * 100);

      // 70% profit OVER cost (70% markup)
      // Price = Cost + (Cost × 0.70) = Cost × 1.70
      const PROFIT_MARGIN_MULTIPLIER = 1.70;

      return Math.ceil(tokens * PROFIT_MARGIN_MULTIPLIER);
    },
  },

  // VIDEO OPERATIONS
  {
    operation: 'video_download',
    baseTokens: 5,
    description: 'Download video from social platform',
  },
  {
    operation: 'video_editing',
    baseTokens: 10,
    description: 'Basic video editing operations',
  },

  // CONTENT GENERATION
  {
    operation: 'script_generation',
    baseTokens: 7,
    description: 'AI script generation with GPT-4o',
  },
  {
    operation: 'image_generation',
    baseTokens: 5,
    description: 'AI image generation (per image)',
  },
  {
    operation: 'script_enhancement',
    baseTokens: 5,
    description: 'Enhance existing script with AI',
  },
  {
    operation: 'content_analysis',
    baseTokens: 8,
    description: 'Analyze content performance',
  },

  // SOCIAL MEDIA OPERATIONS
  {
    operation: 'social_post',
    baseTokens: 2,
    description: 'Post to single platform',
  },
  {
    operation: 'social_post_multi_platform',
    baseTokens: 5,
    description: 'Post to multiple platforms',
  },
  {
    operation: 'post_scheduling',
    baseTokens: 1,
    description: 'Schedule a post',
  },
  {
    operation: 'campaign_creation',
    baseTokens: 20,
    description: 'Create multi-post campaign',
  },

  // ANALYTICS
  {
    operation: 'analytics_report',
    baseTokens: 15,
    description: 'Generate analytics report',
  },
  {
    operation: 'competitor_analysis',
    baseTokens: 25,
    description: 'Analyze competitor content',
  },
  {
    operation: 'trend_research',
    baseTokens: 12,
    description: 'Research trending topics',
  },
];

// Token packages for purchase
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tokens: 500,
    price: 9,
    bonus: 50,
    pricePerToken: 0.018, // $0.018 per token
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    tokens: 1500,
    price: 24,
    bonus: 300,
    popular: true,
    pricePerToken: 0.016, // $0.016 per token
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    tokens: 3000,
    price: 45,
    bonus: 750,
    pricePerToken: 0.015, // $0.015 per token
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    tokens: 10000,
    price: 129,
    bonus: 3000,
    pricePerToken: 0.0129, // $0.0129 per token
  },
];

// Monthly token allocation by subscription tier
// NO ROLLOVER - Use it or lose it. Drives upgrades.
// Optimized 4-Tier System: Free → Starter → PRO (sweet spot) → Enterprise
export const SUBSCRIPTION_TOKEN_ALLOCATIONS: SubscriptionTokenAllocation[] = [
  {
    tier: 'free',
    monthlyTokens: 300,     // ~3-6 budget videos (teaser tier)
    dailyLimit: 15,         // Strict limit to drive upgrades
  },
  {
    tier: 'starter',
    monthlyTokens: 2000,    // ~20-40 videos with mid-tier engines
    dailyLimit: 100,        // ~2-3 videos per day
  },
  {
    tier: 'pro',
    monthlyTokens: 6000,    // ~60-120 videos (all engines unlocked!)
    dailyLimit: 300,        // ~5-10 videos per day
  },
  {
    tier: 'enterprise',
    monthlyTokens: 20000,   // ~200+ videos or 40+ premium Sora videos
    dailyLimit: 1000,       // ~20-30 videos per day
  },
];

// Helper: Calculate token cost for an operation
export function calculateTokenCost(
  operation: string,
  params?: Record<string, unknown>
): number {
  const costConfig = TOKEN_COSTS.find((c) => c.operation === operation);

  if (!costConfig) {
    throw new Error(`Unknown operation: ${operation}`);
  }

  if (costConfig.variableCost && params) {
    return costConfig.variableCost(params);
  }

  return costConfig.baseTokens;
}

// Helper: Get token allocation for a tier
export function getTokenAllocation(tier: string): SubscriptionTokenAllocation {
  const allocation = SUBSCRIPTION_TOKEN_ALLOCATIONS.find((a) => a.tier === tier);

  if (!allocation) {
    return SUBSCRIPTION_TOKEN_ALLOCATIONS[0]; // Default to free
  }

  return allocation;
}

// Helper: Estimate video generation cost in tokens
export function estimateVideoTokenCost(engine: VideoEngine, durationSeconds: number): number {
  return calculateTokenCost('video_generation', {
    engine,
    duration: durationSeconds,
  });
}

// Helper: Convert tokens to dollars (for display)
export function tokensToDollars(tokens: number): number {
  return tokens * 0.01; // 1 token = $0.01
}

// Helper: Convert dollars to tokens
export function dollarsToTokens(dollars: number): number {
  return Math.ceil(dollars * 100);
}
