# Component Specification — Authoritative

This document defines the allowed UI components, their variants, and behavioral rules.
Components are contracts. They must be predictable, consistent, and reusable.

If a component deviates from this spec, it must be refactored.

---

## GLOBAL RULES (APPLY TO ALL COMPONENTS)

- Components must be composable
- Components must support keyboard navigation
- Components must define hover, focus, active, disabled states
- Components must support loading states where applicable
- Components must not encode business logic
- Components must not change appearance unpredictably

Consistency > novelty.

---

## BUTTONS

### Variants (Only these are allowed)
- Primary
- Secondary
- Ghost
- Destructive

### Rules
- One Primary button per screen (max)
- Primary buttons represent the main outcome
- Destructive buttons must be visually distinct and require confirmation
- Disabled buttons must explain why (via tooltip or inline text)
- Loading state replaces label with spinner (no layout shift)

### Anti-patterns
- Multiple primary buttons on one screen
- Icon-only primary actions without labels
- Buttons styled as links without affordance

---

## LINKS

### Rules
- Links are for navigation, not actions
- Links must be visually distinguishable from body text
- Inline links should be underlined or clearly styled
- External links must indicate they open a new destination

Avoid turning links into disguised buttons.

---

## FORMS

### Structure
- Labels always visible (no placeholder-only labels)
- One column by default
- Logical grouping with clear section headers
- Required fields clearly indicated

### Validation
- Inline validation only
- Errors appear near the field
- Errors explain how to fix the issue
- No modal validation errors

### States
- Default
- Focus
- Error
- Disabled
- Submitting
- Success (when applicable)

### Anti-patterns
- Multi-column forms without justification
- Placeholder-only instructions
- Vague error messages

---

## INPUT FIELDS

### Types
- Text
- Email
- Password
- Number
- Select
- Multi-select
- Textarea
- Toggle / Checkbox / Radio

### Rules
- Field purpose must be clear without reading documentation
- Help text appears below the field
- Error text replaces help text when present
- Inputs must not resize unexpectedly

---

## MODALS / DIALOGS

### Usage
- Focused, short tasks only
- Confirmation, review, or simple input
- Not for complex workflows

### Rules
- Modal must have a clear title
- Primary action is visually dominant
- Escape key closes modal
- Click outside closes modal (unless destructive)
- Focus is trapped within modal

### Anti-patterns
- Full-screen modals on desktop
- Nested modals
- Modals used for navigation

---

## TABLES & LISTS

### Tables
- Used for structured, comparable data
- Column headers required
- Sortable headers clearly indicated
- Bulk actions clearly separated

### Lists
- Used for scannable items
- Clear primary action per row
- Secondary actions hidden or secondary

Avoid dense tables in MODE_SAAS landing contexts.

---

## CARDS

### Purpose
- Summarize an entity
- Group related information

### Rules
- Cards must have a clear purpose
- Cards must not be used as default layout containers
- Interactive cards must indicate clickability

Overuse of cards is a known AI failure mode.

---

## ALERTS & NOTIFICATIONS

### Types
- Info
- Success
- Warning
- Error

### Rules
- Alerts must explain what happened
- Alerts must explain what to do next
- Alerts must not stack excessively
- Errors should be dismissible when resolved

Avoid vague or celebratory messaging.

---

## ICONS

### Rules
- Icons support text, not replace it
- Icons must be familiar and unambiguous
- Decorative icons are discouraged
- Icon-only actions must have accessible labels

---

## LOADING STATES

### Rules
- Use skeletons for content-heavy areas
- Use spinners for short waits
- Avoid blocking the entire screen unnecessarily
- Loading states should preserve layout

---

## EMPTY STATES

Handled in detail in `/design/Patterns/EmptyStates.md`

---

## COMPONENT EXTENSIONS

If a new component is needed:
- Justify its purpose
- Define variants
- Define states
- Define accessibility requirements

Do not invent components casually.

---

## END OF COMPONENT SPEC
