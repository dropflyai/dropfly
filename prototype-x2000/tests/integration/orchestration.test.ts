/**
 * Integration Tests: CEO Brain Orchestration
 * Tests task decomposition, brain delegation, and result synthesis
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CEOBrain } from '../../src/brains/ceo/index.js';
import type { BrainConfig, Task, TrustLevel, BrainType } from '../../src/types/index.js';

// Mock external dependencies
vi.mock('../../src/memory/manager.js', () => ({
  memoryManager: {
    preTaskQuery: vi.fn().mockReturnValue({
      patterns: [],
      learnings: [],
      antiPatterns: [],
      skills: [],
    }),
    storePattern: vi.fn(),
    storeLearning: vi.fn(),
    storeDecision: vi.fn(),
    recordPatternUsage: vi.fn(),
  },
}));

vi.mock('../../src/guardrails/layers.js', () => ({
  guardrailsManager: {
    checkAction: vi.fn().mockReturnValue({
      allowed: true,
      checks: [
        { layer: 1, passed: true, message: 'Input validated' },
        { layer: 2, passed: true, message: 'Action allowed' },
        { layer: 3, passed: true, message: 'Runtime OK' },
        { layer: 4, passed: true, message: 'Logged' },
        { layer: 5, passed: true, message: 'No escalation needed' },
      ],
      escalationRequired: false,
    }),
    recordActionComplete: vi.fn(),
  },
}));

vi.mock('../../src/guardrails/autonomy.js', () => ({
  autonomyManager: {
    getTrustLevel: vi.fn().mockReturnValue(4),
    canPerformAction: vi.fn().mockReturnValue(true),
    recordTaskCompletion: vi.fn(),
  },
}));

describe('CEO Brain Orchestration', () => {
  let ceoBrain: CEOBrain;

  const defaultConfig: BrainConfig = {
    type: 'ceo' as BrainType,
    name: 'CEO Brain',
    description: 'Master orchestrator',
    capabilities: ['orchestration', 'delegation', 'decision-making'],
    trustLevel: 4 as TrustLevel,
    maxConcurrentTasks: 5,
    defaultTimeout: 300000,
  };

  beforeEach(() => {
    ceoBrain = new CEOBrain(defaultConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Task Decomposition', () => {
    it('should identify engineering brain for code tasks', async () => {
      const result = await ceoBrain.orchestrate('Build a REST API for user management');

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('engineering');
    });

    it('should identify design brain for UI tasks', async () => {
      const result = await ceoBrain.orchestrate('Design a new dashboard UI with charts');

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('design');
    });

    it('should identify product brain for roadmap tasks', async () => {
      const result = await ceoBrain.orchestrate('Create a product roadmap for Q1');

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('product');
    });

    it('should identify research brain for analysis tasks', async () => {
      const result = await ceoBrain.orchestrate('Analyze competitor market positioning');

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('research');
    });

    it('should identify QA brain for testing tasks', async () => {
      const result = await ceoBrain.orchestrate('Write test coverage for the API');

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('qa');
    });

    it('should identify finance brain for budget tasks', async () => {
      const result = await ceoBrain.orchestrate('Create financial projections for next year');

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('finance');
    });

    it('should identify marketing brain for campaign tasks', async () => {
      const result = await ceoBrain.orchestrate('Plan a marketing campaign for product launch');

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('marketing');
    });

    it('should identify sales brain for lead tasks', async () => {
      const result = await ceoBrain.orchestrate('Build a sales pipeline strategy');

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('sales');
    });

    it('should default to research for ambiguous tasks', async () => {
      const result = await ceoBrain.orchestrate('Explore new opportunities in the space sector');

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('research');
    });
  });

  describe('Multi-Brain Coordination', () => {
    it('should identify multiple brains for complex tasks', async () => {
      const result = await ceoBrain.orchestrate(
        'Build and design a new feature with user research and testing'
      );

      expect(result.success).toBe(true);
      expect(result.delegatedTo?.length).toBeGreaterThan(1);
    });

    it('should include engineering and design for full-stack tasks', async () => {
      const result = await ceoBrain.orchestrate(
        'Build a new dashboard with beautiful UI components'
      );

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('engineering');
      expect(result.delegatedTo).toContain('design');
    });

    it('should include product and research for strategy tasks', async () => {
      const result = await ceoBrain.orchestrate(
        'Research market and create product roadmap'
      );

      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('product');
      expect(result.delegatedTo).toContain('research');
    });
  });

  describe('Task Execution', () => {
    it('should execute tasks successfully', async () => {
      const task: Task = {
        id: 'test-task-1',
        subject: 'Test Task',
        description: 'Build a test feature',
        status: 'pending',
        priority: 'high',
        subtaskIds: [],
        blockedBy: [],
        blocks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const result = await ceoBrain.executeTask(task);

      expect(result.success).toBe(true);
      expect(result.taskId).toBe(task.id);
      expect(result.brainType).toBe('ceo');
    });

    it('should track task duration', async () => {
      const task: Task = {
        id: 'duration-test',
        subject: 'Duration Test',
        description: 'Test duration tracking',
        status: 'pending',
        priority: 'medium',
        subtaskIds: [],
        blockedBy: [],
        blocks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const result = await ceoBrain.executeTask(task);

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should include required brains in output', async () => {
      const task: Task = {
        id: 'brain-output-test',
        subject: 'API Development',
        description: 'Build REST API endpoints',
        status: 'pending',
        priority: 'high',
        subtaskIds: [],
        blockedBy: [],
        blocks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const result = await ceoBrain.executeTask(task);

      expect(result.output).toBeDefined();
      expect(result.output.requiredBrains).toContain('engineering');
    });
  });

  describe('Brain State Management', () => {
    it('should activate brain with session', () => {
      ceoBrain.activate('test-session-123');

      const state = ceoBrain.getState();
      expect(state.isActive).toBe(true);
      expect(state.sessionId).toBe('test-session-123');
    });

    it('should deactivate brain', () => {
      ceoBrain.activate('test-session');
      ceoBrain.deactivate();

      const state = ceoBrain.getState();
      expect(state.isActive).toBe(false);
    });

    it('should update context', () => {
      ceoBrain.updateContext({
        workingMemory: { currentTask: 'test-task' },
      });

      const state = ceoBrain.getState();
      expect(state.context.workingMemory.currentTask).toBe('test-task');
    });

    it('should track metrics after task completion', async () => {
      const task: Task = {
        id: 'metrics-test',
        subject: 'Metrics Test',
        description: 'Test metrics tracking',
        status: 'pending',
        priority: 'medium',
        subtaskIds: [],
        blockedBy: [],
        blocks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await ceoBrain.executeTask(task);

      const state = ceoBrain.getState();
      expect(state.metrics.tasksCompleted).toBeGreaterThan(0);
    });
  });

  describe('System Prompt', () => {
    it('should include orchestration responsibilities', () => {
      const prompt = ceoBrain.getSystemPrompt();

      expect(prompt).toContain('CEO Brain');
      // Check for orchestration-related content (may be capitalized differently)
      expect(prompt.toLowerCase()).toMatch(/orchestrat|routing|coordinat|delegat/);
    });

    it('should mention available brains', () => {
      const prompt = ceoBrain.getSystemPrompt();

      expect(prompt).toContain('Engineering');
      expect(prompt).toContain('Design');
      expect(prompt).toContain('Product');
    });

    it('should include trust level', () => {
      const prompt = ceoBrain.getSystemPrompt();

      expect(prompt).toContain('TRUST LEVEL');
      expect(prompt).toContain('4');
    });

    it('should mention decomposition protocol', () => {
      const prompt = ceoBrain.getSystemPrompt();

      expect(prompt.toLowerCase()).toContain('decompos');
    });

    it('should mention delegation', () => {
      const prompt = ceoBrain.getSystemPrompt();

      expect(prompt.toLowerCase()).toContain('delegat');
    });

    it('should mention verification', () => {
      const prompt = ceoBrain.getSystemPrompt();

      expect(prompt.toLowerCase()).toContain('verif');
    });
  });

  describe('Collaboration Preferences', () => {
    it('should have preferred partners', () => {
      const prefs = ceoBrain.getCollaborationPreferences();

      expect(prefs.preferredPartners).toContain('research');
      expect(prefs.preferredPartners).toContain('engineering');
      expect(prefs.preferredPartners).toContain('product');
    });

    it('should not have avoided partners', () => {
      const prefs = ceoBrain.getCollaborationPreferences();

      expect(prefs.avoidedPartners.length).toBe(0);
    });

    it('should allow many concurrent collaborations', () => {
      const prefs = ceoBrain.getCollaborationPreferences();

      expect(prefs.maxConcurrentCollaborations).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Configuration', () => {
    it('should maintain correct brain type', () => {
      const config = ceoBrain.getConfig();

      expect(config.type).toBe('ceo');
    });

    it('should have trust level 4', () => {
      const config = ceoBrain.getConfig();

      expect(config.trustLevel).toBe(4);
    });

    it('should have orchestration capabilities', () => {
      const config = ceoBrain.getConfig();

      expect(config.capabilities).toContain('orchestration');
      expect(config.capabilities).toContain('delegation');
      expect(config.capabilities).toContain('decision-making');
    });
  });

  describe('Task Priority Handling', () => {
    const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];

    priorities.forEach(priority => {
      it(`should handle ${priority} priority tasks`, async () => {
        const task: Task = {
          id: `priority-${priority}`,
          subject: 'Priority Test',
          description: 'Test priority handling',
          status: 'pending',
          priority,
          subtaskIds: [],
          blockedBy: [],
          blocks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
        };

        const result = await ceoBrain.executeTask(task);

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty task description gracefully', async () => {
      const task: Task = {
        id: 'empty-desc',
        subject: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        subtaskIds: [],
        blockedBy: [],
        blocks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const result = await ceoBrain.executeTask(task);

      // Should still succeed but delegate to research (default)
      expect(result.success).toBe(true);
      expect(result.delegatedTo).toContain('research');
    });

    it('should handle tasks with special characters', async () => {
      const result = await ceoBrain.orchestrate(
        'Build API for "user" endpoint with <html> handling & special chars'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Keyword Matching', () => {
    const keywordTests: Array<{ keywords: string; expectedBrain: BrainType }> = [
      { keywords: 'code implementation debug', expectedBrain: 'engineering' },
      { keywords: 'design ui ux wireframe', expectedBrain: 'design' },
      { keywords: 'product roadmap feature', expectedBrain: 'product' },
      { keywords: 'research analyze market', expectedBrain: 'research' },
      { keywords: 'test qa automation bug', expectedBrain: 'qa' },
      { keywords: 'budget revenue financial', expectedBrain: 'finance' },
      { keywords: 'marketing campaign growth', expectedBrain: 'marketing' },
      { keywords: 'sales lead customer deal', expectedBrain: 'sales' },
    ];

    keywordTests.forEach(({ keywords, expectedBrain }) => {
      it(`should route "${keywords}" to ${expectedBrain}`, async () => {
        const result = await ceoBrain.orchestrate(`Task involving ${keywords}`);

        expect(result.delegatedTo).toContain(expectedBrain);
      });
    });
  });
});
