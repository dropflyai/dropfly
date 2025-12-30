# Pattern: Onboarding — Authoritative

Onboarding exists to get users to their first meaningful moment.
If users abandon before value, onboarding has failed.

---

## Purpose

Onboarding exists to:
- guide users to first success
- explain what the product does
- collect necessary setup information
- reduce time to value
- **show users where things are** (buttons, navigation, key features)
- **teach users how to use the system**

Onboarding is not just a tour. It is purposeful acceleration AND orientation.

---

## Applicability Check

**This pattern is REQUIRED for:**
- SaaS products
- Mobile apps
- Desktop applications
- Complex web apps
- Internal tools with learning curve
- Any system with more than 3 core features

**This pattern is OPTIONAL for:**
- Simple landing pages
- Marketing sites
- Single-purpose tools (calculator, converter)
- Content-only sites (blogs, docs)

---

## Core Principle

**Time to First Value (TTFV)**

Every onboarding decision should minimize the time between signup and the user experiencing the product's core value.

---

## Onboarding Types

### 1. Setup Wizard
Sequential steps to configure product.
```
Step 1 of 3: Connect your account
━━━━━━━━━━○○○
```

### 2. Empty State Guidance
In-context prompts when areas are empty.
```
No workflows yet
Create your first workflow to automate tasks.
[Create workflow]
```

### 3. Contextual Tooltips
Point to specific UI elements.
```
┌─────────────────────────┐
│     ↓ Tooltip           │
│   This is where you...  │
└─────────────────────────┘
```

### 4. Checklist
Persistent progress tracker.
```
Getting started
☑ Create account
☑ Connect integration
☐ Create first workflow
☐ Run first automation
```

---

## Setup Wizard Structure

### Progress Indicator
```
┌─────────────────────────────────────────────────────┐
│     Account    →    Integration    →    First Run   │
│       ●               ○                   ○         │
│                                                     │
│ Step 1 of 3                                         │
└─────────────────────────────────────────────────────┘
```

### Step Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│            Connect your data source                 │
│                                                     │
│   Choose where your data lives so we can           │
│   start syncing automatically.                      │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │ 🔗 Connect Salesforce                       │   │
│   │ 🔗 Connect HubSpot                          │   │
│   │ 🔗 Connect Custom API                       │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│                        [Skip]  [Continue →]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Rules
- Max 3-5 steps
- Each step has clear purpose
- Skip option when not required
- Progress always visible
- Can go back to previous steps
- Exit option visible (with warning)

---

## First-Use Empty States

### Structure
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              [Illustration - optional]              │
│                                                     │
│              No workflows yet                       │
│                                                     │
│     Workflows automate repetitive tasks across      │
│     your connected services. Create one to          │
│     save hours every week.                          │
│                                                     │
│              [Create your first workflow]           │
│                                                     │
│     Or explore [example workflows →]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Content Requirements
1. What this area is for
2. Why it matters (benefit)
3. How to get started (action)
4. Alternative path (optional)

---

## Onboarding Checklist

### Persistent Widget
```
┌─────────────────────────────────────┐
│ Getting started           2/4  ▾   │
├─────────────────────────────────────┤
│ ✓ Create your account              │
│ ✓ Connect first integration        │
│ ○ Create a workflow                │
│ ○ Run your first automation        │
├─────────────────────────────────────┤
│ [Dismiss]                          │
└─────────────────────────────────────┘
```

### Rules
- 3-5 items max
- Ordered by importance
- Checkable = clickable
- Progress visible
- Dismissible (with confirmation)
- Returns if not complete

---

## Contextual Tooltips

### Use Sparingly For
- Non-obvious UI patterns
- New features
- Power user shortcuts

### Structure
```
     ┌───────────────────────────────────┐
     │ This button runs your workflow    │
     │ immediately with current config.  │
     │                                   │
     │ [Got it]              1 of 3  →  │
     └───────────────────────────────────┘
                    ↓
            ┌──────────────┐
            │   Run now    │
            └──────────────┘
```

### Rules
- Max 3-5 tooltips per flow
- Skip all option
- Progress indicator
- Point to specific element
- Single concept per tooltip
- Action to dismiss

---

## Guided Product Tour (Required for Apps)

A sequential walkthrough that shows users where key features are located.

### When to Trigger
- First login after signup
- After major feature release
- User clicks "Take a tour" link
- User appears lost (optional: behavioral trigger)

