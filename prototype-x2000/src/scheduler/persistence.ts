/**
 * Scheduler Persistence Layer
 * PostgreSQL/Supabase integration for job state persistence
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type {
  X2000ScheduledJob,
  JobRun,
  DeadLetterJob,
  WorkerInfo,
  DatabaseJob,
  DatabaseJobRun,
  DatabaseDeadLetterJob,
  DatabaseWorker,
  JobStatus,
  JobFilter,
  PaginatedResult,
  RunQueryOptions,
  DLQFilter,
} from './types.js';
import { getSupabaseConfig } from '../config/env.js';
import type { BrainType } from '../types/index.js';

// ============================================================================
// Database Table Names
// ============================================================================

const TABLES = {
  jobs: 'scheduled_jobs',
  runs: 'job_runs',
  deadLetter: 'dead_letter_jobs',
  workers: 'scheduler_workers',
} as const;

// ============================================================================
// Type Conversion Utilities
// ============================================================================

function dbToJob(db: DatabaseJob): X2000ScheduledJob {
  return {
    id: db.id,
    name: db.name,
    description: db.description ?? undefined,
    tags: db.tags,

    createdBy: {
      brainType: db.created_by_brain as BrainType,
      agentId: db.created_by_agent_id ?? undefined,
      sessionId: db.created_by_session_id,
    },

    schedule: db.schedule as X2000ScheduledJob['schedule'],
    timezone: db.timezone,

    payload: db.payload as unknown as X2000ScheduledJob['payload'],

    retry: {
      maxAttempts: db.retry_max_attempts,
      backoff: db.retry_backoff as unknown as X2000ScheduledJob['retry']['backoff'],
      deadLetterQueue: db.retry_dead_letter,
    },

    status: db.status as JobStatus,
    lifecycle: {
      enabled: db.enabled,
      pausedAt: db.paused_at ? new Date(db.paused_at) : undefined,
      pausedReason: db.paused_reason ?? undefined,
      expiresAt: db.expires_at ? new Date(db.expires_at) : undefined,
      deleteAfterCompletion: db.delete_after_completion,
    },

    state: {
      nextRunAt: db.next_run_at ? new Date(db.next_run_at) : undefined,
      lastRunAt: db.last_run_at ? new Date(db.last_run_at) : undefined,
      lastResult: db.last_result as unknown as X2000ScheduledJob['state']['lastResult'],
      runCount: db.run_count,
      successCount: db.success_count,
      failureCount: db.failure_count,
      consecutiveFailures: db.consecutive_failures,
      currentAttempt: db.current_attempt,
      lockedBy: db.locked_by ?? undefined,
      lockedAt: db.locked_at ? new Date(db.locked_at) : undefined,
    },

    metadata: {
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
      version: db.version,
      correlationId: db.correlation_id ?? undefined,
    },

    learnFromOutcome: db.learn_from_outcome,
  };
}

function jobToDb(job: X2000ScheduledJob): DatabaseJob {
  return {
    id: job.id,
    name: job.name,
    description: job.description ?? null,
    tags: job.tags,

    created_by_brain: job.createdBy.brainType,
    created_by_agent_id: job.createdBy.agentId ?? null,
    created_by_session_id: job.createdBy.sessionId,

    schedule: job.schedule as unknown as Record<string, unknown>,
    timezone: job.timezone,

    payload: job.payload as unknown as Record<string, unknown>,

    retry_max_attempts: job.retry.maxAttempts,
    retry_backoff: job.retry.backoff as unknown as Record<string, unknown>,
    retry_dead_letter: job.retry.deadLetterQueue,

    status: job.status,
    enabled: job.lifecycle.enabled,
    paused_at: job.lifecycle.pausedAt?.toISOString() ?? null,
    paused_reason: job.lifecycle.pausedReason ?? null,
    expires_at: job.lifecycle.expiresAt?.toISOString() ?? null,
    delete_after_completion: job.lifecycle.deleteAfterCompletion,

    next_run_at: job.state.nextRunAt?.toISOString() ?? null,
    last_run_at: job.state.lastRunAt?.toISOString() ?? null,
    last_result: job.state.lastResult as unknown as Record<string, unknown> | null,
    run_count: job.state.runCount,
    success_count: job.state.successCount,
    failure_count: job.state.failureCount,
    consecutive_failures: job.state.consecutiveFailures,
    current_attempt: job.state.currentAttempt,
    locked_by: job.state.lockedBy ?? null,
    locked_at: job.state.lockedAt?.toISOString() ?? null,

    created_at: job.metadata.createdAt.toISOString(),
    updated_at: job.metadata.updatedAt.toISOString(),
    version: job.metadata.version,
    correlation_id: job.metadata.correlationId ?? null,

    learn_from_outcome: job.learnFromOutcome,
  };
}

function dbToJobRun(db: DatabaseJobRun): JobRun {
  return {
    id: db.id,
    jobId: db.job_id,
    jobName: db.job_name,

    status: db.status as JobRun['status'],

    scheduledAt: new Date(db.scheduled_at),
    startedAt: db.started_at ? new Date(db.started_at) : undefined,
    completedAt: db.completed_at ? new Date(db.completed_at) : undefined,

    duration: db.duration_ms
      ? { milliseconds: db.duration_ms }
      : undefined,
    attempt: db.attempt,

    workerId: db.worker_id ?? undefined,

    input: db.input as unknown as JobRun['input'],
    output: db.output ?? undefined,
    error: db.error as unknown as JobRun['error'],

    logs: (db.logs || []).map((log) => ({
      timestamp: new Date((log as Record<string, unknown>).timestamp as string),
      level: (log as Record<string, unknown>).level as JobRun['logs'][0]['level'],
      message: (log as Record<string, unknown>).message as string,
      data: (log as Record<string, unknown>).data,
    })),
  };
}

function dbToDeadLetterJob(db: DatabaseDeadLetterJob): DeadLetterJob {
  return {
    id: db.id,
    originalJobId: db.original_job_id,
    job: db.job_snapshot as unknown as X2000ScheduledJob,

    failedAt: new Date(db.failed_at),
    reason: db.reason as DeadLetterJob['reason'],

    attempts: db.attempts,
    lastError: db.last_error,

    canRetry: db.can_retry,
    retriedAt: db.retried_at ? new Date(db.retried_at) : undefined,
    purgedAt: db.purged_at ? new Date(db.purged_at) : undefined,
  };
}

function dbToWorker(db: DatabaseWorker): WorkerInfo {
  return {
    id: db.id,
    hostname: db.hostname,
    pid: db.pid ?? undefined,

    capabilities: db.capabilities,
    maxConcurrent: db.max_concurrent,
    currentJobs: db.current_jobs,

    registeredAt: new Date(db.registered_at),
    lastHeartbeat: new Date(db.last_heartbeat),

    status: db.status as WorkerInfo['status'],
  };
}

// ============================================================================
// Scheduler Persistence Manager
// ============================================================================

export class SchedulerPersistenceManager {
  private client: SupabaseClient | null = null;
  private isInitialized = false;
  private isOnline = false;

  // In-memory fallback for offline mode
  private memoryJobs: Map<string, X2000ScheduledJob> = new Map();
  private memoryRuns: Map<string, JobRun> = new Map();
  private memoryDLQ: Map<string, DeadLetterJob> = new Map();
  private memoryWorkers: Map<string, WorkerInfo> = new Map();

  // ============================================================================
  // Initialization
  // ============================================================================

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.isOnline;
    }

    const supabaseConfig = getSupabaseConfig();

    if (!supabaseConfig) {
      console.log('[SchedulerPersistence] Supabase not configured - running in memory mode');
      this.isOnline = false;
      this.isInitialized = true;
      return false;
    }

    try {
      this.client = createClient(supabaseConfig.url, supabaseConfig.key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      // Test connection - try to select from scheduled_jobs
      // If table doesn't exist, we'll still work in memory mode
      const { error } = await this.client
        .from(TABLES.jobs)
        .select('id')
        .limit(1);

      if (error) {
        // Table might not exist yet
        if (error.message.includes('does not exist')) {
          console.log('[SchedulerPersistence] Tables not found - running in memory mode');
          console.log('[SchedulerPersistence] Run migrations to enable persistence');
          this.isOnline = false;
        } else {
          throw error;
        }
      } else {
        this.isOnline = true;
        console.log('[SchedulerPersistence] Connected to Supabase');
      }

      this.isInitialized = true;
      return this.isOnline;
    } catch (error) {
      console.error('[SchedulerPersistence] Failed to connect:', error);
      this.isOnline = false;
      this.isInitialized = true;
      return false;
    }
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  // ============================================================================
  // Job Operations
  // ============================================================================

  async saveJob(job: X2000ScheduledJob): Promise<boolean> {
    // Always save to memory
    this.memoryJobs.set(job.id, job);

    if (!this.isOnline || !this.client) {
      return true;
    }

    try {
      const dbJob = jobToDb(job);
      const { error } = await this.client
        .from(TABLES.jobs)
        .upsert(dbJob);

      if (error) {
        console.error('[SchedulerPersistence] Failed to save job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[SchedulerPersistence] Error saving job:', error);
      return false;
    }
  }

  async getJob(id: string): Promise<X2000ScheduledJob | null> {
    // Check memory first
    const memJob = this.memoryJobs.get(id);
    if (memJob) return memJob;

    if (!this.isOnline || !this.client) {
      return null;
    }

    try {
      const { data, error } = await this.client
        .from(TABLES.jobs)
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      const job = dbToJob(data as DatabaseJob);
      this.memoryJobs.set(job.id, job);
      return job;
    } catch (error) {
      console.error('[SchedulerPersistence] Error getting job:', error);
      return null;
    }
  }

  async deleteJob(id: string): Promise<boolean> {
    this.memoryJobs.delete(id);

    if (!this.isOnline || !this.client) {
      return true;
    }

    try {
      const { error } = await this.client
        .from(TABLES.jobs)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[SchedulerPersistence] Failed to delete job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[SchedulerPersistence] Error deleting job:', error);
      return false;
    }
  }

  async listJobs(filter: JobFilter = {}): Promise<PaginatedResult<X2000ScheduledJob>> {
    if (!this.isOnline || !this.client) {
      // Return from memory
      let jobs = [...this.memoryJobs.values()];

      if (filter.status?.length) {
        jobs = jobs.filter((j) => filter.status!.includes(j.status));
      }
      if (filter.tags?.length) {
        jobs = jobs.filter((j) =>
          filter.tags!.some((t) => j.tags.includes(t))
        );
      }
      if (filter.brain?.length) {
        jobs = jobs.filter((j) =>
          filter.brain!.includes(j.createdBy.brainType)
        );
      }

      return {
        items: jobs,
        total: jobs.length,
        offset: 0,
        limit: jobs.length,
        hasMore: false,
      };
    }

    try {
      let query = this.client.from(TABLES.jobs).select('*', { count: 'exact' });

      if (filter.status?.length) {
        query = query.in('status', filter.status);
      }
      if (filter.tags?.length) {
        query = query.overlaps('tags', filter.tags);
      }
      if (filter.brain?.length) {
        query = query.in('created_by_brain', filter.brain);
      }
      if (filter.createdAfter) {
        query = query.gte('created_at', filter.createdAfter.toISOString());
      }
      if (filter.createdBefore) {
        query = query.lte('created_at', filter.createdBefore.toISOString());
      }
      if (filter.nextRunBefore) {
        query = query.lte('next_run_at', filter.nextRunBefore.toISOString());
      }
      if (filter.search) {
        query = query.or(
          `name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`
        );
      }

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const jobs = (data as DatabaseJob[]).map(dbToJob);

      // Update memory cache
      for (const job of jobs) {
        this.memoryJobs.set(job.id, job);
      }

      return {
        items: jobs,
        total: count ?? jobs.length,
        offset: 0,
        limit: jobs.length,
        hasMore: false,
      };
    } catch (error) {
      console.error('[SchedulerPersistence] Error listing jobs:', error);
      return {
        items: [...this.memoryJobs.values()],
        total: this.memoryJobs.size,
        offset: 0,
        limit: this.memoryJobs.size,
        hasMore: false,
      };
    }
  }

  async getScheduledJobs(beforeTime: Date): Promise<X2000ScheduledJob[]> {
    if (!this.isOnline || !this.client) {
      return [...this.memoryJobs.values()].filter(
        (j) =>
          j.status === 'scheduled' &&
          j.lifecycle.enabled &&
          j.state.nextRunAt &&
          j.state.nextRunAt <= beforeTime
      );
    }

    try {
      const { data, error } = await this.client
        .from(TABLES.jobs)
        .select('*')
        .eq('status', 'scheduled')
        .eq('enabled', true)
        .lte('next_run_at', beforeTime.toISOString())
        .is('locked_by', null)
        .order('next_run_at', { ascending: true });

      if (error) {
        throw error;
      }

      return (data as DatabaseJob[]).map(dbToJob);
    } catch (error) {
      console.error('[SchedulerPersistence] Error getting scheduled jobs:', error);
      return [];
    }
  }

  async acquireJob(workerId: string): Promise<X2000ScheduledJob | null> {
    if (!this.isOnline || !this.client) {
      // Memory mode: simple lock
      for (const job of this.memoryJobs.values()) {
        if (
          job.status === 'scheduled' &&
          job.lifecycle.enabled &&
          job.state.nextRunAt &&
          job.state.nextRunAt <= new Date() &&
          !job.state.lockedBy
        ) {
          job.state.lockedBy = workerId;
          job.state.lockedAt = new Date();
          job.status = 'running';
          job.state.currentAttempt++;
          return job;
        }
      }
      return null;
    }

    try {
      // Use database function for atomic acquisition
      const { data, error } = await this.client.rpc('acquire_job', {
        p_worker_id: workerId,
      });

      if (error) {
        // Function might not exist, fall back to regular query
        if (error.message.includes('does not exist')) {
          return this.acquireJobFallback(workerId);
        }
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      return dbToJob(data[0] as DatabaseJob);
    } catch (error) {
      console.error('[SchedulerPersistence] Error acquiring job:', error);
      return null;
    }
  }

  private async acquireJobFallback(workerId: string): Promise<X2000ScheduledJob | null> {
    if (!this.client) return null;

    // Simple fallback without stored procedure
    const { data: jobs, error: fetchError } = await this.client
      .from(TABLES.jobs)
      .select('*')
      .eq('status', 'scheduled')
      .eq('enabled', true)
      .lte('next_run_at', new Date().toISOString())
      .is('locked_by', null)
      .order('next_run_at', { ascending: true })
      .limit(1);

    if (fetchError || !jobs || jobs.length === 0) {
      return null;
    }

    const job = jobs[0] as DatabaseJob;

    // Try to lock it
    const { error: updateError } = await this.client
      .from(TABLES.jobs)
      .update({
        locked_by: workerId,
        locked_at: new Date().toISOString(),
        status: 'running',
        current_attempt: job.current_attempt + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id)
      .is('locked_by', null); // Only update if still unlocked

    if (updateError) {
      return null;
    }

    // Re-fetch the updated job
    const { data: updated } = await this.client
      .from(TABLES.jobs)
      .select('*')
      .eq('id', job.id)
      .single();

    return updated ? dbToJob(updated as DatabaseJob) : null;
  }

  async releaseJob(jobId: string): Promise<boolean> {
    const job = this.memoryJobs.get(jobId);
    if (job) {
      job.state.lockedBy = undefined;
      job.state.lockedAt = undefined;
    }

    if (!this.isOnline || !this.client) {
      return true;
    }

    try {
      const { error } = await this.client
        .from(TABLES.jobs)
        .update({
          locked_by: null,
          locked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      return !error;
    } catch (error) {
      console.error('[SchedulerPersistence] Error releasing job:', error);
      return false;
    }
  }

  async releaseStaleLocks(timeoutMinutes: number = 5): Promise<number> {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    // Memory mode
    let released = 0;
    for (const job of this.memoryJobs.values()) {
      if (job.state.lockedAt && job.state.lockedAt < cutoff) {
        job.state.lockedBy = undefined;
        job.state.lockedAt = undefined;
        job.status = 'scheduled';
        released++;
      }
    }

    if (!this.isOnline || !this.client) {
      return released;
    }

    try {
      const { data, error } = await this.client.rpc('release_stale_locks', {
        p_timeout: `${timeoutMinutes} minutes`,
      });

      if (error) {
        // Fallback to regular update
        const { count } = await this.client
          .from(TABLES.jobs)
          .update({
            locked_by: null,
            locked_at: null,
            status: 'scheduled',
          })
          .lt('locked_at', cutoff.toISOString())
          .not('locked_by', 'is', null);

        return count ?? 0;
      }

      return data ?? 0;
    } catch (error) {
      console.error('[SchedulerPersistence] Error releasing stale locks:', error);
      return released;
    }
  }

  // ============================================================================
  // Job Run Operations
  // ============================================================================

  async saveJobRun(run: JobRun): Promise<boolean> {
    this.memoryRuns.set(run.id, run);

    if (!this.isOnline || !this.client) {
      return true;
    }

    try {
      const dbRun: DatabaseJobRun = {
        id: run.id,
        job_id: run.jobId,
        job_name: run.jobName,
        status: run.status,
        scheduled_at: run.scheduledAt.toISOString(),
        started_at: run.startedAt?.toISOString() ?? null,
        completed_at: run.completedAt?.toISOString() ?? null,
        duration_ms: run.duration?.milliseconds ?? null,
        attempt: run.attempt,
        worker_id: run.workerId ?? null,
        input: run.input as unknown as Record<string, unknown>,
        output: run.output as Record<string, unknown> | null,
        error: run.error as unknown as Record<string, unknown> | null,
        logs: run.logs.map((log) => ({
          timestamp: log.timestamp.toISOString(),
          level: log.level,
          message: log.message,
          data: log.data,
        })),
        created_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from(TABLES.runs)
        .upsert(dbRun);

      return !error;
    } catch (error) {
      console.error('[SchedulerPersistence] Error saving job run:', error);
      return false;
    }
  }

  async getJobRuns(
    jobId: string,
    options: RunQueryOptions = {}
  ): Promise<PaginatedResult<JobRun>> {
    if (!this.isOnline || !this.client) {
      let runs = [...this.memoryRuns.values()].filter(
        (r) => r.jobId === jobId
      );

      if (options.status?.length) {
        runs = runs.filter((r) => options.status!.includes(r.status));
      }

      runs.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());

      const offset = options.offset ?? 0;
      const limit = options.limit ?? 100;

      return {
        items: runs.slice(offset, offset + limit),
        total: runs.length,
        offset,
        limit,
        hasMore: offset + limit < runs.length,
      };
    }

    try {
      let query = this.client
        .from(TABLES.runs)
        .select('*', { count: 'exact' })
        .eq('job_id', jobId);

      if (options.status?.length) {
        query = query.in('status', options.status);
      }

      query = query.order('scheduled_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit ?? 100) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const runs = (data as DatabaseJobRun[]).map(dbToJobRun);

      return {
        items: runs,
        total: count ?? runs.length,
        offset: options.offset ?? 0,
        limit: options.limit ?? runs.length,
        hasMore: (options.offset ?? 0) + runs.length < (count ?? runs.length),
      };
    } catch (error) {
      console.error('[SchedulerPersistence] Error getting job runs:', error);
      return { items: [], total: 0, offset: 0, limit: 0, hasMore: false };
    }
  }

  // ============================================================================
  // Dead Letter Queue Operations
  // ============================================================================

  async saveDeadLetterJob(dlqJob: DeadLetterJob): Promise<boolean> {
    this.memoryDLQ.set(dlqJob.id, dlqJob);

    if (!this.isOnline || !this.client) {
      return true;
    }

    try {
      const dbDLQ: DatabaseDeadLetterJob = {
        id: dlqJob.id,
        original_job_id: dlqJob.originalJobId,
        job_snapshot: dlqJob.job as unknown as Record<string, unknown>,
        failed_at: dlqJob.failedAt.toISOString(),
        reason: dlqJob.reason,
        attempts: dlqJob.attempts,
        last_error: dlqJob.lastError,
        can_retry: dlqJob.canRetry,
        retried_at: dlqJob.retriedAt?.toISOString() ?? null,
        purged_at: dlqJob.purgedAt?.toISOString() ?? null,
        created_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from(TABLES.deadLetter)
        .upsert(dbDLQ);

      return !error;
    } catch (error) {
      console.error('[SchedulerPersistence] Error saving DLQ job:', error);
      return false;
    }
  }

  async listDeadLetterJobs(
    filter: DLQFilter = {}
  ): Promise<PaginatedResult<DeadLetterJob>> {
    if (!this.isOnline || !this.client) {
      let jobs = [...this.memoryDLQ.values()].filter((j) => !j.purgedAt);

      if (filter.reason?.length) {
        jobs = jobs.filter((j) => filter.reason!.includes(j.reason));
      }
      if (filter.canRetry !== undefined) {
        jobs = jobs.filter((j) => j.canRetry === filter.canRetry);
      }

      jobs.sort((a, b) => b.failedAt.getTime() - a.failedAt.getTime());

      const offset = filter.offset ?? 0;
      const limit = filter.limit ?? 100;

      return {
        items: jobs.slice(offset, offset + limit),
        total: jobs.length,
        offset,
        limit,
        hasMore: offset + limit < jobs.length,
      };
    }

    try {
      let query = this.client
        .from(TABLES.deadLetter)
        .select('*', { count: 'exact' })
        .is('purged_at', null);

      if (filter.reason?.length) {
        query = query.in('reason', filter.reason);
      }
      if (filter.canRetry !== undefined) {
        query = query.eq('can_retry', filter.canRetry);
      }

      query = query.order('failed_at', { ascending: false });

      if (filter.limit) {
        query = query.limit(filter.limit);
      }
      if (filter.offset) {
        query = query.range(
          filter.offset,
          filter.offset + (filter.limit ?? 100) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const jobs = (data as DatabaseDeadLetterJob[]).map(dbToDeadLetterJob);

      return {
        items: jobs,
        total: count ?? jobs.length,
        offset: filter.offset ?? 0,
        limit: filter.limit ?? jobs.length,
        hasMore:
          (filter.offset ?? 0) + jobs.length < (count ?? jobs.length),
      };
    } catch (error) {
      console.error('[SchedulerPersistence] Error listing DLQ jobs:', error);
      return { items: [], total: 0, offset: 0, limit: 0, hasMore: false };
    }
  }

  // ============================================================================
  // Worker Operations
  // ============================================================================

  async registerWorker(worker: WorkerInfo): Promise<boolean> {
    this.memoryWorkers.set(worker.id, worker);

    if (!this.isOnline || !this.client) {
      return true;
    }

    try {
      const dbWorker: DatabaseWorker = {
        id: worker.id,
        hostname: worker.hostname,
        pid: worker.pid ?? null,
        capabilities: worker.capabilities,
        max_concurrent: worker.maxConcurrent,
        current_jobs: worker.currentJobs,
        registered_at: worker.registeredAt.toISOString(),
        last_heartbeat: worker.lastHeartbeat.toISOString(),
        status: worker.status,
      };

      const { error } = await this.client
        .from(TABLES.workers)
        .upsert(dbWorker);

      return !error;
    } catch (error) {
      console.error('[SchedulerPersistence] Error registering worker:', error);
      return false;
    }
  }

  async updateWorkerHeartbeat(workerId: string): Promise<boolean> {
    const worker = this.memoryWorkers.get(workerId);
    if (worker) {
      worker.lastHeartbeat = new Date();
    }

    if (!this.isOnline || !this.client) {
      return true;
    }

    try {
      const { error } = await this.client
        .from(TABLES.workers)
        .update({ last_heartbeat: new Date().toISOString() })
        .eq('id', workerId);

      return !error;
    } catch (error) {
      console.error('[SchedulerPersistence] Error updating heartbeat:', error);
      return false;
    }
  }

  async listWorkers(): Promise<WorkerInfo[]> {
    if (!this.isOnline || !this.client) {
      return [...this.memoryWorkers.values()];
    }

    try {
      const { data, error } = await this.client
        .from(TABLES.workers)
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data as DatabaseWorker[]).map(dbToWorker);
    } catch (error) {
      console.error('[SchedulerPersistence] Error listing workers:', error);
      return [...this.memoryWorkers.values()];
    }
  }

  async removeStaleWorkers(timeoutMinutes: number = 5): Promise<number> {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    // Memory mode
    let removed = 0;
    for (const [id, worker] of this.memoryWorkers) {
      if (worker.lastHeartbeat < cutoff) {
        this.memoryWorkers.delete(id);
        removed++;
      }
    }

    if (!this.isOnline || !this.client) {
      return removed;
    }

    try {
      const { error } = await this.client
        .from(TABLES.workers)
        .update({ status: 'offline' })
        .lt('last_heartbeat', cutoff.toISOString())
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      return removed;
    } catch (error) {
      console.error('[SchedulerPersistence] Error removing stale workers:', error);
      return removed;
    }
  }

  // ============================================================================
  // Job Counts
  // ============================================================================

  async getJobCounts(): Promise<{
    scheduled: number;
    queued: number;
    running: number;
    paused: number;
    deadLetter: number;
  }> {
    const counts = {
      scheduled: 0,
      queued: 0,
      running: 0,
      paused: 0,
      deadLetter: 0,
    };

    for (const job of this.memoryJobs.values()) {
      switch (job.status) {
        case 'scheduled':
          counts.scheduled++;
          break;
        case 'queued':
          counts.queued++;
          break;
        case 'running':
          counts.running++;
          break;
        case 'paused':
          counts.paused++;
          break;
        case 'dead-letter':
          counts.deadLetter++;
          break;
      }
    }

    if (!this.isOnline || !this.client) {
      return counts;
    }

    try {
      const statuses: JobStatus[] = [
        'scheduled',
        'queued',
        'running',
        'paused',
        'dead-letter',
      ];

      for (const status of statuses) {
        const { count, error } = await this.client
          .from(TABLES.jobs)
          .select('id', { count: 'exact', head: true })
          .eq('status', status);

        if (!error && count !== null) {
          const key = status === 'dead-letter' ? 'deadLetter' : status;
          counts[key as keyof typeof counts] = count;
        }
      }

      return counts;
    } catch (error) {
      console.error('[SchedulerPersistence] Error getting job counts:', error);
      return counts;
    }
  }
}

// Export singleton instance
export const schedulerPersistence = new SchedulerPersistenceManager();
