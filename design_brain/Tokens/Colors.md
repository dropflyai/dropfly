# Color System — Authoritative

Color exists to communicate meaning, not to decorate.
Every color must have semantic purpose.

---

## Core Principles

1. **Neutral-first palette** — most UI is gray
2. **Color for meaning** — status, actions, warnings
3. **One accent** — single primary brand color
4. **Red is reserved** — destructive and error only
5. **Contrast required** — WCAG AA minimum

---

## Semantic Color Roles

### Neutral (Background & Text)
```
neutral-50    #fafafa   Page background (light mode)
neutral-100   #f5f5f5   Card/surface background
neutral-200   #e5e5e5   Borders, dividers
neutral-300   #d4d4d4   Disabled elements
neutral-400   #a3a3a3   Placeholder text
neutral-500   #737373   Secondary text
neutral-600   #525252   Body text
neutral-700   #404040   Primary text
neutral-800   #262626   Headings
neutral-900   #171717   High emphasis text
neutral-950   #0a0a0a   Page background (dark mode)
```

### Primary (Brand Accent)
```
primary-50    #eff6ff   Subtle highlight
primary-100   #dbeafe   Light background
primary-200   #bfdbfe   Hover state background
primary-300   #93c5fd   Active state
primary-400   #60a5fa   Secondary accent
primary-500   #3b82f6   Primary action (buttons, links)
primary-600   #2563eb   Hover on primary
primary-700   #1d4ed8   Active on primary
primary-800   #1e40af   Dark accent
primary-900   #1e3a8a   Darkest accent
```

### Success (Confirmation)
```
success-50    #f0fdf4   Success background
success-500   #22c55e   Success text/icon
success-600   #16a34a   Success emphasis
success-700   #15803d   Success dark
```

### Warning (Caution)
```
warning-50    #fffbeb   Warning background
warning-500   #f59e0b   Warning text/icon
warning-600   #d97706   Warning emphasis
warning-700   #b45309   Warning dark
```

### Error (Destructive)
```
error-50      #fef2f2   Error background
error-500     #ef4444   Error text/icon
error-600     #dc2626   Error emphasis (destructive buttons)
error-700     #b91c1c   Error dark
```

### Info (Neutral Information)
```
info-50       #f0f9ff   Info background
info-500      #0ea5e9   Info text/icon
info-600      #0284c7   Info emphasis
info-700      #0369a1   Info dark
```

---

## Usage Rules

### Text Colors
| Context | Color |
|---------|-------|
| Primary text | neutral-700 (light) / neutral-100 (dark) |
| Secondary text | neutral-500 |
| Placeholder | neutral-400 |
| Disabled | neutral-300 |
| Links | primary-500 |
| Error text | error-600 |

### Background Colors
| Context | Color |
|---------|-------|
| Page | neutral-50 (light) / neutral-950 (dark) |
| Card/Surface | white (light) / neutral-900 (dark) |
| Subtle highlight | neutral-100 |
| Selection | primary-100 |
| Hover | neutral-100 |

### Border Colors
| Context | Color |
|---------|-------|
| Default | neutral-200 |
| Focus | primary-500 |
| Error | error-500 |
| Subtle | neutral-100 |

### Status Indicators
| Status | Background | Text/Icon |
|--------|------------|-----------|
| Success | success-50 | success-600 |
| Warning | warning-50 | warning-600 |
| Error | error-50 | error-600 |
| Info | info-50 | info-600 |
| Neutral | neutral-100 | neutral-600 |

---

## Contrast Requirements

### Minimum Ratios (WCAG AA)
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

### Verified Combinations
- neutral-700 on white: 8.59:1 (pass)
- neutral-600 on white: 5.74:1 (pass)
- neutral-500 on white: 4.64:1 (pass)
- neutral-400 on white: 2.95:1 (fail for body text)
- primary-500 on white: 3.03:1 (large text only)
- primary-600 on white: 4.56:1 (pass)

---

## Mode-Specific Rules

### MODE_SAAS
- Use color sparingly
- Primary color for key CTAs only
- Neutral palette dominates
- Status colors for feedback

### MODE_INTERNAL
- Higher density, same color rules
- Can use more saturated status colors
- Data visualization colors allowed

### MODE_AGENTIC
- Status colors are primary communication
- Timeline/progress uses semantic colors
- Error states must be prominent
- Success/partial-success distinction critical

---

## Anti-Patterns (Disallowed)

- Color as only indicator of meaning
- Multiple competing accent colors
- Gradients for decoration
- Low-contrast gray-on-gray
- Red for non-destructive/non-error
- Green for non-success states
- Color that requires legend to understand

---

## Dark Mode Rules

- Invert neutral scale (950 → 50)
- Reduce saturation of accent colors slightly
- Maintain contrast ratios
- Test all status colors in both modes
- Shadows become lighter, not darker

---

## Tailwind CSS Mapping

```css
/* Custom color config */
colors: {
  neutral: { /* zinc scale */ },
  primary: { /* blue scale */ },
  success: { /* green scale */ },
  warning: { /* amber scale */ },
  error: { /* red scale */ },
  info: { /* sky scale */ },
}
```

---

## END OF COLOR SYSTEM
