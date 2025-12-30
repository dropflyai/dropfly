# First-Run Experience Validation — Authoritative

Before shipping, verify users can learn the system.
If first-time users get lost, the product has failed.

---

## Purpose

This checklist ensures every applicable product includes:
- User orientation (where things are)
- Feature discovery (what things do)
- First-task completion (how to succeed)

This is a **required validation checkpoint** before shipping.

---

## Applicability Decision

### Does This Product Need First-Run Experience?

```
START HERE
    │
    ▼
Is this a simple landing page, marketing site, or content-only site?
    │
    ├── YES → First-run experience NOT REQUIRED
    │         (Skip this checklist)
    │
    └── NO → Continue ↓

Does it have more than 3 features or screens?
    │
    ├── YES → First-run experience REQUIRED
    │
    └── NO → Continue ↓

Is there a learning curve to use it effectively?
    │
    ├── YES → First-run experience REQUIRED
    │
    └── NO → First-run experience RECOMMENDED
              (Lightweight version acceptable)
```

### Product Types That REQUIRE First-Run Experience

- [ ] SaaS applications
- [ ] Mobile apps
- [ ] Desktop applications
- [ ] Complex web apps
- [ ] Internal tools with multiple features
- [ ] Dashboards with multiple sections
- [ ] Admin panels
- [ ] Workflow/automation tools

### Product Types That DON'T Require It

- [ ] Landing pages
- [ ] Marketing sites
- [ ] Blogs / content sites
- [ ] Single-purpose tools (calculator, converter)
- [ ] Documentation sites
- [ ] Simple forms

---

## First-Run Experience Checklist

### SECTION 1: Orientation (Where Things Are)

**Does the user know where to find things?**

```
┌─────────────────────────────────────────────────────────────────┐
│ ORIENTATION CHECKLIST                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [ ] Navigation is explained or obvious                          │
│     User knows how to get to main sections                     │
│                                                                 │
│ [ ] Primary action button is highlighted                        │
│     User knows where the main "Create/New/Start" button is     │
│                                                                 │
│ [ ] Settings/Profile location is clear                          │
│     User knows where to customize or get help                  │
│                                                                 │
│ [ ] Search is discoverable (if applicable)                      │
│     User knows how to find things                              │
│                                                                 │
│ [ ] Help/Support is accessible                                  │
│     User knows where to go if stuck                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Evidence Required:**
- Screenshot showing orientation method (tour, tooltips, etc.)
- Description of what each method teaches

---

### SECTION 2: Feature Discovery (What Things Do)

**Does the user understand what features do?**

```
┌─────────────────────────────────────────────────────────────────┐
│ FEATURE DISCOVERY CHECKLIST                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [ ] Core feature #1 is explained                                │
│     Feature: _____________________                             │
│     Explanation method: _____________________                  │
│                                                                 │
│ [ ] Core feature #2 is explained                                │
│     Feature: _____________________                             │
│     Explanation method: _____________________                  │
│                                                                 │
│ [ ] Core feature #3 is explained                                │
│     Feature: _____________________                             │
│     Explanation method: _____________________                  │
│                                                                 │
│ [ ] Non-obvious features have tooltips/hints                    │
│     List: _____________________                                │
│                                                                 │
│ [ ] New features are highlighted (if applicable)                │
│     Method: [ ] Badge [ ] Modal [ ] Tour [ ] N/A               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Evidence Required:**
- List of features with explanation methods
- Screenshot of feature discovery UX

---

### SECTION 3: First Task Completion (How to Succeed)

**Can the user accomplish something on first use?**

```
┌─────────────────────────────────────────────────────────────────┐
│ FIRST TASK CHECKLIST                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [ ] First task is clearly defined                               │
│     Task: _____________________                                │
│                                                                 │
│ [ ] User is guided to complete first task                       │
│     Method: [ ] Wizard [ ] Checklist [ ] Empty state [ ] Tour  │
│                                                                 │
│ [ ] First task can be completed in < 5 minutes                  │
│     Estimated time: _____________________                      │
│                                                                 │
│ [ ] Success is acknowledged                                     │
│     Method: [ ] Confirmation [ ] Animation [ ] Message         │
│                                                                 │
│ [ ] User has created something tangible                         │
│     What they created: _____________________                   │
│                                                                 │
│ [ ] Next steps are suggested                                    │
│     What's recommended: _____________________                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Evidence Required:**
- Screenshot of first-task flow
- Confirmation that task is completable in stated time

---

### SECTION 4: Tutorial/Tour Implementation

**What methods are used to teach the user?**

```
┌─────────────────────────────────────────────────────────────────┐
│ TUTORIAL METHODS IMPLEMENTED                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Select all that apply:                                         │
│                                                                 │
│ [ ] Setup Wizard                                                │
│     Steps: ___  Est. time: ___                                 │
│     Can skip: [ ] Yes [ ] No                                   │
│                                                                 │
│ [ ] Product Tour                                                │
│     Stops: ___  Est. time: ___                                 │
│     Can skip: [ ] Yes [ ] No                                   │
│     Replay available: [ ] Yes [ ] No                           │
│                                                                 │
│ [ ] Coach Marks / Spotlights                                    │
│     Elements highlighted: ___                                  │
│                                                                 │
│ [ ] Tooltips                                                    │
│     Number of tooltips: ___                                    │
│     Trigger: [ ] Auto [ ] Hover [ ] Click                      │
│                                                                 │
│ [ ] Onboarding Checklist                                        │
│     Items: ___                                                 │
│     Dismissible: [ ] Yes [ ] No                                │
│                                                                 │
│ [ ] Empty State Guidance                                        │
│     Screens with guidance: ___                                 │
│                                                                 │
│ [ ] Interactive Tutorial                                        │
│     Type: [ ] Sandbox [ ] Real-data [ ] Video                  │
│                                                                 │
│ [ ] Video Walkthrough                                           │
│     Length: ___  Skippable: [ ] Yes [ ] No                     │
│                                                                 │
│ [ ] Help Documentation Link                                     │
│     Location: ___                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Minimum Requirement:**
At least ONE of these must be implemented:
- Setup Wizard
- Product Tour
- Onboarding Checklist
- Interactive Tutorial

