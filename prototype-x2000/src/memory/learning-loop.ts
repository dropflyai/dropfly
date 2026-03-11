/**
 * Memory Learning Loop
 * Closes the loop between stored patterns/learnings and their application
 * Ensures past learnings actually influence future decisions
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Pattern,
  Learning,
  Task,
  BrainType,
} from '../types/index.js';
import { memoryManager } from './manager.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Relevance-scored pattern with match details
 */
interface ScoredPattern {
  pattern: Pattern;
  relevanceScore: number;
  recencyScore: number;
  combinedScore: number;
  matchedKeywords: string[];
  matchedTags: string[];
}

/**
 * Actionable recommendation extracted from patterns/learnings
 */
interface ActionableRecommendation {
  source: 'pattern' | 'learning' | 'anti-pattern';
  sourceId: string;
  recommendation: string;
  confidence: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  context: string[];
}

/**
 * Context formatted for brain prompts
 */
interface AppliedLearningsContext {
  taskId: string;
  appliedPatternIds: string[];
  appliedLearningIds: string[];
  recommendations: ActionableRecommendation[];
  warnings: string[];
  promptContext: string;
}

/**
 * Tracked outcome for pattern feedback
 */
interface OutcomeRecord {
  taskId: string;
  appliedPatternIds: string[];
  appliedLearningIds: string[];
  success: boolean;
  learnings: string[];
  recordedAt: Date;
}

/**
 * Anti-pattern detection result
 */
interface AntiPatternFlag {
  patternId: string;
  failureCount: number;
  failureRate: number;
  lastFailedAt: Date;
  recommendation: string;
  severity: 'warning' | 'critical';
}

/**
 * Pattern decay info
 */
interface PatternDecayInfo {
  patternId: string;
  daysSinceLastUse: number;
  originalWeight: number;
  decayedWeight: number;
  decayFactor: number;
}

// ============================================================================
// Configuration
// ============================================================================

interface LearningLoopConfig {
  // Relevance scoring weights
  keywordMatchWeight: number;
  tagMatchWeight: number;
  recencyWeight: number;
  successRateWeight: number;
  usageCountWeight: number;

  // Pattern decay settings
  decayStartDays: number;       // Days before decay starts
  decayHalfLifeDays: number;    // Days for pattern weight to halve
  minDecayedWeight: number;     // Minimum weight after decay

  // Anti-pattern detection
  failureThresholdCount: number;   // Failures before flagging
  failureThresholdRate: number;    // Failure rate threshold (0-1)
  antiPatternLookbackDays: number; // Days to look back for failures

  // Query settings
  minRelevanceScore: number;       // Minimum score to include pattern
  maxPatternsReturned: number;     // Max patterns per query
  maxRecommendations: number;      // Max recommendations per context
}

const DEFAULT_CONFIG: LearningLoopConfig = {
  keywordMatchWeight: 0.35,
  tagMatchWeight: 0.25,
  recencyWeight: 0.15,
  successRateWeight: 0.15,
  usageCountWeight: 0.10,

  decayStartDays: 30,
  decayHalfLifeDays: 60,
  minDecayedWeight: 0.1,

  failureThresholdCount: 3,
  failureThresholdRate: 0.4,
  antiPatternLookbackDays: 30,

  minRelevanceScore: 0.25,
  maxPatternsReturned: 10,
  maxRecommendations: 5,
};

// ============================================================================
// Learning Loop Manager
// ============================================================================

export class LearningLoopManager {
  private config: LearningLoopConfig;
  private outcomeHistory: Map<string, OutcomeRecord> = new Map();
  private patternOutcomes: Map<string, Array<{ success: boolean; timestamp: Date }>> = new Map();
  private antiPatternFlags: Map<string, AntiPatternFlag> = new Map();
  private appliedContextCache: Map<string, AppliedLearningsContext> = new Map();

