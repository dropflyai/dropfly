/**
 * Accounting Provider Interface and Supporting Types
 *
 * This module defines the abstract interface that all accounting
 * provider implementations must follow, enabling a unified API
 * for QuickBooks, Xero, FreshBooks, and future providers.
 */

import { ConnectionProvider } from './client';

/**
 * OAuth credentials for initiating a connection
 */
export interface OAuthCredentials {
  /** OAuth authorization code from callback */
  code: string;

  /** Redirect URI used in the OAuth flow */
  redirectUri: string;

  /** Provider-specific realm/company ID (if known) */
  realmId?: string;

  /** State parameter for CSRF protection */
  state?: string;
}

/**
 * Active connection to an accounting provider
 */
export interface Connection {
  /** The accounting provider type */
  provider: ConnectionProvider;

  /** OAuth access token */
  accessToken: string;

  /** OAuth refresh token */
  refreshToken: string;

  /** Provider-specific realm/company ID */
  realmId: string;

  /** Company name from the provider */
  companyName: string;

  /** Token expiration timestamp */
  expiresAt: Date;

  /** Base API URL for this connection */
  apiBaseUrl?: string;
}

/**
 * Account from the chart of accounts
 */
export interface Account {
  /** Provider's unique ID for the account */
  id: string;

  /** Account name */
  name: string;

  /** Account number (if available) */
  accountNumber?: string;

  /** Account type (e.g., 'Expense', 'Income', 'Asset', 'Liability') */
  accountType: string;

  /** Account sub-type for more specific categorization */
  accountSubType?: string;

  /** Current balance (if available) */
  currentBalance?: number;

  /** Currency code */
  currency?: string;

  /** Whether the account is active */
  isActive: boolean;

  /** Parent account ID for sub-accounts */
  parentId?: string;

  /** Full hierarchical name (e.g., 'Expenses:Office:Supplies') */
  fullyQualifiedName?: string;

  /** Description of the account */
  description?: string;
}

/**
 * Vendor/Supplier entity
 */
export interface Vendor {
  /** Provider's unique ID for the vendor */
  id: string;

  /** Vendor display name */
  displayName: string;

  /** Company name */
  companyName?: string;

  /** Primary email address */
  email?: string;

  /** Primary phone number */
  phone?: string;

  /** Billing address */
  billingAddress?: Address;

  /** Whether the vendor is active */
  isActive: boolean;

  /** Current balance owed to vendor */
  balance?: number;

  /** Currency code */
  currency?: string;

  /** Tax ID / ABN / VAT number */
  taxId?: string;

  /** Default expense account for this vendor */
  defaultExpenseAccountId?: string;

  /** Payment terms */
  terms?: string;
}

/**
 * Customer entity
 */
export interface Customer {
  /** Provider's unique ID for the customer */
  id: string;

  /** Customer display name */
  displayName: string;

  /** Company name */
  companyName?: string;

  /** Primary email address */
  email?: string;

  /** Primary phone number */
  phone?: string;

  /** Billing address */
  billingAddress?: Address;

  /** Shipping address */
  shippingAddress?: Address;

  /** Whether the customer is active */
  isActive: boolean;

  /** Current balance owed by customer */
  balance?: number;

  /** Currency code */
  currency?: string;

  /** Tax ID / ABN / VAT number */
  taxId?: string;

  /** Payment terms */
  terms?: string;

  /** Tax exempt status */
  taxExempt?: boolean;
}

/**
 * Address structure
 */
export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Data required to create an expense
 */
export interface ExpenseData {
  /** Account to pay from (bank/credit card) */
  paymentAccountId: string;

  /** Vendor ID (optional - can create without vendor) */
  vendorId?: string;

  /** Transaction date */
  transactionDate: Date;

  /** Total amount */
  totalAmount: number;

  /** Currency code */
  currency?: string;

  /** Payment method */
  paymentMethod?: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'eft';

  /** Reference number */
  referenceNumber?: string;

  /** Memo/description */
  memo?: string;

  /** Line items */
  lineItems: ExpenseLineItem[];
}

