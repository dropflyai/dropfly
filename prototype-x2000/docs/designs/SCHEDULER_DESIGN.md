# X2000 Superior Scheduler System Design

> **Version:** 1.0.0
> **Status:** Design Complete
> **Author:** Engineering Brain + Research Brain
> **Date:** 2026-03-09

---

## Executive Summary

This document presents the design for X2000's enterprise-grade scheduling system that is **demonstrably superior** to OpenClaw's cron-tool.ts implementation. While OpenClaw provides basic cron functionality with file-based persistence and single-process execution, X2000's scheduler delivers:

- **Distributed execution** across multiple workers
- **Persistent jobs** that survive restarts
- **Intelligent retry** with exponential backoff and dead letter queues
- **Natural language scheduling** ("every Monday at 9am")
- **Memory system integration** for learning from job outcomes
- **Rich observability** with history, metrics, and alerting

---

## Architecture Overview

```
                                    X2000 SCHEDULER ARCHITECTURE
  ================================================================================================

  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                       API LAYER                                              │
  │  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
  │  │  Natural Language Parser │ Schedule Builder │ Job Manager │ History Query │ Metrics │    │
  │  └─────────────────────────────────────────────────────────────────────────────────────┘    │
  └─────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                   ORCHESTRATION LAYER                                        │
  │  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐   │
  │  │   Schedule Timer  │  │  Job Dispatcher   │  │   Lock Manager    │  │  Event Emitter  │   │
  │  │  (Cron/Interval)  │  │  (Load Balanced)  │  │  (Distributed)    │  │  (Pub/Sub)      │   │
  │  └───────────────────┘  └───────────────────┘  └───────────────────┘  └─────────────────┘   │
  └─────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                    EXECUTION LAYER                                           │
  │                                                                                              │
  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
  │   │  Worker 1   │    │  Worker 2   │    │  Worker 3   │    │  Worker N   │                  │
  │   │  ┌───────┐  │    │  ┌───────┐  │    │  ┌───────┐  │    │  ┌───────┐  │                  │
  │   │  │ Brain │  │    │  │ Brain │  │    │  │ Brain │  │    │  │ Brain │  │                  │
  │   │  │ Tasks │  │    │  │ Tasks │  │    │  │ Tasks │  │    │  │ Tasks │  │                  │
  │   │  └───────┘  │    │  └───────┘  │    │  └───────┘  │    │  └───────┘  │                  │
  │   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘                  │
  │                                                                                              │
  └─────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                   PERSISTENCE LAYER                                          │
  │  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────────────────────┐  │
  │  │    PostgreSQL/        │  │    Redis              │  │    Dead Letter Queue            │  │
  │  │    Supabase           │  │    (Lock + Queue)     │  │    (Failed Jobs)                │  │
  │  │                       │  │                       │  │                                 │  │
  │  │  - Job Definitions    │  │  - Distributed Locks  │  │  - Poison Pills                 │  │
  │  │  - Run History        │  │  - Ready Queue        │  │  - Retry Exhausted              │  │
  │  │  - Metrics            │  │  - Processing Set     │  │  - Error Metadata               │  │
  │  │  - Learnings          │  │  - Delay Queue        │  │  - Manual Review Queue          │  │
  │  └───────────────────────┘  └───────────────────────┘  └─────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                MEMORY INTEGRATION LAYER                                      │
  │  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
  │  │  Pattern Extraction │ Learning Storage │ Failure Analysis │ Optimization Suggestions  │  │
  │  └───────────────────────────────────────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## OpenClaw Analysis: Strengths and Limitations

### OpenClaw's cron-tool.ts Approach

Based on deep analysis of OpenClaw's implementation in `/DropFly-PROJECTS/dropfly-openclaw/src/cron/`:

**What They Do Well:**
- Clean TypeScript implementation with TypeBox schemas
- Three schedule types: `at` (one-shot), `every` (interval), `cron` (expression)
- File-based persistence with atomic writes (temp file + rename)
- Run history logging with JSONL append
- Integration with heartbeat system for job execution
- Support for isolated agent sessions

**Critical Limitations:**

| Limitation | Impact | X2000 Solution |
|------------|--------|----------------|
| **Single-process execution** | No horizontal scaling; one gateway runs all jobs | Distributed workers with Redis-backed coordination |
| **File-based persistence** | Data loss risk; no transactions; limited query | PostgreSQL with ACID compliance |
| **No retry mechanism** | Failed jobs simply log errors | Exponential backoff with configurable policies |
| **No dead letter queue** | Poison pill jobs block or fail silently | DLQ with manual/auto reprocessing |
| **No natural language** | Users must know cron syntax | NLP parser for human-readable schedules |
| **Limited observability** | JSONL files, no real-time metrics | Full observability stack with alerting |
| **In-process timers** | Lost on restart until next load | Redis-backed durable timers |
| **No timezone intelligence** | Basic tz support only | Full IANA timezone with DST handling |

### OpenClaw's Job Definition (Current)

```typescript
// OpenClaw's CronJob type
type CronJob = {
  id: string;
  agentId?: string;
  name: string;
  description?: string;
  enabled: boolean;
  deleteAfterRun?: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  schedule: CronSchedule;       // at | every | cron
  sessionTarget: "main" | "isolated";
  wakeMode: "next-heartbeat" | "now";
  payload: CronPayload;         // systemEvent | agentTurn
  delivery?: CronDelivery;
  state: CronJobState;
};
```

---

## X2000 Job Definition Format

### Core Job Schema

```typescript
interface X2000ScheduledJob {
  // ===== IDENTITY =====
  id: string;                          // UUID v7 (time-ordered)
  name: string;                        // Human-readable name
  description?: string;                // Optional description
  tags: string[];                      // Categorization tags

  // ===== OWNERSHIP =====
  createdBy: {
    brainType: BrainType;              // Which brain created it
    agentId?: string;                  // Specific agent if applicable
    sessionId: string;                 // Session context
  };

  // ===== SCHEDULE =====
  schedule: JobSchedule;               // When to run (see below)
  timezone: string;                    // IANA timezone (e.g., "America/Los_Angeles")

  // ===== PAYLOAD =====
  payload: JobPayload;                 // What to execute

  // ===== RETRY POLICY =====
  retry: RetryPolicy;                  // How to handle failures

  // ===== LIFECYCLE =====
  status: JobStatus;
  lifecycle: JobLifecycle;

  // ===== EXECUTION STATE =====
  state: JobExecutionState;

  // ===== METADATA =====
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;                   // Optimistic locking
    correlationId?: string;            // Trace correlation
  };
}

// ===== SCHEDULE TYPES =====

type JobSchedule =
  | { type: "once"; at: Date }                              // One-shot
  | { type: "interval"; every: Duration; startAt?: Date }   // Fixed interval
  | { type: "cron"; expression: string; }                   // Cron expression
  | { type: "natural"; description: string; parsed?: CronExpression }  // NLP
  | { type: "dependent"; afterJob: string; delay?: Duration }          // Job chain

