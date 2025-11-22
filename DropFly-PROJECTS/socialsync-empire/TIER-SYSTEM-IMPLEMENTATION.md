# Subscription Tier System Implementation

## Overview
Implemented a comprehensive subscription tier system that manages user access to features based on their plan level.

## What Was Done

### 1. Created Tier Configuration (`/src/lib/tiers/tier-config.ts`)

**5 Tier Levels:**
- **Free** - $0/month
  - 100 monthly tokens, 50 daily limit
  - Basic AI features (script, caption, hashtags)
  - 1 social platform
  - 5 scheduled posts
  - 10 saved content items

- **Starter** - $19/month ($190/year)
  - 500 monthly tokens, 200 daily limit
  - All AI features including transcription
  - Video tools (60s max length)
  - 3 social platforms
  - 30 scheduled posts
  - 100 saved content items

- **Creator** - $49/month ($490/year) [MOST POPULAR]
  - 2000 monthly tokens, 500 daily limit
  - All AI features
  - Video tools (5 min max length)
  - 6 social platforms
  - 100 scheduled posts
  - 500 saved content items
  - Advanced analytics
  - Brand kit

- **Pro** - $99/month ($990/year)
  - 5000 monthly tokens, 1000 daily limit
  - All features
  - Video tools (10 min max length)
  - 10 social platforms
  - 500 scheduled posts
  - 2000 saved content items
  - Custom branding

- **Enterprise** - $299/month ($2990/year)
  - 20000 monthly tokens, 5000 daily limit
  - Unlimited everything
  - Video tools (30 min max length)
  - Dedicated support

**Feature Categories:**
- Token limits
- AI tools (script, caption, hashtag, hook, thumbnail, calendar, transcription)
- Video tools (generation, download, crop, convert, max length)
- Image tools (generation, product insert, monthly limit)
- Social features (platforms, scheduled posts, cross-posting, analytics)
- Content library (saved items, templates, brand kit)
- Support level (community, email, priority, dedicated)
- Custom branding

**Helper Functions:**
```typescript
getTierConfig(tierName: TierName): Tier
hasFeature(tierName: TierName, feature: keyof TierFeatures): boolean
getFeatureLimit(tierName: TierName, feature: keyof TierFeatures): number
formatTierName(tierName: TierName): string
```

### 2. Created Tier Service (`/src/lib/tiers/tier-service.ts`)

**Functions for server-side tier checking:**

```typescript
// Get user's tier from database
getUserTier(userId: string): Promise<UserTierInfo | null>

// Check if user has access to a feature
userHasFeature(userId: string, feature: keyof TierFeatures): Promise<boolean>

// Get feature limit for user
getUserFeatureLimit(userId: string, feature: keyof TierFeatures): Promise<number>

// Check if user can perform an action
canPerformAction(userId: string, action: keyof TierFeatures): Promise<{
  allowed: boolean;
  reason?: string;
}>

// Update user's tier (for payment processing)
updateUserTier(userId: string, newTier: TierName): Promise<boolean>

// Get upgrade suggestions based on usage
getUpgradeSuggestion(userId: string): Promise<{
  shouldUpgrade: boolean;
  suggestedTier?: TierName;
  reason?: string;
}>
```

### 3. Fixed Sidebar Tier Display (`/src/app/(main)/layout.tsx`)

**Changes:**
- Added state for `userTier` (default: 'Free')
- Added `useEffect` to fetch user's actual subscription tier from database
- Removed hardcoded `userTier="Pro"` prop
- Now dynamically fetches and displays correct tier

**Before:**
```typescript
<Sidebar activeTab={activeTab} onTabChange={handleTabChange} userTier="Pro" />
```

**After:**
```typescript
const [userTier, setUserTier] = useState<string>('Free');

useEffect(() => {
  async function fetchUserTier() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      if (profile?.subscription_tier) {
        setUserTier(formatTierName(profile.subscription_tier));
      }
    }
  }
  fetchUserTier();
}, []);

<Sidebar activeTab={activeTab} onTabChange={handleTabChange} userTier={userTier} />
```

