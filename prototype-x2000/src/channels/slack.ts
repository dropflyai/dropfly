/**
 * Slack Channel - Full Implementation
 *
 * Enables X2000 communication via Slack using @slack/bolt.
 * Supports Socket Mode, HTTP mode, mentions, threads, slash commands,
 * Block Kit for rich responses, and proper rate limiting.
 */

import { v4 as uuidv4 } from 'uuid';
import { App, LogLevel } from '@slack/bolt';
import type {
  SlackEventMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  AllMiddlewareArgs,
  SayFn,
} from '@slack/bolt';
import type {
  KnownBlock,
  Block,
  SectionBlock,
  ActionsBlock,
  ContextBlock,
  DividerBlock,
  MessageEvent,
  AppMentionEvent,
  ReactionAddedEvent,
  ReactionRemovedEvent,
} from '@slack/types';
import {
  BaseChannel,
  ChannelRegistry,
  type ChannelConfig,
  type ChannelMessage,
  type ChannelResponse,
  type ChannelContext,
} from './base.js';
import { rateLimitManager } from './rate-limiter.js';

// ============================================================================
// Types
// ============================================================================

export interface SlackChannelConfig extends Partial<ChannelConfig> {
  /** Bot user OAuth token (xoxb-...) */
  botToken?: string;
  /** App-level token for Socket Mode (xapp-...) */
  appToken?: string;
  /** Signing secret for HTTP mode */
  signingSecret?: string;
  /** Use Socket Mode (true) or HTTP mode (false) */
  socketMode?: boolean;
  /** Port for HTTP mode (default: 3000) */
  port?: number;
  /** Allowed channel IDs (null = all) */
  allowedChannels?: string[];
  /** Allowed user IDs (null = all) */
  allowedUsers?: string[];
  /** Only respond when mentioned (default: true) */
  mentionOnly?: boolean;
  /** Custom slash command (without leading slash, default: 'x2000') */
  slashCommand?: string;
  /** Log level */
  logLevel?: LogLevel;
}

export interface SlackBlockKitOptions {
  /** Header text */
  header?: string;
  /** Main text content */
  text?: string;
  /** Fields as key-value pairs */
  fields?: Array<{ label: string; value: string }>;
  /** Action buttons */
  buttons?: Array<{
    id: string;
    text: string;
    style?: 'primary' | 'danger';
    url?: string;
    value?: string;
  }>;
  /** Context/footer text */
  context?: string;
  /** Include dividers between sections */
  dividers?: boolean;
}

interface SlackEvent {
  type: string;
  user?: string;
  channel?: string;
  text?: string;
  ts?: string;
  thread_ts?: string;
  files?: Array<{
    name: string | null;
    url_private?: string;
    mimetype?: string;
  }>;
}

interface SlackRetryState {
  attempt: number;
  lastAttempt: number;
  maxAttempts: number;
  baseDelayMs: number;
}

// ============================================================================
// Slack Channel Implementation
// ============================================================================

export class SlackChannel extends BaseChannel {
  readonly type = 'slack';
  readonly name = 'Slack';

  private app: App | null = null;
  private botToken: string | null;
  private appToken: string | null;
  private signingSecret: string | null;
  private socketMode: boolean;
  private port: number;
  private allowedChannels: string[] | null;
  private allowedUsers: string[] | null;
  private mentionOnly: boolean;
  private slashCommand: string;
  private logLevel: LogLevel;
  private botUserId: string | null = null;
  private teamId: string | null = null;
  private retryState: Map<string, SlackRetryState> = new Map();

