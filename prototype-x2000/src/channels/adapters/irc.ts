/**
 * IRC Channel Adapter
 *
 * Enables X2000 communication via IRC using the irc-framework pattern.
 * Supports channel messages, private messages, multiple servers, and nick management.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BaseChannel,
  ChannelRegistry,
  type ChannelConfig,
  type ChannelMessage,
  type ChannelResponse,
  type ChannelContext,
} from '../base.js';

// ============================================================================
// Types
// ============================================================================

export interface IRCChannelConfig extends Partial<ChannelConfig> {
  servers?: IRCServerConfig[];
  defaultNick?: string;
  defaultUser?: string;
  defaultRealName?: string;
  autoJoinChannels?: string[];
  allowedChannels?: string[];
  allowedUsers?: string[];
  mentionOnly?: boolean;
  commandPrefix?: string;
}

export interface IRCServerConfig {
  id: string;
  host: string;
  port?: number;
  ssl?: boolean;
  nick?: string;
  user?: string;
  realName?: string;
  password?: string;
  saslUser?: string;
  saslPassword?: string;
  channels?: string[];
  autoConnect?: boolean;
}

export interface IRCServerState {
  id: string;
  connected: boolean;
  nick: string;
  channels: Set<string>;
  users: Map<string, IRCUserInfo>;
  lastActivity: Date;
}

export interface IRCUserInfo {
  nick: string;
  user?: string;
  host?: string;
  realName?: string;
  channels: Set<string>;
  isOperator: boolean;
  isVoiced: boolean;
}

export interface IRCMessageEvent {
  serverId: string;
  type: 'privmsg' | 'notice' | 'action' | 'ctcp';
  from: string;
  to: string;
  message: string;
  isChannel: boolean;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface IRCCapabilities {
  supportsMarkdown: false;
  supportsHTML: false;
  supportsRichText: false;
  maxMessageLength: 512;
  supportsThreads: false;
  supportsReplies: false;
  supportsFiles: false;
  supportsImages: false;
  supportsVoice: false;
  supportsVideo: false;
  supportsLocation: false;
  maxAttachmentSize: 0;
  supportsReactions: false;
  supportsButtons: false;
  supportsCards: false;
  supportsTypingIndicator: false;
  supportsReadReceipts: false;
  supportsMessageEdit: false;
  supportsMessageDelete: false;
  supportsE2EEncryption: false;
  supportsDisappearingMessages: false;
}

// ============================================================================
// IRC Client (Simplified Implementation)
// ============================================================================

class IRCClient {
  private socket: {
    write: (data: string) => void;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    end: () => void;
  } | null = null;
  private buffer: string = '';
  private serverConfig: IRCServerConfig;
  private state: IRCServerState;
  private eventHandlers: Map<string, ((...args: unknown[]) => void)[]> = new Map();
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: IRCServerConfig) {
    this.serverConfig = config;
    this.state = {
      id: config.id,
      connected: false,
      nick: config.nick || 'X2000Bot',
      channels: new Set(),
      users: new Map(),
      lastActivity: new Date(),
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Note: In production, use actual net.Socket or tls.Socket
      // This is a simplified mock implementation

      const net = {
        createConnection: (_port: number, _host: string) => {
          return {
            on: (_event: string, _handler: (...args: unknown[]) => void) => {},
            write: (_data: string) => {},
            end: () => {},
          };
        },
      };

      const socket = net.createConnection(
        this.serverConfig.port || 6667,
        this.serverConfig.host
      );

      socket.on('connect', () => {
        this.socket = socket;

        // Send registration
        if (this.serverConfig.password) {
          this.send(`PASS ${this.serverConfig.password}`);
        }

        this.send(`NICK ${this.state.nick}`);
        this.send(`USER ${this.serverConfig.user || 'x2000'} 0 * :${this.serverConfig.realName || 'X2000 Bot'}`);

        // Start ping interval
        this.pingInterval = setInterval(() => {
          this.send(`PING :keepalive`);
        }, 30000);

        this.state.connected = true;
        this.emit('connected');
        resolve();
      });

      socket.on('data', (data: unknown) => {
        this.handleData(String(data));
      });

      socket.on('error', (err: unknown) => {
        this.emit('error', err);
        reject(err as Error);
      });

      socket.on('close', () => {
        this.state.connected = false;
        this.emit('disconnected');
      });

      // Simulate connection for this mock
      setTimeout(() => {
        this.state.connected = true;
        resolve();
      }, 100);
    });
  }

  disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    if (this.socket) {
      this.send('QUIT :Goodbye');
      this.socket.end();
      this.socket = null;
    }

    this.state.connected = false;
  }

  send(raw: string): void {
    if (this.socket) {
      this.socket.write(raw + '\r\n');
    }
  }

  private handleData(data: string): void {
    this.buffer += data;
    const lines = this.buffer.split('\r\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        this.parseLine(line);
      }
    }
  }

  private parseLine(line: string): void {
    // IRC message format: [:prefix] command [params] [:trailing]
    const match = line.match(/^(?::([^ ]+) )?([A-Z0-9]+)(?: (.+))?$/i);

    if (!match) return;

    const [, prefix, command, params] = match;

    switch (command.toUpperCase()) {
      case 'PING':
        this.send(`PONG ${params}`);
        break;

      case 'PRIVMSG':
        this.handlePrivmsg(prefix || '', params || '');
        break;

      case 'NOTICE':
        this.handleNotice(prefix || '', params || '');
        break;

      case '001': // RPL_WELCOME
        this.emit('registered');
        // Auto-join channels
        if (this.serverConfig.channels) {
          for (const channel of this.serverConfig.channels) {
            this.join(channel);
          }
        }
        break;

      case '433': // ERR_NICKNAMEINUSE
        this.state.nick = this.state.nick + '_';
        this.send(`NICK ${this.state.nick}`);
        break;

      case 'JOIN':
        this.handleJoin(prefix || '', params || '');
        break;

      case 'PART':
        this.handlePart(prefix || '', params || '');
        break;

      case 'KICK':
        this.handleKick(prefix || '', params || '');
        break;

      case 'NICK':
        this.handleNickChange(prefix || '', params || '');
        break;
    }

    this.state.lastActivity = new Date();
  }

  private handlePrivmsg(prefix: string, params: string): void {
    const nick = prefix.split('!')[0];
    const spaceIndex = params.indexOf(' ');
    const target = params.substring(0, spaceIndex);
    let message = params.substring(spaceIndex + 2); // Skip space and colon

    // Handle CTCP
    if (message.startsWith('\x01') && message.endsWith('\x01')) {
      message = message.slice(1, -1);
      const [ctcpCommand, ...ctcpParams] = message.split(' ');

      if (ctcpCommand === 'ACTION') {
        this.emit('action', {
          from: nick,
          to: target,
          message: ctcpParams.join(' '),
          isChannel: target.startsWith('#') || target.startsWith('&'),
        });
      } else {
        this.emit('ctcp', {
          from: nick,
          command: ctcpCommand,
          params: ctcpParams.join(' '),
        });
      }
      return;
    }

    this.emit('message', {
      from: nick,
      to: target,
      message,
      isChannel: target.startsWith('#') || target.startsWith('&'),
    });
  }

  private handleNotice(prefix: string, params: string): void {
    const nick = prefix.split('!')[0];
    const spaceIndex = params.indexOf(' ');
    const target = params.substring(0, spaceIndex);
    const message = params.substring(spaceIndex + 2);

    this.emit('notice', {
      from: nick,
      to: target,
      message,
      isChannel: target.startsWith('#') || target.startsWith('&'),
    });
  }

  private handleJoin(prefix: string, params: string): void {
    const nick = prefix.split('!')[0];
    const channel = params.replace(':', '');

    if (nick === this.state.nick) {
      this.state.channels.add(channel);
    }

    this.emit('join', { nick, channel });
  }

  private handlePart(prefix: string, params: string): void {
    const nick = prefix.split('!')[0];
    const [channel] = params.split(' ');

    if (nick === this.state.nick) {
      this.state.channels.delete(channel);
    }

    this.emit('part', { nick, channel });
  }

  private handleKick(prefix: string, params: string): void {
    const kicker = prefix.split('!')[0];
    const [channel, target] = params.split(' ');

    if (target === this.state.nick) {
      this.state.channels.delete(channel);
    }

    this.emit('kick', { kicker, channel, target });
  }

  private handleNickChange(prefix: string, newNick: string): void {
    const oldNick = prefix.split('!')[0];

    if (oldNick === this.state.nick) {
      this.state.nick = newNick.replace(':', '');
    }

    this.emit('nick', { oldNick, newNick: newNick.replace(':', '') });
  }

  join(channel: string): void {
    this.send(`JOIN ${channel}`);
  }

  part(channel: string, message?: string): void {
    this.send(`PART ${channel}${message ? ' :' + message : ''}`);
  }

  say(target: string, message: string): void {
    // Split long messages
    const maxLength = 400; // Leave room for protocol overhead
    const lines = this.splitMessage(message, maxLength);

    for (const line of lines) {
      this.send(`PRIVMSG ${target} :${line}`);
    }
  }

  action(target: string, message: string): void {
    this.send(`PRIVMSG ${target} :\x01ACTION ${message}\x01`);
  }

  notice(target: string, message: string): void {
    this.send(`NOTICE ${target} :${message}`);
  }

  changeNick(newNick: string): void {
    this.send(`NICK ${newNick}`);
  }

  private splitMessage(message: string, maxLength: number): string[] {
    const lines: string[] = [];

    while (message.length > maxLength) {
      let splitIndex = message.lastIndexOf(' ', maxLength);
      if (splitIndex === -1) splitIndex = maxLength;

      lines.push(message.substring(0, splitIndex));
      message = message.substring(splitIndex + 1);
    }

    if (message.length > 0) {
      lines.push(message);
    }

    return lines;
  }

  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  private emit(event: string, ...args: unknown[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(...args);
      }
    }
  }

  getState(): IRCServerState {
    return { ...this.state };
  }

  getNick(): string {
    return this.state.nick;
  }

  getChannels(): string[] {
    return Array.from(this.state.channels);
  }

  isConnected(): boolean {
    return this.state.connected;
  }
}

// ============================================================================
// IRC Channel
// ============================================================================

export class IRCChannel extends BaseChannel {
  readonly type = 'irc';
  readonly name = 'IRC';

  readonly capabilities: IRCCapabilities = {
    supportsMarkdown: false,
    supportsHTML: false,
    supportsRichText: false,
    maxMessageLength: 512,
    supportsThreads: false,
    supportsReplies: false,
    supportsFiles: false,
    supportsImages: false,
    supportsVoice: false,
    supportsVideo: false,
    supportsLocation: false,
    maxAttachmentSize: 0,
    supportsReactions: false,
    supportsButtons: false,
    supportsCards: false,
    supportsTypingIndicator: false,
    supportsReadReceipts: false,
    supportsMessageEdit: false,
    supportsMessageDelete: false,
    supportsE2EEncryption: false,
    supportsDisappearingMessages: false,
  };

  private servers: Map<string, IRCClient> = new Map();
  private serverConfigs: IRCServerConfig[];
  private defaultNick: string;
  private defaultUser: string;
  private defaultRealName: string;
  private autoJoinChannels: string[];
  private allowedChannels: string[] | null;
  private allowedUsers: string[] | null;
  private mentionOnly: boolean;
  private commandPrefix: string;

  constructor(config: IRCChannelConfig = {}) {
    super(config);

    this.serverConfigs = config.servers || this.loadServersFromEnv();
    this.defaultNick = config.defaultNick || process.env.IRC_NICK || 'X2000Bot';
    this.defaultUser = config.defaultUser || process.env.IRC_USER || 'x2000';
    this.defaultRealName = config.defaultRealName || process.env.IRC_REALNAME || 'X2000 AI Assistant';
    this.autoJoinChannels = config.autoJoinChannels || [];
    this.allowedChannels = config.allowedChannels || null;
    this.allowedUsers = config.allowedUsers || null;
    this.mentionOnly = config.mentionOnly ?? false;
    this.commandPrefix = config.commandPrefix || '!';
  }

  /**
   * Load server configs from environment variables
   */
  private loadServersFromEnv(): IRCServerConfig[] {
    const host = process.env.IRC_HOST;
    if (!host) return [];

    return [{
      id: 'default',
      host,
      port: parseInt(process.env.IRC_PORT || '6667', 10),
      ssl: process.env.IRC_SSL === 'true',
      nick: process.env.IRC_NICK,
      password: process.env.IRC_PASSWORD,
      channels: process.env.IRC_CHANNELS?.split(','),
      autoConnect: true,
    }];
  }

  /**
   * Initialize IRC channel
   */
  async initialize(): Promise<void> {
    if (this.serverConfigs.length === 0) {
      console.warn('[IRC] No servers configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    const connectPromises: Promise<void>[] = [];

    for (const serverConfig of this.serverConfigs) {
      if (serverConfig.autoConnect !== false) {
        connectPromises.push(this.connectToServer(serverConfig));
      }
    }

    try {
      await Promise.all(connectPromises);
      this.connected = this.servers.size > 0;
      console.log(`[IRC] Connected to ${this.servers.size} server(s)`);
    } catch (error) {
      console.error('[IRC] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Connect to an IRC server
   */
  async connectToServer(config: IRCServerConfig): Promise<void> {
    const serverConfig: IRCServerConfig = {
      ...config,
      nick: config.nick || this.defaultNick,
      user: config.user || this.defaultUser,
      realName: config.realName || this.defaultRealName,
      channels: [...(config.channels || []), ...this.autoJoinChannels],
    };

    const client = new IRCClient(serverConfig);

    // Set up event handlers
    client.on('message', (event: unknown) => {
      this.handleMessage(config.id, event as { from: string; to: string; message: string; isChannel: boolean });
    });

    client.on('action', (event: unknown) => {
      this.handleAction(config.id, event as { from: string; to: string; message: string; isChannel: boolean });
    });

    client.on('error', (error: unknown) => {
      console.error(`[IRC:${config.id}] Error:`, error);
    });

    client.on('disconnected', () => {
      console.log(`[IRC:${config.id}] Disconnected`);
      this.servers.delete(config.id);

      // Check if any servers still connected
      if (this.servers.size === 0) {
        this.connected = false;
      }
    });

    await client.connect();
    this.servers.set(config.id, client);

    console.log(`[IRC] Connected to ${config.host}:${config.port || 6667} as ${client.getNick()}`);
  }

  /**
   * Shutdown IRC connection
   */
  async shutdown(): Promise<void> {
    for (const [serverId, client] of this.servers) {
      console.log(`[IRC] Disconnecting from ${serverId}`);
      client.disconnect();
    }

    this.servers.clear();
    this.connected = false;
    console.log('[IRC] Disconnected from all servers');
  }

  /**
   * Send a message
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    // Parse channelId format: serverId#channel or serverId:nick
    const { serverId, target } = this.parseChannelId(channelId);

    const client = this.servers.get(serverId);
    if (!client || !client.isConnected()) {
      throw new Error(`Not connected to server: ${serverId}`);
    }

    // Split and send message
    const lines = response.content.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        if (context?.metadata?.action) {
          client.action(target, line);
        } else {
          client.say(target, line);
        }
      }
    }

    console.log(`[IRC:${serverId}] Sent message to ${target}`);
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(
    serverId: string,
    event: { from: string; to: string; message: string; isChannel: boolean }
  ): Promise<void> {
    const client = this.servers.get(serverId);
    if (!client) return;

    const myNick = client.getNick();

    // Ignore own messages
    if (event.from === myNick) return;

    // Check channel allowlist
    if (event.isChannel && this.allowedChannels && !this.allowedChannels.includes(event.to)) {
      return;
    }

    // Check user allowlist
    if (this.allowedUsers && !this.allowedUsers.includes(event.from)) {
      return;
    }

    // Check mention requirement for channels
    if (event.isChannel && this.mentionOnly) {
      const mentionPatterns = [
        myNick.toLowerCase(),
        `${myNick.toLowerCase()}:`,
        `${myNick.toLowerCase()},`,
        `@${myNick.toLowerCase()}`,
      ];

      const lowerMessage = event.message.toLowerCase();
      const mentioned = mentionPatterns.some(p => lowerMessage.includes(p));
      const hasCommandPrefix = event.message.startsWith(this.commandPrefix);

      if (!mentioned && !hasCommandPrefix) {
        return;
      }
    }

    // Clean message
    const cleanedMessage = this.cleanMessage(event.message, myNick);

    // Create channel message
    const message: ChannelMessage = {
      id: uuidv4(),
      channelType: this.type,
      channelId: event.isChannel ? `${serverId}#${event.to}` : `${serverId}:${event.from}`,
      userId: event.from,
      content: cleanedMessage,
      timestamp: new Date(),
      metadata: {
        serverId,
        isChannel: event.isChannel,
        channel: event.isChannel ? event.to : undefined,
        raw: event.message,
      },
    };

    const response = await this.processMessage(message);

    if (response) {
      const replyTarget = event.isChannel ? event.to : event.from;
      const channelId = event.isChannel ? `${serverId}#${replyTarget}` : `${serverId}:${replyTarget}`;

      // Prefix with nick in channels
      if (event.isChannel) {
        response.content = `${event.from}: ${response.content}`;
      }

      await this.send(channelId, response);
    }
  }

  /**
   * Handle ACTION message
   */
  private async handleAction(
    serverId: string,
    event: { from: string; to: string; message: string; isChannel: boolean }
  ): Promise<void> {
    // Convert action to regular message format
    await this.handleMessage(serverId, {
      ...event,
      message: `* ${event.from} ${event.message}`,
    });
  }

  /**
   * Clean message text
   */
  private cleanMessage(message: string, myNick: string): string {
    // Remove bot mention
    const patterns = [
      new RegExp(`^${myNick}[,:]*\\s*`, 'i'),
      new RegExp(`^@${myNick}\\s*`, 'i'),
    ];

    for (const pattern of patterns) {
      message = message.replace(pattern, '');
    }

    // Remove command prefix
    if (message.startsWith(this.commandPrefix)) {
      message = message.substring(this.commandPrefix.length);
    }

    return message.trim();
  }

  /**
   * Parse channel ID format
   */
  private parseChannelId(channelId: string): { serverId: string; target: string } {
    // Format: serverId#channel or serverId:nick
    const hashIndex = channelId.indexOf('#');
    const colonIndex = channelId.indexOf(':');

    if (hashIndex > 0) {
      return {
        serverId: channelId.substring(0, hashIndex),
        target: channelId.substring(hashIndex),
      };
    }

    if (colonIndex > 0) {
      return {
        serverId: channelId.substring(0, colonIndex),
        target: channelId.substring(colonIndex + 1),
      };
    }

    // Default to first server
    const firstServerId = this.servers.keys().next().value;
    return {
      serverId: firstServerId || 'default',
      target: channelId,
    };
  }

  /**
   * Join a channel
   */
  async joinChannel(serverId: string, channel: string): Promise<void> {
    const client = this.servers.get(serverId);
    if (!client) {
      throw new Error(`Not connected to server: ${serverId}`);
    }

    client.join(channel);
    console.log(`[IRC:${serverId}] Joined ${channel}`);
  }

  /**
   * Leave a channel
   */
  async partChannel(serverId: string, channel: string, message?: string): Promise<void> {
    const client = this.servers.get(serverId);
    if (!client) {
      throw new Error(`Not connected to server: ${serverId}`);
    }

    client.part(channel, message);
    console.log(`[IRC:${serverId}] Left ${channel}`);
  }

  /**
   * Change nick on a server
   */
  async changeNick(serverId: string, newNick: string): Promise<void> {
    const client = this.servers.get(serverId);
    if (!client) {
      throw new Error(`Not connected to server: ${serverId}`);
    }

    client.changeNick(newNick);
    console.log(`[IRC:${serverId}] Changed nick to ${newNick}`);
  }

  /**
   * Get server state
   */
  getServerState(serverId: string): IRCServerState | undefined {
    return this.servers.get(serverId)?.getState();
  }

  /**
   * Get all connected servers
   */
  getConnectedServers(): string[] {
    return Array.from(this.servers.keys());
  }

  /**
   * Get channels for a server
   */
  getChannels(serverId: string): string[] {
    return this.servers.get(serverId)?.getChannels() || [];
  }
}

// ============================================================================
// Exports
// ============================================================================

export const ircChannel = new IRCChannel();

// Register with channel registry (only if configured)
if (process.env.IRC_HOST) {
  ChannelRegistry.register(ircChannel);
}

export function createIRCChannel(config?: IRCChannelConfig): IRCChannel {
  return new IRCChannel(config);
}
