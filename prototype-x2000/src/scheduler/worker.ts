/**
 * Scheduler Worker
 * Handles concurrent job execution with locking and heartbeat
 */

import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import type {
  X2000ScheduledJob,
  JobRun,
  JobRunLog,
  WorkerInfo,
  WorkerStatus,
  JobPayload,
  Duration,
} from './types.js';
import { schedulerPersistence } from './persistence.js';
import { retryCalculator, deadLetterQueueManager } from './retry.js';
import { durationToMs, msToDuration } from './natural-language.js';

// ============================================================================
// Types
// ============================================================================

export interface WorkerConfig {
  workerId?: string;
  maxConcurrent?: number;
  pollIntervalMs?: number;
  heartbeatIntervalMs?: number;
  lockTimeoutMinutes?: number;
  capabilities?: string[];
}

export interface JobExecutionContext {
  job: X2000ScheduledJob;
  runId: string;
  workerId: string;
  signal: AbortSignal;
  logs: JobRunLog[];
}

export type JobExecutor = (
  context: JobExecutionContext
) => Promise<unknown>;

// ============================================================================
// Worker Implementation
// ============================================================================

export class SchedulerWorker {
  private readonly workerId: string;
  private readonly maxConcurrent: number;
  private readonly pollIntervalMs: number;
  private readonly heartbeatIntervalMs: number;
  private readonly lockTimeoutMinutes: number;
  private readonly capabilities: string[];

  private running = false;
  private runningJobs: Map<string, AbortController> = new Map();
  private pollTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private lockCleanupInterval: ReturnType<typeof setInterval> | null = null;

  private workerInfo: WorkerInfo;
  private executors: Map<string, JobExecutor> = new Map();

  // Event callbacks
  private onJobStart?: (job: X2000ScheduledJob, runId: string) => void;
  private onJobComplete?: (job: X2000ScheduledJob, result: unknown) => void;
  private onJobError?: (job: X2000ScheduledJob, error: Error) => void;

  constructor(config: WorkerConfig = {}) {
    this.workerId = config.workerId ?? `worker_${uuidv4().substring(0, 8)}`;
    this.maxConcurrent = config.maxConcurrent ?? 10;
    this.pollIntervalMs = config.pollIntervalMs ?? 1000;
    this.heartbeatIntervalMs = config.heartbeatIntervalMs ?? 30000;
    this.lockTimeoutMinutes = config.lockTimeoutMinutes ?? 5;
    this.capabilities = config.capabilities ?? [];

    this.workerInfo = {
      id: this.workerId,
      hostname: os.hostname(),
      pid: process.pid,
      capabilities: this.capabilities,
      maxConcurrent: this.maxConcurrent,
      currentJobs: 0,
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
      status: 'active',
    };

    // Register default executors
    this.registerDefaultExecutors();
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    if (this.running) {
      console.log(`[Worker ${this.workerId}] Already running`);
      return;
    }

    console.log(`[Worker ${this.workerId}] Starting...`);

    // Initialize persistence
    await schedulerPersistence.initialize();

    // Register worker
    await this.registerWorker();

    this.running = true;

    // Start heartbeat
    this.startHeartbeat();

    // Start lock cleanup
    this.startLockCleanup();

    // Start polling for jobs
    this.pollForJobs();

    console.log(`[Worker ${this.workerId}] Started with max ${this.maxConcurrent} concurrent jobs`);
  }

