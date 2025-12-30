# Unreal Engine Workflow via MCP — Authoritative

Control Unreal Editor with natural language through MCP.
Create Actors, levels, and Blueprints programmatically.

---

## Overview

With Unreal MCP installed:
- Claude Code sends commands to Unreal Editor
- Unreal executes Python scripts
- You see changes in Unreal viewport
- Build and package games

**Requirement:** Unreal Engine must be installed with Python plugin enabled.

**Status:** Experimental - MCP support is newer than Unity/Blender.

---

## MCP Setup

### Step 1: Install Unreal Engine

Download from [unrealengine.com](https://www.unrealengine.com/download)

Minimum version: Unreal Engine 5.0+
Recommended: Unreal Engine 5.3+

### Step 2: Enable Python Plugin

1. Open Unreal Editor
2. Edit → Plugins
3. Search "Python"
4. Enable "Python Editor Script Plugin"
5. Restart Unreal

### Step 3: Install Unreal MCP

```bash
git clone https://github.com/chongdashu/unreal-mcp.git
cd unreal-mcp
pip install -r requirements.txt
```

### Step 4: Configure Unreal

In Unreal Editor:
1. Edit → Project Settings
2. Search "Python"
3. Add the MCP scripts path to Additional Paths
4. Enable "Developer Mode"

### Step 5: Connect Claude Code

```bash
# Add to Claude Code
claude mcp add unreal -- python /path/to/unreal-mcp/server.py
```

### Step 6: Verify Connection

In Claude Code:
```
> Create a cube in Unreal at position 0,0,0
```

If connected, you'll see an actor appear in Unreal.

---

## Capabilities

### What Unreal MCP Can Do

```
ACTOR OPERATIONS:
✓ Spawn actors (primitives, Blueprint classes)
✓ Delete actors
✓ Find actors by name/class/tag
✓ Set actor properties
✓ Transform actors (location, rotation, scale)

COMPONENTS:
✓ Add components to actors
✓ Modify component properties
✓ Access static mesh components
✓ Configure collision

BLUEPRINTS:
✓ Create Blueprint classes
✓ Add variables
✓ Add functions
✓ Compile Blueprints
✓ Spawn Blueprint instances

LEVELS:
✓ Create new levels
✓ Load levels
✓ Save levels
✓ Query level actors

MATERIALS:
✓ Create material instances
✓ Set material parameters
✓ Apply materials to actors

PYTHON EXECUTION:
✓ Run arbitrary Python scripts
✓ Access Unreal Python API
✓ Automate editor tasks
```

### Current Limitations

```
⚠ MCP is experimental for Unreal
⚠ Some features may not work consistently
⚠ Complex Blueprint logic is limited
⚠ Animation setup is basic
⚠ No runtime/PIE control
```

---

## Unreal Python API Basics

### Actor Creation

```python
import unreal

# Get editor subsystem
editor_subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)

# Spawn a static mesh actor
actor = editor_subsystem.spawn_actor_from_class(
    unreal.StaticMeshActor,
    unreal.Vector(0, 0, 0),
    unreal.Rotator(0, 0, 0)
)

# Set mesh
static_mesh = unreal.EditorAssetLibrary.load_asset('/Engine/BasicShapes/Cube')
actor.get_component_by_class(unreal.StaticMeshComponent).set_static_mesh(static_mesh)

# Set name
actor.set_actor_label('MyCube')
```

### Transform Operations

```python
# Get actor
actor = unreal.EditorLevelLibrary.get_actor_reference('/Game/Levels/MainLevel.MainLevel:PersistentLevel.MyCube')

# Set location
actor.set_actor_location(unreal.Vector(100, 200, 50), False, False)

# Set rotation
actor.set_actor_rotation(unreal.Rotator(0, 45, 0), False)

# Set scale
actor.set_actor_scale3d(unreal.Vector(2, 2, 2))
```

### Material Creation

```python
# Create material instance
asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
material_factory = unreal.MaterialInstanceConstantFactoryNew()

parent_material = unreal.EditorAssetLibrary.load_asset('/Engine/BasicShapes/BasicShapeMaterial')

material_instance = asset_tools.create_asset(
    'MI_Custom',
    '/Game/Materials/',
    unreal.MaterialInstanceConstant,
    material_factory
)

# Set parameter
material_instance.set_vector_parameter_value('BaseColor', unreal.LinearColor(1, 0, 0, 1))
```

### Blueprint Creation

```python
# Create Blueprint
factory = unreal.BlueprintFactory()
factory.set_editor_property('parent_class', unreal.Actor)

asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
blueprint = asset_tools.create_asset(
    'BP_Enemy',
    '/Game/Blueprints/',
    None,
    factory
)

# Add component
unreal.BlueprintEditorLibrary.add_component_to_blueprint(
    blueprint,
    unreal.StaticMeshComponent,
    'MeshComponent'
)

# Compile
unreal.BlueprintEditorLibrary.compile_blueprint(blueprint)
```

---

## Common Workflows

### Workflow 1: Level Building

```
USER PROMPT:
"Create a test level with a floor, some walls, and a player start."

CLAUDE CODE ACTIONS (via MCP):
1. Create new level
2. Spawn floor plane (scaled 10x10)
3. Spawn 4 wall actors
4. Position walls around floor
5. Add PlayerStart actor
6. Add directional light
7. Add sky sphere
8. Save level
```

### Workflow 2: Spawner Blueprint

```
USER PROMPT:
"Create an enemy spawner Blueprint that spawns enemies at intervals."

CLAUDE CODE ACTIONS (via MCP):
1. Create Blueprint BP_EnemySpawner
2. Add SpawnInterval float variable
3. Add SpawnRadius float variable
4. Add EnemyClass variable (class reference)
5. Add SpawnEnemy function
6. Implement timer logic
7. Compile Blueprint
```

### Workflow 3: Material Setup

```
USER PROMPT:
"Create a glowing red material for enemies."

CLAUDE CODE ACTIONS (via MCP):
1. Create material instance from base
2. Set BaseColor to red
3. Enable emissive
4. Set EmissiveColor to red glow
5. Save material
6. Apply to enemy actors
```

---

## Project Structure

### Recommended Folder Structure

```
Content/
├── _Project/
│   ├── Blueprints/
│   │   ├── Characters/
│   │   ├── Enemies/
│   │   ├── Items/
│   │   └── Managers/
│   ├── Levels/
│   │   ├── MainMenu/
│   │   └── Gameplay/
│   ├── Materials/
│   │   ├── Characters/
│   │   ├── Environment/
│   │   └── Effects/
│   ├── Meshes/
│   │   ├── Characters/
│   │   ├── Props/
│   │   └── Environment/
│   ├── Textures/
│   ├── Audio/
│   │   ├── Music/
│   │   └── SFX/
│   ├── UI/
│   │   ├── Widgets/
│   │   └── Textures/
│   └── Data/
│       └── DataTables/
└── ThirdParty/
```

---

## C++ Integration

### Basic Actor Class

```cpp
// MyActor.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MyActor.generated.h"

UCLASS()
class MYGAME_API AMyActor : public AActor
{
    GENERATED_BODY()

public:
    AMyActor();

protected:
    virtual void BeginPlay() override;

public:
    virtual void Tick(float DeltaTime) override;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Properties")
    float Speed = 100.0f;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    UStaticMeshComponent* MeshComponent;
};
```

```cpp
// MyActor.cpp
#include "MyActor.h"

AMyActor::AMyActor()
{
    PrimaryActorTick.bCanEverTick = true;

    MeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("MeshComponent"));
    RootComponent = MeshComponent;
}

void AMyActor::BeginPlay()
{
    Super::BeginPlay();
}

void AMyActor::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
}
```

### Creating from MCP

```python
# Generate C++ class via Python/MCP
# (Then Unreal compiles it)

cpp_header = '''
// Generated by Claude Code via MCP
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "GeneratedActor.generated.h"

UCLASS()
class AGeneratedActor : public AActor
{
    GENERATED_BODY()
public:
    AGeneratedActor();
};
'''

# Write to source folder
with open('/path/to/Source/MyGame/GeneratedActor.h', 'w') as f:
    f.write(cpp_header)

# Trigger hot reload (in Unreal)
```

---

## Build & Package

### Build Configuration

```python
import unreal

# Set build configuration
project_settings = unreal.get_default_object(unreal.ProjectPackagingSettings)

# Package settings
project_settings.set_editor_property('build_configuration',
    unreal.ProjectPackagingBuildConfigurations.PPBC_SHIPPING)

# Compression
project_settings.set_editor_property('use_pak_file', True)
```

### Package Project

```python
# Package for Windows
unreal.AutomationLibrary.run_editor_command(
    'PackageProject -platform=Win64 -targetdir=/path/to/output'
)
```

---

## Troubleshooting

### Python Plugin Issues

```
1. Ensure Python plugin is enabled
2. Restart Unreal after enabling
3. Check Output Log for Python errors
4. Verify Python paths in Project Settings
```

### MCP Connection Issues

```
1. Verify MCP server is running
2. Check firewall isn't blocking
3. Ensure Unreal has network permissions
4. Try restarting both MCP server and Unreal
```

### Script Execution Errors

```
1. Check Python syntax
2. Verify asset paths exist
3. Ensure actors/assets are loaded
4. Check Unreal Output Log
```

---

## Unreal vs Unity Comparison

| Feature | Unreal MCP | Unity MCP |
|---------|------------|-----------|
| Maturity | Experimental | Stable |
| Actor creation | ✓ | ✓ |
| Blueprint/Script | Basic | Full |
| Material control | ✓ | ✓ |
| Animation | Limited | Moderate |
| Build automation | ✓ | ✓ |
| Documentation | Limited | Good |

**Recommendation:** For MCP-driven development, Unity currently has better support. Use Unreal when:
- You need Unreal-specific features
- Visual quality is paramount
- You're comfortable with Python scripting
- You can work around MCP limitations

---

## END OF UNREAL WORKFLOW
