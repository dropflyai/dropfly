/**
 * Memory Manager
 * Central hub for the forever-learning memory system
 * Manages patterns, learnings, skills, and decisions
 * Supports Supabase persistence with offline mode
 *
 * Performance Optimizations:
 * - LRU cache for frequently accessed patterns
 * - Multi-level indexing (tag, brain, type, confidence)
 * - Batch query support
 * - Cursor-based pagination for large result sets
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Pattern,
  Learning,
  Skill,
  Decision,
  BrainType,
  Task,
  TaskResult,
} from '../types/index.js';
import { persistenceManager, type MemoryItemType } from './persistence.js';
import { patternExtractionEngine } from './extraction.js';
import { config } from '../config/env.js';
import {
  LRUCache,
  cacheKeys,
  queryCacheKey,
  CACHE_TTL,
} from '../cache/index.js';

// ============================================================================
// Types
// ============================================================================

interface MemoryQuery {
  type?: 'pattern' | 'learning' | 'skill' | 'decision';
  brainType?: BrainType;
  tags?: string[];
  dateRange?: { start: Date; end: Date };
  minConfidence?: number;
  limit?: number;
  /** Cursor for pagination (item ID to start after) */
  cursor?: string;
  /** Page size for pagination */
  pageSize?: number;
}