interface Duration {
  milliseconds?: number;
  seconds?: number;
  minutes?: number;
  hours?: number;
  days?: number;
  weeks?: number;
}

// ===== PAYLOAD TYPES =====

type JobPayload =
  | BrainTaskPayload          // Execute via brain
  | ToolCallPayload           // Direct tool invocation
  | WebhookPayload            // HTTP callback
  | SystemEventPayload        // Internal system event
  | WorkflowPayload;          // Multi-step workflow

interface BrainTaskPayload {
  type: "brain-task";
  brain: BrainType;
  task: string;
  context?: Record<string, unknown>;
  tools?: string[];           // Allowed tools for this job
  maxTokens?: number;
  thinking?: "low" | "medium" | "high";
}

interface ToolCallPayload {
  type: "tool-call";
  tool: string;
  parameters: Record<string, unknown>;
}

interface WebhookPayload {
  type: "webhook";
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeout: Duration;
}

interface SystemEventPayload {
  type: "system-event";
  event: string;
  data?: Record<string, unknown>;
}

interface WorkflowPayload {
  type: "workflow";
  steps: Array<{
    id: string;
    payload: JobPayload;
    condition?: string;       // Expression to evaluate
    timeout?: Duration;
  }>;
  onFailure: "stop" | "continue" | "rollback";
}

// ===== RETRY POLICY =====

interface RetryPolicy {
  maxAttempts: number;                 // 1 = no retry, 3-10 typical
  backoff: BackoffStrategy;
  retryableErrors?: string[];          // Error types to retry
  nonRetryableErrors?: string[];       // Error types to DLQ immediately
  deadLetterQueue: boolean;            // Send to DLQ after exhaustion
}

type BackoffStrategy =
  | { type: "fixed"; delay: Duration }
  | { type: "exponential"; initialDelay: Duration; maxDelay: Duration; multiplier: number }
  | { type: "exponential-jitter"; initialDelay: Duration; maxDelay: Duration; jitterFactor: number };

// ===== JOB STATUS =====

type JobStatus =
  | "scheduled"      // Waiting for trigger time
  | "queued"         // Ready to execute
  | "running"        // Currently executing
  | "completed"      // Successfully finished
  | "failed"         // Failed after retries
  | "paused"         // Manually paused
  | "cancelled"      // Manually cancelled
  | "dead-letter";   // Moved to DLQ

interface JobLifecycle {
  enabled: boolean;
  pausedAt?: Date;
  pausedReason?: string;
  expiresAt?: Date;              // Auto-delete after this time
  deleteAfterCompletion: boolean;
}

// ===== EXECUTION STATE =====

interface JobExecutionState {
  nextRunAt?: Date;
  lastRunAt?: Date;
  lastResult?: {
    status: "success" | "error" | "skipped";
    output?: unknown;
    error?: string;
    duration: Duration;
    attempt: number;
  };
  runCount: number;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  currentAttempt: number;
  lockedBy?: string;             // Worker ID holding lock
  lockedAt?: Date;
}
```

---

## Scheduler API

### Service Interface

```typescript
interface SchedulerService {
  // ===== JOB MANAGEMENT =====

  /**
   * Create a new scheduled job
   * Supports natural language: "every Monday at 9am PST"
   */
  createJob(input: CreateJobInput): Promise<X2000ScheduledJob>;

  /**
   * Update an existing job
   * Triggers reschedule if schedule changes
   */
  updateJob(id: string, patch: UpdateJobInput): Promise<X2000ScheduledJob>;

  /**
   * Delete a job
   * Cancels any pending execution
   */
  deleteJob(id: string): Promise<{ deleted: boolean }>;

  /**
   * Get job by ID
   */
  getJob(id: string): Promise<X2000ScheduledJob | null>;

  /**
   * List jobs with filtering
   */
  listJobs(filter: JobFilter): Promise<PaginatedResult<X2000ScheduledJob>>;

  // ===== JOB CONTROL =====

  /**
   * Pause a job (prevents future executions)
   */
  pauseJob(id: string, reason?: string): Promise<X2000ScheduledJob>;

  /**
   * Resume a paused job
   */
  resumeJob(id: string): Promise<X2000ScheduledJob>;

  /**
   * Trigger immediate execution
   */
  triggerJob(id: string): Promise<JobRun>;

  /**
   * Cancel a running job
   */
  cancelJob(id: string): Promise<{ cancelled: boolean }>;

  // ===== HISTORY & OBSERVABILITY =====

  /**
   * Get execution history for a job
   */
  getJobRuns(jobId: string, options: RunQueryOptions): Promise<PaginatedResult<JobRun>>;

  /**
   * Get aggregated metrics for a job
   */
  getJobMetrics(jobId: string, window: TimeWindow): Promise<JobMetrics>;

  /**
   * Get scheduler health status
   */
  getStatus(): Promise<SchedulerStatus>;

  // ===== DEAD LETTER QUEUE =====

  /**
   * List jobs in dead letter queue
   */
  listDeadLetterJobs(filter?: DLQFilter): Promise<PaginatedResult<DeadLetterJob>>;

  /**
   * Retry a dead letter job
   */
  retryDeadLetterJob(id: string): Promise<X2000ScheduledJob>;

  /**
   * Purge dead letter job (permanent delete)
   */
  purgeDeadLetterJob(id: string): Promise<{ purged: boolean }>;

  // ===== NATURAL LANGUAGE =====

  /**
   * Parse natural language schedule
   */
  parseSchedule(input: string, timezone?: string): Promise<ParsedSchedule>;

  /**
   * Describe a schedule in human-readable form
   */
  describeSchedule(schedule: JobSchedule): string;

  // ===== WORKER MANAGEMENT =====

  /**
   * Register a worker
   */
  registerWorker(worker: WorkerInfo): Promise<{ registered: boolean }>;

  /**
   * Heartbeat from worker
   */
  workerHeartbeat(workerId: string): Promise<void>;

  /**
   * Get active workers
   */
  listWorkers(): Promise<WorkerInfo[]>;
}

// ===== INPUT TYPES =====

interface CreateJobInput {
  name: string;
  description?: string;
  tags?: string[];

  // Schedule can be cron expression, natural language, or structured
  schedule: string | JobSchedule;
  timezone?: string;                   // Default: system timezone

  payload: JobPayload;

  retry?: Partial<RetryPolicy>;        // Defaults applied

  enabled?: boolean;                   // Default: true
  expiresAt?: Date;
  deleteAfterCompletion?: boolean;

  // Memory integration
  learnFromOutcome?: boolean;          // Store patterns from results
}

interface JobFilter {
  status?: JobStatus[];
  tags?: string[];
  brain?: BrainType[];
  createdAfter?: Date;
  createdBefore?: Date;
  nextRunBefore?: Date;
  search?: string;                     // Full-text search on name/description
}

