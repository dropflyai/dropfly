# OBSERVED PATTERNS
**Generalizable Insights from Experience**

---

## Purpose

Patterns are generalizable lessons learned from repeated experiences.

After logging 3+ similar tasks in `ExperienceLog.md`, a pattern can be proposed.
Patterns enable **pseudo-intuition** — the agent "just knows" what to do.

---

## How Patterns Are Created

1. Agent completes 3+ similar tasks
2. Agent identifies commonality across experiences
3. Agent proposes pattern (MUST include evidence from ExperienceLog.md)
4. User confirms or rejects
5. Pattern added here

---

## Pattern Format

```markdown
## Pattern: [Descriptive Title]

**Observed:** [X] times across [Y] projects/tasks
**Context:** Product Target + Mode where this applies
**Root Cause:** Why this pattern exists
**Solution:** What to do when this pattern is detected
**Trigger:** When to apply this pattern proactively
**Evidence:** Links to ExperienceLog.md entries

**Anti-Pattern:** What NOT to do (common mistake)
```

---

## How to Use Patterns

### Before Planning
1. Search Patterns.md for applicable patterns based on:
   - Product Target (WEB_APP, API_SERVICE, etc.)
   - Engineering Mode (APP, API, AGENTIC, LIB)
   - Task keywords (auth, settings, forms, API, etc.)

2. If pattern matches → apply learned solution proactively
3. If no pattern exists yet → execute task, log experience, watch for patterns

### After 3+ Similar Tasks
1. Review ExperienceLog.md for commonalities
2. Propose pattern using format above
3. Get user confirmation before adding

---

## Active Patterns

<!-- Example pattern template:

## Pattern: State-Changing Forms Need CSRF Protection

**Observed:** 12 times across 4 WEB_APP projects
**Context:** Product Target = WEB_APP or WEB_SAAS, MODE: APP
**Root Cause:** State-changing forms are vulnerable to cross-site request forgery
**Solution:** Always add CSRF token to forms that POST/PUT/DELETE
**Trigger:** When building any form that changes server state
**Evidence:** ExperienceLog.md [2025-12-15], [2025-12-18], [2025-12-20]

**Anti-Pattern:** Building forms without CSRF protection, adding it later after security review

-->

<!-- All patterns logged below this line -->

---

## Pattern Categories

Patterns will naturally cluster into categories over time:

- **Security Patterns** (auth, CSRF, XSS, input validation)
- **Performance Patterns** (N+1 queries, caching, lazy loading)
- **API Patterns** (error handling, pagination, rate limiting)
- **UI Patterns** (loading states, error states, optimistic updates)
- **Database Patterns** (migrations, RLS, connection pooling)
- **Deployment Patterns** (staging vs prod, env vars, rollback)

---

## Growth Trajectory

- **10 patterns** → Common pitfalls covered
- **25 patterns** → Domain-specific best practices established
- **50 patterns** → Pseudo-intuition fully operational
- **100 patterns** → Expert-level pattern library

---

**Patterns compound. Every pattern makes future tasks faster and more correct.**
