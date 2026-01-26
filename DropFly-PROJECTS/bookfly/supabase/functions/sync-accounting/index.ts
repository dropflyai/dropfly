/**
 * BookFly - Sync Accounting Edge Function
 *
 * This function syncs validated transactions to accounting software:
 * 1. Receives a transaction ID and action ('sync')
 * 2. Loads transaction and client's accounting connection
 * 3. Determines provider (QuickBooks/Xero/FreshBooks)
 * 4. Calls appropriate provider to create the entity
 * 5. Updates transaction with sync status and external_id
 * 6. Handles errors gracefully
 *
 * @endpoint POST /functions/v1/sync-accounting
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import {
  corsHeaders,
  SyncAccountingRequest,
  SyncAccountingResponse,
  ParsedTransaction,
  AccountingConnection,
  AccountingProvider,
} from '../_shared/types.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';

// ============================================================================
// PROVIDER CONFIGURATIONS
// ============================================================================

const QUICKBOOKS_API_BASE = 'https://quickbooks.api.intuit.com/v3/company';
const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0';
const FRESHBOOKS_API_BASE = 'https://api.freshbooks.com/accounting/account';

// ============================================================================
// TYPES
// ============================================================================

interface SyncResult {
  success: boolean;
  external_id?: string;
  error?: string;
}

// ============================================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================================

/**
 * Syncs a transaction to QuickBooks Online
 */
