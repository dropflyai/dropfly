/**
 * Configurable Approval System
 *
 * Enables fine-grained control over autonomous actions:
 * - Per-action approval policies
 * - Trust-based auto-approval
 * - Escalation chains
 * - Audit logging
 *
 * This is what makes X2000 safe but still autonomous.
 */

import { v4 as uuidv4 } from 'uuid';
import type { BrainType, TrustLevel } from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

export type ApprovalPolicy = 'auto' | 'always' | 'never' | 'trust_based';

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;

  // What this rule applies to
  toolPattern: string; // e.g., 'shell_exec', 'file_*', '*'
  actionPattern?: string; // e.g., 'delete', 'rm *', etc.

  // Conditions
  policy: ApprovalPolicy;
  minTrustLevel?: TrustLevel;
  allowedBrains?: BrainType[];
  blockedBrains?: BrainType[];

  // Limits
  maxPendingApprovals?: number;
  cooldownMs?: number;
  dailyLimit?: number;

  // Escalation
  escalateAfterMs?: number;
  escalateTo?: string; // e.g., 'human', 'ceo_brain', 'security_review'

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  enabled: boolean;
  priority: number; // Higher priority rules are checked first
}

export interface ApprovalRequest {
  id: string;
  ruleId: string;

  // Request details
  tool: string;
  action: string;
  params: Record<string, unknown>;

  // Context
  brainType: BrainType;
  trustLevel: TrustLevel;
  sessionId: string;

  // Status
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'escalated';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  reason?: string;

  // Escalation
  escalatedAt?: Date;
  escalatedTo?: string;
}

export interface ApprovalResult {
  approved: boolean;
  ruleId?: string;
  ruleName?: string;
  reason: string;
  requestId?: string;
  requiresHumanApproval?: boolean;
}

// ============================================================================
// Default Rules
// ============================================================================