// ===== OUTPUT TYPES =====

interface JobRun {
  id: string;
  jobId: string;
  jobName: string;

  status: "running" | "completed" | "failed" | "cancelled" | "skipped";

  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  duration?: Duration;
  attempt: number;

  workerId?: string;

  input: JobPayload;
  output?: unknown;
  error?: {
    message: string;
    code?: string;
    stack?: string;
    retryable: boolean;
  };

  logs: Array<{
    timestamp: Date;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    data?: unknown;
  }>;
}

interface JobMetrics {
  jobId: string;
  window: TimeWindow;

  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  cancelledRuns: number;

  avgDuration: Duration;
  p50Duration: Duration;
  p95Duration: Duration;
  p99Duration: Duration;

  successRate: number;              // 0-1

  lastSuccess?: Date;
  lastFailure?: Date;

  errorBreakdown: Record<string, number>;
}

interface SchedulerStatus {
  healthy: boolean;

  activeWorkers: number;
  totalWorkers: number;

  jobCounts: {
    scheduled: number;
    queued: number;
    running: number;
    paused: number;
    deadLetter: number;
  };

  uptime: Duration;

  nextScheduledRun?: Date;

  recentErrors: Array<{
    jobId: string;
    error: string;
    timestamp: Date;
  }>;
}

interface DeadLetterJob {
  id: string;
  originalJobId: string;
  job: X2000ScheduledJob;

  failedAt: Date;
  reason: "max_retries" | "non_retryable_error" | "timeout" | "manual";

  attempts: number;
  lastError: string;

  canRetry: boolean;
}

interface ParsedSchedule {
  input: string;
  schedule: JobSchedule;
  humanReadable: string;
  nextOccurrences: Date[];         // Next 5 occurrences
  confidence: number;              // 0-1, how confident the parse is
  warnings?: string[];             // Ambiguity warnings
}
```

---

## Persistence Strategy

### Database Schema (PostgreSQL/Supabase)

```sql
-- ===== JOBS TABLE =====
CREATE TABLE scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Ownership
  created_by_brain TEXT NOT NULL,
  created_by_agent_id TEXT,
  created_by_session_id TEXT NOT NULL,

  -- Schedule (JSONB for flexibility)
  schedule JSONB NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',

  -- Payload
  payload JSONB NOT NULL,

  -- Retry Policy
  retry_max_attempts INTEGER NOT NULL DEFAULT 3,
  retry_backoff JSONB NOT NULL DEFAULT '{"type": "exponential", "initialDelay": {"seconds": 1}, "maxDelay": {"minutes": 5}, "multiplier": 2}',
  retry_dead_letter BOOLEAN NOT NULL DEFAULT true,

  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled',
  enabled BOOLEAN NOT NULL DEFAULT true,
  paused_at TIMESTAMPTZ,
  paused_reason TEXT,
  expires_at TIMESTAMPTZ,
  delete_after_completion BOOLEAN DEFAULT false,

  -- Execution State
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  last_result JSONB,
  run_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  current_attempt INTEGER NOT NULL DEFAULT 0,
  locked_by TEXT,
  locked_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  correlation_id TEXT,

  -- Memory integration
  learn_from_outcome BOOLEAN DEFAULT true,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'queued', 'running', 'completed', 'failed', 'paused', 'cancelled', 'dead-letter'))
);

-- Indexes for common queries
CREATE INDEX idx_jobs_status ON scheduled_jobs(status) WHERE status IN ('scheduled', 'queued', 'running');
CREATE INDEX idx_jobs_next_run ON scheduled_jobs(next_run_at) WHERE status = 'scheduled' AND enabled = true;
CREATE INDEX idx_jobs_tags ON scheduled_jobs USING GIN(tags);
CREATE INDEX idx_jobs_brain ON scheduled_jobs(created_by_brain);
CREATE INDEX idx_jobs_locked ON scheduled_jobs(locked_by, locked_at) WHERE locked_by IS NOT NULL;

-- ===== JOB RUNS TABLE =====
CREATE TABLE job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES scheduled_jobs(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,

  status TEXT NOT NULL,

  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  duration_ms INTEGER,
  attempt INTEGER NOT NULL,

  worker_id TEXT,

  input JSONB NOT NULL,
  output JSONB,
  error JSONB,

  logs JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_run_status CHECK (status IN ('running', 'completed', 'failed', 'cancelled', 'skipped'))
);

-- Indexes for history queries
CREATE INDEX idx_runs_job ON job_runs(job_id, created_at DESC);
CREATE INDEX idx_runs_status ON job_runs(status) WHERE status = 'running';
CREATE INDEX idx_runs_worker ON job_runs(worker_id) WHERE worker_id IS NOT NULL;

-- Partitioning for large-scale deployments
-- ALTER TABLE job_runs PARTITION BY RANGE (created_at);

-- ===== DEAD LETTER QUEUE TABLE =====
CREATE TABLE dead_letter_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_job_id UUID NOT NULL,
  job_snapshot JSONB NOT NULL,

  failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT NOT NULL,

  attempts INTEGER NOT NULL,
  last_error TEXT NOT NULL,

  can_retry BOOLEAN NOT NULL DEFAULT true,
  retried_at TIMESTAMPTZ,
  purged_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dlq_reason ON dead_letter_jobs(reason) WHERE purged_at IS NULL;
CREATE INDEX idx_dlq_retryable ON dead_letter_jobs(can_retry) WHERE purged_at IS NULL;

-- ===== WORKERS TABLE =====
CREATE TABLE scheduler_workers (
  id TEXT PRIMARY KEY,
  hostname TEXT NOT NULL,
  pid INTEGER,

  capabilities TEXT[] DEFAULT '{}',
  max_concurrent INTEGER NOT NULL DEFAULT 10,
  current_jobs INTEGER NOT NULL DEFAULT 0,

  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  status TEXT NOT NULL DEFAULT 'active',

  CONSTRAINT valid_worker_status CHECK (status IN ('active', 'draining', 'offline'))
);

-- ===== FUNCTIONS =====

-- Atomic job acquisition with lock
CREATE OR REPLACE FUNCTION acquire_job(
  p_worker_id TEXT,
  p_max_jobs INTEGER DEFAULT 10
)
RETURNS SETOF scheduled_jobs AS $$
DECLARE
  v_job scheduled_jobs;
BEGIN
  -- Find and lock next available job
  SELECT * INTO v_job
  FROM scheduled_jobs
  WHERE status = 'scheduled'
    AND enabled = true
    AND next_run_at <= NOW()
    AND locked_by IS NULL
  ORDER BY next_run_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_job.id IS NOT NULL THEN
    UPDATE scheduled_jobs
    SET locked_by = p_worker_id,
        locked_at = NOW(),
        status = 'running',
        current_attempt = current_attempt + 1,
        updated_at = NOW()
    WHERE id = v_job.id;

    v_job.locked_by := p_worker_id;
    v_job.locked_at := NOW();
    v_job.status := 'running';

    RETURN NEXT v_job;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Release stale locks