interface PaginatedResult<T> {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

interface BatchQueryRequest {
  id: string;
  query: MemoryQuery;
}

interface BatchQueryResult {
  id: string;
  patterns: Pattern[];
  learnings: Learning[];
  skills: Skill[];
  decisions: Decision[];
}

/** Confidence buckets for fast filtering */
type ConfidenceBucket = 'low' | 'medium' | 'high' | 'excellent';

function getConfidenceBucket(confidence: number): ConfidenceBucket {
  if (confidence >= 0.9) return 'excellent';
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

interface MemoryStats {
  totalPatterns: number;
  totalLearnings: number;
  totalSkills: number;
  totalDecisions: number;
  patternUsageRate: number;
  skillAdoptionRate: number;
  learningApplicationRate: number;
  persistenceStatus: {
    isOnline: boolean;
    pendingOperations: number;
    lastSyncAt: Date | null;
  };
}

interface MemorySearchResult {
  patterns: Pattern[];
  learnings: Learning[];
  skills: Skill[];
  decisions: Decision[];
  relevanceScores: Map<string, number>;
}

// ============================================================================
// Memory Manager Implementation
// ============================================================================

export class MemoryManager {
  private patterns: Map<string, Pattern> = new Map();
  private learnings: Map<string, Learning> = new Map();
  private skills: Map<string, Skill> = new Map();
  private decisions: Map<string, Decision> = new Map();

  // Indices for fast lookups
  private tagIndex: Map<string, Set<string>> = new Map();
  private brainIndex: Map<BrainType, Set<string>> = new Map();
  private typeIndex: Map<string, Set<string>> = new Map();

  // Advanced indices for performance
  private confidenceIndex: Map<ConfidenceBucket, Set<string>> = new Map();
  private dateIndex: Map<string, Set<string>> = new Map(); // YYYY-MM format
  private categoryIndex: Map<string, Set<string>> = new Map(); // For skills

  // LRU Caches for frequently accessed data
  private queryCache!: LRUCache<MemorySearchResult>;
  private patternMatchCache!: LRUCache<Pattern[]>;
  private similarityCache!: LRUCache<Pattern[]>;

  // Initialization state
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  // Sorted arrays for fast pagination
  private sortedPatternIds: string[] = [];
  private sortedLearningIds: string[] = [];
  private sortedSkillIds: string[] = [];
  private sortedDecisionIds: string[] = [];
  private sortedListsDirty = true;

  constructor() {
    this.initializeIndices();
    this.initializeCaches();
  }

  private initializeIndices(): void {
    // Initialize type index with empty sets
    ['pattern', 'learning', 'skill', 'decision'].forEach((type) => {
      this.typeIndex.set(type, new Set());
    });

    // Initialize confidence buckets
    (['low', 'medium', 'high', 'excellent'] as ConfidenceBucket[]).forEach((bucket) => {
      this.confidenceIndex.set(bucket, new Set());
    });
  }

  private initializeCaches(): void {
    // Query result cache - short TTL for freshness
    this.queryCache = new LRUCache<MemorySearchResult>({
      maxSize: 200,
      defaultTtl: CACHE_TTL.MEMORY_QUERIES,
      onEvict: (key, reason) => {
        if (reason === 'ttl') {
          console.debug(`[Memory] Query cache expired: ${key}`);
        }
      },
    });

    // Pattern match cache
    this.patternMatchCache = new LRUCache<Pattern[]>({
      maxSize: 100,
      defaultTtl: CACHE_TTL.PATTERN_MATCHES,
    });

    // Similarity search cache
    this.similarityCache = new LRUCache<Pattern[]>({
      maxSize: 50,
      defaultTtl: CACHE_TTL.PATTERN_MATCHES,
    });
  }

  /**
   * Invalidate caches when data changes
   */
  private invalidateCaches(): void {
    this.queryCache.clear();
    this.patternMatchCache.clear();
    this.similarityCache.clear();
    this.sortedListsDirty = true;
  }

  /**
   * Rebuild sorted lists for pagination
   */
  private rebuildSortedLists(): void {
    if (!this.sortedListsDirty) return;

    // Sort patterns by (successRate * 0.6 + usageCount/100 * 0.4) descending
    this.sortedPatternIds = [...this.patterns.values()]
      .sort((a, b) => {
        const scoreA = a.successRate * 0.6 + (a.usageCount / 100) * 0.4;
        const scoreB = b.successRate * 0.6 + (b.usageCount / 100) * 0.4;
        return scoreB - scoreA;
      })
      .map((p) => p.id);

    // Sort learnings by confidence descending
    this.sortedLearningIds = [...this.learnings.values()]
      .sort((a, b) => b.confidence - a.confidence)
      .map((l) => l.id);

    // Sort skills by adoption count descending
    this.sortedSkillIds = [...this.skills.values()]
      .sort((a, b) => b.adoptedBy.length - a.adoptedBy.length)
      .map((s) => s.id);

    // Sort decisions by date descending
    this.sortedDecisionIds = [...this.decisions.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((d) => d.id);

    this.sortedListsDirty = false;
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the memory manager with persistence
   * Call this before using the memory system for best results
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    console.log('[Memory] Initializing memory manager...');

    // Initialize persistence layer
    const persistenceReady = await persistenceManager.initialize();

    if (persistenceReady) {
      console.log('[Memory] Persistence layer connected, loading from Supabase...');
      await this.loadFromPersistence();
    } else {
      console.log('[Memory] Running in offline mode');
    }

    this.isInitialized = true;
    console.log('[Memory] Initialization complete');
  }

  /**
   * Load memory from persistence layer
   */
  private async loadFromPersistence(): Promise<void> {
    try {
      // Load patterns
      const patterns = await persistenceManager.loadPatterns({ limit: 1000 });
      for (const pattern of patterns) {
        this.patterns.set(pattern.id, pattern);
        this.indexItem(pattern.id, 'pattern', pattern.tags, pattern.createdBy, {
          confidence: pattern.successRate,
          date: pattern.createdAt,
        });
      }
      console.log(`[Memory] Loaded ${patterns.length} patterns from Supabase`);

      // Load learnings
      const learnings = await persistenceManager.loadLearnings({ limit: 1000 });
      for (const learning of learnings) {
        this.learnings.set(learning.id, learning);
        this.indexItem(learning.id, 'learning', learning.tags, learning.source, {
          confidence: learning.confidence,
          date: learning.createdAt,
        });
      }
      console.log(`[Memory] Loaded ${learnings.length} learnings from Supabase`);

      // Load skills
      const skills = await persistenceManager.loadSkills({ limit: 1000 });
      for (const skill of skills) {
        this.skills.set(skill.id, skill);
        this.indexItem(skill.id, 'skill', [skill.category], skill.createdBy, {
          confidence: skill.successRate,
          date: skill.createdAt,
          category: skill.category,
        });
      }
      console.log(`[Memory] Loaded ${skills.length} skills from Supabase`);

      // Rebuild sorted lists after bulk load
      this.sortedListsDirty = true;
      this.rebuildSortedLists();
    } catch (error) {
      console.error('[Memory] Failed to load from persistence:', error);
    }
  }

  /**
   * Check if persistence is available
   */
  isPersistenceOnline(): boolean {
    return persistenceManager.isOnline();
  }

  /**
   * Force sync pending operations
   */
  async forceSync(): Promise<{ processed: number; failed: number }> {
    return persistenceManager.forceSync();
  }

  // ============================================================================
  // Pattern Management
  // ============================================================================

  /**
   * Store a new pattern
   */
  storePattern(pattern: Pattern): void {
    this.patterns.set(pattern.id, pattern);
    this.indexItem(pattern.id, 'pattern', pattern.tags, pattern.createdBy, {
      confidence: pattern.successRate,
      date: pattern.createdAt,
    });
    this.invalidateCaches();
    console.log(`[Memory] Stored pattern: ${pattern.name}`);

    // Persist to Supabase (async, non-blocking)
    persistenceManager.savePattern(pattern).catch((error) => {
      console.error('[Memory] Failed to persist pattern:', error);
    });
  }

  /**
   * Retrieve patterns by query
   */
  queryPatterns(query: MemoryQuery): Pattern[] {
    let results = [...this.patterns.values()];

    if (query.brainType) {
      results = results.filter((p) => p.createdBy === query.brainType);
    }

    if (query.tags?.length) {
      results = results.filter((p) =>
        query.tags!.some((tag) => p.tags.includes(tag))
      );
    }

    if (query.minConfidence !== undefined) {
      results = results.filter((p) => p.successRate >= query.minConfidence!);
    }

    if (query.dateRange) {
      results = results.filter(
        (p) =>
          p.createdAt >= query.dateRange!.start &&
          p.createdAt <= query.dateRange!.end
      );
    }

    // Sort by success rate and usage
    results.sort((a, b) => {
      const scoreA = a.successRate * 0.6 + (a.usageCount / 100) * 0.4;
      const scoreB = b.successRate * 0.6 + (b.usageCount / 100) * 0.4;
      return scoreB - scoreA;
    });

    return query.limit ? results.slice(0, query.limit) : results;
  }

  /**
   * Find patterns similar to a given context
   */
  findSimilarPatterns(context: string, limit: number = 5): Pattern[] {
    const contextWords = context.toLowerCase().split(/\s+/);
    const scored: Array<{ pattern: Pattern; score: number }> = [];

    for (const pattern of this.patterns.values()) {
      const triggerWords = pattern.trigger.toLowerCase().split(/\s+/);
      const descWords = pattern.description.toLowerCase().split(/\s+/);
      const allWords = [...triggerWords, ...descWords, ...pattern.tags];

      const matchCount = contextWords.filter((word) =>
        allWords.some((w) => w.includes(word) || word.includes(w))
      ).length;

      const score = matchCount / contextWords.length;
      if (score > 0.2) {
        scored.push({ pattern, score: score * pattern.successRate });
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.pattern);
  }

  /**
   * Update pattern usage statistics
   */
  recordPatternUsage(patternId: string, success: boolean): void {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return;

    pattern.usageCount++;
    pattern.lastUsedAt = new Date();

    // Update success rate with exponential moving average
    const alpha = 0.1;
    pattern.successRate = pattern.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;

    // Persist usage update
    persistenceManager.updatePatternUsage(patternId, success).catch((error) => {
      console.error('[Memory] Failed to persist pattern usage:', error);
    });
  }

  // ============================================================================
  // Learning Management
  // ============================================================================

  /**
   * Store a new learning
   */
  storeLearning(learning: Learning): void {
    this.learnings.set(learning.id, learning);
    this.indexItem(learning.id, 'learning', learning.tags, learning.source, {
      confidence: learning.confidence,
      date: learning.createdAt,
    });
    this.invalidateCaches();
    console.log(`[Memory] Stored learning: ${learning.description.substring(0, 50)}...`);

    // Persist to Supabase (async, non-blocking)
    persistenceManager.saveLearning(learning).catch((error) => {
      console.error('[Memory] Failed to persist learning:', error);
    });
  }

  /**
   * Query learnings
   */
  queryLearnings(query: MemoryQuery): Learning[] {
    let results = [...this.learnings.values()];

    if (query.brainType) {
      results = results.filter((l) => l.source === query.brainType);
    }

    if (query.tags?.length) {
      results = results.filter((l) =>
        query.tags!.some((tag) => l.tags.includes(tag))
      );
    }

    if (query.minConfidence !== undefined) {
      results = results.filter((l) => l.confidence >= query.minConfidence!);
    }

    // Sort by recency and confidence
    results.sort((a, b) => {
      const scoreA = a.confidence * 0.5 + (1 / (Date.now() - a.createdAt.getTime())) * 0.5;
      const scoreB = b.confidence * 0.5 + (1 / (Date.now() - b.createdAt.getTime())) * 0.5;
      return scoreB - scoreA;
    });

    return query.limit ? results.slice(0, query.limit) : results;
  }

  /**
   * Get failure learnings to avoid repeating mistakes
   */
  getAntiPatterns(tags: string[]): Learning[] {
    return [...this.learnings.values()]
      .filter((l) => l.type === 'failure' && l.tags.some((t) => tags.includes(t)))
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Record learning application
   */
  recordLearningApplication(learningId: string): void {
    const learning = this.learnings.get(learningId);
    if (learning) {
      learning.appliedCount++;

      // Persist application count
      persistenceManager.recordLearningApplication(learningId).catch((error) => {
        console.error('[Memory] Failed to persist learning application:', error);
      });
    }
  }

  // ============================================================================
  // Skill Management
  // ============================================================================

  /**
   * Store a new skill in the pool
   */
  storeSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
    this.indexItem(skill.id, 'skill', [skill.category], skill.createdBy, {
      confidence: skill.successRate,
      date: skill.createdAt,
      category: skill.category,
    });
    this.invalidateCaches();
    console.log(`[Memory] Stored skill: ${skill.name}`);

    // Persist to Supabase (async, non-blocking)
    persistenceManager.saveSkill(skill).catch((error) => {
      console.error('[Memory] Failed to persist skill:', error);
    });
  }

  /**
   * Query skills
   */
  querySkills(query: MemoryQuery): Skill[] {
    let results = [...this.skills.values()];

    if (query.brainType) {
      results = results.filter(
        (s) => s.createdBy === query.brainType || s.adoptedBy.includes(query.brainType!)
      );
    }

    if (query.tags?.length) {
      results = results.filter((s) => query.tags!.includes(s.category));
    }

    // Sort by adoption and success rate
    results.sort((a, b) => {
      const scoreA = a.adoptedBy.length * 0.4 + a.successRate * 0.6;
      const scoreB = b.adoptedBy.length * 0.4 + b.successRate * 0.6;
      return scoreB - scoreA;
    });

    return query.limit ? results.slice(0, query.limit) : results;
  }

  /**
   * Record skill adoption by a brain
   */
  recordSkillAdoption(skillId: string, brainType: BrainType): void {
    const skill = this.skills.get(skillId);
    if (skill && !skill.adoptedBy.includes(brainType)) {
      skill.adoptedBy.push(brainType);
      skill.updatedAt = new Date();
      console.log(`[Memory] ${brainType} adopted skill: ${skill.name}`);

      // Persist adoption
      persistenceManager.recordSkillAdoption(skillId, brainType).catch((error) => {
        console.error('[Memory] Failed to persist skill adoption:', error);
      });
    }
  }

  /**
   * Record skill usage and outcome
   */
  recordSkillUsage(skillId: string, success: boolean): void {
    const skill = this.skills.get(skillId);
    if (!skill) return;

    skill.usageCount++;
    skill.updatedAt = new Date();

    // Update success rate
    const alpha = 0.1;
    skill.successRate = skill.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;

    // Persist usage update
    persistenceManager.updateSkillUsage(skillId, success).catch((error) => {
      console.error('[Memory] Failed to persist skill usage:', error);
    });
  }

  // ============================================================================
  // Decision Management
  // ============================================================================

  /**
   * Store a decision for audit trail
   */
  storeDecision(decision: Decision): void {
    this.decisions.set(decision.id, decision);
    this.indexItem(decision.id, 'decision', [], decision.participants[0], {
      date: decision.createdAt,
    });
    this.invalidateCaches();
    console.log(`[Memory] Stored decision: ${decision.description.substring(0, 50)}...`);

    // Persist to Supabase (async, non-blocking)
    persistenceManager.saveDecision(decision).catch((error) => {
      console.error('[Memory] Failed to persist decision:', error);
    });
  }

  /**
   * Query decisions
   */
  queryDecisions(query: MemoryQuery): Decision[] {
    let results = [...this.decisions.values()];

    if (query.brainType) {
      results = results.filter((d) => d.participants.includes(query.brainType!));
    }

    if (query.dateRange) {
      results = results.filter(
        (d) =>
          d.createdAt >= query.dateRange!.start &&
          d.createdAt <= query.dateRange!.end
      );
    }

    // Sort by recency
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return query.limit ? results.slice(0, query.limit) : results;
  }

  /**
   * Record decision outcome for learning
   */
  recordDecisionOutcome(
    decisionId: string,
    outcome: 'positive' | 'negative' | 'neutral'
  ): void {
    const decision = this.decisions.get(decisionId);
    if (decision) {
      decision.outcome = outcome;
      decision.reviewedAt = new Date();

      // Generate learning from outcome
      if (outcome === 'negative') {
        this.storeLearning({
          id: uuidv4(),
          type: 'failure',
          source: decision.participants[0],
          taskId: '',
          description: `Decision "${decision.description}" had negative outcome`,
          rootCause: decision.rationale,
          recommendation: `Review alternatives: ${decision.options.map((o) => o.description).join(', ')}`,
          confidence: 0.8,
          createdAt: new Date(),
          appliedCount: 0,
          tags: ['decision', 'failure'],
        });
      }
    }
  }

  // ============================================================================
  // Unified Search
  // ============================================================================

  /**
   * Search across all memory types
   */
  search(query: string, options: MemoryQuery = {}): MemorySearchResult {
    const relevanceScores = new Map<string, number>();
    const queryWords = query.toLowerCase().split(/\s+/);

    const calculateRelevance = (text: string): number => {
      const textWords = text.toLowerCase().split(/\s+/);
      const matches = queryWords.filter((qw) =>
        textWords.some((tw) => tw.includes(qw) || qw.includes(tw))
      ).length;
      return matches / queryWords.length;
    };

    // Search patterns
    const patterns = [...this.patterns.values()]
      .map((p) => {
        const relevance = calculateRelevance(
          `${p.name} ${p.description} ${p.trigger} ${p.tags.join(' ')}`
        );
        relevanceScores.set(p.id, relevance);
        return { item: p, relevance };
      })
      .filter((r) => r.relevance > 0.2)
      .sort((a, b) => b.relevance - a.relevance)
      .map((r) => r.item);

    // Search learnings
    const learnings = [...this.learnings.values()]
      .map((l) => {
        const relevance = calculateRelevance(
          `${l.description} ${l.recommendation} ${l.tags.join(' ')}`
        );
        relevanceScores.set(l.id, relevance);
        return { item: l, relevance };
      })
      .filter((r) => r.relevance > 0.2)
      .sort((a, b) => b.relevance - a.relevance)
      .map((r) => r.item);

    // Search skills
    const skills = [...this.skills.values()]
      .map((s) => {
        const relevance = calculateRelevance(
          `${s.name} ${s.description} ${s.category}`
        );
        relevanceScores.set(s.id, relevance);
        return { item: s, relevance };
      })
      .filter((r) => r.relevance > 0.2)
      .sort((a, b) => b.relevance - a.relevance)
      .map((r) => r.item);

    // Search decisions
    const decisions = [...this.decisions.values()]
      .map((d) => {
        const relevance = calculateRelevance(
          `${d.description} ${d.rationale}`
        );
        relevanceScores.set(d.id, relevance);
        return { item: d, relevance };
      })
      .filter((r) => r.relevance > 0.2)
      .sort((a, b) => b.relevance - a.relevance)
      .map((r) => r.item);

    return {
      patterns: options.limit ? patterns.slice(0, options.limit) : patterns,
      learnings: options.limit ? learnings.slice(0, options.limit) : learnings,
      skills: options.limit ? skills.slice(0, options.limit) : skills,
      decisions: options.limit ? decisions.slice(0, options.limit) : decisions,
      relevanceScores,
    };
  }

  // ============================================================================
  // Pre-Task Query
  // ============================================================================

  /**
   * Query memory before starting a task
   * Returns relevant patterns, learnings, and anti-patterns
   */
  preTaskQuery(task: Task): {
    patterns: Pattern[];
    learnings: Learning[];
    antiPatterns: Learning[];
    relatedDecisions: Decision[];
  } {
    const context = `${task.subject} ${task.description}`;
    const tags = this.extractTags(context);

    return {
      patterns: this.findSimilarPatterns(context, 5),
      learnings: this.queryLearnings({ tags, limit: 5 }),
      antiPatterns: this.getAntiPatterns(tags),
      relatedDecisions: this.queryDecisions({ tags, limit: 3 }),
    };
  }

  /**
   * Log task completion to memory
   * Runs pattern extraction asynchronously
   */
  postTaskLog(task: Task, result: TaskResult, brainType?: BrainType): void {
    // Store learnings from result
    for (const learning of result.learnings) {
      this.storeLearning(learning);
    }

    // Run async pattern extraction
    this.runAsyncExtraction(task, result, brainType ?? 'engineering').catch(
      (error) => {
        console.error('[Memory] Async extraction failed:', error);
      }
    );
  }

  /**
   * Run asynchronous pattern extraction
   * This is the post-task analysis that extracts patterns and insights
   */
  private async runAsyncExtraction(
    task: Task,
    result: TaskResult,
    brainType: BrainType
  ): Promise<void> {
    try {
      const extractionResult = await patternExtractionEngine.extractFromTaskCompletion({
        task,
        result,
        brainType,
        relatedPatterns: this.findSimilarPatterns(`${task.subject} ${task.description}`, 3),
        relatedLearnings: this.queryLearnings({ tags: this.extractTags(`${task.subject}`), limit: 5 }),
      });

      // Store extracted patterns
      for (const extracted of extractionResult.patterns) {
        if (extracted.confidence >= 0.6) {
          this.storePattern(extracted.pattern);
        }
      }

      // Store additional learnings
      for (const extracted of extractionResult.learnings) {
        if (extracted.importance === 'critical' || extracted.importance === 'high') {
          this.storeLearning(extracted.learning);
        }
      }

      // Store anti-patterns as failure learnings
      for (const antiPattern of extractionResult.antiPatterns) {
        this.storeLearning(antiPattern.learning);
      }

      console.log(
        `[Memory] Async extraction complete: ${extractionResult.patterns.length} patterns, ` +
          `${extractionResult.learnings.length} learnings, ${extractionResult.insights.length} insights`
      );
    } catch (error) {
      console.error('[Memory] Extraction error:', error);
    }
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get memory statistics
   */
  getStats(): MemoryStats {
    const patterns = [...this.patterns.values()];
    const learnings = [...this.learnings.values()];
    const skills = [...this.skills.values()];

    const totalPatternUsage = patterns.reduce((sum, p) => sum + p.usageCount, 0);
    const totalSkillAdoptions = skills.reduce((sum, s) => sum + s.adoptedBy.length, 0);
    const totalLearningApplications = learnings.reduce(
      (sum, l) => sum + l.appliedCount,
      0
    );

    const persistenceStatus = persistenceManager.getStatus();

    return {
      totalPatterns: patterns.length,
      totalLearnings: learnings.length,
      totalSkills: skills.length,
      totalDecisions: this.decisions.size,
      patternUsageRate: patterns.length > 0 ? totalPatternUsage / patterns.length : 0,
      skillAdoptionRate:
        skills.length > 0 ? totalSkillAdoptions / (skills.length * 44) : 0, // 44 brains
      learningApplicationRate:
        learnings.length > 0 ? totalLearningApplications / learnings.length : 0,
      persistenceStatus: {
        isOnline: persistenceStatus.isOnline,
        pendingOperations: persistenceStatus.pendingOperations,
        lastSyncAt: persistenceStatus.lastSyncAt,
      },
    };
  }

  // ============================================================================
  // Full-Text Search (via Supabase)
  // ============================================================================

  /**
   * Search memory using Supabase full-text search
   * Falls back to local search if offline
   */
  async searchPersistent(
    query: string,
    options?: { types?: MemoryItemType[]; limit?: number }
  ): Promise<MemorySearchResult> {
    if (persistenceManager.isOnline()) {
      const results = await persistenceManager.search(query, options);

      // Merge with relevance scores
      const relevanceScores = new Map<string, number>();

      // Add remote results to local cache if not present
      for (const pattern of results.patterns) {
        if (!this.patterns.has(pattern.id)) {
          this.patterns.set(pattern.id, pattern);
        }
        relevanceScores.set(pattern.id, 1.0); // Remote results are highly relevant
      }

      for (const learning of results.learnings) {
        if (!this.learnings.has(learning.id)) {
          this.learnings.set(learning.id, learning);
        }
        relevanceScores.set(learning.id, 1.0);
      }

      for (const skill of results.skills) {
        if (!this.skills.has(skill.id)) {
          this.skills.set(skill.id, skill);
        }
        relevanceScores.set(skill.id, 1.0);
      }

      return {
        patterns: results.patterns,
        learnings: results.learnings,
        skills: results.skills,
        decisions: [],
        relevanceScores,
      };
    }

    // Fall back to local search
    return this.search(query, options);
  }

  // ============================================================================
  // Shutdown
  // ============================================================================

  /**
   * Gracefully shutdown the memory manager
   * Ensures all pending operations are synced
   */
  async shutdown(): Promise<void> {
    console.log('[Memory] Shutting down memory manager...');
    await persistenceManager.shutdown();
    console.log('[Memory] Shutdown complete');
  }

  // ============================================================================
  // Persistence (placeholder for future implementation)
  // ============================================================================

  /**
   * Export memory to JSON
   */
  export(): string {
    return JSON.stringify({
      patterns: [...this.patterns.values()],
      learnings: [...this.learnings.values()],
      skills: [...this.skills.values()],
      decisions: [...this.decisions.values()],
      exportedAt: new Date().toISOString(),
    });
  }

  /**
   * Import memory from JSON
   */
  import(data: string): void {
    const parsed = JSON.parse(data);

    for (const pattern of parsed.patterns || []) {
      pattern.createdAt = new Date(pattern.createdAt);
      pattern.lastUsedAt = new Date(pattern.lastUsedAt);
      this.storePattern(pattern);
    }

    for (const learning of parsed.learnings || []) {
      learning.createdAt = new Date(learning.createdAt);
      this.storeLearning(learning);
    }

    for (const skill of parsed.skills || []) {
      skill.createdAt = new Date(skill.createdAt);
      skill.updatedAt = new Date(skill.updatedAt);
      this.storeSkill(skill);
    }

    for (const decision of parsed.decisions || []) {
      decision.createdAt = new Date(decision.createdAt);
      if (decision.reviewedAt) decision.reviewedAt = new Date(decision.reviewedAt);
      this.storeDecision(decision);
    }

    console.log(`[Memory] Imported: ${this.getStats().totalPatterns} patterns, ${this.getStats().totalLearnings} learnings`);
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private indexItem(
    id: string,
    type: string,
    tags: string[],
    brainType: BrainType,
    options?: {
      confidence?: number;
      date?: Date;
      category?: string;
    }
  ): void {
    // Add to type index
    if (!this.typeIndex.has(type)) {
      this.typeIndex.set(type, new Set());
    }
    this.typeIndex.get(type)!.add(id);

    // Add to tag index
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(id);
    }

    // Add to brain index
    if (!this.brainIndex.has(brainType)) {
      this.brainIndex.set(brainType, new Set());
    }
    this.brainIndex.get(brainType)!.add(id);

    // Add to confidence index
    if (options?.confidence !== undefined) {
      const bucket = getConfidenceBucket(options.confidence);
      this.confidenceIndex.get(bucket)!.add(id);
    }

    // Add to date index (YYYY-MM format for month-based lookups)
    if (options?.date) {
      const dateKey = `${options.date.getFullYear()}-${String(options.date.getMonth() + 1).padStart(2, '0')}`;
      if (!this.dateIndex.has(dateKey)) {
        this.dateIndex.set(dateKey, new Set());
      }
      this.dateIndex.get(dateKey)!.add(id);
    }

    // Add to category index (for skills)
    if (options?.category) {
      if (!this.categoryIndex.has(options.category)) {
        this.categoryIndex.set(options.category, new Set());
      }
      this.categoryIndex.get(options.category)!.add(id);
    }

    // Mark sorted lists as dirty
    this.sortedListsDirty = true;
  }

  /**
   * Remove item from all indices
   */
  private unindexItem(id: string, type: string): void {
    this.typeIndex.get(type)?.delete(id);

    for (const tagSet of this.tagIndex.values()) {
      tagSet.delete(id);
    }

    for (const brainSet of this.brainIndex.values()) {
      brainSet.delete(id);
    }

    for (const confSet of this.confidenceIndex.values()) {
      confSet.delete(id);
    }

    for (const dateSet of this.dateIndex.values()) {
      dateSet.delete(id);
    }

    for (const catSet of this.categoryIndex.values()) {
      catSet.delete(id);
    }

    this.sortedListsDirty = true;
  }

  // ============================================================================
  // Batch Query Support
  // ============================================================================

  /**
   * Execute multiple queries in parallel with caching
   */
  async batchQuery(requests: BatchQueryRequest[]): Promise<BatchQueryResult[]> {
    const results = await Promise.all(
      requests.map(async (req) => {
        const cacheKey = `batch:${req.id}:${queryCacheKey(req.query as Record<string, unknown>)}`;
        const cached = this.queryCache.get(cacheKey);

        if (cached) {
          return {
            id: req.id,
            patterns: cached.patterns,
            learnings: cached.learnings,
            skills: cached.skills,
            decisions: cached.decisions,
          };
        }

        const searchResult = this.search(
          req.query.tags?.join(' ') ?? '',
          req.query
        );

        // Cache the result
        this.queryCache.set(cacheKey, searchResult);

        return {
          id: req.id,
          patterns: searchResult.patterns,
          learnings: searchResult.learnings,
          skills: searchResult.skills,
          decisions: searchResult.decisions,
        };
      })
    );

    return results;
  }

  // ============================================================================
  // Paginated Queries
  // ============================================================================

  /**
   * Query patterns with cursor-based pagination
   */
  queryPatternsPaginated(query: MemoryQuery): PaginatedResult<Pattern> {
    this.rebuildSortedLists();

    const pageSize = query.pageSize ?? 20;
    let startIndex = 0;

    // Find cursor position
    if (query.cursor) {
      const cursorIndex = this.sortedPatternIds.indexOf(query.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    // Get candidate IDs using index intersection
    let candidateIds: Set<string> | null = null;

    if (query.brainType) {
      candidateIds = this.brainIndex.get(query.brainType) ?? new Set();
    }

    if (query.tags?.length) {
      const tagMatches = new Set<string>();
      for (const tag of query.tags) {
        const tagIds = this.tagIndex.get(tag);
        if (tagIds) {
          for (const id of tagIds) {
            if (!candidateIds || candidateIds.has(id)) {
              tagMatches.add(id);
            }
          }
        }
      }
      candidateIds = tagMatches;
    }

    if (query.minConfidence !== undefined) {
      const confBuckets: ConfidenceBucket[] = [];
      if (query.minConfidence >= 0.9) confBuckets.push('excellent');
      else if (query.minConfidence >= 0.7) confBuckets.push('excellent', 'high');
      else if (query.minConfidence >= 0.5) confBuckets.push('excellent', 'high', 'medium');
      else confBuckets.push('excellent', 'high', 'medium', 'low');

      const confMatches = new Set<string>();
      for (const bucket of confBuckets) {
        const bucketIds = this.confidenceIndex.get(bucket);
        if (bucketIds) {
          for (const id of bucketIds) {
            if (!candidateIds || candidateIds.has(id)) {
              confMatches.add(id);
            }
          }
        }
      }
      candidateIds = confMatches;
    }

    // Filter sorted IDs by candidates
    const filteredIds = candidateIds
      ? this.sortedPatternIds.filter((id) => candidateIds!.has(id))
      : this.sortedPatternIds;

    // Apply date range filter
    let finalIds = filteredIds;
    if (query.dateRange) {
      finalIds = filteredIds.filter((id) => {
        const pattern = this.patterns.get(id);
        return (
          pattern &&
          pattern.createdAt >= query.dateRange!.start &&
          pattern.createdAt <= query.dateRange!.end
        );
      });
    }

    // Get page
    const pageIds = finalIds.slice(startIndex, startIndex + pageSize);
    const items = pageIds
      .map((id) => this.patterns.get(id))
      .filter((p): p is Pattern => p !== undefined);

    return {
      items,
      cursor: pageIds.length > 0 ? pageIds[pageIds.length - 1] : null,
      hasMore: startIndex + pageSize < finalIds.length,
      totalCount: finalIds.length,
    };
  }

  /**
   * Query learnings with cursor-based pagination
   */
  queryLearningsPaginated(query: MemoryQuery): PaginatedResult<Learning> {
    this.rebuildSortedLists();

    const pageSize = query.pageSize ?? 20;
    let startIndex = 0;

    if (query.cursor) {
      const cursorIndex = this.sortedLearningIds.indexOf(query.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    // Get candidate IDs using index intersection
    let candidateIds: Set<string> | null = null;

    if (query.brainType) {
      const brainIds = this.brainIndex.get(query.brainType);
      const learningTypeIds = this.typeIndex.get('learning');
      if (brainIds && learningTypeIds) {
        candidateIds = new Set([...brainIds].filter((id) => learningTypeIds.has(id)));
      }
    }

    if (query.tags?.length) {
      const tagMatches = new Set<string>();
      for (const tag of query.tags) {
        const tagIds = this.tagIndex.get(tag);
        if (tagIds) {
          for (const id of tagIds) {
            if (!candidateIds || candidateIds.has(id)) {
              tagMatches.add(id);
            }
          }
        }
      }
      candidateIds = tagMatches;
    }

    const filteredIds = candidateIds
      ? this.sortedLearningIds.filter((id) => candidateIds!.has(id))
      : this.sortedLearningIds;

    // Apply confidence filter
    let finalIds = filteredIds;
    if (query.minConfidence !== undefined) {
      finalIds = filteredIds.filter((id) => {
        const learning = this.learnings.get(id);
        return learning && learning.confidence >= query.minConfidence!;
      });
    }

    const pageIds = finalIds.slice(startIndex, startIndex + pageSize);
    const items = pageIds
      .map((id) => this.learnings.get(id))
      .filter((l): l is Learning => l !== undefined);

    return {
      items,
      cursor: pageIds.length > 0 ? pageIds[pageIds.length - 1] : null,
      hasMore: startIndex + pageSize < finalIds.length,
      totalCount: finalIds.length,
    };
  }

  /**
   * Query skills with cursor-based pagination
   */
  querySkillsPaginated(query: MemoryQuery): PaginatedResult<Skill> {
    this.rebuildSortedLists();

    const pageSize = query.pageSize ?? 20;
    let startIndex = 0;

    if (query.cursor) {
      const cursorIndex = this.sortedSkillIds.indexOf(query.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    let candidateIds: Set<string> | null = null;

    // Use category index for fast skill lookups
    if (query.tags?.length) {
      const categoryMatches = new Set<string>();
      for (const tag of query.tags) {
        const catIds = this.categoryIndex.get(tag);
        if (catIds) {
          for (const id of catIds) {
            categoryMatches.add(id);
          }
        }
      }
      candidateIds = categoryMatches;
    }

    if (query.brainType) {
      const filteredByBrain = [...this.skills.values()]
        .filter(
          (s) =>
            s.createdBy === query.brainType ||
            s.adoptedBy.includes(query.brainType!)
        )
        .map((s) => s.id);
      const brainSet = new Set(filteredByBrain);
      candidateIds = candidateIds
        ? new Set([...candidateIds].filter((id) => brainSet.has(id)))
        : brainSet;
    }

    const filteredIds = candidateIds
      ? this.sortedSkillIds.filter((id) => candidateIds!.has(id))
      : this.sortedSkillIds;

    const pageIds = filteredIds.slice(startIndex, startIndex + pageSize);
    const items = pageIds
      .map((id) => this.skills.get(id))
      .filter((s): s is Skill => s !== undefined);

    return {
      items,
      cursor: pageIds.length > 0 ? pageIds[pageIds.length - 1] : null,
      hasMore: startIndex + pageSize < filteredIds.length,
      totalCount: filteredIds.length,
    };
  }

  // ============================================================================
  // Cached Query Methods
  // ============================================================================

  /**
   * Find similar patterns with caching
   */
  findSimilarPatternsCached(context: string, limit: number = 5): Pattern[] {
    const cacheKey = cacheKeys.patternMatch(context);
    const cached = this.similarityCache.get(cacheKey);

    if (cached) {
      return cached.slice(0, limit);
    }

    const result = this.findSimilarPatterns(context, Math.max(limit, 10));
    this.similarityCache.set(cacheKey, result);

    return result.slice(0, limit);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    queryCache: { hits: number; misses: number; size: number; hitRate: number };
    patternCache: { hits: number; misses: number; size: number; hitRate: number };
    similarityCache: { hits: number; misses: number; size: number; hitRate: number };
  } {
    return {
      queryCache: this.queryCache.getStats(),
      patternCache: this.patternMatchCache.getStats(),
      similarityCache: this.similarityCache.getStats(),
    };
  }

  /**
   * Clear all caches (useful for testing or forced refresh)
   */
  clearCaches(): void {
    this.invalidateCaches();
    console.log('[Memory] All caches cleared');
  }

  private extractTags(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    return words
      .filter((w) => w.length > 3)
      .slice(0, 10);
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();
