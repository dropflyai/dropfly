# PROJECT TEMPLATE

**Purpose:** Master template for all new projects with built-in efficiency system

**Version:** 1.0
**Last Updated:** 2025-12-11
**Efficiency Target:** 10/10

---

## 🎯 What This Template Solves

This template solves the **"2/10 efficiency problem"** by providing:

1. ✅ **Automation Playbook** - Never forget how to automate tasks
2. ✅ **Debugging Log** - Never repeat the same mistakes
3. ✅ **Efficiency Checklist** - Pre-response verification for Claude
4. ✅ **Credential Organization** - Never ask for credentials twice
5. ✅ **Common Mistakes Reference** - Avoid known patterns

**User's feedback that created this system:**
> "as of right now i would give you a 2 out of 10 for effiency. how do we get that to 10/10"

---

## 📁 Template Structure

```
PROJECT-NAME/
├── .claude/                          # Claude's instruction manual
│   ├── SYSTEM-PROMPT.md             # Read first - overall system
│   ├── EFFICIENCY-CHECKLIST.md      # Read before every response
│   ├── AUTOMATION-PLAYBOOK.md       # All automation methods
│   ├── DEBUGGING-LOG.md             # Past issues + solutions
│   └── COMMON-MISTAKES.md           # Patterns to avoid
├── credentials/
│   ├── .env                         # Actual credentials (NOT in git)
│   ├── .env.template                # Template (safe for git)
│   ├── README.md                    # Credential management guide
│   └── services/                    # Service-specific credentials
├── scripts/
│   ├── automation/                  # Testing & verification
│   │   └── test-deployment.py       # Playwright deployment test
│   ├── deployment/                  # Deployment automation
│   │   └── deploy-to-vercel.sh      # Vercel CLI deployment
│   └── database/                    # Database operations
│       └── run-migration.sh         # Supabase migration runner
├── src/                             # Your source code
├── docs/                            # Project documentation
└── README.md                        # This file
```

---

## 🚀 Quick Start

### Step 1: Copy Template to New Project

```bash
# Copy entire template
cp -r /Users/rioallen/Documents/DropFly-OS-App-Builder/PROJECT-TEMPLATE /path/to/NEW-PROJECT-NAME

# Navigate to new project
cd /path/to/NEW-PROJECT-NAME
```

### Step 2: Set Up Credentials

```bash
# Copy template to actual .env file
cp credentials/.env.template credentials/.env

# Edit .env with actual values
# Replace all "your_*_here" placeholders
nano credentials/.env
```

### Step 3: Initialize Git (if new project)

```bash
# Initialize git
git init

# Create .gitignore if it doesn't exist
cat > .gitignore <<EOF
# Environment variables
.env
credentials/.env
credentials/services/*.env

# Dependencies
node_modules/
venv/
__pycache__/

# Build outputs
dist/
build/
*.pyc

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF

# First commit
git add .
git commit -m "Initial commit from PROJECT-TEMPLATE"
```

### Step 4: Claude Instructions

**For Claude:** When working on this project:

1. ✅ Read `.claude/SYSTEM-PROMPT.md` on first interaction
2. ✅ Read `.claude/EFFICIENCY-CHECKLIST.md` before EVERY response
3. ✅ Check `.claude/DEBUGGING-LOG.md` before solving issues
4. ✅ Check `.claude/AUTOMATION-PLAYBOOK.md` before claiming "can't automate"
5. ✅ Check `credentials/.env` before asking for credentials

---

## 📚 Documentation Overview

### For Claude (Must Read)

1. **SYSTEM-PROMPT.md** (🔴 CRITICAL)
   - Overall system understanding
   - Critical rules to never break
   - Workflow for common tasks
   - Red alert phrases to watch for

2. **EFFICIENCY-CHECKLIST.md** (🔴 READ BEFORE EVERY RESPONSE)
   - Pre-response verification checklist
   - Have we solved this before?
   - Can this be automated?
   - Do we have credentials?
   - Will I verify before claiming success?

3. **AUTOMATION-PLAYBOOK.md**
   - Supabase migrations via psql
   - Vercel CLI deployments
   - AWS EC2 operations
   - Testing with Playwright
   - All automation methods