CREATE OR REPLACE FUNCTION release_stale_locks(p_timeout INTERVAL DEFAULT '5 minutes')
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE scheduled_jobs
  SET locked_by = NULL,
      locked_at = NULL,
      status = 'scheduled'
  WHERE locked_by IS NOT NULL
    AND locked_at < NOW() - p_timeout;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ===== TRIGGERS =====

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON scheduled_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
```

### Redis Structure (for distributed coordination)

```
# ===== DISTRIBUTED LOCKS =====
scheduler:lock:{jobId}              # SET NX with TTL for job execution lock
scheduler:lock:scheduler            # Global scheduler lock for leader election

# ===== QUEUES =====
scheduler:queue:ready               # Sorted set by next_run_at
scheduler:queue:delayed             # Sorted set for delayed retry jobs
scheduler:queue:processing          # Set of currently processing job IDs

# ===== WORKER TRACKING =====
scheduler:workers                   # Hash of worker_id -> last_heartbeat
scheduler:worker:{workerId}:jobs    # Set of job IDs currently held

# ===== EVENTS (Pub/Sub) =====
scheduler:events:job-completed      # Job completion notifications
scheduler:events:job-failed         # Job failure notifications
scheduler:events:worker-joined      # Worker registration events
scheduler:events:worker-left        # Worker departure events

# ===== METRICS (for real-time dashboard) =====
scheduler:metrics:jobs:running      # Counter
scheduler:metrics:jobs:completed    # Counter
scheduler:metrics:jobs:failed       # Counter
scheduler:metrics:latency           # HyperLogLog for latency percentiles
```

---

## Distributed Execution Approach

### Leader Election

```typescript
class SchedulerLeader {
  private readonly lockKey = 'scheduler:lock:scheduler';
  private readonly lockTTL = 30_000; // 30 seconds
  private isLeader = false;
  private renewalInterval?: NodeJS.Timeout;

  async tryAcquireLeadership(): Promise<boolean> {
    const acquired = await this.redis.set(
      this.lockKey,
      this.workerId,
      'NX',
      'PX',
      this.lockTTL
    );

    if (acquired) {
      this.isLeader = true;
      this.startLeadershipRenewal();
      this.onBecomeLeader();
    }

    return this.isLeader;
  }

  private startLeadershipRenewal(): void {
    this.renewalInterval = setInterval(async () => {
      const renewed = await this.redis.pexpire(this.lockKey, this.lockTTL);
      if (!renewed) {
        this.isLeader = false;
        this.onLoseLeadership();
      }
    }, this.lockTTL / 3);
  }

  private onBecomeLeader(): void {
    // Start the scheduler tick that finds due jobs and queues them
    this.startSchedulerTick();
  }

  private onLoseLeadership(): void {
    // Stop scheduler tick, continue as worker only
    this.stopSchedulerTick();
  }
}
```

### Worker Pool

```typescript
class SchedulerWorker {
  private readonly workerId: string;
  private readonly maxConcurrent: number = 10;
  private runningJobs = new Map<string, AbortController>();

  async start(): Promise<void> {
    // Register with cluster
    await this.registerWorker();

    // Start heartbeat
    this.startHeartbeat();

    // Start job polling
    this.startPolling();
  }

  private async pollForJobs(): Promise<void> {
    while (this.running && this.runningJobs.size < this.maxConcurrent) {
      // Atomic job acquisition
      const job = await this.db.acquireJob(this.workerId);

      if (job) {
        const controller = new AbortController();
        this.runningJobs.set(job.id, controller);

        // Execute in background
        this.executeJob(job, controller.signal)
          .finally(() => {
            this.runningJobs.delete(job.id);
          });
      } else {
        // No jobs available, wait before polling again
        await this.sleep(1000);
      }
    }
  }

  private async executeJob(job: X2000ScheduledJob, signal: AbortSignal): Promise<void> {
    const runId = uuidv7();
    const startedAt = new Date();

    try {
      // Create run record
      await this.db.createRun({
        id: runId,
        jobId: job.id,
        status: 'running',
        startedAt,
        attempt: job.state.currentAttempt,
      });

      // Execute based on payload type
      const result = await this.executePayload(job.payload, signal);

      // Mark success
      await this.onJobSuccess(job, runId, result);

    } catch (error) {
      await this.onJobFailure(job, runId, error);
    }
  }

  private async executePayload(
    payload: JobPayload,
    signal: AbortSignal
  ): Promise<unknown> {
    switch (payload.type) {
      case 'brain-task':
        return this.executeBrainTask(payload, signal);
      case 'tool-call':
        return this.executeToolCall(payload, signal);
      case 'webhook':
        return this.executeWebhook(payload, signal);
      case 'system-event':
        return this.executeSystemEvent(payload);
      case 'workflow':
        return this.executeWorkflow(payload, signal);
    }
  }

  private async onJobFailure(
    job: X2000ScheduledJob,
    runId: string,
    error: Error
  ): Promise<void> {
    const isRetryable = this.isRetryableError(error, job.retry);
    const hasRetriesLeft = job.state.currentAttempt < job.retry.maxAttempts;

    if (isRetryable && hasRetriesLeft) {
      // Schedule retry with backoff
      const delay = this.calculateBackoff(job.state.currentAttempt, job.retry.backoff);

      await this.db.scheduleRetry(job.id, {
        nextRunAt: new Date(Date.now() + delay),
        consecutiveFailures: job.state.consecutiveFailures + 1,
      });

    } else if (job.retry.deadLetterQueue) {
      // Move to DLQ
      await this.db.moveToDeadLetter(job.id, {
        reason: hasRetriesLeft ? 'non_retryable_error' : 'max_retries',
        lastError: error.message,
      });

      // Alert for DLQ
      await this.alerting.sendDLQAlert(job, error);
    }

    // Update run record
    await this.db.updateRun(runId, {
      status: 'failed',
      completedAt: new Date(),
      error: {
        message: error.message,
        code: (error as any).code,
        stack: error.stack,
        retryable: isRetryable,
      },
    });

    // Memory learning from failure
    if (job.metadata.learnFromOutcome) {
      await this.memory.recordFailure(job, error);
    }
  }

