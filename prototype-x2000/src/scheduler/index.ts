/**
 * X2000 Scheduler
 * Enterprise-grade job scheduling system with distributed execution
 */

import { v4 as uuidv4 } from 'uuid';
import {
  DEFAULT_RETRY_POLICY,
  DEFAULT_TIMEZONE,
  type X2000ScheduledJob,
  type JobRun,
  type JobSchedule,
  type JobPayload,
  type JobStatus,
  type JobFilter,
  type CreateJobInput,
  type UpdateJobInput,
  type PaginatedResult,
  type RunQueryOptions,
  type DLQFilter,
  type DeadLetterJob,
  type WorkerInfo,
  type SchedulerStatus,
  type JobMetrics,
  type TimeWindow,
  type RetryPolicy,
  type ParsedSchedule,
  type ParseOptions,
} from './types.js';
import { schedulerPersistence } from './persistence.js';
import { naturalLanguageParser, durationToMs } from './natural-language.js';
import { retryCalculator, deadLetterQueueManager } from './retry.js';
import { SchedulerWorker, createWorker } from './worker.js';
import type { BrainType } from '../types/index.js';

// ============================================================================
// Scheduler Service Interface
// ============================================================================

export interface SchedulerService {
  // Job Management
  createJob(input: CreateJobInput, context: JobContext): Promise<X2000ScheduledJob>;
  updateJob(id: string, patch: UpdateJobInput): Promise<X2000ScheduledJob>;
  deleteJob(id: string): Promise<{ deleted: boolean }>;
  getJob(id: string): Promise<X2000ScheduledJob | null>;
  listJobs(filter?: JobFilter): Promise<PaginatedResult<X2000ScheduledJob>>;

  // Job Control
  pauseJob(id: string, reason?: string): Promise<X2000ScheduledJob>;
  resumeJob(id: string): Promise<X2000ScheduledJob>;
  triggerJob(id: string): Promise<JobRun>;
  cancelJob(id: string): Promise<{ cancelled: boolean }>;

  // History & Observability
  getJobRuns(jobId: string, options?: RunQueryOptions): Promise<PaginatedResult<JobRun>>;
  getJobMetrics(jobId: string, window: TimeWindow): Promise<JobMetrics>;
  getStatus(): Promise<SchedulerStatus>;

  // Dead Letter Queue
  listDeadLetterJobs(filter?: DLQFilter): Promise<PaginatedResult<DeadLetterJob>>;
  retryDeadLetterJob(id: string): Promise<X2000ScheduledJob>;
  purgeDeadLetterJob(id: string): Promise<{ purged: boolean }>;

  // Natural Language
  parseSchedule(input: string, timezone?: string): Promise<ParsedSchedule>;
  describeSchedule(schedule: JobSchedule): string;

  // Worker Management
  registerWorker(worker: WorkerInfo): Promise<{ registered: boolean }>;
  workerHeartbeat(workerId: string): Promise<void>;
  listWorkers(): Promise<WorkerInfo[]>;

  // Lifecycle
  start(): Promise<void>;
  stop(): Promise<void>;
}

// ============================================================================
// Types
// ============================================================================

export interface JobContext {
  brainType: BrainType;
  agentId?: string;
  sessionId: string;
}

export interface SchedulerConfig {
  tickIntervalMs?: number;
  maxWorkers?: number;
  workerConcurrency?: number;
  enableAutoWorker?: boolean;
}

// ============================================================================
// Scheduler Implementation
// ============================================================================

export class X2000Scheduler implements SchedulerService {
  private readonly tickIntervalMs: number;
  private readonly maxWorkers: number;
  private readonly workerConcurrency: number;
  private readonly enableAutoWorker: boolean;

  private running = false;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private startedAt: Date | null = null;
  private workers: Map<string, SchedulerWorker> = new Map();
  private autoWorker: SchedulerWorker | null = null;

