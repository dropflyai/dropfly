# Pattern: Data Tables — Authoritative

Tables exist for comparison, scanning, and action at scale.
If a table slows the user down, it has failed.

---

## PURPOSE

Use tables when:
- Users need to compare many items
- Data has consistent structure
- Speed and accuracy matter

Do NOT use tables for storytelling or marketing.

---

## DEFAULT TABLE STRUCTURE (NON-NEGOTIABLE)

Every table must define:
- Clear column headers
- A primary row action (explicit or implicit)
- Secondary row actions (de-emphasized)
- Empty, loading, and error states

Tables without actions are reports, not interfaces.

---

## COLUMN RULES

- Columns must answer a question
- Column order reflects importance
- Most important column comes first
- Avoid unnecessary columns

Rules:
- Left-align text
- Right-align numbers
- Do not center-align data
- Keep headers short and clear

If a column doesn't affect a decision, remove it.

---

## ROW INTERACTION

- Rows may be clickable, but must indicate clickability
- Row hover states required
- Primary row action must be obvious
- Secondary actions hidden behind a menu or inline on hover

Avoid cluttering every row with visible buttons.

---

## SORTING & FILTERING

### Sorting
- Allow sorting where it provides value
- Indicate current sort clearly
- Default sort must be sensible

### Filtering
- Filters must be discoverable
- Filters should be reversible
- Active filters must be visible

Do not hide filters behind obscure controls.

---

## BULK ACTIONS

Use bulk actions when:
- Users manage many items
- Actions are repetitive

Rules:
- Bulk mode must be explicit
- Selection must be clear
- Destructive bulk actions require confirmation

Never mix single-item and bulk actions ambiguously.

---

## PAGINATION & VIRTUALIZATION

- Paginate large datasets by default
- Infinite scroll only when justified
- Preserve scroll position when possible

Avoid overwhelming the user with unbounded lists.

---

## DENSITY CONTROL

Tables must support density modes when appropriate:
- Comfortable
- Compact

Density choice must persist per user.

---

## INLINE STATES

Tables must handle:
- Inline loading (skeleton rows)
- Partial failures (row-level errors)
- Disabled rows (with explanation)

Do not block the entire table for single-row issues.

---

## MODE-SPECIFIC RULES

### MODE_SAAS
- Favor readability over density
- Limit columns
- Hide advanced actions

Avoid intimidating first-time users.

---

### MODE_INTERNAL
- Favor density and speed
- Support keyboard navigation
- Enable bulk actions
- Allow power-user workflows

Avoid oversized rows or excessive padding.

---

### MODE_AGENTIC
- Surface execution state per row
- Show timestamps, status, and reason
- Highlight failures without hiding successes
- Allow drill-down into logs

Avoid abstract status labels without detail.

---

## ACCESSIBILITY (NON-NEGOTIABLE)

- Table headers properly associated
- Keyboard navigable rows and controls
- Focus states visible
- Screen reader-friendly labels for actions

---

## COMMON TABLE FAILURES (EXPLICITLY DISALLOWED)

- Too many columns
- Unclear row actions
- Hidden active filters
- Tables with no empty state explanation
- Full-page blocking spinners
- Decorative tables with no interaction

If users must hunt for actions, refactor.

---

## FINAL TABLE CHECK

Before shipping, ask:
- Can users scan this quickly?
- Is the primary action obvious?
- Are errors isolated and recoverable?
- Does this table respect power users?

If not, refactor.

---

## END OF DATA TABLES PATTERN
