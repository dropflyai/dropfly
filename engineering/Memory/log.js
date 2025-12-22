#!/usr/bin/env node
/**
 * LOG - Engineering Brain Memory System
 * CLI tool for logging experiences, patterns, and failures to local SQLite database
 *
 * Usage:
 *   node log.js experience
 *   node log.js pattern
 *   node log.js failure
 *   node log.js search <keyword>
 */

const sqlite3 = require('better-sqlite3');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'brain-memory.db');

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
  console.error(`Error: Database not found at ${DB_PATH}`);
  console.error(`Run: sqlite3 ${DB_PATH} < sqlite-migration-simple.sql`);
  process.exit(1);
}

const db = new sqlite3(DB_PATH);

// Auto-detect project from current working directory
function detectProject() {
  const cwd = process.cwd();

  // If in DropFly-PROJECTS/<project-name>/
  if (cwd.includes('/DropFly-PROJECTS/')) {
    const match = cwd.match(/\/DropFly-PROJECTS\/([^\/]+)/);
    if (match) {
      return match[1]; // e.g., "pdf-editor", "tradefly"
    }
  }

  // If in engineering/ directory
  if (cwd.includes('/engineering')) {
    return 'engineering-brain';
  }

  // Fallback: use directory name where command is run
  return path.basename(cwd);
}

const PROJECT_ID = detectProject();
console.log(`\n[Project: ${PROJECT_ID}]\n`);

// Helper function for prompts
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

