# UX Score — Quality Enforcement (Authoritative)

This document defines how UI quality is evaluated.
Every UI must be scored before it is considered complete.

If quality is not measurable, it is not enforced.

---

## SCORING RULES (MANDATORY)

Each screen must be scored across the following dimensions.
Score each category from **1 (poor)** to **5 (excellent)**.

### Hard Fail Dimensions
These dimensions are critical. Score <3 = immediate refactor required:
- **Accessibility**
- **Usability (Clarity)**
- **Clarity**

### Passing Criteria
- Average score across all dimensions ≥ 4.0
- No hard-fail dimension < 3
- Originality is NOT a hard fail — evaluated holistically

### Originality Note
Originality is evaluated holistically, not stylistically. Novel combinations, interaction logic, and conceptual framing qualify as originality.

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

## 9. ORIGINALITY / CUSTOMNESS

**Question:**
Does the design feel custom and intentional rather than template-assembled?

### What to Check
- Unique layout structure (not default template)
- Unique hierarchy decisions (not generic)
- Signature move present (memorable element)
- Brand alignment (reflects user's vision)
- No "UI kit" vibes (doesn't look kit-assembled)

### Scoring Guide
- **5** — Highly distinctive, memorable, clearly custom
- **4** — Noticeably custom with clear signature element
- **3** — Some customization but could be more distinctive
- **2** — Generic, could be any product
- **1** — Pure template, no customization

### Fail Condition (BUILD/SHIP phases)
**Score <3 in BUILD or SHIP phase → REFACTOR REQUIRED**

This dimension has a stricter threshold for production work.

### Reference
See `Originality/AntiTemplateGates.md` for detailed criteria.
See `Originality/CustomnessChecklist.md` for final verification.

---

## FINAL UX SCORE DECISION

**Hard Fail Dimensions (Accessibility, Usability, Clarity):**
- Score <3 → **IMMEDIATE REFACTOR REQUIRED**

**All Dimensions:**
- Average score ≥ 4.0 → **UI MAY SHIP**
- Average score < 4.0 → **REFACTOR REQUIRED**

**Originality:**
- NOT a hard fail
- Evaluated holistically (novel combinations, interaction logic, conceptual framing qualify)
- Score <3 triggers review, not automatic failure

Scores must be stated explicitly before final output.

### Score Card Template

```markdown
## UX Score: [Screen/Project Name]

| Dimension | Score | Notes |
|-----------|-------|-------|
| Clarity | /5 | |
| Hierarchy | /5 | |
| Speed to Action | /5 | |
| State Completeness | /5 | |
| Cognitive Load | /5 | |
| Copy Quality | /5 | |
| Mode Alignment | /5 | |
| Accessibility | /5 | |
| Originality | /5 | |

**Verdict:** PASS / REFACTOR REQUIRED
**Issues:** [if any]
```

---

## ENFORCEMENT RULE

Quality is enforced, not assumed.
Do not justify low scores.
Refactor until standards are met.

---

## END OF UX SCORE
