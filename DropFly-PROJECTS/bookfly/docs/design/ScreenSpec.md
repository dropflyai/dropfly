# BookFly Screen Specifications

## Overview

This document specifies all screens for BookFly across mobile and web platforms, including layouts, UI states, and key interactions.

---

## Mobile Screens

### Mobile Screen 1: Scanner Screen

**Purpose:** Capture receipt images using MS Lens-style document scanning
**Route:** `/scanner` (default home for quick capture)
**Platforms:** iOS, Android

---

#### Layout Description

```
┌─────────────────────────────────────────┐
│ ✕                              ⚡ ⚙️   │ ← Top bar (translucent)
├─────────────────────────────────────────┤
│                                         │
│        ┌─────────────────────┐          │
│        │                     │          │
│        │   CAMERA VIEWFINDER │          │
│        │                     │          │
│        │    ┌───────────┐    │          │ ← Edge detection overlay
│        │    │           │    │          │
│        │    │  RECEIPT  │    │          │
│        │    │           │    │          │
│        │    └───────────┘    │          │
│        │                     │          │
│        └─────────────────────┘          │
│                                         │
│          ┌─────────────────┐            │ ← Client indicator
│          │ 🏢 Mike's Co.  ▼│            │
│          └─────────────────┘            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   📷        ◉ CAPTURE         📁       │ ← Bottom controls
│  Batch     (large button)    Gallery   │
│                                         │
└─────────────────────────────────────────┘
```

**Components:**
- Full-screen camera viewfinder
- Edge detection overlay (blue/green corners)
- Client indicator pill (tappable)
- Capture button (large, prominent)
- Batch mode toggle
- Flash toggle
- Gallery access button
- Close/cancel button

---

#### UI States

**1. Default State**
- Camera active, viewfinder showing
- Edge detection overlay at neutral positions
- Client name displayed in pill
- Capture button enabled
- Batch indicator: "Single" or badge with count

**2. Loading State**
- Camera initializing spinner (on first load)
- "Accessing camera..." text
- Capture button disabled

**3. Empty State**
- N/A (scanner always shows camera)

**4. Error State**
- Camera permission denied:
  - Full-screen message: "Camera access needed"
  - Explanation text
  - "Open Settings" button
- Camera unavailable:
  - "Camera unavailable" message
  - "Use Gallery" button

**5. Success State**
- Edge detection found document:
  - Corners highlight green
  - Haptic feedback (subtle)
  - Auto-capture countdown (if enabled): "Capturing in 3..."
- After capture:
  - Brief flash animation
  - Navigate to preview OR show "Added!" toast (batch mode)

---

#### Key Interactions

| Interaction | Action | Result |
|-------------|--------|--------|
| Tap capture button | Capture current frame | Navigate to preview (or add to batch) |
| Tap client pill | Open client picker | Bottom sheet with client list |
| Tap batch toggle | Toggle batch mode | Badge appears, captures queue |
| Tap flash toggle | Cycle flash modes | Off → On → Auto |
| Tap gallery button | Open device gallery | Select image to process |
| Tap close (✕) | Exit scanner | Return to dashboard |
| Pinch gesture | Zoom camera | Digital zoom in/out |
| Long press capture | Multi-page mode | Continuous capture mode |

---

### Mobile Screen 2: Quick Review Screen

**Purpose:** Swipe-based review of AI-parsed transactions
**Route:** `/review`
**Platforms:** iOS, Android

---

#### Layout Description

```
┌─────────────────────────────────────────┐
│ ←  Review          3 of 8    ✓ Done    │ ← Header
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │      RECEIPT IMAGE              │    │
│  │      (scrollable/zoomable)      │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │ ← Swipeable card
│  │  Office Depot              🟢    │    │
│  │  ─────────────────────────────  │    │
│  │  Date:     Jan 15, 2025   🟢    │    │
│  │  Amount:   $127.43        🟢    │    │
│  │  Category: Office Supply  🟡    │    │
│  │  ─────────────────────────────  │    │
│  │  [Edit]              [Approve]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│     ← Swipe left to reject              │
│     Swipe right to approve →            │
│                                         │
└─────────────────────────────────────────┘
```