const DEFAULT_RULES: Omit<ApprovalRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Read operations - auto approve
  {
    name: 'Read Operations',
    description: 'Allow all read operations automatically',
    toolPattern: 'file_read',
    policy: 'auto',
    enabled: true,
    priority: 100,
  },

  // Write operations - trust based
  {
    name: 'File Write',
    description: 'File writes require trust level 2+',
    toolPattern: 'file_write',
    policy: 'trust_based',
    minTrustLevel: 2,
    enabled: true,
    priority: 90,
  },
  {
    name: 'File Edit',
    description: 'File edits require trust level 2+',
    toolPattern: 'file_edit',
    policy: 'trust_based',
    minTrustLevel: 2,
    enabled: true,
    priority: 90,
  },

  // Shell execution - higher trust required
  {
    name: 'Safe Shell Commands',
    description: 'Safe shell commands like ls, cat, grep',
    toolPattern: 'shell_exec',
    actionPattern: '^(ls|cat|grep|find|pwd|whoami|echo|head|tail|wc)\\b',
    policy: 'trust_based',
    minTrustLevel: 2,
    enabled: true,
    priority: 85,
  },
  {
    name: 'Build Commands',
    description: 'Build and test commands',
    toolPattern: 'shell_exec',
    actionPattern: '^(npm|yarn|pnpm|cargo|go|make|pytest|jest|vitest)\\b',
    policy: 'trust_based',
    minTrustLevel: 2,
    enabled: true,
    priority: 80,
  },
  {
    name: 'Git Commands',
    description: 'Git operations (non-destructive)',
    toolPattern: 'git',
    actionPattern: '^(status|log|diff|branch|fetch|pull)$',
    policy: 'trust_based',
    minTrustLevel: 2,
    enabled: true,
    priority: 80,
  },
  {
    name: 'Git Push/Commit',
    description: 'Git push and commit require higher trust',
    toolPattern: 'git',
    actionPattern: '^(push|commit)$',
    policy: 'trust_based',
    minTrustLevel: 3,
    enabled: true,
    priority: 75,
  },

  // Dangerous operations - always require approval
  {
    name: 'Destructive Shell Commands',
    description: 'Block destructive commands',
    toolPattern: 'shell_exec',
    actionPattern: '(rm\\s+-rf|rmdir|del\\s+/|format|mkfs|dd\\s+if=)',
    policy: 'always',
    enabled: true,
    priority: 200,
  },
  {
    name: 'System Modification',
    description: 'Block system modification commands',
    toolPattern: 'shell_exec',
    actionPattern: '(sudo|chmod|chown|systemctl|service)',
    policy: 'always',
    enabled: true,
    priority: 200,
  },
  {
    name: 'Network Commands',
    description: 'Network commands require approval',
    toolPattern: 'shell_exec',
    actionPattern: '(curl|wget|nc|netcat|ssh|scp)',
    policy: 'trust_based',
    minTrustLevel: 3,
    enabled: true,
    priority: 150,
  },

  // Browser automation
  {
    name: 'Browser Navigation',
    description: 'Browser navigation is trust-based',
    toolPattern: 'browser',
    actionPattern: '^(goto|click|type|fill|screenshot|content)$',
    policy: 'trust_based',
    minTrustLevel: 2,
    enabled: true,
    priority: 70,
  },

  // Email operations
  {
    name: 'Email Read',
    description: 'Reading emails is trust-based',
    toolPattern: 'email',
    actionPattern: '^(fetch|extract_links|extract_codes|wait_for_email)$',
    policy: 'trust_based',
    minTrustLevel: 2,
    enabled: true,
    priority: 70,
  },
  {
    name: 'Email Send',
    description: 'Sending emails requires higher trust',
    toolPattern: 'email',
    actionPattern: '^send$',
    policy: 'trust_based',
    minTrustLevel: 3,
    enabled: true,
    priority: 65,
  },

  // Sub-agent spawning
  {
    name: 'Spawn Agent',
    description: 'Spawning sub-agents requires trust level 3',
    toolPattern: 'spawn_agent',
    actionPattern: '^spawn$',
    policy: 'trust_based',
    minTrustLevel: 3,
    enabled: true,
    priority: 60,
  },

  // Catch-all
  {
    name: 'Default',
    description: 'Default rule - require approval for unknown operations',
    toolPattern: '*',
    policy: 'always',
    enabled: true,
    priority: 0,
  },
];

// ============================================================================
// Approval Manager
// ============================================================================

export class ApprovalManager {
  private rules: Map<string, ApprovalRule> = new Map();
  private pendingRequests: Map<string, ApprovalRequest> = new Map();
  private approvalHistory: ApprovalRequest[] = [];
  private dailyCounts: Map<string, number> = new Map();
  private lastApprovalTimes: Map<string, number> = new Map();

  constructor() {
    this.loadDefaultRules();
  }

