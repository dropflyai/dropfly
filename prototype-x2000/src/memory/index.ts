/**
 * Memory System Exports
 * Central export point for the X2000 memory system
 */

// Core memory manager
export { MemoryManager, memoryManager } from './manager.js';

// Persistence layer
export {
  PersistenceManager,
  persistenceManager,
  type MemoryItemType,
} from './persistence.js';

// Pattern extraction
export {
  PatternExtractionEngine,
  patternExtractionEngine,
} from './extraction.js';

// Pattern utilities
export { PatternExtractor, patternExtractor } from './patterns.js';

// Skill pooling
export { SkillPoolManager, skillPoolManager } from './skills.js';

// Learning loop (closes the feedback loop)
export {
  LearningLoopManager,
  learningLoopManager,
  queryRelevantPatterns,
  applyLearnings,
  recordOutcome,
  getAntiPatternFlags,
  getStalePatterns,
  getLearningLoopStats,
} from './learning-loop.js';

// Config
export { config, env, getSupabaseConfig, validateSupabaseConfig } from '../config/env.js';
