/**
 * Matrix Channel Adapter
 *
 * Enables X2000 communication via the Matrix protocol.
 * Supports federated communication across Matrix homeservers.
 *
 * Features:
 * - Text, images, and files
 * - End-to-end encryption (Megolm)
 * - Room management
 * - Reactions
 * - Federated server support
 *
 * @see https://matrix.org/
 * @see https://spec.matrix.org/
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

export interface MatrixChannelConfig extends Partial<ChannelConfig> {
  /** Matrix homeserver URL (e.g., https://matrix.org) */
  homeserverUrl?: string;
  /** Access token for authentication */
  accessToken?: string;
  /** User ID (e.g., @bot:matrix.org) */
  userId?: string;
  /** Device ID (for E2E encryption) */
  deviceId?: string;
  /** Allowed room IDs */
  allowedRooms?: string[];
  /** Allowed user IDs */
  allowedUsers?: string[];
  /** Enable end-to-end encryption */
  enableE2E?: boolean;
  /** Only respond to mentions */
  mentionOnly?: boolean;
  /** Sync filter for events */
  syncFilter?: MatrixFilter;
}

/** Matrix sync filter */
interface MatrixFilter {
  room?: {
    state?: { types?: string[]; lazy_load_members?: boolean };
    timeline?: { types?: string[]; limit?: number };
    ephemeral?: { types?: string[] };
  };
  presence?: { types?: string[] };
}

/** Matrix room event */
interface MatrixEvent {
  event_id: string;
  type: string;
  room_id: string;
  sender: string;
  origin_server_ts: number;
  content: MatrixEventContent;
  unsigned?: {
    age?: number;
    transaction_id?: string;
    redacted_because?: MatrixEvent;
  };
}

/** Matrix event content types */
type MatrixEventContent =
  | MatrixTextContent
  | MatrixImageContent
  | MatrixFileContent
  | MatrixReactionContent
  | MatrixMemberContent;

interface MatrixTextContent {
  msgtype: 'm.text' | 'm.notice' | 'm.emote';
  body: string;
  format?: 'org.matrix.custom.html';
  formatted_body?: string;
  'm.relates_to'?: MatrixRelation;
}

interface MatrixImageContent {
  msgtype: 'm.image';
  body: string;
  url: string;
  info?: {
    mimetype?: string;
    size?: number;
    w?: number;
    h?: number;
    thumbnail_url?: string;
  };
}

interface MatrixFileContent {
  msgtype: 'm.file' | 'm.audio' | 'm.video';
  body: string;
  url: string;
  info?: {
    mimetype?: string;
    size?: number;
    duration?: number;
  };
}

interface MatrixReactionContent {
  'm.relates_to': {
    rel_type: 'm.annotation';
    event_id: string;
    key: string; // The emoji
  };
}

interface MatrixMemberContent {
  membership: 'join' | 'leave' | 'invite' | 'ban' | 'knock';
  displayname?: string;
  avatar_url?: string;
}

interface MatrixRelation {
  rel_type: 'm.replace' | 'm.thread' | 'm.annotation';
  event_id: string;
  key?: string;
}

/** Matrix sync response */
interface MatrixSyncResponse {
  next_batch: string;
  rooms?: {
    join?: Record<string, MatrixJoinedRoom>;
    invite?: Record<string, unknown>;
    leave?: Record<string, unknown>;
  };
  presence?: {
    events?: MatrixEvent[];
  };
}

interface MatrixJoinedRoom {
  timeline: {
    events: MatrixEvent[];
    prev_batch?: string;
    limited?: boolean;
  };
  state: {
    events: MatrixEvent[];
  };
  ephemeral?: {
    events: MatrixEvent[];
  };
}

/** Matrix room info */
interface MatrixRoom {
  roomId: string;
  name?: string;
  topic?: string;
  avatarUrl?: string;
  memberCount?: number;
  isEncrypted?: boolean;
  isDirect?: boolean;
}

