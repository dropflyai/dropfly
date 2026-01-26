/**
 * Supabase Client Configuration for BookFly Web
 *
 * Provides server and client-side Supabase clients with auth helpers
 * for Next.js App Router.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Type definitions for database (extend as schema grows)
export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          qb_realm_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          client_id: string;
          vendor: string;
          amount: number;
          date: string;
          category: string | null;
          confidence: number;
          status: 'pending' | 'approved' | 'rejected' | 'synced';
          ai_reasoning: string | null;
          original_document_url: string | null;
          extracted_data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      sync_history: {
        Row: {
          id: string;
          client_id: string;
          transaction_id: string;
          status: 'pending' | 'syncing' | 'synced' | 'error';
          qb_doc_id: string | null;
          error_message: string | null;
          synced_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sync_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sync_history']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      transaction_status: 'pending' | 'approved' | 'rejected' | 'synced';
      sync_status: 'pending' | 'syncing' | 'synced' | 'error';
    };
  };
};

/**
 * Create a Supabase client for server-side operations
 * Uses cookies for session management in Server Components
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // This can happen when called from a Server Component
          // The `set` method is only available in Server Actions and Route Handlers
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Same as above
        }
      },
    },
  });
}

/**
 * Create a Supabase client for client-side operations
 * This is a singleton pattern to avoid creating multiple clients
 */
let browserClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;

  browserClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return browserClient;
}

/**
 * Get the current authenticated user from the server
 */
export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }

  return user;
}

/**
 * Get the current session from the server
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }

  return session;
}

/**
 * Sign out the current user (server-side)
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

/**
 * Helper to check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return !!user;
}
