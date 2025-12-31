# Game UX Patterns — Authoritative

Design patterns specific to games: HUDs, menus, feedback, tutorials, and systems.

---

## Overview

Game UX differs from app UX:
- Real-time interaction
- Player agency and immersion
- Information density varies by genre
- Failure states are often part of the experience
- Emotional engagement is primary goal

---

## HUD Design

### HUD Types

```
MINIMAL HUD
Best for: Exploration, horror, immersive games
Shows: Only critical info (health, ammo)
Philosophy: Preserve immersion, reveal contextually

STANDARD HUD
Best for: Action, RPG, platformers
Shows: Health, resources, minimap, abilities
Philosophy: Balance information and immersion

DENSE HUD
Best for: Strategy, simulation, MMO
Shows: Multiple resource bars, detailed stats, alerts
Philosophy: Information accessibility over immersion

DIEGETIC HUD
Best for: Survival, horror, sci-fi
Shows: In-world displays (watch, armor, hologram)
Philosophy: No UI breaks; everything exists in game world
```

### HUD Placement

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────┐                         ┌─────────────────┐ │
│ │ Health/     │        TOP CENTER       │ Minimap/        │ │
│ │ Resources   │      Notifications      │ Compass         │ │
│ │             │         Alerts          │                 │ │
│ └─────────────┘                         └─────────────────┘ │
│                                                             │
│                                                             │
│ LEFT EDGE                   CENTER                RIGHT EDGE│
│ Inventory                  GAMEPLAY              Quest/     │
│ Quick slots                  AREA                Objectives │
│ Abilities                                        Dialogue   │
│                                                             │
│                                                             │
│ ┌─────────────┐                         ┌─────────────────┐ │
│ │ Abilities/  │      BOTTOM CENTER      │ Ammo/           │ │
│ │ Skills      │       Subtitles         │ Equipment       │ │
│ │             │      Interaction        │                 │ │
│ └─────────────┘                         └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘

SAFE ZONES:
- Keep critical info within 90% of screen (TV overscan)
- Avoid bottom 10% on mobile (thumb reach)
- Leave center clear for gameplay focus
```

### Health Bar Patterns

```
SEGMENTED
┌──────┬──────┬──────┬──────┬──────┐
│██████│██████│██████│░░░░░░│░░░░░░│
└──────┴──────┴──────┴──────┴──────┘
Good for: Showing discrete hits, predictable damage

CONTINUOUS
┌────────────────────────────────────┐
│████████████████████░░░░░░░░░░░░░░░│
└────────────────────────────────────┘
Good for: Precise health tracking, gradual damage

RADIAL
    ╭───────╮
   ╱█████████╲
  │███████████│
  │███████████│
   ╲█████████╱
    ╰───────╯
Good for: Character portraits, minimal HUD space

CONTEXTUAL (no permanent display)
- Show only when damaged
- Fade after recovery
- Screen effects (vignette, desaturation)
Good for: Immersive games, survival horror
```

### Resource Display

```typescript
// React component for game resource bar
interface ResourceBarProps {
  current: number;
  max: number;
  color: string;
  showText?: boolean;
  animated?: boolean;
}

const ResourceBar: React.FC<ResourceBarProps> = ({
  current,
  max,
  color,
  showText = true,
  animated = true,
}) => {
  const percentage = (current / max) * 100;

  return (
    <div className="resource-bar-container">
      <div
        className="resource-bar-fill"
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
          transition: animated ? 'width 0.3s ease-out' : 'none',
        }}
      />
      {showText && (
        <span className="resource-bar-text">
          {current} / {max}
        </span>
      )}
    </div>
  );
};
```

---

## Menu Systems

### Menu Hierarchy

```
MAIN MENU
├── Continue / New Game
├── Load Game
├── Settings
│   ├── Video
│   │   ├── Resolution
│   │   ├── Quality Preset
│   │   ├── Individual Settings
│   │   └── Apply / Cancel
│   ├── Audio
│   │   ├── Master Volume
│   │   ├── Music Volume
│   │   ├── SFX Volume
│   │   └── Dialogue Volume
│   ├── Controls
│   │   ├── Keyboard Bindings
│   │   ├── Controller Bindings
│   │   └── Mouse Sensitivity
│   ├── Gameplay
│   │   ├── Difficulty
│   │   ├── HUD Options
│   │   └── Accessibility
│   └── Accessibility
│       ├── Subtitles
│       ├── Colorblind Mode
│       ├── Screen Reader
│       └── Motion Settings
├── Credits
└── Quit

