/**
 * Dashboard Layout
 *
 * Provides the sidebar navigation and main content area for
 * all dashboard routes.
 */

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect dashboard routes - redirect to auth if not logged in
  const user = await getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar navigation */}
      <Sidebar user={user} />

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
