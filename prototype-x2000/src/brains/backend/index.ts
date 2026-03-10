/**
 * X2000 Backend Brain
 *
 * Specialized brain for backend tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class BackendBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'backend' as BrainType,
      name: 'Backend Brain',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[Backend Brain] Processing: ${task.subject}`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'backend' as BrainType,
      success: true,
      output: {
        message: `Task "${task.subject}" processed by Backend Brain`,
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
    return `You are the Backend Brain of X2000, an autonomous AI fleet.

Your specialization: backend tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.`;
  }
}

export default BackendBrain;
