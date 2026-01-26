-- ============================================================================
-- 007_smart_categorization.sql
-- Adds tables for smart categorization (Chart of Accounts cache, business type)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Update parsed_transactions table to track categorization
-- ----------------------------------------------------------------------------
ALTER TABLE parsed_transactions
ADD COLUMN IF NOT EXISTS vendor_raw text,           -- Original vendor text from receipt
ADD COLUMN IF NOT EXISTS account_id text,           -- QuickBooks/Xero account ID
ADD COLUMN IF NOT EXISTS categorization_source text, -- 'vendor_pattern', 'business_type', 'historical', 'ai_suggestion', 'manual'
ADD COLUMN IF NOT EXISTS categorization_reasoning text;

COMMENT ON COLUMN parsed_transactions.vendor_raw IS 'Original vendor text before normalization';
COMMENT ON COLUMN parsed_transactions.account_id IS 'Chart of Accounts ID from QuickBooks/Xero';
COMMENT ON COLUMN parsed_transactions.categorization_source IS 'How the category was determined: vendor_pattern, business_type, historical, ai_suggestion, manual';

-- ----------------------------------------------------------------------------
-- Update clients table to include business type
-- This helps the AI categorize expenses correctly
-- ----------------------------------------------------------------------------
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS business_type text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Common business types for validation
COMMENT ON COLUMN clients.business_type IS 'Business type for smart categorization: plumbing, restaurant, retail, consulting, construction, healthcare, manufacturing, legal, accounting, real_estate, etc.';

-- ----------------------------------------------------------------------------
-- Chart of Accounts cache
-- We cache the COA from QuickBooks/Xero to avoid API calls on every transaction
-- Refreshed every 24 hours or when user manually syncs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chart_of_accounts_cache (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Account info from accounting platform
    external_id text NOT NULL,          -- QuickBooks/Xero account ID
    name text NOT NULL,                 -- "Materials & Supplies"
    account_type text NOT NULL,         -- "Expense", "Cost of Goods Sold", etc.
    account_number text,                -- Optional account number
    parent_id text,                     -- For nested accounts
    fully_qualified_name text NOT NULL, -- "Expenses:Materials:Plumbing Supplies"
    is_active boolean DEFAULT true,

    -- Cache metadata
    cached_at timestamp with time zone DEFAULT NOW(),
    provider text NOT NULL,             -- 'quickbooks', 'xero', 'freshbooks'

    -- Constraints
    UNIQUE(client_id, external_id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_coa_cache_client_id ON chart_of_accounts_cache(client_id);
CREATE INDEX IF NOT EXISTS idx_coa_cache_active ON chart_of_accounts_cache(client_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coa_cache_type ON chart_of_accounts_cache(client_id, account_type);

-- Enable RLS
ALTER TABLE chart_of_accounts_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see/modify their own clients' COA
CREATE POLICY "Users can view their clients COA cache"
    ON chart_of_accounts_cache
    FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their clients COA cache"
    ON chart_of_accounts_cache
    FOR INSERT
    WITH CHECK (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their clients COA cache"
    ON chart_of_accounts_cache
    FOR UPDATE
    USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their clients COA cache"
    ON chart_of_accounts_cache
    FOR DELETE
    USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Service role can do anything (for edge functions)
CREATE POLICY "Service role full access to COA cache"
    ON chart_of_accounts_cache
    FOR ALL
    USING (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- Update vendor_patterns table to add confidence field
-- ----------------------------------------------------------------------------
ALTER TABLE vendor_patterns
ADD COLUMN IF NOT EXISTS confidence float DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS notes text;

-- Ensure confidence is between 0 and 1
ALTER TABLE vendor_patterns
ADD CONSTRAINT vendor_patterns_confidence_range CHECK (confidence >= 0 AND confidence <= 1);

COMMENT ON COLUMN vendor_patterns.confidence IS 'Confidence score 0-1 based on how many times this pattern has been confirmed by corrections';

-- ----------------------------------------------------------------------------
-- Categorization audit log
-- Track how categories were determined for accuracy analysis
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorization_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id uuid NOT NULL REFERENCES parsed_transactions(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- What was decided
    final_category text NOT NULL,
    final_account_id text,
    confidence_score float NOT NULL,

    -- How it was decided
    source text NOT NULL,  -- 'vendor_pattern', 'historical', 'business_type', 'ai_suggestion', 'manual'
    reasoning text,

    -- For learning analytics
    was_corrected boolean DEFAULT false,
    corrected_to text,
    correction_timestamp timestamp with time zone,

    created_at timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catlog_transaction ON categorization_log(transaction_id);
CREATE INDEX IF NOT EXISTS idx_catlog_client ON categorization_log(client_id);
CREATE INDEX IF NOT EXISTS idx_catlog_source ON categorization_log(source);
CREATE INDEX IF NOT EXISTS idx_catlog_corrected ON categorization_log(was_corrected) WHERE was_corrected = true;

-- Enable RLS
ALTER TABLE categorization_log ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their categorization logs"
    ON categorization_log
    FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access to categorization logs"
    ON categorization_log
    FOR ALL
    USING (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- Accuracy metrics view
-- Shows categorization accuracy per client
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW categorization_accuracy AS
SELECT
    cl.client_id,
    c.name AS client_name,
    c.business_type,
    COUNT(*) AS total_transactions,
    COUNT(*) FILTER (WHERE NOT cl.was_corrected) AS correct_first_try,
    COUNT(*) FILTER (WHERE cl.was_corrected) AS required_correction,
    ROUND(
        (COUNT(*) FILTER (WHERE NOT cl.was_corrected)::numeric / NULLIF(COUNT(*), 0) * 100),
        2
    ) AS accuracy_percentage,
    -- Breakdown by source
    COUNT(*) FILTER (WHERE cl.source = 'vendor_pattern') AS from_vendor_pattern,
    COUNT(*) FILTER (WHERE cl.source = 'business_type') AS from_business_type,
    COUNT(*) FILTER (WHERE cl.source = 'historical') AS from_historical,
    COUNT(*) FILTER (WHERE cl.source = 'ai_suggestion') AS from_ai_suggestion
FROM categorization_log cl
JOIN clients c ON c.id = cl.client_id
GROUP BY cl.client_id, c.name, c.business_type;

COMMENT ON VIEW categorization_accuracy IS 'Shows categorization accuracy metrics per client - use this to track how well the AI is learning';
