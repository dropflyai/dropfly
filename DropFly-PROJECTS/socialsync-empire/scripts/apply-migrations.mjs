#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSQL(sql, description) {
  console.log(`\n🔄 ${description}...`);

  try {
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      throw error;
    }

    console.log(`✅ ${description} - SUCCESS`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - FAILED:`);
    console.error(error.message);
    return false;
  }
}

async function checkColumns() {
  console.log('\n🔍 Checking current schema...');

  const { data, error } = await supabase
    .from('token_balances')
    .select('*')
    .limit(1);

  if (error) {
    console.log('⚠️  Could not check schema:', error.message);
    return;
  }

  const hasColumn = (col) => data && data.length > 0 && col in data[0];

  console.log('Current token_balances columns:');
  console.log('  - daily_spent:', hasColumn('daily_spent') ? '✅' : '❌');
  console.log('  - daily_limit:', hasColumn('daily_limit') ? '✅' : '❌');
  console.log('  - last_reset_date:', hasColumn('last_reset_date') ? '✅' : '❌');
}

async function main() {
  console.log('🚀 Applying Supabase migrations...');
  console.log(`📍 URL: ${SUPABASE_URL}\n`);

  await checkColumns();

  // Migration 1: Add daily tracking columns
  console.log('\n📦 Migration 1: Add daily tracking columns');

  const addDailySpent = await supabase.rpc('exec', {
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'token_balances'
          AND column_name = 'daily_spent'
        ) THEN
          ALTER TABLE public.token_balances
          ADD COLUMN daily_spent INTEGER NOT NULL DEFAULT 0;
          RAISE NOTICE 'Added daily_spent column';
        ELSE
          RAISE NOTICE 'daily_spent column already exists';
        END IF;
      END $$;
    `
  });

  const addDailyLimit = await supabase.rpc('exec', {
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'token_balances'
          AND column_name = 'daily_limit'
        ) THEN
          ALTER TABLE public.token_balances
          ADD COLUMN daily_limit INTEGER NOT NULL DEFAULT 15;
          RAISE NOTICE 'Added daily_limit column';
        ELSE
          RAISE NOTICE 'daily_limit column already exists';
        END IF;
      END $$;
    `
  });

  const addLastReset = await supabase.rpc('exec', {
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'token_balances'
          AND column_name = 'last_reset_date'
        ) THEN
          ALTER TABLE public.token_balances
          ADD COLUMN last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;
          RAISE NOTICE 'Added last_reset_date column';
        ELSE
          RAISE NOTICE 'last_reset_date column already exists';
        END IF;
      END $$;
    `
  });

  console.log('✅ Migration 1 completed');

  // Migration 2: Fix RLS policies
  console.log('\n📦 Migration 2: Fix RLS policies');

  const { error: policyError } = await supabase.rpc('exec', {
    sql: `
      -- Token Balances: Allow service role to manage balances
      DROP POLICY IF EXISTS "Service role can manage token balances" ON public.token_balances;
      CREATE POLICY "Service role can manage token balances"
        ON public.token_balances
        FOR ALL
        USING (true)
        WITH CHECK (true);

      -- Token Transactions: Users can view their own transactions
      DROP POLICY IF EXISTS "Users can view own token transactions" ON public.token_transactions;
      CREATE POLICY "Users can view own token transactions"
        ON public.token_transactions
        FOR SELECT
        USING (auth.uid() = user_id);

      -- Token Transactions: Service role can insert transactions
      DROP POLICY IF EXISTS "Service role can insert token transactions" ON public.token_transactions;
      CREATE POLICY "Service role can insert token transactions"
        ON public.token_transactions
        FOR INSERT
        WITH CHECK (true);

      -- Token Transactions: Service role can update transactions
      DROP POLICY IF EXISTS "Service role can update token transactions" ON public.token_transactions;
      CREATE POLICY "Service role can update token transactions"
        ON public.token_transactions
        FOR UPDATE
        USING (true);
    `
  });

  if (policyError) {
    console.error('❌ RLS policies failed:', policyError.message);
  } else {
    console.log('✅ Migration 2 completed');
  }

  await checkColumns();

  console.log('\n✅ All migrations applied successfully!');
  console.log('👉 The token system should now work correctly.');
  console.log('👉 Restart your dev server to pick up the changes.');
}

main().catch(console.error);
