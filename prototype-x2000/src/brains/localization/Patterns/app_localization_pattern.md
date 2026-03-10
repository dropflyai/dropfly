# Pattern: App Localization

## Context

You have an application (web, mobile, or desktop) that needs to support
one or more new locales. The application may or may not have existing
internationalization (i18n) infrastructure. This pattern covers the
end-to-end process from i18n readiness assessment through localized
launch.

---

## When to Use

- First-time localization of an existing application
- Adding a new locale to an already-localized application
- Relaunching localization after a major application rewrite
- Migrating from a legacy i18n system to a modern one

---

## Phase 1: I18N Readiness Assessment

### Objective
Evaluate the application's readiness for localization and identify
all engineering work required before translation can begin.

### Checklist

```
Code Audit:
├── [ ] All user-facing strings externalized to resource files
├── [ ] No hardcoded strings in components/templates
├── [ ] Date/time formatting uses locale-aware APIs (Intl, ICU)
├── [ ] Number formatting uses locale-aware APIs
├── [ ] Currency formatting uses locale-aware APIs
├── [ ] Plural handling uses CLDR-compliant library
├── [ ] No string concatenation for dynamic messages
├── [ ] Images with text have localizable alternatives
├── [ ] Forms handle international input (names, addresses, phone)
├── [ ] Sort/collation uses locale-aware comparison
└── [ ] Error messages are externalized

Layout Audit:
├── [ ] UI accommodates text expansion (30-40% for DE, FR)
├── [ ] No fixed-width containers for text content
├── [ ] CSS uses logical properties (inline-start, not left)
├── [ ] RTL layout support (if Arabic, Hebrew needed)
├── [ ] Font stack supports target scripts (CJK, Cyrillic, Arabic)
└── [ ] Responsive design handles variable text length

Infrastructure Audit:
├── [ ] Locale detection mechanism exists (URL, header, cookie)
├── [ ] Locale switching works without page reload (or gracefully)
├── [ ] Resource files structured for TMS integration
├── [ ] Build system supports multiple locale bundles
└── [ ] Deployment pipeline can deliver locale-specific assets
```

### Output
- I18n readiness score (0-100)
- Engineering backlog of i18n tasks
- Estimated effort for i18n remediation
- Go/no-go decision for proceeding to Phase 2

---

## Phase 2: I18N Engineering

### Objective
Bring the application to i18n-ready state so that translation can
begin without engineering blockers.

### Key Tasks

| Task | Priority | Typical Effort |
|------|----------|---------------|
| String externalization | Critical | 2-5 days per 1000 strings |
| i18n library integration | Critical | 1-3 days |
| Locale detection/routing | Critical | 1-2 days |
| Date/number/currency formatting | High | 1-2 days |
| Plural handling | High | 1-2 days |
| RTL support (if needed) | High | 3-7 days |
| Font loading for new scripts | Medium | 0.5-1 day |
| Image localization pipeline | Medium | 1-2 days |
| Pseudo-localization setup | High | 0.5-1 day |
| CI/CD locale validation | Medium | 1-2 days |

### Pseudo-Localization Gate

Before proceeding to Phase 3, run pseudo-localization to verify:
- All strings are externalized (no English in pseudo-localized UI)
- UI handles text expansion without breaking
- RTL layout works correctly (if applicable)
- No hardcoded formats (dates, numbers, currencies)

---

## Phase 3: Translation Setup

### Objective
Establish the translation infrastructure and begin translation work.

### TMS Configuration

```
TMS Setup:
├── [ ] TMS account created and configured
├── [ ] Project created with source and target locales
├── [ ] Source files uploaded / Git integration configured
├── [ ] Translation Memory (TM) initialized
├── [ ] Glossary/termbase created with key terms
├── [ ] Style guide per target locale created
├── [ ] Translators assigned and onboarded
├── [ ] Workflow configured (translate → review → approve)
├── [ ] Webhook/CI integration for automated push/pull
└── [ ] QA checks configured in TMS
```

