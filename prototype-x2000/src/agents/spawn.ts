/**
 * X2000 Agent Spawner
 *
 * Creates and manages AI agents.
 */

import type { BrainType, TrustLevel, Task } from '../types/index.js';
import { AgentLoop, type AgentLoopConfig, type AgentLoopResult } from './loop.js';

// ============================================================================
// Types
// ============================================================================

export interface SpawnConfig {
  brainType: BrainType | string;
  trustLevel: TrustLevel;
  parentId?: string;
  context?: Record<string, unknown>;
  loopConfig?: Partial<AgentLoopConfig>;
}

export interface SpawnedAgent {
  id: string;
  brainType: BrainType | string;
  trustLevel: TrustLevel;
  parentId?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  result?: AgentLoopResult;
}

// ============================================================================
// Agent Spawner Class
// ============================================================================

export class AgentSpawner {
  private agents: Map<string, SpawnedAgent> = new Map();
  private counter = 0;

  spawn(config: SpawnConfig): SpawnedAgent {
    const id = `agent-${++this.counter}-${Date.now()}`;

    const agent: SpawnedAgent = {
      id,
      brainType: config.brainType,
      trustLevel: config.trustLevel,
      parentId: config.parentId,
      status: 'idle',
      createdAt: new Date(),
    };

    this.agents.set(id, agent);
    return agent;
  }

  async execute(agentId: string, task: Task): Promise<AgentLoopResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.status = 'running';

    try {
      const loop = new AgentLoop({
        brainType: agent.brainType,
        trustLevel: agent.trustLevel,
      });

      const result = await loop.run(task);

      agent.status = result.success ? 'completed' : 'failed';
      agent.completedAt = new Date();
      agent.result = result;

      return result;
    } catch (error) {
      agent.status = 'failed';
      agent.completedAt = new Date();
      throw error;
    }
  }

  async spawnAndExecute(config: SpawnConfig, task: Task): Promise<AgentLoopResult> {
    const agent = this.spawn(config);
    return this.execute(agent.id, task);
  }

  get(agentId: string): SpawnedAgent | undefined {
    return this.agents.get(agentId);
  }

  getAll(): SpawnedAgent[] {
    return Array.from(this.agents.values());
  }

  getByParent(parentId: string): SpawnedAgent[] {
    return this.getAll().filter(a => a.parentId === parentId);
  }

  getByStatus(status: SpawnedAgent['status']): SpawnedAgent[] {
    return this.getAll().filter(a => a.status === status);
  }
}

export const agentSpawner = new AgentSpawner();
