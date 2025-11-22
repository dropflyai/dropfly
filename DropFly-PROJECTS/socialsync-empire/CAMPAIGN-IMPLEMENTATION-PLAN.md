# Campaign System Implementation Plan

## Overview
This document outlines the step-by-step implementation of the campaign-based automation system for SocialSync Empire.

---

## Phase 1: Database Foundation (30 minutes)

### Step 1.1: Create Campaign Tables Migration

**File**: `supabase/migrations/005_create_campaigns_system.sql`

```sql
-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  description TEXT,

  -- Platform Configuration
  platforms TEXT[] NOT NULL CHECK (array_length(platforms, 1) > 0),

  -- Scheduling
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', '3x_week', 'weekly', 'custom')),
  post_times TEXT[] NOT NULL, -- ['09:00', '14:00', '18:00']
  timezone TEXT DEFAULT 'America/New_York',

  -- Content Generation Settings
  creator_mode TEXT DEFAULT 'ugc' CHECK (creator_mode IN ('ugc', 'educational', 'entertainment', 'review', 'tutorial')),
  video_engine TEXT DEFAULT 'kling-2.1',
  video_duration_min INTEGER DEFAULT 30,
  video_duration_max INTEGER DEFAULT 60,

  -- AI Instructions
  content_style TEXT,
  target_audience TEXT,
  key_messages TEXT[],

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'error')),
  next_post_at TIMESTAMPTZ,
  last_post_at TIMESTAMPTZ,

  -- Metrics
  total_posts INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CAMPAIGN POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,

  -- Content References
  content_id UUID REFERENCES public.content(id),
  video_id UUID REFERENCES public.videos(id),
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id),

  -- Generation Data
  topic TEXT,
  script JSONB,
  video_url TEXT,
  thumbnail_url TEXT,

  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating_script', 'generating_video', 'ready', 'scheduled', 'published', 'failed')),
  error_message TEXT,

  -- Scheduled Time
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CAMPAIGN ANALYTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  campaign_post_id UUID REFERENCES public.campaign_posts(id),

  -- Platform
  platform TEXT NOT NULL,
  post_url TEXT,

  -- Metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),

  -- Collection
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VIDEOS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id),

  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  format TEXT DEFAULT 'mp4',
  width INTEGER,
  height INTEGER,

  status TEXT DEFAULT 'ready' CHECK (status IN ('generating', 'ready', 'failed')),
  engine TEXT, -- 'kling-2.1', 'hailuo', etc.

  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SCHEDULED POSTS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id),

  title TEXT NOT NULL,
  caption TEXT,
  platforms TEXT[] NOT NULL,

  scheduled_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'publishing', 'published', 'failed')),
  error_message TEXT,

  published_ids JSONB, -- {instagram: 'post_id', tiktok: 'post_id'}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_next_post_at ON public.campaigns(next_post_at);

CREATE INDEX IF NOT EXISTS idx_campaign_posts_campaign_id ON public.campaign_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_status ON public.campaign_posts(status);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_scheduled_for ON public.campaign_posts(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
CREATE POLICY "Users can create their own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all campaigns" ON public.campaigns;
CREATE POLICY "Service role can manage all campaigns"
  ON public.campaigns FOR ALL
  USING (true);

-- Campaign Posts
ALTER TABLE public.campaign_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their campaign posts" ON public.campaign_posts;
CREATE POLICY "Users can view their campaign posts"
  ON public.campaign_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_posts.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role can manage all campaign posts" ON public.campaign_posts;
CREATE POLICY "Service role can manage all campaign posts"
  ON public.campaign_posts FOR ALL
  USING (true);

-- Campaign Analytics
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their campaign analytics" ON public.campaign_analytics;
CREATE POLICY "Users can view their campaign analytics"
  ON public.campaign_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role can manage all campaign analytics" ON public.campaign_analytics;
CREATE POLICY "Service role can manage all campaign analytics"
  ON public.campaign_analytics FOR ALL
  USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate next post time
CREATE OR REPLACE FUNCTION calculate_next_post_time(
  p_frequency TEXT,
  p_post_times TEXT[],
  p_timezone TEXT,
  p_last_post_at TIMESTAMPTZ
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
  next_time TIMESTAMPTZ;
  current_time TIMESTAMPTZ;
BEGIN
  current_time := NOW() AT TIME ZONE p_timezone;

  -- For daily: next available time slot
  IF p_frequency = 'daily' THEN
    -- Find next time slot after current time
    FOR i IN 1..array_length(p_post_times, 1) LOOP
      next_time := (CURRENT_DATE || ' ' || p_post_times[i])::TIMESTAMPTZ AT TIME ZONE p_timezone;
      IF next_time > current_time THEN
        RETURN next_time;
      END IF;
    END LOOP;
    -- If no time slot today, use first slot tomorrow
    RETURN ((CURRENT_DATE + INTERVAL '1 day') || ' ' || p_post_times[1])::TIMESTAMPTZ AT TIME ZONE p_timezone;
  END IF;

  -- For 3x_week and weekly: add interval to last post
  IF p_frequency = '3x_week' THEN
    RETURN p_last_post_at + INTERVAL '2 days';
  END IF;

  IF p_frequency = 'weekly' THEN
    RETURN p_last_post_at + INTERVAL '7 days';
  END IF;

  RETURN current_time + INTERVAL '1 day';
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_posts_updated_at ON public.campaign_posts;
CREATE TRIGGER update_campaign_posts_updated_at
  BEFORE UPDATE ON public.campaign_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 1.2: Run Migration

```bash
npm run db:migrate
```

---

## Phase 2: Backend API Endpoints (2 hours)

### Step 2.1: Campaign CRUD API

**File**: `src/app/api/campaigns/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';

