// Token/Credit System Types

export interface TokenBalance {
  id: string;
  user_id: string;
  balance: number; // Current token balance
  lifetime_earned: number; // Total tokens ever earned
  lifetime_spent: number; // Total tokens ever spent
  daily_spent: number; // Tokens spent today
  daily_limit: number; // Daily spending cap
  last_reset_date: string; // Last time daily_spent was reset
  last_updated: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number; // Positive for earn, negative for spend
  type: 'earn' | 'spend' | 'refund' | 'bonus' | 'purchase';
  reason: string;
  operation: TokenOperation;
  metadata: Record<string, unknown>;
  balance_after: number;
  created_at: string;
}

export type TokenOperation =
  // Video Operations
  | 'video_generation'
  | 'video_download'
  | 'video_editing'

  // Content Operations
  | 'script_generation'
  | 'script_enhancement'
  | 'content_analysis'

  // Social Media Operations
  | 'social_post'
  | 'social_post_multi_platform'
  | 'post_scheduling'
  | 'campaign_creation'

  // Analytics Operations
  | 'analytics_report'
  | 'competitor_analysis'
  | 'trend_research'

  // Subscription & Purchases
  | 'subscription_renewal'
  | 'token_purchase'
  | 'bonus_tokens'
  | 'referral_bonus'

  // Refunds
  | 'failed_operation_refund'
  | 'subscription_refund';

export interface TokenCost {
  operation: TokenOperation;
  baseTokens: number;
  description: string;
  variableCost?: (params: Record<string, unknown>) => number;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number; // in dollars
  bonus: number; // Bonus tokens
  popular?: boolean;
  pricePerToken: number;
}

export interface SubscriptionTokenAllocation {
  tier: string;
  monthlyTokens: number;
  dailyLimit: number; // Daily spending cap
}

export interface TokenOperationRequest {
  operation: TokenOperation;
  userId: string;
  cost: number;
  metadata?: Record<string, unknown>;
  description: string;
}

export interface TokenOperationResult {
  success: boolean;
  transaction?: TokenTransaction;
  newBalance?: number;
  error?: string;
  errorCode?: 'INSUFFICIENT_TOKENS' | 'DAILY_LIMIT_EXCEEDED' | 'INVALID_OPERATION' | 'USER_NOT_FOUND';
}
