/**
 * X2000 Scheduler Type Definitions
 * Enterprise-grade scheduling system types
 */

import type { BrainType } from '../types/index.js';

// ============================================================================
// Duration Types
// ============================================================================

export interface Duration {
  milliseconds?: number;
  seconds?: number;
  minutes?: number;
  hours?: number;
  days?: number;
  weeks?: number;
}

// ============================================================================
// Schedule Types
// ============================================================================

export type JobScheduleOnce = {
  type: 'once';
  at: Date;
};

export type JobScheduleInterval = {
  type: 'interval';
  every: Duration;
  startAt?: Date;
};

export type JobScheduleCron = {
  type: 'cron';
  expression: string;
};

export type JobScheduleNatural = {
  type: 'natural';
  description: string;
  parsed?: string; // Parsed cron expression
};

export type JobScheduleDependent = {
  type: 'dependent';
  afterJob: string;
  delay?: Duration;
};

export type JobSchedule =
  | JobScheduleOnce
  | JobScheduleInterval
  | JobScheduleCron
  | JobScheduleNatural
  | JobScheduleDependent;

// ============================================================================
// Payload Types
// ============================================================================

export interface BrainTaskPayload {
  type: 'brain-task';
  brain: BrainType;
  task: string;
  context?: Record<string, unknown>;
  tools?: string[];
  maxTokens?: number;
  thinking?: 'low' | 'medium' | 'high';
}

export interface ToolCallPayload {
  type: 'tool-call';
  tool: string;
  parameters: Record<string, unknown>;
}

export interface WebhookPayload {
  type: 'webhook';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout: Duration;
}

export interface SystemEventPayload {
  type: 'system-event';
  event: string;
  data?: Record<string, unknown>;
}

export interface WorkflowStepPayload {
  id: string;
  payload: JobPayload;
  condition?: string;
  timeout?: Duration;
}

export interface WorkflowPayload {
  type: 'workflow';
  steps: WorkflowStepPayload[];
  onFailure: 'stop' | 'continue' | 'rollback';
}

export type JobPayload =
  | BrainTaskPayload
  | ToolCallPayload
  | WebhookPayload
  | SystemEventPayload
  | WorkflowPayload;

// ============================================================================
// Retry Policy
// ============================================================================

export interface BackoffFixed {
  type: 'fixed';
  delay: Duration;
}

export interface BackoffExponential {
  type: 'exponential';
  initialDelay: Duration;
  maxDelay: Duration;
  multiplier: number;
}

export interface BackoffExponentialJitter {
  type: 'exponential-jitter';
  initialDelay: Duration;
  maxDelay: Duration;
  jitterFactor: number;
}

export type BackoffStrategy =
  | BackoffFixed
  | BackoffExponential
  | BackoffExponentialJitter;

export interface RetryPolicy {
  maxAttempts: number;
  backoff: BackoffStrategy;
  retryableErrors?: string[];
  nonRetryableErrors?: string[];
  deadLetterQueue: boolean;
}

// ============================================================================
// Job Status and Lifecycle
// ============================================================================

export type JobStatus =
  | 'scheduled'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled'
  | 'dead-letter';

export interface JobLifecycle {
  enabled: boolean;
  pausedAt?: Date;
  pausedReason?: string;
  expiresAt?: Date;
  deleteAfterCompletion: boolean;
}

// ============================================================================
// Execution State
// ============================================================================

export interface JobLastResult {
  status: 'success' | 'error' | 'skipped';
  output?: unknown;
  error?: string;
  duration: Duration;
  attempt: number;
}

export interface JobExecutionState {
  nextRunAt?: Date;
  lastRunAt?: Date;
  lastResult?: JobLastResult;
  runCount: number;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  currentAttempt: number;
  lockedBy?: string;
  lockedAt?: Date;
}

// ============================================================================
// Ownership
// ============================================================================

export interface JobOwnership {
  brainType: BrainType;
  agentId?: string;
  sessionId: string;
}

// ============================================================================
// Job Metadata
// ============================================================================

export interface JobMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: number;
  correlationId?: string;
}

// ============================================================================
// Main Job Interface
// ============================================================================

export interface X2000ScheduledJob {
  // Identity
  id: string;
  name: string;
  description?: string;
  tags: string[];

  // Ownership
  createdBy: JobOwnership;

  // Schedule
  schedule: JobSchedule;
  timezone: string;

  // Payload
  payload: JobPayload;

  // Retry Policy
  retry: RetryPolicy;

  // Lifecycle
  status: JobStatus;
  lifecycle: JobLifecycle;

  // Execution State
  state: JobExecutionState;

  // Metadata
  metadata: JobMetadata;

  // Memory integration
  learnFromOutcome: boolean;
}

// ============================================================================
// Job Run (History)
// ============================================================================

export interface JobRunLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
}

export interface JobRunError {
  message: string;
  code?: string;
  stack?: string;
  retryable: boolean;
}

export interface JobRun {
  id: string;
  jobId: string;
  jobName: string;

  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'skipped';

  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  duration?: Duration;
  attempt: number;

  workerId?: string;

  input: JobPayload;
  output?: unknown;
  error?: JobRunError;