### Translation Prioritization

```
Priority 1: Core user flows
├── Sign-up / Login
├── Onboarding
├── Main workflow (the primary thing users do)
├── Billing / Payment
└── Critical error messages

Priority 2: Supporting flows
├── Settings / Profile
├── Navigation / Menus
├── Secondary features
└── Non-critical notifications

Priority 3: Peripheral content
├── Help text / Tooltips
├── Admin screens
├── Edge case messages
└── Rarely-seen UI
```

---

## Phase 4: Quality Assurance

### Objective
Verify that the localized application works correctly across all
target locales before launch.

### QA Checklist per Locale

```
Linguistic QA:
├── [ ] In-context review of all translated strings
├── [ ] Terminology consistency verified
├── [ ] Tone/register appropriate for market
├── [ ] No untranslated strings visible in UI
└── [ ] Glossary compliance checked

Functional QA:
├── [ ] Locale switching works correctly
├── [ ] All core user flows functional in target locale
├── [ ] Date/time displays correctly per locale
├── [ ] Numbers formatted correctly per locale
├── [ ] Currency formatted correctly per locale
├── [ ] Forms accept locale-appropriate input
├── [ ] Search works with target language characters
└── [ ] Sorting works correctly per locale collation

Visual QA:
├── [ ] No text truncation or overflow
├── [ ] No overlapping elements due to text expansion
├── [ ] RTL layout correct (if applicable)
├── [ ] Images culturally appropriate
├── [ ] Fonts render correctly for target script
└── [ ] Responsive layout works with translated content

Automated QA:
├── [ ] Placeholder validation passes
├── [ ] Completeness check passes (100% for Tier 1)
├── [ ] Length limit validation passes
├── [ ] ICU syntax validation passes
└── [ ] Visual regression tests pass
```

---

## Phase 5: Launch

### Objective
Deploy the localized application and monitor for issues.

### Launch Checklist

```
Pre-Launch:
├── [ ] All QA issues resolved or accepted
├── [ ] Legal content (Privacy, ToS) available in locale
├── [ ] SEO metadata localized
├── [ ] Analytics tracking configured per locale
├── [ ] Support prepared for target language inquiries
├── [ ] Rollback plan documented
└── [ ] Stakeholder sign-off obtained

Launch:
├── [ ] Deploy to staging, final verification
├── [ ] Deploy to production
├── [ ] Verify locale detection works for real users
├── [ ] Monitor error rates per locale
└── [ ] Monitor user feedback channels

Post-Launch (72 hours):
├── [ ] Check analytics for anomalies per locale
├── [ ] Review support tickets for locale-specific issues
├── [ ] Address any critical bugs
├── [ ] Collect user feedback
└── [ ] Document lessons learned in Memory/
```

---

## Anti-Patterns

| Anti-Pattern | Consequence | Prevention |
|-------------|-------------|------------|
| Skip i18n assessment | Discover engineering blockers mid-translation | Always complete Phase 1 |
| Translate before i18n ready | Wasted translation when strings change | Phase 2 gate before Phase 3 |
| Skip pseudo-localization | Untranslated strings found in production | Mandatory pseudo-loc step |
| Launch without QA | User-facing bugs in localized product | Full QA per locale |
| No post-launch monitoring | Issues go undetected for days/weeks | 72-hour monitoring window |

---

## Estimated Timeline

| Phase | Duration (first locale) | Duration (subsequent locales) |
|-------|------------------------|-------------------------------|
| Phase 1: Assessment | 2-3 days | 0.5 days (re-verify) |
| Phase 2: I18N Engineering | 1-4 weeks | 0 (already done) |
| Phase 3: Translation Setup | 1-2 weeks | 2-3 days (add locale) |
| Phase 4: QA | 1-2 weeks | 3-5 days |
| Phase 5: Launch | 1-2 days | 1 day |
| **Total** | **4-9 weeks** | **1-2 weeks** |