  constructor(config: Partial<LearningLoopConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // Query Relevant Patterns
  // ============================================================================

  /**
   * Query patterns relevant to a given task using semantic similarity
   * Searches by keywords and tags, ranks by relevance and recency
   */
  queryRelevantPatterns(task: Task, limit?: number): ScoredPattern[] {
    const maxResults = limit ?? this.config.maxPatternsReturned;
    const patterns = memoryManager.queryPatterns({ limit: 100 }); // Get all patterns

    if (patterns.length === 0) {
      return [];
    }

    // Extract keywords from task
    const taskKeywords = this.extractKeywords(
      `${task.subject} ${task.description}`
    );
    const taskTags = this.extractTags(task);

    const scoredPatterns: ScoredPattern[] = [];

    for (const pattern of patterns) {
      // Apply decay first
      const decayInfo = this.calculatePatternDecay(pattern);

      // Calculate match scores
      const patternKeywords = this.extractKeywords(
        `${pattern.name} ${pattern.description} ${pattern.trigger}`
      );
      const keywordMatch = this.calculateKeywordSimilarity(
        taskKeywords,
        patternKeywords
      );
      const tagMatch = this.calculateTagSimilarity(taskTags, pattern.tags);

      // Calculate recency score (0-1, higher = more recent)
      const recencyScore = this.calculateRecencyScore(pattern.lastUsedAt);

      // Calculate usage normalization (log scale)
      const usageScore = Math.min(1, Math.log10(pattern.usageCount + 1) / 2);

      // Combined relevance score
      const relevanceScore =
        keywordMatch.score * this.config.keywordMatchWeight +
        tagMatch.score * this.config.tagMatchWeight +
        pattern.successRate * this.config.successRateWeight +
        usageScore * this.config.usageCountWeight;

      // Apply decay to relevance
      const decayedRelevance = relevanceScore * decayInfo.decayFactor;

      // Combined score including recency
      const combinedScore =
        decayedRelevance * (1 - this.config.recencyWeight) +
        recencyScore * this.config.recencyWeight;

      // Check if flagged as anti-pattern
      const antiPatternFlag = this.antiPatternFlags.get(pattern.id);
      if (antiPatternFlag?.severity === 'critical') {
        // Skip critically flagged patterns
        continue;
      }

      if (combinedScore >= this.config.minRelevanceScore) {
        scoredPatterns.push({
          pattern,
          relevanceScore: decayedRelevance,
          recencyScore,
          combinedScore,
          matchedKeywords: keywordMatch.matchedWords,
          matchedTags: tagMatch.matchedTags,
        });
      }
    }

    // Sort by combined score descending
    scoredPatterns.sort((a, b) => b.combinedScore - a.combinedScore);

    return scoredPatterns.slice(0, maxResults);
  }

  /**
   * Query relevant learnings for a task
   */
  queryRelevantLearnings(task: Task, limit?: number): Learning[] {
    const maxResults = limit ?? this.config.maxPatternsReturned;
    const taskTags = this.extractTags(task);

    // Query success learnings
    const successLearnings = memoryManager.queryLearnings({
      tags: taskTags,
      minConfidence: 0.5,
      limit: maxResults,
    });

    return successLearnings;
  }

  /**
   * Query anti-patterns to avoid
   */
  queryAntiPatterns(task: Task): Learning[] {
    const taskTags = this.extractTags(task);
    return memoryManager.getAntiPatterns(taskTags);
  }

  // ============================================================================
  // Apply Learnings
  // ============================================================================

  /**
   * Extract actionable recommendations and format for brain prompts
   * Tracks which patterns were applied for outcome recording
   */
  applyLearnings(
    task: Task,
    scoredPatterns: ScoredPattern[]
  ): AppliedLearningsContext {
    const recommendations: ActionableRecommendation[] = [];
    const warnings: string[] = [];
    const appliedPatternIds: string[] = [];
    const appliedLearningIds: string[] = [];

    // Process patterns
    for (const scoredPattern of scoredPatterns.slice(
      0,
      this.config.maxRecommendations
    )) {
      const { pattern } = scoredPattern;

      // Check for anti-pattern warning
      const antiPatternFlag = this.antiPatternFlags.get(pattern.id);
      if (antiPatternFlag) {
        warnings.push(
          `[WARNING] Pattern "${pattern.name}" has failed ${antiPatternFlag.failureCount} times. ` +
            `Consider: ${antiPatternFlag.recommendation}`
        );
        continue;
      }

      const recommendation: ActionableRecommendation = {
        source: 'pattern',
        sourceId: pattern.id,
        recommendation: this.formatPatternRecommendation(pattern, scoredPattern),
        confidence: pattern.successRate,
        priority: this.scoreToPriority(scoredPattern.combinedScore),
        context: pattern.context,
      };

      recommendations.push(recommendation);
      appliedPatternIds.push(pattern.id);
    }

    // Get relevant learnings
    const learnings = this.queryRelevantLearnings(task, 5);
    for (const learning of learnings) {
      const recommendation: ActionableRecommendation = {
        source: 'learning',
        sourceId: learning.id,
        recommendation: learning.recommendation,
        confidence: learning.confidence,
        priority: this.confidenceToPriority(learning.confidence),
        context: learning.tags,
      };

      recommendations.push(recommendation);
      appliedLearningIds.push(learning.id);
    }

    // Get anti-patterns to warn about
    const antiPatterns = this.queryAntiPatterns(task);
    for (const antiPattern of antiPatterns.slice(0, 3)) {
      const recommendation: ActionableRecommendation = {
        source: 'anti-pattern',
        sourceId: antiPattern.id,
        recommendation: `AVOID: ${antiPattern.description}. Instead: ${antiPattern.recommendation}`,
        confidence: antiPattern.confidence,
        priority: 'high',
        context: antiPattern.tags,
      };

      recommendations.push(recommendation);
      warnings.push(
        `[ANTI-PATTERN] ${antiPattern.rootCause ?? antiPattern.description}`
      );
    }

    // Sort recommendations by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Build prompt context
    const promptContext = this.buildPromptContext(
      recommendations.slice(0, this.config.maxRecommendations),
      warnings
    );

    const context: AppliedLearningsContext = {
      taskId: task.id,
      appliedPatternIds,
      appliedLearningIds,
      recommendations: recommendations.slice(0, this.config.maxRecommendations),
      warnings,
      promptContext,
    };

    // Cache for outcome recording
    this.appliedContextCache.set(task.id, context);

    // Record pattern usage (pending outcome)
    for (const patternId of appliedPatternIds) {
      memoryManager.recordPatternUsage(patternId, true); // Will update with actual outcome
    }

    // Record learning application
    for (const learningId of appliedLearningIds) {
      memoryManager.recordLearningApplication(learningId);
    }

    console.log(
      `[LearningLoop] Applied ${recommendations.length} recommendations for task ${task.id}`
    );

    return context;
  }

  // ============================================================================
  // Record Outcome
  // ============================================================================

  /**
   * Record the outcome of a task and update pattern confidence scores
   * Links outcomes to the patterns that were applied
   */
  recordOutcome(
    taskId: string,
    success: boolean,
    learnings: string[]
  ): void {
    const appliedContext = this.appliedContextCache.get(taskId);

    if (!appliedContext) {
      console.log(`[LearningLoop] No applied context found for task ${taskId}`);
      return;
    }

    // Create outcome record
    const outcomeRecord: OutcomeRecord = {
      taskId,
      appliedPatternIds: appliedContext.appliedPatternIds,
      appliedLearningIds: appliedContext.appliedLearningIds,
      success,
      learnings,
      recordedAt: new Date(),
    };

    this.outcomeHistory.set(taskId, outcomeRecord);

    // Update pattern confidence based on outcome
    for (const patternId of appliedContext.appliedPatternIds) {
      this.updatePatternFromOutcome(patternId, success);
    }

    // Extract new patterns from successful approaches
    if (success && learnings.length > 0) {
      this.extractNewPatternsFromSuccess(taskId, learnings);
    }

    // Detect anti-patterns from failures
    if (!success) {
      this.detectAntiPatterns(appliedContext.appliedPatternIds);
    }

    // Clear cache
    this.appliedContextCache.delete(taskId);

    console.log(
      `[LearningLoop] Recorded ${success ? 'successful' : 'failed'} outcome for task ${taskId}`
    );
  }

  /**
   * Update pattern confidence based on outcome
   */
  private updatePatternFromOutcome(patternId: string, success: boolean): void {
    // Track outcome history for this pattern
    if (!this.patternOutcomes.has(patternId)) {
      this.patternOutcomes.set(patternId, []);
    }

    this.patternOutcomes.get(patternId)!.push({
      success,
      timestamp: new Date(),
    });

    // Keep only recent outcomes (last 30 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.config.antiPatternLookbackDays);

    this.patternOutcomes.set(
      patternId,
      this.patternOutcomes.get(patternId)!.filter(
        (o) => o.timestamp >= cutoff
      )
    );

    // Record in memory manager (updates success rate with EMA)
    memoryManager.recordPatternUsage(patternId, success);
  }

  /**
   * Extract new patterns from successful task completion
   */
  private extractNewPatternsFromSuccess(
    taskId: string,
    learnings: string[]
  ): void {
    // This integrates with the existing pattern extraction system
    // Log learnings for future pattern synthesis
    for (const learningText of learnings) {
      console.log(`[LearningLoop] New learning from task ${taskId}: ${learningText}`);
    }

    // The PatternExtractionEngine will handle actual pattern creation
    // from the post-task log in MemoryManager
  }

  // ============================================================================
  // Anti-Pattern Detection
  // ============================================================================

  /**
   * Detect and flag patterns that repeatedly fail
   */
  private detectAntiPatterns(appliedPatternIds: string[]): void {
    for (const patternId of appliedPatternIds) {
      const outcomes = this.patternOutcomes.get(patternId);
      if (!outcomes || outcomes.length < 2) {
        continue;
      }

      const recentOutcomes = outcomes.slice(-10); // Last 10 uses
      const failureCount = recentOutcomes.filter((o) => !o.success).length;
      const failureRate = failureCount / recentOutcomes.length;

      if (
        failureCount >= this.config.failureThresholdCount ||
        failureRate >= this.config.failureThresholdRate
      ) {
        const severity =
          failureRate >= 0.7 || failureCount >= 5 ? 'critical' : 'warning';

        const flag: AntiPatternFlag = {
          patternId,
          failureCount,
          failureRate,
          lastFailedAt: outcomes[outcomes.length - 1].timestamp,
          recommendation: this.generateAntiPatternRecommendation(
            patternId,
            failureRate
          ),
          severity,
        };

        this.antiPatternFlags.set(patternId, flag);

        console.log(
          `[LearningLoop] Anti-pattern detected: ${patternId} (${(failureRate * 100).toFixed(0)}% failure rate)`
        );
      }
    }
  }

  /**
   * Get all flagged anti-patterns
   */
  getAntiPatternFlags(): AntiPatternFlag[] {
    return [...this.antiPatternFlags.values()];
  }

  /**
   * Clear an anti-pattern flag (e.g., after pattern is fixed)
   */
  clearAntiPatternFlag(patternId: string): void {
    this.antiPatternFlags.delete(patternId);
  }

  /**
   * Generate recommendation for anti-pattern
   */
  private generateAntiPatternRecommendation(
    patternId: string,
    failureRate: number
  ): string {
    const patterns = memoryManager.queryPatterns({ limit: 100 });
    const pattern = patterns.find((p) => p.id === patternId);

    if (!pattern) {
      return 'Consider alternative approaches';
    }

    if (failureRate >= 0.8) {
      return `Pattern "${pattern.name}" is critically unreliable. Do NOT use this approach.`;
    } else if (failureRate >= 0.5) {
      return `Pattern "${pattern.name}" has high failure rate. Review trigger conditions or consider alternatives.`;
    } else {
      return `Pattern "${pattern.name}" shows inconsistent results. Validate prerequisites before applying.`;
    }
  }

  // ============================================================================
  // Pattern Decay
  // ============================================================================

  /**
   * Calculate decay factor for a pattern based on last use
   */
  calculatePatternDecay(pattern: Pattern): PatternDecayInfo {
    const now = new Date();
    const lastUse = pattern.lastUsedAt;
    const daysSinceLastUse = Math.floor(
      (now.getTime() - lastUse.getTime()) / (1000 * 60 * 60 * 24)
    );

    let decayFactor = 1.0;

    if (daysSinceLastUse > this.config.decayStartDays) {
      // Apply exponential decay
      const decayDays = daysSinceLastUse - this.config.decayStartDays;
      const halfLives = decayDays / this.config.decayHalfLifeDays;
      decayFactor = Math.pow(0.5, halfLives);

      // Apply minimum threshold
      decayFactor = Math.max(this.config.minDecayedWeight, decayFactor);
    }

    return {
      patternId: pattern.id,
      daysSinceLastUse,
      originalWeight: pattern.successRate,
      decayedWeight: pattern.successRate * decayFactor,
      decayFactor,
    };
  }

  /**
   * Get all patterns with their decay information
   */
  getPatternsWithDecay(): PatternDecayInfo[] {
    const patterns = memoryManager.queryPatterns({ limit: 100 });
    return patterns.map((p) => this.calculatePatternDecay(p));
  }

  /**
   * Get stale patterns (heavily decayed)
   */
  getStalePatterns(decayThreshold: number = 0.3): PatternDecayInfo[] {
    return this.getPatternsWithDecay().filter(
      (d) => d.decayFactor < decayThreshold
    );
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !this.isStopWord(word));
  }

