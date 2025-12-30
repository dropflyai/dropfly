# Internationalization (i18n) Pattern — Authoritative

Design for one language first. Design for all languages in mind.
Internationalization is not translation—it's structural.

---

## Purpose

Internationalization exists to:
- enable products to reach global markets
- ensure UI works with any language
- prevent costly redesigns later
- respect cultural differences
- maintain usability across locales

If you design only for English, you'll redesign for everything else.

---

## Core Principles

### 1. Text Expansion
Text in other languages is often longer than English.

| Language | Expansion Factor |
|----------|------------------|
| German | 1.3x - 1.5x |
| French | 1.2x - 1.4x |
| Spanish | 1.2x - 1.3x |
| Italian | 1.2x - 1.3x |
| Russian | 1.3x - 1.5x |
| Japanese | 0.8x - 1.0x (but taller) |
| Chinese | 0.8x - 1.0x (but taller) |
| Arabic | 1.2x - 1.3x |

**Design Rule:** Allow 50% extra space for text, or ensure flexible containers.

---

### 2. Text Direction

| Direction | Languages | Abbreviation |
|-----------|-----------|--------------|
| Left-to-Right | English, Spanish, French, German, etc. | LTR |
| Right-to-Left | Arabic, Hebrew, Persian, Urdu | RTL |
| Top-to-Bottom | Traditional Chinese, Japanese, Korean | TTB (rare in UI) |

**Design Rule:** Use logical properties (start/end) instead of physical (left/right).

---

### 3. Character Sets

| Script | Languages | Considerations |
|--------|-----------|----------------|
| Latin | English, Spanish, French, German | Base support |
| Cyrillic | Russian, Ukrainian, Bulgarian | Different letterforms |
| CJK | Chinese, Japanese, Korean | Need CJK-optimized fonts |
| Arabic | Arabic, Persian, Urdu | Connected script, RTL |
| Devanagari | Hindi, Sanskrit | Complex rendering |

**Design Rule:** Choose fonts with broad character support.

---

## Layout Guidelines

### Flexible Containers

```
BAD: Fixed width container
┌────────────────────────┐
│ Submit                 │   ← Button truncates "Soumettre" (French)
└────────────────────────┘

GOOD: Flexible container
┌────────────────────────────────────┐
│ Submit / Soumettre / Einreichen   │   ← Button expands
└────────────────────────────────────┘
```

### CSS Best Practices

```css
/* BAD - Fixed width */
.button {
  width: 120px;
}

/* GOOD - Flexible with min/max */
.button {
  min-width: 80px;
  max-width: 300px;
  width: fit-content;
  padding: 0 24px; /* Horizontal padding for breathing room */
}
```

---

### Logical Properties (RTL Support)

```css
/* BAD - Physical properties */
.sidebar {
  margin-left: 20px;
  padding-right: 16px;
  text-align: left;
  border-left: 1px solid #ccc;
}

/* GOOD - Logical properties */
.sidebar {
  margin-inline-start: 20px;
  padding-inline-end: 16px;
  text-align: start;
  border-inline-start: 1px solid #ccc;
}
```

### Logical Property Reference

| Physical | Logical |
|----------|---------|
| `left` | `inline-start` |
| `right` | `inline-end` |
| `top` | `block-start` |
| `bottom` | `block-end` |
| `margin-left` | `margin-inline-start` |
| `padding-right` | `padding-inline-end` |
| `text-align: left` | `text-align: start` |
| `float: left` | `float: inline-start` |

---

## Typography for i18n

### Font Selection

```
REQUIRED FONT FEATURES:

1. LATIN EXTENDED
   - Covers Western European languages
   - Includes accented characters (é, ñ, ü, ø)

2. CYRILLIC (if needed)
   - Russian, Ukrainian, Bulgarian, etc.
   - Different glyph shapes

3. CJK SUPPORT (if needed)
   - Chinese, Japanese, Korean
   - Use dedicated CJK font stack

4. ARABIC (if needed)
   - Connected script support
   - RTL rendering
```

### Font Stack Example

