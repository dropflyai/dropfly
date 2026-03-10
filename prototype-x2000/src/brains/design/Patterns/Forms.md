# Pattern: Forms — Authoritative

Forms are contracts between the user and the system.
They must be predictable, forgiving, and fast to complete.

A form that causes hesitation has failed.

---

## PURPOSE

Forms exist to:
- collect information accurately
- minimize user effort
- prevent errors before submission
- make completion feel safe and inevitable

Forms are not conversations. They are tools.

---

## DEFAULT FORM STRUCTURE (NON-NEGOTIABLE)

- One column by default
- Labels always visible
- Clear section grouping when needed
- Primary action at the end
- Secondary actions visually de-emphasized

Multi-column forms require explicit justification.

---

## LABELS & FIELD CLARITY

- Labels must describe what is required, not just the field name
- Avoid internal jargon
- Use sentence case
- Do not rely on placeholders as labels

### GOOD
**API Key**
Paste the key provided by your service.

### BAD
**Key**

---

## FIELD ORDERING

Fields must be ordered to:
1. Match the user's mental model
2. Move from simple → complex
3. Reduce perceived effort early

Put easy, confidence-building fields first.

---

## REQUIRED VS OPTIONAL

- Required fields must be clearly indicated
- Optional fields must be explicitly labeled as optional
- Do not overuse required fields

If everything is required, nothing is.

---

## HELP TEXT & MICROCOPY

Use help text to:
- clarify constraints
- prevent common errors
- explain consequences

Rules:
- Place help text below the field
- Keep it short
- Replace help text with error text when errors occur

Avoid tooltips for essential information.

---

## VALIDATION RULES

### Inline Validation (Required)
- Validate as early as reasonable
- Errors appear near the field
- Errors explain how to fix the issue

### Error Copy Rules
- Say what's wrong
- Say how to fix it
- Avoid blame

### GOOD
"API key is invalid. Check that it's complete."

### BAD
"Invalid input."

---

## SUBMISSION BEHAVIOR

- Primary action clearly labeled
- Disable submit during processing
- Show progress if submission takes time
- Prevent duplicate submissions

Do not reset the form on error.

---

## SUCCESS HANDLING

- Confirm completion briefly
- Avoid celebration
- Do not interrupt flow unnecessarily

Example:
"Settings saved."

---

## PARTIAL & LONG FORMS

For long or complex forms:
- Break into logical sections
- Use progressive disclosure
- Save progress when possible

Avoid multi-step forms unless necessary.

---

## MODE-SPECIFIC RULES

### MODE_SAAS
- Be instructional
- Reduce intimidation
- Use supportive microcopy
- Emphasize safety and reversibility

---

### MODE_INTERNAL
- Be compact
- Optimize for speed
- Assume familiarity
- Support keyboard-first usage

---

### MODE_AGENTIC
- Be explicit about impact
- Explain downstream effects
- Surface validation early
- Highlight irreversible actions clearly

Example:
"This change affects all future runs."

---

## ACCESSIBILITY (NON-NEGOTIABLE)

- Labels associated with inputs
- Logical tab order
- Error messages announced to screen readers
- Sufficient contrast for all states

Accessibility is part of correctness, not a bonus.

---

## COMMON FAILURES (DISALLOWED)

- Placeholder-only labels
- Vague errors
- Overly clever field names
- Hidden required fields
- Resetting user input on error
- Surprise validation at submit

If a user feels blamed, refactor.

---

## FINAL FORM CHECK

Before shipping, ask:
- Can this be completed without instructions?
- Are errors obvious and recoverable?
- Does the form respect the user's time?
- Would this feel fair if I were the user?

If not, refactor.

---

## END OF FORMS PATTERN
