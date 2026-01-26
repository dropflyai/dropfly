/**
 * Transaction Types for BookFly
 *
 * These types define the structure of parsed transactions,
 * their review status, and supporting entities.
 */

/**
 * Type of accounting entity/transaction
 */
export type EntityType = 'expense' | 'bill' | 'invoice' | 'journal_entry';

/**
 * Review status for a parsed transaction
 */
export type ReviewStatus = 'pending_review' | 'approved' | 'rejected';

/**
 * Sync status with the accounting provider
 */
export type SyncStatus = 'not_synced' | 'syncing' | 'synced' | 'error';

/**
 * Severity level for transaction flags
 */
export type FlagSeverity = 'info' | 'warning' | 'error';

/**
 * A flag indicating an issue or note about a transaction
 */
export interface TransactionFlag {
  /** Type of flag (e.g., 'duplicate', 'missing_receipt', 'unusual_amount') */
  type: string;

  /** Human-readable message describing the flag */
  message: string;

  /** Severity level of the flag */
  severity: FlagSeverity;

  /** Optional field the flag relates to */
  field?: string;

  /** Optional suggested action */
  suggestedAction?: string;
}

/**
 * A single line item within a transaction
 */
export interface LineItem {
  /** Description of the line item */
  description: string;

  /** Total amount for this line item */
  amount: number;

  /** Category or account for this line item */
  category?: string;

  /** Account ID in the accounting system */
  accountId?: string;

  /** Quantity (for unit-based items) */
  quantity?: number;

  /** Unit price (for unit-based items) */
  unitPrice?: number;

  /** Tax amount for this line item */
  taxAmount?: number;

  /** Tax code or rate identifier */
  taxCode?: string;

  /** Class/department tracking */
  classId?: string;

  /** Location tracking */
  locationId?: string;

  /** Billable status */
  billable?: boolean;

  /** Customer to bill if billable */
  customerId?: string;
}

/**
 * A fully parsed transaction ready for review and sync
 */
export interface ParsedTransaction {
  /** Unique identifier for the parsed transaction */
  id: string;

  /** Reference to the client this transaction belongs to */
  clientId: string;

  /** Reference to the accounting connection for syncing */
  connectionId: string;

  /** Type of accounting entity */
  entityType: EntityType;

  /** Current review status */
  reviewStatus: ReviewStatus;

  /** Current sync status */
  syncStatus: SyncStatus;

  /** Date of the transaction */
  transactionDate: Date;

  /** Due date (for bills and invoices) */
  dueDate?: Date;

  /** Total amount of the transaction */
  totalAmount: number;

  /** Currency code (ISO 4217) */
  currency: string;

  /** Vendor/supplier information */
  vendor?: {
    id?: string;
    name: string;
    email?: string;
  };

  /** Customer information (for invoices) */
  customer?: {
    id?: string;
    name: string;
    email?: string;
  };

  /** Line items for the transaction */
  lineItems: LineItem[];

  /** Transaction reference number */
  referenceNumber?: string;

  /** Memo or description */
  memo?: string;

  /** Payment method */
  paymentMethod?: string;

  /** Bank account ID for the transaction */
  bankAccountId?: string;

  /** Flags/issues with the transaction */
  flags: TransactionFlag[];

  /** Confidence score from AI parsing (0-1) */
  confidence: number;

  /** Original source document URL or reference */
  sourceDocument?: string;

  /** Raw extracted text from the document */
  rawText?: string;

  /** AI model used for parsing */
  aiModel?: string;

  /** Timestamp when the transaction was parsed */
  createdAt: Date;

  /** Timestamp when the transaction was last updated */
  updatedAt?: Date;

  /** Timestamp when the transaction was synced */
  syncedAt?: Date;

  /** External ID in the accounting system after sync */
  externalId?: string;

  /** Error message if sync failed */
  syncError?: string;

  /** User who approved/rejected the transaction */
  reviewedBy?: string;

  /** Timestamp when the transaction was reviewed */
  reviewedAt?: Date;

  /** Notes from the reviewer */
  reviewNotes?: string;
}

/**
 * A correction made to a parsed transaction
 */
export interface Correction {
  /** Unique identifier for the correction */
  id: string;

  /** Reference to the transaction being corrected */
  transactionId: string;

  /** Field that was corrected */
  field: string;

  /** Original value before correction */
  originalValue: unknown;

  /** Corrected value */
  correctedValue: unknown;

  /** Reason for the correction */
  reason: string;

  /** User who made the correction */
  correctedBy: string;

  /** Timestamp when the correction was made */
  correctedAt: Date;

  /** Whether this correction should be learned from */
  shouldLearn: boolean;
}

/**
 * A pattern for recognizing and categorizing vendors
 */
export interface VendorPattern {
  /** Unique identifier for the pattern */
  id: string;

  /** Reference to the client this pattern belongs to */
  clientId: string;

  /** Canonical vendor name */
  vendorName: string;

  /** Vendor ID in the accounting system */
  vendorId?: string;

  /** Alternative names/aliases for this vendor */
  aliases: string[];

  /** Default category/account for this vendor */
  defaultCategory?: string;

  /** Default account ID for this vendor */
  defaultAccountId?: string;

  /** Default class for this vendor */
  defaultClassId?: string;

  /** Typical transaction amounts for anomaly detection */
  typicalAmounts?: {
    min: number;
    max: number;
    average: number;
  };

  /** Number of times this pattern has been matched */
  matchCount: number;

  /** Timestamp when the pattern was created */
  createdAt: Date;

  /** Timestamp when the pattern was last updated */
  updatedAt?: Date;

  /** Whether the pattern is active */
  isActive: boolean;
}

/**
 * Input type for creating a parsed transaction
 */
export interface CreateParsedTransactionInput {
  clientId: string;
  connectionId: string;
  entityType: EntityType;
  transactionDate: Date;
  totalAmount: number;
  currency?: string;
  vendor?: { name: string; email?: string };
  customer?: { name: string; email?: string };
  lineItems: Omit<LineItem, 'accountId'>[];
  referenceNumber?: string;
  memo?: string;
  sourceDocument?: string;
  rawText?: string;
  confidence: number;
  aiModel?: string;
}

/**
 * Input type for updating a parsed transaction during review
 */
export interface UpdateTransactionInput {
  entityType?: EntityType;
  transactionDate?: Date;
  dueDate?: Date;
  totalAmount?: number;
  vendor?: { id?: string; name: string; email?: string };
  customer?: { id?: string; name: string; email?: string };
  lineItems?: LineItem[];
  referenceNumber?: string;
  memo?: string;
  paymentMethod?: string;
  bankAccountId?: string;
}

/**
 * Summary statistics for transactions
 */
export interface TransactionSummary {
  total: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  synced: number;
  syncErrors: number;
  totalAmount: number;
}
