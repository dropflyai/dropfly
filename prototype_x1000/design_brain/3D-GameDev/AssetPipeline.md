# Asset Pipeline — Authoritative

Create and manage game assets: sprites, 3D models, audio, and AI-generated content.

---

## Overview

The asset pipeline covers:
- **Source Creation** - Where assets come from
- **Processing** - How assets are prepared
- **Integration** - How assets get into the game
- **Optimization** - Making assets performant

---

## Asset Sources

### Where Assets Come From

```
SOURCE MATRIX

| Source | 2D Art | 3D Models | Audio | Animation |
|--------|--------|-----------|-------|-----------|
| AI Generation | ✓ | ✓ | Limited | ✗ |
| Code-based | ✓ | ✓ | ✓ | ✓ |
| Free Libraries | ✓ | ✓ | ✓ | ✓ |
| Blender MCP | ✗ | ✓ | ✗ | ✓ |
| Purchased | ✓ | ✓ | ✓ | ✓ |

RECOMMENDATION BY PROJECT STAGE:
- Prototype: AI + Free Libraries
- MVP: AI + Purchased + Light customization
- Production: Custom + Purchased + Polish
```

---

## AI Asset Generation

### Image Generation (via MCP)

```
AVAILABLE MCPS:

Together AI MCP (Flux models)
- Flux Schnell: Fast, good quality
- Flux Pro: High quality, slower
- Best for: Sprites, textures, UI elements

OpenAI DALL-E MCP
- DALL-E 3: Excellent for concepts
- Best for: Reference images, marketing art

Stable Diffusion (local)
- Full control, no API costs
- Best for: High volume generation
```

### Prompting for Game Assets

```
SPRITE PROMPT STRUCTURE:
"[object/character], [style], [view], [background], [technical specs]"

EXAMPLES:

Character sprite:
"pixel art warrior character, 16-bit style, side view idle pose,
transparent background, 64x64 pixels, game asset"

Item icon:
"golden sword icon, flat design, centered, transparent background,
clean edges, 128x128, game UI element"

Tile texture:
"grass tile, top-down view, seamless tileable, hand-painted style,
256x256, game texture"

Environment:
"fantasy forest background, parallax layer, horizontal scroll,
atmospheric lighting, game environment, 1920x1080"
```

### Sprite Sheet Generation

```
WORKFLOW FOR ANIMATED SPRITES:

1. Generate base character
   "pixel art knight, side view, idle pose, transparent background"

2. Generate animation frames
   "pixel art knight, side view, [POSE], transparent background,
   same character as reference"

   POSES:
   - idle pose
   - walking frame 1 (left foot forward)
   - walking frame 2 (right foot forward)
   - attack frame 1 (wind up)
   - attack frame 2 (swing)
   - attack frame 3 (follow through)
   - jump frame (legs tucked)
   - fall frame (legs extended)
   - hurt frame (knocked back)
   - death frame (on ground)

3. Process into sprite sheet
   - Use ImageMagick or code to combine
   - Ensure consistent sizing
   - Apply palette reduction if needed
```

### Texture Generation

```
SEAMLESS TEXTURE PROMPT:
"seamless tileable [material] texture, [style], high detail,
no visible seams, [size]x[size]"

EXAMPLES:
- "seamless tileable stone brick texture, medieval style, 512x512"
- "seamless tileable grass texture, stylized, 256x256"
- "seamless tileable metal plate texture, sci-fi, scratched, 1024x1024"

POST-PROCESSING:
1. Make seamless (if not already):
   - Offset by 50% horizontally and vertically
   - Blend edges
   - Test tiling

2. Generate normal map (optional):
   - Use tools like NormalMap-Online
   - Or generate with AI: "normal map for [texture]"
```

---

## 2D Asset Workflows

### Sprite Creation Pipeline

