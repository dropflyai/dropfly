/**
 * Microsoft Teams Channel Adapter
 *
 * Enables X2000 communication via Microsoft Teams.
 * Uses Microsoft Bot Framework / Graph API for messaging.
 *
 * Features:
 * - Text and adaptive cards
 * - Channel and direct messages
 * - @mentions support
 * - File attachments
 * - OAuth authentication flow
 *
 * @see https://learn.microsoft.com/en-us/azure/bot-service/
 * @see https://learn.microsoft.com/en-us/microsoftteams/platform/
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

export interface MSTeamsChannelConfig extends Partial<ChannelConfig> {
  /** Microsoft App ID (from Azure Bot registration) */
  appId?: string;
  /** Microsoft App Password (client secret) */
  appPassword?: string;
  /** Tenant ID (for single-tenant apps) */
  tenantId?: string;
  /** Allowed team IDs */
  allowedTeams?: string[];
  /** Allowed channel IDs */
  allowedChannels?: string[];
  /** Allowed user IDs */
  allowedUsers?: string[];
  /** Only respond to @mentions */
  mentionOnly?: boolean;
  /** Service URL for proactive messaging */
  serviceUrl?: string;
}

/** Bot Framework Activity */
interface TeamsActivity {
  id: string;
  type: 'message' | 'conversationUpdate' | 'messageReaction' | 'event';
  timestamp: string;
  serviceUrl: string;
  channelId: string;
  from: {
    id: string;
    name?: string;
    aadObjectId?: string;
    role?: string;
  };
  conversation: {
    id: string;
    name?: string;
    isGroup?: boolean;
    conversationType?: 'personal' | 'groupChat' | 'channel';
    tenantId?: string;
  };
  recipient: {
    id: string;
    name?: string;
  };
  text?: string;
  textFormat?: 'plain' | 'markdown' | 'xml';
  attachments?: TeamsAttachment[];
  entities?: TeamsEntity[];
  channelData?: {
    teamsChannelId?: string;
    teamsTeamId?: string;
    channel?: { id: string; name: string };
    team?: { id: string; name: string };
  };
  replyToId?: string;
  value?: Record<string, unknown>; // For adaptive card responses
}

interface TeamsAttachment {
  contentType: string;
  contentUrl?: string;
  content?: unknown;
  name?: string;
  thumbnailUrl?: string;
}

interface TeamsEntity {
  type: string;
  mentioned?: {
    id: string;
    name: string;
  };
  text?: string;
}

/** Conversation reference for proactive messaging */
interface ConversationReference {
  activityId?: string;
  user: { id: string; name?: string };
  bot: { id: string; name?: string };
  conversation: { id: string; name?: string; isGroup?: boolean };
  channelId: string;
  serviceUrl: string;
}

/** Adaptive Card structure */
interface AdaptiveCard {
  type: 'AdaptiveCard';
  version: string;
  body: AdaptiveCardElement[];
  actions?: AdaptiveCardAction[];
  $schema?: string;
}

interface AdaptiveCardElement {
  type: 'TextBlock' | 'Image' | 'Container' | 'ColumnSet' | 'Column' | 'FactSet' | 'Input.Text';
  text?: string;
  size?: 'small' | 'default' | 'medium' | 'large' | 'extraLarge';
  weight?: 'lighter' | 'default' | 'bolder';
  wrap?: boolean;
  url?: string;
  items?: AdaptiveCardElement[];
  columns?: AdaptiveCardElement[];
  width?: string;
  facts?: Array<{ title: string; value: string }>;
  id?: string;
  placeholder?: string;
}

interface AdaptiveCardAction {
  type: 'Action.Submit' | 'Action.OpenUrl' | 'Action.ShowCard';
  title: string;
  data?: Record<string, unknown>;
  url?: string;
  card?: AdaptiveCard;
}

// ============================================================================
// Platform Capabilities
// ============================================================================

export const MSTEAMS_CAPABILITIES = {
  supportsMarkdown: true,
  supportsHTML: false,
  supportsRichText: true,
  maxMessageLength: 28000,
  supportsThreads: true,
  supportsReplies: true,
  supportsFiles: true,
  supportsImages: true,
  supportsVoice: false,
  supportsVideo: false,
  supportsLocation: false,
  maxAttachmentSize: 25 * 1024 * 1024, // 25MB
  supportsReactions: true,
  supportsButtons: true,
  supportsCards: true,              // Adaptive Cards
  supportsTypingIndicator: true,
  supportsReadReceipts: false,
  supportsMessageEdit: true,
  supportsMessageDelete: true,
  supportsE2EEncryption: false,
  supportsDisappearingMessages: false,
};

// ============================================================================
// Microsoft Teams Channel
// ============================================================================

