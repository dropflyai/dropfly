/**
 * X2000 Channel System - Auth Manager
 *
 * Centralized authentication management for all channels.
 * Handles OAuth flows, token storage/refresh, API keys, and credential vault integration.
 */

import { randomUUID } from 'crypto';
import type {
  PlatformType,
  ChannelCredentials,
  CredentialType,
  OAuthConfig,
} from './types.js';

// ============================================================================
// OAuth Configurations
// ============================================================================

/**
 * OAuth configurations for supported platforms
 */
const OAUTH_CONFIGS: Partial<Record<PlatformType, OAuthConfig>> = {
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    clientId: process.env.SLACK_CLIENT_ID || '',
    clientSecret: process.env.SLACK_CLIENT_SECRET || '',
    scopes: [
      'chat:write',
      'channels:read',
      'channels:history',
      'users:read',
      'app_mentions:read',
      'im:read',
      'im:write',
      'im:history',
    ],
  },
  discord: {
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    scopes: ['bot', 'applications.commands'],
  },
  msteams: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    clientId: process.env.MSTEAMS_CLIENT_ID || '',
    clientSecret: process.env.MSTEAMS_CLIENT_SECRET || '',
    scopes: ['https://graph.microsoft.com/.default'],
  },
  googlechat: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    scopes: ['https://www.googleapis.com/auth/chat.bot'],
  },
};

// ============================================================================
// Auth Manager
// ============================================================================

/**
 * Centralized authentication manager for all channels
 */
export class AuthManager {
  private credentials: Map<PlatformType, ChannelCredentials> = new Map();
  private refreshTimers: Map<PlatformType, NodeJS.Timeout> = new Map();
  private oauthStates: Map<string, { platform: PlatformType; createdAt: Date }> = new Map();
  private vault: CredentialVault | null = null;

  // Singleton instance
  private static instance: AuthManager;

  /**
   * Get singleton instance
   */
  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Load credentials from all sources
   */
  async loadCredentials(): Promise<void> {
    // Load from environment variables first
    this.loadFromEnv();

    // Load from vault if configured
    if (this.vault) {
      await this.loadFromVault();
    }

    // Schedule token refreshes for OAuth credentials
    this.scheduleRefreshes();

    console.log(
      '[AuthManager] Loaded credentials for:',
      Array.from(this.credentials.keys()).join(', ')
    );
  }

  /**
   * Set the credential vault
   */
  setVault(vault: CredentialVault): void {
    this.vault = vault;
  }

  /**
   * Load credentials from environment variables
   */
  private loadFromEnv(): void {
    // Telegram
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.credentials.set('telegram', {
        type: 'bot_token',
        token: process.env.TELEGRAM_BOT_TOKEN,
      });
    }

    // WhatsApp (Cloud API)
    if (process.env.WHATSAPP_ACCESS_TOKEN) {
      this.credentials.set('whatsapp', {
        type: 'oauth',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        // WhatsApp tokens are long-lived (60 days)
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      });
    }

    // Signal (signal-cli)
    if (process.env.SIGNAL_PHONE_NUMBER) {
      this.credentials.set('signal', {
        type: 'phone',
        phoneNumber: process.env.SIGNAL_PHONE_NUMBER,
        signalCliUrl: process.env.SIGNAL_CLI_URL || 'http://localhost:8080',
      });
    }

    // iMessage (BlueBubbles)
    if (process.env.BLUEBUBBLES_PASSWORD) {
      this.credentials.set('imessage', {
        type: 'password',
        password: process.env.BLUEBUBBLES_PASSWORD,
        serverUrl: process.env.BLUEBUBBLES_URL || 'http://localhost:1234',
      });
    }

    // Discord
    if (process.env.DISCORD_BOT_TOKEN) {
      this.credentials.set('discord', {
        type: 'bot_token',
        token: process.env.DISCORD_BOT_TOKEN,
        applicationId: process.env.DISCORD_APPLICATION_ID,
      });
    }

    // Slack
    if (process.env.SLACK_BOT_TOKEN) {
      this.credentials.set('slack', {
        type: 'bot_token',
        token: process.env.SLACK_BOT_TOKEN,
        appToken: process.env.SLACK_APP_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
      });
    }

