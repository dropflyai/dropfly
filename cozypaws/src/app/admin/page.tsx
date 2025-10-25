import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { KPICards } from '@/components/admin/KPICards';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { AdminActions } from '@/components/admin/AdminActions';

export const metadata: Metadata = {
  title: 'Admin Dashboard - CozyPaws Outlet',
  description: 'Admin dashboard for managing orders and products',
};

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/admin');
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role, email')
    .eq('user_id', session.user.id)
    .single();

  if (!adminUser || adminUser.role !== 'admin') {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Logged in as {adminUser.email}
          </p>
        </div>

        <AdminActions />

        <KPICards />

        <div className="mt-8">
          <OrdersTable />
        </div>
      </div>
    </main>
  );
}