  constructor(config: SchedulerConfig = {}) {
    this.tickIntervalMs = config.tickIntervalMs ?? 1000;
    this.maxWorkers = config.maxWorkers ?? 10;
    this.workerConcurrency = config.workerConcurrency ?? 10;
    this.enableAutoWorker = config.enableAutoWorker ?? true;
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  async start(): Promise<void> {
    if (this.running) {
      console.log('[Scheduler] Already running');
      return;
    }

    console.log('[Scheduler] Starting...');

    // Initialize persistence
    await schedulerPersistence.initialize();

    this.running = true;
    this.startedAt = new Date();

    // Start scheduler tick
    this.startTick();

    // Start auto worker if enabled
    if (this.enableAutoWorker) {
      this.autoWorker = createWorker({
        workerId: 'auto_worker',
        maxConcurrent: this.workerConcurrency,
      });
      await this.autoWorker.start();
      this.workers.set('auto_worker', this.autoWorker);
    }

    console.log('[Scheduler] Started');
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    console.log('[Scheduler] Stopping...');

    this.running = false;

    // Stop tick
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    // Stop all workers
    for (const worker of this.workers.values()) {
      await worker.stop();
    }
    this.workers.clear();

    console.log('[Scheduler] Stopped');
  }

  private startTick(): void {
    this.tickInterval = setInterval(async () => {
      await this.tick();
    }, this.tickIntervalMs);
  }

  private async tick(): Promise<void> {
    if (!this.running) {
      return;
    }

    try {
      // Find jobs that are due
      const now = new Date();
      const dueJobs = await schedulerPersistence.getScheduledJobs(now);

      // Jobs will be picked up by workers through polling
      // The tick just ensures job state is up to date

      // Clean up expired jobs
      const jobs = await schedulerPersistence.listJobs({
        status: ['scheduled', 'paused'],
      });

      for (const job of jobs.items) {
        if (job.lifecycle.expiresAt && job.lifecycle.expiresAt <= now) {
          await schedulerPersistence.deleteJob(job.id);
          console.log(`[Scheduler] Expired job deleted: ${job.name}`);
        }
      }

      // Remove stale workers
      await schedulerPersistence.removeStaleWorkers(5);
    } catch (error) {
      console.error('[Scheduler] Tick error:', error);
    }
  }

  // ============================================================================
  // Job Management
  // ============================================================================

  async createJob(
    input: CreateJobInput,
    context: JobContext
  ): Promise<X2000ScheduledJob> {
    // Parse schedule if string
    let schedule: JobSchedule;
    if (typeof input.schedule === 'string') {
      const parsed = this.parseScheduleSync(input.schedule, input.timezone);
      if (parsed.confidence < 0.5) {
        throw new Error(
          `Could not parse schedule: "${input.schedule}". ${parsed.warnings?.join(' ')}`
        );
      }
      schedule = parsed.schedule;
    } else {
      schedule = input.schedule;
    }

    // Build retry policy
    const retry: RetryPolicy = {
      ...DEFAULT_RETRY_POLICY,
      ...input.retry,
    };

    // Calculate next run time
    const nextRunAt = this.calculateNextRunTime(schedule);

    const job: X2000ScheduledJob = {
      id: uuidv4(),
      name: input.name,
      description: input.description,
      tags: input.tags ?? [],

      createdBy: {
        brainType: context.brainType,
        agentId: context.agentId,
        sessionId: context.sessionId,
      },

      schedule,
      timezone: input.timezone ?? DEFAULT_TIMEZONE,

      payload: input.payload,

      retry,

      status: 'scheduled',
      lifecycle: {
        enabled: input.enabled ?? true,
        expiresAt: input.expiresAt,
        deleteAfterCompletion: input.deleteAfterCompletion ?? false,
      },

      state: {
        nextRunAt,
        runCount: 0,
        successCount: 0,
        failureCount: 0,
        consecutiveFailures: 0,
        currentAttempt: 0,
      },

      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      },

      learnFromOutcome: input.learnFromOutcome ?? true,
    };

    await schedulerPersistence.saveJob(job);

    console.log(`[Scheduler] Job created: ${job.name} (${job.id})`);

    return job;
  }

  async updateJob(
    id: string,
    patch: UpdateJobInput
  ): Promise<X2000ScheduledJob> {
    const job = await schedulerPersistence.getJob(id);

    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }

    // Apply updates
    if (patch.name !== undefined) job.name = patch.name;
    if (patch.description !== undefined) job.description = patch.description;
    if (patch.tags !== undefined) job.tags = patch.tags;
    if (patch.timezone !== undefined) job.timezone = patch.timezone;
    if (patch.payload !== undefined) job.payload = patch.payload;
    if (patch.enabled !== undefined) job.lifecycle.enabled = patch.enabled;
    if (patch.expiresAt !== undefined) job.lifecycle.expiresAt = patch.expiresAt;
    if (patch.deleteAfterCompletion !== undefined) {
      job.lifecycle.deleteAfterCompletion = patch.deleteAfterCompletion;
    }

    // Update schedule
    if (patch.schedule !== undefined) {
      if (typeof patch.schedule === 'string') {
        const parsed = this.parseScheduleSync(patch.schedule, job.timezone);
        if (parsed.confidence < 0.5) {
          throw new Error(`Could not parse schedule: "${patch.schedule}"`);
        }
        job.schedule = parsed.schedule;
      } else {
        job.schedule = patch.schedule;
      }

      // Recalculate next run time
      job.state.nextRunAt = this.calculateNextRunTime(job.schedule);
    }

    // Update retry policy
    if (patch.retry !== undefined) {
      job.retry = {
        ...job.retry,
        ...patch.retry,
      };
    }

    job.metadata.updatedAt = new Date();
    job.metadata.version++;

    await schedulerPersistence.saveJob(job);

    console.log(`[Scheduler] Job updated: ${job.name} (${job.id})`);

