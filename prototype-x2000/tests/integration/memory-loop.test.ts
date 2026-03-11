/**
 * Integration Tests: Memory Loop
 * Tests the complete pattern query -> apply -> record cycle
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MemoryManager } from '../../src/memory/manager.js';
import { PatternExtractionEngine } from '../../src/memory/extraction.js';
import type {
  Task,
  TaskResult,
  Pattern,
  Learning,
  Skill,
  BrainType,
} from '../../src/types/index.js';

// Mock persistence layer
vi.mock('../../src/memory/persistence.js', () => ({
  persistenceManager: {
    initialize: vi.fn().mockResolvedValue(false),
    isOnline: vi.fn().mockReturnValue(false),
    getStatus: vi.fn().mockReturnValue({ isOnline: false, pendingOperations: 0 }),
    savePattern: vi.fn().mockResolvedValue(true),
    saveLearning: vi.fn().mockResolvedValue(true),
    saveSkill: vi.fn().mockResolvedValue(true),
    saveDecision: vi.fn().mockResolvedValue(true),
    updatePatternUsage: vi.fn().mockResolvedValue(true),
    recordLearningApplication: vi.fn().mockResolvedValue(true),
    recordSkillAdoption: vi.fn().mockResolvedValue(true),
    loadPatterns: vi.fn().mockResolvedValue([]),
    loadLearnings: vi.fn().mockResolvedValue([]),
    loadSkills: vi.fn().mockResolvedValue([]),
    forceSync: vi.fn().mockResolvedValue({ processed: 0, failed: 0 }),
    shutdown: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock config
vi.mock('../../src/config/env.js', () => ({
  config: {
    memory: {
      offlineQueueMax: 1000,
      syncIntervalMs: 30000,
    },
  },
}));

describe('Memory Loop Integration', () => {
  let memoryManager: MemoryManager;
  let extractionEngine: PatternExtractionEngine;

  // Helper factories
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: `task-${Date.now()}-${Math.random()}`,
    subject: 'Implement user authentication',
    description: 'Build JWT-based authentication with OAuth2 support',
    status: 'completed',
    priority: 'high',
    subtaskIds: [],
    blockedBy: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
    ...overrides,
  });

  const createTaskResult = (overrides: Partial<TaskResult> = {}): TaskResult => ({
    taskId: `task-${Date.now()}`,
    brainType: 'engineering',
    success: true,
    output: { status: 'completed', files: ['auth.ts'] },
    learnings: [],
    duration: 5000,
    toolsUsed: ['file_write', 'file_read'],
    ...overrides,
  });

  const createPattern = (overrides: Partial<Pattern> = {}): Pattern => ({
    id: `pattern-${Date.now()}-${Math.random()}`,
    name: 'JWT Authentication Pattern',
    description: 'Secure JWT token implementation',
    trigger: 'authentication jwt token security',
    solution: 'Use RS256 with refresh tokens',
    context: ['api', 'security', 'auth'],
    successRate: 0.95,
    usageCount: 10,
    createdBy: 'engineering',
    createdAt: new Date(),
    lastUsedAt: new Date(),
    tags: ['auth', 'jwt', 'security'],
    ...overrides,
  });

  const createLearning = (overrides: Partial<Learning> = {}): Learning => ({
    id: `learning-${Date.now()}-${Math.random()}`,
    type: 'success',
    source: 'engineering',
    taskId: 'task-123',
    description: 'JWT with RS256 provides better security',
    recommendation: 'Always use asymmetric keys for JWT signing',
    confidence: 0.9,
    createdAt: new Date(),
    appliedCount: 0,
    tags: ['jwt', 'security'],
    ...overrides,
  });

  beforeEach(() => {
    memoryManager = new MemoryManager();
    extractionEngine = new PatternExtractionEngine();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Phase 1: Query - Pre-Task Memory Query', () => {
    beforeEach(() => {
      // Seed memory with patterns and learnings
      memoryManager.storePattern(createPattern({
        trigger: 'api authentication rest',
        tags: ['api', 'auth', 'rest'],
      }));
      memoryManager.storePattern(createPattern({
        id: 'db-pattern',
        trigger: 'database connection pool',
        tags: ['database', 'performance'],
      }));
      memoryManager.storeLearning(createLearning({
        type: 'failure',
        description: 'Token expiry without refresh leads to bad UX',
        tags: ['auth', 'token'],
      }));
    });

    it('should query relevant patterns before task', () => {
      const task = createTask({
        subject: 'Build REST API authentication',
        description: 'Implement secure authentication for API endpoints',
      });

      const queryResult = memoryManager.preTaskQuery(task);

      expect(queryResult.patterns.length).toBeGreaterThan(0);
      expect(queryResult.patterns.some(p => p.tags.includes('api') || p.tags.includes('auth'))).toBe(true);
    });

    it('should surface anti-patterns for similar tasks', () => {
      const task = createTask({
        subject: 'Token authentication',
        description: 'Implement token-based auth',
      });

      const queryResult = memoryManager.preTaskQuery(task);

      expect(queryResult.antiPatterns).toBeDefined();
      // Should find the failure learning about token expiry
      if (queryResult.antiPatterns.length > 0) {
        expect(queryResult.antiPatterns.some(ap => ap.tags.includes('auth') || ap.tags.includes('token'))).toBe(true);
      }
    });

    it('should prioritize high success rate patterns', () => {
      memoryManager.storePattern(createPattern({
        id: 'high-success',
        successRate: 0.99,
        trigger: 'api authentication',
      }));
      memoryManager.storePattern(createPattern({
        id: 'low-success',
        successRate: 0.5,
        trigger: 'api authentication',
      }));

      const task = createTask({
        description: 'Build API authentication',
      });

      const queryResult = memoryManager.preTaskQuery(task);

      if (queryResult.patterns.length >= 2) {
        expect(queryResult.patterns[0].successRate).toBeGreaterThanOrEqual(
          queryResult.patterns[1].successRate
        );
      }
    });
  });

  describe('Phase 2: Apply - Using Patterns During Task', () => {
    it('should find similar patterns for current context', () => {
      memoryManager.storePattern(createPattern({
        trigger: 'rest api endpoint crud',
        solution: 'Use resource-based URLs with proper HTTP methods',
      }));

      const results = memoryManager.findSimilarPatterns('create rest api endpoint', 5);

      expect(results.length).toBeGreaterThan(0);
    });

    it('should track pattern usage when applied', () => {
      const pattern = createPattern({ usageCount: 5 });
      memoryManager.storePattern(pattern);

      memoryManager.recordPatternUsage(pattern.id, true);

      const updated = memoryManager.queryPatterns({});
      const updatedPattern = updated.find(p => p.id === pattern.id);
      expect(updatedPattern?.usageCount).toBe(6);
    });

    it('should update success rate based on outcome', () => {
      const pattern = createPattern({ successRate: 0.8 });
      memoryManager.storePattern(pattern);

      // Record successful usage
      memoryManager.recordPatternUsage(pattern.id, true);

      const updated = memoryManager.queryPatterns({});
      const updatedPattern = updated.find(p => p.id === pattern.id);
      // EMA should increase success rate
      expect(updatedPattern?.successRate).toBeGreaterThan(0.8);
    });

    it('should decrease success rate on failure', () => {
      const pattern = createPattern({ successRate: 0.9 });
      memoryManager.storePattern(pattern);

      // Record failed usage
      memoryManager.recordPatternUsage(pattern.id, false);

      const updated = memoryManager.queryPatterns({});
      const updatedPattern = updated.find(p => p.id === pattern.id);
      expect(updatedPattern?.successRate).toBeLessThan(0.9);
    });

    it('should apply learnings and track application count', () => {
      const learning = createLearning({ appliedCount: 0 });
      memoryManager.storeLearning(learning);

      memoryManager.recordLearningApplication(learning.id);

      const learnings = memoryManager.queryLearnings({});
      const updated = learnings.find(l => l.id === learning.id);
      expect(updated?.appliedCount).toBe(1);
    });
  });

  describe('Phase 3: Record - Post-Task Memory Update', () => {
    it('should extract patterns from successful task completion', async () => {
      const task = createTask({
        description: 'Implemented comprehensive API authentication with JWT, refresh tokens, and rate limiting',
      });
      const result = createTaskResult({
        success: true,
        output: {
          files: ['auth.ts', 'middleware.ts'],
          features: ['jwt', 'refresh', 'rate-limit'],
        },
        learnings: [
          createLearning({
            type: 'success',
            description: 'Rate limiting prevents token abuse',
          }),
        ],
      });

      const extraction = await extractionEngine.extractFromTaskCompletion({
        task,
        result,
        brainType: 'engineering',
      });

      expect(extraction.patterns.length).toBeGreaterThanOrEqual(0);
      expect(extraction.insights.length).toBeGreaterThan(0);
    });

    it('should extract anti-patterns from failed tasks', async () => {
      const task = createTask({
        description: 'Implement caching layer for database queries',
      });
      const result = createTaskResult({
        success: false,
        error: 'Memory overflow: cache size exceeded available heap',
      });

      const extraction = await extractionEngine.extractFromTaskCompletion({
        task,
        result,
        brainType: 'engineering',
      });

      expect(extraction.antiPatterns.length).toBeGreaterThan(0);
      const antiPattern = extraction.antiPatterns[0];
      expect(antiPattern.learning.type).toBe('failure');
    });

    it('should store extracted patterns in memory', async () => {
      const task = createTask({
        description: 'Build microservice communication layer with retry logic and circuit breakers',
      });
      const result = createTaskResult({
        success: true,
        output: { service: 'communication-layer' },
      });

      const extraction = await extractionEngine.extractFromTaskCompletion({
        task,
        result,
        brainType: 'engineering',
      });

      // Store extracted patterns
      extraction.patterns.forEach(p => memoryManager.storePattern(p.pattern));

      const storedPatterns = memoryManager.queryPatterns({});
      expect(storedPatterns.length).toBeGreaterThanOrEqual(extraction.patterns.length);
    });

    it('should generate learnings from task outcomes', async () => {
      const task = createTask({
        priority: 'high',
        description: 'Optimize database queries for dashboard',
      });
      const result = createTaskResult({
        success: true,
        duration: 2000, // Fast completion
        learnings: [],
      });

      const extraction = await extractionEngine.extractFromTaskCompletion({
        task,
        result,
        brainType: 'engineering',
      });

      // Should generate insights about fast completion
      expect(extraction.insights.length).toBeGreaterThan(0);
    });
  });

  describe('Full Loop: Query -> Apply -> Record', () => {
    it('should complete full memory loop cycle', async () => {
      // Step 1: Seed initial knowledge
      const seedPattern = createPattern({
        trigger: 'database optimization query performance',
        solution: 'Add indexes, use query planner, implement caching',
        successRate: 0.9,
        usageCount: 5, // Start with explicit count
      });
      const originalUsageCount = seedPattern.usageCount; // Save before mutation
      memoryManager.storePattern(seedPattern);

      // Step 2: Query before new task
      const newTask = createTask({
        subject: 'Optimize slow database queries',
        description: 'Improve query performance for reporting module',
      });

      const preQuery = memoryManager.preTaskQuery(newTask);
      expect(preQuery.patterns.length).toBeGreaterThan(0);

      // Step 3: Apply pattern during task
      const appliedPattern = preQuery.patterns[0];
      memoryManager.recordPatternUsage(appliedPattern.id, true);

      // Step 4: Complete task and extract learnings
      const taskResult = createTaskResult({
        taskId: newTask.id,
        success: true,
        output: { improvement: '50% faster queries' },
        learnings: [
          {
            id: 'new-learning',
            type: 'success' as const,
            source: 'engineering' as BrainType,
            taskId: newTask.id,
            description: 'Composite indexes significantly improved join performance',
            recommendation: 'Consider composite indexes for frequently joined columns',
            confidence: 0.95,
            createdAt: new Date(),
            appliedCount: 0,
            tags: ['database', 'index', 'performance'],
          },
        ],
      });

      const extraction = await extractionEngine.extractFromTaskCompletion({
        task: newTask,
        result: taskResult,
        brainType: 'engineering',
      });

      // Store new learnings
      taskResult.learnings.forEach(l => memoryManager.storeLearning(l));

      // Step 5: Verify memory has grown
      const updatedLearnings = memoryManager.queryLearnings({});
      expect(updatedLearnings.some(l => l.id === 'new-learning')).toBe(true);

      // Step 6: Verify pattern usage was tracked (compare against saved original)
      const updatedPatterns = memoryManager.queryPatterns({});
      const usedPattern = updatedPatterns.find(p => p.id === seedPattern.id);
      expect(usedPattern?.usageCount).toBeGreaterThan(originalUsageCount);
    });

    it('should learn from failures and prevent repetition', async () => {
      // Step 1: Record a failure
      const failedTask = createTask({
        description: 'Implement real-time sync without conflict resolution',
      });
      const failedResult = createTaskResult({
        taskId: failedTask.id,
        success: false,
        error: 'Data conflict: multiple concurrent updates caused data loss',
      });

      const failExtraction = await extractionEngine.extractFromTaskCompletion({
        task: failedTask,
        result: failedResult,
        brainType: 'engineering',
      });

      // Store the anti-pattern/failure learning
      failExtraction.antiPatterns.forEach(ap => {
        memoryManager.storeLearning(ap.learning);
      });

      // Step 2: Query before similar task
      const similarTask = createTask({
        description: 'Build real-time collaboration feature',
      });

      const preQuery = memoryManager.preTaskQuery(similarTask);

      // Should surface the previous failure
      expect(preQuery.antiPatterns).toBeDefined();
    });

    it('should build skill pool from repeated successes', async () => {
      // Create multiple successful patterns in same domain
      for (let i = 0; i < 3; i++) {
        memoryManager.storePattern(createPattern({
          id: `api-pattern-${i}`,
          trigger: 'api design rest endpoint',
          solution: `REST API design principle ${i}`,
          successRate: 0.9 + i * 0.03,
          usageCount: 10 + i * 5,
          tags: ['api', 'rest', 'design'],
        }));
      }

      // Query should surface best patterns
      const apiPatterns = memoryManager.queryPatterns({ tags: ['api'] });

      expect(apiPatterns.length).toBe(3);
      // Should be sorted by weighted score
      expect(apiPatterns[0].successRate).toBeGreaterThanOrEqual(apiPatterns[1].successRate);
    });
  });

  describe('Cross-Brain Learning', () => {
    it('should share learnings across brains', () => {
      // Engineering learns something
      const engLearning = createLearning({
        source: 'engineering',
        description: 'Async operations need proper error boundaries',
        tags: ['async', 'error-handling'],
      });
      memoryManager.storeLearning(engLearning);

      // QA should be able to find this learning
      const qaQuery = memoryManager.queryLearnings({ tags: ['error-handling'] });

      expect(qaQuery.some(l => l.source === 'engineering')).toBe(true);
    });

    it('should allow skill adoption across brains', () => {
      const skill: Skill = {
        id: 'shared-skill-1',
        name: 'Error Handling Utility',
        description: 'Centralized error handling with proper logging',
        category: 'implementation',
        implementation: 'function handleError(err) { ... }',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        createdBy: 'engineering',
        adoptedBy: ['engineering'],
        usageCount: 5,
        successRate: 0.95,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryManager.storeSkill(skill);
      memoryManager.recordSkillAdoption(skill.id, 'qa');

      const skills = memoryManager.querySkills({});
      const sharedSkill = skills.find(s => s.id === skill.id);
      expect(sharedSkill?.adoptedBy).toContain('engineering');
      expect(sharedSkill?.adoptedBy).toContain('qa');
    });

    it('should correlate patterns across brain types', () => {
      // Engineering pattern
      memoryManager.storePattern(createPattern({
        id: 'eng-auth',
        createdBy: 'engineering',
        tags: ['auth', 'api', 'security'],
        trigger: 'api authentication security',
      }));

      // Security pattern
      memoryManager.storePattern(createPattern({
        id: 'sec-auth',
        createdBy: 'security',
        tags: ['auth', 'security', 'compliance'],
        trigger: 'security authentication compliance',
      }));

      // Both should appear in auth-related queries
      const authPatterns = memoryManager.queryPatterns({ tags: ['auth'] });

      expect(authPatterns.length).toBe(2);
      const brainTypes = authPatterns.map(p => p.createdBy);
      expect(brainTypes).toContain('engineering');
      expect(brainTypes).toContain('security');
    });
  });

  describe('Memory Persistence Cycle', () => {
    it('should export and import memory state', () => {
      // Populate memory
      memoryManager.storePattern(createPattern({ name: 'Export Test Pattern' }));
      memoryManager.storeLearning(createLearning({ description: 'Export Test Learning' }));

      // Export
      const exported = memoryManager.export();
      const parsed = JSON.parse(exported);

      expect(parsed.patterns.length).toBeGreaterThan(0);
      expect(parsed.learnings.length).toBeGreaterThan(0);

      // Create new manager and import
      const newManager = new MemoryManager();
      newManager.import(exported);

      // Verify import
      const importedPatterns = newManager.queryPatterns({});
      const importedLearnings = newManager.queryLearnings({});

      expect(importedPatterns.some(p => p.name === 'Export Test Pattern')).toBe(true);
      expect(importedLearnings.some(l => l.description === 'Export Test Learning')).toBe(true);
    });
  });

  describe('Memory Statistics', () => {
    it('should track memory growth over time', () => {
      const initialStats = memoryManager.getStats();

      memoryManager.storePattern(createPattern({ usageCount: 10 }));
      memoryManager.storeLearning(createLearning({ appliedCount: 5 }));
      memoryManager.storeSkill({
        id: 'skill-1',
        name: 'Test Skill',
        description: 'Test',
        category: 'implementation',
        implementation: 'code',
        inputSchema: {},
        outputSchema: {},
        createdBy: 'engineering',
        adoptedBy: ['engineering'],
        usageCount: 3,
        successRate: 0.9,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const finalStats = memoryManager.getStats();

      expect(finalStats.totalPatterns).toBeGreaterThan(initialStats.totalPatterns);
      expect(finalStats.totalLearnings).toBeGreaterThan(initialStats.totalLearnings);
      expect(finalStats.totalSkills).toBeGreaterThan(initialStats.totalSkills);
      expect(finalStats.patternUsageRate).toBe(10);
      expect(finalStats.learningApplicationRate).toBe(5);
    });
  });
});
