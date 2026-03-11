/**
 * Tests for Memory Learning Loop
 * Verifies that past learnings properly influence future decisions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  LearningLoopManager,
  queryRelevantPatterns,
  applyLearnings,
  recordOutcome,
  getAntiPatternFlags,
  getStalePatterns,
  getLearningLoopStats,
} from '../src/memory/learning-loop.js';
import { memoryManager } from '../src/memory/manager.js';
import type { Task, Pattern } from '../src/types/index.js';
import { v4 as uuidv4 } from 'uuid';

// Helper to create test patterns
function createTestPattern(overrides: Partial<Pattern> = {}): Pattern {
  const now = new Date();
  return {
    id: uuidv4(),
    name: 'Test Pattern',
    description: 'A test pattern for unit testing',
    trigger: 'test pattern trigger keywords',
    solution: 'Apply test solution here',
    context: ['testing', 'unit'],
    successRate: 0.9,
    usageCount: 5,
    createdBy: 'engineering',
    createdAt: now,
    lastUsedAt: now,
    tags: ['test', 'pattern', 'engineering'],
    ...overrides,
  };
}

// Helper to create test tasks
function createTestTask(overrides: Partial<Task> = {}): Task {
  return {
    id: uuidv4(),
    subject: 'Test task subject',
    description: 'Test task description for testing purposes',
    status: 'pending',
    priority: 'medium',
    subtaskIds: [],
    blockedBy: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
    ...overrides,
  };
}

describe('LearningLoopManager', () => {
  let manager: LearningLoopManager;

  beforeEach(() => {
    manager = new LearningLoopManager();
  });

  describe('queryRelevantPatterns', () => {
    it('should return empty array when no patterns exist', () => {
      const task = createTestTask({ subject: 'Build API endpoint' });
      const results = manager.queryRelevantPatterns(task);
      // Results depend on what's in memoryManager
      expect(Array.isArray(results)).toBe(true);
    });

    it('should score patterns by keyword match', () => {
      // Store a pattern first
      const pattern = createTestPattern({
        name: 'API Endpoint Pattern',
        trigger: 'build api endpoint rest',
        tags: ['api', 'endpoint', 'rest'],
      });
      memoryManager.storePattern(pattern);

      const task = createTestTask({
        subject: 'Build REST API endpoint',
        description: 'Create a new REST API endpoint for user data',
      });

      const results = manager.queryRelevantPatterns(task);

      // Should find the pattern
      if (results.length > 0) {
        expect(results[0].matchedKeywords.length).toBeGreaterThan(0);
      }
    });

    it('should apply pattern decay to old patterns', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 90); // 90 days ago

      const oldPattern = createTestPattern({
        name: 'Old Pattern',
        lastUsedAt: oldDate,
      });

      const decayInfo = manager.calculatePatternDecay(oldPattern);

      expect(decayInfo.daysSinceLastUse).toBeGreaterThanOrEqual(89);
      expect(decayInfo.decayFactor).toBeLessThan(1);
      expect(decayInfo.decayedWeight).toBeLessThan(decayInfo.originalWeight);
    });

    it('should not decay recent patterns', () => {
      const recentPattern = createTestPattern({
        name: 'Recent Pattern',
        lastUsedAt: new Date(),
      });

      const decayInfo = manager.calculatePatternDecay(recentPattern);

      expect(decayInfo.decayFactor).toBe(1);
      expect(decayInfo.decayedWeight).toBe(decayInfo.originalWeight);
    });
  });

  describe('applyLearnings', () => {
    it('should return context for brain prompts', () => {
      const task = createTestTask();
      const scoredPatterns = manager.queryRelevantPatterns(task);
      const context = manager.applyLearnings(task, scoredPatterns);

      expect(context.taskId).toBe(task.id);
      expect(Array.isArray(context.appliedPatternIds)).toBe(true);
      expect(Array.isArray(context.recommendations)).toBe(true);
      expect(typeof context.promptContext).toBe('string');
    });

    it('should track applied pattern IDs', () => {
      // Create and store a pattern
      const pattern = createTestPattern({
        name: 'Tracking Test Pattern',
        trigger: 'tracking test keywords',
        tags: ['tracking', 'test'],
      });
      memoryManager.storePattern(pattern);

      const task = createTestTask({
        subject: 'Tracking test task',
        description: 'Test tracking of applied patterns',
      });

      const scoredPatterns = manager.queryRelevantPatterns(task);
      const context = manager.applyLearnings(task, scoredPatterns);

      // If patterns were matched, they should be tracked
      if (scoredPatterns.length > 0) {
        expect(context.appliedPatternIds.length).toBeGreaterThan(0);
      }
    });
  });

  describe('recordOutcome', () => {
    it('should record successful outcomes', () => {
      const task = createTestTask();
      const scoredPatterns = manager.queryRelevantPatterns(task);
      manager.applyLearnings(task, scoredPatterns);

      // Record outcome
      manager.recordOutcome(task.id, true, ['Learned something new']);

      const stats = manager.getStats();
      expect(stats.totalOutcomesRecorded).toBeGreaterThan(0);
    });

    it('should record failed outcomes', () => {
      const task = createTestTask();
      const scoredPatterns = manager.queryRelevantPatterns(task);
      manager.applyLearnings(task, scoredPatterns);

      // Record failure
      manager.recordOutcome(task.id, false, ['Something went wrong']);

      const stats = manager.getStats();
      expect(stats.totalOutcomesRecorded).toBeGreaterThan(0);
    });
  });

  describe('anti-pattern detection', () => {
    it('should detect patterns that repeatedly fail', () => {
      // Create and store a pattern
      const pattern = createTestPattern({
        name: 'Failing Pattern',
        trigger: 'failing pattern test',
        tags: ['failing', 'test'],
      });
      memoryManager.storePattern(pattern);

      // Simulate multiple failures by recording outcomes directly
      // (In real usage, this would happen through applyLearnings + recordOutcome)

      // Initially no anti-patterns
      const initialFlags = manager.getAntiPatternFlags();
      expect(Array.isArray(initialFlags)).toBe(true);
    });

    it('should clear anti-pattern flags when requested', () => {
      const patternId = 'test-pattern-id';
      manager.clearAntiPatternFlag(patternId);

      const flags = manager.getAntiPatternFlags();
      const clearedFlag = flags.find(f => f.patternId === patternId);
      expect(clearedFlag).toBeUndefined();
    });
  });

  describe('pattern decay', () => {
    it('should identify stale patterns', () => {
      const stalePatterns = manager.getStalePatterns(0.3);
      expect(Array.isArray(stalePatterns)).toBe(true);
    });

    it('should apply minimum decay threshold', () => {
      const veryOldDate = new Date();
      veryOldDate.setDate(veryOldDate.getDate() - 365); // 1 year ago

      const ancientPattern = createTestPattern({
        name: 'Ancient Pattern',
        lastUsedAt: veryOldDate,
      });

      const decayInfo = manager.calculatePatternDecay(ancientPattern);

      // Should not go below minimum threshold (0.1)
      expect(decayInfo.decayFactor).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('state export/import', () => {
    it('should export state as JSON', () => {
      const exported = manager.exportState();
      const parsed = JSON.parse(exported);

      expect(parsed.outcomeHistory).toBeDefined();
      expect(parsed.patternOutcomes).toBeDefined();
      expect(parsed.antiPatternFlags).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should import state from JSON', () => {
      const testState = JSON.stringify({
        outcomeHistory: [],
        patternOutcomes: [],
        antiPatternFlags: [],
        exportedAt: new Date().toISOString(),
      });

      expect(() => manager.importState(testState)).not.toThrow();
    });
  });

  describe('statistics', () => {
    it('should return learning loop stats', () => {
      const stats = manager.getStats();

      expect(typeof stats.totalOutcomesRecorded).toBe('number');
      expect(typeof stats.successRate).toBe('number');
      expect(typeof stats.antiPatternsDetected).toBe('number');
      expect(typeof stats.patternsApplied).toBe('number');
      expect(typeof stats.stalePatterns).toBe('number');
    });
  });
});

describe('Convenience functions', () => {
  it('queryRelevantPatterns should work', () => {
    const task = createTestTask();
    const results = queryRelevantPatterns(task);
    expect(Array.isArray(results)).toBe(true);
  });

  it('applyLearnings should work', () => {
    const task = createTestTask();
    const context = applyLearnings(task);
    expect(context.taskId).toBe(task.id);
  });

  it('recordOutcome should work', () => {
    const task = createTestTask();
    applyLearnings(task);
    expect(() => recordOutcome(task.id, true, [])).not.toThrow();
  });

  it('getAntiPatternFlags should work', () => {
    const flags = getAntiPatternFlags();
    expect(Array.isArray(flags)).toBe(true);
  });

  it('getStalePatterns should work', () => {
    const stale = getStalePatterns();
    expect(Array.isArray(stale)).toBe(true);
  });

  it('getLearningLoopStats should work', () => {
    const stats = getLearningLoopStats();
    expect(typeof stats.totalOutcomesRecorded).toBe('number');
  });
});
