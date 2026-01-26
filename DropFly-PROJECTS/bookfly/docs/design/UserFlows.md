# BookFly User Flows

## Overview

This document defines the 5 core user flows for BookFly, covering the complete journey from onboarding through daily usage.

---

## Flow 1: Onboarding

### Sign Up, Add First Client, Connect QuickBooks

**Goal:** Get a new bookkeeper from download to first synced transaction
**Success Metric:** Time to first sync < 5 minutes
**Drop-off Risk Points:** QB OAuth flow, permissions confusion

---

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ONBOARDING FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   DOWNLOAD   │     │   SIGN UP    │     │   WELCOME    │     │    ADD       │
│     APP      │────▶│    SCREEN    │────▶│    SCREEN    │────▶│   CLIENT     │
│              │     │              │     │              │     │              │
│ • App Store  │     │ • Email      │     │ • Value prop │     │ • Client name│
│ • Play Store │     │ • Password   │     │ • 3 steps    │     │ • Business   │
│              │     │ • Google SSO │     │   preview    │     │   type       │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                                                                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   SUCCESS    │     │   VERIFY     │     │    OAUTH     │     │   CONNECT    │
│   SCREEN     │◀────│  CONNECTION  │◀────│    FLOW      │◀────│  QUICKBOOKS  │
│              │     │              │     │              │     │              │
│ • Connected! │     │ • Loading    │     │ • QB Login   │     │ • Why needed │
│ • Start scan │     │ • Fetching   │     │ • Authorize  │     │ • Permission │
│   CTA        │     │   accounts   │     │ • Redirect   │     │   list       │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

### Step-by-Step Specification

#### Step 1.1: Download App
| Aspect | Details |
|--------|---------|
| **Entry Point** | App Store / Play Store |
| **User Action** | Search "BookFly" or follow link, tap Download |
| **System Response** | Download and install app |
| **Next Step** | Open app |

#### Step 1.2: Sign Up Screen
| Aspect | Details |
|--------|---------|
| **Screen** | `SignUpScreen` |
| **User Action** | Enter email, create password OR tap "Continue with Google" |
| **Validation** | Valid email format, password 8+ chars |
| **Error States** | Invalid email, weak password, email already registered |
| **Success** | Account created, navigate to Welcome |

**UI Elements:**
- Email input field
- Password input field (with show/hide toggle)
- "Continue with Google" button
- "Continue with Apple" button (iOS only)
- Terms of Service / Privacy Policy links
- "Already have an account? Sign In" link

#### Step 1.3: Welcome Screen
| Aspect | Details |
|--------|---------|
| **Screen** | `WelcomeScreen` |
| **Purpose** | Explain value prop, set expectations |
| **Content** | 3-step visual: Scan → Review → Sync |
| **User Action** | Tap "Get Started" |
| **Next Step** | Add First Client |

**UI Elements:**
- Welcome illustration (document scanning)
- "Welcome to BookFly" heading
- 3-step process preview (icons + brief text)
- "Get Started" primary button
- Skip option (hidden, for returning users)

#### Step 1.4: Add Client Screen
| Aspect | Details |
|--------|---------|
| **Screen** | `AddClientScreen` |
| **User Action** | Enter client name, select business type |
| **Required Fields** | Client name (display name) |
| **Optional Fields** | Business type dropdown |
| **Validation** | Name not empty, not duplicate |
| **Next Step** | Connect QuickBooks |

**UI Elements:**
- "Add Your First Client" heading
- Client name input (placeholder: "e.g., Mike's Construction")
- Business type dropdown (Retail, Service, Restaurant, Construction, Professional Services, Other)
- "Continue" button (disabled until name entered)
- Progress indicator (Step 2 of 4)

#### Step 1.5: Connect QuickBooks Screen
| Aspect | Details |
|--------|---------|
| **Screen** | `ConnectQBScreen` |
| **Purpose** | Explain why QB connection needed, get consent |
| **Content** | Permission list, security assurance |
| **User Action** | Tap "Connect QuickBooks" |
| **Next Step** | OAuth Flow |

