# Unity Workflow via MCP — Authoritative

Control Unity Editor with natural language through MCP.
Create GameObjects, scenes, and scripts without manual clicking.

---

## Overview

With Unity MCP installed:
- Claude Code sends commands to Unity Editor
- Unity executes and returns results
- You see changes in Unity Scene view
- Build and test games

**Requirement:** Unity must be installed and running with project open.

---

## MCP Setup

### Step 1: Install Unity

Download Unity Hub from [unity.com](https://unity.com/download)

Recommended version: Unity 2022 LTS or newer

### Step 2: Install Unity MCP

**Option A: CoderGamester/mcp-unity (Recommended)**

```bash
# Via Unity Package Manager
1. Open Unity project
2. Window → Package Manager
3. + → Add package from git URL
4. Enter: https://github.com/CoderGamester/mcp-unity.git
```

**Option B: Manual Installation**

```bash
git clone https://github.com/CoderGamester/mcp-unity.git
# Copy to your Unity project's Packages folder
```

### Step 3: Configure the MCP Server

In Unity:
1. Open MCP settings (Window → MCP → Settings)
2. Configure server port (default: 3000)
3. Click "Start Server"

### Step 4: Connect Claude Code

```bash
# Add to Claude Code
claude mcp add unity -- node /path/to/unity-mcp/server.js
```

### Step 5: Verify Connection

In Claude Code:
```
> Create a cube in Unity at position 0,0,0
```

If connected, you'll see a cube appear in Unity.

---

## Capabilities

### What Unity MCP Can Do

```
GAMEOBJECT OPERATIONS:
✓ Create empty GameObjects
✓ Create primitives (Cube, Sphere, etc.)
✓ Instantiate prefabs
✓ Delete GameObjects
✓ Find GameObjects by name/tag
✓ Set parent/child relationships
✓ Enable/disable GameObjects

TRANSFORM:
✓ Set position
✓ Set rotation
✓ Set scale
✓ Get transform values

COMPONENTS:
✓ Add components
✓ Remove components
✓ Get component values
✓ Set component properties
✓ Access common components (Rigidbody, Collider, etc.)

SCRIPTING:
✓ Create C# scripts
✓ Attach scripts to objects
✓ Modify script properties
✓ Access serialized fields

SCENE:
✓ Create new scenes
✓ Load scenes
✓ Save scenes
✓ Query scene hierarchy

ASSETS:
✓ Import assets
✓ Create materials
✓ Create prefabs
✓ Access project assets

BUILD:
✓ Build for platforms
✓ Run in editor
✓ Access build settings
```

### What It Cannot Do (Or Has Limitations)

```
✗ Complex shader editing
✗ Animation state machine setup (via code, yes)
✗ Visual scripting (Bolt/Visual Scripting)
✗ Real-time play mode interaction
✗ Asset store operations
✗ Unity Services configuration
```

---

## Common Workflows

### Workflow 1: Create Simple Scene

```
USER PROMPT:
"Create a simple platformer scene with a player, ground,
and 3 platforms at different heights."

CLAUDE CODE ACTIONS (via MCP):
1. Create plane for ground
2. Scale ground to 20x1x20
3. Create cube, name "Player"
4. Add Rigidbody to Player
5. Add BoxCollider to Player
6. Create 3 cubes as platforms
7. Position platforms at varying heights
8. Add BoxColliders to platforms
9. Create C# PlayerController script
10. Attach script to Player
```

### Workflow 2: Setup Enemy Spawner

```
USER PROMPT:
"Create an enemy spawner that spawns enemies every 3 seconds
at random positions within a 10-unit radius."

CLAUDE CODE ACTIONS (via MCP):
1. Create empty GameObject "EnemySpawner"
2. Create EnemySpawner.cs script
3. Implement spawn logic
4. Create Enemy prefab with basic components
5. Assign prefab to spawner
6. Set spawn interval to 3
7. Set spawn radius to 10
```

### Workflow 3: UI Setup

```
USER PROMPT:
"Create a main menu with Start Game, Options, and Quit buttons."

CLAUDE CODE ACTIONS (via MCP):
1. Create Canvas
2. Set Canvas to Screen Space - Overlay
3. Create Panel as background
4. Create 3 Buttons
5. Position buttons vertically centered
6. Set button text
7. Create MainMenuController.cs
8. Wire up button events
```

---

## Script Templates

### Player Controller

```csharp
// PlayerController.cs - Created via MCP
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    public float moveSpeed = 5f;
    public float jumpForce = 10f;

    [Header("Ground Check")]
    public Transform groundCheck;
    public float groundDistance = 0.4f;
    public LayerMask groundMask;

    private Rigidbody rb;
    private bool isGrounded;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        // Ground check
        isGrounded = Physics.CheckSphere(groundCheck.position, groundDistance, groundMask);

        // Movement input
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        Vector3 move = transform.right * horizontal + transform.forward * vertical;
        transform.position += move * moveSpeed * Time.deltaTime;

        // Jump
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }
    }
}
```

### Enemy AI

```csharp
// EnemyAI.cs - Created via MCP
using UnityEngine;
using UnityEngine.AI;

public class EnemyAI : MonoBehaviour
{
    public Transform target;
    public float detectionRange = 10f;
    public float attackRange = 2f;

    private NavMeshAgent agent;
    private enum State { Idle, Chase, Attack }
    private State currentState = State.Idle;

    void Start()
    {
        agent = GetComponent<NavMeshAgent>();
        if (target == null)
        {
            target = GameObject.FindGameObjectWithTag("Player")?.transform;
        }
    }

    void Update()
    {
        if (target == null) return;

        float distance = Vector3.Distance(transform.position, target.position);

        if (distance <= attackRange)
        {
            currentState = State.Attack;
            agent.isStopped = true;
            Attack();
        }
        else if (distance <= detectionRange)
        {
            currentState = State.Chase;
            agent.isStopped = false;
            agent.SetDestination(target.position);
        }
        else
        {
            currentState = State.Idle;
            agent.isStopped = true;
        }
    }

    void Attack()
    {
        // Attack logic here
        transform.LookAt(target);
    }
}
```

### Game Manager

```csharp
// GameManager.cs - Created via MCP
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Game State")]
    public int score = 0;
    public int lives = 3;
    public bool isGameOver = false;

    [Header("Events")]
    public System.Action<int> OnScoreChanged;
    public System.Action<int> OnLivesChanged;
    public System.Action OnGameOver;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void AddScore(int points)
    {
        score += points;
        OnScoreChanged?.Invoke(score);
    }

    public void LoseLife()
    {
        lives--;
        OnLivesChanged?.Invoke(lives);

        if (lives <= 0)
        {
            GameOver();
        }
    }

    public void GameOver()
    {
        isGameOver = true;
        OnGameOver?.Invoke();
    }

    public void RestartGame()
    {
        score = 0;
        lives = 3;
        isGameOver = false;
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
}
```

---

## Project Structure

### Recommended Folder Structure

```
Assets/
├── _Project/           # Your game-specific assets
│   ├── Scripts/
│   │   ├── Player/
│   │   ├── Enemies/
│   │   ├── Managers/
│   │   └── UI/
│   ├── Prefabs/
│   │   ├── Player/
│   │   ├── Enemies/
│   │   ├── Items/
│   │   └── UI/
│   ├── Scenes/
│   ├── Materials/
│   ├── Textures/
│   ├── Audio/
│   │   ├── Music/
│   │   └── SFX/
│   └── Animations/
├── ThirdParty/         # External assets
└── Resources/          # Runtime-loaded assets
```

### Scene Structure

```
Scene Hierarchy:
├── --- MANAGERS ---
│   ├── GameManager
│   ├── AudioManager
│   └── UIManager
├── --- ENVIRONMENT ---
│   ├── Ground
│   ├── Platforms
│   └── Props
├── --- CHARACTERS ---
│   ├── Player
│   └── Enemies
├── --- UI ---
│   └── Canvas
│       ├── HUD
│       ├── PauseMenu
│       └── GameOverScreen
└── --- LIGHTING ---
    ├── Directional Light
    └── Post Processing Volume
```

---

## Build Settings

### For Windows/Mac/Linux

```csharp
// Build script - via MCP
BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions
{
    scenes = new[] { "Assets/_Project/Scenes/MainMenu.unity",
                     "Assets/_Project/Scenes/Level1.unity" },
    locationPathName = "Builds/Windows/MyGame.exe",
    target = BuildTarget.StandaloneWindows64,
    options = BuildOptions.None
};
BuildPipeline.BuildPlayer(buildPlayerOptions);
```

### For WebGL

```csharp
BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions
{
    scenes = new[] { "Assets/_Project/Scenes/MainMenu.unity" },
    locationPathName = "Builds/WebGL",
    target = BuildTarget.WebGL,
    options = BuildOptions.None
};
// Note: WebGL builds can be deployed to Vercel/Netlify
```

### For Mobile

```csharp
// Android
BuildTarget = BuildTarget.Android;
PlayerSettings.Android.bundleVersionCode = 1;
PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel23;

// iOS
BuildTarget = BuildTarget.iOS;
PlayerSettings.iOS.targetOSVersionString = "13.0";
```

---

## Common Patterns

### Singleton Manager

```csharp
public class SingletonManager<T> : MonoBehaviour where T : MonoBehaviour
{
    private static T _instance;
    public static T Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = FindObjectOfType<T>();
                if (_instance == null)
                {
                    GameObject obj = new GameObject(typeof(T).Name);
                    _instance = obj.AddComponent<T>();
                }
            }
            return _instance;
        }
    }
}
```

### Object Pooling

```csharp
public class ObjectPool : MonoBehaviour
{
    public GameObject prefab;
    public int initialSize = 10;

    private Queue<GameObject> pool = new Queue<GameObject>();

    void Start()
    {
        for (int i = 0; i < initialSize; i++)
        {
            GameObject obj = Instantiate(prefab);
            obj.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public GameObject Get()
    {
        if (pool.Count == 0)
        {
            GameObject obj = Instantiate(prefab);
            return obj;
        }

        GameObject pooledObj = pool.Dequeue();
        pooledObj.SetActive(true);
        return pooledObj;
    }

    public void Return(GameObject obj)
    {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

---

## Troubleshooting

### MCP Not Connecting

```
1. Ensure Unity is running with project open
2. Check MCP server is started (Window → MCP → Start Server)
3. Verify port is not blocked
4. Check firewall settings
5. Restart Unity
```

### Commands Not Executing

```
1. Verify GameObject names match
2. Check scene is in Edit mode, not Play mode
3. Ensure components exist before modifying
4. Check Unity Console for errors
```

### Build Failures

```
1. Check all scenes are in Build Settings
2. Verify no missing script references
3. Check for platform-specific issues
4. Review build logs
```

---

## END OF UNITY WORKFLOW
