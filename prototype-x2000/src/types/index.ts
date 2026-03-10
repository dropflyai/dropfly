/**
 * X2000 Core Type Definitions
 * Types for the autonomous business-building AI fleet
 */

// ============================================================================
// Trust & Autonomy
// ============================================================================

export type TrustLevel = 1 | 2 | 3 | 4;

export interface TrustConfig {
  level: TrustLevel;
  allowedActions: ActionType[];
  requiresApproval: ActionType[];
  auditOnly: boolean;
}

export const TRUST_LEVELS: Record<TrustLevel, TrustConfig> = {
  1: {
    level: 1,
    allowedActions: ['read', 'analyze'],
    requiresApproval: ['write', 'commit', 'deploy', 'delete', 'external'],
    auditOnly: false,
  },
  2: {
    level: 2,
    allowedActions: ['read', 'analyze', 'write', 'draft'],
    requiresApproval: ['commit', 'deploy', 'delete', 'external'],
    auditOnly: false,
  },
  3: {
    level: 3,
    allowedActions: ['read', 'analyze', 'write', 'draft', 'commit', 'deploy'],
    requiresApproval: ['delete', 'external'],
    auditOnly: false,
  },
  4: {
    level: 4,
    allowedActions: ['read', 'analyze', 'write', 'draft', 'commit', 'deploy', 'delete', 'external'],
    requiresApproval: [],
    auditOnly: true,
  },
};

// ============================================================================
// Actions & Tasks
// ============================================================================

export type ActionType =
  | 'read'
  | 'analyze'
  | 'write'
  | 'draft'
  | 'commit'
  | 'deploy'
  | 'delete'
  | 'external';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  subject: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedBrain?: BrainType;
  parentTaskId?: string;
  subtaskIds: string[];
  blockedBy: string[];
  blocks: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata: Record<string, unknown>;
}

export interface TaskResult {
  taskId: string;
  brainType?: BrainType;
  success: boolean;
  output?: unknown;
  error?: string;
  learnings: Learning[];
  duration: number;
  toolsUsed?: string[];
  delegatedTo?: BrainType[];
}

// ============================================================================
// Brains
// ============================================================================

export type BrainType =
  | 'ceo'
  | 'engineering'
  | 'marketing'
  | 'finance'
  | 'product'
  | 'design'
  | 'sales'
  | 'qa'
  | 'data'
  | 'security'
  | 'legal'
  | 'operations'
  | 'research'
  | 'hr'
  | 'support'
  | 'growth'
  | 'partnership'
  | 'cloud'
  | 'mobile'
  | 'ai'
  | 'automation'
  | 'analytics'
  | 'devrel'
  | 'branding'
  | 'email'
  | 'social-media'
  | 'video'
  | 'community'
  | 'investor'
  | 'pricing'
  | 'innovation'
  | 'localization'
  | 'content'
  | 'game-design'
  | 'customer-success'
  | 'mba'
  | 'options-trading'
  | 'database'
  | 'debugger'
  | 'devops'
  | 'frontend'
  | 'architecture'
  | 'backend'
  | 'performance'
  | 'optimize'
  | 'testing';

export interface BrainConfig {
  type: BrainType;
  name: string;
  description: string;
  capabilities: string[];
  trustLevel: TrustLevel;
  teamSize?: number;
  maxConcurrentTasks?: number;
  defaultTimeout?: number;
}

export interface BrainState {
  brainType: BrainType;
  sessionId: string;
  isActive: boolean;
  currentTask?: Task;
  context: BrainContext;
  trustLevel: TrustLevel;
  metrics: BrainMetrics;
}

export interface BrainContext {
  recentDecisions: Decision[];
  activePatterns: Pattern[];
  relevantSkills: Skill[];
  workingMemory: Record<string, unknown>;
}

export interface BrainMetrics {
  tasksCompleted: number;
  successRate: number;
  avgDuration: number;
  learningsContributed: number;
  collaborations: number;
}

// ============================================================================
// Memory System (Forever-Learning)
// ============================================================================

export interface Pattern {
  id: string;
  name: string;
  description: string;
  trigger: string;
  solution: string;
  context: string[];
  successRate: number;
  usageCount: number;
  createdBy: BrainType;
  createdAt: Date;
  lastUsedAt: Date;
  tags: string[];
}