    // MS Teams
    if (process.env.MSTEAMS_APP_ID && process.env.MSTEAMS_APP_PASSWORD) {
      this.credentials.set('msteams', {
        type: 'password',
        appId: process.env.MSTEAMS_APP_ID,
        password: process.env.MSTEAMS_APP_PASSWORD,
      });
    }

    // Matrix
    if (process.env.MATRIX_ACCESS_TOKEN) {
      this.credentials.set('matrix', {
        type: 'oauth',
        accessToken: process.env.MATRIX_ACCESS_TOKEN,
        userId: process.env.MATRIX_USER_ID,
        homeserverUrl: process.env.MATRIX_HOMESERVER_URL,
      });
    }

    // SMS (Twilio)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.credentials.set('sms', {
        type: 'api_key',
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      });
    }

    // Email (SMTP)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.credentials.set('email', {
        type: 'password',
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || '587',
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        secure: process.env.SMTP_SECURE === 'true',
      });
    }
  }

  /**
   * Load credentials from secure vault
   */
  private async loadFromVault(): Promise<void> {
    if (!this.vault) return;

    try {
      const vaultCredentials = await this.vault.loadAll();

      for (const [platform, creds] of vaultCredentials) {
        // Vault credentials override env credentials
        this.credentials.set(platform, creds);
      }
    } catch (error) {
      console.error('[AuthManager] Failed to load from vault:', error);
    }
  }

  // ============================================================================
  // Credential Access
  // ============================================================================

  /**
   * Get credentials for a platform
   */
  getCredentials(platform: PlatformType): ChannelCredentials | undefined {
    return this.credentials.get(platform);
  }

  /**
   * Check if platform has valid credentials
   */
  hasCredentials(platform: PlatformType): boolean {
    const creds = this.credentials.get(platform);
    if (!creds) return false;

    // Check if OAuth token is expired
    if (creds.type === 'oauth' && creds.expiresAt) {
      return new Date() < creds.expiresAt;
    }

    return true;
  }

  /**
   * Set credentials for a platform
   */
  setCredentials(platform: PlatformType, credentials: ChannelCredentials): void {
    this.credentials.set(platform, credentials);

    // Save to vault if available
    if (this.vault) {
      this.vault.save(platform, credentials).catch((err) => {
        console.error(`[AuthManager] Failed to save ${platform} credentials to vault:`, err);
      });
    }

    // Schedule refresh if OAuth
    if (credentials.type === 'oauth' && credentials.expiresAt) {
      this.scheduleRefresh(platform, credentials);
    }
  }

  /**
   * Remove credentials for a platform
   */
  removeCredentials(platform: PlatformType): void {
    this.credentials.delete(platform);

    // Clear refresh timer
    const timer = this.refreshTimers.get(platform);
    if (timer) {
      clearTimeout(timer);
      this.refreshTimers.delete(platform);
    }

    // Remove from vault
    if (this.vault) {
      this.vault.remove(platform).catch((err) => {
        console.error(`[AuthManager] Failed to remove ${platform} credentials from vault:`, err);
      });
    }
  }

  // ============================================================================
  // Token Refresh
  // ============================================================================

  /**
   * Schedule token refreshes for all OAuth credentials
   */
  private scheduleRefreshes(): void {
    for (const [platform, creds] of this.credentials) {
      if (creds.type === 'oauth' && creds.expiresAt && creds.refreshToken) {
        this.scheduleRefresh(platform, creds);
      }
    }
  }

  /**
   * Schedule a token refresh for a platform
   */
  private scheduleRefresh(platform: PlatformType, creds: ChannelCredentials): void {
    if (!creds.expiresAt) return;

    // Clear existing timer
    const existingTimer = this.refreshTimers.get(platform);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule refresh 1 hour before expiry
    const refreshTime = creds.expiresAt.getTime() - Date.now() - 60 * 60 * 1000;

    if (refreshTime > 0) {
      const timer = setTimeout(() => {
        this.refreshToken(platform).catch((err) => {
          console.error(`[AuthManager] Failed to refresh ${platform} token:`, err);
        });
      }, refreshTime);

      this.refreshTimers.set(platform, timer);
      console.log(
        `[AuthManager] Scheduled ${platform} token refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`
      );
    } else if (refreshTime > -60 * 60 * 1000) {
      // Token expires within the hour, refresh now
      this.refreshToken(platform).catch((err) => {
        console.error(`[AuthManager] Failed to refresh ${platform} token:`, err);
      });
    }
  }

  /**
   * Refresh token for a platform
   */
  async refreshToken(platform: PlatformType): Promise<void> {
    const creds = this.credentials.get(platform);
    if (!creds || creds.type !== 'oauth' || !creds.refreshToken) {
      throw new Error(`No refresh token available for ${platform}`);
    }

    console.log(`[AuthManager] Refreshing ${platform} token...`);

    const oauthConfig = OAUTH_CONFIGS[platform];
    if (!oauthConfig) {
      throw new Error(`No OAuth config for ${platform}`);
    }

    try {
      const response = await fetch(oauthConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: oauthConfig.clientId,
          client_secret: oauthConfig.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: creds.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json() as {
        access_token: string;
        refresh_token?: string;
        expires_in: number;
      };

      // Update credentials
      const newCreds: ChannelCredentials = {
        ...creds,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || creds.refreshToken,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      };

      this.setCredentials(platform, newCreds);
      console.log(`[AuthManager] Refreshed ${platform} token successfully`);
    } catch (error) {
      console.error(`[AuthManager] Token refresh failed for ${platform}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // OAuth Flows
  // ============================================================================

  /**
   * Initiate OAuth flow for a platform
   *
   * @param platform - Platform to authenticate
   * @param redirectUri - Redirect URI after auth
   * @returns Authorization URL
   */
  initiateOAuth(platform: PlatformType, redirectUri: string): string {
    const oauthConfig = OAUTH_CONFIGS[platform];
    if (!oauthConfig) {
      throw new Error(`OAuth not supported for ${platform}`);
    }

    // Generate state for CSRF protection
    const state = randomUUID();
    this.oauthStates.set(state, { platform, createdAt: new Date() });

    // Clean up old states (older than 10 minutes)
    this.cleanupOAuthStates();

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: oauthConfig.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: oauthConfig.scopes.join(' '),
      state,
    });

    return `${oauthConfig.authUrl}?${params.toString()}`;
  }

  /**
   * Complete OAuth flow with authorization code
   *
   * @param code - Authorization code from callback
   * @param state - State parameter for CSRF validation
   * @param redirectUri - Redirect URI (must match initiateOAuth)
   */
  async completeOAuth(
    code: string,
    state: string,
    redirectUri: string
  ): Promise<PlatformType> {
    // Validate state
    const stateData = this.oauthStates.get(state);
    if (!stateData) {
      throw new Error('Invalid or expired OAuth state');
    }

    const { platform } = stateData;
    this.oauthStates.delete(state);

    const oauthConfig = OAUTH_CONFIGS[platform];
    if (!oauthConfig) {
      throw new Error(`OAuth config not found for ${platform}`);
    }

    // Exchange code for tokens
    const response = await fetch(oauthConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token exchange failed: ${error}`);
    }

    const data = await response.json() as {
      access_token: string;
      refresh_token?: string;
      token_type: string;
      expires_in?: number;
      scope?: string;
    };

    // Store credentials
    const credentials: ChannelCredentials = {
      type: 'oauth',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope,
    };

    this.setCredentials(platform, credentials);
    console.log(`[AuthManager] OAuth completed for ${platform}`);

    return platform;
  }

  /**
   * Clean up expired OAuth states
   */
  private cleanupOAuthStates(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    for (const [state, data] of this.oauthStates) {
      if (now - data.createdAt.getTime() > maxAge) {
        this.oauthStates.delete(state);
      }
    }
  }

  // ============================================================================
  // Validation
  // ============================================================================

  /**
   * Validate credentials for a platform
   */
  async validateCredentials(platform: PlatformType): Promise<boolean> {
    const creds = this.credentials.get(platform);
    if (!creds) return false;

    // Platform-specific validation
    try {
      switch (platform) {
        case 'telegram':
          return await this.validateTelegram(creds);
        case 'discord':
          return await this.validateDiscord(creds);
        case 'slack':
          return await this.validateSlack(creds);
        case 'whatsapp':
          return await this.validateWhatsApp(creds);
        default:
          // For other platforms, just check that required fields exist
          return this.hasMinimumCredentials(creds);
      }
    } catch (error) {
      console.error(`[AuthManager] Credential validation failed for ${platform}:`, error);
      return false;
    }
  }

  /**
   * Check if credentials have minimum required fields
   */
  private hasMinimumCredentials(creds: ChannelCredentials): boolean {
    switch (creds.type) {
      case 'bot_token':
        return !!creds.token;
      case 'oauth':
        return !!creds.accessToken;
      case 'api_key':
        return !!creds.apiKey || !!(creds.accountSid && creds.authToken);
      case 'password':
        return !!creds.password;
      case 'phone':
        return !!creds.phoneNumber;
      default:
        return false;
    }
  }

  /**
   * Validate Telegram credentials
   */
  private async validateTelegram(creds: ChannelCredentials): Promise<boolean> {
    const response = await fetch(
      `https://api.telegram.org/bot${creds.token}/getMe`
    );
    return response.ok;
  }

  /**
   * Validate Discord credentials
   */
  private async validateDiscord(creds: ChannelCredentials): Promise<boolean> {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${creds.token}`,
      },
    });
    return response.ok;
  }

  /**
   * Validate Slack credentials
   */
  private async validateSlack(creds: ChannelCredentials): Promise<boolean> {
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return false;

    const data = await response.json() as { ok: boolean };
    return data.ok;
  }

  /**
   * Validate WhatsApp credentials
   */
  private async validateWhatsApp(creds: ChannelCredentials): Promise<boolean> {
    const phoneNumberId = creds.phoneNumberId;
    if (!phoneNumberId) return false;

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
        },
      }
    );
    return response.ok;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Clear all credentials (for testing)
   */
  clear(): void {
    this.credentials.clear();
    this.oauthStates.clear();

    for (const timer of this.refreshTimers.values()) {
      clearTimeout(timer);
    }
    this.refreshTimers.clear();
  }

  /**
   * Shutdown auth manager
   */
  shutdown(): void {
    for (const timer of this.refreshTimers.values()) {
      clearTimeout(timer);
    }
    this.refreshTimers.clear();
  }
}

// ============================================================================
// Credential Vault Interface
// ============================================================================

/**
 * Interface for credential storage backends
 */
export interface CredentialVault {
  /**
   * Load all credentials from vault
   */
  loadAll(): Promise<Map<PlatformType, ChannelCredentials>>;

  /**
   * Load credentials for a specific platform
   */
  load(platform: PlatformType): Promise<ChannelCredentials | null>;

  /**
   * Save credentials for a platform
   */
  save(platform: PlatformType, credentials: ChannelCredentials): Promise<void>;

  /**
   * Remove credentials for a platform
   */
  remove(platform: PlatformType): Promise<void>;
}

/**
 * In-memory credential vault (for development/testing)
 */
export class InMemoryVault implements CredentialVault {
  private storage = new Map<PlatformType, ChannelCredentials>();

  async loadAll(): Promise<Map<PlatformType, ChannelCredentials>> {
    return new Map(this.storage);
  }

  async load(platform: PlatformType): Promise<ChannelCredentials | null> {
    return this.storage.get(platform) || null;
  }

  async save(platform: PlatformType, credentials: ChannelCredentials): Promise<void> {
    this.storage.set(platform, credentials);
  }

  async remove(platform: PlatformType): Promise<void> {
    this.storage.delete(platform);
  }
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Singleton auth manager instance
 */
export const authManager = AuthManager.getInstance();

/**
 * Convenience function to get credentials
 */
export function getCredentials(platform: PlatformType): ChannelCredentials | undefined {
  return authManager.getCredentials(platform);
}

/**
 * Convenience function to check credentials
 */
export function hasCredentials(platform: PlatformType): boolean {
  return authManager.hasCredentials(platform);
}
