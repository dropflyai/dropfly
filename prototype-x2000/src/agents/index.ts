/**
 * X2000 Agent System
 *
 * Central export for all agent-related functionality.
 */

// Agent spawning with parallel execution
export {
  AgentSpawner,
  agentSpawner,
  ExecutionPool,
  type SpawnConfig,
  type SpawnedAgent,
  type ParallelExecutionConfig,
  type ParallelExecutionResult,
} from './spawn.js';

// Session management
export { SessionManager, sessionManager as agentSessionManager } from './session.js';

// Collaboration protocol
export { CollaborationManager, collaborationManager } from './collaboration.js';

// Brain Tension Protocol
export { BrainTensionManager, brainTensionManager } from './collaboration.js';

// Agentic loop
export {
  AgentLoop,
  runAutonomously,
  executeAutonomously,
  type AgentLoopConfig,
  type AgentLoopResult,
  type IterationResult,
} from './loop.js';

// SDK Agents
export {
  SDKAgent,
  DepartmentHeadAgent,
  Agent,
  type AgentConfig,
  type AgentMessage,
  type AgentResponse,
  type ToolCall,
  type SubAgentSpec,
} from './sdk-agent.js';

// Self-Improvement with Redundancy Prevention
export {
  runSmartSelfImprove,
  createSelfImproveTask,
  runPreFlightCheck,
  detectAndCleanDuplicates,
  autoRecoverFromBuildFailure,
  REDUNDANCY_CHECKS,
} from './self-improve.js';

// Session persistence
export {
  SessionManager as PersistenceSessionManager,
  sessionManager,
  getOrCreateSession,
  buildSessionContext,
  type SessionState,
  type PersistenceConfig,
} from './persistence.js';
