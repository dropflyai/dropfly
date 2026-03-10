# End-to-End Localization Workflow Pattern

A comprehensive pattern for the complete localization lifecycle: from source content extraction through TMS integration, translator handoff, linguistic QA, and deployment of localized assets. This pattern covers both continuous localization (agile) and batch localization (waterfall) models.

---

## When to Use This Pattern

- You are establishing a localization workflow for a product or project for the first time
- You are migrating from a manual (spreadsheet-based) localization process to a TMS-driven workflow
- You are scaling localization from a few locales to many and need a repeatable, automated pipeline
- You are integrating localization into a CI/CD-driven development process

---

## Prerequisites

- [ ] i18n implementation is complete (see `Patterns/i18n_implementation_pattern.md`)
- [ ] Source strings are externalized in a supported file format (JSON, XLIFF, PO, ARB)
- [ ] A Translation Management System (TMS) has been selected (see `04_technology/l10n_tooling.md`)
- [ ] Target locales and priority tiers have been defined (see `06_strategy/l10n_strategy.md`)
- [ ] Budget for translation, review, and testing has been allocated

---

## Phase 1: Content Extraction and Preparation

**Goal:** Extract source content from the codebase and prepare it for translation.

### Step 1.1 — Source String Export

Extract resource bundles from the codebase into the format accepted by your TMS:

| Source Format | Common TMS Import Format | Notes |
|--------------|------------------------|-------|
| React (JSON) | JSON, XLIFF 2.0 | FormatJS uses ICU in JSON |
| Angular | XLIFF 1.2 / 2.0 | Native Angular extract CLI |
| iOS (.strings) | XLIFF, .strings | Xcode export |
| Android (.xml) | XLIFF, Android XML | Built-in resource export |
| Flutter (.arb) | ARB, XLIFF | `intl_utils` package |
| Gettext (.po) | PO, XLIFF | Standard GNU toolchain |

### Step 1.2 — Source Content Audit

Before sending content for translation, audit for translatability issues:

- **Context completeness:** Every string has a developer comment explaining where/how it appears
- **Character limits:** Maximum display lengths are documented (critical for UI labels, buttons, push notifications)
- **Variable documentation:** Every `{variable}` is explained (data type, example value, range)
- **Screenshot references:** Key strings include screenshot URLs showing the string in context
- **Terminology consistency:** Source language uses consistent terminology (run a terminology check against the glossary)

### Step 1.3 — Content Categorization

Classify content by translation urgency and complexity:

| Category | Examples | Translation Approach |
|----------|---------|---------------------|
| UI Strings | Buttons, labels, menus | Human translation with TM leverage |
| Marketing Copy | Landing pages, taglines | Transcreation (creative adaptation) |
| Legal Content | Terms of service, privacy policy | Certified/sworn translation |
| Help/Support | Knowledge base, FAQs | Human translation or MTPE |
| User-Generated | Reviews, comments | Machine translation (if needed) |
| Metadata | SEO titles, descriptions | Localized keyword research + translation |

---

## Phase 2: TMS Configuration and Integration

**Goal:** Connect the source codebase to the TMS with automated sync.

### Step 2.1 — Repository Integration

Configure the TMS to pull source files directly from the code repository:

1. **Connect the repo:** Grant TMS read/write access to the locale directory
2. **Map source files:** Tell the TMS which files contain translatable content
3. **Configure sync direction:** Source language pushes to TMS; translated files pull back to repo
4. **Set branch strategy:** Translate from `main` or a dedicated `l10n-sync` branch
5. **Configure webhook triggers:** New commits with changed source strings trigger TMS import

### Step 2.2 — Translation Memory (TM) Setup

1. Import any existing translations as a TM seed
2. Configure TM matching thresholds:
   - **100% match:** Exact same string, auto-populate (no translator review needed)
   - **101% match (ICE/guaranteed):** Same string + same context, auto-confirm
   - **Fuzzy match (75-99%):** Similar string, pre-populate but require translator review
   - **No match (<75%):** New translation required
3. Set up TM sharing across projects if applicable (shared product suite)

### Step 2.3 — Terminology Management (Term Base)

