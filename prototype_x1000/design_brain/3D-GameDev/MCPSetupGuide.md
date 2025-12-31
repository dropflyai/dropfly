# MCP Setup Guide — Authoritative

Complete setup guide for connecting Claude Code to 3D tools and game engines.

---

## What is MCP?

MCP (Model Context Protocol) allows Claude Code to communicate with external applications. For game development, this enables:

- **Blender MCP** - Create 3D models, animate, render
- **Unity MCP** - Build scenes, create GameObjects, write scripts
- **Unreal MCP** - Control Unreal Editor, spawn actors, build levels
- **Asset MCPs** - Generate images, textures, sprites via AI

---

## Prerequisites

Before setting up any MCP:

```bash
# Ensure you have Claude Code installed
claude --version

# Ensure Python 3.9+ is installed
python3 --version

# Ensure Node.js 18+ is installed (for some MCPs)
node --version

# Ensure pip is available
pip3 --version
```

---

## Blender MCP Setup

### Option A: poly-mcp (Recommended - 51 tools)

```bash
# Step 1: Clone the repository
git clone https://github.com/poly-mcp/Blender-MCP-Server.git
cd Blender-MCP-Server

# Step 2: Install Python dependencies
pip3 install -r requirements.txt

# Step 3: Install the Blender addon
# Find your Blender addons folder:
# - macOS: ~/Library/Application Support/Blender/[version]/scripts/addons/
# - Windows: %APPDATA%/Blender Foundation/Blender/[version]/scripts/addons/
# - Linux: ~/.config/blender/[version]/scripts/addons/

# Copy the addon:
cp -r addon/blender_mcp ~/Library/Application\ Support/Blender/4.0/scripts/addons/

# Step 4: Enable in Blender
# 1. Open Blender
# 2. Edit → Preferences → Add-ons
# 3. Search "MCP"
# 4. Enable "Blender MCP Server"
# 5. The server starts automatically

# Step 5: Add to Claude Code
claude mcp add blender -- python3 /path/to/Blender-MCP-Server/server.py
```

### Option B: ahujasid/blender-mcp

```bash
# Step 1: Clone and install
git clone https://github.com/ahujasid/blender-mcp.git
cd blender-mcp
pip3 install -e .

# Step 2: Install the Blender addon
# Copy addon/blender_mcp_addon.py to your Blender addons folder
# Enable in Blender preferences

# Step 3: Add to Claude Code
claude mcp add blender-simple -- python3 -m blender_mcp
```

### Verify Blender MCP

```bash
# In Claude Code, test the connection:
claude

> Create a cube in Blender at position 0, 0, 0
# You should see a cube appear in Blender's viewport
```

### Blender MCP Capabilities

```
AVAILABLE TOOLS (poly-mcp):

Object Management:
- create_object
- delete_object
- duplicate_object
- select_object
- get_object_info

Transforms:
- set_location
- set_rotation
- set_scale
- apply_transforms

Modifiers:
- add_modifier
- apply_modifier
- remove_modifier

Materials:
- create_material
- assign_material
- set_material_color

Animation:
- insert_keyframe
- set_frame
- set_frame_range

Rendering:
- set_render_settings
- render_image
- render_animation

Export:
- export_gltf
- export_fbx
- export_obj
```

---

## Unity MCP Setup

### Option A: CoderGamester/mcp-unity (Recommended)

```bash
# Step 1: In your Unity project
# Open Unity Package Manager (Window → Package Manager)
# Click + → "Add package from git URL"
# Enter: https://github.com/CoderGamester/mcp-unity.git

# Step 2: Configure in Unity
# Window → MCP → Settings
# Set port (default: 3000)
# Click "Start Server"

# Step 3: Add to Claude Code
# Note the server URL from Unity (usually http://localhost:3000)
claude mcp add unity -- node /path/to/mcp-unity/server/index.js
```

### Option B: IvanMurzak/Unity-MCP

```bash
# Step 1: In Unity Package Manager
# Add package from git URL:
# https://github.com/IvanMurzak/Unity-MCP.git

# Step 2: Enable in Project Settings
# Edit → Project Settings → MCP
# Enable server

# Step 3: Add to Claude Code
claude mcp add unity-alt -- python3 /path/to/unity-mcp/server.py
```

### Verify Unity MCP

```bash
# In Claude Code:
claude

> Create a cube named "TestCube" in Unity at position 0, 2, 0
# You should see a cube appear in Unity's Scene view
```

### Unity MCP Capabilities

```
AVAILABLE OPERATIONS:

GameObjects:
- Create primitives (Cube, Sphere, Cylinder, etc.)
- Create empty GameObjects
- Instantiate prefabs
- Delete GameObjects
- Find by name/tag
- Set parent relationships

Transform:
- Set position
- Set rotation
- Set scale
- Get transform values

Components:
- Add components
- Remove components
- Get/set component properties
- Access Rigidbody, Collider, etc.

Scripting:
- Create C# scripts
- Attach scripts to objects
- Set serialized field values

Scene:
- Create/load/save scenes
- Query hierarchy

Build:
- Configure build settings
- Build for target platform
```

---

## Unreal MCP Setup

**Note:** Unreal MCP is experimental and less mature than Blender/Unity MCPs.

### chongdashu/unreal-mcp

```bash
# Step 1: Enable Python in Unreal
# 1. Open Unreal Editor
# 2. Edit → Plugins
# 3. Search "Python"
# 4. Enable "Python Editor Script Plugin"
# 5. Restart Unreal

# Step 2: Clone the MCP server
git clone https://github.com/chongdashu/unreal-mcp.git
cd unreal-mcp
pip3 install -r requirements.txt

# Step 3: Configure Unreal
# Edit → Project Settings → Python
# Add the MCP scripts path to "Additional Paths"
# Enable "Developer Mode"

# Step 4: Add to Claude Code
claude mcp add unreal -- python3 /path/to/unreal-mcp/server.py

# Step 5: Start the MCP listener in Unreal
# In Unreal's Python console or startup script:
# import mcp_listener
# mcp_listener.start()
```