/**
 * Line item for an expense
 */
export interface ExpenseLineItem {
  /** Expense account ID */
  accountId: string;

  /** Amount for this line */
  amount: number;

  /** Description */
  description?: string;

  /** Class ID for tracking */
  classId?: string;

  /** Customer ID if billable */
  customerId?: string;

  /** Whether this is billable to customer */
  billable?: boolean;

  /** Tax code ID */
  taxCodeId?: string;
}

/**
 * Data required to create a bill
 */
export interface BillData {
  /** Vendor ID */
  vendorId: string;

  /** Bill date */
  transactionDate: Date;

  /** Due date */
  dueDate: Date;

  /** Total amount */
  totalAmount: number;

  /** Currency code */
  currency?: string;

  /** Vendor's invoice/reference number */
  referenceNumber?: string;

  /** Memo/description */
  memo?: string;

  /** AP account ID (defaults to Accounts Payable) */
  apAccountId?: string;

  /** Line items */
  lineItems: BillLineItem[];

  /** Payment terms */
  terms?: string;
}

/**
 * Line item for a bill
 */
export interface BillLineItem {
  /** Expense account ID */
  accountId: string;

  /** Amount for this line */
  amount: number;

  /** Description */
  description?: string;

  /** Quantity */
  quantity?: number;

  /** Unit price */
  unitPrice?: number;

  /** Class ID for tracking */
  classId?: string;

  /** Customer ID if billable */
  customerId?: string;

  /** Whether this is billable to customer */
  billable?: boolean;

  /** Tax code ID */
  taxCodeId?: string;
}

/**
 * Data required to create an invoice
 */
export interface InvoiceData {
  /** Customer ID */
  customerId: string;

  /** Invoice date */
  transactionDate: Date;

  /** Due date */
  dueDate: Date;

  /** Total amount */
  totalAmount: number;

  /** Currency code */
  currency?: string;

  /** Invoice number */
  invoiceNumber?: string;

  /** Memo/description */
  memo?: string;

  /** Customer message */
  customerMessage?: string;

  /** Line items */
  lineItems: InvoiceLineItem[];

  /** Payment terms */
  terms?: string;

  /** Billing address override */
  billingAddress?: Address;

  /** Shipping address */
  shippingAddress?: Address;

  /** Email to send invoice to */
  billEmail?: string;
}

/**
 * Line item for an invoice
 */
export interface InvoiceLineItem {
  /** Item/Product ID (if using inventory items) */
  itemId?: string;

  /** Income account ID (if not using item) */
  accountId?: string;

  /** Description */
  description: string;

  /** Quantity */
  quantity: number;

  /** Unit price */
  unitPrice: number;

  /** Amount (quantity * unitPrice) */
  amount: number;

  /** Class ID for tracking */
  classId?: string;

  /** Tax code ID */
  taxCodeId?: string;

  /** Discount percentage */
  discountPercent?: number;
}

/**
 * Data required to create a journal entry
 */
export interface JournalEntryData {
  /** Transaction date */
  transactionDate: Date;

  /** Reference number */
  referenceNumber?: string;

  /** Memo/description */
  memo?: string;

  /** Journal entry lines (must balance to zero) */
  lines: JournalEntryLine[];

  /** Currency code */
  currency?: string;

  /** Adjustment entry flag */
  isAdjustment?: boolean;
}

/**
 * Line item for a journal entry
 */
export interface JournalEntryLine {
  /** Account ID */
  accountId: string;

  /** Debit amount (mutually exclusive with credit) */
  debitAmount?: number;

  /** Credit amount (mutually exclusive with debit) */
  creditAmount?: number;

  /** Description for this line */
  description?: string;

  /** Entity reference (customer/vendor) */
  entityId?: string;

  /** Entity type */
  entityType?: 'customer' | 'vendor';

  /** Class ID for tracking */
  classId?: string;

  /** Location ID for tracking */
  locationId?: string;
}

/**
 * Result of creating a transaction in the accounting system
 */
export interface TransactionResult {
  /** Whether the operation succeeded */
  success: boolean;

  /** Provider's ID for the created entity */
  externalId?: string;