**Components:**
- Header with progress indicator
- Receipt image preview (top half)
- Transaction card (bottom half, swipeable)
- Confidence badges per field
- Edit and Approve buttons
- Swipe hint indicators

---

#### UI States

**1. Default State**
- Receipt image displayed
- Extracted data shown in card
- Confidence badges visible (green/yellow/red)
- Card centered, ready for swipe

**2. Loading State**
- Card skeleton loading
- "Parsing receipt..." text
- Spinner in card area
- Receipt image loading with blur-up

**3. Empty State**
- "All caught up!" message
- Checkmark illustration
- "Scan More" button
- "Go to Dashboard" secondary action

**4. Error State**
- Parsing failed:
  - Red error card
  - "Couldn't read this receipt"
  - "Enter Manually" button
  - "Skip" secondary button
- Network error:
  - "Offline - saved locally"
  - Data shown but flagged

**5. Success State**
- Card swipe animation completes
- Checkmark animation
- Next card slides in
- Progress updates
- On last card: "All reviewed!" celebration

---

#### Key Interactions

| Interaction | Action | Result |
|-------------|--------|--------|
| Swipe card right | Approve transaction | Add to sync queue, next card |
| Swipe card left | Reject transaction | Move to rejected, next card |
| Tap "Edit" | Open edit modal | Half-sheet with form |
| Tap "Approve" | Same as swipe right | Approve without gesture |
| Tap receipt image | Full-screen view | Zoomable image modal |
| Tap confidence badge | Show explanation | Tooltip with AI reasoning |
| Tap "Done" | Exit review | Navigate to sync or dashboard |
| Pull down | Refresh queue | Fetch new items |

---

### Mobile Screen 3: Clients Screen

**Purpose:** View and manage all connected clients
**Route:** `/clients`
**Platforms:** iOS, Android

---

#### Layout Description

```
┌─────────────────────────────────────────┐
│          Clients              + Add     │ ← Header
├─────────────────────────────────────────┤
│ 🔍 Search clients...                    │ ← Search bar
├─────────────────────────────────────────┤
│                                         │
│  RECENT                                 │
│  ┌─────────────────────────────────┐    │
│  │ 🏢 Mike's Construction     (12) │    │
│  │    ● Connected · Last: 2h ago   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ALL CLIENTS                            │
│  ┌─────────────────────────────────┐    │
│  │ 🍕 Antonio's Pizza         (28) │    │
│  │    ● Connected · Last: 1d ago   │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 🔧 Davis Plumbing          (5)  │    │
│  │    ○ Reconnect needed           │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 💼 Smith Consulting        (0)  │    │
│  │    ● Connected · Up to date     │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

**Components:**
- Header with "Add Client" action
- Search input
- "Recent" section (last 3 used)
- "All Clients" section (alphabetical)
- Client list items with status

---

#### UI States

**1. Default State**
- Search bar visible
- Recent clients shown (if any)
- All clients listed alphabetically
- Pending counts as badges
- Connection status indicators

**2. Loading State**
- Skeleton list items
- Search disabled
- Pull-to-refresh spinner

**3. Empty State**
- No clients yet:
  - Illustration (clipboard with checkmark)
  - "Add your first client"
  - "Connect QuickBooks to get started"
  - "Add Client" button

**4. Error State**
- Failed to load:
  - Error message
  - "Retry" button
- Client with error:
  - Red indicator
  - "Reconnect" label

**5. Success State**
- Client added:
  - Appears at top of list
  - Success toast
- Connection restored:
  - Green indicator
  - "Connected" label

---

#### Key Interactions

| Interaction | Action | Result |
|-------------|--------|--------|
| Tap client row | Open client detail | Navigate to client dashboard |
| Tap "+ Add" | Add new client | Navigate to add client flow |
| Type in search | Filter list | Show matching clients |
| Long press client | Show options | Action sheet (Edit, Delete) |
| Swipe client left | Show delete | Reveal delete button |
| Tap pending badge | Go to review | Navigate to Review Queue filtered |
| Tap "Reconnect" | Start OAuth | Begin reconnection flow |
| Pull down | Refresh list | Sync status updates |

---

### Mobile Screen 4: Dashboard Screen

**Purpose:** Overview of activity, quick actions, sync status
**Route:** `/dashboard`
**Platforms:** iOS, Android

---

#### Layout Description

```
┌─────────────────────────────────────────┐
│ BookFly                         ⚙️      │ ← Header
│ 🏢 Mike's Construction ▼                │ ← Client switcher
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐ ┌──────────┐              │
│  │   12     │ │    3     │              │ ← Stats cards
│  │ Pending  │ │  Synced  │              │
│  │ Review   │ │  Today   │              │
│  └──────────┘ └──────────┘              │
│                                         │
│  QUICK ACTIONS                          │
│  ┌─────────────────────────────────┐    │
│  │  📷  Scan Receipts              │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  ✓  Review Queue (12)           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  RECENT ACTIVITY                        │
│  ┌─────────────────────────────────┐    │
│  │ Office Depot    $127.43  ✓ 2m   │    │
│  │ Home Depot      $89.00   ✓ 15m  │    │
│  │ Staples         $45.20   ⚠ err  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  SYNC STATUS                            │
│  ┌─────────────────────────────────┐    │
│  │ ● All synced · Last: 2 min ago  │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

