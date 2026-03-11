/**
 * Unit Tests: 5-Layer Guardrails System
 * Tests all 5 guardrail layers for comprehensive safety coverage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GuardrailsManager } from '../../../src/guardrails/layers.js';
import type { ActionType, BrainType, TrustLevel } from '../../../src/types/index.js';

describe('GuardrailsManager - 5 Layer System', () => {
  let guardrails: GuardrailsManager;

  // Helper to create action context
  const createContext = (overrides: {
    action?: ActionType;
    brain?: BrainType;
    trustLevel?: TrustLevel;
    target?: string;
    payload?: unknown;
    metadata?: Record<string, unknown>;
  } = {}) => ({
    action: 'read' as ActionType,
    brain: 'engineering' as BrainType,
    trustLevel: 2 as TrustLevel,
    ...overrides,
  });

  beforeEach(() => {
    guardrails = new GuardrailsManager();
  });

  describe('Layer 1: Input Validation', () => {
    it('should block rm -rf commands in payload', () => {
      const context = createContext({
        action: 'write',
        payload: { command: 'rm -rf /' },
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
      const layer1Check = result.checks.find(c => c.layer === 1);
      expect(layer1Check?.passed).toBe(false);
      expect(layer1Check?.message).toContain('Blocked pattern');
    });

    it('should block SQL injection attempts', () => {
      const context = createContext({
        action: 'write',
        payload: { query: "'; DROP TABLE users; --" },
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
      const layer1Check = result.checks.find(c => c.layer === 1);
      expect(layer1Check?.passed).toBe(false);
    });

    it('should block XSS attempts', () => {
      const context = createContext({
        action: 'write',
        payload: { html: '<script>alert("xss")</script>' },
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
    });

    it('should block eval() injection', () => {
      const context = createContext({
        action: 'write',
        payload: { code: 'eval(userInput)' },
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
    });

    it('should block exec() command injection', () => {
      const context = createContext({
        action: 'write',
        payload: { run: 'exec("/bin/sh")' },
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
    });

    it('should block template injection', () => {
      const context = createContext({
        action: 'write',
        payload: { template: '${process.env.SECRET}' },
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
    });

    it('should block path traversal in target', () => {
      const context = createContext({
        action: 'read',
        target: '../../../etc/passwd',
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
      const layer1Check = result.checks.find(c => c.layer === 1);
      expect(layer1Check?.message).toContain('Path traversal');
    });

    it('should block system path access', () => {
      const context = createContext({
        action: 'read',
        target: '/etc/shadow',
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
      const layer1Check = result.checks.find(c => c.layer === 1);
      expect(layer1Check?.message).toContain('System path');
    });

    it('should block /sys path access', () => {
      const context = createContext({
        action: 'read',
        target: '/sys/kernel/debug',
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
    });

    it('should pass valid inputs', () => {
      const context = createContext({
        action: 'read',
        target: '/app/src/index.ts',
        payload: { data: 'safe content' },
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      const layer1Check = result.checks.find(c => c.layer === 1);
      expect(layer1Check?.passed).toBe(true);
    });
  });

  describe('Layer 2: Action-Level Controls', () => {
    it('should allow read actions at trust level 1', () => {
      const context = createContext({
        action: 'read',
        trustLevel: 1,
      });

      const result = guardrails.checkAction(context);

      const layer2Check = result.checks.find(c => c.layer === 2);
      expect(layer2Check?.passed).toBe(true);
    });

    it('should allow analyze actions at trust level 1', () => {
      const context = createContext({
        action: 'analyze',
        trustLevel: 1,
      });

      const result = guardrails.checkAction(context);

      const layer2Check = result.checks.find(c => c.layer === 2);
      expect(layer2Check?.passed).toBe(true);
    });

    it('should block write actions at trust level 1', () => {
      const context = createContext({
        action: 'write',
        trustLevel: 1,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
      const layer2Check = result.checks.find(c => c.layer === 2);
      expect(layer2Check?.passed).toBe(false);
      expect(layer2Check?.message).toContain('not allowed at trust level 1');
    });

    it('should allow write actions at trust level 2', () => {
      const context = createContext({
        action: 'write',
        trustLevel: 2,
      });

      const result = guardrails.checkAction(context);

      const layer2Check = result.checks.find(c => c.layer === 2);
      expect(layer2Check?.passed).toBe(true);
    });

    it('should block deploy actions at trust level 2', () => {
      const context = createContext({
        action: 'deploy',
        trustLevel: 2,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
    });

    it('should allow deploy actions at trust level 3', () => {
      const context = createContext({
        action: 'deploy',
        trustLevel: 3,
      });

      const result = guardrails.checkAction(context);

      const layer2Check = result.checks.find(c => c.layer === 2);
      expect(layer2Check?.passed).toBe(true);
    });

    it('should block delete actions at trust level 3', () => {
      const context = createContext({
        action: 'delete',
        trustLevel: 3,
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
    });

    it('should allow all actions at trust level 4', () => {
      const actions: ActionType[] = ['read', 'analyze', 'write', 'draft', 'commit', 'deploy', 'delete', 'external'];

      actions.forEach(action => {
        const context = createContext({
          action,
          trustLevel: 4,
        });

        const result = guardrails.checkAction(context);
        const layer2Check = result.checks.find(c => c.layer === 2);
        expect(layer2Check?.passed).toBe(true);
      });
    });

    it('should apply brain-specific restrictions for research brain', () => {
      const context = createContext({
        action: 'write',
        brain: 'research',
        trustLevel: 4, // Even at full trust
      });

      const result = guardrails.checkAction(context);

      const layer2Check = result.checks.find(c => c.layer === 2);
      expect(layer2Check?.passed).toBe(false);
      expect(layer2Check?.message).toContain('research');
    });

    it('should apply brain-specific restrictions for qa brain', () => {
      const context = createContext({
        action: 'deploy',
        brain: 'qa',
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      const layer2Check = result.checks.find(c => c.layer === 2);
      expect(layer2Check?.passed).toBe(false);
      expect(layer2Check?.message).toContain('qa');
    });
  });

  describe('Layer 3: Runtime Governance', () => {
    it('should pass when within rate limits', () => {
      const context = createContext({
        action: 'read',
        brain: 'engineering',
        trustLevel: 2,
      });

      const result = guardrails.checkAction(context);

      const layer3Check = result.checks.find(c => c.layer === 3);
      expect(layer3Check?.passed).toBe(true);
      expect(layer3Check?.message).toContain('within bounds');
    });

    it('should block when rate limit exceeded', () => {
      const context = createContext({
        action: 'read',
        brain: 'test-rate-limit' as BrainType,
        trustLevel: 2,
      });

      // Make 100+ calls to exceed rate limit
      // Also record action completion to avoid concurrent limit
      for (let i = 0; i < 101; i++) {
        guardrails.checkAction(context);
        guardrails.recordActionComplete('test-rate-limit' as BrainType);
      }

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
      const layer3Check = result.checks.find(c => c.layer === 3);
      expect(layer3Check?.passed).toBe(false);
      expect(layer3Check?.message).toContain('Rate limit');
    });

    it('should track action completion', () => {
      const brain: BrainType = 'engineering';
      const context = createContext({ action: 'read', brain });

      guardrails.checkAction(context);
      guardrails.recordActionComplete(brain);

      const metrics = guardrails.getMetrics(brain);
      expect(metrics.actionsPerMinute).toBeGreaterThanOrEqual(0);
    });

    it('should track errors', () => {
      const brain: BrainType = 'engineering';
      guardrails.recordError(brain);

      const metrics = guardrails.getMetrics(brain);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Layer 4: Reasoning Visibility', () => {
    it('should log all actions to audit trail', () => {
      const context = createContext({
        action: 'read',
        brain: 'engineering',
        trustLevel: 2,
      });

      guardrails.checkAction(context);

      const auditLog = guardrails.getAuditLog();
      expect(auditLog.length).toBeGreaterThan(0);
      expect(auditLog[auditLog.length - 1].action).toBe('read');
    });

    it('should filter audit log by brain', () => {
      guardrails.checkAction(createContext({ brain: 'engineering' }));
      guardrails.checkAction(createContext({ brain: 'design' }));

      const engineeringLog = guardrails.getAuditLog({ brain: 'engineering' });
      engineeringLog.forEach(entry => {
        expect(entry.brain).toBe('engineering');
      });
    });

    it('should filter audit log by action', () => {
      guardrails.checkAction(createContext({ action: 'read', trustLevel: 2 }));
      guardrails.checkAction(createContext({ action: 'write', trustLevel: 2 }));

      const readLog = guardrails.getAuditLog({ action: 'read' });
      readLog.forEach(entry => {
        expect(entry.action).toBe('read');
      });
    });

    it('should filter audit log by approval status', () => {
      // Approved action
      guardrails.checkAction(createContext({ action: 'read', trustLevel: 2 }));
      // Denied action
      guardrails.checkAction(createContext({ action: 'delete', trustLevel: 1 }));

      const approvedLog = guardrails.getAuditLog({ approved: true });
      const deniedLog = guardrails.getAuditLog({ approved: false });

      expect(approvedLog.length).toBeGreaterThan(0);
      expect(deniedLog.length).toBeGreaterThan(0);
    });

    it('should always pass layer 4 (audit only)', () => {
      const context = createContext({
        action: 'read',
        trustLevel: 2,
      });

      const result = guardrails.checkAction(context);

      const layer4Check = result.checks.find(c => c.layer === 4);
      expect(layer4Check?.passed).toBe(true);
      expect(layer4Check?.message).toContain('logged');
    });
  });

  describe('Layer 5: Bounded Escalation', () => {
    it('should block delete actions at trust level 3 (Layer 2 blocks before Layer 5)', () => {
      // Note: delete/external at trust level 3 is blocked at Layer 2, not escalated at Layer 5
      const context = createContext({
        action: 'delete',
        trustLevel: 3, // Below level 4
      });

      const result = guardrails.checkAction(context);

      // Action is blocked at Layer 2, not escalated
      expect(result.allowed).toBe(false);
      const layer2Check = result.checks.find(c => c.layer === 2);
      expect(layer2Check?.passed).toBe(false);
    });

    it('should block external actions at trust level 3 (Layer 2 blocks before Layer 5)', () => {
      // Note: delete/external at trust level 3 is blocked at Layer 2, not escalated at Layer 5
      const context = createContext({
        action: 'external',
        trustLevel: 3,
      });

      const result = guardrails.checkAction(context);

      // Action is blocked at Layer 2, not escalated
      expect(result.allowed).toBe(false);
    });

    it('should not require escalation for safe delete at trust level 4', () => {
      const context = createContext({
        action: 'delete',
        trustLevel: 4,
        target: '/app/temp/file.txt', // Non-sensitive target
      });

      const result = guardrails.checkAction(context);

      // Layer 5 should pass at level 4 for non-sensitive targets
      const layer5Check = result.checks.find(c => c.layer === 5);
      expect(layer5Check?.passed).toBe(true);
    });

    it('should require escalation for production targets', () => {
      const context = createContext({
        action: 'write',
        target: '/app/production/config.json',
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.escalationRequired).toBe(true);
      expect(result.escalationReason).toContain('High-stakes target');
    });

    it('should require escalation for main branch targets', () => {
      const context = createContext({
        action: 'commit',
        target: 'main',
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.escalationRequired).toBe(true);
    });

    it('should require escalation for .env files', () => {
      const context = createContext({
        action: 'write',
        target: '/app/.env',
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.escalationRequired).toBe(true);
    });

    it('should require escalation for credentials files', () => {
      const context = createContext({
        action: 'read',
        target: '/app/credentials.json',
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.escalationRequired).toBe(true);
    });

    it('should require escalation for secret files', () => {
      const context = createContext({
        action: 'write',
        target: '/app/secret-key.pem',
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      expect(result.escalationRequired).toBe(true);
    });

    it('should require escalation for large-scale operations', () => {
      const context = createContext({
        action: 'write',
        trustLevel: 4,
        metadata: { affectedCount: 500 },
      });

      const result = guardrails.checkAction(context);

      expect(result.escalationRequired).toBe(true);
      expect(result.escalationReason).toContain('Large-scale');
    });

    it('should not require escalation for small operations', () => {
      const context = createContext({
        action: 'write',
        trustLevel: 4,
        metadata: { affectedCount: 10 },
      });

      const result = guardrails.checkAction(context);

      const layer5Check = result.checks.find(c => c.layer === 5);
      expect(layer5Check?.passed).toBe(true);
    });

    it('should track pending escalations', () => {
      // Use a write action to production target - this passes Layer 2 but triggers Layer 5
      const context = createContext({
        action: 'write',
        trustLevel: 4,
        target: '/app/production/config.json',
      });

      const result = guardrails.checkAction(context);

      // Write to production triggers escalation
      expect(result.escalationRequired).toBe(true);
      const pending = guardrails.getPendingEscalations();
      expect(pending.length).toBeGreaterThan(0);
    });

    it('should resolve escalations', () => {
      // Use a write action to production target - this passes Layer 2 but triggers Layer 5
      const context = createContext({
        action: 'write',
        trustLevel: 4,
        target: '/app/production/database.json',
      });

      guardrails.checkAction(context);

      const pending = guardrails.getPendingEscalations();
      expect(pending.length).toBeGreaterThan(0);

      const escalationId = pending[0].id;

      const resolved = guardrails.resolveEscalation(
        escalationId,
        'approved',
        'admin-user'
      );

      expect(resolved).toBe(true);
      expect(guardrails.getPendingEscalations().find(e => e.id === escalationId)).toBeUndefined();
    });

    it('should return false for resolving non-existent escalation', () => {
      const resolved = guardrails.resolveEscalation(
        'non-existent-id',
        'approved',
        'admin'
      );

      expect(resolved).toBe(false);
    });
  });

  describe('Layer Configuration', () => {
    it('should allow disabling layers', () => {
      guardrails.configureLayer(1, false);

      const context = createContext({
        action: 'write',
        payload: { command: 'rm -rf /' },
        trustLevel: 2,
      });

      const result = guardrails.checkAction(context);

      // Layer 1 should not be checked
      const layer1Check = result.checks.find(c => c.layer === 1);
      expect(layer1Check).toBeUndefined();
    });

    it('should allow re-enabling layers', () => {
      guardrails.configureLayer(1, false);
      guardrails.configureLayer(1, true);

      const context = createContext({
        action: 'write',
        payload: { command: 'rm -rf /' },
        trustLevel: 4,
      });

      const result = guardrails.checkAction(context);

      const layer1Check = result.checks.find(c => c.layer === 1);
      expect(layer1Check).toBeDefined();
    });

    it('should respect strict mode', () => {
      guardrails.setStrictMode(true);

      const context = createContext({
        action: 'write',
        trustLevel: 1, // Should fail layer 2
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
    });

    it('should allow non-strict mode', () => {
      guardrails.setStrictMode(false);

      const context = createContext({
        action: 'read',
        trustLevel: 2,
      });

      const result = guardrails.checkAction(context);

      // Should still run checks but not necessarily fail
      expect(result.checks.length).toBeGreaterThan(0);
    });
  });

  describe('System Status', () => {
    it('should return comprehensive status', () => {
      // Generate some activity
      guardrails.checkAction(createContext({ action: 'read' }));
      guardrails.checkAction(createContext({ action: 'delete', trustLevel: 3 }));

      const status = guardrails.getStatus();

      expect(status).toContain('Guardrails System Status');
      expect(status).toContain('Strict Mode');
      expect(status).toContain('Enabled Layers');
      expect(status).toContain('Pending Escalations');
    });
  });

  describe('Full Pipeline', () => {
    it('should run all 5 layers in order', () => {
      const context = createContext({
        action: 'read',
        brain: 'engineering',
        trustLevel: 2,
        target: '/app/src/index.ts',
      });

      const result = guardrails.checkAction(context);

      // All 5 layers should be checked
      expect(result.checks.length).toBe(5);
      expect(result.checks.map(c => c.layer).sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should stop at first failing layer in strict mode', () => {
      const context = createContext({
        action: 'write',
        payload: { command: 'eval(x)' }, // Fails layer 1
        trustLevel: 1, // Would also fail layer 2
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(false);
      // Should have stopped after layer 1 failed
      const layer2Check = result.checks.find(c => c.layer === 2);
      expect(layer2Check).toBeUndefined();
    });

    it('should allow safe operations through all layers', () => {
      const context = createContext({
        action: 'read',
        brain: 'engineering',
        trustLevel: 2,
        target: '/app/src/safe-file.ts',
        payload: { data: 'safe data' },
      });

      const result = guardrails.checkAction(context);

      expect(result.allowed).toBe(true);
      expect(result.escalationRequired).toBe(false);
      result.checks.forEach(check => {
        expect(check.passed).toBe(true);
      });
    });
  });
});