  /**
   * Stop the worker gracefully
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    console.log(`[Worker ${this.workerId}] Stopping...`);

    this.running = false;
    this.workerInfo.status = 'draining';

    // Stop polling
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Stop lock cleanup
    if (this.lockCleanupInterval) {
      clearInterval(this.lockCleanupInterval);
      this.lockCleanupInterval = null;
    }

    // Cancel all running jobs
    for (const [jobId, controller] of this.runningJobs) {
      console.log(`[Worker ${this.workerId}] Cancelling job ${jobId}`);
      controller.abort();
    }

    // Wait for jobs to complete (with timeout)
    const drainTimeout = 30000;
    const start = Date.now();
    while (this.runningJobs.size > 0 && Date.now() - start < drainTimeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update worker status
    this.workerInfo.status = 'offline';
    await schedulerPersistence.registerWorker(this.workerInfo);

    console.log(`[Worker ${this.workerId}] Stopped`);
  }

  // ============================================================================
  // Worker Registration
  // ============================================================================

  private async registerWorker(): Promise<void> {
    this.workerInfo.registeredAt = new Date();
    this.workerInfo.lastHeartbeat = new Date();
    this.workerInfo.status = 'active';

    await schedulerPersistence.registerWorker(this.workerInfo);
    console.log(`[Worker ${this.workerId}] Registered`);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      this.workerInfo.lastHeartbeat = new Date();
      this.workerInfo.currentJobs = this.runningJobs.size;

      await schedulerPersistence.updateWorkerHeartbeat(this.workerId);
    }, this.heartbeatIntervalMs);
  }

  private startLockCleanup(): void {
    // Periodically release stale locks from crashed workers
    this.lockCleanupInterval = setInterval(async () => {
      const released = await schedulerPersistence.releaseStaleLocks(
        this.lockTimeoutMinutes
      );
      if (released > 0) {
        console.log(`[Worker ${this.workerId}] Released ${released} stale locks`);
      }
    }, this.lockTimeoutMinutes * 60 * 1000);
  }

  // ============================================================================
  // Job Polling
  // ============================================================================

  private async pollForJobs(): Promise<void> {
    if (!this.running) {
      return;
    }

    // Check if we have capacity
    if (this.runningJobs.size >= this.maxConcurrent) {
      this.schedulePoll();
      return;
    }

    try {
      // Try to acquire a job
      const job = await schedulerPersistence.acquireJob(this.workerId);

      if (job) {
        // Execute the job
        this.executeJob(job);
      }
    } catch (error) {
      console.error(`[Worker ${this.workerId}] Poll error:`, error);
    }

    // Schedule next poll
    this.schedulePoll();
  }

  private schedulePoll(): void {
    if (!this.running) {
      return;
    }

    this.pollTimeout = setTimeout(() => {
      this.pollForJobs();
    }, this.pollIntervalMs);
  }

  // ============================================================================
  // Job Execution
  // ============================================================================

  private async executeJob(job: X2000ScheduledJob): Promise<void> {
    const runId = uuidv4();
    const controller = new AbortController();
    const logs: JobRunLog[] = [];

    this.runningJobs.set(job.id, controller);
    this.workerInfo.currentJobs = this.runningJobs.size;

    const startedAt = new Date();

    // Create run record
    const run: JobRun = {
      id: runId,
      jobId: job.id,
      jobName: job.name,
      status: 'running',
      scheduledAt: job.state.nextRunAt || new Date(),
      startedAt,
      attempt: job.state.currentAttempt,
      workerId: this.workerId,
      input: job.payload,
      logs,
    };

    await schedulerPersistence.saveJobRun(run);

    this.log(logs, 'info', `Job started: ${job.name}`);
    this.onJobStart?.(job, runId);

    try {
      // Execute the payload
      const context: JobExecutionContext = {
        job,
        runId,
        workerId: this.workerId,
        signal: controller.signal,
        logs,
      };

      const result = await this.executePayload(context);

      // Success
      await this.onJobSuccess(job, run, result, logs);
      this.onJobComplete?.(job, result);
    } catch (error) {
      // Failure
      const err = error instanceof Error ? error : new Error(String(error));
      await this.onJobFailure(job, run, err, logs);
      this.onJobError?.(job, err);
    } finally {
      this.runningJobs.delete(job.id);
      this.workerInfo.currentJobs = this.runningJobs.size;
    }
  }

  private async executePayload(
    context: JobExecutionContext
  ): Promise<unknown> {
    const { job, signal, logs } = context;
    const { payload } = job;

    // Check for custom executor
    const executor = this.executors.get(payload.type);
    if (executor) {
      return executor(context);
    }

    // Default execution based on payload type
    switch (payload.type) {
      case 'brain-task':
        return this.executeBrainTask(context);

      case 'tool-call':
        return this.executeToolCall(context);

      case 'webhook':
        return this.executeWebhook(context);

      case 'system-event':
        return this.executeSystemEvent(context);

      case 'workflow':
        return this.executeWorkflow(context);

      default:
        throw new Error(`Unknown payload type: ${(payload as { type: string }).type}`);
    }
  }

  private async executeBrainTask(
    context: JobExecutionContext
  ): Promise<unknown> {
    const { job, logs } = context;
    const payload = job.payload as { type: 'brain-task'; brain: string; task: string };

    this.log(logs, 'info', `Executing brain task: ${payload.brain}`);

    // TODO: Integrate with actual brain system
    // For now, return a placeholder result
    return {
      brain: payload.brain,
      task: payload.task,
      executed: true,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeToolCall(
    context: JobExecutionContext
  ): Promise<unknown> {
    const { job, logs } = context;
    const payload = job.payload as { type: 'tool-call'; tool: string; parameters: Record<string, unknown> };

    this.log(logs, 'info', `Executing tool call: ${payload.tool}`);

    // TODO: Integrate with actual tool system
    return {
      tool: payload.tool,
      parameters: payload.parameters,
      executed: true,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeWebhook(
    context: JobExecutionContext
  ): Promise<unknown> {
    const { job, signal, logs } = context;
    const payload = job.payload as {
      type: 'webhook';
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: unknown;
      timeout: Duration;
    };

    this.log(logs, 'info', `Executing webhook: ${payload.method} ${payload.url}`);

    const timeoutMs = durationToMs(payload.timeout);

    const response = await fetch(payload.url, {
      method: payload.method,
      headers: {
        'Content-Type': 'application/json',
        ...payload.headers,
      },
      body: payload.body ? JSON.stringify(payload.body) : undefined,
      signal: AbortSignal.any([
        signal,
        AbortSignal.timeout(timeoutMs),
      ]),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  private async executeSystemEvent(
    context: JobExecutionContext
  ): Promise<unknown> {
    const { job, logs } = context;
    const payload = job.payload as { type: 'system-event'; event: string; data?: Record<string, unknown> };

    this.log(logs, 'info', `Executing system event: ${payload.event}`);

    // TODO: Emit to event system
    return {
      event: payload.event,
      data: payload.data,
      emitted: true,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeWorkflow(
    context: JobExecutionContext
  ): Promise<unknown> {
    const { job, logs, signal } = context;
    const payload = job.payload as {
      type: 'workflow';
      steps: Array<{ id: string; payload: JobPayload; condition?: string; timeout?: Duration }>;
      onFailure: 'stop' | 'continue' | 'rollback';
    };

    this.log(logs, 'info', `Executing workflow with ${payload.steps.length} steps`);

    const results: Record<string, unknown> = {};
    const executedSteps: string[] = [];

    for (const step of payload.steps) {
      if (signal.aborted) {
        throw new Error('Workflow aborted');
      }

      // Evaluate condition if present
      if (step.condition) {
        // TODO: Evaluate condition expression
        // For now, always execute
      }

      this.log(logs, 'info', `Executing workflow step: ${step.id}`);

      try {
        const stepContext: JobExecutionContext = {
          ...context,
          job: {
            ...job,
            payload: step.payload,
          },
        };

        results[step.id] = await this.executePayload(stepContext);
        executedSteps.push(step.id);
      } catch (error) {
        this.log(
          logs,
          'error',
          `Workflow step ${step.id} failed: ${error instanceof Error ? error.message : String(error)}`
        );

        if (payload.onFailure === 'stop') {
          throw error;
        }

        if (payload.onFailure === 'rollback') {
          // TODO: Implement rollback logic
          throw error;
        }

        // 'continue' - continue to next step
        results[step.id] = { error: String(error) };
      }
    }

    return {
      workflow: true,
      results,
      executedSteps,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================================================
  // Job Result Handling
  // ============================================================================

  private async onJobSuccess(
    job: X2000ScheduledJob,
    run: JobRun,
    result: unknown,
    logs: JobRunLog[]
  ): Promise<void> {
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - (run.startedAt?.getTime() ?? completedAt.getTime());

    this.log(logs, 'info', `Job completed successfully in ${durationMs}ms`);

    // Update run record
    run.status = 'completed';
    run.completedAt = completedAt;
    run.duration = msToDuration(durationMs);
    run.output = result;
    run.logs = logs;

    await schedulerPersistence.saveJobRun(run);

    // Update job state
    job.status = 'scheduled'; // Ready for next run
    job.state.lastRunAt = completedAt;
    job.state.lastResult = {
      status: 'success',
      output: result,
      duration: msToDuration(durationMs),
      attempt: run.attempt,
    };
    job.state.runCount++;
    job.state.successCount++;
    job.state.consecutiveFailures = 0;
    job.state.lockedBy = undefined;
    job.state.lockedAt = undefined;
    job.metadata.updatedAt = new Date();

    // Calculate next run time
    job.state.nextRunAt = this.calculateNextRunTime(job);

    // Check if job should be deleted
    if (job.lifecycle.deleteAfterCompletion && job.schedule.type === 'once') {
      await schedulerPersistence.deleteJob(job.id);
    } else {
      await schedulerPersistence.saveJob(job);
    }
  }

  private async onJobFailure(
    job: X2000ScheduledJob,
    run: JobRun,
    error: Error,
    logs: JobRunLog[]
  ): Promise<void> {
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - (run.startedAt?.getTime() ?? completedAt.getTime());

    this.log(logs, 'error', `Job failed: ${error.message}`);

    // Update run record
    run.status = 'failed';
    run.completedAt = completedAt;
    run.duration = msToDuration(durationMs);
    run.error = {
      message: error.message,
      code: (error as { code?: string }).code,
      stack: error.stack,
      retryable: retryCalculator.isRetryableError(error, job.retry),
    };
    run.logs = logs;

    await schedulerPersistence.saveJobRun(run);

    // Update job state
    job.state.lastRunAt = completedAt;
    job.state.lastResult = {
      status: 'error',
      error: error.message,
      duration: msToDuration(durationMs),
      attempt: run.attempt,
    };
    job.state.runCount++;
    job.state.failureCount++;
    job.state.consecutiveFailures++;
    job.state.lockedBy = undefined;
    job.state.lockedAt = undefined;
    job.metadata.updatedAt = new Date();

    // Check if should retry
    const { retry, reason } = retryCalculator.shouldRetry(job, error);

    if (retry) {
      // Schedule retry
      job.status = 'scheduled';
      job.state.nextRunAt = retryCalculator.getNextRetryTime(job);
      this.log(logs, 'info', `Scheduling retry: ${reason}`);
    } else if (job.retry.deadLetterQueue) {
      // Move to DLQ
      job.status = 'dead-letter';
      const dlqJob = deadLetterQueueManager.moveToDeadLetter(
        job,
        job.state.currentAttempt >= job.retry.maxAttempts
          ? 'max_retries'
          : 'non_retryable_error',
        error.message
      );
      await schedulerPersistence.saveDeadLetterJob(dlqJob);
      this.log(logs, 'warn', `Moved to dead letter queue: ${reason}`);
    } else {
      // Mark as failed
      job.status = 'failed';
    }

    await schedulerPersistence.saveJob(job);
  }

  // ============================================================================
  // Schedule Calculation
  // ============================================================================

  private calculateNextRunTime(job: X2000ScheduledJob): Date | undefined {
    const schedule = job.schedule;

    switch (schedule.type) {
      case 'once':
        // One-shot jobs don't have a next run
        return undefined;

      case 'interval': {
        const intervalMs = durationToMs(schedule.every);
        const lastRun = job.state.lastRunAt || new Date();
        return new Date(lastRun.getTime() + intervalMs);
      }

      case 'cron':
        // TODO: Calculate next cron occurrence
        // For now, use simple interval approximation
        return new Date(Date.now() + 60000); // 1 minute

      case 'natural':
        if (schedule.parsed) {
          // TODO: Calculate from parsed cron
          return new Date(Date.now() + 60000);
        }
        return undefined;

      case 'dependent':
        // Dependent jobs are triggered by other jobs
        return undefined;

      default:
        return undefined;
    }
  }

  // ============================================================================
  // Logging
  // ============================================================================

  private log(
    logs: JobRunLog[],
    level: JobRunLog['level'],
    message: string,
    data?: unknown
  ): void {
    const entry: JobRunLog = {
      timestamp: new Date(),
      level,
      message,
      data,
    };

    logs.push(entry);

    // Also log to console
    const prefix = `[Worker ${this.workerId}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, message);
        break;
      case 'info':
        console.log(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      case 'error':
        console.error(prefix, message);
        break;
    }
  }

  // ============================================================================
  // Executor Registration
  // ============================================================================

  /**
   * Register a custom job executor
   */
  registerExecutor(payloadType: string, executor: JobExecutor): void {
    this.executors.set(payloadType, executor);
  }