**Components:**
- Client switcher (header)
- Stats cards (Pending, Synced Today)
- Quick actions (Scan, Review)
- Recent activity list
- Sync status indicator

---

#### UI States

**1. Default State**
- Current client displayed
- Stats populated
- Quick actions enabled
- Recent activity list shown
- Sync status: "All synced"

**2. Loading State**
- Stats cards show skeletons
- Recent activity loading shimmer
- Actions enabled (cached data)

**3. Empty State**
- New client, no activity:
  - Stats show "0"
  - "No activity yet"
  - "Scan your first receipt" CTA

**4. Error State**
- Sync errors present:
  - Error badge on stats
  - "1 sync error" warning
  - Red item in activity
  - "View Errors" action

**5. Success State**
- Just synced:
  - "Synced!" toast
  - Activity updates
  - Timestamp refreshes

---

#### Key Interactions

| Interaction | Action | Result |
|-------------|--------|--------|
| Tap client name | Switch clients | Open client picker |
| Tap "Scan Receipts" | Open scanner | Navigate to scanner |
| Tap "Review Queue" | Open review | Navigate to review screen |
| Tap Pending stat | Go to review | Navigate to review queue |
| Tap activity row | View detail | Open transaction detail |
| Tap error item | View error | Open error detail modal |
| Tap sync status | Force sync | Trigger manual sync |
| Pull down | Refresh all | Update stats, activity, sync |

---

### Mobile Screen 5: Settings Screen

**Purpose:** App preferences and account management
**Route:** `/settings`
**Platforms:** iOS, Android

---

#### Layout Description

```
┌─────────────────────────────────────────┐
│ ←  Settings                             │ ← Header
├─────────────────────────────────────────┤
│                                         │
│  ACCOUNT                                │
│  ┌─────────────────────────────────┐    │
│  │ 👤 Sarah Chen                   │    │
│  │    sarah@chenbooks.com          │    │
│  │    [Edit Profile]               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  SCANNER SETTINGS                       │
│  ┌─────────────────────────────────┐    │
│  │ Auto-capture           [toggle] │    │
│  │ Shutter sound          [toggle] │    │
│  │ Save to device         [toggle] │    │
│  │ Image quality             High ▶│    │
│  └─────────────────────────────────┘    │
│                                         │
│  SYNC SETTINGS                          │
│  ┌─────────────────────────────────┐    │
│  │ Auto-sync              [toggle] │    │
│  │ Sync on WiFi only      [toggle] │    │
│  │ Sync frequency        Instant ▶│    │
│  └─────────────────────────────────┘    │
│                                         │
│  SUPPORT                                │
│  ┌─────────────────────────────────┐    │
│  │ Help Center                    ▶│    │
│  │ Contact Support                ▶│    │
│  │ Send Feedback                  ▶│    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Sign Out]                             │
│                                         │
│  Version 1.0.0 (Build 42)               │
│                                         │
└─────────────────────────────────────────┘
```

