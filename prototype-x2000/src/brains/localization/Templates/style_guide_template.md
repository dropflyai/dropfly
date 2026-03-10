# Localization Style Guide Template

A localization style guide provides locale-specific linguistic and
formatting conventions to ensure consistency across all translated
content. Each target locale should have its own style guide, completed
collaboratively by the localization team and native-language reviewers.
This template should be duplicated and filled out per target locale.

---

## 1. LOCALE INFORMATION

| Field | Value |
|-------|-------|
| Locale | [e.g., de-DE] |
| Language | [e.g., German] |
| Region | [e.g., Germany] |
| Script | [e.g., Latin] |
| Text Direction | [LTR / RTL] |
| Style Guide Version | [X.X] |
| Last Updated | [Date] |
| Author | [Name/role] |
| Reviewer | [Name/role] |

---

## 2. TONE AND VOICE

### General Tone

| Dimension | Guideline |
|-----------|-----------|
| Formality level | [Formal / Semi-formal / Informal] |
| Tone | [e.g., Professional but approachable] |
| Humor | [Acceptable / Use sparingly / Avoid] |
| Emotional language | [Encouraged / Neutral / Discouraged] |

### Address Form

| Context | Address Form | Example |
|---------|-------------|---------|
| General UI | [e.g., Sie (formal)] | [e.g., "Geben Sie Ihre E-Mail ein"] |
| Marketing | [e.g., Du (informal)] | [e.g., "Starte jetzt durch"] |
| Error messages | [e.g., Impersonal] | [e.g., "Die E-Mail-Adresse ist ungultig"] |
| Documentation | [e.g., Sie (formal)] | [e.g., "Klicken Sie auf Speichern"] |
| Legal | [e.g., Formal/impersonal] | [e.g., "Der Nutzer erklart sich einverstanden"] |

### Gender-Inclusive Language

| Guideline | Example |
|-----------|---------|
| [Describe locale-specific approach] | [e.g., Use gender-neutral forms where possible] |
| [Preferred method] | [e.g., Genderstern: Benutzer*innen] |
| [Alternative method] | [e.g., Neutral rewording: "Alle Nutzenden"] |
| [Avoid] | [e.g., Generic masculine only] |

---

## 3. GRAMMAR AND SYNTAX

### Sentence Structure

| Rule | Guideline | Example |
|------|-----------|---------|
| Sentence length | [e.g., Keep under 25 words] | [Example] |
| Active vs. passive | [e.g., Prefer active voice] | [Example] |
| Imperatives | [e.g., Use for instructions] | [Example: "Klicken Sie auf Weiter"] |
| Conditional | [e.g., Avoid double negatives] | [Example] |

### Common Grammar Decisions

| Decision | Standard | Notes |
|----------|----------|-------|
| Compound nouns | [e.g., Write as one word in German] | [e.g., Benutzerkonto, not Benutzer Konto] |
| Anglicisms | [e.g., Use German equivalent when one exists] | [e.g., Herunterladen, not Downloaden] |
| Technical terms | [e.g., Keep English if industry-standard] | [e.g., "Cloud" stays as "Cloud"] |
| Abbreviations | [e.g., Spell out first occurrence] | [e.g., API (Application Programming Interface)] |

---

## 4. PUNCTUATION AND FORMATTING

### Punctuation Rules

