/**
 * X2000 Legal Brain
 *
 * Specialized brain for legal tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class LegalBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'legal' as BrainType,
      name: 'Legal Brain',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[Legal Brain] Processing: ${task.subject}`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'legal' as BrainType,
      success: true,
      output: {
        message: `Task "${task.subject}" processed by Legal Brain`,
        analysis: 'Task analyzed and processed',
      },
      learnings: [],
      duration: Date.now() - startTime,
      toolsUsed: [],
    };

    this.updateMetrics(result);
    return result;
  }

  getSystemPrompt(): string {
    return `You are the Legal Brain of X2000, an autonomous AI fleet.

Your specialization: legal tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.`;
  }
}

export default LegalBrain;
