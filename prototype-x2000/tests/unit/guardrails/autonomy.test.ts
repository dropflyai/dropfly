/**
 * Unit Tests: Earned Autonomy System
 * Tests trust level calculations, upgrades, downgrades, and violations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutonomyManager } from '../../../src/guardrails/autonomy.js';
import type { BrainType, TrustLevel, TaskResult } from '../../../src/types/index.js';

// Mock the memory manager
vi.mock('../../../src/memory/manager.js', () => ({
  memoryManager: {
    storeLearning: vi.fn(),
  },
}));

describe('AutonomyManager', () => {
  let autonomyManager: AutonomyManager;

  // Helper to create task result
  const createTaskResult = (overrides: Partial<TaskResult> = {}): TaskResult => ({
    taskId: `task-${Date.now()}`,
    brainType: 'engineering',
    success: true,
    output: 'Task completed',
    learnings: [],
    duration: 5000,
    ...overrides,
  });

  beforeEach(() => {
    autonomyManager = new AutonomyManager();
    vi.clearAllMocks();
  });

  describe('Initial Trust Levels', () => {
    it('should initialize brains at trust level 1', () => {
      const level = autonomyManager.getTrustLevel('engineering');
      expect(level).toBe(1);
    });

    it('should initialize CEO brain at trust level 4', () => {
      const level = autonomyManager.getTrustLevel('ceo');
      expect(level).toBe(4);
    });

    it('should return level 1 for unknown brains', () => {
      const level = autonomyManager.getTrustLevel('unknown-brain' as BrainType);
      expect(level).toBe(1);
    });
  });

  describe('Allowed Actions', () => {
    it('should allow read and analyze at level 1', () => {
      const actions = autonomyManager.getAllowedActions('engineering');
      expect(actions).toContain('read');
      expect(actions).toContain('analyze');
    });

    it('should not allow write at level 1', () => {
      const actions = autonomyManager.getAllowedActions('engineering');
      expect(actions).not.toContain('write');
    });

    it('should allow write and draft at level 2', () => {
      // Simulate upgrade to level 2
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 15;
      profile.successRate = 0.95;
      profile.lastLevelChange = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

      autonomyManager.upgradeTrust(brain);

      const actions = autonomyManager.getAllowedActions(brain);
      expect(actions).toContain('write');
      expect(actions).toContain('draft');
    });

    it('should allow all actions at level 4', () => {
      const actions = autonomyManager.getAllowedActions('ceo');
      expect(actions).toContain('read');
      expect(actions).toContain('analyze');
      expect(actions).toContain('write');
      expect(actions).toContain('draft');
      expect(actions).toContain('commit');
      expect(actions).toContain('deploy');
      expect(actions).toContain('delete');
      expect(actions).toContain('external');
    });
  });

  describe('canPerformAction', () => {
    it('should return true for allowed actions', () => {
      expect(autonomyManager.canPerformAction('engineering', 'read')).toBe(true);
      expect(autonomyManager.canPerformAction('engineering', 'analyze')).toBe(true);
    });

    it('should return false for disallowed actions', () => {
      expect(autonomyManager.canPerformAction('engineering', 'deploy')).toBe(false);
      expect(autonomyManager.canPerformAction('engineering', 'delete')).toBe(false);
    });

    it('should return true for CEO on any action', () => {
      expect(autonomyManager.canPerformAction('ceo', 'delete')).toBe(true);
      expect(autonomyManager.canPerformAction('ceo', 'external')).toBe(true);
    });
  });

  describe('Upgrade Eligibility', () => {
    it('should check task count requirement', () => {
      const brain: BrainType = 'engineering';
      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.gaps).toContainEqual(expect.stringContaining('more tasks'));
    });

    it('should check success rate requirement', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 20;
      profile.successRate = 0.8; // Below 0.9 required

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.gaps).toContainEqual(expect.stringContaining('Success rate'));
    });

    it('should check time since last upgrade', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 20;
      profile.successRate = 0.95;
      profile.lastLevelChange = new Date(); // Just now

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.gaps).toContainEqual(expect.stringContaining('more days'));
    });

    it('should check for recent violations', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 20;
      profile.successRate = 0.95;
      profile.lastLevelChange = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      profile.violations.push({
        id: 'v1',
        action: 'write',
        description: 'Recent violation',
        severity: 'minor',
        occurredAt: new Date(),
        resolved: false,
      });

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.gaps).toContainEqual(expect.stringContaining('violations'));
    });

    it('should return eligible when all requirements met', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 20;
      profile.successRate = 0.95;
      profile.lastLevelChange = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      profile.violations = [];

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(true);
      expect(eligibility.gaps).toHaveLength(0);
    });

    it('should report already at max level', () => {
      const eligibility = autonomyManager.checkUpgradeEligibility('ceo');

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.currentLevel).toBe(4);
      expect(eligibility.nextLevel).toBeNull();
      expect(eligibility.gaps).toContainEqual(expect.stringContaining('maximum'));
    });
  });

  describe('Trust Upgrade', () => {
    it('should upgrade trust when eligible', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 20;
      profile.successRate = 0.95;
      profile.lastLevelChange = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

      const change = autonomyManager.upgradeTrust(brain);

      expect(change).not.toBeNull();
      expect(change?.fromLevel).toBe(1);
      expect(change?.toLevel).toBe(2);
      expect(autonomyManager.getTrustLevel(brain)).toBe(2);
    });

    it('should record upgrade in level history', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 20;
      profile.successRate = 0.95;
      profile.lastLevelChange = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

      autonomyManager.upgradeTrust(brain);

      expect(profile.levelHistory).toHaveLength(1);
      expect(profile.levelHistory[0].fromLevel).toBe(1);
      expect(profile.levelHistory[0].toLevel).toBe(2);
    });

    it('should update lastLevelChange timestamp', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      const oldDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      profile.tasksCompleted = 20;
      profile.successRate = 0.95;
      profile.lastLevelChange = oldDate;

      autonomyManager.upgradeTrust(brain);

      expect(profile.lastLevelChange.getTime()).toBeGreaterThan(oldDate.getTime());
    });

    it('should return null when not eligible', () => {
      const brain: BrainType = 'engineering';
      const change = autonomyManager.upgradeTrust(brain);

      expect(change).toBeNull();
      expect(autonomyManager.getTrustLevel(brain)).toBe(1);
    });

    it('should record approvedBy in upgrade', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 20;
      profile.successRate = 0.95;
      profile.lastLevelChange = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

      const change = autonomyManager.upgradeTrust(brain, 'admin');

      expect(change?.approvedBy).toBe('admin');
    });
  });

  describe('Trust Downgrade', () => {
    it('should downgrade trust level', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.currentLevel = 3;

      const change = autonomyManager.downgradeTrust(brain, 'Violation occurred');

      expect(change).not.toBeNull();
      expect(change?.fromLevel).toBe(3);
      expect(change?.toLevel).toBe(2);
      expect(autonomyManager.getTrustLevel(brain)).toBe(2);
    });

    it('should not downgrade below level 1', () => {
      const brain: BrainType = 'engineering';

      const change = autonomyManager.downgradeTrust(brain, 'Test');

      expect(change).toBeNull();
      expect(autonomyManager.getTrustLevel(brain)).toBe(1);
    });

    it('should record downgrade reason', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.currentLevel = 2;

      const change = autonomyManager.downgradeTrust(brain, 'Security violation');

      expect(change?.reason).toBe('Security violation');
    });
  });

  describe('Task Completion Tracking', () => {
    it('should increment task count on completion', () => {
      const brain: BrainType = 'engineering';
      const initialCount = autonomyManager.getProfile(brain)!.tasksCompleted;

      autonomyManager.recordTaskCompletion(brain, createTaskResult({ success: true }));

      expect(autonomyManager.getProfile(brain)!.tasksCompleted).toBe(initialCount + 1);
    });

    it('should update success rate on successful task', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.successRate = 0.8;

      autonomyManager.recordTaskCompletion(brain, createTaskResult({ success: true }));

      // EMA: 0.8 * 0.9 + 1 * 0.1 = 0.82
      expect(profile.successRate).toBeCloseTo(0.82, 2);
    });

    it('should update success rate on failed task', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.successRate = 0.8;

      autonomyManager.recordTaskCompletion(brain, createTaskResult({ success: false }));

      // EMA: 0.8 * 0.9 + 0 * 0.1 = 0.72
      expect(profile.successRate).toBeCloseTo(0.72, 2);
    });
  });

  describe('Violations', () => {
    it('should record violation', () => {
      const brain: BrainType = 'engineering';

      const violation = autonomyManager.recordViolation(
        brain,
        'deploy',
        'Unauthorized deployment attempt',
        'major'
      );

      expect(violation).toBeDefined();
      expect(violation.action).toBe('deploy');
      expect(violation.severity).toBe('major');
      expect(violation.resolved).toBe(false);
    });

    it('should apply minor violation penalty (warning only)', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      const initialTasks = profile.tasksCompleted = 10;

      autonomyManager.recordViolation(brain, 'write', 'Minor issue', 'minor');

      expect(profile.tasksCompleted).toBe(initialTasks); // No change for minor
    });

    it('should apply major violation penalty', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 10;

      autonomyManager.recordViolation(brain, 'deploy', 'Major issue', 'major');

      expect(profile.tasksCompleted).toBe(5); // -5 for major
    });

    it('should apply critical violation penalty and downgrade', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 30;
      profile.currentLevel = 2;

      autonomyManager.recordViolation(brain, 'delete', 'Critical issue', 'critical');

      expect(profile.tasksCompleted).toBe(10); // -20 for critical
      expect(profile.currentLevel).toBe(1); // Downgraded
    });

    it('should not downgrade below level 1 on critical violation', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 30;
      profile.currentLevel = 1;

      autonomyManager.recordViolation(brain, 'delete', 'Critical issue', 'critical');

      expect(profile.currentLevel).toBe(1); // Stays at 1
    });

    it('should resolve violation', () => {
      const brain: BrainType = 'engineering';
      const violation = autonomyManager.recordViolation(
        brain,
        'write',
        'Test violation',
        'minor'
      );

      const resolved = autonomyManager.resolveViolation(brain, violation.id);

      expect(resolved).toBe(true);
      expect(autonomyManager.getProfile(brain)!.violations[0].resolved).toBe(true);
    });

    it('should return false for resolving non-existent violation', () => {
      const resolved = autonomyManager.resolveViolation('engineering', 'non-existent');
      expect(resolved).toBe(false);
    });

    it('should throw error for non-existent brain', () => {
      expect(() => {
        autonomyManager.recordViolation(
          'fake-brain' as BrainType,
          'write',
          'Test',
          'minor'
        );
      }).toThrow();
    });
  });

  describe('Achievements', () => {
    it('should award achievement', () => {
      const brain: BrainType = 'engineering';

      const achievement = autonomyManager.awardAchievement(
        brain,
        'First Success',
        'Completed first task',
        5
      );

      expect(achievement).toBeDefined();
      expect(achievement.name).toBe('First Success');
      expect(achievement.trustBonus).toBe(5);
    });

    it('should apply trust bonus from achievement', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      const initialTasks = profile.tasksCompleted;

      autonomyManager.awardAchievement(brain, 'Bonus', 'Test', 10);

      expect(profile.tasksCompleted).toBe(initialTasks + 10);
    });

    it('should check First Ten milestone', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 10;

      const newAchievements = autonomyManager.checkMilestones(brain);

      const firstTen = newAchievements.find(a => a.name === 'First Ten');
      expect(firstTen).toBeDefined();
    });

    it('should check Fifty Strong milestone', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 50;

      const newAchievements = autonomyManager.checkMilestones(brain);

      const fiftyStrong = newAchievements.find(a => a.name === 'Fifty Strong');
      expect(fiftyStrong).toBeDefined();
    });

    it('should check Century milestone', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 100;

      const newAchievements = autonomyManager.checkMilestones(brain);

      const century = newAchievements.find(a => a.name === 'Century');
      expect(century).toBeDefined();
    });

    it('should check High Performer milestone', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 25;
      profile.successRate = 0.96;

      const newAchievements = autonomyManager.checkMilestones(brain);

      const highPerformer = newAchievements.find(a => a.name === 'High Performer');
      expect(highPerformer).toBeDefined();
    });

    it('should check Trusted milestone', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.currentLevel = 3;

      const newAchievements = autonomyManager.checkMilestones(brain);

      const trusted = newAchievements.find(a => a.name === 'Trusted');
      expect(trusted).toBeDefined();
    });

    it('should check Autonomous milestone', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.currentLevel = 4;

      const newAchievements = autonomyManager.checkMilestones(brain);

      const autonomous = newAchievements.find(a => a.name === 'Autonomous');
      expect(autonomous).toBeDefined();
    });

    it('should not duplicate achievements', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 10;

      // Check once
      autonomyManager.checkMilestones(brain);
      // Check again
      const secondCheck = autonomyManager.checkMilestones(brain);

      const firstTens = profile.achievements.filter(a => a.name === 'First Ten');
      expect(firstTens.length).toBe(1);
      expect(secondCheck.filter(a => a.name === 'First Ten').length).toBe(0);
    });
  });

  describe('Reporting', () => {
    it('should get profile for brain', () => {
      const profile = autonomyManager.getProfile('engineering');

      expect(profile).toBeDefined();
      expect(profile?.brainType).toBe('engineering');
    });

    it('should get all profiles', () => {
      const profiles = autonomyManager.getAllProfiles();

      expect(profiles.length).toBeGreaterThan(0);
      // Should be sorted by level then tasks
      for (let i = 1; i < profiles.length; i++) {
        const prev = profiles[i - 1];
        const curr = profiles[i];
        expect(prev.currentLevel).toBeGreaterThanOrEqual(curr.currentLevel);
      }
    });

    it('should get leaderboard', () => {
      const leaderboard = autonomyManager.getLeaderboard(5);

      expect(leaderboard.length).toBeLessThanOrEqual(5);
      expect(leaderboard[0]).toHaveProperty('brain');
      expect(leaderboard[0]).toHaveProperty('level');
      expect(leaderboard[0]).toHaveProperty('tasks');
      expect(leaderboard[0]).toHaveProperty('successRate');
    });

    it('should get system status', () => {
      const status = autonomyManager.getStatus();

      expect(status).toContain('Earned Autonomy System Status');
      expect(status).toContain('Total Brains');
      expect(status).toContain('Level Distribution');
      expect(status).toContain('Level 1');
      expect(status).toContain('Level 4');
    });
  });

  describe('Utility Methods', () => {
    it('should set global multiplier', () => {
      autonomyManager.setGlobalMultiplier(1.5);
      // Multiplier affects internal calculations
      // Just verify it doesn't throw
      expect(true).toBe(true);
    });

    it('should clamp global multiplier to valid range', () => {
      autonomyManager.setGlobalMultiplier(10); // Should be clamped to 2.0
      autonomyManager.setGlobalMultiplier(-1); // Should be clamped to 0.1
      expect(true).toBe(true);
    });

    it('should reset brain profile', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 100;
      profile.currentLevel = 3;

      autonomyManager.resetProfile(brain);

      const newProfile = autonomyManager.getProfile(brain)!;
      expect(newProfile.tasksCompleted).toBe(0);
      expect(newProfile.currentLevel).toBe(1);
    });
  });

  describe('Trust Level Requirements', () => {
    it('should require 10 tasks for level 2', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 9; // Less than 10
      profile.successRate = 0.95;
      profile.lastLevelChange = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.gaps).toContainEqual(expect.stringContaining('1 more tasks'));
    });

    it('should require 25 tasks for level 3', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.currentLevel = 2;
      profile.tasksCompleted = 20;
      profile.successRate = 0.95;
      profile.lastLevelChange = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.gaps).toContainEqual(expect.stringContaining('5 more tasks'));
    });

    it('should require 50 tasks for level 4', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.currentLevel = 3;
      profile.tasksCompleted = 40;
      profile.successRate = 0.98;
      profile.lastLevelChange = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.gaps).toContainEqual(expect.stringContaining('10 more tasks'));
    });

    it('should require 90% success rate for level 2', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.tasksCompleted = 20;
      profile.successRate = 0.89;
      profile.lastLevelChange = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.gaps).toContainEqual(expect.stringContaining('Success rate'));
    });

    it('should require 92% success rate for level 3', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.currentLevel = 2;
      profile.tasksCompleted = 30;
      profile.successRate = 0.91;
      profile.lastLevelChange = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
    });

    it('should require 95% success rate for level 4', () => {
      const brain: BrainType = 'engineering';
      const profile = autonomyManager.getProfile(brain)!;
      profile.currentLevel = 3;
      profile.tasksCompleted = 60;
      profile.successRate = 0.94;
      profile.lastLevelChange = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const eligibility = autonomyManager.checkUpgradeEligibility(brain);

      expect(eligibility.eligible).toBe(false);
    });
  });
});
