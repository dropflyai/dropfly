#!/usr/bin/env npx ts-node

/**
 * Setup X2000 database schema via Supabase Management API
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

async function runSQL(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Use the Supabase REST API's SQL endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY!,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${text}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

async function setupDatabase() {
  console.log('X2000 Database Setup');
  console.log('====================\n');
  console.log(`Project: ${projectRef}`);
  console.log(`URL: ${SUPABASE_URL}\n`);

  // The SQL statements to create tables
  const statements = [
    // Drop existing tables (cascade)
    `DROP TABLE IF EXISTS shared_patterns CASCADE;`,
    `DROP TABLE IF EXISTS brain_learnings CASCADE;`,
    `DROP TABLE IF EXISTS shared_experiences CASCADE;`,
    `DROP TABLE IF EXISTS brain_builds CASCADE;`,
    `DROP TABLE IF EXISTS brain_decisions CASCADE;`,

    // Create shared_patterns
    `CREATE TABLE shared_patterns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      trigger TEXT NOT NULL,
      solution TEXT NOT NULL,
      context TEXT[] DEFAULT '{}',
      success_rate NUMERIC DEFAULT 1.0,
      usage_count INTEGER DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      tags TEXT[] DEFAULT '{}'
    );`,

    // Create brain_learnings
    `CREATE TABLE brain_learnings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL CHECK (type IN ('success', 'failure', 'insight', 'decision')),
      source TEXT NOT NULL,
      task_id TEXT,
      description TEXT NOT NULL,
      root_cause TEXT,
      recommendation TEXT NOT NULL,
      confidence NUMERIC DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      applied_count INTEGER DEFAULT 0,
      tags TEXT[] DEFAULT '{}'
    );`,

    // Create shared_experiences (skills)
    `CREATE TABLE shared_experiences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      implementation TEXT NOT NULL,
      input_schema JSONB DEFAULT '{}',
      output_schema JSONB DEFAULT '{}',
      created_by TEXT NOT NULL,
      adopted_by TEXT[] DEFAULT '{}',
      usage_count INTEGER DEFAULT 0,
      success_rate NUMERIC DEFAULT 1.0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    // Create brain_builds
    `CREATE TABLE brain_builds (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brain_type TEXT NOT NULL,
      task_id TEXT NOT NULL,
      task_subject TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      duration_ms INTEGER,
      result JSONB,
      error TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    // Enable RLS
    `ALTER TABLE shared_patterns ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE brain_learnings ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE shared_experiences ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE brain_builds ENABLE ROW LEVEL SECURITY;`,

    // RLS policies for anon
    `CREATE POLICY "anon_read_patterns" ON shared_patterns FOR SELECT TO anon USING (true);`,
    `CREATE POLICY "anon_insert_patterns" ON shared_patterns FOR INSERT TO anon WITH CHECK (true);`,
    `CREATE POLICY "anon_update_patterns" ON shared_patterns FOR UPDATE TO anon USING (true);`,

    `CREATE POLICY "anon_read_learnings" ON brain_learnings FOR SELECT TO anon USING (true);`,
    `CREATE POLICY "anon_insert_learnings" ON brain_learnings FOR INSERT TO anon WITH CHECK (true);`,
    `CREATE POLICY "anon_update_learnings" ON brain_learnings FOR UPDATE TO anon USING (true);`,

    `CREATE POLICY "anon_read_experiences" ON shared_experiences FOR SELECT TO anon USING (true);`,
    `CREATE POLICY "anon_insert_experiences" ON shared_experiences FOR INSERT TO anon WITH CHECK (true);`,
    `CREATE POLICY "anon_update_experiences" ON shared_experiences FOR UPDATE TO anon USING (true);`,

    `CREATE POLICY "anon_read_builds" ON brain_builds FOR SELECT TO anon USING (true);`,
    `CREATE POLICY "anon_insert_builds" ON brain_builds FOR INSERT TO anon WITH CHECK (true);`,
    `CREATE POLICY "anon_update_builds" ON brain_builds FOR UPDATE TO anon USING (true);`,
  ];

  // Try using the exec_sql RPC function (if it exists)
  console.log('Attempting to run SQL via RPC...\n');

  const result = await runSQL('SELECT 1;');
  if (!result.success) {
    console.log('RPC exec_sql not available (expected).\n');
    console.log('Please run the migration manually:');
    console.log('');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql');
    console.log('2. Copy and paste the following SQL:\n');
    console.log('------- SQL START -------\n');

    // Read and print the full migration file
    const migrationPath = resolve(
      process.cwd(),
      'supabase/migrations/20260309000000_x2000_memory_schema.sql'
    );
    const sql = readFileSync(migrationPath, 'utf-8');
    console.log(sql);

    console.log('\n------- SQL END -------\n');
    console.log('3. Click "Run"\n');

    return;
  }

  console.log('RPC available, running statements...\n');

  for (const stmt of statements) {
    const shortStmt = stmt.substring(0, 60).replace(/\n/g, ' ') + '...';
    process.stdout.write(`Running: ${shortStmt}`);

    const result = await runSQL(stmt);
    if (result.success) {
      console.log(' ✓');
    } else {
      console.log(' ✗');
      console.log(`  Error: ${result.error}`);
    }
  }

  console.log('\nDatabase setup complete!');
}

setupDatabase().catch(console.error);