**Components:**
- Account section with profile
- Scanner settings (auto-capture, sound, etc.)
- Sync settings (auto-sync, WiFi only)
- Support section
- Sign out button
- Version info

---

#### UI States

**1. Default State**
- All settings loaded
- Toggles reflect current state
- User info displayed

**2. Loading State**
- Settings loading shimmer
- Profile loading

**3. Empty State**
- N/A (settings always have defaults)

**4. Error State**
- Failed to save:
  - Error toast
  - Setting reverts
  - "Retry" option

**5. Success State**
- Setting saved:
  - Checkmark animation on toggle
  - Or "Saved" toast for complex changes

---

#### Key Interactions

| Interaction | Action | Result |
|-------------|--------|--------|
| Tap "Edit Profile" | Edit profile | Open profile edit modal |
| Toggle auto-capture | Enable/disable | Save immediately |
| Tap "Image quality" | Select quality | Action sheet (Low/Medium/High) |
| Tap "Help Center" | Open help | Open in-app browser |
| Tap "Contact Support" | Contact us | Open email/chat |
| Tap "Sign Out" | Log out | Confirmation, then sign out |

---

## Web Screens

### Web Screen 1: Dashboard

**Purpose:** All-clients overview with aggregate stats
**Route:** `/dashboard`
**Platform:** Web (responsive)

---

#### Layout Description

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🦋 BookFly   Dashboard   Review   Clients   History   Settings    👤 Sarah │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │     47      │ │     23      │ │    98.2%    │ │      2      │           │
│  │   Pending   │ │   Synced    │ │  Accuracy   │ │   Errors    │           │
│  │   Review    │ │   Today     │ │   (7 day)   │ │   ⚠        │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                             │
│  CLIENTS                                    [Filter ▼]  [+ Add Client]     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │   │
│  │  │ Mike's Constr.   │  │ Antonio's Pizza  │  │ Davis Plumbing   │  │   │
│  │  │ ───────────────  │  │ ───────────────  │  │ ───────────────  │  │   │
│  │  │ 12 pending       │  │ 28 pending       │  │ 5 pending        │  │   │
│  │  │ ● Connected      │  │ ● Connected      │  │ ○ Reconnect      │  │   │
│  │  │ Last: 2h ago     │  │ Last: 1d ago     │  │                  │  │   │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │   │
│  │  │ Smith Consult.   │  │ Green Landscap.  │  │ + Add Client     │  │   │
│  │  │ ───────────────  │  │ ───────────────  │  │                  │  │   │
│  │  │ 0 pending ✓      │  │ 2 pending        │  │                  │  │   │
│  │  │ ● Connected      │  │ ● Connected      │  │                  │  │   │
│  │  │ Up to date       │  │ Last: 3h ago     │  │                  │  │   │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Global navigation header
- Aggregate stats cards (all clients)
- Client cards grid
- Filter dropdown (All/Pending/Errors)
- Add Client button

---

#### UI States

**1. Default State**
- Stats loaded and displayed
- All client cards visible
- Green indicators for healthy connections
- Badge counts on cards with pending items

**2. Loading State**
- Skeleton stats cards
- Skeleton client cards
- Navigation active

**3. Empty State**
- No clients:
  - Welcome message
  - "Get started by adding your first client"
  - Large "Add Client" button
  - Setup guide steps

**4. Error State**
- API error:
  - Error banner at top
  - "Couldn't load data. Retry?"
  - Retry button
