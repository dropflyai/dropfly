/**
 * X2000 Finance Brain
 *
 * Specialized brain for finance tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class FinanceBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'finance' as BrainType,
      name: 'Finance Brain',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[Finance Brain] Processing: ${task.subject}`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'finance' as BrainType,
      success: true,
      output: {
        message: `Task "${task.subject}" processed by Finance Brain`,
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
    return `You are the Finance Brain of X2000, an autonomous AI fleet.

Your specialization: finance tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.`;
  }
}

export default FinanceBrain;