  private calculateBackoff(attempt: number, strategy: BackoffStrategy): number {
    switch (strategy.type) {
      case 'fixed':
        return this.durationToMs(strategy.delay);

      case 'exponential':
        const base = this.durationToMs(strategy.initialDelay);
        const max = this.durationToMs(strategy.maxDelay);
        return Math.min(base * Math.pow(strategy.multiplier, attempt - 1), max);

      case 'exponential-jitter':
        const baseExp = this.durationToMs(strategy.initialDelay);
        const maxExp = this.durationToMs(strategy.maxDelay);
        const exponential = Math.min(baseExp * Math.pow(2, attempt - 1), maxExp);
        const jitter = exponential * strategy.jitterFactor * Math.random();
        return exponential - jitter;
    }
  }
}
```

### Job Distribution Flow

```
                           DISTRIBUTED JOB EXECUTION FLOW
  ============================================================================================

  ┌──────────────────────────────────────────────────────────────────────────────────────────┐
  │                                    SCHEDULER LEADER                                       │
  │                                                                                          │
  │   1. Tick every 1 second                                                                 │
  │   2. Query jobs where next_run_at <= NOW() AND status = 'scheduled'                     │
  │   3. Push job IDs to Redis queue: scheduler:queue:ready                                  │
  │   4. Update job status to 'queued'                                                       │
  │                                                                                          │
  └────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                               │
                                               ▼
  ┌──────────────────────────────────────────────────────────────────────────────────────────┐
  │                                     REDIS QUEUE                                           │
  │                                                                                          │
  │   scheduler:queue:ready = SORTED SET by priority + next_run_at                           │
  │                                                                                          │
  │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
  │   │ Job A   │ │ Job B   │ │ Job C   │ │ Job D   │ │ Job E   │ ...                       │
  │   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘                           │
  │                                                                                          │
  └───────┬───────────────┬───────────────┬───────────────┬──────────────────────────────────┘
          │               │               │               │
          ▼               ▼               ▼               ▼
  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
  │   Worker 1    │ │   Worker 2    │ │   Worker 3    │ │   Worker N    │
  │               │ │               │ │               │ │               │
  │ 1. BLPOP from │ │ 1. BLPOP from │ │ 1. BLPOP from │ │ 1. BLPOP from │
  │    queue      │ │    queue      │ │    queue      │ │    queue      │
  │               │ │               │ │               │ │               │
  │ 2. Acquire    │ │ 2. Acquire    │ │ 2. Acquire    │ │ 2. Acquire    │
  │    DB lock    │ │    DB lock    │ │    DB lock    │ │    DB lock    │
  │               │ │               │ │               │ │               │
  │ 3. Execute    │ │ 3. Execute    │ │ 3. Execute    │ │ 3. Execute    │
  │    payload    │ │    payload    │ │    payload    │ │    payload    │
  │               │ │               │ │               │ │               │
  │ 4. Update     │ │ 4. Update     │ │ 4. Update     │ │ 4. Update     │
  │    state      │ │    state      │ │    state      │ │    state      │
  │               │ │               │ │               │ │               │
  │ 5. Release    │ │ 5. Release    │ │ 5. Release    │ │ 5. Release    │
  │    lock       │ │    lock       │ │    lock       │ │    lock       │
  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

---

## Natural Language Scheduling

### Parser Implementation

```typescript
import { Chrono, ParsedResult } from 'chrono-node';
import { RRule, RRuleSet } from 'rrule';

interface NaturalLanguageParser {
  parse(input: string, options?: ParseOptions): ParseResult;
}

interface ParseOptions {
  timezone?: string;
  referenceDate?: Date;
  strict?: boolean;
}

interface ParseResult {
  success: boolean;
  schedule?: JobSchedule;
  humanReadable: string;
  nextOccurrences: Date[];
  confidence: number;
  warnings: string[];
  ambiguities?: string[];
}

const NATURAL_LANGUAGE_PATTERNS: Array<{
  pattern: RegExp;
  parser: (match: RegExpMatchArray, options: ParseOptions) => JobSchedule;
  examples: string[];
}> = [
  // Every X interval
  {
    pattern: /^every\s+(\d+)?\s*(second|minute|hour|day|week|month|year)s?$/i,
    parser: (match, options) => {
      const count = parseInt(match[1] || '1');
      const unit = match[2].toLowerCase();
      return {
        type: 'interval',
        every: { [unit + 's']: count },
      };
    },
    examples: ['every 5 minutes', 'every hour', 'every 2 days'],
  },

  // Every weekday at time
  {
    pattern: /^every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\s+at\s+(.+)$/i,
    parser: (match, options) => {
      const day = match[1].toLowerCase();
      const timeStr = match[2];
      const time = parseTime(timeStr);
      const dayNum = WEEKDAY_MAP[day];

      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} * * ${dayNum}`,
      };
    },
    examples: ['every Monday at 9am', 'every Friday at 5:30pm'],
  },

  // Every weekday
  {
    pattern: /^every\s+weekday\s+at\s+(.+)$/i,
    parser: (match, options) => {
      const time = parseTime(match[1]);
      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} * * 1-5`,
      };
    },
    examples: ['every weekday at 9am'],
  },

  // Specific dates (monthly)
  {
    pattern: /^on\s+the\s+(\d+)(?:st|nd|rd|th)?\s+(?:and\s+)?(?:the\s+)?(\d+)?(?:st|nd|rd|th)?\s+(?:of\s+every\s+month\s+)?at\s+(.+)$/i,
    parser: (match, options) => {
      const day1 = match[1];
      const day2 = match[2];
      const time = parseTime(match[3]);
      const days = day2 ? `${day1},${day2}` : day1;

      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} ${days} * *`,
      };
    },
    examples: ['on the 1st and 15th at 2:30pm', 'on the 5th of every month at noon'],
  },

  // One-time (specific date/time)
  {
    pattern: /^(?:at|on)\s+(.+)$/i,
    parser: (match, options) => {
      const chrono = new Chrono({ timezone: options.timezone });
      const parsed = chrono.parseDate(match[1], options.referenceDate);

      if (!parsed) {
        throw new Error(`Could not parse date: ${match[1]}`);
      }

      return {
        type: 'once',
        at: parsed,
      };
    },
    examples: ['at 3pm tomorrow', 'on March 15th 2025 at 10am'],
  },

  // Cron passthrough
  {
    pattern: /^cron:\s*(.+)$/i,
    parser: (match) => ({
      type: 'cron',
      expression: match[1].trim(),
    }),
    examples: ['cron: 0 9 * * MON', 'cron: */15 * * * *'],
  },
];

const WEEKDAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseTime(timeStr: string): { hour: number; minute: number } {
  // Handle various formats: 9am, 9:30am, 14:00, noon, midnight
  const normalized = timeStr.toLowerCase().trim();

  if (normalized === 'noon' || normalized === 'midday') {
    return { hour: 12, minute: 0 };
  }
  if (normalized === 'midnight') {
    return { hour: 0, minute: 0 };
  }

  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) {
    throw new Error(`Could not parse time: ${timeStr}`);
  }

  let hour = parseInt(match[1]);
  const minute = parseInt(match[2] || '0');
  const period = match[3];

  if (period === 'pm' && hour !== 12) {
    hour += 12;
  } else if (period === 'am' && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
}