```
PIPELINE: Concept → Generation → Processing → Integration

STEP 1: DEFINE REQUIREMENTS
┌─────────────────────────────────────┐
│ Asset: Player Character             │
│ Size: 32x32 pixels                  │
│ Colors: 16 max (palette)            │
│ Animations needed:                  │
│   - Idle (4 frames)                 │
│   - Walk (6 frames)                 │
│   - Attack (4 frames)               │
│   - Jump (2 frames)                 │
│   - Death (3 frames)                │
│ Style: 16-bit retro                 │
└─────────────────────────────────────┘

STEP 2: GENERATE BASE
- Use AI for base concept
- Or draw in pixel art tool
- Or find in asset library

STEP 3: PROCESS
- Resize to exact dimensions
- Apply color palette
- Create animation frames
- Assemble sprite sheet

STEP 4: INTEGRATE
- Import to game engine
- Define animation clips
- Set up hitboxes/colliders
- Test in-game
```

### Sprite Sheet Format

```
SPRITE SHEET LAYOUT:

┌────┬────┬────┬────┬────┬────┐
│ I1 │ I2 │ I3 │ I4 │    │    │  ← Row 0: Idle (4 frames)
├────┼────┼────┼────┼────┼────┤
│ W1 │ W2 │ W3 │ W4 │ W5 │ W6 │  ← Row 1: Walk (6 frames)
├────┼────┼────┼────┼────┼────┤
│ A1 │ A2 │ A3 │ A4 │    │    │  ← Row 2: Attack (4 frames)
├────┼────┼────┼────┼────┼────┤
│ J1 │ J2 │ D1 │ D2 │ D3 │    │  ← Row 3: Jump, Death
└────┴────┴────┴────┴────┴────┘

METADATA FILE (JSON):
{
  "frames": {
    "idle": { "row": 0, "count": 4, "fps": 8 },
    "walk": { "row": 1, "count": 6, "fps": 12 },
    "attack": { "row": 2, "count": 4, "fps": 15 },
    "jump": { "row": 3, "col": 0, "count": 2, "fps": 10 },
    "death": { "row": 3, "col": 2, "count": 3, "fps": 8 }
  },
  "frameWidth": 32,
  "frameHeight": 32
}
```

### Code-Generated 2D Assets

```typescript
// Procedural sprite generation
class ProceduralSprite {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Generate simple geometric character
  generateCharacter(palette: string[]): HTMLCanvasElement {
    const [primary, secondary, skin, accent] = palette;

    // Body
    this.ctx.fillStyle = primary;
    this.ctx.fillRect(8, 8, 16, 16);

    // Head
    this.ctx.fillStyle = skin;
    this.ctx.fillRect(10, 2, 12, 8);

    // Eyes
    this.ctx.fillStyle = accent;
    this.ctx.fillRect(12, 4, 2, 2);
    this.ctx.fillRect(18, 4, 2, 2);

    // Legs
    this.ctx.fillStyle = secondary;
    this.ctx.fillRect(8, 24, 6, 8);
    this.ctx.fillRect(18, 24, 6, 8);

    return this.canvas;
  }

  // Generate particle
  generateParticle(color: string, size: number): HTMLCanvasElement {
    const gradient = this.ctx.createRadialGradient(
      size/2, size/2, 0,
      size/2, size/2, size/2
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, size, size);
    return this.canvas;
  }
}
```

---

## 3D Asset Workflows

### 3D Asset Pipeline

```
PIPELINE OVERVIEW:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   AI Concept ──▶ Blender (MCP) ──▶ Export ──▶ Game Engine  │
│       │              │                │              │      │
│       ▼              ▼                ▼              ▼      │
│   Reference      Modeling         GLTF/FBX      Import &   │
│   Images         Texturing        USD/OBJ        Optimize  │
│                  Rigging                                   │
│                  Animation                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Blender Asset Creation (via MCP)

```
TYPICAL WORKFLOW:

1. CREATE BASE GEOMETRY
   "Create a cylinder with 0.5 radius and 2 height for a tree trunk"
   "Create an icosphere at 0,0,2 for foliage"

2. APPLY MATERIALS
   "Create brown bark material, apply to trunk"
   "Create green leaf material with some transparency, apply to foliage"

3. OPTIMIZE
   "Apply decimate modifier to foliage, ratio 0.5"
   "Set foliage smooth shading"

4. EXPORT
   "Export as GLB to /assets/tree.glb with Draco compression"
