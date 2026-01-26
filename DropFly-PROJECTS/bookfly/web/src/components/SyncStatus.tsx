/**
 * Sync Status Component
 *
 * Status indicator showing sync state with animations.
 * Supports pending, syncing, synced, and error states.
 */

'use client';

import { cn, getStatusColors, capitalize } from '@/lib/utils';
import {
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

type SyncStatusType = 'pending' | 'syncing' | 'synced' | 'approved' | 'rejected' | 'error';

interface SyncStatusProps {
  status: SyncStatusType;
  showLabel?: boolean;
  errorMessage?: string;
  compact?: boolean;
}

// Map status to icon
const statusIcons: Record<SyncStatusType, React.ElementType> = {
  pending: Clock,
  syncing: RefreshCw,
  synced: CheckCircle2,
  approved: CheckCircle2,
  rejected: XCircle,
  error: AlertCircle,
};

// Map status to display label
const statusLabels: Record<SyncStatusType, string> = {
  pending: 'Pending',
  syncing: 'Syncing',
  synced: 'Synced',
  approved: 'Approved',
  rejected: 'Rejected',
  error: 'Error',
};

export function SyncStatus({
  status,
  showLabel = false,
  errorMessage,
  compact = false,
}: SyncStatusProps) {
  const Icon = statusIcons[status];
  const label = statusLabels[status];
  const { bgColor, textColor, dotColor } = getStatusColors(
    status as 'pending' | 'approved' | 'rejected' | 'synced' | 'syncing' | 'error'
  );

  // Compact mode - just the dot
  if (compact) {
    return (
      <span
        className={cn(
          'status-dot',
          dotColor,
          status === 'syncing' && 'animate-pulse'
        )}
        title={label}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          'badge inline-flex items-center gap-1.5',
          bgColor,
          textColor
        )}
      >
        <Icon
          className={cn(
            'h-3.5 w-3.5',
            status === 'syncing' && 'animate-spin'
          )}
        />
        {showLabel && <span>{label}</span>}
        {!showLabel && (
          <span
            className={cn(
              'status-dot',
              dotColor,
              status === 'syncing' && 'animate-pulse'
            )}
          />
        )}
      </span>

      {/* Error message */}
      {status === 'error' && errorMessage && (
        <span className="text-xs text-error-600">{errorMessage}</span>
      )}
    </div>
  );
}

/**
 * Sync Status Inline
 * A simpler inline version for tables
 */
export function SyncStatusInline({
  status,
}: {
  status: SyncStatusType;
}) {
  const Icon = statusIcons[status];
  const { textColor, dotColor } = getStatusColors(
    status as 'pending' | 'approved' | 'rejected' | 'synced' | 'syncing' | 'error'
  );

  return (
    <span className={cn('inline-flex items-center gap-1.5', textColor)}>
      <span
        className={cn(
          'status-dot',
          dotColor,
          status === 'syncing' && 'animate-pulse'
        )}
      />
      <span className="text-sm">{statusLabels[status]}</span>
    </span>
  );
}

/**
 * Sync Progress Component
 * Shows sync progress with animation
 */
export function SyncProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500">Syncing...</span>
        <span className="text-neutral-700">
          {current} / {total}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
