/**
 * X2000 Channel Adapters
 *
 * P1 Priority Adapters for multi-channel communication.
 * These adapters extend beyond the P0 channels (HTTP API, Discord, Slack).
 */

// Telegram Adapter
export {
  TelegramChannel,
  TelegramAPIError,
  telegramChannel,
  createTelegramChannel,
  startTelegramBot,
  stopTelegramBot,
  TELEGRAM_CAPABILITIES,
  type TelegramChannelConfig,
  type TelegramResponsePayload,
  type CommandHandler,
} from './telegram.js';

// WhatsApp Adapter
export {
  WhatsAppChannel,
  whatsappChannel,
  createWhatsAppChannel,
  WHATSAPP_CAPABILITIES,
  type WhatsAppChannelConfig,
} from './whatsapp.js';

// Signal Adapter
export {
  SignalChannel,
  signalChannel,
  createSignalChannel,
  SIGNAL_CAPABILITIES,
  type SignalChannelConfig,
} from './signal.js';

// ============================================================================
// P2 Adapters (Enterprise Channels)
// ============================================================================

// iMessage Adapter (BlueBubbles)
export {
  IMessageChannel,
  imessageChannel,
  createIMessageChannel,
  IMESSAGE_CAPABILITIES,
  type IMessageChannelConfig,
} from './imessage.js';

// Microsoft Teams Adapter (Bot Framework / Graph API)
export {
  MSTeamsChannel,
  msteamsChannel,
  createMSTeamsChannel,
  MSTEAMS_CAPABILITIES,
  type MSTeamsChannelConfig,
} from './msteams.js';

// Matrix Adapter (Federated Messaging)
export {
  MatrixChannel,
  matrixChannel,
  createMatrixChannel,
  MATRIX_CAPABILITIES,
  type MatrixChannelConfig,
} from './matrix.js';

// ============================================================================
// P3-P4 Adapters
// ============================================================================

// SMS/Twilio Adapter (P3)
export {
  SMSChannel,
  smsChannel,
  createSMSChannel,
  type SMSChannelConfig,
  type TwilioWebhookBody,
  type TwilioMessageResponse,
  type SMSCapabilities,
} from './sms.js';

// Voice/WebRTC Adapter (P3)
export {
  VoiceChannel,
  voiceChannel,
  createVoiceChannel,
  type VoiceChannelConfig,
  type TwilioVoiceWebhook,
  type CallStatus,
  type CallState,
  type TranscriptEntry,
  type VoiceCapabilities,
} from './voice.js';

// Email Channel Adapter (P4)
export {
  EmailChannel,
  emailChannel,
  createEmailChannel,
  type EmailChannelConfig,
  type EmailMessage,
  type EmailAddress,
  type EmailAttachment,
  type EmailCapabilities,
} from './email-channel.js';

// IRC Adapter (P4)
export {
  IRCChannel,
  ircChannel,
  createIRCChannel,
  type IRCChannelConfig,
  type IRCServerConfig,
  type IRCServerState,
  type IRCUserInfo,
  type IRCMessageEvent,
  type IRCCapabilities,
} from './irc.js';