4. **DEBUGGING-LOG.md**
   - Past issues with full context
   - Symptoms, root cause, solution
   - Issue template for new problems
   - Cross-references to related issues

5. **COMMON-MISTAKES.md**
   - "I can't automate X" (but you can)
   - Claiming success without verification
   - Missing user journey mapping
   - Asking for existing credentials

### For Humans

- **credentials/README.md** - Credential management guide
- **This file** - Template usage and quick start

---

## 🔧 Available Scripts

### Database Operations

```bash
# Run Supabase migration
cd scripts/database
./run-migration.sh ../../migrations/001_create_tables.sql
```

### Deployment

```bash
# Deploy to Vercel (preview)
cd scripts/deployment
./deploy-to-vercel.sh

# Deploy to Vercel (production)
./deploy-to-vercel.sh --prod
```

### Testing

```bash
# Test deployment with Playwright
cd scripts/automation
python3 test-deployment.py https://www.yourapp.com
```

---

## 🎯 Efficiency System Overview

### Problem This Solves

**Before (2/10 efficiency):**
- Claude forgets automation solutions
- Repeats same mistakes
- Asks for credentials repeatedly
- Claims success without verification
- No system to track issues

**After (10/10 efficiency):**
- ✅ Automation playbook prevents "can't automate" claims
- ✅ Debugging log prevents repeated mistakes
- ✅ Organized credentials prevent duplicate requests
- ✅ Efficiency checklist mandates verification
- ✅ Common mistakes document patterns

### How It Works

```
User Request
     ↓
Claude reads EFFICIENCY-CHECKLIST.md
     ↓
Check DEBUGGING-LOG (solved before?)
     ↓
Check AUTOMATION-PLAYBOOK (can automate?)
     ↓
Check credentials/.env (have credentials?)
     ↓
Implement Solution
     ↓
Verify with Tests (MUST pass before claiming success)
     ↓
Document in DEBUGGING-LOG
     ↓
Respond to User (with evidence)
```

---

## 📊 Success Metrics

Track these to measure 10/10 efficiency:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| False "can't automate" claims | 0 | Count per week |
| Unverified success claims | 0 | Count per week |
| Requests for existing credentials | 0 | Count per week |
| Repeated mistakes from log | 0 | Count per month |
| Issues documented within 1 hour | 100% | Log timestamps |
| Tests written before claiming done | 100% | Count per task |

---

## 🚨 Critical Rules for Claude

### Rule #1: NEVER Claim "I Can't Automate X"

Before saying this:
- ✅ Search AUTOMATION-PLAYBOOK.md
- ✅ Check scripts/ directory
- ✅ Review DEBUGGING-LOG.md

**Common false claims:**
- ❌ "I can't run Supabase migrations" → YES YOU CAN via psql
- ❌ "I can't deploy to Vercel" → YES YOU CAN via CLI

### Rule #2: NEVER Claim Success Without Verification

Before saying "it's working now":
- ✅ Write test script
- ✅ Run tests
- ✅ Capture output/screenshots
- ✅ Verify no errors

### Rule #3: NEVER Ask for Existing Credentials

Before asking "What's the X password?":
- ✅ Check `credentials/.env`
- ✅ Check `credentials/services/*.env`
- ✅ Search DEBUGGING-LOG for "Added [SERVICE]"

### Rule #4: ALWAYS Map User Journey for Auth/UX

Before implementing auth features:
- ✅ WHO is the user?
- ✅ WHERE are they coming from?
- ✅ WHAT do they expect?
- ✅ WHY would they continue?
- ✅ HOW does system facilitate?

### Rule #5: ALWAYS Check Schema Before SQL

Before INSERT/UPDATE queries:
- ✅ Query information_schema
- ✅ Verify data types
- ✅ Check constraints
- ✅ Use only confirmed columns

---

## 🔄 Workflow Examples

### Running Database Migration