```

### 3D File Formats

```
FORMAT COMPARISON:

| Format | Size | Features | Best For |
|--------|------|----------|----------|
| GLTF/GLB | Small | Modern, animations, PBR | Web, mobile |
| FBX | Medium | Industry standard | Unity, Unreal |
| OBJ | Large | Universal, simple | Static meshes |
| USD | Varies | Complex scenes | Unreal, film |

WEB GAME RECOMMENDATION: GLTF/GLB
- Native browser support
- Draco compression
- Embedded textures
- Animations included

UNITY RECOMMENDATION: FBX
- Full feature support
- Animation import
- Blendshapes

UNREAL RECOMMENDATION: FBX or USD
- Full feature support
- Nanite optimization (USD)
```

### Model Optimization

```
POLYGON BUDGET BY PLATFORM:

| Platform | Per Object | Total Scene |
|----------|------------|-------------|
| Mobile | 500-5K | 50K-100K |
| Web | 1K-10K | 100K-500K |
| Desktop | 5K-50K | 500K-5M |
| Current-gen | 50K-500K | 5M-50M |

OPTIMIZATION TECHNIQUES:

1. LOD (Level of Detail)
   - LOD0: Full detail (100%)
   - LOD1: Medium (50%)
   - LOD2: Low (25%)
   - LOD3: Billboard or hidden

2. Texture Size
   - Mobile: 256-512px
   - Web: 512-1024px
   - Desktop: 1024-2048px
   - Props: Half of above

3. Mesh Optimization
   - Remove internal faces
   - Merge vertices
   - Decimate distant objects
   - Use normal maps for detail
```

---

## Audio Asset Workflows

### Audio Sources

```
FREE AUDIO LIBRARIES:
- Freesound.org (CC licensed)
- OpenGameArt.org (game-specific)
- Kenney.nl (game assets)
- Incompetech (music)

GENERATION TOOLS:
- BFXR/SFXR: Retro sound effects
- Audacity: Audio editing
- LabChirp: Sound effects
- Abundant Music: Procedural music

AI AUDIO (Experimental):
- Mubert API: AI music
- Soundraw: AI music
- Limited MCP support currently
```

### Audio File Formats

```
FORMAT RECOMMENDATIONS:

WEB GAMES:
- Music: MP3 or OGG (compressed)
- SFX: MP3, OGG, or WebM
- Fallback: WAV

UNITY:
- Music: OGG preferred
- SFX: WAV for short, OGG for long

UNREAL:
- All audio: WAV (auto-compressed on build)

FILE SIZES:
- Music: 128-192 kbps
- SFX: 96-128 kbps
- Voice: 64-96 kbps
```

### Audio Integration

```typescript
// Web Audio API integration
class AudioManager {
  private context: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();
  private music: AudioBufferSourceNode | null = null;

  constructor() {
    this.context = new AudioContext();
  }

  async loadSound(name: string, url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.sounds.set(name, audioBuffer);
  }

  playSound(name: string, volume: number = 1): void {
    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();

    source.buffer = buffer;
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.context.destination);
    source.start(0);
  }

  playMusic(name: string, loop: boolean = true): void {
    this.stopMusic();

    const buffer = this.sounds.get(name);
    if (!buffer) return;

    this.music = this.context.createBufferSource();
    this.music.buffer = buffer;
    this.music.loop = loop;
    this.music.connect(this.context.destination);
    this.music.start(0);
  }

  stopMusic(): void {
    if (this.music) {
      this.music.stop();
      this.music = null;
    }
  }
}

// Usage
const audio = new AudioManager();
await audio.loadSound('jump', '/assets/audio/jump.mp3');
await audio.loadSound('bgm', '/assets/audio/music.mp3');
audio.playSound('jump');
audio.playMusic('bgm');
```

---

## Asset Organization

### Folder Structure

```
WEB GAME PROJECT:
assets/
├── images/
│   ├── characters/
│   │   ├── player.png
│   │   └── enemy-sprite.png
│   ├── tiles/
│   │   ├── grass.png
│   │   └── stone.png
│   ├── ui/
│   │   ├── buttons.png
│   │   └── icons.png
│   └── backgrounds/
│       ├── sky.png
│       └── mountains.png
├── models/
│   ├── characters/
│   ├── props/
│   └── environment/
├── audio/
│   ├── music/
│   │   ├── menu.mp3
│   │   └── gameplay.mp3
│   └── sfx/
│       ├── jump.mp3
│       ├── attack.mp3
│       └── pickup.mp3
├── fonts/
│   └── game-font.woff2
└── data/
    ├── levels.json
    └── items.json

