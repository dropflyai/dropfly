# Unified Brain Memory - Supabase Setup

This folder contains credentials for the **ai-brains-memory** Supabase project.

---

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. **Project Name**: `ai-brains-memory`
4. **Database Password**: Generate and save securely
5. **Region**: Choose closest to you
6. Click **"Create new project"**
7. Wait ~2 minutes for initialization

### Step 2: Configure Credentials

```bash
# Copy template
cp .env.template .env

# Edit with your values
nano .env
```

Get values from: **Supabase Dashboard > Project Settings > API**

- `SUPABASE_URL` = Project URL
- `SUPABASE_ANON_KEY` = anon/public key
- `SUPABASE_SERVICE_KEY` = service_role key

### Step 3: Run Migration

**Option A: Via Script**
```bash
cd /Users/rioallen/Documents/DropFly-OS-App-Builder/prototype_x1000
./run-brain-migration.sh
```

**Option B: Via Supabase SQL Editor**
1. Go to Supabase Dashboard > SQL Editor
2. Click "New query"
3. Copy contents of `unified-brain-memory-migration.sql`
4. Click "Run"

### Step 4: Verify

Check Supabase Dashboard > Table Editor for these tables:

**Universal Tables (all brains):**
- `shared_experiences`
- `shared_patterns`
- `shared_failures`

**Design Brain Tables:**
- `design_dna`
- `design_references`
- `design_ux_scores`
- `design_style_decisions`

**Engineering Brain Tables:**
- `eng_architecture_decisions`
- `eng_tech_debt`

**Product Brain Tables:**
- `product_features`
- `product_user_research`

**Trading Brain Tables:**
- `trading_strategies`
- `trading_signals`

**MBA Brain Tables:**
- `mba_strategic_decisions`
- `mba_competitor_analysis`

**CEO Brain Tables:**
- `ceo_task_delegations`
- `ceo_brain_collaborations`
- `ceo_conflict_resolutions`

---

## Security Notes

- **NEVER commit `.env` to git** (already in .gitignore)
- **anon key** is safe for client-side
- **service_role key** bypasses RLS - server-side only
- All tables have RLS enabled

---

## Troubleshooting

**"permission denied for table"**
- Check you're using the correct API key
- For testing, verify RLS policies in Supabase

**"relation does not exist"**
- Migration didn't run successfully
- Re-run the migration SQL

**Can't see data in Table Editor**
- RLS policies may be blocking
- Use SQL Editor: `SELECT * FROM shared_experiences;`