---

### SECTION 5: User Control

**Can users control their learning experience?**

```
┌─────────────────────────────────────────────────────────────────┐
│ USER CONTROL CHECKLIST                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [ ] Can skip onboarding/tour                                    │
│     Skip is available at: _____________________                │
│                                                                 │
│ [ ] Can exit and resume later                                   │
│     Progress saved: [ ] Yes [ ] No                             │
│                                                                 │
│ [ ] Can replay tour/tutorial                                    │
│     Location: _____________________                            │
│                                                                 │
│ [ ] Can access help at any time                                 │
│     Method: _____________________                              │
│                                                                 │
│ [ ] Settings remembered (don't re-show completed)               │
│     Storage: [ ] LocalStorage [ ] Database [ ] Cookie          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### SECTION 6: Accessibility

**Is the first-run experience accessible?**

```
┌─────────────────────────────────────────────────────────────────┐
│ ACCESSIBILITY CHECKLIST                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [ ] Tour/tooltips work with keyboard navigation                 │
│                                                                 │
│ [ ] Focus is properly managed through steps                     │
│                                                                 │
│ [ ] Progress is announced to screen readers                     │
│                                                                 │
│ [ ] Skip links are available                                    │
│                                                                 │
│ [ ] Color is not the only indicator of state                    │
│                                                                 │
│ [ ] Videos have captions (if applicable)                        │
│                                                                 │
│ [ ] All interactive elements are focusable                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Validation Scoring

Rate each area 1-5:

| Area | Score | Notes |
|------|-------|-------|
| Orientation (where things are) | /5 | |
| Feature Discovery (what things do) | /5 | |
| First Task Completion | /5 | |
| Tutorial Implementation | /5 | |
| User Control | /5 | |
| Accessibility | /5 | |
| **TOTAL** | **/30** | |

### Scoring Guide

- **25-30**: Excellent - Ship confidently
- **20-24**: Good - Minor improvements recommended
- **15-19**: Acceptable - Address gaps before launch
- **10-14**: Needs Work - Significant improvements required
- **< 10**: Fail - Do not ship without major changes

---

## Common Failures (Disallowed)

```
BLOCKING ISSUES - Must fix before shipping:

❌ No orientation at all (user dropped into app with no guidance)
❌ Mandatory video that can't be skipped
❌ Tour with 10+ steps (overwhelming)
❌ Can't skip or exit onboarding
❌ Tooltips that block what they're explaining
❌ No way to replay tour
❌ First task takes > 10 minutes
❌ No clear primary action
❌ Help is hidden or hard to find
❌ Onboarding not keyboard accessible
```

---

## Evidence Documentation

### Required Screenshots

1. **First-time login experience** - What user sees immediately
2. **Tour/tooltip in action** - Mid-onboarding state
3. **First task completion** - Success state
4. **Skip/exit option** - User control
5. **Replay tour location** - How to restart

### Sign-Off

```
FIRST-RUN EXPERIENCE VALIDATION

Project: _____________________
Date: _____________________
Validated by: _____________________

Total Score: ___/30

Applicability: [ ] Required [ ] Recommended [ ] Not Required

Status: [ ] PASS [ ] PASS WITH NOTES [ ] FAIL

Notes:
_________________________________________________
_________________________________________________

Approved for shipping: [ ] Yes [ ] No

Signature: _____________________
```

---

## Quick Reference: Methods by Product Type

| Product Type | Recommended Methods |
|--------------|---------------------|
| Complex SaaS | Setup Wizard + Product Tour + Checklist |
| Simple SaaS | Empty States + Tooltips |
| Mobile App | Tour + Coach Marks |
| Internal Tool | Checklist + Help Docs |
| Dashboard | Tour + Empty States |
| Workflow Tool | Interactive Tutorial + Tour |

---

## Integration with Design Process

This checklist should be completed:

```
1-DISCOVERY → 2-RESEARCH-DEEP → 2-RESEARCH → 3-ARCHITECTURE → 4-FLOWS → 5-BRAND → 6-TEST
                                                                                    ↑
                                                                              THIS PHASE
                                                                                    │
                                                               ┌────────────────────┴────────────────────┐
                                                               │                                         │
                                                               │  Usability Testing                      │
                                                               │  ↓                                      │
                                                               │  First-Run Experience Validation  ◄─── YOU ARE HERE
                                                               │  ↓                                      │
                                                               │  Accessibility Audit                    │
                                                               │  ↓                                      │
                                                               │  Final Handoff                          │
                                                               │                                         │
                                                               └─────────────────────────────────────────┘
```

---

## END OF FIRST-RUN EXPERIENCE VALIDATION
