# Pattern: Settings — Authoritative

Settings screens exist to configure behavior safely.
They must prioritize clarity, predictability, and reversibility.

If a user is afraid to touch settings, the design has failed.

---

## PURPOSE

Settings exist to:
- configure system behavior
- manage preferences
- control risk
- provide transparency

Settings are not dashboards.
Settings are not feature showcases.

---

## DEFAULT SETTINGS STRUCTURE (NON-NEGOTIABLE)

Settings must be organized as:

1. **Sections** (high-level categories)
2. **Groups** (related options)
3. **Controls** (individual settings)

Flat lists of unrelated settings are disallowed.

---

## INFORMATION HIERARCHY

Rules:
- Section headers explain intent, not features
- Group related settings visually
- Controls must be scannable
- Dangerous settings must be visually distinct

Users should be able to skim safely.

---

## CONTROL TYPES

Use controls intentionally:

- Toggle → on/off behavior
- Select → mutually exclusive choices
- Input → precise values
- Radio → small sets of explicit options

Do not overload settings with free-form inputs.

---

## DEFAULTS & SAFETY

- Defaults must be safe
- Defaults must be documented via microcopy
- Changing a setting must feel reversible

Never surprise users with hidden side effects.

---

## DESCRIPTIONS & MICROCOPY

Every setting must explain:
- What it controls
- What changes when it's modified
- Who or what it affects (if relevant)

Descriptions must be:
- Short
- Factual
- Non-marketing

---

## DESTRUCTIVE & HIGH-RISK SETTINGS

Rules:
- Clearly labeled
- Visually separated
- Require confirmation
- Explain consequences explicitly

Example:
"This will affect all future runs."

Avoid fear language, but do not soften consequences.

---

## SAVE BEHAVIOR

- Auto-save preferred when safe
- Explicit save required for risky changes
- Saving state must be visible
- Errors must not discard changes

Never lose user input silently.

---

## MODE-SPECIFIC RULES

### MODE_SAAS
- Be explanatory
- Reduce intimidation
- Emphasize safety and reversibility

Avoid:
- Internal terminology
- Dense configuration blocks

---

### MODE_INTERNAL
- Be compact
- Assume familiarity
- Optimize for speed
- Support keyboard navigation

Avoid:
- Overly verbose explanations

---

### MODE_AGENTIC
- Explain downstream impact clearly
- Surface scope (single workflow vs global)
- Highlight irreversible effects
- Reference execution behavior

Example:
"This change applies to all future agent runs."

Avoid:
- Abstract or vague impact descriptions

---

## ORGANIZATION RULES

- Most-used settings first
- Advanced settings grouped separately
- Rare or dangerous settings de-emphasized

Do not make users hunt for common options.

---

## COMMON SETTINGS FAILURES (EXPLICITLY DISALLOWED)

- Flat lists of toggles
- No explanation for settings
- Hidden destructive options
- Overuse of modals
- Surprise auto-saves on risky changes

If users feel anxious, refactor.

---

## FINAL SETTINGS CHECK

Before shipping, ask:
- Can users understand the impact of each setting?
- Are dangerous actions clearly marked?
- Is it easy to undo or recover?
- Would a cautious user feel safe here?

If not, refactor.

---

## END OF SETTINGS PATTERN
