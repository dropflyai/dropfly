#!/usr/bin/env node
/**
 * MIGRATE TO SUPABASE - Engineering Brain Memory System
 * Exports all data from local SQLite to Supabase without interruption
 *
 * Usage:
 *   node migrate-to-supabase.js
 *
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_ANON_KEY in environment
 *   - Supabase migration already run (tables exist)
 */

const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'brain-memory.db');

// Check environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  console.error('\nAdd to your .env file:');
  console.error('SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_ANON_KEY=your_anon_key_here\n');
  process.exit(1);
}

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
  console.error(`Error: Database not found at ${DB_PATH}`);
  process.exit(1);
}

const db = new sqlite3(DB_PATH);

async function migrateTable(tableName, rows) {
  console.log(`\nMigrating ${rows.length} rows from ${tableName}...`);

  if (rows.length === 0) {
    console.log(`  No data to migrate for ${tableName}`);
    return;
  }

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${tableName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`  ❌ Failed to migrate ${tableName}:`, error);
    return;
  }

  const inserted = await response.json();
  console.log(`  ✅ Migrated ${inserted.length} rows to ${tableName}`);
}

async function migrate() {
  console.log('=== Migrating SQLite data to Supabase ===\n');
  console.log(`Source: ${DB_PATH}`);
  console.log(`Destination: ${process.env.SUPABASE_URL}\n`);

  try {
    // Export experience_log
    const experiences = db.prepare('SELECT * FROM experience_log').all();
    await migrateTable('experience_log', experiences.map(row => ({
      ...row,
      attempts: row.attempts ? JSON.parse(row.attempts) : []
    })));

    // Export patterns
    const patterns = db.prepare('SELECT * FROM patterns').all();
    await migrateTable('patterns', patterns.map(row => ({
      ...row,
      evidence: row.evidence ? JSON.parse(row.evidence) : []
    })));

    // Export failure_archive
    const failures = db.prepare('SELECT * FROM failure_archive').all();
    await migrateTable('failure_archive', failures);

    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Verify data in Supabase dashboard');
    console.log('2. Update .env to use Supabase logging (set USE_SUPABASE=true)');
    console.log('3. Optionally keep SQLite as backup\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrate();
