/**
 * BookFly - Validate Edge Function
 *
 * This function validates parsed transactions through multiple checks:
 * 1. Field validation (amount is number, date is valid, etc.)
 * 2. Duplicate detection (same vendor + amount + date)
 * 3. Outlier detection (amount far from typical for vendor)
 * 4. Category mismatch detection (differs from learned pattern)
 * 5. Account existence check (category exists in client's chart of accounts)
 *
 * @endpoint POST /functions/v1/validate
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import {
  corsHeaders,
  ValidateRequest,
  ValidateResponse,
  ParsedTransaction,
  ValidationFlag,
  ValidationFlagType,
  FlagSeverity,
  Client,
  ChartOfAccount,
} from '../_shared/types.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Threshold for considering an amount as an outlier (standard deviations)
const OUTLIER_THRESHOLD = 2.5;

// Minimum number of transactions needed for statistical analysis
const MIN_TRANSACTIONS_FOR_STATS = 3;

// Time window for duplicate detection (in days)
const DUPLICATE_WINDOW_DAYS = 7;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates that required fields are present and correctly formatted
 */
function validateFields(transaction: ParsedTransaction): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  // Check amount
  if (transaction.amount === null || transaction.amount === undefined) {
    flags.push({
      type: 'missing_required',
      severity: 'error',
      message: 'Amount is required but was not extracted',
      field: 'amount',
    });
  } else if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
    flags.push({
      type: 'invalid_amount',
      severity: 'error',
      message: 'Amount must be a valid number',
      field: 'amount',
      details: { value: transaction.amount },
    });
  } else if (transaction.amount < 0) {
    flags.push({
      type: 'invalid_amount',
      severity: 'warning',
      message: 'Amount is negative - verify this is correct',
      field: 'amount',
      details: { value: transaction.amount },
    });
  }

  // Check date
  if (transaction.date) {
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
      flags.push({
        type: 'invalid_date',
        severity: 'error',
        message: 'Date is not in a valid format',
        field: 'date',
        details: { value: transaction.date },
      });
    } else {
      // Check if date is in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        flags.push({
          type: 'invalid_date',
          severity: 'warning',
          message: 'Date is in the future - please verify',
          field: 'date',
          details: { value: transaction.date },
        });
      }

      // Check if date is very old (more than 2 years ago)
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      if (date < twoYearsAgo) {
        flags.push({
          type: 'invalid_date',
          severity: 'warning',
          message: 'Date is more than 2 years old - please verify',
          field: 'date',
          details: { value: transaction.date },
        });
      }
    }
  } else {
    flags.push({
      type: 'missing_required',
      severity: 'warning',
      message: 'Date was not extracted - please add manually',
      field: 'date',
    });
  }

  // Check vendor
  if (!transaction.vendor || transaction.vendor.trim() === '') {
    flags.push({
      type: 'missing_required',
      severity: 'warning',
      message: 'Vendor name was not extracted - please add manually',
      field: 'vendor',
    });
  }

  // Check entity_type
  if (transaction.entity_type === 'unknown') {
    flags.push({
      type: 'missing_required',
      severity: 'info',
      message: 'Document type could not be determined - please classify manually',
      field: 'entity_type',
    });
  }

  return flags;
}

/**
 * Checks for potential duplicate transactions
 */
async function checkDuplicates(
  supabase: ReturnType<typeof createSupabaseClient>,
  transaction: ParsedTransaction
): Promise<ValidationFlag[]> {
  const flags: ValidationFlag[] = [];

  // Skip if we don't have enough information for duplicate detection
  if (!transaction.vendor || !transaction.amount || !transaction.date) {
    return flags;
  }

  // Calculate date range for duplicate window
  const transactionDate = new Date(transaction.date);
  const startDate = new Date(transactionDate);
  startDate.setDate(startDate.getDate() - DUPLICATE_WINDOW_DAYS);
  const endDate = new Date(transactionDate);
  endDate.setDate(endDate.getDate() + DUPLICATE_WINDOW_DAYS);

  // Query for similar transactions
  const { data: similar, error } = await supabase
    .from('parsed_transactions')
    .select('id, vendor, amount, date')
    .eq('client_id', transaction.client_id)
    .neq('id', transaction.id)
    .ilike('vendor', `%${transaction.vendor}%`)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (error) {
    console.error('Error checking duplicates:', error);
    return flags;
  }

  // Check for exact matches (same amount)
  const exactMatches = similar?.filter((t) => Math.abs(t.amount - transaction.amount!) < 0.01);

  if (exactMatches && exactMatches.length > 0) {
    flags.push({
      type: 'potential_duplicate',
      severity: 'warning',
      message: `Found ${exactMatches.length} similar transaction(s) with the same vendor and amount within ${DUPLICATE_WINDOW_DAYS} days`,
      details: {
        similar_transactions: exactMatches.map((t) => ({
          id: t.id,
          vendor: t.vendor,
          amount: t.amount,
          date: t.date,
        })),
      },
    });
  }

  return flags;
}