  constructor(config: SlackChannelConfig = {}) {
    super(config);
    this.initializeConfig();

    this.botToken = config.botToken || process.env.SLACK_BOT_TOKEN || null;
    this.appToken = config.appToken || process.env.SLACK_APP_TOKEN || null;
    this.signingSecret = config.signingSecret || process.env.SLACK_SIGNING_SECRET || null;
    this.socketMode = config.socketMode ?? (!!this.appToken);
    this.port = config.port || parseInt(process.env.SLACK_PORT || '3000', 10);
    this.allowedChannels = config.allowedChannels || null;
    this.allowedUsers = config.allowedUsers || null;
    this.mentionOnly = config.mentionOnly ?? true;
    this.slashCommand = config.slashCommand || 'x2000';
    this.logLevel = config.logLevel || LogLevel.INFO;
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  /**
   * Initialize Slack connection using @slack/bolt
   */
  async initialize(): Promise<void> {
    if (!this.botToken) {
      console.warn('[Slack] No bot token configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Create the Bolt app with appropriate receiver
      if (this.socketMode) {
        if (!this.appToken) {
          console.warn('[Slack] Socket Mode requires app token, falling back to HTTP mode');
          this.socketMode = false;
        } else {
          this.app = new App({
            token: this.botToken,
            socketMode: true,
            appToken: this.appToken,
            logLevel: this.logLevel,
          });
        }
      }

      if (!this.socketMode) {
        if (!this.signingSecret) {
          throw new Error('HTTP mode requires signing secret');
        }
        this.app = new App({
          token: this.botToken,
          signingSecret: this.signingSecret,
          port: this.port,
          logLevel: this.logLevel,
        });
      }

      if (!this.app) {
        throw new Error('Failed to create Slack app');
      }

      // Set up event handlers
      this.setupEventHandlers();

      // Set up slash command
      this.setupSlashCommand();

      // Start the app
      await this.app.start();

      // Get bot info
      const authResult = await this.app.client.auth.test();
      if (authResult.ok) {
        this.botUserId = authResult.user_id as string;
        this.teamId = authResult.team_id as string;
        this.connected = true;
        console.log(`[Slack] Connected as ${authResult.user} (${this.botUserId}) in team ${this.teamId}`);
        console.log(`[Slack] Mode: ${this.socketMode ? 'Socket Mode' : `HTTP on port ${this.port}`}`);
      } else {
        throw new Error('Auth test failed');
      }

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
    if (this.app) {
      await this.app.stop();
      this.app = null;
    }
    this.connected = false;
    console.log('[Slack] Disconnected');
  }

  /**
   * Start the channel (alias for initialize)
   */
  async start(): Promise<void> {
    return this.initialize();
  }

  /**
   * Stop the channel (alias for shutdown)
   */
  async stop(): Promise<void> {
    return this.shutdown();
  }

  // ============================================================================
  // Event Handlers Setup
  // ============================================================================

  private setupEventHandlers(): void {
    if (!this.app) return;

    // Handle direct messages and channel messages
    this.app.message(async (args) => {
      await this.handleMessageEvent(args);
    });

    // Handle app mentions (@bot)
    this.app.event('app_mention', async (args) => {
      await this.handleAppMention(args);
    });

    // Handle reaction added
    this.app.event('reaction_added', async (args) => {
      await this.handleReactionAdded(args);
    });

    // Handle reaction removed
    this.app.event('reaction_removed', async (args) => {
      await this.handleReactionRemoved(args);
    });

    // Handle button clicks
    this.app.action(/^x2000_.*/, async ({ ack, action, body }) => {
      await ack();
      console.log(`[Slack] Button clicked: ${(action as { action_id: string }).action_id}`, body);
      // Custom action handling can be extended here
    });
  }

  private setupSlashCommand(): void {
    if (!this.app) return;

    // Register the slash command handler
    this.app.command(`/${this.slashCommand}`, async (args) => {
      await this.handleSlashCommand(args);
    });
  }

  // ============================================================================
  // Event Handler Implementations
  // ============================================================================

  private async handleMessageEvent(
    args: SlackEventMiddlewareArgs<'message'> & AllMiddlewareArgs
  ): Promise<void> {
    const { message, say, client } = args;
    const event = message as MessageEvent & { user?: string; text?: string; thread_ts?: string };

    // Ignore bot messages
    if ('bot_id' in event || event.user === this.botUserId) {
      return;
    }

    // Check allowlists
    if (!this.isAllowed(event.channel, event.user)) {
      return;
    }

    // Check mention requirement for channel messages
    if (this.mentionOnly && event.channel_type !== 'im') {
      if (!event.text?.includes(`<@${this.botUserId}>`)) {
        return;
      }
    }

    // Create channel message
    const channelMessage = this.createChannelMessage(event);

    // Process and respond
    const response = await this.processMessage(channelMessage);
    if (response) {
      await this.sendResponse(response, event.channel, event.thread_ts || event.ts, say);
    }
  }

  private async handleAppMention(
    args: SlackEventMiddlewareArgs<'app_mention'> & AllMiddlewareArgs
  ): Promise<void> {
    const { event, say } = args;

    // Check allowlists
    if (!this.isAllowed(event.channel, event.user)) {
      return;
    }

    const channelMessage = this.createChannelMessage(event);
    const response = await this.processMessage(channelMessage);
    if (response) {
      await this.sendResponse(response, event.channel, event.thread_ts || event.ts, say);
    }
  }

  private async handleSlashCommand(
    args: SlackCommandMiddlewareArgs & AllMiddlewareArgs
  ): Promise<void> {
    const { command, ack, respond, say } = args;

    // Acknowledge immediately
    await ack();

    // Check allowlists
    if (!this.isAllowed(command.channel_id, command.user_id)) {
      await respond({
        text: 'You are not authorized to use this command.',
        response_type: 'ephemeral',
      });
      return;
    }

    // Create a message from the command
    const channelMessage: ChannelMessage = {
      id: uuidv4(),
      channelType: this.type,
      channelId: command.channel_id,
      userId: command.user_id,
      content: command.text || 'help',
      timestamp: new Date(),
      metadata: {
        command: command.command,
        responseUrl: command.response_url,
        triggerId: command.trigger_id,
      },
    };

    // Process the command
    const response = await this.processMessage(channelMessage);
    if (response) {
      // Respond to the command
      const blocks = this.createBlockKitBlocks({
        text: response.content,
      });

      await respond({
        blocks,
        text: response.content,
        response_type: 'in_channel',
      });
    }
  }

  private async handleReactionAdded(
    args: SlackEventMiddlewareArgs<'reaction_added'> & AllMiddlewareArgs
  ): Promise<void> {
    const { event } = args;
    console.log(`[Slack] Reaction added: ${event.reaction} by ${event.user}`);
    // Custom reaction handling can be extended here
  }

  private async handleReactionRemoved(
    args: SlackEventMiddlewareArgs<'reaction_removed'> & AllMiddlewareArgs
  ): Promise<void> {
    const { event } = args;
    console.log(`[Slack] Reaction removed: ${event.reaction} by ${event.user}`);
    // Custom reaction handling can be extended here
  }

  // ============================================================================
  // Message Sending
  // ============================================================================

  /**
   * Send a message to a Slack channel
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected || !this.app) {
      throw new Error('Slack channel not connected');
    }

    await this.sendWithRetry(async () => {
      await this.sendMessageInternal(channelId, response, context);
    }, channelId);
  }

  /**
   * Send a message with content and optional Block Kit formatting
   */
  async sendMessage(
    channelId: string,
    content: string,
    options?: {
      threadTs?: string;
      blocks?: SlackBlockKitOptions;
      unfurlLinks?: boolean;
      unfurlMedia?: boolean;
    }
  ): Promise<void> {
    if (!this.connected || !this.app) {
      throw new Error('Slack channel not connected');
    }

    await this.sendWithRetry(async () => {
      // Acquire rate limit token
      const acquired = await rateLimitManager.acquireWithWait('slack', channelId);
      if (!acquired) {
        throw new Error('Rate limited');
      }

      const result = await this.app!.client.chat.postMessage({
        channel: channelId,
        text: content,
        thread_ts: options?.threadTs,
        blocks: options?.blocks ? this.createBlockKitBlocks(options.blocks) as KnownBlock[] : undefined,
        unfurl_links: options?.unfurlLinks,
        unfurl_media: options?.unfurlMedia,
      });

      if (!result.ok) {
        throw new Error(`Failed to send message: ${result.error}`);
      }

      rateLimitManager.resetBackoff('slack', channelId);
      console.log(`[Slack] Sent message to ${channelId}`);
    }, channelId);
  }

  private async sendMessageInternal(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.app) return;

    // Acquire rate limit token
    const acquired = await rateLimitManager.acquireWithWait('slack', channelId);
    if (!acquired) {
      throw new Error('Rate limited');
    }

    // Build attachments if present
    const attachments = response.attachments && response.attachments.length > 0
      ? response.attachments.map(a => ({
          title: a.name,
          text: a.type === 'url' ? a.url : `[${a.type}: ${a.name}]`,
        }))
      : undefined;

    const result = await this.app.client.chat.postMessage({
      channel: channelId,
      text: response.content,
      thread_ts: context?.threadId,
      blocks: response.metadata?.blocks as KnownBlock[] | undefined,
      attachments,
    });

    if (!result.ok) {
      throw new Error(`Failed to send message: ${result.error}`);
    }

    rateLimitManager.resetBackoff('slack', channelId);
    console.log(`[Slack] Sent message to ${channelId}`);
  }

  private async sendResponse(
    response: ChannelResponse,
    channelId: string,
    threadTs: string | undefined,
    say: SayFn
  ): Promise<void> {
    // Create Block Kit blocks if we have a simple text response
    const blocks = this.createBlockKitBlocks({
      text: response.content,
    });

    await say({
      text: response.content,
      blocks: blocks as KnownBlock[],
      thread_ts: threadTs,
    });
  }

  // ============================================================================
  // Block Kit Support
  // ============================================================================

  /**
   * Create Block Kit blocks for rich message formatting
   */
  createBlockKitBlocks(options: SlackBlockKitOptions): (KnownBlock | Block)[] {
    const blocks: (KnownBlock | Block)[] = [];

    // Header section
    if (options.header) {
      blocks.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: options.header,
          emoji: true,
        },
      });

      if (options.dividers) {
        blocks.push({ type: 'divider' } as DividerBlock);
      }
    }