export class MSTeamsChannel extends BaseChannel {
  readonly type = 'msteams';
  readonly name = 'Microsoft Teams';
  readonly capabilities = MSTEAMS_CAPABILITIES;

  private appId: string | null;
  private appPassword: string | null;
  private tenantId: string | null;
  private allowedTeams: string[] | null;
  private allowedChannels: string[] | null;
  private allowedUsers: string[] | null;
  private mentionOnly: boolean;
  private serviceUrl: string | null;

  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private botId: string | null = null;

  // Store conversation references for proactive messaging
  private conversationReferences: Map<string, ConversationReference> = new Map();

  constructor(config: MSTeamsChannelConfig = {}) {
    super(config);

    this.appId = config.appId || process.env.MSTEAMS_APP_ID || null;
    this.appPassword = config.appPassword || process.env.MSTEAMS_APP_PASSWORD || null;
    this.tenantId = config.tenantId || process.env.MSTEAMS_TENANT_ID || null;
    this.allowedTeams = config.allowedTeams || null;
    this.allowedChannels = config.allowedChannels || null;
    this.allowedUsers = config.allowedUsers || null;
    this.mentionOnly = config.mentionOnly ?? true;
    this.serviceUrl = config.serviceUrl || null;
  }

  /**
   * Initialize Microsoft Teams connection
   */
  async initialize(): Promise<void> {
    if (!this.appId || !this.appPassword) {
      console.warn('[MSTeams] App ID or password not configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Get initial access token
      await this.refreshAccessToken();

      this.botId = this.appId;
      this.connected = true;

      console.log(`[MSTeams] Connected as app ${this.appId}`);
      console.log('[MSTeams] Note: Incoming messages require webhook endpoint');

    } catch (error) {
      console.error('[MSTeams] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Shutdown Microsoft Teams connection
   */
  async shutdown(): Promise<void> {
    this.connected = false;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.conversationReferences.clear();
    console.log('[MSTeams] Disconnected');
  }

  /**
   * Send a message to Microsoft Teams
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('MSTeams channel not connected');
    }

    // Get conversation reference
    const conversationRef = this.conversationReferences.get(channelId);
    if (!conversationRef) {
      throw new Error(`No conversation reference found for ${channelId}`);
    }

    await this.ensureValidToken();

    try {
      // Build activity
      const activity: Partial<TeamsActivity> = {
        type: 'message',
      };

      // Handle adaptive cards with buttons
      if (response.attachments?.some(a => a.type === 'url') ||
          (response.metadata as Record<string, unknown>)?.useCard) {
        activity.attachments = [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: this.buildAdaptiveCard(response),
        }];
      } else {
        activity.text = response.content;
        activity.textFormat = 'markdown';
      }

      // Reply in thread if context has threadId
      if (context?.threadId) {
        activity.replyToId = context.threadId;
      }

      // Add file attachments
      if (response.attachments) {
        const fileAttachments = response.attachments.filter(a => a.type === 'file' || a.type === 'image');
        if (fileAttachments.length > 0) {
          activity.attachments = activity.attachments || [];
          for (const attachment of fileAttachments) {
            if (attachment.url) {
              activity.attachments.push({
                contentType: attachment.mimeType || 'application/octet-stream',
                contentUrl: attachment.url,
                name: attachment.name,
              });
            }
          }
        }
      }

      // Send via Bot Framework
      const serviceUrl = conversationRef.serviceUrl;
      const conversationId = conversationRef.conversation.id;

      await this.botAPI(
        'POST',
        `${serviceUrl}/v3/conversations/${conversationId}/activities`,
        activity
      );

      console.log(`[MSTeams] Sent message to ${channelId}`);

    } catch (error) {
      console.error('[MSTeams] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Handle incoming activity from webhook
   */
  async handleActivity(activity: TeamsActivity): Promise<ChannelResponse | null> {
    // Store conversation reference for proactive messaging
    this.storeConversationReference(activity);

    // Handle different activity types
    switch (activity.type) {
      case 'message':
        return this.handleMessage(activity);

      case 'conversationUpdate':
        await this.handleConversationUpdate(activity);
        return null;

      case 'messageReaction':
        await this.handleReaction(activity);
        return null;

      default:
        console.log(`[MSTeams] Ignoring activity type: ${activity.type}`);
        return null;
    }
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(activity: TeamsActivity): Promise<ChannelResponse | null> {
    // Ignore messages from self
    if (activity.from.id === this.botId) {
      return null;
    }

    // Check team allowlist
    const teamId = activity.channelData?.teamsTeamId;
    if (this.allowedTeams && teamId && !this.allowedTeams.includes(teamId)) {
      return null;
    }

    // Check channel allowlist
    const channelId = activity.channelData?.teamsChannelId || activity.conversation.id;
    if (this.allowedChannels && !this.allowedChannels.includes(channelId)) {
      return null;
    }

    // Check user allowlist
    if (this.allowedUsers && !this.allowedUsers.includes(activity.from.id)) {
      return null;
    }

    // Check mention requirement
    if (this.mentionOnly && this.botId) {
      const isMentioned = activity.entities?.some(
        e => e.type === 'mention' && e.mentioned?.id === this.botId
      );
      if (!isMentioned && activity.conversation.conversationType === 'channel') {
        return null;
      }
    }

    // Handle adaptive card responses
    if (activity.value) {
      return this.handleCardResponse(activity);
    }

    // Convert to channel message
    const channelMessage = this.toChannelMessage(activity);

    return this.processMessage(channelMessage);
  }

  /**
   * Handle adaptive card button responses
   */
  private async handleCardResponse(activity: TeamsActivity): Promise<ChannelResponse | null> {
    const value = activity.value as Record<string, unknown>;

    // Create a message from the card response
    const channelMessage: ChannelMessage = {
      id: activity.id,
      channelType: this.type,
      channelId: activity.conversation.id,
      userId: activity.from.id,
      content: JSON.stringify(value),
      timestamp: new Date(activity.timestamp),
      metadata: {
        isCardResponse: true,
        cardData: value,
        userName: activity.from.name,
      },
    };

    return this.processMessage(channelMessage);
  }

  /**
   * Handle conversation updates (user added, etc.)
   */
  private async handleConversationUpdate(activity: TeamsActivity): Promise<void> {
    console.log('[MSTeams] Conversation update:', activity.type);
    // Could send welcome message when bot is added
  }

  /**
   * Handle reactions
   */
  private async handleReaction(activity: TeamsActivity): Promise<void> {
    console.log('[MSTeams] Reaction:', activity);
    // Emit event for reaction handling
  }

  /**
   * Store conversation reference for later proactive messaging
   */
  private storeConversationReference(activity: TeamsActivity): void {
    const ref: ConversationReference = {
      activityId: activity.id,
      user: activity.from,
      bot: activity.recipient,
      conversation: activity.conversation,
      channelId: activity.channelId,
      serviceUrl: activity.serviceUrl,
    };

    this.conversationReferences.set(activity.conversation.id, ref);

    // Update service URL
    if (!this.serviceUrl) {
      this.serviceUrl = activity.serviceUrl;
    }
  }

  /**
   * Convert Teams activity to channel message
   */
  private toChannelMessage(activity: TeamsActivity): ChannelMessage {
    return {
      id: activity.id,
      channelType: this.type,
      channelId: activity.conversation.id,
      userId: activity.from.id,
      content: this.cleanMessage(activity.text || ''),
      timestamp: new Date(activity.timestamp),
      threadId: activity.replyToId,
      metadata: {
        userName: activity.from.name,
        userAadId: activity.from.aadObjectId,
        teamId: activity.channelData?.teamsTeamId,
        teamName: activity.channelData?.team?.name,
        channelName: activity.channelData?.channel?.name,
        conversationType: activity.conversation.conversationType,
        isGroup: activity.conversation.isGroup,
        tenantId: activity.conversation.tenantId,
        serviceUrl: activity.serviceUrl,
      },
      attachments: activity.attachments?.map(a => ({
        type: 'file' as const,
        name: a.name || 'attachment',
        url: a.contentUrl,
        mimeType: a.contentType,
      })),
    };
  }

  /**
   * Clean message text (remove bot mention, etc.)
   */
  private cleanMessage(text: string): string {
    // Remove bot mentions
    // Teams mentions format: <at>BotName</at>
    text = text.replace(/<at>[^<]*<\/at>/g, '').trim();

    return text;
  }

  /**
   * Build adaptive card from response
   */
  private buildAdaptiveCard(response: ChannelResponse): AdaptiveCard {
    const card: AdaptiveCard = {
      type: 'AdaptiveCard',
      version: '1.4',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      body: [],
      actions: [],
    };

    // Add main text
    if (response.content) {
      card.body.push({
        type: 'TextBlock',
        text: response.content,
        wrap: true,
      });
    }

    // Add metadata as facts if present
    const metadata = response.metadata as Record<string, unknown> | undefined;
    if (metadata?.facts) {
      const facts = metadata.facts as Array<{ label: string; value: string }>;
      card.body.push({
        type: 'FactSet',
        facts: facts.map(f => ({ title: f.label, value: f.value })),
      });
    }

    // Add buttons as actions
    if (response.attachments) {
      for (const attachment of response.attachments) {
        if (attachment.type === 'url' && attachment.url) {
          card.actions?.push({
            type: 'Action.OpenUrl',
            title: attachment.name,
            url: attachment.url,
          });
        }
      }
    }

    // Add custom actions from metadata
    if (metadata?.actions) {
      const actions = metadata.actions as Array<{ id: string; label: string; value?: string }>;
      for (const action of actions) {
        card.actions?.push({
          type: 'Action.Submit',
          title: action.label,
          data: { action: action.id, value: action.value },
        });
      }
    }

    return card;
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(conversationId: string): Promise<void> {
    if (!this.connected) return;

    const conversationRef = this.conversationReferences.get(conversationId);
    if (!conversationRef) return;

    await this.ensureValidToken();

    try {
      await this.botAPI(
        'POST',
        `${conversationRef.serviceUrl}/v3/conversations/${conversationId}/activities`,
        { type: 'typing' }
      );
    } catch (error) {
      console.warn('[MSTeams] Failed to send typing indicator:', error);
    }
  }

  /**
   * Create or get a conversation for proactive messaging
   */
  async createConversation(
    userId: string,
    tenantId: string,
    serviceUrl?: string
  ): Promise<string | null> {
    if (!this.connected || !this.botId) return null;

    await this.ensureValidToken();

    const svcUrl = serviceUrl || this.serviceUrl;
    if (!svcUrl) {
      console.error('[MSTeams] No service URL available');
      return null;
    }

    try {
      const response = await this.botAPI('POST', `${svcUrl}/v3/conversations`, {
        bot: { id: this.botId },
        members: [{ id: userId }],
        channelData: { tenant: { id: tenantId } },
        isGroup: false,
      });

      const conversationId = (response as { id: string }).id;

      // Store reference
      this.conversationReferences.set(conversationId, {
        user: { id: userId },
        bot: { id: this.botId },
        conversation: { id: conversationId },
        channelId: 'msteams',
        serviceUrl: svcUrl,
      });

      return conversationId;
    } catch (error) {
      console.error('[MSTeams] Failed to create conversation:', error);
      return null;
    }
  }

  /**
   * Get user info from Microsoft Graph
   */
  async getUserInfo(userId: string): Promise<{
    displayName: string;
    email?: string;
    jobTitle?: string;
  } | null> {
    if (!this.connected) return null;

    await this.ensureValidToken();

    try {
      // This requires Graph API permissions
      const response = await this.graphAPI('GET', `/users/${userId}`);

      const user = response as {
        displayName: string;
        mail?: string;
        jobTitle?: string;
      };

      return {
        displayName: user.displayName,
        email: user.mail,
        jobTitle: user.jobTitle,
      };
    } catch {
      return null;
    }
  }

  /**
   * Refresh OAuth access token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.appId || !this.appPassword) {
      throw new Error('App credentials not configured');
    }

    const tokenUrl = this.tenantId
      ? `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`
      : 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token';

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.appId,
      client_secret: this.appPassword,
      scope: 'https://api.botframework.com/.default',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${error}`);
    }

    const data = await response.json() as { access_token: string; expires_in: number };

    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000); // 5 min buffer

    console.log('[MSTeams] Access token refreshed');
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || this.tokenExpiry <= new Date()) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Make Bot Framework API call
   */
  private async botAPI(
    method: string,
    url: string,
    body?: unknown
  ): Promise<Record<string, unknown>> {
    await this.ensureValidToken();

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bot API error: ${response.status} ${error}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {};
    }

    return response.json() as Promise<Record<string, unknown>>;
  }

  /**
   * Make Microsoft Graph API call
   */
  private async graphAPI(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<Record<string, unknown>> {
    // Note: This requires separate Graph API token with appropriate permissions
    // For simplicity, we'll use the bot token which has limited Graph access
    await this.ensureValidToken();

    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Graph API error: ${response.status} ${error}`);
    }

    return response.json() as Promise<Record<string, unknown>>;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    tokenValid: boolean;
    errors?: string[];
  }> {
    const start = Date.now();

    try {
      await this.ensureValidToken();

      return {
        healthy: true,
        latency: Date.now() - start,
        tokenValid: !!this.accessToken,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        tokenValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get stored conversation references
   */
  getConversationReferences(): Map<string, ConversationReference> {
    return this.conversationReferences;
  }
}

// ============================================================================
// Exports
// ============================================================================

export const msteamsChannel = new MSTeamsChannel();

// Register with channel registry (only if configured)
if (process.env.MSTEAMS_APP_ID && process.env.MSTEAMS_APP_PASSWORD) {
  ChannelRegistry.register(msteamsChannel);
}

export function createMSTeamsChannel(config?: MSTeamsChannelConfig): MSTeamsChannel {
  return new MSTeamsChannel(config);
}
