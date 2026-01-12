# Design DNA — Output Specification

This document defines the "Design DNA" output format — the synthesized design language extracted from references.

---

## Purpose

Design DNA captures the essence of reference(s) in a structured, actionable format that can:
- Guide consistent design decisions across screens
- Be saved to Memory for project continuity
- Be handed off to Engineering Brain for implementation

---

## Design DNA Sections

### 1. DNA Summary (3–5 Bullets)

High-level description of the design language.

```markdown
## DNA Summary

- [Primary characteristic — e.g., "Clean, high-contrast dashboard with generous whitespace"]
- [Typography character — e.g., "Modern geometric sans, dramatic scale hierarchy"]
- [Color strategy — e.g., "Dark mode with electric blue accents"]
- [Component style — e.g., "Soft-rounded cards with subtle elevation"]
- [Overall vibe — e.g., "Professional but approachable, data-forward"]
```

---

### 2. Grid + Spacing Rules

```markdown
## Grid & Spacing

**Grid:**
- Columns: [value]
- Gutters: [value]
- Max-width: [value]
- Layout type: [fixed/fluid/hybrid]

**Spacing Scale:**
- Base unit: [4px/8px]
- XS: [value]
- SM: [value]
- MD: [value]
- LG: [value]
- XL: [value]
- XXL: [value]

**Spacing Rules:**
- Component padding: [rule]
- Section gaps: [rule]
- Card internal padding: [rule]
```

---

### 3. Type Scale + Hierarchy Rules

```markdown
## Typography

**Font Stack:**
- Headings: [font name or vibe if unknown]
- Body: [font name or vibe if unknown]
- Mono: [font name or vibe if unknown, if used]

**Scale:**
| Level | Size | Weight | Use |
|-------|------|--------|-----|
| Display | [value] | [weight] | Hero sections |
| H1 | [value] | [weight] | Page titles |
| H2 | [value] | [weight] | Section headers |
| H3 | [value] | [weight] | Card headers |
| Body | [value] | [weight] | Primary text |
| Small | [value] | [weight] | Captions, labels |

**Rules:**
- Heading casing: [sentence/title/uppercase]
- Letter-spacing: [normal/tight/wide for headings]
- Line-height: [body value, heading value]
```

---

### 4. Color Tokens

```markdown
## Color System

**Backgrounds:**
- bg-primary: [description or value]
- bg-secondary: [description or value]
- bg-elevated: [description or value]

**Surfaces:**
- surface-default: [description or value]
- surface-hover: [description or value]
- surface-active: [description or value]

**Accents:**
- accent-primary: [description or value]
- accent-secondary: [description or value]

**Text:**
- text-primary: [description or value]
- text-secondary: [description or value]
- text-muted: [description or value]
- text-inverse: [description or value]

**Semantic:**
- success: [description or value]
- warning: [description or value]
- error: [description or value]
- info: [description or value]

**Note:** If exact values cannot be extracted, describe colors (e.g., "deep navy," "muted slate"). Do NOT invent hex codes.
```

---

### 5. Component Rules

```markdown
## Components

**Buttons:**
- Primary: [fill, radius, padding, shadow]
- Secondary: [style]
- Ghost: [style]
- Sizes: [sm/md/lg specs]

**Cards:**
- Border radius: [value]
- Shadow: [none/subtle/medium/prominent]
- Border: [none/subtle/prominent]
- Padding: [value]

**Inputs:**
- Style: [bordered/underline/filled]
- Border radius: [value]
- Focus state: [description]
- Error state: [description]

**Navigation:**
- Pattern: [top-bar/sidebar/tabs/hybrid]
- Active indicator: [description]
- Hover state: [description]
```

---

### 6. Interaction Rules

```markdown
## Interactions

**Hover States:**
- Buttons: [effect]
- Cards: [effect]
- Links: [effect]
- List items: [effect]

**Focus States:**
- Style: [ring/outline/background]
- Color: [value]
- Offset: [value]

**Active/Pressed:**
- Buttons: [effect]
- Interactive elements: [effect]

**Loading States:**
- Skeleton: [yes/no, style]
- Spinners: [style]
- Progress: [style]
```

---

### 7. Motion Rules

```markdown
## Motion

**Timing:**
- Micro (hover, focus): [value, e.g., 150ms]
- Standard (panels, modals): [value, e.g., 250ms]
- Emphasis (page transitions): [value, e.g., 400ms]

**Easing:**
- Default: [ease-out / ease-in-out / spring]
- Enter: [value]
- Exit: [value]

**Principles:**
- [e.g., "Subtle and purposeful, never decorative"]
- [e.g., "Faster for small elements, slower for large"]
```

---

### 8. Similarity Map

What we ARE matching from the reference(s):

```markdown
## Similarity Map

**Matching from reference:**
- [ ] Grid structure
- [ ] Spacing rhythm
- [ ] Typography scale
- [ ] Color temperature/mood
- [ ] Component shapes (radius, elevation)
- [ ] Information density
- [ ] Visual hierarchy approach
- [ ] [Other specific elements]

**NOT matching (intentionally):**
- [ ] Exact colors (creating custom palette)
- [ ] Specific fonts (selecting alternatives)
- [ ] Logo/brand marks
- [ ] Specific imagery
- [ ] [Other specific elements]
```

---

### 9. Differentiation Plan

What we are CHANGING to make it custom:

```markdown
## Differentiation Plan

**3 Ways We're Differentiating:**

1. **[Category]:** [Specific change]
   - Reference does: [X]
   - We're doing: [Y]
   - Why: [reason]

2. **[Category]:** [Specific change]
   - Reference does: [X]
   - We're doing: [Y]
   - Why: [reason]

3. **[Category]:** [Specific change]
   - Reference does: [X]
   - We're doing: [Y]
   - Why: [reason]

**Signature Move:**
[The ONE unique element that will make this design recognizable]
```

---

## Full DNA Template

```markdown
# Design DNA: [Project Name]

Generated: [Date]
References: [List of reference sources]

## DNA Summary
- [Bullet 1]
- [Bullet 2]
- [Bullet 3]

## Grid & Spacing
[Content]

## Typography
[Content]

## Color System
[Content]

## Components
[Content]

## Interactions
[Content]

## Motion
[Content]

## Similarity Map
[Content]

## Differentiation Plan
[Content]

---

**Confidence Level:** [HIGH / MEDIUM / LOW]
**Limitations:** [Any extraction limitations noted]
```

---

## Storage Location

Save completed Design DNA to:
`Memory/ReferenceDNA/[ProjectName]/DesignDNA.md`

---

## Cross-References

- Input: `VisualTeardownSchema.md` — Extraction process
- Ethics: `SimilarityAndEthics.md` — Derivative work rules
- Handoff: `DesignPlaybook.md` — Handoff packet requirements

---

## END OF DESIGN DNA SPECIFICATION
