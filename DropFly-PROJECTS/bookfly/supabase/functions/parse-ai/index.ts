/**
 * BookFly - Parse AI Edge Function
 *
 * This function handles AI-powered document analysis:
 * 1. Receives a scan ID
 * 2. Fetches the processed document from Storage
 * 3. Calls GPT-4V API for document analysis
 * 4. Extracts: entity_type, vendor, amount, date, category, description, line_items
 * 5. Calculates confidence score based on extraction quality
 * 6. Generates AI reasoning for transparency
 * 7. Creates a parsed_transaction record
 * 8. Returns the parsed data
 *
 * @endpoint POST /functions/v1/parse-ai
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.208.0/encoding/base64.ts';
import {
  corsHeaders,
  ParseAIRequest,
  ParseAIResponse,
  ScanRecord,
  ParsedTransaction,
  EntityType,
  LineItem,
  GPT4VExtractionResult,
} from '../_shared/types.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';
import {
  categorizeTransaction,
  normalizeVendorName,
  CategorizationResult,
} from './categorization.ts';

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GPT_MODEL = 'gpt-4-vision-preview';
const MAX_TOKENS = 4096;
const STORAGE_BUCKET = 'scans';

// ============================================================================
// GPT-4V PROMPT
// ============================================================================

const EXTRACTION_PROMPT = `You are a financial document analysis AI. Analyze the provided document image and extract structured financial data.

IMPORTANT: Be precise and extract only what you can clearly see in the document.

Extract the following information:

1. **entity_type**: Determine the document type:
   - "expense" - General expense/purchase
   - "invoice" - Invoice received from a vendor
   - "receipt" - Receipt for a payment made
   - "bill" - Bill to be paid
   - "statement" - Bank or credit card statement
   - "unknown" - Cannot determine type

2. **vendor**: The business name of the vendor/merchant. Look for logos, headers, or "Sold by" text.

3. **amount**: The total amount. Look for "Total", "Amount Due", "Grand Total". Extract as a number without currency symbols.

4. **currency**: The currency code (USD, EUR, GBP, etc.)

5. **date**: The transaction/invoice date in ISO format (YYYY-MM-DD). Look for "Date", "Invoice Date", "Transaction Date".

6. **category**: Suggest a general expense category based on what you see:
   - Be specific about what was purchased (e.g., "plumbing supplies", "vehicle fuel", "office printer paper")
   - Don't use generic categories like "Other" - describe the actual purchase
   - If it's a gas station, say "vehicle fuel" or "gas/fuel"
   - If it's a hardware store, describe what type of materials (construction, plumbing, electrical, etc.)
   - We will map this to the client's actual Chart of Accounts

7. **description**: A brief description of the purchase/transaction.

8. **line_items**: Array of individual line items if visible:
   - description: Item description
   - quantity: Number of units (if shown)
   - unit_price: Price per unit (if shown)
   - amount: Line total
   - category: Suggested category for this item

9. **reasoning**: Explain your extraction process and any uncertainties.

10. **extraction_confidence**: Provide confidence scores:
    - overall: 0-100 score for overall extraction quality
    - fields: Object with confidence for each extracted field (0-100)

Respond ONLY with valid JSON in this exact format:
{
  "entity_type": "expense|invoice|receipt|bill|statement|unknown",
  "vendor": "string or null",
  "amount": number or null,
  "currency": "string or null",
  "date": "YYYY-MM-DD or null",
  "category": "string or null",
  "description": "string or null",
  "line_items": [
    {
      "description": "string",
      "quantity": number or null,
      "unit_price": number or null,
      "amount": number,
      "category": "string or null"
    }
  ] or null,
  "reasoning": "string explaining extraction process",
  "extraction_confidence": {
    "overall": number,
    "fields": {
      "vendor": number,
      "amount": number,
      "date": number,
      "category": number
    }
  }
}`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetches the scan record from the database
 */
