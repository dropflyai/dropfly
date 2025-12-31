# Spacing System — Authoritative

Spacing creates structure, hierarchy, and rhythm.
Whitespace is not decoration — it is architecture.

---

## Core Principles

1. **Spacing before decoration** — separation through space, not lines
2. **Consistent scale** — no arbitrary values
3. **Related items tight** — unrelated items loose
4. **Controls tighter than content** — UI elements are compact

---

## Spacing Scale

Use this scale exclusively. No exceptions.

```
0     0px       None
1     4px       Micro spacing (icon gaps, inline elements)
2     8px       Tight (related items, button padding)
3     12px      Compact (form fields, list items)
4     16px      Default (standard element spacing)
6     24px      Comfortable (section padding, card content)
8     32px      Generous (between sections)
12    48px      Large (major section breaks)
16    64px      Extra large (page-level divisions)
```

---

## Usage Guidelines

### Within Components

| Context | Spacing |
|---------|---------|
| Icon to text | 4-8px (1-2) |
| Button padding (x) | 12-16px (3-4) |
| Button padding (y) | 8-12px (2-3) |
| Input padding | 12px (3) |
| Checkbox/radio gap | 8px (2) |

### Between Elements

| Context | Spacing |
|---------|---------|
| Related form fields | 16px (4) |
| List items | 8-12px (2-3) |
| Paragraph spacing | 16px (4) |
| Card content padding | 16-24px (4-6) |
| Between cards | 16-24px (4-6) |

### Between Sections

| Context | Spacing |
|---------|---------|
| Section to section | 32-48px (8-12) |
| Page title to content | 24-32px (6-8) |
| Header to body | 16-24px (4-6) |
| Footer margin | 32-48px (8-12) |

### Layout

| Context | Spacing |
|---------|---------|
| Page padding (mobile) | 16px (4) |
| Page padding (tablet) | 24px (6) |
| Page padding (desktop) | 32-48px (8-12) |
| Sidebar width | 240-280px |
| Max content width | 1280px |

---

## Grouping Principle

**Law of Proximity**: Items closer together are perceived as related.

```
┌─────────────────────────────────────┐
│ Section A                           │
│ ┌─────────────────┐                 │
│ │ Item 1          │  ← 8px gap      │
│ │ Item 2          │  ← 8px gap      │
│ │ Item 3          │                 │
│ └─────────────────┘                 │
│                      ← 32px gap     │
│ Section B                           │
│ ┌─────────────────┐                 │
│ │ Item 1          │                 │
│ └─────────────────┘                 │
└─────────────────────────────────────┘
```

- Related items: tight spacing (8-12px)
- Distinct sections: generous spacing (24-48px)

---

## Component Spacing Patterns

### Form Layout
```
Label          ← 4px margin-bottom
Input          ← 16px margin-bottom
Help text
                ← 24px margin-bottom (between groups)
Next label
Next input
```

### Card Layout
```
┌─────────────────────────────────────┐
│ ← 24px padding                      │
│   Title                             │
│   ← 8px                             │
│   Description                       │
│   ← 16px                            │
│   Content area                      │
│   ← 24px                            │
│   Actions                           │
│ ← 24px padding                      │
└─────────────────────────────────────┘
```

### List Item
```
┌─────────────────────────────────────┐
│ ← 16px padding                      │
│   [Icon] 8px [Text content] → [Act] │
│ ← 16px padding                      │
└─────────────────────────────────────┘
← 1px border or 8-12px gap
```

---

## Mode-Specific Rules

### MODE_SAAS
- More generous spacing
- Breathing room for new users
- Content areas not cramped
- Use 24-32px between sections

### MODE_INTERNAL
- Tighter spacing allowed
- Density prioritized
- 16-24px between sections
- Compact list items (8px gaps)

### MODE_AGENTIC
- Medium density
- Clear separation between runs/steps
- Logs can be dense
- Status areas need breathing room

---

## Responsive Adjustments

| Breakpoint | Page Padding | Section Gap | Card Gap |
|------------|--------------|-------------|----------|
| Mobile (<640px) | 16px | 24px | 16px |
| Tablet (640-1024px) | 24px | 32px | 16px |
| Desktop (>1024px) | 32-48px | 48px | 24px |

---

## Anti-Patterns (Disallowed)

- Arbitrary spacing values (e.g., 10px, 18px, 22px)
- Borders/dividers instead of spacing
- Equal spacing everywhere (no hierarchy)
- Zero spacing between distinct elements
- Excessive spacing that wastes screen
- Inconsistent spacing for same element types

---

## Borders vs Spacing

**Prefer spacing over borders.**

- Use borders only when spacing is insufficient
- Borders for: table rows, input fields, distinct regions
- No borders for: section separation, card separation (use gap)
- Never use both heavy borders AND generous spacing

---

## Tailwind Mapping

```html
<!-- Micro -->
<div class="gap-1">        <!-- 4px -->

<!-- Tight -->
<div class="p-2 gap-2">    <!-- 8px -->

<!-- Compact -->
<div class="p-3 gap-3">    <!-- 12px -->

<!-- Default -->
<div class="p-4 gap-4">    <!-- 16px -->

<!-- Comfortable -->
<div class="p-6 gap-6">    <!-- 24px -->

<!-- Generous -->
<div class="space-y-8">    <!-- 32px -->

<!-- Large -->
<div class="py-12">        <!-- 48px -->

<!-- Extra large -->
<div class="mt-16">        <!-- 64px -->
```

---

## END OF SPACING SYSTEM
