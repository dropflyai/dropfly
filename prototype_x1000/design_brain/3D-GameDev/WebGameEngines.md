# Web Game Engines — Authoritative

Build games in the browser with code alone.
No external tools required. Full control.

---

## Overview

Web game engines let Claude Code write complete, playable games:
- You run `npm run dev`
- Game plays in browser
- Deploy anywhere (Vercel, Netlify, etc.)

---

## Engine Selection Guide

```
DECISION TREE:

Is it 2D or 3D?
│
├── 2D
│   │
│   ├── Need high performance graphics?
│   │   └── YES → PixiJS
│   │   └── NO → Continue
│   │
│   ├── Using React?
│   │   └── YES → Custom Canvas + React
│   │   └── NO → Continue
│   │
│   ├── Want batteries-included?
│   │   └── YES → Phaser 4
│   │   └── NO → KAPLAY (simpler)
│   │
│   └── TypeScript-first?
│       └── YES → Excalibur.js
│
└── 3D
    │
    ├── Using React?
    │   └── YES → React Three Fiber
    │   └── NO → Continue
    │
    ├── Need full game engine features?
    │   └── YES → Babylon.js
    │   └── NO → Three.js
    │
    └── Need VR/AR?
        └── YES → Babylon.js (WebXR)
```

---

## PHASER 4 (Recommended for 2D)

### Overview
- **Best for:** 2D browser/mobile games
- **Language:** TypeScript/JavaScript
- **License:** MIT (free)
- **Status:** v4 in beta, stable release end 2025
- **Stars:** 37,800+ GitHub

### Setup

```bash
# Create new Phaser project
npm create @phaserjs/game@latest my-game
cd my-game
npm install
npm run dev
```

### Project Structure

```
my-game/
├── src/
│   ├── main.ts           # Entry point
│   ├── scenes/
│   │   ├── Boot.ts       # Asset loading
│   │   ├── Preloader.ts  # Loading screen
│   │   ├── MainMenu.ts   # Menu scene
│   │   └── Game.ts       # Main gameplay
│   ├── objects/
│   │   ├── Player.ts     # Player class
│   │   └── Enemy.ts      # Enemy class
│   └── utils/
├── public/
│   └── assets/
│       ├── images/
│       ├── audio/
│       └── tilemaps/
├── index.html
└── package.json
```

### Basic Game Template

```typescript
// src/main.ts
import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false
    }
  },
  scene: [Boot, Preloader, MainMenu, Game]
};

export default new Phaser.Game(config);
```

```typescript
// src/scenes/Game.ts
import Phaser from 'phaser';

export class Game extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  create() {
    // Create tilemap
    const map = this.make.tilemap({ key: 'level1' });
    const tileset = map.addTilesetImage('tiles', 'tiles');
    const platforms = map.createLayer('Platforms', tileset!, 0, 0);
    platforms?.setCollisionByExclusion([-1]);

    // Create player
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Player animations
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 20
    });

    // Collisions
    this.physics.add.collider(this.player, platforms!);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#fff'
    });
  }

  update() {
    // Movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('walk', true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('walk', true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('idle');
    }

    // Jump
    if (this.cursors.up.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}
```

### Phaser Game Types

| Type | Difficulty | Key Features |
|------|------------|--------------|
| Platformer | Easy | Arcade physics, tilemaps |
| Top-down RPG | Medium | Tilemaps, dialogue, inventory |
| Puzzle | Easy | Tweens, input handling |
| Shooter | Medium | Groups, collision, particles |
| Match-3 | Medium | Grid logic, tweens |
| Card Game | Medium | Drag/drop, state management |

---

## BABYLON.JS (Recommended for 3D)

### Overview
- **Best for:** Full 3D games, VR/AR
- **Language:** TypeScript/JavaScript
- **License:** Apache 2.0 (free)
- **Backed by:** Microsoft
- **Features:** Physics, WebXR, PBR materials

### Setup

```bash
# Create Babylon.js project with Vite
npm create vite@latest my-3d-game -- --template vanilla-ts
cd my-3d-game
npm install @babylonjs/core @babylonjs/loaders
npm run dev
```

### Basic 3D Scene

```typescript
// src/main.ts
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  ActionManager,
  ExecuteCodeAction
} from '@babylonjs/core';

class Game {
  private engine: Engine;
  private scene: Scene;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
    this.scene = this.createScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  createScene(): Scene {
    const scene = new Scene(this.engine);

    // Camera
    const camera = new ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 3,
      10,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(this.engine.getRenderingCanvas(), true);

    // Light
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Ground
    const ground = MeshBuilder.CreateGround('ground', {
      width: 10,
      height: 10
    }, scene);
    const groundMat = new StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new Color3(0.2, 0.6, 0.2);
    ground.material = groundMat;

    // Player cube
    const player = MeshBuilder.CreateBox('player', { size: 1 }, scene);
    player.position.y = 0.5;
    const playerMat = new StandardMaterial('playerMat', scene);
    playerMat.diffuseColor = new Color3(0.2, 0.4, 0.8);
    player.material = playerMat;

    // Click interaction
    player.actionManager = new ActionManager(scene);
    player.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        player.position.y += 0.5;
      })
    );

    // Keyboard controls
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === 1) { // Key down
        switch (kbInfo.event.key) {
          case 'w': player.position.z += 0.1; break;
          case 's': player.position.z -= 0.1; break;
          case 'a': player.position.x -= 0.1; break;
          case 'd': player.position.x += 0.1; break;
        }
      }
    });

    return scene;
  }
}

// Initialize
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
new Game(canvas);
```