  /** Provider's reference/document number */
  documentNumber?: string;

  /** Error message if failed */
  error?: string;

  /** Error code from provider */
  errorCode?: string;

  /** Full response from provider (for debugging) */
  rawResponse?: unknown;

  /** Warnings that don't prevent creation */
  warnings?: string[];
}

/**
 * Abstract interface for accounting provider implementations
 *
 * All accounting providers (QuickBooks, Xero, FreshBooks) must implement
 * this interface to ensure consistent behavior across the application.
 */
export interface AccountingProvider {
  /** Provider identifier */
  readonly provider: ConnectionProvider;

  /**
   * Exchange OAuth authorization code for tokens and establish connection
   */
  connect(credentials: OAuthCredentials): Promise<Connection>;

  /**
   * Refresh an expired access token
   */
  refreshToken(connection: Connection): Promise<Connection>;

  /**
   * Disconnect/revoke access to the accounting system
   */
  disconnect(connection: Connection): Promise<void>;

  /**
   * Get the OAuth authorization URL for initiating connection
   */
  getAuthorizationUrl(redirectUri: string, state: string): string;

  /**
   * Retrieve the chart of accounts
   */
  getChartOfAccounts(connection: Connection): Promise<Account[]>;

  /**
   * Retrieve all vendors/suppliers
   */
  getVendors(connection: Connection): Promise<Vendor[]>;

  /**
   * Retrieve all customers
   */
  getCustomers(connection: Connection): Promise<Customer[]>;

  /**
   * Get a single vendor by ID
   */
  getVendor(connection: Connection, vendorId: string): Promise<Vendor | null>;

  /**
   * Get a single customer by ID
   */
  getCustomer(connection: Connection, customerId: string): Promise<Customer | null>;

  /**
   * Create a new expense/purchase transaction
   */
  createExpense(connection: Connection, data: ExpenseData): Promise<TransactionResult>;

  /**
   * Create a new bill (accounts payable)
   */
  createBill(connection: Connection, data: BillData): Promise<TransactionResult>;

  /**
   * Create a new invoice (accounts receivable)
   */
  createInvoice(connection: Connection, data: InvoiceData): Promise<TransactionResult>;

  /**
   * Create a journal entry
   */
  createJournalEntry(connection: Connection, data: JournalEntryData): Promise<TransactionResult>;

  /**
   * Validate connection is still active
   */
  validateConnection(connection: Connection): Promise<boolean>;

  /**
   * Get company information
   */
  getCompanyInfo(connection: Connection): Promise<CompanyInfo>;
}

/**
 * Company information from the accounting system
 */
export interface CompanyInfo {
  /** Company name */
  name: string;

  /** Legal name */
  legalName?: string;

  /** Primary email */
  email?: string;

  /** Primary phone */
  phone?: string;

  /** Company address */
  address?: Address;

  /** Fiscal year start month (1-12) */
  fiscalYearStartMonth?: number;

  /** Country code */
  country?: string;

  /** Base currency */
  baseCurrency?: string;

  /** Industry type */
  industry?: string;
}

/**
 * Error thrown by accounting provider operations
 */
export class AccountingProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider: ConnectionProvider,
    public readonly statusCode?: number,
    public readonly rawError?: unknown
  ) {
    super(message);
    this.name = 'AccountingProviderError';
  }
}

/**
 * Token refresh error - indicates need to re-authenticate
 */
export class TokenRefreshError extends AccountingProviderError {
  constructor(provider: ConnectionProvider, message?: string) {
    super(
      message || 'Failed to refresh access token. Re-authentication required.',
      'TOKEN_REFRESH_FAILED',
      provider
    );
    this.name = 'TokenRefreshError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AccountingProviderError {
  constructor(
    provider: ConnectionProvider,
    public readonly retryAfter?: number
  ) {
    super(
      `Rate limit exceeded. ${retryAfter ? `Retry after ${retryAfter} seconds.` : ''}`,
      'RATE_LIMIT_EXCEEDED',
      provider
    );
    this.name = 'RateLimitError';
  }
}
