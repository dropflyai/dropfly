/**
 * Auth Callback Route
 *
 * Handles OAuth callbacks and email verification.
 * Exchanges the code for a session and redirects to dashboard.
 */

import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully authenticated, redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Auth error - redirect to auth page with error
    console.error('Auth callback error:', error.message);
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error.message)}`
    );
  }

  // No code provided - redirect to auth page
  return NextResponse.redirect(`${origin}/auth?error=No+code+provided`);
}