  /**
   * Extract tags from task
   */
  private extractTags(task: Task): string[] {
    const tags: string[] = [];

    // From task subject
    const subjectWords = this.extractKeywords(task.subject);
    tags.push(...subjectWords.slice(0, 5));

    // From metadata keys
    tags.push(...Object.keys(task.metadata).slice(0, 3));

    // Priority as tag
    tags.push(task.priority);

    return [...new Set(tags)];
  }

  /**
   * Calculate keyword similarity (Jaccard-like)
   */
  private calculateKeywordSimilarity(
    taskKeywords: string[],
    patternKeywords: string[]
  ): { score: number; matchedWords: string[] } {
    if (taskKeywords.length === 0 || patternKeywords.length === 0) {
      return { score: 0, matchedWords: [] };
    }

    const taskSet = new Set(taskKeywords);
    const patternSet = new Set(patternKeywords);

    const matchedWords: string[] = [];

    // Check for exact matches
    for (const word of taskSet) {
      if (patternSet.has(word)) {
        matchedWords.push(word);
      }
    }

    // Check for partial matches (substring)
    for (const taskWord of taskSet) {
      for (const patternWord of patternSet) {
        if (
          taskWord.length >= 4 &&
          patternWord.length >= 4 &&
          !matchedWords.includes(taskWord) &&
          (taskWord.includes(patternWord) || patternWord.includes(taskWord))
        ) {
          matchedWords.push(taskWord);
        }
      }
    }

    const union = new Set([...taskKeywords, ...patternKeywords]).size;
    const score = matchedWords.length / Math.max(1, Math.min(taskKeywords.length, union / 2));

    return { score: Math.min(1, score), matchedWords };
  }

