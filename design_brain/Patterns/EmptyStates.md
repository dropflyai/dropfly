# Pattern: Empty States — Authoritative

Empty states are first-class UI, not placeholders.
They define the user's first impression and guide next action.

An empty state is a moment of instruction, not decoration.

---

## PURPOSE

Empty states exist to:
- explain what this area is
- explain why it matters
- guide the user to the next action

If an empty state does not do all three, it has failed.

---

## WHEN TO USE

Use an empty state when:
- No data exists yet
- Filters return zero results
- A feature has not been configured
- A system has not run yet

Do NOT show empty states for transient loading (use loading states instead).

---

## REQUIRED STRUCTURE (NON-NEGOTIABLE)

Every empty state MUST include:

1. **Title**
   Plain language. States the absence clearly.

2. **Explanation**
   One sentence explaining what normally appears here and why it matters.

3. **Next action**
   A clear, specific action the user can take.

---

## EXAMPLES

### GOOD

**No workflows yet**
Workflows automate multi-step tasks across systems.
Create a workflow to get started.

Primary action: "Create workflow"

---

### BAD (DISALLOWED)

- "Nothing here yet!"
- Emojis
- Jokes
- Decorative illustrations with no instruction
- Vague CTAs like "Get started"

---

## MODE-SPECIFIC RULES

### MODE_SAAS
- Be instructional
- Reduce intimidation
- Emphasize value without marketing language
- One primary action only

Avoid:
- Dense explanations
- Internal terminology

---

### MODE_INTERNAL
- Be concise
- Assume familiarity
- Focus on efficiency

Example:
**No records match your filters**
Adjust filters or clear them to see results.

---

### MODE_AGENTIC
- Be factual
- Reference system behavior
- Emphasize state, not emotion

Example:
**No runs yet**
This workflow hasn't been executed.
Run the workflow to generate execution history.

Avoid:
- Anthropomorphizing agents
- "Waiting" or "thinking" language

---

## VISUAL DESIGN RULES

- Empty states should be visually calm
- Do not overpower the page
- No heavy borders or cards
- Centered or left-aligned depending on context
- Keep width narrow for readability

Empty states should guide, not distract.

---

## ACTION RULES

- Only one primary action
- Secondary actions must be inline links (if present)
- Do not offer destructive actions

---

## COMMON FAILURES (EXPLICITLY DISALLOWED)

- Decorative illustrations with no instruction
- Multiple CTAs
- Marketing copy
- Humor
- Overly large empty states that dominate the page

If the empty state feels like a landing page, refactor.

---

## CHECKLIST BEFORE SHIPPING

- Does it explain what's missing?
- Does it explain why it matters?
- Does it clearly say what to do next?
- Is the tone calm and factual?

If any answer is "no," refactor.

---

## END OF EMPTY STATES PATTERN
