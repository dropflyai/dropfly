/**
 * 5-Layer Guardrails System
 * Comprehensive safety and governance for autonomous AI agents
 *
 * Layer 1: Input Validation - Sanitize and validate all inputs
 * Layer 2: Action-Level Controls - Permission checks per action
 * Layer 3: Runtime Governance - Real-time monitoring and limits
 * Layer 4: Reasoning Visibility - Audit trail for all decisions
 * Layer 5: Bounded Escalation - Human-in-the-loop triggers
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ActionType,
  BrainType,
  TrustLevel,
  GuardrailCheck,
  GuardrailResult,
  GuardrailLayer,
  AuditEntry,
} from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

interface LayerConfig {
  enabled: boolean;
  strictMode: boolean;
  customRules?: GuardrailRule[];
}

interface GuardrailRule {
  id: string;
  name: string;
  layer: GuardrailLayer;
  condition: (context: ActionContext) => boolean;
  message: string;
  severity: 'block' | 'warn' | 'audit';
}

interface ActionContext {
  action: ActionType;
  brain: BrainType;
  trustLevel: TrustLevel;
  target?: string;
  payload?: unknown;
  metadata?: Record<string, unknown>;
}

interface EscalationRequest {
  id: string;
  action: ActionType;
  brain: BrainType;
  reason: string;
  context: ActionContext;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: 'approved' | 'denied';
  resolvedBy?: string;
}

interface RuntimeMetrics {
  actionsPerMinute: number;
  errorRate: number;
  escalationRate: number;
  avgResponseTime: number;
}

// ============================================================================
// Layer Implementations
// ============================================================================

/**
 * Layer 1: Input Validation
 * Sanitizes and validates all inputs before processing
 */