- Client errors:
  - Red badge on affected cards
  - "2 Errors" stat highlighted

**5. Success State**
- Recently synced:
  - "Last sync: Just now"
  - Green checkmarks
- All caught up:
  - "All clients up to date" message
  - Celebration subtle animation

---

#### Key Interactions

| Interaction | Action | Result |
|-------------|--------|--------|
| Click client card | View client | Navigate to client detail/review |
| Click pending stat | View all pending | Navigate to review queue (all clients) |
| Click error stat | View errors | Navigate to errors view |
| Click "+ Add Client" | Add client | Open add client modal |
| Click filter | Filter cards | Show only matching clients |
| Hover client card | Show actions | Reveal quick action buttons |
| Click "Reconnect" | Fix connection | Start OAuth flow |

---

### Web Screen 2: Review Queue

**Purpose:** Efficiently review and approve transactions in bulk
**Route:** `/review`
**Platform:** Web (responsive)

---

#### Layout Description

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🦋 BookFly   Dashboard   Review   Clients   History   Settings    👤 Sarah │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Review Queue                                          Client: [All ▼]     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Filters:  Date [▼]  Confidence [▼]  Category [▼]   🔍 Search      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─ ACTION BAR (when items selected) ──────────────────────────────────┐   │
│  │  ☑ 5 selected     [✓ Approve Selected]  [✕ Reject]  [Clear]       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───┬────────────┬─────────────────┬──────────┬───────────┬────────┬───┐ │
│  │ ☐ │    Date    │     Vendor      │  Amount  │  Category │ Conf.  │   │ │
│  ├───┼────────────┼─────────────────┼──────────┼───────────┼────────┼───┤ │
│  │ ☐ │ Jan 15     │ Office Depot    │  $127.43 │ Supplies  │  🟢 95 │ ⋮ │ │
│  │ ☑ │ Jan 14     │ Home Depot      │   $89.00 │ Materials │  🟢 92 │ ⋮ │ │
│  │ ☑ │ Jan 14     │ Staples         │   $45.20 │ Supplies  │  🟡 78 │ ⋮ │ │
│  │ ☐ │ Jan 13     │ Amazon          │  $234.99 │ Equipment │  🟡 71 │ ⋮ │ │
│  │ ☐ │ Jan 12     │ Unknown Vendor  │   $12.50 │ [Select]  │  🔴 45 │ ⋮ │ │
│  └───┴────────────┴─────────────────┴──────────┴───────────┴────────┴───┘ │
│                                                                             │
│  Showing 1-25 of 47                            [◀ Prev]  [Next ▶]          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  DETAIL PANEL (appears when row selected)                           [✕]   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌───────────────────┐                                             │   │
│  │  │                   │   Vendor:   [Office Depot        ]          │   │
│  │  │   RECEIPT IMAGE   │   Date:     [Jan 15, 2025       ]          │   │
│  │  │                   │   Amount:   [$127.43            ]          │   │
│  │  │   (zoomable)      │   Category: [Office Supplies   ▼]          │   │
│  │  │                   │   Memo:     [Printer paper, ink ]          │   │
│  │  └───────────────────┘                                             │   │
│  │                                     [Reject]  [Save]  [Approve]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Filter bar (date, confidence, category, search)
- Client dropdown
- Action bar (appears on selection)
- Transaction table
- Detail panel (slides in on selection)
- Pagination

---

#### UI States

**1. Default State**
- All pending transactions listed
- Sortable columns
- Confidence badges colored
- No selection, action bar hidden

**2. Loading State**
- Table skeleton rows
- Filters disabled
- Loading spinner in table area

**3. Empty State**
- No pending transactions:
  - Checkmark illustration
  - "All caught up!"
  - "No transactions pending review"
  - "Go to Dashboard" button

**4. Error State**
- Load error:
  - Error message in table area
  - "Retry" button
- Row-level error:
  - Red highlight on row
  - Error icon in status column

