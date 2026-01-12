# Similarity & Ethics — Reference Usage Rules

This document defines ethical boundaries for reference-driven design.

---

## Core Principle

**"Similar but not derivative"**

Match structure, feel, and quality — not exact implementation.

---

## What We MATCH (Allowed)

| Element | Allowed to Match |
|---------|------------------|
| Grid structure | Column counts, layout patterns |
| Spacing rhythm | Proportions, density feel |
| Typography scale | Size relationships, hierarchy approach |
| Color temperature | Warm/cool, light/dark, contrast level |
| Component shapes | Rounded vs sharp, flat vs elevated |
| Information density | How much content per screen |
| Visual hierarchy | How attention is guided |
| Interaction patterns | Common UX patterns (not proprietary) |

---

## What We NEVER COPY (Prohibited)

| Element | Prohibition |
|---------|-------------|
| Logos | Never reproduce or closely imitate |
| Brand marks | No wordmarks, symbols, or brand assets |
| Proprietary icons | Use generic alternatives |
| Specific imagery | Photos, illustrations, graphics |
| Exact copy | Headlines, taglines, marketing text |
| Unique proprietary UI | Patented or trademarked interactions |
| Exact color values | Derive inspired palette, don't copy hex codes |

---

## Similarity Spectrum

```
COPYING          DERIVATIVE        INSPIRED          ORIGINAL
(prohibited)     (risky)           (ideal)           (from scratch)
    |               |                 |                  |
    ▼               ▼                 ▼                  ▼
Exact replica   Too close       Same vibe,        No reference
of source       for comfort     different          influence
                               execution
```

**Target zone: INSPIRED**

---

## The 3-Change Rule

Every design derived from references MUST include at least 3 meaningful differentiations:

1. **Structural change** — Different grid, layout, or information architecture
2. **Visual change** — Different color palette, typography, or component style
3. **Experiential change** — Different interaction, animation, or flow

These must be documented in the Design DNA's "Differentiation Plan" section.

---

## Clone Request Protocol

If user explicitly requests a 1:1 clone:

### Step 1: Clarify Intent
Ask: "You're asking for an exact copy of [reference]. Is this for:
- A) Learning/practice (personal use)
- B) A client project
- C) A competing product
- D) Internal tooling that won't be public"

### Step 2: Document Decision
If user confirms they want a clone:
- Log the explicit request in `Memory/ExperienceLog.md`
- Note: "User explicitly requested 1:1 clone of [source] for [stated purpose]"
- Proceed with the documented consent

### Step 3: Still Apply Ethics
Even with consent:
- Never copy logos or brand marks
- Never copy proprietary protected elements
- Warn if the clone could constitute trademark infringement

---

## Red Flags (Stop and Warn)

Stop and warn the user if they request:

| Request | Warning |
|---------|---------|
| "Copy their logo style" | "I can't replicate logos. I can suggest similar typography treatments." |
| "Make it look exactly like [competitor]" | "I can match the vibe but will differentiate. A direct copy could cause legal issues." |
| "Use their exact colors" | "I'll create an inspired palette. Using exact colors could appear derivative." |
| "Copy their [patented feature]" | "This may be proprietary. Let's design an alternative approach." |

---

## Acceptable Similarity Examples

### Color
- **Reference:** `#3B82F6` (specific blue)
- **Acceptable:** "Electric blue accent" → derive own blue in similar temperature

### Typography
- **Reference:** Uses Inter
- **Acceptable:** "Modern geometric sans" → use Inter, or similar (Geist, SF Pro)

### Layout
- **Reference:** 3-column dashboard with sidebar
- **Acceptable:** Same structure, different proportions, different content organization

### Components
- **Reference:** Rounded buttons with subtle shadow
- **Acceptable:** Similar rounded style, different radius value, different shadow intensity

---

## Documentation Requirements

For every reference-derived design, document:

1. **Source references** — URLs or descriptions
2. **What was matched** — Similarity Map in Design DNA
3. **What was changed** — Differentiation Plan in Design DNA
4. **User consent** — If clone was explicitly requested

Store in: `Memory/ReferenceDNA/[ProjectName]/`

---

## Legal Disclaimer

This document provides design ethics guidance, not legal advice.

For commercial projects:
- When in doubt, differentiate more
- Consult legal counsel for trademark concerns
- Keep documentation of design decisions

---

## Cross-References

- Process: `ReferenceIntake.md` — How references are collected
- Extraction: `VisualTeardownSchema.md` — How design is analyzed
- Output: `DesignDNA.md` — How DNA is documented
- Originality: `Originality/AntiTemplateGates.md` — Customness requirements

---

## END OF SIMILARITY & ETHICS