class InputValidationLayer {
  private blockedPatterns: RegExp[] = [
    /rm\s+-rf\s+\//i,         // Dangerous rm commands
    /DROP\s+TABLE/i,          // SQL injection
    /<script>/i,              // XSS attempts
    /eval\s*\(/i,             // Code injection
    /exec\s*\(/i,             // Command injection
    /\$\{.*\}/,               // Template injection
  ];

  private maxPayloadSize = 10 * 1024 * 1024; // 10MB

  validate(context: ActionContext): GuardrailCheck {
    const issues: string[] = [];

    // Check for blocked patterns in payload
    if (context.payload) {
      const payloadStr = JSON.stringify(context.payload);

      // Size check
      if (payloadStr.length > this.maxPayloadSize) {
        issues.push(`Payload exceeds maximum size (${this.maxPayloadSize} bytes)`);
      }

      // Pattern check
      for (const pattern of this.blockedPatterns) {
        if (pattern.test(payloadStr)) {
          issues.push(`Blocked pattern detected: ${pattern.source}`);
        }
      }
    }

    // Check target validity
    if (context.target) {
      if (context.target.includes('..')) {
        issues.push('Path traversal detected in target');
      }
      if (context.target.startsWith('/etc') || context.target.startsWith('/sys')) {
        issues.push('System path access attempted');
      }
    }

    return {
      layer: 1,
      name: 'Input Validation',
      passed: issues.length === 0,
      message: issues.length > 0 ? issues.join('; ') : 'Input validation passed',
      blockedAction: issues.length > 0 ? context.action : undefined,
    };
  }

  addBlockedPattern(pattern: RegExp): void {
    this.blockedPatterns.push(pattern);
  }
}

/**
 * Layer 2: Action-Level Controls
 * Enforces permissions based on trust level and action type
 */
class ActionControlLayer {
  private actionPermissions: Record<TrustLevel, ActionType[]> = {
    1: ['read', 'analyze'],
    2: ['read', 'analyze', 'write', 'draft'],
    3: ['read', 'analyze', 'write', 'draft', 'commit', 'deploy'],
    4: ['read', 'analyze', 'write', 'draft', 'commit', 'deploy', 'delete', 'external'],
  };

  private brainRestrictions: Partial<Record<BrainType, ActionType[]>> = {
    // Research brain can only read and analyze
    'research': ['read', 'analyze'],
    // QA brain cannot deploy directly
    'qa': ['read', 'analyze', 'write', 'draft'],
  };

  validate(context: ActionContext): GuardrailCheck {
    const { action, brain, trustLevel } = context;

    // Check trust level permissions
    const allowedByTrust = this.actionPermissions[trustLevel] ?? [];
    if (!allowedByTrust.includes(action)) {
      return {
        layer: 2,
        name: 'Action Control',
        passed: false,
        message: `Action '${action}' not allowed at trust level ${trustLevel}`,
        blockedAction: action,
      };
    }

    // Check brain-specific restrictions
    const brainAllowed = this.brainRestrictions[brain];
    if (brainAllowed && !brainAllowed.includes(action)) {
      return {
        layer: 2,
        name: 'Action Control',
        passed: false,
        message: `Brain '${brain}' is restricted from action '${action}'`,
        blockedAction: action,
      };
    }

    return {
      layer: 2,
      name: 'Action Control',
      passed: true,
      message: `Action '${action}' permitted for ${brain} at trust level ${trustLevel}`,
    };
  }

  setTrustPermissions(level: TrustLevel, actions: ActionType[]): void {
    this.actionPermissions[level] = actions;
  }

  setBrainRestriction(brain: BrainType, actions: ActionType[]): void {
    this.brainRestrictions[brain] = actions;
  }
}

/**
 * Layer 3: Runtime Governance
 * Monitors and enforces runtime limits
 */
class RuntimeGovernanceLayer {
  private actionCounts: Map<string, number[]> = new Map(); // brain -> timestamps
  private errorCounts: Map<string, number> = new Map();

  private limits = {
    maxActionsPerMinute: 100,
    maxErrorsPerHour: 10,
    maxConcurrentActions: 5,
    maxSessionDuration: 3600000, // 1 hour
  };

  private currentConcurrent: Map<string, number> = new Map();
  private sessionStarts: Map<string, number> = new Map();

  validate(context: ActionContext): GuardrailCheck {
    const { brain } = context;
    const now = Date.now();

    // Check rate limit
    const actions = this.actionCounts.get(brain) ?? [];
    const recentActions = actions.filter((t) => now - t < 60000);
    if (recentActions.length >= this.limits.maxActionsPerMinute) {
      return {
        layer: 3,
        name: 'Runtime Governance',
        passed: false,
        message: `Rate limit exceeded: ${recentActions.length}/${this.limits.maxActionsPerMinute} actions per minute`,
        blockedAction: context.action,
      };
    }

    // Check error rate
    const errors = this.errorCounts.get(brain) ?? 0;
    if (errors >= this.limits.maxErrorsPerHour) {
      return {
        layer: 3,
        name: 'Runtime Governance',
        passed: false,
        message: `Error threshold exceeded: ${errors}/${this.limits.maxErrorsPerHour} errors per hour`,
        blockedAction: context.action,
      };
    }

    // Check concurrent actions
    const concurrent = this.currentConcurrent.get(brain) ?? 0;
    if (concurrent >= this.limits.maxConcurrentActions) {
      return {
        layer: 3,
        name: 'Runtime Governance',
        passed: false,
        message: `Concurrent action limit reached: ${concurrent}/${this.limits.maxConcurrentActions}`,
        blockedAction: context.action,
      };
    }

    // Check session duration
    const sessionStart = this.sessionStarts.get(brain);
    if (sessionStart && now - sessionStart > this.limits.maxSessionDuration) {
      return {
        layer: 3,
        name: 'Runtime Governance',
        passed: false,
        message: 'Session duration exceeded, please restart',
        blockedAction: context.action,
      };
    }

    // Record this action
    this.actionCounts.set(brain, [...recentActions, now]);
    this.currentConcurrent.set(brain, concurrent + 1);
    if (!sessionStart) {
      this.sessionStarts.set(brain, now);
    }

    return {
      layer: 3,
      name: 'Runtime Governance',
      passed: true,
      message: 'Runtime limits within bounds',
    };
  }

  recordActionComplete(brain: BrainType): void {
    const concurrent = this.currentConcurrent.get(brain) ?? 0;
    this.currentConcurrent.set(brain, Math.max(0, concurrent - 1));
  }

  recordError(brain: BrainType): void {
    const errors = this.errorCounts.get(brain) ?? 0;
    this.errorCounts.set(brain, errors + 1);
  }

  resetSession(brain: BrainType): void {
    this.actionCounts.delete(brain);
    this.errorCounts.delete(brain);
    this.currentConcurrent.delete(brain);
    this.sessionStarts.delete(brain);
  }

  getMetrics(brain: BrainType): RuntimeMetrics {
    const now = Date.now();
    const actions = this.actionCounts.get(brain) ?? [];
    const recentActions = actions.filter((t) => now - t < 60000);
    const errors = this.errorCounts.get(brain) ?? 0;

    return {
      actionsPerMinute: recentActions.length,
      errorRate: actions.length > 0 ? errors / actions.length : 0,
      escalationRate: 0, // Calculated by escalation layer
      avgResponseTime: 0, // Would need timing data
    };
  }
}

/**
 * Layer 4: Reasoning Visibility
 * Maintains audit trail for all decisions and actions
 */
class ReasoningVisibilityLayer {
  private auditLog: AuditEntry[] = [];
  private maxLogSize = 10000;

  validate(context: ActionContext): GuardrailCheck {
    // This layer doesn't block, it records
    this.recordEntry(context, true);

    return {
      layer: 4,
      name: 'Reasoning Visibility',
      passed: true,
      message: 'Action logged to audit trail',
    };
  }

  private recordEntry(context: ActionContext, approved: boolean): void {
    const entry: AuditEntry = {
      id: uuidv4(),
      action: context.action,
      brain: context.brain,
      trustLevel: context.trustLevel,
      approved,
      timestamp: new Date(),
      details: {
        target: context.target,
        payload: context.payload ? '[REDACTED]' : undefined,
        metadata: context.metadata,
      },
    };

    this.auditLog.push(entry);

    // Trim log if too large
    if (this.auditLog.length > this.maxLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxLogSize / 2);
    }
  }

  recordRejection(
    context: ActionContext,
    reason: string,
    layer: GuardrailLayer
  ): void {
    const entry: AuditEntry = {
      id: uuidv4(),
      action: context.action,
      brain: context.brain,
      trustLevel: context.trustLevel,
      approved: false,
      timestamp: new Date(),
      details: {
        rejectionReason: reason,
        rejectedByLayer: layer,
        target: context.target,
      },
    };

    this.auditLog.push(entry);
  }

  getAuditLog(
    filter?: { brain?: BrainType; action?: ActionType; approved?: boolean }
  ): AuditEntry[] {
    let results = [...this.auditLog];

    if (filter?.brain) {
      results = results.filter((e) => e.brain === filter.brain);
    }
    if (filter?.action) {
      results = results.filter((e) => e.action === filter.action);
    }
    if (filter?.approved !== undefined) {
      results = results.filter((e) => e.approved === filter.approved);
    }

    return results;
  }

  getRecentActivity(count: number = 10): AuditEntry[] {
    return this.auditLog.slice(-count);
  }

  exportLog(): string {
    return JSON.stringify(this.auditLog, null, 2);
  }
}

/**
 * Layer 5: Bounded Escalation
 * Triggers human-in-the-loop for high-stakes actions
 */
class BoundedEscalationLayer {
  private escalationTriggers: Set<ActionType> = new Set(['delete', 'external']);
  private highStakesTargets: RegExp[] = [
    /production/i,
    /prod\//i,
    /main/i,
    /master/i,
    /\.env$/i,
    /credentials/i,
    /secret/i,
  ];

