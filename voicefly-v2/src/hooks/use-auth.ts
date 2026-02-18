"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return;
    }

    const client = supabase;

    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error("Supabase is not configured") };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, metadata?: Record<string, unknown>) => {
      if (!isSupabaseConfigured || !supabase) {
        return { error: new Error("Supabase is not configured") };
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      return { error: error ? new Error(error.message) : null };
    },
    []
  );

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error("Supabase is not configured") };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error ? new Error(error.message) : null };
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}

export default useAuth;
