'use client';

import { useEffect } from 'react';

/**
 * Suppresses expected Supabase auth errors in the console
 *
 * These errors occur when:
 * - User is not authenticated
 * - Session has expired
 * - Token refresh fails (expected when no session exists)
 *
 * The middleware handles redirects properly, so these console errors
 * are just noise and can be safely ignored.
 */
export default function SupabaseErrorHandler() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Store the original console.error
    const originalError = console.error;

    // Override console.error to filter Supabase auth errors
    console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || '';

      // Suppress known Supabase auth errors
      const suppressPatterns = [
        'Failed to fetch',
        '_refreshAccessToken',
        '_callRefreshToken',
        '_recoverAndRefresh',
        'AuthRetryableFetchError',
      ];

      const shouldSuppress = suppressPatterns.some(pattern =>
        errorMessage.includes(pattern)
      );

      // Only log if it's not a suppressed error
      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };

    // Cleanup: restore original console.error on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
