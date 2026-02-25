// API utilities for SoulSync

import { supabase } from './supabase';
import type {
  UserProfile,
  Match,
  ConnectivityRound,
  ConnectionRequest,
  DiscoveryProfile,
  Prompt,
} from '@/types';

// ============================================
// PROFILE API
// ============================================

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to get profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update profile:', error);
    return false;
  }

  return true;
}

// ============================================
// DISCOVERY API
// ============================================

export async function getDiscoveryProfiles(
  userId: string,
  preferences?: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
  }
): Promise<DiscoveryProfile[]> {
  let query = supabase
    .from('profiles')
    .select('id, name, age, location, voice_intro_url, relationship_goal, core_values')
    .neq('id', userId)
    .eq('onboarding_completed', true)
    .eq('location', 'Los Angeles'); // MVP: LA only

  if (preferences?.gender) {
    query = query.eq('gender', preferences.gender);
  }
  if (preferences?.minAge) {
    query = query.gte('age', preferences.minAge);
  }
  if (preferences?.maxAge) {
    query = query.lte('age', preferences.maxAge);
  }

  const { data, error } = await query.limit(20);

  if (error) {
    console.error('Failed to get discovery profiles:', error);
    return [];
  }

  return (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    location: p.location,
    voice_intro_url: p.voice_intro_url,
    relationship_goal: p.relationship_goal,
    core_values: p.core_values || [],
    compatibility_preview: calculateCompatibilityPreview(p),
  }));
}

function calculateCompatibilityPreview(profile: unknown): number {
  // Placeholder - in production, this would use AI/ML
  return Math.floor(Math.random() * 30) + 70;
}

// ============================================
// CONNECTION REQUEST API
// ============================================

export async function sendConnectionRequest(
  fromUserId: string,
  toUserId: string,
  voiceNoteUrl: string
): Promise<ConnectionRequest | null> {
  const { data, error } = await supabase
    .from('connection_requests')
    .insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      voice_note_url: voiceNoteUrl,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to send connection request:', error);
    return null;
  }

  return data;
}

export async function getPendingRequests(userId: string): Promise<ConnectionRequest[]> {
  const { data, error } = await supabase
    .from('connection_requests')
    .select(`
      *,
      sender:profiles!connection_requests_from_user_id_fkey(id, name, age, voice_intro_url)
    `)
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get pending requests:', error);
    return [];
  }

  return data || [];
}

export async function approveConnectionRequest(requestId: string): Promise<Match | null> {
  // Get the request
  const { data: request, error: requestError } = await supabase
    .from('connection_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (requestError || !request) {
    console.error('Failed to get request:', requestError);
    return null;
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('connection_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);

  if (updateError) {
    console.error('Failed to update request:', updateError);
    return null;
  }

  // Create match
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      user1_id: request.to_user_id, // Woman (approver)
      user2_id: request.from_user_id, // Man (requester)
      status: 'active',
      current_round: 1,
    })
    .select()
    .single();

  if (matchError) {
    console.error('Failed to create match:', matchError);
    return null;
  }

  return match;
}

export async function declineConnectionRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('connection_requests')
    .update({ status: 'declined' })
    .eq('id', requestId);

  if (error) {
    console.error('Failed to decline request:', error);
    return false;
  }

  return true;
}

// ============================================
// MATCH API
// ============================================

