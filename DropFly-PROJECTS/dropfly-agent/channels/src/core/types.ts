/**
 * Unified message types for the channel bridge.
 *
 * Every adapter converts platform-specific messages into this format,
 * forwards to the gateway, and converts the response back.
 */

/** Supported messaging platforms */
export type ChannelType =
  | "whatsapp"
  | "telegram"
  | "slack"
  | "discord"
  | "webhook";

/** Inbound message from any channel */
export interface InboundMessage {
  /** Unique message ID from the platform */
  messageId: string;
  /** Which channel this came from */
  channel: ChannelType;
  /** Platform-specific user ID */
  userId: string;
  /** Display name (if available) */
  userName: string;
  /** The message text */
  text: string;
  /** Platform-specific conversation/thread ID */
  conversationId: string;
  /** DropFly session ID (mapped from conversation) */
  sessionId?: string;
  /** Timestamp */
  timestamp: Date;
  /** Attachments (URLs) */
  attachments?: Attachment[];
  /** Raw platform-specific data */
  raw?: unknown;
}

/** File attachment */
export interface Attachment {
  type: "image" | "file" | "audio" | "video";
  url: string;
  name?: string;
  mimeType?: string;
}

/** Response from the gateway to send back to the user */
export interface OutboundMessage {
  /** The response text */
  text: string;
  /** Session ID for continuing the conversation */
  sessionId: string;
  /** Which agent responded */
  agentType?: string;
  /** Whether the agent is done or expecting more input */
  done: boolean;
}

/** Channel adapter interface — each platform implements this */
export interface ChannelAdapter {
  /** Platform name */
  readonly name: ChannelType;
  /** Whether this adapter is configured and ready */
  readonly enabled: boolean;
  /** Start listening for messages */
  start(): Promise<void>;
  /** Stop the adapter */
  stop(): Promise<void>;
}

/** Configuration for the bridge */
export interface BridgeConfig {
  gatewayUrl: string;
  gatewayApiKey: string;
  bridgePort: number;
}