**UI Elements:**
- QuickBooks logo
- "Connect to QuickBooks" heading
- Permission list with icons:
  - "Read your chart of accounts"
  - "Create expense transactions"
  - "Read vendor list"
- Security badge: "Bank-level encryption"
- "Connect QuickBooks" primary button
- "Skip for now" secondary link
- "Why do we need this?" expandable

#### Step 1.6: QuickBooks OAuth Flow
| Aspect | Details |
|--------|---------|
| **Screen** | System browser / WebView |
| **User Action** | Log into QB, authorize app |
| **System Response** | OAuth callback, store tokens |
| **Error Handling** | User cancels, invalid credentials, network error |
| **Next Step** | Verify Connection |

**OAuth Scopes Required:**
- `com.intuit.quickbooks.accounting` (read/write)

#### Step 1.7: Verify Connection Screen
| Aspect | Details |
|--------|---------|
| **Screen** | `VerifyConnectionScreen` (loading state) |
| **System Action** | Fetch QB company info, chart of accounts |
| **Duration** | 2-5 seconds |
| **Success** | Show company name, account count |
| **Error** | Connection failed, retry option |

**UI Elements:**
- Loading spinner
- "Connecting to QuickBooks..."
- Progress text: "Fetching accounts..."
- On success: Company name, "X accounts found"

#### Step 1.8: Success Screen
| Aspect | Details |
|--------|---------|
| **Screen** | `OnboardingSuccessScreen` |
| **Content** | Celebration, next steps |
| **User Action** | Tap "Start Scanning" |
| **Next Step** | Scanner Screen |

**UI Elements:**
- Success checkmark animation
- "You're all set!" heading
- Client name + QB company connected
- "Start Scanning" primary button
- "Go to Dashboard" secondary link

---

### Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Email already registered | "An account with this email already exists. Sign in instead?" | Link to sign in |
| OAuth cancelled | "QuickBooks connection was cancelled. You can connect later in Settings." | Continue to dashboard |
| OAuth failed | "Couldn't connect to QuickBooks. Please try again." | Retry button |
| Network error | "No internet connection. Please check your connection and try again." | Retry button |
| QB company already connected | "This QuickBooks company is already linked to another BookFly account." | Contact support link |

---

## Flow 2: Mobile Scanner

### Open App, Scan Receipts, Quick Review, Sync

**Goal:** Capture receipts in the field with minimal friction
**Success Metric:** Capture-to-queue time < 10 seconds per receipt
**Key Constraint:** Must work in poor lighting, with crumpled documents

---

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOBILE SCANNER FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   OPEN APP   │     │   SCANNER    │     │    EDGE      │     │   CAPTURE    │
│              │────▶│   SCREEN     │────▶│  DETECTION   │────▶│   PREVIEW    │
│              │     │              │     │              │     │              │
│ • App icon   │     │ • Camera on  │     │ • Blue frame │     │ • Cropped    │
│ • Push notif │     │ • Client     │     │ • Auto or    │     │   image      │
│              │     │   shown      │     │   manual     │     │ • Retake?    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
      ┌─────────────────────────────────────────────────────┐         │
      │                   BATCH MODE?                        │         │
      │                                                      │         │
      │   YES: Loop back to scanner for next receipt        ◀─────────┤
      │   NO: Proceed to processing                          │         │
      └──────────────────────────────────────────────────────┘         │
                                                                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   CONFIRM    │     │    QUICK     │     │     AI       │     │  PROCESSING  │
│   & SYNC     │◀────│   REVIEW     │◀────│   RESULTS    │◀────│   SCREEN     │
│              │     │              │     │              │     │              │
│ • Sync now   │     │ • Swipe card │     │ • Parsed     │     │ • Upload     │
│ • Add more   │     │ • Edit modal │     │   data       │     │ • OCR/AI     │
│              │     │ • Approve    │     │ • Confidence │     │ • Extracting │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