export interface Learning {
  id: string;
  type: 'success' | 'failure' | 'insight';
  source: BrainType;
  taskId: string;
  description: string;
  rootCause?: string;
  recommendation: string;
  confidence: number;
  createdAt: Date;
  appliedCount: number;
  tags: string[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  implementation: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  createdBy: BrainType;
  adoptedBy: BrainType[];
  usageCount: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Decision {
  id: string;
  description: string;
  options: DecisionOption[];
  selectedOption: string;
  rationale: string;
  participants: BrainType[];
  debate?: Debate;
  outcome?: 'positive' | 'negative' | 'neutral' | 'unknown';
  createdAt: Date;
  reviewedAt?: Date;
}

export interface DecisionOption {
  id: string;
  description: string;
  pros: string[];
  cons: string[];
  proposedBy: BrainType;
  votes: BrainType[];
}

// ============================================================================
// Collaboration & Debate
// ============================================================================

export interface Debate {
  id: string;
  topic: string;
  participants: BrainType[];
  statements: DebateStatement[];
  resolution?: string;
  resolvedBy?: BrainType;
  consensus: boolean;
  startedAt: Date;
  resolvedAt?: Date;
}

export interface DebateStatement {
  id: string;
  type: 'propose' | 'challenge' | 'defend' | 'concede' | 'resolve';
  brain: BrainType;
  content: string;
  evidence?: string[];
  referencesStatementId?: string;
  timestamp: Date;
}

export interface CollaborationRequest {
  id: string;
  fromBrain: BrainType;
  toBrains: BrainType[];
  topic: string;
  context: Record<string, unknown>;
  urgency: 'immediate' | 'normal' | 'low';
  expectedOutput: string;
  createdAt: Date;
}

export interface CollaborationResult {
  requestId: string;
  participants: BrainType[];
  debate?: Debate;
  decision: Decision;
  learnings: Learning[];
  duration: number;
}

// ============================================================================
// Agents & Sessions
// ============================================================================

export interface AgentSession {
  id: string;
  brainType: BrainType;
  state: 'warming' | 'active' | 'idle' | 'cooling' | 'terminated';
  context: BrainContext;
  startedAt: Date;
  lastActiveAt: Date;
  taskHistory: string[];
  warmState: Record<string, unknown>;
}

export interface SpawnConfig {
  brainType: BrainType;
  parentSessionId?: string;
  initialContext?: Partial<BrainContext>;
  trustLevel?: TrustLevel;
  warmState?: Record<string, unknown>;
}

export interface SpawnResult {
  success: boolean;
  session?: AgentSession;
  error?: string;
}

// ============================================================================
// Guardrails
// ============================================================================

export type GuardrailLayer = 1 | 2 | 3 | 4 | 5;

export interface GuardrailCheck {
  layer: GuardrailLayer;
  name: string;
  passed: boolean;
  message?: string;
  blockedAction?: ActionType;
}

export interface GuardrailResult {
  allowed: boolean;
  checks: GuardrailCheck[];
  escalationRequired: boolean;
  escalationReason?: string;
}

export interface GuardrailConfig {
  enabledLayers: GuardrailLayer[];
  strictMode: boolean;
  auditLog: boolean;
  escalationThreshold: number;
}

// ============================================================================
// Events & Logging
// ============================================================================

export type EventType =
  | 'task_created'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'brain_spawned'
  | 'brain_terminated'
  | 'collaboration_started'
  | 'collaboration_completed'
  | 'debate_started'
  | 'debate_resolved'
  | 'pattern_extracted'
  | 'skill_shared'
  | 'learning_logged'
  | 'guardrail_triggered'
  | 'escalation_required';

export interface SystemEvent {
  id: string;
  type: EventType;
  source: BrainType;
  timestamp: Date;
  data: Record<string, unknown>;
  sessionId?: string;
  taskId?: string;
}

export interface AuditEntry {
  id: string;
  action: ActionType;
  brain: BrainType;
  trustLevel: TrustLevel;
  approved: boolean;
  approvedBy?: string;
  timestamp: Date;
  details: Record<string, unknown>;
}