### Loading 3D Models

```typescript
import { SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

// Load GLTF model (exported from Blender)
SceneLoader.ImportMesh(
  '',
  '/assets/models/',
  'character.glb',
  scene,
  (meshes) => {
    const character = meshes[0];
    character.position = new Vector3(0, 0, 0);
    character.scaling = new Vector3(0.5, 0.5, 0.5);
  }
);
```

### Physics with Cannon.js

```typescript
import { CannonJSPlugin } from '@babylonjs/core';
import * as CANNON from 'cannon-es';

// Enable physics
scene.enablePhysics(
  new Vector3(0, -9.81, 0),
  new CannonJSPlugin(true, 10, CANNON)
);

// Add physics to mesh
player.physicsImpostor = new PhysicsImpostor(
  player,
  PhysicsImpostor.BoxImpostor,
  { mass: 1, restitution: 0.2 },
  scene
);
```

---

## THREE.JS / REACT THREE FIBER

### Overview
- **Three.js:** Low-level 3D library, maximum flexibility
- **React Three Fiber (R3F):** Three.js as React components
- **Best for:** Custom 3D solutions, React projects

### React Three Fiber Setup

```bash
npm create vite@latest my-r3f-game -- --template react-ts
cd my-r3f-game
npm install three @react-three/fiber @react-three/drei
npm run dev
```

### Basic R3F Game

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useState } from 'react';

function Player() {
  const [position, setPosition] = useState<[number, number, number]>([0, 1, 0]);

  return (
    <RigidBody position={position}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="royalblue" />
      </mesh>
    </RigidBody>
  );
}

function Ground() {
  return (
    <RigidBody type="fixed">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
    </RigidBody>
  );
}

function Obstacle({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody position={position}>
      <mesh>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="crimson" />
      </mesh>
    </RigidBody>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Physics>
          <Player />
          <Ground />
          <Obstacle position={[3, 1, 0]} />
          <Obstacle position={[-3, 1, 2]} />
        </Physics>

        <OrbitControls />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
```

### R3F with Game State

```tsx
// src/stores/gameStore.ts
import { create } from 'zustand';

interface GameState {
  score: number;
  lives: number;
  isPlaying: boolean;
  addScore: (points: number) => void;
  loseLife: () => void;
  startGame: () => void;
  endGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  lives: 3,
  isPlaying: false,
  addScore: (points) => set((state) => ({ score: state.score + points })),
  loseLife: () => set((state) => ({
    lives: state.lives - 1,
    isPlaying: state.lives > 1
  })),
  startGame: () => set({ score: 0, lives: 3, isPlaying: true }),
  endGame: () => set({ isPlaying: false }),
}));
```

---

## PIXIJS (High-Performance 2D)

### Overview
- **Best for:** Graphics-heavy 2D, particle effects
- **Language:** TypeScript/JavaScript
- **Performance:** Extremely fast WebGL rendering
- **Use when:** Phaser is too heavy, need raw performance

### Setup

```bash
npm create vite@latest my-pixi-game -- --template vanilla-ts
cd my-pixi-game
npm install pixi.js
npm run dev
```

### Basic PixiJS Game

```typescript
import { Application, Sprite, Assets, Container, Text } from 'pixi.js';

async function init() {
  // Create app
  const app = new Application();
  await app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb
  });
  document.body.appendChild(app.canvas);

  // Load assets
  const texture = await Assets.load('/assets/player.png');

  // Create player
  const player = new Sprite(texture);
  player.anchor.set(0.5);
  player.x = app.screen.width / 2;
  player.y = app.screen.height / 2;
  app.stage.addChild(player);

  // Movement
  const keys: Record<string, boolean> = {};
  window.addEventListener('keydown', (e) => keys[e.key] = true);
  window.addEventListener('keyup', (e) => keys[e.key] = false);

  // Game loop
  app.ticker.add((delta) => {
    if (keys['ArrowLeft']) player.x -= 5 * delta.deltaTime;
    if (keys['ArrowRight']) player.x += 5 * delta.deltaTime;
    if (keys['ArrowUp']) player.y -= 5 * delta.deltaTime;
    if (keys['ArrowDown']) player.y += 5 * delta.deltaTime;
  });

  // Score UI
  const scoreText = new Text({
    text: 'Score: 0',
    style: { fontSize: 24, fill: 0xffffff }
  });
  scoreText.x = 10;
  scoreText.y = 10;
  app.stage.addChild(scoreText);
}