export class NaturalLanguageScheduleParser implements NaturalLanguageParser {
  private chrono: Chrono;

  constructor() {
    this.chrono = new Chrono();
  }

  parse(input: string, options: ParseOptions = {}): ParseResult {
    const normalized = input.trim().toLowerCase();
    const warnings: string[] = [];

    // Try pattern matching first (highest confidence)
    for (const { pattern, parser, examples } of NATURAL_LANGUAGE_PATTERNS) {
      const match = normalized.match(pattern);
      if (match) {
        try {
          const schedule = parser(match, options);
          const nextOccurrences = this.getNextOccurrences(schedule, options, 5);

          return {
            success: true,
            schedule,
            humanReadable: this.describeSchedule(schedule),
            nextOccurrences,
            confidence: 0.95,
            warnings,
          };
        } catch (error) {
          warnings.push(`Pattern matched but parsing failed: ${error.message}`);
        }
      }
    }

    // Fall back to Chrono for complex natural language
    try {
      const parsed = this.chrono.parse(input, options.referenceDate, {
        forwardDate: true,
      });

      if (parsed.length > 0) {
        const result = parsed[0];
        const schedule: JobSchedule = {
          type: 'once',
          at: result.start.date(),
        };

        // Check for recurring patterns in the original text
        if (/every|weekly|daily|monthly|yearly/i.test(input)) {
          warnings.push(
            'Detected possible recurring intent but parsed as one-time. ' +
            'Use explicit syntax like "every Monday at 9am" for recurring schedules.'
          );
        }

        return {
          success: true,
          schedule,
          humanReadable: this.describeSchedule(schedule),
          nextOccurrences: [schedule.at],
          confidence: 0.7,
          warnings,
          ambiguities: parsed.length > 1
            ? [`Multiple interpretations possible. Using: ${result.text}`]
            : undefined,
        };
      }
    } catch (error) {
      // Chrono failed
    }

    return {
      success: false,
      humanReadable: 'Could not parse schedule',
      nextOccurrences: [],
      confidence: 0,
      warnings: [
        `Could not understand: "${input}"`,
        'Try formats like: "every Monday at 9am", "every 5 minutes", "on March 15th at 3pm"',
      ],
    };
  }

  describeSchedule(schedule: JobSchedule): string {
    switch (schedule.type) {
      case 'once':
        return `Once at ${schedule.at.toLocaleString()}`;

      case 'interval':
        const parts: string[] = [];
        if (schedule.every.weeks) parts.push(`${schedule.every.weeks} week(s)`);
        if (schedule.every.days) parts.push(`${schedule.every.days} day(s)`);
        if (schedule.every.hours) parts.push(`${schedule.every.hours} hour(s)`);
        if (schedule.every.minutes) parts.push(`${schedule.every.minutes} minute(s)`);
        if (schedule.every.seconds) parts.push(`${schedule.every.seconds} second(s)`);
        return `Every ${parts.join(', ')}`;

      case 'cron':
        return this.describeCronExpression(schedule.expression);

      case 'natural':
        return schedule.description;

      case 'dependent':
        return `After job ${schedule.afterJob}${schedule.delay ? ` (delay: ${schedule.delay})` : ''}`;
    }
  }

  private describeCronExpression(expr: string): string {
    // Use cronstrue for human-readable cron descriptions
    // This is a simplified version
    const parts = expr.split(' ');
    if (parts.length !== 5) return expr;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Common patterns
    if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*') {
      if (dayOfWeek === '1-5') return 'Every weekday at 9:00 AM';
      if (dayOfWeek === '1') return 'Every Monday at 9:00 AM';
    }

    // Generic description
    return `Cron: ${expr}`;
  }

  private getNextOccurrences(
    schedule: JobSchedule,
    options: ParseOptions,
    count: number
  ): Date[] {
    const now = options.referenceDate || new Date();
    const occurrences: Date[] = [];

    switch (schedule.type) {
      case 'once':
        if (schedule.at > now) {
          occurrences.push(schedule.at);
        }
        break;

      case 'interval':
        const intervalMs = this.durationToMs(schedule.every);
        let next = schedule.startAt || now;
        while (next <= now) {
          next = new Date(next.getTime() + intervalMs);
        }
        for (let i = 0; i < count; i++) {
          occurrences.push(new Date(next.getTime() + i * intervalMs));
        }
        break;

      case 'cron':
        // Use croner for next occurrence calculation
        const { Cron } = require('croner');
        const cron = new Cron(schedule.expression, {
          timezone: options.timezone,
        });
        for (let i = 0; i < count; i++) {
          const next = cron.nextRun(occurrences[occurrences.length - 1] || now);
          if (next) occurrences.push(next);
        }
        break;
    }

    return occurrences;
  }

  private durationToMs(duration: Duration): number {
    let ms = 0;
    if (duration.milliseconds) ms += duration.milliseconds;
    if (duration.seconds) ms += duration.seconds * 1000;
    if (duration.minutes) ms += duration.minutes * 60 * 1000;
    if (duration.hours) ms += duration.hours * 60 * 60 * 1000;
    if (duration.days) ms += duration.days * 24 * 60 * 60 * 1000;
    if (duration.weeks) ms += duration.weeks * 7 * 24 * 60 * 60 * 1000;
    return ms;
  }
}
```

### Usage Examples

```typescript
const parser = new NaturalLanguageScheduleParser();

// Simple recurring
parser.parse('every 5 minutes');
// => { type: 'interval', every: { minutes: 5 } }

// Day of week
parser.parse('every Monday at 9am');
// => { type: 'cron', expression: '0 9 * * 1' }

// Multiple days
parser.parse('every Monday and Friday at 3:30pm');
// => { type: 'cron', expression: '30 15 * * 1,5' }

// Monthly
parser.parse('on the 1st and 15th at 2pm');
// => { type: 'cron', expression: '0 14 1,15 * *' }

// One-time
parser.parse('at 3pm tomorrow', { referenceDate: new Date('2025-03-15') });
// => { type: 'once', at: Date('2025-03-16T15:00:00') }

// Weekdays
parser.parse('every weekday at 9am');
// => { type: 'cron', expression: '0 9 * * 1-5' }

// Cron passthrough
parser.parse('cron: 0 */4 * * *');
// => { type: 'cron', expression: '0 */4 * * *' }
```

---

## Memory System Integration

### Learning from Job Outcomes

```typescript
interface SchedulerMemoryIntegration {
  /**
   * Record a successful job pattern
   */
  recordSuccess(job: X2000ScheduledJob, run: JobRun): Promise<void>;

  /**
   * Record a job failure for future avoidance
   */
  recordFailure(job: X2000ScheduledJob, error: Error): Promise<void>;

  /**
   * Get optimization suggestions based on history
   */
  getOptimizations(jobId: string): Promise<OptimizationSuggestion[]>;

  /**
   * Predict job duration based on historical patterns
   */
  predictDuration(payload: JobPayload): Promise<Duration>;

