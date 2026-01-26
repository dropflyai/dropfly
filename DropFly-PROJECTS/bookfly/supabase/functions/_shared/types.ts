/**
 * BookFly - Shared Types for Edge Functions
 *
 * These types are shared across all edge functions for consistency.
 */

// ============================================================================
// ENTITY TYPES
// ============================================================================

/** Types of financial entities that can be extracted from documents */
export type EntityType =
  | 'expense'      // General expense/purchase
  | 'invoice'      // Invoice received
  | 'receipt'      // Receipt for payment
  | 'bill'         // Bill to pay
  | 'statement'    // Bank/credit card statement
  | 'unknown';     // Could not determine type

/** Supported accounting providers for sync */
export type AccountingProvider = 'quickbooks' | 'xero' | 'freshbooks';

/** Status of a scan in the processing pipeline */
export type ScanStatus =
  | 'pending'      // Uploaded, awaiting processing
  | 'processing'   // Currently being processed
  | 'parsed'       // Successfully parsed by AI
  | 'validated'    // Passed validation
  | 'synced'       // Synced to accounting software
  | 'error';       // Error occurred

/** Validation flag severity levels */
export type FlagSeverity = 'info' | 'warning' | 'error';

// ============================================================================
// DATABASE RECORDS
// ============================================================================

/** Represents a scan/upload record from the database */
export interface ScanRecord {
  id: string;
  client_id: string;
  user_id: string;
  image_urls: string[];
  pdf_url?: string;
  status: ScanStatus;
  created_at: string;
  updated_at: string;
}

/** Line item extracted from a document */
export interface LineItem {
  description: string;
  quantity?: number;
  unit_price?: number;
  amount: number;
  category?: string;
}

/** Represents a parsed transaction record */
export interface ParsedTransaction {
  id: string;
  scan_id: string;
  client_id: string;
  entity_type: EntityType;
  vendor?: string;
  amount: number;
  date?: string;
  category?: string;
  description?: string;
  line_items?: LineItem[];
  confidence_score: number;
  ai_reasoning?: string;
  raw_ai_response?: string;
  validation_flags?: ValidationFlag[];
  sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
  external_id?: string;
  created_at: string;
  updated_at: string;
}

/** Validation flag attached to a transaction */
export interface ValidationFlag {
  type: ValidationFlagType;
  severity: FlagSeverity;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/** Types of validation flags */
export type ValidationFlagType =
  | 'invalid_amount'       // Amount is not a valid number
  | 'invalid_date'         // Date is not valid or in future
  | 'missing_required'     // Required field is missing
  | 'potential_duplicate'  // Similar transaction exists
  | 'amount_outlier'       // Amount differs significantly from typical
  | 'category_mismatch'    // Category differs from learned pattern
  | 'account_not_found';   // Category not in chart of accounts

/** Client's accounting software connection */
export interface AccountingConnection {
  id: string;
  client_id: string;
  provider: AccountingProvider;
  access_token: string;
  refresh_token?: string;
  realm_id?: string;          // QuickBooks company ID
  tenant_id?: string;         // Xero tenant ID
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

/** Client record with chart of accounts */
export interface Client {
  id: string;
  name: string;
  chart_of_accounts?: ChartOfAccount[];
  default_category?: string;
  created_at: string;
}

/** Chart of accounts entry */
export interface ChartOfAccount {
  id: string;
  name: string;
  type: string;
  external_id?: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/** Request body for process-scan function */
export interface ProcessScanRequest {
  scan_id: string;
  image_urls: string[];
}

/** Response from process-scan function */
export interface ProcessScanResponse {
  success: boolean;
  scan_id: string;
  pdf_url?: string;
  error?: string;
}

/** Request body for parse-ai function */
export interface ParseAIRequest {
  scan_id: string;
}

/** Response from parse-ai function */
export interface ParseAIResponse {
  success: boolean;
  transaction_id?: string;
  parsed_data?: {
    entity_type: EntityType;
    vendor?: string;
    amount?: number;
    date?: string;
    category?: string;
    description?: string;
    line_items?: LineItem[];
    confidence_score: number;
  };
  error?: string;
}

/** Request body for validate function */
export interface ValidateRequest {
  transaction_id: string;
}

/** Response from validate function */
export interface ValidateResponse {
  success: boolean;
  transaction_id: string;
  is_valid: boolean;
  flags: ValidationFlag[];
  error?: string;
}

/** Request body for sync-accounting function */
export interface SyncAccountingRequest {
  transaction_id: string;
  action: 'sync';
}

/** Response from sync-accounting function */
export interface SyncAccountingResponse {
  success: boolean;
  transaction_id: string;
  external_id?: string;
  provider?: AccountingProvider;
  error?: string;
}

// ============================================================================
// GPT-4V TYPES
// ============================================================================

/** Structure expected from GPT-4V document analysis */
export interface GPT4VExtractionResult {
  entity_type: EntityType;
  vendor?: string;
  amount?: number;
  currency?: string;
  date?: string;
  category?: string;
  description?: string;
  line_items?: LineItem[];
  reasoning: string;
  extraction_confidence: {
    overall: number;
    fields: Record<string, number>;
  };
}

// ============================================================================
// CORS HEADERS
// ============================================================================

/** Standard CORS headers for edge functions */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