```css
/* Universal font stack */
--font-family-sans:
  "Inter",                    /* Primary */
  -apple-system,              /* Apple fallback */
  "Segoe UI",                 /* Windows fallback */
  "Noto Sans",                /* Google universal */
  "Helvetica Neue",           /* Legacy fallback */
  sans-serif;

/* CJK additions */
--font-family-cjk:
  "Inter",
  "Noto Sans CJK SC",         /* Simplified Chinese */
  "Noto Sans CJK JP",         /* Japanese */
  "Noto Sans CJK KR",         /* Korean */
  sans-serif;

/* Arabic additions */
--font-family-arabic:
  "Noto Sans Arabic",
  "Inter",
  sans-serif;
```

---

### Line Height Considerations

| Script | Recommended Line Height |
|--------|------------------------|
| Latin | 1.4 - 1.6 |
| CJK | 1.6 - 1.8 (taller characters) |
| Arabic | 1.6 - 1.8 (diacritics) |
| Devanagari | 1.8 - 2.0 (complex stacking) |

---

## Number and Date Formatting

### Numbers

| Locale | Number Format | Example |
|--------|---------------|---------|
| US (en-US) | 1,234.56 | comma thousand, period decimal |
| Germany (de-DE) | 1.234,56 | period thousand, comma decimal |
| France (fr-FR) | 1 234,56 | space thousand, comma decimal |
| India (en-IN) | 1,23,456.78 | lakh/crore grouping |

**Design Rule:** Use locale-aware number formatting. Never hardcode formats.

---

### Dates

| Locale | Date Format | Example |
|--------|-------------|---------|
| US (en-US) | MM/DD/YYYY | 12/31/2024 |
| UK (en-GB) | DD/MM/YYYY | 31/12/2024 |
| Germany (de-DE) | DD.MM.YYYY | 31.12.2024 |
| Japan (ja-JP) | YYYY/MM/DD | 2024/12/31 |
| ISO 8601 | YYYY-MM-DD | 2024-12-31 |

**Design Rule:** Use relative dates when possible ("3 days ago", "Yesterday").

---

### Currency

| Locale | Format | Example |
|--------|--------|---------|
| US (en-US) | $1,234.56 | Symbol before |
| Germany (de-DE) | 1.234,56 € | Symbol after with space |
| Japan (ja-JP) | ¥1,234 | No decimals |

**Design Rule:** Use locale-aware currency formatting. Show currency code for international contexts (USD, EUR).

---

## Icons and Images

### Directional Icons

```
RTL MIRRORING REQUIRED:
→ Arrow pointing right (forward)
← Arrow pointing left (back)
◀ Navigation chevrons
↩ Reply/return icons
📋 List icons with indentation
📁 Folder icons (opening direction)

RTL MIRRORING NOT REQUIRED:
✓ Checkmarks
✕ Close/X marks
🔍 Search icons
⏱ Time/clock icons
▶ Play/pause (media standard)
📞 Phone icons
✉ Email icons
```

### Visual Example

```
LTR Layout:                         RTL Layout:
┌──────────────────────────┐       ┌──────────────────────────┐
│ ← Back    Title    ⋮ │       │ ⋮    Title    Back → │
├──────────────────────────┤       ├──────────────────────────┤
│ • Item 1                 │       │                 Item 1 • │
│ • Item 2                 │       │                 Item 2 • │
│ • Item 3                 │       │                 Item 3 • │
├──────────────────────────┤       ├──────────────────────────┤
│ [Cancel]        [Save →] │       │ [← Save]        [Cancel] │
└──────────────────────────┘       └──────────────────────────┘
```

---

### Images with Text

```
AVOID:
- Images with embedded text (cannot be translated)
- Screenshots in documentation (must be localized)
- Memes or culture-specific references

PREFER:
- Text as overlay (can be replaced)
- Icons with labels (labels translate)
- Abstract/universal imagery
```

---

## Content Guidelines

### String Externalization

```
BAD - Hardcoded strings:
<button>Save Changes</button>

GOOD - Externalized strings:
<button>{t('button.saveChanges')}</button>
```

### Avoid String Concatenation

```
BAD - Concatenation breaks translation:
"You have " + count + " new messages"
// German: "Sie haben 5 neue Nachrichten" (different word order)

GOOD - Use placeholders:
t('messages.count', { count: 5 })
// "You have {count} new messages"
// "Sie haben {count} neue Nachrichten"
```

### Pluralization

```
BAD - Binary plural:
count === 1 ? "1 item" : count + " items"

GOOD - Full plural rules:
t('items.count', { count })
// English: "1 item" / "2 items"
// Russian: "1 элемент" / "2 элемента" / "5 элементов" (3 forms)
// Arabic: 6 plural forms
```

