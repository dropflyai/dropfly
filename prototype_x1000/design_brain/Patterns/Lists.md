# Pattern: Lists — Authoritative

Lists display collections of items for scanning and selection.
If users can't find items quickly, the list has failed.

---

## Purpose

Lists exist to:
- display collections of similar items
- enable quick scanning
- provide selection and navigation
- surface key information at a glance

Lists are lighter than tables. Use them when comparison is not the goal.

---

## When to Use Lists vs Tables

### Use Lists When
- Items are navigational (click to view)
- Comparison is not primary goal
- Items have varied content lengths
- Mobile-friendly display needed
- Visual richness helps (avatars, icons)

### Use Tables When
- Comparing values across items
- Sorting/filtering by columns needed
- Actions on multiple columns
- Data is structured and consistent

---

## List Types

### 1. Simple List
Basic text items, minimal chrome.
```
┌─────────────────────────────────────────┐
│ Item one                                │
│ Item two                                │
│ Item three                              │
└─────────────────────────────────────────┘
```

### 2. List with Metadata
Primary text plus secondary info.
```
┌─────────────────────────────────────────┐
│ Email Campaign                          │
│ Last run 2 hours ago                    │
├─────────────────────────────────────────┤
│ Data Sync Workflow                      │
│ Last run yesterday                      │
└─────────────────────────────────────────┘
```

### 3. List with Leading Element
Icon, avatar, or checkbox.
```
┌─────────────────────────────────────────┐
│ 📧  Email Campaign         Active    →  │
│ 🔄  Data Sync              Paused    →  │
│ 📊  Analytics Job          Active    →  │
└─────────────────────────────────────────┘
```

### 4. List with Actions
Inline actions per item.
```
┌─────────────────────────────────────────┐
│ 📧  Email Campaign         [Run] [Edit] │
│ 🔄  Data Sync              [Run] [Edit] │
└─────────────────────────────────────────┘
```

---

## List Item Structure

### Standard Item
```
┌─────────────────────────────────────────────────────┐
│ [Lead]  Primary text                    [Trail]     │
│         Secondary text                  [Action]    │
└─────────────────────────────────────────────────────┘
```

### Components
| Component | Purpose | Example |
|-----------|---------|---------|
| Lead | Visual identifier | Icon, avatar, checkbox |
| Primary | Main identifier | Item name, title |
| Secondary | Supporting info | Description, metadata |
| Trail | Status/value | Badge, date, chevron |
| Action | Item-specific | Button, menu |

---

## Spacing & Sizing

### Item Height
```
Compact     40px     Dense data, internal tools
Default     56px     Standard lists
Comfortable 72px     Lists with avatars/descriptions
```

### Internal Spacing
```
┌─────────────────────────────────────────────────────┐
│ ← 16px → [Icon] ← 12px → Text content ← 16px →     │
│          ↑ 16px vertical padding ↓                  │
└─────────────────────────────────────────────────────┘
```

### Between Items
- Dividers: 1px border (neutral-200)
- OR gap: 1-4px spacing
- Choose one, be consistent

---

## Selection States

### Single Select (Navigation)
```
┌─────────────────────────────────────────┐
│   Item one                              │
├─────────────────────────────────────────┤
│ ▌ Item two (selected)    ← highlight   │
├─────────────────────────────────────────┤
│   Item three                            │
└─────────────────────────────────────────┘
```

### Multi-Select (Checkboxes)
```
┌─────────────────────────────────────────┐
│ ☑  Item one                             │
│ ☐  Item two                             │
│ ☑  Item three                           │
└─────────────────────────────────────────┘
```

### Hover State
- Background color change (neutral-50)
- Reveal hidden actions
- Cursor pointer if clickable

---

## Interactive States

### Required States
- Default
- Hover
- Focus (keyboard)
- Selected/Active
- Disabled

### Visual Indicators
| State | Style |
|-------|-------|
| Default | White/transparent background |
| Hover | neutral-50 background |
| Focus | Focus ring (primary-500) |
| Selected | primary-50 background, left border |
| Disabled | Reduced opacity, not interactive |

---

## Actions in Lists

### Inline Actions
- 1-2 actions visible
- More actions in overflow menu
- Actions appear on hover (optional)

### Bulk Actions
- Appear when items selected
- Fixed position (top or bottom)
- Clear selection count

### Click Behavior
- Entire row clickable (if navigational)
- OR specific elements clickable
- Make click target clear

---

## Empty States

### No Items
```
┌─────────────────────────────────────────┐
│                                         │
│         No workflows yet                │
│                                         │
│    Workflows automate multi-step        │
│    tasks across your systems.           │
│                                         │
│         [Create workflow]               │
│                                         │
└─────────────────────────────────────────┘
```

### No Search Results
```
┌─────────────────────────────────────────┐
│                                         │
│    No workflows match "xyz"             │
│                                         │
│    Try adjusting your search or         │
│    [clear filters]                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## Loading States

### Initial Load
```
┌─────────────────────────────────────────┐
│ ████  ████████████████    ████████      │
│ ████  ████████████████    ████████      │
│ ████  ████████████████    ████████      │
└─────────────────────────────────────────┘
```

### Loading More
- Skeleton rows at bottom
- "Loading..." indicator
- Spinner in footer

---

## Virtualization (Long Lists)

### When to Use
- >100 items
- Performance concerns
- Infinite scroll

### Rules
- Virtualize render, not data
- Maintain scroll position
- Show loading indicator
- Announce to screen readers

---

## Mode-Specific Rules

### MODE_SAAS
- Comfortable spacing
- Clear visual hierarchy
- Leading icons/avatars help
- Prominent empty states

### MODE_INTERNAL
- Compact density allowed
- Dense information display
- Keyboard navigation expected
- Bulk actions common

### MODE_AGENTIC
- Status indicators prominent
- Timestamp/duration visible
- Error items visually distinct
- Quick access to logs/details

---

## Accessibility

### Requirements
- Semantic `<ul>` / `<li>` or `role="list"`
- Keyboard navigable (arrow keys)
- Focus visible
- Selection announced
- Interactive elements focusable

### Multi-Select
- Announce selection count
- "Select all" option
- Clear selection feedback

---

## Common Failures (Disallowed)

- Lists without any structure
- Clickable items without indication
- Hover actions with no keyboard equivalent
- No empty state
- Inconsistent item heights
- Too many inline actions
- No loading state

---

## Final List Check

Before shipping, ask:
- Can users scan items quickly?
- Is the primary info visible first?
- Are interactive elements obvious?
- Does keyboard navigation work?
- Are all states handled?

If not, refactor.

---

## END OF LISTS PATTERN