### Step-by-Step Specification

#### Step 2.1: Open App
| Aspect | Details |
|--------|---------|
| **Entry Point** | Home screen tap, notification, or widget |
| **Auth Check** | If logged out, show sign in |
| **Default Screen** | Scanner (if quick-access) or Dashboard |
| **Client Context** | Last active client pre-selected |

#### Step 2.2: Scanner Screen
| Aspect | Details |
|--------|---------|
| **Screen** | `ScannerScreen` |
| **Camera** | Full-screen live viewfinder |
| **Overlay** | Document detection frame, client indicator |
| **Controls** | Capture button, flash toggle, batch toggle |
| **Client Picker** | Tap client name to switch |

**UI Elements:**
- Full-screen camera viewfinder
- Client name pill (top center, tappable)
- Edge detection overlay (blue corners/frame)
- Capture button (large, center bottom)
- Flash toggle (top right)
- Batch mode toggle (bottom left)
- Gallery button (bottom right)
- Close/cancel (top left)

**Edge Detection States:**
- No document: Corners at fixed positions, dimmed
- Document detected: Corners snap to document, highlighted blue
- Document ready: Green highlight, haptic feedback

#### Step 2.3: Edge Detection & Capture
| Aspect | Details |
|--------|---------|
| **Detection** | Real-time document edge detection |
| **Auto-capture** | Optional: capture when stable for 1.5 seconds |
| **Manual capture** | Tap button to capture |
| **Haptic** | Success vibration on capture |
| **Audio** | Shutter sound (optional, system setting) |

**Capture Settings:**
- Image quality: High (for OCR accuracy)
- Perspective correction: Applied automatically
- Crop: Based on detected edges
- Enhancement: Auto-brightness, contrast

#### Step 2.4: Capture Preview
| Aspect | Details |
|--------|---------|
| **Screen** | `CapturePreviewScreen` (or modal) |
| **Content** | Cropped, enhanced receipt image |
| **Actions** | Use this image, Retake, Adjust corners |
| **Duration** | Optional skip if confidence high |

**UI Elements:**
- Enhanced receipt image (centered)
- "Use This" primary button
- "Retake" secondary button
- "Adjust" tertiary link (manual corner adjustment)
- Corner drag handles (if adjusting)

#### Step 2.5: Batch Mode Decision
| Aspect | Details |
|--------|---------|
| **Trigger** | After capture, if batch mode enabled |
| **Behavior** | Add to batch, return to scanner immediately |
| **Indicator** | Badge count: "3 receipts captured" |
| **Exit Batch** | Tap "Done" or batch counter |

#### Step 2.6: Processing Screen
| Aspect | Details |
|--------|---------|
| **Screen** | `ProcessingScreen` (or modal overlay) |
| **Duration** | 2-8 seconds depending on complexity |
| **Progress** | Upload → OCR → AI Extract → Complete |
| **Background** | Can continue scanning (batch mode) |

**UI Elements:**
- Receipt thumbnail
- Progress steps with checkmarks:
  - "Uploading..."
  - "Reading text..."
  - "Extracting data..."
  - "Complete!"
- Cancel option (before AI complete)

**Offline Handling:**
- If offline: "Saved locally. Will process when online."
- Queue indicator in dashboard

#### Step 2.7: AI Results Display
| Aspect | Details |
|--------|---------|
| **Screen** | Integrated into Quick Review |
| **Content** | Extracted: Vendor, Date, Amount, Category |
| **Confidence** | Color-coded badges (green/yellow/red) |
| **Source** | Original image visible for comparison |

**Extracted Fields:**
| Field | Display | Editable |
|-------|---------|----------|
| Vendor | "Office Depot" | Yes |
| Date | "Jan 15, 2025" | Yes |
| Amount | "$127.43" | Yes |
| Category | "Office Supplies" | Yes (dropdown) |
| Tax | "$8.43" (if detected) | Yes |
| Description | "Printer paper, ink" | Yes |

