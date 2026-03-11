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
    .default('false')
    .transform((val) => val === 'true'),
  MEMORY_OFFLINE_QUEUE_MAX: z
    .string()
    .default('100')
    .transform((val) => parseInt(val, 10)),
  MEMORY_SYNC_INTERVAL_MS: z
    .string()
    .default('30000')
    .transform((val) => parseInt(val, 10)),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Slack Configuration
  SLACK_BOT_TOKEN: z.string().min(1).optional(),
  SLACK_APP_TOKEN: z.string().min(1).optional(),
  SLACK_SIGNING_SECRET: z.string().min(1).optional(),
  SLACK_PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10)),

  // Discord Configuration
  DISCORD_BOT_TOKEN: z.string().min(1).optional(),
  DISCORD_APPLICATION_ID: z.string().min(1).optional(),
  DISCORD_GUILD_IDS: z.string().optional(), // Comma-separated list of guild IDs for instant command updates
  DISCORD_ALLOWED_GUILDS: z.string().optional(), // Comma-separated allowlist of guild IDs
  DISCORD_ALLOWED_CHANNELS: z.string().optional(), // Comma-separated allowlist of channel IDs
  DISCORD_ALLOWED_USERS: z.string().optional(), // Comma-separated allowlist of user IDs
  DISCORD_MENTION_ONLY: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  DISCORD_ENABLE_SLASH_COMMANDS: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  DISCORD_COMMAND_PREFIX: z.string().optional(), // Optional text command prefix (e.g., "!x2000")

  // Telegram Configuration
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_WEBHOOK_URL: z.string().url().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1).optional(),
  TELEGRAM_WEBHOOK_PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10)),
  TELEGRAM_USE_WEBHOOK: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  TELEGRAM_PARSE_MODE: z
    .enum(['HTML', 'Markdown', 'MarkdownV2'])
    .default('MarkdownV2'),
  TELEGRAM_MAX_RETRIES: z
    .string()
    .default('3')
    .transform((val) => parseInt(val, 10)),
  TELEGRAM_RATE_LIMITING: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  TELEGRAM_ALLOWED_CHATS: z.string().optional(), // Comma-separated list of allowed chat IDs
  TELEGRAM_ALLOWED_USERS: z.string().optional(), // Comma-separated list of allowed user IDs
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
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
    SLACK_PORT: process.env.SLACK_PORT,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID,
    DISCORD_GUILD_IDS: process.env.DISCORD_GUILD_IDS,
    DISCORD_ALLOWED_GUILDS: process.env.DISCORD_ALLOWED_GUILDS,
    DISCORD_ALLOWED_CHANNELS: process.env.DISCORD_ALLOWED_CHANNELS,
    DISCORD_ALLOWED_USERS: process.env.DISCORD_ALLOWED_USERS,
    DISCORD_MENTION_ONLY: process.env.DISCORD_MENTION_ONLY,
    DISCORD_ENABLE_SLASH_COMMANDS: process.env.DISCORD_ENABLE_SLASH_COMMANDS,
    DISCORD_COMMAND_PREFIX: process.env.DISCORD_COMMAND_PREFIX,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL,
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
    TELEGRAM_WEBHOOK_PORT: process.env.TELEGRAM_WEBHOOK_PORT,
    TELEGRAM_USE_WEBHOOK: process.env.TELEGRAM_USE_WEBHOOK,
    TELEGRAM_PARSE_MODE: process.env.TELEGRAM_PARSE_MODE,
    TELEGRAM_MAX_RETRIES: process.env.TELEGRAM_MAX_RETRIES,
    TELEGRAM_RATE_LIMITING: process.env.TELEGRAM_RATE_LIMITING,
    TELEGRAM_ALLOWED_CHATS: process.env.TELEGRAM_ALLOWED_CHATS,
    TELEGRAM_ALLOWED_USERS: process.env.TELEGRAM_ALLOWED_USERS,
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
  slack: {
    botToken: env.SLACK_BOT_TOKEN ?? '',
    appToken: env.SLACK_APP_TOKEN ?? '',
    signingSecret: env.SLACK_SIGNING_SECRET ?? '',
    port: env.SLACK_PORT,
    isConfigured: Boolean(env.SLACK_BOT_TOKEN),
    hasSocketMode: Boolean(env.SLACK_APP_TOKEN),
  },
  discord: {
    botToken: env.DISCORD_BOT_TOKEN ?? '',
    applicationId: env.DISCORD_APPLICATION_ID ?? '',
    guildIds: env.DISCORD_GUILD_IDS?.split(',').filter(Boolean) ?? [],
    allowedGuilds: env.DISCORD_ALLOWED_GUILDS?.split(',').filter(Boolean) ?? null,
    allowedChannels: env.DISCORD_ALLOWED_CHANNELS?.split(',').filter(Boolean) ?? null,
    allowedUsers: env.DISCORD_ALLOWED_USERS?.split(',').filter(Boolean) ?? null,
    mentionOnly: env.DISCORD_MENTION_ONLY,
    enableSlashCommands: env.DISCORD_ENABLE_SLASH_COMMANDS,
    commandPrefix: env.DISCORD_COMMAND_PREFIX ?? null,
    isConfigured: Boolean(env.DISCORD_BOT_TOKEN),
    hasSlashCommands: Boolean(env.DISCORD_BOT_TOKEN && env.DISCORD_APPLICATION_ID),
  },
  telegram: {
    botToken: env.TELEGRAM_BOT_TOKEN ?? '',
    webhookUrl: env.TELEGRAM_WEBHOOK_URL ?? '',
    webhookSecret: env.TELEGRAM_WEBHOOK_SECRET ?? '',
    webhookPort: env.TELEGRAM_WEBHOOK_PORT,
    useWebhook: env.TELEGRAM_USE_WEBHOOK,
    parseMode: env.TELEGRAM_PARSE_MODE as 'HTML' | 'Markdown' | 'MarkdownV2',
    maxRetries: env.TELEGRAM_MAX_RETRIES,
    rateLimiting: env.TELEGRAM_RATE_LIMITING,
    allowedChats: env.TELEGRAM_ALLOWED_CHATS?.split(',').filter(Boolean) ?? null,
    allowedUsers: env.TELEGRAM_ALLOWED_USERS?.split(',').filter(Boolean) ?? null,
    isConfigured: Boolean(env.TELEGRAM_BOT_TOKEN),
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

// ============================================================================
// Slack Configuration Helpers
// ============================================================================

export function validateSlackConfig(): {
  valid: boolean;
  mode: 'socket' | 'http' | null;
  missing: string[];
} {
  const missing: string[] = [];

  if (!env.SLACK_BOT_TOKEN) {
    missing.push('SLACK_BOT_TOKEN');
  }

  // Check for Socket Mode requirements
  const hasSocketMode = Boolean(env.SLACK_APP_TOKEN);

  // Check for HTTP mode requirements
  const hasHttpMode = Boolean(env.SLACK_SIGNING_SECRET);

  if (!hasSocketMode && !hasHttpMode) {
    missing.push('SLACK_APP_TOKEN (for Socket Mode) or SLACK_SIGNING_SECRET (for HTTP mode)');
  }

  const mode = hasSocketMode ? 'socket' : hasHttpMode ? 'http' : null;

  return {
    valid: missing.length === 0,
    mode,
    missing,
  };
}

export function getSlackConfig(): {
  botToken: string;
  appToken?: string;
  signingSecret?: string;
  port: number;
  socketMode: boolean;
} | null {
  if (!config.slack.isConfigured) {
    return null;
  }

  return {
    botToken: config.slack.botToken,
    appToken: config.slack.appToken || undefined,
    signingSecret: config.slack.signingSecret || undefined,
    port: config.slack.port,
    socketMode: config.slack.hasSocketMode,
  };
}

// ============================================================================
// Discord Configuration Helpers
// ============================================================================

export function validateDiscordConfig(): {
  valid: boolean;
  hasSlashCommands: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!env.DISCORD_BOT_TOKEN) {
    missing.push('DISCORD_BOT_TOKEN');
  }

  // Application ID is only required for slash commands
  const hasSlashCommands = Boolean(env.DISCORD_BOT_TOKEN && env.DISCORD_APPLICATION_ID);

  if (env.DISCORD_ENABLE_SLASH_COMMANDS && !env.DISCORD_APPLICATION_ID) {
    missing.push('DISCORD_APPLICATION_ID (required for slash commands)');
  }

  return {
    valid: missing.length === 0,
    hasSlashCommands,
    missing,
  };
}

