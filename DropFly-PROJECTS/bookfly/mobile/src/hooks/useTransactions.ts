/**
 * Transactions hook for BookFly
 * Manages transaction operations, review workflow, and sync status
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Types
// ============================================================================

/** Transaction status in review workflow */
export type TransactionStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'needs_edit'
  | 'synced';

/** Sync status for transaction */
export type TransactionSyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

/** Confidence level for extracted data */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/** Flag types for transactions */
export type TransactionFlag =
  | 'duplicate_suspected'
  | 'amount_unusual'
  | 'category_uncertain'
  | 'date_unclear'
  | 'vendor_unknown';

/** Extracted receipt data */
export interface ExtractedData {
  vendor: string | null;
  amount: number | null;
  date: Date | null;
  category: string | null;
  taxAmount: number | null;
  paymentMethod: string | null;
  lineItems: LineItem[];
  rawText: string | null;
}

/** Line item from receipt */
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/** Transaction entity */
export interface Transaction {
  id: string;
  clientId: string;
  status: TransactionStatus;
  syncStatus: TransactionSyncStatus;

  // Receipt data
  receiptImageUrl: string;
  thumbnailUrl: string | null;

  // Extracted fields
  vendor: string | null;
  amount: number | null;
  date: Date | null;
  category: string | null;
  description: string | null;

  // Confidence and flags
  confidence: number; // 0-1
  confidenceLevel: ConfidenceLevel;
  flags: TransactionFlag[];

  // Full extracted data (for editing)
  extractedData: ExtractedData | null;

  // Metadata
  batchId: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  syncedAt: Date | null;
}

/** Input for creating a transaction */
export interface CreateTransactionInput {
  clientId: string;
  receiptImageUrl: string;
  thumbnailUrl?: string;
  extractedData?: ExtractedData;
  batchId?: string;
}

/** Input for updating transaction fields */
export interface UpdateTransactionInput {
  vendor?: string | null;
  amount?: number | null;
  date?: Date | null;
  category?: string | null;
  description?: string | null;
  status?: TransactionStatus;
}

/** Filter options for transactions */
export interface TransactionFilters {
  clientId?: string;
  status?: TransactionStatus | TransactionStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  hasFlags?: boolean;
}

/** Hook state */
export interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  pendingCount: number;
  syncedCount: number;
}

/** Hook actions */
export interface TransactionsActions {
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  createTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, input: UpdateTransactionInput) => Promise<Transaction>;
  approveTransaction: (id: string) => Promise<void>;
  rejectTransaction: (id: string) => Promise<void>;
  bulkApprove: (ids: string[]) => Promise<void>;
  bulkReject: (ids: string[]) => Promise<void>;
  syncTransactions: (clientId: string) => Promise<void>;
  getPendingForClient: (clientId: string) => Transaction[];
  getTransactionById: (id: string) => Transaction | null;
}

export type UseTransactionsReturn = TransactionsState & TransactionsActions;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Determine confidence level from numeric confidence
 */
function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

/**
 * Generate flags based on extracted data
 */