async function getScanRecord(
  supabase: ReturnType<typeof createSupabaseClient>,
  scanId: string
): Promise<ScanRecord> {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch scan record: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Scan record not found: ${scanId}`);
  }

  return data as ScanRecord;
}

/**
 * Fetches the document from Supabase Storage
 * Returns the document as a base64-encoded string
 */
async function fetchDocumentAsBase64(
  supabase: ReturnType<typeof createSupabaseClient>,
  pdfUrl: string
): Promise<string> {
  // Extract the storage path from the URL
  // The URL format is: https://xxx.supabase.co/storage/v1/object/public/bucket/path
  const urlParts = pdfUrl.split(`/storage/v1/object/public/${STORAGE_BUCKET}/`);
  const storagePath = urlParts[1];

  if (!storagePath) {
    throw new Error(`Invalid storage URL format: ${pdfUrl}`);
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(storagePath);

  if (error) {
    throw new Error(`Failed to download document: ${error.message}`);
  }

  // Convert blob to base64
  const arrayBuffer = await data.arrayBuffer();
  const base64 = base64Encode(new Uint8Array(arrayBuffer));

  return base64;
}

/**
 * Fetches the first image from the scan's image_urls for vision analysis
 * GPT-4V works better with images than PDFs
 */
async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const base64 = base64Encode(new Uint8Array(arrayBuffer));

  return { base64, mimeType: contentType };
}

/**
 * Calls GPT-4V API to analyze the document
 */
async function analyzeWithGPT4V(
  imageBase64: string,
  mimeType: string
): Promise<GPT4VExtractionResult> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const requestBody = {
    model: GPT_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: EXTRACTION_PROMPT,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: MAX_TOKENS,
    temperature: 0.1, // Low temperature for more consistent extractions
  };

  console.log('Calling GPT-4V API...');

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GPT-4V API error: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();

  if (!result.choices || !result.choices[0]?.message?.content) {
    throw new Error('Invalid response from GPT-4V API');
  }

  const content = result.choices[0].message.content;

  // Parse the JSON response from GPT-4V
  // GPT might include markdown code blocks, so we need to extract the JSON
  let jsonContent = content;

  // Remove markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1];
  }

  try {
    const parsed = JSON.parse(jsonContent.trim());
    return parsed as GPT4VExtractionResult;
  } catch (parseError) {
    console.error('Failed to parse GPT-4V response:', content);
    throw new Error(`Failed to parse GPT-4V response as JSON: ${parseError}`);
  }
}

/**
 * Calculates the overall confidence score based on field extractions
 */
function calculateConfidenceScore(extraction: GPT4VExtractionResult): number {
  // Start with the overall confidence from GPT-4V
  let score = extraction.extraction_confidence?.overall || 50;

  // Penalize if critical fields are missing
  if (!extraction.amount) score -= 20;
  if (!extraction.vendor) score -= 10;
  if (!extraction.date) score -= 10;
  if (extraction.entity_type === 'unknown') score -= 15;

  // Bonus for having line items (indicates detailed extraction)
  if (extraction.line_items && extraction.line_items.length > 0) {
    score += 5;
  }

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Creates a parsed transaction record in the database
 * Uses SMART CATEGORIZATION to map to actual Chart of Accounts
 */
async function createParsedTransaction(
  supabase: ReturnType<typeof createSupabaseClient>,
  scanRecord: ScanRecord,
  extraction: GPT4VExtractionResult,
  rawResponse: string
): Promise<string> {
  const confidenceScore = calculateConfidenceScore(extraction);

  // =========================================================================
  // SMART CATEGORIZATION
  // This is what makes BookFly different - we categorize like a real bookkeeper
  // =========================================================================
  let categorizationResult: CategorizationResult | null = null;
  let finalCategory = extraction.category;
  let accountId = '';

  if (scanRecord.client_id) {
    try {
      console.log('Running smart categorization...');
      categorizationResult = await categorizeTransaction(
        supabase,
        scanRecord.client_id,
        extraction.vendor,
        extraction.amount,
        extraction.description,
        extraction.category // AI's initial suggestion
      );

      finalCategory = categorizationResult.category;
      accountId = categorizationResult.account_id;

      console.log(`Smart categorization result:`, {
        category: finalCategory,
        source: categorizationResult.source,
        confidence: categorizationResult.confidence,
        reasoning: categorizationResult.reasoning,
      });
    } catch (catError) {
      console.error('Smart categorization failed, using AI suggestion:', catError);
      // Fall back to AI suggestion if categorization fails
    }
  }

  // Normalize the vendor name for consistency
  const normalizedVendor = normalizeVendorName(extraction.vendor || '');

  const transaction = {
    scan_id: scanRecord.id,
    client_id: scanRecord.client_id,
    entity_type: extraction.entity_type,
    vendor: normalizedVendor || extraction.vendor, // Use normalized if available
    vendor_raw: extraction.vendor, // Keep the raw version for reference
    amount: extraction.amount,
    date: extraction.date,
    category: finalCategory,
    account_id: accountId || null,
    description: extraction.description,
    line_items: extraction.line_items,
    confidence_score: confidenceScore,
    ai_reasoning: extraction.reasoning,
    categorization_source: categorizationResult?.source || 'ai_suggestion',
    categorization_reasoning: categorizationResult?.reasoning || extraction.reasoning,
    raw_ai_response: rawResponse,
    sync_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('parsed_transactions')
    .insert(transaction)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create parsed transaction: ${error.message}`);
  }

  // Log the categorization decision for analytics
  if (categorizationResult) {
    await supabase.from('categorization_log').insert({
      transaction_id: data.id,
      client_id: scanRecord.client_id,
      final_category: finalCategory,
      final_account_id: accountId || null,
      confidence_score: categorizationResult.confidence,
      source: categorizationResult.source,
      reasoning: categorizationResult.reasoning,
    }).catch((logError) => {
      console.error('Failed to log categorization:', logError);
      // Don't fail the whole process for logging errors
    });
  }

  return data.id;
}

