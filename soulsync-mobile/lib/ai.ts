// AI Services - Whisper transcription, GPT analysis, and content moderation
import { Platform } from 'react-native';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

// ============================================
// CONTENT MODERATION
// ============================================

interface ModerationResult {
  flagged: boolean;
  categories: string[];
  reason?: string;
}

// Common profanity and inappropriate terms (basic list)
const BLOCKED_PATTERNS = [
  // Profanity patterns (regex)
  /\bf+u+c+k+/gi,
  /\bs+h+i+t+/gi,
  /\ba+s+s+h+o+l+e/gi,
  /\bb+i+t+c+h/gi,
  /\bc+u+n+t/gi,
  /\bn+i+g+g/gi,
  /\bf+a+g+/gi,
  /\br+e+t+a+r+d/gi,
  // Contact sharing patterns (prevent off-platform contact)
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails
  /@[a-zA-Z0-9_]{1,15}\b/, // Social handles
  /\b(instagram|snapchat|tiktok|whatsapp|telegram|signal)\b/gi,
  // Inappropriate requests
  /\b(send.*nudes?|nude.*pics?|naked)\b/gi,
  /\b(venmo|cashapp|paypal|send.*money|pay.*me)\b/gi,
];

// Harassment/threatening patterns
const HARASSMENT_PATTERNS = [
  /\b(kill|murder|rape|hurt)\s+(you|yourself|her|him)\b/gi,
  /\b(die|death)\s+(threat|to\s+you)\b/gi,
  /\bi+('ll|'m\s+going\s+to)\s+(kill|hurt|find)\b/gi,
];

/**
 * Check text content for violations
 * Returns immediately for client-side checking
 */
export function moderateContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { flagged: false, categories: [] };
  }

  const normalizedText = text.toLowerCase();
  const flaggedCategories: string[] = [];
  let reason: string | undefined;

  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      flaggedCategories.push('inappropriate_language');
      reason = 'Message contains inappropriate language';
      break;
    }
  }

  // Check for harassment
  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(text)) {
      flaggedCategories.push('harassment');
      reason = 'Message contains threatening or harassing content';
      break;
    }
  }

  // Check for contact sharing (soft flag - warning only)
  if (/\b\d{10}\b/.test(text.replace(/\D/g, '')) ||
      /@[a-zA-Z0-9_]+/.test(text)) {
    if (!flaggedCategories.includes('inappropriate_language')) {
      flaggedCategories.push('contact_sharing');
      reason = 'Sharing contact info is not allowed until Real Life Ready';
    }
  }

  return {
    flagged: flaggedCategories.length > 0,
    categories: flaggedCategories,
    reason,
  };
}

/**
 * Use OpenAI moderation API for comprehensive checking
 * Use this for voice transcripts and important content
 */
export async function moderateContentAI(text: string): Promise<ModerationResult> {
  // First do local check (faster)
  const localResult = moderateContent(text);
  if (localResult.flagged && localResult.categories.includes('harassment')) {
    return localResult; // Don't bother with API for clear violations
  }

  if (!OPENAI_API_KEY) {
    return localResult; // Fall back to local only
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/moderations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text }),
    });

    if (!response.ok) {
      console.error('Moderation API error');
      return localResult;
    }

    const result = await response.json();
    const modResult = result.results?.[0];

    if (modResult?.flagged) {
      const categories: string[] = [];

      if (modResult.categories.harassment) categories.push('harassment');
      if (modResult.categories.hate) categories.push('hate_speech');
      if (modResult.categories.sexual) categories.push('sexual_content');
      if (modResult.categories['self-harm']) categories.push('self_harm');
      if (modResult.categories.violence) categories.push('violence');

      return {
        flagged: true,
        categories: [...new Set([...localResult.categories, ...categories])],
        reason: 'Content flagged by AI moderation',
      };
    }

    return localResult;
  } catch (error) {
    console.error('Moderation API error:', error);
    return localResult;
  }
}

/**
 * Clean text by removing/replacing inappropriate content
 * Use for display purposes (not for blocking)
 */
export function sanitizeText(text: string): string {
  let sanitized = text;

  // Replace profanity with asterisks
  for (const pattern of BLOCKED_PATTERNS.slice(0, 8)) { // Only profanity patterns
    sanitized = sanitized.replace(pattern, (match) => '*'.repeat(match.length));
  }

  return sanitized;
}

// ============================================
// WHISPER TRANSCRIPTION
// ============================================

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(audioUri: string): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured');
    return null;
  }

  try {
    // Fetch the audio file
    const response = await fetch(audioUri);
    const blob = await response.blob();

    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'audio.m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    // Call Whisper API
    const transcriptionResponse = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const error = await transcriptionResponse.text();
      console.error('Whisper API error:', error);
      return null;
    }

    const result = await transcriptionResponse.json();
    return result.text || null;
  } catch (error) {
    console.error('Transcription error:', error);
    return null;
  }
}

