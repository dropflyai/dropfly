# Internationalization (i18n) Implementation Pattern

A comprehensive, code-level pattern for engineering internationalization into software applications from the ground up. This pattern covers string externalization, ICU MessageFormat adoption, pluralization, date/number/currency formatting, RTL support, and locale fallback architecture.

---

## When to Use This Pattern

- You are building a new application that will support multiple locales
- You are retrofitting an existing application with i18n support
- You are migrating from a naive string-replacement system to a standards-based i18n framework
- You need to add RTL (right-to-left) language support to an existing LTR application

---

## Prerequisites

Before starting this pattern, ensure:

- [ ] Target locales have been identified (consult `06_strategy/l10n_strategy.md`)
- [ ] The tech stack has been finalized (framework, rendering engine, deployment model)
- [ ] A TMS (Translation Management System) has been selected or is under evaluation
- [ ] Engineering team understands the difference between i18n (engineering) and l10n (content)

---

## Phase 1: String Externalization

**Goal:** Remove all hardcoded user-facing strings from source code and move them into locale resource bundles.

### Step 1.1 — Audit Hardcoded Strings

Scan the entire codebase for hardcoded strings. Common hiding places include:

- UI component files (JSX, Vue templates, HTML)
- Error messages and validation messages
- Notification and toast messages
- Email templates and transactional content
- PDF and report generation code
- Database seed files and fixtures
- Alt text, aria-labels, and accessibility strings
- Placeholder text, tooltips, and help text

Use static analysis tools or linting rules (e.g., `eslint-plugin-i18next` for React, `vue-i18n-extract` for Vue) to surface hardcoded strings automatically.

### Step 1.2 — Establish Resource Bundle Structure

Organize locale files using a clear, maintainable structure:

```
locales/
  en/
    common.json         # Shared strings (buttons, labels, navigation)
    auth.json           # Authentication flows
    dashboard.json      # Dashboard-specific strings
    errors.json         # Error messages
    notifications.json  # Notification templates
  es/
    common.json
    auth.json
    ...
```

**Key decisions:**
- **Flat vs. nested keys:** Nested keys (`dashboard.header.title`) improve organization but increase key length. Flat keys (`dashboard_header_title`) are simpler but harder to manage at scale. Prefer nested for applications with 500+ strings.
- **Namespace granularity:** One file per feature area. Avoid a single monolithic file.
- **Key naming convention:** Use descriptive, context-rich keys. `button.submit_order` is better than `btn1`. Never use the source text as the key.

### Step 1.3 — Extract Strings Iteratively

Extract strings module by module, not all at once. For each module:

1. Identify all user-facing strings
2. Create semantically meaningful keys
3. Add translator context comments (max string length, variable descriptions, screenshots)
4. Replace hardcoded strings with i18n function calls
5. Verify rendering with pseudo-localization (Phase 5)

### Anti-Patterns to Avoid

- **String concatenation for sentences:** `t('hello') + ' ' + name + ', ' + t('welcome')` breaks in languages with different word order. Use ICU MessageFormat instead.
- **Reusing strings across contexts:** "Save" as a button label and "Save" as a noun have different translations in many languages. Create separate keys with context.
- **Embedding HTML in strings:** `t('click <a href="...">here</a>')` makes translation dangerous. Use interpolation components.
- **Splitting sentences across multiple keys:** Translators need full sentence context.

---

## Phase 2: ICU MessageFormat Adoption

**Goal:** Use ICU MessageFormat for all strings that contain variables, plurals, or select logic.

### Step 2.1 — Simple Variable Interpolation

```
# Bad: concatenation
"Hello, " + userName

# Good: ICU MessageFormat
"Hello, {userName}"
```

### Step 2.2 — Pluralization Rules

ICU plural categories: `zero`, `one`, `two`, `few`, `many`, `other`. Different languages use different subsets.

```
"{count, plural,
  =0 {No items in your cart}
  one {# item in your cart}
  other {# items in your cart}
}"
```

**Critical:** English only uses `one` and `other`, but Arabic uses all six categories. Russian uses `one`, `few`, `many`, and `other`. Always implement the full plural system, not just singular/plural branching.

### Step 2.3 — Select (Gender and Category)

```
"{gender, select,
  male {He liked your post}
  female {She liked your post}
  other {They liked your post}
}"
```

### Step 2.4 — Nested Messages

Combine plural and select for complex messages:

```
"{gender, select,
  male {{count, plural,
    one {He has # new message}
    other {He has # new messages}
  }}
  female {{count, plural,
    one {She has # new message}
    other {She has # new messages}
  }}
  other {{count, plural,
    one {They have # new message}
    other {They have # new messages}
  }}
}"
```

### ICU Library Selection by Framework

| Framework | Recommended Library | Notes |
|-----------|-------------------|-------|
| React | `react-intl` (FormatJS) | Full ICU support, React-native compatible |
| Vue | `vue-i18n` | ICU support via plugin |
| Angular | Built-in `@angular/localize` | Native ICU support |
| Node.js | `@formatjs/intl` | Server-side formatting |
| iOS | `Foundation` (NSLocalizedString) | Native ICU via `.stringsdict` |
| Android | `android.icu` | Native ICU support |

---

## Phase 3: Date, Number, and Currency Formatting

**Goal:** All date, number, and currency display is locale-aware using the `Intl` API or equivalent.

### Step 3.1 — Date and Time Formatting

