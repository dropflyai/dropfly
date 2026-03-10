/**
 * Supabase Persistence Layer
 * Handles persistent storage for the X2000 memory system
 * Supports offline mode with queued writes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type {
  Pattern,
  Learning,
  Skill,
  Decision,
  BrainType,
} from '../types/index.js';
import { config, getSupabaseConfig } from '../config/env.js';

// ============================================================================
// Types
// ============================================================================

export type MemoryItemType = 'pattern' | 'learning' | 'skill' | 'decision';

interface QueuedOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  createdAt: Date;
  retryCount: number;
}

interface SyncStatus {
  lastSyncAt: Date | null;
  pendingOperations: number;
  isOnline: boolean;
  lastError: string | null;
}

interface DatabasePattern {
  id: string;
  name: string;
  description: string;
  trigger: string;
  solution: string;
  context: string[];
  success_rate: number;
  usage_count: number;
  created_by: string;
  created_at: string;
  last_used_at: string;
  tags: string[];
  [key: string]: unknown;
}

interface DatabaseLearning {
  id: string;
  type: string;
  source: string;
  task_id: string;
  description: string;
  root_cause: string | null;
  recommendation: string;
  confidence: number;
  created_at: string;
  applied_count: number;
  tags: string[];
  [key: string]: unknown;
}

interface DatabaseSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  implementation: string;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  created_by: string;
  adopted_by: string[];
  usage_count: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// ============================================================================
// Persistence Manager
// ============================================================================

export class PersistenceManager {
  private client: SupabaseClient | null = null;
  private operationQueue: Map<string, QueuedOperation> = new Map();
  private syncStatus: SyncStatus = {
    lastSyncAt: null,
    pendingOperations: 0,
    isOnline: false,
    lastError: null,
  };
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  // Table names
  private readonly TABLES = {
    patterns: 'shared_patterns',
    learnings: 'brain_learnings',
    skills: 'shared_experiences',
    decisions: 'brain_learnings', // Decisions stored with learnings
  } as const;

  constructor() {
    // Initialize on first use
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the persistence layer
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.syncStatus.isOnline;
    }

    const supabaseConfig = getSupabaseConfig();

    if (!supabaseConfig) {
      console.log('[Persistence] Supabase not configured - running in offline mode');
      this.syncStatus.isOnline = false;
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

      // Test connection
      const { error } = await this.client
        .from(this.TABLES.patterns)
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      this.syncStatus.isOnline = true;
      this.isInitialized = true;

      // Start sync interval
      this.startSyncInterval();

      console.log('[Persistence] Connected to Supabase');
      return true;
    } catch (error) {
      console.error('[Persistence] Failed to connect:', error);
      this.syncStatus.isOnline = false;
      this.syncStatus.lastError = String(error);
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Check if persistence is available
   */
  isOnline(): boolean {
    return this.syncStatus.isOnline && this.client !== null;
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
    return {
      ...this.syncStatus,
      pendingOperations: this.operationQueue.size,
    };
  }

  // ============================================================================
  // Pattern Operations
  // ============================================================================

  /**
   * Save a pattern to Supabase
   */
  async savePattern(pattern: Pattern): Promise<boolean> {
    const dbPattern: DatabasePattern = {
      id: pattern.id,
      name: pattern.name,
      description: pattern.description,
      trigger: pattern.trigger,
      solution: pattern.solution,
      context: pattern.context,
      success_rate: pattern.successRate,
      usage_count: pattern.usageCount,
      created_by: pattern.createdBy,
      created_at: pattern.createdAt.toISOString(),
      last_used_at: pattern.lastUsedAt.toISOString(),
      tags: pattern.tags,
    };

    return this.upsert(this.TABLES.patterns, dbPattern);
  }

  /**
   * Load patterns from Supabase
   */
  async loadPatterns(options?: {
    brainType?: BrainType;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Pattern[]> {
    if (!this.isOnline()) {
      return [];
    }

    try {
      let query = this.client!.from(this.TABLES.patterns).select('*');

      if (options?.brainType) {
        query = query.eq('created_by', options.brainType);
      }

      if (options?.tags?.length) {
        query = query.overlaps('tags', options.tags);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 100) - 1);
      }

      query = query.order('success_rate', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data as DatabasePattern[]).map(this.dbToPattern);
    } catch (error) {
      console.error('[Persistence] Failed to load patterns:', error);
      this.syncStatus.lastError = String(error);
      return [];
    }
  }

  /**
   * Update pattern usage statistics
   */
  async updatePatternUsage(
    patternId: string,
    success: boolean
  ): Promise<boolean> {
    if (!this.isOnline()) {
      this.queueOperation({
        type: 'update',
        table: this.TABLES.patterns,
        data: {
          id: patternId,
          _increment_usage: true,
          _success: success,
          last_used_at: new Date().toISOString(),
        },
      });
      return true;
    }

    try {
      // Fetch current stats
      const { data: current, error: fetchError } = await this.client!
        .from(this.TABLES.patterns)
        .select('usage_count, success_rate')
        .eq('id', patternId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Calculate new success rate with exponential moving average
      const alpha = 0.1;
      const newSuccessRate =
        current.success_rate * (1 - alpha) + (success ? 1 : 0) * alpha;

      const { error } = await this.client!
        .from(this.TABLES.patterns)
        .update({
          usage_count: current.usage_count + 1,
          success_rate: newSuccessRate,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', patternId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[Persistence] Failed to update pattern usage:', error);
      return false;
    }
  }

  // ============================================================================
  // Learning Operations
  // ============================================================================

  /**
   * Save a learning to Supabase
   */
  async saveLearning(learning: Learning): Promise<boolean> {
    const dbLearning: DatabaseLearning = {
      id: learning.id,
      type: learning.type,
      source: learning.source,
      task_id: learning.taskId,
      description: learning.description,
      root_cause: learning.rootCause ?? null,
      recommendation: learning.recommendation,
      confidence: learning.confidence,
      created_at: learning.createdAt.toISOString(),
      applied_count: learning.appliedCount,
      tags: learning.tags,
    };

    return this.upsert(this.TABLES.learnings, dbLearning);
  }

  /**
   * Load learnings from Supabase
   */
  async loadLearnings(options?: {
    brainType?: BrainType;
    type?: 'success' | 'failure' | 'insight';
    tags?: string[];
    minConfidence?: number;
    limit?: number;
  }): Promise<Learning[]> {
    if (!this.isOnline()) {
      return [];
    }

    try {
      let query = this.client!.from(this.TABLES.learnings).select('*');

      if (options?.brainType) {
        query = query.eq('source', options.brainType);
      }

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.tags?.length) {
        query = query.overlaps('tags', options.tags);
      }

      if (options?.minConfidence !== undefined) {
        query = query.gte('confidence', options.minConfidence);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data as DatabaseLearning[]).map(this.dbToLearning);
    } catch (error) {
      console.error('[Persistence] Failed to load learnings:', error);
      this.syncStatus.lastError = String(error);
      return [];
    }
  }

  /**
   * Increment learning application count
   */
  async recordLearningApplication(learningId: string): Promise<boolean> {
    if (!this.isOnline()) {
      this.queueOperation({
        type: 'update',
        table: this.TABLES.learnings,
        data: { id: learningId, _increment_applied: true },
      });
      return true;
    }

    try {
      const { data: current, error: fetchError } = await this.client!
        .from(this.TABLES.learnings)
        .select('applied_count')
        .eq('id', learningId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const { error } = await this.client!
        .from(this.TABLES.learnings)
        .update({ applied_count: current.applied_count + 1 })
        .eq('id', learningId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[Persistence] Failed to record learning application:', error);
      return false;
    }
  }

  // ============================================================================
  // Skill Operations
  // ============================================================================

  /**
   * Save a skill to Supabase
   */
  async saveSkill(skill: Skill): Promise<boolean> {
    const dbSkill: DatabaseSkill = {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      implementation: skill.implementation,
      input_schema: skill.inputSchema,
      output_schema: skill.outputSchema,
      created_by: skill.createdBy,
      adopted_by: skill.adoptedBy,
      usage_count: skill.usageCount,
      success_rate: skill.successRate,
      created_at: skill.createdAt.toISOString(),
      updated_at: skill.updatedAt.toISOString(),
    };

    return this.upsert(this.TABLES.skills, dbSkill);
  }

  /**
   * Load skills from Supabase
   */
  async loadSkills(options?: {
    brainType?: BrainType;
    category?: string;
    minSuccessRate?: number;
    limit?: number;
  }): Promise<Skill[]> {
    if (!this.isOnline()) {
      return [];
    }

    try {
      let query = this.client!.from(this.TABLES.skills).select('*');

      if (options?.brainType) {
        query = query.contains('adopted_by', [options.brainType]);
      }

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.minSuccessRate !== undefined) {
        query = query.gte('success_rate', options.minSuccessRate);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('usage_count', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data as DatabaseSkill[]).map(this.dbToSkill);
    } catch (error) {
      console.error('[Persistence] Failed to load skills:', error);
      this.syncStatus.lastError = String(error);
      return [];
    }
  }

  /**
   * Record skill adoption
   */
  async recordSkillAdoption(
    skillId: string,
    brainType: BrainType
  ): Promise<boolean> {
    if (!this.isOnline()) {
      this.queueOperation({
        type: 'update',
        table: this.TABLES.skills,
        data: { id: skillId, _add_adopter: brainType },
      });
      return true;
    }

    try {
      const { data: current, error: fetchError } = await this.client!
        .from(this.TABLES.skills)
        .select('adopted_by')
        .eq('id', skillId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (current.adopted_by.includes(brainType)) {
        return true; // Already adopted
      }

      const { error } = await this.client!
        .from(this.TABLES.skills)
        .update({
          adopted_by: [...current.adopted_by, brainType],
          updated_at: new Date().toISOString(),
        })
        .eq('id', skillId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[Persistence] Failed to record skill adoption:', error);
      return false;
    }
  }

  /**
   * Update skill usage statistics
   */
  async updateSkillUsage(skillId: string, success: boolean): Promise<boolean> {
    if (!this.isOnline()) {
      this.queueOperation({
        type: 'update',
        table: this.TABLES.skills,
        data: {
          id: skillId,
          _increment_usage: true,
          _success: success,
        },
      });
      return true;
    }

    try {
      const { data: current, error: fetchError } = await this.client!
        .from(this.TABLES.skills)
        .select('usage_count, success_rate')
        .eq('id', skillId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const alpha = 0.1;
      const newSuccessRate =
        current.success_rate * (1 - alpha) + (success ? 1 : 0) * alpha;

      const { error } = await this.client!
        .from(this.TABLES.skills)
        .update({
          usage_count: current.usage_count + 1,
          success_rate: newSuccessRate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', skillId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[Persistence] Failed to update skill usage:', error);
      return false;
    }
  }

  // ============================================================================
  // Decision Operations
  // ============================================================================

  /**
   * Save a decision to Supabase (stored as a learning with type 'decision')
   */
  async saveDecision(decision: Decision): Promise<boolean> {
    // Convert decision to learning format for storage
    const decisionLearning: DatabaseLearning = {
      id: decision.id,
      type: 'decision',
      source: decision.participants[0],
      task_id: '',
      description: decision.description,
      root_cause: decision.rationale,
      recommendation: `Selected: ${decision.selectedOption}. Options: ${decision.options.map((o) => o.description).join(', ')}`,
      confidence: decision.outcome === 'positive' ? 1.0 : decision.outcome === 'negative' ? 0.0 : 0.5,
      created_at: decision.createdAt.toISOString(),
      applied_count: 0,
      tags: ['decision', ...decision.participants],
    };

    return this.upsert(this.TABLES.decisions, decisionLearning);
  }

  // ============================================================================
  // Search Operations
  // ============================================================================

  /**
   * Full-text search across memory
   */
  async search(
    query: string,
    options?: {
      types?: MemoryItemType[];
      limit?: number;
    }
  ): Promise<{
    patterns: Pattern[];
    learnings: Learning[];
    skills: Skill[];
  }> {
    if (!this.isOnline()) {
      return { patterns: [], learnings: [], skills: [] };
    }

    const results = {
      patterns: [] as Pattern[],
      learnings: [] as Learning[],
      skills: [] as Skill[],
    };

    const types = options?.types ?? ['pattern', 'learning', 'skill'];
    const limit = options?.limit ?? 10;

    try {
      // Search patterns
      if (types.includes('pattern')) {
        const { data: patterns } = await this.client!
          .from(this.TABLES.patterns)
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,trigger.ilike.%${query}%`)
          .limit(limit);

        if (patterns) {
          results.patterns = (patterns as DatabasePattern[]).map(this.dbToPattern);
        }
      }

      // Search learnings
      if (types.includes('learning')) {
        const { data: learnings } = await this.client!
          .from(this.TABLES.learnings)
          .select('*')
          .or(`description.ilike.%${query}%,recommendation.ilike.%${query}%`)
          .limit(limit);

        if (learnings) {
          results.learnings = (learnings as DatabaseLearning[]).map(this.dbToLearning);
        }
      }

      // Search skills
      if (types.includes('skill')) {
        const { data: skills } = await this.client!
          .from(this.TABLES.skills)
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(limit);

        if (skills) {
          results.skills = (skills as DatabaseSkill[]).map(this.dbToSkill);
        }
      }
    } catch (error) {
      console.error('[Persistence] Search failed:', error);
      this.syncStatus.lastError = String(error);
    }

    return results;
  }

  // ============================================================================
  // Offline Queue Management
  // ============================================================================

  /**
   * Queue an operation for later sync
   */
  private queueOperation(
    operation: Omit<QueuedOperation, 'id' | 'createdAt' | 'retryCount'>
  ): void {
    if (this.operationQueue.size >= config.memory.offlineQueueMax) {
      // Remove oldest operation
      const oldest = [...this.operationQueue.entries()].sort(
        (a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime()
      )[0];
      if (oldest) {
        this.operationQueue.delete(oldest[0]);
        console.warn('[Persistence] Queue full, dropped oldest operation');
      }
    }

    const id = uuidv4();
    this.operationQueue.set(id, {
      ...operation,
      id,
      createdAt: new Date(),
      retryCount: 0,
    });

    this.syncStatus.pendingOperations = this.operationQueue.size;
    console.log(`[Persistence] Queued operation: ${operation.type} on ${operation.table}`);
  }

  /**
   * Process the offline queue
   */
  async processQueue(): Promise<{ processed: number; failed: number }> {
    if (!this.isOnline() || this.operationQueue.size === 0) {
      return { processed: 0, failed: 0 };
    }

    let processed = 0;
    let failed = 0;

    for (const [id, operation] of this.operationQueue.entries()) {
      try {
        const success = await this.executeQueuedOperation(operation);
        if (success) {
          this.operationQueue.delete(id);
          processed++;
        } else {
          operation.retryCount++;
          if (operation.retryCount >= 3) {
            this.operationQueue.delete(id);
            failed++;
            console.error('[Persistence] Operation failed after 3 retries:', operation);
          }
        }
      } catch (error) {
        operation.retryCount++;
        failed++;
        console.error('[Persistence] Failed to process queued operation:', error);
      }
    }

    this.syncStatus.pendingOperations = this.operationQueue.size;
    this.syncStatus.lastSyncAt = new Date();

    if (processed > 0 || failed > 0) {
      console.log(`[Persistence] Queue processed: ${processed} succeeded, ${failed} failed`);
    }

    return { processed, failed };
  }

  /**
   * Execute a single queued operation
   */
  private async executeQueuedOperation(
    operation: QueuedOperation
  ): Promise<boolean> {
    if (!this.client) return false;

    const { type, table, data } = operation;

    try {
      switch (type) {
        case 'insert':
        case 'update': {
          // Handle special increment operations
          if (data._increment_usage || data._increment_applied || data._add_adopter) {
            // Need to fetch current value first
            const { data: current } = await this.client
              .from(table)
              .select('*')
              .eq('id', data.id)
              .single();

            if (!current) return false;

            const updates: Record<string, unknown> = {};

            if (data._increment_usage) {
              updates.usage_count = (current.usage_count ?? 0) + 1;
              if (data._success !== undefined) {
                const alpha = 0.1;
                updates.success_rate =
                  (current.success_rate ?? 1) * (1 - alpha) +
                  (data._success ? 1 : 0) * alpha;
              }
            }

            if (data._increment_applied) {
              updates.applied_count = (current.applied_count ?? 0) + 1;
            }

            if (data._add_adopter) {
              const adopters = current.adopted_by ?? [];
              if (!adopters.includes(data._add_adopter)) {
                updates.adopted_by = [...adopters, data._add_adopter];
              }
            }

            if (data.last_used_at) {
              updates.last_used_at = data.last_used_at;
            }

            updates.updated_at = new Date().toISOString();

            const { error } = await this.client
              .from(table)
              .update(updates)
              .eq('id', data.id);

            return !error;
          }

          // Regular upsert
          const { error } = await this.client.from(table).upsert(data);
          return !error;
        }

        case 'delete': {
          const { error } = await this.client
            .from(table)
            .delete()
            .eq('id', data.id);
          return !error;
        }

        default:
          return false;
      }
    } catch (error) {
      console.error('[Persistence] Execute operation failed:', error);
      return false;
    }
  }

  // ============================================================================
  // Sync Management
  // ============================================================================

  /**
   * Start periodic sync
   */
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      await this.processQueue();
    }, config.memory.syncIntervalMs);
  }

  /**
   * Stop periodic sync
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Force sync now
   */
  async forceSync(): Promise<{ processed: number; failed: number }> {
    // Check connection first
    if (this.client) {
      try {
        const { error } = await this.client
          .from(this.TABLES.patterns)
          .select('id')
          .limit(1);

        this.syncStatus.isOnline = !error;
        if (error) {
          this.syncStatus.lastError = String(error);
        }
      } catch (error) {
        this.syncStatus.isOnline = false;
        this.syncStatus.lastError = String(error);
      }
    }

    return this.processQueue();
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Generic upsert operation
   */
  private async upsert(
    table: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    if (!this.isOnline()) {
      this.queueOperation({ type: 'insert', table, data });
      return true;
    }

    try {
      const { error } = await this.client!.from(table).upsert(data);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`[Persistence] Upsert failed for ${table}:`, error);
      this.queueOperation({ type: 'insert', table, data });
      return false;
    }
  }

  /**
   * Convert database pattern to application pattern
   */
  private dbToPattern(db: DatabasePattern): Pattern {
    return {
      id: db.id,
      name: db.name,
      description: db.description,
      trigger: db.trigger,
      solution: db.solution,
      context: db.context,
      successRate: db.success_rate,
      usageCount: db.usage_count,
      createdBy: db.created_by as BrainType,
      createdAt: new Date(db.created_at),
      lastUsedAt: new Date(db.last_used_at),
      tags: db.tags,
    };
  }

  /**
   * Convert database learning to application learning
   */
  private dbToLearning(db: DatabaseLearning): Learning {
    return {
      id: db.id,
      type: db.type as 'success' | 'failure' | 'insight',
      source: db.source as BrainType,
      taskId: db.task_id,
      description: db.description,
      rootCause: db.root_cause ?? undefined,
      recommendation: db.recommendation,
      confidence: db.confidence,
      createdAt: new Date(db.created_at),
      appliedCount: db.applied_count,
      tags: db.tags,
    };
  }

  /**
   * Convert database skill to application skill
   */
  private dbToSkill(db: DatabaseSkill): Skill {
    return {
      id: db.id,
      name: db.name,
      description: db.description,
      category: db.category,
      implementation: db.implementation,
      inputSchema: db.input_schema,
      outputSchema: db.output_schema,
      createdBy: db.created_by as BrainType,
      adoptedBy: db.adopted_by as BrainType[],
      usageCount: db.usage_count,
      successRate: db.success_rate,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown(): Promise<void> {
    this.stopSync();
    await this.processQueue();
    console.log('[Persistence] Shutdown complete');
  }
}

// Export singleton instance
export const persistenceManager = new PersistenceManager();