    // Main text section
    if (options.text) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: options.text,
        },
      } as SectionBlock);
    }

    // Fields section (key-value pairs)
    if (options.fields && options.fields.length > 0) {
      if (options.dividers && blocks.length > 0) {
        blocks.push({ type: 'divider' } as DividerBlock);
      }

      // Split fields into groups of 10 (Slack limit per section)
      for (let i = 0; i < options.fields.length; i += 10) {
        const fieldGroup = options.fields.slice(i, i + 10);
        blocks.push({
          type: 'section',
          fields: fieldGroup.map(f => ({
            type: 'mrkdwn',
            text: `*${f.label}*\n${f.value}`,
          })),
        } as SectionBlock);
      }
    }

    // Buttons section
    if (options.buttons && options.buttons.length > 0) {
      if (options.dividers && blocks.length > 0) {
        blocks.push({ type: 'divider' } as DividerBlock);
      }

      const buttonElements = options.buttons.map(btn => {
        const element = {
          type: 'button' as const,
          text: {
            type: 'plain_text' as const,
            text: btn.text,
            emoji: true,
          },
          action_id: `x2000_${btn.id}`,
          style: btn.style as 'primary' | 'danger' | undefined,
          url: btn.url,
          value: btn.url ? undefined : btn.value,
        };

        return element;
      });

      blocks.push({
        type: 'actions',
        elements: buttonElements,
      } as KnownBlock);
    }

    // Context (footer) section
    if (options.context) {
      if (options.dividers && blocks.length > 0) {
        blocks.push({ type: 'divider' } as DividerBlock);
      }

      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: options.context,
          },
        ],
      } as ContextBlock);
    }

    return blocks;
  }

  /**
   * Create a rich card response
   */
  createCardResponse(options: {
    title: string;
    description?: string;
    fields?: Array<{ label: string; value: string }>;
    buttons?: Array<{ id: string; text: string; style?: 'primary' | 'danger'; url?: string }>;
    footer?: string;
  }): ChannelResponse {
    const blocks = this.createBlockKitBlocks({
      header: options.title,
      text: options.description,
      fields: options.fields,
      buttons: options.buttons,
      context: options.footer,
      dividers: true,
    });

    return {
      content: options.title + (options.description ? `\n${options.description}` : ''),
      metadata: { blocks },
    };
  }

  // ============================================================================
  // Retry Logic with Exponential Backoff
  // ============================================================================

  private async sendWithRetry<T>(
    operation: () => Promise<T>,
    key: string,
    maxAttempts: number = 3
  ): Promise<T> {
    let state = this.retryState.get(key) || {
      attempt: 0,
      lastAttempt: 0,
      maxAttempts,
      baseDelayMs: 1000,
    };

    while (state.attempt < maxAttempts) {
      try {
        const result = await operation();
        // Success - reset retry state
        this.retryState.delete(key);
        return result;
      } catch (error) {
        state.attempt++;
        state.lastAttempt = Date.now();
        this.retryState.set(key, state);

        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          const retryAfter = this.extractRetryAfter(error);
          rateLimitManager.handleRateLimited('slack', retryAfter, key);

          if (state.attempt < maxAttempts) {
            const delay = retryAfter * 1000;
            console.log(`[Slack] Rate limited, retrying in ${delay}ms (attempt ${state.attempt}/${maxAttempts})`);
            await this.sleep(delay);
            continue;
          }
        }

        // Check if it's a retriable error
        if (this.isRetriableError(error) && state.attempt < maxAttempts) {
          const delay = state.baseDelayMs * Math.pow(2, state.attempt - 1);
          const jitter = Math.random() * delay * 0.2;
          const totalDelay = Math.min(delay + jitter, 30000);

          console.log(`[Slack] Retriable error, retrying in ${Math.round(totalDelay)}ms (attempt ${state.attempt}/${maxAttempts})`);
          await this.sleep(totalDelay);
          continue;
        }

        // Non-retriable error or max attempts reached
        this.retryState.delete(key);
        throw error;
      }
    }

    throw new Error(`Max retry attempts (${maxAttempts}) exceeded`);
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('rate_limited') ||
        message.includes('ratelimited') ||
        message.includes('too_many_requests') ||
        message.includes('429')
      );
    }
    return false;
  }

  private isRetriableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('econnreset') ||
        message.includes('service_unavailable') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')
      );
    }
    return false;
  }

  private extractRetryAfter(error: unknown): number {
    if (error instanceof Error) {
      // Try to extract retry_after from error message
      const match = error.message.match(/retry[_-]?after[:\s]+(\d+)/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return 1; // Default 1 second
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private isAllowed(channelId?: string, userId?: string): boolean {
    // Check channel allowlist
    if (this.allowedChannels && channelId && !this.allowedChannels.includes(channelId)) {
      return false;
    }

    // Check user allowlist
    if (this.allowedUsers && userId && !this.allowedUsers.includes(userId)) {
      return false;
    }

    return true;
  }

  private createChannelMessage(event: SlackEvent | AppMentionEvent): ChannelMessage {
    const files = (event as SlackEvent).files;
    return {
      id: event.ts || uuidv4(),
      channelType: this.type,
      channelId: event.channel || 'unknown',
      userId: event.user || 'unknown',
      content: this.cleanMessage(event.text || ''),
      timestamp: event.ts ? new Date(parseFloat(event.ts) * 1000) : new Date(),
      threadId: event.thread_ts,
      metadata: {
        teamId: this.teamId,
      },
      attachments: files?.filter(f => f.name).map(f => ({
        type: 'file' as const,
        name: f.name || 'unknown',
        url: f.url_private,
        mimeType: f.mimetype,
      })),
    };
  }

  /**
   * Clean message text (remove bot mention, format links, etc.)
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
   * Process an incoming Slack event (for manual webhook handling)
   */
  async handleEvent(event: SlackEvent): Promise<ChannelResponse | null> {
    // Ignore bot's own messages
    if (event.user === this.botUserId) {
      return null;
    }

    // Check allowlists
    if (!this.isAllowed(event.channel, event.user)) {
      return null;
    }

    // Check mention requirement
    if (this.mentionOnly && event.text && this.botUserId) {
      if (!event.text.includes(`<@${this.botUserId}>`)) {
        return null;
      }
    }

    const message = this.createChannelMessage(event);
    return this.processMessage(message);
  }

  // ============================================================================
  // User and Channel Info
  // ============================================================================

  /**
   * Get user info
   */
  async getUserInfo(userId: string): Promise<{
    name: string;
    realName: string;
    email?: string;
    isAdmin?: boolean;
    isOwner?: boolean;
  } | null> {
    if (!this.connected || !this.app) return null;

    try {
      const result = await this.app.client.users.info({ user: userId });

      if (!result.ok || !result.user) return null;

      const user = result.user as {
        name: string;
        real_name: string;
        is_admin?: boolean;
        is_owner?: boolean;
        profile?: { email?: string };
      };

      return {
        name: user.name,
        realName: user.real_name,
        email: user.profile?.email,
        isAdmin: user.is_admin,
        isOwner: user.is_owner,
      };
    } catch (error) {
      console.error('[Slack] Failed to get user info:', error);
      return null;
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(channelId: string): Promise<{
    name: string;
    isPrivate: boolean;
    isDM: boolean;
    memberCount?: number;
    topic?: string;
  } | null> {
    if (!this.connected || !this.app) return null;

    try {
      const result = await this.app.client.conversations.info({ channel: channelId });

      if (!result.ok || !result.channel) return null;

      const channel = result.channel as {
        name: string;
        is_private: boolean;
        is_im: boolean;
        num_members?: number;
        topic?: { value: string };
      };

      return {
        name: channel.name,
        isPrivate: channel.is_private,
        isDM: channel.is_im,
        memberCount: channel.num_members,
        topic: channel.topic?.value,
      };
    } catch (error) {
      console.error('[Slack] Failed to get channel info:', error);
      return null;
    }
  }

  /**
   * List channels the bot is a member of
   */
  async listChannels(): Promise<Array<{ id: string; name: string; isPrivate: boolean }>> {
    if (!this.connected || !this.app) return [];

    try {
      const result = await this.app.client.conversations.list({
        types: 'public_channel,private_channel',
        exclude_archived: true,
      });

      if (!result.ok || !result.channels) return [];

      return (result.channels as Array<{ id: string; name: string; is_private: boolean }>)
        .map(c => ({
          id: c.id,
          name: c.name,
          isPrivate: c.is_private,
        }));
    } catch (error) {
      console.error('[Slack] Failed to list channels:', error);
      return [];
    }
  }

  // ============================================================================
  // Reactions
  // ============================================================================

  /**
   * Add a reaction to a message
   */
  async addReaction(channelId: string, timestamp: string, emoji: string): Promise<boolean> {
    if (!this.connected || !this.app) return false;

    try {
      // Remove colons if present
      const cleanEmoji = emoji.replace(/:/g, '');

      const result = await this.app.client.reactions.add({
        channel: channelId,
        timestamp,
        name: cleanEmoji,
      });

      return result.ok === true;
    } catch (error) {
      console.error('[Slack] Failed to add reaction:', error);
      return false;
    }
  }

  /**
   * Remove a reaction from a message
   */
  async removeReaction(channelId: string, timestamp: string, emoji: string): Promise<boolean> {
    if (!this.connected || !this.app) return false;

    try {
      const cleanEmoji = emoji.replace(/:/g, '');

      const result = await this.app.client.reactions.remove({
        channel: channelId,
        timestamp,
        name: cleanEmoji,
      });

      return result.ok === true;
    } catch (error) {
      console.error('[Slack] Failed to remove reaction:', error);
      return false;
    }
  }

  // ============================================================================
  // Thread Management
  // ============================================================================

  /**
   * Get thread replies
   */
  async getThreadReplies(channelId: string, threadTs: string): Promise<ChannelMessage[]> {
    if (!this.connected || !this.app) return [];

    try {
      const result = await this.app.client.conversations.replies({
        channel: channelId,
        ts: threadTs,
      });

      if (!result.ok || !result.messages) return [];

      return (result.messages as Array<{
        ts: string;
        user?: string;
        text?: string;
        thread_ts?: string;
        files?: Array<{ name: string; url_private: string; mimetype: string }>;
      }>)
        .filter(m => m.ts !== threadTs) // Exclude parent message
        .map(m => this.createChannelMessage({
          type: 'message',
          ts: m.ts,
          user: m.user,
          text: m.text,
          channel: channelId,
          thread_ts: m.thread_ts,
          files: m.files,
        }));
    } catch (error) {
      console.error('[Slack] Failed to get thread replies:', error);
      return [];
    }
  }

  // ============================================================================
  // Message Editing and Deletion
  // ============================================================================

  /**
   * Update (edit) a message
   */
  async updateMessage(
    channelId: string,
    timestamp: string,
    newContent: string,
    blocks?: SlackBlockKitOptions
  ): Promise<boolean> {
    if (!this.connected || !this.app) return false;

    try {
      const result = await this.app.client.chat.update({
        channel: channelId,
        ts: timestamp,
        text: newContent,
        blocks: blocks ? this.createBlockKitBlocks(blocks) as KnownBlock[] : undefined,
      });
      return result.ok === true;
    } catch (error) {
      console.error('[Slack] Failed to update message:', error);
      return false;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(channelId: string, timestamp: string): Promise<boolean> {
    if (!this.connected || !this.app) return false;

    try {
      const result = await this.app.client.chat.delete({
        channel: channelId,
        ts: timestamp,
      });

      return result.ok === true;
    } catch (error) {
      console.error('[Slack] Failed to delete message:', error);
      return false;
    }
  }

  // ============================================================================
  // Bot Info
  // ============================================================================

  /**
   * Get the bot's user ID
   */
  getBotUserId(): string | null {
    return this.botUserId;
  }

  /**
   * Get the team ID
   */
  getTeamId(): string | null {
    return this.teamId;
  }

  /**
   * Check if the channel is using Socket Mode
   */
  isSocketMode(): boolean {
    return this.socketMode;
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