export async function getMatches(userId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:profiles!matches_user1_id_fkey(id, name),
      user2:profiles!matches_user2_id_fkey(id, name)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .in('status', ['active', 'completed', 'revealed'])
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to get matches:', error);
    return [];
  }

  return data || [];
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:profiles!matches_user1_id_fkey(id, name, photo_urls),
      user2:profiles!matches_user2_id_fkey(id, name, photo_urls)
    `)
    .eq('id', matchId)
    .single();

  if (error) {
    console.error('Failed to get match:', error);
    return null;
  }

  return data;
}

// ============================================
// CONNECTIVITY ROUND API
// ============================================

export async function getCurrentRound(matchId: string): Promise<ConnectivityRound | null> {
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('current_round')
    .eq('id', matchId)
    .single();

  if (matchError || !match) {
    console.error('Failed to get match:', matchError);
    return null;
  }

  const { data: round, error: roundError } = await supabase
    .from('connectivity_rounds')
    .select('*')
    .eq('match_id', matchId)
    .eq('round_number', match.current_round)
    .single();

  if (roundError && roundError.code !== 'PGRST116') {
    console.error('Failed to get round:', roundError);
    return null;
  }

  return round;
}

export async function createRound(
  matchId: string,
  roundNumber: number,
  roundType: 'voice' | 'video'
): Promise<ConnectivityRound | null> {
  // Get random prompt
  const { data: prompts, error: promptError } = await supabase
    .from('prompts')
    .select('*')
    .eq('round_type', roundType)
    .eq('active', true);

  if (promptError || !prompts?.length) {
    console.error('Failed to get prompts:', promptError);
    return null;
  }

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  const hoursToAdd = roundType === 'voice' ? 8 : 24;
  const deadline = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);

  const { data: round, error } = await supabase
    .from('connectivity_rounds')
    .insert({
      match_id: matchId,
      round_number: roundNumber,
      round_type: roundType,
      prompt_id: randomPrompt.id,
      prompt_text: randomPrompt.prompt_text,
      deadline_at: deadline.toISOString(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create round:', error);
    return null;
  }

  return round;
}

export async function submitRoundResponse(
  roundId: string,
  userId: string,
  responseUrl: string,
  isUser1: boolean
): Promise<boolean> {
  const responseField = isUser1
    ? { user1_response_url: responseUrl, user1_responded_at: new Date().toISOString() }
    : { user2_response_url: responseUrl, user2_responded_at: new Date().toISOString() };

  const { error } = await supabase
    .from('connectivity_rounds')
    .update(responseField)
    .eq('id', roundId);

  if (error) {
    console.error('Failed to submit response:', error);
    return false;
  }

  return true;
}

export async function useLifeline(
  roundId: string,
  isUser1: boolean
): Promise<boolean> {
  // Get current round
  const { data: round, error: getRoundError } = await supabase
    .from('connectivity_rounds')
    .select('deadline_at, user1_lifelines_used, user2_lifelines_used')
    .eq('id', roundId)
    .single();

  if (getRoundError || !round) {
    console.error('Failed to get round:', getRoundError);
    return false;
  }

  const lifelineField = isUser1 ? 'user1_lifelines_used' : 'user2_lifelines_used';
  const currentUsed = isUser1 ? round.user1_lifelines_used : round.user2_lifelines_used;

  if ((currentUsed || 0) >= 2) {
    console.error('No lifelines remaining');
    return false;
  }

  // Extend deadline by 12 hours
  const newDeadline = new Date(new Date(round.deadline_at).getTime() + 12 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('connectivity_rounds')
    .update({
      deadline_at: newDeadline.toISOString(),
      [lifelineField]: (currentUsed || 0) + 1,
    })
    .eq('id', roundId);

  if (error) {
    console.error('Failed to use lifeline:', error);
    return false;
  }

  return true;
}

// ============================================
// REVEAL API
// ============================================

export async function initiateReveal(matchId: string, userId: string, isUser1: boolean): Promise<boolean> {
  const approvalField = isUser1 ? 'user1_approved' : 'user2_approved';

  // Check if reveal exists
  const { data: existing } = await supabase
    .from('reveals')
    .select('*')
    .eq('match_id', matchId)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('reveals')
      .update({ [approvalField]: true })
      .eq('match_id', matchId);

    if (error) {
      console.error('Failed to update reveal:', error);
      return false;
    }
  } else {
    // Create new
    const { error } = await supabase
      .from('reveals')
      .insert({
        match_id: matchId,
        [approvalField]: true,
      });

    if (error) {
      console.error('Failed to create reveal:', error);
      return false;
    }
  }

  return true;
}

export async function checkRevealStatus(matchId: string): Promise<{
  bothApproved: boolean;
  revealed: boolean;
} | null> {
  const { data, error } = await supabase
    .from('reveals')
    .select('*')
    .eq('match_id', matchId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to check reveal:', error);
    return null;
  }

  if (!data) {
    return { bothApproved: false, revealed: false };
  }

  return {
    bothApproved: data.user1_approved && data.user2_approved,
    revealed: !!data.revealed_at,
  };
}

export async function completeReveal(matchId: string): Promise<boolean> {
  const { error } = await supabase
    .from('reveals')
    .update({
      revealed_at: new Date().toISOString(),
    })
    .eq('match_id', matchId);

  if (error) {
    console.error('Failed to complete reveal:', error);
    return false;
  }

  // Update match status
  const { error: matchError } = await supabase
    .from('matches')
    .update({ status: 'revealed' })
    .eq('id', matchId);

  if (matchError) {
    console.error('Failed to update match status:', matchError);
    return false;
  }

  return true;
}