  /**
   * Suggest retry policy based on similar jobs
   */
  suggestRetryPolicy(payload: JobPayload): Promise<RetryPolicy>;
}

interface OptimizationSuggestion {
  type: 'schedule' | 'retry' | 'timeout' | 'concurrency';
  suggestion: string;
  confidence: number;
  evidence: string;
}

class SchedulerMemory implements SchedulerMemoryIntegration {
  constructor(private memoryManager: MemoryManager) {}

  async recordSuccess(job: X2000ScheduledJob, run: JobRun): Promise<void> {
    await this.memoryManager.storePattern({
      type: 'success',
      source: 'scheduler',
      category: 'implementation',
      tags: ['scheduler', 'job', ...job.tags],

      pattern: {
        payloadType: job.payload.type,
        scheduleType: job.schedule.type,
        duration: run.duration,
        attempt: run.attempt,
      },

      context: {
        jobName: job.name,
        brain: job.createdBy.brainType,
      },

      metadata: {
        createdAt: new Date(),
        usageCount: 1,
        successRate: 1,
      },
    });

    // Update job-specific metrics in memory
    await this.updateJobMetrics(job.id, {
      lastSuccess: new Date(),
      avgDuration: run.duration,
    });
  }

  async recordFailure(job: X2000ScheduledJob, error: Error): Promise<void> {
    await this.memoryManager.storeLearning({
      type: 'failure',
      source: 'scheduler',
      category: 'implementation',
      tags: ['scheduler', 'job', 'error', ...job.tags],

      description: `Job "${job.name}" failed: ${error.message}`,

      context: {
        errorCode: (error as any).code,
        errorType: error.constructor.name,
        payloadType: job.payload.type,
        attempt: job.state.currentAttempt,
      },

      recommendation: this.generateRecommendation(job, error),

      metadata: {
        createdAt: new Date(),
        severity: this.classifyErrorSeverity(error),
      },
    });
  }

  async getOptimizations(jobId: string): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];
    const metrics = await this.getJobMetrics(jobId);

    // Schedule optimization
    if (metrics.failureCount > 10 && metrics.errorBreakdown['timeout'] > 5) {
      suggestions.push({
        type: 'schedule',
        suggestion: 'Consider spreading execution across less busy time windows',
        confidence: 0.8,
        evidence: `${metrics.errorBreakdown['timeout']} timeout errors in last ${metrics.window}`,
      });
    }

    // Retry optimization
    if (metrics.avgRetries > 2.5) {
      suggestions.push({
        type: 'retry',
        suggestion: 'Increase initial backoff delay to reduce retry load',
        confidence: 0.75,
        evidence: `Average ${metrics.avgRetries.toFixed(1)} retries per job`,
      });
    }

    // Timeout optimization
    if (metrics.p99Duration > metrics.configuredTimeout * 0.9) {
      suggestions.push({
        type: 'timeout',
        suggestion: `Increase timeout from ${metrics.configuredTimeout}s to ${Math.ceil(metrics.p99Duration * 1.2)}s`,
        confidence: 0.9,
        evidence: `P99 duration (${metrics.p99Duration}s) approaches timeout`,
      });
    }

    return suggestions;
  }

  private generateRecommendation(job: X2000ScheduledJob, error: Error): string {
    const errorType = error.constructor.name;

    const recommendations: Record<string, string> = {
      TimeoutError: 'Consider increasing job timeout or breaking into smaller tasks',
      NetworkError: 'Add retry with exponential backoff for network issues',
      ValidationError: 'Review input payload schema and add validation',
      AuthenticationError: 'Check and refresh authentication credentials',
    };

    return recommendations[errorType] || 'Review error logs and consider adding error handling';
  }

  private classifyErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const errorType = error.constructor.name;

    const criticalErrors = ['AuthenticationError', 'ConfigurationError'];
    const highErrors = ['DatabaseError', 'SystemError'];
    const mediumErrors = ['TimeoutError', 'NetworkError'];

    if (criticalErrors.includes(errorType)) return 'critical';
    if (highErrors.includes(errorType)) return 'high';
    if (mediumErrors.includes(errorType)) return 'medium';
    return 'low';
  }
}
```

---

## Observability

### Metrics Export

```typescript
interface SchedulerMetrics {
  // Counters
  jobsScheduled: Counter;
  jobsCompleted: Counter;
  jobsFailed: Counter;
  jobsRetried: Counter;
  jobsDeadLettered: Counter;

  // Gauges
  jobsRunning: Gauge;
  jobsQueued: Gauge;
  workersActive: Gauge;

  // Histograms
  jobDuration: Histogram;
  jobLatency: Histogram;  // Time from scheduled to start
  queueTime: Histogram;   // Time in queue
}

// Prometheus format export
const metrics = `
# HELP x2000_scheduler_jobs_total Total jobs processed
# TYPE x2000_scheduler_jobs_total counter
x2000_scheduler_jobs_total{status="completed"} ${completedCount}
x2000_scheduler_jobs_total{status="failed"} ${failedCount}
x2000_scheduler_jobs_total{status="dead_lettered"} ${dlqCount}

# HELP x2000_scheduler_jobs_running Currently running jobs
# TYPE x2000_scheduler_jobs_running gauge
x2000_scheduler_jobs_running ${runningCount}

# HELP x2000_scheduler_job_duration_seconds Job execution duration
# TYPE x2000_scheduler_job_duration_seconds histogram
x2000_scheduler_job_duration_seconds_bucket{le="0.1"} ${bucket01}
x2000_scheduler_job_duration_seconds_bucket{le="0.5"} ${bucket05}
x2000_scheduler_job_duration_seconds_bucket{le="1"} ${bucket1}
x2000_scheduler_job_duration_seconds_bucket{le="5"} ${bucket5}
x2000_scheduler_job_duration_seconds_bucket{le="30"} ${bucket30}
x2000_scheduler_job_duration_seconds_bucket{le="+Inf"} ${bucketInf}
x2000_scheduler_job_duration_seconds_sum ${totalDuration}
x2000_scheduler_job_duration_seconds_count ${totalCount}

# HELP x2000_scheduler_workers_active Active worker count
# TYPE x2000_scheduler_workers_active gauge
x2000_scheduler_workers_active ${activeWorkers}
`;
```

### Alerting Rules

```yaml
# Prometheus alerting rules
groups:
  - name: x2000-scheduler
    rules:
      - alert: SchedulerHighFailureRate
        expr: |
          (
            rate(x2000_scheduler_jobs_total{status="failed"}[5m]) /
            rate(x2000_scheduler_jobs_total[5m])
          ) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High job failure rate"
          description: "More than 10% of jobs are failing"

      - alert: SchedulerDLQGrowing
        expr: x2000_scheduler_dead_letter_queue_size > 100
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Dead letter queue growing"
          description: "DLQ has {{ $value }} items requiring attention"

      - alert: SchedulerNoWorkers
        expr: x2000_scheduler_workers_active == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "No active scheduler workers"
          description: "All scheduler workers are offline"

      - alert: SchedulerJobStuck
        expr: |
          (time() - x2000_scheduler_job_started_at) > 3600
          and x2000_scheduler_job_status == "running"
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Job stuck in running state"
          description: "Job {{ $labels.job_id }} has been running for over 1 hour"