#### Step 2.8: Quick Review Screen
| Aspect | Details |
|--------|---------|
| **Screen** | `QuickReviewScreen` |
| **Format** | Swipeable card stack |
| **Per Card** | Receipt image + extracted data side-by-side |
| **Actions** | Swipe right (approve), Swipe left (reject), Tap (edit) |

**UI Elements:**
- Card stack (top card active)
- Receipt image (left or top)
- Extracted data (right or bottom)
- Confidence badges per field
- Swipe indicators (checkmark right, X left)
- "Edit" button on card
- Progress: "2 of 5"
- "Approve All" button (if batch)

**Swipe Gestures:**
- Right (>50%): Approve, move to sync queue
- Left (>50%): Reject, move to rejected (can recover)
- Tap: Open edit modal

#### Step 2.9: Edit Modal
| Aspect | Details |
|--------|---------|
| **Trigger** | Tap on card or specific field |
| **Content** | Full edit form with receipt visible |
| **Fields** | All extracted fields, editable |
| **Keyboard** | Smart: date picker, number pad for amount |
| **Save** | "Save & Approve" or "Save" |

**UI Elements:**
- Half-sheet modal (swipe down to close)
- Receipt image (scrollable above form)
- Form fields:
  - Vendor (text, autocomplete from QB vendors)
  - Date (date picker)
  - Amount (number pad)
  - Category (dropdown from QB chart of accounts)
  - Memo/Description (text)
  - Tax amount (number pad, optional)
- "Save & Approve" primary button
- "Save" secondary button
- "Cancel" (swipe down)

#### Step 2.10: Confirm & Sync
| Aspect | Details |
|--------|---------|
| **Screen** | `SyncConfirmScreen` (or toast) |
| **Content** | Summary of approved items |
| **Actions** | "Sync to QuickBooks Now" or "Save for Later" |
| **Status** | Pending → Syncing → Success/Error |

**UI Elements:**
- Summary: "5 transactions ready to sync"
- Client name confirmation
- "Sync Now" primary button
- "Save for Later" secondary button
- Sync progress indicator
- Success: Checkmark + "Synced to QuickBooks!"
- Error: Error message + "Retry"

---

### Offline Behavior

| State | Behavior |
|-------|----------|
| No internet at capture | Save image locally, queue for processing |
| No internet at processing | Process when connection restored |
| Partial connectivity | Prioritize upload, defer sync |
| Airplane mode | Full functionality except sync, clear indicator |

---

## Flow 3: Web Review

### Dashboard, Review Queue, Bulk Approve, Verify Sync

**Goal:** Efficiently review and approve high volumes of transactions
**Success Metric:** Review 50+ transactions in < 10 minutes
**Key Feature:** Keyboard shortcuts for power users

---

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WEB REVIEW FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    LOGIN     │     │  DASHBOARD   │     │   SELECT     │     │   REVIEW     │
│     WEB      │────▶│   OVERVIEW   │────▶│   CLIENT     │────▶│    QUEUE     │
│              │     │              │     │              │     │              │
│ • Email/pass │     │ • All clients│     │ • Click card │     │ • Table view │
│ • SSO        │     │ • Pending    │     │ • Or filter  │     │ • Filters    │
│              │     │   counts     │     │              │     │ • Sort       │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                                                                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   VERIFY     │     │    BULK      │     │   REVIEW     │     │   SELECT     │
│    SYNC      │◀────│   APPROVE    │◀────│   ITEM(S)    │◀────│   ITEMS      │
│              │     │              │     │              │     │              │
│ • Sync log   │     │ • Confirm    │     │ • Side panel │     │ • Checkbox   │
│ • Errors     │     │ • Processing │     │ • Edit/fix   │     │ • Shift-click│
│ • Retry      │     │ • Complete   │     │ • Approve    │     │ • Select all │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

### Step-by-Step Specification

