# Pattern: Modals & Dialogs — Authoritative

Modals interrupt. Use them only when interruption is justified.
If a task can be done inline, do not use a modal.

---

## Purpose

Modals exist to:
- focus attention on a critical decision
- confirm destructive actions
- collect simple, required input
- present information that must be acknowledged

Modals do NOT exist for:
- complex workflows
- navigation
- non-critical information
- content that could be inline

---

## When to Use Modals

### Appropriate Uses
- Confirmation before destructive action
- Simple form input (1-5 fields)
- Critical alerts requiring acknowledgment
- Preview/review before submission
- Quick create (single entity)

### Inappropriate Uses (Avoid)
- Multi-step wizards
- Browsing content
- Settings configuration
- Displaying lists or tables
- Navigation menus

---

## Modal Types

### Alert Dialog
- Requires user decision
- Cannot be dismissed by clicking outside
- Has explicit actions (Cancel/Confirm)
- Use for: confirmations, warnings, errors

### Standard Dialog
- Can be dismissed
- Click outside closes
- Use for: forms, previews, non-critical

### Drawer/Slide-over
- Slides in from edge
- For larger content
- Use for: detail views, extended forms

---

## Structure

### Standard Modal
```
┌─────────────────────────────────────────┐
│ Modal Title                        [X]  │
├─────────────────────────────────────────┤
│                                         │
│  Content area                           │
│                                         │
│  - Keep concise                         │
│  - One purpose                          │
│                                         │
├─────────────────────────────────────────┤
│                    [Cancel]  [Confirm]  │
└─────────────────────────────────────────┘
```

### Required Elements
- Clear title explaining purpose
- Close button (X) in corner
- Action buttons in footer
- Scrim/overlay behind modal

---

## Sizing

### Width
```
sm    400px     Simple confirmations
md    500px     Standard forms (default)
lg    640px     Extended content
xl    800px     Complex forms (rare)
full  100%      Mobile only
```

### Height
- Content determines height
- Max height with scroll for overflow
- Never exceed viewport - 80px

---

## Behavior Rules

### Opening
- Animate in (fade + scale or slide)
- Focus moves to modal
- Page scroll locked

### Closing
- Click X button
- Press Escape key
- Click outside (standard dialogs only)
- Complete action

### Focus Management
- Focus trapped within modal
- First focusable element receives focus
- Focus returns to trigger on close
- Tab cycles within modal

---

## Confirmation Dialogs

### For Destructive Actions
```
┌─────────────────────────────────────────┐
│ Delete workflow?                   [X]  │
├─────────────────────────────────────────┤
│                                         │
│  This will permanently delete           │
│  "Email Campaign" and all its runs.     │
│                                         │
│  This action cannot be undone.          │
│                                         │
├─────────────────────────────────────────┤
│                   [Cancel]   [Delete]   │
│                              ↳ red      │
└─────────────────────────────────────────┘
```

### Rules
- State what will happen
- State consequences
- Destructive button is red
- Cancel is secondary style
- Destructive button on right

---

## Form Modals

### Rules
- Keep forms short (1-5 fields)
- One column layout
- Clear field labels
- Inline validation
- Submit disables during processing

### Structure
```
┌─────────────────────────────────────────┐
│ Create new workflow               [X]   │
├─────────────────────────────────────────┤
│                                         │
│  Name                                   │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Description (optional)                 │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│                 [Cancel]  [Create]      │
└─────────────────────────────────────────┘
```

---

## Alert Modals

### Error Alert
```
┌─────────────────────────────────────────┐
│ ⚠️ Action failed                        │
├─────────────────────────────────────────┤
│                                         │
│  Could not save changes.                │
│  The server returned an error.          │
│                                         │
│  Error: Connection timeout              │
│                                         │
├─────────────────────────────────────────┤
│                           [Try again]   │
└─────────────────────────────────────────┘
```

### Info Alert
- Less urgent styling
- Can be dismissed
- Single acknowledge button

---

## Mode-Specific Rules

### MODE_SAAS
- Use modals sparingly
- Clear, instructional copy
- Always offer cancel/escape
- Confirm major actions

### MODE_INTERNAL
- Can use more modals for efficiency
- Shorter copy acceptable
- Keyboard shortcuts encouraged
- Quick dismiss patterns

### MODE_AGENTIC
- Confirm before runs/actions
- Show clear consequences
- Allow inspection before confirm
- Never auto-confirm destructive

---

## Animation

### Opening
- Duration: 150-200ms
- Ease: ease-out
- Effect: fade + subtle scale (0.95 → 1)

### Closing
- Duration: 100-150ms
- Ease: ease-in
- Effect: fade + subtle scale (1 → 0.95)

---

## Accessibility Requirements

### Required ARIA
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
```

### Focus Rules
- Focus moves to modal on open
- Focus trapped within modal
- Focus returns to trigger on close
- First focusable element focused

### Keyboard
- Escape closes modal
- Tab cycles through focusable elements
- Shift+Tab cycles backward
- Enter submits (in form modals)

---

## Common Failures (Disallowed)

- Full-screen modals on desktop
- Nested modals (modal opens modal)
- Modals for navigation
- Uncloseable modals (except critical alerts)
- Auto-closing modals without user action
- Modals that reset on close
- Complex multi-step flows in modals
- Modal content that scrolls horizontally

---

## Final Modal Check

Before shipping, ask:
- Does this need to be a modal?
- Is the purpose immediately clear?
- Can users escape easily?
- Is focus properly managed?
- Are destructive actions confirmed?

If any answer is "no," reconsider approach.

---

## END OF MODALS PATTERN