| Element | Convention | Example |
|---------|-----------|---------|
| Period at end of sentences | [Yes / No for UI labels] | [e.g., Labels: no period. Full sentences: period.] |
| Comma in lists (serial/Oxford) | [Use / Do not use] | [e.g., "A, B und C" (no Oxford comma in German)] |
| Quotation marks | [Style per locale] | [e.g., German: "Anführungszeichen" or „Anfuhrungszeichen"] |
| Ellipsis | [Three dots / Unicode character] | [e.g., "Laden..." or "Laden\u2026"] |
| Colon spacing | [Space before? Space after?] | [e.g., French: "Note : texte" (space before colon)] |
| Exclamation marks | [Usage guideline] | [e.g., Use sparingly; one at a time] |
| Parentheses | [When to use] | [Same as English conventions] |

### Number Formatting

| Element | Format | Example |
|---------|--------|---------|
| Decimal separator | [Comma / Period] | [e.g., 1.234,56 (German)] |
| Thousands separator | [Period / Comma / Space] | [e.g., 1.234.567 (German)] |
| Percentage | [Symbol placement] | [e.g., 95 % (German: space before %)] |
| Negative numbers | [Format] | [e.g., -1.234,56] |
| Phone numbers | [Local format] | [e.g., +49 30 12345678] |

### Date and Time

| Element | Format | Example |
|---------|--------|---------|
| Short date | [Format pattern] | [e.g., 03.02.2026 (German)] |
| Long date | [Format pattern] | [e.g., 3. Februar 2026 (German)] |
| Time (12h/24h) | [12-hour / 24-hour] | [e.g., 14:30 Uhr (German)] |
| Day of week | [Abbreviation style] | [e.g., Mo, Di, Mi, Do, Fr, Sa, So] |
| Month abbreviation | [Abbreviation style] | [e.g., Jan, Feb, Mar...] |
| First day of week | [Monday / Sunday / Saturday] | [e.g., Monday (German)] |

### Currency

| Element | Format | Example |
|---------|--------|---------|
| Currency symbol position | [Before / After] | [e.g., 12,99 EUR or 12,99 € (German)] |
| Decimal places | [Number] | [e.g., 2 for EUR, 0 for JPY] |
| Thousands separator | [Same as numbers] | [e.g., 1.234,56 EUR] |

---

## 5. UI-SPECIFIC GUIDELINES

### Capitalization

| Element | Convention | Example |
|---------|-----------|---------|
| Page titles | [Title Case / Sentence case] | [e.g., "Kontoeinstellungen"] |
| Button labels | [Title Case / Sentence case] | [e.g., "Speichern" or "Andern speichern"] |
| Menu items | [Title Case / Sentence case] | [e.g., "Einstellungen"] |
| Column headers | [Title Case / Sentence case] | [e.g., "Erstellungsdatum"] |
| Tab labels | [Title Case / Sentence case] | [e.g., "Ubersicht"] |
| Tooltips | [Sentence case, period?] | [e.g., "Klicken, um zu erweitern"] |
| Error messages | [Sentence case, period?] | [e.g., "Bitte geben Sie eine gultige E-Mail ein."] |

### Common UI Terms

| English | Translation | Context |
|---------|------------|---------|
| Save | [e.g., Speichern] | Button label |
| Cancel | [e.g., Abbrechen] | Button label |
| Delete | [e.g., Loschen] | Button/action |
| Edit | [e.g., Bearbeiten] | Button/action |
| Search | [e.g., Suchen / Suche] | Field label / button |
| Settings | [e.g., Einstellungen] | Menu item |
| Profile | [e.g., Profil] | Menu item |
| Dashboard | [e.g., Dashboard / Ubersicht] | Page title |
| Sign In | [e.g., Anmelden] | Button/page |
| Sign Out | [e.g., Abmelden] | Button |
| Sign Up | [e.g., Registrieren] | Button/page |
| Submit | [e.g., Absenden] | Button |
| Next | [e.g., Weiter] | Button |
| Back | [e.g., Zuruck] | Button |
| Close | [e.g., Schliessen] | Button |
| Learn more | [e.g., Mehr erfahren] | Link |
| Loading... | [e.g., Wird geladen...] | Status |
| No results | [e.g., Keine Ergebnisse] | Empty state |

---

## 6. TERMINOLOGY DECISIONS

### Resolved Terminology

| English Term | Approved Translation | Rejected Alternatives | Rationale |
|-------------|---------------------|----------------------|-----------|
| [Term] | [Approved] | [Rejected option 1, 2] | [Why this choice] |
| [Term] | [Approved] | [Rejected option 1, 2] | [Why this choice] |
| [Term] | [Approved] | [Rejected option 1, 2] | [Why this choice] |

### Terms to Keep in English

| Term | Reason |
|------|--------|
| [e.g., Cloud] | Industry standard, understood in target market |
| [e.g., SaaS] | Technical acronym, no equivalent |
| [e.g., API] | Developer-facing, universal |

---

## 7. LOCALE-SPECIFIC CULTURAL NOTES

### Cultural Considerations

| Topic | Guideline |
|-------|-----------|
| Color associations | [e.g., Red = danger/error, Green = success (standard)] |
| Imagery preferences | [e.g., Use diverse imagery; avoid US-centric photos] |
| Humor and idioms | [e.g., German B2B: avoid humor; keep professional] |
| Seasonal references | [e.g., Adjust for southern hemisphere if applicable] |
| Religious sensitivity | [e.g., Avoid religious imagery in secular products] |
| Political sensitivity | [e.g., Taiwan/China naming conventions] |

### Address and Contact Format

| Element | Local Format |
|---------|-------------|
| Name order | [e.g., Vorname Nachname (German)] |
| Address format | [e.g., Strasse Nr, PLZ Stadt, Land] |
| Phone format | [e.g., +49 (0)30 12345678] |
| Postal code format | [e.g., 5 digits (German)] |

---

## 8. QUALITY EXPECTATIONS

### Quality Thresholds

| Metric | Threshold |
|--------|-----------|
| MQM score | [e.g., <5 penalty points per 1000 words] |
| Glossary compliance | [e.g., 100% for mandatory terms] |
| Consistency | [e.g., Same source = same translation within project] |
| Completeness | [e.g., 100% of source strings translated] |

### Review Process

| Step | Responsible | Focus |
|------|-------------|-------|
| Self-review | Translator | Accuracy, completeness |
| Peer review | Reviewer | Fluency, terminology, style |
| In-context review | Reviewer/QA | UI fit, visual correctness |

---

## 9. CHANGE LOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| [Date] | 1.0 | Initial style guide created | [Name] |
| [Date] | 1.1 | [Description of change] | [Name] |

---

**A locale-specific style guide is the most effective tool for
achieving translation consistency. Without it, each translator
makes independent decisions about formality, terminology, and
formatting — producing a patchwork of styles that undermines
the user experience. With it, your product speaks with one
voice in every language.**