#### Step 3.1: Login (Web)
| Aspect | Details |
|--------|---------|
| **URL** | `app.bookfly.io/login` |
| **Methods** | Email/password, Google SSO |
| **Remember Me** | 30-day session |
| **Redirect** | To dashboard after auth |

#### Step 3.2: Dashboard Overview
| Aspect | Details |
|--------|---------|
| **Screen** | `DashboardPage` |
| **Content** | All clients overview, aggregate stats |
| **Layout** | Client cards grid, global stats header |
| **Actions** | Click client to drill down, filter by status |

**UI Elements:**
- Header stats bar:
  - Total pending review
  - Synced today
  - Errors requiring attention
  - Accuracy rate (last 7 days)
- Client cards grid:
  - Client name
  - Pending count (badge)
  - Last sync timestamp
  - Connection status indicator
- Filters: All / Pending / Errors
- Search: Find client by name
- "Add Client" button

#### Step 3.3: Select Client / Filter
| Aspect | Details |
|--------|---------|
| **Action** | Click client card |
| **Result** | Navigate to Review Queue filtered to that client |
| **Alternative** | Use client dropdown in Review Queue |

#### Step 3.4: Review Queue
| Aspect | Details |
|--------|---------|
| **Screen** | `ReviewQueuePage` |
| **Layout** | Table with transaction rows, side panel for detail |
| **Default Sort** | Date captured (newest first) |
| **Filters** | Client, Date range, Confidence, Category, Status |

**Table Columns:**
| Column | Content | Sortable |
|--------|---------|----------|
| Checkbox | Selection | No |
| Date | Transaction date | Yes |
| Vendor | Vendor name | Yes |
| Amount | Transaction amount | Yes |
| Category | Expense category | Yes |
| Confidence | Overall confidence % | Yes |
| Status | Pending/Approved/Error | Yes |
| Actions | Edit, Approve, Reject | No |

**Filter Options:**
- Client: Dropdown (all or specific)
- Date range: Date picker (captured or transaction date)
- Confidence: High (90+), Medium (70-89), Low (<70), All
- Category: Dropdown from chart of accounts
- Status: Pending, Approved, Rejected, Synced, Error

**Keyboard Shortcuts:**
| Key | Action |
|-----|--------|
| `j` / `k` | Move down/up in list |
| `Space` | Toggle selection |
| `Enter` | Open detail panel |
| `a` | Approve selected |
| `e` | Edit selected |
| `Shift+A` | Approve all visible |
| `/` | Focus search |
| `?` | Show shortcuts help |

#### Step 3.5: Select Items
| Aspect | Details |
|--------|---------|
| **Methods** | Checkbox click, Shift+click range, Cmd/Ctrl+A all |
| **Indicator** | Selected count in action bar |
| **Constraints** | Can only bulk approve items with same status |

**Selection States:**
- None selected: Action bar hidden
- 1 selected: "1 item selected" + Edit, Approve, Reject buttons
- Multiple selected: "X items selected" + Bulk Approve, Bulk Reject
- All selected: "All X items selected" + same actions

#### Step 3.6: Review Item(s)
| Aspect | Details |
|--------|---------|
| **Trigger** | Click row or press Enter |
| **Panel** | Side panel slides in (right) |
| **Content** | Receipt image + extracted data + edit form |
| **Actions** | Edit fields, Approve, Reject, View original |

**Side Panel Elements:**
- Receipt image (zoomable)
- Extracted data form:
  - Vendor (editable, autocomplete)
  - Date (date picker)
  - Amount (number input)
  - Category (dropdown)
  - Memo (text area)
  - Confidence badges per field
- Flags/warnings (if any)
- "Approve" primary button
- "Reject" secondary button
- "View Full Image" link (opens modal)
- "Previous" / "Next" navigation

#### Step 3.7: Bulk Approve
| Aspect | Details |
|--------|---------|
| **Trigger** | Click "Approve Selected" with multiple items |
| **Confirmation** | Modal: "Approve X transactions?" |
| **Processing** | Progress indicator |
| **Result** | Items move to sync queue |

