-- Migration: 001_users_clients
-- Description: Create users and clients tables
-- BookFly - AI-Powered Bookkeeping

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- Linked to Supabase Auth (auth.users)
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
-- Users can only see their own record
CREATE POLICY "Users can view own record"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own record"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert during signup (service role or auth trigger)
CREATE POLICY "Enable insert for authenticated users"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- CLIENTS TABLE
-- Bookkeeper's clients - each has their own QB connection
-- ============================================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- e.g., "ABC Plumbing LLC"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user_id lookups (common query pattern)
CREATE INDEX idx_clients_user_id ON clients(user_id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
-- Users can only see their own clients
CREATE POLICY "Users can view own clients"
  ON clients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own clients
CREATE POLICY "Users can create own clients"
  ON clients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own clients
CREATE POLICY "Users can update own clients"
  ON clients
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own clients
CREATE POLICY "Users can delete own clients"
  ON clients
  FOR DELETE
  USING (auth.uid() = user_id);