// GET /api/campaigns - List user's campaigns
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('[Campaigns GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      niche,
      description,
      platforms,
      frequency,
      post_times,
      timezone,
      creator_mode,
      video_engine,
      video_duration_min,
      video_duration_max,
      content_style,
      target_audience,
      key_messages
    } = body;

    // Validation
    if (!name || !niche || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Name, niche, and at least one platform are required' },
        { status: 400 }
      );
    }

    if (!frequency || !post_times || post_times.length === 0) {
      return NextResponse.json(
        { error: 'Frequency and post times are required' },
        { status: 400 }
      );
    }

    // Calculate token requirements
    const postsPerMonth = frequency === 'daily' ? 30 : frequency === '3x_week' ? 12 : 4;
    const tokensPerPost = 90; // 7 (script) + 75 (video) + 8 (posting)
    const monthlyTokens = postsPerMonth * tokensPerPost;

    // Check if user has enough tokens for at least 1 week
    const weeklyTokens = Math.ceil(monthlyTokens / 4);
    const balance = await tokenService.getBalance(user.id);

    if (balance < weeklyTokens) {
      return NextResponse.json({
        error: 'Insufficient tokens',
        required: weeklyTokens,
        current: balance,
        message: `You need at least ${weeklyTokens} tokens to run this campaign for 1 week`
      }, { status: 403 });
    }

    // Calculate next post time
    const nextPostAt = new Date();
    nextPostAt.setHours(parseInt(post_times[0].split(':')[0]), parseInt(post_times[0].split(':')[1]), 0, 0);
    if (nextPostAt < new Date()) {
      nextPostAt.setDate(nextPostAt.getDate() + 1);
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name,
        niche,
        description,
        platforms,
        frequency,
        post_times,
        timezone: timezone || 'America/New_York',
        creator_mode: creator_mode || 'ugc',
        video_engine: video_engine || 'kling-2.1',
        video_duration_min: video_duration_min || 30,
        video_duration_max: video_duration_max || 60,
        content_style,
        target_audience,
        key_messages,
        status: 'active',
        next_post_at: nextPostAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      campaign,
      estimated_monthly_cost: monthlyTokens,
      estimated_weekly_cost: weeklyTokens
    });

  } catch (error: any) {
    console.error('[Campaigns POST] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 2.2: Campaign Management API

**File**: `src/app/api/campaigns/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/campaigns/[id] - Get campaign details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_posts (
          id,
          topic,
          status,
          scheduled_for,
          published_at,
          created_at
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error: any) {
    console.error('[Campaign GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/campaigns/[id] - Update campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, ...updateData } = body;

    // Don't allow updating certain fields
    delete updateData.user_id;
    delete updateData.id;
    delete updateData.created_at;

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({ ...updateData, status })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error('[Campaign PATCH] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Campaign DELETE] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 2.3: Cron Job - Generate Campaign Posts

**File**: `src/app/api/cron/generate-campaign-posts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAnthropicClient } from '@/lib/anthropic';
import { tokenService } from '@/lib/tokens/token-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Generating campaign posts...');

    // Get all active campaigns that need posts
    const now = new Date();
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .lte('next_post_at', now.toISOString());

    if (error) throw error;

    console.log(`[Cron] Found ${campaigns?.length || 0} campaigns ready for posting`);

    const results = [];

    for (const campaign of campaigns || []) {
      try {
        // Check user's token balance
        const balance = await tokenService.getBalance(campaign.user_id);
        if (balance < 90) {
          // Not enough tokens - pause campaign
          await supabase
            .from('campaigns')
            .update({ status: 'paused' })
            .eq('id', campaign.id);

          console.log(`[Cron] Campaign ${campaign.id} paused - insufficient tokens`);
          results.push({ campaign_id: campaign.id, status: 'paused', reason: 'insufficient_tokens' });
          continue;
        }

        // Generate script
        const scriptResult = await generateScript(campaign);

        if (!scriptResult.success) {
          results.push({ campaign_id: campaign.id, status: 'failed', error: scriptResult.error });
          continue;
        }

        // Create campaign post record
        const { data: campaignPost, error: postError } = await supabase
          .from('campaign_posts')
          .insert({
            campaign_id: campaign.id,
            content_id: scriptResult.contentId,
            topic: scriptResult.topic,
            script: scriptResult.script,
            status: 'ready', // Will be 'generating_video' in Phase 2
            scheduled_for: campaign.next_post_at
          })
          .select()
          .single();

        if (postError) throw postError;

        // Update campaign next_post_at
        const nextPostAt = calculateNextPostTime(campaign);
        await supabase
          .from('campaigns')
          .update({
            next_post_at: nextPostAt,
            last_post_at: now.toISOString(),
            total_posts: campaign.total_posts + 1
          })
          .eq('id', campaign.id);

        results.push({ campaign_id: campaign.id, status: 'success', post_id: campaignPost.id });

      } catch (campaignError: any) {
        console.error(`[Cron] Error processing campaign ${campaign.id}:`, campaignError);
        results.push({ campaign_id: campaign.id, status: 'error', error: campaignError.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error: any) {
    console.error('[Cron] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to generate script
async function generateScript(campaign: any) {
  try {
    const anthropic = getAnthropicClient();

    // Generate topic based on campaign niche
    const topic = await generateTopic(campaign.niche, campaign.key_messages);

    // Generate script
    const prompt = buildScriptPrompt(campaign, topic);

    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      temperature: 0.8,
      system: 'You are an expert content creator who generates viral video scripts. Always respond with valid JSON only.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = completion.content[0]?.type === 'text' ? completion.content[0].text : null;
    if (!content) throw new Error('No content generated');

    let scriptData;
    try {
      scriptData = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response');
      }
    }

    // Deduct tokens
    await tokenService.deductTokens({
      userId: campaign.user_id,
      operation: 'script_generation',
      cost: 7,
      description: `Campaign: ${campaign.name} - ${topic}`,
      metadata: { campaign_id: campaign.id, topic }
    });

    // Save to content table
    const { data: savedContent, error: dbError } = await supabase
      .from('content')
      .insert({
        user_id: campaign.user_id,
        title: topic,
        type: 'script',
        content: scriptData,
        metadata: {
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          creator_mode: campaign.creator_mode,
          generated_at: new Date().toISOString()
        },
        status: 'draft'
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      success: true,
      contentId: savedContent.id,
      topic,
      script: scriptData
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Helper function to generate topic
async function generateTopic(niche: string, keyMessages: string[] | null): Promise<string> {
  const anthropic = getAnthropicClient();

  let prompt = `Generate a single viral video topic for the niche: "${niche}".`;
  if (keyMessages && keyMessages.length > 0) {
    prompt += `\nKey messages to incorporate: ${keyMessages.join(', ')}`;
  }
  prompt += `\n\nRespond with ONLY the topic text, no additional formatting.`;

  const completion = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 100,
    temperature: 0.9,
    messages: [{ role: 'user', content: prompt }]
  });

  return completion.content[0]?.type === 'text' ? completion.content[0].text.trim() : 'Trending topic';
}

// Helper function to build script prompt
function buildScriptPrompt(campaign: any, topic: string): string {
  const prompts: Record<string, string> = {
    ugc: `You are an expert UGC creator. Create a viral video script for ${campaign.platforms.join('/')} about: "${topic}"`,
    educational: `You are an educational content creator. Create an educational video script about: "${topic}"`,
    entertainment: `You are a viral entertainment creator. Create an entertaining video script about: "${topic}"`,
    review: `You are a product review expert. Create a review video script about: "${topic}"`,
    tutorial: `You are a tutorial creator. Create a step-by-step tutorial script about: "${topic}"`
  };

  let prompt = prompts[campaign.creator_mode] || prompts.ugc;

  if (campaign.content_style) {
    prompt += `\n\nContent style: ${campaign.content_style}`;
  }

  if (campaign.target_audience) {
    prompt += `\nTarget audience: ${campaign.target_audience}`;
  }

  prompt += `\n\nFormat the response as JSON:\n{\n  "hook": "First 3 seconds",\n  "script": "Full script",\n  "cta": "Call to action",\n  "hashtags": ["tag1", "tag2"],\n  "duration": "${campaign.video_duration_min}-${campaign.video_duration_max} seconds"\n}`;

  return prompt;
}

// Helper function to calculate next post time
function calculateNextPostTime(campaign: any): string {
  const now = new Date();
  const postTimes = campaign.post_times;

  if (campaign.frequency === 'daily') {
    // Find next time slot
    for (const time of postTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      const nextTime = new Date(now);
      nextTime.setHours(hours, minutes, 0, 0);

      if (nextTime > now) {
        return nextTime.toISOString();
      }
    }

    // No more slots today, use first slot tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = postTimes[0].split(':').map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow.toISOString();
  }

  if (campaign.frequency === '3x_week') {
    const next = new Date(now);
    next.setDate(next.getDate() + 2);
    return next.toISOString();
  }

  if (campaign.frequency === 'weekly') {
    const next = new Date(now);
    next.setDate(next.getDate() + 7);
    return next.toISOString();
  }

  return now.toISOString();
}
```

---

## Phase 3: Frontend UI (3 hours)

### Step 3.1: Campaigns List Page

**File**: `src/app/campaigns/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  niche: string;
  platforms: string[];
  frequency: string;
  status: string;
  total_posts: number;
  next_post_at: string;
  created_at: string;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Campaigns
            </h1>
            <p className="text-gray-600">
              Automated content campaigns running on autopilot
            </p>
          </div>
          <Link
            href="/campaigns/create"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            + Create Campaign
          </Link>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first automated campaign to start generating content
            </p>
            <Link
              href="/campaigns/create"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {campaign.total_posts} posts
                  </span>
                </div>

                {/* Campaign Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {campaign.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {campaign.niche}
                </p>

                {/* Platforms */}
                <div className="flex gap-2 mb-4">
                  {campaign.platforms.map(platform => (
                    <span
                      key={platform}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                    >
                      {platform}
                    </span>
                  ))}
                </div>

                {/* Schedule */}
                <div className="border-t pt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Frequency:</span>
                    <span className="font-medium">{campaign.frequency}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Next post:</span>
                    <span className="font-medium">
                      {formatDate(campaign.next_post_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 3.2: Create Campaign Page

**File**: `src/app/campaigns/create/page.tsx`

This would be a comprehensive form with:
- Campaign name & description
- Niche selection
- Platform multi-select
- Frequency selector
- Time picker for post times
- Creator mode selection
- Content style preferences
- Token cost calculator

(Full implementation available upon request - keeping this plan doc focused)

### Step 3.3: Campaign Detail Page

**File**: `src/app/campaigns/[id]/page.tsx`

Shows:
- Campaign overview
- Performance metrics
- List of all posts (past and upcoming)
- Pause/Resume controls
- Edit campaign button
- Analytics charts

---

## Phase 4: Vercel Cron Configuration (15 minutes)

### Step 4.1: Add Vercel Cron Config

**File**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-campaign-posts",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Step 4.2: Set Environment Variables in Vercel

```bash
CRON_SECRET=<generate-random-secret>
```

---

## Phase 5: Testing (1 hour)

### Test Checklist

- [ ] Create campaign via UI
- [ ] Verify campaign appears in database
- [ ] Manually trigger cron job: `curl -X POST https://yourdomain.com/api/cron/generate-campaign-posts -H "Authorization: Bearer YOUR_CRON_SECRET"`
- [ ] Verify script generated
- [ ] Verify campaign_post record created
- [ ] Verify next_post_at updated
- [ ] Test pause/resume campaign
- [ ] Test insufficient tokens scenario
- [ ] Test campaign deletion

---

## Token Cost Summary

### Per Complete Post (MVP)
- Script Generation: 7 tokens
- **Total MVP**: 7 tokens/post

### Per Complete Post (Phase 2)
- Script Generation: 7 tokens
- Video Generation: 75 tokens
- Social Posting: 8 tokens
- **Total Phase 2**: 90 tokens/post

### Monthly Costs by Frequency
- **Daily (30 posts)**: 210 tokens (MVP) / 2,700 tokens (Phase 2)
- **3x/week (12 posts)**: 84 tokens (MVP) / 1,080 tokens (Phase 2)
- **Weekly (4 posts)**: 28 tokens (MVP) / 360 tokens (Phase 2)

---

## Implementation Timeline

### MVP (Script Generation Only)
- **Day 1**: Database migrations + Campaign CRUD API (4 hours)
- **Day 2**: Cron job for script generation (3 hours)
- **Day 3**: Frontend UI - List & Create pages (6 hours)
- **Day 4**: Testing & bug fixes (4 hours)
- **Total**: ~17 hours

### Phase 2 (Add Video Generation)
- Video generation service integration
- Update cron to generate videos
- **Additional**: ~8 hours

### Phase 3 (Add Social Posting)
- Ayrshare integration
- Publishing cron job
- **Additional**: ~6 hours

---

## Migration Path for Existing Users

### Option 1: Parallel Systems
- Keep existing `/create` page for one-off posts
- Add new `/campaigns` section
- Users can use both workflows

### Option 2: Gradual Migration
- Phase 1: Launch campaigns alongside existing features
- Phase 2: Add "Convert to Campaign" button on existing posts
- Phase 3: Deprecate one-off workflow (6 months later)

**Recommendation**: Option 1 - Parallel systems give users flexibility

---

## Next Steps

1. **Review this plan** - Confirm architecture and approach
2. **Create database migration** - Run migration 005
3. **Build MVP APIs** - Campaign CRUD + Cron job
4. **Build MVP UI** - Campaigns list + Create form
5. **Deploy & test** - Vercel deployment with cron
6. **Add video generation** - Phase 2
7. **Add social posting** - Phase 3

---

## Questions to Resolve

1. Should campaigns auto-pause when tokens are low, or send notification only?
2. What happens to scheduled posts if campaign is deleted?
3. Should users be able to preview/edit AI-generated topics before scripts are created?
4. Should campaigns have a budget cap (max tokens to spend)?
5. Analytics collection - real-time or daily batch?

---

## Success Metrics

### Technical
- Campaign creation success rate > 95%
- Cron job execution reliability > 99%
- Script generation success rate > 90%
- Average post generation time < 2 minutes

### Business
- % of users creating campaigns
- Average campaigns per user
- Campaign retention rate (active after 30 days)
- Token consumption rate
- User satisfaction with automation

---

Ready to start implementation? Let's begin with the database migration!
