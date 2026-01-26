/**
 * Authentication hook for BookFly
 * Manages user authentication state, sign in/up/out operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  getSession,
  onAuthStateChange,
  resetPassword,
  updatePassword,
  Session,
  User,
  AuthChangeEvent,
} from '@/lib/supabase';

// ============================================================================
// Types
// ============================================================================

export interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** Current session */
  session: Session | null;
  /** Whether auth state is still loading */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Last auth error */
  error: string | null;
}

export interface AuthActions {
  /** Sign in with email/password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Sign up with email/password */
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  /** Sign out current user */
  signOut: () => Promise<void>;
  /** Request password reset email */
  requestPasswordReset: (email: string) => Promise<void>;
  /** Update password (authenticated users only) */
  changePassword: (newPassword: string) => Promise<void>;
  /** Clear any auth errors */
  clearError: () => void;
  /** Refresh session */
  refreshSession: () => Promise<void>;
}

export type UseAuthReturn = AuthState & AuthActions;

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing authentication state and operations
 *
 * @example
 * ```tsx
 * const { user, isLoading, signIn, signOut, error } = useAuth();
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * if (!user) {
 *   return <LoginScreen onSubmit={signIn} error={error} />;
 * }
 *
 * return <MainApp user={user} onLogout={signOut} />;
 * ```
 */
export function useAuth(): UseAuthReturn {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Session Initialization
  // ============================================================================

  useEffect(() => {
    let mounted = true;

    /**
     * Initialize auth state from stored session
     */
    async function initializeAuth() {
      try {
        const currentSession = await getSession();

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (mounted) {
          setError('Failed to restore session');
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);

        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            setError(null);
            break;
          case 'SIGNED_OUT':
            setError(null);
            break;
          case 'TOKEN_REFRESHED':
            // Session was refreshed, no action needed
            break;
          case 'PASSWORD_RECOVERY':
            // User clicked password reset link
            break;
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // ============================================================================
  // Auth Actions
  // ============================================================================

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { session: newSession, user: newUser } = await signInWithEmail(
        email,
        password
      );
      setSession(newSession);
      setUser(newUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (email: string, password: string, metadata?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);

      try {
        const { session: newSession, user: newUser } = await signUpWithEmail(
          email,
          password,
          metadata
        );

        // Note: newSession might be null if email confirmation is required
        setSession(newSession);
        setUser(newUser);

        if (!newSession) {
          // Email confirmation required
          setError(null); // Clear error - this is expected behavior
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign up failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await supabaseSignOut();
      setSession(null);
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request password reset email
   */
  const requestPasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset request failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Change password for authenticated user
   */
  const changePassword = useCallback(async (newPassword: string) => {
    if (!session) {
      throw new Error('Must be authenticated to change password');
    }

    setIsLoading(true);
    setError(null);

    try {
      await updatePassword(newPassword);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password change failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  /**
   * Clear auth error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Manually refresh session
   */
  const refreshSession = useCallback(async () => {
    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        throw refreshError;
      }

      setSession(data.session);
      setUser(data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Session refresh failed';
      setError(message);
      throw err;
    }
  }, []);

  // ============================================================================
  // Return Value
  // ============================================================================

  return {
    // State
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user,
    error,

    // Actions
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    changePassword,
    clearError,
    refreshSession,
  };
}

export default useAuth;
