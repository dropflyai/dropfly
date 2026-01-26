# BookFly Component Specifications

## Overview

This document specifies all reusable UI components for BookFly, including props, variants, and interaction states. Components are designed for both mobile (React Native) and web (React) implementations.

---

## Component 1: DocumentScanner

**Purpose:** MS Lens-style camera interface for capturing receipt images with edge detection
**Platform:** Mobile only (React Native with expo-camera)

---

### Component Preview

```
┌─────────────────────────────────────────┐
│                                         │
│    ┌─────────────────────────────┐      │
│    │                             │      │
│    │      CAMERA VIEWFINDER      │      │
│    │                             │      │
│    │   ╔═══════════════════╗     │      │
│    │   ║                   ║     │      │
│    │   ║    DOCUMENT       ║     │      │  ← Edge detection overlay
│    │   ║                   ║     │      │
│    │   ╚═══════════════════╝     │      │
│    │                             │      │
│    └─────────────────────────────┘      │
│                                         │
│        ┌───────────────────┐            │
│        │ 🏢 Client Name  ▼ │            │  ← Client indicator
│        └───────────────────┘            │
│                                         │
│    ⚡      ◉  CAPTURE        📷        │  ← Controls
│   Flash     (button)       Batch       │
│                                         │
└─────────────────────────────────────────┘
```

---

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `clientId` | `string` | required | Current client ID for context |
| `clientName` | `string` | required | Display name for client indicator |
| `onCapture` | `(image: CapturedImage) => void` | required | Callback when image captured |
| `onClientSwitch` | `() => void` | required | Open client picker |
| `onClose` | `() => void` | required | Close scanner |
| `batchMode` | `boolean` | `false` | Enable batch capture mode |
| `onBatchToggle` | `(enabled: boolean) => void` | - | Batch mode change callback |
| `batchCount` | `number` | `0` | Current batch count (badge) |
| `autoCapture` | `boolean` | `false` | Auto-capture when document stable |
| `autoCaptureDelay` | `number` | `1500` | Milliseconds to wait before auto-capture |
| `flashMode` | `'off' \| 'on' \| 'auto'` | `'auto'` | Camera flash setting |
| `showGuideOverlay` | `boolean` | `true` | Show positioning guide |

---

### CapturedImage Type

```typescript
interface CapturedImage {
  uri: string;           // Local file URI
  width: number;         // Image width in pixels
  height: number;        // Image height in pixels
  corners: Corner[];     // Detected document corners
  timestamp: number;     // Capture timestamp
  clientId: string;      // Associated client
}

interface Corner {
  x: number;  // 0-1 normalized coordinate
  y: number;  // 0-1 normalized coordinate
}
```

---

### States

#### 1. Default State
- Camera active, viewfinder showing
- Edge detection overlay at neutral (corners at screen edges, dimmed)
- Client name displayed
- Capture button enabled, blue

#### 2. Document Detected
- Edge detection overlay snaps to document edges
- Corners highlight blue/teal
- Light haptic feedback
- If autoCapture: countdown starts

#### 3. Ready to Capture
- Document stable for 500ms+
- Overlay turns green
- Stronger haptic pulse
- Caption: "Hold steady" or "Tap to capture"

#### 4. Capturing
- Flash fires (if enabled)
- Shutter animation (white flash overlay)
- Capture button shows spinner briefly
- Haptic confirmation

#### 5. Batch Mode Active
- Badge shows count: "3"
- Capture button returns to ready immediately
- Toast: "Added to batch"

#### 6. Error State
- Camera permission denied: Full-screen message with "Open Settings" button
- Camera unavailable: "Camera not available" message

---

### Edge Detection Overlay Sub-component

```typescript
interface EdgeOverlayProps {
  corners: Corner[];           // 4 corners of detected document
  state: 'searching' | 'detected' | 'ready';
  showGrid?: boolean;          // Show rule-of-thirds grid
}
```

