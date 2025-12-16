# Design Playbook — Authoritative

This document defines design judgment, taste, and decision-making standards.
It exists to prevent generic, over-designed, or under-thought interfaces.

---

## PURPOSE OF DESIGN

Interfaces exist to:
- reduce thinking
- enable decisions
- guide action
- make system state legible

If an element does not support one of these, it should not exist.

---

## CORE DESIGN LAWS (NON-NEGOTIABLE)

1. **Hierarchy before aesthetics**
   If hierarchy is unclear, the design has failed.

2. **One screen, one job**
   Every screen must have a single primary outcome.

3. **Clarity over density**
   Dense UIs are allowed only when density improves speed for expert users.

4. **Progressive disclosure always**
   Start simple. Reveal complexity only when needed.

5. **Design removes options**
   Good design says "no" more often than "yes".

---

## MODE-SPECIFIC DESIGN RULES

### MODE_SAAS
- Optimize for approachability and comprehension
- Prioritize onboarding and empty states
- Density: low → medium
- Strong visual hierarchy
- Clear value framing

Avoid:
- Dense tables as first impression
- Internal jargon
- Overwhelming dashboards

---

### MODE_INTERNAL
- Optimize for speed and efficiency
- Density: medium → high
- Fewer explanations, more data
- Compact layouts allowed
- Keyboard and bulk actions encouraged

Avoid:
- Over-sized typography
- Excessive whitespace
- Decorative visuals

---

### MODE_AGENTIC
- Optimize for transparency and trust
- Show system state clearly at all times
- Timelines, logs, and confidence indicators are first-class
- Partial failure must be visible
- Explain *what happened* and *what happens next*

Avoid:
- Hiding errors
- Abstract success messages
- "Magic" behavior with no explanation

---

## VISUAL HIERARCHY RULES

- One primary action per screen
- One dominant focal area above the fold
- Secondary actions are visually quieter
- Tertiary actions may be hidden or inline

Hierarchy tools (in order of preference):
1. Position
2. Size
3. Spacing
4. Weight
5. Color

Never rely on color alone to express priority.

---

## SPACING SYSTEM

Use a strict scale:
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

Rules:
- Related items: tight spacing
- Separate sections: generous spacing
- Controls tighter than content
- No arbitrary values

Whitespace is structure, not decoration.

---

## TYPOGRAPHY RULES

- Max 2 font families per product
- Max 3 text sizes per screen (excluding labels)
- Headings explain structure, not branding
- Body text must be scannable without effort

Avoid:
- Large marketing headlines in functional UIs
- Over-styled typography
- Center-aligned body text

---

## COLOR USAGE

- Neutral-first palette
- One primary accent color
- Red is reserved for destructive or error states only
- Color must always have semantic meaning

Avoid:
- Gradient-heavy UIs
- Color used only for decoration
- Multiple competing accent colors

---

## COMMON AI FAILURE PATTERNS (EXPLICITLY DISALLOWED)

- Everything placed in cards
- Symmetry for its own sake
- Centered layouts with no hierarchy
- Overuse of dividers and borders
- "Pretty" dashboards with no clear action
- Visual noise masquerading as polish

If any of these appear, refactor immediately.

---

## UI STATES ARE NOT OPTIONAL

Every screen must define:
- Default
- Loading
- Empty
- Error
- Success

Empty states must:
- Explain what this area is
- Why it matters
- How to populate it

---

## DECORATION RULE

Visual elements must justify their existence.
If removing an element does not reduce clarity or usability, it should be removed.

---

## DECISION QUALITY CHECK

Before finalizing any UI, ask:
- Can a first-time user understand this in under 5 seconds?
- Is the primary action obvious without reading?
- Does this UI make the right thing easy and the wrong thing hard?
- Would a senior designer approve this?

If not, refactor.

---

## END OF PLAYBOOK
