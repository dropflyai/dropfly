/**
 * Voice/WebRTC Channel Adapter
 *
 * Enables X2000 communication via voice calls using Twilio Voice and WebRTC.
 * Supports speech-to-text, text-to-speech, call state management, and DTMF handling.
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

export interface VoiceChannelConfig extends Partial<ChannelConfig> {
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  applicationSid?: string;
  voiceUrl?: string;
  statusCallbackUrl?: string;
  sttProvider?: 'twilio' | 'google' | 'openai';
  ttsProvider?: 'twilio' | 'google' | 'openai' | 'elevenlabs';
  ttsVoice?: string;
  allowedPhoneNumbers?: string[];
  maxCallDuration?: number;
}

export interface TwilioVoiceWebhook {
  CallSid: string;
  AccountSid: string;
  From: string;
  To: string;
  CallStatus: CallStatus;
  Direction: 'inbound' | 'outbound-api' | 'outbound-dial';
  Caller?: string;
  Called?: string;
  CallerCity?: string;
  CallerState?: string;
  CallerCountry?: string;
  Digits?: string;
  SpeechResult?: string;
  Confidence?: string;
  RecordingUrl?: string;
  RecordingSid?: string;
  RecordingDuration?: string;
}

export type CallStatus =
  | 'queued'
  | 'ringing'
  | 'in-progress'
  | 'completed'
  | 'busy'
  | 'failed'
  | 'no-answer'
  | 'canceled';

export interface CallState {
  callSid: string;
  from: string;
  to: string;
  status: CallStatus;
  direction: 'inbound' | 'outbound';
  startedAt: Date;
  connectedAt?: Date;
  endedAt?: Date;
  transcripts: TranscriptEntry[];
  dtmfInput: string[];
  metadata: Record<string, unknown>;
}

export interface TranscriptEntry {
  speaker: 'caller' | 'agent';
  text: string;
  timestamp: Date;
  confidence?: number;
}

export interface VoiceCapabilities {
  supportsMarkdown: false;
  supportsHTML: false;
  supportsRichText: false;
  maxMessageLength: number;
  supportsThreads: false;
  supportsReplies: false;
  supportsFiles: false;
  supportsImages: false;
  supportsVoice: true;
  supportsVideo: true;
  supportsLocation: false;
  maxAttachmentSize: 0;
  supportsReactions: false;
  supportsButtons: true;
  supportsCards: false;
  supportsTypingIndicator: false;
  supportsReadReceipts: false;
  supportsMessageEdit: false;
  supportsMessageDelete: false;
  supportsE2EEncryption: true;
  supportsDisappearingMessages: true;
}

// ============================================================================
// Voice Channel
// ============================================================================

export class VoiceChannel extends BaseChannel {
  readonly type = 'voice';
  readonly name = 'Voice (Twilio/WebRTC)';

  readonly capabilities: VoiceCapabilities = {
    supportsMarkdown: false,
    supportsHTML: false,
    supportsRichText: false,
    maxMessageLength: Infinity,
    supportsThreads: false,
    supportsReplies: false,
    supportsFiles: false,
    supportsImages: false,
    supportsVoice: true,
    supportsVideo: true,
    supportsLocation: false,
    maxAttachmentSize: 0,
    supportsReactions: false,
    supportsButtons: true,
    supportsCards: false,
    supportsTypingIndicator: false,
    supportsReadReceipts: false,
    supportsMessageEdit: false,
    supportsMessageDelete: false,
    supportsE2EEncryption: true,
    supportsDisappearingMessages: true,
  };

  private accountSid: string | null;
  private authToken: string | null;
  private phoneNumber: string | null;
  private applicationSid: string | null;
  private voiceUrl: string | null;
  private statusCallbackUrl: string | null;
  private sttProvider: string;
  private ttsProvider: string;
  private ttsVoice: string;
  private allowedPhoneNumbers: string[] | null;
  private maxCallDuration: number;

  private activeCalls: Map<string, CallState> = new Map();

  constructor(config: VoiceChannelConfig = {}) {
    super(config);

    this.accountSid = config.accountSid || process.env.TWILIO_ACCOUNT_SID || null;
    this.authToken = config.authToken || process.env.TWILIO_AUTH_TOKEN || null;
    this.phoneNumber = config.phoneNumber || process.env.TWILIO_VOICE_NUMBER || null;
    this.applicationSid = config.applicationSid || process.env.TWILIO_APPLICATION_SID || null;
    this.voiceUrl = config.voiceUrl || process.env.TWILIO_VOICE_URL || null;
    this.statusCallbackUrl = config.statusCallbackUrl || process.env.TWILIO_VOICE_STATUS_URL || null;
    this.sttProvider = config.sttProvider || 'twilio';
    this.ttsProvider = config.ttsProvider || 'twilio';
    this.ttsVoice = config.ttsVoice || 'Polly.Amy';
    this.allowedPhoneNumbers = config.allowedPhoneNumbers || null;
    this.maxCallDuration = config.maxCallDuration || 3600;
  }

  /**
   * Initialize Voice channel
   */
  async initialize(): Promise<void> {
    if (!this.accountSid || !this.authToken) {
      console.warn('[Voice] No Twilio credentials configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Verify credentials
      const accountInfo = await this.twilioAPI('GET', `/Accounts/${this.accountSid}.json`);

      if (accountInfo.sid) {
        this.connected = true;
        console.log(`[Voice] Connected to Twilio account: ${accountInfo.friendly_name || this.accountSid}`);
      } else {
        throw new Error('Failed to verify Twilio account');
      }
    } catch (error) {
      console.error('[Voice] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Shutdown Voice connection
   */
  async shutdown(): Promise<void> {
    // End all active calls
    for (const callSid of this.activeCalls.keys()) {
      try {
        await this.endCall(callSid);
      } catch {
        // Ignore errors during shutdown
      }
    }

    this.activeCalls.clear();
    this.connected = false;
    console.log('[Voice] Disconnected');
  }

  /**
   * Send a response via voice (TTS)
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Voice channel not connected');
    }

    const callSid = context?.metadata?.callSid as string;
    if (!callSid) {
      throw new Error('No active call to send voice message');
    }

    // Generate TwiML to speak the response
    const twiml = this.generateSpeechTwiML(response.content);

    // Update the call with new TwiML
    await this.twilioAPI(
      'POST',
      `/Accounts/${this.accountSid}/Calls/${callSid}.json`,
      { Twiml: twiml }
    );

    // Log transcript
    const callState = this.activeCalls.get(callSid);
    if (callState) {
      callState.transcripts.push({
        speaker: 'agent',
        text: response.content,
        timestamp: new Date(),
      });
    }

    console.log(`[Voice] Sent speech to call ${callSid}`);
  }

  /**
   * Initiate an outbound call
   */
  async initiateCall(to: string, options?: {
    from?: string;
    url?: string;
    statusCallback?: string;
  }): Promise<string> {
    if (!this.connected || !this.accountSid || !this.authToken) {
      throw new Error('Voice channel not connected');
    }

    const normalizedTo = this.normalizePhoneNumber(to);
    if (!this.isValidPhoneNumber(normalizedTo)) {
      throw new Error(`Invalid phone number: ${to}`);
    }

    const payload: Record<string, string> = {
      To: normalizedTo,
      From: options?.from || this.phoneNumber || '',
      Url: options?.url || this.voiceUrl || '',
    };

    if (options?.statusCallback || this.statusCallbackUrl) {
      payload.StatusCallback = options?.statusCallback || this.statusCallbackUrl || '';
    }

    if (this.maxCallDuration) {
      payload.TimeLimit = this.maxCallDuration.toString();
    }

    const result = await this.twilioAPI(
      'POST',
      `/Accounts/${this.accountSid}/Calls.json`,
      payload
    );

    const callSid = result.sid as string;

    // Initialize call state
    this.activeCalls.set(callSid, {
      callSid,
      from: payload.From,
      to: normalizedTo,
      status: 'queued',
      direction: 'outbound',
      startedAt: new Date(),
      transcripts: [],
      dtmfInput: [],
      metadata: {},
    });

    console.log(`[Voice] Initiated call to ${normalizedTo}, SID: ${callSid}`);
    return callSid;
  }

  /**
   * Handle incoming call webhook
   */
  async handleIncomingCall(webhook: TwilioVoiceWebhook): Promise<string> {
    const { CallSid, From, To, CallerCity, CallerState, CallerCountry } = webhook;

    // Check phone number allowlist
    if (this.allowedPhoneNumbers && !this.allowedPhoneNumbers.includes(From)) {
      console.log(`[Voice] Rejecting call from non-allowed number: ${From}`);
      return this.generateRejectTwiML('This number is not authorized.');
    }

    // Initialize call state
    this.activeCalls.set(CallSid, {
      callSid: CallSid,
      from: From,
      to: To,
      status: 'ringing',
      direction: 'inbound',
      startedAt: new Date(),
      transcripts: [],
      dtmfInput: [],
      metadata: {
        callerCity: CallerCity,
        callerState: CallerState,
        callerCountry: CallerCountry,
      },
    });

    console.log(`[Voice] Incoming call from ${From}, SID: ${CallSid}`);

    // Generate initial greeting TwiML with speech recognition
    return this.generateGreetingTwiML();
  }

  /**
   * Handle speech recognition result
   */
  async handleSpeechResult(webhook: TwilioVoiceWebhook): Promise<ChannelResponse | null> {
    const { CallSid, SpeechResult, Confidence } = webhook;

    if (!SpeechResult) {
      return null;
    }

    const callState = this.activeCalls.get(CallSid);
    if (!callState) {
      console.warn(`[Voice] No call state for ${CallSid}`);
      return null;
    }

    // Log caller's speech to transcript
    callState.transcripts.push({
      speaker: 'caller',
      text: SpeechResult,
      timestamp: new Date(),
      confidence: Confidence ? parseFloat(Confidence) : undefined,
    });

    // Create unified message
    const message: ChannelMessage = {
      id: uuidv4(),
      channelType: this.type,
      channelId: callState.from,
      userId: callState.from,
      content: SpeechResult,
      timestamp: new Date(),
      metadata: {
        callSid: CallSid,
        confidence: Confidence,
        transcriptHistory: callState.transcripts,
      },
    };

    return this.processMessage(message);
  }

  /**
   * Handle DTMF input
   */
  handleDTMF(webhook: TwilioVoiceWebhook): {
    callSid: string;
    digits: string;
  } | null {
    const { CallSid, Digits } = webhook;

    if (!Digits) {
      return null;
    }

    const callState = this.activeCalls.get(CallSid);
    if (callState) {
      callState.dtmfInput.push(Digits);
    }

    console.log(`[Voice] DTMF input for ${CallSid}: ${Digits}`);

    return {
      callSid: CallSid,
      digits: Digits,
    };
  }

  /**
   * Handle call status update
   */
  handleStatusCallback(webhook: TwilioVoiceWebhook): CallState | null {
    const { CallSid, CallStatus } = webhook;

    const callState = this.activeCalls.get(CallSid);
    if (!callState) {
      return null;
    }

    callState.status = CallStatus;

    if (CallStatus === 'in-progress' && !callState.connectedAt) {
      callState.connectedAt = new Date();
    }

    if (['completed', 'busy', 'failed', 'no-answer', 'canceled'].includes(CallStatus)) {
      callState.endedAt = new Date();
    }

    console.log(`[Voice] Call ${CallSid} status: ${CallStatus}`);

    return callState;
  }

  /**
   * End an active call
   */
  async endCall(callSid: string): Promise<void> {
    if (!this.connected || !this.accountSid || !this.authToken) {
      throw new Error('Voice channel not connected');
    }

    await this.twilioAPI(
      'POST',
      `/Accounts/${this.accountSid}/Calls/${callSid}.json`,
      { Status: 'completed' }
    );

    const callState = this.activeCalls.get(callSid);
    if (callState) {
      callState.status = 'completed';
      callState.endedAt = new Date();
    }

    console.log(`[Voice] Ended call ${callSid}`);
  }

  /**
   * Transfer call to another number
   */
  async transferCall(callSid: string, to: string): Promise<void> {
    if (!this.connected || !this.accountSid || !this.authToken) {
      throw new Error('Voice channel not connected');
    }

    const normalizedTo = this.normalizePhoneNumber(to);
    const twiml = `<Response><Dial>${normalizedTo}</Dial></Response>`;

    await this.twilioAPI(
      'POST',
      `/Accounts/${this.accountSid}/Calls/${callSid}.json`,
      { Twiml: twiml }
    );

    console.log(`[Voice] Transferred call ${callSid} to ${normalizedTo}`);
  }

  /**
   * Get call state
   */
  getCallState(callSid: string): CallState | undefined {
    return this.activeCalls.get(callSid);
  }

  /**
   * Get all active calls
   */
  getActiveCalls(): CallState[] {
    return Array.from(this.activeCalls.values()).filter(
      call => !['completed', 'busy', 'failed', 'no-answer', 'canceled'].includes(call.status)
    );
  }

  /**
   * Get call transcript
   */
  getTranscript(callSid: string): TranscriptEntry[] {
    const callState = this.activeCalls.get(callSid);
    return callState?.transcripts || [];
  }

  /**
   * Generate greeting TwiML
   */
  private generateGreetingTwiML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${this.ttsVoice}">Hello, this is X2000. How can I help you today?</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="/voice/speech" method="POST">
    <Say voice="${this.ttsVoice}">Please speak after the tone.</Say>
  </Gather>
  <Say voice="${this.ttsVoice}">I didn't hear anything. Goodbye.</Say>
</Response>`;
  }

  /**
   * Generate speech TwiML
   */
  generateSpeechTwiML(text: string, options?: {
    gatherInput?: boolean;
    timeout?: number;
    actionUrl?: string;
  }): string {
    const escapedText = this.escapeXML(text);

    if (options?.gatherInput !== false) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="${options?.timeout || 5}" speechTimeout="auto" action="${options?.actionUrl || '/voice/speech'}" method="POST">
    <Say voice="${this.ttsVoice}">${escapedText}</Say>
  </Gather>
  <Say voice="${this.ttsVoice}">I didn't hear a response. Is there anything else I can help you with?</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${options?.actionUrl || '/voice/speech'}" method="POST"/>
</Response>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${this.ttsVoice}">${escapedText}</Say>
</Response>`;
  }

  /**
   * Generate DTMF gathering TwiML
   */
  generateDTMFTwiML(prompt: string, options?: {
    numDigits?: number;
    timeout?: number;
    actionUrl?: string;
  }): string {
    const escapedPrompt = this.escapeXML(prompt);

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="${options?.numDigits || 1}" timeout="${options?.timeout || 10}" action="${options?.actionUrl || '/voice/dtmf'}" method="POST">
    <Say voice="${this.ttsVoice}">${escapedPrompt}</Say>
  </Gather>
  <Say voice="${this.ttsVoice}">I didn't receive any input.</Say>
</Response>`;
  }

  /**
   * Generate reject TwiML
   */
  private generateRejectTwiML(reason?: string): string {
    if (reason) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${this.ttsVoice}">${this.escapeXML(reason)}</Say>
  <Reject/>
</Response>`;
    }

    return '<?xml version="1.0" encoding="UTF-8"?><Response><Reject/></Response>';
  }

  /**
   * Normalize phone number to E.164 format
   */
  private normalizePhoneNumber(number: string): string {
    let normalized = number.replace(/[^\d+]/g, '');

    if (!normalized.startsWith('+')) {
      if (normalized.length === 10) {
        normalized = '+1' + normalized;
      } else if (normalized.length === 11 && normalized.startsWith('1')) {
        normalized = '+' + normalized;
      }
    }

    return normalized;
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(number: string): boolean {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(number);
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Make a Twilio API call
   */
  private async twilioAPI(
    method: string,
    endpoint: string,
    body?: Record<string, string>
  ): Promise<Record<string, unknown>> {
    const url = `https://api.twilio.com/2010-04-01${endpoint}`;
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    if (body) {
      options.body = new URLSearchParams(body).toString();
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json() as { message?: string };
      throw new Error(`Twilio API error: ${response.status} ${error.message || 'Unknown error'}`);
    }

    return response.json() as Promise<Record<string, unknown>>;
  }
}

// ============================================================================
// Exports
// ============================================================================

export const voiceChannel = new VoiceChannel();

// Register with channel registry (only if configured)
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VOICE_NUMBER) {
  ChannelRegistry.register(voiceChannel);
}

export function createVoiceChannel(config?: VoiceChannelConfig): VoiceChannel {
  return new VoiceChannel(config);
}
