/**
 * Client Card Component
 *
 * Displays client information with stats for the dashboard grid.
 * Shows pending count, sync status, accuracy rate, and last synced time.
 */

'use client';

import { cn, formatRelativeTime, formatPercentage } from '@/lib/utils';
import { SyncStatus } from '@/components/SyncStatus';
import {
  Building2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
} from 'lucide-react';

// Client with stats
interface ClientWithStats {
  id: string;
  name: string;
  pendingCount: number;
  syncedToday: number;
  accuracyRate: number;
  lastSynced: string;
  isConnected: boolean;
  qb_realm_id?: string | null;
}

interface ClientCardProps {
  client: ClientWithStats;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <div
      className={cn(
        'card group cursor-pointer p-5 transition-all hover:shadow-lg hover:border-primary-200',
        !client.isConnected && 'border-warning-200 bg-warning-50/30'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              client.isConnected
                ? 'bg-primary-100 group-hover:bg-primary-200'
                : 'bg-warning-100'
            )}
          >
            <Building2
              className={cn(
                'h-5 w-5',
                client.isConnected ? 'text-primary-600' : 'text-warning-600'
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700">
              {client.name}
            </h3>
            {client.qb_realm_id && (
              <p className="text-xs text-neutral-400">
                QB: {client.qb_realm_id.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>

        {/* Connection status */}
        {client.isConnected ? (
          <span className="badge bg-success-50 text-success-700">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </span>
        ) : (
          <span className="badge bg-warning-50 text-warning-700">
            <AlertCircle className="h-3 w-3" />
            Disconnected
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {/* Pending count */}
        <div className="rounded-lg bg-neutral-50 p-3">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-warning-500" />
            <span className="text-lg font-bold text-neutral-900">
              {client.pendingCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">Pending</p>
        </div>

        {/* Synced today */}
        <div className="rounded-lg bg-neutral-50 p-3">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-success-500" />
            <span className="text-lg font-bold text-neutral-900">
              {client.syncedToday}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">Today</p>
        </div>

        {/* Accuracy rate */}
        <div className="rounded-lg bg-neutral-50 p-3">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            <span className="text-lg font-bold text-neutral-900">
              {formatPercentage(client.accuracyRate)}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">Accuracy</p>
        </div>
      </div>

      {/* Last synced */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Clock className="h-4 w-4" />
          <span>Last synced {formatRelativeTime(client.lastSynced)}</span>
        </div>
        <SyncStatus status={client.isConnected ? 'synced' : 'error'} compact />
      </div>
    </div>
  );
}
