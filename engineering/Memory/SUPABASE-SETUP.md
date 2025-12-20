# SUPABASE SETUP GUIDE
**AI Brains Memory System — Initial Setup**

---

## Architecture Overview

**One Supabase project** houses memory for **all AI brains**:
- Engineering Brain ✓ (current)
- Design Brain (future)
- Options Trader Brain (future)
- MBA Brain (future)

Each brain gets **its own tables** with domain-specific fields.
All tables share `project_id` column for isolation when brains share tables.

---

## Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. **Project Name**: `ai-brains-memory` (or your preference)
4. **Database Password**: Generate strong password (save in password manager)
5. **Region**: Choose closest to you
6. **Pricing Plan**: Free (500MB database, 50K rows — plenty for 4+ brains)
7. Click **"Create new project"**
8. Wait ~2 minutes for project to initialize

---

## Step 2: Run Migration SQL

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `engineering/Memory/supabase-migration.sql` in your code editor
4. Copy **entire file contents**
5. Paste into Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. Wait for success message: "Success. No rows returned"

---

## Step 3: Verify Tables Created

1. In Supabase dashboard, go to **Table Editor** (left sidebar)
2. You should see 3 new tables:
   - `experience_log`
   - `patterns`
   - `failure_archive`
3. Click each table to verify columns exist

---

## Step 4: Test with Example Data

1. Go back to **SQL Editor**
2. Click **"New query"**
3. Open `engineering/Memory/test-example.sql` in your code editor
4. Copy **entire file contents**
5. Paste into Supabase SQL Editor
6. Click **"Run"**
7. You should see:
   - INSERT queries succeed
   - SELECT queries return test data
   - Pattern created
   - Failure logged

---

## Step 5: Clean Up Test Data

After verifying setup works:

1. Go to **SQL Editor**
2. Run this query to delete test data:

```sql
-- Clean up test data
DELETE FROM experience_log WHERE project_id = 'engineering-brain';
DELETE FROM patterns WHERE project_id = 'engineering-brain';
DELETE FROM failure_archive WHERE project_id = 'engineering-brain';
```

3. Verify tables are empty but structure remains

---

## Step 6: Get API Credentials

1. In Supabase dashboard, go to **Project Settings** → **API** (left sidebar)
2. Copy these values (you'll need them for logging):

```bash
# Project URL
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Anon/Public Key (safe for client-side)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (NEVER expose client-side, server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Add to your `.env` file (create if doesn't exist):

```bash
# AI Brains Memory System
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

4. Add `.env` to `.gitignore` if not already there

---

## Step 7: Start Logging

You're ready! Start logging experiences using:
- **Manual**: Run queries from `Solutions/Recipes/MemoryLogging.md` in SQL Editor
- **Automated**: Use JavaScript/Node.js examples from Recipe 1

First real task to log:
```sql
INSERT INTO experience_log (
  task_title,
  product_target,
  execution_gear,
  engineering_mode,
  problem,
  solution,
  why_it_worked,
  pattern_observed,
  time_spent_minutes,
  project_id
) VALUES (
  'Your first task title',
  'WEB_APP', -- or your Product Target
  'BUILD',
  'APP',
  'Description of the problem',
  'What you did to solve it',
  'Why this solution worked',
  'Generalizable lesson learned',
  30, -- time spent in minutes
  'engineering-brain'
);
```

---

## Future Brains Setup

When you're ready to add Design Brain, Options Trader Brain, or MBA Brain:

1. Create new migration file (e.g., `design-brain-migration.sql`)
2. Define brain-specific tables (e.g., `design_decisions`, `usability_tests`)
3. Include `project_id` column in all tables
4. Run migration in **same Supabase project**
5. Update `.env` with same credentials (shared across brains)

**No new Supabase project needed** — just add new tables to existing project.

---

## Costs & Limits

**Free Tier Limits:**
- 500MB database storage
- 50,000 rows total
- 2GB bandwidth/month
- Unlimited API requests

**Expected Usage (Engineering Brain):**
- 1000 logged experiences = ~3MB, ~3000 rows
- Well within free tier limits
- 4 brains × 1000 experiences each = ~12MB, ~12K rows (still free)

**When to upgrade to Pro ($25/month):**
- 8GB database storage
- 500,000 rows
- 250GB bandwidth
- Only needed if you log 50K+ total experiences across all brains

---

## Troubleshooting

### "relation does not exist" error
- Migration didn't run successfully
- Re-run `supabase-migration.sql`

### "permission denied for table" error
- RLS policies are blocking access
- Check if you're using correct API key
- For testing, you can temporarily disable RLS on tables

### "syntax error" in migration
- Make sure you copied entire file
- Check for missing semicolons
- Run in Supabase SQL Editor, not psql client

### Can't see data in Table Editor
- Check RLS policies are correct
- Use SQL Editor to query directly: `SELECT * FROM experience_log;`

---

## Security Notes

1. **Never commit `.env` to git** (contains API keys)
2. **Use anon key for client-side** (safe to expose)
3. **Use service role key for server-side only** (can bypass RLS)
4. **RLS policies are enabled** by default (multi-user safe)
5. **All users can read all experiences** (knowledge sharing)
6. **Users can only insert/update their own entries** (safety)

---

## Next Steps

After setup:
1. ✅ Log your first real experience using Recipe 1
2. After 3 similar tasks, create your first pattern using Recipe 6
3. After 50 tasks, review analytics (Recipe 7)
4. After 100 tasks, pseudo-intuition emerges
5. After 500 tasks, you're at mid-level dev expertise in this domain

---

**Setup complete. Start building institutional memory.**
