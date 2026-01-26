# BookFly Design Tokens

## Overview

This document defines the complete design token system for BookFly, ensuring consistency across mobile and web platforms. Built for a professional bookkeeping context emphasizing trust, accuracy, and efficiency.

---

## Color Palette

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-50` | `#EFF6FF` | Primary backgrounds, hover states |
| `--color-primary-100` | `#DBEAFE` | Light primary accents |
| `--color-primary-200` | `#BFDBFE` | Secondary backgrounds |
| `--color-primary-300` | `#93C5FD` | Borders, dividers |
| `--color-primary-400` | `#60A5FA` | Icons, secondary text |
| `--color-primary-500` | `#3B82F6` | Links, interactive elements |
| `--color-primary-600` | `#2563EB` | Primary buttons, key actions |
| `--color-primary-700` | `#1D4ED8` | Hover states for primary |
| `--color-primary-800` | `#1E40AF` | Active states |
| `--color-primary-900` | `#1E3A8A` | Dark accents |

**Primary: Deep Blue (#2563EB)**
- Conveys trust, professionalism, stability
- Used for primary actions, navigation, key UI elements
- Passes WCAG AA contrast on white backgrounds

---

### Semantic Colors

#### Success (Teal)
| Token | Value | Usage |
|-------|-------|-------|
| `--color-success-50` | `#F0FDFA` | Success backgrounds |
| `--color-success-100` | `#CCFBF1` | Light success |
| `--color-success-500` | `#14B8A6` | Success indicators |
| `--color-success-600` | `#0D9488` | Success buttons |
| `--color-success-700` | `#0F766E` | Success hover |

#### Warning (Amber)
| Token | Value | Usage |
|-------|-------|-------|
| `--color-warning-50` | `#FFFBEB` | Warning backgrounds |
| `--color-warning-100` | `#FEF3C7` | Light warning |
| `--color-warning-500` | `#F59E0B` | Warning indicators |
| `--color-warning-600` | `#D97706` | Warning emphasis |
| `--color-warning-700` | `#B45309` | Warning dark |

#### Error (Red)
| Token | Value | Usage |
|-------|-------|-------|
| `--color-error-50` | `#FEF2F2` | Error backgrounds |
| `--color-error-100` | `#FEE2E2` | Light error |
| `--color-error-500` | `#EF4444` | Error indicators |
| `--color-error-600` | `#DC2626` | Error buttons, text |
| `--color-error-700` | `#B91C1C` | Error hover |

#### Info (Blue)
| Token | Value | Usage |
|-------|-------|-------|
| `--color-info-50` | `#EFF6FF` | Info backgrounds |
| `--color-info-100` | `#DBEAFE` | Light info |
| `--color-info-500` | `#3B82F6` | Info indicators |
| `--color-info-600` | `#2563EB` | Info emphasis |

---

### Neutral Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-neutral-0` | `#FFFFFF` | Backgrounds, cards |
| `--color-neutral-50` | `#F9FAFB` | Page backgrounds |
| `--color-neutral-100` | `#F3F4F6` | Disabled backgrounds |
| `--color-neutral-200` | `#E5E7EB` | Borders, dividers |
| `--color-neutral-300` | `#D1D5DB` | Disabled text, icons |
| `--color-neutral-400` | `#9CA3AF` | Placeholder text |
| `--color-neutral-500` | `#6B7280` | Secondary text |
| `--color-neutral-600` | `#4B5563` | Body text |
| `--color-neutral-700` | `#374151` | Headings |
| `--color-neutral-800` | `#1F2937` | Primary text |
| `--color-neutral-900` | `#111827` | High emphasis text |

---

### Confidence Score Colors

Used for AI extraction confidence indicators:

| Confidence Level | Range | Color Token | Hex Value | Usage |
|-----------------|-------|-------------|-----------|-------|
| High | 90-100% | `--color-confidence-high` | `#10B981` | Green badge, trusted data |
| Medium | 70-89% | `--color-confidence-medium` | `#F59E0B` | Yellow badge, review suggested |
| Low | 0-69% | `--color-confidence-low` | `#EF4444` | Red badge, manual review required |

**Background variants:**
| Token | Value |
|-------|-------|
| `--color-confidence-high-bg` | `#D1FAE5` |
| `--color-confidence-medium-bg` | `#FEF3C7` |
| `--color-confidence-low-bg` | `#FEE2E2` |

---

### Sync Status Colors

| Status | Color Token | Hex Value | Usage |
|--------|-------------|-----------|-------|
| Pending | `--color-sync-pending` | `#6B7280` | Not yet synced |
| Syncing | `--color-sync-active` | `#3B82F6` | Currently syncing |
| Synced | `--color-sync-success` | `#10B981` | Successfully synced |
| Error | `--color-sync-error` | `#EF4444` | Sync failed |

---

### Connection Status Colors

| Status | Color Token | Indicator |
|--------|-------------|-----------|
| Connected | `--color-connection-active` | `#10B981` (Green dot) |
| Expiring | `--color-connection-warning` | `#F59E0B` (Yellow dot) |
| Disconnected | `--color-connection-error` | `#EF4444` (Red dot) |

---

## Typography

### Font Family

```css
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
--font-family-mono: 'JetBrains Mono', 'SF Mono', Monaco, 'Courier New', monospace;
```

**Primary Font: Inter**
- Clean, professional, highly legible
- Excellent for numbers (bookkeeping context)
- Variable font support for optimal rendering

---

### Type Scale

Mobile-optimized scale with 1.25 ratio:

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 12px | 16px | 400 | Captions, badges |
| `--text-sm` | 14px | 20px | 400 | Secondary text, labels |
| `--text-base` | 16px | 24px | 400 | Body text (default) |
| `--text-lg` | 18px | 28px | 500 | Subheadings |
| `--text-xl` | 20px | 28px | 600 | Section headers |
| `--text-2xl` | 24px | 32px | 600 | Page titles |
| `--text-3xl` | 30px | 36px | 700 | Hero text |
| `--text-4xl` | 36px | 40px | 700 | Display |

---

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-normal` | 400 | Body text |
| `--font-weight-medium` | 500 | Emphasis, labels |
| `--font-weight-semibold` | 600 | Subheadings, buttons |
| `--font-weight-bold` | 700 | Headings, stats |

---

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#1F2937` | Primary text |
| `--text-secondary` | `#6B7280` | Secondary text |
| `--text-tertiary` | `#9CA3AF` | Disabled, hints |
| `--text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| `--text-link` | `#2563EB` | Links |
| `--text-link-hover` | `#1D4ED8` | Link hover |
| `--text-error` | `#DC2626` | Error messages |
| `--text-success` | `#059669` | Success messages |

---

## Spacing System

8px base grid system:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | Reset |
| `--space-1` | 4px | Tight spacing, icon gaps |
| `--space-2` | 8px | Base unit, small gaps |
| `--space-3` | 12px | Input padding, list gaps |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Medium spacing |
| `--space-6` | 24px | Large gaps, margins |
| `--space-8` | 32px | Section spacing |
| `--space-10` | 40px | Large section spacing |
| `--space-12` | 48px | Page margins |
| `--space-16` | 64px | Hero spacing |
| `--space-20` | 80px | Extra large |
| `--space-24` | 96px | Maximum spacing |

---

### Component Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-inset-sm` | 8px | Small component padding |
| `--space-inset-md` | 12px | Medium component padding |
| `--space-inset-lg` | 16px | Large component padding |
| `--space-inset-xl` | 24px | Extra large padding |
| `--space-stack-sm` | 8px | Small vertical gap |
| `--space-stack-md` | 16px | Medium vertical gap |
| `--space-stack-lg` | 24px | Large vertical gap |
| `--space-inline-sm` | 4px | Small horizontal gap |
| `--space-inline-md` | 8px | Medium horizontal gap |
| `--space-inline-lg` | 16px | Large horizontal gap |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0px | No rounding |
| `--radius-sm` | 4px | Small elements (badges) |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards, modals |
| `--radius-xl` | 12px | Large cards |
| `--radius-2xl` | 16px | Panels |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-none` | `none` | No shadow |
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Cards |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Dropdowns, modals |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Popovers |
| `--shadow-inner` | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` | Inset inputs |

---

### Focus Shadow

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-focus` | `0 0 0 3px rgba(37, 99, 235, 0.3)` | Focus ring |
| `--shadow-focus-error` | `0 0 0 3px rgba(220, 38, 38, 0.3)` | Error focus |

---

## Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--border-width-thin` | 1px | Default borders |
| `--border-width-medium` | 2px | Emphasis borders |
| `--border-width-thick` | 3px | Strong emphasis |
| `--border-color-default` | `#E5E7EB` | Default border |
| `--border-color-strong` | `#D1D5DB` | Emphasized border |
| `--border-color-focus` | `#2563EB` | Focus state |
| `--border-color-error` | `#EF4444` | Error state |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-below` | -1 | Below content |
| `--z-base` | 0 | Default |
| `--z-above` | 1 | Lifted content |
| `--z-dropdown` | 10 | Dropdowns |
| `--z-sticky` | 20 | Sticky headers |
| `--z-overlay` | 30 | Overlays |
| `--z-modal` | 40 | Modals |
| `--z-toast` | 50 | Toast notifications |
| `--z-tooltip` | 60 | Tooltips |
| `--z-max` | 9999 | Maximum (edge cases) |

---

## Animation & Transitions

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 0ms | Immediate |
| `--duration-fast` | 100ms | Hover states |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-slow` | 300ms | Complex animations |
| `--duration-slower` | 500ms | Large transitions |

---

### Easing

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-linear` | `linear` | Progress bars |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful feedback |

---

### Common Transitions

```css
--transition-colors: color, background-color, border-color, fill, stroke var(--duration-fast) var(--ease-out);
--transition-opacity: opacity var(--duration-normal) var(--ease-out);
--transition-transform: transform var(--duration-normal) var(--ease-out);
--transition-all: all var(--duration-normal) var(--ease-out);
```

---

## Component-Specific Tokens

### Cards

| Token | Value |
|-------|-------|
| `--card-bg` | `#FFFFFF` |
| `--card-border` | `1px solid #E5E7EB` |
| `--card-radius` | `8px` |
| `--card-shadow` | `var(--shadow-md)` |
| `--card-padding` | `16px` |
| `--card-padding-lg` | `24px` |

---

### Buttons

| Token | Value |
|-------|-------|
| `--btn-height-sm` | `32px` |
| `--btn-height-md` | `40px` |
| `--btn-height-lg` | `48px` |
| `--btn-padding-sm` | `8px 12px` |
| `--btn-padding-md` | `10px 16px` |
| `--btn-padding-lg` | `12px 24px` |
| `--btn-radius` | `6px` |
| `--btn-font-weight` | `600` |

**Primary Button:**
| Token | Value |
|-------|-------|
| `--btn-primary-bg` | `#2563EB` |
| `--btn-primary-bg-hover` | `#1D4ED8` |
| `--btn-primary-bg-active` | `#1E40AF` |
| `--btn-primary-text` | `#FFFFFF` |

**Secondary Button:**
| Token | Value |
|-------|-------|
| `--btn-secondary-bg` | `#FFFFFF` |
| `--btn-secondary-bg-hover` | `#F9FAFB` |
| `--btn-secondary-border` | `#D1D5DB` |
| `--btn-secondary-text` | `#374151` |

**Danger Button:**
| Token | Value |
|-------|-------|
| `--btn-danger-bg` | `#DC2626` |
| `--btn-danger-bg-hover` | `#B91C1C` |
| `--btn-danger-text` | `#FFFFFF` |

---

### Inputs

| Token | Value |
|-------|-------|
| `--input-height-sm` | `32px` |
| `--input-height-md` | `40px` |
| `--input-height-lg` | `48px` |
| `--input-padding` | `10px 12px` |
| `--input-radius` | `6px` |
| `--input-border` | `1px solid #D1D5DB` |
| `--input-border-focus` | `1px solid #2563EB` |
| `--input-border-error` | `1px solid #EF4444` |
| `--input-bg` | `#FFFFFF` |
| `--input-bg-disabled` | `#F3F4F6` |
| `--input-text` | `#1F2937` |
| `--input-placeholder` | `#9CA3AF` |

---

### Badges

| Token | Value |
|-------|-------|
| `--badge-padding` | `2px 8px` |
| `--badge-radius` | `9999px` |
| `--badge-font-size` | `12px` |
| `--badge-font-weight` | `500` |

**Badge Variants:**
| Variant | Background | Text |
|---------|------------|------|
| Default | `#F3F4F6` | `#374151` |
| Primary | `#DBEAFE` | `#1E40AF` |
| Success | `#D1FAE5` | `#065F46` |
| Warning | `#FEF3C7` | `#92400E` |
| Error | `#FEE2E2` | `#991B1B` |

---

### Table

| Token | Value |
|-------|-------|
| `--table-header-bg` | `#F9FAFB` |
| `--table-header-text` | `#374151` |
| `--table-row-bg` | `#FFFFFF` |
| `--table-row-bg-hover` | `#F9FAFB` |
| `--table-row-bg-selected` | `#EFF6FF` |
| `--table-border` | `#E5E7EB` |
| `--table-cell-padding` | `12px 16px` |

---

### Modals

| Token | Value |
|-------|-------|
| `--modal-bg` | `#FFFFFF` |
| `--modal-radius` | `12px` |
| `--modal-shadow` | `var(--shadow-xl)` |
| `--modal-padding` | `24px` |
| `--modal-overlay-bg` | `rgba(0, 0, 0, 0.5)` |
| `--modal-width-sm` | `400px` |
| `--modal-width-md` | `560px` |
| `--modal-width-lg` | `720px` |

---

### Toast Notifications

| Token | Value |
|-------|-------|
| `--toast-radius` | `8px` |
| `--toast-padding` | `12px 16px` |
| `--toast-shadow` | `var(--shadow-lg)` |

**Toast Variants:**
| Variant | Background | Border | Icon |
|---------|------------|--------|------|
| Success | `#F0FDF4` | `#86EFAC` | `#16A34A` |
| Error | `#FEF2F2` | `#FECACA` | `#DC2626` |
| Warning | `#FFFBEB` | `#FDE68A` | `#D97706` |
| Info | `#EFF6FF` | `#BFDBFE` | `#2563EB` |

---

### Confidence Badge (Special)

| Confidence | Background | Text | Border |
|------------|------------|------|--------|
| High (90+) | `#D1FAE5` | `#065F46` | `#10B981` |
| Medium (70-89) | `#FEF3C7` | `#92400E` | `#F59E0B` |
| Low (<70) | `#FEE2E2` | `#991B1B` | `#EF4444` |

**Display Format:**
```
┌────────┐
│ 🟢 95% │  ← High confidence
└────────┘

┌────────┐
│ 🟡 78% │  ← Medium confidence
└────────┘

┌────────┐
│ 🔴 45% │  ← Low confidence
└────────┘
```

---

## Dark Mode Tokens (Future)

Placeholder for dark mode support:

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `--bg-primary` | `#FFFFFF` | `#1F2937` |
| `--bg-secondary` | `#F9FAFB` | `#111827` |
| `--text-primary` | `#1F2937` | `#F9FAFB` |
| `--text-secondary` | `#6B7280` | `#9CA3AF` |
| `--border-default` | `#E5E7EB` | `#374151` |

---

## Responsive Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `--breakpoint-sm` | `640px` | Small devices |
| `--breakpoint-md` | `768px` | Tablets |
| `--breakpoint-lg` | `1024px` | Laptops |
| `--breakpoint-xl` | `1280px` | Desktops |
| `--breakpoint-2xl` | `1536px` | Large screens |

---

## Usage Examples

### CSS Variables Implementation

```css
:root {
  /* Colors */
  --color-primary-600: #2563EB;
  --color-success-500: #14B8A6;

  /* Typography */
  --text-base: 16px;
  --font-weight-semibold: 600;

  /* Spacing */
  --space-4: 16px;

  /* Components */
  --btn-radius: 6px;
}

.btn-primary {
  background: var(--color-primary-600);
  border-radius: var(--btn-radius);
  padding: var(--btn-padding-md);
  font-weight: var(--font-weight-semibold);
}
```

### React Native / Expo

```javascript
export const tokens = {
  colors: {
    primary: {
      600: '#2563EB',
      700: '#1D4ED8',
    },
    confidence: {
      high: '#10B981',
      medium: '#F59E0B',
      low: '#EF4444',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  borderRadius: {
    md: 6,
    lg: 8,
  },
};
```

---

*Last Updated: January 2025*
*Version: 1.0.0*
