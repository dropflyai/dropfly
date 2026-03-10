/**
 * Slack Channel
 *
 * Enables X2000 communication via Slack.
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

export interface SlackChannelConfig extends Partial<ChannelConfig> {
  botToken?: string;
  appToken?: string;
  signingSecret?: string;
  allowedChannels?: string[];
  allowedUsers?: string[];
  mentionOnly?: boolean;
}

interface SlackEvent {
  type: string;
  user?: string;
  channel?: string;
  text?: string;
  ts?: string;
  thread_ts?: string;
  files?: Array<{
    name: string;
    url_private: string;
    mimetype: string;
  }>;
}

// ============================================================================
// Slack Channel
// ============================================================================

export class SlackChannel extends BaseChannel {
  readonly type = 'slack';
  readonly name = 'Slack';

  private botToken: string | null;
  private appToken: string | null;
  private signingSecret: string | null;
  private allowedChannels: string[] | null;
  private allowedUsers: string[] | null;
  private mentionOnly: boolean;
  private botUserId: string | null = null;

  constructor(config: SlackChannelConfig = {}) {
    super(config);

    this.botToken = config.botToken || process.env.SLACK_BOT_TOKEN || null;
    this.appToken = config.appToken || process.env.SLACK_APP_TOKEN || null;
    this.signingSecret = config.signingSecret || process.env.SLACK_SIGNING_SECRET || null;
    this.allowedChannels = config.allowedChannels || null;
    this.allowedUsers = config.allowedUsers || null;
    this.mentionOnly = config.mentionOnly ?? true;
  }

  /**
   * Initialize Slack connection
   */
  async initialize(): Promise<void> {
    if (!this.botToken) {
      console.warn('[Slack] No bot token configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Test authentication
      const authResponse = await this.slackAPI('auth.test', {});

      if (authResponse.ok) {
        this.botUserId = authResponse.user_id as string;
        this.connected = true;
        console.log(`[Slack] Connected as ${authResponse.user} (${this.botUserId})`);
      } else {
        throw new Error(authResponse.error || 'Auth test failed');
      }

      // Note: For full Slack integration, you would use Socket Mode or Events API
      // This implementation provides the core functionality
      // A production implementation would add:
      // - Socket Mode connection for real-time events
      // - HTTP endpoint for Events API
      // - Request signature verification

    } catch (error) {
      console.error('[Slack] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Shutdown Slack connection
   */
  async shutdown(): Promise<void> {
    this.connected = false;
    console.log('[Slack] Disconnected');
  }

  /**
   * Send a message to Slack
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected || !this.botToken) {
      throw new Error('Slack channel not connected');
    }

    const payload: Record<string, unknown> = {
      channel: channelId,
      text: response.content,
    };

    // Reply in thread if context has threadId
    if (context?.threadId) {
      payload.thread_ts = context.threadId;
    }

    // Add attachments if present
    if (response.attachments && response.attachments.length > 0) {
      payload.attachments = response.attachments.map(a => ({
        title: a.name,
        text: a.type === 'url' ? a.url : `[${a.type}: ${a.name}]`,
      }));
    }

    const result = await this.slackAPI('chat.postMessage', payload);

    if (!result.ok) {
      throw new Error(`Failed to send message: ${result.error}`);
    }

    console.log(`[Slack] Sent message to ${channelId}`);
  }

  /**
   * Process an incoming Slack event
   */
  async handleEvent(event: SlackEvent): Promise<ChannelResponse | null> {
    // Ignore bot's own messages
    if (event.user === this.botUserId) {
      return null;
    }

    // Check channel allowlist
    if (this.allowedChannels && event.channel && !this.allowedChannels.includes(event.channel)) {
      return null;
    }

    // Check user allowlist
    if (this.allowedUsers && event.user && !this.allowedUsers.includes(event.user)) {
      return null;
    }

    // Check mention requirement
    if (this.mentionOnly && event.text && this.botUserId) {
      if (!event.text.includes(`<@${this.botUserId}>`)) {
        return null;
      }
    }

    // Create message
    const message: ChannelMessage = {
      id: event.ts || uuidv4(),
      channelType: this.type,
      channelId: event.channel || 'unknown',
      userId: event.user || 'unknown',
      content: this.cleanMessage(event.text || ''),
      timestamp: event.ts ? new Date(parseFloat(event.ts) * 1000) : new Date(),
      threadId: event.thread_ts,
      metadata: {},
      attachments: event.files?.map(f => ({
        type: 'file' as const,
        name: f.name,
        url: f.url_private,
        mimeType: f.mimetype,
      })),
    };

    return this.processMessage(message);
  }

  /**
   * Clean message text (remove bot mention, etc.)
   */
  private cleanMessage(text: string): string {
    if (this.botUserId) {
      // Remove bot mention
      text = text.replace(new RegExp(`<@${this.botUserId}>`, 'g'), '').trim();
    }

    // Convert Slack user mentions to readable format
    text = text.replace(/<@(\w+)>/g, '@user');

    // Convert Slack channel mentions
    text = text.replace(/<#(\w+)\|([^>]+)>/g, '#$2');

    // Convert Slack links
    text = text.replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, '$1');
    text = text.replace(/<(https?:\/\/[^>]+)>/g, '$1');

    return text.trim();
  }

  /**
   * Make a Slack API call
   */
  private async slackAPI(
    method: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown> & { ok: boolean; error?: string }> {
    const response = await fetch(`https://slack.com/api/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.botToken}`,
      },
      body: JSON.stringify(payload),
    });

    return response.json() as Promise<Record<string, unknown> & { ok: boolean; error?: string }>;
  }

  /**
   * Get user info
   */
  async getUserInfo(userId: string): Promise<{
    name: string;
    realName: string;
    email?: string;
  } | null> {
    if (!this.connected) return null;

    const result = await this.slackAPI('users.info', { user: userId });

    if (!result.ok) return null;

    const user = result.user as { name: string; real_name: string; profile?: { email?: string } };
    return {
      name: user.name,
      realName: user.real_name,
      email: user.profile?.email,
    };
  }

  /**
   * Get channel info
   */
  async getChannelInfo(channelId: string): Promise<{
    name: string;
    isPrivate: boolean;
    isDM: boolean;
  } | null> {
    if (!this.connected) return null;

    const result = await this.slackAPI('conversations.info', { channel: channelId });

    if (!result.ok) return null;

    const channel = result.channel as { name: string; is_private: boolean; is_im: boolean };
    return {
      name: channel.name,
      isPrivate: channel.is_private,
      isDM: channel.is_im,
    };
  }
}

// ============================================================================
// Exports
// ============================================================================

export const slackChannel = new SlackChannel();

// Register with channel registry (only if configured)
if (process.env.SLACK_BOT_TOKEN) {
  ChannelRegistry.register(slackChannel);
}

export function createSlackChannel(config?: SlackChannelConfig): SlackChannel {
  return new SlackChannel(config);
}
