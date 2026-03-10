# Localization Kit Template

A localization kit is the complete package of materials provided to
translators and vendors to enable high-quality localization. It serves
as the single source of truth for all localization context, requirements,
and constraints. This template should be completed for each product
or major feature before translation begins.

---

## 1. PROJECT OVERVIEW

### Product Information

| Field | Value |
|-------|-------|
| Product Name | [Product name] |
| Product Version | [X.X.X] |
| Product URL | [URL to product or staging environment] |
| Product Description | [1-2 sentence description of the product] |
| Target Audience | [Description of end users] |
| Industry/Domain | [e.g., SaaS, e-commerce, healthcare, fintech] |

### Localization Scope

| Field | Value |
|-------|-------|
| Source Language | [e.g., English (en-US)] |
| Target Languages | [e.g., de-DE, fr-FR, ja-JP, es-ES, pt-BR] |
| Content Types | [UI strings, marketing, documentation, legal] |
| Total Word Count | [Estimated word count] |
| New Words (no TM match) | [Estimated new words] |
| Deadline | [Date] |
| Priority | [Critical / High / Medium / Low] |

---

## 2. FILE INFORMATION

### Source Files

| File | Format | Word Count | Content Type | Notes |
|------|--------|-----------|-------------|-------|
| [path/to/en.json] | JSON | [N] | UI strings | [Notes] |
| [path/to/marketing.xliff] | XLIFF | [N] | Marketing | [Notes] |
| [path/to/help/] | Markdown | [N] | Documentation | [Notes] |

### File Format Details

| Parameter | Value |
|-----------|-------|
| Encoding | UTF-8 |
| File format | [JSON / XLIFF / PO / YAML / Strings] |
| Placeholder format | [ICU: {name} / Printf: %s / Positional: %1$s] |
| Plural format | [ICU MessageFormat / i18next suffixes / gettext] |
| Key naming convention | [dot.notation / snake_case / camelCase] |
| Nesting | [Flat / Nested / Namespace-based] |

---

## 3. TERMINOLOGY AND GLOSSARY

### Product Glossary

| Source Term (EN) | Definition | Context | Do Not Translate |
|-----------------|-----------|---------|-----------------|
| [Term 1] | [Definition] | [Where it appears] | [Yes/No] |
| [Term 2] | [Definition] | [Where it appears] | [Yes/No] |
| [Term 3] | [Definition] | [Where it appears] | [Yes/No] |

### Do-Not-Translate List

| Term | Reason |
|------|--------|
| [Brand name] | Brand identity |
| [Product name] | Product identity |
| [Technical term] | Industry standard |
| [API endpoint] | Technical reference |

### Glossary File Location

| Format | Location |
|--------|----------|
| TMS glossary | [Link to TMS project glossary] |
| Spreadsheet | [Link to Google Sheet / Excel] |
| TBX file | [Path to TBX file] |

---

## 4. STYLE GUIDE

### Tone and Voice

| Dimension | Guideline | Example |
|-----------|-----------|---------|
| Formality | [Formal / Semi-formal / Informal / Per-locale] | [Example] |
| Tone | [Friendly / Professional / Technical / Playful] | [Example] |
| Person | [First person (we) / Second person (you) / Third person] | [Example] |
| Gender | [Gender-neutral preferred / Per-locale convention] | [Example] |

### Per-Locale Style Notes

| Locale | Formality | Address Form | Special Notes |
|--------|-----------|-------------|---------------|
| de-DE | [Formal] | [Sie (formal you)] | [German tends to be more formal in B2B] |
| fr-FR | [Semi-formal] | [Vous (formal you)] | [Use inclusive writing if required] |
| ja-JP | [Formal] | [Desu/masu form] | [Keigo levels matter] |
| es-ES | [Informal] | [Tu (informal you)] | [Differs from es-419 (Latin America)] |
| pt-BR | [Semi-formal] | [Voce] | [Differs from pt-PT significantly] |

### Formatting Conventions

