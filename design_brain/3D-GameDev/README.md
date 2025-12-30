# 3D & Game Development — Design Brain Extension

Build games and 3D experiences with code and MCP-controlled tools.

---

## What This Section Covers

This extension enables:
- **Web-based games** (code-only, no external tools needed)
- **3D modeling & animation** (via Blender MCP)
- **Unity game development** (via Unity MCP)
- **Unreal Engine development** (via Unreal MCP)
- **Asset generation** (via AI image/model MCPs)
- **Game UX patterns** (HUDs, menus, tutorials, feedback)

---

## Capability Matrix

| What | How | MCP Required? |
|------|-----|---------------|
| 2D Web Games | Phaser, PixiJS, KAPLAY | No |
| 3D Web Games | Babylon.js, Three.js, R3F | No |
| 3D Modeling | Blender | Yes |
| 3D Animation | Blender | Yes |
| Unity Games | Unity Editor | Yes |
| Unreal Games | Unreal Editor | Yes |
| Asset Generation | AI models | Yes |
| 2D Animation | Spine, code-based | Optional |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GAME DEVELOPMENT MODES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MODE 1: WEB GAMES (Code-Only)                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │   Claude Code ──writes──▶ Game Code ──run──▶ Browser                │   │
│  │                          (Phaser, Babylon,                          │   │
│  │                           Three.js, etc.)                           │   │
│  │                                                                     │   │
│  │   No external tools needed. Full control.                          │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  MODE 2: 3D TOOLS (MCP-Controlled)                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │   Claude Code ──MCP──▶ Blender ──exports──▶ Assets                 │   │
│  │        │                                       │                    │   │
│  │        │                                       ▼                    │   │
│  │        └──MCP──▶ Unity/Unreal ◀──imports──────┘                    │   │
│  │                      │                                              │   │
│  │                      ▼                                              │   │
│  │                 Game Build                                          │   │
│  │                                                                     │   │
│  │   Tools run on your machine. Claude controls via MCP.              │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  MODE 3: HYBRID (Web + 3D Assets)                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │   Blender ──MCP──▶ Export GLTF ──▶ Three.js/Babylon.js Web Game   │   │
│  │                                                                     │   │
│  │   Best of both: Custom 3D assets in web-based games.               │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
3D-GameDev/
│
├── README.md                    # This file
│
├── WebGameEngines.md            # Web-based game development
│   ├── Phaser (2D)
│   ├── Babylon.js (3D)
│   ├── Three.js (3D)
│   ├── React Three Fiber (3D + React)
│   ├── PixiJS (2D graphics)
│   └── Other engines
│
├── BlenderWorkflow.md           # 3D modeling & animation via MCP
│   ├── MCP setup
│   ├── Object creation
│   ├── Materials & textures
│   ├── Animation
│   ├── Rendering
│   └── Export pipelines
│
├── UnityWorkflow.md             # Unity development via MCP
│   ├── MCP setup
│   ├── Scene management
│   ├── GameObject creation
│   ├── Component systems
│   ├── Scripting (C#)
│   └── Build pipelines
│
├── UnrealWorkflow.md            # Unreal development via MCP
│   ├── MCP setup
│   ├── Actor management
│   ├── Blueprint integration
│   ├── Level design
│   └── Build pipelines
│
├── GameUXPatterns.md            # Game-specific UX
│   ├── HUD design
│   ├── Menu systems
│   ├── Player feedback
│   ├── Tutorials & onboarding
│   ├── Inventory systems
│   └── Dialogue systems
│
├── AssetPipeline.md             # Asset creation & management
│   ├── AI asset generation
│   ├── Sprite workflows
│   ├── 3D model workflows
│   ├── Audio integration
│   └── Optimization
│
└── MCPSetupGuide.md             # Complete MCP setup
    ├── Blender MCP
    ├── Unity MCP
    ├── Unreal MCP
    ├── Asset generation MCPs
    └── Troubleshooting
```

---

## Quick Start by Goal

### "I want to make a 2D browser game"
```
1. Read: WebGameEngines.md → Phaser section
2. No MCP needed
3. Claude writes code, you run: npm run dev
```

### "I want to make a 3D browser game"
```
1. Read: WebGameEngines.md → Babylon.js or Three.js section
2. No MCP needed (unless you want custom 3D models)
3. Optional: BlenderWorkflow.md for custom assets
```

### "I want to make a Unity game"
```
1. Read: MCPSetupGuide.md → Unity section
2. Install Unity + Unity MCP
3. Read: UnityWorkflow.md
4. Optional: BlenderWorkflow.md for 3D assets
```

### "I want to make an Unreal game"
```
1. Read: MCPSetupGuide.md → Unreal section
2. Install Unreal + Unreal MCP
3. Read: UnrealWorkflow.md
4. Optional: BlenderWorkflow.md for 3D assets
```

### "I want custom 3D models and animations"
```
1. Read: MCPSetupGuide.md → Blender section
2. Install Blender + Blender MCP
3. Read: BlenderWorkflow.md
4. Export to your target platform
```

---

## Game Types We Can Build

### Web Games (Code-Only)

| Type | Engine | Complexity |
|------|--------|------------|
| Platformer | Phaser | Easy |
| Puzzle | Phaser, PixiJS | Easy |
| Arcade | Phaser, KAPLAY | Easy |
| RPG (2D) | Phaser | Medium |
| Visual Novel | Ren'Py, custom | Easy |
| Card Game | Phaser, PixiJS | Medium |
| Tower Defense | Phaser | Medium |
| 3D Exploration | Babylon.js | Medium |
| Racing (3D) | Three.js | Medium |
| FPS (3D) | Babylon.js | Hard |
| MMO (simple) | Phaser + backend | Hard |

### Native/Desktop Games (MCP Required)

| Type | Engine | Complexity |
|------|--------|------------|
| 3D Adventure | Unity | Medium |
| FPS | Unreal | Hard |
| Open World | Unreal | Very Hard |
| Mobile Game | Unity | Medium |
| VR Experience | Unity/Unreal | Hard |
| AR App | Unity | Medium |

---

## Technology Stack Recommendations

### For Beginners
```
Web 2D:  Phaser 4 (TypeScript)
Web 3D:  Babylon.js (TypeScript)
Native:  Unity (C#)
3D Art:  Blender (via MCP)
```

### For React Developers
```
Web 2D:  Custom Canvas + React
Web 3D:  React Three Fiber
Native:  Unity (if needed)
3D Art:  Blender (via MCP)
```

### For Maximum Polish
```
Web:     Babylon.js (professional 3D)
Native:  Unreal Engine (AAA quality)
3D Art:  Blender (via MCP)
Assets:  AI generation + Blender refinement
```

---

## Integration with Design Brain

Game development extends the existing design system:

```
DESIGN BRAIN INTEGRATION

Standard UX Process:
1-Discovery → 2-Research → 3-Architecture → 4-Flows → 5-Brand → 6-Testing

Game Development Additions:
                              ↓
                    ┌─────────────────────┐
                    │   3D-GameDev/       │
                    │                     │
                    │ • Game UX Patterns  │ ← Extends Patterns/
                    │ • Asset Pipeline    │ ← Extends Tokens/
                    │ • Engine Workflows  │ ← New capability
                    │ • MCP Integration   │ ← New capability
                    │                     │
                    └─────────────────────┘

Shared concerns:
• Visual Identity (5-Brand/) applies to game UI
• Motion design (Tokens/Motion.md) applies to game animation
• Accessibility (eval/A11yRules.md) applies to game UI
• Testing (6-Testing/) applies to game UX testing
```

---

## Limitations (Honest Assessment)

### What We Cannot Do

```
✗ Run games ourselves (you run them)
✗ Real-time playtesting
✗ Console development (Xbox, PlayStation, Switch SDKs require licenses)
✗ Direct GPU programming without code
✗ Frame-perfect timing adjustments
✗ Motion capture processing
✗ Professional audio production (mixing, mastering)
```

### What Requires Your Machine

```
! Blender must be installed and running
! Unity must be installed and running
! Unreal must be installed and running
! Games must be run by you for testing
! Final builds must be triggered by you
```

### What We Excel At

```
✓ Writing all game code
✓ Designing game systems
✓ Creating asset specifications
✓ Controlling 3D tools via MCP
✓ Iterating on game logic
✓ Implementing UI/UX
✓ Setting up project structure
✓ Writing documentation
```

---

## Getting Started

1. **Decide your target platform:**
   - Web only? → WebGameEngines.md
   - Native/desktop? → Unity or Unreal workflow
   - Both? → Hybrid approach

2. **Set up required tools:**
   - Web: Just Node.js
   - 3D assets: Blender + MCP
   - Unity: Unity + MCP
   - Unreal: Unreal + MCP

3. **Follow the appropriate workflow guide**

4. **Apply game UX patterns from GameUXPatterns.md**

5. **Log experiences in Memory/ for learning**

---

## END OF GAME DEV OVERVIEW
