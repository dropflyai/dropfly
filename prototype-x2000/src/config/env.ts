/**
 * Environment Configuration
 * Centralized configuration for Supabase and other services
 */

import { z } from 'zod';

// ============================================================================
// Environment Schema
// ============================================================================

const envSchema = z.object({
  // Supabase Configuration
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Environment
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Memory System
  MEMORY_PERSISTENCE_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  MEMORY_OFFLINE_QUEUE_MAX: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('100'),
  MEMORY_SYNC_INTERVAL_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('30000'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// ============================================================================
// Environment Loading
// ============================================================================

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const rawEnv = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    MEMORY_PERSISTENCE_ENABLED: process.env.MEMORY_PERSISTENCE_ENABLED,
    MEMORY_OFFLINE_QUEUE_MAX: process.env.MEMORY_OFFLINE_QUEUE_MAX,
    MEMORY_SYNC_INTERVAL_MS: process.env.MEMORY_SYNC_INTERVAL_MS,
    LOG_LEVEL: process.env.LOG_LEVEL,
  };

  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    console.warn('[Config] Environment validation warnings:', result.error.issues);
    // Return defaults for missing values
    return envSchema.parse({});
  }

  return result.data;
}

// ============================================================================
// Configuration Object
// ============================================================================

export const env = loadEnv();

export const config = {
  supabase: {
    url: env.SUPABASE_URL ?? '',
    anonKey: env.SUPABASE_ANON_KEY ?? '',
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    isConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
  },
  memory: {
    persistenceEnabled: env.MEMORY_PERSISTENCE_ENABLED,
    offlineQueueMax: env.MEMORY_OFFLINE_QUEUE_MAX,
    syncIntervalMs: env.MEMORY_SYNC_INTERVAL_MS,
  },
  environment: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
};

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateSupabaseConfig(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!env.SUPABASE_URL) {
    missing.push('SUPABASE_URL');
  }

  if (!env.SUPABASE_ANON_KEY) {
    missing.push('SUPABASE_ANON_KEY');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function getSupabaseConfig(): { url: string; key: string } | null {
  if (!config.supabase.isConfigured) {
    return null;
  }

  return {
    url: config.supabase.url,
    key: config.supabase.serviceRoleKey ?? config.supabase.anonKey,
  };
}
