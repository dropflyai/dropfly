#!/usr/bin/env node
/**
 * SUPABASE MEMORY SYSTEM SETUP - FULL AUTOMATION
 *
 * Follows Engineering/Solutions/Recipes/Supabase.md
 * Uses Supabase CLI for all operations
 * No manual browser steps required
 *
 * Usage:
 *   node setup-supabase.js
 *
 * What this does:
 *   1. Authenticates with Supabase (uses existing token or prompts for login)
 *   2. Lists your organizations
 *   3. Creates "ai-brains-memory" project
 *   4. Initializes local Supabase
 *   5. Creates migration with Memory schema
 *   6. Applies migration locally
 *   7. Links to remote project
 *   8. Pushes migration to remote
 *
 * All steps are automated and visible.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Helper for prompts
const prompt = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Helper for running commands with visible output
function run(command, options = {}) {
  console.log(`\n> ${command}\n`);
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return result;
  } catch (error) {
    if (!options.allowFailure) {
      console.error(`\n❌ Command failed: ${command}`);
      console.error(error.message);
      process.exit(1);
    }
    return null;
  }
}

// Check if already logged in
function isLoggedIn() {
  try {
    execSync('supabase projects list', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Main automation
(async function main() {
  console.log('=== Supabase Memory System Setup - Full Automation ===\n');
  console.log('This script will:');
  console.log('  1. Authenticate with Supabase');
  console.log('  2. Create "ai-brains-memory" project');
  console.log('  3. Initialize local Supabase');
  console.log('  4. Create migration with Memory schema');
  console.log('  5. Apply migration locally');
  console.log('  6. Push to remote\n');

  const proceed = await prompt('Continue? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    console.log('Aborted.');
    process.exit(0);
  }

  // Step 1: Authenticate
  console.log('\n--- Step 1: Authenticate ---\n');

  if (isLoggedIn()) {
    console.log('✅ Already authenticated with Supabase');
  } else {
    console.log('Not authenticated. You have two options:');
    console.log('  1. Login via browser (I will open it for you)');
    console.log('  2. Provide access token manually\n');

    const loginMethod = await prompt('Choose (1 or 2): ');

    if (loginMethod === '2') {
      const token = await prompt('Paste your Supabase access token: ');
      run(`supabase login --token "${token}"`);
    } else {
      console.log('\nOpening browser for login...');
      console.log('After you complete login in browser, return here.\n');
      run('supabase login');
    }

    console.log('✅ Authentication complete');
  }

  // Step 2: List organizations and select one
  console.log('\n--- Step 2: Select Organization ---\n');

  const orgsOutput = run('supabase orgs list --output json', { silent: true });
  const orgs = JSON.parse(orgsOutput);

  console.log('Available organizations:');
  orgs.forEach((org, i) => {
    console.log(`  ${i + 1}. ${org.name} (${org.id})`);
  });

  const orgChoice = await prompt(`\nSelect organization (1-${orgs.length}): `);
  const selectedOrg = orgs[parseInt(orgChoice) - 1];

  if (!selectedOrg) {
    console.error('Invalid organization selection');
    process.exit(1);
  }

  console.log(`\n✅ Selected: ${selectedOrg.name}`);

  // Step 3: Create project
  console.log('\n--- Step 3: Create Project ---\n');

  const projectName = 'ai-brains-memory';
  const dbPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);

  console.log(`Project name: ${projectName}`);
  console.log(`Database password: ${dbPassword}`);
  console.log('(Save this password in your password manager!)\n');

  const regionChoice = await prompt('Region (us-east-1, us-west-1, eu-west-1, etc.) [us-east-1]: ');
  const region = regionChoice || 'us-east-1';

  console.log('\nCreating project (this takes ~2 minutes)...\n');

  const projectOutput = run(
    `supabase projects create ${projectName} --org-id ${selectedOrg.id} --db-password "${dbPassword}" --region ${region} --output json`,
    { silent: true }
  );

  const project = JSON.parse(projectOutput);

  console.log(`✅ Project created: ${project.id}`);
  console.log(`   URL: https://${project.id}.supabase.co\n`);

  // Step 4: Initialize local Supabase
  console.log('\n--- Step 4: Initialize Local Supabase ---\n');

  const workdir = process.cwd();

  if (fs.existsSync(path.join(workdir, 'supabase'))) {
    console.log('⚠️  supabase/ directory already exists');
    const overwrite = await prompt('Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipping init');
    } else {
      run('supabase init');
    }
  } else {
    run('supabase init');
  }

  console.log('✅ Local Supabase initialized');

  // Step 5: Link to remote project
  console.log('\n--- Step 5: Link to Remote Project ---\n');

  run(`supabase link --project-ref ${project.id}`);

  console.log('✅ Linked to remote project');

  // Step 6: Create migration with Memory schema
  console.log('\n--- Step 6: Create Memory Schema Migration ---\n');

  run('supabase migration new create_memory_tables');

  // Find the created migration file
  const migrationsDir = path.join(workdir, 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir);
  const latestMigration = migrationFiles.sort().reverse()[0];
  const migrationPath = path.join(migrationsDir, latestMigration);

  console.log(`\nCreated migration: ${latestMigration}`);
  console.log('Writing Memory schema SQL...\n');

  // Copy the Supabase migration SQL
  const migrationSQL = fs.readFileSync(
    path.join(__dirname, 'supabase-migration.sql'),
    'utf8'
  );

  fs.writeFileSync(migrationPath, migrationSQL);

  console.log('✅ Migration file populated with Memory schema');

  // Step 7: Apply migration locally
  console.log('\n--- Step 7: Apply Migration Locally ---\n');

  console.log('Starting local Supabase (this may take a minute)...\n');
  run('supabase start');

  console.log('\nApplying migrations locally...\n');
  run('supabase db reset');

  console.log('✅ Migration applied locally');

  // Step 8: Push to remote
  console.log('\n--- Step 8: Push to Remote ---\n');

  run('supabase db push');

  console.log('✅ Migration pushed to remote');

  // Step 9: Get API keys
  console.log('\n--- Step 9: Get API Keys ---\n');

  const apiKeysOutput = run(`supabase projects api-keys --project-ref ${project.id} --output json`, { silent: true });
  const apiKeys = JSON.parse(apiKeysOutput);

  const anonKey = apiKeys.find(k => k.name === 'anon')?.api_key;
  const serviceRoleKey = apiKeys.find(k => k.name === 'service_role')?.api_key;

  console.log('\n✅ Setup Complete!\n');
  console.log('=== Credentials ===\n');
  console.log(`Project URL: https://${project.id}.supabase.co`);
  console.log(`Database Password: ${dbPassword}`);
  console.log(`\nAnon Key:\n${anonKey}`);
  console.log(`\nService Role Key:\n${serviceRoleKey}`);

  console.log('\n=== Next Steps ===\n');
  console.log('1. Add to your .env file:');
  console.log(`   SUPABASE_URL=https://${project.id}.supabase.co`);
  console.log(`   SUPABASE_ANON_KEY=${anonKey}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`);
  console.log('\n2. Start logging experiences:');
  console.log('   node log.js experience');
  console.log('\n3. (Optional) Migrate existing SQLite data:');
  console.log('   node migrate-to-supabase.js\n');

  // Save credentials to file
  const credsPath = path.join(__dirname, '.supabase-credentials.txt');
  fs.writeFileSync(credsPath, `
Project URL: https://${project.id}.supabase.co
Database Password: ${dbPassword}
Anon Key: ${anonKey}
Service Role Key: ${serviceRoleKey}
Created: ${new Date().toISOString()}
`);

  console.log(`✅ Credentials saved to: ${credsPath}`);
  console.log('   (Add this file to .gitignore!)\n');

})();
