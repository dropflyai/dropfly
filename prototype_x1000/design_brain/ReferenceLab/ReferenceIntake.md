# Reference Intake — Vision Workflow

This document governs how the Design Brain receives and processes reference images.

---

## Required Inputs

Before analyzing references, collect:

1. **Reference Images** (1–5)
   - User uploads OR URLs
   - If missing and task requires them, ask: "Upload 1–3 references or share URLs."

2. **Target Platform**
   - Web (desktop-first)
   - Web (responsive)
   - Mobile iOS
   - Mobile Android
   - Cross-platform

3. **Brand Constraints** (if any)
   - Existing brand guidelines
   - Required colors/fonts
   - Logo usage rules
   - Tone restrictions

---

## MANDATORY REFERENCE INTENT (Required for Each Reference)

For every reference image, the user MUST provide:

| Required Info | Question to Ask |
|---------------|-----------------|
| What they like | "What do you like about this reference?" |
| What they dislike | "What should we avoid from this reference?" |
| What should NOT be copied | "What elements should NOT be replicated?" |
| Intended differentiation | "How should the final design differ from this?" |

**Rule:** If intent is missing, the agent MUST pause and ask exactly ONE clarifying question before proceeding.

**Example:**
- User provides reference without context
- Agent asks: "What do you like about this reference?"
- Wait for response
- Then proceed or ask next clarifying question

---

## Intake Questions (ONE AT A TIME)

If references are needed but not provided:

**Q1:** "Upload 1–3 reference images or share URLs."

After receiving references:

**Q2:** "What platform is this for? (web/mobile/both)"

If brand constraints might exist:

**Q3:** "Are there existing brand guidelines I should follow?"

---

## Reference Quality Guidelines

### Good References
- Screenshots of live products
- Dribbble/Behance shots with realistic UI
- Competitor product screenshots
- Style guides or design systems

### Poor References (Flag to User)
- Low resolution images
- Heavily watermarked mockups
- Purely conceptual/artistic shots with no usable UI
- Marketing materials without UI

If user provides poor references, ask: "This reference is [low-res/conceptual/etc]. Do you have an alternative, or should I work with this?"

---

## Reference Limits

| Count | Use Case |
|-------|----------|
| 1 | Single-style extraction |
| 2–3 | Style blending / comparison |
| 4–5 | Comprehensive competitor analysis |
| 5+ | Too many — ask user to narrow down |

If user provides 5+: "You've provided [N] references. Which 3–5 are most important for the visual direction?"

---

## NO HALLUCINATION RULE (ABSOLUTE)

- Never fabricate details not present in provided references
- If an element is unclear, state: "Cannot determine [element] from reference"
- If reference is too low-res for detail extraction, state the limitation
- Never assume brand colors, fonts, or styles not explicitly visible

---

## Processing Flow

```
1. Receive reference(s)
2. Confirm platform + constraints
3. Run VisualTeardownSchema.md on each reference
4. Synthesize into DesignDNA.md output
5. Present DNA summary to user for validation
6. Proceed to design with validated DNA
```

---

## Cross-References

- Next step: `VisualTeardownSchema.md` — Structured extraction
- Output: `DesignDNA.md` — Design DNA spec
- Ethics: `SimilarityAndEthics.md` — Derivative work rules

---

## END OF REFERENCE INTAKE
