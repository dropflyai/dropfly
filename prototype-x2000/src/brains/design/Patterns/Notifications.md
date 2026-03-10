# Pattern: Notifications & Alerts — Authoritative

Notifications communicate what happened and what to do next.
If users miss or misunderstand notifications, they have failed.

---

## Purpose

Notifications exist to:
- confirm actions completed
- alert to errors or problems
- surface important information
- guide next steps

Notifications are functional, not decorative.

---

## Notification Types

### 1. Toast (Temporary)
- Auto-dismissing
- Non-blocking
- Confirmations, minor errors
- Position: top-right or bottom-right

### 2. Banner (Persistent)
- Requires acknowledgment or persists
- Page-level or section-level
- Important warnings, errors
- Position: top of content area

### 3. Inline Alert
- Contextual to specific element
- Part of form or content
- Field errors, section warnings
- Position: near related content

### 4. System Notification (External)
- Browser/OS level
- Background events
- Position: OS determines

---

## Toast Notifications

### Structure
```
┌─────────────────────────────────────────┐
│ ✓  Workflow saved                  [×]  │
│    Changes have been applied.           │
└─────────────────────────────────────────┘
```

### Variants
| Type | Icon | Use Case |
|------|------|----------|
| Success | ✓ (green) | Action completed |
| Error | ✗ (red) | Action failed |
| Warning | ⚠ (amber) | Caution needed |
| Info | ℹ (blue) | Neutral information |

### Timing
- Success: 3-5 seconds
- Error: 5-8 seconds or manual dismiss
- Warning: 5-8 seconds
- Info: 4-6 seconds

### Rules
- Stack from top (newest on top)
- Max 3 visible at once
- Dismiss on click
- Pause on hover
- Show action if applicable

---

## Banner Notifications

### Structure
```
┌─────────────────────────────────────────────────────┐
│ ⚠ Your trial expires in 3 days. [Upgrade]    [×]   │
└─────────────────────────────────────────────────────┘
```

### Use Cases
- System-wide warnings
- Required actions
- Feature announcements
- Persistent errors

### Rules
- Full width of content area
- Clear dismiss option
- Action button when applicable
- Do not stack multiple banners

---

## Inline Alerts

### Structure
```
┌─────────────────────────────────────────────────────┐
│ ⚠ Warning                                          │
│                                                     │
│ This workflow is currently running. Editing may     │
│ affect the active run.                              │
│                                                     │
│ [Continue editing]  [View run]                      │
└─────────────────────────────────────────────────────┘
```

### Variants
| Type | Border/Background | Use |
|------|-------------------|-----|
| Success | green-50 bg | Completed state |
| Error | red-50 bg | Validation errors |
| Warning | amber-50 bg | Caution states |
| Info | blue-50 bg | Helpful information |

### Rules
- Context-specific
- Include icon
- Include clear action if needed
- Do not auto-dismiss

---

## Content Rules

### What to Include
1. What happened (clear, factual)
2. Why it matters (if not obvious)
3. What to do next (action or guidance)

### Good Examples
```
✓ Workflow saved
  Changes will apply to future runs.

✗ Could not save workflow
  Connection lost. Check your network and try again.

⚠ API key expires in 7 days
  Update your credentials to prevent interruption.
```

### Bad Examples (Disallowed)
```
✓ Success!
✗ Error
⚠ Warning: Something happened
```

---

## Positioning

### Toast Placement
```
┌─────────────────────────────────────────────┐
│                              ┌────────────┐ │
│                              │ Toast 1    │ │
│                              │ Toast 2    │ │
│         Page Content         │ Toast 3    │ │
│                              └────────────┘ │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

Position: top-right (default) or bottom-right
- Away from primary actions
- Consistent position
- Stack with spacing (8-12px)

### Banner Placement
```
┌─────────────────────────────────────────────┐
│ [Banner - full width of content]            │
├─────────────────────────────────────────────┤
│                                             │
│         Page Content                        │
│                                             │
└─────────────────────────────────────────────┘
```

Position: below header, above content

---

## Animation

### Toast Enter
- Slide in from right
- Fade in
- Duration: 200ms
- Ease: ease-out

### Toast Exit
- Slide out to right
- Fade out
- Duration: 150ms
- Ease: ease-in

### Rules
- No bounce effects
- Smooth, subtle motion
- Respect reduced motion preference

---

## Mode-Specific Rules

### MODE_SAAS
- Clear, instructional messaging
- Always explain next steps
- Friendly but not cute
- Success confirmations expected

### MODE_INTERNAL
- Concise messaging
- More technical detail acceptable
- Faster dismiss timing
- Batch notifications allowed

### MODE_AGENTIC
- Run status notifications critical
- Error details surfaced
- Link to logs/details
- Partial success states clear

---

## Accessibility

### Requirements
- `role="alert"` for errors/urgent
- `role="status"` for non-urgent
- `aria-live="polite"` for toasts
- `aria-live="assertive"` for errors
- Focus moves to alert if blocking
- Screen reader announces content

### Focus Management
- Toasts don't steal focus
- Banners may receive focus if action required
- Inline alerts focusable via tab

---

## Notification Hierarchy

Priority order (highest to lowest):
1. **Blocking error** — Modal, requires action
2. **Inline error** — Field/section level
3. **Error toast** — Temporary, prominent
4. **Warning banner** — Persistent caution
5. **Warning toast** — Temporary caution
6. **Success toast** — Confirmation
7. **Info toast** — Neutral update

Never show multiple notification types for same event.

---

## Common Failures (Disallowed)

- Generic "Error" with no detail
- Celebratory success messages
- Auto-dismissing errors
- Stacking many notifications
- Notifications that block interaction
- Silent failures (no notification)
- Notification spam for minor events
- Notifications without actionable info

---

## Final Notification Check

Before shipping, ask:
- Is the notification necessary?
- Does it say what happened clearly?
- Does it guide next steps?
- Is timing appropriate?
- Will screen readers announce it?

If not, refactor.

---

## END OF NOTIFICATIONS PATTERN
