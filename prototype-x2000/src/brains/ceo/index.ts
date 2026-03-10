/**
 * X2000 CEO Brain
 *
 * Master orchestrator for the autonomous AI fleet.
 * Routes tasks to specialized brains and coordinates collaboration.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
  TrustLevel,
} from '../../types/index.js';

// ============================================================================
// CEO Brain Configuration
// ============================================================================

const CEO_CAPABILITIES = [
  'orchestration',
  'delegation',
  'decision-making',
  'strategy',
  'conflict-resolution',
  'task-decomposition',
  'collaboration',
  'general',
];

// ============================================================================
// CEO Brain Class
// ============================================================================

export class CEOBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'ceo' as BrainType,
      name: 'CEO Brain',
      capabilities: CEO_CAPABILITIES,
      trustLevel: 4 as TrustLevel,
    });
  }

  /**
   * Execute a task by orchestrating specialist brains
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[CEO Brain] Received task: ${task.subject}`);

    // Analyze the task to determine which brains are needed
    const requiredBrains = this.analyzeTaskRequirements(task);
    console.log(`[CEO Brain] Required brains: ${requiredBrains.join(', ')}`);

    // For now, execute directly (future: delegate to brains)
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'ceo',
      success: true,
      output: {
        analysis: `Task "${task.subject}" analyzed`,
        requiredBrains,
        recommendation: 'Task decomposed and ready for execution',
      },
      learnings: [],
      duration: Date.now() - startTime,
      toolsUsed: [],
      delegatedTo: requiredBrains as BrainType[],
    };

    this.updateMetrics(result);
    return result;
  }

  /**
   * Get CEO-specific system prompt
   */
  getSystemPrompt(): string {
    return `You are the CEO Brain of X2000, an autonomous AI fleet that builds billion-dollar businesses.

Your responsibilities:
1. ORCHESTRATION: Receive tasks and route them to the appropriate specialist brains
2. DECOMPOSITION: Break complex tasks into brain-specific subtasks
3. DELEGATION: Assign subtasks to the most qualified brains
4. COLLABORATION: Facilitate brain tension protocol for better decisions
5. SYNTHESIS: Combine results from multiple brains into coherent outputs
6. CONFLICT RESOLUTION: Resolve disagreements between brains

You have access to 44+ specialized brains including:
- Engineering, Design, Product, Research, QA
- Finance, Marketing, Sales, Operations, Legal
- Data, Security, Cloud, Mobile, AI
- And many more domain experts

RULES:
- Always route tasks through proper channels
- Use brain tension for important decisions
- Log all decisions to memory
- Verify before claiming completion
- Maintain earned autonomy protocols

TRUST LEVEL: 4 (Full Autonomy)
- You can execute any action within X2000
- You are responsible for the entire fleet's performance
- All other brains report to you`;
  }

  /**
   * Analyze task to determine required brains
   */
  private analyzeTaskRequirements(task: Task): string[] {
    const brains: string[] = [];
    const description = `${task.subject} ${task.description}`.toLowerCase();

    // Engineering tasks
    if (description.match(/code|build|implement|fix|debug|develop|api|backend|frontend/)) {
      brains.push('engineering');
    }

    // Design tasks
    if (description.match(/design|ui|ux|visual|prototype|wireframe|mockup/)) {
      brains.push('design');
    }

    // Product tasks
    if (description.match(/product|roadmap|requirement|feature|priority|user story/)) {
      brains.push('product');
    }

    // Research tasks
    if (description.match(/research|analyze|market|competitor|trend|study/)) {
      brains.push('research');
    }

    // QA tasks
    if (description.match(/test|quality|qa|bug|automation|coverage/)) {
      brains.push('qa');
    }

    // Finance tasks
    if (description.match(/finance|budget|revenue|cost|price|investment|financial/)) {
      brains.push('finance');
    }

    // Marketing tasks
    if (description.match(/marketing|campaign|growth|acquisition|brand|seo|content/)) {
      brains.push('marketing');
    }

    // Sales tasks
    if (description.match(/sales|lead|customer|deal|pipeline|crm/)) {
      brains.push('sales');
    }

    // If no specific brain matched, default to research + relevant domain
    if (brains.length === 0) {
      brains.push('research');
    }

    return brains;
  }

  /**
   * Orchestrate multiple brains for a complex task
   */
  async orchestrate(taskDescription: string): Promise<TaskResult> {
    const task: Task = {
      id: `ceo-task-${Date.now()}`,
      subject: 'CEO Orchestration',
      description: taskDescription,
      status: 'in_progress',
      priority: 'high',
      subtaskIds: [],
      blockedBy: [],
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { orchestrated: true },
    };

    return this.executeTask(task);
  }

  /**
   * Get collaboration preferences for CEO
   */
  override getCollaborationPreferences() {
    return {
      preferredPartners: ['research', 'engineering', 'product'] as BrainType[],
      avoidedPartners: [] as BrainType[],
      maxConcurrentCollaborations: 10,
    };
  }
}

export default CEOBrain;
