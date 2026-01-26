/**
 * Review Table Component
 *
 * @tanstack/react-table implementation with sortable columns,
 * row selection, confidence badges, and keyboard navigation.
 */

'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { SyncStatus } from '@/components/SyncStatus';
import { ArrowUpDown, ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react';

// Transaction type for the table
export interface Transaction {
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

interface ReviewTableProps {
  transactions: Transaction[];
  selectedRows: string[];
  onSelectionChange: (selected: string[]) => void;
  onRowClick: (id: string) => void;
  selectedRowId: string | null;
}

const columnHelper = createColumnHelper<Transaction>();

export function ReviewTable({
  transactions,
  selectedRows,
  onSelectionChange,
  onRowClick,
  selectedRowId,
}: ReviewTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Convert selectedRows array to RowSelectionState object
  const rowSelection: RowSelectionState = useMemo(
    () =>
      selectedRows.reduce((acc, id) => {
        const index = transactions.findIndex((t) => t.id === id);
        if (index !== -1) {
          acc[index] = true;
        }
        return acc;
      }, {} as RowSelectionState),
    [selectedRows, transactions]
  );

  // Handle row selection changes
  const handleRowSelectionChange = useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      const selectedIds = Object.keys(newSelection)
        .filter((key) => newSelection[parseInt(key)])
        .map((key) => transactions[parseInt(key)]?.id)
        .filter(Boolean) as string[];
      onSelectionChange(selectedIds);
    },
    [rowSelection, transactions, onSelectionChange]
  );

  // Column definitions
  const columns = useMemo(
    () => [
      // Checkbox column
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <button
            onClick={table.getToggleAllRowsSelectedHandler()}
            className="flex items-center justify-center"
          >
            {table.getIsAllRowsSelected() ? (
              <CheckSquare className="h-4 w-4 text-primary-600" />
            ) : table.getIsSomeRowsSelected() ? (
              <div className="relative">
                <Square className="h-4 w-4 text-neutral-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 bg-primary-600" />
                </div>
              </div>
            ) : (
              <Square className="h-4 w-4 text-neutral-400" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              row.toggleSelected();
            }}
            className="flex items-center justify-center"
          >
            {row.getIsSelected() ? (
              <CheckSquare className="h-4 w-4 text-primary-600" />
            ) : (
              <Square className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
            )}
          </button>
        ),
        size: 40,
      }),

      // Date column
      columnHelper.accessor('date', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 font-medium"
          >
            Date
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 text-neutral-300" />
            )}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-neutral-600">{formatDate(getValue())}</span>
        ),
        size: 120,
      }),

      // Vendor column
      columnHelper.accessor('vendor', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 font-medium"
          >
            Vendor
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 text-neutral-300" />
            )}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-neutral-900">{getValue()}</span>
        ),
        size: 200,
      }),

      // Amount column
      columnHelper.accessor('amount', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 font-medium"
          >
            Amount
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 text-neutral-300" />
            )}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-neutral-900">
            {formatCurrency(getValue())}
          </span>
        ),
        size: 120,
      }),

      // Category column
      columnHelper.accessor('category', {
        header: 'Category',
        cell: ({ getValue }) => (
          <span className="text-neutral-600">{getValue() || '-'}</span>
        ),
        size: 180,
      }),

      // Confidence column
      columnHelper.accessor('confidence', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 font-medium"
          >
            Confidence
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 text-neutral-300" />
            )}
          </button>
        ),
        cell: ({ getValue, row }) => (
          <ConfidenceBadge
            score={getValue()}
            reasoning={row.original.aiReasoning}
          />
        ),
        size: 130,
      }),

      // Status column
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => <SyncStatus status={getValue()} />,
        size: 120,
      }),
    ],
    []
  );

  // Table instance
  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const rows = table.getRowModel().rows;

      // j = next row
      if (e.key === 'j') {
        e.preventDefault();
        setFocusedRowIndex((prev) => {
          const next = prev === null ? 0 : Math.min(prev + 1, rows.length - 1);
          return next;
        });
      }

      // k = previous row
      if (e.key === 'k') {
        e.preventDefault();
        setFocusedRowIndex((prev) => {
          const next = prev === null ? 0 : Math.max(prev - 1, 0);
          return next;
        });
      }

      // Space = toggle selection of focused row
      if (e.key === ' ' && focusedRowIndex !== null) {
        e.preventDefault();
        rows[focusedRowIndex]?.toggleSelected();
      }

      // Enter = open detail panel for focused row
      if (e.key === 'Enter' && focusedRowIndex !== null) {
        e.preventDefault();
        const rowId = rows[focusedRowIndex]?.original.id;
        if (rowId) {
          onRowClick(rowId);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [table, focusedRowIndex, onRowClick]);

  // Scroll focused row into view
  useEffect(() => {
    if (focusedRowIndex !== null && tableRef.current) {
      const row = tableRef.current.querySelector(
        `tbody tr:nth-child(${focusedRowIndex + 1})`
      );
      row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedRowIndex]);

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-neutral-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="table-header px-4 py-3"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-neutral-500"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original.id)}
                  className={cn(
                    'table-row cursor-pointer',
                    row.getIsSelected() && 'bg-primary-50',
                    selectedRowId === row.original.id && 'bg-primary-100',
                    focusedRowIndex === index &&
                      'ring-2 ring-inset ring-primary-500'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="table-cell">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