### 4. Enhanced Script Generation Auth (`/src/app/api/ai/generate-script/route.ts`)

**Changes:**
- Added session checking before user checking
- Enhanced logging to debug auth issues:
  - Session status
  - User ID and email
  - Detailed error messages
- Better error responses with specific details

**Logging Added:**
```typescript
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
console.log('[Script Generation] Session check:', {
  hasSession: !!session,
  sessionError: sessionError?.message
});

const { data: { user }, error: authError } = await supabase.auth.getUser();
console.log('[Script Generation] Auth check:', {
  userId: user?.id,
  userEmail: user?.email,
  authError: authError?.message
});
```

## How to Use the Tier System

### In API Routes (Server-Side)

```typescript
import { userHasFeature, canPerformAction } from '@/lib/tiers/tier-service';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user has access to video generation
  const hasAccess = await userHasFeature(user.id, 'videoGeneration');
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Video generation is not available on your plan' },
      { status: 403 }
    );
  }

  // Or use canPerformAction for detailed response
  const result = await canPerformAction(user.id, 'videoGeneration');
  if (!result.allowed) {
    return NextResponse.json({ error: result.reason }, { status: 403 });
  }

  // Proceed with the feature...
}
```

### In Client Components

```typescript
import { getTierConfig, hasFeature } from '@/lib/tiers/tier-config';

function VideoToolButton({ userTier }: { userTier: TierName }) {
  const canUseVideo = hasFeature(userTier, 'videoGeneration');
  const config = getTierConfig(userTier);

  return (
    <button disabled={!canUseVideo}>
      {canUseVideo
        ? `Generate Video (max ${config.features.maxVideoLength}s)`
        : 'Upgrade to use Video Tools'}
    </button>
  );
}
```

## Database Schema

The `profiles` table already has the `subscription_tier` column:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  subscription_tier TEXT DEFAULT 'free',
  -- other fields...
);
```

**Default:** New users get `'free'` tier automatically.

## Testing Instructions

1. **Test Tier Display:**
   - Sign up with a new account
   - Check sidebar shows "Free Plan"
   - Update `subscription_tier` in database to `'starter'`, `'creator'`, etc.
   - Refresh page - should show correct tier

2. **Test Feature Gating:**
   - As Free user, try to access video generation → Should be blocked
   - Update to Starter tier
   - Try video generation → Should work

3. **Test Script Generation Auth:**
   - Try generating a script
   - Check server logs for detailed auth logging
   - Should see session and user info in console

## Next Steps

1. **Integrate with Stripe:**
   - Connect tier system to Stripe subscription webhooks
   - Auto-update `subscription_tier` when payment succeeds
   - Handle subscription cancellations

2. **Add Feature Gates to UI:**
   - Grey out disabled features based on tier
   - Show upgrade prompts for locked features
   - Add tooltips explaining which tier unlocks each feature

3. **Usage Tracking:**
   - Track feature usage against limits
   - Warn users when approaching limits
   - Suggest upgrades based on usage patterns

4. **Upgrade Flow:**
   - Build pricing page showing all tiers
   - Add "Upgrade" buttons throughout app
   - Handle tier changes mid-month (prorating)

## Files Changed

- ✅ `/src/lib/tiers/tier-config.ts` - Created tier configuration
- ✅ `/src/lib/tiers/tier-service.ts` - Created tier service functions
- ✅ `/src/app/(main)/layout.tsx` - Fixed tier display in sidebar
- ✅ `/src/app/api/ai/generate-script/route.ts` - Enhanced auth logging

## Summary

You now have a complete tier system that:
- Defines 5 subscription levels with detailed features
- Tracks which features each tier can access
- Displays the correct tier in the UI
- Provides server-side functions to check feature access
- Integrates with existing database schema
- Ready for Stripe integration

Users will see "Free Plan" by default, and it will update automatically as they upgrade!