| Element | Convention |
|---------|-----------|
| Brand name capitalization | [Always capitalize: "DropFly"] |
| Feature name capitalization | [Title case: "Quick Search"] |
| Button text | [Sentence case or Title Case per locale] |
| Acronyms | [Spell out first use, then abbreviation] |
| Numbers | [Use locale-appropriate formatting] |
| Dates | [Use locale-appropriate formatting] |
| Currency | [Display in user's local currency] |

---

## 5. CONTEXT AND SCREENSHOTS

### Screenshot Access

| Resource | Location |
|----------|----------|
| Screenshot folder | [Link to Figma / folder / TMS screenshots] |
| Live product | [URL to staging environment with test credentials] |
| Video walkthrough | [Link to product walkthrough video] |

### Test Account Credentials

| Environment | URL | Username | Password |
|------------|-----|----------|----------|
| Staging | [URL] | [username] | [password] |
| Production (read-only) | [URL] | [username] | [password] |

### Key Screens with Context

| Screen | Screenshot | Key Strings | Notes |
|--------|-----------|-------------|-------|
| Login | [link] | auth.login.* | [Context notes] |
| Dashboard | [link] | dashboard.* | [Context notes] |
| Settings | [link] | settings.* | [Context notes] |
| Checkout | [link] | checkout.* | [Context notes] |

---

## 6. TECHNICAL CONSTRAINTS

### Character Limits

| String Key | Max Characters | UI Element | Notes |
|-----------|---------------|-----------|-------|
| [nav.home] | [15] | [Tab label] | [No truncation] |
| [btn.save] | [20] | [Button] | [Must fit button width] |
| [toast.success] | [80] | [Toast notification] | [Single line] |

### Placeholder Descriptions

| Placeholder | Description | Example Value | Type |
|------------|-------------|--------------|------|
| {name} | User's display name | "John Smith" | String |
| {count} | Number of items | 42 | Integer |
| {date} | Formatted date | "Feb 3, 2026" | Locale-formatted date |
| {amount} | Monetary amount | "$12.99" | Locale-formatted currency |

### Plural Forms Required

| Locale | Required Categories | Example |
|--------|-------------------|---------|
| en | one, other | 1 item / 2 items |
| de | one, other | 1 Element / 2 Elemente |
| fr | one, other | 1 element / 2 elements |
| ar | zero, one, two, few, many, other | Full 6-form Arabic |
| ja | other | (no plural distinction) |
| pl | one, few, many, other | 4-form Polish |
| ru | one, few, many, other | 4-form Russian |

---

## 7. WORKFLOW AND TIMELINE

### Translation Workflow

| Step | Responsible | Deadline | Notes |
|------|-------------|----------|-------|
| Source files delivered | [Dev team] | [Date] | [Via TMS push / file upload] |
| Translation | [Translator] | [Date] | [TMS project link] |
| Review | [Reviewer] | [Date] | [In-context review preferred] |
| QA validation | [QA / automated] | [Date] | [Automated pipeline] |
| Delivery | [L10n PM] | [Date] | [TMS pull / PR] |
| Integration testing | [Dev team] | [Date] | [Staging deployment] |

### Communication

| Channel | Purpose | Participants |
|---------|---------|-------------|
| [Slack #l10n-project] | Day-to-day questions | All |
| [Email: l10n@company.com] | Formal communications | PM + vendor |
| [TMS comments] | String-level questions | Translator + reviewer |
| [Weekly sync] | Status and blocker review | PM + leads |

---

## 8. QUALITY REQUIREMENTS

### Quality Standard

| Dimension | Requirement |
|-----------|-------------|
| Quality framework | MQM (Multidimensional Quality Metrics) |
| Pass threshold | <5 penalty points per 1000 words |
| Critical errors | Zero tolerance |
| Glossary compliance | 100% for mandatory terms |
| Completeness | 100% for Tier 1 locales |

### QA Checks

| Check | Automated | Manual | Required |
|-------|-----------|--------|----------|
| Completeness | Yes | — | Yes |
| Placeholder validation | Yes | — | Yes |
| Tag consistency | Yes | — | Yes |
| Glossary compliance | Yes | Spot check | Yes |
| Length limits | Yes | — | Yes |
| Linguistic accuracy | — | Yes (sample) | Yes |
| In-context review | — | Yes | Yes (Tier 1) |
| Visual regression | Yes | Spot check | Recommended |

---

## 9. REFERENCE MATERIALS

| Material | Location | Notes |
|----------|----------|-------|
| Previous translations (TM) | [TMS project / TMX file] | [Leverage for consistency] |
| Competitor translations | [Screenshots / links] | [For reference, not copying] |
| Industry glossary | [Link] | [Standard terms in domain] |
| Brand guidelines | [Link] | [Voice, tone, visual identity] |
| Style guide (full) | [Link] | [Per-locale style guides] |

---

## 10. CONTACTS

| Role | Name | Email | Notes |
|------|------|-------|-------|
| L10n Program Manager | [Name] | [Email] | Primary contact |
| Product Manager | [Name] | [Email] | Content questions |
| Engineering Lead | [Name] | [Email] | Technical questions |
| Reviewer (per locale) | [Name] | [Email] | Quality review |
| Legal Contact | [Name] | [Email] | Legal content questions |

---

**A complete localization kit reduces translator questions by 80%,
improves first-pass quality by 30%, and eliminates the majority of
context-related errors. The 2-4 hours spent assembling this kit saves
days of back-and-forth during translation.**
