/**
 * BookFly - Smart Categorization Engine
 *
 * This module handles intelligent expense categorization that mimics
 * what a professional bookkeeper would do:
 *
 * 1. Uses the client's ACTUAL QuickBooks Chart of Accounts
 * 2. Considers the client's business type (plumber, restaurant, retail, etc.)
 * 3. Learns from historical patterns (if Sarah always puts "Chevron" → "Vehicle Fuel", do that)
 * 4. Uses vendor patterns learned from corrections
 * 5. Falls back to AI suggestion only when no pattern exists
 */

import { createSupabaseClient } from '../_shared/supabase.ts';

// ============================================================================
// TYPES
// ============================================================================

export interface ChartOfAccountsEntry {
  id: string;
  name: string;
  account_type: string; // 'Expense', 'Cost of Goods Sold', 'Asset', etc.
  account_number?: string;
  parent_id?: string;
  fully_qualified_name: string; // "Expenses:Materials:Plumbing Supplies"
  is_active: boolean;
}

export interface VendorPattern {
  id: string;
  client_id: string;
  vendor_name: string;
  vendor_aliases: string[]; // ["THE HOME DEPOT #1234", "HOME DEPOT 1234", "HOMEDEPOT"]
  default_category: string;
  default_account_id: string;
  default_entity_type: string;
  typical_amount_min: number;
  typical_amount_max: number;
  occurrence_count: number;
  confidence: number; // How confident we are in this pattern (based on # of corrections)
}

export interface ClientContext {
  client_id: string;
  business_type: string; // 'plumbing', 'restaurant', 'retail', 'consulting', etc.
  industry: string;
  chart_of_accounts: ChartOfAccountsEntry[];
  vendor_patterns: VendorPattern[];
  common_categories: string[]; // Most frequently used categories for this client
}

export interface CategorizationResult {
  category: string;
  account_id: string;
  account_name: string;
  confidence: number;
  reasoning: string;
  source: 'vendor_pattern' | 'historical' | 'business_type' | 'ai_suggestion';
}

// ============================================================================
// BUSINESS TYPE → CATEGORY MAPPINGS
// ============================================================================

/**
 * Industry-specific category hints
 * When we know the business type, we can make smarter guesses
 */
const BUSINESS_TYPE_HINTS: Record<string, Record<string, string[]>> = {
  plumbing: {
    'Home Depot': ['Materials & Supplies', 'Plumbing Supplies', 'Job Materials'],
    'Lowes': ['Materials & Supplies', 'Plumbing Supplies', 'Job Materials'],
    'Ferguson': ['Plumbing Supplies', 'Materials & Supplies'],
    'Grainger': ['Tools & Equipment', 'Materials & Supplies'],
    'Shell': ['Vehicle Fuel', 'Gas & Fuel', 'Auto Expense'],
    'Chevron': ['Vehicle Fuel', 'Gas & Fuel', 'Auto Expense'],
    'BP': ['Vehicle Fuel', 'Gas & Fuel', 'Auto Expense'],
    'AutoZone': ['Vehicle Repairs', 'Auto Expense', 'Equipment Maintenance'],
  },
  restaurant: {
    'Sysco': ['Food Cost', 'Cost of Goods Sold', 'Inventory'],
    'US Foods': ['Food Cost', 'Cost of Goods Sold', 'Inventory'],
    'Restaurant Depot': ['Food Cost', 'Supplies', 'Cost of Goods Sold'],
    'Home Depot': ['Kitchen Equipment', 'Repairs & Maintenance', 'Equipment'],
    'Costco': ['Food Cost', 'Supplies', 'Cost of Goods Sold'],
    'PG&E': ['Utilities', 'Gas & Electric'],
  },
  retail: {
    'UPS': ['Shipping & Delivery', 'Freight', 'Postage'],
    'FedEx': ['Shipping & Delivery', 'Freight', 'Postage'],
    'USPS': ['Postage', 'Shipping & Delivery'],
    'Staples': ['Office Supplies', 'Supplies'],
    'Office Depot': ['Office Supplies', 'Supplies'],
  },
  consulting: {
    'Adobe': ['Software & Subscriptions', 'Software'],
    'Microsoft': ['Software & Subscriptions', 'Software'],
    'Zoom': ['Software & Subscriptions', 'Communication'],
    'WeWork': ['Rent', 'Office Rent', 'Coworking'],
    'Starbucks': ['Meals & Entertainment', 'Client Meetings'],
  },
  construction: {
    'Home Depot': ['Materials', 'Job Materials', 'Supplies'],
    'Lowes': ['Materials', 'Job Materials', 'Supplies'],
    'Caterpillar': ['Equipment Rental', 'Heavy Equipment'],
    'United Rentals': ['Equipment Rental', 'Tools'],
    'Sunbelt Rentals': ['Equipment Rental', 'Tools'],
  },
};

