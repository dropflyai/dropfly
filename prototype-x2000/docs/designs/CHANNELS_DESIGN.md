# X2000 Multi-Channel Architecture Design

> **Superior to OpenClaw's 20+ Channels — By Design**

**Version:** 1.0
**Date:** 2026-03-09
**Status:** Design Document

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [OpenClaw Analysis](#openclaw-analysis)
3. [X2000 Architecture Design](#x2000-architecture-design)
4. [Unified Message Abstraction](#unified-message-abstraction)
5. [Channel Adapter Design](#channel-adapter-design)
6. [Platform-Specific Implementations](#platform-specific-implementations)
7. [Authentication & Security](#authentication--security)
8. [Rate Limiting & Resilience](#rate-limiting--resilience)
9. [Implementation Priority](#implementation-priority)
10. [Why X2000 is Superior](#why-x2000-is-superior)

---

## Executive Summary

This document defines X2000's multi-channel architecture that will surpass OpenClaw's 20+ channel support. The design follows the **Channel Adapter Pattern** from Enterprise Integration Patterns, providing:

- **Unified Message Interface** — One data model for all platforms
- **Plug-and-Play Adapters** — Add new channels in < 100 lines
- **Graceful Degradation** — Platform features map to common interface
- **Centralized Auth Management** — Unified credential handling
- **Intelligent Rate Limiting** — Per-platform adaptive throttling
- **Brain-Routed Processing** — All messages flow through CEO Brain

### Target Channels (25+)

| Priority | Channel | Complexity | Status |
|----------|---------|------------|--------|
| P0 | HTTP API | Low | DONE |
| P0 | Discord | Medium | DONE |
| P0 | Slack | Medium | DONE |
| P1 | Telegram | Low | Design |
| P1 | WhatsApp | High | Design |
| P1 | Signal | High | Design |
| P2 | iMessage | High | Design |
| P2 | MS Teams | Medium | Design |
| P2 | Matrix | Medium | Design |
| P3 | SMS/Twilio | Low | Design |
| P3 | Voice/WebRTC | High | Design |
| P4 | Email | Low | Design |
| P4 | IRC | Low | Design |
| P4 | Mattermost | Low | Design |
| P4 | Google Chat | Medium | Design |
| P4 | Line | Medium | Design |
| P4 | Feishu/Lark | Medium | Design |
| P4 | Twitch | Low | Design |
| P4 | Nostr | Medium | Design |
| P4 | Zalo | Medium | Design |
| P4 | WeChat | High | Design |
| P4 | Nextcloud Talk | Low | Design |
| P4 | Mumble | Low | Design |
| P4 | Rocketchat | Low | Design |
| P4 | Zulip | Low | Design |

---

## OpenClaw Analysis

### How OpenClaw Handles Multi-Channel

OpenClaw runs as a **single Node.js Gateway process** listening on `127.0.0.1:18789`. Each messaging platform gets a dedicated adapter that implements a common interface.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        OPENCLAW GATEWAY                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    ADAPTER LAYER                                │     │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │     │
│  │  │Telegram│ │Discord│ │Slack │ │Signal│ │iMessage│ │WhatsApp│        │     │
│  │  │grammY  │ │discord.js│ │Bolt│ │signal-cli│ │BlueBubbles│ │Baileys│        │     │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                 MESSAGE NORMALIZATION                           │     │
│  │  Platform Message → Normalized Format → AI Agent               │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                      SESSION STORE                              │     │
│  │  Cross-channel identity │ Shared context │ Memory              │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### OpenClaw's Key Design Decisions

1. **Long-polling as default** — No webhook infrastructure required for Telegram
2. **Baileys for WhatsApp** — Unofficial Web API, QR code auth
3. **signal-cli for Signal** — Java daemon with JSON-RPC interface
4. **BlueBubbles for iMessage** — Mac server with REST API
5. **Extensions for less common channels** — Plugin system

### OpenClaw Weaknesses

| Weakness | Impact |
|----------|--------|
| Single-threaded gateway | One slow channel blocks others |
| No channel health monitoring | Silent failures |
| No graceful degradation | Features lost without fallback |
| No unified retry logic | Per-adapter custom backoff |
| No credential rotation | Manual token refresh |
| No rate limit coordination | Per-channel limits not shared |

---

## X2000 Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           X2000 CHANNEL SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         CHANNEL ORCHESTRATOR                              │   │
│  │  Health Monitoring │ Load Balancing │ Failover │ Metrics                 │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                           │
│         ┌────────────────────────────┼────────────────────────────┐             │
│         ▼                            ▼                            ▼             │
│  ┌─────────────┐             ┌─────────────┐             ┌─────────────┐        │
│  │ INBOUND BUS │             │ OUTBOUND BUS│             │ EVENT BUS   │        │
│  │  (Receive)  │             │   (Send)    │             │ (Webhooks)  │        │
│  └──────┬──────┘             └──────┬──────┘             └──────┬──────┘        │
│         │                           │                           │               │
│  ┌──────┴─────────────────────────────────────────────────────────────────┐     │
│  │                      UNIFIED MESSAGE LAYER                              │     │
│  │                                                                         │     │
│  │   UnifiedMessage {                                                      │     │
│  │     id, platform, sender, recipient, content,                          │     │
│  │     thread?, attachments?, reactions?, metadata                        │     │
│  │   }                                                                     │     │
│  │                                                                         │     │
│  └──────┬─────────────────────────────────────────────────────────────────┘     │
│         │                                                                        │
│  ┌──────┴─────────────────────────────────────────────────────────────────┐     │
│  │                       CHANNEL ADAPTER LAYER                             │     │
│  │                                                                         │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │     │
│  │  │Telegram │ │WhatsApp │ │ Signal  │ │iMessage │ │MS Teams │  ...      │     │
│  │  │Adapter  │ │Adapter  │ │Adapter  │ │Adapter  │ │Adapter  │           │     │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │     │
│  │       │           │           │           │           │                 │     │
│  │       ▼           ▼           ▼           ▼           ▼                 │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │     │
│  │  │Transport│ │Transport│ │Transport│ │Transport│ │Transport│           │     │
│  │  │ grammY  │ │ Cloud   │ │signal-  │ │BlueBub  │ │Bot Frmwk│           │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │     │
│  │                                                                         │     │
│  └─────────────────────────────────────────────────────────────────────────┘     │
│                                      │                                           │
│                                      ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                           AUTH MANAGER                                    │   │
│  │  OAuth Flows │ Token Refresh │ API Keys │ Credentials Vault              │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                           │
│                                      ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         RATE LIMIT MANAGER                                │   │
│  │  Per-Platform Limits │ Token Bucket │ Exponential Backoff │ Jitter       │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              X2000 BRAIN SYSTEM                                  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                            CEO BRAIN                                      │   │
│  │  Task Decomposition │ Brain Routing │ Memory Query │ Response Synthesis  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                           │
│         ┌────────────────────────────┼────────────────────────────┐             │
│         ▼                            ▼                            ▼             │
│  ┌─────────────┐             ┌─────────────┐             ┌─────────────┐        │
│  │ Engineering │             │  Marketing  │             │    Sales    │  + 34  │
│  │    Brain    │             │    Brain    │             │    Brain    │  more  │
│  └─────────────┘             └─────────────┘             └─────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Message-First Architecture** — Everything is a UnifiedMessage
2. **Adapter Isolation** — Each channel runs in its own async context
3. **Feature Negotiation** — Adapters declare capabilities, system adapts
4. **Health-Aware Routing** — Unhealthy channels get bypassed
5. **Brain Integration** — All messages route through CEO Brain
6. **Memory-Backed** — Conversations persist in Forever Memory

---

## Unified Message Abstraction

### UnifiedMessage Interface

```typescript
/**
 * The universal message format for X2000.
 * All platform-specific messages convert to/from this format.
 */
interface UnifiedMessage {
  // === Core Identity ===
  id: string;                           // Unique message ID (UUID v7 for ordering)
  platform: PlatformType;               // Source platform

  // === Participants ===
  sender: UnifiedParticipant;           // Who sent the message
  recipient: UnifiedRecipient;          // Where it's going (channel, DM, thread)

  // === Content ===
  content: MessageContent;              // Text, rich text, or structured
  attachments: Attachment[];            // Files, images, voice, etc.

  // === Threading ===
  thread?: ThreadInfo;                  // Thread/conversation context
  replyTo?: string;                     // ID of message being replied to

  // === Interactions ===
  reactions?: Reaction[];               // Emoji reactions
  buttons?: Button[];                   // Interactive buttons (if supported)

  // === Metadata ===
  timestamp: Date;                      // When sent
  editedAt?: Date;                      // When edited (if edited)
  expiresAt?: Date;                     // Auto-delete (Signal, WhatsApp)

  // === Platform-Specific ===
  platformData: Record<string, unknown>; // Raw platform data (passthrough)

  // === X2000 Context ===
  sessionId: string;                    // X2000 session for this conversation
  brainContext?: BrainContext;          // Which brain(s) should handle
}

type PlatformType =
  | 'telegram' | 'whatsapp' | 'signal' | 'imessage'
  | 'msteams' | 'matrix' | 'discord' | 'slack'
  | 'sms' | 'voice' | 'email' | 'api'
  | 'irc' | 'mattermost' | 'googlechat' | 'line'
  | 'feishu' | 'twitch' | 'nostr' | 'zalo'
  | 'wechat' | 'nextcloud' | 'mumble' | 'rocketchat' | 'zulip';

interface UnifiedParticipant {
  id: string;                           // Platform-specific user ID
  platformId: string;                   // Cross-platform identifier
  displayName?: string;                 // Human-readable name
  avatar?: string;                      // Avatar URL
  isBot: boolean;                       // Is this a bot?
  metadata?: Record<string, unknown>;   // Platform-specific user data
}

interface UnifiedRecipient {
  type: 'channel' | 'dm' | 'thread' | 'group';
  id: string;                           // Channel/DM/Group ID
  name?: string;                        // Human-readable name
  parentId?: string;                    // Parent channel (for threads)
}

interface MessageContent {
  type: 'text' | 'rich' | 'structured';
  text?: string;                        // Plain text
  html?: string;                        // Rich HTML (Slack blocks, Discord embeds)
  markdown?: string;                    // Markdown representation
  structured?: StructuredContent;       // Cards, forms, etc.
}

interface StructuredContent {
  type: 'card' | 'form' | 'list' | 'carousel';
  title?: string;
  description?: string;
  fields?: Array<{ label: string; value: string }>;
  actions?: Button[];
  items?: StructuredContent[];          // For lists/carousels
}

interface Attachment {
  id: string;
  type: 'file' | 'image' | 'video' | 'audio' | 'voice' | 'location' | 'contact';
  name: string;
  url?: string;                         // Remote URL
  data?: Buffer;                        // Local data
  mimeType?: string;
  size?: number;
  duration?: number;                    // For audio/video
  thumbnail?: string;                   // Preview URL
  metadata?: Record<string, unknown>;
}

interface ThreadInfo {
  id: string;
  parentMessageId?: string;
  participantCount?: number;
  messageCount?: number;
}

interface Reaction {
  emoji: string;                        // Unicode emoji or shortcode
  userId: string;
  timestamp: Date;
}

interface Button {
  id: string;
  label: string;
  type: 'url' | 'callback' | 'action';
  value?: string;                       // URL or callback data
  style?: 'primary' | 'secondary' | 'danger';
}

interface BrainContext {
  targetBrain?: BrainType;              // Specific brain to route to
  trustLevel: number;                   // User's trust level
  sessionHistory?: string[];            // Recent message IDs for context
}
```

### UnifiedResponse Interface

```typescript
/**
 * The universal response format from X2000.
 */
interface UnifiedResponse {
  content: MessageContent;
  attachments?: Attachment[];
  buttons?: Button[];

  // === Response Options ===
  replyInThread?: boolean;              // Create/continue thread
  mentionSender?: boolean;              // @mention the sender
  ephemeral?: boolean;                  // Only visible to sender (Slack, Discord)

  // === Metadata ===
  brainUsed: BrainType;                 // Which brain processed this
  processingTime: number;               // Milliseconds
  tokensUsed?: number;                  // LLM tokens consumed

  // === Platform Hints ===
  platformHints?: {
    telegram?: { parseMode?: 'HTML' | 'Markdown' };
    discord?: { embed?: boolean };
    slack?: { unfurlLinks?: boolean };
    [platform: string]: Record<string, unknown> | undefined;
  };
}
```

### Feature Capability Matrix

```typescript
/**
 * Each platform declares what it supports.
 * The system adapts message formatting accordingly.
 */
interface PlatformCapabilities {
  // Text features
  supportsMarkdown: boolean;
  supportsHTML: boolean;
  supportsRichText: boolean;
  maxMessageLength: number;

  // Threading
  supportsThreads: boolean;
  supportsReplies: boolean;

  // Attachments
  supportsFiles: boolean;
  supportsImages: boolean;
  supportsVoice: boolean;
  supportsVideo: boolean;
  supportsLocation: boolean;
  maxAttachmentSize: number;            // Bytes

  // Interactions
  supportsReactions: boolean;
  supportsButtons: boolean;
  supportsCards: boolean;

  // Real-time
  supportsTypingIndicator: boolean;
  supportsReadReceipts: boolean;
  supportsMessageEdit: boolean;
  supportsMessageDelete: boolean;

  // Security
  supportsE2EEncryption: boolean;
  supportsDisappearingMessages: boolean;
}

// Example: Telegram capabilities
const TELEGRAM_CAPABILITIES: PlatformCapabilities = {
  supportsMarkdown: true,
  supportsHTML: true,
  supportsRichText: false,
  maxMessageLength: 4096,
  supportsThreads: false,               // Telegram has reply chains, not threads
  supportsReplies: true,
  supportsFiles: true,
  supportsImages: true,
  supportsVoice: true,
  supportsVideo: true,
  supportsLocation: true,
  maxAttachmentSize: 50 * 1024 * 1024,  // 50MB
  supportsReactions: true,
  supportsButtons: true,                // Inline keyboards
  supportsCards: false,
  supportsTypingIndicator: true,
  supportsReadReceipts: false,
  supportsMessageEdit: true,
  supportsMessageDelete: true,
  supportsE2EEncryption: false,         // Optional secret chats
  supportsDisappearingMessages: true,
};

// Example: Signal capabilities
const SIGNAL_CAPABILITIES: PlatformCapabilities = {
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
  maxAttachmentSize: 100 * 1024 * 1024, // 100MB
  supportsReactions: true,
  supportsButtons: false,
  supportsCards: false,
  supportsTypingIndicator: true,
  supportsReadReceipts: true,
  supportsMessageEdit: false,
  supportsMessageDelete: true,
  supportsE2EEncryption: true,          // Always E2E
  supportsDisappearingMessages: true,
};
```

---

## Channel Adapter Design

### Base Adapter Interface

```typescript
/**
 * Every channel adapter implements this interface.
 * This is the contract that makes adding new channels trivial.
 */
abstract class ChannelAdapter {
  // === Identity ===
  abstract readonly platform: PlatformType;
  abstract readonly name: string;
  abstract readonly capabilities: PlatformCapabilities;

  // === State ===
  protected status: ChannelStatus = 'disconnected';
  protected healthScore: number = 100;
  protected lastHeartbeat: Date | null = null;

  // === Lifecycle ===
  abstract initialize(config: AdapterConfig): Promise<void>;
  abstract shutdown(): Promise<void>;
  abstract healthCheck(): Promise<HealthCheckResult>;

  // === Messaging ===
  abstract receiveMessages(): AsyncGenerator<UnifiedMessage>;
  abstract sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult>;

  // === Optional Features ===
  async sendTypingIndicator?(recipient: UnifiedRecipient, duration?: number): Promise<void>;
  async markAsRead?(messageId: string): Promise<void>;
  async editMessage?(messageId: string, newContent: MessageContent): Promise<void>;
  async deleteMessage?(messageId: string): Promise<void>;
  async addReaction?(messageId: string, emoji: string): Promise<void>;

  // === Conversion ===
  protected abstract toUnified(platformMessage: unknown): UnifiedMessage;
  protected abstract fromUnified(message: UnifiedResponse): unknown;

  // === Status ===
  getStatus(): ChannelStatus { return this.status; }
  getHealthScore(): number { return this.healthScore; }
}

type ChannelStatus = 'disconnected' | 'connecting' | 'connected' | 'degraded' | 'error';

interface HealthCheckResult {
  healthy: boolean;
  latency: number;                      // Milliseconds
  errors?: string[];
  lastSuccessfulOperation?: Date;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryAfter?: number;                  // Seconds until retry
}

interface AdapterConfig {
  // Common config
  enabled: boolean;
  defaultBrain: BrainType;
  trustLevel: number;

  // Auth (varies by platform)
  credentials: Record<string, string>;

  // Behavior
  mentionOnly?: boolean;
  allowedUsers?: string[];
  allowedChannels?: string[];

  // Platform-specific
  platformConfig?: Record<string, unknown>;
}
```

### Adapter Template (< 100 Lines Goal)

Here's the template for creating a new channel adapter. The goal is that most adapters can be implemented in under 100 lines by leveraging the base class.

```typescript
/**
 * Template for a new channel adapter.
 * Copy this file and implement the abstract methods.
 */
import {
  ChannelAdapter,
  type PlatformCapabilities,
  type AdapterConfig,
  type UnifiedMessage,
  type UnifiedResponse,
  type UnifiedRecipient,
  type HealthCheckResult,
  type SendResult,
} from './base.js';

export class NewPlatformAdapter extends ChannelAdapter {
  // === Identity ===
  readonly platform = 'newplatform' as const;
  readonly name = 'New Platform';
  readonly capabilities: PlatformCapabilities = {
    // Fill in platform capabilities
    supportsMarkdown: true,
    supportsHTML: false,
    // ... etc
  };

  // === Platform Client ===
  private client: PlatformClient | null = null;

  // === Lifecycle ===
  async initialize(config: AdapterConfig): Promise<void> {
    this.status = 'connecting';

    // Initialize platform client
    this.client = new PlatformClient(config.credentials);
    await this.client.connect();

    this.status = 'connected';
    this.lastHeartbeat = new Date();
  }

  async shutdown(): Promise<void> {
    await this.client?.disconnect();
    this.client = null;
    this.status = 'disconnected';
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await this.client?.ping();
      return {
        healthy: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // === Messaging ===
  async *receiveMessages(): AsyncGenerator<UnifiedMessage> {
    if (!this.client) return;

    for await (const platformMsg of this.client.messages()) {
      yield this.toUnified(platformMsg);
    }
  }

  async sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult> {
    if (!this.client) {
      return { success: false, error: 'Not connected' };
    }

    try {
      const platformMsg = this.fromUnified(message);
      const result = await this.client.send(recipient.id, platformMsg);

      return {
        success: true,
        messageId: result.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Send failed',
      };
    }
  }

  // === Conversion ===
  protected toUnified(platformMessage: PlatformMessage): UnifiedMessage {
    return {
      id: platformMessage.id,
      platform: this.platform,
      sender: {
        id: platformMessage.from.id,
        platformId: `${this.platform}:${platformMessage.from.id}`,
        displayName: platformMessage.from.name,
        isBot: platformMessage.from.isBot || false,
      },
      recipient: {
        type: 'channel',
        id: platformMessage.chat.id,
        name: platformMessage.chat.name,
      },
      content: {
        type: 'text',
        text: platformMessage.text,
      },
      attachments: [],
      timestamp: new Date(platformMessage.timestamp),
      platformData: platformMessage,
      sessionId: `${this.platform}-${platformMessage.chat.id}-${platformMessage.from.id}`,
    };
  }

  protected fromUnified(message: UnifiedResponse): PlatformMessage {
    return {
      text: message.content.text || message.content.markdown || '',
      // Map other fields as needed
    };
  }
}
```

---

## Platform-Specific Implementations

### Telegram Adapter

**Library:** [grammY](https://grammy.dev/)
**Mode:** Long-polling (default) or Webhooks (production)
**Complexity:** Low

```typescript
import { Bot, Context } from 'grammy';

export class TelegramAdapter extends ChannelAdapter {
  readonly platform = 'telegram';
  readonly name = 'Telegram';
  readonly capabilities = TELEGRAM_CAPABILITIES;

  private bot: Bot | null = null;

  async initialize(config: AdapterConfig): Promise<void> {
    this.status = 'connecting';

    const token = config.credentials.botToken;
    if (!token) throw new Error('Telegram bot token required');

    this.bot = new Bot(token);

    // Setup handlers
    this.bot.on('message', (ctx) => this.handleMessage(ctx));

    // Start long-polling (or webhook in production)
    if (config.platformConfig?.useWebhook) {
      await this.bot.api.setWebhook(config.platformConfig.webhookUrl as string);
    } else {
      this.bot.start();
    }

    this.status = 'connected';
  }

  // grammY handles message streaming via handlers
  private messageQueue: UnifiedMessage[] = [];
  private messageResolvers: ((msg: UnifiedMessage) => void)[] = [];

  async *receiveMessages(): AsyncGenerator<UnifiedMessage> {
    while (this.status === 'connected') {
      if (this.messageQueue.length > 0) {
        yield this.messageQueue.shift()!;
      } else {
        yield await new Promise<UnifiedMessage>((resolve) => {
          this.messageResolvers.push(resolve);
        });
      }
    }
  }

  private handleMessage(ctx: Context): void {
    const unified = this.toUnified(ctx.message);

    if (this.messageResolvers.length > 0) {
      this.messageResolvers.shift()!(unified);
    } else {
      this.messageQueue.push(unified);
    }
  }

  async sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult> {
    if (!this.bot) return { success: false, error: 'Not connected' };

    try {
      const parseMode = message.platformHints?.telegram?.parseMode || 'Markdown';

      const result = await this.bot.api.sendMessage(
        recipient.id,
        message.content.markdown || message.content.text || '',
        { parse_mode: parseMode }
      );

      return { success: true, messageId: result.message_id.toString() };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Telegram-specific features
  async sendTypingIndicator(recipient: UnifiedRecipient): Promise<void> {
    await this.bot?.api.sendChatAction(recipient.id, 'typing');
  }
}
```

### Signal Adapter

**Library:** [signal-cli](https://github.com/AsamK/signal-cli) via JSON-RPC
**Mode:** SSE for incoming, HTTP for outgoing
**Complexity:** High (requires signal-cli daemon)

```typescript
import EventSource from 'eventsource';

export class SignalAdapter extends ChannelAdapter {
  readonly platform = 'signal';
  readonly name = 'Signal';
  readonly capabilities = SIGNAL_CAPABILITIES;

  private baseUrl: string = 'http://localhost:8080/api/v1';
  private eventSource: EventSource | null = null;
  private phoneNumber: string = '';

  async initialize(config: AdapterConfig): Promise<void> {
    this.status = 'connecting';

    this.baseUrl = config.platformConfig?.signalCliUrl as string || this.baseUrl;
    this.phoneNumber = config.credentials.phoneNumber;

    // Verify signal-cli is running
    const health = await this.healthCheck();
    if (!health.healthy) {
      throw new Error('signal-cli not available: ' + health.errors?.join(', '));
    }

    this.status = 'connected';
  }

  async *receiveMessages(): AsyncGenerator<UnifiedMessage> {
    // Connect to SSE endpoint
    this.eventSource = new EventSource(`${this.baseUrl}/receive/${this.phoneNumber}`);

    const messageStream = new TransformStream<MessageEvent, UnifiedMessage>();

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.envelope?.dataMessage) {
        const unified = this.toUnified(data);
        messageStream.writable.getWriter().write(unified);
      }
    };

    for await (const message of messageStream.readable) {
      yield message;
    }
  }

  async sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [recipient.id],
          message: message.content.text || '',
          // Attachments handled separately
        }),
      });

      if (!response.ok) {
        return { success: false, error: await response.text() };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  protected toUnified(signalMessage: SignalEnvelope): UnifiedMessage {
    const dm = signalMessage.envelope.dataMessage;

    return {
      id: signalMessage.envelope.timestamp.toString(),
      platform: 'signal',
      sender: {
        id: signalMessage.envelope.source,
        platformId: `signal:${signalMessage.envelope.source}`,
        isBot: false,
      },
      recipient: {
        type: signalMessage.envelope.sourceDevice ? 'dm' : 'group',
        id: signalMessage.envelope.source,
      },
      content: {
        type: 'text',
        text: dm.message,
      },
      attachments: (dm.attachments || []).map(a => ({
        id: a.id,
        type: this.inferAttachmentType(a.contentType),
        name: a.filename || 'attachment',
        mimeType: a.contentType,
        size: a.size,
      })),
      timestamp: new Date(signalMessage.envelope.timestamp),
      platformData: signalMessage,
      sessionId: `signal-${signalMessage.envelope.source}`,
    };
  }
}
```

### WhatsApp Adapter

**Library:** [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/) (official)
**Mode:** Webhooks for incoming, REST for outgoing
**Complexity:** High (requires Meta Business verification)

```typescript
export class WhatsAppAdapter extends ChannelAdapter {
  readonly platform = 'whatsapp';
  readonly name = 'WhatsApp';
  readonly capabilities: PlatformCapabilities = {
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
  };

  private accessToken: string = '';
  private phoneNumberId: string = '';
  private apiVersion: string = 'v18.0';
  private baseUrl: string = '';

  async initialize(config: AdapterConfig): Promise<void> {
    this.status = 'connecting';

    this.accessToken = config.credentials.accessToken;
    this.phoneNumberId = config.credentials.phoneNumberId;
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;

    // Verify credentials
    const health = await this.healthCheck();
    if (!health.healthy) {
      throw new Error('WhatsApp API not accessible');
    }

    this.status = 'connected';
  }

  // WhatsApp uses webhooks - implement webhook handler
  async handleWebhook(body: WhatsAppWebhookBody): Promise<UnifiedMessage | null> {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return null;

    return this.toUnified(message);
  }

  async sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult> {
    try {
      let payload: Record<string, unknown>;

      // Handle different message types
      if (message.buttons && message.buttons.length > 0) {
        // Interactive message
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient.id,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: message.content.text },
            action: {
              buttons: message.buttons.map(b => ({
                type: 'reply',
                reply: { id: b.id, title: b.label },
              })),
            },
          },
        };
      } else {
        // Text message
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient.id,
          type: 'text',
          text: { body: message.content.text || '' },
        };
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: JSON.stringify(error) };
      }

      const result = await response.json();
      return { success: true, messageId: result.messages?.[0]?.id };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  }
}
```

### iMessage Adapter

**Library:** [BlueBubbles](https://bluebubbles.app/) REST API
**Mode:** Webhooks for incoming, REST for outgoing
**Complexity:** High (requires Mac server)
**Limitation:** macOS only

```typescript
export class iMessageAdapter extends ChannelAdapter {
  readonly platform = 'imessage';
  readonly name = 'iMessage';
  readonly capabilities: PlatformCapabilities = {
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
    supportsReactions: true,              // Tapbacks
    supportsButtons: false,
    supportsCards: false,
    supportsTypingIndicator: true,
    supportsReadReceipts: true,
    supportsMessageEdit: true,            // macOS 13+
    supportsMessageDelete: true,          // Unsend
    supportsE2EEncryption: true,
    supportsDisappearingMessages: false,
  };

  private serverUrl: string = '';
  private password: string = '';

  async initialize(config: AdapterConfig): Promise<void> {
    this.status = 'connecting';

    this.serverUrl = config.platformConfig?.blueBubblesUrl as string;
    this.password = config.credentials.password;

    // Test connection
    const ping = await this.apiCall('GET', '/api/v1/ping');
    if (!ping.success) {
      throw new Error('BlueBubbles server not reachable');
    }

    // Register webhook
    await this.apiCall('POST', '/api/v1/webhook', {
      url: config.platformConfig?.webhookUrl,
      events: ['new-message', 'message-send-error'],
    });

    this.status = 'connected';
  }

  async sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult> {
    try {
      const result = await this.apiCall('POST', '/api/v1/message/text', {
        chatGuid: recipient.id,
        message: message.content.text || '',
        method: 'private-api',           // Use Private API for full features
      });

      if (result.status !== 200) {
        return { success: false, error: result.message };
      }

      return { success: true, messageId: result.data?.guid };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    // Map emoji to tapback type
    const tapbackMap: Record<string, number> = {
      '': 2000,  // Love
      '': 2001,  // Like (thumbs up)
      '': 2002,  // Dislike (thumbs down)
      '': 2003,  // Laugh
      '!!': 2004, // Emphasize (double exclamation)
      '?': 2005,  // Question
    };

    await this.apiCall('POST', '/api/v1/message/react', {
      chatGuid: messageId.split('/')[0],
      messageGuid: messageId,
      reaction: tapbackMap[emoji] || 2001,
    });
  }

  private async apiCall(method: string, endpoint: string, body?: unknown): Promise<any> {
    const response = await fetch(`${this.serverUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.password}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return response.json();
  }
}
```

### Microsoft Teams Adapter

**Library:** [Bot Framework SDK](https://learn.microsoft.com/en-us/azure/bot-service/)
**Mode:** Webhooks via Azure Bot Service
**Complexity:** Medium (requires Azure setup)

```typescript
import { BotFrameworkAdapter, TurnContext, Activity } from 'botbuilder';

export class TeamsAdapter extends ChannelAdapter {
  readonly platform = 'msteams';
  readonly name = 'Microsoft Teams';
  readonly capabilities: PlatformCapabilities = {
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
    supportsCards: true,                // Adaptive Cards
    supportsTypingIndicator: true,
    supportsReadReceipts: false,
    supportsMessageEdit: true,
    supportsMessageDelete: true,
    supportsE2EEncryption: false,
    supportsDisappearingMessages: false,
  };

  private adapter: BotFrameworkAdapter | null = null;

  async initialize(config: AdapterConfig): Promise<void> {
    this.status = 'connecting';

    this.adapter = new BotFrameworkAdapter({
      appId: config.credentials.appId,
      appPassword: config.credentials.appPassword,
    });

    this.status = 'connected';
  }

  // Teams uses webhook - handle incoming activities
  async handleActivity(activity: Activity): Promise<UnifiedMessage> {
    return this.toUnified(activity);
  }

  async sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult> {
    // Teams requires conversation reference for proactive messaging
    // This is typically stored from the incoming activity

    const activity: Partial<Activity> = {
      type: 'message',
      text: message.content.text || '',
    };

    // Add Adaptive Card if buttons present
    if (message.buttons && message.buttons.length > 0) {
      activity.attachments = [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            { type: 'TextBlock', text: message.content.text || '' },
          ],
          actions: message.buttons.map(b => ({
            type: 'Action.Submit',
            title: b.label,
            data: { action: b.id, value: b.value },
          })),
        },
      }];
    }

    // Send via stored conversation reference
    // (implementation depends on how you store conversation refs)

    return { success: true };
  }

  protected toUnified(activity: Activity): UnifiedMessage {
    return {
      id: activity.id || '',
      platform: 'msteams',
      sender: {
        id: activity.from?.id || '',
        platformId: `msteams:${activity.from?.id}`,
        displayName: activity.from?.name,
        isBot: activity.from?.role === 'bot',
      },
      recipient: {
        type: activity.conversation?.isGroup ? 'channel' : 'dm',
        id: activity.conversation?.id || '',
        name: activity.conversation?.name,
      },
      content: {
        type: 'text',
        text: activity.text || '',
      },
      attachments: (activity.attachments || []).map(a => ({
        id: a.name || '',
        type: 'file',
        name: a.name || 'attachment',
        url: a.contentUrl,
        mimeType: a.contentType,
      })),
      timestamp: new Date(activity.timestamp || Date.now()),
      platformData: activity,
      sessionId: `msteams-${activity.conversation?.id}-${activity.from?.id}`,
    };
  }
}
```

### Matrix Adapter

**Library:** [matrix-js-sdk](https://github.com/matrix-org/matrix-js-sdk)
**Mode:** Sync (long-polling or /sync endpoint)
**Complexity:** Medium

```typescript
import * as sdk from 'matrix-js-sdk';

export class MatrixAdapter extends ChannelAdapter {
  readonly platform = 'matrix';
  readonly name = 'Matrix';
  readonly capabilities: PlatformCapabilities = {
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
    supportsButtons: false,               // No native support
    supportsCards: false,
    supportsTypingIndicator: true,
    supportsReadReceipts: true,
    supportsMessageEdit: true,
    supportsMessageDelete: true,          // Redaction
    supportsE2EEncryption: true,          // Olm/Megolm
    supportsDisappearingMessages: false,
  };

  private client: sdk.MatrixClient | null = null;

  async initialize(config: AdapterConfig): Promise<void> {
    this.status = 'connecting';

    this.client = sdk.createClient({
      baseUrl: config.platformConfig?.homeserverUrl as string,
      accessToken: config.credentials.accessToken,
      userId: config.credentials.userId,
    });

    await this.client.startClient();

    this.status = 'connected';
  }

  async *receiveMessages(): AsyncGenerator<UnifiedMessage> {
    if (!this.client) return;

    const eventQueue: sdk.MatrixEvent[] = [];
    let resolveNext: ((event: sdk.MatrixEvent) => void) | null = null;

    this.client.on(sdk.ClientEvent.RoomTimeline, (event) => {
      if (event.getType() === 'm.room.message') {
        if (resolveNext) {
          resolveNext(event);
          resolveNext = null;
        } else {
          eventQueue.push(event);
        }
      }
    });

    while (this.status === 'connected') {
      let event: sdk.MatrixEvent;

      if (eventQueue.length > 0) {
        event = eventQueue.shift()!;
      } else {
        event = await new Promise((resolve) => {
          resolveNext = resolve;
        });
      }

      yield this.toUnified(event);
    }
  }

  async sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult> {
    if (!this.client) return { success: false, error: 'Not connected' };

    try {
      const content: sdk.IContent = {
        msgtype: 'm.text',
        body: message.content.text || '',
      };

      // Add formatted body if HTML available
      if (message.content.html) {
        content.format = 'org.matrix.custom.html';
        content.formatted_body = message.content.html;
      }

      const result = await this.client.sendMessage(recipient.id, content);

      return { success: true, messageId: result.event_id };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  protected toUnified(event: sdk.MatrixEvent): UnifiedMessage {
    const content = event.getContent();

    return {
      id: event.getId()!,
      platform: 'matrix',
      sender: {
        id: event.getSender()!,
        platformId: event.getSender()!,   // Matrix IDs are already global
        isBot: false,
      },
      recipient: {
        type: 'channel',
        id: event.getRoomId()!,
      },
      content: {
        type: content.format === 'org.matrix.custom.html' ? 'rich' : 'text',
        text: content.body,
        html: content.formatted_body,
      },
      attachments: [],
      timestamp: new Date(event.getTs()),
      platformData: event,
      sessionId: `matrix-${event.getRoomId()}-${event.getSender()}`,
    };
  }
}
```

### SMS/Twilio Adapter

**Library:** [Twilio SDK](https://www.twilio.com/docs/libraries/node)
**Mode:** Webhooks for incoming, REST for outgoing
**Complexity:** Low

```typescript
import twilio from 'twilio';

export class TwilioSMSAdapter extends ChannelAdapter {
  readonly platform = 'sms';
  readonly name = 'SMS (Twilio)';
  readonly capabilities: PlatformCapabilities = {
    supportsMarkdown: false,
    supportsHTML: false,
    supportsRichText: false,
    maxMessageLength: 1600,              // Multi-segment limit
    supportsThreads: false,
    supportsReplies: false,
    supportsFiles: false,
    supportsImages: true,                // MMS
    supportsVoice: false,
    supportsVideo: false,
    supportsLocation: false,
    maxAttachmentSize: 5 * 1024 * 1024,  // MMS limit
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

  private client: twilio.Twilio | null = null;
  private fromNumber: string = '';

  async initialize(config: AdapterConfig): Promise<void> {
    this.status = 'connecting';

    this.client = twilio(
      config.credentials.accountSid,
      config.credentials.authToken
    );

    this.fromNumber = config.credentials.phoneNumber;

    this.status = 'connected';
  }

  // Twilio uses webhooks - handle in webhook route
  handleWebhook(body: TwilioWebhookBody): UnifiedMessage {
    return this.toUnified(body);
  }

  async sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult> {
    if (!this.client) return { success: false, error: 'Not connected' };

    try {
      const msgOptions: twilio.MessageInstance = {
        body: message.content.text || '',
        from: this.fromNumber,
        to: recipient.id,
      };

      // Add MMS media if images present
      if (message.attachments?.some(a => a.type === 'image')) {
        msgOptions.mediaUrl = message.attachments
          .filter(a => a.type === 'image' && a.url)
          .map(a => a.url!);
      }

      const result = await this.client.messages.create(msgOptions);

      return { success: true, messageId: result.sid };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  protected toUnified(body: TwilioWebhookBody): UnifiedMessage {
    return {
      id: body.MessageSid,
      platform: 'sms',
      sender: {
        id: body.From,
        platformId: `sms:${body.From}`,
        isBot: false,
      },
      recipient: {
        type: 'dm',
        id: body.To,
      },
      content: {
        type: 'text',
        text: body.Body,
      },
      attachments: (body.NumMedia ? Array.from({ length: parseInt(body.NumMedia) }) : []).map((_, i) => ({
        id: `media-${i}`,
        type: 'image',
        name: `media-${i}`,
        url: body[`MediaUrl${i}`],
        mimeType: body[`MediaContentType${i}`],
      })),
      timestamp: new Date(),
      platformData: body,
      sessionId: `sms-${body.From}`,
    };
  }
}
```

### Voice/WebRTC Adapter

**Library:** Twilio Voice SDK or custom WebRTC signaling
**Mode:** Real-time streams
**Complexity:** High

```typescript
export class VoiceAdapter extends ChannelAdapter {
  readonly platform = 'voice';
  readonly name = 'Voice (WebRTC/Twilio)';
  readonly capabilities: PlatformCapabilities = {
    supportsMarkdown: false,
    supportsHTML: false,
    supportsRichText: false,
    maxMessageLength: Infinity,          // Voice has no text limit
    supportsThreads: false,
    supportsReplies: false,
    supportsFiles: false,
    supportsImages: false,
    supportsVoice: true,
    supportsVideo: true,
    supportsLocation: false,
    maxAttachmentSize: 0,
    supportsReactions: false,
    supportsButtons: true,               // DTMF tones
    supportsCards: false,
    supportsTypingIndicator: false,
    supportsReadReceipts: false,
    supportsMessageEdit: false,
    supportsMessageDelete: false,
    supportsE2EEncryption: true,         // SRTP
    supportsDisappearingMessages: true,  // Calls are ephemeral
  };

  // Voice requires special handling:
  // 1. WebRTC signaling server for browser calls
  // 2. Twilio Voice for PSTN calls
  // 3. Speech-to-text for transcription
  // 4. Text-to-speech for responses

  async initialize(config: AdapterConfig): Promise<void> {
    this.status = 'connecting';

    // Initialize STT/TTS services
    // Initialize signaling server
    // Initialize Twilio Voice client

    this.status = 'connected';
  }

  async sendMessage(message: UnifiedResponse, recipient: UnifiedRecipient): Promise<SendResult> {
    // Convert text to speech and play on call
    // Or send DTMF/text to participant

    return { success: true };
  }

  // Voice-specific methods
  async initiateCall(to: string): Promise<string> {
    // Return call SID
    return '';
  }

  async transferCall(callSid: string, to: string): Promise<void> {
    // Transfer active call
  }

  async endCall(callSid: string): Promise<void> {
    // Hang up
  }
}
```

---

## Authentication & Security

### Unified Auth Manager

```typescript
/**
 * Centralized authentication management for all channels.
 */
class AuthManager {
  private credentials: Map<PlatformType, ChannelCredentials> = new Map();
  private refreshTimers: Map<PlatformType, NodeJS.Timer> = new Map();

  // === Credential Storage ===
  async loadCredentials(): Promise<void> {
    // Load from environment variables
    this.loadFromEnv();

    // Load from secure vault (Supabase Vault, AWS Secrets Manager, etc.)
    await this.loadFromVault();

    // Schedule token refreshes
    this.scheduleRefreshes();
  }

  private loadFromEnv(): void {
    // Telegram
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.credentials.set('telegram', {
        type: 'bot_token',
        token: process.env.TELEGRAM_BOT_TOKEN,
      });
    }

    // WhatsApp
    if (process.env.WHATSAPP_ACCESS_TOKEN) {
      this.credentials.set('whatsapp', {
        type: 'oauth',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      });
    }

    // ... other platforms
  }

  private async loadFromVault(): Promise<void> {
    // Load encrypted credentials from secure storage
    // Decrypt and validate
  }

  // === Token Refresh ===
  private scheduleRefreshes(): void {
    for (const [platform, creds] of this.credentials) {
      if (creds.type === 'oauth' && creds.expiresAt) {
        const refreshTime = creds.expiresAt.getTime() - Date.now() - (60 * 60 * 1000); // 1 hour before expiry

        if (refreshTime > 0) {
          const timer = setTimeout(() => this.refreshToken(platform), refreshTime);
          this.refreshTimers.set(platform, timer);
        }
      }
    }
  }

  private async refreshToken(platform: PlatformType): Promise<void> {
    const creds = this.credentials.get(platform);
    if (!creds || creds.type !== 'oauth') return;

    // Platform-specific refresh logic
    switch (platform) {
      case 'whatsapp':
        // WhatsApp tokens are long-lived, refresh via Meta API
        break;
      case 'slack':
        // Slack OAuth token refresh
        break;
      // ... etc
    }
  }

  // === Credential Access ===
  getCredentials(platform: PlatformType): ChannelCredentials | undefined {
    return this.credentials.get(platform);
  }

  // === OAuth Flows ===
  async initiateOAuth(platform: PlatformType, redirectUrl: string): Promise<string> {
    // Return OAuth authorization URL
    const oauthConfigs: Record<string, OAuthConfig> = {
      slack: {
        authUrl: 'https://slack.com/oauth/v2/authorize',
        clientId: process.env.SLACK_CLIENT_ID,
        scopes: ['chat:write', 'channels:read', 'users:read'],
      },
      // ... etc
    };

    const config = oauthConfigs[platform];
    if (!config) throw new Error(`OAuth not supported for ${platform}`);

    const state = crypto.randomUUID();
    // Store state for CSRF protection

    return `${config.authUrl}?client_id=${config.clientId}&scope=${config.scopes.join(',')}&redirect_uri=${redirectUrl}&state=${state}`;
  }

  async completeOAuth(platform: PlatformType, code: string): Promise<void> {
    // Exchange code for tokens
    // Store in credentials map
  }
}

interface ChannelCredentials {
  type: 'bot_token' | 'oauth' | 'api_key' | 'password';
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  password?: string;
  expiresAt?: Date;
  [key: string]: unknown;
}

export const authManager = new AuthManager();
```

### Security Considerations

```typescript
/**
 * Security guardrails for channel operations.
 */
const CHANNEL_SECURITY = {
  // Blocked operations by trust level
  trustLevelRequirements: {
    1: ['read_messages'],
    2: ['read_messages', 'send_messages'],
    3: ['read_messages', 'send_messages', 'send_files', 'create_threads'],
    4: ['read_messages', 'send_messages', 'send_files', 'create_threads', 'admin_operations'],
  },

  // Rate limits per trust level (messages per minute)
  rateLimits: {
    1: 5,
    2: 20,
    3: 50,
    4: 200,
  },

  // Blocked patterns in outgoing messages
  blockedPatterns: [
    /credit\s*card/i,
    /social\s*security/i,
    /password/i,
    // Add more as needed
  ],

  // Maximum attachment sizes by trust level (bytes)
  maxAttachmentSize: {
    1: 0,                               // No attachments
    2: 5 * 1024 * 1024,                 // 5MB
    3: 25 * 1024 * 1024,                // 25MB
    4: 100 * 1024 * 1024,               // 100MB
  },
};
```

---

## Rate Limiting & Resilience

### Unified Rate Limiter

```typescript
/**
 * Intelligent rate limiting with per-platform awareness.
 */
class RateLimitManager {
  private buckets: Map<string, TokenBucket> = new Map();
  private backoffState: Map<string, BackoffState> = new Map();

  // Platform-specific limits (requests per second)
  private platformLimits: Record<PlatformType, number> = {
    telegram: 30,                       // 30 req/s
    whatsapp: 80,                       // 80 req/s (Cloud API)
    signal: 10,                         // Conservative
    imessage: 5,                        // BlueBubbles limited
    msteams: 50,                        // Varies by endpoint
    matrix: 100,                        // Depends on homeserver
    discord: 50,                        // Global rate limit
    slack: 20,                          // Tier-dependent
    sms: 1,                             // 1 msg/s per number
    voice: 5,                           // Concurrent calls
  };

  // === Token Bucket Implementation ===
  async acquire(platform: PlatformType, key: string = 'default'): Promise<boolean> {
    const bucketKey = `${platform}:${key}`;

    if (!this.buckets.has(bucketKey)) {
      this.buckets.set(bucketKey, new TokenBucket({
        capacity: this.platformLimits[platform] || 10,
        refillRate: this.platformLimits[platform] || 10,
      }));
    }

    const bucket = this.buckets.get(bucketKey)!;

    // Check if we're in backoff
    const backoff = this.backoffState.get(bucketKey);
    if (backoff && Date.now() < backoff.retryAfter) {
      return false;
    }

    return bucket.tryConsume(1);
  }

  // === Handle Rate Limit Response ===
  handleRateLimited(platform: PlatformType, retryAfter: number, key: string = 'default'): void {
    const bucketKey = `${platform}:${key}`;

    const current = this.backoffState.get(bucketKey);
    const attempt = current ? current.attempt + 1 : 1;

    // Exponential backoff with jitter
    const baseDelay = retryAfter * 1000 || 1000;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.2 * exponentialDelay;
    const totalDelay = Math.min(exponentialDelay + jitter, 60000); // Max 60s

    this.backoffState.set(bucketKey, {
      attempt,
      retryAfter: Date.now() + totalDelay,
    });

    console.log(`[RateLimiter] ${platform} rate limited, retry in ${totalDelay}ms (attempt ${attempt})`);
  }

  // === Reset Backoff ===
  resetBackoff(platform: PlatformType, key: string = 'default'): void {
    this.backoffState.delete(`${platform}:${key}`);
  }
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private capacity: number;
  private refillRate: number;

  constructor(options: { capacity: number; refillRate: number }) {
    this.capacity = options.capacity;
    this.refillRate = options.refillRate;
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  tryConsume(count: number): boolean {
    this.refill();

    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }

    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const newTokens = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + newTokens);
    this.lastRefill = now;
  }
}

interface BackoffState {
  attempt: number;
  retryAfter: number;
}

export const rateLimitManager = new RateLimitManager();
```

### Circuit Breaker

```typescript
/**
 * Circuit breaker for channel health management.
 */
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures: number = 0;
  private lastFailure: Date | null = null;
  private successesInHalfOpen: number = 0;

  private readonly failureThreshold: number = 5;
  private readonly successThreshold: number = 3;
  private readonly timeout: number = 30000;       // 30 seconds

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure!.getTime() > this.timeout) {
        this.state = 'half-open';
        this.successesInHalfOpen = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === 'half-open') {
      this.successesInHalfOpen++;
      if (this.successesInHalfOpen >= this.successThreshold) {
        this.state = 'closed';
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = new Date();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}
```

---

## Implementation Priority

### Phase 1: Foundation (Week 1-2)

| Task | Priority | Effort |
|------|----------|--------|
| Refactor `base.ts` to match new UnifiedMessage interface | P0 | Medium |
| Add PlatformCapabilities to all adapters | P0 | Low |
| Implement RateLimitManager | P0 | Medium |
| Implement AuthManager | P0 | Medium |
| Add health checks to existing adapters | P0 | Low |

### Phase 2: High-Priority Channels (Week 3-4)

| Task | Priority | Effort |
|------|----------|--------|
| Telegram adapter (grammY) | P1 | Low |
| WhatsApp adapter (Cloud API) | P1 | High |
| Signal adapter (signal-cli) | P1 | High |

### Phase 3: Enterprise Channels (Week 5-6)

| Task | Priority | Effort |
|------|----------|--------|
| iMessage adapter (BlueBubbles) | P2 | High |
| MS Teams adapter (Bot Framework) | P2 | Medium |
| Matrix adapter (matrix-js-sdk) | P2 | Medium |

### Phase 4: Additional Channels (Week 7-8)

| Task | Priority | Effort |
|------|----------|--------|
| SMS/Twilio adapter | P3 | Low |
| Voice/WebRTC adapter | P3 | High |
| Email adapter (SMTP/IMAP) | P4 | Medium |

### Phase 5: Extension Channels (Week 9+)

| Task | Priority | Effort |
|------|----------|--------|
| IRC, Mattermost, Zulip | P4 | Low each |
| Google Chat, Line, Feishu | P4 | Medium each |
| Twitch, Nostr | P4 | Medium each |
| Plugin system for community adapters | P4 | High |

---

## Why X2000 is Superior

### Architectural Advantages

| Feature | OpenClaw | X2000 |
|---------|----------|-------|
| **Message Model** | Per-adapter normalization | Unified interface with graceful degradation |
| **Health Monitoring** | None | Per-channel circuit breakers + health scores |
| **Rate Limiting** | Per-adapter custom | Unified token bucket with platform awareness |
| **Auth Management** | Manual tokens | Unified auth manager with auto-refresh |
| **Feature Negotiation** | Hard-coded | Dynamic capability matrix |
| **Brain Routing** | Single agent | 37 specialized brains via CEO orchestration |
| **Memory** | Retrieval only | Forever-learning patterns + skills |
| **Trust System** | All-or-nothing | Earned autonomy per channel |
| **Resilience** | None | Circuit breakers + graceful degradation |
| **Extensibility** | Plugin system | Plugin system + capability negotiation |

### Technical Superiority

1. **Type-Safe Abstraction** — Full TypeScript interfaces with strict typing
2. **Async Generators** — Memory-efficient message streaming
3. **Capability Negotiation** — Rich messages degrade gracefully to simple text
4. **Multi-Brain Processing** — Engineering, Marketing, Support brains handle different intents
5. **Memory Integration** — Conversations persist and inform future interactions
6. **Guardrails** — 5-layer safety system protects all channel operations

### Business Superiority

1. **Enterprise Ready** — MS Teams, Slack, WhatsApp Business from day one
2. **Privacy First** — Signal, Matrix, iMessage for security-conscious users
3. **Global Reach** — WhatsApp, WeChat, Line for international markets
4. **Developer Friendly** — < 100 lines per adapter, extensive documentation
5. **Community Enabled** — Plugin system for niche platforms

### The X2000 Difference

```
OpenClaw: "I can talk to you on 20+ platforms"

X2000: "I can talk to you on 25+ platforms, remember everything,
        route to specialized brains, learn from every conversation,
        and get smarter over time."
```

---

## Next Steps

1. **Read existing adapters** — Understand current Discord/Slack implementations
2. **Refactor base.ts** — Implement UnifiedMessage interface
3. **Add Telegram** — Lowest complexity, highest demand
4. **Add WhatsApp** — Enterprise priority
5. **Add Signal** — Privacy differentiation
6. **Document** — API docs, setup guides, troubleshooting

---

## References

### Platform Documentation

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [grammY Framework](https://grammy.dev/)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [signal-cli](https://github.com/AsamK/signal-cli)
- [BlueBubbles](https://bluebubbles.app/)
- [Microsoft Bot Framework](https://learn.microsoft.com/en-us/azure/bot-service/)
- [Matrix Specification](https://spec.matrix.org/)
- [Twilio Messaging](https://www.twilio.com/docs/messaging)

### Design Patterns

- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)
- [Channel Adapter Pattern](https://www.enterpriseintegrationpatterns.com/patterns/messaging/ChannelAdapter.html)
- [Message Bus Pattern](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageBus.html)

### Research Sources

- [OpenClaw Architecture](https://ppaolo.substack.com/p/openclaw-system-architecture-overview)
- [Matterbridge](https://github.com/42wim/matterbridge)
- [Matrix Bridges](https://matrix.org/ecosystem/bridges/)

---

**X2000 Multi-Channel: Superior by Design**
