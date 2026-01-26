-- Migration: 004_transactions
-- Description: Create parsed transactions table
-- BookFly - AI-Powered Bookkeeping

-- ============================================================================
-- PARSED TRANSACTIONS TABLE
-- AI-extracted transactions supporting all QB entity types
-- ============================================================================
CREATE TABLE parsed_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- AI-extracted fields
  entity_type TEXT NOT NULL,        -- 'expense', 'bill', 'invoice', 'journal_entry'
  vendor_or_customer TEXT,          -- Vendor for expenses/bills, customer for invoices
  amount DECIMAL(15, 2) NOT NULL,   -- Support large amounts with 2 decimal precision
  date DATE,                        -- Transaction date
  category TEXT,                    -- Expense/income category
  description TEXT,                 -- Memo/description
  line_items JSONB,                 -- Array of line items for multi-line transactions

  -- Confidence + status
  confidence_score FLOAT DEFAULT 0.0,  -- 0.0 to 1.0
  ai_reasoning TEXT,                -- AI explanation for categorization
  flags JSONB,                      -- Array of flags/warnings
  review_status TEXT NOT NULL DEFAULT 'pending_review',  -- 'pending_review', 'approved', 'rejected'
  sync_status TEXT NOT NULL DEFAULT 'not_synced',        -- 'not_synced', 'syncing', 'synced', 'error'
  external_id TEXT,                 -- ID after pushed to accounting platform
  sync_error TEXT,                  -- Error message if sync failed
  synced_at TIMESTAMPTZ,            -- When successfully synced
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure valid entity_type
  CONSTRAINT valid_entity_type CHECK (entity_type IN ('expense', 'bill', 'invoice', 'journal_entry', 'payment', 'deposit', 'transfer')),

  -- Ensure valid review_status
  CONSTRAINT valid_review_status CHECK (review_status IN ('pending_review', 'approved', 'rejected', 'needs_info')),

  -- Ensure valid sync_status
  CONSTRAINT valid_sync_status CHECK (sync_status IN ('not_synced', 'syncing', 'synced', 'error')),

  -- Confidence score must be between 0 and 1
  CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),

  -- Amount must be non-negative (negatives handled by entity_type)
  CONSTRAINT non_negative_amount CHECK (amount >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_parsed_transactions_upload_id ON parsed_transactions(upload_id);
CREATE INDEX idx_parsed_transactions_client_id ON parsed_transactions(client_id);
CREATE INDEX idx_parsed_transactions_review_status ON parsed_transactions(review_status);
CREATE INDEX idx_parsed_transactions_sync_status ON parsed_transactions(sync_status);
CREATE INDEX idx_parsed_transactions_entity_type ON parsed_transactions(entity_type);
CREATE INDEX idx_parsed_transactions_date ON parsed_transactions(date);
CREATE INDEX idx_parsed_transactions_created_at ON parsed_transactions(created_at DESC);

-- Composite index for common filtered queries
CREATE INDEX idx_parsed_transactions_client_review
  ON parsed_transactions(client_id, review_status);
CREATE INDEX idx_parsed_transactions_client_sync
  ON parsed_transactions(client_id, sync_status);

-- Enable RLS
ALTER TABLE parsed_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parsed_transactions
-- Users can only see transactions for their own clients
CREATE POLICY "Users can view own client transactions"
  ON parsed_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = parsed_transactions.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can create transactions for their own clients
CREATE POLICY "Users can create transactions for own clients"
  ON parsed_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = parsed_transactions.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can update transactions for their own clients
CREATE POLICY "Users can update transactions for own clients"
  ON parsed_transactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = parsed_transactions.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can delete transactions for their own clients
CREATE POLICY "Users can delete transactions for own clients"
  ON parsed_transactions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = parsed_transactions.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parsed_transactions_updated_at
  BEFORE UPDATE ON parsed_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
