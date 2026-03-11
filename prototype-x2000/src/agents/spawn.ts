/**
 * X2000 Agent Spawner
 *
 * Creates and manages AI agents with:
 * - Parallel execution with Promise.allSettled
 * - Concurrency limits to prevent overload
 * - Execution pooling for resource management
 * - Priority queuing for important tasks
 */

import type { BrainType, TrustLevel, Task } from '../types/index.js';
import { AgentLoop, type AgentLoopConfig, type AgentLoopResult } from './loop.js';

// ============================================================================
// Types
// ============================================================================

export interface SpawnConfig {
  brainType: BrainType | string;
  trustLevel: TrustLevel;
  parentId?: string;
  context?: Record<string, unknown>;
  loopConfig?: Partial<AgentLoopConfig>;
  /** Priority for execution (higher = more important) */
  priority?: number;
}

export interface SpawnedAgent {
  id: string;
  brainType: BrainType | string;
  trustLevel: TrustLevel;
  parentId?: string;
  status: 'idle' | 'queued' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: AgentLoopResult;
  priority: number;
  queuePosition?: number;
}

export interface ParallelExecutionConfig {
  /** Maximum concurrent agents (default: 5) */
  maxConcurrency: number;
  /** Timeout for entire batch in ms (default: 10 minutes) */
  batchTimeout: number;
  /** Continue execution even if some agents fail */
  continueOnError: boolean;
  /** Callback for progress updates */
  onProgress?: (completed: number, total: number, agent: SpawnedAgent) => void;
}

export interface ParallelExecutionResult {
  successful: Array<{ agent: SpawnedAgent; result: AgentLoopResult }>;
  failed: Array<{ agent: SpawnedAgent; error: Error }>;
  totalDuration: number;
  completionRate: number;
}

interface QueuedTask {
  agent: SpawnedAgent;
  task: Task;
  config: SpawnConfig;
  resolve: (result: AgentLoopResult) => void;
  reject: (error: Error) => void;
}

// ============================================================================
// Execution Pool (Manages Concurrency)
// ============================================================================

export class ExecutionPool {
  private activeCount = 0;
  private queue: QueuedTask[] = [];
  private maxConcurrency: number;

