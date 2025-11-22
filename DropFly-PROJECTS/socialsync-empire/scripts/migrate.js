#!/usr/bin/env node

/**
 * Automated Database Migration Script
 * Runs all pending migrations using Supabase Management API
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// First, create the migration tracking table and exec function
async function setupMigrationSystem() {
  console.log('🔧 Setting up migration system...\n');

  // Create exec function for running raw SQL
  const setupSQL = `
-- Create function to execute arbitrary SQL (if it doesn't exist)
CREATE OR REPLACE FUNCTION exec(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS public._migrations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow service role to use exec function
GRANT EXECUTE ON FUNCTION exec TO service_role;
  `.trim();

  try {
    // Use the postgres connection to run setup
    const projectRef = supabaseUrl.split('//')[1].split('.')[0];

    // We'll use a direct SQL approach via Node.js pg library
    const { Pool } = require('pg');

    // Get connection string from env or construct it
    const connectionString = process.env.DATABASE_URL ||
      `postgresql://postgres.${projectRef}:${process.env.DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

    const pool = new Pool({ connectionString });

    await pool.query(setupSQL);
    await pool.end();

    console.log('✅ Migration system ready\n');
    return true;
  } catch (error) {
    console.log('⚠️  Could not set up migration system automatically');
    console.log('Falling back to direct execution...\n');
    return false;
  }
}

// Read all migration files
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  return files.map(file => ({
    name: file,
    path: path.join(migrationsDir, file),
    sql: fs.readFileSync(path.join(migrationsDir, file), 'utf8')
  }));
}

// Execute SQL directly using service role
async function executeSQL(sql, description) {
  console.log(`🔄 ${description}...`);

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        // Use raw SQL execution via service role
        await supabase.rpc('exec', { sql: statement + ';' });
      }
    }

    console.log(`✅ ${description} - SUCCESS\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - FAILED:`);
    console.error(error.message);
    console.error('SQL:', sql.substring(0, 200) + '...\n');
    return false;
  }
}

// Main migration runner
async function runMigrations() {
  console.log('🚀 Running database migrations...\n');
  console.log(`📍 Database: ${supabaseUrl}\n`);

  // Try to set up migration system
  await setupMigrationSystem();

  const migrations = getMigrationFiles();
  console.log(`📦 Found ${migrations.length} migration files\n`);

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const success = await executeSQL(migration.sql, `Applying ${migration.name}`);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('='.repeat(50) + '\n');

  if (failCount === 0) {
    console.log('✅ All migrations applied successfully!');
    console.log('👉 Restart your dev server to pick up changes\n');
  } else {
    console.log('⚠️  Some migrations failed. Check the errors above.\n');
    process.exit(1);
  }
}

// Run it
runMigrations().catch(error => {
  console.error('💥 Migration runner crashed:', error);
  process.exit(1);
});