**Confirmation Modal:**
- "Approve X Transactions?"
- Summary: Client name, total amount
- "This will add these transactions to the sync queue."
- "Approve" primary button
- "Cancel" secondary button

#### Step 3.8: Verify Sync
| Aspect | Details |
|--------|---------|
| **Screen** | `SyncStatusPanel` or dedicated page |
| **Content** | Sync log, pending, in-progress, completed, errors |
| **Actions** | Retry failed syncs, view error details |

**Sync Status Table:**
| Column | Content |
|--------|---------|
| Transaction | Vendor + Amount |
| Client | Client name |
| Status | Pending/Syncing/Synced/Error |
| Timestamp | When synced or attempted |
| Actions | Retry (if error), View in QB |

**Error Handling:**
- Error row highlighted red
- "View Error" button → modal with QB error message
- "Retry" button
- "Retry All Failed" bulk action

---

## Flow 4: Client Management

### Switch Clients, View Client Dashboard, Manage Connection

**Goal:** Manage multiple clients without confusion
**Success Metric:** Switch clients in < 2 seconds
**Key Concern:** Never enter data in wrong client

---

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLIENT MANAGEMENT FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   CURRENT    │     │   CLIENT     │     │    NEW       │
│    VIEW      │────▶│   PICKER     │────▶│   CLIENT     │
│              │     │              │     │   CONTEXT    │
│ • Any screen │     │ • Dropdown   │     │              │
│ • Tap client │     │ • Search     │     │ • Dashboard  │
│   name       │     │ • Recent     │     │   updates    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                           ┌────────────────────┼────────────────────┐
                           │                    │                    │
                           ▼                    ▼                    ▼
                    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                    │    CLIENT    │     │    EDIT      │     │   MANAGE     │
                    │  DASHBOARD   │     │   CLIENT     │     │  CONNECTION  │
                    │              │     │              │     │              │
                    │ • Pending    │     │ • Name       │     │ • QB status  │
                    │ • Metrics    │     │ • Type       │     │ • Reconnect  │
                    │ • History    │     │ • Settings   │     │ • Disconnect │
                    └──────────────┘     └──────────────┘     └──────────────┘