  /**
   * Calculate tag similarity
   */
  private calculateTagSimilarity(
    taskTags: string[],
    patternTags: string[]
  ): { score: number; matchedTags: string[] } {
    if (taskTags.length === 0 || patternTags.length === 0) {
      return { score: 0, matchedTags: [] };
    }

    const taskSet = new Set(taskTags.map((t) => t.toLowerCase()));
    const patternSet = new Set(patternTags.map((t) => t.toLowerCase()));

    const matchedTags = [...taskSet].filter((t) => patternSet.has(t));

    const intersection = matchedTags.length;
    const union = new Set([...taskTags, ...patternTags]).size;

    const score = union > 0 ? intersection / union : 0;

    return { score, matchedTags };
  }

  /**
   * Calculate recency score (exponential decay from last use)
   */
  private calculateRecencyScore(lastUsedAt: Date): number {
    const now = new Date();
    const daysSince = Math.floor(
      (now.getTime() - lastUsedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Exponential decay with half-life of 14 days
    const halfLife = 14;
    return Math.pow(0.5, daysSince / halfLife);
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'will',
      'can', 'are', 'not', 'but', 'what', 'when', 'where', 'which', 'your',
      'been', 'into', 'some', 'they', 'more', 'there', 'about', 'would',
      'make', 'just', 'should', 'could', 'need', 'also', 'using', 'used',
    ]);
    return stopWords.has(word);
  }

