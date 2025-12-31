# Pattern: Search & Command Palette — Authoritative

Search reduces friction. Users should find what they need in seconds.
If search feels slow or returns poor results, it has failed.

---

## Purpose

Search exists to:
- find specific items quickly
- reduce navigation burden
- surface relevant content
- accelerate power user workflows

Good search is invisible. Bad search is memorable.

---

## Search Types

### 1. Global Search (Header/Command Palette)
- Searches across entire product
- Keyboard triggered (Cmd/Ctrl + K)
- Returns mixed content types
- Primary search experience

### 2. Contextual Search (In-page)
- Searches within current view
- Filters existing content
- Immediate results
- Part of data tables/lists

### 3. Command Palette
- Actions + navigation + search
- Power user tool
- Keyboard-first
- Fast execution

---

## Global Search Structure

### Search Bar
```
┌───────────────────────────────────────────────┐
│ 🔍  Search workflows, runs, settings...       │
│     ↳ placeholder describes scope             │
└───────────────────────────────────────────────┘
```

### Results Panel
```
┌───────────────────────────────────────────────┐
│ 🔍  email campaign                            │
├───────────────────────────────────────────────┤
│ Workflows                                     │
│   📁 Email Campaign Workflow        →         │
│   📁 Campaign Analytics             →         │
├───────────────────────────────────────────────┤
│ Runs                                          │
│   ▶️ Email Campaign - Dec 15        →         │
│   ▶️ Email Campaign - Dec 14        →         │
├───────────────────────────────────────────────┤
│ Settings                                      │
│   ⚙️ Email notifications            →         │
└───────────────────────────────────────────────┘
```

---

## Command Palette

### Structure
```
┌───────────────────────────────────────────────┐
│ >  Create new workflow                        │
├───────────────────────────────────────────────┤
│ Actions                                       │
│   + Create new workflow           ⌘N          │
│   + Create new run                ⌘R          │
│   ⚙ Open settings                 ⌘,          │
├───────────────────────────────────────────────┤
│ Navigation                                    │
│   → Go to Dashboard               G D         │
│   → Go to Workflows               G W         │
│   → Go to Runs                    G R         │
├───────────────────────────────────────────────┤
│ Recent                                        │
│   📁 Email Campaign                           │
│   📁 Data Sync                                │
└───────────────────────────────────────────────┘
```

### Behavior
- Opens with Cmd/Ctrl + K
- Type to filter
- Arrow keys navigate
- Enter executes
- Escape closes
- Recent items shown by default

---

## Contextual Search (In-page Filter)

### Structure
```
┌─────────────────────────────────────────────────────┐
│ 🔍 Filter workflows...   [Status ▾] [Created ▾]    │
└─────────────────────────────────────────────────────┘
                    ↓ immediate filtering
┌─────────────────────────────────────────────────────┐
│ ✓ Email Campaign              Active    Dec 15     │
│ ✓ Data Sync                   Active    Dec 14     │
│   Backup Job                  Paused    Dec 10     │
└─────────────────────────────────────────────────────┘
```

### Rules
- Filter as user types
- Debounce input (150-300ms)
- Show result count
- Clear button when active
- Preserve filter on navigation back

---

## Search Input Design

### States
- Default (placeholder visible)
- Focus (ring, placeholder fades)
- Active (has value, clear button)
- Loading (spinner replaces icon)
- No results

### Required Elements
- Search icon (left)
- Clear button (right, when value)
- Placeholder text describing scope
- Keyboard shortcut hint

```
┌───────────────────────────────────────────────┐
│ 🔍  Search...                          ⌘K     │
└───────────────────────────────────────────────┘
       ↳ icon        ↳ placeholder    ↳ shortcut
```

---

## Search Results

### Grouping
- Group by content type
- Show type labels
- Limit per group (3-5)
- "See all" link for more

### Result Items
- Clear title/name
- Secondary info (type, date, status)
- Highlight matched terms
- Keyboard navigable

### No Results
```
┌───────────────────────────────────────────────┐
│ No results for "xyz"                          │
│                                               │
│ Try:                                          │
│ • Checking your spelling                      │
│ • Using fewer keywords                        │
│ • Searching for related terms                 │
└───────────────────────────────────────────────┘
```

---

## Keyboard Navigation

### Required
- `Cmd/Ctrl + K` opens search
- `Escape` closes
- `↑` `↓` navigate results
- `Enter` selects
- `Tab` moves between sections

### Optional (Power Users)
- Type-ahead selection
- Vim-style navigation (j/k)
- Direct shortcuts (G D for dashboard)

---

## Performance

### Targets
- Results visible: <100ms for local
- Results visible: <300ms for server
- Debounce: 150-300ms
- Max results shown: 10-20

### Loading States
- Show skeleton immediately
- Replace icon with spinner
- Never block input
- Cache recent queries

---

## Mode-Specific Rules

### MODE_SAAS
- Simple, clear search
- Helpful no-results messaging
- Recent/suggested shown
- Less command palette focus

### MODE_INTERNAL
- Full command palette
- Keyboard-first design
- Dense results acceptable
- Advanced filters available

### MODE_AGENTIC
- Search runs, logs, errors
- Filter by status
- Time-based search critical
- Quick access to failures

---

## Accessibility

### Requirements
- `role="combobox"` for search input
- `role="listbox"` for results
- `aria-expanded` state
- `aria-activedescendant` for selection
- Announce result count
- Screen reader can navigate results

### Focus Management
- Focus stays in input while navigating
- Focus moves to selected item on Enter
- Focus returns to trigger on close

---

## Common Failures (Disallowed)

- Search that requires page reload
- No keyboard shortcut
- Results that don't highlight matches
- Unclear result types
- Search hidden in menu
- No clear button when active
- No loading indicator
- Results that jump/reflow

---

## Final Search Check

Before shipping, ask:
- Can users find things in <3 seconds?
- Is the keyboard experience complete?
- Are results clearly categorized?
- Does empty state help users?
- Is search discoverable?

If not, refactor.

---

## END OF SEARCH PATTERN
