/**
 * BookFly Shared Types - Barrel Export
 *
 * This module exports all shared types used across the BookFly application.
 */

// Client and Connection types
export {
  type ConnectionProvider,
  type Client,
  type AccountingConnection,
  type CreateClientInput,
  type UpdateClientInput,
  type CreateConnectionInput,
} from './client';

// Transaction types
export {
  type EntityType,
  type ReviewStatus,
  type SyncStatus,
  type FlagSeverity,
  type TransactionFlag,
  type LineItem,
  type ParsedTransaction,
  type Correction,
  type VendorPattern,
  type CreateParsedTransactionInput,
  type UpdateTransactionInput,
  type TransactionSummary,
} from './transaction';

// Accounting Provider types
export {
  type OAuthCredentials,
  type Connection,
  type Account,
  type Vendor,
  type Customer,
  type Address,
  type ExpenseData,
  type ExpenseLineItem,
  type BillData,
  type BillLineItem,
  type InvoiceData,
  type InvoiceLineItem,
  type JournalEntryData,
  type JournalEntryLine,
  type TransactionResult,
  type AccountingProvider,
  type CompanyInfo,
  AccountingProviderError,
  TokenRefreshError,
  RateLimitError,
} from './accounting-provider';
