-- Migration: 006_validation_rules
-- Description: Create validation rules table for automated checks
-- BookFly - AI-Powered Bookkeeping

-- ============================================================================
-- VALIDATION RULES TABLE
-- Configurable validation rules per client or global
-- ============================================================================
CREATE TABLE validation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,  -- NULL = global rule
  rule_type TEXT NOT NULL,          -- 'duplicate', 'outlier', 'category_mismatch', etc.
  rule_name TEXT,                   -- Human-readable name
  rule_description TEXT,            -- What this rule checks
  rule_config JSONB NOT NULL DEFAULT '{}',  -- Rule-specific configuration
  severity TEXT NOT NULL DEFAULT 'warning',  -- 'info', 'warning', 'error'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure valid rule_type
  CONSTRAINT valid_rule_type CHECK (rule_type IN (
    'duplicate',           -- Detect duplicate transactions
    'outlier',             -- Amount significantly different from typical
    'category_mismatch',   -- Category doesn't match vendor pattern
    'missing_vendor',      -- No vendor detected
    'missing_category',    -- No category assigned
    'future_date',         -- Transaction date in future
    'stale_date',          -- Transaction date too old
    'amount_threshold',    -- Amount exceeds threshold
    'suspicious_pattern',  -- Unusual transaction pattern
    'custom'               -- Custom user-defined rule
  )),

  -- Ensure valid severity
  CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'error'))
);

-- Indexes for common queries
CREATE INDEX idx_validation_rules_client_id ON validation_rules(client_id);
CREATE INDEX idx_validation_rules_rule_type ON validation_rules(rule_type);
CREATE INDEX idx_validation_rules_is_active ON validation_rules(is_active);

-- Partial index for global rules (where client_id is NULL)
CREATE INDEX idx_validation_rules_global
  ON validation_rules(rule_type, is_active)
  WHERE client_id IS NULL;

-- Composite index for active rules per client
CREATE INDEX idx_validation_rules_client_active
  ON validation_rules(client_id, is_active, rule_type);

-- Enable RLS
ALTER TABLE validation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for validation_rules
-- Users can see global rules (client_id IS NULL) and their own client rules
CREATE POLICY "Users can view global and own client rules"
  ON validation_rules
  FOR SELECT
  USING (
    client_id IS NULL OR
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = validation_rules.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can only create rules for their own clients (not global)
CREATE POLICY "Users can create rules for own clients"
  ON validation_rules
  FOR INSERT
  WITH CHECK (
    client_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = validation_rules.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can only update rules for their own clients (not global)
CREATE POLICY "Users can update rules for own clients"
  ON validation_rules
  FOR UPDATE
  USING (
    client_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = validation_rules.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can only delete rules for their own clients (not global)
CREATE POLICY "Users can delete rules for own clients"
  ON validation_rules
  FOR DELETE
  USING (
    client_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = validation_rules.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
CREATE TRIGGER update_validation_rules_updated_at
  BEFORE UPDATE ON validation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED: Default global validation rules
-- ============================================================================
INSERT INTO validation_rules (client_id, rule_type, rule_name, rule_description, rule_config, severity, is_active) VALUES
  (NULL, 'duplicate', 'Duplicate Detection', 'Detect potential duplicate transactions based on amount, date, and vendor',
   '{"date_tolerance_days": 3, "amount_tolerance_percent": 0.01}', 'warning', true),

  (NULL, 'outlier', 'Amount Outlier Detection', 'Flag transactions with amounts significantly outside typical range',
   '{"std_dev_threshold": 3, "min_occurrences": 5}', 'warning', true),

  (NULL, 'future_date', 'Future Date Check', 'Flag transactions with dates in the future',
   '{"max_future_days": 0}', 'error', true),

  (NULL, 'stale_date', 'Stale Date Check', 'Flag transactions with dates too far in the past',
   '{"max_past_days": 365}', 'warning', true),

  (NULL, 'missing_vendor', 'Missing Vendor', 'Flag transactions without a vendor/customer name',
   '{}', 'info', true),

  (NULL, 'missing_category', 'Missing Category', 'Flag transactions without a category',
   '{}', 'warning', true),

  (NULL, 'amount_threshold', 'Large Amount Alert', 'Flag transactions exceeding threshold amount',
   '{"threshold": 10000}', 'info', true);

-- ============================================================================
-- COMMENTS: Document the rule_config schemas
-- ============================================================================
COMMENT ON TABLE validation_rules IS 'Configurable validation rules for transaction review. client_id NULL = global rule.';

COMMENT ON COLUMN validation_rules.rule_config IS 'JSON configuration specific to rule_type:
  - duplicate: { date_tolerance_days: number, amount_tolerance_percent: number }
  - outlier: { std_dev_threshold: number, min_occurrences: number }
  - future_date: { max_future_days: number }
  - stale_date: { max_past_days: number }
  - amount_threshold: { threshold: number, entity_types?: string[] }
  - category_mismatch: { strict: boolean }
  - custom: { sql_condition?: string, javascript?: string }
';