  logs: JobRunLog[];
}

// ============================================================================
// Dead Letter Queue
// ============================================================================

export type DeadLetterReason =
  | 'max_retries'
  | 'non_retryable_error'
  | 'timeout'
  | 'manual';

export interface DeadLetterJob {
  id: string;
  originalJobId: string;
  job: X2000ScheduledJob;

  failedAt: Date;
  reason: DeadLetterReason;

  attempts: number;
  lastError: string;

  canRetry: boolean;
  retriedAt?: Date;
  purgedAt?: Date;
}

// ============================================================================
// Worker
// ============================================================================

export type WorkerStatus = 'active' | 'draining' | 'offline';

export interface WorkerInfo {
  id: string;
  hostname: string;
  pid?: number;

  capabilities: string[];
  maxConcurrent: number;
  currentJobs: number;

  registeredAt: Date;
  lastHeartbeat: Date;

  status: WorkerStatus;
}

// ============================================================================
// Scheduler Status
// ============================================================================

export interface SchedulerStatus {
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

// ============================================================================
// Job Metrics
// ============================================================================

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface JobMetrics {
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

  successRate: number;

  lastSuccess?: Date;
  lastFailure?: Date;

  errorBreakdown: Record<string, number>;
}

// ============================================================================
// API Input/Output Types
// ============================================================================

export interface CreateJobInput {
  name: string;
  description?: string;
  tags?: string[];

  schedule: string | JobSchedule;
  timezone?: string;

  payload: JobPayload;

  retry?: Partial<RetryPolicy>;

  enabled?: boolean;
  expiresAt?: Date;
  deleteAfterCompletion?: boolean;

  learnFromOutcome?: boolean;
}

export interface UpdateJobInput {
  name?: string;
  description?: string;
  tags?: string[];

  schedule?: string | JobSchedule;
  timezone?: string;

  payload?: JobPayload;

  retry?: Partial<RetryPolicy>;

  enabled?: boolean;
  expiresAt?: Date;
  deleteAfterCompletion?: boolean;
}

export interface JobFilter {
  status?: JobStatus[];
  tags?: string[];
  brain?: BrainType[];
  createdAfter?: Date;
  createdBefore?: Date;
  nextRunBefore?: Date;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface RunQueryOptions {
  status?: JobRun['status'][];
  limit?: number;
  offset?: number;
}

export interface DLQFilter {
  reason?: DeadLetterReason[];
  canRetry?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Natural Language Parsing
// ============================================================================

export interface ParsedSchedule {
  input: string;
  schedule: JobSchedule;
  humanReadable: string;
  nextOccurrences: Date[];
  confidence: number;
  warnings?: string[];
  ambiguities?: string[];
}

export interface ParseOptions {
  timezone?: string;
  referenceDate?: Date;
  strict?: boolean;
}

// ============================================================================
// Database Types
// ============================================================================

export interface DatabaseJob {
  id: string;
  name: string;
  description: string | null;
  tags: string[];

  created_by_brain: string;
  created_by_agent_id: string | null;
  created_by_session_id: string;

  schedule: Record<string, unknown>;
  timezone: string;

  payload: Record<string, unknown>;

  retry_max_attempts: number;
  retry_backoff: Record<string, unknown>;
  retry_dead_letter: boolean;

  status: string;
  enabled: boolean;
  paused_at: string | null;
  paused_reason: string | null;
  expires_at: string | null;
  delete_after_completion: boolean;

  next_run_at: string | null;
  last_run_at: string | null;
  last_result: Record<string, unknown> | null;
  run_count: number;
  success_count: number;
  failure_count: number;
  consecutive_failures: number;
  current_attempt: number;
  locked_by: string | null;
  locked_at: string | null;

  created_at: string;
  updated_at: string;
  version: number;
  correlation_id: string | null;

  learn_from_outcome: boolean;
}

export interface DatabaseJobRun {
  id: string;
  job_id: string;
  job_name: string;

  status: string;

  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;

  duration_ms: number | null;
  attempt: number;

  worker_id: string | null;

  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: Record<string, unknown> | null;

  logs: Record<string, unknown>[];

  created_at: string;
}

export interface DatabaseDeadLetterJob {
  id: string;
  original_job_id: string;
  job_snapshot: Record<string, unknown>;

  failed_at: string;
  reason: string;

  attempts: number;
  last_error: string;

  can_retry: boolean;
  retried_at: string | null;
  purged_at: string | null;

  created_at: string;
}

export interface DatabaseWorker {
  id: string;
  hostname: string;
  pid: number | null;

  capabilities: string[];
  max_concurrent: number;
  current_jobs: number;

  registered_at: string;
  last_heartbeat: string;

  status: string;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  backoff: {
    type: 'exponential-jitter',
    initialDelay: { seconds: 1 },
    maxDelay: { minutes: 5 },
    jitterFactor: 0.2,
  },
  deadLetterQueue: true,
};

export const DEFAULT_TIMEZONE = 'UTC';

export const VALID_JOB_STATUSES: JobStatus[] = [
  'scheduled',
  'queued',
  'running',
  'completed',
  'failed',
  'paused',
  'cancelled',
  'dead-letter',
];