```

---

### Step-by-Step Specification

#### Step 4.1: Client Picker (Mobile)
| Aspect | Details |
|--------|---------|
| **Trigger** | Tap client name in header/scanner |
| **UI** | Bottom sheet modal |
| **Content** | Client list with status indicators |
| **Search** | Filter by name as you type |

**UI Elements:**
- "Switch Client" header
- Search input (top)
- Recent clients (last 3 used)
- All clients list:
  - Client name
  - Pending count badge
  - QB connection status dot (green/yellow/red)
- "Add New Client" button (bottom)
- Swipe down to dismiss

**Client List Item:**
```
┌─────────────────────────────────────────┐
│ ● Mike's Construction           (12)   │
│   QuickBooks Connected                  │
└─────────────────────────────────────────┘
```

#### Step 4.2: Client Picker (Web)
| Aspect | Details |
|--------|---------|
| **Location** | Header dropdown, always visible |
| **Trigger** | Click dropdown |
| **Features** | Search, recent, all clients |

**Dropdown Elements:**
- Current client shown in header
- Dropdown on click:
  - Search input
  - "Recent" section (last 3)
  - "All Clients" section (alphabetical)
  - "Manage Clients" link
  - "Add Client" button

#### Step 4.3: Client Dashboard
| Aspect | Details |
|--------|---------|
| **Screen** | `ClientDashboardPage/Screen` |
| **Content** | Single client overview and metrics |
| **Sections** | Pending items, Recent activity, Stats, Settings |

**UI Sections:**

**Header:**
- Client name + type
- QB company name
- Connection status badge
- "Edit Client" button

**Stats Cards:**
- Transactions this month
- Pending review
- Accuracy rate (AI correct %)
- Last sync time

**Pending Items Preview:**
- Top 5 pending transactions
- "View All" link to Review Queue

**Recent Activity:**
- Last 10 synced transactions
- Timestamp, vendor, amount
- "View History" link

**Quick Actions:**
- "Open Scanner" (mobile)
- "Review Queue"
- "Connection Settings"

#### Step 4.4: Edit Client
| Aspect | Details |
|--------|---------|
| **Screen** | `EditClientScreen/Modal` |
| **Fields** | Client name, business type, default category |
| **Actions** | Save, Delete client |

**Form Fields:**
- Display name (required)
- Business type (dropdown)
- Default expense category (dropdown)
- Notes (text area)

**Danger Zone:**
- "Delete Client" (confirmation required)
- Deletes: Local data, connection
- Does NOT delete: QB transactions (already synced)

#### Step 4.5: Manage Connection
| Aspect | Details |
|--------|---------|
| **Screen** | `ConnectionSettingsScreen/Modal` |
| **Content** | QB connection status, actions |
| **Actions** | Test connection, Reconnect, Disconnect |

**UI Elements:**

**Connection Status:**
- Status indicator (green/yellow/red)
- QB Company name
- Connected since date
- Last successful sync

**Actions:**
- "Test Connection" button
- "Reconnect" button (re-auth OAuth)
- "Disconnect" button (danger)

**Connection Issues:**
| Status | Indicator | Action |
|--------|-----------|--------|
| Connected | Green dot | None needed |
| Token expiring | Yellow dot | "Reconnect" suggested |
| Disconnected | Red dot | "Reconnect" required |
| Error | Red dot + message | Troubleshoot steps |

---

## Flow 5: Error Handling

### Sync Failure, View Error, Fix, Retry

**Goal:** Resolve sync errors without data loss
**Success Metric:** Error resolution time < 2 minutes
**Key Principle:** Never lose user data, clear error messaging

---

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ERROR HANDLING FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    SYNC      │     │    ERROR     │     │    VIEW      │     │   DIAGNOSE   │
│   ATTEMPT    │────▶│  DETECTED    │────▶│    ERROR     │────▶│    CAUSE     │
│              │     │              │     │              │     │              │
│ • Auto sync  │     │ • Badge/notif│     │ • Error list │     │ • QB issue   │
│ • Manual sync│     │ • Dashboard  │     │ • Click item │     │ • Data issue │
│              │     │   indicator  │     │              │     │ • Network    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                                                                      ▼
                                          ┌──────────────┐     ┌──────────────┐
                                          │   VERIFY     │     │     FIX      │
                                          │   SUCCESS    │◀────│    ISSUE     │
                                          │              │     │              │
                                          │ • Green      │     │ • Edit data  │
                                          │   status     │     │ • Reconnect  │
                                          │ • Retry next │     │ • Retry sync │
                                          └──────────────┘     └──────────────┘
```

---

### Step-by-Step Specification

#### Step 5.1: Sync Attempt & Failure Detection
| Aspect | Details |
|--------|---------|
| **Trigger** | Auto-sync after approval or manual sync |
| **Timeout** | 30 seconds per transaction |
| **Retry** | Automatic retry 2x with exponential backoff |
| **Failure** | After 3 attempts, mark as error |

**Sync Process:**
1. Prepare transaction payload
2. Authenticate with QB API
3. Create expense in QB
4. Verify creation (read back)
5. Update local status

#### Step 5.2: Error Notification
| Aspect | Details |
|--------|---------|
| **Mobile** | Push notification, in-app badge |
| **Web** | Toast notification, dashboard indicator |
| **Email** | Optional daily digest of unresolved errors |

**Notification Content:**
- "Sync failed for 3 transactions"
- Tap to view errors
- Client name included

**Dashboard Indicator:**
- Error count badge on client card
- Global error count in header
- Red status indicator

#### Step 5.3: View Error List
| Aspect | Details |
|--------|---------|
| **Location** | Errors tab in Review Queue, or dedicated page |
| **Content** | All failed transactions with error status |
| **Grouping** | By client, then by error type |