UNITY PROJECT:
Assets/
├── _Project/
│   ├── Art/
│   │   ├── Sprites/
│   │   ├── Textures/
│   │   └── Materials/
│   ├── Audio/
│   │   ├── Music/
│   │   └── SFX/
│   ├── Models/
│   │   └── Characters/
│   ├── Prefabs/
│   ├── Scenes/
│   └── Scripts/
├── Resources/
└── ThirdParty/
```

### Asset Naming Conventions

```
NAMING PATTERN:
[category]_[name]_[variant]_[size].[ext]

EXAMPLES:
spr_player_idle_32.png        # Sprite, player, idle animation, 32px
tex_brick_red_512.png         # Texture, brick, red variant, 512px
mdl_tree_pine_lod0.glb        # Model, tree, pine variant, LOD 0
sfx_attack_sword_01.mp3       # Sound effect, attack, sword, variant 1
bgm_menu_loop.ogg             # Background music, menu, looping

RULES:
✓ Lowercase only
✓ Underscores for separation
✓ No spaces
✓ Include size/variant info
✓ Number variants (01, 02, 03)
```

---

## Asset Optimization

### Image Optimization

```
OPTIMIZATION PIPELINE:

1. SOURCE
   Original: 2048x2048 PNG (16MB)

2. RESIZE
   Needed: 512x512 (appropriate for use)

3. COMPRESS
   PNG → WebP (80% smaller)
   Or PNG → Optimized PNG (30% smaller)

4. RESULT
   Final: 512x512 WebP (50KB)

TOOLS:
- ImageMagick: CLI processing
- Sharp (Node.js): Programmatic
- Squoosh: Web-based
- TinyPNG: API service

COMMAND EXAMPLES:
# Resize and convert to WebP
magick input.png -resize 512x512 -quality 85 output.webp

# Batch process
for f in *.png; do
  magick "$f" -resize 50% -quality 80 "${f%.png}.webp"
done
```

### Texture Atlases

```
TEXTURE ATLAS BENEFITS:
- Fewer draw calls
- Better batching
- Reduced memory fragmentation

ATLAS ORGANIZATION:
┌─────────────────────────────────────────┐
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │ A1  │ │ A2  │ │ A3  │ │ A4  │        │
│ └─────┘ └─────┘ └─────┘ └─────┘        │
│ ┌─────┐ ┌─────┐ ┌─────────────┐        │
│ │ B1  │ │ B2  │ │     C1      │        │
│ └─────┘ └─────┘ └─────────────┘        │
│ ┌───────────────┐ ┌─────┐ ┌─────┐      │
│ │      D1       │ │ E1  │ │ E2  │      │
│ └───────────────┘ └─────┘ └─────┘      │
└─────────────────────────────────────────┘

JSON DEFINITION:
{
  "meta": {
    "image": "atlas.png",
    "size": { "w": 1024, "h": 1024 }
  },
  "frames": {
    "player_idle_01": {
      "frame": { "x": 0, "y": 0, "w": 64, "h": 64 },
      "rotated": false,
      "trimmed": false
    },
    ...
  }
}
```

### 3D Model Optimization

```
OPTIMIZATION CHECKLIST:

□ Triangle count within budget
□ No n-gons (convert to tris/quads)
□ No internal/hidden geometry
□ Proper UV unwrapping
□ Texture size appropriate
□ LODs generated
□ Collision mesh simplified
□ Origin point set correctly
□ Scale applied (1 unit = 1 meter)
□ Normals facing correct direction

