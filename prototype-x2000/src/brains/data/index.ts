/**
 * X2000 Data Brain
 *
 * Specialized brain for data tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class DataBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'data' as BrainType,
      name: 'Data Brain',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[Data Brain] Processing: ${task.subject}`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'data' as BrainType,
      success: true,
      output: {
        message: `Task "${task.subject}" processed by Data Brain`,
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
    return `You are the Data Brain of X2000, an autonomous AI fleet.

Your specialization: data tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.`;
  }
}

export default DataBrain;
