# MEMORY SYSTEM QUICK REFERENCE

---

## ⚡ Quick Start

```bash
cd engineering/Memory
node log.js experience
```

---

## 📝 Common Commands

### Log an Experience (After Every Task)
```bash
node log.js experience
```

### Search Your Memory
```bash
node log.js search recent          # Last 10 experiences
node log.js search "dark mode"     # Search by keyword
```

### Log a Pattern (After 3+ Similar Tasks)
```bash
node log.js pattern
```

### Log a Failure (When Something Doesn't Work)
```bash
node log.js failure
```

---

## 🔍 Useful SQL Queries

### Before Planning: Search for Similar Tasks
```bash
sqlite3 brain-memory.db "SELECT task_title, solution FROM experience_log WHERE problem LIKE '%your-problem%' ORDER BY created_at DESC LIMIT 5;"
```

### Check Your Progress
```bash
sqlite3 brain-memory.db "SELECT COUNT(*) as total FROM experience_log;"
```

### Find Patterns for Current Work
```bash
sqlite3 brain-memory.db "SELECT title, solution FROM patterns WHERE context_product_target = 'WEB_APP';"
```

### Check for Known Failures
```bash
sqlite3 brain-memory.db "SELECT title, why_it_failed, correct_approach FROM failure_archive WHERE what_i_tried LIKE '%your-approach%';"
```

---

## 📊 Analytics

### Growth Tracker
```bash
sqlite3 brain-memory.db "SELECT COUNT(*) FROM experience_log;" # Total experiences
sqlite3 brain-memory.db "SELECT COUNT(*) FROM patterns;"       # Patterns identified
sqlite3 brain-memory.db "SELECT AVG(time_spent_minutes) FROM experience_log;" # Avg time
```

### Recent Work
```bash
sqlite3 brain-memory.db "SELECT * FROM recent_experiences;"
```

---

## 🚀 Migration to Supabase (When Ready)

When you hit 50+ experiences or need multi-machine access:

```bash
# 1. Create Supabase project (see SUPABASE-SETUP.md)
# 2. Set environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your_key

# 3. Migrate data (zero downtime)
node migrate-to-supabase.js
```

---

## 📁 Files

| File | Purpose |
|------|---------|
| `brain-memory.db` | Your local memory database |
| `log.js` | Main CLI tool |
| `LOCAL-SETUP.md` | Full setup guide |
| `SUPABASE-SETUP.md` | Cloud migration guide |

---

## 🎯 Workflow

### Before Every Task
1. Search for similar past tasks: `node log.js search "keyword"`
2. Check for applicable patterns: `sqlite3 brain-memory.db "SELECT * FROM patterns;"`
3. Check for known failures: `sqlite3 brain-memory.db "SELECT * FROM failure_archive;"`

### After Every Task (REQUIRED)
1. Log experience: `node log.js experience`
2. If 3+ similar tasks exist: `node log.js pattern`
3. If something failed: `node log.js failure`

---

## 🏆 Milestones

- **50 tasks** → Patterns visible
- **100 tasks** → Pseudo-intuition emerges
- **200 tasks** → Better than junior dev
- **500 tasks** → Better than mid-level dev
- **1000 tasks** → Institutional memory authority

Check progress:
```bash
sqlite3 brain-memory.db "SELECT COUNT(*) as progress, CASE WHEN COUNT(*) >= 1000 THEN '🏆 Authority' WHEN COUNT(*) >= 500 THEN '🥇 Mid-Level+' WHEN COUNT(*) >= 200 THEN '🥈 Junior+' WHEN COUNT(*) >= 100 THEN '🥉 Intuition' WHEN COUNT(*) >= 50 THEN '📈 Patterns' ELSE '🌱 Building' END as level FROM experience_log;"
```

---

**Remember**: Every task logged makes future work faster and more correct. Never skip logging!
