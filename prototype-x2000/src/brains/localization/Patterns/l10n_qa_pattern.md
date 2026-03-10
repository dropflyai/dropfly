# Pattern: Localization QA

## Context

You need to establish or improve a localization quality assurance process
that catches linguistic, functional, and visual defects before localized
content reaches users. This pattern covers QA pipeline design, tooling
selection, automation strategy, and continuous quality improvement.

---

## When to Use

- Setting up l10n QA for the first time
- Improving an existing QA process that misses too many defects
- Scaling QA across many locales (manual review no longer feasible)
- Integrating l10n QA into CI/CD pipeline
- Recovering from a quality crisis (many user-reported l10n bugs)

---

## Phase 1: Quality Baseline Assessment

### Objective
Understand the current state of localization quality and identify
the highest-impact areas for QA investment.

### Quality Audit

```
Current State Assessment:
├── Defect Analysis
│   ├── [ ] Collect all known l10n bugs (past 6 months)
│   ├── [ ] Categorize by type (linguistic, functional, visual)
│   ├── [ ] Categorize by severity (critical, major, minor)
│   ├── [ ] Categorize by locale
│   ├── [ ] Identify most common defect types
│   └── [ ] Calculate defect density per locale
│
├── Process Analysis
│   ├── [ ] Document current QA process (or lack thereof)
│   ├── [ ] Identify who reviews translations today
│   ├── [ ] Measure time from translation delivery to deploy
│   ├── [ ] Identify existing automated checks
│   └── [ ] Assess TMS QA capabilities in use
│
├── Coverage Analysis
│   ├── [ ] What percentage of translations are reviewed?
│   ├── [ ] Which locales receive QA attention?
│   ├── [ ] Which content types are QA'd?
│   ├── [ ] Are visual/functional tests done per locale?
│   └── [ ] Is regression testing done for l10n?
│
└── Output
    ├── Quality baseline score per locale
    ├── Top 5 defect categories by volume
    ├── QA coverage gaps
    └── Prioritized improvement plan
```

---

## Phase 2: Automated QA Pipeline

### Objective
Build automated checks that catch the most common defects with zero
ongoing human effort.

### Pipeline Architecture

```
Translation Delivered
    │
    ▼
Stage 1: File Validation (automated, blocking)
├── UTF-8 encoding verification
├── JSON/XLIFF/PO syntax validation
├── Key structure matches source
└── GATE: Block on any failure
    │
    ▼
Stage 2: Content Validation (automated, blocking)
├── Completeness check (all source keys have translations)
├── Placeholder validation ({variables} match source)
├── HTML/XML tag consistency
├── ICU MessageFormat syntax validation
├── Number preservation (numbers unchanged)
├── Do-Not-Translate term preservation
└── GATE: Block on critical, warn on others
    │
    ▼
Stage 3: Terminology Validation (automated, warning)
├── Glossary compliance check
├── Consistency check (same source = same target)
├── Forbidden term detection
└── GATE: Warn, flag for review
    │
    ▼
Stage 4: UI Validation (automated, warning)
├── Character length limit check
├── Visual regression test (if screenshot infrastructure exists)
├── RTL layout verification (for RTL locales)
└── GATE: Warn, flag for review
    │
    ▼
Stage 5: Reporting
├── Aggregate results per locale
├── Generate QA report
├── Notify team via Slack/email
└── Block or approve merge
```

### Implementation Checklist

```
Automated Pipeline Setup:
├── [ ] File validation scripts written and tested
├── [ ] Placeholder regex validation for all placeholder types
│   ├── Named: {name}, {count}
│   ├── Positional: %1$s, %2$d
│   ├── Printf: %s, %d, %f
│   ├── HTML tags: <b>, <a href="...">
│   └── React components: <Bold>, <Link>
├── [ ] Glossary compliance checker implemented
├── [ ] Character length limits defined per UI element
├── [ ] Length validation script implemented
├── [ ] Completeness threshold defined per locale tier
├── [ ] CI/CD integration configured
│   ├── Runs on translation PR
│   ├── Results posted as PR comment
│   └── Blocking issues prevent merge
├── [ ] Reporting template configured
└── [ ] Alert channels configured (Slack, email)
```

---

## Phase 3: Linguistic QA Process

### Objective
Establish human review processes for quality dimensions that automation
cannot assess (accuracy, fluency, cultural appropriateness).

### Review Framework

```
Linguistic Review Process:
├── Sample Selection
│   ├── New translations: Review 100% for first delivery per translator
│   ├── Subsequent deliveries: Sample 10-20% (random + high-visibility)
│   ├── Always review: Onboarding, payment, legal, marketing
│   └── Trigger review: When automated QA flags cluster in a locale
│
├── Review Method
│   ├── In-context review (preferred: reviewer sees translation in UI)
│   ├── Side-by-side review (source and target in TMS editor)
│   └── Blind review (reviewer assesses target without source)
│
├── Error Classification (MQM Framework)
│   ├── Accuracy
│   │   ├── Mistranslation (major)
│   │   ├── Omission (major)
│   │   ├── Addition (minor)
│   │   └── Untranslated (critical)
│   ├── Fluency
│   │   ├── Grammar (minor-major)
│   │   ├── Spelling (minor)
│   │   ├── Punctuation (minor)
│   │   └── Register (minor-major)
│   ├── Terminology
│   │   ├── Glossary non-compliance (major)
│   │   └── Inconsistency (minor)
│   ├── Style
│   │   ├── Style guide non-compliance (minor)
│   │   └── Awkward phrasing (minor)
│   └── Locale Convention
│       ├── Date/number format (major)
│       └── Cultural inappropriateness (critical)
│
├── Scoring
│   ├── Critical error: 10 penalty points
│   ├── Major error: 5 penalty points
│   ├── Minor error: 1 penalty point
│   ├── Pass threshold: <5 points per 1000 words
│   └── Fail threshold: >=10 points per 1000 words
│
└── Feedback Loop
    ├── Issues logged in TMS with category and suggestion
    ├── Translator corrects flagged issues
    ├── Systemic issues added to style guide
    └── Translator quality score updated
```

