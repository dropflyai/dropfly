/**
 * Dashboard Page
 *
 * All clients overview with aggregate stats and client cards.
 * Click a card to navigate to the client-specific review queue.
 */

import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase';
import { ClientCard } from '@/components/ClientCard';
import { UploadZone } from '@/components/UploadZone';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  TrendingUp,
} from 'lucide-react';

// Stat card component for the overview section
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          {change && (
            <p className="mt-1 flex items-center gap-1 text-sm text-success-600">
              <TrendingUp className="h-4 w-4" />
              {change}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const user = await getUser();

  // Fetch clients for the current user
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user?.id)
    .order('name');

  // Fetch aggregate transaction stats
  const { data: pendingCount } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .in(
      'client_id',
      clients?.map((c) => c.id) || []
    );

  const { data: approvedTodayCount } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('updated_at', new Date().toISOString().split('T')[0])
    .in(
      'client_id',
      clients?.map((c) => c.id) || []
    );

  const { data: syncedTodayCount } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'synced')
    .gte('updated_at', new Date().toISOString().split('T')[0])
    .in(
      'client_id',
      clients?.map((c) => c.id) || []
    );

  const { data: totalTransactions } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .in(
      'client_id',
      clients?.map((c) => c.id) || []
    );

  // Mock client data with stats (in production, this would be aggregated from transactions)
  const clientsWithStats =
    clients?.map((client) => ({
      ...client,
      pendingCount: Math.floor(Math.random() * 20),
      syncedToday: Math.floor(Math.random() * 10),
      accuracyRate: 0.92 + Math.random() * 0.07,
      lastSynced: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      isConnected: Math.random() > 0.2,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-neutral-500">
            Overview of all clients and recent activity
          </p>
        </div>
        <Link href="/settings" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Client
        </Link>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={totalTransactions || 0}
          icon={Receipt}
          iconColor="bg-primary-50 text-primary-600"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount || 0}
          icon={AlertCircle}
          iconColor="bg-warning-50 text-warning-600"
        />
        <StatCard
          title="Approved Today"
          value={approvedTodayCount || 0}
          change="+12% from yesterday"
          icon={CheckCircle2}
          iconColor="bg-success-50 text-success-600"
        />
        <StatCard
          title="Synced Today"
          value={syncedTodayCount || 0}
          icon={RefreshCw}
          iconColor="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Quick upload zone */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Quick Upload</h2>
        <UploadZone />
      </div>

      {/* Client cards grid */}
      <div>
        <div className="section-header">
          <h2 className="section-title">Your Clients</h2>
          <span className="text-sm text-neutral-500">
            {clients?.length || 0} clients
          </span>
        </div>

        {clientsWithStats.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clientsWithStats.map((client) => (
              <Link key={client.id} href={`/review/${client.id}`}>
                <ClientCard client={client} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state card py-16">
            <div className="mb-4 rounded-full bg-neutral-100 p-4">
              <Receipt className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">No clients yet</h3>
            <p className="mt-1 text-neutral-500">
              Add your first client to start processing transactions
            </p>
            <Link href="/settings" className="btn-primary mt-4">
              <Plus className="h-4 w-4" />
              Add Client
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