init();
```

---

## KAPLAY (Quick Prototypes)

### Overview
- **Best for:** Rapid prototyping, game jams
- **Language:** JavaScript/TypeScript
- **Philosophy:** Fun and fast development
- **Fork of:** Kaboom.js (actively maintained)

### Setup

```bash
npm create kaplay my-game
cd my-game
npm run dev
```

### Quick Platformer

```typescript
import kaplay from 'kaplay';

const k = kaplay();

k.loadSprite('bean', '/sprites/bean.png');
k.loadSprite('grass', '/sprites/grass.png');
k.loadSprite('coin', '/sprites/coin.png');

k.scene('game', () => {
  // Player
  const player = k.add([
    k.sprite('bean'),
    k.pos(100, 200),
    k.area(),
    k.body(),
    'player'
  ]);

  // Platforms
  const level = [
    '                    ',
    '                    ',
    '                    ',
    '  ===              ',
    '                    ',
    '        ===         ',
    '                    ',
    '====================',
  ];

  k.addLevel(level, {
    tileWidth: 40,
    tileHeight: 40,
    tiles: {
      '=': () => [k.sprite('grass'), k.area(), k.body({ isStatic: true })],
    }
  });

  // Controls
  k.onKeyDown('left', () => player.move(-200, 0));
  k.onKeyDown('right', () => player.move(200, 0));
  k.onKeyPress('space', () => {
    if (player.isGrounded()) {
      player.jump(400);
    }
  });

  // Score
  let score = 0;
  const scoreLabel = k.add([
    k.text(`Score: ${score}`),
    k.pos(20, 20)
  ]);

  // Coins
  player.onCollide('coin', (coin) => {
    k.destroy(coin);
    score += 10;
    scoreLabel.text = `Score: ${score}`;
  });
});

k.go('game');
```

---

## EXCALIBUR.JS (TypeScript-First)

### Overview
- **Best for:** TypeScript developers who want type safety
- **Language:** TypeScript (built from ground up)
- **Style:** Clean, readable, maintainable

### Setup

```bash
npm create excalibur@latest
cd my-game
npm install
npm run dev
```

### Basic Structure

```typescript
import { Engine, Actor, Color, vec, Keys } from 'excalibur';

class Player extends Actor {
  constructor() {
    super({
      pos: vec(100, 100),
      width: 50,
      height: 50,
      color: Color.Blue
    });
  }

  onInitialize() {
    // Called once when actor is added to scene
  }

  onPreUpdate(engine: Engine) {
    // Called every frame before update
    const speed = 200;

    if (engine.input.keyboard.isHeld(Keys.Left)) {
      this.vel.x = -speed;
    } else if (engine.input.keyboard.isHeld(Keys.Right)) {
      this.vel.x = speed;
    } else {
      this.vel.x = 0;
    }
  }
}

const game = new Engine({
  width: 800,
  height: 600
});

const player = new Player();
game.add(player);

game.start();
```

---

## Engine Comparison Matrix

| Feature | Phaser | Babylon.js | Three.js | R3F | PixiJS | KAPLAY |
|---------|--------|------------|----------|-----|--------|--------|
| 2D Support | ✓✓✓ | ✓ | ✓ | ✓ | ✓✓✓ | ✓✓✓ |
| 3D Support | ✗ | ✓✓✓ | ✓✓✓ | ✓✓✓ | ✗ | ✗ |
| Physics | ✓✓ | ✓✓ | Plugin | ✓✓ | Plugin | ✓✓ |
| TypeScript | ✓✓ | ✓✓✓ | ✓✓ | ✓✓✓ | ✓✓ | ✓ |
| React Integration | Plugin | Plugin | ✗ | ✓✓✓ | Plugin | ✗ |
| Learning Curve | Easy | Medium | Hard | Medium | Easy | Very Easy |
| Community | Huge | Large | Huge | Large | Large | Medium |
| Mobile | ✓✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓✓ | ✓✓ |
| VR/AR | ✗ | ✓✓✓ | ✓✓ | ✓✓ | ✗ | ✗ |
| Bundle Size | Medium | Large | Medium | Medium | Small | Small |

---

## Deployment

### All Engines (Vite Build)

```bash
# Build for production
npm run build

# Output in dist/ folder
# Deploy to:
# - Vercel: vercel deploy
# - Netlify: netlify deploy
# - GitHub Pages: push to gh-pages branch
```

### Mobile (PWA)

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My Game',
        short_name: 'Game',
        display: 'fullscreen',
        orientation: 'landscape'
      }
    })
  ]
};
```

---

## Best Practices

### Performance
- Use object pooling for bullets/particles
- Minimize draw calls
- Use texture atlases
- Implement culling for off-screen objects

### Architecture
- Separate game logic from rendering
- Use state machines for game states
- Implement proper scene management
- Keep components small and focused

### Assets
- Compress images (WebP for web)
- Use sprite sheets
- Lazy load non-essential assets
- Cache loaded assets

---

## END OF WEB GAME ENGINES