  /**
   * Convert score to priority
   */
  private scoreToPriority(
    score: number
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Convert confidence to priority
   */
  private confidenceToPriority(
    confidence: number
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  }

  /**
   * Format a pattern as a recommendation string
   */
  private formatPatternRecommendation(
    pattern: Pattern,
    scored: ScoredPattern
  ): string {
    const matchInfo =
      scored.matchedKeywords.length > 0
        ? ` (matched: ${scored.matchedKeywords.slice(0, 3).join(', ')})`
        : '';

    return (
      `[${pattern.name}]${matchInfo}\n` +
      `Trigger: ${pattern.trigger}\n` +
      `Solution: ${pattern.solution.slice(0, 200)}...\n` +
      `Success Rate: ${(pattern.successRate * 100).toFixed(0)}% | Used: ${pattern.usageCount} times`
    );
  }

  /**
   * Build prompt context from recommendations
   */
  private buildPromptContext(
    recommendations: ActionableRecommendation[],
    warnings: string[]
  ): string {
    const lines: string[] = [];

    if (warnings.length > 0) {
      lines.push('=== WARNINGS (Do NOT ignore) ===');
      lines.push(...warnings);
      lines.push('');
    }

    if (recommendations.length > 0) {
      lines.push('=== RELEVANT LEARNINGS ===');
      lines.push('The following patterns/learnings from memory may help:');
      lines.push('');

      for (let i = 0; i < recommendations.length; i++) {
        const rec = recommendations[i];
        lines.push(
          `[${i + 1}] Priority: ${rec.priority.toUpperCase()} | Confidence: ${(rec.confidence * 100).toFixed(0)}%`
        );
        lines.push(rec.recommendation);
        lines.push('');
      }
    } else {
      lines.push('=== MEMORY CONTEXT ===');
      lines.push('No directly relevant patterns found. Proceed with standard approach.');
    }

    return lines.join('\n');
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get learning loop statistics
   */
  getStats(): {
    totalOutcomesRecorded: number;
    successRate: number;
    antiPatternsDetected: number;
    patternsApplied: number;
    stalePatterns: number;
  } {
    const outcomes = [...this.outcomeHistory.values()];
    const successCount = outcomes.filter((o) => o.success).length;

    const allAppliedPatterns = new Set(
      outcomes.flatMap((o) => o.appliedPatternIds)
    );

    const stalePatterns = this.getStalePatterns().length;

    return {
      totalOutcomesRecorded: outcomes.length,
      successRate: outcomes.length > 0 ? successCount / outcomes.length : 0,
      antiPatternsDetected: this.antiPatternFlags.size,
      patternsApplied: allAppliedPatterns.size,
      stalePatterns,
    };
  }

  /**
   * Get outcome history for a specific pattern
   */
  getPatternOutcomeHistory(
    patternId: string
  ): Array<{ success: boolean; timestamp: Date }> {
    return this.patternOutcomes.get(patternId) ?? [];
  }

  /**
   * Export learning loop state (for persistence)
   */
  exportState(): string {
    return JSON.stringify({
      outcomeHistory: [...this.outcomeHistory.entries()],
      patternOutcomes: [...this.patternOutcomes.entries()].map(([k, v]) => [
        k,
        v.map((o) => ({ ...o, timestamp: o.timestamp.toISOString() })),
      ]),
      antiPatternFlags: [...this.antiPatternFlags.entries()],
      exportedAt: new Date().toISOString(),
    });
  }

  /**
   * Import learning loop state
   */
  importState(data: string): void {
    const parsed = JSON.parse(data);

    // Restore outcome history
    this.outcomeHistory = new Map(
      parsed.outcomeHistory.map(([k, v]: [string, OutcomeRecord]) => [
        k,
        { ...v, recordedAt: new Date(v.recordedAt) },
      ])
    );

    // Restore pattern outcomes
    this.patternOutcomes = new Map(
      parsed.patternOutcomes.map(
        ([k, v]: [string, Array<{ success: boolean; timestamp: string }>]) => [
          k,
          v.map((o) => ({ ...o, timestamp: new Date(o.timestamp) })),
        ]
      )
    );

    // Restore anti-pattern flags
    this.antiPatternFlags = new Map(
      parsed.antiPatternFlags.map(([k, v]: [string, AntiPatternFlag]) => [
        k,
        { ...v, lastFailedAt: new Date(v.lastFailedAt) },
      ])
    );

    console.log('[LearningLoop] State imported successfully');
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const learningLoopManager = new LearningLoopManager();

// ============================================================================
// Convenience functions for direct use
// ============================================================================

/**
 * Query relevant patterns for a task
 */
export function queryRelevantPatterns(task: Task, limit?: number): ScoredPattern[] {
  return learningLoopManager.queryRelevantPatterns(task, limit);
}

/**
 * Apply learnings to a task and get context for brain prompts
 */
export function applyLearnings(
  task: Task,
  patterns?: ScoredPattern[]
): AppliedLearningsContext {
  const scoredPatterns = patterns ?? learningLoopManager.queryRelevantPatterns(task);
  return learningLoopManager.applyLearnings(task, scoredPatterns);
}

/**
 * Record task outcome and update pattern confidence
 */
export function recordOutcome(
  taskId: string,
  success: boolean,
  learnings: string[]
): void {
  learningLoopManager.recordOutcome(taskId, success, learnings);
}

/**
 * Get anti-pattern flags
 */
export function getAntiPatternFlags(): AntiPatternFlag[] {
  return learningLoopManager.getAntiPatternFlags();
}

/**
 * Get stale patterns needing refresh
 */
export function getStalePatterns(decayThreshold?: number): PatternDecayInfo[] {
  return learningLoopManager.getStalePatterns(decayThreshold);
}

/**
 * Get learning loop statistics
 */
export function getLearningLoopStats() {
  return learningLoopManager.getStats();
}