// ============================================
// RESPONSE ANALYSIS
// ============================================

interface ResponseAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  engagement: 'high' | 'medium' | 'low';
  authenticity: number; // 0-100
  depth: number; // 0-100
  topics: string[];
  compatibilitySignals: string[];
}

/**
 * Analyze a voice response transcript for engagement and compatibility signals
 */
export async function analyzeResponse(
  transcript: string,
  promptText: string,
  partnerTranscript?: string
): Promise<ResponseAnalysis | null> {
  if (!OPENAI_API_KEY || !transcript) {
    return null;
  }

  try {
    const systemPrompt = `You are an AI dating coach analyzing voice responses in a dating app.
Analyze the following response for emotional engagement, authenticity, and compatibility signals.

Return a JSON object with:
- sentiment: "positive", "neutral", or "negative"
- engagement: "high", "medium", or "low" (based on response depth and enthusiasm)
- authenticity: 0-100 score (higher = more genuine, personal, vulnerable)
- depth: 0-100 score (higher = more thoughtful, detailed response)
- topics: array of main topics discussed
- compatibilitySignals: array of values/traits/interests that could indicate compatibility`;

    const userPrompt = partnerTranscript
      ? `Prompt: "${promptText}"

User's Response: "${transcript}"

Partner's Response: "${partnerTranscript}"

Analyze both responses and identify compatibility signals between them.`
      : `Prompt: "${promptText}"

Response: "${transcript}"

Analyze this response.`;

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GPT API error:', error);
      return null;
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) return null;

    return JSON.parse(content) as ResponseAnalysis;
  } catch (error) {
    console.error('Analysis error:', error);
    return null;
  }
}

// ============================================
// ROUND PROGRESSION DECISION
// ============================================

interface ProgressionDecision {
  shouldProgress: boolean;
  nextRoundType: 'voice' | 'video' | 'reveal';
  reason: string;
  compatibilityEstimate: number;
}

/**
 * Decide whether to progress to next round type based on accumulated analysis
 */
export async function decideRoundProgression(
  roundNumber: number,
  roundAnalyses: ResponseAnalysis[],
  currentCompatibility: number
): Promise<ProgressionDecision> {
  // Default progression rules
  const minVoiceRounds = 2;
  const maxVoiceRounds = 4;

  // Not enough rounds yet
  if (roundNumber < minVoiceRounds) {
    return {
      shouldProgress: true,
      nextRoundType: 'voice',
      reason: 'Continue building connection through voice',
      compatibilityEstimate: currentCompatibility,
    };
  }

  // Calculate average engagement and depth
  const avgEngagement = roundAnalyses.filter(a => a.engagement === 'high').length / roundAnalyses.length;
  const avgDepth = roundAnalyses.reduce((sum, a) => sum + a.depth, 0) / roundAnalyses.length;
  const avgAuthenticity = roundAnalyses.reduce((sum, a) => sum + a.authenticity, 0) / roundAnalyses.length;

  // High engagement = ready for video sooner
  if (avgEngagement >= 0.7 && avgDepth >= 70 && roundNumber >= minVoiceRounds) {
    return {
      shouldProgress: true,
      nextRoundType: 'video',
      reason: 'Strong connection detected - ready for video!',
      compatibilityEstimate: Math.min(100, currentCompatibility + 10),
    };
  }

  // Max voice rounds reached
  if (roundNumber >= maxVoiceRounds) {
    return {
      shouldProgress: true,
      nextRoundType: 'video',
      reason: 'Time to see each other! Moving to video round.',
      compatibilityEstimate: currentCompatibility,
    };
  }

  // Low engagement might need more time or suggest exit
  if (avgEngagement < 0.3 && avgDepth < 40) {
    return {
      shouldProgress: true,
      nextRoundType: 'voice',
      reason: 'Take your time getting to know each other',
      compatibilityEstimate: Math.max(50, currentCompatibility - 10),
    };
  }

  // Default: continue with voice
  return {
    shouldProgress: true,
    nextRoundType: 'voice',
    reason: 'Keep the conversation going!',
    compatibilityEstimate: currentCompatibility,
  };
}

// ============================================
// COMPATIBILITY CALCULATION
// ============================================

interface CompatibilityFactors {
  sharedValues: string[];
  user1Values: string[];
  user2Values: string[];
  user1AttachmentStyle: string;
  user2AttachmentStyle: string;
  user1RelationshipGoal: string;
  user2RelationshipGoal: string;
  user1LoveLanguages: string[];
  user2LoveLanguages: string[];
  roundAnalyses?: ResponseAnalysis[];
}

/**
 * Calculate compatibility score between two users
 */