PAUSE MENU
├── Resume
├── Settings (subset)
├── Save / Load
└── Return to Main Menu
```

### Menu Navigation Patterns

```
VERTICAL LIST (Console-friendly)
┌────────────────────────┐
│ > Continue             │
│   New Game             │
│   Load Game            │
│   Settings             │
│   Quit                 │
└────────────────────────┘
- Clear selection state
- D-pad/Arrow key navigation
- Confirm/Back buttons

GRID (Visual selection)
┌───────┬───────┬───────┐
│ ┌───┐ │ ┌───┐ │ ┌───┐ │
│ │ A │ │ │ B │ │ │ C │ │
│ └───┘ │ └───┘ │ └───┘ │
├───────┼───────┼───────┤
│ ┌───┐ │ ┌───┐ │ ┌───┐ │
│ │ D │ │ │ E │ │ │ F │ │
│ └───┘ │ └───┘ │ └───┘ │
└───────┴───────┴───────┘
- Good for inventory, level select
- Needs clear hover/select states

RADIAL (Quick selection)
        ╭──────╮
       ╱   W    ╲
     ╱           ╲
    │  A       D  │
     ╲           ╱
       ╲   S    ╱
        ╰──────╯
- Controller-optimized
- Good for weapon wheels, quick slots
```

### Settings UI Best Practices

```
VIDEO SETTINGS

Resolution:     ◄ 1920 x 1080 ►    [Recommended: 1920 x 1080]
Display Mode:   ◄ Borderless ►
V-Sync:         [ON] OFF
Frame Limit:    ◄ 60 ►

Quality Preset: ◄ High ►
├── Shadows:    ◄ High ►
├── Textures:   ◄ High ►
├── Effects:    ◄ Medium ►
└── Anti-Alias: ◄ FXAA ►

[Apply]  [Reset Defaults]  [Back]

BEST PRACTICES:
✓ Show current display's native resolution
✓ Show recommended settings based on hardware
✓ Group related settings
✓ Allow individual override of presets
✓ Require explicit Apply for major changes
✓ Warn about restart requirements
✓ Preview when possible (brightness, etc.)
```

---

## Player Feedback

### Feedback Types

```
IMMEDIATE FEEDBACK (0-100ms)
- Hit confirmation (sound, flash, particles)
- Button press response
- Damage numbers
- Input acknowledgment

SHORT FEEDBACK (100-500ms)
- Death animation
- Pickup collection
- Ability activation
- Combo counter update

MEDIUM FEEDBACK (500ms-2s)
- Level up notification
- Achievement popup
- Quest update
- Save confirmation

PERSISTENT FEEDBACK
- Health bar change
- Score/XP update
- Inventory change
- Map reveal
```

### Damage Feedback

```
VISUAL FEEDBACK:
- Screen flash (red for damage, white for hit)
- Vignette effect
- Character flinch animation
- Damage numbers floating up
- Health bar shake/flash

AUDIO FEEDBACK:
- Hit sound (unique per source)
- Pain vocalization
- UI warning sound
- Heartbeat at low health

HAPTIC FEEDBACK (Controller):
- Strong pulse for big hits
- Light rumble for small damage
- Directional feedback for hit direction
- Sustained rumble for ongoing damage
```

### Damage Numbers

```typescript
// Damage number popup system
interface DamageNumber {
  value: number;
  position: { x: number; y: number };
  type: 'normal' | 'critical' | 'heal' | 'blocked';
  timestamp: number;
}