  private pendingEscalations: Map<string, EscalationRequest> = new Map();
  private escalationHistory: EscalationRequest[] = [];

  validate(context: ActionContext): GuardrailCheck {
    // Check if action requires escalation at any trust level
    if (this.escalationTriggers.has(context.action) && context.trustLevel < 4) {
      return this.createEscalation(context, `Action '${context.action}' requires human approval`);
    }

    // Check if target is high-stakes
    if (context.target) {
      for (const pattern of this.highStakesTargets) {
        if (pattern.test(context.target)) {
          return this.createEscalation(
            context,
            `High-stakes target detected: ${context.target}`
          );
        }
      }
    }

    // Check for large-scale operations
    if (context.metadata?.['affectedCount'] &&
        (context.metadata['affectedCount'] as number) > 100) {
      return this.createEscalation(
        context,
        `Large-scale operation: ${context.metadata['affectedCount']} items affected`
      );
    }

    return {
      layer: 5,
      name: 'Bounded Escalation',
      passed: true,
      message: 'No escalation required',
    };
  }

  private createEscalation(context: ActionContext, reason: string): GuardrailCheck {
    const escalation: EscalationRequest = {
      id: uuidv4(),
      action: context.action,
      brain: context.brain,
      reason,
      context,
      createdAt: new Date(),
    };

    this.pendingEscalations.set(escalation.id, escalation);

    return {
      layer: 5,
      name: 'Bounded Escalation',
      passed: false,
      message: `Escalation required: ${reason}. Request ID: ${escalation.id}`,
      blockedAction: context.action,
    };
  }

