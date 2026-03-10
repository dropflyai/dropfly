/**
 * Discord Channel
 *
 * Enables X2000 communication via Discord.
 * Supports mentions, threads, and direct messages.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BaseChannel,
  ChannelRegistry,
  type ChannelConfig,
  type ChannelMessage,
  type ChannelResponse,
  type ChannelContext,
} from './base.js';

// ============================================================================
// Types
// ============================================================================

export interface DiscordChannelConfig extends Partial<ChannelConfig> {
  botToken?: string;
  applicationId?: string;
  allowedGuilds?: string[];
  allowedChannels?: string[];
  allowedUsers?: string[];
  mentionOnly?: boolean;
}

interface DiscordMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    bot: boolean;
  };
  channel_id: string;
  guild_id?: string;
  timestamp: string;
  message_reference?: {
    message_id: string;
    channel_id: string;
  };
  attachments?: Array<{
    filename: string;
    url: string;
    content_type: string;
  }>;
}

// ============================================================================
// Discord Channel
// ============================================================================

export class DiscordChannel extends BaseChannel {
  readonly type = 'discord';
  readonly name = 'Discord';

  private botToken: string | null;
  private applicationId: string | null;
  private allowedGuilds: string[] | null;
  private allowedChannels: string[] | null;
  private allowedUsers: string[] | null;
  private mentionOnly: boolean;
  private botUserId: string | null = null;

  constructor(config: DiscordChannelConfig = {}) {
    super(config);

    this.botToken = config.botToken || process.env.DISCORD_BOT_TOKEN || null;
    this.applicationId = config.applicationId || process.env.DISCORD_APPLICATION_ID || null;
    this.allowedGuilds = config.allowedGuilds || null;
    this.allowedChannels = config.allowedChannels || null;
    this.allowedUsers = config.allowedUsers || null;
    this.mentionOnly = config.mentionOnly ?? true;
  }

  /**
   * Initialize Discord connection
   */
  async initialize(): Promise<void> {
    if (!this.botToken) {
      console.warn('[Discord] No bot token configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Get bot user info
      const userResponse = await this.discordAPI('GET', '/users/@me');

      if (userResponse.id) {
        this.botUserId = userResponse.id as string;
        this.connected = true;
        console.log(`[Discord] Connected as ${userResponse.username}#${userResponse.discriminator} (${this.botUserId})`);
      } else {
        throw new Error('Failed to get bot user info');
      }

      // Note: For full Discord integration, you would use:
      // - Discord Gateway (WebSocket) for real-time events
      // - Interactions endpoint for slash commands
      // This implementation provides the core functionality

    } catch (error) {
      console.error('[Discord] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Shutdown Discord connection
   */
  async shutdown(): Promise<void> {
    this.connected = false;
    console.log('[Discord] Disconnected');
  }

  /**
   * Send a message to Discord
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected || !this.botToken) {
      throw new Error('Discord channel not connected');
    }

    const payload: Record<string, unknown> = {
      content: this.formatMessage(response.content),
    };

    // Reply to message if context has metadata with messageId
    if (context?.metadata?.messageId) {
      payload.message_reference = {
        message_id: context.metadata.messageId,
      };
    }

    // Add embeds for attachments
    if (response.attachments && response.attachments.length > 0) {
      payload.embeds = response.attachments.map(a => ({
        title: a.name,
        url: a.type === 'url' ? a.url : undefined,
        description: a.type !== 'url' ? `[${a.type}]` : undefined,
      }));
    }

    await this.discordAPI('POST', `/channels/${channelId}/messages`, payload);

    console.log(`[Discord] Sent message to ${channelId}`);
  }

  /**
   * Process an incoming Discord message
   */
  async handleMessage(message: DiscordMessage): Promise<ChannelResponse | null> {
    // Ignore bot's own messages
    if (message.author.bot || message.author.id === this.botUserId) {
      return null;
    }

    // Check guild allowlist
    if (this.allowedGuilds && message.guild_id && !this.allowedGuilds.includes(message.guild_id)) {
      return null;
    }

    // Check channel allowlist
    if (this.allowedChannels && !this.allowedChannels.includes(message.channel_id)) {
      return null;
    }

    // Check user allowlist
    if (this.allowedUsers && !this.allowedUsers.includes(message.author.id)) {
      return null;
    }

    // Check mention requirement
    if (this.mentionOnly && this.botUserId) {
      if (!message.content.includes(`<@${this.botUserId}>`) && !message.content.includes(`<@!${this.botUserId}>`)) {
        return null;
      }
    }

    // Create channel message
    const channelMessage: ChannelMessage = {
      id: message.id,
      channelType: this.type,
      channelId: message.channel_id,
      userId: message.author.id,
      content: this.cleanMessage(message.content),
      timestamp: new Date(message.timestamp),
      threadId: message.message_reference?.message_id,
      metadata: {
        guildId: message.guild_id,
        messageId: message.id,
        username: message.author.username,
      },
      attachments: message.attachments?.map(a => ({
        type: 'file' as const,
        name: a.filename,
        url: a.url,
        mimeType: a.content_type,
      })),
    };

    return this.processMessage(channelMessage);
  }

  /**
   * Clean message text (remove bot mention, etc.)
   */
  private cleanMessage(text: string): string {
    if (this.botUserId) {
      // Remove bot mention (both formats)
      text = text.replace(new RegExp(`<@!?${this.botUserId}>`, 'g'), '').trim();
    }

    // Convert user mentions to readable format
    text = text.replace(/<@!?(\d+)>/g, '@user');

    // Convert channel mentions
    text = text.replace(/<#(\d+)>/g, '#channel');

    // Convert role mentions
    text = text.replace(/<@&(\d+)>/g, '@role');

    return text.trim();
  }

  /**
   * Format message for Discord (handle length limits)
   */
  private formatMessage(text: string): string {
    const MAX_LENGTH = 2000;

    if (text.length <= MAX_LENGTH) {
      return text;
    }

    // Truncate with ellipsis
    return text.substring(0, MAX_LENGTH - 20) + '\n\n... [truncated]';
  }

  /**
   * Make a Discord API call
   */
  private async discordAPI(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${this.botToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Discord API error: ${response.status} ${error}`);
    }

    // Some endpoints return no content
    if (response.status === 204) {
      return {};
    }

    return response.json() as Promise<Record<string, unknown>>;
  }

  /**
   * Get user info
   */
  async getUserInfo(userId: string): Promise<{
    username: string;
    discriminator: string;
    avatar?: string;
  } | null> {
    if (!this.connected) return null;

    try {
      const user = await this.discordAPI('GET', `/users/${userId}`) as {
        username: string;
        discriminator: string;
        avatar?: string;
      };
      return {
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(channelId: string): Promise<{
    name: string;
    type: number;
    guildId?: string;
  } | null> {
    if (!this.connected) return null;

    try {
      const channel = await this.discordAPI('GET', `/channels/${channelId}`) as {
        name: string;
        type: number;
        guild_id?: string;
      };
      return {
        name: channel.name,
        type: channel.type,
        guildId: channel.guild_id,
      };
    } catch {
      return null;
    }
  }

  /**
   * Create a thread from a message
   */
  async createThread(
    channelId: string,
    messageId: string,
    name: string
  ): Promise<string | null> {
    if (!this.connected) return null;

    try {
      const thread = await this.discordAPI('POST', `/channels/${channelId}/messages/${messageId}/threads`, {
        name,
        auto_archive_duration: 60, // 1 hour
      }) as { id: string };

      return thread.id;
    } catch {
      return null;
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const discordChannel = new DiscordChannel();

// Register with channel registry (only if configured)
if (process.env.DISCORD_BOT_TOKEN) {
  ChannelRegistry.register(discordChannel);
}

export function createDiscordChannel(config?: DiscordChannelConfig): DiscordChannel {
  return new DiscordChannel(config);
}
