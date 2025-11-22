-- ================================================
-- BRAND PACKAGES SYSTEM
-- ================================================
-- This migration creates the brand package system for storing
-- brand assets, logos, colors, mission statements, and reference images
-- to personalize AI content generation
-- ================================================

-- 1. Brand Packages Table
-- Stores the main brand information
CREATE TABLE IF NOT EXISTS public.brand_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  tagline TEXT,

  -- Brand Identity
  mission_statement TEXT,
  brand_voice TEXT, -- e.g., "Professional", "Casual", "Friendly", "Authoritative"
  brand_personality TEXT, -- e.g., "Innovative", "Traditional", "Bold", "Minimalist"
  target_audience TEXT,
  key_values TEXT[], -- Array of brand values

  -- Visual Identity
  primary_color TEXT, -- Hex color code
  secondary_color TEXT,
  accent_color TEXT,
  logo_url TEXT, -- URL to uploaded logo
  logo_dark_url TEXT, -- Dark mode version if available

  -- Contact & Social
  website_url TEXT,
  social_handles JSONB, -- { "instagram": "@handle", "tiktok": "@handle", etc. }

  -- Additional Info
  industry TEXT,
  established_year INTEGER,
  description TEXT,

  -- Settings
  is_default BOOLEAN DEFAULT false, -- One default brand per user
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Brand Assets Table
-- Stores uploaded files like logos, product photos, reference images
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_package_id UUID NOT NULL REFERENCES public.brand_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Asset Info
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'logo',
    'logo_dark',
    'product_photo',
    'reference_image',
    'avatar_photo',
    'background_image',
    'banner_image',
    'other'
  )),

  -- File Info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_size INTEGER, -- Size in bytes
  mime_type TEXT,

  -- Metadata
  title TEXT,
  description TEXT,
  tags TEXT[],

  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Brand Guidelines Table
-- Stores specific content guidelines and do's/don'ts
CREATE TABLE IF NOT EXISTS public.brand_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_package_id UUID NOT NULL REFERENCES public.brand_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content Guidelines
  dos TEXT[], -- Array of do's
  donts TEXT[], -- Array of don'ts
  preferred_topics TEXT[],
  avoided_topics TEXT[],

  -- Tone & Style
  tone_guidelines TEXT,
  writing_style TEXT,
  humor_level TEXT, -- 'none', 'light', 'moderate', 'heavy'
  formality_level TEXT, -- 'casual', 'semi-formal', 'formal', 'professional'

  -- Call to Action Preferences
  default_cta TEXT,
  cta_style TEXT,

  -- Hashtag Strategy
  branded_hashtags TEXT[],
  preferred_hashtags TEXT[],

  -- Video Preferences
  preferred_video_length TEXT, -- '15-30s', '30-60s', '1-2min', etc.
  preferred_music_genre TEXT,
  preferred_transitions TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Brand Avatars Table
-- Stores AI avatar configurations for video generation
CREATE TABLE IF NOT EXISTS public.brand_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_package_id UUID NOT NULL REFERENCES public.brand_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Avatar Info
  name TEXT NOT NULL,
  avatar_type TEXT NOT NULL CHECK (avatar_type IN (
    'self',        -- User themselves
    'team_member', -- Team member
    'influencer',  -- Influencer/creator
    'character',   -- Branded character
    'ai_generated' -- Fully AI-generated
  )),

  -- Reference Images
  reference_image_urls TEXT[], -- Multiple reference photos

  -- Avatar Configuration
  gender TEXT,
  age_range TEXT,
  ethnicity TEXT,
  voice_type TEXT, -- For future voice generation
  personality_traits TEXT[],

  -- Usage
  is_default BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_brand_packages_user_id ON public.brand_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_packages_is_default ON public.brand_packages(user_id, is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_brand_assets_brand_package_id ON public.brand_assets(brand_package_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_user_id ON public.brand_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON public.brand_assets(brand_package_id, asset_type);

CREATE INDEX IF NOT EXISTS idx_brand_guidelines_brand_package_id ON public.brand_guidelines(brand_package_id);

CREATE INDEX IF NOT EXISTS idx_brand_avatars_brand_package_id ON public.brand_avatars(brand_package_id);
CREATE INDEX IF NOT EXISTS idx_brand_avatars_is_default ON public.brand_avatars(brand_package_id, is_default) WHERE is_default = true;

-- 6. Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.brand_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_avatars ENABLE ROW LEVEL SECURITY;

-- Brand Packages Policies
CREATE POLICY "Users can view own brand packages"
  ON public.brand_packages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand packages"
  ON public.brand_packages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand packages"
  ON public.brand_packages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand packages"
  ON public.brand_packages FOR DELETE
  USING (auth.uid() = user_id);

-- Brand Assets Policies
CREATE POLICY "Users can view own brand assets"
  ON public.brand_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand assets"
  ON public.brand_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand assets"
  ON public.brand_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand assets"
  ON public.brand_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Brand Guidelines Policies
CREATE POLICY "Users can view own brand guidelines"
  ON public.brand_guidelines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand guidelines"
  ON public.brand_guidelines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand guidelines"
  ON public.brand_guidelines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand guidelines"
  ON public.brand_guidelines FOR DELETE
  USING (auth.uid() = user_id);

-- Brand Avatars Policies
CREATE POLICY "Users can view own brand avatars"
  ON public.brand_avatars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand avatars"
  ON public.brand_avatars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand avatars"
  ON public.brand_avatars FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand avatars"
  ON public.brand_avatars FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Automatic Timestamp Updates

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brand_packages_updated_at
  BEFORE UPDATE ON public.brand_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_assets_updated_at
  BEFORE UPDATE ON public.brand_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_guidelines_updated_at
  BEFORE UPDATE ON public.brand_guidelines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_avatars_updated_at
  BEFORE UPDATE ON public.brand_avatars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Add brand_package_id to campaigns table (optional reference)
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS brand_package_id UUID REFERENCES public.brand_packages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_brand_package_id ON public.campaigns(brand_package_id);

-- 9. Create Storage Bucket for Brand Assets (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true);

-- 10. Storage Policies (run this in Supabase dashboard after creating bucket)
-- CREATE POLICY "Users can upload brand assets"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can view own brand assets"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can update own brand assets"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can delete own brand assets"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
