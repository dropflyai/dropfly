/**
 * X2000 Sales Brain
 *
 * Specialized brain for sales tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class SalesBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'sales' as BrainType,
      name: 'Sales Brain',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[Sales Brain] Processing: ${task.subject}`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'sales' as BrainType,
      success: true,
      output: {
        message: `Task "${task.subject}" processed by Sales Brain`,
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
    return `You are the Sales Brain of X2000, an autonomous AI fleet.

Your specialization: sales tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.`;
  }
}

export default SalesBrain;
