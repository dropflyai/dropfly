/**
 * Review Queue Page
 *
 * Main review interface with client selector, filterable transaction table,
 * and bulk operations. Click a row to expand the detail panel.
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { ReviewTable } from '@/components/ReviewTable';
import { TransactionDetail } from '@/components/TransactionDetail';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { toast } from 'sonner';
import { cn, formatCurrency, formatDate, getConfidenceLevel } from '@/lib/utils';
import {
  ChevronDown,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Calendar,
  X,
} from 'lucide-react';

// Filter types
type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'synced';

// Mock transaction data (in production, fetched from Supabase)
const mockTransactions = [
  {
    id: '1',
    date: '2024-01-15',
    vendor: 'Office Depot',
    amount: 234.56,
    category: 'Office Supplies',
    confidence: 0.95,
    status: 'pending' as const,
    aiReasoning: 'Receipt shows office supplies purchase. High confidence based on vendor name and itemized list.',
    documentUrl: '/receipts/1.pdf',
  },
  {
    id: '2',
    date: '2024-01-14',
    vendor: 'Amazon Web Services',
    amount: 1523.99,
    category: 'Software & Subscriptions',
    confidence: 0.88,
    status: 'pending' as const,
    aiReasoning: 'Monthly AWS bill. Category determined by vendor and recurring amount pattern.',
    documentUrl: '/receipts/2.pdf',
  },
  {
    id: '3',
    date: '2024-01-14',
    vendor: 'Uber',
    amount: 45.30,
    category: 'Travel & Transportation',
    confidence: 0.72,
    status: 'pending' as const,
    aiReasoning: 'Ride-share expense. Could be personal or business - medium confidence.',
    documentUrl: '/receipts/3.pdf',
  },
  {
    id: '4',
    date: '2024-01-13',
    vendor: 'Unknown Merchant',
    amount: 89.99,
    category: 'Miscellaneous',
    confidence: 0.45,
    status: 'pending' as const,
    aiReasoning: 'Unable to identify merchant from receipt. Low confidence - manual review recommended.',
    documentUrl: '/receipts/4.pdf',
  },
  {
    id: '5',
    date: '2024-01-12',
    vendor: 'Staples',
    amount: 156.78,
    category: 'Office Supplies',
    confidence: 0.92,
    status: 'approved' as const,
    aiReasoning: 'Office supplies from Staples. High confidence based on vendor.',
    documentUrl: '/receipts/5.pdf',
  },
];

// Mock clients
const mockClients = [
  { id: 'all', name: 'All Clients' },
  { id: '1', name: 'Acme Corporation' },
  { id: '2', name: 'Tech Startup Inc' },
  { id: '3', name: 'Local Business LLC' },
];

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [selectedClient, setSelectedClient] = useState(
    searchParams.get('client') || 'all'
  );
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((t) => {
      // Confidence filter
      if (confidenceFilter !== 'all') {
        const level = getConfidenceLevel(t.confidence);
        if (level !== confidenceFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !t.vendor.toLowerCase().includes(query) &&
          !t.category?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Date range
      if (dateRange.start && t.date < dateRange.start) return false;
      if (dateRange.end && t.date > dateRange.end) return false;

      return true;
    });
  }, [confidenceFilter, statusFilter, searchQuery, dateRange]);

  // Selected transaction for detail panel
  const selectedTransaction = useMemo(
    () => mockTransactions.find((t) => t.id === detailTransactionId),
    [detailTransactionId]
  );

  // Bulk approve handler
  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) {
      toast.error('No transactions selected');
      return;
    }

    setLoading(true);
    try {
      // In production, call Supabase to update status
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Approved ${selectedRows.length} transactions`);
      setSelectedRows([]);
    } catch (error) {
      toast.error('Failed to approve transactions');
    } finally {
      setLoading(false);
    }
  };

  // Bulk reject handler
  const handleBulkReject = async () => {
    if (selectedRows.length === 0) {
      toast.error('No transactions selected');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Rejected ${selectedRows.length} transactions`);
      setSelectedRows([]);
    } catch (error) {
      toast.error('Failed to reject transactions');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // a = approve selected
      if (e.key === 'a' && selectedRows.length > 0) {
        e.preventDefault();
        handleBulkApprove();
      }

      // r = reject selected
      if (e.key === 'r' && selectedRows.length > 0) {
        e.preventDefault();
        handleBulkReject();
      }

      // Escape = close detail panel
      if (e.key === 'Escape' && detailTransactionId) {
        setDetailTransactionId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRows, detailTransactionId]);

  // Clear all filters
  const clearFilters = () => {
    setConfidenceFilter('all');
    setStatusFilter('pending');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters =
    confidenceFilter !== 'all' ||
    statusFilter !== 'pending' ||
    searchQuery !== '' ||
    dateRange.start !== '' ||
    dateRange.end !== '';

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className={cn('flex-1 space-y-6', detailTransactionId && 'pr-4')}>
        {/* Page header */}
        <div className="section-header">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Review Queue</h1>
            <p className="mt-1 text-neutral-500">
              Review and approve transactions for QuickBooks sync
            </p>
          </div>

          {/* Client selector */}
          <div className="relative">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="input w-48 appearance-none pr-10"
            >
              {mockClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor or category..."
                className="input pl-9"
              />
            </div>

            {/* Quick filters */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="input w-32"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="synced">Synced</option>
              </select>

              <select
                value={confidenceFilter}
                onChange={(e) =>
                  setConfidenceFilter(e.target.value as ConfidenceFilter)
                }
                className="input w-36"
              >
                <option value="all">All Confidence</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'btn-ghost',
                  showFilters && 'bg-neutral-100'
                )}
              >
                <Filter className="h-4 w-4" />
                More Filters
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-ghost text-neutral-500"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Bulk actions */}
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
                <span className="text-sm text-neutral-500">
                  {selectedRows.length} selected
                </span>
                <button
                  onClick={handleBulkApprove}
                  disabled={loading}
                  className="btn-success"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={loading}
                  className="btn-danger"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
            )}
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="mt-4 flex items-center gap-4 border-t border-neutral-100 pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-500">Date Range:</span>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="input w-36"
                />
                <span className="text-neutral-400">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="input w-36"
                />
              </div>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span>Shortcuts:</span>
          <span>
            <kbd className="rounded bg-neutral-100 px-1.5 py-0.5">j</kbd>/
            <kbd className="rounded bg-neutral-100 px-1.5 py-0.5">k</kbd> navigate
          </span>
          <span>
            <kbd className="rounded bg-neutral-100 px-1.5 py-0.5">a</kbd> approve
          </span>
          <span>
            <kbd className="rounded bg-neutral-100 px-1.5 py-0.5">r</kbd> reject
          </span>
          <span>
            <kbd className="rounded bg-neutral-100 px-1.5 py-0.5">esc</kbd> close detail
          </span>
        </div>

        {/* Transaction table */}
        <div className="card">
          <ReviewTable
            transactions={filteredTransactions}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onRowClick={(id) => setDetailTransactionId(id)}
            selectedRowId={detailTransactionId}
          />
        </div>

        {/* Results summary */}
        <div className="text-sm text-neutral-500">
          Showing {filteredTransactions.length} of {mockTransactions.length} transactions
        </div>
      </div>

      {/* Detail panel */}
      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={() => setDetailTransactionId(null)}
          onApprove={async () => {
            toast.success('Transaction approved');
            setDetailTransactionId(null);
          }}
          onReject={async () => {
            toast.success('Transaction rejected');
            setDetailTransactionId(null);
          }}
        />
      )}
    </div>
  );
}
