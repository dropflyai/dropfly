# Pattern: Offline-First Architecture

## Context

This pattern applies when the application must remain functional without
network connectivity. Mobile devices lose connectivity frequently — in
elevators, subways, airplanes, rural areas, and buildings with poor signal.
Offline-first architecture treats the network as an enhancement, not a
requirement.

---

## Problem

Traditional client-server apps become unusable without network access.
Users see error screens, lose unsaved work, and cannot perform basic tasks.
This creates a poor experience and reduces engagement.

---

## Solution

Make the local database the single source of truth. All reads come from
local storage. All writes go to local storage first, then sync to the
server in the background. The network is used for synchronization, not
for primary data access.

```
┌─────────────────────────────────────────────────────────┐
│                OFFLINE-FIRST ARCHITECTURE                │
│                                                          │
│  User Action                                             │
│  │                                                       │
│  ├──► Write to Local DB (immediate, synchronous feel)   │
│  │                                                       │
│  ├──► Add to Sync Queue                                 │
│  │    { operation, payload, timestamp, retries }        │
│  │                                                       │
│  ├──► Update UI (optimistic, from local DB)             │
│  │                                                       │
│  └──► Sync Worker (background, when network available)  │
│       │                                                  │
│       ├── Process queue FIFO                            │
│       ├── Send to server                                │
│       ├── Handle conflicts                              │
│       ├── Update local DB with server response          │
│       └── Remove from queue on success                  │
│                                                          │
│  Server → Client Sync (periodic or push-triggered)      │
│  │                                                       │
│  ├── Fetch changes since last sync timestamp            │
│  ├── Merge into local DB                                │
│  └── Notify UI of changes                               │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation

### Data Layer (All Platforms)

```typescript
// Repository with offline-first pattern
class TaskRepository {
  constructor(
    private localDb: LocalDatabase,
    private api: TaskApi,
    private syncQueue: SyncQueue,
    private networkMonitor: NetworkMonitor
  ) {}

  // READS: Always from local database
  observeTasks(): Observable<Task[]> {
    return this.localDb.observeTasks();
  }

  // WRITES: Local first, then queue for sync
  async createTask(task: Task): Promise<void> {
    // 1. Generate client-side ID
    const id = generateUUID();
    const taskWithId = { ...task, id, syncStatus: 'pending' };

    // 2. Save to local DB (immediate)
    await this.localDb.insertTask(taskWithId);

    // 3. Queue for server sync
    await this.syncQueue.enqueue({
      operation: 'CREATE',
      entity: 'task',
      payload: taskWithId,
      timestamp: Date.now(),
    });

    // 4. Attempt immediate sync if online
    if (this.networkMonitor.isConnected) {
      this.syncQueue.processNext();
    }
  }

  async updateTask(task: Task): Promise<void> {
    const updated = { ...task, updatedAt: Date.now(), syncStatus: 'pending' };
    await this.localDb.updateTask(updated);
    await this.syncQueue.enqueue({
      operation: 'UPDATE',
      entity: 'task',
      payload: updated,
      timestamp: Date.now(),
    });
  }
}
```

### Sync Queue

```typescript
class SyncQueue {
  private processing = false;

  async enqueue(operation: SyncOperation): Promise<void> {
    await this.localDb.insertSyncOperation(operation);
  }

  async processAll(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      while (true) {
        const next = await this.localDb.getNextPendingOperation();
        if (!next) break;

        try {
          await this.processOperation(next);
          await this.localDb.removeSyncOperation(next.id);
        } catch (error) {
          if (isConflictError(error)) {
            await this.handleConflict(next, error);
          } else if (next.retries < MAX_RETRIES) {
            await this.localDb.incrementRetryCount(next.id);
          } else {
            await this.localDb.markOperationFailed(next.id, error);
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async handleConflict(
    operation: SyncOperation,
    error: ConflictError
  ): Promise<void> {
    // Strategy: Last-write-wins with field-level merge
    const serverVersion = error.serverVersion;
    const clientVersion = operation.payload;

    const merged = mergeVersions(serverVersion, clientVersion);
    await this.localDb.updateTask(merged);
    await this.localDb.removeSyncOperation(operation.id);
  }
}
```

### iOS (SwiftData + Background Sync)

```swift
// Background sync with BGTaskScheduler
func scheduleSync() {
    let request = BGAppRefreshTaskRequest(identifier: "com.app.sync")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
    try? BGTaskScheduler.shared.submit(request)
}

// Network restoration trigger
class NetworkSyncCoordinator {
    private let monitor = NWPathMonitor()

    func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            if path.status == .satisfied {
                Task { await self?.syncManager.processQueue() }
            }
        }
        monitor.start(queue: DispatchQueue(label: "network_monitor"))
    }
}
```

### Android (Room + WorkManager)

```kotlin
// WorkManager for reliable background sync
class SyncWorker(
    context: Context,
    params: WorkerParameters,
    private val syncQueue: SyncQueue,
    private val api: TaskApi
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            syncQueue.processAll()
            Result.success()
        } catch (e: IOException) {
            if (runAttemptCount < 3) Result.retry()
            else Result.failure()
        }
    }
}

// Trigger sync on network restoration
val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    )
    .build()

WorkManager.getInstance(context)
    .enqueueUniqueWork("sync", ExistingWorkPolicy.REPLACE, syncRequest)
```

---

## Trade-offs

### Gains
- App works without network (user delight)
- Faster perceived performance (local reads are instant)
- Reduced network usage (batch sync vs. per-operation requests)
- Resilient to network issues (no lost work)

### Costs
- Increased complexity (sync logic, conflict resolution)
- Storage usage (local database + sync queue)
- Eventual consistency (UI may show stale data briefly)
- Testing complexity (must test online, offline, and transitional states)

---

## Known Pitfalls

1. **ID generation**: Use UUIDs or ULIDs for client-generated IDs. Never
   use auto-increment (collisions across devices).
2. **Timestamp drift**: Device clocks can be wrong. Use server timestamps
   for conflict resolution, not client timestamps.
3. **Queue ordering**: Process operations in order. Out-of-order processing
   can cause invalid states (e.g., update before create).
4. **Storage limits**: Local databases grow. Implement data retention
   policies and periodic cleanup.
5. **Merge conflicts**: Test conflict scenarios explicitly. They will
   happen in production.

---

**Offline is not an error state. It is a design requirement.**