const DamageNumberDisplay: React.FC<{ damage: DamageNumber }> = ({ damage }) => {
  const colors = {
    normal: '#ffffff',
    critical: '#ff4444',
    heal: '#44ff44',
    blocked: '#888888',
  };

  const sizes = {
    normal: '16px',
    critical: '24px',
    heal: '18px',
    blocked: '14px',
  };

  return (
    <div
      className="damage-number"
      style={{
        color: colors[damage.type],
        fontSize: sizes[damage.type],
        position: 'absolute',
        left: damage.position.x,
        top: damage.position.y,
        animation: 'float-up 1s ease-out forwards',
      }}
    >
      {damage.type === 'critical' && '!'}
      {damage.value}
    </div>
  );
};
```

### Achievement/Notification Popups

```
POSITION: Top-right or bottom-center
DURATION: 3-5 seconds
ANIMATION: Slide in, pause, slide out

┌────────────────────────────────┐
│ 🏆 Achievement Unlocked        │
│                                │
│ First Blood                    │
│ Defeat your first enemy        │
│                                │
│ ████████░░░░░░░░ +100 XP       │
└────────────────────────────────┘

QUEUE BEHAVIOR:
- Stack if multiple (max 3 visible)
- Delay subsequent popups
- Allow dismissal
- Never block gameplay
```

---

## Tutorial Systems

### Tutorial Types

```
CONTEXTUAL (Best for action games)
- Show controls when relevant
- "Press E to interact" appears near interactable
- Disappears after first use
- Non-intrusive

GUIDED (Best for complex games)
- Step-by-step walkthrough
- Progress indicator
- Can pause gameplay
- Covers all core mechanics

OPTIONAL (Best for experienced players)
- "Skip Tutorial?" at start
- Accessible from menu
- Practice mode available
- Tooltips toggleable

PROGRESSIVE (Best for long games)
- Introduce mechanics gradually
- Chapter 1: Movement only
- Chapter 2: Combat basics
- Chapter 3: Advanced abilities
```

### Control Prompts

```
KEYBOARD PROMPT:
┌─────┐
│  E  │  Interact
└─────┘

CONTROLLER PROMPT:
   ╭─╮
  (A)   Interact
   ╰─╯

ADAPTIVE PROMPT:
- Detect input device automatically
- Switch icons when input changes
- Support rebinding (show actual binding)

IMPLEMENTATION:
function getInputPrompt(action: string, device: 'keyboard' | 'controller') {
  const bindings = {
    interact: { keyboard: 'E', controller: 'A' },
    jump: { keyboard: 'SPACE', controller: 'A' },
    attack: { keyboard: 'LMB', controller: 'X' },
    // ...
  };
  return bindings[action][device];
}
```

### Tutorial Flow

```
FIRST-TIME TUTORIAL SEQUENCE:

1. MOVEMENT
   ┌────────────────────────────────┐
   │                                │
   │        Move with              │
   │       W A S D                  │
   │                                │
   │   [✓ Got it]                   │
   └────────────────────────────────┘
   - Player must move to continue
   - Subtle highlight on controls

2. CAMERA (if applicable)
   - "Move mouse to look around"
   - Wait for 360° rotation

3. INTERACTION
   - Spawn interactable object
   - Prompt appears on approach
   - Must interact to continue

4. CORE MECHANIC
   - Introduce main gameplay loop
   - Safe environment to practice
   - Allow mistakes

5. COMPLETION
   - "Tutorial Complete!"
   - Option to replay from menu
   - Begin real game
```

---

## Inventory Systems

### Inventory Layouts

```
GRID INVENTORY (RPG, survival)
┌───┬───┬───┬───┬───┬───┬───┬───┐
│🗡│🛡│🍎│💎│   │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│🧪│🧪│📜│🔑│   │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │   │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┘
24/64 slots used

Features:
- Drag and drop
- Stack identical items
- Sort by type/value/recent
- Search/filter

LIST INVENTORY (Simple games)
┌────────────────────────────────┐
│ 🗡 Sword of Power       x1    │
│ 🍎 Apple                x5    │
│ 💎 Diamond              x3    │
│ 🧪 Health Potion        x12   │
└────────────────────────────────┘

Features:
- Compact
- Easy to scan
- Good for many item types

TETRIS INVENTORY (Realistic/survival)
┌───────────────────────┐
│ ▓▓▓▓│░░│▓▓│░░░░│      │
│ ▓▓▓▓│░░│▓▓│░░░░│░░│   │
│     │  │  │░░░░│░░│   │
└───────────────────────┘

