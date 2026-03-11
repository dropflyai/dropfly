/**
 * X2000 SDK Module
 *
 * Exports the brain factory using Claude Agent SDK.
 */

export { orchestrate, runTask, runBrain, type OrchestrationOptions, type OrchestrationResult } from './orchestrator.js';
export { brainDefinitions, toSdkAgentDefinitions, allBrainNames, brainsByTier, type BrainDefinition } from './brain-definitions.js';