/**
 * Common vendor normalizations
 * Maps messy receipt text to clean vendor names
 */
const VENDOR_NORMALIZATIONS: Record<string, string> = {
  'THE HOME DEPOT': 'Home Depot',
  'HOME DEPOT': 'Home Depot',
  'HOMEDEPOT': 'Home Depot',
  'HD SUPPLY': 'Home Depot',
  'LOWES': 'Lowes',
  "LOWE'S": 'Lowes',
  'CHEVRON': 'Chevron',
  'SHELL OIL': 'Shell',
  'SHELL SERVICE': 'Shell',
  'COSTCO WHSE': 'Costco',
  'COSTCO WHOLESALE': 'Costco',
  'AMAZON.COM': 'Amazon',
  'AMZN': 'Amazon',
  'AMZN MKTP': 'Amazon',
  'UBER EATS': 'Uber Eats',
  'UBER *EATS': 'Uber Eats',
  'DOORDASH': 'DoorDash',
  'GRUBHUB': 'Grubhub',
  'STARBUCKS': 'Starbucks',
  'SBUX': 'Starbucks',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes a vendor name from messy receipt text
 */
export function normalizeVendorName(rawVendor: string): string {
  if (!rawVendor) return '';

  const upper = rawVendor.toUpperCase().trim();

  // Check direct mappings
  for (const [pattern, normalized] of Object.entries(VENDOR_NORMALIZATIONS)) {
    if (upper.includes(pattern)) {
      return normalized;
    }
  }

  // Clean up common patterns
  let cleaned = rawVendor
    .replace(/\s*#\d+/g, '') // Remove store numbers
    .replace(/\s*\d{5,}/g, '') // Remove long numbers (store IDs, etc)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Title case
  cleaned = cleaned
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return cleaned;
}

/**
 * Finds the best matching account from the Chart of Accounts
 */
function findMatchingAccount(
  chartOfAccounts: ChartOfAccountsEntry[],
  categoryNames: string[]
): ChartOfAccountsEntry | null {
  // Only look at expense-type accounts
  const expenseAccounts = chartOfAccounts.filter(
    (a) =>
      a.is_active &&
      (a.account_type === 'Expense' ||
        a.account_type === 'Cost of Goods Sold' ||
        a.account_type === 'Other Expense')
  );

  for (const categoryName of categoryNames) {
    const lowerCategory = categoryName.toLowerCase();

    // Exact match on name
    const exactMatch = expenseAccounts.find(
      (a) => a.name.toLowerCase() === lowerCategory
    );
    if (exactMatch) return exactMatch;

    // Partial match on name
    const partialMatch = expenseAccounts.find(
      (a) =>
        a.name.toLowerCase().includes(lowerCategory) ||
        lowerCategory.includes(a.name.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    // Match on fully qualified name
    const fqnMatch = expenseAccounts.find((a) =>
      a.fully_qualified_name.toLowerCase().includes(lowerCategory)
    );
    if (fqnMatch) return fqnMatch;
  }

  return null;
}

// ============================================================================
// MAIN CATEGORIZATION FUNCTION
// ============================================================================

/**
 * Smart categorization that mimics what a professional bookkeeper does
 *
 * Priority order:
 * 1. Exact vendor pattern match (learned from this client's history)
 * 2. Business type + vendor hint
 * 3. Historical frequency (most common category for similar transactions)
 * 4. AI suggestion (fallback)
 */
export async function categorizeTransaction(
  supabase: ReturnType<typeof createSupabaseClient>,
  clientId: string,
  vendor: string | null,
  amount: number | null,
  description: string | null,
  aiSuggestedCategory: string | null
): Promise<CategorizationResult> {
  // Fetch client context
  const context = await getClientContext(supabase, clientId);

  const normalizedVendor = normalizeVendorName(vendor || '');

  // -------------------------------------------------------------------------
  // 1. Check for exact vendor pattern match (learned from corrections)
  // -------------------------------------------------------------------------
  if (normalizedVendor) {
    const vendorPattern = context.vendor_patterns.find(
      (p) =>
        p.vendor_name.toLowerCase() === normalizedVendor.toLowerCase() ||
        p.vendor_aliases.some(
          (a) =>
            a.toLowerCase().includes(normalizedVendor.toLowerCase()) ||
            normalizedVendor.toLowerCase().includes(a.toLowerCase())
        )
    );

    if (vendorPattern && vendorPattern.confidence >= 0.7) {
      const account = context.chart_of_accounts.find(
        (a) => a.id === vendorPattern.default_account_id
      );

      return {
        category: vendorPattern.default_category,
        account_id: vendorPattern.default_account_id,
        account_name: account?.name || vendorPattern.default_category,
        confidence: vendorPattern.confidence * 100,
        reasoning: `Matched vendor pattern: "${normalizedVendor}" is usually categorized as "${vendorPattern.default_category}" for this client (${vendorPattern.occurrence_count} previous transactions)`,
        source: 'vendor_pattern',
      };
    }
  }

  // -------------------------------------------------------------------------
  // 2. Check business type hints
  // -------------------------------------------------------------------------
  if (normalizedVendor && context.business_type) {
    const businessHints = BUSINESS_TYPE_HINTS[context.business_type.toLowerCase()];

    if (businessHints) {
      // Find matching vendor in hints
      for (const [hintVendor, suggestedCategories] of Object.entries(businessHints)) {
        if (
          normalizedVendor.toLowerCase().includes(hintVendor.toLowerCase()) ||
          hintVendor.toLowerCase().includes(normalizedVendor.toLowerCase())
        ) {
          // Find matching account from chart of accounts
          const matchingAccount = findMatchingAccount(
            context.chart_of_accounts,
            suggestedCategories
          );

          if (matchingAccount) {
            return {
              category: matchingAccount.name,
              account_id: matchingAccount.id,
              account_name: matchingAccount.name,
              confidence: 75,
              reasoning: `Based on business type "${context.business_type}": ${hintVendor} purchases are typically "${matchingAccount.name}"`,
              source: 'business_type',
            };
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // 3. Use AI suggestion but map to actual Chart of Accounts
  // -------------------------------------------------------------------------
  if (aiSuggestedCategory) {
    const matchingAccount = findMatchingAccount(context.chart_of_accounts, [
      aiSuggestedCategory,
    ]);

    if (matchingAccount) {
      return {
        category: matchingAccount.name,
        account_id: matchingAccount.id,
        account_name: matchingAccount.name,
        confidence: 60,
        reasoning: `AI suggested "${aiSuggestedCategory}", mapped to account "${matchingAccount.name}" from your Chart of Accounts`,
        source: 'ai_suggestion',
      };
    }
  }

  // -------------------------------------------------------------------------
  // 4. Fallback: Use most common category for this client
  // -------------------------------------------------------------------------
  if (context.common_categories.length > 0) {
    const fallbackCategory = context.common_categories[0];
    const matchingAccount = findMatchingAccount(context.chart_of_accounts, [
      fallbackCategory,
    ]);

    if (matchingAccount) {
      return {
        category: matchingAccount.name,
        account_id: matchingAccount.id,
        account_name: matchingAccount.name,
        confidence: 40,
        reasoning: `Fallback to most common expense category for this client: "${matchingAccount.name}"`,
        source: 'historical',
      };
    }
  }

  // -------------------------------------------------------------------------
  // 5. Last resort: Return uncategorized
  // -------------------------------------------------------------------------
  return {
    category: aiSuggestedCategory || 'Uncategorized',
    account_id: '',
    account_name: aiSuggestedCategory || 'Uncategorized',
    confidence: 20,
    reasoning:
      'Could not determine category. Please review and select the appropriate account.',
    source: 'ai_suggestion',
  };
}

// ============================================================================
// CLIENT CONTEXT LOADING
// ============================================================================

/**
 * Fetches all the context needed for smart categorization
 */
async function getClientContext(
  supabase: ReturnType<typeof createSupabaseClient>,
  clientId: string
): Promise<ClientContext> {
  // Fetch client info
  const { data: clientData } = await supabase
    .from('clients')
    .select('id, name, business_type, industry')
    .eq('id', clientId)
    .single();

  // Fetch Chart of Accounts from the accounting connection
  // This would typically be cached and refreshed periodically
  const chartOfAccounts = await fetchChartOfAccounts(supabase, clientId);

  // Fetch learned vendor patterns
  const { data: vendorPatterns } = await supabase
    .from('vendor_patterns')
    .select('*')
    .eq('client_id', clientId)
    .order('occurrence_count', { ascending: false });

  // Get most common categories (from parsed_transactions)
  const { data: commonCategories } = await supabase
    .from('parsed_transactions')
    .select('category')
    .eq('client_id', clientId)
    .eq('sync_status', 'synced')
    .not('category', 'is', null)
    .limit(100);

  // Count category frequency
  const categoryFrequency: Record<string, number> = {};
  for (const tx of commonCategories || []) {
    if (tx.category) {
      categoryFrequency[tx.category] = (categoryFrequency[tx.category] || 0) + 1;
    }
  }

  const sortedCategories = Object.entries(categoryFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  return {
    client_id: clientId,
    business_type: clientData?.business_type || '',
    industry: clientData?.industry || '',
    chart_of_accounts: chartOfAccounts,
    vendor_patterns: (vendorPatterns || []) as VendorPattern[],
    common_categories: sortedCategories,
  };
}

/**
 * Fetches the Chart of Accounts from QuickBooks (or cache)
 */
async function fetchChartOfAccounts(
  supabase: ReturnType<typeof createSupabaseClient>,
  clientId: string
): Promise<ChartOfAccountsEntry[]> {
  // Check for cached Chart of Accounts
  const { data: cachedAccounts } = await supabase
    .from('chart_of_accounts_cache')
    .select('*')
    .eq('client_id', clientId)
    .gt('cached_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // 24 hour cache

  if (cachedAccounts && cachedAccounts.length > 0) {
    return cachedAccounts.map((a) => ({
      id: a.external_id,
      name: a.name,
      account_type: a.account_type,
      account_number: a.account_number,
      parent_id: a.parent_id,
      fully_qualified_name: a.fully_qualified_name,
      is_active: a.is_active,
    }));
  }

  // TODO: If no cache, fetch from QuickBooks API and cache
  // For now, return empty array (will use AI fallback)
  console.log(`No cached Chart of Accounts for client ${clientId}`);

  return [];
}

// ============================================================================
// LEARNING FROM CORRECTIONS
// ============================================================================

/**
 * Updates vendor patterns when a user corrects a categorization
 * This is how the system "learns" like a bookkeeper would
 */
export async function learnFromCorrection(
  supabase: ReturnType<typeof createSupabaseClient>,
  clientId: string,
  originalVendor: string,
  correctedCategory: string,
  correctedAccountId: string
): Promise<void> {
  const normalizedVendor = normalizeVendorName(originalVendor);

  if (!normalizedVendor) return;

  // Check if pattern already exists
  const { data: existingPattern } = await supabase
    .from('vendor_patterns')
    .select('*')
    .eq('client_id', clientId)
    .eq('vendor_name', normalizedVendor)
    .single();

  if (existingPattern) {
    // Update existing pattern
    const newCount = (existingPattern.occurrence_count || 0) + 1;
    const newConfidence = Math.min(0.95, 0.5 + newCount * 0.1); // Increases with more corrections

    // Add original vendor name as alias if not already present
    const aliases = existingPattern.vendor_aliases || [];
    if (!aliases.includes(originalVendor)) {
      aliases.push(originalVendor);
    }

    await supabase
      .from('vendor_patterns')
      .update({
        default_category: correctedCategory,
        default_account_id: correctedAccountId,
        vendor_aliases: aliases,
        occurrence_count: newCount,
        confidence: newConfidence,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', existingPattern.id);
  } else {
    // Create new pattern
    await supabase.from('vendor_patterns').insert({
      client_id: clientId,
      vendor_name: normalizedVendor,
      vendor_aliases: [originalVendor],
      default_category: correctedCategory,
      default_account_id: correctedAccountId,
      occurrence_count: 1,
      confidence: 0.6, // Start with moderate confidence
      last_used_at: new Date().toISOString(),
    });
  }
}
