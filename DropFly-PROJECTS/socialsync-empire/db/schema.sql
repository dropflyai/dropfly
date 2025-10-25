-- SocialSync Empire Suite Complete Database Schema
-- Version: 2.0 (includes watermark-remover + content-creation tables)
-- Compatible with: Supabase PostgreSQL
-- Last Updated: 2025-10-24

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- CORE TABLES (User Management)
-- ==============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  tier TEXT CHECK (tier IN ('free','starter','pro','enterprise')) DEFAULT 'free',
  white_label_config JSONB,
  burn_rate_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- VIDEO GENERATION TABLES
-- ==============================================================================

-- Renders table (AI video generation tracking)
CREATE TABLE IF NOT EXISTS renders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  engine TEXT CHECK (engine IN ('kling','veo3','runway','seedance')) NOT NULL,
  mp4_url TEXT,
  token_cost INTEGER NOT NULL,
  margin_cents INTEGER NOT NULL,
  ban_rate DECIMAL(5,4) DEFAULT 0.0000,
  duration_seconds INTEGER,
  aspect_ratio TEXT,
  quality TEXT,
  status TEXT CHECK (status IN ('pending','processing','completed','failed')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- SOCIAL MEDIA TABLES
-- ==============================================================================

-- Posts table (scheduled social posts)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  render_id UUID REFERENCES renders(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT,
  platform TEXT CHECK (platform IN ('tiktok','instagram','youtube','twitter','facebook','linkedin')) NOT NULL,
  caption TEXT,
  media_url TEXT,
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft','scheduled','posted','failed')) DEFAULT 'draft',
  engagement JSONB, -- {views, likes, shares, comments}
  post_type TEXT CHECK (post_type IN ('educational','promotional','engagement','viral')),
  is_product_ad BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- BRAND VOICE & IDENTITY TABLES
-- ==============================================================================

-- Brand configs table (comprehensive brand identity)
CREATE TABLE IF NOT EXISTS brand_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  tagline TEXT,
  industry TEXT,
  target_audience TEXT,

  -- Brand voice config (JSON from content-creation)
  voice_config JSONB, -- {core, essence, principles, toneModifiers}

  -- Visual brand config
  visual_config JSONB, -- {colors, fonts, logo, watermark}

  -- Content strategy
  content_strategy JSONB, -- {pillars, postingFrequency, hashtagStrategy}

  -- Platform-specific tones
  platform_tones JSONB, -- {linkedin: "...", tiktok: "...", etc}

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product catalog table (products/services for AI to reference)
CREATE TABLE IF NOT EXISTS product_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_config_id UUID REFERENCES brand_configs(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  key_features JSONB, -- Array of features
  pricing TEXT,
  product_url TEXT,
  content_focus TEXT,
  use_cases JSONB, -- Array of use cases
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Content templates table (script/caption templates)
CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('video_script','caption','hook','cta')) NOT NULL,
  platform TEXT, -- NULL for universal templates
  template_content TEXT NOT NULL,
  variables JSONB, -- {name: "...", description: "..."}[]
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TREND RADAR TABLES
-- ==============================================================================

-- Trends table (15-min polling)
CREATE TABLE IF NOT EXISTS trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  trending_sound_url TEXT,
  trending_hashtags TEXT[],
  trending_topics TEXT[],
  viral_score INTEGER,
  category TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- WHITE-LABEL & AGENCIES TABLES
-- ==============================================================================

-- White-label accounts (agencies)
CREATE TABLE IF NOT EXISTS white_label_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  brand_colors JSONB, -- {primary, secondary, accent}
  custom_config JSONB, -- custom settings per agency
  sub_accounts JSONB, -- Array of client user_ids
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ANALYTICS & TRACKING TABLES
-- ==============================================================================

-- Usage tracking (for billing and analytics)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'render', 'post', 'download', 'convert', etc.
  cost_cents INTEGER DEFAULT 0,
  metadata JSONB, -- Additional tracking data
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ban events (track account bans/warnings)
CREATE TABLE IF NOT EXISTS ban_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('warning','shadow_ban','ban','recovery')) NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  reason TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Renders indexes
CREATE INDEX IF NOT EXISTS idx_renders_user_id ON renders(user_id);
CREATE INDEX IF NOT EXISTS idx_renders_created_at ON renders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_renders_status ON renders(status);
CREATE INDEX IF NOT EXISTS idx_renders_engine ON renders(engine);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_is_product_ad ON posts(is_product_ad);

-- Brand configs indexes
CREATE INDEX IF NOT EXISTS idx_brand_configs_user_id ON brand_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_configs_is_active ON brand_configs(is_active);

-- Product catalog indexes
CREATE INDEX IF NOT EXISTS idx_product_catalog_user_id ON product_catalog(user_id);
CREATE INDEX IF NOT EXISTS idx_product_catalog_brand_config_id ON product_catalog(brand_config_id);

-- Trends indexes
CREATE INDEX IF NOT EXISTS idx_trends_platform ON trends(platform);
CREATE INDEX IF NOT EXISTS idx_trends_expires_at ON trends(expires_at);
CREATE INDEX IF NOT EXISTS idx_trends_created_at ON trends(created_at DESC);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_action_type ON usage_tracking(action_type);

-- Ban events indexes
CREATE INDEX IF NOT EXISTS idx_ban_events_user_id ON ban_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ban_events_platform ON ban_events(platform);
CREATE INDEX IF NOT EXISTS idx_ban_events_created_at ON ban_events(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ban_events ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Renders policies
CREATE POLICY "Users can view own renders" ON renders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own renders" ON renders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Brand configs policies
CREATE POLICY "Users can view own brand configs" ON brand_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand configs" ON brand_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand configs" ON brand_configs FOR UPDATE USING (auth.uid() = user_id);

-- Product catalog policies
CREATE POLICY "Users can view own products" ON product_catalog FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON product_catalog FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON product_catalog FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON product_catalog FOR DELETE USING (auth.uid() = user_id);

-- Content templates policies
CREATE POLICY "Users can view own templates" ON content_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON content_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON content_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON content_templates FOR DELETE USING (auth.uid() = user_id);

-- White-label policies
CREATE POLICY "Users can view own white-label accounts" ON white_label_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own white-label accounts" ON white_label_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own white-label accounts" ON white_label_accounts FOR UPDATE USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);

-- Ban events policies
CREATE POLICY "Users can view own ban events" ON ban_events FOR SELECT USING (auth.uid() = user_id);

-- ==============================================================================
-- FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_configs_updated_at BEFORE UPDATE ON brand_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_catalog_updated_at BEFORE UPDATE ON product_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_white_label_accounts_updated_at BEFORE UPDATE ON white_label_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ==============================================================================

-- Sample brand config (can be deleted after testing)
-- INSERT INTO brand_configs (user_id, brand_name, tagline, industry, target_audience, voice_config, visual_config)
-- VALUES (
--   'your-user-id',
--   'SocialSync Demo',
--   'AI-Powered Video Creation',
--   'B2B SaaS',
--   'Content creators and agencies',
--   '{"core": "Professional yet friendly", "essence": "Innovative creator's best friend"}'::jsonb,
--   '{"primaryColor": "#3B82F6", "secondaryColor": "#8B5CF6", "logo": "https://..."}'::jsonb
-- );

-- ==============================================================================
-- SCHEMA COMPLETE
-- ==============================================================================

COMMENT ON TABLE users IS 'Core user accounts with tier and config';
COMMENT ON TABLE renders IS 'AI video generation tracking with cost/margin';
COMMENT ON TABLE posts IS 'Social media posts across all platforms';
COMMENT ON TABLE brand_configs IS 'Complete brand identity and voice configuration';
COMMENT ON TABLE product_catalog IS 'Products/services for AI content generation';
COMMENT ON TABLE content_templates IS 'Reusable script and caption templates';
COMMENT ON TABLE trends IS 'Real-time trending topics and sounds';
COMMENT ON TABLE white_label_accounts IS 'Agency white-label configurations';
COMMENT ON TABLE usage_tracking IS 'Usage metrics for billing and analytics';
COMMENT ON TABLE ban_events IS 'Platform ban/warning tracking';
