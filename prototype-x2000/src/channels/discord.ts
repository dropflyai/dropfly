/**
 * Discord Channel - Full Implementation
 *
 * Enables X2000 communication via Discord using discord.js.
 * Features:
 * - Real-time WebSocket connection via Discord Gateway
 * - Slash commands (/x2000, /help, /status)
 * - Rich embeds for formatted responses
 * - Message handling (text, reactions)
 * - DM and server message support
 * - Guild and channel management
 * - Rate limiting per Discord's rules
 * - Error handling with retry logic
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  Message,
  ChatInputCommandInteraction,
  ChannelType,
  type TextChannel,
  type DMChannel,
  type Guild,
  type Interaction,
  type User,
  type APIApplicationCommand,
} from 'discord.js';
import {
  BaseChannel,
  ChannelRegistry,
  type ChannelConfig,
  type ChannelMessage,
  type ChannelResponse,
  type ChannelContext,
} from './base.js';
import { rateLimitManager } from './rate-limiter.js';
import type { BrainType } from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

export interface DiscordChannelConfig extends Partial<ChannelConfig> {
  /** Bot token from Discord Developer Portal */
  botToken?: string;
  /** Application ID (Client ID) from Discord Developer Portal */
  applicationId?: string;
  /** Guild IDs where commands should be registered (empty = global) */
  guildIds?: string[];
  /** Allowed guild IDs (null = all) */
  allowedGuilds?: string[];
  /** Allowed channel IDs (null = all) */
  allowedChannels?: string[];
  /** Allowed user IDs (null = all) */
  allowedUsers?: string[];
  /** Only respond when mentioned (default: true for servers, false for DMs) */
  mentionOnly?: boolean;
  /** Enable slash commands (default: true) */
  enableSlashCommands?: boolean;
  /** Custom command prefix for text commands (default: none, use slash commands) */
  commandPrefix?: string;
  /** Enable reaction handling */
  enableReactions?: boolean;
  /** Maximum retries for failed operations */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelayMs?: number;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
  thumbnail?: { url: string };
  image?: { url: string };
  author?: { name: string; icon_url?: string; url?: string };
}

// ============================================================================
// Slash Command Definitions
// ============================================================================

const SLASH_COMMANDS = [
  new SlashCommandBuilder()
    .setName('x2000')
    .setDescription('Send a message to X2000 AI')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Your message to X2000')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('brain')
        .setDescription('Which brain to route to (optional)')
        .setRequired(false)
        .addChoices(
          { name: 'CEO (Orchestrator)', value: 'ceo' },
          { name: 'Engineering', value: 'engineering' },
          { name: 'Product', value: 'product' },
          { name: 'Research', value: 'research' },
          { name: 'Design', value: 'design' },
          { name: 'Marketing', value: 'marketing' },
          { name: 'Finance', value: 'finance' },
          { name: 'Sales', value: 'sales' },
          { name: 'QA', value: 'qa' }
        )
    ),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with X2000 commands'),
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check X2000 system status'),
];

// ============================================================================
// Discord Channel Implementation
// ============================================================================

export class DiscordChannel extends BaseChannel {
  readonly type = 'discord';
  readonly name = 'Discord';

  // Discord.js client
  private client: Client | null = null;
  private rest: REST | null = null;

  // Configuration
  private botToken: string | null;
  private applicationId: string | null;
  private guildIds: string[];
  private allowedGuilds: string[] | null;
  private allowedChannels: string[] | null;
  private allowedUsers: string[] | null;
  private mentionOnly: boolean;
  private enableSlashCommands: boolean;
  private commandPrefix: string | null;
  private enableReactions: boolean;
  private maxRetries: number;
  private retryDelayMs: number;

