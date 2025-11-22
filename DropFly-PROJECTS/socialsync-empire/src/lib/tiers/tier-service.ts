import { createClient } from '@/lib/supabase/server';
import { TierName, TierFeatures, getTierConfig, hasFeature as configHasFeature, getFeatureLimit } from './tier-config';

export interface UserTierInfo {
  tier: TierName;
  displayName: string;
  features: TierFeatures;
}

/**
 * Get user's tier information from database
 */
export async function getUserTier(userId: string): Promise<UserTierInfo | null> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user tier:', error);
      return null;
    }

    const tierName = (profile.subscription_tier as TierName) || 'free';
    const config = getTierConfig(tierName);

    return {
      tier: tierName,
      displayName: config.displayName,
      features: config.features,
    };
  } catch (error) {
    console.error('Failed to get user tier:', error);
    return null;
  }
}

/**
 * Check if user has access to a feature
 */
export async function userHasFeature(
  userId: string,
  feature: keyof TierFeatures
): Promise<boolean> {
  const tierInfo = await getUserTier(userId);

  if (!tierInfo) {
    // Default to free tier if unable to fetch
    return configHasFeature('free', feature);
  }

  return configHasFeature(tierInfo.tier, feature);
}

/**
 * Get feature limit for user
 */
export async function getUserFeatureLimit(
  userId: string,
  feature: keyof TierFeatures
): Promise<number> {
  const tierInfo = await getUserTier(userId);

  if (!tierInfo) {
    return getFeatureLimit('free', feature);
  }

  return getFeatureLimit(tierInfo.tier, feature);
}

/**
 * Check if user can perform an action based on their tier
 */
export async function canPerformAction(
  userId: string,
  action: keyof TierFeatures
): Promise<{ allowed: boolean; reason?: string }> {
  const hasAccess = await userHasFeature(userId, action);

  if (!hasAccess) {
    const tierInfo = await getUserTier(userId);
    const currentTier = tierInfo?.displayName || 'Free';

    return {
      allowed: false,
      reason: `This feature is not available on the ${currentTier} plan. Please upgrade to access this feature.`,
    };
  }

  return { allowed: true };
}

/**
 * Update user's tier (for admin or after successful payment)
 */
export async function updateUserTier(
  userId: string,
  newTier: TierName
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user tier:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update user tier:', error);
    return false;
  }
}

/**
 * Get tier upgrade suggestion based on usage
 */
export async function getUpgradeSuggestion(userId: string): Promise<{
  shouldUpgrade: boolean;
  suggestedTier?: TierName;
  reason?: string;
}> {
  const tierInfo = await getUserTier(userId);

  if (!tierInfo || tierInfo.tier === 'enterprise') {
    return { shouldUpgrade: false };
  }

  // This is a placeholder - you can add logic to track usage patterns
  // and suggest upgrades based on user behavior

  return { shouldUpgrade: false };
}
