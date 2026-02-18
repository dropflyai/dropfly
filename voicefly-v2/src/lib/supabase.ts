import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// ============================================================================
// Database Types
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  role: 'admin' | 'user' | 'viewer';
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  source: 'manual' | 'import' | 'api' | 'website';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  score: number;
  tags: string[];
  notes: string | null;
  custom_fields: Record<string, unknown>;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Call {
  id: string;
  user_id: string;
  lead_id: string | null;
  phone_number: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'no_answer';
  duration_seconds: number;
  recording_url: string | null;
  transcript: string | null;
  summary: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  ai_agent_id: string | null;
  cost_cents: number;
  metadata: Record<string, unknown>;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lead, 'id' | 'user_id' | 'created_at'>>;
      };
      calls: {
        Row: Call;
        Insert: Omit<Call, 'id' | 'created_at'>;
        Update: Partial<Omit<Call, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}

// ============================================================================
// Supabase Client
// ============================================================================

let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase client instance
 * Returns null if Supabase is not configured
 */
export function getSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) {
    console.warn(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseClient;
}

/**
 * Get the Supabase client, throwing an error if not configured
 * Use this when Supabase is required for an operation
 */
export function requireSupabase(): SupabaseClient<Database> {
  const client = getSupabase();
  if (!client) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }
  return client;
}

// Default export for convenience
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : null;