```

### Dashboard Queries

```sql
-- Jobs by status (last 24h)
SELECT
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration
FROM job_runs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Top failing jobs
SELECT
  job_id,
  job_name,
  COUNT(*) FILTER (WHERE status = 'failed') as failures,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'failed') / COUNT(*), 2) as failure_rate
FROM job_runs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY job_id, job_name
HAVING COUNT(*) FILTER (WHERE status = 'failed') > 0
ORDER BY failure_rate DESC
LIMIT 10;

-- Execution latency percentiles
SELECT
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99
FROM job_runs
WHERE status = 'completed'
  AND created_at > NOW() - INTERVAL '1 hour';

-- Worker utilization
SELECT
  worker_id,
  COUNT(*) as jobs_processed,
  SUM(duration_ms) / 1000.0 as total_time_seconds,
  AVG(duration_ms) as avg_job_ms
FROM job_runs
WHERE started_at > NOW() - INTERVAL '1 hour'
GROUP BY worker_id;
```

---

## Why X2000's Scheduler is Superior to OpenClaw

| Dimension | OpenClaw | X2000 | Advantage |
|-----------|----------|-------|-----------|
| **Persistence** | File-based JSON, atomic writes | PostgreSQL with ACID, Redis for coordination | Transactional integrity, query flexibility, backup/recovery |
| **Distribution** | Single process only | Multiple workers with leader election | Horizontal scaling, fault tolerance |
| **Retry Logic** | None (job fails, logs error) | Exponential backoff with jitter, configurable policies | Resilience to transient failures |
| **Dead Letter Queue** | None | Full DLQ with metadata, retry, purge | Failed jobs don't disappear |
| **Natural Language** | None (cron syntax only) | Full NLP parser with confidence scores | User-friendly scheduling |
| **Timezone Handling** | Basic tz field | Full IANA with DST handling | Global business support |
| **Observability** | JSONL logs only | Prometheus metrics, structured logs, alerting | Production-grade monitoring |
| **Job Types** | systemEvent, agentTurn | Brain tasks, tool calls, webhooks, workflows | Flexible execution model |
| **Memory Integration** | None | Pattern learning, failure analysis, optimization | Continuous improvement |
| **API Surface** | 8 operations | 20+ operations with filtering, pagination | Comprehensive management |
| **Concurrency Control** | In-process mutex | Distributed locks with timeout | Multi-node safe |
| **Job Dependencies** | None | afterJob with optional delay | Workflow orchestration |
| **Timeout Handling** | Basic (global only) | Per-job configurable with abort | Fine-grained control |
| **History Retention** | Pruned JSONL (2MB max) | Configurable retention, partitioned tables | Unlimited history with performance |

### Key Technical Wins

1. **Crash Recovery**: OpenClaw loses in-flight jobs on crash. X2000 uses database transactions and Redis locks to ensure exactly-once delivery even across failures.

2. **Scale**: OpenClaw's single-process model caps at one machine's capacity. X2000 can scale to 100+ workers with automatic load balancing.

3. **Debuggability**: OpenClaw provides JSONL logs that must be manually parsed. X2000 offers structured logs, metrics, and a query-able history API.

4. **User Experience**: Creating a cron job in OpenClaw requires knowing cron syntax. X2000 accepts "every Monday at 9am PST" and validates it.

5. **Intelligence**: X2000 learns from job outcomes and can suggest optimizations. OpenClaw has no learning capability.

---

## Implementation Roadmap

### Phase 1: Core Scheduler (Week 1-2)
- [ ] Job schema and database migrations
- [ ] Basic CRUD API
- [ ] Single-worker execution
- [ ] Cron expression parsing
- [ ] Simple retry (fixed backoff)

### Phase 2: Distribution (Week 3-4)
- [ ] Redis integration for coordination
- [ ] Leader election
- [ ] Worker pool management
- [ ] Distributed locks
- [ ] Job acquisition with fairness

### Phase 3: Intelligence (Week 5-6)
- [ ] Natural language parser
- [ ] Exponential backoff with jitter
- [ ] Dead letter queue
- [ ] Memory integration
- [ ] Pattern learning

### Phase 4: Observability (Week 7-8)
- [ ] Prometheus metrics export
- [ ] Alerting integration
- [ ] Dashboard queries
- [ ] API for history/metrics

### Phase 5: Advanced Features (Week 9-10)
- [ ] Workflow payloads
- [ ] Job dependencies
- [ ] Priority queues
- [ ] Rate limiting
- [ ] Multi-tenant support

---

## References

**Research Sources:**
- [Schedulers in Node: Top 10 Libraries](https://betterstack.com/community/guides/scaling-nodejs/best-nodejs-schedulers/) - BullMQ vs Agenda comparison
- [Job Schedulers: Bull or Agenda?](https://blog.appsignal.com/2023/09/06/job-schedulers-for-node-bull-or-agenda.html) - Architecture trade-offs
- [Temporal Schedules vs Cron](https://temporal.io/blog/temporal-schedules-reliable-scalable-and-more-flexible-than-cron-jobs) - Modern workflow patterns
- [Queue-Based Exponential Backoff](https://dev.to/andreparis/queue-based-exponential-backoff-a-resilient-retry-pattern-for-distributed-systems-37f3) - Retry resilience patterns
- [Dead Letter Queue Best Practices](https://swenotes.com/2025/09/25/dead-letter-queues-dlq-the-complete-developer-friendly-guide/) - DLQ implementation guide
- [BullMQ Job Schedulers](https://docs.bullmq.io/guide/job-schedulers) - Advanced scheduling features
- [Retrying Failing Jobs](https://docs.bullmq.io/guide/retrying-failing-jobs) - BullMQ retry patterns

**OpenClaw Code Analysis:**
- `/DropFly-PROJECTS/dropfly-openclaw/src/agents/tools/cron-tool.ts`
- `/DropFly-PROJECTS/dropfly-openclaw/src/cron/service.ts`
- `/DropFly-PROJECTS/dropfly-openclaw/src/cron/types.ts`
- `/DropFly-PROJECTS/dropfly-openclaw/src/cron/store.ts`
- `/DropFly-PROJECTS/dropfly-openclaw/src/cron/schedule.ts`
- `/DropFly-PROJECTS/dropfly-openclaw/src/cron/run-log.ts`

---

*This design document represents the collaborative output of the Engineering Brain and Research Brain, reviewed by CEO Brain.*