  // State
  private botUserId: string | null = null;
  private isReady: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: DiscordChannelConfig = {}) {
    super(config);
    this.initializeConfig();

    this.botToken = config.botToken || process.env.DISCORD_BOT_TOKEN || null;
    this.applicationId = config.applicationId || process.env.DISCORD_APPLICATION_ID || null;
    this.guildIds = config.guildIds || (process.env.DISCORD_GUILD_IDS?.split(',').filter(Boolean) ?? []);
    this.allowedGuilds = config.allowedGuilds || null;
    this.allowedChannels = config.allowedChannels || null;
    this.allowedUsers = config.allowedUsers || null;
    this.mentionOnly = config.mentionOnly ?? true;
    this.enableSlashCommands = config.enableSlashCommands ?? true;
    this.commandPrefix = config.commandPrefix || null;
    this.enableReactions = config.enableReactions ?? false;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  /**
   * Initialize Discord connection and register slash commands
   */
  async initialize(): Promise<void> {
    if (!this.botToken) {
      console.warn('[Discord] No bot token configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    if (!this.applicationId) {
      console.warn('[Discord] No application ID configured, slash commands disabled');
      this.enableSlashCommands = false;
    }

    try {
      // Create Discord client with required intents
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildMessageReactions,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.DirectMessageReactions,
          GatewayIntentBits.MessageContent,
        ],
      });

      // Create REST client for API calls
      this.rest = new REST({ version: '10' }).setToken(this.botToken);

      // Set up event handlers
      this.setupEventHandlers();

      // Login to Discord
      await this.client.login(this.botToken);

      // Wait for ready event
      await this.waitForReady();

      // Register slash commands
      if (this.enableSlashCommands && this.applicationId) {
        await this.registerSlashCommands();
      }

      this.connected = true;
      console.log(`[Discord] Initialized and ready`);
    } catch (error) {
      console.error('[Discord] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Wait for the client to be ready
   */
  private waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isReady) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Discord client ready timeout'));
      }, 30000);

      this.client?.once(Events.ClientReady, () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  /**
   * Set up Discord event handlers
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    // Ready event
    this.client.once(Events.ClientReady, (readyClient) => {
      this.botUserId = readyClient.user.id;
      this.isReady = true;
      this.reconnectAttempts = 0;
      console.log(`[Discord] Connected as ${readyClient.user.tag} (${this.botUserId})`);
      console.log(`[Discord] Serving ${readyClient.guilds.cache.size} guilds`);
    });

    // Message event
    this.client.on(Events.MessageCreate, async (message) => {
      try {
        await this.handleMessage(message);
      } catch (error) {
        console.error('[Discord] Error handling message:', error);
      }
    });

    // Interaction event (slash commands)
    this.client.on(Events.InteractionCreate, async (interaction) => {
      try {
        await this.handleInteraction(interaction);
      } catch (error) {
        console.error('[Discord] Error handling interaction:', error);
      }
    });

    // Reaction events
    if (this.enableReactions) {
      this.client.on(Events.MessageReactionAdd, async (reaction, user) => {
        if (user.bot) return;
        console.log(`[Discord] Reaction added: ${reaction.emoji.name} by ${user.tag}`);
        // Custom reaction handling can be added here
      });
    }

    // Error handling
    this.client.on(Events.Error, (error) => {
      console.error('[Discord] Client error:', error);
    });

    // Disconnect handling
    this.client.on(Events.ShardDisconnect, (event, shardId) => {
      console.warn(`[Discord] Shard ${shardId} disconnected:`, event);
      this.connected = false;
    });

    // Reconnect handling
    this.client.on(Events.ShardReconnecting, (shardId) => {
      console.log(`[Discord] Shard ${shardId} reconnecting...`);
    });

    this.client.on(Events.ShardResume, (shardId) => {
      console.log(`[Discord] Shard ${shardId} resumed`);
      this.connected = true;
    });
  }

  /**
   * Register slash commands with Discord
   */
  private async registerSlashCommands(): Promise<void> {
    if (!this.rest || !this.applicationId) return;

    const commands = SLASH_COMMANDS.map((cmd) => cmd.toJSON());

    try {
      console.log(`[Discord] Registering ${commands.length} slash commands...`);

      if (this.guildIds.length > 0) {
        // Register to specific guilds (instant update)
        for (const guildId of this.guildIds) {
          await this.rest.put(
            Routes.applicationGuildCommands(this.applicationId, guildId),
            { body: commands }
          );
          console.log(`[Discord] Registered commands to guild ${guildId}`);
        }
      } else {
        // Register globally (may take up to 1 hour to propagate)
        await this.rest.put(Routes.applicationCommands(this.applicationId), {
          body: commands,
        });
        console.log('[Discord] Registered global commands');
      }
    } catch (error) {
      console.error('[Discord] Failed to register slash commands:', error);
      throw error;
    }
  }

  /**
   * Shutdown Discord connection
   */
  async shutdown(): Promise<void> {
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }
    this.rest = null;
    this.connected = false;
    this.isReady = false;
    console.log('[Discord] Disconnected');
  }

  /**
   * Start the Discord channel (alias for initialize)
   */
  async start(): Promise<void> {
    await this.initialize();
  }

  /**
   * Stop the Discord channel (alias for shutdown)
   */
  async stop(): Promise<void> {
    await this.shutdown();
  }

  // ============================================================================
  // Message Handling
  // ============================================================================

  /**
   * Handle incoming Discord message
   */
  private async handleMessage(message: Message): Promise<void> {
    // Ignore bot messages
    if (message.author.bot || message.author.id === this.botUserId) {
      return;
    }

    // Check guild allowlist
    if (this.allowedGuilds && message.guild && !this.allowedGuilds.includes(message.guild.id)) {
      return;
    }

    // Check channel allowlist
    if (this.allowedChannels && !this.allowedChannels.includes(message.channel.id)) {
      return;
    }

    // Check user allowlist
    if (this.allowedUsers && !this.allowedUsers.includes(message.author.id)) {
      return;
    }

    // Check mention requirement (for server messages, not DMs)
    const isDM = message.channel.type === ChannelType.DM;
    if (!isDM && this.mentionOnly && this.botUserId) {
      if (!message.mentions.users.has(this.botUserId)) {
        return;
      }
    }

    // Check command prefix
    if (this.commandPrefix && message.content.startsWith(this.commandPrefix)) {
      await this.handleTextCommand(message);
      return;
    }

    // Acquire rate limit token
    const rateLimitKey = `channel:${message.channel.id}`;
    const canProceed = await rateLimitManager.acquireWithWait('discord', rateLimitKey, 5000);
    if (!canProceed) {
      console.warn('[Discord] Rate limited, skipping message');
      return;
    }

    // Create channel message
    const channelMessage: ChannelMessage = {
      id: message.id,
      channelType: this.type,
      channelId: message.channel.id,
      userId: message.author.id,
      content: this.cleanMessage(message.content),
      timestamp: message.createdAt,
      threadId: message.reference?.messageId || undefined,
      metadata: {
        guildId: message.guild?.id,
        messageId: message.id,
        username: message.author.username,
        discriminator: message.author.discriminator,
        isDM,
      },
      attachments: message.attachments.map((a) => ({
        type: 'file' as const,
        name: a.name,
        url: a.url,
        mimeType: a.contentType || undefined,
      })),
    };

    // Process message and send response
    const response = await this.processMessage(channelMessage);
    if (response) {
      await this.sendMessageToChannel(message.channel.id, response, {
        replyToId: message.id,
        threadId: message.reference?.messageId,
      });
    }
  }

  /**
   * Handle text command (with prefix)
   */
  private async handleTextCommand(message: Message): Promise<void> {
    if (!this.commandPrefix) return;

    const content = message.content.slice(this.commandPrefix.length).trim();
    const [command, ...args] = content.split(/\s+/);

    switch (command.toLowerCase()) {
      case 'help':
        await this.sendHelpMessage(message.channel.id, message.id);
        break;
      case 'status':
        await this.sendStatusMessage(message.channel.id, message.id);
        break;
      default:
        // Treat as X2000 message
        const channelMessage: ChannelMessage = {
          id: message.id,
          channelType: this.type,
          channelId: message.channel.id,
          userId: message.author.id,
          content: content,
          timestamp: message.createdAt,
          metadata: {
            guildId: message.guild?.id,
            messageId: message.id,
            username: message.author.username,
          },
        };

        const response = await this.processMessage(channelMessage);
        if (response) {
          await this.sendMessageToChannel(message.channel.id, response, {
            replyToId: message.id,
          });
        }
    }
  }

  /**
   * Handle slash command interaction
   */
  private async handleInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    // Check guild allowlist
    if (this.allowedGuilds && interaction.guild && !this.allowedGuilds.includes(interaction.guild.id)) {
      await interaction.reply({
        content: 'This bot is not available in this server.',
        ephemeral: true,
      });
      return;
    }

    // Check user allowlist
    if (this.allowedUsers && !this.allowedUsers.includes(interaction.user.id)) {
      await interaction.reply({
        content: 'You are not authorized to use this bot.',
        ephemeral: true,
      });
      return;
    }

    switch (interaction.commandName) {
      case 'x2000':
        await this.handleX2000Command(interaction);
        break;
      case 'help':
        await this.handleHelpCommand(interaction);
        break;
      case 'status':
        await this.handleStatusCommand(interaction);
        break;
    }
  }

  /**
   * Handle /x2000 slash command
   */
  private async handleX2000Command(interaction: ChatInputCommandInteraction): Promise<void> {
    const userMessage = interaction.options.getString('message', true);
    const brainOption = interaction.options.getString('brain');

    // Defer reply for long-running operations
    await interaction.deferReply();

    // Acquire rate limit token
    const rateLimitKey = `user:${interaction.user.id}`;
    const canProceed = await rateLimitManager.acquireWithWait('discord', rateLimitKey, 5000);
    if (!canProceed) {
      await interaction.editReply('Rate limited. Please try again in a moment.');
      return;
    }

    // Create channel message
    const channelMessage: ChannelMessage = {
      id: interaction.id,
      channelType: this.type,
      channelId: interaction.channelId,
      userId: interaction.user.id,
      content: userMessage,
      timestamp: new Date(),
      metadata: {
        guildId: interaction.guild?.id,
        interactionId: interaction.id,
        username: interaction.user.username,
        targetBrain: brainOption,
        isSlashCommand: true,
      },
    };

    // Process and respond
    try {
      const response = await this.processMessage(channelMessage);
      if (response) {
        const embed = this.createResponseEmbed(response, brainOption as BrainType | null);
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply('No response received.');
      }
    } catch (error) {
      console.error('[Discord] Error processing /x2000 command:', error);
      await interaction.editReply('An error occurred while processing your request.');
    }
  }

  /**
   * Handle /help slash command
   */
  private async handleHelpCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('X2000 Help')
      .setDescription('X2000 is an autonomous AI fleet with 44 specialized brains.')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '/x2000 <message>',
          value: 'Send a message to X2000. Optionally specify a brain to route to.',
          inline: false,
        },
        {
          name: '/help',
          value: 'Show this help message.',
          inline: false,
        },
        {
          name: '/status',
          value: 'Check X2000 system status.',
          inline: false,
        },
        {
          name: 'Direct Mention',
          value: 'You can also mention the bot directly to chat with it.',
          inline: false,
        }
      )
      .setFooter({ text: 'X2000 - Building billion-dollar businesses, autonomously.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  /**
   * Handle /status slash command
   */
  private async handleStatusCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const uptime = this.client?.uptime
      ? Math.floor(this.client.uptime / 1000)
      : 0;
    const uptimeStr = this.formatUptime(uptime);
    const guilds = this.client?.guilds.cache.size ?? 0;
    const channels = this.client?.channels.cache.size ?? 0;

    const embed = new EmbedBuilder()
      .setTitle('X2000 Status')
      .setColor(this.connected ? 0x57f287 : 0xed4245)
      .addFields(
        { name: 'Status', value: this.connected ? 'Online' : 'Offline', inline: true },
        { name: 'Uptime', value: uptimeStr, inline: true },
        { name: 'Guilds', value: guilds.toString(), inline: true },
        { name: 'Channels', value: channels.toString(), inline: true },
        { name: 'Bot ID', value: this.botUserId || 'N/A', inline: true },
        { name: 'Ping', value: `${this.client?.ws.ping ?? 0}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  // ============================================================================
  // Outbound Messaging
  // ============================================================================

  /**
   * Send a message to a Discord channel (BaseChannel interface)
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    await this.sendMessageToChannel(channelId, response, {
      replyToId: context?.metadata?.messageId as string | undefined,
      threadId: context?.threadId,
    });
  }

  /**
   * Send a message to a channel with retry logic
   */
  async sendMessage(
    channelId: string,
    content: string | ChannelResponse
  ): Promise<void> {
    const response: ChannelResponse =
      typeof content === 'string' ? { content } : content;
    await this.sendMessageToChannel(channelId, response);
  }

  /**
   * Internal method to send message to Discord channel
   */
  private async sendMessageToChannel(
    channelId: string,
    response: ChannelResponse,
    options?: { replyToId?: string; threadId?: string }
  ): Promise<void> {
    if (!this.client || !this.connected) {
      throw new Error('Discord channel not connected');
    }

    // Acquire rate limit
    const rateLimitKey = `channel:${channelId}`;
    const canProceed = await rateLimitManager.acquireWithWait('discord', rateLimitKey, 5000);
    if (!canProceed) {
      throw new Error('Rate limited');
    }

    let retries = 0;
    let lastError: Error | null = null;

    while (retries < this.maxRetries) {
      try {
        const channel = await this.client.channels.fetch(channelId);
        if (!channel || !('send' in channel)) {
          throw new Error(`Channel ${channelId} not found or not text-based`);
        }

        const textChannel = channel as TextChannel | DMChannel;

        // Build message payload
        const messageOptions: {
          content?: string;
          embeds?: EmbedBuilder[];
          reply?: { messageReference: string };
        } = {};

        // Check if response has rich content for embed
        if (response.metadata?.useEmbed || response.attachments?.length) {
          const embed = this.createResponseEmbed(response);
          messageOptions.embeds = [embed];
        } else {
          messageOptions.content = this.formatMessage(response.content);
        }

        // Reply to message if specified
        if (options?.replyToId) {
          messageOptions.reply = { messageReference: options.replyToId };
        }

        await textChannel.send(messageOptions);
        rateLimitManager.resetBackoff('discord', rateLimitKey);
        console.log(`[Discord] Sent message to ${channelId}`);
        return;
      } catch (error) {
        lastError = error as Error;
        retries++;

        // Check for rate limit error
        if (this.isRateLimitError(error)) {
          const retryAfter = this.extractRetryAfter(error);
          rateLimitManager.handleRateLimited('discord', retryAfter, rateLimitKey);
          await this.sleep(retryAfter * 1000);
        } else if (retries < this.maxRetries) {
          await this.sleep(this.retryDelayMs * retries);
        }
      }
    }

    throw new Error(`Failed to send message after ${this.maxRetries} retries: ${lastError?.message}`);
  }

  /**
   * Send help message to a channel
   */
  private async sendHelpMessage(channelId: string, replyToId: string): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('X2000 Help')
      .setDescription('X2000 is an autonomous AI fleet with 44 specialized brains.')
      .setColor(0x5865f2)
      .addFields(
        { name: 'Mention', value: 'Mention me to chat!', inline: false },
        { name: 'Commands', value: 'Use /x2000, /help, or /status', inline: false }
      );

    await this.sendMessageToChannel(
      channelId,
      { content: '', metadata: { useEmbed: true, embed } },
      { replyToId }
    );
  }

  /**
   * Send status message to a channel
   */
  private async sendStatusMessage(channelId: string, replyToId: string): Promise<void> {
    const response: ChannelResponse = {
      content: `**X2000 Status**\nStatus: ${this.connected ? 'Online' : 'Offline'}\nPing: ${this.client?.ws.ping ?? 0}ms`,
    };
    await this.sendMessageToChannel(channelId, response, { replyToId });
  }

  // ============================================================================
  // Embed Builders
  // ============================================================================

  /**
   * Create a Discord embed from a response
   */
  private createResponseEmbed(
    response: ChannelResponse,
    brain?: BrainType | null
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTimestamp();

    // Set description (main content)
    if (response.content) {
      const truncated = this.formatMessage(response.content, 4096);
      embed.setDescription(truncated);
    }

    // Add brain info if specified
    if (brain) {
      embed.setFooter({ text: `Processed by: ${brain} brain` });
    }

    // Add attachments as fields
    if (response.attachments && response.attachments.length > 0) {
      for (const attachment of response.attachments) {
        if (attachment.type === 'url' && attachment.url) {
          embed.addFields({
            name: attachment.name,
            value: attachment.url,
            inline: false,
          });
        } else if (attachment.type === 'image' && attachment.url) {
          embed.setImage(attachment.url);
        }
      }
    }

    return embed;
  }

  /**
   * Create a custom embed
   */
  createEmbed(options: DiscordEmbed): EmbedBuilder {
    const embed = new EmbedBuilder();

    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.color) embed.setColor(options.color);
    if (options.footer) embed.setFooter(options.footer);
    if (options.timestamp) embed.setTimestamp(new Date(options.timestamp));
    if (options.thumbnail) embed.setThumbnail(options.thumbnail.url);
    if (options.image) embed.setImage(options.image.url);
    if (options.author) embed.setAuthor(options.author);

    if (options.fields) {
      for (const field of options.fields) {
        embed.addFields({
          name: field.name,
          value: field.value,
          inline: field.inline ?? false,
        });
      }
    }

    return embed;
  }

  /**
   * Send an embed to a channel
   */
  async sendEmbed(channelId: string, embed: EmbedBuilder): Promise<void> {
    if (!this.client || !this.connected) {
      throw new Error('Discord channel not connected');
    }

    const channel = await this.client.channels.fetch(channelId);
    if (!channel || !('send' in channel)) {
      throw new Error(`Channel ${channelId} not found or not text-based`);
    }

    await (channel as TextChannel | DMChannel).send({ embeds: [embed] });
  }

  // ============================================================================
  // Guild and Channel Management
  // ============================================================================

  /**
   * Get all guilds the bot is in
   */
  getGuilds(): Guild[] {
    if (!this.client) return [];
    return Array.from(this.client.guilds.cache.values());
  }

  /**
   * Get a specific guild
   */
  async getGuild(guildId: string): Promise<Guild | null> {
    if (!this.client) return null;
    try {
      return await this.client.guilds.fetch(guildId);
    } catch {
      return null;
    }
  }

  /**
   * Get channels in a guild
   */
  async getGuildChannels(guildId: string): Promise<TextChannel[]> {
    const guild = await this.getGuild(guildId);
    if (!guild) return [];

    const channels = await guild.channels.fetch();
    return channels.filter(
      (c): c is TextChannel => c?.type === ChannelType.GuildText
    ) as unknown as TextChannel[];
  }

  /**
   * Get user info
   */
  async getUserInfo(userId: string): Promise<User | null> {
    if (!this.client) return null;
    try {
      return await this.client.users.fetch(userId);
    } catch {
      return null;
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(channelId: string): Promise<{
    name: string;
    type: ChannelType;
    guildId?: string;
  } | null> {
    if (!this.client) return null;
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) return null;

      return {
        name: 'name' in channel ? channel.name ?? 'DM' : 'DM',
        type: channel.type,
        guildId: 'guild' in channel ? channel.guild?.id : undefined,
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
    if (!this.client) return null;

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !('messages' in channel)) return null;

      const message = await (channel as TextChannel).messages.fetch(messageId);
      const thread = await message.startThread({
        name,
        autoArchiveDuration: 60, // 1 hour
      });

      return thread.id;
    } catch (error) {
      console.error('[Discord] Failed to create thread:', error);
      return null;
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

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
  private formatMessage(text: string, maxLength: number = 2000): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Truncate with ellipsis
    return text.substring(0, maxLength - 20) + '\n\n... [truncated]';
  }

  /**
   * Format uptime in human readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Check if error is a rate limit error
   */
  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('rate limit') ||
        message.includes('too many requests') ||
        message.includes('429')
      );
    }
    return false;
  }

  /**
   * Extract retry-after value from error
   */
  private extractRetryAfter(error: unknown): number {
    if (error instanceof Error) {
      const match = error.message.match(/retry.?after[:\s]+(\d+)/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return 1; // Default 1 second
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

// Discord capabilities
export const DISCORD_CAPABILITIES = {
  supportsMarkdown: true,
  supportsHTML: false,
  supportsRichText: true,
  maxMessageLength: 2000,
  supportsThreads: true,
  supportsReplies: true,
  supportsFiles: true,
  supportsImages: true,
  supportsVoice: false,
  supportsVideo: false,
  supportsLocation: false,
  maxAttachmentSize: 8 * 1024 * 1024, // 8MB for non-boosted servers
  supportsReactions: true,
  supportsButtons: true,
  supportsCards: true,
  supportsTypingIndicator: true,
  supportsReadReceipts: false,
  supportsMessageEdit: true,
  supportsMessageDelete: true,
  supportsE2EEncryption: false,
  supportsDisappearingMessages: false,
};
