# Localization Brief Template

A localization brief communicates the scope, requirements, and context
for a specific localization project or batch of work. It is the primary
communication artifact between the product team requesting localization
and the localization team executing it. This template should be completed
for each localization request.

---

## 1. REQUEST INFORMATION

| Field | Value |
|-------|-------|
| Request ID | [e.g., L10N-2026-042] |
| Requester | [Name, role] |
| Date Submitted | [Date] |
| Priority | [Critical / High / Medium / Low] |
| Requested Deadline | [Date] |
| Project/Feature | [Feature or project name] |

---

## 2. SCOPE DEFINITION

### What Needs Localization?

| Content | Description | Word Count (est.) | Format |
|---------|------------|-------------------|--------|
| [UI strings] | [New checkout flow strings] | [500] | [JSON] |
| [Marketing page] | [New landing page for feature X] | [1200] | [HTML/Markdown] |
| [Help article] | [How to use feature X] | [800] | [Markdown] |
| [Email template] | [Welcome email redesign] | [300] | [HTML] |
| [Legal] | [Updated privacy policy section] | [400] | [DOCX] |

### Target Locales

| Locale | Tier | Translation Approach | Deadline |
|--------|------|---------------------|----------|
| [de-DE] | [Tier 1] | [Human + review] | [Date] |
| [fr-FR] | [Tier 1] | [Human + review] | [Date] |
| [ja-JP] | [Tier 1] | [Human + review] | [Date] |
| [es-ES] | [Tier 2] | [MTPE] | [Date] |
| [pt-BR] | [Tier 2] | [MTPE] | [Date] |

### What Is Out of Scope?

- [e.g., Developer documentation is NOT included in this request]
- [e.g., Social media posts will be handled separately by marketing]
- [e.g., Video content is NOT part of this batch]

---

## 3. CONTEXT AND BACKGROUND

### Feature/Product Context

```
What is this feature/content about?
[Describe the feature, product, or campaign that this localization
supports. Include the business goal and target user.]

Why is this being localized?
[e.g., Launching in DE market, updating existing translations,
new feature rollout to all locales]

What changed since last localization?
[Describe what is new vs. updated vs. unchanged]
```

### User Journey Context

```
Where does this content appear in the user journey?
[e.g., This appears during the onboarding flow after the user
creates an account. It is the first thing new users see.]

What action should the user take after reading this content?
[e.g., Complete their profile and start their first project]
```

### Visual Context

| Resource | Location |
|----------|----------|
| Figma designs | [Link to Figma] |
| Screenshots | [Link to screenshot folder] |
| Staging URL | [URL with test credentials] |
| Video walkthrough | [Link to video] |

---

## 4. CONTENT SPECIFICATIONS

### New Content

| String Key / Section | Source Text (EN) | Context | Character Limit | Notes |
|---------------------|-----------------|---------|----------------|-------|
| [checkout.title] | [Complete Your Purchase] | [Page heading on checkout] | [40] | [Prominent heading] |
| [checkout.cta] | [Pay Now] | [Primary button on checkout] | [20] | [Must be action-oriented] |

### Updated Content

| String Key / Section | Previous Text | New Text | Reason for Change |
|---------------------|-------------|----------|-------------------|
| [settings.title] | [User Settings] | [Account Settings] | [Terminology change] |

### Removed Content

| String Key / Section | Previous Text | Reason for Removal |
|---------------------|-------------|-------------------|
| [feature.old_cta] | [Try Beta Feature] | [Feature graduated from beta] |

---

## 5. TERMINOLOGY AND STYLE

### Key Terms for This Request

| Term | Definition | Preferred Translation (if known) |
|------|-----------|--------------------------------|
| [Term 1] | [What it means in product context] | [If pre-determined] |
| [Term 2] | [What it means in product context] | [If pre-determined] |

### Tone Guidance for This Content

| Dimension | Guideline |
|-----------|-----------|
| Formality | [e.g., Semi-formal, approachable] |
| Urgency | [e.g., This is a payment flow — clear and reassuring] |
| Brand voice | [e.g., Confident but not aggressive] |

### Special Instructions

```
[Any locale-specific or content-specific instructions]

Example:
- For ja-JP: Use keigo (polite form) throughout the checkout flow
- For de-DE: "Account" should remain in English (our brand standard)
- Marketing headline may be transcreated (not literal translation)
- Legal section must be reviewed by local counsel before publish
```

