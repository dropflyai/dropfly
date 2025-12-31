# LOCAL MEMORY SETUP (SQLITE)
**Start logging immediately, migrate to Supabase later**

---

## Quick Start (2 minutes)

### 1. Database Already Initialized ✅

The SQLite database is ready at:
```
engineering/Memory/brain-memory.db
```

### 2. Log Your First Experience

**Option A: Using CLI tool (recommended)**
```bash
cd engineering/Memory
node log.js experience
```

**Option B: Direct SQL**
```bash
sqlite3 engineering/Memory/brain-memory.db
```
```sql
INSERT INTO experience_log (
  task_title, product_target, execution_gear, engineering_mode,
  problem, solution, why_it_worked, pattern_observed, time_spent_minutes
) VALUES (
  'Your task title',
  'WEB_APP',
  'BUILD',
  'APP',
  'Description of problem',
  'What you did to solve it',
  'Why it worked',
  'Generalizable lesson learned',
  30
);
```

### 3. Search Your Experiences

```bash
cd engineering/Memory
node log.js search recent        # Show last 10 experiences
node log.js search "dark mode"   # Search by keyword
```

---

## CLI Tool Usage

### Log Experience (Recipe 1)
```bash
node log.js experience
```
Interactive prompts for all fields.

### Log Pattern (Recipe 6)
```bash
node log.js pattern
```
After 3+ similar tasks, create a pattern.

### Log Failure (Recipe 5)
```bash
node log.js failure
```
Document what didn't work and why.

### Search
```bash
node log.js search recent           # Last 10 experiences
node log.js search "keyword"        # Search all fields
```

---

## SQL Queries (Direct Database Access)

### Search for similar tasks
```sql
SELECT task_title, solution, pattern_observed
FROM experience_log
WHERE task_title LIKE '%keyword%'
   OR problem LIKE '%keyword%'
   OR solution LIKE '%keyword%'
ORDER BY created_at DESC
LIMIT 5;
```

### Find applicable patterns
```sql
SELECT title, solution, trigger, observed_count
FROM patterns
WHERE context_product_target = 'WEB_APP'
ORDER BY observed_count DESC;
```

### Check for known failures
```sql
SELECT title, why_it_failed, correct_approach
FROM failure_archive
WHERE what_i_tried LIKE '%keyword%'
ORDER BY created_at DESC;
```

### Analytics - Growth trajectory
```sql
-- Total experiences logged
SELECT COUNT(*) as total_experiences FROM experience_log;

-- Total patterns identified
SELECT COUNT(*) as total_patterns FROM patterns;

-- Average time per task (efficiency trend)
SELECT AVG(time_spent_minutes) as avg_time FROM experience_log;

-- Experiences by Product Target
SELECT product_target, COUNT(*) as count
FROM experience_log
GROUP BY product_target
ORDER BY count DESC;
```

---

## Migration to Supabase (When Ready)

When you hit 50+ experiences or want multi-machine access:

### Step 1: Create Supabase Project
Follow `SUPABASE-SETUP.md` to create project and run migration SQL.

### Step 2: Set Environment Variables
```bash
# Add to .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Migrate Data (Zero Downtime)
```bash
cd engineering/Memory
node migrate-to-supabase.js
```

This exports all SQLite data to Supabase without deleting local database.

### Step 4: Continue Using (Either/Both)
- **Keep logging to SQLite** (local-first, always works)
- **Switch to Supabase** (for recipes in MemoryLogging.md)
- **Use both** (SQLite as backup, Supabase as primary)

---

## Files in This Directory

| File | Purpose |
|------|---------|
| `brain-memory.db` | SQLite database (local storage) |
| `sqlite-migration-simple.sql` | Schema definition |
| `log.js` | CLI tool for logging experiences/patterns/failures |
| `log-experience.sh` | Bash script for quick logging (alternative) |
| `migrate-to-supabase.js` | Export SQLite data to Supabase |
| `package.json` | Node.js dependencies |
| `LOCAL-SETUP.md` | This file |
| `SUPABASE-SETUP.md` | Guide for migrating to Supabase |

---

## Backup Strategy

### Local SQLite (Default)
- Database file: `brain-memory.db`
- Backed up with git (if you commit it)
- Portable (single file, works offline)

### Git Tracking
Add `brain-memory.db` to git if you want version control of memory:
```bash
git add Memory/brain-memory.db
git commit -m "chore: backup Memory database"
```

**Or** add to `.gitignore` if you want to keep memory private:
```
engineering/Memory/brain-memory.db
engineering/Memory/node_modules/
```

---

## Growth Milestones

Track your progress:

```sql
SELECT
  COUNT(*) as total_logged,
  CASE
    WHEN COUNT(*) < 50 THEN 'Getting started'
    WHEN COUNT(*) < 100 THEN 'Patterns emerging'
    WHEN COUNT(*) < 200 THEN 'Pseudo-intuition developing'
    WHEN COUNT(*) < 500 THEN 'Better than junior dev'
    WHEN COUNT(*) < 1000 THEN 'Better than mid-level dev'
    ELSE 'Institutional memory authority'
  END as current_level
FROM experience_log;
```

---

## Troubleshooting

### "Cannot find module 'better-sqlite3'"
```bash
cd engineering/Memory
npm install
```

### Database file missing
```bash
cd engineering/Memory
sqlite3 brain-memory.db < sqlite-migration-simple.sql
```

### Want to reset database
```bash
rm engineering/Memory/brain-memory.db
sqlite3 engineering/Memory/brain-memory.db < engineering/Memory/sqlite-migration-simple.sql
```

---

**You're ready to start building institutional memory. Log your first experience now!**
