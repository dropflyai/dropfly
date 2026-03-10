/**
 * X2000 Investor Brain
 *
 * Specialized brain for investor tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class InvestorBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'investor' as BrainType,
      name: 'Investor Brain',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[Investor Brain] Processing: ${task.subject}`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'investor' as BrainType,
      success: true,
      output: {
        message: `Task "${task.subject}" processed by Investor Brain`,
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
    return `You are the Investor Brain of X2000, an autonomous AI fleet.

Your specialization: investor tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.`;
  }
}

export default InvestorBrain;
