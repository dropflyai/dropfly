/**
 * X2000 Channel System - Type Definitions
 *
 * Universal message format and type definitions for the multi-channel system.
 * This is the foundation that enables X2000 to communicate across 25+ platforms.
 */

import type { BrainType, TrustLevel } from '../types/index.js';

// ============================================================================
// Platform Types
// ============================================================================

/**
 * All supported platform types (25+)
 */
export type PlatformType =
  // Priority 0 (Done)
  | 'api'
  | 'discord'
  | 'slack'
  // Priority 1 (Design)
  | 'telegram'
  | 'whatsapp'
  | 'signal'
  // Priority 2 (Design)
  | 'imessage'
  | 'msteams'
  | 'matrix'
  // Priority 3 (Design)
  | 'sms'
  | 'voice'
  // Priority 4 (Design)
  | 'email'
  | 'irc'
  | 'mattermost'
  | 'googlechat'
  | 'line'
  | 'feishu'
  | 'twitch'
  | 'nostr'
  | 'zalo'
  | 'wechat'
  | 'nextcloud'
  | 'mumble'
  | 'rocketchat'
  | 'zulip';

// ============================================================================
// Unified Message Interface
// ============================================================================

/**
 * The universal message format for X2000.
 * All platform-specific messages convert to/from this format.
 */
export interface UnifiedMessage {
  // === Core Identity ===
  /** Unique message ID (UUID v7 for ordering) */
  id: string;
  /** Source platform */
  platform: PlatformType;

  // === Participants ===
  /** Who sent the message */
  sender: UnifiedParticipant;
  /** Where it's going (channel, DM, thread) */
  recipient: UnifiedRecipient;

  // === Content ===
  /** Text, rich text, or structured content */
  content: MessageContent;
  /** Files, images, voice, etc. */
  attachments: Attachment[];

  // === Threading ===
  /** Thread/conversation context */
  thread?: ThreadInfo;
  /** ID of message being replied to */
  replyTo?: string;

  // === Interactions ===
  /** Emoji reactions */
  reactions?: Reaction[];
  /** Interactive buttons (if supported) */
  buttons?: Button[];

  // === Metadata ===
  /** When sent */
  timestamp: Date;
  /** When edited (if edited) */
  editedAt?: Date;
  /** Auto-delete time (Signal, WhatsApp) */
  expiresAt?: Date;

  // === Platform-Specific ===
  /** Raw platform data (passthrough) */
  platformData: Record<string, unknown>;

  // === X2000 Context ===
  /** X2000 session for this conversation */
  sessionId: string;
  /** Which brain(s) should handle */
  brainContext?: BrainRoutingContext;
}

/**
 * Participant in a conversation
 */
export interface UnifiedParticipant {
  /** Platform-specific user ID */
  id: string;
  /** Cross-platform identifier (format: platform:id) */
  platformId: string;
  /** Human-readable name */
  displayName?: string;
  /** Avatar URL */
  avatar?: string;
  /** Is this a bot? */
  isBot: boolean;
  /** Platform-specific user data */
  metadata?: Record<string, unknown>;
}

/**
 * Message recipient (channel, DM, thread, group)
 */
export interface UnifiedRecipient {
  /** Type of recipient */
  type: 'channel' | 'dm' | 'thread' | 'group';
  /** Channel/DM/Group ID */
  id: string;
  /** Human-readable name */
  name?: string;
  /** Parent channel (for threads) */
  parentId?: string;
}

/**
 * Message content in various formats
 */
export interface MessageContent {
  /** Content type */
  type: 'text' | 'rich' | 'structured';
  /** Plain text */
  text?: string;
  /** Rich HTML (Slack blocks, Discord embeds) */
  html?: string;
  /** Markdown representation */
  markdown?: string;
  /** Cards, forms, etc. */
  structured?: StructuredContent;
}

/**
 * Structured content (cards, forms, lists)
 */
