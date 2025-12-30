# Site Map Framework — Authoritative

A site map is the skeleton of your product.
Without it, you're decorating without architecture.

---

## Purpose

Site maps exist to:
- visualize the complete product structure
- plan navigation hierarchy
- identify all pages/screens needed
- reveal gaps and redundancies
- align team on product scope

Design screens without a site map and you'll miss things.

---

## When to Create

### Timing
- After research, before design
- When adding major features
- During redesigns
- When navigation problems emerge

### Prerequisites
- User research complete
- Jobs-to-be-done defined
- Key features identified
- Personas established

---

## Site Map Notation

### Standard Elements
```
[Page Name]           → Page/screen
├── [Child Page]      → Sub-page
│   └── [Grandchild]  → Nested page
├── [Sibling]         → Same level
...                   → Indicates more
(Modal)               → Overlay, not navigation
*Dynamic*             → Generated/variable content
{Protected}           → Requires authentication
```

### Visual Hierarchy
```
                    [Home]
                       │
       ┌───────────────┼───────────────┐
       │               │               │
   [Section A]    [Section B]    [Section C]
       │               │               │
   ┌───┴───┐       ┌───┴───┐       ┌───┴───┐
   │       │       │       │       │       │
[Page] [Page]   [Page] [Page]   [Page] [Page]
```

---

## Site Map Template

### Basic Structure
```
PROJECT: _______________
VERSION: _______________
DATE: _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUBLIC PAGES (No Auth Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Landing Page]
├── [Features]
├── [Pricing]
├── [About]
├── [Blog]
│   └── *[Blog Post]*
├── [Contact]
├── [Login]
└── [Sign Up]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTHENTICATED PAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Dashboard}
├── {[Section 1]}
│   ├── {[List View]}
│   │   └── {*[Detail View]*}
│   └── {[Create New]} (Modal)
│
├── {[Section 2]}
│   ├── ...
│   └── ...
│
├── {[Settings]}
│   ├── {[Account]}
│   ├── {[Billing]}
│   ├── {[Team]}
│   └── {[Integrations]}
│
└── {[Help]}
    ├── {[Documentation]}
    └── {[Contact Support]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ADMIN PAGES (Admin Role Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Admin Dashboard}
├── {[User Management]}
├── {[Analytics]}
└── {[System Settings]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UTILITY PAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[404 Not Found]
[500 Error]
[Maintenance]
[Password Reset]
[Email Verification]

```

---

## Page Inventory

For each page in the site map:

```
| Page | URL Pattern | Purpose | Parent | Auth? | Priority |
|------|-------------|---------|--------|-------|----------|
| Home | / | Entry point | - | No | P0 |
| Dashboard | /dashboard | Main app | - | Yes | P0 |
| Workflows | /workflows | List workflows | Dashboard | Yes | P0 |
| Workflow Detail | /workflows/:id | View workflow | Workflows | Yes | P0 |
| Settings | /settings | Configure | Dashboard | Yes | P1 |
```

### Priority Levels
- **P0**: Must have for launch
- **P1**: Should have for launch
- **P2**: Nice to have
- **P3**: Future consideration

---

## Site Map by User Journey

Map pages to user goals:

```
JOURNEY: First-Time User Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Landing] → [Sign Up] → [Onboarding Step 1] → [Onboarding Step 2]
                                                      │
                                                      ↓
[Dashboard] ← [Onboarding Complete]


JOURNEY: Core Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Dashboard] → [Workflows] → [Create Workflow] → [Workflow Detail]
                                                      │
                                                      ↓
                                               [Run Workflow]
                                                      │
                                                      ↓
                                               [View Results]
```

---

## Navigation Planning

### Primary Navigation
```
What appears in main nav:
| Label | Destination | Icon | Order |
|-------|-------------|------|-------|
|       |             |      |       |
```

### Secondary Navigation
```
What appears in sub-nav or tabs:
| Parent | Label | Destination |
|--------|-------|-------------|
|        |       |             |
```

### Utility Navigation
```
Header/footer links:
| Label | Destination | Location |
|-------|-------------|----------|
|       |             |          |
```

---

## Site Map Validation

### Checklist
- [ ] All user journeys have paths
- [ ] No orphan pages (unreachable)
- [ ] No duplicate pages (same content)
- [ ] Hierarchy is logical
- [ ] Navigation depth is reasonable (<4 levels)
- [ ] URLs are RESTful and sensible
- [ ] Error states are included
- [ ] Auth states are considered

### Questions to Ask
```
- Can users get to [X] from [Y]?
- How many clicks to reach [key page]?
- Is there a clear path back?
- What happens if [something fails]?
- Is anything missing?
```

---

## Site Map Variations

### By User Role
```
GUEST USER
[Landing] → [Features] → [Pricing] → [Sign Up]

FREE USER
{Dashboard} → {Workflows (limited)} → {Upgrade}

PRO USER
{Dashboard} → {Workflows} → {Advanced Features}

ADMIN
{Admin Panel} → {User Management} → {System Config}
```

### By Device
```
DESKTOP
Full sidebar navigation, all features

MOBILE
Bottom nav, simplified features, progressive disclosure
```

---

## Visual Site Map Template

```
                           ┌─────────────┐
                           │   Landing   │
                           └──────┬──────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
    ┌────┴────┐              ┌────┴────┐              ┌────┴────┐
    │ Features│              │  Login  │              │ Sign Up │
    └─────────┘              └────┬────┘              └────┬────┘
                                  │                        │
                                  └───────────┬────────────┘
                                              │
                                       ┌──────┴──────┐
                                       │  Dashboard  │
                                       └──────┬──────┘
                                              │
              ┌───────────────┬───────────────┼───────────────┬───────────────┐
              │               │               │               │               │
         ┌────┴────┐     ┌────┴────┐     ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
         │Workflows│     │   Runs  │     │Analytics│     │ Settings│     │  Help   │
         └────┬────┘     └────┬────┘     └─────────┘     └────┬────┘     └─────────┘
              │               │                               │
         ┌────┴────┐     ┌────┴────┐                    ┌─────┴─────┐
         │ Detail  │     │ Detail  │                    │  Account  │
         └─────────┘     └─────────┘                    │  Billing  │
                                                        │  Team     │
                                                        └───────────┘
```

---

## Updating Site Maps

### When to Update
- New features added
- Navigation changes
- User feedback indicates confusion
- Analytics show navigation issues

### Version Control
```
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Date | Initial | Name |
| 1.1 | Date | Added X | Name |
```

---

## Anti-Patterns (Avoid)

- Designing without a site map
- Too many top-level items (>7)
- Inconsistent hierarchy
- Dead ends (no way back)
- Duplicate content at different URLs
- Ignoring mobile navigation
- Not including error states

---

## Output Artifacts

After site mapping, you should have:
- [ ] Complete site map document
- [ ] Page inventory with URLs
- [ ] Navigation structure
- [ ] User journey paths
- [ ] Role-based variations
- [ ] Mobile considerations

---

## END OF SITE MAP FRAMEWORK
