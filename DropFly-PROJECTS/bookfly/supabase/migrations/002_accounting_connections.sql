-- Migration: 002_accounting_connections
-- Description: Create accounting connections table (multi-platform support)
-- BookFly - AI-Powered Bookkeeping

-- ============================================================================
-- ACCOUNTING CONNECTIONS TABLE
-- One connection per client, supports multiple providers
-- ============================================================================
CREATE TABLE accounting_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,           -- 'quickbooks', 'xero', 'freshbooks'
  access_token TEXT,                -- Encrypted OAuth token
  refresh_token TEXT,               -- Encrypted refresh token
  realm_id TEXT,                    -- QB company ID / Xero tenant ID
  company_name TEXT,                -- Display name from provider
  expires_at TIMESTAMPTZ,           -- Token expiration
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure valid provider
  CONSTRAINT valid_provider CHECK (provider IN ('quickbooks', 'xero', 'freshbooks', 'sage', 'wave'))
);

-- Index for client lookups
CREATE INDEX idx_accounting_connections_client_id ON accounting_connections(client_id);

-- Index for finding expired tokens
CREATE INDEX idx_accounting_connections_expires_at ON accounting_connections(expires_at);

-- Unique constraint: one connection per provider per client
CREATE UNIQUE INDEX idx_accounting_connections_client_provider
  ON accounting_connections(client_id, provider);

-- Enable RLS
ALTER TABLE accounting_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounting_connections
-- Users can only see connections for their own clients
CREATE POLICY "Users can view own client connections"
  ON accounting_connections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = accounting_connections.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can create connections for their own clients
CREATE POLICY "Users can create connections for own clients"
  ON accounting_connections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = accounting_connections.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can update connections for their own clients
CREATE POLICY "Users can update connections for own clients"
  ON accounting_connections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = accounting_connections.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Users can delete connections for their own clients
CREATE POLICY "Users can delete connections for own clients"
  ON accounting_connections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = accounting_connections.client_id
      AND clients.user_id = auth.uid()
    )
  );