  constructor(maxConcurrency: number = 5) {
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * Get current pool stats
   */
  getStats(): { active: number; queued: number; maxConcurrency: number } {
    return {
      active: this.activeCount,
      queued: this.queue.length,
      maxConcurrency: this.maxConcurrency,
    };
  }

  /**
   * Update max concurrency dynamically
   */
  setMaxConcurrency(max: number): void {
    this.maxConcurrency = Math.max(1, max);
    this.processQueue();
  }

  /**
   * Submit a task to the pool
   */
  submit(agent: SpawnedAgent, task: Task, config: SpawnConfig): Promise<AgentLoopResult> {
    return new Promise((resolve, reject) => {
      const queuedTask: QueuedTask = {
        agent,
        task,
        config,
        resolve,
        reject,
      };

      agent.status = 'queued';
      agent.queuePosition = this.queue.length;

      // Insert by priority (higher priority = earlier in queue)
      const priority = config.priority ?? 0;
      let insertIndex = this.queue.length;
      for (let i = 0; i < this.queue.length; i++) {
        if ((this.queue[i].config.priority ?? 0) < priority) {
          insertIndex = i;
          break;
        }
      }
      this.queue.splice(insertIndex, 0, queuedTask);

      // Update queue positions
      this.updateQueuePositions();

      // Try to process immediately if capacity available
      this.processQueue();
    });
  }

  /**
   * Update queue position for all waiting tasks
   */
  private updateQueuePositions(): void {
    for (let i = 0; i < this.queue.length; i++) {
      this.queue[i].agent.queuePosition = i;
    }
  }

  /**
   * Process queue items up to concurrency limit
   */
  private processQueue(): void {
    while (this.activeCount < this.maxConcurrency && this.queue.length > 0) {
      const queuedTask = this.queue.shift()!;
      this.executeTask(queuedTask);
    }
    this.updateQueuePositions();
  }

  /**
   * Execute a single task
   */
  private async executeTask(queuedTask: QueuedTask): Promise<void> {
    const { agent, task, config, resolve, reject } = queuedTask;

    this.activeCount++;
    agent.status = 'running';
    agent.startedAt = new Date();
    agent.queuePosition = undefined;

    try {
      const loop = new AgentLoop({
        brainType: agent.brainType,
        trustLevel: agent.trustLevel,
        ...config.loopConfig,
      });

      const result = await loop.run(task);

      agent.status = result.success ? 'completed' : 'failed';
      agent.completedAt = new Date();
      agent.result = result;

      resolve(result);
    } catch (error) {
      agent.status = 'failed';
      agent.completedAt = new Date();
      reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }

  /**
   * Cancel all queued tasks
   */
  cancelAllQueued(): number {
    const cancelledCount = this.queue.length;
    for (const task of this.queue) {
      task.agent.status = 'failed';
      task.reject(new Error('Task cancelled'));
    }
    this.queue = [];
    return cancelledCount;
  }

  /**
   * Wait for all active tasks to complete
   */
  async drain(): Promise<void> {
    while (this.activeCount > 0 || this.queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

// ============================================================================
// Agent Spawner Class
// ============================================================================

export class AgentSpawner {
  private agents: Map<string, SpawnedAgent> = new Map();
  private counter = 0;
  private pool: ExecutionPool;

  constructor(maxConcurrency: number = 5) {
    this.pool = new ExecutionPool(maxConcurrency);
  }

  /**
   * Spawn a new agent
   */
  spawn(config: SpawnConfig): SpawnedAgent {
    const id = `agent-${++this.counter}-${Date.now()}`;

    const agent: SpawnedAgent = {
      id,
      brainType: config.brainType,
      trustLevel: config.trustLevel,
      parentId: config.parentId,
      status: 'idle',
      createdAt: new Date(),
      priority: config.priority ?? 0,
    };

    this.agents.set(id, agent);
    return agent;
  }

  /**
   * Execute a single agent (uses execution pool)
   */
  async execute(agentId: string, task: Task): Promise<AgentLoopResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    return this.pool.submit(agent, task, {
      brainType: agent.brainType,
      trustLevel: agent.trustLevel,
      priority: agent.priority,
    });
  }

  /**
   * Spawn and execute an agent
   */
  async spawnAndExecute(config: SpawnConfig, task: Task): Promise<AgentLoopResult> {
    const agent = this.spawn(config);
    return this.pool.submit(agent, task, config);
  }

  /**
   * Execute multiple agents in parallel with concurrency control
   */
  async executeParallel(
    tasks: Array<{ config: SpawnConfig; task: Task }>,
    options: Partial<ParallelExecutionConfig> = {}
  ): Promise<ParallelExecutionResult> {
    const config: ParallelExecutionConfig = {
      maxConcurrency: options.maxConcurrency ?? 5,
      batchTimeout: options.batchTimeout ?? 10 * 60 * 1000,
      continueOnError: options.continueOnError ?? true,
      onProgress: options.onProgress,
    };

    const startTime = Date.now();
    const successful: ParallelExecutionResult['successful'] = [];
    const failed: ParallelExecutionResult['failed'] = [];
    let completedCount = 0;

    // Create a temporary pool with the specified concurrency
    const tempPool = new ExecutionPool(config.maxConcurrency);

    // Spawn all agents and submit to pool
    const promises = tasks.map(({ config: spawnConfig, task }) => {
      const agent = this.spawn(spawnConfig);
      return tempPool
        .submit(agent, task, spawnConfig)
        .then((result) => {
          successful.push({ agent, result });
          completedCount++;
          config.onProgress?.(completedCount, tasks.length, agent);
        })
        .catch((error: Error) => {
          failed.push({ agent, error });
          completedCount++;
          config.onProgress?.(completedCount, tasks.length, agent);
          if (!config.continueOnError) {
            throw error;
          }
        });
    });

    // Wait for all with timeout
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Batch execution timeout')), config.batchTimeout);
    });

    try {
      await Promise.race([Promise.allSettled(promises), timeoutPromise]);
    } catch (error) {
      // Timeout reached - cancel remaining
      tempPool.cancelAllQueued();
    }

    return {
      successful,
      failed,
      totalDuration: Date.now() - startTime,
      completionRate: successful.length / tasks.length,
    };
  }

  /**
   * Execute subtasks for a parent task in parallel
   * Uses Promise.allSettled for resilience
   */
  async executeSubtasks(
    parentId: string,
    subtasks: Array<{ config: SpawnConfig; task: Task }>,
    options: Partial<ParallelExecutionConfig> = {}
  ): Promise<ParallelExecutionResult> {
    // Add parent ID to all configs
    const tasksWithParent = subtasks.map(({ config, task }) => ({
      config: { ...config, parentId },
      task,
    }));

    return this.executeParallel(tasksWithParent, options);
  }

  /**
   * Fan-out: Spawn multiple agents for the same task (e.g., different brains)
   */
  async fanOut(
    brainTypes: Array<BrainType | string>,
    task: Task,
    baseConfig: Omit<SpawnConfig, 'brainType'>,
    options: Partial<ParallelExecutionConfig> = {}
  ): Promise<ParallelExecutionResult> {
    const tasks = brainTypes.map((brainType) => ({
      config: { ...baseConfig, brainType },
      task,
    }));

    return this.executeParallel(tasks, options);
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): { active: number; queued: number; maxConcurrency: number } {
    return this.pool.getStats();
  }

  /**
   * Update pool concurrency
   */
  setPoolConcurrency(max: number): void {
    this.pool.setMaxConcurrency(max);
  }

  /**
   * Get agent by ID
   */
  get(agentId: string): SpawnedAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAll(): SpawnedAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by parent ID
   */
  getByParent(parentId: string): SpawnedAgent[] {
    return this.getAll().filter((a) => a.parentId === parentId);
  }

  /**
   * Get agents by status
   */
  getByStatus(status: SpawnedAgent['status']): SpawnedAgent[] {
    return this.getAll().filter((a) => a.status === status);
  }

  /**
   * Get agents by brain type
   */
  getByBrainType(brainType: BrainType | string): SpawnedAgent[] {
    return this.getAll().filter((a) => a.brainType === brainType);
  }

  /**
   * Get execution metrics
   */
  getMetrics(): {
    total: number;
    byStatus: Record<SpawnedAgent['status'], number>;
    averageDuration: number;
    successRate: number;
  } {
    const agents = this.getAll();
    const completed = agents.filter(
      (a) => a.status === 'completed' || a.status === 'failed'
    );

    const byStatus: Record<SpawnedAgent['status'], number> = {
      idle: 0,
      queued: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    for (const agent of agents) {
      byStatus[agent.status]++;
    }

    let totalDuration = 0;
    let durationCount = 0;
    for (const agent of completed) {
      if (agent.startedAt && agent.completedAt) {
        totalDuration += agent.completedAt.getTime() - agent.startedAt.getTime();
        durationCount++;
      }
    }

    return {
      total: agents.length,
      byStatus,
      averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
      successRate:
        completed.length > 0 ? byStatus.completed / completed.length : 0,
    };
  }

  /**
   * Clear completed/failed agents from memory
   */
  cleanup(olderThanMs: number = 60 * 60 * 1000): number {
    const cutoff = Date.now() - olderThanMs;
    let removed = 0;

    for (const [id, agent] of this.agents.entries()) {
      if (
        (agent.status === 'completed' || agent.status === 'failed') &&
        agent.completedAt &&
        agent.completedAt.getTime() < cutoff
      ) {
        this.agents.delete(id);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Wait for all running tasks to complete
   */
  async drain(): Promise<void> {
    await this.pool.drain();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const agentSpawner = new AgentSpawner();