  /**
   * Load default rules
   */
  private loadDefaultRules(): void {
    for (const rule of DEFAULT_RULES) {
      const fullRule: ApprovalRule = {
        ...rule,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.rules.set(fullRule.id, fullRule);
    }
    console.log(`[ApprovalManager] Loaded ${this.rules.size} default rules`);
  }

  /**
   * Add a custom rule
   */
  addRule(rule: Omit<ApprovalRule, 'id' | 'createdAt' | 'updatedAt'>): ApprovalRule {
    const fullRule: ApprovalRule = {
      ...rule,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rules.set(fullRule.id, fullRule);
    return fullRule;
  }

  /**
   * Remove a rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get all rules
   */
  getRules(): ApprovalRule[] {
    return Array.from(this.rules.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check if an action is approved
   */
  async checkApproval(
    tool: string,
    action: string,
    params: Record<string, unknown>,
    brainType: BrainType,
    trustLevel: TrustLevel,
    sessionId: string
  ): Promise<ApprovalResult> {
    // Find matching rule (highest priority first)
    const rules = this.getRules().filter(r => r.enabled);
    let matchedRule: ApprovalRule | null = null;

    for (const rule of rules) {
      if (this.ruleMatches(rule, tool, action, brainType)) {
        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule) {
      // No rule matched, default to requiring approval
      return {
        approved: false,
        reason: 'No matching rule found - approval required',
        requiresHumanApproval: true,
      };
    }

    // Check policy
    switch (matchedRule.policy) {
      case 'auto':
        return {
          approved: true,
          ruleId: matchedRule.id,
          ruleName: matchedRule.name,
          reason: `Auto-approved by rule: ${matchedRule.name}`,
        };

      case 'never':
        return {
          approved: false,
          ruleId: matchedRule.id,
          ruleName: matchedRule.name,
          reason: `Blocked by rule: ${matchedRule.name}`,
        };

      case 'always':
        // Create approval request
        const request = this.createApprovalRequest(
          matchedRule,
          tool,
          action,
          params,
          brainType,
          trustLevel,
          sessionId
        );
        return {
          approved: false,
          ruleId: matchedRule.id,
          ruleName: matchedRule.name,
          reason: `Requires approval: ${matchedRule.name}`,
          requestId: request.id,
          requiresHumanApproval: true,
        };

      case 'trust_based':
        // Check trust level
        if (matchedRule.minTrustLevel && trustLevel < matchedRule.minTrustLevel) {
          const request = this.createApprovalRequest(
            matchedRule,
            tool,
            action,
            params,
            brainType,
            trustLevel,
            sessionId
          );
          return {
            approved: false,
            ruleId: matchedRule.id,
            ruleName: matchedRule.name,
            reason: `Trust level ${trustLevel} is below required ${matchedRule.minTrustLevel}`,
            requestId: request.id,
            requiresHumanApproval: true,
          };
        }

        // Check cooldown
        if (matchedRule.cooldownMs) {
          const lastTime = this.lastApprovalTimes.get(`${tool}:${action}`);
          if (lastTime && Date.now() - lastTime < matchedRule.cooldownMs) {
            return {
              approved: false,
              ruleId: matchedRule.id,
              ruleName: matchedRule.name,
              reason: `Cooldown period not elapsed (${matchedRule.cooldownMs}ms)`,
            };
          }
        }

        // Check daily limit
        if (matchedRule.dailyLimit) {
          const key = `${tool}:${action}:${new Date().toDateString()}`;
          const count = this.dailyCounts.get(key) || 0;
          if (count >= matchedRule.dailyLimit) {
            return {
              approved: false,
              ruleId: matchedRule.id,
              ruleName: matchedRule.name,
              reason: `Daily limit of ${matchedRule.dailyLimit} reached`,
            };
          }
          this.dailyCounts.set(key, count + 1);
        }

        // Record approval time
        this.lastApprovalTimes.set(`${tool}:${action}`, Date.now());

        return {
          approved: true,
          ruleId: matchedRule.id,
          ruleName: matchedRule.name,
          reason: `Trust-based approval: ${matchedRule.name}`,
        };

      default:
        return {
          approved: false,
          reason: 'Unknown policy',
          requiresHumanApproval: true,
        };
    }
  }

  /**
   * Approve a pending request
   */
  approveRequest(requestId: string, approvedBy: string, reason?: string): boolean {
    const request = this.pendingRequests.get(requestId);
    if (!request || request.status !== 'pending') {
      return false;
    }

    request.status = 'approved';
    request.resolvedAt = new Date();
    request.resolvedBy = approvedBy;
    request.reason = reason || 'Manually approved';

    this.pendingRequests.delete(requestId);
    this.approvalHistory.push(request);

    console.log(`[ApprovalManager] Request ${requestId} approved by ${approvedBy}`);
    return true;
  }

  /**
   * Deny a pending request
   */
  denyRequest(requestId: string, deniedBy: string, reason?: string): boolean {
    const request = this.pendingRequests.get(requestId);
    if (!request || request.status !== 'pending') {
      return false;
    }

    request.status = 'denied';
    request.resolvedAt = new Date();
    request.resolvedBy = deniedBy;
    request.reason = reason || 'Manually denied';

    this.pendingRequests.delete(requestId);
    this.approvalHistory.push(request);

    console.log(`[ApprovalManager] Request ${requestId} denied by ${deniedBy}`);
    return true;
  }

  /**
   * Get pending requests
   */
  getPendingRequests(): ApprovalRequest[] {
    return Array.from(this.pendingRequests.values());
  }

  /**
   * Get approval history
   */
  getHistory(limit: number = 100): ApprovalRequest[] {
    return this.approvalHistory.slice(-limit);
  }

  /**
   * Get a pending request by ID
   */
  getRequest(requestId: string): ApprovalRequest | null {
    return this.pendingRequests.get(requestId) || null;
  }

  /**
   * Check if an action would be auto-approved (for UI hints)
   */
  wouldAutoApprove(
    tool: string,
    action: string,
    brainType: BrainType,
    trustLevel: TrustLevel
  ): boolean {
    const rules = this.getRules().filter(r => r.enabled);

    for (const rule of rules) {
      if (this.ruleMatches(rule, tool, action, brainType)) {
        if (rule.policy === 'auto') return true;
        if (rule.policy === 'never') return false;
        if (rule.policy === 'always') return false;
        if (rule.policy === 'trust_based') {
          return !rule.minTrustLevel || trustLevel >= rule.minTrustLevel;
        }
      }
    }

    return false;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private ruleMatches(
    rule: ApprovalRule,
    tool: string,
    action: string,
    brainType: BrainType
  ): boolean {
    // Check tool pattern
    if (rule.toolPattern !== '*') {
      if (rule.toolPattern.includes('*')) {
        const regex = new RegExp('^' + rule.toolPattern.replace(/\*/g, '.*') + '$');
        if (!regex.test(tool)) return false;
      } else if (rule.toolPattern !== tool) {
        return false;
      }
    }

    // Check action pattern
    if (rule.actionPattern) {
      const regex = new RegExp(rule.actionPattern, 'i');
      if (!regex.test(action)) return false;
    }

    // Check brain restrictions
    if (rule.allowedBrains && !rule.allowedBrains.includes(brainType)) {
      return false;
    }
    if (rule.blockedBrains && rule.blockedBrains.includes(brainType)) {
      return false;
    }

    return true;
  }

  private createApprovalRequest(
    rule: ApprovalRule,
    tool: string,
    action: string,
    params: Record<string, unknown>,
    brainType: BrainType,
    trustLevel: TrustLevel,
    sessionId: string
  ): ApprovalRequest {
    const request: ApprovalRequest = {
      id: uuidv4(),
      ruleId: rule.id,
      tool,
      action,
      params,
      brainType,
      trustLevel,
      sessionId,
      status: 'pending',
      createdAt: new Date(),
    };

    this.pendingRequests.set(request.id, request);

    // Set up escalation if configured
    if (rule.escalateAfterMs) {
      setTimeout(() => {
        const req = this.pendingRequests.get(request.id);
        if (req && req.status === 'pending') {
          req.status = 'escalated';
          req.escalatedAt = new Date();
          req.escalatedTo = rule.escalateTo || 'human';
          console.log(`[ApprovalManager] Request ${request.id} escalated to ${req.escalatedTo}`);
        }
      }, rule.escalateAfterMs);
    }

    return request;
  }
}

// ============================================================================
// Singleton
// ============================================================================

export const approvalManager = new ApprovalManager();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick check for action approval
 */
export async function isApproved(
  tool: string,
  action: string,
  params: Record<string, unknown>,
  brainType: BrainType,
  trustLevel: TrustLevel,
  sessionId: string
): Promise<ApprovalResult> {
  return approvalManager.checkApproval(tool, action, params, brainType, trustLevel, sessionId);
}

/**
 * Get approval status summary
 */
export function getApprovalStatus(): {
  pendingCount: number;
  rules: number;
  recentHistory: ApprovalRequest[];
} {
  return {
    pendingCount: approvalManager.getPendingRequests().length,
    rules: approvalManager.getRules().length,
    recentHistory: approvalManager.getHistory(10),
  };
}
