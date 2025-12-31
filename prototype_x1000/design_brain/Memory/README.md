# DESIGN MEMORY SYSTEM
**Compounding Learning & Design Intuition**

---

## Purpose

The Memory system enables the Design Brain to **learn from every project** and develop **design intuition** over time.

**Humans forget lessons. AI agents with Memory don't.**

---

## How It Works

### 1. Experience Logging (`ExperienceLog.md`)
After EVERY design task, log:
- Problem/Brief
- Approaches tried (including failures)
- Final solution
- Why it worked
- Pattern observed
- User/stakeholder feedback
- Would do differently

**Result:** After 100 projects, the agent has 100 design decisions to draw from.

### 2. Pattern Recognition (`DesignPatterns.md`)
After 3+ similar design problems, extract patterns:
- "FinTech apps always need security trust signals"
- "Dashboard headers with too many actions cause paralysis"
- "Empty states that lack clear CTA have 40% higher bounce"
- "Mobile nav with 5+ items causes navigation blindness"

**Result:** Agent "just knows" what works (pattern matching at scale).

### 3. Failure Archive (`DesignFailures.md`)
Log every design that didn't work:
- What was designed
- Why it failed (user feedback, metrics, stakeholder rejection)
- What should have been done
- How to detect this failure mode

**Result:** Agent never makes the same design mistake twice.

### 4. Style Memory (`StyleDecisions.md`)
Track industry and brand style patterns:
- Color choices that worked/failed
- Typography that resonated
- Layout approaches by industry
- Visual signatures that differentiated

**Result:** Agent develops visual intuition per industry.

---

## Compounding Returns

| Projects Logged | Capability |
|-----------------|------------|
| 25 | Recognizes common design problems |
| 50 | Pseudo-intuition emerges for UI patterns |
| 100 | Better than junior designer in covered domains |
| 200 | Develops industry-specific design sense |
| 500 | Institutional design authority |

---

## Storage Options

### Option A: Markdown Files (Default)
**Setup**: Just start using the templates below
**Files**: `ExperienceLog.md`, `DesignPatterns.md`, etc.

**Pros**: Simple, searchable, no setup required
**Cons**: Manual searching, no analytics

### Option B: Database (Advanced)
Same setup as Engineering Brain—see `../engineering_brain/Memory/`
Can share the same Supabase instance with different tables.

---

## Usage

### Before Starting a Design Task
1. Search `ExperienceLog.md` for similar projects
2. Check `DesignPatterns.md` for applicable patterns
3. Review `DesignFailures.md` for known pitfalls
4. Check `StyleDecisions.md` for industry/brand learnings

### After Completing a Design Task
1. Log in `ExperienceLog.md` (ALWAYS REQUIRED)
2. If 3+ similar designs exist, propose pattern
3. If design was rejected/failed, log in `DesignFailures.md`
4. If new style insight, log in `StyleDecisions.md`

---

## The "Intuition" Mechanism

**Not real intuition. Statistical pattern recognition with perfect recall.**

After 100 projects:
- Agent "just knows" dashboards need hierarchy
- Agent "has a feeling" this color won't work for healthcare
- Agent "remembers" modals need escape routes

**From the outside, it looks like design intuition.**

---

## Files in This Directory

```
Memory/
├── README.md               # This file
├── ExperienceLog.md        # All design experiences
├── DesignPatterns.md       # Extracted patterns
├── DesignFailures.md       # Failed designs and lessons
└── StyleDecisions.md       # Visual/style learnings
```

---

## Integration with Design Process

```
                                    ┌─────────────────────┐
                                    │                     │
                                    │      MEMORY         │
                                    │                     │
                                    └──────────┬──────────┘
                                               │
                           ┌───────────────────┼───────────────────┐
                           │                   │                   │
                           ▼                   ▼                   ▼
                      BEFORE              DURING               AFTER
                     ┌───────┐           ┌───────┐           ┌───────┐
                     │Search │           │Apply  │           │ Log   │
                     │past   │           │learned│           │what   │
                     │similar│           │pattern│           │worked │
                     └───────┘           └───────┘           └───────┘
```

---

**This is how the Design Brain becomes better than human designers over time.**