// Log Experience
async function logExperience() {
  console.log('\n=== Engineering Brain - Log Experience ===\n');

  const taskTitle = await prompt('Task Title: ');
  const productTarget = await prompt('Product Target (WEB_APP/WEB_SAAS/MOBILE_IOS/API_SERVICE/etc): ');
  const executionGear = (await prompt('Execution Gear (EXPLORE/BUILD/SHIP/HOTFIX) [BUILD]: ')) || 'BUILD';
  const engineeringMode = (await prompt('Engineering Mode (APP/API/AGENTIC/LIB) [APP]: ')) || 'APP';
  const artifactType = await prompt('Artifact Type (Component/Fragment/Script/Test) [optional]: ');

  console.log('\n--- Problem ---');
  const problem = await prompt('What was the challenge or requirement? ');

  console.log('\n--- Solution ---');
  const solution = await prompt('What worked and was shipped? ');

  console.log('\n--- Why It Worked ---');
  const whyItWorked = await prompt('Root cause insight or explanation: ');

  console.log('\n--- Pattern Observed (optional) ---');
  const patternObserved = await prompt('Generalizable lesson that applies beyond this task: ');

  console.log('\n--- Would Do Differently (optional) ---');
  const wouldDoDifferently = await prompt('Retrospective - what could have been done better? ');

  const timeSpent = parseInt(await prompt('\nTime Spent (minutes): '), 10);

  const stmt = db.prepare(`
    INSERT INTO experience_log (
      task_title, product_target, execution_gear, engineering_mode,
      artifact_type, problem, solution, why_it_worked,
      pattern_observed, would_do_differently, time_spent_minutes, project_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    taskTitle, productTarget, executionGear, engineeringMode,
    artifactType || null, problem, solution, whyItWorked,
    patternObserved || null, wouldDoDifferently || null, timeSpent,
    PROJECT_ID
  );

  console.log('\n✅ Experience logged successfully!\n');
  console.log('To view recent experiences:');
  console.log(`  node ${__filename} search recent\n`);
}

// Log Pattern
async function logPattern() {
  console.log('\n=== Engineering Brain - Log Pattern ===\n');

  const title = await prompt('Pattern Title: ');
  const observedCount = parseInt(await prompt('Observed Count (how many times seen): '), 10);
  const contextProductTarget = await prompt('Context Product Target [optional]: ');
  const contextMode = await prompt('Context Mode [optional]: ');
  const rootCause = await prompt('Root Cause (why this pattern exists): ');
  const solution = await prompt('Solution (what to do when pattern detected): ');
  const trigger = await prompt('Trigger (when to apply this pattern): ');
  const antiPattern = await prompt('Anti-Pattern (what NOT to do) [optional]: ');

  const stmt = db.prepare(`
    INSERT INTO patterns (
      title, observed_count, context_product_target, context_mode,
      root_cause, solution, trigger, anti_pattern, project_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    title, observedCount, contextProductTarget || null, contextMode || null,
    rootCause, solution, trigger, antiPattern || null,
    PROJECT_ID
  );

  console.log('\n✅ Pattern logged successfully!\n');
}

// Log Failure
async function logFailure() {
  console.log('\n=== Engineering Brain - Log Failure ===\n');

  const title = await prompt('Failure Title: ');
  const productTarget = await prompt('Product Target [optional]: ');
  const engineeringMode = await prompt('Engineering Mode [optional]: ');
  const whatITried = await prompt('What I Tried: ');
  const whyIThoughtItWouldWork = await prompt('Why I Thought It Would Work: ');
  const whatHappened = await prompt('What Actually Happened: ');
  const whyItFailed = await prompt('Why It Failed: ');
  const whatILearned = await prompt('What I Learned: ');
  const correctApproach = await prompt('Correct Approach: ');
  const howToDetect = await prompt('How to Detect This Failure Mode [optional]: ');

  const stmt = db.prepare(`
    INSERT INTO failure_archive (
      title, product_target, engineering_mode,
      what_i_tried, why_i_thought_it_would_work, what_happened,
      why_it_failed, what_i_learned, correct_approach,
      how_to_detect, project_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    title, productTarget || null, engineeringMode || null,
    whatITried, whyIThoughtItWouldWork, whatHappened,
    whyItFailed, whatILearned, correctApproach,
    howToDetect || null,
    PROJECT_ID
  );

  console.log('\n✅ Failure logged successfully!\n');
}

// Search
function search(keyword) {
  console.log(`\n=== Search Results for "${keyword}" (Project: ${PROJECT_ID}) ===\n`);

  if (keyword === 'recent') {
    const results = db.prepare(`
      SELECT * FROM experience_log
      WHERE project_id = ?
        AND created_at >= datetime('now', '-30 days')
      ORDER BY created_at DESC
      LIMIT 10
    `).all(PROJECT_ID);

    console.log(`Recent Experiences (last 30 days) for ${PROJECT_ID}:\n`);
    results.forEach((row, i) => {
      console.log(`${i + 1}. ${row.task_title}`);
      console.log(`   Target: ${row.product_target} | Gear: ${row.execution_gear} | Mode: ${row.engineering_mode}`);
      console.log(`   Problem: ${row.problem.substring(0, 80)}...`);
      console.log(`   Solution: ${row.solution.substring(0, 80)}...`);
      if (row.pattern_observed) {
        console.log(`   Pattern: ${row.pattern_observed.substring(0, 80)}...`);
      }
      console.log();
    });
  } else {
    const results = db.prepare(`
      SELECT task_title, problem, solution, pattern_observed, created_at
      FROM experience_log
      WHERE project_id = ?
        AND (task_title LIKE ? OR problem LIKE ? OR solution LIKE ? OR pattern_observed LIKE ?)
      ORDER BY created_at DESC
      LIMIT 10
    `).all(PROJECT_ID, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);

    console.log(`Found ${results.length} experiences matching "${keyword}" in ${PROJECT_ID}:\n`);
    results.forEach((row, i) => {
      console.log(`${i + 1}. ${row.task_title}`);
      console.log(`   ${row.solution.substring(0, 100)}...`);
      if (row.pattern_observed) {
        console.log(`   Pattern: ${row.pattern_observed.substring(0, 80)}...`);
      }
      console.log();
    });
  }

  if (keyword !== 'recent') {
    console.log(`\nNote: Showing results for "${PROJECT_ID}" only.`);
    console.log(`To search ALL projects, use: sqlite3 brain-memory.db "SELECT ... FROM experience_log WHERE ..."\n`);
  }
}

// Main
(async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'experience':
      case 'exp':
        await logExperience();
        break;
      case 'pattern':
        await logPattern();
        break;
      case 'failure':
      case 'fail':
        await logFailure();
        break;
      case 'search':
        if (!arg) {
          console.error('Usage: node log.js search <keyword>');
          process.exit(1);
        }
        search(arg);
        break;
      default:
        console.log('Engineering Brain - Memory Logging Tool\n');
        console.log('Usage:');
        console.log('  node log.js experience     Log a completed task');
        console.log('  node log.js pattern        Log a discovered pattern');
        console.log('  node log.js failure        Log a failed approach');
        console.log('  node log.js search <term>  Search logged experiences');
        console.log('  node log.js search recent  Show recent experiences\n');
        process.exit(1);
    }

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    db.close();
    process.exit(1);
  }
})();