  /**
   * Register default executors
   */
  private registerDefaultExecutors(): void {
    // Default executors are handled in executePayload
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Set callback for job start
   */
  setOnJobStart(callback: (job: X2000ScheduledJob, runId: string) => void): void {
    this.onJobStart = callback;
  }

  /**
   * Set callback for job completion
   */
  setOnJobComplete(callback: (job: X2000ScheduledJob, result: unknown) => void): void {
    this.onJobComplete = callback;
  }

  /**
   * Set callback for job error
   */
  setOnJobError(callback: (job: X2000ScheduledJob, error: Error) => void): void {
    this.onJobError = callback;
  }

  // ============================================================================
  // Status
  // ============================================================================

  /**
   * Get worker status
   */
  getStatus(): WorkerInfo {
    return {
      ...this.workerInfo,
      currentJobs: this.runningJobs.size,
      lastHeartbeat: new Date(),
    };
  }

  /**
   * Get running job IDs
   */
  getRunningJobIds(): string[] {
    return [...this.runningJobs.keys()];
  }

  /**
   * Cancel a running job
   */
  cancelJob(jobId: string): boolean {
    const controller = this.runningJobs.get(jobId);
    if (controller) {
      controller.abort();
      return true;
    }
    return false;
  }
}

// Export factory function
export function createWorker(config?: WorkerConfig): SchedulerWorker {
  return new SchedulerWorker(config);
}