1. Export product glossary from `00_readme/glossary.md` to the TMS term base
2. Configure term base enforcement:
   - **Mandatory terms:** Must be translated exactly as specified (brand names, product features)
   - **Suggested terms:** Preferred translation but translator may adapt
   - **Forbidden terms:** Terms that must never be used (competitor names, deprecated features)
3. Set up automatic term highlighting in the translation editor

### Step 2.4 — Machine Translation Configuration

1. Select MT engine per language pair (Google Cloud Translation, DeepL, Amazon Translate, Microsoft Translator)
2. Configure MT as a pre-translation step for new content (fills gaps where TM has no match)
3. Ensure all MT output is routed through human post-editing (MTPE) -- never publish raw MT
4. Track MT quality scores per language pair to optimize engine selection over time

---

## Phase 3: Translation Workflow Design

**Goal:** Define the workflow that content follows from source to published translation.

### Step 3.1 — Standard Workflow (Two-Step)

```
Source String -> Translator -> Reviewer -> Published
```

- **Translator:** Produces the initial translation (may leverage TM, MT, and term base)
- **Reviewer:** A second linguist reviews for accuracy, fluency, and adherence to style guide
- **Published:** Reviewed translation is marked as final and synced back to the codebase

### Step 3.2 — Enhanced Workflow (Three-Step for Critical Content)

```
Source String -> Translator -> Reviewer -> In-Country Reviewer -> Published
```

Add an in-country reviewer for:
- Marketing and brand content (transcreation quality check)
- Legal content (jurisdiction-specific compliance)
- Content for new markets where brand voice is still being established

### Step 3.3 — Continuous Localization Workflow (Agile)

For teams shipping frequently (daily/weekly):

```
Developer commits new strings
    -> Webhook triggers TMS import
    -> TM auto-populates known translations
    -> MT pre-translates remaining strings
    -> Translators review and finalize
    -> TMS pushes translated files back to repo via PR
    -> CI builds and deploys localized application
```

**Turnaround targets for continuous localization:**

| Content Volume | Target Turnaround |
|---------------|-------------------|
| < 50 strings | 24 hours |
| 50-200 strings | 48 hours |
| 200-500 strings | 3-5 business days |
| 500+ strings (release) | 5-10 business days |

### Step 3.4 — Batch Localization Workflow (Waterfall)

For scheduled releases:

1. **String freeze date:** All source strings finalized (no changes after this date)
2. **Handoff to translators:** Full content package sent to TMS/LSP
3. **Translation phase:** Translators work on the full batch
4. **Review phase:** Second linguist reviews all translations
5. **Integration:** Translated files merged into the release branch
6. **L10n QA:** Functional and linguistic testing in localized builds
7. **Release:** All locales ship together

---

## Phase 4: Translator Handoff and Management

**Goal:** Provide translators with everything they need to produce high-quality translations efficiently.

### Step 4.1 — Localization Kit Contents

Every translation handoff must include (see `Templates/localization_kit_template.md`):

1. Source files in the correct format
2. Style guide for each target language
3. Glossary / term base
4. Context information (screenshots, comments, character limits)
5. Reference translations (previous versions, if updating)
6. Deadline and priority level
7. Point of contact for translation queries

### Step 4.2 — Query Management

Establish a process for translator questions:

1. Translators submit queries through the TMS query system (not email)
2. Queries are routed to the localization manager or product owner
3. Target response time: 4 business hours for blocking queries, 24 hours for non-blocking
4. Answers are documented in the TMS for future reference (institutional knowledge)

### Step 4.3 — Translator Feedback Loop

After each project:

1. Collect translator feedback on source quality, context adequacy, and tooling
2. Track common query types to identify systemic source quality issues
3. Update style guides, glossaries, and context based on feedback
4. Recognize high-performing translators and build long-term relationships

---

## Phase 5: Localization Quality Assurance

**Goal:** Validate translated content for linguistic quality, functional correctness, and visual presentation.

### Step 5.1 — Automated QA Checks

Run automated checks before human review:

