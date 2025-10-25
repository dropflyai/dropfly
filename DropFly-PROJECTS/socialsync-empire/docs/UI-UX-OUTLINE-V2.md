# 🎨 SocialSync UI/UX Outline v2.0

**Date:** 2025-10-24
**Based On:** Comprehensive research of 13 professional tools
**Design Philosophy:** "Professional video studio with AI superpowers, mobile-first"

---

## 📋 Table of Contents

1. [Core Design Principles](#core-design-principles)
2. [Navigation System](#navigation-system)
3. [Mode 1: Create (AI Generation)](#mode-1-create-ai-generation)
4. [Mode 2: Edit (Timeline Editing)](#mode-2-edit-timeline-editing)
5. [Mode 3: Post (Social Scheduling)](#mode-3-post-social-scheduling)
6. [Mode 4: Manage (Assets & Settings)](#mode-4-manage-assets--settings)
7. [Design System](#design-system)
8. [Mobile vs Desktop Layouts](#mobile-vs-desktop-layouts)
9. [Component Specifications](#component-specifications)
10. [Interaction Patterns](#interaction-patterns)

---

## 🎯 Core Design Principles

### Research-Backed Decisions

1. **Dark Mode Default**
   - Why: All professional video tools default to dark (reduces eye strain)
   - Implementation: Gray-950 background, high-contrast text
   - Light mode: Optional, not primary

2. **Mode-Based Interface**
   - Why: Different tasks need different layouts (DaVinci: 7 pages, Premiere: 15 workspaces)
   - Implementation: 4 primary modes with dedicated layouts
   - Navigation: Bottom tabs (mobile), sidebar (desktop)

3. **AI as Co-Pilot**
   - Why: AI tools that hide features lose (CapCut, Runway make AI primary)
   - Implementation: AI chat/wizard always accessible
   - Location: Central to workflows, not buried

4. **Preview-First**
   - Why: Visual confirmation builds confidence (Runway, Descript, Later)
   - Implementation: Real-time previews before every action
   - Layout: 50-60% screen for preview areas

5. **Mobile-First**
   - Why: Blaze.ai rebuilt for thumbs, CapCut mobile-dominant
   - Implementation: Touch targets, thumb zones, wizards
   - Breakpoint: Mobile < 768px, Desktop >= 768px

6. **Timeline-Centric Editing**
   - Why: All video editors use timeline at bottom
   - Implementation: 50% preview top, 40% timeline bottom, 10% controls
   - Innovation: Magnetic timeline (FCPX-inspired)

---

## 🧭 Navigation System

### Mobile Navigation (< 768px)

```
┌─────────────────────────────────────────┐
│ 📱 Mobile Header                        │
│ [Logo] SocialSync          [👤] [🔔]   │
└─────────────────────────────────────────┘
│                                         │
│                                         │
│         CONTENT AREA                    │
│         (Mode-specific)                 │
│                                         │
│                                         │
┌─────────────────────────────────────────┐
│ Bottom Nav (Fixed)                      │
│ ┌──────┬──────┬──────┬──────┬──────┐  │
│ │ 🏠   │ ✨   │ 📅   │ 📂   │ ⋯    │  │
│ │ Home │Create│ Post │Manage│ More │  │
│ └──────┴──────┴──────┴──────┴──────┘  │
└─────────────────────────────────────────┘
```

**Tabs:**
- **Home (🏠):** Dashboard, quick actions, stats
- **Create (✨):** AI video generation wizard
- **Post (📅):** Visual calendar, scheduling
- **Manage (📂):** Brand, avatars, assets, tools
- **More (⋯):** Settings, billing, help

**Header Actions:**
- **Profile (👤):** Account menu
- **Notifications (🔔):** Updates, generation complete, post scheduled

---

### Desktop Navigation (>= 768px)

```
┌─────────┬──────────────────────────────────────┐
│ SIDEBAR │ CONTENT AREA                         │
│ (280px) │                                      │
│         │                                      │
│ 🎨 Logo │                                      │
│         │      Mode-Specific Layout           │
│ ✨Create│                                      │
│ ✏️ Edit  │                                      │
│ 📅 Post  │                                      │
│ 📂Manage │                                      │
│ ──────  │                                      │
│ 📊 Stats│                                      │
│ ⚙️ Set's │                                      │
│         │                                      │
│ [👤 Rio]│                                      │
│ Starter │                                      │
└─────────┴──────────────────────────────────────┘
```

**Sidebar Structure:**
- **Top:** Logo, brand
- **Primary:** 4 main modes (Create, Edit, Post, Manage)
- **Divider**
- **Secondary:** Stats, Settings
- **Bottom:** User profile with tier badge

**Mode Highlighting:**
- Active mode: Gradient background (purple-blue)
- Hover: Gray-800 background
- Icon + label always visible

---

## 🎨 Mode 1: Create (AI Generation)

### Purpose
Generate AI videos, images, and posts using conversational wizards

### Research Inspiration
- **Runway ML:** Chat mode, real-time preview, wonder/discovery
- **Gamma.app:** < 1 min workflow, step-by-step
- **Blaze.ai:** Mobile wizards, brand kit integration
- **Descript:** One-click layouts

---

### Mobile Layout: Create Mode

```
┌─────────────────────────────────────────┐
│ ✨ Create AI Content                    │
│ [< Back]                    [Save Draft]│
├─────────────────────────────────────────┤
│                                         │
│ 🎬 Creator Mode Selection               │
│ ┌─────┬─────┬─────┬─────┐              │
│ │ 📱  │ ✂️  │ 🎓  │ 💰  │              │
│ │ UGC │Clip │ Edu │Sales│              │
│ └─────┴─────┴─────┴─────┘              │
│ ┌─────┬─────┬─────┬─────┐              │
│ │ 🗣️  │ 📖  │ 😂  │ 🎬  │              │
│ │News │Story│Meme │ Doc │ [Pro]        │
│ └─────┴─────┴─────┴─────┘              │
│                                         │
├─────────────────────────────────────────┤
│ 💬 AI Chat Interface (Scrollable)       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🤖 SocialSync                       │ │
│ │ What kind of content do you want to │ │
│ │ create today?                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│      ┌──────────────────────────────┐  │
│      │ 👤 I want to make a tutorial │  │
│      │ about using Instagram Reels  │  │
│      └──────────────────────────────┘  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🤖 Great! I'll use Educational mode │ │
│ │ What's the main topic?              │ │
│ │                                     │ │
│ │ 🎯 Trending Topics:                 │ │
│ │ • Instagram algorithm changes       │ │
│ │ • Reels vs TikTok                   │ │
│ │ • Viral hook formulas               │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ Input Area (Fixed Bottom)               │
│ ┌─────────────────────────────────────┐ │
│ │ Type your idea...            [🎤]  │ │
│ │                              [📎]  │ │
│ └─────────────────────────────────────┘ │
│ [✨ Generate] or [Use Trend Radar 🔥]  │
└─────────────────────────────────────────┘
```

**Wizard Steps (Progressive Disclosure):**

1. **Step 1: Mode Selection**
   - 8 creator mode cards (UGC, Clipping, Educational, Sales, etc.)
   - Pro modes show lock icon with upgrade prompt
   - Selected mode = highlighted border

2. **Step 2: Idea Input (Chat Interface)**
   - Conversational AI chat (like Runway's chat mode)
   - AI asks clarifying questions
   - Trending topics suggested
   - Voice input option (🎤)
   - Attach reference media (📎)

3. **Step 3: Configuration (Shown in Chat)**
   ```
   🤖 I'll create:

   📱 Platform: Instagram Reels, TikTok
   ⏱️  Duration: 60 seconds
   🎨 Style: Educational (clear, step-by-step)
   🗣️  Voice: [Your Default Avatar: Sarah]

   Want to change anything?

   [Looks Good!]  [Customize ⚙️]
   ```

4. **Step 4: Generation Progress**
   ```
   ┌─────────────────────────────────────┐
   │ ✨ Creating your video...           │
   │                                     │
   │ ████████████░░░░░░░░░░ 60%         │
   │                                     │
   │ ✅ Script generated                 │
   │ ✅ Voiceover created                │
   │ 🔄 Generating visuals...            │
   │ ⏳ Adding music & effects           │
   │                                     │
   │ Est. time: 45 seconds               │
   └─────────────────────────────────────┘
   ```

5. **Step 5: Preview & Edit**
   ```
   ┌─────────────────────────────────────┐
   │ 📹 Preview                          │
   │ ┌─────────────────────────────────┐ │
   │ │                                 │ │
   │ │     [Video Preview Player]      │ │
   │ │                                 │ │
   │ │     [▶️  Play]  [00:00 / 00:60] │ │
   │ └─────────────────────────────────┘ │
   │                                     │
   │ 📝 Caption:                         │
   │ "Learn Instagram Reels in 60       │
   │  seconds! 🎬 #instagramtips..."    │
   │  [Edit Caption]                     │
   │                                     │
   │ 🎨 Quick Edits:                     │
   │ [Add Text] [Music 🎵] [Filter]     │
   │                                     │
   │ [🗑️  Delete]  [✏️ Edit Timeline]    │
   │ [💾 Save]     [📅 Schedule Post]    │
   └─────────────────────────────────────┘
   ```

---

### Desktop Layout: Create Mode

```
┌──────────┬─────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ CREATE MODE                                                │
│ (280px)  │                                                             │
│          ├──────────────────────────────────────────────────────────┬──┤
│ ✨Create │ Creator Mode                    [Trend Radar 🔥] [History]│👤│
│ ✏️ Edit   │ ┌────┬────┬────┬────┬────┬────┬────┬────┐                │🔔│
│ 📅 Post   │ │📱  │✂️  │🎓  │💰  │🗣️  │📖  │😂  │🎬  │                │  │
│ 📂Manage │ │UGC │Clip│Edu │Sale│News│Stry│Meme│Doc │                │  │
│          │ └────┴────┴────┴────┴────┴────┴────┴────┘                │  │
│          │ [Selected: Educational 🎓]                                │  │
├──────────┤                                                           │  │
│ 📊Recent │ ┌───────────────────────┬────────────────────────────────┐│  │
│          │ │ 💬 AI Chat (60%)      │ 📹 Live Preview (40%)          ││  │
│ • Tutorial│ │                       │                                ││  │
│   Reels   │ │ 🤖 SocialSync        │ ┌────────────────────────────┐││  │
│   (Draft) │ │ What kind of content │ │                            │││  │
│          │ │ do you want to create?│ │                            │││  │
│ • Product│ │                       │ │   [Preview appears here    │││  │
│   Review  │ │   👤 You              │ │    once generation starts] │││  │
│   (Gen.)  │ │   I want a tutorial  │ │                            │││  │
│          │ │   about Instagram    │ │   [▶️  Play / Pause]        │││  │
│ • Meme   │ │   Reels              │ │                            │││  │
│   Trend   │ │                       │ │   [Timeline Scrubber]      │││  │
│   (Done)  │ │ 🤖 Great! What's the │ │   00:00 ────●───── 00:60   │││  │
│          │ │ main topic?          │ └────────────────────────────┘││  │
│          │ │                       │                                ││  │
│          │ │ 🎯 Trending:          │ 📊 Estimated Performance       ││  │
│          │ │ • Algorithm changes  │ Engagement: ⭐⭐⭐⭐☆          ││  │
│          │ │ • Reels vs TikTok    │ Virality: 🔥🔥🔥☆☆            ││  │
│          │ │ • Viral hooks        │ Platform: Instagram, TikTok    ││  │
│          │ │                       │                                ││  │
│          │ │ [Type message...]    │                                ││  │
│          │ │              [🎤][📎]│                                ││  │
│          │ │                       │                                ││  │
│          │ │ [✨ Generate Video]   │ [💾 Save Draft] [⚙️ Settings]  ││  │
│          │ └───────────────────────┴────────────────────────────────┘│  │
└──────────┴───────────────────────────────────────────────────────────┴──┘
```

**Desktop Advantages:**
- **Split View:** Chat on left (60%), preview on right (40%)
- **Sidebar Recent:** See recent drafts/generations without leaving
- **Keyboard Shortcuts:** Cmd+Enter to generate, Cmd+S to save draft
- **Trend Radar:** Floating panel with trending topics (can toggle)

---

### Creator Mode Cards

**Design:**
```
┌─────────────────┐
│      📱         │  ← Emoji icon
│      UGC        │  ← Mode name
├─────────────────┤
│ Authentic,      │  ← Description
│ relatable       │
│                 │
│ Best for:       │
│ TikTok, Reels   │  ← Platforms
│                 │
│ 15-60s          │  ← Duration
└─────────────────┘
```

**States:**
- Default: Gray-800 background, white text
- Hover: Gray-700, scale-105
- Selected: Purple-blue gradient border, glow effect
- Locked (Pro): Grayscale, lock icon, "Upgrade to Pro" overlay

---

### Trend Radar (Floating Panel)

```
┌─────────────────────────────────────┐
│ 🔥 Trend Radar (Last 15 min)       │
│                             [Close] │
├─────────────────────────────────────┤
│ 🔥🔥🔥🔥 HOT                          │
│ "Instagram algorithm changed again" │
│ 24.5K mentions • 🔥 Rising fast     │
│ [Use This Trend]                    │
├─────────────────────────────────────┤
│ 🔥🔥🔥 Trending                       │
│ "AI video tools comparison"         │
│ 12.3K mentions • 📈 Steady growth   │
│ [Use This Trend]                    │
├─────────────────────────────────────┤
│ 🔥🔥 Growing                          │
│ "Best time to post on TikTok"       │
│ 8.1K mentions • ⏰ New              │
│ [Use This Trend]                    │
└─────────────────────────────────────┘
```

**Features:**
- Real-time trending topics (Pro tier: 15min, Agency: 5min)
- Click "Use This Trend" to auto-populate chat
- Show engagement metrics
- Filter by platform (Instagram, TikTok, YouTube, etc.)

---

## ✏️ Mode 2: Edit (Timeline Editing)

### Purpose
Professional timeline editing for generated or uploaded videos

### Research Inspiration
- **DaVinci Resolve:** Timeline always at bottom, preview top
- **Final Cut Pro X:** Magnetic timeline (auto-snap, no gaps)
- **Adobe Premiere:** Dual preview (source + program)
- **Descript:** Text-based editing option

---

### Mobile Layout: Edit Mode

```
┌─────────────────────────────────────────┐
│ ✏️ Edit Video                 [Done]    │
│ [< Projects]            [Export] [⋯]    │
├─────────────────────────────────────────┤
│ 📹 Preview (60%)                        │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │                                     │ │
│ │      [Video Preview Player]         │ │
│ │                                     │ │
│ │                                     │ │
│ │     [▶️]  [00:15 / 01:00]           │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ ⏱️  Timeline (40%)                      │
│ ┌─────────────────────────────────────┐ │
│ │ 🎬 Video Track                      │ │
│ │ ┌──────┐┌──────┐┌────────┐         │ │
│ │ │ Clip1││ Clip2││ Clip3  │         │ │
│ │ └──────┘└──────┘└────────┘         │ │
│ │                                     │ │
│ │ 🗣️  Audio Track                     │ │
│ │ ┌────────────────────────┐         │ │
│ │ │ Voiceover              │         │ │
│ │ └────────────────────────┘         │ │
│ │                                     │ │
│ │ 🎵 Music Track                      │ │
│ │ ┌────────────────────────┐         │ │
│ │ │ Background Music       │         │ │
│ │ └────────────────────────┘         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Zoom -] ─────●───── [+] [Snap: On]    │
│                                         │
├─────────────────────────────────────────┤
│ 🛠️  Tools (Swipe up for more)          │
│ ┌────┬────┬────┬────┬────┬────┬────┐  │
│ │✂️  │🎨  │💬  │🎵  │🔊  │⏱️  │🪄  │  │
│ │Cut │Fltr│Text│Msc │Vol │Spd │AI  │  │
│ └────┴────┴────┴────┴────┴────┴────┘  │
└─────────────────────────────────────────┘
```

**Mobile Interactions:**
- **Swipe left/right:** Scrub timeline
- **Pinch:** Zoom timeline in/out
- **Tap clip:** Select and show tools
- **Long press:** Context menu (duplicate, delete, split)
- **Swipe up tools:** Full BottomSheet with all editing options

---

### Desktop Layout: Edit Mode

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ EDIT MODE: "Tutorial-Reels-Draft.mp4"               [Export]│
│ (280px)  │                                                              │
│          ├──────────────────────────────────────────────────────────────┤
│ ✨Create │ ┌──────────────────────────────────┬──────────────────────┐ │
│ ✏️ Edit   │ │ 📹 PREVIEW (50%)                 │ 🎨 INSPECTOR (20%)   │ │
│ 📅 Post   │ │                                  │                      │ │
│ 📂Manage │ │  ┌────────────────────────────┐  │ Selected: Clip 2     │ │
│          │ │  │                            │  │                      │ │
│          │ │  │                            │  │ Duration: 00:05.2s   │ │
│ 📂Library│ │  │   [Video Preview Area]     │  │ Position: 00:12.4s   │ │
│ (Panels) │ │  │                            │  │                      │ │
│          │ │  │   [▶️ Play]                │  │ ┌──────────────────┐ │ │
│ 🎬 Video │ │  │                            │  │ │ Transform        │ │ │
│  Files   │ │  │   00:15 ─────●──── 01:00  │  │ │ Scale: 100%      │ │ │
│          │ │  │                            │  │ │ Rotation: 0°     │ │ │
│ • Clip1  │ │  └────────────────────────────┘  │ │ Position: X/Y    │ │ │
│ • Clip2  │ │                                  │ └──────────────────┘ │ │
│ • Clip3  │ │  Playback Controls:              │                      │ │
│          │ │  [⏮️] [▶️] [⏭️] [Loop] [Mute]    │ ┌──────────────────┐ │ │
│ 🖼️  Media│ │                                  │ │ Video             │ │ │
│  Library │ │                                  │ │ Speed: 1.0x      │ │ │
│          │ │                                  │ │ Opacity: 100%    │ │ │
│ [+ Add]  │ │                                  │ └──────────────────┘ │ │
│          │ │                                  │                      │ │
│ 🎨Filters│ │                                  │ ┌──────────────────┐ │ │
│ 🎵 Music │ │                                  │ │ Audio             │ │ │
│ 🗣️  Voice│ │                                  │ │ Volume: 80%      │ │ │
│          │ └──────────────────────────────────┴──────────────────────┘ │
│          │                                                              │
│          │ ┌────────────────────────────────────────────────────────┐  │
│          │ │ ⏱️  TIMELINE (40%)                       [+ Track] [⚙️]│  │
│          │ │                                                        │  │
│          │ │ 🎬 Video 1  ┌──────┐┌──────┐┌────────┐               │  │
│          │ │             │ Clip1││ Clip2││ Clip3  │               │  │
│          │ │             └──────┘└──────┘└────────┘               │  │
│          │ │                                                        │  │
│          │ │ 🗣️  Audio 1  ┌──────────────────────┐                 │  │
│          │ │             │ Voiceover            │                 │  │
│          │ │             └──────────────────────┘                 │  │
│          │ │                                                        │  │
│          │ │ 🎵 Music 1  ┌──────────────────────┐                 │  │
│          │ │             │ Background Music     │                 │  │
│          │ │             └──────────────────────┘                 │  │
│          │ │                                                        │  │
│          │ │ 💬 Text 1   ┌───┐  ┌───┐  ┌────┐                     │  │
│          │ │             │Txt│  │Txt│  │Text│                     │  │
│          │ │             └───┘  └───┘  └────┘                     │  │
│          │ │                                                        │  │
│          │ │ 00:00 ──────────●───────────────────────── 01:00     │  │
│          │ │                                                        │  │
│          │ │ [Zoom -] ───────●──────── [+]  [Snap: ✅]  [Magnetic] │  │
│          │ └────────────────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────────────────┘
```

**Layout Breakdown:**
- **Left Sidebar (280px):** Navigation + Media Library panels
- **Center Preview (50%):** Video player with playback controls
- **Right Inspector (20%):** Selected clip properties
- **Bottom Timeline (40% height):** Multi-track editing

---

### Timeline Features (FCPX-Inspired)

**Magnetic Timeline:**
```
Before (Traditional):
┌──────┐        ┌──────┐  ← Gap when deleting Clip2
│ Clip1│  [GAP] │ Clip3│
└──────┘        └──────┘

After (Magnetic):
┌──────┐┌──────┐  ← Automatically closes gap
│ Clip1││ Clip3│
└──────┘└──────┘
```

**Features:**
- **Auto-snap:** Clips magnetize to each other (no gaps)
- **Color coding:** Video=purple, Audio=teal, Text=orange, Music=pink
- **Multi-select:** Cmd+Click to select multiple clips
- **Ripple delete:** Deleting clip auto-closes gap
- **Keyboard shortcuts:**
  - `Spacebar`: Play/pause
  - `I`: Mark in point
  - `O`: Mark out point
  - `Cmd+B`: Blade/split clip
  - `Cmd+C/V`: Copy/paste clip
  - `Delete`: Remove clip (magnetic close)

---

### Inspector Panel (Right Side)

**Contextual Properties:**
```
┌──────────────────────────┐
│ SELECTED: Clip 2         │
├──────────────────────────┤
│ 🎬 Transform             │
│ ┌────────────────────┐   │
│ │ Scale: [    100%  ]│   │
│ │ X: [     0        ]│   │
│ │ Y: [     0        ]│   │
│ │ Rotation: [ 0°    ]│   │
│ └────────────────────┘   │
│                          │
│ 🎨 Effects               │
│ ┌────────────────────┐   │
│ │ [+ Add Effect]     │   │
│ │                    │   │
│ │ • Blur (20%)       │   │
│ │ • Color Grade      │   │
│ └────────────────────┘   │
│                          │
│ 🗣️  Audio                │
│ ┌────────────────────┐   │
│ │ Volume: [  80%  ] │   │
│ │ Fade In: [ 0.5s ] │   │
│ │ Fade Out: [0.5s ] │   │
│ └────────────────────┘   │
│                          │
│ ⏱️  Timing               │
│ ┌────────────────────┐   │
│ │ Speed: [  1.0x  ] │   │
│ │ Duration: 00:05.2s│   │
│ │ Start: 00:12.4s   │   │
│ └────────────────────┘   │
│                          │
│ [Delete Clip]            │
└──────────────────────────┘
```

**Smart Features:**
- Changes based on selection (video clip vs audio vs text)
- Real-time preview updates
- Undo/redo for all changes (Cmd+Z / Cmd+Shift+Z)

---

### AI Editing Assistant (Floating Button)

```
┌─────────┐
│  🪄 AI  │  ← Floating button (bottom-right)
└─────────┘

Click opens:
┌──────────────────────────────┐
│ 🪄 AI Editor                 │
├──────────────────────────────┤
│ What would you like to do?   │
│                              │
│ • Auto-cut filler words      │
│ • Add captions               │
│ • Enhance audio              │
│ • Suggest music              │
│ • Auto-crop for platforms    │
│ • Generate B-roll            │
│                              │
│ Or type a request:           │
│ [e.g., "Add upbeat music"]   │
│                              │
│ [✨ Apply]          [Cancel] │
└──────────────────────────────┘
```

**AI Actions:**
- **Auto-cut filler words:** Removes "um", "uh", pauses (Descript-inspired)
- **Add captions:** Auto-generates word-by-word captions
- **Enhance audio:** Studio Sound (Descript feature)
- **Suggest music:** AI picks music matching mood
- **Auto-crop:** Resize for different platforms (9:16, 1:1, 16:9)
- **Generate B-roll:** Create AI visuals for sections

---

## 📅 Mode 3: Post (Social Scheduling)

### Purpose
Visual calendar for scheduling and publishing content across platforms

### Research Inspiration
- **Later:** Drag-and-drop visual calendar, grid planning
- **Buffer:** Minimalist, effortless scheduling
- **Metricool:** Analytics + scheduling combined
- **Blaze.ai:** Multi-platform publishing

---

### Mobile Layout: Post Mode

```
┌─────────────────────────────────────────┐
│ 📅 Post Schedule         [Filter ▼] [+] │
├─────────────────────────────────────────┤
│ 📆 Calendar View                        │
│                                         │
│ ◀ October 2025 ▶                        │
│                                         │
│ Mon  Tue  Wed  Thu  Fri  Sat  Sun      │
│ 21   22   23  [24]  25   26   27       │
│  1    2    3    4    1    -    -       │
│ post posts posts posts post             │
│                                         │
│ 28   29   30   31    1    2    3       │
│  2    3    1    -    -    -    -       │
│ posts posts post                        │
└─────────────────────────────────────────┘
│                                         │
│ 📋 Today's Schedule (Oct 24)            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 9:00 AM                  [Published]│ │
│ │ ┌─────┐ Tutorial: Instagram Reels  │ │
│ │ │ IMG │ 📱 Instagram, TikTok        │ │
│ │ └─────┘ 👀 1.2K views • 💬 43      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 2:00 PM                  [Scheduled]│ │
│ │ ┌─────┐ Product Review: AI Tools   │ │
│ │ │ IMG │ 📱 Instagram, YouTube       │ │
│ │ └─────┘ [Edit] [Reschedule]        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 6:00 PM              [Best Time 🔥] │ │
│ │ ┌─────┐ Trending: Algorithm Change │ │
│ │ │ IMG │ 📱 All Platforms            │ │
│ │ └─────┘ [Edit] [Post Now]          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Schedule New Post]                   │
└─────────────────────────────────────────┘
```

**Features:**
- **Calendar heatmap:** Days with posts show count
- **Today's list:** Scheduled and published posts
- **Status badges:** Published (green), Scheduled (blue), Draft (gray), Failed (red)
- **Quick actions:** Edit, reschedule, post now, view analytics
- **Best time indicator:** AI suggests optimal posting times (Pro tier)

---

### Desktop Layout: Post Mode

```
┌──────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ POST SCHEDULE                           [Grid View] [Week View]│
│ (280px)  │                                                  [Filter ▼] [+] │
│          ├───────────────────────────────────────────────────────────────┤
│ ✨Create │                                                                 │
│ ✏️ Edit   │ ┌─────────────────────────────────────────────────────────┐  │
│ 📅 Post   │ │ 📆 Visual Calendar (Later-inspired)                     │  │
│ 📂Manage │ │                                                         │  │
│          │ │      ◀ October 2025 ▶               [Today] [Month/Week]│  │
│          │ │                                                         │  │
│ 📊 Quick │ │ Mon    Tue    Wed    Thu    Fri    Sat    Sun          │  │
│  Stats   │ │ Oct 21 Oct 22 Oct 23 Oct 24 Oct 25 Oct 26 Oct 27       │  │
│          │ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  │
│ This Week│ │ │9 AM│ │9 AM│ │9 AM│ │9 AM│ │ -- │ │ -- │ │ -- │       │  │
│ 🎬 12    │ │ │📱  │ │📱  │ │📱  │ │📱  │ │    │ │    │ │    │       │  │
│  Videos  │ │ ├────┤ ├────┤ ├────┤ ├────┤ │    │ │    │ │    │       │  │
│          │ │ │2 PM│ │2 PM│ │2 PM│ │2 PM│ │Best│ │    │ │    │       │  │
│ 👀 45.2K │ │ │📱  │ │ -- │ │📱  │ │📱  │ │Time│ │    │ │    │       │  │
│  Views   │ │ ├────┤ │    │ ├────┤ ├────┤ │🔥  │ │    │ │    │       │  │
│          │ │ │6 PM│ │    │ │6 PM│ │6 PM│ │2 PM│ │    │ │    │       │  │
│ 💬 1.8K  │ │ │📱  │ │    │ │ -- │ │📱  │ │    │ │    │ │    │       │  │
│ Comments │ │ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘       │  │
│          │ └─────────────────────────────────────────────────────────┘  │
│ 📈 Top   │                                                                │
│  Posts   │ ┌─────────────────────────────────────────────────────────┐  │
│          │ │ 📋 Today's Schedule (Thursday, Oct 24)                  │  │
│ • Tutorial│ │                                                         │  │
│   (1.2K) │ │ ┌──────┬────────────────────────────────────────────┐  │  │
│          │ │ │ 9 AM │ ✅ Tutorial: Instagram Reels         [View]│  │  │
│ • Product│ │ │      │ 📱 Instagram, TikTok                       │  │  │
│   (890)  │ │ │      │ 👀 1.2K views • 💬 43 comments             │  │  │
│          │ │ │      │ ████████████████░░░░ 82% engagement       │  │  │
│          │ │ ├──────┼────────────────────────────────────────────┤  │  │
│          │ │ │ 2 PM │ 🔵 Product Review: Top AI Tools   [Edit]  │  │  │
│          │ │ │      │ 📱 Instagram, YouTube                      │  │  │
│          │ │ │      │ [Reschedule] [Preview] [Post Now]         │  │  │
│          │ │ ├──────┼────────────────────────────────────────────┤  │  │
│          │ │ │ 6 PM │ 🔥 Trending: Algorithm Changed    [Edit]  │  │  │
│          │ │ │🔥Best│ 📱 All Platforms (Instagram, TikTok, etc.) │  │  │
│          │ │ │      │ AI Suggestion: "Best time for engagement" │  │  │
│          │ │ │      │ Est. Reach: 5.2K • Engagement: High 📈    │  │  │
│          │ │ └──────┴────────────────────────────────────────────┘  │  │
│          │ └─────────────────────────────────────────────────────────┘  │
│          │                                                                │
│          │ [+ Schedule New Post]      [📊 Analytics] [⚙️ Settings]       │
└──────────┴───────────────────────────────────────────────────────────────┘
```

**Desktop Features:**
- **Visual calendar grid:** Drag-and-drop scheduling (Later-inspired)
- **Weekly stats sidebar:** Quick overview of performance
- **Time slots:** Each day divided by posting times
- **Drag-and-drop:** Drag posts between slots to reschedule
- **Best time highlighting:** AI-recommended slots glow (🔥)
- **Bulk actions:** Select multiple posts to reschedule/delete

---

### Post Card (Detail View)

```
┌───────────────────────────────────────┐
│ 📱 Instagram, TikTok, YouTube         │
│ Status: 🔵 Scheduled for Oct 24, 2PM │
├───────────────────────────────────────┤
│ ┌───────────────────────────────────┐ │
│ │                                   │ │
│ │    [Thumbnail Preview]            │ │
│ │                                   │ │
│ │    "Tutorial: Instagram Reels"    │ │
│ │    00:58 duration                 │ │
│ └───────────────────────────────────┘ │
│                                       │
│ 📝 Caption:                           │
│ "Learn Instagram Reels in under a    │
│  minute! 🎬 Full tutorial inside.    │
│  #instagramtips #reels #socialmedia" │
│                                       │
│ 🎯 Platforms:                         │
│ [✅ Instagram] [✅ TikTok] [✅ YouTube]│
│                                       │
│ ⏰ Schedule:                          │
│ Oct 24, 2025 at 2:00 PM EST          │
│ 🔥 Best time for engagement           │
│                                       │
│ 📊 Predicted Performance:             │
│ Reach: ~5.2K • Engagement: High 📈    │
│                                       │
│ [Edit Post] [Reschedule] [Post Now]   │
│ [Delete]    [Duplicate]  [Preview]    │
└───────────────────────────────────────┘
```

---

### Autonomous Posting (Pro Feature)

```
┌─────────────────────────────────────┐
│ 🤖 Autonomous Posting               │
│ (Pro Plan Feature)                  │
├─────────────────────────────────────┤
│ Status: ✅ Active                   │
│                                     │
│ AI is managing your posting         │
│ schedule based on:                  │
│                                     │
│ ✅ Best engagement times            │
│ ✅ Trending topics                  │
│ ✅ Content variety                  │
│ ✅ Platform algorithms              │
│                                     │
│ 📊 This Week:                       │
│ • 12 posts scheduled                │
│ • 8 optimal time slots found        │
│ • 3 trending topics incorporated    │
│                                     │
│ 🎯 Settings:                        │
│ Frequency: [3-5 posts/day ▼]       │
│ Platforms: [All selected ▼]        │
│ Content Mix: [Balanced ▼]          │
│                                     │
│ [Configure] [View Schedule]         │
└─────────────────────────────────────┘
```

**Autonomous Features (Pro tier):**
- AI analyzes best times to post
- Auto-schedules content from library
- Balances content types (video, image, carousel)
- Adapts to trending topics
- Maintains consistent posting frequency
- User approval required (or auto-post)

---

## 📂 Mode 4: Manage (Assets & Settings)

### Purpose
Manage brand voice, AI avatars, media library, tools, and settings

### Research Inspiration
- **Blaze.ai:** Brand Kit (auto-scan social/website)
- **Descript:** Custom AI voices
- **Adobe Premiere:** Media organization
- **Buffer:** Simple settings

---

### Mobile Layout: Manage Mode

```
┌─────────────────────────────────────────┐
│ 📂 Manage                    [Settings] │
├─────────────────────────────────────────┤
│                                         │
│ 🎨 Brand Voice                          │
│ ┌─────────────────────────────────────┐ │
│ │ Current Brand: "Creative Studio"    │ │
│ │ Voice: Professional, inspiring      │ │
│ │ [Edit Brand Voice]                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🧑 AI Avatars (2/2 used - Starter)      │
│ ┌─────────────────────────────────────┐ │
│ │ ┌───────┐ ┌───────┐                │ │
│ │ │ Sarah │ │  Tom  │ [+ Add]        │ │
│ │ │ [IMG] │ │ [IMG] │ (Upgrade)      │ │
│ │ │ ✅ Def │ │       │                │ │
│ │ └───────┘ └───────┘                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📁 Media Library (120 files)            │
│ ┌─────────────────────────────────────┐ │
│ │ [All ▼] [Videos] [Images] [Audio]  │ │
│ │                                     │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │ │
│ │ │ IMG │ │ VID │ │ IMG │ │ VID │   │ │
│ │ └─────┘ └─────┘ └─────┘ └─────┘   │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │ │
│ │ │ VID │ │ IMG │ │ VID │ │ AUD │   │ │
│ │ └─────┘ └─────┘ └─────┘ └─────┘   │ │
│ │                                     │ │
│ │ [+ Upload] [Organize] [Sort ▼]     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🛠️  Video Tools                         │
│ ┌─────────────────────────────────────┐ │
│ │ • Video Downloader (∞ - Starter)    │ │
│ │ • Watermark Remover (20/mo)         │ │
│ │ • Social Cropper (All platforms)    │ │
│ │ • Thumbnail Generator               │ │
│ │ • Format Converter                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📊 Analytics                            │
│ ┌─────────────────────────────────────┐ │
│ │ Last 7 Days (Starter Plan)          │ │
│ │                                     │ │
│ │ 👀 Views: 45.2K (+12%)              │ │
│ │ 💬 Engagement: 1.8K (+8%)           │ │
│ │ 📈 Reach: 62.1K (+15%)              │ │
│ │                                     │ │
│ │ [View Full Analytics]               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ⚙️  Account Settings                    │
│ ┌─────────────────────────────────────┐ │
│ │ • Profile & Preferences             │ │
│ │ • Connected Platforms (2/2)         │ │
│ │ • Billing & Subscription (Starter)  │ │
│ │ • Team Members (Upgrade for teams)  │ │
│ │ • Support & Help                    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### Desktop Layout: Manage Mode

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ MANAGE                                        [Settings ⚙️] │
│ (280px)  │                                                              │
│          ├──────────────────────────────────────────────────────────────┤
│ ✨Create │                                                              │
│ ✏️ Edit   │ ┌────────────────────────┬────────────────────────────────┐│
│ 📅 Post   │ │ 🎨 BRAND VOICE         │ 🧑 AI AVATARS (2/2 - Starter)  ││
│ 📂Manage │ │                        │                                ││
│          │ │ Current Brand:         │ ┌──────┐ ┌──────┐ ┌──────────┐││
│          │ │ "Creative Studio"      │ │Sarah │ │ Tom  │ │ + Add    │││
│ 📂Sections│ │                        │ │[IMG] │ │[IMG] │ │ Avatar   │││
│          │ │ Voice Style:           │ │✅ Def │ │      │ │          │││
│ • Brand  │ │ Professional,          │ └──────┘ └──────┘ │ Upgrade  │││
│ • Avatars│ │ inspiring, authentic   │                    │ for more │││
│ • Library│ │                        │ [Manage Avatars]   └──────────┘││
│ • Tools  │ │ Example:               │                                ││
│ • Analytics│ "At Creative Studio,   │ Training Status:               ││
│ • Settings│  we believe in          │ ✅ Sarah (Ready)                ││
│          │  empowering creators..." │ ✅ Tom (Ready)                  ││
│          │ │                        │                                ││
│          │ │ [Edit Brand Voice]     │ [View Usage Stats]             ││
│          │ │ [Scan My Website] 🪄   │                                ││
│          │ └────────────────────────┴────────────────────────────────┘│
│          │                                                              │
│          │ ┌──────────────────────────────────────────────────────────┐│
│          │ │ 📁 MEDIA LIBRARY (120 files)          [+ Upload] [Sort ▼]││
│          │ │                                                          ││
│          │ │ [All] [Videos (45)] [Images (60)] [Audio (15)]          ││
│          │ │                                                          ││
│          │ │ Grid View:                                               ││
│          │ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        ││
│          │ │ │ IMG │ │ VID │ │ IMG │ │ VID │ │ VID │ │ IMG │        ││
│          │ │ │ 01  │ │ 02  │ │ 03  │ │ 04  │ │ 05  │ │ 06  │        ││
│          │ │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘        ││
│          │ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        ││
│          │ │ │ VID │ │ AUD │ │ IMG │ │ VID │ │ IMG │ │ VID │        ││
│          │ │ │ 07  │ │ 08  │ │ 09  │ │ 10  │ │ 11  │ │ 12  │        ││
│          │ │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘        ││
│          │ │                                                          ││
│          │ │ [Select Multiple] [Delete] [Move to Folder]              ││
│          │ └──────────────────────────────────────────────────────────┘│
│          │                                                              │
│          │ ┌────────────────────────┬────────────────────────────────┐│
│          │ │ 🛠️  VIDEO TOOLS         │ 📊 ANALYTICS (Last 7 days)     ││
│          │ │                        │                                ││
│          │ │ ✅ Video Downloader     │ ┌────────────────────────────┐││
│          │ │    Unlimited (Starter) │ │     📈 Performance         │││
│          │ │    [Launch Tool]       │ │                            │││
│          │ │                        │ │ 👀 Views: 45.2K (+12%)     │││
│          │ │ ✅ Watermark Remover    │ │ 💬 Engagement: 1.8K (+8%)  │││
│          │ │    20/20 remaining     │ │ 📈 Reach: 62.1K (+15%)     │││
│          │ │    [Launch Tool]       │ │ ⭐ Avg Rating: 4.2/5       │││
│          │ │                        │ │                            │││
│          │ │ ✅ Social Cropper       │ │ Top Post:                  │││
│          │ │    All platforms       │ │ "Tutorial: Reels" (1.2K)   │││
│          │ │    [Launch Tool]       │ │                            │││
│          │ │                        │ │ [View Full Analytics →]    │││
│          │ │ ✅ Thumbnail Generator  │ └────────────────────────────┘││
│          │ │    [Launch Tool]       │                                ││
│          │ │                        │ ⚙️  QUICK SETTINGS             ││
│          │ │ ✅ Format Converter     │ • Profile & Preferences        ││
│          │ │    [Launch Tool]       │ • Connected Platforms (2/2)    ││
│          │ └────────────────────────┤ • Billing (Starter - $29/mo)   ││
│          │                          │ • Support & Help               ││
│          │                          └────────────────────────────────┘│
└──────────┴──────────────────────────────────────────────────────────────┘
```

---

### Brand Voice Editor (Blaze.ai-Inspired)

```
┌──────────────────────────────────────────┐
│ 🎨 Edit Brand Voice                      │
│                                   [Save] │
├──────────────────────────────────────────┤
│                                          │
│ Brand Name:                              │
│ [Creative Studio                       ] │
│                                          │
│ Voice Style (Select all that apply):     │
│ [✅ Professional] [✅ Inspiring]          │
│ [✅ Authentic]    [  Playful]            │
│ [  Authoritative][  Casual]              │
│                                          │
│ Target Audience:                         │
│ [Content creators & small businesses   ] │
│                                          │
│ Core Values (3-5 keywords):              │
│ [Creativity, Innovation, Community     ] │
│                                          │
│ Example Content:                         │
│ ┌────────────────────────────────────┐  │
│ │ At Creative Studio, we believe in  │  │
│ │ empowering creators with cutting-  │  │
│ │ edge AI tools that amplify your    │  │
│ │ unique voice. Whether you're a     │  │
│ │ solo creator or agency, we help    │  │
│ │ you create content that resonates. │  │
│ └────────────────────────────────────┘  │
│                                          │
│ 🪄 AI Brand Scan:                        │
│ [Scan My Website]  [Scan Social Media]   │
│                                          │
│ AI will analyze your existing content    │
│ and auto-generate a brand voice.         │
│                                          │
│ [Cancel]                [Save Changes]   │
└──────────────────────────────────────────┘
```

**Brand Scan Feature (Blaze.ai-inspired):**
- User provides website URL or social handle
- AI scrapes public content
- Analyzes tone, style, common phrases
- Auto-generates brand voice profile
- User can edit/approve

---

### AI Avatar Manager

```
┌──────────────────────────────────────────┐
│ 🧑 Manage AI Avatars (2/2 used - Starter)│
│                                 [Upgrade]│
├──────────────────────────────────────────┤
│                                          │
│ Your Avatars:                            │
│                                          │
│ ┌──────────────┐  ┌──────────────┐      │
│ │    Sarah     │  │     Tom      │      │
│ │  [IMAGE]     │  │  [IMAGE]     │      │
│ │              │  │              │      │
│ │ ✅ Default   │  │              │      │
│ │ Status: ✅   │  │ Status: ✅   │      │
│ │ Ready        │  │ Ready        │      │
│ │              │  │              │      │
│ │ [Edit]       │  │ [Edit]       │      │
│ │ [Set Default]│  │ [Set Default]│      │
│ │ [Delete]     │  │ [Delete]     │      │
│ └──────────────┘  └──────────────┘      │
│                                          │
│ ┌──────────────┐                         │
│ │ + Add Avatar │  ← Locked (Upgrade)     │
│ │              │                         │
│ │  Upgrade to  │                         │
│ │  Pro for 5   │                         │
│ │  avatars     │                         │
│ │              │                         │
│ │ [Upgrade →]  │                         │
│ └──────────────┘                         │
│                                          │
│ How it works:                            │
│ 1. Upload 3-5 photos of yourself         │
│ 2. AI trains avatar (~3 minutes)         │
│ 3. Use avatar in any video               │
│ 4. AI speaks any script in your voice    │
│                                          │
│ [Learn More]                             │
└──────────────────────────────────────────┘
```

**Click "Edit" on Sarah:**

```
┌──────────────────────────────────────────┐
│ 🧑 Edit Avatar: Sarah                    │
│                          [Save] [Delete] │
├──────────────────────────────────────────┤
│                                          │
│ Avatar Name:                             │
│ [Sarah                                 ] │
│                                          │
│ Training Photos (3 uploaded):            │
│ ┌─────┐ ┌─────┐ ┌─────┐                 │
│ │ 📷  │ │ 📷  │ │ 📷  │ [+ Add Photo]   │
│ └─────┘ └─────┘ └─────┘ (Max 5)         │
│                                          │
│ Voice Settings:                          │
│ Accent: [American English ▼]            │
│ Tone: [Friendly & Professional ▼]       │
│ Speed: [Normal ▼]                        │
│                                          │
│ 🎤 Voice Sample:                         │
│ [▶️ Play Sample]                         │
│ "Hi, I'm Sarah. Let's create amazing    │
│  content together!"                      │
│                                          │
│ Status: ✅ Ready to use                  │
│                                          │
│ [⚙️ Retrain Avatar] [🗑️  Delete Avatar]  │
│ [Cancel]               [Save Changes]    │
└──────────────────────────────────────────┘
```

---

## 🎨 Design System

### Color Palette

**Dark Mode (Default):**
```css
/* Background Colors */
--bg-primary: #030712;      /* Gray-950 - Main background */
--bg-secondary: #111827;    /* Gray-900 - Cards, panels */
--bg-tertiary: #1f2937;     /* Gray-800 - Hover states */
--bg-elevated: #374151;     /* Gray-700 - Active elements */

/* Text Colors */
--text-primary: #f9fafb;    /* Gray-50 - Primary text */
--text-secondary: #d1d5db;  /* Gray-300 - Secondary text */
--text-tertiary: #9ca3af;   /* Gray-400 - Placeholder text */

/* Accent Colors */
--primary-500: #8b5cf6;     /* Purple - Primary actions */
--primary-600: #7c3aed;     /* Purple - Hover */
--primary-700: #6d28d9;     /* Purple - Active */

--secondary-500: #3b82f6;   /* Blue - Secondary actions */
--secondary-600: #2563eb;   /* Blue - Hover */

--accent-500: #ec4899;      /* Pink - Highlights */
--accent-600: #db2777;      /* Pink - Hover */

/* Status Colors */
--success: #10b981;         /* Green - Success, published */
--warning: #f59e0b;         /* Orange - Warning, scheduled */
--error: #ef4444;           /* Red - Error, failed */
--info: #3b82f6;            /* Blue - Info */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
--gradient-accent: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
```

**Light Mode (Optional):**
```css
/* Inverse of dark mode colors */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--text-primary: #111827;
/* ... etc */
```

---

### Typography

```css
/* Font Families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

### Spacing

```css
/* Based on 4px grid */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Badges, small buttons */
--radius-md: 0.5rem;    /* 8px - Cards, inputs */
--radius-lg: 0.75rem;   /* 12px - Modals */
--radius-xl: 1rem;      /* 16px - Large cards */
--radius-full: 9999px;  /* Fully rounded - Pills, avatars */
```

---

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.2);
--shadow-glow: 0 0 20px rgba(139, 92, 246, 0.4); /* Purple glow */
```

---

### Animations

```css
/* Transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 📱 Mobile vs Desktop Layouts

### Breakpoints

```css
/* Mobile First Approach */
--mobile: 0px;        /* Mobile (default) */
--tablet: 768px;      /* Tablet */
--desktop: 1024px;    /* Desktop */
--wide: 1280px;       /* Wide desktop */
```

---

### Mobile-Specific Features

1. **Bottom Navigation (< 768px)**
   - Fixed at bottom
   - 5 tabs, 60px height
   - Icons + labels
   - Active state = gradient background

2. **Touch Targets**
   - Minimum 44x44px (Apple HIG)
   - Thumb zone: Bottom 60% of screen
   - Primary actions: Bottom-right corner

3. **Swipe Gestures**
   - Swipe down: Close modals
   - Swipe left/right: Navigate timeline
   - Pinch: Zoom timeline

4. **BottomSheet Modals**
   - Slide up from bottom
   - Drag handle at top
   - Swipe down to dismiss
   - Backdrop blur

5. **Simplified Layouts**
   - Single column
   - Larger text (16px minimum)
   - More spacing between elements
   - Hide secondary info (show on tap)

---

### Desktop-Specific Features

1. **Sidebar Navigation (>= 768px)**
   - Fixed left sidebar, 280px
   - Icons + labels always visible
   - Hover states
   - Collapsible (future feature)

2. **Multi-Column Layouts**
   - Edit Mode: Preview (50%) + Inspector (20%) + Timeline (100% width)
   - Create Mode: Chat (60%) + Preview (40%)
   - Post Mode: Calendar + Schedule list

3. **Resizable Panels**
   - Drag panel edges to resize
   - Save layout preferences
   - Reset to default

4. **Keyboard Shortcuts**
   - Cmd/Ctrl + K: Command palette
   - Cmd/Ctrl + S: Save
   - Cmd/Ctrl + Enter: Generate/Submit
   - Spacebar: Play/pause preview
   - Cmd/Ctrl + Z: Undo
   - Cmd/Ctrl + Shift + Z: Redo

5. **Hover States**
   - Tooltips on icons
   - Preview on hover (thumbnails)
   - Context menus (right-click)

---

## 🧩 Component Specifications

### Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
}
```

**Variants:**
- **Primary:** Gradient background, white text (CTA)
- **Secondary:** Gray background, white text
- **Ghost:** Transparent, hover background
- **Danger:** Red background, white text (delete, cancel)

**Sizes:**
- **sm:** 32px height, 12px padding
- **md:** 40px height, 16px padding
- **lg:** 48px height, 20px padding

**States:**
- **Hover:** Brightness increase, scale-105
- **Active:** Scale-98
- **Loading:** Spinner, disabled
- **Disabled:** Opacity 50%, not clickable

---

### Card Component

```typescript
interface CardProps {
  variant: 'default' | 'glass' | 'elevated' | 'bordered';
  padding: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  hover?: boolean;
}
```

**Variants:**
- **Default:** Gray-900 background, no border
- **Glass:** Backdrop blur, semi-transparent
- **Elevated:** Shadow-lg, slight lift
- **Bordered:** 1px border, gray-800

**Padding:**
- **sm:** 12px
- **md:** 16px
- **lg:** 24px

---

### Input Component

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  icon?: ReactNode;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}
```

**Design:**
- Label above input (gray-300)
- Gray-800 background, gray-600 border
- Focus: Purple border, glow
- Error: Red border, error message below
- Icon: Left side, gray-400

---

### Modal Component

**Mobile:** BottomSheet (slides from bottom)
**Desktop:** Centered modal with backdrop

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closable?: boolean;
}
```

**Features:**
- Backdrop blur
- Escape key to close
- Click outside to close (optional)
- Smooth animations (slide up mobile, fade in desktop)

---

## 🎯 Interaction Patterns

### Loading States

**Skeleton Screens:**
```
┌─────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░             │
│                                     │
│ ▓▓▓▓░░░░░░                          │
│ ▓▓▓▓▓▓▓▓▓░░░░░░                     │
│                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │▓▓▓▓▓│ │▓▓▓▓▓│ │▓▓▓▓▓│            │
│ └─────┘ └─────┘ └─────┘            │
└─────────────────────────────────────┘
```

**Progress Bars:**
```
████████████░░░░░░░░░░ 60%
Est. time: 45 seconds
```

**Spinners:**
```
⏳ Generating...
🔄 Processing...
```

---

### Error Handling

**Inline Errors (Form validation):**
```
┌─────────────────────────────────────┐
│ Email                               │
│ [user@example                     ] │
│ ❌ Please enter a valid email       │
└─────────────────────────────────────┘
```

**Toast Notifications (Success/Error):**
```
┌─────────────────────────────────────┐
│ ✅ Video generated successfully!    │
│ [View] [Schedule Post]              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ❌ Generation failed                 │
│ Error: Insufficient credits          │
│ [Retry] [Upgrade Plan]              │
└─────────────────────────────────────┘
```

**Error Pages (404, 500):**
```
┌─────────────────────────────────────┐
│                                     │
│         🚫 404                       │
│    Page Not Found                   │
│                                     │
│  The page you're looking for        │
│  doesn't exist.                     │
│                                     │
│  [← Back to Home]                   │
│                                     │
└─────────────────────────────────────┘
```

---

### Empty States

**No Content:**
```
┌─────────────────────────────────────┐
│                                     │
│         🎬                           │
│    No videos yet                    │
│                                     │
│  Create your first AI video to     │
│  get started!                       │
│                                     │
│  [✨ Create Video]                  │
│                                     │
└─────────────────────────────────────┘
```

**No Results (Search/Filter):**
```
┌─────────────────────────────────────┐
│                                     │
│         🔍                           │
│    No results found                 │
│                                     │
│  Try adjusting your filters or      │
│  search terms                       │
│                                     │
│  [Clear Filters]                    │
│                                     │
└─────────────────────────────────────┘
```

---

### Confirmation Dialogs

```
┌─────────────────────────────────────┐
│ ⚠️  Delete Video?                    │
├─────────────────────────────────────┤
│                                     │
│ Are you sure you want to delete     │
│ "Tutorial: Instagram Reels"?        │
│                                     │
│ This action cannot be undone.       │
│                                     │
│ [Cancel]         [🗑️  Delete Video] │
└─────────────────────────────────────┘
```

---

## 🎯 Next Steps

### Phase 1: Core Foundation (Week 1-2)
- [ ] Set up design system (colors, typography, spacing)
- [ ] Build reusable components (Button, Card, Input, Modal)
- [ ] Implement navigation system (BottomNav + Sidebar)
- [ ] Create layout shells for all 4 modes

### Phase 2: Create Mode (Week 3-4)
- [ ] Build AI chat interface with message threading
- [ ] Implement Creator Mode selector (8 modes)
- [ ] Build wizard flow (mode → input → config → generate → review)
- [ ] Integrate Claude API for AI chat
- [ ] Add Trend Radar floating panel
- [ ] Real-time preview during generation

### Phase 3: Edit Mode (Week 5-6)
- [ ] Build timeline component with tracks
- [ ] Implement magnetic timeline (FCPX-inspired)
- [ ] Create video preview player
- [ ] Build Inspector panel (contextual properties)
- [ ] Add timeline controls (zoom, snap, playback)
- [ ] Implement AI editing assistant

### Phase 4: Post Mode (Week 7-8)
- [ ] Build visual calendar (Later-inspired)
- [ ] Implement drag-and-drop scheduling
- [ ] Create post cards with platform previews
- [ ] Add best time suggestions (AI-powered)
- [ ] Build autonomous posting system (Pro feature)
- [ ] Integrate social platform APIs

### Phase 5: Manage Mode (Week 9-10)
- [ ] Build Brand Voice editor with AI scan
- [ ] Create AI Avatar manager with upload
- [ ] Build media library with grid/list views
- [ ] Implement video tools launchers
- [ ] Create analytics dashboard
- [ ] Build settings pages

### Phase 6: Polish & Launch (Week 11-12)
- [ ] Add animations and micro-interactions
- [ ] Implement keyboard shortcuts (desktop)
- [ ] Add loading skeletons and empty states
- [ ] Error handling and toast notifications
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Performance optimization
- [ ] User testing and feedback
- [ ] Launch beta!

---

## ✅ Design Checklist

**Before Building:**
- [✅] Research completed (13 tools analyzed)
- [✅] Design patterns identified (47 patterns)
- [✅] Wireframes created for all modes
- [⏳] User approval on outline
- [⏳] Design system finalized

**During Building:**
- [ ] Follow mobile-first approach
- [ ] Use design tokens (CSS variables)
- [ ] Implement dark mode first
- [ ] Add loading states to all async actions
- [ ] Handle errors gracefully
- [ ] Test on multiple devices
- [ ] Ensure accessibility (WCAG 2.1 AA)

**After Building:**
- [ ] User testing (5-10 users)
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Analytics implementation
- [ ] Documentation for users

---

## 📚 Resources & References

**Design Inspiration:**
- DaVinci Resolve: Page-based navigation, timeline-centric
- Final Cut Pro X: Magnetic timeline, clean aesthetic
- Adobe Premiere Pro: Workspace presets, resizable panels
- CapCut: Mobile-first, AI upfront, minimalism
- Runway ML: Chat mode, real-time preview, wonder/discovery
- Descript: Text-based editing, AI actions sidebar
- Gamma.app: Wizard workflow, pre-designed templates
- Blaze.ai: Mobile wizards, brand kit auto-scan
- Later: Visual calendar, drag-and-drop
- Buffer: Minimalist scheduling

**Technical Stack:**
- Next.js 15.5.4 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase (backend)
- Clerk (auth - if used)
- Framer Motion (animations)

**Design Tools:**
- Figma (design files - if needed)
- Lucide Icons (icon library)
- Inter font (typography)

---

**This outline is ready for approval. Once approved, we'll begin building mode by mode, starting with the design system and navigation, then Create Mode, Edit Mode, Post Mode, and finally Manage Mode.**

**No more generic dashboards. Professional, research-backed, purpose-built interface.**
