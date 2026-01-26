-- Migration: 003_scans_uploads
-- Description: Create scans and uploads tables
-- BookFly - AI-Powered Bookkeeping

-- ============================================================================
-- SCANS TABLE
-- Mobile scanner captures (single or batch)
-- ============================================================================
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL DEFAULT 'single',  -- 'single', 'batch'
  page_count INT NOT NULL DEFAULT 1,
  original_images JSONB,            -- Array of original image URLs
  processed_pdf_url TEXT,           -- Combined/processed PDF
  status TEXT NOT NULL DEFAULT 'captured',  -- 'captured', 'processing', 'ready', 'parsed'
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure valid scan_type
  CONSTRAINT valid_scan_type CHECK (scan_type IN ('single', 'batch')),

  -- Ensure valid status
  CONSTRAINT valid_scan_status CHECK (status IN ('captured', 'processing', 'ready', 'parsed', 'error')),

  -- Page count must be positive
  CONSTRAINT positive_page_count CHECK (page_count > 0)
);

-- Indexes for common queries
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_client_id ON scans(client_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);

-- Enable RLS
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scans
-- Users can only see their own scans
CREATE POLICY "Users can view own scans"
  ON scans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own scans
CREATE POLICY "Users can create own scans"
  ON scans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scans
CREATE POLICY "Users can update own scans"
  ON scans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own scans
CREATE POLICY "Users can delete own scans"
  ON scans
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- UPLOADS TABLE
-- Files from web or mobile (linked to scans when from mobile)
-- ============================================================================
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,  -- Nullable, links to scan if from mobile
  file_type TEXT NOT NULL,          -- 'image', 'pdf', 'csv'
  file_url TEXT NOT NULL,
  original_filename TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'processing', 'parsed', 'error'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure valid file_type
  CONSTRAINT valid_file_type CHECK (file_type IN ('image', 'pdf', 'csv', 'xlsx', 'xls')),

  -- Ensure valid status
  CONSTRAINT valid_upload_status CHECK (status IN ('pending', 'processing', 'parsed', 'error'))
);

-- Indexes for common queries
CREATE INDEX idx_uploads_client_id ON uploads(client_id);
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_scan_id ON uploads(scan_id);
CREATE INDEX idx_uploads_status ON uploads(status);
CREATE INDEX idx_uploads_created_at ON uploads(created_at DESC);

-- Enable RLS
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploads
-- Users can only see their own uploads
CREATE POLICY "Users can view own uploads"
  ON uploads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own uploads
CREATE POLICY "Users can create own uploads"
  ON uploads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own uploads
CREATE POLICY "Users can update own uploads"
  ON uploads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON uploads
  FOR DELETE
  USING (auth.uid() = user_id);