export interface StructuredContent {
  /** Type of structured content */
  type: 'card' | 'form' | 'list' | 'carousel';
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Key-value fields */
  fields?: Array<{ label: string; value: string }>;
  /** Action buttons */
  actions?: Button[];
  /** Items (for lists/carousels) */
  items?: StructuredContent[];
}

/**
 * File/media attachment
 */
export interface Attachment {
  /** Attachment ID */
  id: string;
  /** Attachment type */
  type: 'file' | 'image' | 'video' | 'audio' | 'voice' | 'location' | 'contact';
  /** File name */
  name: string;
  /** Remote URL */
  url?: string;
  /** Local data (base64) */
  data?: string;
  /** MIME type */
  mimeType?: string;
  /** Size in bytes */
  size?: number;
  /** Duration in seconds (for audio/video) */
  duration?: number;
  /** Thumbnail preview URL */
  thumbnail?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Thread/conversation info
 */
export interface ThreadInfo {
  /** Thread ID */
  id: string;
  /** Parent message ID */
  parentMessageId?: string;
  /** Number of participants */
  participantCount?: number;
  /** Number of messages in thread */
  messageCount?: number;
}

/**
 * Emoji reaction
 */
export interface Reaction {
  /** Unicode emoji or shortcode */
  emoji: string;
  /** User who reacted */
  userId: string;
  /** When the reaction was added */
  timestamp: Date;
}

/**
 * Interactive button
 */
export interface Button {
  /** Button ID */
  id: string;
  /** Button label */
  label: string;
  /** Button type */
  type: 'url' | 'callback' | 'action';
  /** URL or callback data */
  value?: string;
  /** Button style */
  style?: 'primary' | 'secondary' | 'danger';
}

/**
 * Brain routing context
 */
export interface BrainRoutingContext {
  /** Specific brain to route to */
  targetBrain?: BrainType;
  /** User's trust level */
  trustLevel: TrustLevel;
  /** Recent message IDs for context */
  sessionHistory?: string[];
}

// ============================================================================
// Unified Response Interface
// ============================================================================

/**
 * The universal response format from X2000.
 */
export interface UnifiedResponse {
  /** Response content */
  content: MessageContent;
  /** Response attachments */
  attachments?: Attachment[];
  /** Interactive buttons */
  buttons?: Button[];

  // === Response Options ===
  /** Create/continue thread */
  replyInThread?: boolean;
  /** @mention the sender */
  mentionSender?: boolean;
  /** Only visible to sender (Slack, Discord) */
  ephemeral?: boolean;

  // === Metadata ===
  /** Which brain processed this */
  brainUsed: BrainType;
  /** Processing time in milliseconds */
  processingTime: number;
  /** LLM tokens consumed */
  tokensUsed?: number;

  // === Platform Hints ===
  /** Platform-specific formatting hints */
  platformHints?: PlatformHints;
}

/**
 * Platform-specific hints for response formatting
 */
export interface PlatformHints {
  telegram?: { parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2' };
  discord?: { embed?: boolean };
  slack?: { unfurlLinks?: boolean };
  whatsapp?: { previewUrl?: boolean };
  [platform: string]: Record<string, unknown> | undefined;
}

// ============================================================================
// Channel Capabilities
// ============================================================================

/**
 * Platform capability matrix.
 * Each platform declares what it supports.
 */
export interface ChannelCapabilities {
  // === Text Features ===
  /** Supports Markdown formatting */
  supportsMarkdown: boolean;
  /** Supports HTML formatting */
  supportsHTML: boolean;
  /** Supports rich text (blocks, embeds) */
  supportsRichText: boolean;
  /** Maximum message length */
  maxMessageLength: number;

  // === Threading ===
  /** Supports threaded conversations */
  supportsThreads: boolean;
  /** Supports message replies */
  supportsReplies: boolean;

