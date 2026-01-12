# Visual Teardown Schema — Structured Extraction

This document defines the checklist for extracting design DNA from reference images.

---

## Purpose

When analyzing a reference image, extract information in this exact structure.
Do NOT invent details. If something cannot be determined, mark as "UNCLEAR" or "NOT VISIBLE".

---

## Extraction Checklist

### 1. Layout & Grid

- [ ] Column count (e.g., 12-col, 6-col, fluid)
- [ ] Gutter width (estimated: tight/medium/generous)
- [ ] Content max-width (narrow/medium/wide/full-bleed)
- [ ] Breakpoint hints (if multiple sizes visible)
- [ ] Sidebar presence and width
- [ ] Header/footer structure

**Extract:**
```
Columns: [value or UNCLEAR]
Gutters: [tight ~8px / medium ~16px / generous ~24px+ / UNCLEAR]
Max-width: [narrow ~800px / medium ~1200px / wide ~1400px / full / UNCLEAR]
Layout type: [fixed / fluid / hybrid]
```

---

### 2. Hierarchy & Density

- [ ] Primary focal area (where eye lands first)
- [ ] Secondary elements
- [ ] Information density (low/medium/high)
- [ ] Whitespace strategy (generous/balanced/compact)
- [ ] Visual weight distribution

**Extract:**
```
Primary focus: [describe element]
Density: [low / medium / high]
Whitespace: [generous / balanced / compact]
```

---

### 3. Typography System

- [ ] Font vibe (geometric, humanist, serif, monospace, display)
- [ ] Heading treatment (size, weight, casing)
- [ ] Body text treatment (size, line-height, color)
- [ ] Scale relationship (tight/moderate/dramatic)
- [ ] Letter-spacing patterns
- [ ] Text hierarchy levels visible

**Extract:**
```
Font vibe: [geometric / humanist / serif / mono / display / UNCLEAR]
Heading style: [weight, casing, approximate size]
Body style: [approximate size, line-height feel]
Scale: [tight / moderate / dramatic]
Hierarchy levels: [count]
```

---

### 4. Color System

- [ ] Background layering (single/dual/multi-layer)
- [ ] Primary surface color
- [ ] Secondary surface color
- [ ] Primary accent color
- [ ] Secondary accent (if any)
- [ ] Text colors (primary, secondary, muted)
- [ ] Contrast strategy (high/medium/subtle)

**Extract:**
```
Background: [color description or hex if determinable]
Surfaces: [description]
Primary accent: [color description]
Secondary accent: [color description or NONE]
Text colors: [primary / secondary / muted descriptions]
Contrast: [high / medium / subtle]
```

---

### 5. Component Patterns

- [ ] Button style (filled/outlined/ghost, rounded/square)
- [ ] Card style (elevated/flat/bordered, corner radius)
- [ ] Input style (bordered/underline/filled)
- [ ] Navigation pattern (top/side/tabs)
- [ ] Table style (if visible)
- [ ] Icon style (outlined/filled/duotone)

**Extract:**
```
Buttons: [fill style, corner radius, elevation]
Cards: [style, radius, shadow]
Inputs: [style, border treatment]
Navigation: [pattern]
Icons: [style]
```

---

### 6. Spacing Rhythm

- [ ] Base unit (appears to be 4px/8px based)
- [ ] Component internal padding
- [ ] Section spacing
- [ ] Element gaps
- [ ] Vertical rhythm consistency

**Extract:**
```
Base unit: [4px / 8px / UNCLEAR]
Padding pattern: [tight / medium / generous]
Section spacing: [value range or feel]
Rhythm: [consistent / varied / chaotic]
```

---

### 7. Motion Language (if observable)

- [ ] Transition speed feel (snappy/smooth/slow)
- [ ] Easing style (linear/ease/spring)
- [ ] Hover effects present
- [ ] Loading patterns
- [ ] Micro-interactions

**Extract:**
```
Speed: [snappy ~150ms / smooth ~300ms / slow ~500ms+ / NOT OBSERVABLE]
Easing: [linear / ease-out / spring / NOT OBSERVABLE]
Hover: [description or NOT VISIBLE]
```

---

### 8. Brand Signals

- [ ] Trust cues (security badges, testimonials, logos)
- [ ] Premium cues (whitespace, typography, imagery quality)
- [ ] Playful cues (illustrations, colors, copy tone)
- [ ] Professional cues (restraint, neutrals, data focus)
- [ ] Technical cues (code, monospace, terminal aesthetics)

**Extract:**
```
Primary signal: [trust / premium / playful / professional / technical]
Secondary signals: [list]
Brand personality: [1-2 word summary]
```

---

### 9. Accessibility Observations

- [ ] Contrast issues visible
- [ ] Touch target sizes (if mobile)
- [ ] Focus states visible
- [ ] Text size adequacy
- [ ] Color-only information risks

**Extract:**
```
Contrast: [appears adequate / potential issues / UNCLEAR]
Touch targets: [adequate / small / NOT APPLICABLE]
Accessibility risks: [list or NONE VISIBLE]
```

---

## Output Format

After extraction, compile into this summary:

```markdown
## Visual Teardown: [Reference Name/URL]

### Layout
[Grid + layout findings]

### Hierarchy
[Density + whitespace findings]

### Typography
[Font + scale findings]

### Color
[Palette findings]

### Components
[Pattern findings]

### Spacing
[Rhythm findings]

### Motion
[Animation findings or NOT OBSERVABLE]

### Brand Signals
[Personality findings]

### Accessibility Flags
[Risks or NONE]

### Confidence Level
[HIGH / MEDIUM / LOW] — [reason if not HIGH]
```

---

## Cross-References

- Input: `ReferenceIntake.md` — How references are collected
- Output: `DesignDNA.md` — Synthesized design language
- Ethics: `SimilarityAndEthics.md` — Derivative work rules

---

## END OF VISUAL TEARDOWN SCHEMA