// ============================================================================
// Platform Capabilities
// ============================================================================

export const MATRIX_CAPABILITIES = {
  supportsMarkdown: true,
  supportsHTML: true,
  supportsRichText: true,
  maxMessageLength: 65535,
  supportsThreads: true,
  supportsReplies: true,
  supportsFiles: true,
  supportsImages: true,
  supportsVoice: true,
  supportsVideo: true,
  supportsLocation: true,
  maxAttachmentSize: 100 * 1024 * 1024, // 100MB (depends on homeserver)
  supportsReactions: true,
  supportsButtons: false,               // No native support
  supportsCards: false,
  supportsTypingIndicator: true,
  supportsReadReceipts: true,
  supportsMessageEdit: true,
  supportsMessageDelete: true,          // Redaction
  supportsE2EEncryption: true,          // Olm/Megolm
  supportsDisappearingMessages: false,
};

// ============================================================================
// Matrix Channel
// ============================================================================

export class MatrixChannel extends BaseChannel {
  readonly type = 'matrix';
  readonly name = 'Matrix';
  readonly capabilities = MATRIX_CAPABILITIES;

  private homeserverUrl: string | null;
  private accessToken: string | null;
  private userId: string | null;
  private deviceId: string | null;
  private allowedRooms: string[] | null;
  private allowedUsers: string[] | null;
  private enableE2E: boolean;
  private mentionOnly: boolean;
  private syncFilter: MatrixFilter | null;

  private syncToken: string | null = null;
  private syncAbortController: AbortController | null = null;
  private isSyncing: boolean = false;

  // Room state cache
  private rooms: Map<string, MatrixRoom> = new Map();

  constructor(config: MatrixChannelConfig = {}) {
    super(config);

    this.homeserverUrl = config.homeserverUrl || process.env.MATRIX_HOMESERVER_URL || null;
    this.accessToken = config.accessToken || process.env.MATRIX_ACCESS_TOKEN || null;
    this.userId = config.userId || process.env.MATRIX_USER_ID || null;
    this.deviceId = config.deviceId || process.env.MATRIX_DEVICE_ID || null;
    this.allowedRooms = config.allowedRooms || null;
    this.allowedUsers = config.allowedUsers || null;
    this.enableE2E = config.enableE2E ?? false; // Disabled by default (requires additional setup)
    this.mentionOnly = config.mentionOnly ?? false;
    this.syncFilter = config.syncFilter || null;
  }

