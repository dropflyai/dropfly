/**
 * Retry Logic and Dead Letter Queue Management
 * Implements exponential backoff with jitter and DLQ handling
 */

import type {
  BackoffStrategy,
  RetryPolicy,
  Duration,
  X2000ScheduledJob,
  DeadLetterJob,
  DeadLetterReason,
} from './types.js';
import { durationToMs } from './natural-language.js';

// ============================================================================
// Retry Calculator
// ============================================================================

export class RetryCalculator {
  /**
   * Calculate the delay before the next retry attempt
   */
  calculateBackoff(
    attempt: number,
    strategy: BackoffStrategy
  ): number {
    switch (strategy.type) {
      case 'fixed':
        return durationToMs(strategy.delay);

      case 'exponential': {
        const base = durationToMs(strategy.initialDelay);
        const max = durationToMs(strategy.maxDelay);
        const delay = base * Math.pow(strategy.multiplier, attempt - 1);
        return Math.min(delay, max);
      }

      case 'exponential-jitter': {
        const base = durationToMs(strategy.initialDelay);
        const max = durationToMs(strategy.maxDelay);
        const exponential = Math.min(
          base * Math.pow(2, attempt - 1),
          max
        );
        // Apply jitter: reduce by up to jitterFactor percentage
        const jitter = exponential * strategy.jitterFactor * Math.random();
        return Math.max(exponential - jitter, base);
      }

      default:
        // Default to 1 second
        return 1000;
    }
  }

  /**
   * Check if an error is retryable based on the retry policy
   */
  isRetryableError(
    error: Error,
    policy: RetryPolicy
  ): boolean {
    const errorType = error.constructor.name;
    const errorMessage = error.message.toLowerCase();

    // Check non-retryable errors first
    if (policy.nonRetryableErrors?.length) {
      for (const pattern of policy.nonRetryableErrors) {
        if (
          errorType.includes(pattern) ||
          errorMessage.includes(pattern.toLowerCase())
        ) {
          return false;
        }
      }
    }

    // Check retryable errors
    if (policy.retryableErrors?.length) {
      for (const pattern of policy.retryableErrors) {
        if (
          errorType.includes(pattern) ||
          errorMessage.includes(pattern.toLowerCase())
        ) {
          return true;
        }
      }
      // If retryable errors are specified but none matched, not retryable
      return false;
    }

    // Default: retry transient errors
    return this.isTransientError(error);
  }

  /**
   * Check if an error is likely transient (network issues, timeouts, etc.)
   */
  private isTransientError(error: Error): boolean {
    const errorType = error.constructor.name;
    const errorMessage = error.message.toLowerCase();

    const transientPatterns = [
      'timeout',
      'econnreset',
      'econnrefused',
      'enotfound',
      'socket hang up',
      'network',
      'temporarily unavailable',
      '503',
      '502',
      '504',
      'service unavailable',
      'too many requests',
      '429',
      'rate limit',
    ];

    return transientPatterns.some(
      (pattern) =>
        errorType.toLowerCase().includes(pattern) ||
        errorMessage.includes(pattern)
    );
  }

  /**
   * Determine if a job should be retried
   */
  shouldRetry(
    job: X2000ScheduledJob,
    error: Error
  ): { retry: boolean; reason: string } {
    const { retry, state } = job;

    // Check attempt count
    if (state.currentAttempt >= retry.maxAttempts) {
      return {
        retry: false,
        reason: `Max attempts (${retry.maxAttempts}) reached`,
      };
    }

    // Check if error is retryable
    if (!this.isRetryableError(error, retry)) {
      return {
        retry: false,
        reason: `Error type not retryable: ${error.constructor.name}`,
      };
    }

    return {
      retry: true,
      reason: `Attempt ${state.currentAttempt + 1} of ${retry.maxAttempts}`,
    };
  }

  /**
   * Calculate the next run time for a retry
   */
  getNextRetryTime(
    job: X2000ScheduledJob
  ): Date {
    const delay = this.calculateBackoff(
      job.state.currentAttempt,
      job.retry.backoff
    );
    return new Date(Date.now() + delay);
  }

  /**
   * Classify error severity for memory/alerting
   */
  classifyErrorSeverity(
    error: Error
  ): 'low' | 'medium' | 'high' | 'critical' {
    const errorType = error.constructor.name;
    const errorMessage = error.message.toLowerCase();

    const criticalPatterns = [
      'authentication',
      'authorization',
      'config',
      'secret',
      'credential',
      'permission denied',
    ];

    const highPatterns = [
      'database',
      'connection failed',
      'system error',
      'internal server',
      '500',
    ];

    const mediumPatterns = [
      'timeout',
      'network',
      'rate limit',
      '429',
    ];

    const check = (patterns: string[]) =>
      patterns.some(
        (p) =>
          errorType.toLowerCase().includes(p) ||
          errorMessage.includes(p)
      );

    if (check(criticalPatterns)) return 'critical';
    if (check(highPatterns)) return 'high';
    if (check(mediumPatterns)) return 'medium';
    return 'low';
  }
}

// ============================================================================
// Dead Letter Queue Manager
// ============================================================================

export class DeadLetterQueueManager {
  private deadLetterJobs: Map<string, DeadLetterJob> = new Map();

