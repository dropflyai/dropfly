# Typography System — Authoritative

Typography exists to establish hierarchy and enable scanning.
Every text style must have a clear purpose.

---

## Core Principles

1. **Max 2 font families** — system or chosen pair
2. **Max 3 text sizes per screen** — excluding labels
3. **Headings explain structure** — not branding
4. **Body text must be scannable** — without effort

---

## Type Scale

Use this scale exclusively. No arbitrary sizes.

```
text-xs     12px / 1.5    Labels, metadata, captions
text-sm     14px / 1.5    Secondary text, help text
text-base   16px / 1.5    Body text (default)
text-lg     18px / 1.5    Emphasized body, subheadings
text-xl     20px / 1.4    Section headers
text-2xl    24px / 1.3    Page titles, major sections
text-3xl    30px / 1.2    Hero text (rare)
text-4xl    36px / 1.1    Marketing only (avoid in product)
```

---

## Font Weight Scale

```
font-normal    400    Body text, descriptions
font-medium    500    Labels, emphasized text
font-semibold  600    Headings, buttons, actions
font-bold      700    Strong emphasis (use sparingly)
```

---

## Line Height Rules

| Text Size | Line Height | Use Case |
|-----------|-------------|----------|
| 12-14px | 1.5 (150%) | Dense UI, tables |
| 16px | 1.5 (150%) | Body text |
| 18-24px | 1.4 (140%) | Subheadings |
| 24-36px | 1.2-1.3 | Headings |

---

## Letter Spacing

```
tracking-tight    -0.025em    Large headings (24px+)
tracking-normal   0           Body text (default)
tracking-wide     0.025em     All caps labels, buttons
```

---

## Font Stack

### Primary (UI)
```css
font-family: ui-sans-serif, system-ui, -apple-system,
             BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
```

### Monospace (Code, Data)
```css
font-family: ui-monospace, SFMono-Regular, Menlo,
             Monaco, Consolas, "Liberation Mono",
             "Courier New", monospace;
```

---

## Semantic Text Styles

### Headings

| Style | Size | Weight | Use |
|-------|------|--------|-----|
| Page title | text-2xl | semibold | Main page heading |
| Section title | text-xl | semibold | Major sections |
| Subsection | text-lg | medium | Groups within sections |
| Card title | text-base | semibold | Card headers |

### Body

| Style | Size | Weight | Use |
|-------|------|--------|-----|
| Body | text-base | normal | Default text |
| Body emphasis | text-base | medium | Inline emphasis |
| Secondary | text-sm | normal | Less important info |
| Caption | text-xs | normal | Metadata, timestamps |

### Interactive

| Style | Size | Weight | Use |
|-------|------|--------|-----|
| Button | text-sm | medium | Button labels |
| Link | text-base | normal | Inline links |
| Label | text-sm | medium | Form labels |
| Help text | text-sm | normal | Field descriptions |

---

## Usage Rules

### Hierarchy Per Screen
- One `text-2xl` or larger (page title)
- One to two `text-xl` (sections)
- Body text is `text-base` or `text-sm`
- Do not skip heading levels

### Alignment
- Left-align all body text
- Left-align headings
- Never center body text
- Right-align numbers in tables

### Line Length
- Optimal: 60-75 characters
- Maximum: 80 characters
- Use `max-w-prose` or explicit width

### Truncation
- Single line: ellipsis with title attribute
- Multi-line: line clamp with expansion option
- Never truncate critical information

---

## Mode-Specific Rules

### MODE_SAAS
- Larger text sizes allowed
- More generous line height
- Clear visual hierarchy
- Avoid dense text blocks

### MODE_INTERNAL
- Smaller sizes acceptable (text-sm as body)
- Tighter line heights allowed
- Information density prioritized
- Scannable over readable

### MODE_AGENTIC
- Monospace for logs/code
- Clear status labels
- Timestamps prominent
- Dense but organized

---

## Anti-Patterns (Disallowed)

- Large marketing headlines in product UI
- Center-aligned body text
- More than 3 font sizes per view
- Arbitrary font sizes (e.g., 15px, 17px)
- All caps for body text
- Decorative fonts
- Font weight for status (use color/icons)

---

## Accessibility Rules

- Minimum body text: 16px
- Line height: minimum 1.5 for body
- Respect user font size preferences
- Do not use font size below 12px
- Sufficient contrast (see Colors.md)

---

## Tailwind Mapping

```html
<!-- Page title -->
<h1 class="text-2xl font-semibold text-neutral-800">

<!-- Section title -->
<h2 class="text-xl font-semibold text-neutral-800">

<!-- Body -->
<p class="text-base text-neutral-600">

<!-- Secondary -->
<p class="text-sm text-neutral-500">

<!-- Label -->
<label class="text-sm font-medium text-neutral-700">

<!-- Caption -->
<span class="text-xs text-neutral-500">
```

---

## END OF TYPOGRAPHY SYSTEM
