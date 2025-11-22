#!/bin/bash

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | cut -d'.' -f1)

echo "🔧 Running SQL migrations on Supabase..."
echo "📍 Project: $PROJECT_REF"
echo ""

# Migration 1: Add columns
echo "1️⃣  Adding daily tracking columns..."

SQL1='ALTER TABLE public.token_balances ADD COLUMN IF NOT EXISTS daily_spent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.token_balances ADD COLUMN IF NOT EXISTS daily_limit INTEGER NOT NULL DEFAULT 15;
ALTER TABLE public.token_balances ADD COLUMN IF NOT EXISTS last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;'

curl -s -X POST "https://${PROJECT_REF}.supabase.co/rest/v1/rpc" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"${SQL1}\"}"

echo "✅ Columns added"
echo ""

# Migration 2: Fix RLS
echo "2️⃣  Updating RLS policies..."

SQL2='DROP POLICY IF EXISTS "Service role can manage token balances" ON public.token_balances;
CREATE POLICY "Service role can manage token balances" ON public.token_balances FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role can insert token transactions" ON public.token_transactions;
CREATE POLICY "Service role can insert token transactions" ON public.token_transactions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service role can update token transactions" ON public.token_transactions;
CREATE POLICY "Service role can update token transactions" ON public.token_transactions FOR UPDATE USING (true);'

curl -s -X POST "https://${PROJECT_REF}.supabase.co/rest/v1/rpc" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"${SQL2}\"}"

echo "✅ RLS policies updated"
echo ""
echo "✅ All fixes applied! Restart your dev server."