Never manually format dates. Use `Intl.DateTimeFormat` or equivalent:

```javascript
new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(date)
// "3. Februar 2026"
```

**Key considerations:**
- Store all dates in UTC; convert to local time at the display layer
- Calendar systems vary: Gregorian, Hijri, Buddhist, Japanese Imperial
- First day of week varies: Sunday (US), Monday (most of Europe), Saturday (Middle East)
- 12-hour vs. 24-hour time is locale-specific

### Step 3.2 — Number Formatting

```javascript
new Intl.NumberFormat('de-DE').format(1234567.89)
// "1.234.567,89" (Germany uses period as thousands separator, comma as decimal)
```

- Decimal separators: period (US/UK), comma (Germany/France/Brazil)
- Thousands separators: comma (US), period (Germany), space (France), lakh grouping (India)
- Percentage formatting varies by locale
- Measurement units: metric vs. imperial (consult CLDR for locale defaults)

### Step 3.3 — Currency Formatting

```javascript
new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY'
}).format(1000)
// "￥1,000" (no decimal places for JPY)
```

- Currency symbol position varies (before, after, with/without space)
- Decimal places are currency-specific (JPY=0, USD=2, BHD=3)
- Never hardcode currency symbols

---

## Phase 4: RTL (Right-to-Left) Support

**Goal:** Full bidirectional text support for Arabic, Hebrew, Persian, Urdu, and other RTL languages.

### Step 4.1 — HTML Direction Attribute

```html
<html dir="rtl" lang="ar">
```

Set `dir` dynamically based on the current locale. Maintain a locale-to-direction map.

### Step 4.2 — CSS Logical Properties

Replace all physical CSS properties with logical equivalents:

| Physical (LTR-only) | Logical (Bidi-safe) |
|---------------------|-------------------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `float: left` | `float: inline-start` |
| `border-left` | `border-inline-start` |
| `left: 10px` | `inset-inline-start: 10px` |

### Step 4.3 — Bidirectional Icons and Images

- Directional icons (arrows, navigation) must be mirrored in RTL
- Non-directional icons (search, settings) must NOT be mirrored
- Progress bars, sliders, and carousels reverse direction in RTL
- Checkmarks and other universal symbols stay the same

### Step 4.4 — Bidirectional Text Isolation

Use Unicode bidi isolation for embedded text that may differ in direction from the surrounding content:

```html
<span dir="auto">User-generated content here</span>
```

Or use `Intl.Segmenter` and `<bdi>` elements to isolate embedded names, numbers, or mixed-direction text.

---

## Phase 5: Pseudo-Localization Testing

**Goal:** Validate i18n readiness before sending content to translators.

### Step 5.1 — Pseudo-Locale Configuration

Create a pseudo-locale (e.g., `en-XA`) that transforms source strings:

- **Character replacement:** Replace ASCII with accented equivalents (`a` -> `a` with accent) to test character rendering
- **String expansion:** Pad strings by 30-50% to simulate longer translations (German, Finnish)
- **Bracket wrapping:** Wrap strings in `[[ ]]` to detect hardcoded strings missed during extraction
- **RTL pseudo-locale:** Create `ar-XB` that reverses character order to test layout mirroring

### Step 5.2 — Automated Pseudo-Loc Checks in CI

Add pseudo-localization to the CI pipeline:

1. Build the application with pseudo-locale
2. Run visual regression tests to catch text overflow, truncation, and layout breaks
3. Fail the build if any string is not wrapped (indicates a hardcoded string)

---

## Phase 6: Locale Detection and Fallback

**Goal:** Determine the user's preferred locale and gracefully fall back when translations are unavailable.

### Locale Detection Order

1. **Explicit user preference** (stored in user profile or cookie)
2. **URL-based locale** (`/en/dashboard`, `?lang=es`, `es.example.com`)
3. **Accept-Language header** (browser/HTTP preference)
4. **GeoIP lookup** (as a hint, never authoritative)
5. **Default locale** (the application's base language)

### Fallback Chain Configuration

```
zh-Hant-TW -> zh-Hant -> zh -> en (default)
pt-BR -> pt -> en (default)
fr-CA -> fr -> en (default)
```

**Rules:**
- Always fall back from specific to general within the same language before jumping to the default
- Never show a partially translated page (mixed languages); fall back the entire resource bundle
- Log fallback events to detect missing translations early

---

## Completion Checklist

- [ ] All user-facing strings are externalized into resource bundles
- [ ] No string concatenation is used to build sentences
- [ ] ICU MessageFormat is used for all parameterized, plural, and select strings
- [ ] All date, number, and currency formatting uses locale-aware APIs
- [ ] CSS uses logical properties exclusively (no physical left/right for layout)
- [ ] RTL layout renders correctly with bidirectional icon mirroring
- [ ] Pseudo-localization passes with no hardcoded strings detected
- [ ] Locale detection and fallback chains are configured and tested
- [ ] CI pipeline includes pseudo-localization and visual regression checks
- [ ] Resource bundle structure is documented for translators and developers

---

## Related Modules

- `02_internationalization/i18n_engineering.md` — Deep i18n engineering doctrine
- `02_internationalization/rtl_support.md` — Comprehensive RTL implementation guide
- `04_technology/file_formats.md` — Resource file format specifications
- `Patterns/localization_workflow_pattern.md` — What happens after i18n: the l10n workflow

---

**This pattern is a living document. Update it as new frameworks, APIs, and best practices emerge.**
