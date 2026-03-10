# Pattern: Navigation — Authoritative

Navigation exists to answer: "Where am I?" and "Where can I go?"
If users feel lost, navigation has failed.

---

## Purpose

Navigation systems exist to:
- orient users within the product
- provide predictable wayfinding
- surface available actions and destinations
- maintain context across screens

Navigation is architecture, not decoration.

---

## Navigation Types

### Primary Navigation (Sidebar/Top Nav)
- Main product areas
- Persistent across screens
- Maximum 7±2 items
- Clear active state

### Secondary Navigation (Tabs/Submenu)
- Within a section
- Context-specific
- Related views of same data
- Clear selection indicator

### Tertiary Navigation (Breadcrumbs/Back)
- Hierarchical context
- Path history
- Recovery navigation

### Contextual Navigation (In-page links)
- Jump links within content
- Section navigation
- Table of contents

---

## Sidebar Navigation (Default Pattern)

### Structure
```
┌──────────────────────────────────────────────┐
│ ┌──────────┐                                 │
│ │ Logo     │                                 │
│ └──────────┘                                 │
│                                              │
│ ┌──────────────────────┐                     │
│ │ 🏠 Dashboard  ←active│                     │
│ │ 📊 Analytics         │                     │
│ │ ⚙️ Workflows         │                     │
│ │ 📋 Runs              │                     │
│ │ ⚡ Settings          │                     │
│ └──────────────────────┘                     │
│                                              │
│ ─────────────────────── (divider)            │
│                                              │
│ ┌──────────────────────┐                     │
│ │ 📖 Documentation     │                     │
│ │ 💬 Support           │                     │
│ └──────────────────────┘                     │
│                                              │
│ ┌──────────────────────┐                     │
│ │ 👤 Account           │                     │
│ └──────────────────────┘                     │
└──────────────────────────────────────────────┘
```

### Rules
- Width: 240-280px (desktop)
- Collapsible on mobile
- Active item clearly highlighted
- Icons support text (never replace)
- Group related items
- Separate utility items (settings, account)

---

## Top Navigation (Alternative)

### Use When
- Few primary destinations (<5)
- No nested hierarchy
- Horizontal space available
- Mobile-first not priority

### Structure
```
┌─────────────────────────────────────────────────────┐
│ Logo    Dashboard  Analytics  Workflows  Settings   │
└─────────────────────────────────────────────────────┘
```

---

## Navigation Item States

### Required States
- Default
- Hover
- Active/Selected
- Disabled (if applicable)
- Focus (keyboard)

### Active State Rules
- Visually distinct background or border
- Do not rely on color alone
- Maintain through navigation
- Clear at a glance

---

## Breadcrumbs

### Use When
- Hierarchy depth > 2 levels
- Users navigate via drill-down
- Return path matters

### Structure
```
Home / Workflows / Email Campaign / Edit
        ↳ clickable  ↳ clickable    ↳ current (not clickable)
```

### Rules
- Current page is not a link
- Show truncated path for deep hierarchies
- Separator: `/` or `>`
- Mobile: show only parent or back button

---

## Tabs

### Use When
- Same entity, different views
- Content is parallel (not hierarchical)
- 2-6 options

### Structure
```
┌─────────────────────────────────────────────────┐
│  Overview    Activity    Settings    Danger     │
│  ─────────                                      │
│  (underline = active)                           │
└─────────────────────────────────────────────────┘
```

### Rules
- Active tab has clear indicator
- Tab content changes, URL may change
- Do not use tabs for sequential steps (use stepper)
- Overflow: scroll or dropdown

---

## Mobile Navigation

### Patterns
1. **Bottom Navigation** — 3-5 primary destinations
2. **Hamburger Menu** — Full sidebar in drawer
3. **Tab Bar** — iOS-style bottom tabs

### Rules
- Touch targets: minimum 44x44px
- Active state obvious
- No hover states (touch)
- Thumb-reachable placement

---

## Mode-Specific Rules

### MODE_SAAS
- Clear, labeled navigation
- Onboarding may highlight items
- Keep it simple for new users
- Max 5-7 primary items

### MODE_INTERNAL
- Can be denser
- Keyboard shortcuts encouraged
- Collapse to icons acceptable
- Power user navigation patterns

### MODE_AGENTIC
- Navigation tied to system state
- Runs/workflows prominent
- Status in navigation (counts, badges)
- Quick access to logs

---

## Navigation Badges & Indicators

### Use For
- Unread counts
- Action required
- Status changes
- New features (sparingly)

### Rules
- Position: top-right of nav item
- Size: small, non-intrusive
- Number or dot only
- Red for urgent only

---

## Keyboard Navigation

### Required
- Tab through nav items
- Enter/Space to select
- Arrow keys within groups
- Focus visible at all times

### Shortcuts (Optional)
- `Cmd/Ctrl + K` for command palette
- `G then D` for go to dashboard (Gmail-style)
- Document shortcuts if used

---

## Accessibility Requirements

- Semantic `<nav>` element
- `aria-current="page"` for active item
- `aria-label` for multiple nav regions
- Skip link to main content
- Logical tab order
- Focus management on expand/collapse

---

## Common Failures (Disallowed)

- Icon-only navigation without labels
- No active state indication
- Horizontal scrolling nav on desktop
- Deep nesting (>3 levels)
- Navigation that changes based on content
- Hidden or surprise navigation items
- Different nav structure across sections

---

## Final Navigation Check

Before shipping, ask:
- Can users always tell where they are?
- Can they get back easily?
- Is the nav consistent across pages?
- Are all items discoverable?
- Does it work with keyboard only?

If not, refactor.

---

## END OF NAVIGATION PATTERN