**5. Success State**
- Bulk approve:
  - Success toast
  - Rows animate out
  - Count updates
- Single approve:
  - Row highlights green briefly
  - Moves to synced

---

#### Key Interactions

| Interaction | Action | Result |
|-------------|--------|--------|
| Click row | Select + show detail | Detail panel opens |
| Click checkbox | Toggle selection | Update action bar |
| Shift+click | Range select | Select all between |
| Click column header | Sort by column | Re-sort table |
| Click "Approve Selected" | Bulk approve | Confirmation, then process |
| Edit field in panel | Update value | Save button enables |
| Click "Approve" in panel | Approve single | Move to sync queue |
| Press `j` / `k` | Navigate rows | Move selection up/down |
| Press `a` | Approve selected | Same as button |
| Press `Space` | Toggle selection | Select/deselect row |

---

### Web Screen 3: Client Detail

**Purpose:** Deep dive into single client's transactions and metrics
**Route:** `/clients/:clientId`
**Platform:** Web

---

#### Layout Description

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🦋 BookFly   Dashboard   Review   Clients   History   Settings    👤 Sarah │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ← Back to Dashboard                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🏢 Mike's Construction                              [Edit] [⋮]   │   │
│  │     QuickBooks: Mike's Construction LLC                            │   │
│  │     ● Connected · Last sync: 2 hours ago                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐                   │
│  │    12     │ │   156     │ │   98.5%   │ │    0      │                   │
│  │  Pending  │ │  This Mo. │ │  Accuracy │ │  Errors   │                   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘                   │
│                                                                             │
│  ┌─── TABS ────────────────────────────────────────────────────────────┐   │
│  │  [Pending (12)]   [Synced]   [Rejected]   [All]                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ (Same table structure as Review Queue, filtered to this client)    │   │
│  │                                                                     │   │
│  │  Date    │   Vendor      │  Amount  │  Category   │  Status       │   │
│  │  Jan 15  │ Office Depot  │  $127.43 │ Supplies    │  Pending      │   │
│  │  Jan 14  │ Home Depot    │   $89.00 │ Materials   │  Pending      │   │
│  │  ...                                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ACCURACY TREND                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Line chart showing AI accuracy over time]                        │   │
│  │  98% ────────────────────────────────────                          │   │
│  │  95%     /\      /\                                                │   │
│  │  90%    /  \    /  \                                               │   │
│  │        Week 1  Week 2  Week 3  Week 4                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Client header with connection status
- Stats cards (client-specific)
- Tab navigation (Pending/Synced/Rejected/All)
- Transaction table (filtered to client)
- Accuracy trend chart

---

#### UI States

**1. Default State**
- Client info loaded
- Stats populated
- Default tab: Pending
- Transactions listed

**2. Loading State**
- Header skeleton
- Stats skeletons
- Table skeleton rows

**3. Empty State**
- No transactions for tab:
  - "No pending transactions"
  - Or "No synced transactions yet"

**4. Error State**
- Connection issue:
  - Yellow/red indicator
  - "Connection issue" message
  - "Reconnect" button

**5. Success State**
- Just synced:
  - "Synced!" toast
  - Stats update
  - Transactions move tabs

---

### Web Screen 4: History

**Purpose:** View all synced transactions with audit trail
**Route:** `/history`
**Platform:** Web

---

