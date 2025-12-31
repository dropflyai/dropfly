# EXPERIENCE LOG
**Learning from Every Task**

---

## Purpose

This log captures every completed task to build institutional memory and enable pattern recognition over time.

After 100 tasks, patterns emerge.
After 500 tasks, pseudo-intuition develops.
After 1000 tasks, the agent knows this codebase better than any human.

---

## Required Format

Each completed task MUST log:

```markdown
### [YYYY-MM-DD] Task Title

**Context:**
- Product Target: WEB_APP | WEB_SAAS | MOBILE_IOS | MOBILE_ANDROID | API_SERVICE | AGENT_SYSTEM | LIBRARY | SCRIPT
- Execution Gear: EXPLORE | BUILD | SHIP | HOTFIX
- Engineering Mode: APP | API | AGENTIC | LIB | MONOREPO
- Artifact Type: Full Document | Fragment | Component | Script | Automation | Test

**Problem:**
What was the challenge or requirement?

**Attempts:**
What approaches were tried (including failures)?
- Attempt 1: [what was tried] → [result]
- Attempt 2: [what was tried] → [result]

**Solution:**
What worked and was shipped?

**Why It Worked:**
Root cause insight or explanation.

**Pattern Observed:**
Generalizable lesson that applies beyond this task.

**Would Do Differently:**
Retrospective: what could have been done better?

**Time Spent:**
Estimate (for future reference).
```

---

## How to Use This Log

### Before Starting a Task
1. Search this log for similar tasks (by Product Target, Mode, keywords)
2. Review what worked and what failed in past similar tasks
3. Apply learned patterns proactively

### After Completing a Task
1. Log the experience using the format above
2. If 3+ similar tasks exist, propose a pattern in `Patterns.md`
3. If failures occurred, log in `FailureArchive.md`

---

## Growth Milestones

- **50 tasks** → Start seeing repeated patterns
- **100 tasks** → Pseudo-intuition emerges for common tasks
- **200 tasks** → Better than junior dev in this domain
- **500 tasks** → Better than mid-level dev in this domain
- **1000 tasks** → Institutional memory authority

---

## Logged Experiences

<!-- Template for first entry:

### [2025-12-20] Example Task Title

**Context:**
- Product Target: WEB_APP
- Execution Gear: BUILD
- Engineering Mode: APP
- Artifact Type: Component

**Problem:**
User needs a login form component.

**Attempts:**
- Attempt 1: Built form without CSRF protection → Security vulnerability
- Attempt 2: Added CSRF token → Worked

**Solution:**
Login form with CSRF protection, validation, error states.

**Why It Worked:**
CSRF tokens prevent cross-site request forgery attacks.

**Pattern Observed:**
All state-changing forms need CSRF protection in WEB_APP/WEB_SAAS.

**Would Do Differently:**
Add CSRF protection from the start, don't wait for security review.

**Time Spent:**
45 minutes

-->

<!-- All future experiences logged below this line -->
