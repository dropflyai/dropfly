/**
 * Root Page - Redirect to Dashboard
 *
 * The root route redirects authenticated users to the dashboard.
 * Unauthenticated users are redirected to the auth page.
 */

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase';

export default async function HomePage() {
  // Check if user is authenticated
  const user = await getUser();

  if (user) {
    // Authenticated - go to dashboard
    redirect('/dashboard');
  } else {
    // Not authenticated - go to auth
    redirect('/auth');
  }
}