  resolveEscalation(
    escalationId: string,
    resolution: 'approved' | 'denied',
    resolvedBy: string
  ): boolean {
    const escalation = this.pendingEscalations.get(escalationId);
    if (!escalation) return false;

    escalation.resolvedAt = new Date();
    escalation.resolution = resolution;
    escalation.resolvedBy = resolvedBy;

    this.pendingEscalations.delete(escalationId);
    this.escalationHistory.push(escalation);

    console.log(
      `[Escalation] ${escalationId} ${resolution} by ${resolvedBy}`
    );

    return true;
  }

  getPendingEscalations(): EscalationRequest[] {
    return [...this.pendingEscalations.values()];
  }

  getEscalationHistory(): EscalationRequest[] {
    return [...this.escalationHistory];
  }

  addEscalationTrigger(action: ActionType): void {
    this.escalationTriggers.add(action);
  }

  addHighStakesPattern(pattern: RegExp): void {
    this.highStakesTargets.push(pattern);
  }
}

// ============================================================================
// Guardrails Manager
// ============================================================================

export class GuardrailsManager {
  private layer1: InputValidationLayer;
  private layer2: ActionControlLayer;
  private layer3: RuntimeGovernanceLayer;
  private layer4: ReasoningVisibilityLayer;
  private layer5: BoundedEscalationLayer;

  private enabledLayers: Set<GuardrailLayer> = new Set([1, 2, 3, 4, 5]);
  private strictMode: boolean = true;

  constructor() {
    this.layer1 = new InputValidationLayer();
    this.layer2 = new ActionControlLayer();
    this.layer3 = new RuntimeGovernanceLayer();
    this.layer4 = new ReasoningVisibilityLayer();
    this.layer5 = new BoundedEscalationLayer();
  }

