# Pattern: Agentic Workflows — Authoritative

Agentic workflow screens exist to make automated behavior understandable, controllable, and trustworthy.

If users cannot tell what happened, why it happened, and what to do next,
the agentic UI has failed.

---

## PURPOSE

Agentic workflow UIs exist to:
- make system behavior legible
- surface progress and failure transparently
- allow safe intervention
- build trust through explainability

Agentic UIs must never feel magical or opaque.

---

## CORE PRINCIPLES (NON-NEGOTIABLE)

1. **Transparency over polish**
2. **State over storytelling**
3. **Explainability over abstraction**
4. **Control over automation**
5. **Partial failure is first-class**

If the UI hides uncertainty or failure, refactor.

---

## REQUIRED CONCEPTS (ALL MUST BE PRESENT)

Every agentic workflow UI MUST clearly represent:

- Workflow definition (what it is)
- Runs (each execution instance)
- Steps (discrete actions)
- State (current + final)
- Timing (when things happened)
- Outcome (success, partial success, failure)
- Next actions (retry, edit, inspect)

Missing any of these is a design failure.

---

## WORKFLOW OVERVIEW SCREEN

### Purpose
Provide a high-level understanding of:
- what this workflow does
- its current status
- recent activity

### Must include
- Clear workflow name and description
- Current status (idle, running, failed, paused)
- Last run summary
- Primary action (Run, Resume, Fix, etc.)

Avoid:
- Abstract summaries
- Vague success indicators
- "All good" messaging without detail

---

## RUN HISTORY

### Purpose
Show what has happened over time.

### Rules
- Runs listed chronologically (most recent first)
- Each run shows:
  - status
  - start time
  - duration
  - outcome
- Failures visually distinct but not alarming

Avoid:
- Hiding failed runs
- Collapsing history into a single metric

---

## RUN DETAIL VIEW (CRITICAL)

Run details are the heart of agentic UI.

### Must include
- Timeline or ordered step list
- Step-by-step status
- Timestamps per step
- Inputs and outputs (when relevant)
- Error details when failures occur

### Step states (explicit)
- Pending
- Running
- Succeeded
- Failed
- Skipped

Avoid:
- Single "success/failure" labels
- Collapsing steps into summaries
- Hiding intermediate states

---

## PARTIAL FAILURE HANDLING (NON-OPTIONAL)

Partial failure must be visible and understandable.

Rules:
- Clearly indicate which steps failed
- Show which steps succeeded
- Explain impact of the failure
- Indicate whether retry is safe

Example:
"Step 3 failed. Steps 1–2 completed successfully. Retrying will resume from step 3."

Avoid:
- Treating partial failure as total failure
- Retrying silently
- Resetting successful steps unnecessarily

---

## RETRIES & INTERVENTION

### Rules
- Retrying must be explicit
- Users must know what will be retried
- Retrying must not destroy context
- Editing configuration before retry must be possible

Avoid:
- Automatic retries with no visibility
- Retry buttons with no explanation

---

## LOGS & DEBUGGING

### Purpose
Allow users to understand why something failed.

### Rules
- Logs must be accessible from run details
- Logs must be chronological
- Errors must be clearly highlighted
- Raw logs allowed but contextualized

Avoid:
- "Something went wrong" without logs
- Logs that require guesswork to interpret

---

## CONFIDENCE & EXPLAINABILITY

Agentic UIs must communicate:
- what the system knows
- what it doesn't know
- what assumptions were made

Allowed:
- Confidence indicators
- Reason codes
- Clear explanations

Disallowed:
- Anthropomorphic language
- Claims of certainty where none exists

---

## MODE-SPECIFIC NOTES

### MODE_AGENTIC (PRIMARY)
- Density allowed
- Transparency prioritized
- Minimal decoration
- Data > visuals

### MODE_INTERNAL
- Similar to agentic, but faster
- Less explanation needed
- Emphasize efficiency

### MODE_SAAS (WHEN APPLICABLE)
- More explanation
- Stronger guardrails
- Fewer exposed internals by default

---

## EMPTY & FIRST-RUN STATES

If a workflow has never run:
- Explain what running does
- Explain what will be created
- Explain what happens next

Avoid vague encouragement.

---

## COMMON AGENTIC UI FAILURES (EXPLICITLY DISALLOWED)

- "Magic" behavior with no explanation
- Single success/failure indicator
- Hidden logs
- Silent retries
- Over-summarization
- Agent "personality" language

If the system feels like a black box, refactor.

---

## FINAL AGENTIC CHECK

Before shipping, ask:
- Can a user reconstruct what happened?
- Can they explain why it failed?
- Can they safely intervene?
- Does the UI build trust?

If not, refactor.

---

## END OF AGENTIC WORKFLOWS PATTERN
