-- ============================================================================
-- CAMPAIGNS SYSTEM - Full Automation Infrastructure
-- ============================================================================

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
  video_id UUID,
  scheduled_post_id UUID,

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

-- Note: scheduled_posts table will be created in a future migration when needed

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
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_post_id ON public.campaign_analytics(campaign_post_id);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);

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

-- Videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own videos" ON public.videos;
CREATE POLICY "Users can view their own videos"
  ON public.videos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all videos" ON public.videos;
CREATE POLICY "Service role can manage all videos"
  ON public.videos FOR ALL
  USING (true);

-- Scheduled Posts policies will be added in future migration

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
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

DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
