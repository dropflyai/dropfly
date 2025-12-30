# Accessibility Rules — Minimum Bar (Authoritative)

Accessibility is correctness.
If an interface is not accessible, it is incomplete.

These rules define the minimum acceptable bar for all UI.

---

## BASELINE REQUIREMENTS (NON-NEGOTIABLE)

Every screen MUST support:

- Full keyboard navigation
- Visible focus states
- Logical reading order
- Sufficient color contrast
- Semantic structure

If any requirement is missing, the UI fails.

---

## KEYBOARD NAVIGATION

Rules:
- All interactive elements must be reachable via keyboard
- Tab order must follow visual order
- Focus must never be trapped unintentionally
- Skip-to-content links required for complex pages

Disallowed:
- Mouse-only interactions
- Hover-only controls with no keyboard equivalent

---

## FOCUS STATES

Rules:
- Focus indicators must be visible
- Focus must not rely on color alone
- Focus styles must meet contrast requirements
- Custom components must define focus behavior explicitly

Never remove focus outlines without replacement.

---

## SEMANTIC STRUCTURE

Rules:
- Use proper HTML elements (button, nav, main, section, form, label)
- Headings must follow logical order (no skipping levels)
- Lists must be real lists
- Tables must use proper table semantics

Avoid div-only layouts for structured content.

---

## FORMS & INPUTS

Rules:
- Labels must be programmatically associated with inputs
- Error messages must be announced to screen readers
- Required fields must be indicated accessibly
- Placeholder text must not replace labels

Disallowed:
- Unlabeled inputs
- Error messages only shown visually

---

## COLOR & CONTRAST

Rules:
- Text contrast must meet WCAG AA minimums
- Color must never be the only indicator of meaning
- Disabled states must still be legible

Avoid:
- Low-contrast gray-on-gray text
- Color-only status indicators

---

## ICONS & NON-TEXT CONTENT

Rules:
- Icons must have accessible labels if interactive
- Decorative icons must be hidden from screen readers
- Images must include alt text when informative

Do not rely on icons alone to convey meaning.

---

## DYNAMIC CONTENT & STATE CHANGES

Rules:
- Loading, success, and error states must be announced
- Screen readers must be informed of significant changes
- Focus should move logically after actions

Avoid silent state changes.

---

## MODALS & DIALOGS

Rules:
- Focus must move into the modal on open
- Focus must be trapped within the modal
- Focus must return to the trigger on close
- Escape key must close the modal

Nested modals are disallowed.

---

## TABLES

Rules:
- Headers must be associated with cells
- Sortable headers must announce sort state
- Row actions must have accessible labels

Avoid tables that require visual interpretation only.

---

## MODE-SPECIFIC NOTES

### MODE_SAAS
- Extra care for first-time users
- Clear instructions and feedback

### MODE_INTERNAL
- Accessibility still required
- Keyboard efficiency strongly encouraged

### MODE_AGENTIC
- Logs and timelines must be readable via screen readers
- Status changes must be announced clearly
- Error details must be accessible, not visual-only

---

## A11Y FAILURE RULE

If accessibility issues are found:
- They must be fixed
- They cannot be deferred
- They cannot be justified away

Accessibility is not optional.

---

## FINAL A11Y CHECK

Before shipping, ask:
- Can this be used without a mouse?
- Can this be understood without color?
- Can this be navigated without sight?
- Would this pass an accessibility audit?

If not, refactor.

---

## END OF ACCESSIBILITY RULES
