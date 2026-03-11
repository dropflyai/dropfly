/**
 * Unit Tests: Memory Manager
 * Tests CRUD operations for patterns, learnings, skills, and decisions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryManager } from '../../../src/memory/manager.js';
import type {
  Pattern,
  Learning,
  Skill,
  Decision,
  Task,
  TaskResult,
} from '../../../src/types/index.js';

// Mock the persistence manager
vi.mock('../../../src/memory/persistence.js', () => ({
  persistenceManager: {
    initialize: vi.fn().mockResolvedValue(false),
    isOnline: vi.fn().mockReturnValue(false),
    getStatus: vi.fn().mockReturnValue({
      isOnline: false,
      pendingOperations: 0,
      lastSyncAt: null,
    }),
    savePattern: vi.fn().mockResolvedValue(true),
    saveLearning: vi.fn().mockResolvedValue(true),
    saveSkill: vi.fn().mockResolvedValue(true),
    saveDecision: vi.fn().mockResolvedValue(true),
    updatePatternUsage: vi.fn().mockResolvedValue(true),
    recordLearningApplication: vi.fn().mockResolvedValue(true),
    recordSkillAdoption: vi.fn().mockResolvedValue(true),
    updateSkillUsage: vi.fn().mockResolvedValue(true),
    loadPatterns: vi.fn().mockResolvedValue([]),
    loadLearnings: vi.fn().mockResolvedValue([]),
    loadSkills: vi.fn().mockResolvedValue([]),
    forceSync: vi.fn().mockResolvedValue({ processed: 0, failed: 0 }),
    shutdown: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock the pattern extraction engine
vi.mock('../../../src/memory/extraction.js', () => ({
  patternExtractionEngine: {
    extractFromTaskCompletion: vi.fn().mockResolvedValue({
      patterns: [],
      learnings: [],
      antiPatterns: [],
      skillCandidates: [],
      insights: [],
    }),
  },
}));

// Mock config
vi.mock('../../../src/config/env.js', () => ({
  config: {
    memory: {
      offlineQueueMax: 1000,
      syncIntervalMs: 30000,
    },
  },
}));

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;

  // Helper to create test data
  const createTestPattern = (overrides: Partial<Pattern> = {}): Pattern => ({
    id: `pattern-${Date.now()}`,
    name: 'Test Pattern',
    description: 'A test pattern for unit testing',
    trigger: 'test trigger condition',
    solution: 'test solution steps',
    context: ['testing', 'unit-test'],
    successRate: 0.9,
    usageCount: 5,
    createdBy: 'engineering',
    createdAt: new Date(),
    lastUsedAt: new Date(),
    tags: ['test', 'pattern'],
    ...overrides,
  });

  const createTestLearning = (overrides: Partial<Learning> = {}): Learning => ({
    id: `learning-${Date.now()}`,
    type: 'success',
    source: 'engineering',
    taskId: 'task-123',
    description: 'Test learning description',
    recommendation: 'Test recommendation',
    confidence: 0.85,
    createdAt: new Date(),
    appliedCount: 0,
    tags: ['test', 'learning'],
    ...overrides,
  });

  const createTestSkill = (overrides: Partial<Skill> = {}): Skill => ({
    id: `skill-${Date.now()}`,
    name: 'Test Skill',
    description: 'A test skill',
    category: 'implementation',
    implementation: 'function test() { return true; }',
    inputSchema: { type: 'object' },
    outputSchema: { type: 'boolean' },
    createdBy: 'engineering',
    adoptedBy: ['engineering'],
    usageCount: 10,
    successRate: 0.95,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createTestDecision = (overrides: Partial<Decision> = {}): Decision => ({
    id: `decision-${Date.now()}`,
    description: 'Test decision',
    options: [
      {
        id: 'opt-1',
        description: 'Option 1',
        pros: ['Fast'],
        cons: ['Risky'],
        proposedBy: 'engineering',
        votes: ['engineering'],
      },
    ],
    selectedOption: 'opt-1',
    rationale: 'Selected for speed',
    participants: ['engineering', 'product'],
    createdAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    memoryManager = new MemoryManager();
    vi.clearAllMocks();
  });

  describe('Pattern Management', () => {
    describe('storePattern', () => {
      it('should store a pattern in memory', () => {
        const pattern = createTestPattern();
        memoryManager.storePattern(pattern);

        const results = memoryManager.queryPatterns({});
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe(pattern.id);
      });

      it('should index patterns by brain type', () => {
        const engineeringPattern = createTestPattern({ createdBy: 'engineering' });
        const designPattern = createTestPattern({ id: 'design-pattern', createdBy: 'design' });

        memoryManager.storePattern(engineeringPattern);
        memoryManager.storePattern(designPattern);

        const engineeringResults = memoryManager.queryPatterns({ brainType: 'engineering' });
        expect(engineeringResults).toHaveLength(1);
        expect(engineeringResults[0].createdBy).toBe('engineering');
      });

      it('should index patterns by tags', () => {
        const pattern1 = createTestPattern({ tags: ['api', 'rest'] });
        const pattern2 = createTestPattern({ id: 'pattern-2', tags: ['ui', 'react'] });

        memoryManager.storePattern(pattern1);
        memoryManager.storePattern(pattern2);

        const apiResults = memoryManager.queryPatterns({ tags: ['api'] });
        expect(apiResults).toHaveLength(1);
        expect(apiResults[0].tags).toContain('api');
      });
    });

    describe('queryPatterns', () => {
      beforeEach(() => {
        // Store multiple patterns for testing queries
        memoryManager.storePattern(createTestPattern({
          id: 'p1',
          successRate: 0.9,
          usageCount: 10,
          createdBy: 'engineering',
          tags: ['api', 'backend'],
        }));
        memoryManager.storePattern(createTestPattern({
          id: 'p2',
          successRate: 0.7,
          usageCount: 5,
          createdBy: 'design',
          tags: ['ui', 'frontend'],
        }));
        memoryManager.storePattern(createTestPattern({
          id: 'p3',
          successRate: 0.95,
          usageCount: 20,
          createdBy: 'engineering',
          tags: ['api', 'security'],
        }));
      });

      it('should filter by minimum confidence (successRate)', () => {
        const results = memoryManager.queryPatterns({ minConfidence: 0.85 });
        expect(results.length).toBe(2);
        results.forEach(r => expect(r.successRate).toBeGreaterThanOrEqual(0.85));
      });

      it('should filter by brain type', () => {
        const results = memoryManager.queryPatterns({ brainType: 'engineering' });
        expect(results.length).toBe(2);
        results.forEach(r => expect(r.createdBy).toBe('engineering'));
      });

      it('should filter by tags', () => {
        const results = memoryManager.queryPatterns({ tags: ['api'] });
        expect(results.length).toBe(2);
        results.forEach(r => expect(r.tags).toContain('api'));
      });

      it('should respect limit parameter', () => {
        const results = memoryManager.queryPatterns({ limit: 1 });
        expect(results.length).toBe(1);
      });

      it('should sort by success rate and usage', () => {
        const results = memoryManager.queryPatterns({});
        // Should be sorted by weighted score (successRate * 0.6 + usageCount/100 * 0.4)
        expect(results[0].id).toBe('p3'); // Highest success rate and usage
      });

      it('should filter by date range', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const results = memoryManager.queryPatterns({
          dateRange: { start: yesterday, end: tomorrow },
        });
        expect(results.length).toBe(3);
      });
    });

    describe('findSimilarPatterns', () => {
      beforeEach(() => {
        memoryManager.storePattern(createTestPattern({
          id: 'api-pattern',
          trigger: 'api endpoint design rest',
          description: 'REST API endpoint pattern',
          tags: ['api', 'rest', 'backend'],
          successRate: 0.9,
        }));
        memoryManager.storePattern(createTestPattern({
          id: 'ui-pattern',
          trigger: 'react component design ui',
          description: 'React UI component pattern',
          tags: ['react', 'ui', 'frontend'],
          successRate: 0.85,
        }));
      });

      it('should find patterns similar to context', () => {
        const results = memoryManager.findSimilarPatterns('api design rest endpoint', 5);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].id).toBe('api-pattern');
      });

      it('should respect limit parameter', () => {
        const results = memoryManager.findSimilarPatterns('design pattern', 1);
        expect(results.length).toBe(1);
      });

      it('should return empty array for no matches', () => {
        const results = memoryManager.findSimilarPatterns('zzz xyz completely unrelated', 5);
        expect(results.length).toBe(0);
      });
    });

    describe('recordPatternUsage', () => {
      it('should update usage count', () => {
        const pattern = createTestPattern({ usageCount: 5 });
        memoryManager.storePattern(pattern);

        memoryManager.recordPatternUsage(pattern.id, true);

        const results = memoryManager.queryPatterns({});
        expect(results[0].usageCount).toBe(6);
      });

      it('should update success rate with exponential moving average', () => {
        const pattern = createTestPattern({ successRate: 0.8 });
        memoryManager.storePattern(pattern);

        memoryManager.recordPatternUsage(pattern.id, true);

        const results = memoryManager.queryPatterns({});
        // EMA: 0.8 * 0.9 + 1 * 0.1 = 0.82
        expect(results[0].successRate).toBeCloseTo(0.82, 2);
      });

      it('should update lastUsedAt timestamp', () => {
        const oldDate = new Date(Date.now() - 100000);
        const pattern = createTestPattern({ lastUsedAt: oldDate });
        memoryManager.storePattern(pattern);

        memoryManager.recordPatternUsage(pattern.id, true);

        const results = memoryManager.queryPatterns({});
        expect(results[0].lastUsedAt.getTime()).toBeGreaterThan(oldDate.getTime());
      });

      it('should handle non-existent pattern gracefully', () => {
        expect(() => memoryManager.recordPatternUsage('non-existent', true)).not.toThrow();
      });
    });
  });

  describe('Learning Management', () => {
    describe('storeLearning', () => {
      it('should store a learning in memory', () => {
        const learning = createTestLearning();
        memoryManager.storeLearning(learning);

        const results = memoryManager.queryLearnings({});
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe(learning.id);
      });

      it('should index learnings by source brain', () => {
        memoryManager.storeLearning(createTestLearning({ source: 'engineering' }));
        memoryManager.storeLearning(createTestLearning({ id: 'l2', source: 'design' }));

        const results = memoryManager.queryLearnings({ brainType: 'engineering' });
        expect(results).toHaveLength(1);
      });
    });

    describe('queryLearnings', () => {
      beforeEach(() => {
        memoryManager.storeLearning(createTestLearning({
          id: 'l1',
          source: 'engineering',
          confidence: 0.9,
          tags: ['performance'],
        }));
        memoryManager.storeLearning(createTestLearning({
          id: 'l2',
          source: 'design',
          confidence: 0.7,
          tags: ['ui'],
        }));
      });

      it('should filter by minimum confidence', () => {
        const results = memoryManager.queryLearnings({ minConfidence: 0.8 });
        expect(results.length).toBe(1);
        expect(results[0].confidence).toBeGreaterThanOrEqual(0.8);
      });

      it('should filter by brain type', () => {
        const results = memoryManager.queryLearnings({ brainType: 'design' });
        expect(results.length).toBe(1);
        expect(results[0].source).toBe('design');
      });

      it('should filter by tags', () => {
        const results = memoryManager.queryLearnings({ tags: ['performance'] });
        expect(results.length).toBe(1);
      });
    });

    describe('getAntiPatterns', () => {
      beforeEach(() => {
        memoryManager.storeLearning(createTestLearning({
          id: 'anti-1',
          type: 'failure',
          tags: ['api', 'timeout'],
          confidence: 0.9,
        }));
        memoryManager.storeLearning(createTestLearning({
          id: 'success-1',
          type: 'success',
          tags: ['api'],
          confidence: 0.85,
        }));
      });

      it('should return only failure learnings', () => {
        const results = memoryManager.getAntiPatterns(['api']);
        expect(results.length).toBe(1);
        expect(results[0].type).toBe('failure');
      });

      it('should filter by matching tags', () => {
        const results = memoryManager.getAntiPatterns(['timeout']);
        expect(results.length).toBe(1);
        expect(results[0].tags).toContain('timeout');
      });

      it('should sort by confidence', () => {
        memoryManager.storeLearning(createTestLearning({
          id: 'anti-2',
          type: 'failure',
          tags: ['api'],
          confidence: 0.7,
        }));

        const results = memoryManager.getAntiPatterns(['api']);
        expect(results[0].confidence).toBeGreaterThanOrEqual(results[1].confidence);
      });
    });

    describe('recordLearningApplication', () => {
      it('should increment applied count', () => {
        const learning = createTestLearning({ appliedCount: 0 });
        memoryManager.storeLearning(learning);

        memoryManager.recordLearningApplication(learning.id);

        const results = memoryManager.queryLearnings({});
        expect(results[0].appliedCount).toBe(1);
      });
    });
  });

  describe('Skill Management', () => {
    describe('storeSkill', () => {
      it('should store a skill in memory', () => {
        const skill = createTestSkill();
        memoryManager.storeSkill(skill);

        const results = memoryManager.querySkills({});
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe(skill.id);
      });
    });

    describe('querySkills', () => {
      beforeEach(() => {
        memoryManager.storeSkill(createTestSkill({
          id: 's1',
          createdBy: 'engineering',
          adoptedBy: ['engineering', 'qa'],
          category: 'implementation',
          successRate: 0.9,
        }));
        memoryManager.storeSkill(createTestSkill({
          id: 's2',
          createdBy: 'design',
          adoptedBy: ['design'],
          category: 'analysis',
          successRate: 0.8,
        }));
      });

      it('should filter by brain type (creator or adopter)', () => {
        const results = memoryManager.querySkills({ brainType: 'qa' });
        expect(results.length).toBe(1);
        expect(results[0].adoptedBy).toContain('qa');
      });

      it('should filter by category', () => {
        const results = memoryManager.querySkills({ tags: ['implementation'] });
        expect(results.length).toBe(1);
        expect(results[0].category).toBe('implementation');
      });
    });

    describe('recordSkillAdoption', () => {
      it('should add brain to adoptedBy array', () => {
        const skill = createTestSkill({ adoptedBy: ['engineering'] });
        memoryManager.storeSkill(skill);

        memoryManager.recordSkillAdoption(skill.id, 'design');

        const results = memoryManager.querySkills({});
        expect(results[0].adoptedBy).toContain('design');
      });

      it('should not duplicate existing adopter', () => {
        const skill = createTestSkill({ adoptedBy: ['engineering'] });
        memoryManager.storeSkill(skill);

        memoryManager.recordSkillAdoption(skill.id, 'engineering');

        const results = memoryManager.querySkills({});
        expect(results[0].adoptedBy.filter(a => a === 'engineering').length).toBe(1);
      });
    });

    describe('recordSkillUsage', () => {
      it('should update usage count and success rate', () => {
        const skill = createTestSkill({ usageCount: 10, successRate: 0.8 });
        memoryManager.storeSkill(skill);

        memoryManager.recordSkillUsage(skill.id, true);

        const results = memoryManager.querySkills({});
        expect(results[0].usageCount).toBe(11);
        expect(results[0].successRate).toBeCloseTo(0.82, 2);
      });
    });
  });

  describe('Decision Management', () => {
    describe('storeDecision', () => {
      it('should store a decision in memory', () => {
        const decision = createTestDecision();
        memoryManager.storeDecision(decision);

        const results = memoryManager.queryDecisions({});
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe(decision.id);
      });
    });

    describe('queryDecisions', () => {
      beforeEach(() => {
        memoryManager.storeDecision(createTestDecision({
          id: 'd1',
          participants: ['engineering', 'product'],
        }));
        memoryManager.storeDecision(createTestDecision({
          id: 'd2',
          participants: ['design', 'product'],
        }));
      });

      it('should filter by participant brain', () => {
        const results = memoryManager.queryDecisions({ brainType: 'engineering' });
        expect(results.length).toBe(1);
        expect(results[0].participants).toContain('engineering');
      });

      it('should sort by recency', () => {
        const results = memoryManager.queryDecisions({});
        // Most recent first
        expect(results[0].createdAt.getTime()).toBeGreaterThanOrEqual(
          results[1].createdAt.getTime()
        );
      });
    });

    describe('recordDecisionOutcome', () => {
      it('should update decision outcome', () => {
        const decision = createTestDecision();
        memoryManager.storeDecision(decision);

        memoryManager.recordDecisionOutcome(decision.id, 'positive');

        const results = memoryManager.queryDecisions({});
        expect(results[0].outcome).toBe('positive');
      });

      it('should set reviewedAt timestamp', () => {
        const decision = createTestDecision();
        memoryManager.storeDecision(decision);

        memoryManager.recordDecisionOutcome(decision.id, 'positive');

        const results = memoryManager.queryDecisions({});
        expect(results[0].reviewedAt).toBeDefined();
      });

      it('should generate failure learning for negative outcome', () => {
        const decision = createTestDecision();
        memoryManager.storeDecision(decision);

        memoryManager.recordDecisionOutcome(decision.id, 'negative');

        const learnings = memoryManager.queryLearnings({});
        expect(learnings.length).toBe(1);
        expect(learnings[0].type).toBe('failure');
      });
    });
  });

  describe('Unified Search', () => {
    beforeEach(() => {
      memoryManager.storePattern(createTestPattern({
        id: 'p1',
        name: 'API Authentication Pattern',
        description: 'JWT token authentication',
        tags: ['api', 'auth'],
      }));
      memoryManager.storeLearning(createTestLearning({
        id: 'l1',
        description: 'Authentication flow optimization',
        tags: ['auth', 'optimization'],
      }));
      memoryManager.storeSkill(createTestSkill({
        id: 's1',
        name: 'JWT Token Validator',
        description: 'Validates JWT tokens',
      }));
    });

    it('should search across all memory types', () => {
      const results = memoryManager.search('authentication');

      expect(results.patterns.length).toBeGreaterThan(0);
      expect(results.learnings.length).toBeGreaterThan(0);
    });

    it('should return relevance scores', () => {
      const results = memoryManager.search('JWT token');

      expect(results.relevanceScores.size).toBeGreaterThan(0);
    });

    it('should respect limit option', () => {
      const results = memoryManager.search('auth', { limit: 1 });

      expect(results.patterns.length).toBeLessThanOrEqual(1);
      expect(results.learnings.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Pre-Task Query', () => {
    const task: Task = {
      id: 'task-1',
      subject: 'Build REST API endpoint',
      description: 'Create a new API endpoint for user authentication',
      status: 'pending',
      priority: 'high',
      subtaskIds: [],
      blockedBy: [],
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    };

    beforeEach(() => {
      memoryManager.storePattern(createTestPattern({
        trigger: 'api endpoint rest authentication',
        tags: ['api', 'rest', 'auth'],
      }));
      memoryManager.storeLearning(createTestLearning({
        type: 'failure',
        tags: ['api', 'timeout'],
      }));
    });

    it('should return similar patterns', () => {
      const result = memoryManager.preTaskQuery(task);
      expect(result.patterns.length).toBeGreaterThan(0);
    });

    it('should return related learnings', () => {
      const result = memoryManager.preTaskQuery(task);
      expect(result.learnings).toBeDefined();
    });

    it('should return anti-patterns', () => {
      const result = memoryManager.preTaskQuery(task);
      expect(result.antiPatterns).toBeDefined();
    });
  });

  describe('Statistics', () => {
    it('should return accurate stats', () => {
      memoryManager.storePattern(createTestPattern({ usageCount: 10 }));
      memoryManager.storeLearning(createTestLearning({ appliedCount: 5 }));
      memoryManager.storeSkill(createTestSkill({ adoptedBy: ['engineering', 'qa'] }));
      memoryManager.storeDecision(createTestDecision());

      const stats = memoryManager.getStats();

      expect(stats.totalPatterns).toBe(1);
      expect(stats.totalLearnings).toBe(1);
      expect(stats.totalSkills).toBe(1);
      expect(stats.totalDecisions).toBe(1);
      expect(stats.patternUsageRate).toBe(10);
      expect(stats.learningApplicationRate).toBe(5);
    });
  });

  describe('Export/Import', () => {
    it('should export memory to JSON', () => {
      memoryManager.storePattern(createTestPattern());
      memoryManager.storeLearning(createTestLearning());

      const exported = memoryManager.export();
      const parsed = JSON.parse(exported);

      expect(parsed.patterns).toHaveLength(1);
      expect(parsed.learnings).toHaveLength(1);
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should import memory from JSON', () => {
      const data = {
        patterns: [createTestPattern({ id: 'imported-pattern' })],
        learnings: [createTestLearning({ id: 'imported-learning' })],
        skills: [],
        decisions: [],
      };

      memoryManager.import(JSON.stringify(data));

      const stats = memoryManager.getStats();
      expect(stats.totalPatterns).toBe(1);
      expect(stats.totalLearnings).toBe(1);
    });
  });
});