  /**
   * Move a job to the dead letter queue
   */
  moveToDeadLetter(
    job: X2000ScheduledJob,
    reason: DeadLetterReason,
    lastError: string
  ): DeadLetterJob {
    const dlqJob: DeadLetterJob = {
      id: `dlq_${job.id}_${Date.now()}`,
      originalJobId: job.id,
      job: { ...job, status: 'dead-letter' },

      failedAt: new Date(),
      reason,

      attempts: job.state.currentAttempt,
      lastError,

      canRetry: this.determineCanRetry(reason, job),
    };

    this.deadLetterJobs.set(dlqJob.id, dlqJob);

    console.log(
      `[DLQ] Job ${job.name} (${job.id}) moved to dead letter queue: ${reason}`
    );

    return dlqJob;
  }

  /**
   * Determine if a dead letter job can be retried
   */
  private determineCanRetry(
    reason: DeadLetterReason,
    job: X2000ScheduledJob
  ): boolean {
    switch (reason) {
      case 'max_retries':
        // Can retry if policy allows DLQ retry
        return true;
      case 'non_retryable_error':
        // Generally cannot retry non-retryable errors
        return false;
      case 'timeout':
        // Timeouts can often be retried with adjusted parameters
        return true;
      case 'manual':
        // Manual moves can be retried
        return true;
      default:
        return false;
    }
  }

  /**
   * Get a dead letter job by ID
   */
  getDeadLetterJob(id: string): DeadLetterJob | undefined {
    return this.deadLetterJobs.get(id);
  }

  /**
   * List dead letter jobs with optional filtering
   */
  listDeadLetterJobs(options?: {
    reason?: DeadLetterReason[];
    canRetry?: boolean;
    limit?: number;
    offset?: number;
  }): { items: DeadLetterJob[]; total: number } {
    let jobs = [...this.deadLetterJobs.values()].filter(
      (job) => !job.purgedAt
    );

    if (options?.reason?.length) {
      jobs = jobs.filter((j) => options.reason!.includes(j.reason));
    }

    if (options?.canRetry !== undefined) {
      jobs = jobs.filter((j) => j.canRetry === options.canRetry);
    }

    // Sort by failed time descending
    jobs.sort((a, b) => b.failedAt.getTime() - a.failedAt.getTime());

    const total = jobs.length;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 100;

    return {
      items: jobs.slice(offset, offset + limit),
      total,
    };
  }

  /**
   * Mark a dead letter job for retry
   * Returns the job configuration to re-create
   */
  prepareForRetry(
    dlqId: string
  ): X2000ScheduledJob | null {
    const dlqJob = this.deadLetterJobs.get(dlqId);

    if (!dlqJob) {
      console.error(`[DLQ] Job not found: ${dlqId}`);
      return null;
    }

    if (!dlqJob.canRetry) {
      console.error(`[DLQ] Job cannot be retried: ${dlqId}`);
      return null;
    }

    if (dlqJob.purgedAt) {
      console.error(`[DLQ] Job already purged: ${dlqId}`);
      return null;
    }

    // Mark as retried
    dlqJob.retriedAt = new Date();

    // Reset the job state for retry
    const job = { ...dlqJob.job };
    job.status = 'scheduled';
    job.state = {
      ...job.state,
      currentAttempt: 0,
      consecutiveFailures: 0,
      nextRunAt: new Date(),
    };

    console.log(`[DLQ] Job ${job.name} prepared for retry`);

    return job;
  }

  /**
   * Purge a dead letter job (permanent delete)
   */
  purgeDeadLetterJob(dlqId: string): boolean {
    const dlqJob = this.deadLetterJobs.get(dlqId);

    if (!dlqJob) {
      return false;
    }

    dlqJob.purgedAt = new Date();
    console.log(`[DLQ] Job purged: ${dlqId}`);

    return true;
  }

  /**
   * Get DLQ statistics
   */
  getStats(): {
    total: number;
    byReason: Record<DeadLetterReason, number>;
    canRetry: number;
    purged: number;
  } {
    const jobs = [...this.deadLetterJobs.values()];

    const byReason: Record<DeadLetterReason, number> = {
      max_retries: 0,
      non_retryable_error: 0,
      timeout: 0,
      manual: 0,
    };

    let canRetry = 0;
    let purged = 0;

    for (const job of jobs) {
      byReason[job.reason]++;
      if (job.canRetry && !job.purgedAt) canRetry++;
      if (job.purgedAt) purged++;
    }

    return {
      total: jobs.filter((j) => !j.purgedAt).length,
      byReason,
      canRetry,
      purged,
    };
  }

  /**
   * Generate a recommendation for a dead letter job
   */
  generateRecommendation(dlqJob: DeadLetterJob): string {
    switch (dlqJob.reason) {
      case 'max_retries':
        return 'Consider increasing max attempts or investigating the root cause of failures';

      case 'non_retryable_error':
        if (dlqJob.lastError.toLowerCase().includes('authentication')) {
          return 'Check and refresh authentication credentials';
        }
        if (dlqJob.lastError.toLowerCase().includes('validation')) {
          return 'Review input payload schema and data format';
        }
        return 'Review the error and fix the underlying issue before retrying';

      case 'timeout':
        return 'Consider increasing job timeout or breaking into smaller tasks';

      case 'manual':
        return 'Job was manually moved to DLQ. Review and retry when ready.';

      default:
        return 'Review error logs and consider adding error handling';
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const retryCalculator = new RetryCalculator();
export const deadLetterQueueManager = new DeadLetterQueueManager();