export function getDiscordConfig(): {
  botToken: string;
  applicationId?: string;
  guildIds: string[];
  allowedGuilds: string[] | null;
  allowedChannels: string[] | null;
  allowedUsers: string[] | null;
  mentionOnly: boolean;
  enableSlashCommands: boolean;
  commandPrefix: string | null;
} | null {
  if (!config.discord.isConfigured) {
    return null;
  }

  return {
    botToken: config.discord.botToken,
    applicationId: config.discord.applicationId || undefined,
    guildIds: config.discord.guildIds,
    allowedGuilds: config.discord.allowedGuilds,
    allowedChannels: config.discord.allowedChannels,
    allowedUsers: config.discord.allowedUsers,
    mentionOnly: config.discord.mentionOnly,
    enableSlashCommands: config.discord.enableSlashCommands,
    commandPrefix: config.discord.commandPrefix,
  };
}

// ============================================================================
// Telegram Configuration Helpers
// ============================================================================

export function validateTelegramConfig(): {
  valid: boolean;
  mode: 'webhook' | 'polling';
  missing: string[];
} {
  const missing: string[] = [];

  if (!env.TELEGRAM_BOT_TOKEN) {
    missing.push('TELEGRAM_BOT_TOKEN');
  }

  // Webhook mode requires URL
  if (env.TELEGRAM_USE_WEBHOOK && !env.TELEGRAM_WEBHOOK_URL) {
    missing.push('TELEGRAM_WEBHOOK_URL (required for webhook mode)');
  }

  const mode = env.TELEGRAM_USE_WEBHOOK ? 'webhook' : 'polling';

  return {
    valid: missing.length === 0,
    mode,
    missing,
  };
}

export function getTelegramConfig(): {
  botToken: string;
  webhookUrl?: string;
  webhookSecret?: string;
  webhookPort: number;
  useWebhook: boolean;
  parseMode: 'HTML' | 'Markdown' | 'MarkdownV2';
  maxRetries: number;
  rateLimiting: boolean;
  allowedChats: string[] | null;
  allowedUsers: string[] | null;
} | null {
  if (!config.telegram.isConfigured) {
    return null;
  }

  return {
    botToken: config.telegram.botToken,
    webhookUrl: config.telegram.webhookUrl || undefined,
    webhookSecret: config.telegram.webhookSecret || undefined,
    webhookPort: config.telegram.webhookPort,
    useWebhook: config.telegram.useWebhook,
    parseMode: config.telegram.parseMode,
    maxRetries: config.telegram.maxRetries,
    rateLimiting: config.telegram.rateLimiting,
    allowedChats: config.telegram.allowedChats,
    allowedUsers: config.telegram.allowedUsers,
  };
}
