-- Migration 007: Storage Buckets and Error Logging
-- Created: November 5, 2025
-- Purpose: Set up storage for campaign videos and brand assets + error tracking

-- ============================================================================
-- ERROR LOGGING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT,
  method TEXT,
  status_code INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for error logs
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_path ON public.error_logs(path);

-- RLS for error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own errors
CREATE POLICY "Users can view their own error logs"
  ON public.error_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can insert errors
CREATE POLICY "Service role can insert error logs"
  ON public.error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Note: Storage buckets must be created via Supabase Dashboard or API
-- This SQL provides the configuration reference

-- Bucket 1: brand-assets
-- Purpose: Store brand logos, product photos, reference images, avatars
-- Configuration:
--   - Public: true
--   - File size limit: 10MB
--   - Allowed MIME types: image/*

-- Bucket 2: campaign-videos
-- Purpose: Store generated campaign videos
-- Configuration:
--   - Public: true
--   - File size limit: 100MB
--   - Allowed MIME types: video/*

-- ============================================================================
-- STORAGE POLICIES (Manual Setup Required)
-- ============================================================================

-- Note: Storage policies must be created via Supabase Dashboard after buckets are created
-- The following policies should be created manually:

-- Brand Assets Policies:
--   1. "Users can upload brand assets" - INSERT for authenticated users
--   2. "Users can view their brand assets" - SELECT for authenticated users (own files)
--   3. "Public can view brand assets" - SELECT for public (for sharing)

-- Campaign Videos Policies:
--   1. "Users can upload campaign videos" - INSERT for authenticated users
--   2. "Users can view their campaign videos" - SELECT for authenticated users (own files)
--   3. "Public can view campaign videos" - SELECT for public (for sharing/posting)

-- ============================================================================
-- MANUAL STEPS REQUIRED
-- ============================================================================

-- 1. Create Storage Buckets in Supabase Dashboard:
--
--    A. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets
--
--    B. Create bucket: brand-assets
--       - Name: brand-assets
--       - Public: Yes
--       - File size limit: 10MB
--       - Allowed MIME types: image/*
--
--    C. Create bucket: campaign-videos
--       - Name: campaign-videos
--       - Public: Yes
--       - File size limit: 100MB
--       - Allowed MIME types: video/*

-- 2. Verify buckets are created:
--    SELECT * FROM storage.buckets WHERE name IN ('brand-assets', 'campaign-videos');

-- 3. Verify policies are applied:
--    SELECT * FROM storage.objects WHERE bucket_id IN ('brand-assets', 'campaign-videos');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check error_logs table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'error_logs'
);

-- Check storage buckets exist (run after manual creation)
-- SELECT * FROM storage.buckets WHERE name IN ('brand-assets', 'campaign-videos');

-- Test error logging (optional)
-- INSERT INTO public.error_logs (error_message, path, method, status_code, context)
-- VALUES ('Test error', '/api/test', 'POST', 500, '{"test": true}'::jsonb);

COMMENT ON TABLE public.error_logs IS 'System-wide error logging for monitoring and debugging';
COMMENT ON COLUMN public.error_logs.context IS 'Additional context as JSON (request data, user info, etc)';