### Verify Unreal MCP

```bash
# In Claude Code:
claude

> Create a static mesh actor at position 0, 0, 0 in Unreal
# You should see an actor appear in Unreal's viewport
```

### Unreal MCP Capabilities

```
AVAILABLE OPERATIONS (Limited):

Actors:
- Spawn actors
- Delete actors
- Find actors by name/class
- Set actor properties
- Transform actors

Components:
- Add components
- Modify component properties
- Access static mesh components

Blueprints:
- Create Blueprint classes
- Add variables
- Compile Blueprints

Levels:
- Create/load/save levels
- Query level actors

Materials:
- Create material instances
- Set material parameters

LIMITATIONS:
⚠ Experimental - some features may not work
⚠ Complex Blueprint logic limited
⚠ No runtime/PIE control
⚠ Animation setup is basic
```

---

## Asset Generation MCPs

### Together AI MCP (Flux Models)

```bash
# Step 1: Install
npm install -g @anthropic/mcp-together-ai
# Or: pip3 install together-mcp

# Step 2: Get API key
# Sign up at together.ai
# Get API key from dashboard

# Step 3: Add to Claude Code
claude mcp add together -- npx @anthropic/mcp-together-ai --api-key YOUR_API_KEY
```

### OpenAI DALL-E MCP

```bash
# Step 1: Install
npm install -g @anthropic/mcp-openai
# Or: pip3 install openai-mcp

# Step 2: Get API key
# From platform.openai.com

# Step 3: Add to Claude Code
claude mcp add openai -- npx @anthropic/mcp-openai --api-key YOUR_API_KEY
```

### Verify Asset Generation

```bash
# In Claude Code:
claude

> Generate a pixel art sword icon, 64x64, transparent background
# The MCP will generate and return the image
```

---

## MCP Management

### List Active MCPs

```bash
claude mcp list
```

### Remove an MCP

```bash
claude mcp remove blender
```

### Update an MCP

```bash
# Remove and re-add with new path/settings
claude mcp remove unity
claude mcp add unity -- node /new/path/to/server.js
```

### MCP Configuration File

MCPs are stored in `~/.claude/mcp.json`:

```json
{
  "servers": {
    "blender": {
      "command": "python3",
      "args": ["/path/to/blender-mcp/server.py"],
      "env": {}
    },
    "unity": {
      "command": "node",
      "args": ["/path/to/unity-mcp/server/index.js"],
      "env": {}
    },
    "together": {
      "command": "npx",
      "args": ["@anthropic/mcp-together-ai"],
      "env": {
        "TOGETHER_API_KEY": "your-key"
      }
    }
  }
}
```

---

## Troubleshooting

### Common Issues

```
ISSUE: MCP not connecting

SOLUTIONS:
1. Verify the application is running (Blender/Unity/Unreal)
2. Check the MCP server is started
3. Verify port isn't blocked by firewall
4. Check Claude Code has network permissions
5. Restart both Claude Code and the application
6. Check logs for errors

ISSUE: Commands not executing

SOLUTIONS:
1. Verify object/asset names are correct
2. Check the application is in Edit mode (not Play mode)
3. Ensure required assets exist
4. Check application console for errors
5. Try a simpler command first

ISSUE: MCP server crashes

SOLUTIONS:
1. Check Python/Node.js version requirements
2. Verify all dependencies installed
3. Check for port conflicts
4. Review server logs
5. Update to latest MCP version
```

### Debug Commands

```bash
# Check if MCP server is running
lsof -i :3000  # Or whatever port

# Test MCP connection manually
curl http://localhost:3000/health

# Check Claude Code MCP status
claude mcp status

# Run MCP server in verbose mode
python3 server.py --verbose
```

### Platform-Specific Issues

```
MACOS:
- Grant terminal/Claude Code network permissions
- System Preferences → Security & Privacy → Firewall
- Allow Python/Node through firewall

WINDOWS:
- Run as Administrator if needed
- Check Windows Defender firewall
- Allow through Windows Security

LINUX:
- Check SELinux/AppArmor policies
- Verify iptables rules
- Check user permissions
```

---

## Recommended Setup Order

For a complete game development environment:

```
1. BLENDER MCP (Core 3D tool)
   - Most mature MCP
   - Creates assets for all engines
   - Export to any format

2. UNITY MCP (If using Unity)
   - Good stability
   - Full feature set
   - Import Blender exports

3. ASSET GENERATION MCP (Optional)
   - Together AI for textures/sprites
   - Use for placeholders and concepts

4. UNREAL MCP (If using Unreal)
   - Experimental - set up last
   - Be prepared for limitations
```

---

## Quick Reference Card

```
BLENDER MCP:
claude mcp add blender -- python3 /path/to/server.py
Test: "Create a cube in Blender"

UNITY MCP:
claude mcp add unity -- node /path/to/server.js
Test: "Create a cube in Unity"

UNREAL MCP:
claude mcp add unreal -- python3 /path/to/server.py
Test: "Create an actor in Unreal"

TOGETHER AI:
claude mcp add together -- npx @anthropic/mcp-together-ai
Test: "Generate a pixel art character"

MANAGEMENT:
claude mcp list              # Show all MCPs
claude mcp remove [name]     # Remove an MCP
claude mcp status            # Check connection status
```

---

## END OF MCP SETUP GUIDE