/**
 * Updates the scan record status
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
    throw new Error(`Failed to update scan status: ${error.message}`);
  }
}

/**
 * Triggers the validate function
 */
async function triggerValidation(transactionId: string): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing environment variables for function invocation');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ transaction_id: transactionId }),
  });

  if (!response.ok) {
    console.error(`validate trigger failed: ${await response.text()}`);
    // Don't throw - we don't want to fail the entire process
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
    const body: ParseAIRequest = await req.json();
    const { scan_id } = body;

    // Validate required fields
    if (!scan_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'scan_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Parsing scan: ${scan_id}`);

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Fetch the scan record
    const scanRecord = await getScanRecord(supabase, scan_id);

    // Update status to processing
    await updateScanStatus(supabase, scan_id, 'processing');

    // Get the first image URL for GPT-4V analysis
    // GPT-4V works better with images than PDFs
    if (!scanRecord.image_urls || scanRecord.image_urls.length === 0) {
      throw new Error('No images found in scan record');
    }

    const firstImageUrl = scanRecord.image_urls[0];
    console.log(`Fetching image for analysis: ${firstImageUrl}`);

    // Fetch the image
    const { base64, mimeType } = await fetchImageAsBase64(firstImageUrl);

    // Analyze with GPT-4V
    console.log('Analyzing document with GPT-4V...');
    const extraction = await analyzeWithGPT4V(base64, mimeType);

    console.log('Extraction result:', JSON.stringify(extraction, null, 2));

    // Create the parsed transaction record
    const transactionId = await createParsedTransaction(
      supabase,
      scanRecord,
      extraction,
      JSON.stringify(extraction)
    );

    console.log(`Created transaction: ${transactionId}`);

    // Update scan status to parsed
    await updateScanStatus(supabase, scan_id, 'parsed');

    // Trigger validation asynchronously
    triggerValidation(transactionId).catch((err) => {
      console.error(`Failed to trigger validation: ${err.message}`);
    });

    // Build response
    const response: ParseAIResponse = {
      success: true,
      transaction_id: transactionId,
      parsed_data: {
        entity_type: extraction.entity_type as EntityType,
        vendor: extraction.vendor || undefined,
        amount: extraction.amount || undefined,
        date: extraction.date || undefined,
        category: extraction.category || undefined,
        description: extraction.description || undefined,
        line_items: extraction.line_items || undefined,
        confidence_score: calculateConfidenceScore(extraction),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error parsing document:', error);

    // Try to update scan status to error
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body.scan_id) {
        const supabase = createSupabaseClient();
        await updateScanStatus(supabase, body.scan_id, 'error');
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
