// SoulSync Type Definitions

export type Gender = 'male' | 'female' | 'non-binary';

export type RelationshipGoal =
  | 'long-term'
  | 'short-term'
  | 'casual'
  | 'friendship'
  | 'not-sure';

export type AttachmentStyle =
  | 'secure'
  | 'anxious'
  | 'avoidant'
  | 'fearful-avoidant';

export type LoveLanguage =
  | 'words-of-affirmation'
  | 'acts-of-service'
  | 'receiving-gifts'
  | 'quality-time'
  | 'physical-touch';

export type CoreValue =
  | 'family'
  | 'career'
  | 'adventure'
  | 'creativity'
  | 'spirituality'
  | 'health'
  | 'learning'
  | 'independence'
  | 'community'
  | 'stability';

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: Gender;
  location: string;
  relationship_goal: RelationshipGoal;
  core_values: CoreValue[];
  attachment_style: AttachmentStyle;
  love_languages: LoveLanguage[];
  voice_intro_url: string | null;
  voice_intro_transcript: string | null;
  photo_urls: string[];
  bio: string | null;
  onboarding_completed: boolean;
  created_at: string;
  last_active_at: string;
}

// Onboarding Data (stored during flow, before profile creation)
export interface OnboardingData {
  name: string;
  birthdate: string;
  gender: Gender | null;
  location: string;
  relationship_goal: RelationshipGoal | null;
  core_values: CoreValue[];
  attachment_style: AttachmentStyle | null;
  love_languages: LoveLanguage[];
  voice_intro_url: string | null;
}

// Match Status
export type MatchStatus =
  | 'pending_approval'  // Woman hasn't approved yet
  | 'active'            // Connectivity in progress
  | 'completed'         // All rounds done, awaiting reveal
  | 'revealed'          // Photos revealed
  | 'expired'           // Timer ran out
  | 'exited';           // One party exited

// Match
export interface Match {
  id: string;
  user1_id: string;  // Always the woman (approver)
  user2_id: string;  // Always the man (requester)
  status: MatchStatus;
  compatibility_score: number | null;
  current_round: number;
  created_at: string;
  updated_at: string;
}

// Connection Request (man sends to woman)
export type ConnectionRequestStatus = 'pending' | 'approved' | 'declined';

export interface ConnectionRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  voice_note_url: string;
  voice_note_transcript: string | null;
  status: ConnectionRequestStatus;
  created_at: string;
}

// Connectivity Round
export type RoundType = 'voice' | 'video';
export type RoundStatus = 'pending' | 'user1_responded' | 'user2_responded' | 'completed' | 'expired';

export interface ConnectivityRound {
  id: string;
  match_id: string;
  round_number: number;
  round_type: RoundType;
  prompt_id: string;
  prompt_text: string;
  user1_response_url: string | null;
  user1_responded_at: string | null;
  user2_response_url: string | null;
  user2_responded_at: string | null;
  user1_lifelines_used: number;
  user2_lifelines_used: number;
  deadline_at: string;
  status: RoundStatus;
  ai_analysis: AIAnalysis | null;
  created_at: string;
}

// AI Analysis for rounds
export interface AIAnalysis {
  user1_sentiment: string;
  user2_sentiment: string;
  compatibility_signals: string[];
  engagement_level: 'low' | 'medium' | 'high';
  recommend_acceleration: boolean;
}

// Reveal
export interface Reveal {
  id: string;
  match_id: string;
  user1_approved: boolean;
  user2_approved: boolean;
  revealed_at: string | null;
  user1_continue: boolean | null;
  user2_continue: boolean | null;
  created_at: string;
}

// Prompt
export type PromptCategory = 'icebreaker' | 'deep' | 'fun' | 'values' | 'future';

export interface Prompt {
  id: string;
  round_type: RoundType;
  prompt_text: string;
  category: PromptCategory;
  active: boolean;
}

// Discovery Profile (what you see in the feed)
export interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  voice_intro_url: string;
  relationship_goal: RelationshipGoal;
  core_values: CoreValue[];
  compatibility_preview: number; // 0-100
}

// Lifeline
export interface Lifeline {
  match_id: string;
  user_id: string;
  remaining: number; // Max 2 per Connectivity
}

// Push Notification Types
export type NotificationType =
  | 'connection_request'
  | 'connection_approved'
  | 'round_started'
  | 'partner_responded'
  | 'timer_warning'
  | 'timer_expired'
  | 'reveal_ready'
  | 'message_received';

export interface PushNotification {
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}