function generateFlags(data: ExtractedData | null, confidence: number): TransactionFlag[] {
  const flags: TransactionFlag[] = [];

  if (!data) return flags;

  if (confidence < 0.6) {
    flags.push('category_uncertain');
  }

  if (!data.vendor) {
    flags.push('vendor_unknown');
  }

  if (!data.date) {
    flags.push('date_unclear');
  }

  if (data.amount && (data.amount > 10000 || data.amount < 0.01)) {
    flags.push('amount_unusual');
  }

  return flags;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing transactions
 *
 * @example
 * ```tsx
 * const {
 *   transactions,
 *   pendingCount,
 *   approveTransaction,
 *   rejectTransaction
 * } = useTransactions();
 *
 * // Get pending for current client
 * const pending = getPendingForClient(activeClientId);
 *
 * // Approve a transaction
 * await approveTransaction(transaction.id);
 * ```
 */
export function useTransactions(): UseTransactionsReturn {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const pendingCount = transactions.filter(t => t.status === 'pending_review').length;
  const syncedCount = transactions.filter(t => t.syncStatus === 'synced').length;

  // ============================================================================
  // Data Fetching
  // ============================================================================

  /**
   * Fetch transactions with optional filters
   */
  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom.toISOString());
      }

      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo.toISOString());
      }

      if (filters?.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount);
      }

      if (filters?.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Transform database records
      const transformed: Transaction[] = (data ?? []).map(record => {
        const confidence = record.confidence ?? 0;
        const extractedData = record.extracted_data as ExtractedData | null;

        return {
          id: record.id,
          clientId: record.client_id,
          status: record.status as TransactionStatus,
          syncStatus: record.sync_status as TransactionSyncStatus,
          receiptImageUrl: record.receipt_image_url,
          thumbnailUrl: record.thumbnail_url,
          vendor: record.vendor,
          amount: record.amount,
          date: record.date ? new Date(record.date) : null,
          category: record.category,
          description: record.description,
          confidence,
          confidenceLevel: getConfidenceLevel(confidence),
          flags: (record.flags as TransactionFlag[]) ?? [],
          extractedData,
          batchId: record.batch_id,
          createdAt: new Date(record.created_at),
          updatedAt: new Date(record.updated_at),
          reviewedAt: record.reviewed_at ? new Date(record.reviewed_at) : null,
          syncedAt: record.synced_at ? new Date(record.synced_at) : null,
        };
      });

      // Apply client-side filtering for flags
      let filtered = transformed;
      if (filters?.hasFlags !== undefined) {
        filtered = transformed.filter(t =>
          filters.hasFlags ? t.flags.length > 0 : t.flags.length === 0
        );
      }

      setTransactions(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Create a new transaction from scanned receipt
   */
  const createTransaction = useCallback(
    async (input: CreateTransactionInput): Promise<Transaction> => {
      setIsLoading(true);
      setError(null);

      try {
        const confidence = input.extractedData ? 0.75 : 0; // Mock confidence
        const flags = generateFlags(input.extractedData ?? null, confidence);

        const { data, error: insertError } = await supabase
          .from('transactions')
          .insert({
            client_id: input.clientId,
            status: 'pending_review',
            sync_status: 'pending',
            receipt_image_url: input.receiptImageUrl,
            thumbnail_url: input.thumbnailUrl ?? null,
            vendor: input.extractedData?.vendor ?? null,
            amount: input.extractedData?.amount ?? null,
            date: input.extractedData?.date?.toISOString() ?? null,
            category: input.extractedData?.category ?? null,
            confidence,
            flags,
            extracted_data: input.extractedData ?? null,
            batch_id: input.batchId ?? null,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        const newTransaction: Transaction = {
          id: data.id,
          clientId: data.client_id,
          status: data.status as TransactionStatus,
          syncStatus: data.sync_status as TransactionSyncStatus,
          receiptImageUrl: data.receipt_image_url,
          thumbnailUrl: data.thumbnail_url,
          vendor: data.vendor,
          amount: data.amount,
          date: data.date ? new Date(data.date) : null,
          category: data.category,
          description: data.description,
          confidence: data.confidence,
          confidenceLevel: getConfidenceLevel(data.confidence),
          flags: data.flags as TransactionFlag[],
          extractedData: data.extracted_data as ExtractedData | null,
          batchId: data.batch_id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          reviewedAt: null,
          syncedAt: null,
        };

        setTransactions(prev => [newTransaction, ...prev]);

        return newTransaction;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create transaction';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Update transaction fields
   */
  const updateTransaction = useCallback(
    async (id: string, input: UpdateTransactionInput): Promise<Transaction> => {
      setIsLoading(true);
      setError(null);

      try {
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (input.vendor !== undefined) updateData.vendor = input.vendor;
        if (input.amount !== undefined) updateData.amount = input.amount;
        if (input.date !== undefined) updateData.date = input.date?.toISOString() ?? null;
        if (input.category !== undefined) updateData.category = input.category;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.status !== undefined) updateData.status = input.status;

        const { data, error: updateError } = await supabase
          .from('transactions')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        const updated: Transaction = {
          id: data.id,
          clientId: data.client_id,
          status: data.status as TransactionStatus,
          syncStatus: data.sync_status as TransactionSyncStatus,
          receiptImageUrl: data.receipt_image_url,
          thumbnailUrl: data.thumbnail_url,
          vendor: data.vendor,
          amount: data.amount,
          date: data.date ? new Date(data.date) : null,
          category: data.category,
          description: data.description,
          confidence: data.confidence,
          confidenceLevel: getConfidenceLevel(data.confidence),
          flags: data.flags as TransactionFlag[],
          extractedData: data.extracted_data as ExtractedData | null,
          batchId: data.batch_id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : null,
          syncedAt: data.synced_at ? new Date(data.synced_at) : null,
        };

        setTransactions(prev => prev.map(t => (t.id === id ? updated : t)));

        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update transaction';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // Review Workflow
  // ============================================================================

  /**
   * Approve a transaction
   */
  const approveTransaction = useCallback(async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setTransactions(prev =>
        prev.map(t =>
          t.id === id
            ? { ...t, status: 'approved' as TransactionStatus, reviewedAt: new Date() }
            : t
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve transaction';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Reject a transaction
   */
  const rejectTransaction = useCallback(async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setTransactions(prev =>
        prev.map(t =>
          t.id === id
            ? { ...t, status: 'rejected' as TransactionStatus, reviewedAt: new Date() }
            : t
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject transaction';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Bulk approve multiple transactions
   */
  const bulkApprove = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setTransactions(prev =>
        prev.map(t =>
          ids.includes(t.id)
            ? { ...t, status: 'approved' as TransactionStatus, reviewedAt: new Date() }
            : t
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bulk approve';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Bulk reject multiple transactions
   */
  const bulkReject = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setTransactions(prev =>
        prev.map(t =>
          ids.includes(t.id)
            ? { ...t, status: 'rejected' as TransactionStatus, reviewedAt: new Date() }
            : t
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bulk reject';
      setError(message);
      throw err;
    }
  }, []);

  // ============================================================================
  // Sync Operations
  // ============================================================================

  /**
   * Sync approved transactions for a client
   */
  const syncTransactions = useCallback(async (clientId: string) => {
    setIsSyncing(true);
    setError(null);

    try {
      // Get approved transactions for client
      const toSync = transactions.filter(
        t => t.clientId === clientId && t.status === 'approved' && t.syncStatus !== 'synced'
      );

      if (toSync.length === 0) {
        return;
      }

      // Update status to syncing
      const ids = toSync.map(t => t.id);

      await supabase
        .from('transactions')
        .update({ sync_status: 'syncing' })
        .in('id', ids);

      setTransactions(prev =>
        prev.map(t =>
          ids.includes(t.id) ? { ...t, syncStatus: 'syncing' as TransactionSyncStatus } : t
        )
      );

      // Simulate sync process (in production, this would call accounting API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mark as synced
      const syncedAt = new Date().toISOString();

      await supabase
        .from('transactions')
        .update({
          sync_status: 'synced',
          synced_at: syncedAt,
          status: 'synced',
        })
        .in('id', ids);

      setTransactions(prev =>
        prev.map(t =>
          ids.includes(t.id)
            ? {
                ...t,
                syncStatus: 'synced' as TransactionSyncStatus,
                status: 'synced' as TransactionStatus,
                syncedAt: new Date(syncedAt),
              }
            : t
        )
      );

      // Update client's last synced timestamp
      await supabase
        .from('clients')
        .update({
          last_synced_at: syncedAt,
          sync_status: 'synced',
        })
        .eq('id', clientId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [transactions]);

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get pending transactions for a specific client
   */
  const getPendingForClient = useCallback(
    (clientId: string): Transaction[] => {
      return transactions.filter(
        t => t.clientId === clientId && t.status === 'pending_review'
      );
    },
    [transactions]
  );

  /**
   * Get transaction by ID
   */
  const getTransactionById = useCallback(
    (id: string): Transaction | null => {
      return transactions.find(t => t.id === id) ?? null;
    },
    [transactions]
  );

  // ============================================================================
  // Return Value
  // ============================================================================

  return {
    // State
    transactions,
    isLoading,
    isSyncing,
    error,
    pendingCount,
    syncedCount,

    // Actions
    fetchTransactions,
    createTransaction,
    updateTransaction,
    approveTransaction,
    rejectTransaction,
    bulkApprove,
    bulkReject,
    syncTransactions,
    getPendingForClient,
    getTransactionById,
  };
}

export default useTransactions;
