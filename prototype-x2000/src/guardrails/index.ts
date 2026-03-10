/**
 * X2000 Guardrails System
 *
 * Central export for all safety and autonomy controls.
 */

// 5-Layer Guardrails
export { GuardrailsManager, guardrailsManager } from './layers.js';

// Earned Autonomy
export { AutonomyManager, autonomyManager } from './autonomy.js';

// Configurable Approval System
export {
  approvalManager,
  ApprovalManager,
  isApproved,
  getApprovalStatus,
  type ApprovalPolicy,
  type ApprovalRule,
  type ApprovalRequest,
  type ApprovalResult,
} from './approvals.js';