**Visual Behavior:**
- `searching`: Corners at fixed positions, semi-transparent, white
- `detected`: Corners animate to document, blue (#2563EB), connecting lines appear
- `ready`: Corners and lines turn green (#10B981), subtle pulse animation

---

### Interactions

| Interaction | Behavior |
|-------------|----------|
| Tap capture button | Capture current frame, call `onCapture` |
| Tap client indicator | Call `onClientSwitch` |
| Tap flash button | Cycle: off → on → auto |
| Tap batch toggle | Toggle batch mode, call `onBatchToggle` |
| Long press capture | Enter multi-page mode (continuous capture) |
| Pinch gesture | Digital zoom (1x-3x) |
| Tap screen (not button) | Manual focus point |

---

## Component 2: TransactionCard

**Purpose:** Swipeable card displaying transaction data for mobile review
**Platform:** Mobile (React Native with gesture handler)

---

### Component Preview

```
┌─────────────────────────────────────────┐
│                                         │
│  Office Depot                      🟢   │  ← Vendor + confidence badge
│  ─────────────────────────────────────  │
│                                         │
│  Date        Jan 15, 2025         🟢   │
│  Amount      $127.43              🟢   │
│  Category    Office Supplies      🟡   │  ← Yellow = medium confidence
│  Tax         $8.43                🟢   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [Edit]                     [Approve]   │  ← Action buttons
│                                         │
└─────────────────────────────────────────┘

← Swipe left: Reject    Swipe right: Approve →
```

---

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transaction` | `Transaction` | required | Transaction data object |
| `receiptImageUri` | `string` | - | URI to receipt image |
| `onApprove` | `(id: string) => void` | required | Called on approve action |
| `onReject` | `(id: string) => void` | required | Called on reject action |
| `onEdit` | `(id: string) => void` | required | Called to open edit modal |
| `onImageTap` | `() => void` | - | Called when receipt image tapped |
| `swipeEnabled` | `boolean` | `true` | Enable swipe gestures |
| `showReceipt` | `boolean` | `true` | Show receipt image above card |
| `loading` | `boolean` | `false` | Show loading skeleton |

---

### Transaction Type

```typescript
interface Transaction {
  id: string;
  vendor: string;
  vendorConfidence: number;      // 0-100
  date: string;                  // ISO date string
  dateConfidence: number;
  amount: number;
  amountConfidence: number;
  category: string | null;
  categoryConfidence: number;
  tax?: number;
  taxConfidence?: number;
  memo?: string;
  flags?: TransactionFlag[];
  status: 'pending' | 'approved' | 'rejected' | 'synced' | 'error';
}

interface TransactionFlag {
  type: 'warning' | 'error' | 'info';
  message: string;
}
```

---

### Variants

#### 1. Default Card
- Full data display
- All fields visible
- Swipe enabled

#### 2. Compact Card
- Single-line display: "Office Depot • $127.43 • Jan 15"
- Used in lists/history

#### 3. Skeleton Card
- Loading state
- Shimmer animation on all fields

#### 4. Error Card
- Red border
- Error flag displayed prominently
- "Fix Required" badge

---

### States

#### 1. Default
- Card at rest, centered
- All data visible
- Buttons enabled

#### 2. Swiping Right (Approve)
- Card rotates slightly clockwise
- Green checkmark fades in on right
- Background tints green

#### 3. Swiping Left (Reject)
- Card rotates slightly counter-clockwise
- Red X fades in on left
- Background tints red

#### 4. Approved
- Card animates right and fades out
- Success haptic
- Next card slides in

#### 5. Rejected
- Card animates left and fades out
- Next card slides in

#### 6. Editing
- Card dimmed/blurred
- Edit modal overlays

---

### Interactions

| Interaction | Behavior |
|-------------|----------|
| Swipe right (>40%) | Approve transaction |
| Swipe left (>40%) | Reject transaction |
| Tap "Edit" | Call `onEdit`, open modal |
| Tap "Approve" | Same as swipe right |
| Tap receipt image | Call `onImageTap`, full-screen view |
| Tap confidence badge | Show tooltip with AI reasoning |

---

## Component 3: ReviewTable

**Purpose:** Web table for reviewing transactions with selection, sorting, and filtering
**Platform:** Web (React)

---

### Component Preview

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ┌─ Action Bar (visible when selected) ─────────────────────────────────┐ │
│ │  ☑ 5 selected    [Approve]  [Reject]  [Clear Selection]              │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌─ Table Header ───────────────────────────────────────────────────────┐ │
│ │ ☐ │ Date ↓     │ Vendor          │ Amount    │ Category  │ Conf │   │ │
│ ├───┼────────────┼─────────────────┼───────────┼───────────┼──────┼───┤ │
│ │ ☐ │ Jan 15     │ Office Depot    │   $127.43 │ Supplies  │ 🟢95 │ ⋮ │ │
│ │ ☑ │ Jan 14     │ Home Depot      │    $89.00 │ Materials │ 🟢92 │ ⋮ │ │
│ │ ☑ │ Jan 14     │ Staples         │    $45.20 │ Supplies  │ 🟡78 │ ⋮ │ │
│ │ ☐ │ Jan 13     │ Amazon          │   $234.99 │ Equipment │ 🟡71 │ ⋮ │ │
│ │ ☐ │ Jan 12     │ [Unknown]       │    $12.50 │ [Select]  │ 🔴45 │ ⋮ │ │
│ └───┴────────────┴─────────────────┴───────────┴───────────┴──────┴───┘ │
│                                                                           │
│ Showing 1-25 of 47                              [< Prev]  [Next >]       │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transactions` | `Transaction[]` | required | Array of transactions |
| `selectedIds` | `string[]` | `[]` | Currently selected transaction IDs |
| `onSelectionChange` | `(ids: string[]) => void` | required | Selection change callback |
| `onRowClick` | `(id: string) => void` | - | Row click callback |
| `onApprove` | `(ids: string[]) => void` | required | Bulk approve callback |
| `onReject` | `(ids: string[]) => void` | required | Bulk reject callback |
| `sortColumn` | `string` | `'date'` | Current sort column |
| `sortDirection` | `'asc' \| 'desc'` | `'desc'` | Sort direction |
| `onSort` | `(column: string) => void` | - | Sort change callback |
| `loading` | `boolean` | `false` | Show loading state |
| `emptyMessage` | `string` | `'No transactions'` | Empty state message |
| `pageSize` | `number` | `25` | Rows per page |
| `currentPage` | `number` | `1` | Current page number |
| `totalCount` | `number` | `0` | Total transaction count |
| `onPageChange` | `(page: number) => void` | - | Page change callback |

---

### Column Configuration

```typescript
interface TableColumn {
  key: string;
  header: string;
  sortable: boolean;
  width?: string;
  render?: (value: any, row: Transaction) => React.ReactNode;
}

const defaultColumns: TableColumn[] = [
  { key: 'select', header: '', sortable: false, width: '48px' },
  { key: 'date', header: 'Date', sortable: true, width: '120px' },
  { key: 'vendor', header: 'Vendor', sortable: true },
  { key: 'amount', header: 'Amount', sortable: true, width: '120px' },
  { key: 'category', header: 'Category', sortable: true, width: '150px' },
  { key: 'confidence', header: 'Conf', sortable: true, width: '80px' },
  { key: 'actions', header: '', sortable: false, width: '48px' },
];
```

---

### States

#### 1. Default
- Data loaded
- No selection
- Action bar hidden

#### 2. Loading
- Skeleton rows (5-10)
- Shimmer animation
- Headers visible but not interactive

#### 3. Empty
- Empty state illustration
- Custom message
- Optional CTA button

#### 4. Selection Active
- Selected rows highlighted (blue tint)
- Action bar visible
- Selection count displayed

#### 5. Row Hover
- Background lightens
- Row actions visible (⋮ menu)

#### 6. Row Focus
- Keyboard focus ring
- Arrow keys navigate

---

### Interactions

| Interaction | Behavior |
|-------------|----------|
| Click checkbox | Toggle row selection |
| Click header checkbox | Select/deselect all visible |
| Shift+click checkbox | Range select |
| Click sortable header | Toggle sort |
| Click row | Call `onRowClick`, open detail |
| Click ⋮ menu | Show row actions dropdown |
| Press `j` / `k` | Move focus down/up |
| Press `Space` | Toggle current row selection |
| Press `a` | Approve selected |

---

## Component 4: ConfidenceBadge

**Purpose:** Display AI confidence score with color coding
**Platform:** Both (React Native & React)

---

### Component Preview

```
High (90+):    ┌──────────┐
               │  🟢 95%  │
               └──────────┘

Medium (70-89): ┌──────────┐
                │  🟡 78%  │
                └──────────┘

Low (<70):     ┌──────────┐
               │  🔴 45%  │
               └──────────┘
```

---

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `score` | `number` | required | Confidence score 0-100 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size |
| `showLabel` | `boolean` | `true` | Show percentage label |
| `showIcon` | `boolean` | `true` | Show colored dot/icon |
| `variant` | `'badge' \| 'inline' \| 'dot'` | `'badge'` | Display variant |
| `tooltip` | `string` | - | Tooltip text on hover/tap |
| `onPress` | `() => void` | - | Press callback (mobile) |

---

### Variants

#### Badge (Default)
```
┌──────────┐
│  🟢 95%  │  Pill with background color
└──────────┘
```

#### Inline
```
🟢 95%      Just icon and text, no background
```

#### Dot
```
●           Just the colored dot
```

---

### Color Logic

```typescript
function getConfidenceColor(score: number) {
  if (score >= 90) {
    return {
      bg: '#D1FAE5',      // green-100
      text: '#065F46',    // green-800
      icon: '#10B981',    // green-500
    };
  }
  if (score >= 70) {
    return {
      bg: '#FEF3C7',      // amber-100
      text: '#92400E',    // amber-800
      icon: '#F59E0B',    // amber-500
    };
  }
  return {
    bg: '#FEE2E2',        // red-100
    text: '#991B1B',      // red-800
    icon: '#EF4444',      // red-500
  };
}
```

---

## Component 5: ClientPicker

**Purpose:** Dropdown/modal for switching between clients
**Platform:** Both (different implementations)

---

### Mobile Component Preview

```
┌─────────────────────────────────────────┐
│  Switch Client                     ✕    │
├─────────────────────────────────────────┤
│  🔍 Search clients...                   │
├─────────────────────────────────────────┤
│  RECENT                                 │
│  ┌─────────────────────────────────┐    │
│  │ ● Mike's Construction      (12) │ ← │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ ● Antonio's Pizza          (28) │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ALL CLIENTS                            │
│  ┌─────────────────────────────────┐    │
│  │ ○ Davis Plumbing           (5)  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ ● Green Landscaping        (2)  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [+ Add New Client]                     │
└─────────────────────────────────────────┘
```

---

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `clients` | `Client[]` | required | Array of clients |
| `currentClientId` | `string` | required | Currently selected client |
| `recentClientIds` | `string[]` | `[]` | Recently used client IDs |
| `onSelect` | `(clientId: string) => void` | required | Selection callback |
| `onAddClient` | `() => void` | - | Add client callback |
| `onClose` | `() => void` | required | Close picker |
| `isOpen` | `boolean` | `false` | Visibility state |
| `searchable` | `boolean` | `true` | Enable search |

---

### Client Type

```typescript
interface Client {
  id: string;
  name: string;
  pendingCount: number;
  connectionStatus: 'connected' | 'expiring' | 'disconnected';
  lastSync?: string;        // ISO timestamp
  businessType?: string;
}
```

---

### Variants

#### Mobile (Bottom Sheet)
- Slides up from bottom
- Draggable to dismiss
- Search at top
- Grouped list (Recent / All)

#### Web (Dropdown)
- Positioned below trigger
- Same content structure
- Click outside to close

---

### States

#### 1. Default
- List of clients shown
- Recent section if applicable
- Current client indicated with checkmark

#### 2. Searching
- Search input focused
- List filtered in real-time
- "No results" if empty

#### 3. Loading
- Skeleton list items
- Search disabled

#### 4. Empty
- No clients
- "Add your first client" message
- Add Client button prominent

---

## Component 6: SyncStatusIndicator

**Purpose:** Show sync state with appropriate visual feedback
**Platform:** Both

---

### Component Preview

```
Pending:   ○ Pending
Syncing:   ◐ Syncing...     (animated)
Synced:    ● Synced · 2m ago
Error:     ✕ Sync Error     (red)
```

---

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'pending' \| 'syncing' \| 'synced' \| 'error'` | required | Current status |
| `timestamp` | `string` | - | Last sync timestamp (ISO) |
| `errorMessage` | `string` | - | Error message if status is error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Indicator size |
| `showLabel` | `boolean` | `true` | Show text label |
| `onRetry` | `() => void` | - | Retry callback (shown on error) |

---

### Visual Styles

| Status | Icon | Color | Animation |
|--------|------|-------|-----------|
| pending | ○ (hollow circle) | Gray (#6B7280) | None |
| syncing | ◐ (half circle) | Blue (#3B82F6) | Rotating |
| synced | ● (filled circle) | Green (#10B981) | None |
| error | ✕ (x mark) | Red (#EF4444) | None |

---

### Variants

#### Compact
```
● 2m    (just dot and relative time)
```

#### Standard
```
● Synced · 2 min ago
```

#### Expanded
```
┌────────────────────────────────┐
│ ● Synced                       │
│   Last sync: Jan 15, 2:30 PM   │
└────────────────────────────────┘
```

---

## Component 7: FlagBadge

**Purpose:** Display warning or error flags on transactions
**Platform:** Both

---

### Component Preview

```
Warning:  ┌─────────────────────┐
          │ ⚠️ Low confidence   │
          └─────────────────────┘

Error:    ┌─────────────────────┐
          │ ❌ Missing vendor   │
          └─────────────────────┘

Info:     ┌─────────────────────┐
          │ ℹ️ Duplicate check  │
          └─────────────────────┘
```

---

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'warning' \| 'error' \| 'info'` | required | Flag type |
| `message` | `string` | required | Flag message |
| `dismissable` | `boolean` | `false` | Can be dismissed |
| `onDismiss` | `() => void` | - | Dismiss callback |
| `onPress` | `() => void` | - | Press callback (for details) |

---

### Flag Types

| Type | Background | Text | Icon |
|------|------------|------|------|
| warning | `#FEF3C7` | `#92400E` | ⚠️ |
| error | `#FEE2E2` | `#991B1B` | ❌ |
| info | `#DBEAFE` | `#1E40AF` | ℹ️ |

---

### Common Flag Messages

```typescript
const flagMessages = {
  lowConfidence: 'Low confidence - manual review recommended',
  missingVendor: 'Vendor could not be detected',
  missingDate: 'Date could not be detected',
  missingAmount: 'Amount could not be detected',
  duplicateWarning: 'Possible duplicate transaction',
  categoryUnmatched: 'Category could not be matched',
  syncFailed: 'Failed to sync - retry required',
  connectionRequired: 'QuickBooks reconnection required',
};
```

---

## Component 8: UploadZone

**Purpose:** Drag-and-drop file upload for web receipt import
**Platform:** Web only

---

### Component Preview

```
Default:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    📄                                       │
│                                                             │
│         Drag receipts here or click to upload               │
│                                                             │
│         PNG, JPG, PDF up to 10MB                           │
│                                                             │
│                  [Browse Files]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Dragging:
┌─────────────────────────────────────────────────────────────┐
│ ╔═════════════════════════════════════════════════════════╗ │
│ ║                                                         ║ │
│ ║                    📄                                   ║ │
│ ║                                                         ║ │
│ ║              Drop files to upload                       ║ │
│ ║                                                         ║ │
│ ╚═════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────┘
(dashed blue border, light blue background)
```

---

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUpload` | `(files: File[]) => void` | required | Upload callback |
| `accept` | `string[]` | `['image/*', 'application/pdf']` | Accepted file types |
| `maxSize` | `number` | `10485760` | Max file size (bytes) |
| `maxFiles` | `number` | `20` | Max files per upload |
| `disabled` | `boolean` | `false` | Disable upload |
| `clientId` | `string` | required | Client to upload for |
| `showPreview` | `boolean` | `true` | Show file previews |

---

### States

#### 1. Default
- Neutral background
- Upload instructions
- Browse button

#### 2. Drag Over
- Blue dashed border
- Light blue background
- "Drop files to upload" text
- Pulsing animation

#### 3. Uploading
- Progress bar per file
- File name and percentage
- Cancel button per file

#### 4. Error
- Red border
- Error message
- "File too large" or "Invalid format"
- Retry option

#### 5. Success
- Green checkmark
- "X files uploaded"
- Clear/upload more option

---

### File Preview Sub-component

```typescript
interface FilePreviewProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
  progress?: number;        // 0-100 during upload
  error?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;         // thumbnail URL
  status: 'pending' | 'uploading' | 'complete' | 'error';
}
```

---

## Shared Component Patterns

### Loading Skeletons

All components support skeleton loading states:

```typescript
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  animated?: boolean;
}
```

**Animation:** Shimmer gradient from left to right, 1.5s duration, infinite loop

---

### Error States

All components handle errors consistently:

```typescript
interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
}
```

**Pattern:**
- Red accent color
- Error icon (⚠️ or ❌)
- Clear message
- Retry action when applicable

---

### Empty States

Standard empty state pattern:

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Pattern:**
- Centered illustration/icon
- Title text
- Description text (optional)
- CTA button (optional)

---

### Touch Feedback (Mobile)

All interactive components include:
- Press-in opacity reduction (0.7)
- Haptic feedback on key actions
- Minimum touch target: 44x44 points

---

### Keyboard Navigation (Web)

All interactive components support:
- Focus ring on focus (blue outline)
- Arrow key navigation where applicable
- Enter/Space for activation
- Escape to close/cancel

---

## Component Hierarchy

```
App
├── Navigation
│   └── ClientPicker
├── ScannerScreen (mobile)
│   ├── DocumentScanner
│   │   └── EdgeDetectionOverlay
│   └── ClientPicker
├── ReviewScreen (mobile)
│   ├── TransactionCard
│   │   ├── ConfidenceBadge
│   │   └── FlagBadge
│   └── EditModal
├── DashboardPage (web)
│   ├── StatsCard
│   ├── ClientCard
│   │   └── SyncStatusIndicator
│   └── UploadZone
├── ReviewQueuePage (web)
│   ├── ReviewTable
│   │   ├── ConfidenceBadge
│   │   └── FlagBadge
│   └── DetailPanel
│       └── TransactionForm
└── Common
    ├── ConfidenceBadge
    ├── FlagBadge
    ├── SyncStatusIndicator
    ├── LoadingSkeleton
    ├── EmptyState
    └── ErrorDisplay
```

---

*Last Updated: January 2025*
*Version: 1.0.0*
