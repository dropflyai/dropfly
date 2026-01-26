-- Migration: 005_corrections_learning
-- Description: Create corrections and vendor patterns tables for learning loop
-- BookFly - AI-Powered Bookkeeping

-- ============================================================================
-- CORRECTIONS TABLE
-- Tracks user corrections for AI learning loop
-- ============================================================================
CREATE TABLE corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES parsed_transactions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Original AI-predicted values
  original_vendor TEXT,
  original_category TEXT,
  original_entity_type TEXT,
  original_amount DECIMAL(15, 2),

  -- User-corrected values
  corrected_vendor TEXT,
  corrected_category TEXT,
  corrected_entity_type TEXT,
  corrected_amount DECIMAL(15, 2),

  -- Metadata
  correction_reason TEXT,           -- User's explanation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_corrections_transaction_id ON corrections(transaction_id);
CREATE INDEX idx_corrections_client_id ON corrections(client_id);
CREATE INDEX idx_corrections_user_id ON corrections(user_id);
CREATE INDEX idx_corrections_created_at ON corrections(created_at DESC);

-- Composite index for learning queries (find all corrections for a client)
CREATE INDEX idx_corrections_client_category
  ON corrections(client_id, original_category, corrected_category);
CREATE INDEX idx_corrections_client_vendor
  ON corrections(client_id, original_vendor, corrected_vendor);

-- Enable RLS
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for corrections
-- Users can only see their own corrections
CREATE POLICY "Users can view own corrections"
  ON corrections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own corrections
CREATE POLICY "Users can create own corrections"
  ON corrections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own corrections
CREATE POLICY "Users can update own corrections"
  ON corrections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own corrections
CREATE POLICY "Users can delete own corrections"
  ON corrections
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VENDOR PATTERNS TABLE
-- Learned vendor patterns per client for improved AI predictions
-- ============================================================================
CREATE TABLE vendor_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,        -- Canonical vendor name
  vendor_aliases JSONB DEFAULT '[]',  -- Array of alternative names/spellings
  default_category TEXT,            -- Most common category for this vendor
  default_entity_type TEXT,         -- Most common entity type
  typical_amount_min DECIMAL(15, 2),  -- Typical transaction range
  typical_amount_max DECIMAL(15, 2),
  occurrence_count INT NOT NULL DEFAULT 1,  -- How many times seen
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure valid default_entity_type if provided
  CONSTRAINT valid_pattern_entity_type CHECK (
    default_entity_type IS NULL OR
    default_entity_type IN ('expense', 'bill', 'invoice', 'journal_entry', 'payment', 'deposit', 'transfer')
  ),

  -- Occurrence count must be positive
  CONSTRAINT positive_occurrence_count CHECK (occurrence_count > 0),

  -- Amount range must be valid
  CONSTRAINT valid_amount_range CHECK (
    typical_amount_min IS NULL OR
    typical_amount_max IS NULL OR
    typical_amount_min <= typical_amount_max
  )
);

-- Indexes for common queries
CREATE INDEX idx_vendor_patterns_client_id ON vendor_patterns(client_id);
CREATE INDEX idx_vendor_patterns_vendor_name ON vendor_patterns(vendor_name);
CREATE INDEX idx_vendor_patterns_last_used ON vendor_patterns(last_used_at DESC);

-- Unique constraint: one pattern per vendor per client
CREATE UNIQUE INDEX idx_vendor_patterns_client_vendor
  ON vendor_patterns(client_id, LOWER(vendor_name));

-- GIN index for vendor aliases JSONB search
CREATE INDEX idx_vendor_patterns_aliases ON vendor_patterns USING GIN(vendor_aliases);

-- Enable RLS
ALTER TABLE vendor_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_patterns
-- Users can only see patterns for their own clients
CREATE POLICY "Users can view own client vendor patterns"
  ON vendor_patterns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = vendor_patterns.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can create patterns for their own clients
CREATE POLICY "Users can create vendor patterns for own clients"
  ON vendor_patterns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = vendor_patterns.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can update patterns for their own clients
CREATE POLICY "Users can update vendor patterns for own clients"
  ON vendor_patterns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = vendor_patterns.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can delete patterns for their own clients
CREATE POLICY "Users can delete vendor patterns for own clients"
  ON vendor_patterns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = vendor_patterns.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGER: Update last_used_at when occurrence_count changes
-- ============================================================================
CREATE OR REPLACE FUNCTION update_vendor_pattern_last_used()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.occurrence_count != OLD.occurrence_count THEN
    NEW.last_used_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_patterns_last_used
  BEFORE UPDATE ON vendor_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_pattern_last_used();
