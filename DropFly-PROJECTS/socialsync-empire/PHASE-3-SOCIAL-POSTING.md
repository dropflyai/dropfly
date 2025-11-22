# Phase 3: Social Media Posting Automation

## Overview
Automatically post generated videos to TikTok, Instagram, YouTube, Facebook, Twitter, and LinkedIn.

## API Solution: Ayrshare (Recommended ⭐)

### Why Ayrshare?
- ✅ Single API for all platforms (TikTok, Instagram, YouTube, Facebook, Twitter, LinkedIn)
- ✅ No need for individual OAuth flows per platform
- ✅ Simple REST API
- ✅ Scheduling built-in
- ✅ Analytics tracking
- ✅ Reasonable pricing

### Pricing
- **Free**: 10 posts/month
- **Growth**: $49/month - 150 posts/month
- **Business**: $149/month - 1000 posts/month
- **Per Post**: ~$0.33-0.50 each

## Implementation Plan

### Step 1: Social Account Connection UI
**File**: `src/app/settings/social-accounts/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ConnectedAccount {
  platform: string;
  username: string;
  connected_at: string;
  status: string;
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [connecting, setConnecting] = useState(false);

  const platforms = [
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-pink-500 to-purple-500' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'from-purple-500 to-pink-500' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'from-red-500 to-red-600' },
    { id: 'facebook', name: 'Facebook', icon: '👥', color: 'from-blue-500 to-blue-600' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'from-sky-400 to-sky-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-700' }
  ];

  async function connectPlatform(platform: string) {
    setConnecting(true);
    try {
      // Generate Ayrshare OAuth URL
      const res = await fetch(`/api/social/connect?platform=${platform}`);
      const { authUrl } = await res.json();

      // Open OAuth popup
      window.open(authUrl, '_blank', 'width=600,height=700');

      // Poll for connection status
      const interval = setInterval(async () => {
        const statusRes = await fetch(`/api/social/status?platform=${platform}`);
        const { connected } = await statusRes.json();
        if (connected) {
          clearInterval(interval);
          await fetchAccounts();
          setConnecting(false);
        }
      }, 2000);

    } catch (error) {
      console.error('Failed to connect:', error);
      setConnecting(false);
    }
  }

  async function disconnectPlatform(platform: string) {
    if (!confirm(`Disconnect ${platform}? You won't be able to post to this platform.`)) {
      return;
    }

    try {
      await fetch(`/api/social/disconnect?platform=${platform}`, { method: 'DELETE' });
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  async function fetchAccounts() {
    const res = await fetch('/api/social/accounts');
    const data = await res.json();
    setAccounts(data.accounts || []);
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  function isConnected(platformId: string) {
    return accounts.some(acc => acc.platform === platformId && acc.status === 'active');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Social Media Accounts
          </h1>
          <p className="text-gray-600">
            Connect your social media accounts to enable automatic posting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map(platform => {
            const connected = isConnected(platform.id);
            const account = accounts.find(acc => acc.platform === platform.id);

            return (
              <div key={platform.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-2xl`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{platform.name}</h3>
                      {connected && account && (
                        <p className="text-sm text-gray-600">@{account.username}</p>
                      )}
                    </div>
                  </div>
                  {connected ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Connected
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      Not Connected
                    </span>
                  )}
                </div>

                {connected ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Connected {new Date(account!.connected_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => disconnectPlatform(platform.id)}
                      className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => connectPlatform(platform.id)}
                    disabled={connecting}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {connecting ? 'Connecting...' : 'Connect Account'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Social Posting API
**File**: `src/app/api/social/post/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      campaign_post_id,
      video_url,
      caption,
      platforms,
      schedule_time
    } = await request.json();

    // Token cost: 8 tokens per platform
    const tokenCost = platforms.length * 8;

    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation: 'social_posting',
      cost: tokenCost,
      description: `Post to ${platforms.join(', ')}`,
      metadata: { campaign_post_id, platforms }
    });

    if (!deductionResult.success) {
      return NextResponse.json({
        error: 'Insufficient tokens',
        required: tokenCost
      }, { status: 403 });
    }

    try {
      // Post via Ayrshare
      const ayrshareResponse = await fetch('https://app.ayrshare.com/api/post', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post: caption,
          platforms: platforms,
          mediaUrls: [video_url],
          scheduleDate: schedule_time ? new Date(schedule_time).toISOString() : undefined,
          shortenLinks: true
        })
      });

      const postResult = await ayrshareResponse.json();

      if (!ayrshareResponse.ok) {
        throw new Error(postResult.message || 'Failed to post');
      }

      // Update campaign post
      await supabase
        .from('campaign_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          metadata: {
            ...postResult,
            platforms
          }
        })
        .eq('id', campaign_post_id);

      return NextResponse.json({
        success: true,
        postIds: postResult.postIds,
        tokensUsed: tokenCost
      });

    } catch (apiError: any) {
      // Refund tokens
      if (deductionResult.transaction?.id) {
        await tokenService.refundTokens(
          user.id,
          deductionResult.transaction.id,
          'Social posting failed'
        );
      }
      throw apiError;
    }

  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Posting failed'
    }, { status: 500 });
  }
}
```

### Step 3: Auto-Posting Cron Job
**File**: `src/app/api/cron/publish-campaign-posts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Find posts ready to publish
    const { data: readyPosts } = await supabase
      .from('campaign_posts')
      .select('*, campaigns!inner(*)')
      .eq('status', 'video_ready')
      .is('published_at', null)
      .limit(20);

    if (!readyPosts?.length) {
      return NextResponse.json({
        success: true,
        message: 'No posts ready to publish',
        processed: 0
      });
    }

    const results = { processed: 0, succeeded: 0, failed: 0 };

    for (const post of readyPosts) {
      results.processed++;

      try {
        // Build caption from script
        const caption = `${post.script.hook}\n\n${post.script.cta}\n\n${post.script.hashtags.map((h: string) => `#${h}`).join(' ')}`;

        // Post to platforms
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/social/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign_post_id: post.id,
            video_url: post.video_url,
            caption,
            platforms: post.campaigns.platforms
          })
        });

        if (response.ok) {
          results.succeeded++;
        } else {
          results.failed++;
        }

      } catch (error) {
        results.failed++;
        console.error(`Failed to publish post ${post.id}:`, error);
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 4: Update vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-campaign-posts",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/generate-campaign-videos",
      "schedule": "15 * * * *"
    },
    {
      "path": "/api/cron/publish-campaign-posts",
      "schedule": "30 * * * *"
    }
  ]
}
```

### Step 5: Update Campaign Settings

Add auto-publish toggle to campaign creation:

```typescript
// In campaign form
const [formData, setFormData] = useState({
  // ... existing fields
  auto_publish: true, // NEW
  publish_delay_minutes: 60 // NEW - wait 1 hour after video before posting
});
```

### Step 6: Environment Variables

```
AYRSHARE_API_KEY=your_ayrshare_api_key_here
```

## Flow Diagram

```
Campaign Created
  ↓ (hourly cron)
Script Generated → status: 'ready'
  ↓ (15min cron)
Video Generated → status: 'video_ready'
  ↓ (30min cron)
Posted to Social Media → status: 'published'
  ↓
Analytics Collected
```

## Token Economics

- Script: 7 tokens
- Video: 75 tokens
- Posting (5 platforms): 40 tokens
- **Total per post**: 122 tokens ($1.22)

## Success Criteria

- ✅ Users can connect social accounts
- ✅ Posts auto-publish to all selected platforms
- ✅ Scheduling works correctly
- ✅ Post IDs tracked for analytics
- ✅ Failed posts retry automatically
- ✅ Users can disable auto-posting per campaign

## Testing

1. Connect TikTok test account
2. Create campaign with auto_publish=true
3. Wait for script → video → posting flow
4. Check TikTok for posted video
5. Verify caption and hashtags correct

## Progress After Phase 3

**9.5/10** - Nearly complete automation! 🎉