- **Placeholder validation:** All `{variables}` from the source exist in the translation
- **Tag integrity:** HTML/XML tags are preserved and properly nested
- **Number and date consistency:** Numbers and dates match source format expectations
- **Terminology compliance:** Mandatory terms are translated correctly
- **Length check:** Translations do not exceed character limits
- **Punctuation and spacing:** Leading/trailing spaces, double spaces, missing punctuation
- **Untranslated content:** Flag strings left in the source language

### Step 5.2 — Linguistic QA (Human Review)

Apply MQM (Multidimensional Quality Metrics) error typology:

| Error Category | Severity Levels |
|---------------|----------------|
| Accuracy (mistranslation, omission, addition) | Critical, Major, Minor |
| Fluency (grammar, spelling, style) | Critical, Major, Minor |
| Terminology (wrong term, inconsistent term) | Critical, Major, Minor |
| Locale convention (date, number, currency format) | Critical, Major, Minor |
| Style (register, tone, brand voice) | Major, Minor |

**Quality thresholds:**
- Zero critical errors
- Fewer than 2 major errors per 1,000 words
- Fewer than 5 minor errors per 1,000 words

### Step 5.3 — Functional L10n Testing

Test the localized application in-context:

- Text renders correctly (no truncation, overflow, or encoding issues)
- Layout accommodates text expansion (German can be 30-40% longer than English)
- RTL layouts mirror correctly
- Date, number, and currency formatting is locale-appropriate
- Locale switching works correctly (no cached strings from previous locale)
- Deep links and URLs with locale prefixes resolve correctly
- Search and sort work correctly with locale-specific collation

### Step 5.4 — Visual / Cosmetic Review

Screenshot-based review of every localized screen:

- Text fits within UI containers
- No overlapping text or cut-off characters
- Font rendering is correct for the script (CJK, Arabic, Devanagari)
- Images with embedded text are localized
- Icons with cultural connotations are reviewed

---

## Phase 6: Deployment and Monitoring

**Goal:** Ship localized content and monitor quality in production.

### Step 6.1 — Deployment Strategy

| Strategy | Description | Use When |
|----------|-------------|----------|
| Simultaneous launch | All locales ship at the same time | Batch release model, regulatory requirement |
| Rolling launch | Locales ship as they become ready | Continuous model, staggered market entry |
| Feature-flagged | Localized content behind feature flags per locale | Gradual rollout, A/B testing localized content |

### Step 6.2 — Post-Launch Monitoring

- **User feedback channels:** In-app feedback, support tickets flagged with locale
- **Error monitoring:** Track locale-specific errors (encoding issues, missing translations)
- **Analytics by locale:** Bounce rate, conversion rate, task completion rate per locale
- **Search query analysis:** What are users searching for in each locale? (reveals content gaps)

### Step 6.3 — Continuous Improvement Cycle

1. Aggregate post-launch feedback by locale and error category
2. Prioritize fixes by severity and user impact
3. Feed corrections back through the TMS (update TM for future projects)
4. Conduct quarterly retrospectives on the localization workflow
5. Update this pattern with lessons learned

---

## Completion Checklist

- [ ] Source strings are exported in the correct format for the TMS
- [ ] Source content audit completed (context, character limits, variables documented)
- [ ] TMS is configured with repo integration, TM, term base, and MT
- [ ] Translation workflow is defined (standard, enhanced, or continuous)
- [ ] Localization kit is prepared for translators
- [ ] Query management process is established
- [ ] Automated QA checks are configured in the TMS
- [ ] Linguistic QA process follows MQM error typology
- [ ] Functional and visual l10n testing is planned and executed
- [ ] Deployment strategy is selected and configured
- [ ] Post-launch monitoring is active

---

## Related Modules

- `03_localization/translation_management.md` — TMS operations doctrine
- `03_localization/translation_quality.md` — MQM quality framework details
- `04_technology/l10n_automation.md` — CI/CD integration for l10n
- `Templates/localization_kit_template.md` — Localization kit for handoff
- `Templates/translation_brief_template.md` — Translation brief for linguists
- `Templates/l10n_qa_checklist_template.md` — QA checklist

---

**This pattern is a living document. Update it as workflow improvements are discovered.**
