/**
 * Transaction Detail Panel
 *
 * Slide-over panel showing full transaction details including
 * document preview, extracted fields, AI reasoning, and actions.
 */

'use client';

import { useState, useEffect } from 'react';
import { cn, formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { SyncStatus } from '@/components/SyncStatus';
import {
  X,
  FileText,
  Edit2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Clock,
  ChevronDown,
  Loader2,
} from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  vendor: string;
  amount: number;
  category: string | null;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'synced';
  aiReasoning?: string;
  documentUrl?: string;
}

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

// Mock sync history
const mockSyncHistory = [
  {
    id: '1',
    status: 'pending' as const,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    status: 'syncing' as const,
    timestamp: new Date(Date.now() - 3000000).toISOString(),
  },
];

// Mock validation flags
const mockValidationFlags = [
  { type: 'warning' as const, message: 'Amount exceeds typical range for this category' },
];

// Available categories for editing
const categories = [
  'Office Supplies',
  'Software & Subscriptions',
  'Travel & Transportation',
  'Meals & Entertainment',
  'Professional Services',
  'Utilities',
  'Rent & Lease',
  'Equipment',
  'Marketing & Advertising',
  'Insurance',
  'Miscellaneous',
];

export function TransactionDetail({
  transaction,
  onClose,
  onApprove,
  onReject,
}: TransactionDetailProps) {
  // Editable field state
  const [isEditing, setIsEditing] = useState(false);
  const [editedVendor, setEditedVendor] = useState(transaction.vendor);
  const [editedAmount, setEditedAmount] = useState(transaction.amount.toString());
  const [editedCategory, setEditedCategory] = useState(transaction.category || '');
  const [editedDate, setEditedDate] = useState(transaction.date);

  // Loading states
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // Accordion state
  const [showHistory, setShowHistory] = useState(false);

  // Reset edited values when transaction changes
  useEffect(() => {
    setEditedVendor(transaction.vendor);
    setEditedAmount(transaction.amount.toString());
    setEditedCategory(transaction.category || '');
    setEditedDate(transaction.date);
    setIsEditing(false);
  }, [transaction]);

  // Handle approve
  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove();
    } finally {
      setApproving(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    setRejecting(true);
    try {
      await onReject();
    } finally {
      setRejecting(false);
    }
  };

  // Handle save edits
  const handleSave = () => {
    // In production, this would call the API to update the transaction
    setIsEditing(false);
  };

  // Handle cancel edits
  const handleCancel = () => {
    setEditedVendor(transaction.vendor);
    setEditedAmount(transaction.amount.toString());
    setEditedCategory(transaction.category || '');
    setEditedDate(transaction.date);
    setIsEditing(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="slide-over-backdrop animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="slide-over animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Transaction Details
            </h2>
            <p className="text-sm text-neutral-500">ID: {transaction.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Document preview */}
          {transaction.documentUrl && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-neutral-700">
                Original Document
              </h3>
              <div className="relative aspect-[4/3] rounded-lg border border-neutral-200 bg-neutral-50">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-neutral-300" />
                    <p className="mt-2 text-sm text-neutral-500">
                      Document preview
                    </p>
                    <a
                      href={transaction.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      Open original
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Extracted fields */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-700">
                Extracted Fields
              </h3>
              {!isEditing && transaction.status === 'pending' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-neutral-500">
                  Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    className="input mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm text-neutral-900">
                    {formatDate(transaction.date)}
                  </p>
                )}
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-xs font-medium text-neutral-500">
                  Vendor
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedVendor}
                    onChange={(e) => setEditedVendor(e.target.value)}
                    className="input mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    {transaction.vendor}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-neutral-500">
                  Amount
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editedAmount}
                    onChange={(e) => setEditedAmount(e.target.value)}
                    className="input mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm font-mono text-neutral-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-neutral-500">
                  Category
                </label>
                {isEditing ? (
                  <select
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    className="input mt-1"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 text-sm text-neutral-900">
                    {transaction.category || '-'}
                  </p>
                )}
              </div>

              {/* Edit actions */}
              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} className="btn-primary flex-1">
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI reasoning */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-neutral-700">
              AI Reasoning
            </h3>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <ConfidenceBadge
                  score={transaction.confidence}
                  showScore
                />
              </div>
              <p className="text-sm text-neutral-600">
                {transaction.aiReasoning || 'No reasoning provided.'}
              </p>
            </div>
          </div>

          {/* Validation flags */}
          {mockValidationFlags.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-neutral-700">
                Validation Flags
              </h3>
              <div className="space-y-2">
                {mockValidationFlags.map((flag, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-2 rounded-lg p-3',
                      flag.type === 'warning'
                        ? 'bg-warning-50 text-warning-700'
                        : 'bg-error-50 text-error-700'
                    )}
                  >
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-sm">{flag.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current status */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-neutral-700">
              Current Status
            </h3>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <SyncStatus status={transaction.status} showLabel />
            </div>
          </div>

          {/* Sync history accordion */}
          <div className="mb-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-left transition-colors hover:bg-neutral-100"
            >
              <h3 className="text-sm font-medium text-neutral-700">
                Sync History
              </h3>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-neutral-400 transition-transform',
                  showHistory && 'rotate-180'
                )}
              />
            </button>

            {showHistory && (
              <div className="mt-2 space-y-2 rounded-lg border border-neutral-200 p-4">
                {mockSyncHistory.length === 0 ? (
                  <p className="text-sm text-neutral-500">No sync history yet.</p>
                ) : (
                  mockSyncHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {entry.status === 'syncing' ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />
                        ) : entry.status === 'pending' ? (
                          <Clock className="h-4 w-4 text-warning-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-success-500" />
                        )}
                        <span className="capitalize text-neutral-700">
                          {entry.status}
                        </span>
                      </div>
                      <span className="text-neutral-500">
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer with actions */}
        {transaction.status === 'pending' && (
          <div className="border-t border-neutral-200 p-4">
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={rejecting || isEditing}
                className="btn-danger flex-1"
              >
                {rejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={approving || isEditing}
                className="btn-success flex-1"
              >
                {approving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