/**
 * Checks if the amount is an outlier compared to historical transactions
 */
async function checkOutliers(
  supabase: ReturnType<typeof createSupabaseClient>,
  transaction: ParsedTransaction
): Promise<ValidationFlag[]> {
  const flags: ValidationFlag[] = [];

  // Skip if we don't have vendor or amount
  if (!transaction.vendor || !transaction.amount) {
    return flags;
  }

  // Get historical transactions for this vendor
  const { data: historical, error } = await supabase
    .from('parsed_transactions')
    .select('amount')
    .eq('client_id', transaction.client_id)
    .ilike('vendor', `%${transaction.vendor}%`)
    .neq('id', transaction.id)
    .not('amount', 'is', null);

  if (error) {
    console.error('Error fetching historical data:', error);
    return flags;
  }

  // Need minimum number of transactions for statistical analysis
  if (!historical || historical.length < MIN_TRANSACTIONS_FOR_STATS) {
    return flags;
  }

  // Calculate mean and standard deviation
  const amounts = historical.map((t) => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const squaredDiffs = amounts.map((a) => Math.pow(a - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  // Check if current amount is an outlier
  if (stdDev > 0) {
    const zScore = Math.abs((transaction.amount - mean) / stdDev);

    if (zScore > OUTLIER_THRESHOLD) {
      const direction = transaction.amount > mean ? 'higher' : 'lower';
      flags.push({
        type: 'amount_outlier',
        severity: 'warning',
        message: `Amount is significantly ${direction} than typical for this vendor`,
        field: 'amount',
        details: {
          current_amount: transaction.amount,
          average_amount: Math.round(mean * 100) / 100,
          z_score: Math.round(zScore * 100) / 100,
          historical_count: historical.length,
        },
      });
    }
  }

  return flags;
}

/**
 * Checks if the category matches the learned pattern for this vendor
 */
async function checkCategoryMismatch(
  supabase: ReturnType<typeof createSupabaseClient>,
  transaction: ParsedTransaction
): Promise<ValidationFlag[]> {
  const flags: ValidationFlag[] = [];

  // Skip if we don't have vendor or category
  if (!transaction.vendor || !transaction.category) {
    return flags;
  }

  // Get historical categories for this vendor
  const { data: historical, error } = await supabase
    .from('parsed_transactions')
    .select('category')
    .eq('client_id', transaction.client_id)
    .ilike('vendor', `%${transaction.vendor}%`)
    .neq('id', transaction.id)
    .not('category', 'is', null);

  if (error) {
    console.error('Error fetching category history:', error);
    return flags;
  }

  // Need minimum transactions for pattern detection
  if (!historical || historical.length < MIN_TRANSACTIONS_FOR_STATS) {
    return flags;
  }

  // Count category occurrences
  const categoryCounts: Record<string, number> = {};
  for (const t of historical) {
    if (t.category) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
  }

  // Find the most common category
  let mostCommonCategory = '';
  let maxCount = 0;
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonCategory = category;
    }
  }

  // Check if current category differs from most common
  if (mostCommonCategory && transaction.category.toLowerCase() !== mostCommonCategory.toLowerCase()) {
    const percentage = Math.round((maxCount / historical.length) * 100);

    // Only flag if the most common category is dominant (>60%)
    if (percentage > 60) {
      flags.push({
        type: 'category_mismatch',
        severity: 'info',
        message: `Category differs from typical pattern for this vendor`,
        field: 'category',
        details: {
          current_category: transaction.category,
          typical_category: mostCommonCategory,
          typical_percentage: percentage,
          historical_count: historical.length,
        },
      });
    }
  }

  return flags;
}

/**
 * Checks if the category exists in the client's chart of accounts
 */
async function checkAccountExists(
  supabase: ReturnType<typeof createSupabaseClient>,
  transaction: ParsedTransaction
): Promise<ValidationFlag[]> {
  const flags: ValidationFlag[] = [];

  // Skip if no category
  if (!transaction.category) {
    return flags;
  }

  // Fetch client's chart of accounts
  const { data: client, error } = await supabase
    .from('clients')
    .select('chart_of_accounts')
    .eq('id', transaction.client_id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return flags;
  }

  // If no chart of accounts configured, skip this check
  if (!client?.chart_of_accounts || !Array.isArray(client.chart_of_accounts)) {
    return flags;
  }

  const chartOfAccounts = client.chart_of_accounts as ChartOfAccount[];

  // Check if category exists in chart of accounts (case-insensitive)
  const categoryLower = transaction.category.toLowerCase();
  const accountExists = chartOfAccounts.some(
    (account) => account.name.toLowerCase() === categoryLower
  );

  if (!accountExists) {
    // Try to find similar accounts for suggestions
    const suggestions = chartOfAccounts
      .filter((account) =>
        account.name.toLowerCase().includes(categoryLower) ||
        categoryLower.includes(account.name.toLowerCase())
      )
      .map((account) => account.name)
      .slice(0, 3);

    flags.push({
      type: 'account_not_found',
      severity: 'warning',
      message: `Category "${transaction.category}" not found in chart of accounts`,
      field: 'category',
      details: {
        suggested_accounts: suggestions.length > 0 ? suggestions : undefined,
        available_accounts_count: chartOfAccounts.length,
      },
    });
  }

  return flags;
}

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
 * Updates the transaction with validation results
 */
async function updateTransactionWithFlags(
  supabase: ReturnType<typeof createSupabaseClient>,
  transactionId: string,
  flags: ValidationFlag[]
): Promise<void> {
  const { error } = await supabase
    .from('parsed_transactions')
    .update({
      validation_flags: flags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId);

  if (error) {
    throw new Error(`Failed to update transaction: ${error.message}`);
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
    const body: ValidateRequest = await req.json();
    const { transaction_id } = body;

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

    console.log(`Validating transaction: ${transaction_id}`);

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Fetch the transaction
    const transaction = await getTransaction(supabase, transaction_id);

    console.log('Running validation pipeline...');

    // Run all validation checks
    const allFlags: ValidationFlag[] = [];

    // 1. Field validation (synchronous)
    console.log('  - Field validation');
    const fieldFlags = validateFields(transaction);
    allFlags.push(...fieldFlags);

    // 2. Duplicate detection (async)
    console.log('  - Duplicate detection');
    const duplicateFlags = await checkDuplicates(supabase, transaction);
    allFlags.push(...duplicateFlags);

    // 3. Outlier detection (async)
    console.log('  - Outlier detection');
    const outlierFlags = await checkOutliers(supabase, transaction);
    allFlags.push(...outlierFlags);

    // 4. Category mismatch (async)
    console.log('  - Category mismatch detection');
    const categoryFlags = await checkCategoryMismatch(supabase, transaction);
    allFlags.push(...categoryFlags);

    // 5. Account exists check (async)
    console.log('  - Account existence check');
    const accountFlags = await checkAccountExists(supabase, transaction);
    allFlags.push(...accountFlags);

    console.log(`Validation complete. Found ${allFlags.length} flag(s)`);

    // Update transaction with flags
    await updateTransactionWithFlags(supabase, transaction_id, allFlags);

    // Update scan status if validation passed without errors
    const hasErrors = allFlags.some((f) => f.severity === 'error');
    if (!hasErrors && transaction.scan_id) {
      await updateScanStatus(supabase, transaction.scan_id, 'validated');
    }

    // Determine if transaction is valid (no error-level flags)
    const isValid = !hasErrors;

    // Build response
    const response: ValidateResponse = {
      success: true,
      transaction_id,
      is_valid: isValid,
      flags: allFlags,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error validating transaction:', error);

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