BLENDER COMMANDS (via MCP):
"Apply all transforms to selected"
"Remove doubles with threshold 0.001"
"Add decimate modifier, ratio 0.5"
"Generate LOD at 50%, 25%, 10%"
```

---

## Asset Pipeline Automation

### Build Scripts

```typescript
// Asset processing script (Node.js)
import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

interface ProcessingConfig {
  inputDir: string;
  outputDir: string;
  maxWidth: number;
  quality: number;
  format: 'webp' | 'png' | 'jpg';
}

async function processImages(config: ProcessingConfig): Promise<void> {
  const files = await glob(`${config.inputDir}/**/*.{png,jpg,jpeg}`);

  for (const file of files) {
    const relativePath = path.relative(config.inputDir, file);
    const outputPath = path.join(
      config.outputDir,
      relativePath.replace(/\.[^.]+$/, `.${config.format}`)
    );

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Process image
    await sharp(file)
      .resize(config.maxWidth, config.maxWidth, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(config.format, { quality: config.quality })
      .toFile(outputPath);

    console.log(`Processed: ${file} → ${outputPath}`);
  }
}

// Usage
processImages({
  inputDir: './assets-source',
  outputDir: './public/assets',
  maxWidth: 512,
  quality: 85,
  format: 'webp',
});
```

### Sprite Sheet Generator

```typescript
// Generate sprite sheet from individual frames
import sharp from 'sharp';
import path from 'path';

interface SpriteSheetConfig {
  frames: string[];        // Paths to frame images
  columns: number;         // Frames per row
  outputPath: string;
  frameWidth?: number;     // Optional: resize frames
  frameHeight?: number;
}

async function generateSpriteSheet(config: SpriteSheetConfig): Promise<void> {
  const { frames, columns, outputPath } = config;

  // Load first frame to get dimensions
  const firstFrame = await sharp(frames[0]).metadata();
  const frameWidth = config.frameWidth || firstFrame.width!;
  const frameHeight = config.frameHeight || firstFrame.height!;

  const rows = Math.ceil(frames.length / columns);
  const sheetWidth = frameWidth * columns;
  const sheetHeight = frameHeight * rows;

  // Create composite operations
  const composites: sharp.OverlayOptions[] = await Promise.all(
    frames.map(async (framePath, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      return {
        input: await sharp(framePath)
          .resize(frameWidth, frameHeight)
          .toBuffer(),
        left: col * frameWidth,
        top: row * frameHeight,
      };
    })
  );

  // Create sprite sheet
  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .toFile(outputPath);

  console.log(`Sprite sheet created: ${outputPath}`);
  console.log(`Dimensions: ${sheetWidth}x${sheetHeight}`);
  console.log(`Frames: ${frames.length} (${columns}x${rows})`);
}
```

---

## Free Asset Resources

### Recommended Sources

```
2D ASSETS:
- Kenney.nl (CC0, huge library)
- OpenGameArt.org (various licenses)
- Itch.io (free asset packs)
- GameArt2D.com (free section)

3D MODELS:
- Kenney.nl (CC0)
- Poly Pizza (CC0)
- Sketchfab (free section)
- Quaternius.com (CC0)

AUDIO:
- Freesound.org (CC licenses)
- Kenney.nl (CC0)
- OpenGameArt.org
- Incompetech.com (music)

FONTS:
- Google Fonts (free)
- FontSquirrel (free)
- DaFont.com (check licenses)
```

### License Compatibility

```
LICENSE QUICK REFERENCE:

CC0 (Public Domain)
✓ Commercial use
✓ Modification
✓ No attribution required
Best for: Maximum flexibility

CC-BY (Attribution)
✓ Commercial use
✓ Modification
⚠ Attribution required
Best for: Most projects

CC-BY-SA (ShareAlike)
✓ Commercial use
✓ Modification
⚠ Attribution required
⚠ Derivatives must use same license
Best for: Open source projects

CC-BY-NC (NonCommercial)
✗ Commercial use
✓ Modification
⚠ Attribution required
Best for: Hobby projects only

ALWAYS CHECK:
- License allows commercial use (if applicable)
- Attribution requirements
- Modification rights
- Distribution restrictions
```

---

## END OF ASSET PIPELINE