---

## 6. TECHNICAL REQUIREMENTS

### File Delivery

| Parameter | Value |
|-----------|-------|
| Source file location | [TMS project / Git repo / attached files] |
| Source file format | [JSON / XLIFF / PO / DOCX / HTML] |
| Expected delivery format | [Same as source / TMS delivery / PR] |
| Delivery method | [TMS automated PR / manual file delivery] |

### Placeholder Reference

| Placeholder | Description | Example Value |
|------------|-------------|--------------|
| {userName} | Display name of logged-in user | "Maria Schmidt" |
| {planName} | Name of subscription plan | "Professional" |
| {amount} | Formatted price | "$29.99" / "29,99 EUR" |
| {date} | Formatted date | "February 3, 2026" |

### Technical Constraints

| Constraint | Details |
|-----------|---------|
| Max string length | [See character limits in Section 4] |
| Encoding | [UTF-8] |
| Line breaks | [Use \n for newlines in JSON strings] |
| HTML in strings | [Allowed: <b>, <a> / Not allowed: block elements] |

---

## 7. QUALITY REQUIREMENTS

### Quality Level

| Dimension | Requirement |
|-----------|-------------|
| Quality standard | [MQM: <5 points per 1000 words] |
| Review requirement | [Single review / Double review / In-context review] |
| Glossary compliance | [100% mandatory terms] |
| Automated QA | [Must pass all automated checks] |

### Acceptance Criteria

```
This localization request is considered COMPLETE when:
├── [ ] All content translated for all target locales
├── [ ] Automated QA passes (completeness, placeholders, length)
├── [ ] Linguistic review completed (for Tier 1 locales)
├── [ ] Translations delivered in expected format
├── [ ] In-context visual verification done (for UI strings)
└── [ ] Stakeholder approval obtained (for marketing/legal)
```

---

## 8. TIMELINE

### Milestones

| Milestone | Date | Owner |
|-----------|------|-------|
| Source content finalized | [Date] | [Product/Content team] |
| Source files pushed to TMS | [Date] | [L10n Engineer] |
| Translation begins | [Date] | [Translators] |
| Translation complete | [Date] | [Translators] |
| Review complete | [Date] | [Reviewers] |
| QA validation | [Date] | [QA / automated] |
| Delivery to engineering | [Date] | [L10n PM] |
| Staging deployment | [Date] | [Engineering] |
| Production deployment | [Date] | [Engineering] |

### Dependencies

| Dependency | Status | Impact if Delayed |
|-----------|--------|-------------------|
| [Source content finalized] | [In progress / Complete] | [Blocks translation start] |
| [Design approved] | [In progress / Complete] | [Blocks screenshot context] |
| [Legal review of EN source] | [In progress / Complete] | [Blocks legal translation] |

---

## 9. STAKEHOLDERS AND APPROVALS

### Approval Required From

| Role | Name | Approval Scope | Status |
|------|------|---------------|--------|
| Product Manager | [Name] | Content accuracy | [Pending / Approved] |
| Marketing Manager | [Name] | Marketing content | [Pending / Approved] |
| Legal | [Name] | Legal content | [Pending / Approved] |
| L10n Manager | [Name] | Overall quality | [Pending / Approved] |

### Communication Plan

| Event | Notify | Channel |
|-------|--------|---------|
| Translation started | Requester | [Slack / Email] |
| Translation complete | QA team | [Slack / Email] |
| QA issues found | L10n PM | [Slack / TMS] |
| Ready for deployment | Engineering | [Slack / PR] |
| Deployed to production | All stakeholders | [Slack / Email] |

---

## 10. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Source content changes during translation | [High/Med/Low] | [Rework cost] | [String freeze by source deadline] |
| Translator unavailable | [High/Med/Low] | [Deadline miss] | [Backup translator identified] |
| Legal review delays | [High/Med/Low] | [Blocks legal locales] | [Start legal review early] |
| Character limit violations | [High/Med/Low] | [UI breaks] | [Pre-check with pseudo-loc] |

---

**A well-written localization brief eliminates ambiguity, reduces
translator questions, prevents rework, and ensures all stakeholders
are aligned on scope, quality, and timeline. The 30 minutes invested
in completing this brief saves hours of back-and-forth and prevents
costly misunderstandings.**
