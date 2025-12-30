# Pattern: Detail Views — Authoritative

Detail views show everything about a single entity.
If users can't find what they need about an item, the detail view has failed.

---

## Purpose

Detail views exist to:
- display complete entity information
- enable entity-specific actions
- show related data and history
- provide editing capabilities

Detail views are not dashboards. They focus on one thing.

---

## When to Use

Use detail views when:
- User clicked through from a list/table
- Showing a single workflow, run, user, document
- Entity has multiple facets of information
- Actions are entity-specific

Do not use for:
- Aggregated data (use dashboards)
- Comparing multiple items (use tables)
- Creating new items (use forms/modals)

---

## Structure

### Standard Layout
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Workflows                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Email Campaign Workflow                             │
│ Created Dec 15, 2024 • Last run 2 hours ago         │
│                                                     │
│ [Edit]  [Run now]  [⋮ More]                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Overview │ Runs │ Settings │ Logs                   │
│ ─────────                                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Tab Content Area                                    │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Section 1                                       │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Section 2                                       │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Header Section

### Required Elements
- Back navigation (breadcrumb or link)
- Entity name (primary identifier)
- Key metadata (status, dates, owner)
- Primary actions

### Structure
```
┌─────────────────────────────────────────────────────┐
│ ← Back to [Parent]                                  │
│                                                     │
│ [Icon/Avatar]  Entity Name           [Status Badge] │
│                Subtitle / key metadata              │
│                                                     │
│ [Primary Action]  [Secondary]  [More ▾]             │
└─────────────────────────────────────────────────────┘
```

### Rules
- Back link always visible
- Entity name is largest text
- Status immediately visible
- Max 2-3 visible action buttons
- Overflow actions in dropdown

---

## Tab Navigation

### Use When
- Entity has distinct facets
- Content sections are parallel
- Users need different views

### Common Tabs
- **Overview** — summary, key info
- **Activity/History** — timeline, changes
- **Settings/Config** — editable properties
- **Related Items** — linked entities
- **Logs/Debug** — technical detail

### Rules
- Max 5-6 tabs
- Clear tab labels
- Active tab obvious
- Tab content loads without page refresh
- URL updates with tab (shareable)

---

## Content Organization

### Section Pattern
```
┌─────────────────────────────────────────────────────┐
│ Section Title                            [Action]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Content rows or cards                               │
│                                                     │
│ Label          Value                                │
│ Label          Value                                │
│ Label          Value                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Key-Value Display
```
Configuration
─────────────────────────────────────
API Endpoint        https://api.example.com
Retry Count         3
Timeout             30 seconds
Last Modified       Dec 15, 2024 at 2:30 PM
```

### Rules
- Group related information
- Consistent label alignment
- Values right-aligned or below label
- Empty values show "—" or "Not set"
- Actions per section if needed

---

## Sidebar Layout (Alternative)

### Use When
- Entity has persistent metadata
- Quick actions always needed
- Comparing info to main content

### Structure
```
┌────────────────────────────────────┬──────────────┐
│                                    │ Sidebar      │
│ Main Content Area                  │              │
│                                    │ Status       │
│ Tabs or scrollable sections        │ Owner        │
│                                    │ Created      │
│                                    │              │
│                                    │ Actions      │
│                                    │ [Edit]       │
│                                    │ [Delete]     │
└────────────────────────────────────┴──────────────┘
```

---

## Actions

### Primary Actions
- Most common action for this entity
- Prominent button in header
- Examples: Run, Edit, Publish

### Secondary Actions
- Less common but still important
- Secondary button style or dropdown
- Examples: Duplicate, Archive

### Destructive Actions
- Delete, disable, revoke
- Hidden in dropdown or separate section
- Require confirmation

### Rules
- Max 3 visible actions
- Destructive actions not primary
- Disabled actions explain why
- Actions reflect entity state

---

## Loading States

### Initial Load
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Workflows                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ████████████████                                    │
│ ██████████  ████████████                            │
│                                                     │
│ ████████  ████████                                  │
├─────────────────────────────────────────────────────┤
│ ████████  │ ████████  │ ████████                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ████████████████████████████████████████            │
│ ████████████████████████████████████████            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Rules
- Show skeleton that matches layout
- Header loads first if possible
- Tabs visible immediately
- Content skeletons per section

---

## Error States

### Entity Not Found
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Workflows                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│         Workflow not found                          │
│                                                     │
│         This workflow may have been deleted         │
│         or you may not have access.                 │
│                                                     │
│         [Go to Workflows]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Partial Load Failure
- Show what loaded
- Error message for failed section
- Retry option

---

## Mode-Specific Rules

### MODE_SAAS
- Clear, instructional headers
- Prominent status indicators
- Guided actions
- Help text for complex sections

### MODE_INTERNAL
- Dense information display
- Quick actions accessible
- Keyboard shortcuts
- Less explanatory text

### MODE_AGENTIC
- Run/execution history prominent
- Status timeline visible
- Logs accessible
- Error details expandable
- Retry/resume actions clear

---

## Mobile Considerations

### Adaptations
- Stack sidebar below content
- Tabs become horizontal scroll
- Actions in bottom bar or menu
- Sections collapsible
- Header simplified

---

## Accessibility

### Requirements
- Heading hierarchy (h1 for name, h2 for sections)
- Landmark regions
- Tab panels properly labeled
- Action buttons have clear labels
- Status communicated to screen readers

---

## Common Failures (Disallowed)

- No back navigation
- Cluttered header with too many actions
- Tabs that look like buttons
- Inconsistent section layouts
- Actions without clear state indication
- Missing empty states for sections
- Full-page loading spinner

---

## Final Detail View Check

Before shipping, ask:
- Can users find key info in 3 seconds?
- Is the primary action obvious?
- Does back navigation work?
- Are all states (loading, error, empty) handled?
- Is the layout consistent with other detail views?

If not, refactor.

---

## END OF DETAIL VIEWS PATTERN
