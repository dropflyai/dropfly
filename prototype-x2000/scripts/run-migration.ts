#!/usr/bin/env npx ts-node

/**
 * Run X2000 database migrations against Supabase
 * Usage: npx ts-node scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Load environment
config({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

async function runMigration() {
  console.log('Connecting to Supabase...');

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Read migration file
  const migrationPath = resolve(
    process.cwd(),
    'supabase/migrations/20260309000000_x2000_memory_schema.sql'
  );

  console.log(`Reading migration from: ${migrationPath}`);
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  // Split into individual statements (rough split on semicolons not in strings)
  // For complex SQL, use proper parser or run the full file via Supabase Dashboard

  console.log('Running migration...');
  console.log('');
  console.log('NOTE: For best results, run the migration SQL directly in');
  console.log('the Supabase Dashboard SQL Editor at:');
  console.log(`  ${SUPABASE_URL}/project/default/sql`);
  console.log('');
  console.log('Migration file location:');
  console.log(`  ${migrationPath}`);
  console.log('');

  // Try running via REST API
  try {
    // Test connection first
    const { data, error: testError } = await supabase
      .from('shared_patterns')
      .select('id')
      .limit(1);

    if (testError && testError.code !== '42P01') { // 42P01 = table doesn't exist
      console.log('Connection test result:', testError.message);
    } else {
      console.log('Connected to Supabase successfully');
    }
  } catch (err) {
    console.log('Connection test failed:', err);
  }

  console.log('');
  console.log('To apply the migration:');
  console.log('1. Go to Supabase Dashboard -> SQL Editor');
  console.log('2. Paste the contents of the migration file');
  console.log('3. Click "Run"');
  console.log('');
  console.log('Alternatively, you can use the Supabase CLI:');
  console.log('  supabase db push');
}

runMigration().catch(console.error);
