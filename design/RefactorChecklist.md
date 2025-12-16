# UI Refactor Checklist — Enforcement Layer (Authoritative)

This checklist MUST be executed before any UI is considered complete.
If any section fails, refactor is required.

---

## 1. INTENT & JOB CHECK

- Is the screen's primary job clear in one sentence?
- Is there exactly one primary action?
- Is anything present that does not serve the job?

If the job is unclear → refactor.

---

## 2. HIERARCHY CHECK

- Is the primary action visually dominant within 3 seconds?
- Is there a clear reading order without explanation?
- Is attention guided intentionally from top to bottom?
- Are secondary actions visually quieter than the primary?

Hierarchy tools must be used in this order:
Position → Size → Spacing → Weight → Color

If hierarchy relies mainly on color → refactor.

---

## 3. LAYOUT & SPACING CHECK

- Are related items grouped tightly?
- Are distinct sections clearly separated?
- Is whitespace used to create structure (not decoration)?
- Is spacing consistent with the defined scale (4/8/12/16/24/32/48/64)?

If spacing feels arbitrary or inconsistent → refactor.

---

## 4. AFFORDANCE & INTERACTION CHECK

- Do buttons look clickable?
- Do links look like links?
- Are interactive elements visually distinct from static content?
- Are disabled states obvious?
- Are hover, focus, and active states defined?

If interaction requires guessing → refactor.

---

## 5. STATE COMPLETENESS CHECK (NON-NEGOTIABLE)

Does the screen clearly define and handle:

- Default state
- Loading state
- Empty state
- Error state
- Success state

For empty states:
- Does it explain what this area is?
- Does it explain why it matters?
- Does it explain how to populate it?

If any state is missing or vague → refactor.

---

## 6. COPY & LANGUAGE CHECK

- Does every label explain the action?
- Is microcopy used to reduce uncertainty?
- Is the tone calm, direct, and human?
- Is there any hype, buzzword, or filler language?

If copy sounds like marketing or AI → rewrite.

---

## 7. COGNITIVE LOAD CHECK

- Can a first-time user understand this screen in under 5 seconds?
- Are there too many competing actions?
- Is complexity revealed progressively?
- Are advanced options hidden until needed?

If the screen feels overwhelming → simplify and refactor.

---

## 8. ACCESSIBILITY CHECK (MINIMUM BAR)

- Full keyboard navigation
- Visible focus states
- Sufficient color contrast
- No color-only meaning
- Semantic HTML structure

If accessibility is an afterthought → refactor.

---

## 9. VISUAL NOISE CHECK

Explicitly remove:
- Unnecessary borders
- Excessive dividers
- Decorative icons with no meaning
- Redundant labels
- Overuse of cards

If removing an element does not reduce clarity → remove it.

---

## 10. SENIOR DESIGNER TEST

Ask honestly:
- Would a senior designer approve this?
- Is anything here "just to look nice"?
- Is this the simplest solution that works?
- Does this UI make the right thing easy and the wrong thing hard?

If unsure → refactor again or present options.

---

## ENFORCEMENT RULE

If ANY section fails:
STOP.
Refactor.
Re-run the checklist.

UI quality is enforced, not optional.

---

## END OF CHECKLIST
