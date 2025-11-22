#!/usr/bin/env node

/**
 * Simple Database Migration Runner
 * Uses fetch to POST SQL directly to Supabase
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL?.split('//')[1]?.split('.')[0];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Execute SQL using Supabase database API
async function executeSQL(sql, description) {
  console.log(`\n🔄 ${description}...`);

  // Use Supabase's database API endpoint
  const endpoint = `https://${PROJECT_REF}.supabase.co/rest/v1/rpc`;

  try {
    // First, we need to create an exec function if it doesn't exist
    // This is a one-time setup
    const createExecFunction = `
      CREATE OR REPLACE FUNCTION exec(sql text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result json;
      BEGIN
        EXECUTE sql;
        RETURN json_build_object('success', true);
      END;
      $$;
    `;

    // Try to create the function first (will fail silently if exists)
    try {
      const setupResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: 'exec',
          params: { sql: createExecFunction }
        })
      });
    } catch (e) {
      // Ignore - function might already exist
    }

    // Now execute the actual SQL
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: 'exec',
        params: { sql }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ ${description} - SUCCESS`);
    return true;

  } catch (error) {
    console.error(`❌ ${description} - FAILED:`);
    console.error('  ', error.message);
    return false;
  }
}

// Get migration files
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
    sql: fs.readFileSync(path.join(migrationsDir, file), 'utf8')
  }));
}

// Main function
async function main() {
  console.log('🚀 Database Migration Runner');
  console.log('📍 Project:', PROJECT_REF);
  console.log('');

  const migrations = getMigrationFiles();
  console.log(`📦 Found ${migrations.length} migration file(s)\n`);

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

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('='.repeat(60));

  if (failCount === 0) {
    console.log('\n✅ All migrations completed successfully!');
    console.log('👉 Restart your dev server to apply changes\n');
  } else {
    console.log('\n⚠️  Some migrations failed. See errors above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Migration runner error:', error.message);
  process.exit(1);
});
