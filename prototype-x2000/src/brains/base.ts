/**
 * X2000 Base Brain Class
 * 
 * All brains extend this base class to provide consistent interface
 * and shared functionality across the autonomous AI fleet.
 */

import type {
  BrainType,
  BrainConfig,
  BrainState,
  BrainContext,
  BrainMetrics,
  Task,
  TaskResult,
  TrustLevel,
  Learning,
  Pattern,
  Skill,
  Decision,
} from '../types/index.js';

export abstract class BaseBrain {
  protected config: BrainConfig;
  protected state: BrainState;

  constructor(config: BrainConfig) {
    this.config = config;
    this.state = {
      brainType: config.type,
      sessionId: '',
      isActive: false,
      context: {
        recentDecisions: [],
        activePatterns: [],
        relevantSkills: [],
        workingMemory: {},
      },
      trustLevel: config.trustLevel,
      metrics: {
        tasksCompleted: 0,
        successRate: 0,
        avgDuration: 0,
        learningsContributed: 0,
        collaborations: 0,
      },
    };
  }

  /**
   * Execute a task using this brain's specialized capabilities
   */
  abstract executeTask(task: Task): Promise<TaskResult>;

  /**
   * Get brain-specific system prompt
   */
  abstract getSystemPrompt(): string;

  /**
   * Update brain context with new information
   */
  updateContext(updates: Partial<BrainContext>): void {
    this.state.context = { ...this.state.context, ...updates };
  }

  /**
   * Activate this brain for a session
   */
  activate(sessionId: string): void {
    this.state.sessionId = sessionId;
    this.state.isActive = true;
  }

  /**
   * Deactivate this brain
   */
  deactivate(): void {
    this.state.isActive = false;
  }

  /**
   * Get current brain state
   */
  getState(): BrainState {
    return { ...this.state };
  }

  /**
   * Get brain configuration
   */
  getConfig(): BrainConfig {
    return { ...this.config };
  }

  /**
   * Update metrics after task completion
   */
  updateMetrics(result: TaskResult): void {
    this.state.metrics.tasksCompleted++;
    
    if (result.success) {
      const newTotal = this.state.metrics.tasksCompleted;
      const currentSuccesses = Math.floor(this.state.metrics.successRate * (newTotal - 1));
      this.state.metrics.successRate = (currentSuccesses + 1) / newTotal;
    } else {
      const newTotal = this.state.metrics.tasksCompleted;
      const currentSuccesses = Math.floor(this.state.metrics.successRate * (newTotal - 1));
      this.state.metrics.successRate = currentSuccesses / newTotal;
    }

    // Update average duration
    const totalTasks = this.state.metrics.tasksCompleted;
    const currentAvg = this.state.metrics.avgDuration;
    this.state.metrics.avgDuration = ((currentAvg * (totalTasks - 1)) + result.duration) / totalTasks;

    // Update learnings contributed
    this.state.metrics.learningsContributed += result.learnings.length;
  }

  /**
   * Extract patterns from recent work
   */
  extractPatterns(): Pattern[] {
    // Base implementation - can be overridden by specific brains
    return [];
  }

  /**
   * Share knowledge with other brains
   */
  shareSkill(skill: Skill): void {
    // Add skill to relevant skills in context
    if (!this.state.context.relevantSkills.some(s => s.id === skill.id)) {
      this.state.context.relevantSkills.push(skill);
    }
  }

  /**
   * Learn from a decision outcome
   */
  learnFromDecision(decision: Decision, outcome: 'positive' | 'negative' | 'neutral'): Learning[] {
    const learnings: Learning[] = [];
    
    if (outcome === 'negative') {
      learnings.push({
        id: `learning_${Date.now()}_${this.config.type}`,
        type: 'failure',
        source: this.config.type,
        taskId: decision.id,
        description: `Decision "${decision.description}" led to negative outcome`,
        rootCause: `Selected option: ${decision.selectedOption}`,
        recommendation: `Consider alternative approaches for similar decisions`,
        confidence: 0.8,
        createdAt: new Date(),
        appliedCount: 0,
        tags: ['decision-failure', this.config.type],
      });
    } else if (outcome === 'positive') {
      learnings.push({
        id: `learning_${Date.now()}_${this.config.type}`,
        type: 'success',
        source: this.config.type,
        taskId: decision.id,
        description: `Decision "${decision.description}" led to positive outcome`,
        recommendation: `Replicate this decision-making approach for similar scenarios`,
        confidence: 0.9,
        createdAt: new Date(),
        appliedCount: 0,
        tags: ['decision-success', this.config.type],
      });
    }

    return learnings;
  }

  /**
   * Check if brain can handle a specific task type
   */
  canHandle(task: Task): boolean {
    // Base implementation - checks if task metadata matches brain capabilities
    const taskType = task.metadata.type as string;
    return this.config.capabilities.includes(taskType) || 
           this.config.capabilities.includes('general');
  }

  /**
   * Get collaboration preferences for this brain
   */
  getCollaborationPreferences(): {
    preferredPartners: BrainType[];
    avoidedPartners: BrainType[];
    maxConcurrentCollaborations: number;
  } {
    // Base implementation - can be overridden
    return {
      preferredPartners: [],
      avoidedPartners: [],
      maxConcurrentCollaborations: 3,
    };
  }
}

export default BaseBrain;