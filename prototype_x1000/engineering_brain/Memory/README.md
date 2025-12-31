# MEMORY SYSTEM
**Compounding Learning & Pseudo-Intuition**

---

## Purpose

The Memory system enables the Engineering Brain to **learn from every task** and develop **pseudo-intuition** over time.

**Humans forget. AI agents with Memory don't.**

---

## How It Works

### 1. Experience Logging (`ExperienceLog.md`)
After EVERY task, log:
- Problem
- Attempts (including failures)
- Solution
- Why it worked
- Pattern observed
- Would do differently

**Result:** After 500 tasks, the agent has 500 experiences to draw from.

### 2. Pattern Recognition (`Patterns.md`)
After 3+ similar tasks, extract patterns:
- "Settings pages always need auth checks"
- "API timeouts in prod often caused by connection pool exhaustion"
- "Supabase migrations fail when RLS is enabled"

**Result:** Agent "just knows" what to do (pattern matching at scale).

### 3. Failure Archive (`FailureArchive.md`)
Log every failure:
- What was tried
- Why it failed
- Correct approach
- How to detect this failure mode

**Result:** Agent never makes the same mistake twice.

---

## Compounding Returns

| Tasks Logged | Capability |
|--------------|------------|
| 50 | Repeated patterns visible |
| 100 | Pseudo-intuition emerges |
| 200 | Better than junior dev in this domain |
| 500 | Better than mid-level dev in this domain |
| 1000 | Institutional memory authority |

---

## Storage Options

### Option A: Local SQLite Database (Default) ✅
**Setup**: Follow `LOCAL-SETUP.md` (ready to use now!)
**Database**: `brain-memory.db` (single file, portable, fast queries)
**CLI Tool**: `node log.js experience` for interactive logging

**Pros**: Fast, offline, structured queries, analytics, scales to 1000+ tasks
**Cons**: Single machine (unless you commit DB to git)

**Migration path**: Start with SQLite, migrate to Supabase when you hit 50+ tasks (zero downtime)

### Option B: Supabase Database (Recommended for Teams)
**Setup**: Follow `SUPABASE-SETUP.md` (step-by-step guide)
**Architecture**: One Supabase project for ALL AI brains (Engineering, Design, Options, MBA)
**Usage**: See `../Solutions/Recipes/MemoryLogging.md` for all queries
**Test**: Run `test-example.sql` to verify setup

**Pros**: Multi-machine, full-text search, analytics, real-time, scales to 1000+ tasks, multi-brain support
**Cons**: Requires Supabase project setup (~10 minutes)

**Migration path**: Start with local files, migrate to Supabase when you hit 50+ tasks

---

## Usage

### Before Starting a Task
1. Search `ExperienceLog.md` for similar tasks
2. Check `Patterns.md` for applicable patterns
3. Review `FailureArchive.md` for known failure modes

### After Completing a Task
1. Log in `ExperienceLog.md` (ALWAYS REQUIRED)
2. If 3+ similar tasks exist, propose pattern
3. If failures occurred, log in `FailureArchive.md`

---

## The "Intuition" Mechanism

**Not real intuition. Statistical pattern recognition with perfect recall.**

After 200 tasks:
- Agent "just knows" settings pages need auth
- Agent "has a feeling" this API call will timeout
- Agent "remembers" Supabase migrations need RLS disabled

**From the outside, it looks like intuition.**

---

**This is how the Engineering Brain becomes better than human over time.**
