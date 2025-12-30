# Blender Workflow via MCP — Authoritative

Control Blender with natural language through MCP.
Create 3D models, animations, and renders without touching the UI.

---

## Overview

With Blender MCP installed:
- Claude Code sends commands to Blender
- Blender executes and returns results
- You see changes in Blender viewport
- Export assets for games/web

**Requirement:** Blender must be installed and running on your machine.

---

## MCP Setup

### Step 1: Install Blender

Download from [blender.org](https://www.blender.org/download/)

Minimum version: Blender 3.0+
Recommended: Blender 4.0+

### Step 2: Install Blender MCP

**Option A: poly-mcp (Recommended - 51 tools)**

```bash
# Clone the repository
git clone https://github.com/poly-mcp/Blender-MCP-Server.git
cd Blender-MCP-Server

# Install dependencies
pip install -r requirements.txt

# Install the Blender addon
# Copy the addon folder to Blender's addons directory
```

**Option B: ahujasid/blender-mcp**

```bash
git clone https://github.com/ahujasid/blender-mcp.git
cd blender-mcp
pip install -e .
```

### Step 3: Configure Claude Code

```bash
# Add MCP to Claude Code
claude mcp add blender -- python /path/to/blender-mcp/server.py
```

### Step 4: Start Blender and Enable Addon

1. Open Blender
2. Edit → Preferences → Add-ons
3. Search for "MCP" or install the addon
4. Enable the addon
5. The MCP server starts automatically

### Step 5: Verify Connection

In Claude Code:
```
> Create a cube in Blender
```

If connected, you'll see a cube appear in Blender.

---

## Capabilities

### What Blender MCP Can Do

```
OBJECT OPERATIONS:
✓ Create primitives (cube, sphere, cylinder, etc.)
✓ Create meshes from vertices
✓ Duplicate objects
✓ Delete objects
✓ Transform (move, rotate, scale)
✓ Apply modifiers
✓ Join/separate meshes

MATERIALS:
✓ Create materials
✓ Set colors and properties
✓ Apply materials to objects
✓ Create basic node setups
✓ Apply textures

ANIMATION:
✓ Set keyframes
✓ Create animation actions
✓ Define motion paths
✓ Set up armatures
✓ Apply constraints

SCENE:
✓ Create/switch scenes
✓ Set up cameras
✓ Configure lighting
✓ Set render settings
✓ Query scene state

RENDERING:
✓ Render images
✓ Render animations
✓ Set output paths
✓ Configure render settings

EXPORT:
✓ Export to GLTF/GLB
✓ Export to FBX
✓ Export to OBJ
✓ Export to USD
```

### What It Cannot Do

```
✗ Complex sculpting
✗ Manual UV unwrapping (can do automatic)
✗ Video editing
✗ Real-time viewport control
✗ Complex node graphs (basic only)
✗ Physics simulations setup
```

---

## Common Workflows

### Workflow 1: Create Game Asset

```
USER PROMPT:
"Create a low-poly tree for a game. Make it about 2 meters tall,
with a brown trunk and green foliage. Export as GLTF."

CLAUDE CODE ACTIONS (via MCP):
1. Create cylinder for trunk
2. Apply brown material
3. Create icosphere for foliage
4. Apply green material
5. Position foliage on trunk
6. Join objects
7. Export as GLTF
```

### Workflow 2: Character Base Mesh

```
USER PROMPT:
"Create a simple humanoid base mesh for a game character.
T-pose, low poly, ready for rigging."

CLAUDE CODE ACTIONS (via MCP):
1. Create body from primitives
2. Add limbs
3. Mirror geometry
4. Apply subdivision modifier
5. Set up basic armature
6. Export as FBX
```

### Workflow 3: Animate Object

```
USER PROMPT:
"Create a coin that spins continuously. Export as animated GLTF."

CLAUDE CODE ACTIONS (via MCP):
1. Create cylinder (coin shape)
2. Apply gold material
3. Set keyframe at frame 1, rotation 0
4. Set keyframe at frame 60, rotation 360
5. Set animation to loop
6. Export as GLTF with animation
```

### Workflow 4: Render Scene

```
USER PROMPT:
"Set up a product shot of the model. White background,
three-point lighting, render at 1920x1080."

CLAUDE CODE ACTIONS (via MCP):
1. Create backdrop plane
2. Set up key light
3. Set up fill light
4. Set up rim light
5. Position camera
6. Set render resolution
7. Render image
```

---

## Command Reference

### Object Creation

```python
# These are the types of commands Claude sends via MCP:

# Create primitive
create_object(type="cube", location=(0, 0, 0), scale=(1, 1, 1))
create_object(type="sphere", location=(0, 0, 2), segments=32)
create_object(type="cylinder", location=(0, 0, 0), radius=0.5, depth=2)
create_object(type="plane", location=(0, 0, 0), size=10)

# Transform
set_location(object="Cube", location=(1, 2, 3))
set_rotation(object="Cube", rotation=(0, 0, 45))  # degrees
set_scale(object="Cube", scale=(2, 2, 2))

# Modify
add_modifier(object="Cube", type="SUBSURF", levels=2)
apply_modifier(object="Cube", modifier="Subdivision")
```

### Materials

```python
# Create material
create_material(name="Red_Metal", color=(0.8, 0.1, 0.1), metallic=0.9, roughness=0.2)

# Apply to object
assign_material(object="Cube", material="Red_Metal")

# Texture
set_texture(material="Red_Metal", texture_path="/path/to/texture.png", type="diffuse")
```

### Animation

```python
# Set keyframes
insert_keyframe(object="Cube", frame=1, property="location")
insert_keyframe(object="Cube", frame=30, property="location")

# Set values at keyframes
set_location(object="Cube", location=(0, 0, 0))
set_frame(frame=30)
set_location(object="Cube", location=(5, 0, 0))

# Animation settings
set_frame_range(start=1, end=60)
set_fps(fps=30)
```

### Rendering

```python
# Configure render
set_render_engine(engine="CYCLES")  # or "EEVEE"
set_render_resolution(width=1920, height=1080)
set_render_samples(samples=128)

# Render
render_image(output_path="/path/to/render.png")
render_animation(output_path="/path/to/animation/", format="PNG")
```

### Export

```python
# Export single object
export_gltf(filepath="/path/to/model.glb", selected_only=True)
export_fbx(filepath="/path/to/model.fbx", selected_only=True)

# Export scene
export_gltf(filepath="/path/to/scene.glb", selected_only=False)
```

---

## Export Settings for Game Engines

### For Web (Three.js, Babylon.js, R3F)

```python
export_gltf(
    filepath="/assets/model.glb",
    export_format="GLB",  # Single binary file
    export_animations=True,
    export_materials="EXPORT",
    export_textures=True,
    export_draco_compression=True  # Smaller file size
)
```

### For Unity

```python
export_fbx(
    filepath="/assets/model.fbx",
    apply_scale_options="FBX_SCALE_ALL",
    axis_forward="-Z",
    axis_up="Y",
    bake_animation=True
)
```

### For Unreal

```python
export_fbx(
    filepath="/assets/model.fbx",
    apply_scale_options="FBX_SCALE_ALL",
    axis_forward="X",
    axis_up="Z",
    bake_animation=True
)
```

---

## Best Practices

### For Game Assets

```
1. KEEP POLY COUNT LOW
   - Mobile: < 5,000 triangles per object
   - Desktop: < 50,000 triangles per object
   - Use LOD (Level of Detail) when possible

2. UV UNWRAPPING
   - Use automatic UV projection for simple shapes
   - Request smart UV project for complex models

3. MATERIALS
   - Use PBR workflow (metallic/roughness)
   - Keep texture sizes reasonable (512x512 to 2048x2048)
   - Bake complex materials to textures

4. NAMING
   - Use descriptive names
   - Prefix with type (MESH_, MAT_, ARM_)
   - No spaces in names
```

### For Animation

```
1. TIMING
   - Standard: 24 fps (film), 30 fps (games), 60 fps (smooth)
   - Keep animations loopable when possible

2. ARMATURES
   - Use proper bone naming conventions
   - Keep bone count reasonable for games

3. EXPORT
   - Bake animations before export
   - Check that transforms are applied
```

---

## Troubleshooting

### MCP Not Connecting

```
1. Check Blender is running
2. Check addon is enabled
3. Verify server is running: check terminal for MCP output
4. Try restarting Blender
5. Check firewall isn't blocking local connections
```

### Commands Not Working

```
1. Check object names are correct
2. Verify object exists in scene
3. Check for typos in commands
4. Try simpler command first
5. Check Blender console for errors
```

### Export Issues

```
1. Apply all transforms before export
2. Check scale is correct
3. Verify materials are properly assigned
4. Test with simpler scene first
```

---

## Example Projects

### Simple Game Asset Pack

```
Project: Fantasy Props
Assets:
- Wooden barrel
- Treasure chest
- Torch
- Wooden crate
- Stone pillar

For each asset:
1. Create geometry
2. Apply materials
3. Set origin to bottom
4. Export as individual GLTF
```

### Animated Character

```
Project: Simple Character
Components:
- Body mesh (low poly)
- Basic armature
- Idle animation
- Walk cycle
- Jump animation

Workflow:
1. Create body geometry
2. Set up armature
3. Weight paint
4. Create animations
5. Export as GLTF with animations
```

---

## Integration with Game Engines

### Web Games (Three.js/Babylon.js)

```typescript
// Load Blender export in Three.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('/assets/model.glb', (gltf) => {
  scene.add(gltf.scene);

  // Access animations
  const mixer = new AnimationMixer(gltf.scene);
  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });
});
```

### Unity

```csharp
// FBX imports automatically in Unity
// Access in script:
public GameObject modelPrefab;

void Start() {
    Instantiate(modelPrefab, Vector3.zero, Quaternion.identity);
}
```

### Unreal

```cpp
// FBX imports automatically in Unreal
// Access via Blueprint or C++
UStaticMesh* Mesh = LoadObject<UStaticMesh>(
    nullptr,
    TEXT("/Game/Models/MyModel.MyModel")
);
```

---

## END OF BLENDER WORKFLOW