**Error List Table:**
| Column | Content |
|--------|---------|
| Transaction | Vendor, amount, date |
| Client | Client name |
| Error | Error code + brief message |
| Attempts | Number of sync attempts |
| Last Attempt | Timestamp |
| Actions | View, Retry, Edit |

#### Step 5.4: View Error Detail
| Aspect | Details |
|--------|---------|
| **Trigger** | Click error row |
| **Content** | Full error message, transaction data, troubleshooting |
| **Layout** | Side panel or modal |

**Error Detail Panel:**
- Transaction info (same as review panel)
- Error section:
  - Error code
  - Full error message from QB API
  - Timestamp of last attempt
  - Number of retry attempts
- Troubleshooting:
  - Suggested fix based on error type
  - Links to help documentation
- Actions:
  - "Edit Transaction" button
  - "Retry Sync" button
  - "Skip" button (moves to manual)

#### Step 5.5: Error Type Diagnosis

**Common Error Types:**

| Error | Code | Cause | Fix |
|-------|------|-------|-----|
| Auth expired | `AUTH_EXPIRED` | QB token expired | Reconnect QB |
| Duplicate | `DUPLICATE_TRANSACTION` | Same transaction exists | Review, skip or edit |
| Invalid vendor | `INVALID_VENDOR` | Vendor not in QB | Add vendor or edit |
| Invalid category | `INVALID_CATEGORY` | Account not in QB | Select valid account |
| Invalid date | `INVALID_DATE` | Date in closed period | Edit date |
| Network error | `NETWORK_ERROR` | Connection failed | Check internet, retry |
| QB down | `SERVICE_UNAVAILABLE` | QB API unavailable | Wait, auto-retry |
| Rate limit | `RATE_LIMITED` | Too many requests | Auto-retry with backoff |

#### Step 5.6: Fix Issue

**Fix by Error Type:**

**Auth Expired:**
1. Navigate to Connection Settings
2. Click "Reconnect"
3. Complete OAuth flow
4. Return to errors, retry all

**Duplicate Transaction:**
1. View duplicate in QB (link provided)
2. Decide: Skip (already there) or Edit (different transaction)
3. If skip: Mark as "Skipped - Duplicate"
4. If edit: Change identifying fields, retry

**Invalid Vendor/Category:**
1. Open Edit modal
2. Change to valid vendor/category (from QB list)
3. Save and retry

**Network/Service Errors:**
1. Check connection
2. Click "Retry"
3. If persists, wait and retry later

#### Step 5.7: Retry Sync
| Aspect | Details |
|--------|---------|
| **Single** | Click "Retry" on individual error |
| **Bulk** | "Retry All" button for multiple errors |
| **Feedback** | Progress indicator during retry |

**Retry Process:**
1. Show "Retrying..." indicator
2. Attempt sync
3. Success: Move to synced, show success toast
4. Failure: Update error message, increment attempt count

#### Step 5.8: Verify Success
| Aspect | Details |
|--------|---------|
| **Indicator** | Green checkmark, moved from error list |
| **Confirmation** | Toast: "Successfully synced to QuickBooks" |
| **Verification** | "View in QuickBooks" link opens QB |

**Success State:**
- Transaction removed from errors list
- Added to sync history
- Success toast notification
- Optional: Deep link to view in QB

---

### Error Prevention

**Built-in Safeguards:**

1. **Pre-sync validation**
   - Validate all fields before sync attempt
   - Check vendor exists in QB
   - Check category is valid account
   - Warn about duplicate detection

2. **Connection monitoring**
   - Check QB connection health daily
   - Proactive reconnect prompts before expiry
   - Background token refresh

3. **Data quality checks**
   - Flag low-confidence extractions
   - Require review for unusual amounts
   - Detect potential duplicates before sync

---

*Last Updated: January 2025*
*Next Review: After MVP Launch*