async function syncToQuickBooks(
  transaction: ParsedTransaction,
  connection: AccountingConnection
): Promise<SyncResult> {
  if (!connection.realm_id) {
    return { success: false, error: 'QuickBooks realm_id not configured' };
  }

  const url = `${QUICKBOOKS_API_BASE}/${connection.realm_id}/purchase`;

  // Map transaction to QuickBooks Purchase object
  // QuickBooks uses different entity types - we'll use Purchase for expenses
  const purchaseData = {
    PaymentType: 'Cash', // or 'Check', 'CreditCard' based on entity_type
    TotalAmt: transaction.amount,
    TxnDate: transaction.date || new Date().toISOString().split('T')[0],
    Line: [
      {
        DetailType: 'AccountBasedExpenseLineDetail',
        Amount: transaction.amount,
        Description: transaction.description || `${transaction.vendor} - ${transaction.category}`,
        AccountBasedExpenseLineDetail: {
          AccountRef: {
            // Would need to map category to account ID from chart of accounts
            name: transaction.category || 'Expenses',
          },
        },
      },
    ],
    EntityRef: transaction.vendor
      ? {
          name: transaction.vendor,
          type: 'Vendor',
        }
      : undefined,
    PrivateNote: `Imported from BookFly - Scan ID: ${transaction.scan_id}`,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('QuickBooks API error:', errorBody);

      // Check for token expiration
      if (response.status === 401) {
        return { success: false, error: 'QuickBooks token expired - please reconnect' };
      }

      return { success: false, error: `QuickBooks API error: ${response.status}` };
    }

    const result = await response.json();

    // QuickBooks returns the created entity with an Id
    const externalId = result.Purchase?.Id;

    if (!externalId) {
      return { success: false, error: 'QuickBooks did not return an entity ID' };
    }

    return { success: true, external_id: externalId };
  } catch (error) {
    console.error('QuickBooks sync error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Syncs a transaction to Xero
 */
async function syncToXero(
  transaction: ParsedTransaction,
  connection: AccountingConnection
): Promise<SyncResult> {
  if (!connection.tenant_id) {
    return { success: false, error: 'Xero tenant_id not configured' };
  }

  const url = `${XERO_API_BASE}/BankTransactions`;

  // Map transaction to Xero BankTransaction
  const bankTransactionData = {
    BankTransactions: [
      {
        Type: 'SPEND', // SPEND for expenses, RECEIVE for income
        Contact: transaction.vendor
          ? {
              Name: transaction.vendor,
            }
          : undefined,
        LineItems: [
          {
            Description: transaction.description || `${transaction.vendor} - ${transaction.category}`,
            Quantity: 1,
            UnitAmount: transaction.amount,
            AccountCode: transaction.category || '400', // Default expense account
          },
        ],
        BankAccount: {
          // Would need bank account from client settings
          Code: 'BANK', // Placeholder
        },
        Date: transaction.date || new Date().toISOString().split('T')[0],
        Reference: `BookFly-${transaction.scan_id}`,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Xero-Tenant-Id': connection.tenant_id,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bankTransactionData),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Xero API error:', errorBody);

      if (response.status === 401) {
        return { success: false, error: 'Xero token expired - please reconnect' };
      }

      return { success: false, error: `Xero API error: ${response.status}` };
    }

    const result = await response.json();

    // Xero returns the created entity with a BankTransactionID
    const externalId = result.BankTransactions?.[0]?.BankTransactionID;

    if (!externalId) {
      return { success: false, error: 'Xero did not return a transaction ID' };
    }

    return { success: true, external_id: externalId };
  } catch (error) {
    console.error('Xero sync error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Syncs a transaction to FreshBooks
 */
async function syncToFreshBooks(
  transaction: ParsedTransaction,
  connection: AccountingConnection
): Promise<SyncResult> {
  // FreshBooks uses expenses endpoint
  const url = `${FRESHBOOKS_API_BASE}/${connection.realm_id}/expenses/expenses`;

  // Map transaction to FreshBooks Expense
  const expenseData = {
    expense: {
      amount: {
        amount: transaction.amount?.toString() || '0',
        code: 'USD', // Would need to get from transaction or client settings
      },
      date: transaction.date || new Date().toISOString().split('T')[0],
      vendor: transaction.vendor || 'Unknown',
      notes: transaction.description || `Imported from BookFly`,
      category: transaction.category || 'Expenses',
      // FreshBooks specific fields
      ext_invoiceid: transaction.scan_id,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Api-Version': 'alpha',
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('FreshBooks API error:', errorBody);

      if (response.status === 401) {
        return { success: false, error: 'FreshBooks token expired - please reconnect' };
      }

      return { success: false, error: `FreshBooks API error: ${response.status}` };
    }

    const result = await response.json();

    // FreshBooks returns the expense with an id
    const externalId = result.response?.result?.expense?.id?.toString();

    if (!externalId) {
      return { success: false, error: 'FreshBooks did not return an expense ID' };
    }

    return { success: true, external_id: externalId };
  } catch (error) {
    console.error('FreshBooks sync error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetches the transaction from the database
 */
async function getTransaction(
  supabase: ReturnType<typeof createSupabaseClient>,
  transactionId: string
): Promise<ParsedTransaction> {
  const { data, error } = await supabase
    .from('parsed_transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Transaction not found: ${transactionId}`);
  }

  return data as ParsedTransaction;
}

/**
 * Fetches the client's accounting connection
 */
async function getAccountingConnection(
  supabase: ReturnType<typeof createSupabaseClient>,
  clientId: string
): Promise<AccountingConnection | null> {
  const { data, error } = await supabase
    .from('accounting_connections')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - client doesn't have a connection
      return null;
    }
    throw new Error(`Failed to fetch accounting connection: ${error.message}`);
  }

  return data as AccountingConnection;
}

/**
 * Updates the transaction with sync results
 */
async function updateTransactionSyncStatus(
  supabase: ReturnType<typeof createSupabaseClient>,
  transactionId: string,
  status: 'syncing' | 'synced' | 'error',
  externalId?: string,
  errorMessage?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    sync_status: status,
    updated_at: new Date().toISOString(),
  };

  if (externalId) {
    updates.external_id = externalId;
  }

  if (errorMessage) {
    updates.sync_error = errorMessage;
  }

  const { error } = await supabase
    .from('parsed_transactions')
    .update(updates)
    .eq('id', transactionId);

  if (error) {
    throw new Error(`Failed to update transaction sync status: ${error.message}`);
  }
}

/**
 * Updates the scan status
 */
async function updateScanStatus(
  supabase: ReturnType<typeof createSupabaseClient>,
  scanId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('scans')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', scanId);

  if (error) {
    console.error(`Failed to update scan status: ${error.message}`);
  }
}

/**
 * Refreshes an expired OAuth token
 * This is a placeholder - actual implementation depends on provider
 */
async function refreshToken(
  supabase: ReturnType<typeof createSupabaseClient>,
  connection: AccountingConnection
): Promise<AccountingConnection | null> {
  // Each provider has different token refresh mechanisms
  // This would need provider-specific implementation
  console.warn('Token refresh not implemented for provider:', connection.provider);
  return null;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Parse request body
    const body: SyncAccountingRequest = await req.json();
    const { transaction_id, action } = body;

    // Validate required fields
    if (!transaction_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'transaction_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action !== 'sync') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action. Only "sync" is supported.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Syncing transaction: ${transaction_id}`);

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Fetch the transaction
    const transaction = await getTransaction(supabase, transaction_id);

    // Check if already synced
    if (transaction.sync_status === 'synced' && transaction.external_id) {
      console.log(`Transaction already synced with external_id: ${transaction.external_id}`);
      return new Response(
        JSON.stringify({
          success: true,
          transaction_id,
          external_id: transaction.external_id,
          message: 'Transaction already synced',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch accounting connection for the client
    const connection = await getAccountingConnection(supabase, transaction.client_id);

    if (!connection) {
      return new Response(
        JSON.stringify({
          success: false,
          transaction_id,
          error: 'No accounting software connected for this client',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Using provider: ${connection.provider}`);

    // Update status to syncing
    await updateTransactionSyncStatus(supabase, transaction_id, 'syncing');

    // Route to appropriate provider
    let syncResult: SyncResult;

    switch (connection.provider) {
      case 'quickbooks':
        syncResult = await syncToQuickBooks(transaction, connection);
        break;
      case 'xero':
        syncResult = await syncToXero(transaction, connection);
        break;
      case 'freshbooks':
        syncResult = await syncToFreshBooks(transaction, connection);
        break;
      default:
        syncResult = {
          success: false,
          error: `Unsupported provider: ${connection.provider}`,
        };
    }

    // Update transaction with results
    if (syncResult.success) {
      await updateTransactionSyncStatus(
        supabase,
        transaction_id,
        'synced',
        syncResult.external_id
      );

      // Update scan status
      if (transaction.scan_id) {
        await updateScanStatus(supabase, transaction.scan_id, 'synced');
      }

      console.log(`Successfully synced with external_id: ${syncResult.external_id}`);

      const response: SyncAccountingResponse = {
        success: true,
        transaction_id,
        external_id: syncResult.external_id,
        provider: connection.provider,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Sync failed
      await updateTransactionSyncStatus(
        supabase,
        transaction_id,
        'error',
        undefined,
        syncResult.error
      );

      console.error(`Sync failed: ${syncResult.error}`);

      return new Response(
        JSON.stringify({
          success: false,
          transaction_id,
          error: syncResult.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error syncing transaction:', error);

    // Try to update transaction status to error
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body.transaction_id) {
        const supabase = createSupabaseClient();
        await updateTransactionSyncStatus(
          supabase,
          body.transaction_id,
          'error',
          undefined,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    } catch {
      // Ignore errors during error handling
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