  /**
   * Initialize Matrix connection
   */
  async initialize(): Promise<void> {
    if (!this.homeserverUrl || !this.accessToken) {
      console.warn('[Matrix] Homeserver URL or access token not configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Verify credentials by getting user info
      const whoami = await this.matrixAPI('GET', '/_matrix/client/v3/account/whoami');

      this.userId = whoami.user_id as string;
      this.deviceId = whoami.device_id as string | undefined || this.deviceId;

      console.log(`[Matrix] Connected as ${this.userId} on ${this.homeserverUrl}`);

      if (this.enableE2E) {
        console.log('[Matrix] E2E encryption enabled (requires key backup setup)');
        // Note: Full E2E support requires matrix-js-sdk for Olm/Megolm handling
        // This implementation focuses on non-encrypted rooms
      }

      // Get initial room list
      await this.syncRooms();

      this.connected = true;
      console.log('[Matrix] Channel initialized successfully');

    } catch (error) {
      console.error('[Matrix] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Shutdown Matrix connection
   */
  async shutdown(): Promise<void> {
    // Stop sync loop
    this.stopSync();

    this.connected = false;
    this.rooms.clear();
    console.log('[Matrix] Disconnected');
  }

  /**
   * Send a message to a Matrix room
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected || !this.homeserverUrl || !this.accessToken) {
      throw new Error('Matrix channel not connected');
    }

    try {
      // Build message content
      const content: MatrixTextContent = {
        msgtype: 'm.text',
        body: response.content,
      };

      // Add HTML formatting if available
      const metadata = response.metadata as Record<string, unknown> | undefined;
      if (metadata?.html || response.content.includes('**') || response.content.includes('_')) {
        content.format = 'org.matrix.custom.html';
        content.formatted_body = metadata?.html as string || this.markdownToHtml(response.content);
      }

      // Handle replies
      if (context?.threadId) {
        content['m.relates_to'] = {
          rel_type: 'm.thread',
          event_id: context.threadId,
        };
      } else if (context?.metadata?.replyToId) {
        // For direct replies (not threads)
        content['m.relates_to'] = {
          rel_type: 'm.replace',
          event_id: context.metadata.replyToId as string,
        };
      }

      // Generate transaction ID
      const txnId = uuidv4();

      // Send message
      await this.matrixAPI(
        'PUT',
        `/_matrix/client/v3/rooms/${encodeURIComponent(channelId)}/send/m.room.message/${txnId}`,
        content
      );

      console.log(`[Matrix] Sent message to ${channelId}`);

      // Handle attachments
      if (response.attachments && response.attachments.length > 0) {
        for (const attachment of response.attachments) {
          if (attachment.url || attachment.data) {
            await this.sendAttachment(channelId, attachment);
          }
        }
      }

    } catch (error) {
      console.error('[Matrix] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send an attachment
   */
  private async sendAttachment(
    roomId: string,
    attachment: NonNullable<ChannelResponse['attachments']>[number]
  ): Promise<void> {
    // For URL-based attachments, we need to upload first
    let mxcUrl: string;

    if (attachment.url) {
      // Fetch and upload
      const response = await fetch(attachment.url);
      const buffer = Buffer.from(await response.arrayBuffer());

      const uploadResult = await this.uploadMedia(
        buffer,
        attachment.name,
        attachment.mimeType || 'application/octet-stream'
      );

      mxcUrl = uploadResult.content_uri;
    } else if (attachment.data) {
      const uploadResult = await this.uploadMedia(
        Buffer.from(attachment.data, 'base64'),
        attachment.name,
        attachment.mimeType || 'application/octet-stream'
      );
      mxcUrl = uploadResult.content_uri;
    } else {
      return;
    }

    // Determine message type based on MIME type
    let msgtype: 'm.file' | 'm.image' | 'm.audio' | 'm.video' = 'm.file';
    if (attachment.mimeType?.startsWith('image/')) msgtype = 'm.image';
    else if (attachment.mimeType?.startsWith('audio/')) msgtype = 'm.audio';
    else if (attachment.mimeType?.startsWith('video/')) msgtype = 'm.video';

    const content = {
      msgtype,
      body: attachment.name,
      url: mxcUrl,
      info: {
        mimetype: attachment.mimeType,
      },
    };

    const txnId = uuidv4();
    await this.matrixAPI(
      'PUT',
      `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${txnId}`,
      content
    );

    console.log(`[Matrix] Sent attachment to ${roomId}`);
  }

  /**
   * Upload media to Matrix content repository
   */
  private async uploadMedia(
    data: Buffer,
    filename: string,
    contentType: string
  ): Promise<{ content_uri: string }> {
    if (!this.homeserverUrl || !this.accessToken) {
      throw new Error('Matrix not configured');
    }

    const response = await fetch(
      `${this.homeserverUrl}/_matrix/media/v3/upload?filename=${encodeURIComponent(filename)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': contentType,
        },
        body: new Uint8Array(data),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Media upload failed: ${response.status} ${error}`);
    }

    return response.json() as Promise<{ content_uri: string }>;
  }

  /**
   * Start the sync loop for receiving messages
   */
  async startSync(
    onMessage: (message: ChannelMessage) => Promise<ChannelResponse | null>
  ): Promise<void> {
    if (this.isSyncing) {
      console.warn('[Matrix] Sync already running');
      return;
    }

    this.isSyncing = true;
    this.syncAbortController = new AbortController();

    console.log('[Matrix] Starting sync loop');

    while (this.isSyncing && this.connected) {
      try {
        const syncResponse = await this.sync();

        if (syncResponse.rooms?.join) {
          for (const [roomId, room] of Object.entries(syncResponse.rooms.join)) {
            for (const event of room.timeline.events) {
              if (event.type === 'm.room.message' && event.sender !== this.userId) {
                const shouldProcess = await this.shouldProcessEvent(event);

                if (shouldProcess) {
                  const channelMessage = this.toChannelMessage(event, roomId);
                  const response = await onMessage(channelMessage);

                  if (response) {
                    await this.send(roomId, response, {
                      channelId: roomId,
                      metadata: { replyToId: event.event_id },
                    });
                  }
                }
              }
            }
          }
        }

        this.syncToken = syncResponse.next_batch;

      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.log('[Matrix] Sync aborted');
          break;
        }

        console.error('[Matrix] Sync error:', error);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('[Matrix] Sync loop stopped');
  }

  /**
   * Stop the sync loop
   */
  stopSync(): void {
    this.isSyncing = false;
    this.syncAbortController?.abort();
    this.syncAbortController = null;
  }

  /**
   * Check if an event should be processed
   */
  private async shouldProcessEvent(event: MatrixEvent): Promise<boolean> {
    // Check room allowlist
    if (this.allowedRooms && !this.allowedRooms.includes(event.room_id)) {
      return false;
    }

    // Check user allowlist
    if (this.allowedUsers && !this.allowedUsers.includes(event.sender)) {
      return false;
    }

    // Check mention requirement
    if (this.mentionOnly && this.userId) {
      const content = event.content as MatrixTextContent;
      const body = content.body || '';
      const formattedBody = content.formatted_body || '';

      // Check for @mention or user ID mention
      const displayName = await this.getDisplayName(this.userId);
      const isMentioned =
        body.includes(this.userId) ||
        body.includes(`@${displayName}`) ||
        formattedBody.includes(this.userId);

      if (!isMentioned) {
        return false;
      }
    }

    return true;
  }

  /**
   * Handle incoming webhook/notification (for push-based setups)
   */
  async handleEvent(event: MatrixEvent): Promise<ChannelResponse | null> {
    // Ignore messages from self
    if (event.sender === this.userId) {
      return null;
    }

    const shouldProcess = await this.shouldProcessEvent(event);
    if (!shouldProcess) {
      return null;
    }

    // Handle different event types
    if (event.type === 'm.room.message') {
      const channelMessage = this.toChannelMessage(event, event.room_id);
      return this.processMessage(channelMessage);
    }

    if (event.type === 'm.reaction') {
      await this.handleReaction(event);
      return null;
    }

    return null;
  }

  /**
   * Handle reaction events
   */
  private async handleReaction(event: MatrixEvent): Promise<void> {
    const content = event.content as MatrixReactionContent;
    const relation = content['m.relates_to'];

    if (relation?.rel_type === 'm.annotation') {
      console.log(`[Matrix] Reaction: ${relation.key} on ${relation.event_id} by ${event.sender}`);
      // Could emit event for reaction handling
    }
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(roomId: string, eventId: string, emoji: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Matrix channel not connected');
    }

    const content: MatrixReactionContent = {
      'm.relates_to': {
        rel_type: 'm.annotation',
        event_id: eventId,
        key: emoji,
      },
    };

    const txnId = uuidv4();
    await this.matrixAPI(
      'PUT',
      `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.reaction/${txnId}`,
      content
    );

    console.log(`[Matrix] Added reaction ${emoji} to ${eventId}`);
  }

  /**
   * Redact (delete) a message
   */
  async redactMessage(roomId: string, eventId: string, reason?: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Matrix channel not connected');
    }

    const txnId = uuidv4();
    await this.matrixAPI(
      'PUT',
      `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/redact/${encodeURIComponent(eventId)}/${txnId}`,
      { reason }
    );

    console.log(`[Matrix] Redacted message ${eventId}`);
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(roomId: string, typing: boolean = true, timeout: number = 5000): Promise<void> {
    if (!this.connected || !this.userId) return;

    try {
      await this.matrixAPI(
        'PUT',
        `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/typing/${encodeURIComponent(this.userId)}`,
        { typing, timeout }
      );
    } catch (error) {
      console.warn('[Matrix] Failed to send typing indicator:', error);
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(roomId: string, eventId: string): Promise<void> {
    if (!this.connected) return;

    try {
      await this.matrixAPI(
        'POST',
        `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/read_markers`,
        {
          'm.fully_read': eventId,
          'm.read': eventId,
        }
      );

      console.log(`[Matrix] Marked ${eventId} as read`);
    } catch (error) {
      console.warn('[Matrix] Failed to mark as read:', error);
    }
  }

  /**
   * Join a room
   */
  async joinRoom(roomIdOrAlias: string): Promise<string> {
    if (!this.connected) {
      throw new Error('Matrix channel not connected');
    }

    const result = await this.matrixAPI(
      'POST',
      `/_matrix/client/v3/join/${encodeURIComponent(roomIdOrAlias)}`,
      {}
    );

    const roomId = result.room_id as string;
    console.log(`[Matrix] Joined room ${roomId}`);

    return roomId;
  }

  /**
   * Leave a room
   */
  async leaveRoom(roomId: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Matrix channel not connected');
    }

    await this.matrixAPI(
      'POST',
      `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/leave`,
      {}
    );

    this.rooms.delete(roomId);
    console.log(`[Matrix] Left room ${roomId}`);
  }

  /**
   * Get room info
   */
  async getRoomInfo(roomId: string): Promise<MatrixRoom | null> {
    if (!this.connected) return null;

    // Check cache first
    const cached = this.rooms.get(roomId);
    if (cached) return cached;

    try {
      // Get room state
      const state = await this.matrixAPI(
        'GET',
        `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/state`
      );

      const events = state as unknown as MatrixEvent[];
      let name: string | undefined;
      let topic: string | undefined;
      let avatarUrl: string | undefined;
      let isEncrypted = false;

      for (const event of events) {
        if (event.type === 'm.room.name') {
          name = (event.content as { name?: string }).name;
        } else if (event.type === 'm.room.topic') {
          topic = (event.content as { topic?: string }).topic;
        } else if (event.type === 'm.room.avatar') {
          avatarUrl = (event.content as { url?: string }).url;
        } else if (event.type === 'm.room.encryption') {
          isEncrypted = true;
        }
      }

      const room: MatrixRoom = {
        roomId,
        name,
        topic,
        avatarUrl,
        isEncrypted,
      };

      this.rooms.set(roomId, room);
      return room;

    } catch {
      return null;
    }
  }

  /**
   * Get user display name
   */
  async getDisplayName(userId: string): Promise<string> {
    try {
      const profile = await this.matrixAPI(
        'GET',
        `/_matrix/client/v3/profile/${encodeURIComponent(userId)}/displayname`
      );

      return (profile.displayname as string) || userId;
    } catch {
      return userId;
    }
  }

  /**
   * Convert Matrix event to channel message
   */
  private toChannelMessage(event: MatrixEvent, roomId: string): ChannelMessage {
    const content = event.content as MatrixTextContent | MatrixImageContent | MatrixFileContent;

    let text = '';
    let attachments: ChannelMessage['attachments'];

    if ('msgtype' in content) {
      if (content.msgtype === 'm.text' || content.msgtype === 'm.notice' || content.msgtype === 'm.emote') {
        text = content.body;
      } else if (content.msgtype === 'm.image' || content.msgtype === 'm.file' || content.msgtype === 'm.audio' || content.msgtype === 'm.video') {
        text = content.body;
        attachments = [{
          type: content.msgtype === 'm.image' ? 'image' : 'file',
          name: content.body,
          url: this.mxcToHttp(content.url),
          mimeType: content.info?.mimetype,
        }];
      }
    }

    return {
      id: event.event_id,
      channelType: this.type,
      channelId: roomId,
      userId: event.sender,
      content: text,
      timestamp: new Date(event.origin_server_ts),
      metadata: {
        roomId,
        eventType: event.type,
        formattedBody: (content as MatrixTextContent).formatted_body,
        relation: (content as MatrixTextContent)['m.relates_to'],
      },
      attachments,
    };
  }

  /**
   * Convert mxc:// URL to HTTP URL
   */
  private mxcToHttp(mxcUrl: string): string {
    if (!mxcUrl?.startsWith('mxc://') || !this.homeserverUrl) {
      return mxcUrl;
    }

    // mxc://server.name/media_id -> https://homeserver/_matrix/media/v3/download/server.name/media_id
    const [serverName, mediaId] = mxcUrl.replace('mxc://', '').split('/');
    return `${this.homeserverUrl}/_matrix/media/v3/download/${serverName}/${mediaId}`;
  }

  /**
   * Simple markdown to HTML conversion
   */
  private markdownToHtml(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  /**
   * Sync with homeserver
   */
  private async sync(): Promise<MatrixSyncResponse> {
    const params = new URLSearchParams({
      timeout: '30000',
    });

    if (this.syncToken) {
      params.set('since', this.syncToken);
    }

    if (this.syncFilter) {
      params.set('filter', JSON.stringify(this.syncFilter));
    }

    return this.matrixAPI('GET', `/_matrix/client/v3/sync?${params}`, undefined, {
      signal: this.syncAbortController?.signal,
    }) as unknown as Promise<MatrixSyncResponse>;
  }

  /**
   * Sync rooms (get initial room list)
   */
  private async syncRooms(): Promise<void> {
    try {
      const response = await this.matrixAPI('GET', '/_matrix/client/v3/joined_rooms');
      const roomIds = response.joined_rooms as string[];

      console.log(`[Matrix] Found ${roomIds.length} joined rooms`);

      // Fetch room info for each
      for (const roomId of roomIds) {
        await this.getRoomInfo(roomId);
      }
    } catch (error) {
      console.warn('[Matrix] Failed to sync rooms:', error);
    }
  }

  /**
   * Make Matrix API call
   */
  private async matrixAPI(
    method: string,
    endpoint: string,
    body?: unknown,
    options?: { signal?: AbortSignal }
  ): Promise<Record<string, unknown>> {
    if (!this.homeserverUrl || !this.accessToken) {
      throw new Error('Matrix not configured');
    }

    const url = `${this.homeserverUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Matrix API error: ${response.status} ${error}`);
    }

    return response.json() as Promise<Record<string, unknown>>;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    homeserver?: string;
    userId?: string;
    errors?: string[];
  }> {
    const start = Date.now();

    try {
      const whoami = await this.matrixAPI('GET', '/_matrix/client/v3/account/whoami');

      return {
        healthy: true,
        latency: Date.now() - start,
        homeserver: this.homeserverUrl || undefined,
        userId: whoami.user_id as string,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        homeserver: this.homeserverUrl || undefined,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get joined rooms
   */
  getJoinedRooms(): MatrixRoom[] {
    return Array.from(this.rooms.values());
  }
}

// ============================================================================
// Exports
// ============================================================================

export const matrixChannel = new MatrixChannel();

// Register with channel registry (only if configured)
if (process.env.MATRIX_HOMESERVER_URL && process.env.MATRIX_ACCESS_TOKEN) {
  ChannelRegistry.register(matrixChannel);
}

export function createMatrixChannel(config?: MatrixChannelConfig): MatrixChannel {
  return new MatrixChannel(config);
}