---

## Form Design for i18n

### Input Fields

```
CONSIDERATIONS:

1. NAME FIELDS
   - Don't assume first/last name structure
   - Some cultures: [Family name] [Given name]
   - Some names have single component
   - Provide single "Full Name" field when possible

2. ADDRESS FIELDS
   - Format varies dramatically by country
   - Use country-specific address components
   - Postal code length varies (US: 5/9, UK: 6-7, etc.)

3. PHONE NUMBERS
   - Always include country code selector
   - Format varies by country
   - Don't assume 10-digit format

4. DATE INPUTS
   - Use native date picker (locale-aware)
   - Show format hint if text input
   - Consider calendar differences (Gregorian, Hijri, etc.)
```

### Form Layout

```
VERTICAL LAYOUT (Recommended for i18n):
┌────────────────────────────────┐
│ Label                          │
│ ┌────────────────────────────┐ │
│ │ Input                      │ │
│ └────────────────────────────┘ │
│ Helper text                    │
└────────────────────────────────┘

← Labels above inputs work for all text directions

HORIZONTAL LAYOUT (Problematic):
┌────────────────────────────────┐
│ Label: │ Input                 │
└────────────────────────────────┘

← Labels beside inputs break with long translations
```

---

## Testing Checklist

### Pseudo-Localization Test

Before actual translation, test with pseudo-localization:

```
Original: "Save Changes"
Pseudo:   "[Śåvé Çhåñgéś !!!]"

Purpose:
- Brackets reveal hardcoded strings
- Accents test character support
- Extra characters test text expansion
- Reveals concatenation issues
```

### RTL Testing

```
RTL TESTING CHECKLIST:

[ ] Layout mirrors correctly
[ ] Text alignment is correct
[ ] Icons that should mirror do mirror
[ ] Icons that shouldn't mirror don't
[ ] Forms work correctly
[ ] Navigation works correctly
[ ] Modals/dropdowns position correctly
[ ] Scroll direction is correct
[ ] Charts/graphs display correctly
```

### Translation Testing

```
TRANSLATION TESTING:

[ ] No truncated text
[ ] No broken layouts
[ ] Dates/numbers format correctly
[ ] Currency displays correctly
[ ] Plurals work in target languages
[ ] No untranslated strings
[ ] Context is clear to translators
```

---

## Implementation Recommendations

### React + react-i18next

```jsx
// Setup
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <button>{t('button.save')}</button>
  );
}

// With interpolation
t('welcome.message', { name: 'John' })
// "Welcome, {name}!" → "Welcome, John!"

// With pluralization
t('items.count', { count: 5 })
// count=1: "1 item"
// count=5: "5 items"
```

### Translation File Structure

```json
// en.json
{
  "button": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "form": {
    "email": {
      "label": "Email Address",
      "placeholder": "you@example.com",
      "error": "Please enter a valid email"
    }
  },
  "messages": {
    "welcome": "Welcome, {{name}}!",
    "items": "{{count}} item",
    "items_plural": "{{count}} items"
  }
}
```

---

## Anti-Patterns (Disallowed)

```
DO NOT:

❌ Hardcode text in components
❌ Concatenate strings for sentences
❌ Use left/right instead of start/end
❌ Assume text length
❌ Embed text in images
❌ Assume name format (first/last)
❌ Hardcode date/number formats
❌ Forget RTL testing
❌ Ignore plural forms
❌ Use fixed-width containers for text
```

---

## Mode-Specific Guidelines

### MODE_SAAS
- Full i18n from start (harder to add later)
- Consider top 5-10 markets
- Locale-aware formatting
- Cultural considerations in imagery

### MODE_INTERNAL
- May be single language
- Still use externalized strings (easier to update)
- Date/number formatting still matters

### MODE_AGENTIC
- Status messages need translation
- Error messages need translation
- Logs may stay in English (technical)
- User-facing content must translate

---

## Minimum i18n Checklist

Before shipping any product:

- [ ] All strings externalized
- [ ] Flexible containers for text
- [ ] Logical CSS properties used
- [ ] Font supports target languages
- [ ] Dates/numbers locale-formatted
- [ ] No hardcoded formats
- [ ] RTL considered in layout
- [ ] Pseudo-localization tested
- [ ] Form fields work internationally

---

## END OF INTERNATIONALIZATION PATTERN
