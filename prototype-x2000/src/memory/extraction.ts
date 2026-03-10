/**
 * Pattern Extraction Algorithms
 * Advanced post-task pattern extraction for the forever-learning memory system
 * Analyzes task outcomes, extracts reusable patterns, and identifies anti-patterns
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Pattern,
  Learning,
  Task,
  TaskResult,
  BrainType,
  Decision,
} from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

interface ExtractionContext {
  task: Task;
  result: TaskResult;
  brainType: BrainType;
  relatedPatterns?: Pattern[];
  relatedLearnings?: Learning[];
}

interface ExtractedPattern {
  pattern: Pattern;
  confidence: number;
  extractionMethod: ExtractionMethod;
  evidence: string[];
}

interface ExtractedLearning {
  learning: Learning;
  importance: 'critical' | 'high' | 'medium' | 'low';
  shouldPropagate: boolean;
}

interface ExtractionResult {
  patterns: ExtractedPattern[];
  learnings: ExtractedLearning[];
  antiPatterns: ExtractedLearning[];
  skillCandidates: SkillCandidate[];
  insights: string[];
}

interface SkillCandidate {
  name: string;
  description: string;
  category: string;
  implementation: string;
  confidence: number;
}

type ExtractionMethod =
  | 'task_success'
  | 'learning_synthesis'
  | 'failure_analysis'
  | 'decision_analysis'
  | 'cross_brain_correlation';

interface TextAnalysis {
  keywords: string[];
  entities: string[];
  sentiment: number;
  complexity: number;
}

interface SimilarityScore {
  itemId: string;
  score: number;
  matchedFeatures: string[];
}

// ============================================================================
// Pattern Extraction Engine
// ============================================================================

export class PatternExtractionEngine {
  private extractionHistory: Map<string, ExtractionResult> = new Map();
  private patternCandidateBuffer: ExtractedPattern[] = [];
  private readonly BUFFER_THRESHOLD = 5;
  private readonly MIN_CONFIDENCE = 0.6;

  // ============================================================================
  // Main Extraction Entry Point
  // ============================================================================

  /**
   * Extract patterns and learnings from a completed task
   * This is the main entry point called after task completion
   */
  async extractFromTaskCompletion(
    context: ExtractionContext
  ): Promise<ExtractionResult> {
    const { task, result, brainType } = context;

    console.log(`[Extraction] Analyzing task: ${task.subject}`);

    const extractionResult: ExtractionResult = {
      patterns: [],
      learnings: [],
      antiPatterns: [],
      skillCandidates: [],
      insights: [],
    };

    if (result.success) {
      // Success path: extract patterns and positive learnings
      const patterns = this.extractSuccessPatterns(context);
      extractionResult.patterns.push(...patterns);

      const learnings = this.extractSuccessLearnings(context);
      extractionResult.learnings.push(...learnings);

      const skills = this.identifySkillCandidates(context);
      extractionResult.skillCandidates.push(...skills);
    } else {
      // Failure path: extract anti-patterns and failure learnings
      const antiPatterns = this.extractFailurePatterns(context);
      extractionResult.antiPatterns.push(...antiPatterns);

      const failureLearnings = this.extractFailureLearnings(context);
      extractionResult.learnings.push(...failureLearnings);
    }

    // Always extract insights regardless of outcome
    const insights = this.generateInsights(context, extractionResult);
    extractionResult.insights.push(...insights);

    // Store extraction history
    this.extractionHistory.set(task.id, extractionResult);

    // Buffer patterns for potential synthesis
    this.bufferPatterns(extractionResult.patterns);

    // Check if we can synthesize meta-patterns from buffer
    const synthesized = this.checkForPatternSynthesis(brainType);
    extractionResult.patterns.push(...synthesized);

    console.log(
      `[Extraction] Extracted: ${extractionResult.patterns.length} patterns, ` +
        `${extractionResult.learnings.length} learnings, ` +
        `${extractionResult.antiPatterns.length} anti-patterns`
    );

    return extractionResult;
  }

  // ============================================================================
  // Success Pattern Extraction
  // ============================================================================

  /**
   * Extract patterns from successful task execution
   */
  private extractSuccessPatterns(context: ExtractionContext): ExtractedPattern[] {
    const { task, result, brainType } = context;
    const patterns: ExtractedPattern[] = [];

    // Check if task is pattern-worthy
    if (!this.isPatternWorthy(task, result)) {
      return patterns;
    }

    // Extract main pattern
    const mainPattern = this.createPatternFromTask(task, result, brainType);
    if (mainPattern.confidence >= this.MIN_CONFIDENCE) {
      patterns.push(mainPattern);
    }

    // Extract sub-patterns from learnings
    const learningPatterns = this.extractPatternsFromLearnings(
      result.learnings,
      brainType
    );
    patterns.push(...learningPatterns);

    // Check for compound patterns (multi-step solutions)
    if (task.subtaskIds.length > 0) {
      const compoundPattern = this.extractCompoundPattern(task, result, brainType);
      if (compoundPattern) {
        patterns.push(compoundPattern);
      }
    }

    return patterns;
  }

  /**
   * Create a pattern from a successful task
   */
  private createPatternFromTask(
    task: Task,
    result: TaskResult,
    brainType: BrainType
  ): ExtractedPattern {
    const analysis = this.analyzeText(`${task.subject} ${task.description}`);
    const evidence = this.collectEvidence(task, result);

    const pattern: Pattern = {
      id: uuidv4(),
      name: this.generatePatternName(task, analysis),
      description: this.generatePatternDescription(task, result),
      trigger: this.generateTrigger(task, analysis),
      solution: this.extractSolution(task, result),
      context: this.extractContextTags(task, analysis),
      successRate: 1.0,
      usageCount: 1,
      createdBy: brainType,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      tags: this.extractTags(task, result, analysis),
    };

    const confidence = this.calculatePatternConfidence(task, result, evidence);

    return {
      pattern,
      confidence,
      extractionMethod: 'task_success',
      evidence,
    };
  }

  /**
   * Extract patterns from task learnings
   */
  private extractPatternsFromLearnings(
    learnings: Learning[],
    brainType: BrainType
  ): ExtractedPattern[] {
    const patterns: ExtractedPattern[] = [];
    const successLearnings = learnings.filter((l) => l.type === 'success');

    // Group learnings by tags
    const tagGroups = this.groupLearningsByTags(successLearnings);

    for (const [tags, groupedLearnings] of tagGroups.entries()) {
      if (groupedLearnings.length >= 2) {
        const synthesizedPattern = this.synthesizePatternFromLearnings(
          groupedLearnings,
          tags,
          brainType
        );
        if (synthesizedPattern) {
          patterns.push(synthesizedPattern);
        }
      }
    }

    return patterns;
  }

  /**
   * Extract compound pattern from multi-step task
   */
  private extractCompoundPattern(
    task: Task,
    result: TaskResult,
    brainType: BrainType
  ): ExtractedPattern | null {
    if (task.subtaskIds.length < 2) {
      return null;
    }

    const pattern: Pattern = {
      id: uuidv4(),
      name: `Workflow: ${task.subject}`,
      description: `Multi-step pattern with ${task.subtaskIds.length} stages`,
      trigger: `complex ${task.description.slice(0, 50)}...`,
      solution: `Decomposed into ${task.subtaskIds.length} subtasks`,
      context: ['workflow', 'multi-step', task.priority],
      successRate: 1.0,
      usageCount: 1,
      createdBy: brainType,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      tags: ['workflow', 'compound', ...this.extractKeywords(task.subject)],
    };

    return {
      pattern,
      confidence: 0.7,
      extractionMethod: 'task_success',
      evidence: [`Completed ${task.subtaskIds.length} subtasks successfully`],
    };
  }

  // ============================================================================
  // Failure Pattern Extraction (Anti-Patterns)
  // ============================================================================

  /**
   * Extract anti-patterns from failed tasks
   */
  private extractFailurePatterns(
    context: ExtractionContext
  ): ExtractedLearning[] {
    const { task, result, brainType } = context;
    const antiPatterns: ExtractedLearning[] = [];

    // Main failure learning
    const mainAntiPattern = this.createFailureLearning(task, result, brainType);
    antiPatterns.push(mainAntiPattern);

    // Extract specific failure modes
    if (result.error) {
      const errorPatterns = this.analyzeErrorPattern(result.error, brainType);
      antiPatterns.push(...errorPatterns);
    }

    return antiPatterns;
  }

  /**
   * Create a learning from a failed task
   */
  private createFailureLearning(
    task: Task,
    result: TaskResult,
    brainType: BrainType
  ): ExtractedLearning {
    const rootCause = this.analyzeRootCause(task, result);

    const learning: Learning = {
      id: uuidv4(),
      type: 'failure',
      source: brainType,
      taskId: task.id,
      description: `Failed: ${task.subject}`,
      rootCause,
      recommendation: this.generateFailureRecommendation(task, result, rootCause),
      confidence: 0.8,
      createdAt: new Date(),
      appliedCount: 0,
      tags: ['failure', ...this.extractKeywords(task.subject)],
    };

    return {
      learning,
      importance: this.assessFailureImportance(task, result),
      shouldPropagate: true,
    };
  }

  /**
   * Analyze error patterns
   */
  private analyzeErrorPattern(
    error: string,
    brainType: BrainType
  ): ExtractedLearning[] {
    const patterns: ExtractedLearning[] = [];

    // Common error categories
    const errorCategories = [
      { pattern: /timeout/i, category: 'timeout', recommendation: 'Add retry logic or increase timeout' },
      { pattern: /permission|denied|forbidden/i, category: 'permission', recommendation: 'Verify access rights before operation' },
      { pattern: /not found|404|missing/i, category: 'not_found', recommendation: 'Validate resource existence first' },
      { pattern: /invalid|malformed|parse/i, category: 'validation', recommendation: 'Add input validation' },
      { pattern: /connection|network|unreachable/i, category: 'network', recommendation: 'Add connection retry and fallback' },
      { pattern: /memory|heap|oom/i, category: 'resource', recommendation: 'Optimize memory usage or add limits' },
    ];

    for (const { pattern, category, recommendation } of errorCategories) {
      if (pattern.test(error)) {
        patterns.push({
          learning: {
            id: uuidv4(),
            type: 'failure',
            source: brainType,
            taskId: '',
            description: `Error category: ${category}`,
            rootCause: error,
            recommendation,
            confidence: 0.9,
            createdAt: new Date(),
            appliedCount: 0,
            tags: ['error', category],
          },
          importance: 'high',
          shouldPropagate: true,
        });
        break; // Only match first category
      }
    }

    return patterns;
  }

  // ============================================================================
  // Success Learning Extraction
  // ============================================================================

  /**
   * Extract learnings from successful task
   */
  private extractSuccessLearnings(
    context: ExtractionContext
  ): ExtractedLearning[] {
    const { task, result, brainType } = context;
    const learnings: ExtractedLearning[] = [];

    // Process existing learnings from result
    for (const learning of result.learnings) {
      learnings.push({
        learning,
        importance: this.assessLearningImportance(learning),
        shouldPropagate: learning.confidence >= 0.7,
      });
    }

    // Generate additional learnings from task execution
    const durationLearning = this.analyzeExecutionDuration(task, result, brainType);
    if (durationLearning) {
      learnings.push(durationLearning);
    }

    return learnings;
  }

  /**
   * Extract learnings from failed task
   */
  private extractFailureLearnings(
    context: ExtractionContext
  ): ExtractedLearning[] {
    const { result } = context;
    const learnings: ExtractedLearning[] = [];

    // Process existing learnings (even failures can have learnings)
    for (const learning of result.learnings) {
      learnings.push({
        learning: {
          ...learning,
          type: 'failure',
        },
        importance: 'high',
        shouldPropagate: true,
      });
    }

    return learnings;
  }

  /**
   * Analyze execution duration for learnings
   */
  private analyzeExecutionDuration(
    task: Task,
    result: TaskResult,
    brainType: BrainType
  ): ExtractedLearning | null {
    // Only create learning for notably fast or slow executions
    const durationSeconds = result.duration / 1000;

    if (durationSeconds < 1 && task.description.length > 100) {
      return {
        learning: {
          id: uuidv4(),
          type: 'insight',
          source: brainType,
          taskId: task.id,
          description: `Fast execution (${durationSeconds.toFixed(2)}s) for complex task`,
          recommendation: 'This approach is efficient - consider as template',
          confidence: 0.7,
          createdAt: new Date(),
          appliedCount: 0,
          tags: ['performance', 'fast', 'efficiency'],
        },
        importance: 'medium',
        shouldPropagate: false,
      };
    }

    if (durationSeconds > 60) {
      return {
        learning: {
          id: uuidv4(),
          type: 'insight',
          source: brainType,
          taskId: task.id,
          description: `Slow execution (${durationSeconds.toFixed(2)}s)`,
          recommendation: 'Consider optimization or decomposition',
          confidence: 0.7,
          createdAt: new Date(),
          appliedCount: 0,
          tags: ['performance', 'slow', 'optimization-needed'],
        },
        importance: 'medium',
        shouldPropagate: false,
      };
    }

    return null;
  }

  // ============================================================================
  // Skill Candidate Identification
  // ============================================================================

  /**
   * Identify potential skills from successful task execution
   */
  private identifySkillCandidates(
    context: ExtractionContext
  ): SkillCandidate[] {
    const { task, result } = context;
    const candidates: SkillCandidate[] = [];

    // Only consider tasks with meaningful output
    if (!result.output || typeof result.output !== 'object') {
      return candidates;
    }

    // Check if this looks like a reusable capability
    const hasStructuredOutput = this.hasStructuredOutput(result.output);
    const isGeneralizable = this.isTaskGeneralizable(task);

    if (hasStructuredOutput && isGeneralizable) {
      const category = this.inferSkillCategory(task);

      candidates.push({
        name: `Skill: ${this.extractCapabilityName(task)}`,
        description: task.description,
        category,
        implementation: this.extractSolution(task, result),
        confidence: 0.7,
      });
    }

    return candidates;
  }

  // ============================================================================
  // Pattern Synthesis
  // ============================================================================

  /**
   * Buffer patterns for potential synthesis
   */
  private bufferPatterns(patterns: ExtractedPattern[]): void {
    this.patternCandidateBuffer.push(...patterns);

    // Keep buffer size manageable
    if (this.patternCandidateBuffer.length > 50) {
      this.patternCandidateBuffer = this.patternCandidateBuffer.slice(-30);
    }
  }

  /**
   * Check if we can synthesize meta-patterns from buffered patterns
   */
  private checkForPatternSynthesis(brainType: BrainType): ExtractedPattern[] {
    if (this.patternCandidateBuffer.length < this.BUFFER_THRESHOLD) {
      return [];
    }

    const synthesized: ExtractedPattern[] = [];

    // Group patterns by tags
    const tagGroups = this.groupPatternsByTags(
      this.patternCandidateBuffer.map((p) => p.pattern)
    );

    for (const [commonTags, patterns] of tagGroups.entries()) {
      if (patterns.length >= 3) {
        const metaPattern = this.synthesizeMetaPattern(patterns, commonTags, brainType);
        if (metaPattern) {
          synthesized.push(metaPattern);

          // Remove synthesized patterns from buffer
          const patternIds = new Set(patterns.map((p) => p.id));
          this.patternCandidateBuffer = this.patternCandidateBuffer.filter(
            (p) => !patternIds.has(p.pattern.id)
          );
        }
      }
    }

    return synthesized;
  }

  /**
   * Synthesize a meta-pattern from similar patterns
   */
  private synthesizeMetaPattern(
    patterns: Pattern[],
    commonTags: string,
    brainType: BrainType
  ): ExtractedPattern | null {
    const tags = commonTags.split(',');

    const avgSuccessRate =
      patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;

    const pattern: Pattern = {
      id: uuidv4(),
      name: `Meta: ${tags.slice(0, 2).join(' + ')}`,
      description: `Synthesized from ${patterns.length} related patterns`,
      trigger: this.findCommonTrigger(patterns),
      solution: this.synthesizeSolution(patterns),
      context: tags,
      successRate: avgSuccessRate,
      usageCount: patterns.reduce((sum, p) => sum + p.usageCount, 0),
      createdBy: brainType,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      tags: [...tags, 'meta-pattern', 'synthesized'],
    };

    return {
      pattern,
      confidence: Math.min(0.9, avgSuccessRate),
      extractionMethod: 'learning_synthesis',
      evidence: patterns.map((p) => `Derived from: ${p.name}`),
    };
  }

  /**
   * Synthesize pattern from learnings
   */
  private synthesizePatternFromLearnings(
    learnings: Learning[],
    tagsKey: string,
    brainType: BrainType
  ): ExtractedPattern | null {
    const tags = tagsKey.split(',');
    const avgConfidence =
      learnings.reduce((sum, l) => sum + l.confidence, 0) / learnings.length;

    if (avgConfidence < this.MIN_CONFIDENCE) {
      return null;
    }

    const pattern: Pattern = {
      id: uuidv4(),
      name: `Pattern: ${tags.slice(0, 2).join(' + ')}`,
      description: learnings.map((l) => l.description).join('\n'),
      trigger: tags.join(' '),
      solution: learnings.map((l) => l.recommendation).join('\n'),
      context: tags,
      successRate: avgConfidence,
      usageCount: learnings.length,
      createdBy: brainType,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      tags,
    };

    return {
      pattern,
      confidence: avgConfidence,
      extractionMethod: 'learning_synthesis',
      evidence: learnings.map((l) => l.description),
    };
  }

  // ============================================================================
  // Insight Generation
  // ============================================================================

  /**
   * Generate insights from extraction results
   */
  private generateInsights(
    context: ExtractionContext,
    results: ExtractionResult
  ): string[] {
    const insights: string[] = [];
    const { task, result } = context;

    // Task completion insight
    if (result.success) {
      insights.push(
        `Successfully completed "${task.subject}" in ${(result.duration / 1000).toFixed(2)}s`
      );
    } else {
      insights.push(`Failed "${task.subject}": ${result.error ?? 'Unknown error'}`);
    }

    // Pattern insights
    if (results.patterns.length > 0) {
      insights.push(
        `Extracted ${results.patterns.length} reusable pattern(s)`
      );
    }

    // Learning insights
    const highImportanceLearnings = results.learnings.filter(
      (l) => l.importance === 'critical' || l.importance === 'high'
    );
    if (highImportanceLearnings.length > 0) {
      insights.push(
        `${highImportanceLearnings.length} high-importance learning(s) identified`
      );
    }

    // Anti-pattern insights
    if (results.antiPatterns.length > 0) {
      insights.push(
        `Identified ${results.antiPatterns.length} anti-pattern(s) to avoid`
      );
    }

    // Skill insights
    if (results.skillCandidates.length > 0) {
      insights.push(
        `${results.skillCandidates.length} potential skill(s) for skill pool`
      );
    }

    return insights;
  }

  // ============================================================================
  // Cross-Brain Correlation (for future implementation)
  // ============================================================================

  /**
   * Find correlations across different brains' patterns
   */
  correlateAcrossBrains(
    patternsA: Pattern[],
    patternsB: Pattern[]
  ): Array<{ patternA: Pattern; patternB: Pattern; correlation: number }> {
    const correlations: Array<{
      patternA: Pattern;
      patternB: Pattern;
      correlation: number;
    }> = [];

    for (const patternA of patternsA) {
      for (const patternB of patternsB) {
        if (patternA.id === patternB.id) continue;

        const correlation = this.calculatePatternCorrelation(patternA, patternB);
        if (correlation > 0.6) {
          correlations.push({ patternA, patternB, correlation });
        }
      }
    }

    return correlations.sort((a, b) => b.correlation - a.correlation);
  }

  /**
   * Calculate correlation between two patterns
   */
  private calculatePatternCorrelation(a: Pattern, b: Pattern): number {
    // Tag overlap
    const aSet = new Set(a.tags);
    const bSet = new Set(b.tags);
    const intersection = [...aSet].filter((t) => bSet.has(t)).length;
    const union = new Set([...a.tags, ...b.tags]).size;
    const tagSimilarity = union > 0 ? intersection / union : 0;

    // Trigger similarity
    const aTriggers = new Set(a.trigger.toLowerCase().split(/\s+/));
    const bTriggers = new Set(b.trigger.toLowerCase().split(/\s+/));
    const triggerIntersection = [...aTriggers].filter((t) => bTriggers.has(t)).length;
    const triggerUnion = new Set([...aTriggers, ...bTriggers]).size;
    const triggerSimilarity = triggerUnion > 0 ? triggerIntersection / triggerUnion : 0;

    // Context overlap
    const aContext = new Set(a.context);
    const bContext = new Set(b.context);
    const contextIntersection = [...aContext].filter((c) => bContext.has(c)).length;
    const contextUnion = new Set([...a.context, ...b.context]).size;
    const contextSimilarity = contextUnion > 0 ? contextIntersection / contextUnion : 0;

    return tagSimilarity * 0.4 + triggerSimilarity * 0.35 + contextSimilarity * 0.25;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private isPatternWorthy(task: Task, result: TaskResult): boolean {
    // Must have meaningful description
    if (task.description.length < 20) return false;

    // Must have output
    if (!result.output) return false;

    // Should have some learnings or meaningful duration
    if (result.learnings.length === 0 && result.duration < 1000) return false;

    return true;
  }

  private analyzeText(text: string): TextAnalysis {
    const words = text.toLowerCase().split(/\s+/);
    const keywords = words.filter((w) => w.length > 3);

    // Simple entity extraction (words that start with capital)
    const entities = text.match(/[A-Z][a-z]+/g) ?? [];

    // Simple sentiment (-1 to 1)
    const positiveWords = ['success', 'complete', 'good', 'great', 'excellent'];
    const negativeWords = ['fail', 'error', 'bad', 'wrong', 'issue'];
    const positiveCount = keywords.filter((w) => positiveWords.includes(w)).length;
    const negativeCount = keywords.filter((w) => negativeWords.includes(w)).length;
    const sentiment = (positiveCount - negativeCount) / Math.max(1, keywords.length);

    // Complexity based on length and unique words
    const uniqueWords = new Set(keywords).size;
    const complexity = Math.min(1, (uniqueWords / 50) * (text.length / 500));

    return { keywords, entities, sentiment, complexity };
  }

  private generatePatternName(task: Task, analysis: TextAnalysis): string {
    const mainKeywords = analysis.keywords.slice(0, 3);
    const cleaned = mainKeywords.join(' ').replace(/^\w/, (c) => c.toUpperCase());
    return `Pattern: ${cleaned || task.subject.slice(0, 30)}`;
  }

  private generatePatternDescription(task: Task, result: TaskResult): string {
    const learningsSummary =
      result.learnings.length > 0
        ? result.learnings.map((l) => l.recommendation).join('; ')
        : 'No specific learnings captured';

    return `${task.description}\n\nKey insights: ${learningsSummary}`;
  }

  private generateTrigger(task: Task, analysis: TextAnalysis): string {
    return analysis.keywords.slice(0, 5).join(' ');
  }

  private extractSolution(task: Task, result: TaskResult): string {
    if (typeof result.output === 'string') {
      return result.output.slice(0, 1000);
    }
    return JSON.stringify(result.output, null, 2).slice(0, 1000);
  }

  private extractContextTags(task: Task, analysis: TextAnalysis): string[] {
    const context: string[] = [task.priority];

    // Add metadata keys
    context.push(...Object.keys(task.metadata).slice(0, 3));

    // Add entities
    context.push(...analysis.entities.slice(0, 3));

    return [...new Set(context)];
  }

  private extractTags(
    task: Task,
    result: TaskResult,
    analysis: TextAnalysis
  ): string[] {
    const tags = new Set<string>();

    // From analysis keywords
    analysis.keywords.slice(0, 5).forEach((k) => tags.add(k));

    // From learnings
    for (const learning of result.learnings) {
      learning.tags.forEach((t) => tags.add(t));
    }

    // Standard tags based on task properties
    if (task.priority === 'critical' || task.priority === 'high') {
      tags.add('high-priority');
    }

    return [...tags].slice(0, 10);
  }

  private collectEvidence(task: Task, result: TaskResult): string[] {
    const evidence: string[] = [];

    evidence.push(`Task completed: ${task.subject}`);
    evidence.push(`Duration: ${result.duration}ms`);

    if (result.learnings.length > 0) {
      evidence.push(`${result.learnings.length} learnings captured`);
    }

    return evidence;
  }

  private calculatePatternConfidence(
    task: Task,
    result: TaskResult,
    evidence: string[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost for learnings
    confidence += Math.min(0.2, result.learnings.length * 0.05);

    // Boost for detailed description
    confidence += Math.min(0.15, task.description.length / 500);

    // Boost for evidence
    confidence += Math.min(0.15, evidence.length * 0.05);

    return Math.min(1.0, confidence);
  }

  private groupLearningsByTags(
    learnings: Learning[]
  ): Map<string, Learning[]> {
    const groups = new Map<string, Learning[]>();

    for (const learning of learnings) {
      const tagsKey = learning.tags.sort().join(',');
      if (!groups.has(tagsKey)) {
        groups.set(tagsKey, []);
      }
      groups.get(tagsKey)!.push(learning);
    }

    return groups;
  }

  private groupPatternsByTags(patterns: Pattern[]): Map<string, Pattern[]> {
    const groups = new Map<string, Pattern[]>();

    for (const pattern of patterns) {
      const tagsKey = pattern.tags.sort().slice(0, 3).join(',');
      if (!groups.has(tagsKey)) {
        groups.set(tagsKey, []);
      }
      groups.get(tagsKey)!.push(pattern);
    }

    return groups;
  }

  private analyzeRootCause(task: Task, result: TaskResult): string {
    if (result.error) {
      return result.error;
    }

    // Analyze based on task state
    if (task.blockedBy.length > 0) {
      return 'Blocked by dependencies';
    }

    return 'Unknown root cause - insufficient data';
  }

  private generateFailureRecommendation(
    task: Task,
    result: TaskResult,
    rootCause: string
  ): string {
    // Generate recommendations based on root cause
    if (rootCause.includes('timeout')) {
      return 'Consider increasing timeouts or breaking into smaller operations';
    }

    if (rootCause.includes('permission') || rootCause.includes('denied')) {
      return 'Verify access permissions before attempting operation';
    }

    if (rootCause.includes('not found') || rootCause.includes('missing')) {
      return 'Add existence checks before operations';
    }

    if (task.blockedBy.length > 0) {
      return 'Ensure dependencies are resolved before starting';
    }

    return 'Review logs and add better error handling';
  }

  private assessFailureImportance(
    task: Task,
    result: TaskResult
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (task.priority === 'critical') return 'critical';
    if (task.priority === 'high') return 'high';
    if (result.duration > 60000) return 'high'; // Long running task
    return 'medium';
  }

  private assessLearningImportance(
    learning: Learning
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (learning.confidence >= 0.9) return 'high';
    if (learning.confidence >= 0.7) return 'medium';
    return 'low';
  }

  private hasStructuredOutput(output: unknown): boolean {
    if (typeof output !== 'object' || output === null) return false;
    return Object.keys(output).length > 0;
  }

  private isTaskGeneralizable(task: Task): boolean {
    // Tasks with generic descriptions are more generalizable
    const specificIndicators = ['this', 'specific', 'particular', 'only'];
    const description = task.description.toLowerCase();
    return !specificIndicators.some((i) => description.includes(i));
  }

  private inferSkillCategory(task: Task): string {
    const keywords = task.subject.toLowerCase();

    if (/analyze|research|data|report/.test(keywords)) return 'analysis';
    if (/build|create|implement|code/.test(keywords)) return 'implementation';
    if (/write|document|email|present/.test(keywords)) return 'communication';
    if (/plan|strategy|roadmap/.test(keywords)) return 'planning';
    if (/optimize|improve|speed|performance/.test(keywords)) return 'optimization';
    if (/integrate|api|connect/.test(keywords)) return 'integration';
    if (/test|validate|verify/.test(keywords)) return 'validation';
    if (/secure|auth|protect/.test(keywords)) return 'security';

    return 'implementation';
  }

  private extractCapabilityName(task: Task): string {
    return task.subject
      .replace(/^(implement|create|build|add|fix|update)\s+/i, '')
      .trim()
      .slice(0, 50);
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 5);
  }

  private findCommonTrigger(patterns: Pattern[]): string {
    const triggerWords = patterns.flatMap((p) =>
      p.trigger.toLowerCase().split(/\s+/)
    );

    const wordCounts = new Map<string, number>();
    for (const word of triggerWords) {
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
    }

    const threshold = patterns.length / 2;
    return [...wordCounts.entries()]
      .filter(([, count]) => count >= threshold)
      .map(([word]) => word)
      .slice(0, 5)
      .join(' ');
  }

  private synthesizeSolution(patterns: Pattern[]): string {
    // Find common solution elements
    const solutions = patterns.map((p) => p.solution);
    return `Combined approach from ${patterns.length} patterns:\n${solutions.slice(0, 3).join('\n---\n')}`;
  }
}

// Export singleton instance
export const patternExtractionEngine = new PatternExtractionEngine();
