# DESIGN FAILURES ARCHIVE
**Learning from What Didn't Work**

---

## Purpose

This archive captures every design that failed, was rejected, or underperformed.

**The goal is to never make the same design mistake twice.**

Failures are categorized by type so future designs can proactively avoid known pitfalls.

---

## Failure Format

```markdown
### [YYYY-MM-DD] Failure Title

**Context:**
- Product Type: [WEB_APP | WEB_SAAS | MOBILE | etc.]
- Industry: [Industry]
- Design Element: [What was being designed]

**What Was Designed:**
Description of the design that failed.

**How It Failed:**
- User feedback: [what users said/did]
- Metrics impact: [if measurable]
- Stakeholder feedback: [if rejected]

**Why It Failed:**
Root cause analysis.

**What Should Have Been Done:**
The better approach (known now).

**How to Detect This Failure Mode:**
Warning signs to watch for in future designs.

**Category:**
[ ] Usability - Users couldn't figure it out
[ ] Accessibility - Failed accessibility standards
[ ] Performance - Too slow/heavy
[ ] Visual - Looked wrong for context
[ ] Content - Copy/messaging didn't work
[ ] Flow - Journey was broken
[ ] Technical - Couldn't be implemented
[ ] Stakeholder - Didn't meet business needs
```

---

## Failure Categories

### Usability Failures
Designs where users couldn't accomplish their goals.

<!-- Example:

### [2025-01-15] Hidden Primary Action

**Context:**
- Product Type: WEB_SAAS
- Industry: Project Management
- Design Element: Task creation

**What Was Designed:**
"Create Task" button was in a dropdown menu to keep the UI clean.

**How It Failed:**
- User feedback: 4/5 test users couldn't find how to create a task
- Metrics impact: Task creation dropped 40%
- Time to create task: increased from 2s to 15s

**Why It Failed:**
Primary action was hidden behind a secondary interaction.
Clean UI ≠ usable UI.

**What Should Have Been Done:**
Primary action should always be visible and prominent.
Never hide the main thing users need to do.

**How to Detect This Failure Mode:**
Ask: "Is the primary action visible without any clicks?"
If no, redesign.

**Category:** [x] Usability

-->

---

### Accessibility Failures
Designs that failed accessibility requirements.

---

### Visual/Style Failures
Designs that looked wrong for the context or audience.

---

### Flow/Journey Failures
User journeys that were broken or confusing.

---

### Content Failures
Copy or messaging that didn't resonate.

---

### Stakeholder/Business Failures
Designs rejected for not meeting business needs.

---

## Common Failure Patterns

Track recurring themes across failures:

| Pattern | Occurrences | Prevention |
|---------|-------------|------------|
| Hidden primary action | | Always visible CTAs |
| Information overload | | Progressive disclosure |
| Unclear next steps | | Explicit guidance |
| Mobile afterthought | | Mobile-first design |
| Accessibility ignored | | Check before shipping |

---

## How to Use This Archive

### Before Designing
1. Search for similar design elements
2. Check if there's a known failure pattern
3. Proactively avoid documented pitfalls

### After a Failure
1. Document immediately (memory is freshest)
2. Be honest about root cause
3. Extract the prevention rule
4. Update common patterns table

---

## Failure Prevention Checklist

Before shipping any design, check against known failures:

- [ ] Primary action is visible without clicks
- [ ] Mobile experience is designed, not adapted
- [ ] Accessibility requirements are met
- [ ] User can always know where they are
- [ ] Empty states guide action
- [ ] Error states are helpful
- [ ] Loading states are present
- [ ] [Add more as failures accumulate]

---

<!-- Log failures below this line -->
