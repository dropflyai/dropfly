# DESIGN PATTERNS LEARNED
**Extracted from Experience**

---

## Purpose

This document captures design patterns learned from repeated experiences.

A pattern is added when:
- 3+ similar design problems have been solved
- A consistent approach has emerged
- The pattern is generalizable beyond specific projects

---

## Pattern Format

```markdown
### Pattern: [Name]

**Category:** [Navigation | Layout | Forms | Feedback | Data Display | Onboarding | etc.]
**Confidence:** [High | Medium | Low] (based on # of validations)
**Validations:** [Number of times this pattern has worked]

**Problem:**
What recurring design problem does this pattern solve?

**Solution:**
What approach consistently works?

**Why It Works:**
Underlying principle or user psychology.

**When to Use:**
Specific contexts where this pattern applies.

**When NOT to Use:**
Contexts where this pattern fails or doesn't apply.

**Examples:**
- Project 1: [brief description]
- Project 2: [brief description]
- Project 3: [brief description]

**Counter-Examples:**
- Project X: [when it didn't work and why]
```

---

## Navigation Patterns

<!-- Example pattern:

### Pattern: Top-Level Navigation Limit

**Category:** Navigation
**Confidence:** High
**Validations:** 7

**Problem:**
Users get overwhelmed when navigation has too many options.

**Solution:**
Limit top-level navigation to 5-7 items maximum.
Group related items under parent categories.
Use progressive disclosure for deep navigation.

**Why It Works:**
Miller's Law: humans can hold 7±2 items in working memory.
More options = more cognitive load = slower decisions.

**When to Use:**
Any navigation with more than 7 potential items.

**When NOT to Use:**
Internal tools where users are experts and value quick access over simplicity.

**Examples:**
- Project Management SaaS: Reduced 12 nav items to 5 with sub-menus
- Healthcare Portal: Grouped 15 sections into 6 parent categories
- E-commerce Admin: Used sidebar categories with expandable sub-items

**Counter-Examples:**
- Developer Tools: Power users preferred flat nav with 10+ items for speed

-->

---

## Layout Patterns

---

## Form Patterns

---

## Feedback Patterns

---

## Data Display Patterns

---

## Onboarding Patterns

---

## Empty State Patterns

---

## Mobile Patterns

---

## Industry-Specific Patterns

### FinTech

---

### Healthcare

---

### E-commerce

---

### B2B SaaS

---

### Consumer Apps

---

## How to Add a Pattern

1. Notice you're solving a similar problem for the 3rd+ time
2. Review past solutions in `ExperienceLog.md`
3. Extract the common approach
4. Document why it works
5. Add to appropriate category above
6. Update as more examples validate or invalidate

---

## Pattern Confidence Levels

| Confidence | Validations | Meaning |
|------------|-------------|---------|
| Low | 3-5 | Emerging pattern, needs more validation |
| Medium | 6-10 | Reliable pattern, some edge cases |
| High | 10+ | Proven pattern, use with confidence |

---

<!-- Add new patterns below this line -->
