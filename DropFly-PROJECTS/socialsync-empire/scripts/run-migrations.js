#!/usr/bin/env node

/**
 * Automated Database Migration Runner
 * Connects directly to Supabase PostgreSQL and runs migrations
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Extract project ref from Supabase URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PROJECT_REF = SUPABASE_URL?.split('//')[1]?.split('.')[0];

// Check for database password in env
let DB_PASSWORD = process.env.DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD;

if (!PROJECT_REF) {
  console.error('❌ Could not extract project ref from SUPABASE_URL');
  process.exit(1);
}

// Construct connection string
// Try direct connection first (non-pooler)
const connectionString = process.env.DATABASE_URL ||
  `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

console.log('🚀 Automated Migration Runner');
console.log('📍 Project:', PROJECT_REF);
console.log('');

// Create connection pool
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Test connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    console.log('📅 Server time:', result.rows[0].now);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('');
    console.error('💡 To fix this, add your database password to .env.local:');
    console.error('   DB_PASSWORD=your_postgres_password');
    console.error('');
    console.error('   Get it from: Supabase Dashboard → Settings → Database → Connection string');
    return false;
  }
}

// Execute SQL
async function executeSQL(sql, description) {
  console.log(`🔄 ${description}...`);

  try {
    const client = await pool.connect();
    await client.query(sql);
    client.release();
    console.log(`✅ ${description} - SUCCESS\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - FAILED:`);
    console.error('   ', error.message);
    console.error('');
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

  console.log(`📦 Found ${files.length} migration file(s):`);
  files.forEach(f => console.log(`   - ${f}`));
  console.log('');

  return files.map(file => ({
    name: file,
    sql: fs.readFileSync(path.join(migrationsDir, file), 'utf8')
  }));
}

// Main function
async function main() {
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  const migrations = getMigrationFiles();

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

  // Close pool
  await pool.end();

  console.log('='.repeat(70));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('='.repeat(70));

  if (failCount === 0) {
    console.log('\n✅ All migrations applied successfully!');
    console.log('👉 Changes are live in your database\n');
  } else {
    console.log('\n⚠️  Some migrations failed. Check errors above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Migration runner error:', error.message);
  pool.end();
  process.exit(1);
});