### Tour Structure
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌──────────┐                                                          │
│  │ Sidebar  │◄─── STEP 1: "This is your navigation. Access all        │
│  │          │      main sections from here."                           │
│  │ Dashboard│                                                          │
│  │ Projects │     ┌─────────────────────────────────────┐              │
│  │ Settings │     │ 📍 Navigation                       │              │
│  │          │     │                                     │              │
│  └──────────┘     │ This sidebar gives you quick        │              │
│                   │ access to all main areas.           │              │
│                   │                                     │              │
│                   │ [Skip tour]        [Next 1/5 →]    │              │
│                   └─────────────────────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Required Tour Stops (Pick What Applies)
```
1. NAVIGATION
   - Where to find main sections
   - How to switch between areas

2. PRIMARY ACTION
   - The main "Create" or "New" button
   - What it does

3. KEY FEATURES
   - 2-3 most important features
   - Where they live

4. SETTINGS/PROFILE
   - Where to customize
   - Where to get help

5. FIRST TASK
   - Guide them to do one thing
   - End with accomplishment
```

### Tour Rules
- Max 5-7 stops
- Each stop: 1-2 sentences max
- Highlight the actual UI element (dim rest of screen)
- Allow skip at any point
- Remember completion (don't show again)
- Offer "Replay tour" in help menu

---

## Coach Marks (UI Highlighting)

Visual indicators that draw attention to specific elements.

### Types of Coach Marks

#### 1. Spotlight/Hotspot
```
┌─────────────────────────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░┌────────────────┐░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░│  + New Project │░░░░← This button creates         │
│░░░░░░░░░░░░░░░░░░░░░└────────────────┘░░░░  your first project          │
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────────────────────────────────────────┘
  (░ = dimmed overlay, button is highlighted/spotlit)
```

#### 2. Pulsing Beacon
```
     ┌──────────────┐
     │   Settings  ◉│  ← Pulsing dot indicates "new" or "look here"
     └──────────────┘
```

#### 3. Numbered Badges
```
  ┌─────────────────────────────────────────┐
  │                                         │
  │   ①  [Dashboard]                        │  Numbers indicate
  │   ②  [Projects]                         │  recommended order
  │   ③  [Analytics]                        │
  │                                         │
  └─────────────────────────────────────────┘
```

#### 4. Arrow Pointers
```
        Click here to start
              ↓
     ┌──────────────────┐
     │   Get Started    │
     └──────────────────┘
```

### Coach Mark Rules
- Use ONE type consistently
- Don't combine multiple types (confusing)
- Disappear after interaction or dismiss
- Never block the element they're highlighting
- Accessible: work with keyboard navigation

---

## Feature Highlights (New/Updated Features)

Show users what's new or changed.

### First Login Feature Callout
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    ┌─────────────────────────────────┐                  │
│                    │  ✨ What's New                  │                  │
│                    │                                 │                  │
│                    │  • Dark mode is here            │                  │
│                    │  • New export options           │                  │
│                    │  • Faster search                │                  │
│                    │                                 │                  │
│                    │  [See details]    [Got it]     │                  │
│                    └─────────────────────────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### In-Context Feature Badge
```
  ┌─────────────────────────────────────────┐
  │  Export  [PDF ▾]  [CSV]  [NEW: API]     │
  └─────────────────────────────────────────┘
                               ↑
                        "NEW" badge on new feature
```

### Feature Highlight Rules
- Show once per user per feature
- Dismissible
- Link to documentation/details
- Don't stack multiple highlights
- Remove "NEW" badges after 30 days or interaction

---

## Interactive Tutorials (Learn by Doing)

Guided tasks that teach through action, not just reading.

### Structure
```
┌─────────────────────────────────────────────────────────────────────────┐
│  TUTORIAL: Create Your First Project                          Step 2/4  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────┐                                   │
│  │                                 │                                   │
│  │   Project Name                  │◄── Type a name for your project   │
│  │   [___________________]         │                                   │
│  │                    ↑            │    ┌──────────────────────────┐   │
│  │              Type here          │    │ Try typing "My First     │   │
│  │                                 │    │ Project" and press Enter │   │
│  │                                 │    └──────────────────────────┘   │
│  └─────────────────────────────────┘                                   │
│                                                                         │
│  [← Back]                                              [Skip tutorial]  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Interactive Tutorial Types

#### 1. Sandbox Tutorial
- User works in a "safe" practice environment
- Actions don't affect real data
- Can experiment freely

#### 2. Real-Data Tutorial
- User works with their actual data
- Accomplishes real task while learning
- Higher engagement, more risk

#### 3. Video + Action Hybrid
- Short video clip shows the action
- User then replicates it
- Best for complex interactions

### Rules
- Break into small steps (one action per step)
- Validate each step before proceeding
- Allow mistakes (show how to fix)
- Celebrate completion
- Offer to restart or skip

---

## Setup Wizard Best Practices

### Required Information Architecture
```
SETUP WIZARD FLOW:

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Welcome    │────▶│   Account    │────▶│  Configure   │────▶│  First Task  │
│              │     │   Setup      │     │  Preferences │     │  (Optional)  │
│ What we do   │     │              │     │              │     │              │
│ What to      │     │ Name, role   │     │ Integrations │     │ Create first │
│ expect       │     │ Team info    │     │ Notifications│     │ item         │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │   Dashboard  │
                                                               │   (Success!) │
                                                               └──────────────┘
```

### What to Show in Each Step

**Step 1: Welcome**
- Product name and one-line description
- What user will accomplish in setup
- Estimated time ("Takes about 2 minutes")

**Step 2: Account**
- Only essential info (name, role)
- Skip optional fields
- Social logins if applicable

**Step 3: Configure**
- Core preferences only
- Smart defaults pre-selected
- "You can change this later" reassurance

**Step 4: First Task**
- One simple action
- Creates something tangible
- User sees immediate value

---

## Progressive Disclosure

### Reveal Complexity Gradually
```
Basic Mode (New Users)
┌─────────────────────────────────────┐
│ Workflow Name: [____________]       │
│ Trigger: [Daily at 9am ▾]          │
│                   [Create]          │
└─────────────────────────────────────┘

Advanced Mode (After First Success)
┌─────────────────────────────────────┐
│ Workflow Name: [____________]       │
│ Trigger: [Daily at 9am ▾]          │
│ ▸ Advanced options                  │
│                   [Create]          │
└─────────────────────────────────────┘
```

### Rules
- Start simple
- Hide advanced options
- Unlock features after milestones
- Never overwhelm first-time users

---

## Content Guidelines

### Tone
- Welcoming but not effusive
- Direct and clear
- Focused on user benefit
- No jargon

### Good Examples
```
"Create your first workflow"
"Connect your data source to start syncing"
"This usually takes about 2 minutes"
```

### Bad Examples (Disallowed)
```
"Let's get started!"
"Welcome to the future of automation!"
"You're going to love this"
```

---

## Mode-Specific Rules

### MODE_SAAS
- Comprehensive onboarding
- Hand-holding acceptable
- Empty states guide action
- Celebrate first success (briefly)
- Checklist prominent

### MODE_INTERNAL
- Minimal onboarding
- Assume familiarity
- Documentation links preferred
- Quick start only
- No celebration

### MODE_AGENTIC
- Focus on first run
- Explain what agent does
- Show logs/transparency early
- Build trust through explanation
- No magic, no surprises

---

## Measuring Success

### Key Metrics
- Setup completion rate
- Time to first value (TTFV)
- Drop-off by step
- Return rate after day 1
- Feature adoption rate

### Rules
- Track each step
- Identify drop-off points
- Iterate on high-friction steps
- A/B test critical flows

---

## Skip & Exit Handling

### Skip (Individual Step)
- Allowed for optional steps
- Explain consequences
- Don't block progress

### Exit (Leave Onboarding)
- Confirm intent
- Save progress if possible
- Explain how to resume
- Link back to onboarding

```
┌─────────────────────────────────────────────────────┐
│ Leave setup?                                        │
│                                                     │
│ You can complete setup later from Settings.         │
│ Your progress has been saved.                       │
│                                                     │
│                   [Stay]  [Leave setup]             │
└─────────────────────────────────────────────────────┘
```

---

## Accessibility

### Requirements
- Keyboard navigable
- Focus management through steps
- Progress announced to screen readers
- Skip links available
- Tooltips accessible via keyboard

---

## Common Failures (Disallowed)

- Too many steps (>5)
- Mandatory video that can't skip
- Information-only steps with no action
- Blocking onboarding (can't skip)
- Celebrating before user has value
- Asking for permissions too early
- No way to exit
- No way to resume

---

## Final Onboarding Check

Before shipping, ask:
- What is the user's first valuable moment?
- How fast can they get there?
- Can they skip what's not essential?
- Is each step clearly purposeful?
- Can they exit and resume?

If unclear, refactor.

---

## END OF ONBOARDING PATTERN