```bash
# 1. Check credentials exist
grep "SUPABASE_DB_PASSWORD" credentials/.env

# 2. Create migration file
cat > migrations/001_create_users.sql <<EOF
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
EOF

# 3. Run migration
cd scripts/database
./run-migration.sh ../../migrations/001_create_users.sql

# 4. Verify
PGPASSWORD=$SUPABASE_DB_PASSWORD psql \
  -h $SUPABASE_HOST \
  -U postgres \
  -d postgres \
  -c "\d users"
```

### Deploying to Vercel

```bash
# 1. Check credentials exist
grep "VERCEL_TOKEN" credentials/.env

# 2. Deploy
cd scripts/deployment
./deploy-to-vercel.sh --prod

# 3. Verify with Playwright
cd ../automation
python3 test-deployment.py https://www.yourapp.com

# 4. Only claim success if tests pass
```

---

## 📝 Adding New Automation

When discovering new automation solution:

1. **Document in AUTOMATION-PLAYBOOK.md:**
   ```markdown
   ### Task Name

   **Problem:** What manual task this automates

   **Solution:**
   ```bash
   # Command or script
   ```

   **Usage:**
   ```bash
   # Example
   ```
   ```

2. **Create reusable script in scripts/:**
   ```bash
   # Create script
   nano scripts/automation/new-task.sh

   # Make executable
   chmod +x scripts/automation/new-task.sh
   ```

3. **Document in DEBUGGING-LOG.md:**
   ```markdown
   Discovered automation for [TASK] on [DATE]
   Location: scripts/automation/new-task.sh
   Documentation: AUTOMATION-PLAYBOOK.md
   ```

---

## 🆘 Troubleshooting

### "Scripts not executable"

```bash
# Make all scripts executable
chmod +x scripts/database/*.sh
chmod +x scripts/deployment/*.sh
chmod +x scripts/automation/*.py
```

### "Environment variables not loading"

```bash
# Verify .env exists
ls -la credentials/.env

# Load variables
export $(grep -v '^#' credentials/.env | xargs)

# Verify
echo $SUPABASE_URL
```

### "Playwright not installed"

```bash
# Install Playwright
pip3 install playwright
python3 -m playwright install chromium
```

---

## 🔐 Security

**CRITICAL:** Never commit these files to git:

- ❌ `credentials/.env`
- ❌ `credentials/services/*.env`
- ❌ Any file with actual API keys/passwords

**SAFE to commit:**

- ✅ `credentials/.env.template`
- ✅ All files in `.claude/`
- ✅ All scripts in `scripts/`
- ✅ Documentation files

---

## 📞 Support

**For Claude:**
- Read `.claude/SYSTEM-PROMPT.md` for comprehensive instructions
- Check `.claude/EFFICIENCY-CHECKLIST.md` before every response
- Search `.claude/DEBUGGING-LOG.md` when encountering issues

**For Humans:**
- Review this README for template usage
- Check `credentials/README.md` for credential management
- Refer to `.claude/` documentation for system understanding

---

## ✅ Project Checklist

When starting new project with this template:

- [ ] Copy template to new project directory
- [ ] Rename project folder appropriately
- [ ] Copy `.env.template` to `.env`
- [ ] Fill in actual credentials in `.env`
- [ ] Verify `.gitignore` includes `.env`
- [ ] Initialize git repository
- [ ] Claude reads `.claude/SYSTEM-PROMPT.md`
- [ ] Test one automation script to verify setup
- [ ] Update this README with project-specific info

---

## 📈 Continuous Improvement

### Weekly Review (Monday)
- [ ] Read COMMON-MISTAKES.md
- [ ] Scan last week's DEBUGGING-LOG entries
- [ ] Review credentials/ for new additions
- [ ] Check scripts/ for new utilities

### Weekly Review (Friday)
- [ ] Calculate average efficiency score
- [ ] Identify patterns in mistakes
- [ ] Update COMMON-MISTAKES.md if needed
- [ ] Plan improvements for next week

### Monthly Review
- [ ] Review mistake frequency tracker
- [ ] Identify top 3 recurring mistakes
- [ ] Create specific prevention strategies
- [ ] Archive resolved patterns

---

**Template Version:** 1.0
**Created:** 2025-12-11
**Efficiency Goal:** 10/10
**Current Baseline:** 2/10 → Must improve to 10/10

**This template is the system that achieves 10/10 efficiency.**
