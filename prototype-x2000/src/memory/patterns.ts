/**
 * Pattern Extraction System
 * Extracts reusable patterns from successful task executions
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Pattern,
  Task,
  TaskResult,
  BrainType,
  Learning,
} from '../types/index.js';
import { memoryManager } from './manager.js';

// ============================================================================
// Types
// ============================================================================

interface PatternCandidate {
  pattern: Pattern;
  confidence: number;
  evidence: string[];
}

interface PatternCluster {
  id: string;
  patterns: Pattern[];
  commonTriggers: string[];
  commonTags: string[];
  mergedPattern?: Pattern;
}

interface ExtractionConfig {
  minSuccessRate: number;
  minEvidence: number;
  enableClustering: boolean;
  clusterThreshold: number;
}

const DEFAULT_CONFIG: ExtractionConfig = {
  minSuccessRate: 0.8,
  minEvidence: 2,
  enableClustering: true,
  clusterThreshold: 0.7,
};

// ============================================================================
// Pattern Extractor
// ============================================================================

export class PatternExtractor {
  private config: ExtractionConfig;
  private pendingCandidates: Map<string, PatternCandidate[]> = new Map();

  constructor(config: Partial<ExtractionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // Pattern Extraction
  // ============================================================================

  /**
   * Extract pattern from a successful task execution
   */
  extractFromTask(
    task: Task,
    result: TaskResult,
    brainType: BrainType
  ): Pattern | null {
    // Only extract from successful tasks
    if (!result.success) {
      return null;
    }

    // Check if task has enough substance to form a pattern
    if (!this.isPatternWorthy(task, result)) {
      return null;
    }

    const pattern: Pattern = {
      id: uuidv4(),
      name: this.generatePatternName(task),
      description: this.generateDescription(task, result),
      trigger: this.extractTrigger(task),
      solution: this.extractSolution(task, result),
      context: this.extractContext(task),
      successRate: 1.0, // Initial success rate
      usageCount: 1,
      createdBy: brainType,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      tags: this.extractTags(task, result),
    };

    // Add to pending candidates for potential clustering
    this.addCandidate(pattern, brainType);

    return pattern;
  }

  /**
   * Extract pattern from multiple related learnings
   */
  extractFromLearnings(learnings: Learning[], brainType: BrainType): Pattern | null {
    if (learnings.length < this.config.minEvidence) {
      return null;
    }

    // Only consider success learnings
    const successLearnings = learnings.filter((l) => l.type === 'success');
    if (successLearnings.length < this.config.minEvidence) {
      return null;
    }

    // Find common themes
    const commonTags = this.findCommonTags(successLearnings);
    if (commonTags.length === 0) {
      return null;
    }

    // Synthesize pattern from learnings
    const pattern: Pattern = {
      id: uuidv4(),
      name: `Pattern: ${commonTags.slice(0, 3).join(' + ')}`,
      description: this.synthesizeDescription(successLearnings),
      trigger: commonTags.join(' '),
      solution: this.synthesizeSolution(successLearnings),
      context: commonTags,
      successRate: this.calculateAverageConfidence(successLearnings),
      usageCount: successLearnings.length,
      createdBy: brainType,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      tags: commonTags,
    };

    return pattern;
  }

  // ============================================================================
  // Pattern Clustering
  // ============================================================================

  /**
   * Cluster similar patterns to identify meta-patterns
   */
  clusterPatterns(patterns: Pattern[]): PatternCluster[] {
    if (!this.config.enableClustering || patterns.length < 2) {
      return [];
    }

    const clusters: PatternCluster[] = [];
    const assigned = new Set<string>();

    for (const pattern of patterns) {
      if (assigned.has(pattern.id)) continue;

      // Find similar patterns
      const similar = patterns.filter(
        (p) =>
          p.id !== pattern.id &&
          !assigned.has(p.id) &&
          this.calculateSimilarity(pattern, p) >= this.config.clusterThreshold
      );

      if (similar.length > 0) {
        const clusterPatterns = [pattern, ...similar];
        const cluster: PatternCluster = {
          id: uuidv4(),
          patterns: clusterPatterns,
          commonTriggers: this.findCommonTriggers(clusterPatterns),
          commonTags: this.findCommonPatternTags(clusterPatterns),
        };

        // Create merged pattern if cluster is significant
        if (clusterPatterns.length >= 3) {
          cluster.mergedPattern = this.mergePatterns(clusterPatterns);
        }

        clusters.push(cluster);
        clusterPatterns.forEach((p) => assigned.add(p.id));
      }
    }

    return clusters;
  }

  /**
   * Merge multiple patterns into a more general pattern
   */
  mergePatterns(patterns: Pattern[]): Pattern {
    const commonTags = this.findCommonPatternTags(patterns);
    const avgSuccessRate =
      patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
    const totalUsage = patterns.reduce((sum, p) => sum + p.usageCount, 0);

    return {
      id: uuidv4(),
      name: `Meta-Pattern: ${commonTags.slice(0, 2).join(' + ')}`,
      description: `Merged from ${patterns.length} similar patterns`,
      trigger: this.mergeStrings(patterns.map((p) => p.trigger)),
      solution: this.mergeStrings(patterns.map((p) => p.solution)),
      context: commonTags,
      successRate: avgSuccessRate,
      usageCount: totalUsage,
      createdBy: patterns[0].createdBy,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      tags: [...commonTags, 'meta-pattern'],
    };
  }

  // ============================================================================
  // Pattern Validation
  // ============================================================================

  /**
   * Validate a pattern before storage
   */
  validatePattern(pattern: Pattern): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!pattern.name || pattern.name.length < 5) {
      issues.push('Pattern name too short');
    }

    if (!pattern.trigger || pattern.trigger.length < 3) {
      issues.push('Pattern trigger too vague');
    }

    if (!pattern.solution || pattern.solution.length < 10) {
      issues.push('Pattern solution not detailed enough');
    }

    if (pattern.tags.length === 0) {
      issues.push('Pattern has no tags for discovery');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Score a pattern based on quality metrics
   */
  scorePattern(pattern: Pattern): number {
    let score = 0;

    // Success rate (40% weight)
    score += pattern.successRate * 40;

    // Usage frequency (20% weight)
    const usageScore = Math.min(pattern.usageCount / 10, 1) * 20;
    score += usageScore;

    // Description quality (20% weight)
    const descLength = pattern.description.length;
    const descScore = Math.min(descLength / 200, 1) * 20;
    score += descScore;

    // Tag coverage (20% weight)
    const tagScore = Math.min(pattern.tags.length / 5, 1) * 20;
    score += tagScore;

    return score;
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private isPatternWorthy(task: Task, result: TaskResult): boolean {
    // Must have meaningful description
    if (task.description.length < 20) return false;

    // Must have output
    if (!result.output) return false;

    // Should have some learnings
    if (result.learnings.length === 0) return false;

    return true;
  }

  private generatePatternName(task: Task): string {
    const subject = task.subject;
    // Remove common prefixes and clean up
    const cleaned = subject
      .replace(/^(implement|create|build|add|fix|update|refactor)\s+/i, '')
      .trim();
    return `Pattern: ${cleaned}`;
  }

  private generateDescription(task: Task, result: TaskResult): string {
    const learningsSummary = result.learnings
      .map((l) => l.recommendation)
      .join('; ');
    return `${task.description}\n\nKey learnings: ${learningsSummary || 'N/A'}`;
  }

  private extractTrigger(task: Task): string {
    // Extract key action words and nouns
    const words = task.subject.toLowerCase().split(/\s+/);
    const keywords = words.filter((w) => w.length > 3);
    return keywords.join(' ');
  }

  private extractSolution(task: Task, result: TaskResult): string {
    if (typeof result.output === 'string') {
      return result.output;
    }
    return JSON.stringify(result.output, null, 2);
  }

  private extractContext(task: Task): string[] {
    const context: string[] = [];

    // Add metadata keys as context
    context.push(...Object.keys(task.metadata));

    // Add priority as context
    context.push(task.priority);

    return context;
  }

  private extractTags(task: Task, result: TaskResult): string[] {
    const tags = new Set<string>();

    // Extract from task subject
    const subjectWords = task.subject.toLowerCase().split(/\s+/);
    subjectWords.filter((w) => w.length > 3).forEach((w) => tags.add(w));

    // Extract from learnings
    for (const learning of result.learnings) {
      learning.tags.forEach((t) => tags.add(t));
    }

    return [...tags].slice(0, 10);
  }

  private addCandidate(pattern: Pattern, brainType: BrainType): void {
    const key = brainType;
    if (!this.pendingCandidates.has(key)) {
      this.pendingCandidates.set(key, []);
    }

    this.pendingCandidates.get(key)!.push({
      pattern,
      confidence: this.scorePattern(pattern) / 100,
      evidence: pattern.tags,
    });
  }

  private findCommonTags(learnings: Learning[]): string[] {
    if (learnings.length === 0) return [];

    const tagCounts = new Map<string, number>();
    for (const learning of learnings) {
      for (const tag of learning.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    // Tags present in at least half the learnings
    const threshold = learnings.length / 2;
    return [...tagCounts.entries()]
      .filter(([, count]) => count >= threshold)
      .map(([tag]) => tag);
  }

  private findCommonPatternTags(patterns: Pattern[]): string[] {
    if (patterns.length === 0) return [];

    const tagCounts = new Map<string, number>();
    for (const pattern of patterns) {
      for (const tag of pattern.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    const threshold = patterns.length / 2;
    return [...tagCounts.entries()]
      .filter(([, count]) => count >= threshold)
      .map(([tag]) => tag);
  }

  private findCommonTriggers(patterns: Pattern[]): string[] {
    const words = patterns.flatMap((p) => p.trigger.split(/\s+/));
    const wordCounts = new Map<string, number>();

    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }

    const threshold = patterns.length / 2;
    return [...wordCounts.entries()]
      .filter(([, count]) => count >= threshold)
      .map(([word]) => word);
  }

  private synthesizeDescription(learnings: Learning[]): string {
    const descriptions = learnings.map((l) => l.description);
    return `Synthesized pattern from ${learnings.length} successful executions:\n${descriptions.join('\n')}`;
  }

  private synthesizeSolution(learnings: Learning[]): string {
    const recommendations = learnings.map((l) => l.recommendation);
    return recommendations.join('\n');
  }

  private calculateAverageConfidence(learnings: Learning[]): number {
    if (learnings.length === 0) return 0;
    return (
      learnings.reduce((sum, l) => sum + l.confidence, 0) / learnings.length
    );
  }

  private calculateSimilarity(a: Pattern, b: Pattern): number {
    // Compare tags
    const aSet = new Set(a.tags);
    const bSet = new Set(b.tags);
    const intersection = [...aSet].filter((t) => bSet.has(t)).length;
    const union = new Set([...a.tags, ...b.tags]).size;

    const tagSimilarity = union > 0 ? intersection / union : 0;

    // Compare triggers
    const aTriggers = new Set(a.trigger.split(/\s+/));
    const bTriggers = new Set(b.trigger.split(/\s+/));
    const triggerIntersection = [...aTriggers].filter((t) => bTriggers.has(t)).length;
    const triggerUnion = new Set([...a.trigger.split(/\s+/), ...b.trigger.split(/\s+/)]).size;

    const triggerSimilarity = triggerUnion > 0 ? triggerIntersection / triggerUnion : 0;

    return tagSimilarity * 0.6 + triggerSimilarity * 0.4;
  }

  private mergeStrings(strings: string[]): string {
    // Find common words across all strings
    const wordSets = strings.map((s) => new Set(s.split(/\s+/)));
    const commonWords = [...wordSets[0]].filter((word) =>
      wordSets.every((set) => set.has(word))
    );

    return commonWords.join(' ');
  }
}

// Export singleton instance
export const patternExtractor = new PatternExtractor();
