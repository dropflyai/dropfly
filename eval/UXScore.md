# UX Score — Quality Enforcement (Authoritative)

This document defines how UI quality is evaluated.
Every UI must be scored before it is considered complete.

If quality is not measurable, it is not enforced.

---

## SCORING RULES (MANDATORY)

Each screen must be scored across the following dimensions.
Score each category from **1 (poor)** to **5 (excellent)**.

If ANY category scores below **4**, refactor is required.

No exceptions.

---

## 1. CLARITY

**Question:**
Can a first-time user understand what this screen is for in under 5 seconds?

### Scoring Guide
- **5** — Purpose and primary action are immediately obvious
- **4** — Clear after a brief scan
- **3** — Requires reading or explanation
- **2** — Confusing or ambiguous
- **1** — Purpose unclear

Score <4 → refactor hierarchy and copy.

---

## 2. HIERARCHY

**Question:**
Is attention guided intentionally and predictably?

### Scoring Guide
- **5** — Clear focal point, strong visual order
- **4** — Mostly clear, minor distractions
- **3** — Competing focal points
- **2** — Flat or chaotic layout
- **1** — No discernible hierarchy

Score <4 → refactor layout, spacing, and emphasis.

---

## 3. SPEED TO ACTION

**Question:**
Can the user take the primary action without thinking?

### Scoring Guide
- **5** — Action is obvious and frictionless
- **4** — Action is clear with minimal effort
- **3** — Action requires searching
- **2** — Action is hidden or unclear
- **1** — Action is confusing or blocked

Score <4 → simplify and remove friction.

---

## 4. STATE COMPLETENESS

**Question:**
Does the UI clearly handle all system states?

Required states:
- Default
- Loading
- Empty
- Error
- Success

### Scoring Guide
- **5** — All states defined and clear
- **4** — All states present, minor gaps
- **3** — One state weak or unclear
- **2** — Multiple missing states
- **1** — States ignored

Score <4 → add missing states immediately.

---

## 5. COGNITIVE LOAD

**Question:**
Does the UI minimize unnecessary thinking?

### Scoring Guide
- **5** — Calm, focused, no distractions
- **4** — Slightly busy but manageable
- **3** — Visually or mentally heavy
- **2** — Overwhelming
- **1** — Exhausting

Score <4 → remove elements and simplify.

---

## 6. COPY QUALITY

**Question:**
Does the language reduce uncertainty and guide action?

### Scoring Guide
- **5** — Clear, human, precise
- **4** — Mostly clear, minor cleanup needed
- **3** — Generic or verbose
- **2** — Vague, marketing-like, or robotic
- **1** — Confusing or misleading

Score <4 → rewrite copy using `/design/CopyTone.md`.

---

## 7. MODE ALIGNMENT

**Question:**
Does the UI respect its selected mode?

Modes:
- MODE_SAAS
- MODE_INTERNAL
- MODE_AGENTIC

### Scoring Guide
- **5** — Perfectly tuned to mode
- **4** — Mostly aligned
- **3** — Mixed signals
- **2** — Poor alignment
- **1** — Mode ignored

Score <4 → refactor density, tone, and structure.

---

## 8. ACCESSIBILITY (MINIMUM BAR)

**Question:**
Is the UI usable by keyboard and screen readers?

Minimum requirements:
- Keyboard navigation
- Visible focus states
- Sufficient contrast
- Semantic structure

### Scoring Guide
- **5** — Fully accessible
- **4** — Minor issues
- **3** — Noticeable gaps
- **2** — Significant barriers
- **1** — Accessibility ignored

Score <4 → fix accessibility issues before proceeding.

---

## FINAL UX SCORE DECISION

- Any score <4 → **REFRACTOR REQUIRED**
- All scores ≥4 → **UI MAY SHIP**

Scores must be stated explicitly before final output.

---

## ENFORCEMENT RULE

Quality is enforced, not assumed.
Do not justify low scores.
Refactor until standards are met.

---

## END OF UX SCORE