export function calculateCompatibility(factors: CompatibilityFactors): number {
  let score = 50; // Base score

  // Shared values (up to +25 points)
  const valueOverlap = factors.sharedValues.length;
  score += Math.min(25, valueOverlap * 5);

  // Attachment style compatibility (up to +15 points)
  const attachmentScore = getAttachmentCompatibility(
    factors.user1AttachmentStyle,
    factors.user2AttachmentStyle
  );
  score += attachmentScore;

  // Relationship goal alignment (up to +20 points)
  if (factors.user1RelationshipGoal === factors.user2RelationshipGoal) {
    score += 20;
  } else if (areGoalsCompatible(factors.user1RelationshipGoal, factors.user2RelationshipGoal)) {
    score += 10;
  }

  // Love language overlap (up to +10 points)
  const languageOverlap = factors.user1LoveLanguages.filter(
    l => factors.user2LoveLanguages.includes(l)
  ).length;
  score += Math.min(10, languageOverlap * 4);

  // Round analysis boost (up to +10 points)
  if (factors.roundAnalyses && factors.roundAnalyses.length > 0) {
    const avgDepth = factors.roundAnalyses.reduce((sum, a) => sum + a.depth, 0) / factors.roundAnalyses.length;
    score += Math.floor(avgDepth / 10);
  }

  return Math.min(100, Math.max(0, score));
}

function getAttachmentCompatibility(style1: string, style2: string): number {
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    'secure': { 'secure': 15, 'anxious': 12, 'avoidant': 10, 'fearful-avoidant': 8 },
    'anxious': { 'secure': 12, 'anxious': 5, 'avoidant': 3, 'fearful-avoidant': 4 },
    'avoidant': { 'secure': 10, 'anxious': 3, 'avoidant': 6, 'fearful-avoidant': 5 },
    'fearful-avoidant': { 'secure': 8, 'anxious': 4, 'avoidant': 5, 'fearful-avoidant': 4 },
  };

  return compatibilityMatrix[style1]?.[style2] || 5;
}

function areGoalsCompatible(goal1: string, goal2: string): boolean {
  const compatiblePairs = [
    ['long-term', 'not-sure'],
    ['short-term', 'casual'],
    ['short-term', 'not-sure'],
    ['friendship', 'not-sure'],
  ];

  return compatiblePairs.some(
    ([a, b]) => (goal1 === a && goal2 === b) || (goal1 === b && goal2 === a)
  );
}

// ============================================
// AI NARRATOR
// ============================================

interface NarratorContext {
  roundNumber: number;
  roundType: 'voice' | 'video';
  partnerName: string;
  hasPartnerResponded: boolean;
  timeRemainingHours: number;
  compatibilityScore?: number;
  lastAnalysis?: ResponseAnalysis;
}

/**
 * Generate contextual narrator message
 */
export function generateNarratorMessage(context: NarratorContext): string {
  const { roundNumber, roundType, partnerName, hasPartnerResponded, timeRemainingHours, compatibilityScore, lastAnalysis } = context;

  // Round-specific messages
  if (roundNumber === 1) {
    return `Welcome to your first round with ${partnerName}! Take a breath, be yourself, and let your voice tell your story.`;
  }

  // Time pressure messages
  if (timeRemainingHours <= 2) {
    return `Just ${timeRemainingHours} hours left! Don't let this connection slip away.`;
  }

  // Partner responded
  if (hasPartnerResponded && roundNumber > 1) {
    return `${partnerName} is waiting to hear from you. What will you share?`;
  }

  // High compatibility
  if (compatibilityScore && compatibilityScore >= 80) {
    return `There's something special here. Keep being authentic.`;
  }

  // Video round
  if (roundType === 'video') {
    return `Time to put a face to the voice. Show ${partnerName} the real you.`;
  }

  // Engagement-based messages
  if (lastAnalysis?.engagement === 'high') {
    return `Great energy so far! Keep that momentum going.`;
  }

  // Default messages by round
  const defaultMessages = [
    `Round ${roundNumber} with ${partnerName}. What story will you tell today?`,
    `Another chance to connect. Be curious, be open.`,
    `${partnerName} is on this journey with you. Make it count.`,
    `Every word brings you closer. What matters most to you?`,
  ];

  return defaultMessages[roundNumber % defaultMessages.length];
}

/**
 * Generate prompt introduction based on context
 */
export function generatePromptIntro(
  promptText: string,
  roundNumber: number,
  category?: string
): string {
  const intros: Record<string, string> = {
    'icebreaker': "Let's start with something light:",
    'deep': "Time to go a little deeper:",
    'fun': "Here's something fun:",
    'values': "This one matters:",
    'future': "Looking ahead:",
  };

  if (category && intros[category]) {
    return intros[category];
  }

  if (roundNumber === 1) {
    return "Here's your first prompt:";
  }

  return "Your next prompt:";
}