Features:
- Items have different shapes/sizes
- Spatial puzzle element
- Limits carrying capacity naturally
```

### Item Tooltips

```
┌──────────────────────────────────────┐
│ SWORD OF FLAMES                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ⚔ EPIC WEAPON                        │
│                                      │
│ Damage: 45-67                        │
│ Speed: 1.4 attacks/sec              │
│ DPS: 78.4                            │
│                                      │
│ +15 Fire Damage                      │
│ +10% Critical Chance                 │
│ Burning: Enemies take 5 damage/sec   │
│                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Level Required: 25                   │
│ Sell Value: 1,250 Gold              │
│                                      │
│ [Right-click to equip]               │
└──────────────────────────────────────┘

TOOLTIP BEST PRACTICES:
✓ Show on hover (desktop) / tap-hold (mobile)
✓ Clear item rarity indicator
✓ Compare to equipped item
✓ Explain special effects
✓ Show requirements
✓ Keep consistent format
```

### Equipment UI

```
CHARACTER EQUIPMENT SCREEN

        ┌─────────────┐
        │   [HELM]    │
        └─────────────┘
┌─────┐     ┌───┐     ┌─────┐
│WPAN │     │   │     │ OFF │
│     │     │ 👤│     │HAND │
└─────┘     │   │     └─────┘
        ┌───┴───┴───┐
        │  [CHEST]  │
        └───────────┘
        ┌───────────┐
        │   [LEGS]  │
        └───────────┘
        ┌───────────┐
        │  [BOOTS]  │
        └───────────┘

STATS PANEL                 EQUIPPED ITEMS
━━━━━━━━━━━━━              ━━━━━━━━━━━━━
Attack:  127               🗡 Flame Sword
Defense: 84                🛡 Iron Shield
Health:  450               👑 Steel Helm
Mana:    200               👕 Chain Mail
                           👖 Plate Legs
                           👢 Iron Boots

[Compare] [Auto-Equip] [Unequip All]
```

---

## Dialogue Systems

### Dialogue Box Patterns

```
CLASSIC RPG DIALOGUE
┌──────────────────────────────────────────────────┐
│ ┌─────┐                                          │
│ │     │  VILLAGE ELDER                           │
│ │ 👴 │                                          │
│ │     │  "The ancient sword lies within the     │
│ └─────┘   mountain temple. But beware - the     │
│           guardian still watches over it."       │
│                                                  │
│   > Where is the temple?                         │
│   > Tell me about the guardian.                  │
│   > I'll find the sword.                         │
│   > Goodbye.                                     │
└──────────────────────────────────────────────────┘

MODERN DIALOGUE (Wheel)
         ┌──────────────────┐
        ╱    "More info"     ╲
       │                      │
"Question"                    "Aggressive"
       │                      │
        ╲    "Friendly"      ╱
         └──────────────────┘

EMBEDDED DIALOGUE (No separate UI)
- Text appears above character
- Choices appear as floating buttons
- Less immersion-breaking
```

### Dialogue Choice Indicators

```
CHOICE CONSEQUENCES (Show impact):

> Tell the truth                    [+Trust]
> Lie about the artifact           [+Gold] [−Trust]
> Refuse to answer                 [Neutral]
> [Intimidate] Hand it over.       [Requires: Strength 15]
> [Charm] Perhaps we can negotiate [Requires: Charisma 12]

LOCKED CHOICES (Show requirements):

> [🔒] Secret passage              [Requires: Perception 18]
> [🔒] Cast fireball               [Requires: Mage class]
> [🔒] Bribe the guard             [Requires: 500 Gold]

