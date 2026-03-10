/**
 * X2000 Research Brain
 *
 * Specialized brain for research tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class ResearchBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'research' as BrainType,
      name: 'Research Brain',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[Research Brain] Processing: ${task.subject}`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'research' as BrainType,
      success: true,
      output: {
        message: `Task "${task.subject}" processed by Research Brain`,
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
    return `You are the Research Brain of X2000, an autonomous AI fleet.

Your specialization: research tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.`;
  }
}

export default ResearchBrain;