  /**
   * Run all guardrail checks for an action
   */
  checkAction(context: ActionContext): GuardrailResult {
    const checks: GuardrailCheck[] = [];
    let escalationRequired = false;
    let escalationReason: string | undefined;

    // Layer 1: Input Validation
    if (this.enabledLayers.has(1)) {
      const check1 = this.layer1.validate(context);
      checks.push(check1);
      if (!check1.passed && this.strictMode) {
        return this.buildResult(checks, false, escalationRequired, escalationReason);
      }
    }

    // Layer 2: Action Controls
    if (this.enabledLayers.has(2)) {
      const check2 = this.layer2.validate(context);
      checks.push(check2);
      if (!check2.passed && this.strictMode) {
        this.layer4.recordRejection(context, check2.message ?? 'Action denied', 2);
        return this.buildResult(checks, false, escalationRequired, escalationReason);
      }
    }

    // Layer 3: Runtime Governance
    if (this.enabledLayers.has(3)) {
      const check3 = this.layer3.validate(context);
      checks.push(check3);
      if (!check3.passed && this.strictMode) {
        this.layer4.recordRejection(context, check3.message ?? 'Runtime limit', 3);
        return this.buildResult(checks, false, escalationRequired, escalationReason);
      }
    }

    // Layer 4: Reasoning Visibility (always passes, just logs)
    if (this.enabledLayers.has(4)) {
      const check4 = this.layer4.validate(context);
      checks.push(check4);
    }

    // Layer 5: Bounded Escalation
    if (this.enabledLayers.has(5)) {
      const check5 = this.layer5.validate(context);
      checks.push(check5);
      if (!check5.passed) {
        escalationRequired = true;
        escalationReason = check5.message;
        return this.buildResult(checks, false, escalationRequired, escalationReason);
      }
    }

    return this.buildResult(checks, true, escalationRequired, escalationReason);
  }

  private buildResult(
    checks: GuardrailCheck[],
    allowed: boolean,
    escalationRequired: boolean,
    escalationReason?: string
  ): GuardrailResult {
    return {
      allowed,
      checks,
      escalationRequired,
      escalationReason,
    };
  }

  /**
   * Record action completion (for runtime metrics)
   */
  recordActionComplete(brain: BrainType): void {
    this.layer3.recordActionComplete(brain);
  }

  /**
   * Record an error (for runtime metrics)
   */
  recordError(brain: BrainType): void {
    this.layer3.recordError(brain);
  }

  /**
   * Resolve a pending escalation
   */
  resolveEscalation(
    escalationId: string,
    resolution: 'approved' | 'denied',
    resolvedBy: string
  ): boolean {
    return this.layer5.resolveEscalation(escalationId, resolution, resolvedBy);
  }

  /**
   * Get pending escalations
   */
  getPendingEscalations(): EscalationRequest[] {
    return this.layer5.getPendingEscalations();
  }

  /**
   * Get audit log
   */
  getAuditLog(
    filter?: { brain?: BrainType; action?: ActionType; approved?: boolean }
  ): AuditEntry[] {
    return this.layer4.getAuditLog(filter);
  }

  /**
   * Get runtime metrics for a brain
   */
  getMetrics(brain: BrainType): RuntimeMetrics {
    return this.layer3.getMetrics(brain);
  }

  /**
   * Configure layers
   */
  configureLayer(layer: GuardrailLayer, enabled: boolean): void {
    if (enabled) {
      this.enabledLayers.add(layer);
    } else {
      this.enabledLayers.delete(layer);
    }
  }

  /**
   * Set strict mode (fail on any layer failure)
   */
  setStrictMode(strict: boolean): void {
    this.strictMode = strict;
  }

  /**
   * Get system status
   */
  getStatus(): string {
    const pending = this.layer5.getPendingEscalations();
    const recentActivity = this.layer4.getRecentActivity(5);

    return `
Guardrails System Status:
-------------------------
Strict Mode: ${this.strictMode ? 'ON' : 'OFF'}
Enabled Layers: ${[...this.enabledLayers].join(', ')}
Pending Escalations: ${pending.length}

Recent Activity:
${recentActivity.map((a) => `  [${a.approved ? '✓' : '✗'}] ${a.brain}: ${a.action}`).join('\n')}
    `.trim();
  }
}

// Export singleton instance
export const guardrailsManager = new GuardrailsManager();