CHOICE TONE (Visual indicators):
🤝 Friendly/diplomatic
⚔️ Aggressive/hostile
❓ Question/curious
😈 Deceptive/manipulative
💝 Romantic
```

### Typewriter Text Effect

```typescript
// Typewriter effect for dialogue
const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  onComplete?: () => void;
}> = ({ text, speed = 30, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  const skipToEnd = () => {
    if (!isComplete) {
      setDisplayed(text);
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <div onClick={skipToEnd} className="typewriter-container">
      {displayed}
      {!isComplete && <span className="cursor">▌</span>}
    </div>
  );
};
```

---

## Accessibility

### Game Accessibility Checklist

```
VISUAL
□ Colorblind modes (Deuteranopia, Protanopia, Tritanopia)
□ High contrast option
□ Subtitle size options
□ HUD scale options
□ Enemy/item outline highlights
□ Screen reader support for menus

AUDIO
□ Separate volume sliders (Master, Music, SFX, Voice)
□ Visual audio cues (subtitles for sounds)
□ Mono audio option
□ Audio descriptions

MOTOR
□ Remappable controls
□ One-handed control schemes
□ Auto-aim assist
□ Hold vs toggle options
□ QTE alternatives
□ Difficulty options

COGNITIVE
□ Tutorial replay option
□ Objective reminders
□ Navigation assistance
□ Adjustable game speed
□ Pause during cutscenes
```

### Subtitle Standards

```
SUBTITLE PRESENTATION:

Speaker label:    [CAPTAIN]
Font size:        Minimum 18px at 1080p, scalable
Background:       Semi-transparent black (70% opacity)
Font:            Sans-serif, high legibility
Position:        Bottom center, above UI
Max width:       60% of screen
Max lines:       2-3 lines

EXAMPLE:
┌────────────────────────────────────────┐
│                                        │
│         [CAPTAIN]                      │
│  "We need to move. Now."               │
│                                        │
└────────────────────────────────────────┘

ADVANCED OPTIONS:
- Speaker colors
- Background opacity slider
- Font size slider (3+ options)
- Sound effect subtitles: [EXPLOSION] [FOOTSTEPS]
```

---

## Mobile Game UX

### Touch Controls

```
VIRTUAL JOYSTICK
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    GAMEPLAY                         │
│                      AREA                           │
│                                                     │
│                                                     │
│    ┌───────┐                         ┌───┐ ┌───┐  │
│    │       │                         │ B │ │ A │  │
│    │   ◯   │                         └───┘ └───┘  │
│    │       │                              ┌───┐   │
│    └───────┘                              │ Y │   │
│     MOVE                                  └───┘   │
└─────────────────────────────────────────────────────┘

PLACEMENT RULES:
- Movement: Bottom left
- Action buttons: Bottom right
- Keep 20% padding from edges
- Buttons: Minimum 44x44px touch targets
- Joystick: 100-150px diameter

GESTURE CONTROLS
- Swipe to attack
- Pinch to zoom
- Tap to select
- Hold for context menu
- Double-tap to dodge
```

### Mobile HUD Considerations

```
LANDSCAPE MOBILE HUD

┌─────────────────────────────────────────────────────┐
│ ♥♥♥    [ PAUSED ]                         ⚙️ 💬     │
│                                                     │
│                                                     │
│                    GAMEPLAY                         │
│                      AREA                           │
│                  (Clear center)                     │
│                                                     │
│                                                     │
│    ┌───┐                               ┌───┬───┐   │
│    │JOY│                               │ B │ A │   │
│    └───┘                               └───┴───┘   │
└─────────────────────────────────────────────────────┘

SAFE AREAS:
- Notch avoidance (iPhone, Android)
- Home indicator padding (iPhone)
- Gesture navigation padding (Android)
```

---

## Performance Considerations

### UI Performance

```
DO:
✓ Object pooling for damage numbers
✓ Batch UI draw calls
✓ Use sprite atlases for icons
✓ Lazy load menu assets
✓ Cache text measurements

DON'T:
✗ Create new objects every frame
✗ Update all UI every frame (use dirty flags)
✗ Use expensive effects on HUD
✗ Load full resolution textures for thumbnails
✗ Animate hidden elements
```

### Responsive Game UI

```typescript
// Scale UI based on screen size
const calculateUIScale = (
  screenWidth: number,
  screenHeight: number,
  referenceWidth: number = 1920,
  referenceHeight: number = 1080
): number => {
  const scaleX = screenWidth / referenceWidth;
  const scaleY = screenHeight / referenceHeight;

  // Use smaller scale to ensure UI fits
  return Math.min(scaleX, scaleY);
};

// Usage
const scale = calculateUIScale(window.innerWidth, window.innerHeight);
const hudElement = document.querySelector('.hud');
hudElement.style.transform = `scale(${scale})`;
```

---

## END OF GAME UX PATTERNS
