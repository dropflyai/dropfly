/**
 * X2000 Configuration System
 * Manages environment variables and system settings
 */

import { TrustLevel, GuardrailLayer } from '../types/index.js';
import { config } from 'dotenv';

// Load environment variables
config();

export interface X2000Config {
  // API Keys
  anthropicApiKey: string;
  supabaseUrl?: string;
  supabaseKey?: string;

  // System Settings
  defaultTrustLevel: TrustLevel;
  maxConcurrentAgents: number;
  enableGuardrails: boolean;
  guardrailLayers: GuardrailLayer[];

  // Memory Settings
  enableMemoryPersistence: boolean;
  memoryRetentionDays: number;

  // Cache Settings (Performance)
  enableCaching: boolean;
  cacheMaxSize: number;
  cacheDefaultTtlMs: number;
  enableQueryCaching: boolean;

  // Parallel Execution Settings (Performance)
  executionPoolSize: number;
  parallelBatchTimeout: number;

  // Collaboration Settings
  enableCollaboration: boolean;
  maxDebateRounds: number;

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableAuditLog: boolean;
}

export const defaultConfig: X2000Config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,

  defaultTrustLevel: 2,
  maxConcurrentAgents: 10,
  enableGuardrails: true,
  guardrailLayers: [1, 2, 3, 4, 5],

  enableMemoryPersistence: true,
  memoryRetentionDays: 30,

  // Cache defaults (Performance)
  enableCaching: true,
  cacheMaxSize: 1000,
  cacheDefaultTtlMs: 5 * 60 * 1000, // 5 minutes
  enableQueryCaching: true,

  // Parallel execution defaults (Performance)
  executionPoolSize: 5,
  parallelBatchTimeout: 10 * 60 * 1000, // 10 minutes

  enableCollaboration: true,
  maxDebateRounds: 5,

  logLevel: 'info',
  enableAuditLog: true,
};

export function loadConfig(): X2000Config {
  return {
    ...defaultConfig,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || defaultConfig.anthropicApiKey,
    supabaseUrl: process.env.SUPABASE_URL || defaultConfig.supabaseUrl,
    supabaseKey: process.env.SUPABASE_ANON_KEY || defaultConfig.supabaseKey,
    defaultTrustLevel: parseInt(process.env.DEFAULT_TRUST_LEVEL || '2') as TrustLevel,
    maxConcurrentAgents: parseInt(process.env.MAX_CONCURRENT_AGENTS || '10'),
    enableGuardrails: process.env.ENABLE_GUARDRAILS !== 'false',
    enableMemoryPersistence: process.env.ENABLE_MEMORY_PERSISTENCE !== 'false',
    enableCollaboration: process.env.ENABLE_COLLABORATION !== 'false',
    logLevel: (process.env.LOG_LEVEL as X2000Config['logLevel']) || 'info',
    enableAuditLog: process.env.ENABLE_AUDIT_LOG !== 'false',
    // Cache settings
    enableCaching: process.env.ENABLE_CACHING !== 'false',
    cacheMaxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
    cacheDefaultTtlMs: parseInt(process.env.CACHE_TTL_MS || String(5 * 60 * 1000)),
    enableQueryCaching: process.env.ENABLE_QUERY_CACHING !== 'false',
    // Parallel execution settings
    executionPoolSize: parseInt(process.env.EXECUTION_POOL_SIZE || '5'),
    parallelBatchTimeout: parseInt(process.env.PARALLEL_BATCH_TIMEOUT || String(10 * 60 * 1000)),
  };
}

export function validateConfig(config: X2000Config): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.anthropicApiKey) {
    errors.push('ANTHROPIC_API_KEY is required');
  }
  
  if (config.defaultTrustLevel < 1 || config.defaultTrustLevel > 4) {
    errors.push('defaultTrustLevel must be between 1 and 4');
  }
  
  if (config.maxConcurrentAgents < 1 || config.maxConcurrentAgents > 100) {
    errors.push('maxConcurrentAgents must be between 1 and 100');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
