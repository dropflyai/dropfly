# Anti-Template Gates — Originality Enforcement

This document defines hard gates that prevent generic, template-like design outputs.

---

## Purpose

These gates ensure every design from the Design Brain:
- Feels custom and intentional
- Never looks like "default AI output"
- Has at least one memorable element
- Maintains coherence while being unique

---

## Gate Application

| Phase | Gates Applied |
|-------|---------------|
| DISCOVERY | None (research phase) |
| RESEARCH | None (research phase) |
| ARCHITECTURE | None (structure phase) |
| FLOWS | None (planning phase) |
| BRAND | Gates 1, 2, 3 |
| BUILD | All gates |
| SHIP | All gates (final check) |
| HOTFIX | Gate 5 only (consistency) |

---

## BANNED DEFAULTS (UNLESS JUSTIFIED)

The agent MUST NOT default to these patterns without explicit justification:

| Banned Pattern | Why It's Banned |
|----------------|-----------------|
| Hero + 3-column feature grid | Overused landing page template |
| Tailwind demo layouts | Recognizable default styling |
| Stripe-style pricing tables | Widely copied, lacks differentiation |
| Apple-style glass cards | Trend-following, not original |
| Dribbble trend cloning | Style over substance |
| Centered headline + CTA as primary structure | Default "clean" look with no thought |

**Rule:** If any banned pattern is used, the agent MUST explicitly justify why it is correct for this project.

**Justification Format:**
```markdown
**Banned Pattern Used:** [pattern name]
**Justification:** [why this is the right choice for this specific project]
**Differentiation:** [how we're making it unique despite using this pattern]
```

---

## GATE 1: Template Risk Check

**Rule:** If the design can be described as "standard SaaS template," it FAILS.

### Detection Questions

Ask yourself:
1. Could this design be swapped onto 10 different products without modification?
2. Does it look like the first result from a UI kit?
3. Would a designer say "I've seen this exact layout 100 times"?

If YES to any → **FAIL — Revise required**

### Common Template Patterns (Red Flags)

| Pattern | Why It's Generic | Fix |
|---------|------------------|-----|
| Hero + 3 feature cards + CTA | Default landing page | Unique layout structure |
| Sidebar + header + data table | Default admin panel | Custom navigation or layout |
| Card grid with identical cards | Default product display | Varied card sizes or layout |
| Centered everything | Default "clean" look | Intentional asymmetry |
| Generic icons in circles | Default feature display | Custom illustrations or no icons |
| Blue primary + gray secondary | Default color scheme | Derived brand colors |

### Pass Criteria
- Design has at least ONE structural difference from templates
- Layout choices are justified by content/user needs
- Visual decisions trace back to brand/research

---

## GATE 2: Signature Move Requirement

**Rule:** Every design must include at least ONE custom signature element.

### What Counts as a Signature Move

| Category | Examples |
|----------|----------|
| Layout twist | Asymmetric grid, unique section transitions, unexpected content flow |
| Interaction | Custom hover effect, unique loading state, memorable transition |
| Brand motif | Recurring visual element, custom illustration style, distinctive icon treatment |
| Micro-animation | Signature button effect, unique scroll behavior, custom cursor |
| IA move | Novel navigation pattern, unique information hierarchy, fresh categorization |
| Typography | Distinctive heading treatment, custom type pairing, unique text styling |

### Signature Move Documentation

Every design must document:
```markdown
**Signature Move:**
- Element: [what it is]
- Where: [where it appears]
- Why: [why it's memorable/distinctive]
- Consistency: [how it repeats across screens]
```

### Fail Criteria
- No identifiable signature element
- Signature is too subtle to notice
- Signature conflicts with usability

---

## GATE 3: Differentiation Plan Requirement

**Rule:** Must list 3 concrete ways the design differs from reference(s) while preserving the vibe.

### Required Format

```markdown
**Differentiation Plan:**

1. [Category]: [Change]
   - Instead of: [reference approach]
   - We're doing: [our approach]
   - Preserves: [what vibe element it maintains]

2. [Category]: [Change]
   - Instead of: [reference approach]
   - We're doing: [our approach]
   - Preserves: [what vibe element it maintains]

3. [Category]: [Change]
   - Instead of: [reference approach]
   - We're doing: [our approach]
   - Preserves: [what vibe element it maintains]
```

### Fail Criteria
- Fewer than 3 differentiations
- Differentiations are trivial (e.g., "different shade of blue")
- Differentiations break the intended vibe

---

## GATE 4: Concept Breadth Rule

**Rule:** Must generate 2–3 distinct directions before choosing one.

### Exception
- HOTFIX mode — Skip this gate
- User explicitly requests single direction

### Direction Requirements

Each direction must differ in at least ONE of:
- Layout structure
- Color approach
- Typography character
- Component style
- Interaction model

### Direction Presentation

```markdown
**Direction A: [Name]**
- Core idea: [1 sentence]
- Vibe: [2-3 words]
- Signature: [key distinctive element]

**Direction B: [Name]**
- Core idea: [1 sentence]
- Vibe: [2-3 words]
- Signature: [key distinctive element]

**Direction C: [Name]** (optional)
- Core idea: [1 sentence]
- Vibe: [2-3 words]
- Signature: [key distinctive element]

**Recommendation:** Direction [X] because [reason]
```

### Fail Criteria
- Only one direction presented (without exception)
- Directions are too similar (same structure, just different colors)
- No clear differentiation between options

---

## GATE 5: Consistency Rule

**Rule:** Must define tokens/components that keep the design cohesive across screens.

### Required Consistency Artifacts

| Artifact | Purpose | Location |
|----------|---------|----------|
| Design DNA | Core design language | `Memory/ReferenceDNA/[Project]/` |
| Token definitions | Colors, spacing, type | Design DNA or `Tokens/` override |
| Component rules | How components look/behave | Design DNA or `ComponentSpec.md` override |

### Consistency Check

Before shipping any screen beyond the first:
- [ ] Uses same spacing scale
- [ ] Uses same type scale
- [ ] Uses same color tokens
- [ ] Components match established patterns
- [ ] Signature move is present or acknowledged

### Fail Criteria
- Screen violates established Design DNA
- New tokens introduced without documentation
- Components don't match established style

---

## Gate Checklist (Quick Reference)

Before BUILD/SHIP, verify:

```markdown
## Anti-Template Gate Check

- [ ] **Gate 1:** Not describable as "standard template"
- [ ] **Gate 2:** Signature move documented and present
- [ ] **Gate 3:** 3 differentiations from reference documented
- [ ] **Gate 4:** 2–3 directions explored (or exception noted)
- [ ] **Gate 5:** Consistency artifacts exist and are followed
```

---

## Failure Response

If any gate fails:

1. **Identify** which gate failed
2. **Diagnose** why (what made it generic/inconsistent)
3. **Revise** with specific fix
4. **Re-check** all gates

Do NOT proceed to next phase with failed gates.

---

## Cross-References

- Scoring: `eval/UXScore.md` — Originality dimension
- Checklist: `Originality/CustomnessChecklist.md` — Final verification
- DNA: `ReferenceLab/DesignDNA.md` — Design language definition
- Memory: `Memory/ReferenceDNA/` — Project storage

---

## END OF ANTI-TEMPLATE GATES