---

## Phase 4: Visual and Functional QA

### Objective
Verify that the localized UI renders correctly and functions properly
across all supported locales.

### Visual QA Automation

```
Screenshot-Based QA:
├── [ ] Playwright/Cypress test suite covers key pages
├── [ ] Tests run for each supported locale
├── [ ] Baseline screenshots captured and stored
├── [ ] Diff comparison runs on every translation update
├── [ ] Threshold configured (e.g., <0.5% pixel diff = pass)
├── [ ] Failure screenshots captured and attached to report
└── [ ] RTL-specific visual tests for Arabic, Hebrew

Manual Visual Spot-Check:
├── [ ] Review all pages in largest expansion language (usually DE)
├── [ ] Review all pages in RTL language (if supported)
├── [ ] Review all pages in CJK language (character rendering)
├── [ ] Check responsive breakpoints with translations
└── [ ] Verify email templates render correctly per locale
```

### Functional QA Checklist (per locale)

```
Core Functional Tests:
├── [ ] Locale switching (URL, cookie, user preference)
├── [ ] Sign-up flow completes successfully
├── [ ] Login flow completes successfully
├── [ ] Main product workflow functions correctly
├── [ ] Payment flow works with locale formatting
├── [ ] Date/time displays correctly
├── [ ] Number formatting correct
├── [ ] Currency formatting correct
├── [ ] Search works with locale characters
├── [ ] Sort order correct per locale collation
├── [ ] Form validation messages display correctly
├── [ ] Error handling shows localized messages
└── [ ] Email delivery with localized content
```

---

## Phase 5: Continuous Improvement

### Objective
Establish feedback loops that continuously improve translation quality
and QA effectiveness.

### Quality Metrics Dashboard

| Metric | Target | Measurement |
|--------|--------|-------------|
| Automated QA pass rate | >95% | Translations passing all automated checks |
| Linguistic QA score | <5 points/1000 words | MQM score from reviews |
| User-reported l10n bugs | <2 per locale per release | Bug tracker |
| Time to QA resolution | <24 hours for blocking | QA pipeline metrics |
| False positive rate | <5% | Incorrect automated flags |
| QA coverage | >80% of check types automated | Checklist completion |
| Translator quality trend | Improving quarter-over-quarter | Translator scorecards |

### Improvement Cycle

```
Monthly:
├── Review QA metrics per locale
├── Identify recurring defect patterns
├── Update automated rules to catch new patterns
├── Calibrate severity thresholds
└── Review false positive rate and tune rules

Quarterly:
├── Translator performance review
├── Style guide updates based on QA findings
├── Glossary updates based on terminology issues
├── QA process retrospective
└── Tool evaluation (are current tools sufficient?)

Annually:
├── Full QA process audit
├── Benchmark against industry standards
├── QA tooling evaluation
├── QA budget review
└── Strategy alignment (new markets, new content types)
```

---

## Anti-Patterns

| Anti-Pattern | Consequence | Prevention |
|-------------|-------------|------------|
| No automated checks | Manual review misses systematic errors | Build Stage 1-2 first |
| Over-automation | False positives create noise, reviewers ignore | Regular rule tuning |
| QA after deploy | Users find l10n bugs in production | Pre-deploy QA pipeline |
| Single-locale QA | Assume one locale passing means all pass | Representative locale matrix |
| No feedback loop | Same errors repeat | Translator scorecards + style guide updates |
| Blocking on everything | QA bottleneck slows all releases | Severity-based routing |

---

## Tooling Recommendations

| Need | Tool Options |
|------|-------------|
| Automated QA checks | Custom scripts, Xbench, TMS built-in |
| Visual regression | Playwright, Cypress, Percy, Chromatic |
| Linguistic review | TMS editor, Xbench, QA Distiller |
| CI/CD integration | GitHub Actions, GitLab CI, Jenkins |
| Reporting | Custom dashboard, TMS reporting, Grafana |
| Communication | Slack integration, email, TMS notifications |

---

## Estimated Timeline

| Phase | Duration | Key Dependency |
|-------|----------|----------------|
| Phase 1: Baseline | 1-2 weeks | Access to bug data, current process docs |
| Phase 2: Automation | 2-4 weeks | Engineering capacity |
| Phase 3: Linguistic QA | 1-2 weeks | Reviewer availability |
| Phase 4: Visual/Functional | 1-3 weeks | Test infrastructure |
| Phase 5: Continuous | Ongoing | Discipline |
| **Total to operational** | **5-11 weeks** | |