    return job;
  }

  async deleteJob(id: string): Promise<{ deleted: boolean }> {
    const job = await schedulerPersistence.getJob(id);

    if (!job) {
      return { deleted: false };
    }

    // Cancel if running
    if (job.status === 'running') {
      await this.cancelJob(id);
    }

    await schedulerPersistence.deleteJob(id);

    console.log(`[Scheduler] Job deleted: ${job.name} (${id})`);

    return { deleted: true };
  }

  async getJob(id: string): Promise<X2000ScheduledJob | null> {
    return schedulerPersistence.getJob(id);
  }

  async listJobs(filter?: JobFilter): Promise<PaginatedResult<X2000ScheduledJob>> {
    return schedulerPersistence.listJobs(filter ?? {});
  }

  // ============================================================================
  // Job Control
  // ============================================================================

  async pauseJob(id: string, reason?: string): Promise<X2000ScheduledJob> {
    const job = await schedulerPersistence.getJob(id);

    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }

    if (job.status === 'running') {
      // Cancel the running execution
      await this.cancelJob(id);
    }

    job.status = 'paused';
    job.lifecycle.pausedAt = new Date();
    job.lifecycle.pausedReason = reason;
    job.metadata.updatedAt = new Date();

    await schedulerPersistence.saveJob(job);

    console.log(`[Scheduler] Job paused: ${job.name} (${id})`);

    return job;
  }

  async resumeJob(id: string): Promise<X2000ScheduledJob> {
    const job = await schedulerPersistence.getJob(id);

    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }

    if (job.status !== 'paused') {
      throw new Error(`Job is not paused: ${job.status}`);
    }

    job.status = 'scheduled';
    job.lifecycle.pausedAt = undefined;
    job.lifecycle.pausedReason = undefined;
    job.state.nextRunAt = this.calculateNextRunTime(job.schedule);
    job.metadata.updatedAt = new Date();

    await schedulerPersistence.saveJob(job);

    console.log(`[Scheduler] Job resumed: ${job.name} (${id})`);

    return job;
  }

  async triggerJob(id: string): Promise<JobRun> {
    const job = await schedulerPersistence.getJob(id);

    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }

    // Create an immediate run
    const run: JobRun = {
      id: uuidv4(),
      jobId: job.id,
      jobName: job.name,
      status: 'running',
      scheduledAt: new Date(),
      attempt: 1,
      input: job.payload,
      logs: [],
    };

    // Set job to run immediately
    job.state.nextRunAt = new Date();
    job.status = 'scheduled';
    await schedulerPersistence.saveJob(job);

    console.log(`[Scheduler] Job triggered: ${job.name} (${id})`);

    // Return the run (will be picked up by worker)
    return run;
  }

  async cancelJob(id: string): Promise<{ cancelled: boolean }> {
    const job = await schedulerPersistence.getJob(id);

    if (!job) {
      return { cancelled: false };
    }

    // Try to cancel in workers
    let cancelled = false;
    for (const worker of this.workers.values()) {
      if (worker.cancelJob(id)) {
        cancelled = true;
        break;
      }
    }

    // Update job status
    if (job.status === 'running') {
      job.status = 'cancelled';
      job.state.lockedBy = undefined;
      job.state.lockedAt = undefined;
      job.metadata.updatedAt = new Date();
      await schedulerPersistence.saveJob(job);
    }

    console.log(`[Scheduler] Job cancelled: ${job.name} (${id})`);

    return { cancelled: true };
  }

  // ============================================================================
  // History & Observability
  // ============================================================================

  async getJobRuns(
    jobId: string,
    options?: RunQueryOptions
  ): Promise<PaginatedResult<JobRun>> {
    return schedulerPersistence.getJobRuns(jobId, options ?? {});
  }

  async getJobMetrics(
    jobId: string,
    window: TimeWindow
  ): Promise<JobMetrics> {
    const runs = await this.getJobRuns(jobId, { limit: 1000 });

    const filteredRuns = runs.items.filter(
      (r) =>
        r.scheduledAt >= window.start && r.scheduledAt <= window.end
    );

    const durations = filteredRuns
      .filter((r) => r.duration?.milliseconds)
      .map((r) => r.duration!.milliseconds!)
      .sort((a, b) => a - b);

    const errorCounts: Record<string, number> = {};
    for (const run of filteredRuns.filter((r) => r.error)) {
      const code = run.error!.code ?? 'unknown';
      errorCounts[code] = (errorCounts[code] ?? 0) + 1;
    }

    const successfulRuns = filteredRuns.filter(
      (r) => r.status === 'completed'
    ).length;
    const failedRuns = filteredRuns.filter(
      (r) => r.status === 'failed'
    ).length;
    const cancelledRuns = filteredRuns.filter(
      (r) => r.status === 'cancelled'
    ).length;

    return {
      jobId,
      window,
      totalRuns: filteredRuns.length,
      successfulRuns,
      failedRuns,
      cancelledRuns,
      avgDuration: durations.length
        ? { milliseconds: durations.reduce((a, b) => a + b, 0) / durations.length }
        : { milliseconds: 0 },
      p50Duration: { milliseconds: this.percentile(durations, 50) },
      p95Duration: { milliseconds: this.percentile(durations, 95) },
      p99Duration: { milliseconds: this.percentile(durations, 99) },
      successRate: filteredRuns.length
        ? successfulRuns / filteredRuns.length
        : 0,
      lastSuccess: filteredRuns
        .filter((r) => r.status === 'completed')
        .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())[0]
        ?.scheduledAt,
      lastFailure: filteredRuns
        .filter((r) => r.status === 'failed')
        .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())[0]
        ?.scheduledAt,
      errorBreakdown: errorCounts,
    };
  }

  async getStatus(): Promise<SchedulerStatus> {
    const jobCounts = await schedulerPersistence.getJobCounts();
    const workers = await schedulerPersistence.listWorkers();
    const activeWorkers = workers.filter((w) => w.status === 'active');

    // Get recent errors from runs
    const allJobs = await schedulerPersistence.listJobs({ status: ['failed'] });
    const recentErrors = allJobs.items
      .filter((j) => j.state.lastResult?.error)
      .slice(0, 10)
      .map((j) => ({
        jobId: j.id,
        error: j.state.lastResult!.error!,
        timestamp: j.state.lastRunAt!,
      }));

    // Find next scheduled run
    const scheduledJobs = await schedulerPersistence.listJobs({
      status: ['scheduled'],
    });
    const nextRun = scheduledJobs.items
      .filter((j) => j.state.nextRunAt)
      .sort((a, b) => a.state.nextRunAt!.getTime() - b.state.nextRunAt!.getTime())[0];

    return {
      healthy: this.running && activeWorkers.length > 0,
      activeWorkers: activeWorkers.length,
      totalWorkers: workers.length,
      jobCounts,
      uptime: this.startedAt
        ? { milliseconds: Date.now() - this.startedAt.getTime() }
        : { milliseconds: 0 },
      nextScheduledRun: nextRun?.state.nextRunAt,
      recentErrors,
    };
  }

  // ============================================================================
  // Dead Letter Queue
  // ============================================================================

  async listDeadLetterJobs(
    filter?: DLQFilter
  ): Promise<PaginatedResult<DeadLetterJob>> {
    return schedulerPersistence.listDeadLetterJobs(filter ?? {});
  }

  async retryDeadLetterJob(dlqId: string): Promise<X2000ScheduledJob> {
    const job = deadLetterQueueManager.prepareForRetry(dlqId);

    if (!job) {
      throw new Error(`Cannot retry DLQ job: ${dlqId}`);
    }

    // Generate new ID for the retried job
    job.id = uuidv4();
    job.metadata.createdAt = new Date();
    job.metadata.updatedAt = new Date();
    job.metadata.version = 1;

    await schedulerPersistence.saveJob(job);

    console.log(`[Scheduler] DLQ job retried: ${job.name} (${job.id})`);

    return job;
  }

  async purgeDeadLetterJob(dlqId: string): Promise<{ purged: boolean }> {
    const purged = deadLetterQueueManager.purgeDeadLetterJob(dlqId);
    return { purged };
  }

  // ============================================================================
  // Natural Language
  // ============================================================================

  async parseSchedule(
    input: string,
    timezone?: string
  ): Promise<ParsedSchedule> {
    return naturalLanguageParser.parseScheduleInput(input, { timezone });
  }

  describeSchedule(schedule: JobSchedule): string {
    return naturalLanguageParser.describeSchedule(schedule);
  }

  private parseScheduleSync(
    input: string,
    timezone?: string
  ): ParsedSchedule {
    return naturalLanguageParser.parseScheduleInput(input, { timezone });
  }

  // ============================================================================
  // Worker Management
  // ============================================================================

  async registerWorker(worker: WorkerInfo): Promise<{ registered: boolean }> {
    await schedulerPersistence.registerWorker(worker);
    return { registered: true };
  }

  async workerHeartbeat(workerId: string): Promise<void> {
    await schedulerPersistence.updateWorkerHeartbeat(workerId);
  }

  async listWorkers(): Promise<WorkerInfo[]> {
    return schedulerPersistence.listWorkers();
  }

  /**
   * Add a worker to the scheduler
   */
  addWorker(worker: SchedulerWorker): void {
    const info = worker.getStatus();
    this.workers.set(info.id, worker);
  }

  /**
   * Remove a worker from the scheduler
   */
  removeWorker(workerId: string): void {
    this.workers.delete(workerId);
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private calculateNextRunTime(schedule: JobSchedule): Date | undefined {
    const now = new Date();

    switch (schedule.type) {
      case 'once':
        return schedule.at > now ? schedule.at : undefined;

      case 'interval': {
        const intervalMs = durationToMs(schedule.every);
        const start = schedule.startAt || now;
        let next = new Date(start);
        while (next <= now) {
          next = new Date(next.getTime() + intervalMs);
        }
        return next;
      }

      case 'cron': {
        // Simple approximation - in production would use proper cron calculation
        // For now, return 1 minute from now
        return new Date(now.getTime() + 60000);
      }

      case 'natural':
        if (schedule.parsed) {
          // Parse the cron expression
          return new Date(now.getTime() + 60000);
        }
        return undefined;

      case 'dependent':
        // Dependent jobs are triggered by other jobs
        return undefined;

      default:
        return undefined;
    }
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

// ============================================================================
// Factory and Exports
// ============================================================================

let defaultScheduler: X2000Scheduler | null = null;

/**
 * Get the default scheduler instance
 */
export function getScheduler(): X2000Scheduler {
  if (!defaultScheduler) {
    defaultScheduler = new X2000Scheduler();
  }
  return defaultScheduler;
}

/**
 * Create a new scheduler instance
 */
export function createScheduler(config?: SchedulerConfig): X2000Scheduler {
  return new X2000Scheduler(config);
}

// Re-export types and utilities
export * from './types.js';
export { naturalLanguageParser, durationToMs, msToDuration } from './natural-language.js';
export { retryCalculator, deadLetterQueueManager } from './retry.js';
export { schedulerPersistence } from './persistence.js';
export { SchedulerWorker, createWorker } from './worker.js';
