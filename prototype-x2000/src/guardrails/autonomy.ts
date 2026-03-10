/**
 * Earned Autonomy System
 * Trust levels that expand based on proven performance
 *
 * Level 1: Read-only, analysis (new brains start here)
 * Level 2: File edits, drafts
 * Level 3: Commits, deploys
 * Level 4: Full autonomy (audit log only)
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  BrainType,
  TrustLevel,
  ActionType,
  Task,
  TaskResult,
} from '../types/index.js';
import { memoryManager } from '../memory/manager.js';

// ============================================================================
// Types
// ============================================================================

interface TrustProfile {
  brainType: BrainType;
  currentLevel: TrustLevel;
  tasksCompleted: number;
  successRate: number;
  lastLevelChange: Date;
  levelHistory: TrustLevelChange[];
  violations: TrustViolation[];
  achievements: TrustAchievement[];
}

interface TrustLevelChange {
  id: string;
  fromLevel: TrustLevel;
  toLevel: TrustLevel;
  reason: string;
  changedAt: Date;
  approvedBy?: string;
}

interface TrustViolation {
  id: string;
  action: ActionType;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  occurredAt: Date;
  resolved: boolean;
}

interface TrustAchievement {
  id: string;
  name: string;
  description: string;
  earnedAt: Date;
  trustBonus: number;
}

interface UpgradeRequirements {
  minTasks: number;
  minSuccessRate: number;
  minDaysSinceLastUpgrade: number;
  noViolationsInDays: number;
}

// ============================================================================
// Constants
// ============================================================================

const TRUST_LEVEL_REQUIREMENTS: Record<TrustLevel, UpgradeRequirements> = {
  1: { minTasks: 0, minSuccessRate: 0, minDaysSinceLastUpgrade: 0, noViolationsInDays: 0 },
  2: { minTasks: 10, minSuccessRate: 0.9, minDaysSinceLastUpgrade: 1, noViolationsInDays: 3 },
  3: { minTasks: 25, minSuccessRate: 0.92, minDaysSinceLastUpgrade: 7, noViolationsInDays: 14 },
  4: { minTasks: 50, minSuccessRate: 0.95, minDaysSinceLastUpgrade: 30, noViolationsInDays: 30 },
};

const TRUST_LEVEL_PERMISSIONS: Record<TrustLevel, ActionType[]> = {
  1: ['read', 'analyze'],
  2: ['read', 'analyze', 'write', 'draft'],
  3: ['read', 'analyze', 'write', 'draft', 'commit', 'deploy'],
  4: ['read', 'analyze', 'write', 'draft', 'commit', 'deploy', 'delete', 'external'],
};

const VIOLATION_PENALTIES: Record<string, number> = {
  minor: 0,      // Warning only
  major: -5,     // -5 tasks credit
  critical: -20, // -20 tasks credit, possible downgrade
};

// ============================================================================
// Autonomy Manager
// ============================================================================

export class AutonomyManager {
  private profiles: Map<BrainType, TrustProfile> = new Map();
  private globalMultiplier: number = 1.0; // Can be reduced in strict mode

  constructor() {
    // Initialize all brain profiles at Level 1
    const brainTypes: BrainType[] = [
      'ceo', 'engineering', 'marketing', 'finance', 'product', 'design',
      'sales', 'qa', 'data', 'security', 'legal', 'operations', 'research',
      'hr', 'support', 'growth', 'partnership', 'cloud', 'mobile', 'ai',
      'automation', 'analytics', 'devrel', 'branding', 'email', 'social-media',
      'video', 'community', 'investor', 'pricing', 'innovation', 'localization',
      'content', 'game-design', 'customer-success',
    ];

    for (const brainType of brainTypes) {
      this.initializeProfile(brainType);
    }

    // CEO starts at Level 4 (full trust)
    const ceoProfile = this.profiles.get('ceo')!;
    ceoProfile.currentLevel = 4;
  }

  private initializeProfile(brainType: BrainType): TrustProfile {
    const profile: TrustProfile = {
      brainType,
      currentLevel: 1,
      tasksCompleted: 0,
      successRate: 1.0,
      lastLevelChange: new Date(),
      levelHistory: [],
      violations: [],
      achievements: [],
    };

    this.profiles.set(brainType, profile);
    return profile;
  }

  // ============================================================================
  // Trust Level Management
  // ============================================================================

  /**
   * Get current trust level for a brain
   */
  getTrustLevel(brain: BrainType): TrustLevel {
    const profile = this.profiles.get(brain);
    return profile?.currentLevel ?? 1;
  }

  /**
   * Get allowed actions for a brain
   */
  getAllowedActions(brain: BrainType): ActionType[] {
    const level = this.getTrustLevel(brain);
    return TRUST_LEVEL_PERMISSIONS[level];
  }

  /**
   * Check if an action is allowed
   */
  canPerformAction(brain: BrainType, action: ActionType): boolean {
    const allowed = this.getAllowedActions(brain);
    return allowed.includes(action);
  }

  /**
   * Check if upgrade is eligible
   */
  checkUpgradeEligibility(brain: BrainType): {
    eligible: boolean;
    currentLevel: TrustLevel;
    nextLevel: TrustLevel | null;
    requirements: UpgradeRequirements | null;
    gaps: string[];
  } {
    const profile = this.profiles.get(brain);
    if (!profile) {
      return {
        eligible: false,
        currentLevel: 1,
        nextLevel: null,
        requirements: null,
        gaps: ['Brain profile not found'],
      };
    }

    if (profile.currentLevel >= 4) {
      return {
        eligible: false,
        currentLevel: 4,
        nextLevel: null,
        requirements: null,
        gaps: ['Already at maximum trust level'],
      };
    }

    const nextLevel = (profile.currentLevel + 1) as TrustLevel;
    const requirements = TRUST_LEVEL_REQUIREMENTS[nextLevel];
    const gaps: string[] = [];

    // Check tasks completed
    if (profile.tasksCompleted < requirements.minTasks) {
      gaps.push(`Need ${requirements.minTasks - profile.tasksCompleted} more tasks`);
    }

    // Check success rate
    if (profile.successRate < requirements.minSuccessRate) {
      gaps.push(
        `Success rate ${(profile.successRate * 100).toFixed(1)}% below required ${requirements.minSuccessRate * 100}%`
      );
    }

    // Check time since last upgrade
    const daysSinceUpgrade = this.daysSince(profile.lastLevelChange);
    if (daysSinceUpgrade < requirements.minDaysSinceLastUpgrade) {
      gaps.push(
        `Need ${requirements.minDaysSinceLastUpgrade - daysSinceUpgrade} more days since last upgrade`
      );
    }

    // Check recent violations
    const recentViolations = profile.violations.filter(
      (v) => !v.resolved && this.daysSince(v.occurredAt) < requirements.noViolationsInDays
    );
    if (recentViolations.length > 0) {
      gaps.push(`${recentViolations.length} unresolved violations in last ${requirements.noViolationsInDays} days`);
    }

    return {
      eligible: gaps.length === 0,
      currentLevel: profile.currentLevel,
      nextLevel,
      requirements,
      gaps,
    };
  }

  /**
   * Upgrade trust level (requires approval)
   */
  upgradeTrust(brain: BrainType, approvedBy: string = 'system'): TrustLevelChange | null {
    const eligibility = this.checkUpgradeEligibility(brain);

    if (!eligibility.eligible || !eligibility.nextLevel) {
      console.log(`[Autonomy] Upgrade denied for ${brain}: ${eligibility.gaps.join(', ')}`);
      return null;
    }

    const profile = this.profiles.get(brain)!;
    const change: TrustLevelChange = {
      id: uuidv4(),
      fromLevel: profile.currentLevel,
      toLevel: eligibility.nextLevel,
      reason: `Met requirements: ${profile.tasksCompleted} tasks, ${(profile.successRate * 100).toFixed(1)}% success`,
      changedAt: new Date(),
      approvedBy,
    };

    profile.currentLevel = eligibility.nextLevel;
    profile.lastLevelChange = new Date();
    profile.levelHistory.push(change);

    console.log(
      `[Autonomy] ${brain} upgraded: Level ${change.fromLevel} → Level ${change.toLevel}`
    );

    // Log to memory
    memoryManager.storeLearning({
      id: uuidv4(),
      type: 'success',
      source: brain,
      taskId: '',
      description: `Trust level upgraded from ${change.fromLevel} to ${change.toLevel}`,
      recommendation: 'Continue high performance to maintain trust',
      confidence: 0.95,
      createdAt: new Date(),
      appliedCount: 0,
      tags: ['trust', 'upgrade', brain],
    });

    return change;
  }

  /**
   * Downgrade trust level (violation consequence)
   */
  downgradeTrust(brain: BrainType, reason: string): TrustLevelChange | null {
    const profile = this.profiles.get(brain);
    if (!profile || profile.currentLevel <= 1) {
      return null;
    }

    const change: TrustLevelChange = {
      id: uuidv4(),
      fromLevel: profile.currentLevel,
      toLevel: (profile.currentLevel - 1) as TrustLevel,
      reason,
      changedAt: new Date(),
    };

    profile.currentLevel = change.toLevel;
    profile.lastLevelChange = new Date();
    profile.levelHistory.push(change);

    console.log(
      `[Autonomy] ${brain} downgraded: Level ${change.fromLevel} → Level ${change.toLevel} (${reason})`
    );

    // Log to memory
    memoryManager.storeLearning({
      id: uuidv4(),
      type: 'failure',
      source: brain,
      taskId: '',
      description: `Trust level downgraded: ${reason}`,
      recommendation: 'Review the violation and improve performance',
      confidence: 0.95,
      createdAt: new Date(),
      appliedCount: 0,
      tags: ['trust', 'downgrade', brain],
    });

    return change;
  }

  // ============================================================================
  // Task Tracking
  // ============================================================================

  /**
   * Record task completion
   */
  recordTaskCompletion(brain: BrainType, result: TaskResult): void {
    const profile = this.profiles.get(brain);
    if (!profile) return;

    profile.tasksCompleted++;

    // Update success rate (exponential moving average)
    const alpha = 0.1;
    const successValue = result.success ? 1 : 0;
    profile.successRate = profile.successRate * (1 - alpha) + successValue * alpha;

    // Check for automatic upgrade
    const eligibility = this.checkUpgradeEligibility(brain);
    if (eligibility.eligible) {
      console.log(`[Autonomy] ${brain} eligible for upgrade to Level ${eligibility.nextLevel}`);
    }
  }

  // ============================================================================
  // Violations
  // ============================================================================

  /**
   * Record a trust violation
   */
  recordViolation(
    brain: BrainType,
    action: ActionType,
    description: string,
    severity: 'minor' | 'major' | 'critical'
  ): TrustViolation {
    const profile = this.profiles.get(brain);
    if (!profile) {
      throw new Error(`Brain ${brain} not found`);
    }

    const violation: TrustViolation = {
      id: uuidv4(),
      action,
      description,
      severity,
      occurredAt: new Date(),
      resolved: false,
    };

    profile.violations.push(violation);

    // Apply penalty
    const penalty = VIOLATION_PENALTIES[severity];
    profile.tasksCompleted = Math.max(0, profile.tasksCompleted + penalty);

    console.log(
      `[Autonomy] Violation recorded for ${brain}: ${description} (${severity})`
    );

    // Critical violations trigger immediate downgrade
    if (severity === 'critical' && profile.currentLevel > 1) {
      this.downgradeTrust(brain, `Critical violation: ${description}`);
    }

    // Log to memory
    memoryManager.storeLearning({
      id: uuidv4(),
      type: 'failure',
      source: brain,
      taskId: '',
      description: `Trust violation (${severity}): ${description}`,
      recommendation: 'Avoid similar actions in the future',
      confidence: 0.9,
      createdAt: new Date(),
      appliedCount: 0,
      tags: ['violation', severity, brain],
    });

    return violation;
  }

  /**
   * Resolve a violation
   */
  resolveViolation(brain: BrainType, violationId: string): boolean {
    const profile = this.profiles.get(brain);
    if (!profile) return false;

    const violation = profile.violations.find((v) => v.id === violationId);
    if (!violation) return false;

    violation.resolved = true;
    console.log(`[Autonomy] Violation ${violationId} resolved for ${brain}`);

    return true;
  }

  // ============================================================================
  // Achievements
  // ============================================================================

  /**
   * Award an achievement
   */
  awardAchievement(
    brain: BrainType,
    name: string,
    description: string,
    trustBonus: number = 0
  ): TrustAchievement {
    const profile = this.profiles.get(brain);
    if (!profile) {
      throw new Error(`Brain ${brain} not found`);
    }

    const achievement: TrustAchievement = {
      id: uuidv4(),
      name,
      description,
      earnedAt: new Date(),
      trustBonus,
    };

    profile.achievements.push(achievement);

    // Apply bonus
    if (trustBonus > 0) {
      profile.tasksCompleted += trustBonus;
      console.log(`[Autonomy] ${brain} earned achievement: ${name} (+${trustBonus} tasks)`);
    } else {
      console.log(`[Autonomy] ${brain} earned achievement: ${name}`);
    }

    return achievement;
  }

  /**
   * Check for milestone achievements
   */
  checkMilestones(brain: BrainType): TrustAchievement[] {
    const profile = this.profiles.get(brain);
    if (!profile) return [];

    const newAchievements: TrustAchievement[] = [];
    const hasAchievement = (name: string) =>
      profile.achievements.some((a) => a.name === name);

    // Task milestones
    if (profile.tasksCompleted >= 10 && !hasAchievement('First Ten')) {
      newAchievements.push(
        this.awardAchievement(brain, 'First Ten', 'Completed 10 tasks', 2)
      );
    }
    if (profile.tasksCompleted >= 50 && !hasAchievement('Fifty Strong')) {
      newAchievements.push(
        this.awardAchievement(brain, 'Fifty Strong', 'Completed 50 tasks', 5)
      );
    }
    if (profile.tasksCompleted >= 100 && !hasAchievement('Century')) {
      newAchievements.push(
        this.awardAchievement(brain, 'Century', 'Completed 100 tasks', 10)
      );
    }

    // Success rate achievements
    if (profile.successRate >= 0.95 && profile.tasksCompleted >= 20 &&
        !hasAchievement('High Performer')) {
      newAchievements.push(
        this.awardAchievement(brain, 'High Performer', '95%+ success rate over 20+ tasks', 5)
      );
    }

    // Trust level achievements
    if (profile.currentLevel >= 3 && !hasAchievement('Trusted')) {
      newAchievements.push(
        this.awardAchievement(brain, 'Trusted', 'Reached Trust Level 3', 0)
      );
    }
    if (profile.currentLevel >= 4 && !hasAchievement('Autonomous')) {
      newAchievements.push(
        this.awardAchievement(brain, 'Autonomous', 'Reached Trust Level 4', 0)
      );
    }

    return newAchievements;
  }

  // ============================================================================
  // Reporting
  // ============================================================================

  /**
   * Get trust profile for a brain
   */
  getProfile(brain: BrainType): TrustProfile | undefined {
    return this.profiles.get(brain);
  }

  /**
   * Get all profiles sorted by trust level
   */
  getAllProfiles(): TrustProfile[] {
    return [...this.profiles.values()].sort(
      (a, b) => b.currentLevel - a.currentLevel || b.tasksCompleted - a.tasksCompleted
    );
  }

  /**
   * Get trust leaderboard
   */
  getLeaderboard(limit: number = 10): Array<{
    brain: BrainType;
    level: TrustLevel;
    tasks: number;
    successRate: number;
  }> {
    return this.getAllProfiles()
      .slice(0, limit)
      .map((p) => ({
        brain: p.brainType,
        level: p.currentLevel,
        tasks: p.tasksCompleted,
        successRate: p.successRate,
      }));
  }

  /**
   * Get system status summary
   */
  getStatus(): string {
    const profiles = this.getAllProfiles();
    const byLevel = {
      1: profiles.filter((p) => p.currentLevel === 1).length,
      2: profiles.filter((p) => p.currentLevel === 2).length,
      3: profiles.filter((p) => p.currentLevel === 3).length,
      4: profiles.filter((p) => p.currentLevel === 4).length,
    };

    const totalTasks = profiles.reduce((sum, p) => sum + p.tasksCompleted, 0);
    const avgSuccess =
      profiles.reduce((sum, p) => sum + p.successRate, 0) / profiles.length;

    return `
Earned Autonomy System Status:
------------------------------
Total Brains: ${profiles.length}
Level Distribution:
  Level 1 (Read-only): ${byLevel[1]}
  Level 2 (Edit): ${byLevel[2]}
  Level 3 (Deploy): ${byLevel[3]}
  Level 4 (Full): ${byLevel[4]}

Total Tasks Completed: ${totalTasks}
Average Success Rate: ${(avgSuccess * 100).toFixed(1)}%

Top Performers:
${this.getLeaderboard(5)
  .map((p) => `  ${p.brain}: Level ${p.level}, ${p.tasks} tasks, ${(p.successRate * 100).toFixed(0)}%`)
  .join('\n')}
    `.trim();
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  private daysSince(date: Date): number {
    const now = Date.now();
    const then = date.getTime();
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
  }

  /**
   * Set global multiplier (affects all upgrades)
   */
  setGlobalMultiplier(multiplier: number): void {
    this.globalMultiplier = Math.max(0.1, Math.min(2.0, multiplier));
  }

  /**
   * Reset a brain's trust profile
   */
  resetProfile(brain: BrainType): void {
    this.initializeProfile(brain);
    console.log(`[Autonomy] Reset trust profile for ${brain}`);
  }
}

// Export singleton instance
export const autonomyManager = new AutonomyManager();
