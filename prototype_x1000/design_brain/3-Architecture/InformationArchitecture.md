# Information Architecture Framework — Authoritative

If users can't find it, it doesn't exist.
Information architecture makes the complex findable.

---

## Purpose

Information architecture (IA) exists to:
- organize information logically
- make navigation intuitive
- match user mental models
- reduce cognitive load
- enable scalable growth

Good IA is invisible. Bad IA is memorable.

---

## IA Components

### 1. Organization Systems
How information is grouped and categorized.

### 2. Labeling Systems
What we call things.

### 3. Navigation Systems
How users move through the product.

### 4. Search Systems
How users find specific items.

---

## Organization Schemes

### Exact (Objective)
```
ALPHABETICAL
A → B → C → D → ...

CHRONOLOGICAL
Newest → Older → Oldest

GEOGRAPHICAL
By location / region

NUMERICAL
1 → 2 → 3 → 4 → ...
```

### Ambiguous (Subjective)
```
TOPIC
Grouped by subject matter

TASK
Grouped by what users do

AUDIENCE
Grouped by who uses it

METAPHOR
Grouped by familiar concept
```

### Hybrid
Most real products combine multiple schemes.

---

## Organization Matrix

```
| Content Type | Primary Org | Secondary Org | Why |
|--------------|-------------|---------------|-----|
| Workflows | Topic | Chronological | Users think in categories, then recency |
| Runs | Chronological | Status | Recent matters, then filter by state |
| Settings | Topic | Task | Grouped logically, then by action |
| Help articles | Topic | Search | Browse by category, search for specific |
```

---

## Labeling Analysis

### Current Labels Audit
```
| Current Label | User Language | Better Label? | Notes |
|---------------|---------------|---------------|-------|
|               |               |               |       |
```

### Labeling Principles
- Use user language, not internal jargon
- Be consistent (same thing = same name)
- Be specific (avoid generic labels)
- Be concise (short but clear)
- Test with users

### Label Testing
```
What users call it in:
- Interviews: "_______________"
- Support tickets: "_______________"
- Search queries: "_______________"

Proposed label: _______________
```

---

## Navigation Patterns

### Global Navigation
Persistent across all pages.
```
| Item | Destination | Priority | Visible? |
|------|-------------|----------|----------|
|      |             |          |          |
```

### Local Navigation
Contextual to current section.
```
| Parent | Item | Destination |
|--------|------|-------------|
|        |      |             |
```

### Contextual Navigation
In-content links and related items.
```
| Context | Link Type | Destination |
|---------|-----------|-------------|
|         |           |             |
```

### Supplemental Navigation
Breadcrumbs, related content, shortcuts.
```
| Type | Purpose | Implementation |
|------|---------|----------------|
|      |         |                |
```

---

## IA Diagram

### Hierarchy Diagram
```
                    [ROOT]
                       │
       ┌───────────────┼───────────────┐
       │               │               │
   [Category A]   [Category B]   [Category C]
       │               │               │
   ┌───┴───┐       ┌───┴───┐       ┌───┴───┐
[A.1]   [A.2]   [B.1]   [B.2]   [C.1]   [C.2]
```

### Entity Relationship
```
[User] ──1:N──→ [Workspace]
                    │
                    ├──1:N──→ [Workflow]
                    │              │
                    │              └──1:N──→ [Run]
                    │
                    └──1:N──→ [Integration]
```

---

## Card Sorting

### What It Is
Users group content into categories, revealing mental models.

### Open Card Sort
Users create their own categories.
```
Instructions: "Group these items however makes sense to you,
then name each group."

| Item | User 1 Group | User 2 Group | User 3 Group |
|------|--------------|--------------|--------------|
|      |              |              |              |
```

### Closed Card Sort
Users sort into predefined categories.
```
Categories: [Cat A] [Cat B] [Cat C]
Instructions: "Place each item in the category where
you'd expect to find it."

| Item | Cat A | Cat B | Cat C | Unsure |
|------|-------|-------|-------|--------|
|      |       |       |       |        |
```

### Analysis
```
AGREEMENT MATRIX
| Item | Most Common Category | % Agreement |
|------|---------------------|-------------|
|      |                     |             |

INSIGHTS
-
-
-
```

---

## Tree Testing

### What It Is
Users find items in a proposed navigation structure (no visual design).

### Setup
```
TASKS:
1. Find where you'd go to [do X]
2. Find where you'd go to [see Y]
3. Find where you'd go to [change Z]

TREE:
- Dashboard
- Workflows
  - All Workflows
  - Templates
  - Archive
- Runs
  - Active
  - Completed
  - Failed
- Settings
  - Account
  - Team
  - Integrations
```

### Results
```
| Task | Success Rate | First Click | Path |
|------|--------------|-------------|------|
|      |              |             |      |

INSIGHTS
-
-
```

---

## IA Validation Checklist

### Structural Validation
- [ ] Hierarchy depth is reasonable (≤4 levels)
- [ ] Categories are mutually exclusive
- [ ] Categories are collectively exhaustive
- [ ] Labels are user-tested
- [ ] Navigation matches mental models

### Functional Validation
- [ ] Key tasks are easily accomplished
- [ ] Related items are grouped
- [ ] Cross-links connect related content
- [ ] Search supports IA (synonyms, related terms)
- [ ] Error recovery is possible

### Scalability
- [ ] Structure can grow
- [ ] Categories won't become bloated
- [ ] New content has clear homes

---

## IA Documentation Template

```
PROJECT: _______________
VERSION: _______________
DATE: _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INFORMATION STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Hierarchy diagram here]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CATEGORY DEFINITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Category: _______________
Definition: What belongs here
Contains: [List of content types]
Does NOT contain: [Exclusions]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAVIGATION STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Global: [Items]
Local: [By section]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LABELING GLOSSARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Term | Definition | Usage |
|------|------------|-------|
|      |            |       |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VALIDATION RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Card sort insights:
Tree test results:
User feedback:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KNOWN ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-
-

```

---

## IA Maintenance

### Monitoring
- Search queries (what can't users find?)
- Navigation analytics (where do users get stuck?)
- Support tickets (confusion patterns)
- User feedback

### Iteration
- Regular IA reviews (quarterly)
- Validate new content placement
- Test before major changes

---

## Anti-Patterns (Avoid)

- Organization by internal structure (engineering teams)
- Jargon labels
- Too many top-level categories
- Too deep nesting
- Inconsistent patterns
- No validation with users
- IA designed for today only

---

## Output Artifacts

After IA work, you should have:
- [ ] Information hierarchy diagram
- [ ] Category definitions
- [ ] Labeling glossary
- [ ] Navigation structure
- [ ] Card sort / tree test results
- [ ] IA documentation

---

## END OF INFORMATION ARCHITECTURE FRAMEWORK