  // === Attachments ===
  /** Supports file attachments */
  supportsFiles: boolean;
  /** Supports images */
  supportsImages: boolean;
  /** Supports voice messages */
  supportsVoice: boolean;
  /** Supports video */
  supportsVideo: boolean;
  /** Supports location sharing */
  supportsLocation: boolean;
  /** Maximum attachment size in bytes */
  maxAttachmentSize: number;

  // === Interactions ===
  /** Supports emoji reactions */
  supportsReactions: boolean;
  /** Supports interactive buttons */
  supportsButtons: boolean;
  /** Supports cards/embeds */
  supportsCards: boolean;

  // === Real-time ===
  /** Supports typing indicator */
  supportsTypingIndicator: boolean;
  /** Supports read receipts */
  supportsReadReceipts: boolean;
  /** Supports message editing */
  supportsMessageEdit: boolean;
  /** Supports message deletion */
  supportsMessageDelete: boolean;

  // === Security ===
  /** Supports end-to-end encryption */
  supportsE2EEncryption: boolean;
  /** Supports disappearing messages */
  supportsDisappearingMessages: boolean;
}

// ============================================================================
// Channel Health
// ============================================================================

/**
 * Channel health status
 */
export type ChannelStatus = 'disconnected' | 'connecting' | 'connected' | 'degraded' | 'error';

/**
 * Health check result
 */
export interface HealthCheckResult {
  /** Is the channel healthy? */
  healthy: boolean;
  /** Latency in milliseconds */
  latency: number;
  /** Error messages if unhealthy */
  errors?: string[];
  /** Last successful operation timestamp */
  lastSuccessfulOperation?: Date;
}

/**
 * Channel health metrics
 */
export interface ChannelHealth {
  /** Channel platform */
  platform: PlatformType;
  /** Current status */
  status: ChannelStatus;
  /** Health score (0-100) */
  healthScore: number;
  /** Last health check result */
  lastCheck?: HealthCheckResult;
  /** Last heartbeat timestamp */
  lastHeartbeat?: Date;
  /** Consecutive failures count */
  consecutiveFailures: number;
  /** Circuit breaker state */
  circuitState: 'closed' | 'open' | 'half-open';
}

// ============================================================================
// Channel Configuration
// ============================================================================

/**
 * Channel adapter configuration
 */
export interface ChannelConfig {
  /** Unique channel ID */
  id: string;
  /** Platform type */
  platform: PlatformType;
  /** Human-readable name */
  name: string;
  /** Is the channel enabled? */
  enabled: boolean;
  /** Default brain for this channel */
  defaultBrain: BrainType;
  /** Trust level for users on this channel */
  trustLevel: TrustLevel;
  /** Channel credentials */
  credentials: Record<string, string>;
  /** Behavioral settings */
  behavior: ChannelBehavior;
  /** Platform-specific configuration */
  platformConfig?: Record<string, unknown>;
}

/**
 * Channel behavioral settings
 */
export interface ChannelBehavior {
  /** Only respond when mentioned */
  mentionOnly?: boolean;
  /** Allowed user IDs (null = all) */
  allowedUsers?: string[];
  /** Allowed channel IDs (null = all) */
  allowedChannels?: string[];
  /** Maximum messages per minute */
  rateLimit?: number;
  /** Auto-reply to mentions */
  autoReply?: boolean;
}

// ============================================================================
// Channel Adapter Interface
// ============================================================================

/**
 * Send message result
 */
export interface SendResult {
  /** Was the send successful? */
  success: boolean;
  /** Platform message ID */
  messageId?: string;
  /** Error message if failed */
  error?: string;
  /** Seconds until retry allowed (rate limited) */
  retryAfter?: number;
}

/**
 * Channel adapter interface.
 * Every channel adapter must implement this contract.
 */
export interface ChannelAdapter {
  // === Identity ===
  /** Platform type */
  readonly platform: PlatformType;
  /** Human-readable name */
  readonly name: string;
  /** Platform capabilities */
  readonly capabilities: ChannelCapabilities;