#### Layout Description

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🦋 BookFly   Dashboard   Review   Clients   History   Settings    👤 Sarah │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Transaction History                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Client: [All ▼]   Date: [Last 30 days ▼]   Status: [Synced ▼]     │   │
│  │                                                                     │   │
│  │ 🔍 Search transactions...                              [Export CSV]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────┬─────────────┬─────────────────┬──────────┬─────────────┐   │
│  │  Client   │    Date     │     Vendor      │  Amount  │   Synced    │   │
│  ├───────────┼─────────────┼─────────────────┼──────────┼─────────────┤   │
│  │ Mike's    │ Jan 15      │ Office Depot    │  $127.43 │ ✓ 2h ago    │   │
│  │ Mike's    │ Jan 14      │ Home Depot      │   $89.00 │ ✓ 5h ago    │   │
│  │ Antonio's │ Jan 14      │ Sysco Foods     │  $456.78 │ ✓ 1d ago    │   │
│  │ Davis     │ Jan 13      │ Home Depot      │  $234.00 │ ✓ 2d ago    │   │
│  │ Antonio's │ Jan 13      │ Restaurant Depot│  $789.00 │ ✓ 2d ago    │   │
│  └───────────┴─────────────┴─────────────────┴──────────┴─────────────┘   │
│                                                                             │
│  Showing 1-50 of 1,247                         [◀ Prev]  [Next ▶]          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MONTHLY SUMMARY                                                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                            │   │
│  │  │ $12,456  │ │   247    │ │   98.2%  │                            │   │
│  │  │  Total   │ │  Trans.  │ │ Accuracy │                            │   │
│  │  │ Synced   │ │  Synced  │ │          │                            │   │
│  │  └──────────┘ └──────────┘ └──────────┘                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Filter bar (client, date range, status)
- Search input
- Export CSV button
- History table
- Pagination
- Monthly summary stats

---

#### UI States

**1. Default State**
- Last 30 days shown
- All clients included
- Sorted by sync date (newest first)

**2. Loading State**
- Table skeleton
- Stats loading

**3. Empty State**
- No history:
  - "No transactions synced yet"
  - "Start by scanning receipts in the mobile app"

**4. Error State**
- Load error:
  - Error message
  - Retry button

**5. Success State**
- Export complete:
  - "Downloaded: bookfly-export-2025-01.csv"

---

### Web Screen 5: Settings

**Purpose:** Account and app preferences
**Route:** `/settings`
**Platform:** Web

---

#### Layout Description

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🦋 BookFly   Dashboard   Review   Clients   History   Settings    👤 Sarah │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Settings                                                                   │
│                                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────────────────────┐  │
│  │                     │  │                                             │  │
│  │  NAVIGATION        │  │  PROFILE                                    │  │
│  │  ───────────────   │  │                                             │  │
│  │  ▸ Profile         │  │  Name         [Sarah Chen              ]   │  │
│  │    Connections     │  │  Email        [sarah@chenbooks.com    ]   │  │
│  │    Notifications   │  │  Company      [Chen Bookkeeping       ]   │  │
│  │    Sync Settings   │  │  Phone        [(555) 123-4567         ]   │  │
│  │    Security        │  │                                             │  │
│  │    Billing         │  │                           [Save Changes]   │  │
│  │                     │  │                                             │  │
│  │                     │  ├─────────────────────────────────────────────┤  │
│  │                     │  │                                             │  │
│  │                     │  │  PASSWORD                                   │  │
│  │                     │  │                                             │  │
│  │                     │  │  Current      [••••••••••             ]   │  │
│  │                     │  │  New          [                       ]   │  │
│  │                     │  │  Confirm      [                       ]   │  │
│  │                     │  │                                             │  │
│  │                     │  │                        [Change Password]   │  │
│  │                     │  │                                             │  │
│  └─────────────────────┘  └─────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Settings Sections:**

**Profile:** Name, email, company, phone
**Connections:** Manage QB connections, add/remove
**Notifications:** Email preferences, alerts
**Sync Settings:** Auto-sync, frequency, batch size
**Security:** Password, 2FA, sessions
**Billing:** Plan, payment method, invoices

---

#### UI States

**1. Default State**
- Current settings loaded
- Form pre-populated
- Save buttons disabled (no changes)

**2. Loading State**
- Form fields loading
- Skeleton inputs

**3. Empty State**
- N/A (always has defaults)

**4. Error State**
- Save failed:
  - Error message below form
  - Field-level errors highlighted

**5. Success State**
- Saved:
  - "Settings saved" toast
  - Green checkmark animation

---

*Last Updated: January 2025*
