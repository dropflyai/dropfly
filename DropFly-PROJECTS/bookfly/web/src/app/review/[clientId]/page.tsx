/**
 * Client-Specific Review Queue
 *
 * Review page pre-filtered for a specific client.
 * Inherits all functionality from the main review page.
 */

'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ReviewTable } from '@/components/ReviewTable';
import { TransactionDetail } from '@/components/TransactionDetail';
import { toast } from 'sonner';
import { cn, getConfidenceLevel } from '@/lib/utils';
import {
  ArrowLeft,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Calendar,
  X,
  Building2,
} from 'lucide-react';

// Filter types
type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'synced';

// Mock client data
const mockClients: Record<
  string,
  { id: string; name: string; logo?: string; qbConnected: boolean }
> = {
  '1': { id: '1', name: 'Acme Corporation', qbConnected: true },
  '2': { id: '2', name: 'Tech Startup Inc', qbConnected: true },
  '3': { id: '3', name: 'Local Business LLC', qbConnected: false },
};

// Mock transaction data for this client
const mockTransactions = [
  {
    id: '1',
    date: '2024-01-15',
    vendor: 'Office Depot',
    amount: 234.56,
    category: 'Office Supplies',
    confidence: 0.95,
    status: 'pending' as const,
    aiReasoning:
      'Receipt shows office supplies purchase. High confidence based on vendor name and itemized list.',
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
    aiReasoning:
      'Monthly AWS bill. Category determined by vendor and recurring amount pattern.',
    documentUrl: '/receipts/2.pdf',
  },
  {
    id: '3',
    date: '2024-01-14',
    vendor: 'Uber',
    amount: 45.3,
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
    aiReasoning:
      'Unable to identify merchant from receipt. Low confidence - manual review recommended.',
    documentUrl: '/receipts/4.pdf',
  },
];

export default function ClientReviewPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const router = useRouter();

  // Get client info
  const client = mockClients[clientId];

  // State
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

  // Redirect if client not found
  useEffect(() => {
    if (!client) {
      toast.error('Client not found');
      router.push('/dashboard');
    }
  }, [client, router]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((t) => {
      if (confidenceFilter !== 'all') {
        const level = getConfidenceLevel(t.confidence);
        if (level !== confidenceFilter) return false;
      }

      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !t.vendor.toLowerCase().includes(query) &&
          !t.category?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

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

  // Bulk action handlers
  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) {
      toast.error('No transactions selected');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Approved ${selectedRows.length} transactions`);
      setSelectedRows([]);
    } catch (error) {
      toast.error('Failed to approve transactions');
    } finally {
      setLoading(false);
    }
  };

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
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'a' && selectedRows.length > 0) {
        e.preventDefault();
        handleBulkApprove();
      }

      if (e.key === 'r' && selectedRows.length > 0) {
        e.preventDefault();
        handleBulkReject();
      }

      if (e.key === 'Escape' && detailTransactionId) {
        setDetailTransactionId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRows, detailTransactionId]);

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

  if (!client) {
    return null;
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className={cn('flex-1 space-y-6', detailTransactionId && 'pr-4')}>
        {/* Page header with client info */}
        <div className="section-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-ghost -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{client.name}</h1>
                <p className="text-neutral-500">
                  {filteredTransactions.length} transactions pending review
                </p>
              </div>
            </div>
          </div>

          {/* QB connection status */}
          <div
            className={cn(
              'badge',
              client.qbConnected
                ? 'bg-success-50 text-success-700'
                : 'bg-warning-50 text-warning-700'
            )}
          >
            <span
              className={cn(
                'status-dot',
                client.qbConnected ? 'bg-success-500' : 'bg-warning-500'
              )}
            />
            {client.qbConnected ? 'QuickBooks Connected' : 'QB Not Connected'}
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
                className={cn('btn-ghost', showFilters && 'bg-neutral-100')}
              >
                <Filter className="h-4 w-4" />
                More
              </button>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-ghost text-neutral-500">
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