  // === State ===
  /** Get current status */
  getStatus(): ChannelStatus;
  /** Get health score (0-100) */
  getHealthScore(): number;

  // === Lifecycle ===
  /** Initialize the adapter */
  initialize(config: ChannelConfig): Promise<void>;
  /** Shutdown the adapter */
  shutdown(): Promise<void>;
  /** Perform health check */
  healthCheck(): Promise<HealthCheckResult>;

  // === Messaging ===
  /** Receive messages (async generator) */
  receiveMessages(): AsyncGenerator<UnifiedMessage, void, unknown>;
  /** Send a message */
  sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult>;

  // === Optional Features (implemented if supported) ===
  /** Send typing indicator */
  sendTypingIndicator?(recipient: UnifiedRecipient, duration?: number): Promise<void>;
  /** Mark message as read */
  markAsRead?(messageId: string): Promise<void>;
  /** Edit a message */
  editMessage?(messageId: string, newContent: MessageContent): Promise<void>;
  /** Delete a message */
  deleteMessage?(messageId: string): Promise<void>;
  /** Add reaction to message */
  addReaction?(messageId: string, emoji: string): Promise<void>;
  /** Remove reaction from message */
  removeReaction?(messageId: string, emoji: string): Promise<void>;
}

// ============================================================================
// Default Capabilities
// ============================================================================

/**
 * Default capabilities for unknown platforms
 */
export const DEFAULT_CAPABILITIES: ChannelCapabilities = {
  supportsMarkdown: false,
  supportsHTML: false,
  supportsRichText: false,
  maxMessageLength: 2000,
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

/**
 * Pre-defined capabilities for major platforms
 */
export const PLATFORM_CAPABILITIES: Partial<Record<PlatformType, ChannelCapabilities>> = {
  telegram: {
    supportsMarkdown: true,
    supportsHTML: true,
    supportsRichText: false,
    maxMessageLength: 4096,
    supportsThreads: false,
    supportsReplies: true,
    supportsFiles: true,
    supportsImages: true,
    supportsVoice: true,
    supportsVideo: true,
    supportsLocation: true,
    maxAttachmentSize: 50 * 1024 * 1024,
    supportsReactions: true,
    supportsButtons: true,
    supportsCards: false,
    supportsTypingIndicator: true,
    supportsReadReceipts: false,
    supportsMessageEdit: true,
    supportsMessageDelete: true,
    supportsE2EEncryption: false,
    supportsDisappearingMessages: true,
  },
  signal: {
    supportsMarkdown: false,
    supportsHTML: false,
    supportsRichText: false,
    maxMessageLength: 8000,
    supportsThreads: false,
    supportsReplies: true,
    supportsFiles: true,
    supportsImages: true,
    supportsVoice: true,
    supportsVideo: true,
    supportsLocation: true,
    maxAttachmentSize: 100 * 1024 * 1024,
    supportsReactions: true,
    supportsButtons: false,
    supportsCards: false,
    supportsTypingIndicator: true,
    supportsReadReceipts: true,
    supportsMessageEdit: false,
    supportsMessageDelete: true,
    supportsE2EEncryption: true,
    supportsDisappearingMessages: true,
  },
  whatsapp: {
    supportsMarkdown: false,
    supportsHTML: false,
    supportsRichText: false,
    maxMessageLength: 4096,
    supportsThreads: false,
    supportsReplies: true,
    supportsFiles: true,
    supportsImages: true,
    supportsVoice: true,
    supportsVideo: true,
    supportsLocation: true,
    maxAttachmentSize: 100 * 1024 * 1024,
    supportsReactions: true,
    supportsButtons: true,
    supportsCards: true,
    supportsTypingIndicator: false,
    supportsReadReceipts: true,
    supportsMessageEdit: false,
    supportsMessageDelete: false,
    supportsE2EEncryption: true,
    supportsDisappearingMessages: true,
  },
  discord: {
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
    maxAttachmentSize: 8 * 1024 * 1024,
    supportsReactions: true,
    supportsButtons: true,
    supportsCards: true,
    supportsTypingIndicator: true,
    supportsReadReceipts: false,
    supportsMessageEdit: true,
    supportsMessageDelete: true,
    supportsE2EEncryption: false,
    supportsDisappearingMessages: false,
  },
  slack: {
    supportsMarkdown: true,
    supportsHTML: false,
    supportsRichText: true,
    maxMessageLength: 40000,
    supportsThreads: true,
    supportsReplies: true,
    supportsFiles: true,
    supportsImages: true,
    supportsVoice: false,
    supportsVideo: false,
    supportsLocation: false,
    maxAttachmentSize: 1 * 1024 * 1024 * 1024,
    supportsReactions: true,
    supportsButtons: true,
    supportsCards: true,
    supportsTypingIndicator: false,
    supportsReadReceipts: false,
    supportsMessageEdit: true,
    supportsMessageDelete: true,
    supportsE2EEncryption: false,
    supportsDisappearingMessages: false,
  },
  msteams: {
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
    maxAttachmentSize: 25 * 1024 * 1024,
    supportsReactions: true,
    supportsButtons: true,
    supportsCards: true,
    supportsTypingIndicator: true,
    supportsReadReceipts: false,
    supportsMessageEdit: true,
    supportsMessageDelete: true,
    supportsE2EEncryption: false,
    supportsDisappearingMessages: false,
  },
  matrix: {
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
    maxAttachmentSize: 100 * 1024 * 1024,
    supportsReactions: true,
    supportsButtons: false,
    supportsCards: false,
    supportsTypingIndicator: true,
    supportsReadReceipts: true,
    supportsMessageEdit: true,
    supportsMessageDelete: true,
    supportsE2EEncryption: true,
    supportsDisappearingMessages: false,
  },
  imessage: {
    supportsMarkdown: false,
    supportsHTML: false,
    supportsRichText: false,
    maxMessageLength: 20000,
    supportsThreads: false,
    supportsReplies: true,
    supportsFiles: true,
    supportsImages: true,
    supportsVoice: true,
    supportsVideo: true,
    supportsLocation: true,
    maxAttachmentSize: 100 * 1024 * 1024,
    supportsReactions: true,
    supportsButtons: false,
    supportsCards: false,
    supportsTypingIndicator: true,
    supportsReadReceipts: true,
    supportsMessageEdit: true,
    supportsMessageDelete: true,
    supportsE2EEncryption: true,
    supportsDisappearingMessages: false,
  },
  sms: {
    supportsMarkdown: false,
    supportsHTML: false,
    supportsRichText: false,
    maxMessageLength: 1600,
    supportsThreads: false,
    supportsReplies: false,
    supportsFiles: false,
    supportsImages: true,
    supportsVoice: false,
    supportsVideo: false,
    supportsLocation: false,
    maxAttachmentSize: 5 * 1024 * 1024,
    supportsReactions: false,
    supportsButtons: false,
    supportsCards: false,
    supportsTypingIndicator: false,
    supportsReadReceipts: false,
    supportsMessageEdit: false,
    supportsMessageDelete: false,
    supportsE2EEncryption: false,
    supportsDisappearingMessages: false,
  },
  email: {
    supportsMarkdown: false,
    supportsHTML: true,
    supportsRichText: true,
    maxMessageLength: Infinity,
    supportsThreads: true,
    supportsReplies: true,
    supportsFiles: true,
    supportsImages: true,
    supportsVoice: false,
    supportsVideo: false,
    supportsLocation: false,
    maxAttachmentSize: 25 * 1024 * 1024,
    supportsReactions: false,
    supportsButtons: false,
    supportsCards: false,
    supportsTypingIndicator: false,
    supportsReadReceipts: true,
    supportsMessageEdit: false,
    supportsMessageDelete: false,
    supportsE2EEncryption: true,
    supportsDisappearingMessages: false,
  },
};

// ============================================================================
// Message Bus Types
// ============================================================================

/**
 * Message bus event types
 */
export type MessageBusEventType =
  | 'message:inbound'
  | 'message:outbound'
  | 'message:sent'
  | 'message:failed'
  | 'message:delivered'
  | 'message:read'
  | 'reaction:added'
  | 'reaction:removed'
  | 'typing:started'
  | 'typing:stopped'
  | 'channel:connected'
  | 'channel:disconnected'
  | 'channel:error'
  | 'channel:health';

/**
 * Message bus event
 */
export interface MessageBusEvent<T = unknown> {
  /** Event ID */
  id: string;
  /** Event type */
  type: MessageBusEventType;
  /** Source platform */
  platform: PlatformType;
  /** Event timestamp */
  timestamp: Date;
  /** Event data */
  data: T;
}

/**
 * Message bus listener
 */
export type MessageBusListener<T = unknown> = (event: MessageBusEvent<T>) => void | Promise<void>;

// ============================================================================
// Auth Types
// ============================================================================

/**
 * Credential types for different auth methods
 */
export type CredentialType = 'bot_token' | 'oauth' | 'api_key' | 'password' | 'qr_code' | 'phone';

/**
 * Channel credentials
 */
export interface ChannelCredentials {
  /** Credential type */
  type: CredentialType;
  /** Bot/API token */
  token?: string;
  /** OAuth access token */
  accessToken?: string;
  /** OAuth refresh token */
  refreshToken?: string;
  /** API key */
  apiKey?: string;
  /** Password/secret */
  password?: string;
  /** Phone number (Signal, WhatsApp) */
  phoneNumber?: string;
  /** Token expiration time */
  expiresAt?: Date;
  /** Additional credential data */
  [key: string]: unknown;
}

/**
 * OAuth configuration
 */
export interface OAuthConfig {
  /** OAuth authorization URL */
  authUrl: string;
  /** Token exchange URL */
  tokenUrl: string;
  /** Client ID */
  clientId: string;
  /** Client secret */
  clientSecret: string;
  /** Required scopes */
  scopes: string[];
  /** Redirect URI */
  redirectUri?: string;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

/**
 * Rate limit configuration per platform
 */
export interface RateLimitConfig {
  /** Platform type */
  platform: PlatformType;
  /** Requests per second */
  requestsPerSecond: number;
  /** Burst capacity */
  burstCapacity: number;
  /** Global rate limit (shared across all channels) */
  globalLimit?: number;
  /** Per-channel limits */
  perChannelLimit?: number;
  /** Per-user limits */
  perUserLimit?: number;
}

/**
 * Rate limit state
 */
export interface RateLimitState {
  /** Available tokens */
  tokens: number;
  /** Last refill time */
  lastRefill: number;
  /** Backoff state */
  backoff?: BackoffState;
}

/**
 * Exponential backoff state
 */
export interface BackoffState {
  /** Current attempt number */
  attempt: number;
  /** Time until retry allowed (ms since epoch) */
  retryAfter: number;
}

// ============================================================================
// Metrics Types
// ============================================================================

/**
 * Channel metrics
 */
export interface ChannelMetrics {
  /** Platform type */
  platform: PlatformType;
  /** Messages received */
  messagesReceived: number;
  /** Messages sent */
  messagesSent: number;
  /** Failed sends */
  failedSends: number;
  /** Average latency (ms) */
  avgLatency: number;
  /** Rate limit hits */
  rateLimitHits: number;
  /** Errors encountered */
  errors: number;
  /** Last updated */
  lastUpdated: Date;
}
