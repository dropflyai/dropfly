/**
 * BookFly - Process Scan Edge Function
 *
 * This function handles the initial processing of scanned documents:
 * 1. Receives scan data from the mobile app (image URLs)
 * 2. Fetches and optimizes images
 * 3. Converts multiple images to a single PDF if needed
 * 4. Uploads processed PDF to Supabase Storage
 * 5. Updates scan record status
 * 6. Triggers the parse-ai function for document analysis
 *
 * @endpoint POST /functions/v1/process-scan
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.208.0/encoding/base64.ts';
import {
  corsHeaders,
  ProcessScanRequest,
  ProcessScanResponse,
  ScanRecord,
} from '../_shared/types.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';

// ============================================================================
// CONFIGURATION
// ============================================================================

const STORAGE_BUCKET = 'scans';
const MAX_IMAGE_SIZE_MB = 10;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetches an image from a URL and returns it as a Uint8Array
 */
async function fetchImage(url: string): Promise<{ data: Uint8Array; contentType: string }> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();

  return {
    data: new Uint8Array(arrayBuffer),
    contentType,
  };
}

/**
 * Validates that an image is within acceptable parameters
 */
function validateImage(data: Uint8Array, contentType: string): void {
  // Check file size (convert bytes to MB)
  const sizeInMB = data.length / (1024 * 1024);
  if (sizeInMB > MAX_IMAGE_SIZE_MB) {
    throw new Error(`Image exceeds maximum size of ${MAX_IMAGE_SIZE_MB}MB (got ${sizeInMB.toFixed(2)}MB)`);
  }

  // Check content type
  if (!SUPPORTED_FORMATS.includes(contentType)) {
    throw new Error(`Unsupported image format: ${contentType}. Supported: ${SUPPORTED_FORMATS.join(', ')}`);
  }
}

/**
 * Creates a simple PDF from images using a basic PDF structure.
 * For production, consider using a proper PDF library like pdf-lib.
 *
 * This is a simplified implementation that creates a PDF with embedded images.
 * Each image becomes a page in the PDF.
 */
async function createPdfFromImages(
  images: Array<{ data: Uint8Array; contentType: string }>
): Promise<Uint8Array> {
  // For a production implementation, you would use a proper PDF library
  // This simplified version creates a PDF with base64-encoded images
  // Using the pdf-lib library would be more robust

  // Import pdf-lib dynamically
  const { PDFDocument, PageSizes } = await import('https://esm.sh/pdf-lib@1.17.1');

  const pdfDoc = await PDFDocument.create();

  for (const image of images) {
    let embeddedImage;

    // Embed the image based on content type
    if (image.contentType === 'image/jpeg' || image.contentType === 'image/jpg') {
      embeddedImage = await pdfDoc.embedJpg(image.data);
    } else if (image.contentType === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(image.data);
    } else {
      // For other formats, we'll need to convert them first
      // For now, skip unsupported formats
      console.warn(`Skipping unsupported image format for PDF: ${image.contentType}`);
      continue;
    }

    // Calculate page dimensions to fit the image
    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    // Use letter size as base, scale image to fit
    const [pageWidth, pageHeight] = PageSizes.Letter;
    const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.95; // 95% to add margin

    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Create page and draw image centered
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImage, {
      x: (pageWidth - scaledWidth) / 2,
      y: (pageHeight - scaledHeight) / 2,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}

/**
 * Uploads a file to Supabase Storage
 */
async function uploadToStorage(
  supabase: ReturnType<typeof createSupabaseClient>,
  bucket: string,
  path: string,
  data: Uint8Array,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, data, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to storage: ${error.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Updates the scan record status in the database
 */
async function updateScanStatus(
  supabase: ReturnType<typeof createSupabaseClient>,
  scanId: string,
  status: string,
  pdfUrl?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (pdfUrl) {
    updates.pdf_url = pdfUrl;
  }

  const { error } = await supabase
    .from('scans')
    .update(updates)
    .eq('id', scanId);

  if (error) {
    throw new Error(`Failed to update scan status: ${error.message}`);
  }
}

/**
 * Triggers the parse-ai function to analyze the document
 */
async function triggerParseAI(scanId: string): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing environment variables for function invocation');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/parse-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ scan_id: scanId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`parse-ai trigger failed: ${errorText}`);
    // Don't throw - we don't want to fail the entire process if parse-ai fails
    // The scan is already processed and saved
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
    const body: ProcessScanRequest = await req.json();
    const { scan_id, image_urls } = body;

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

    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'image_urls array is required and must not be empty' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing scan ${scan_id} with ${image_urls.length} image(s)`);

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Update scan status to processing
    await updateScanStatus(supabase, scan_id, 'processing');

    // Fetch and validate all images
    const images: Array<{ data: Uint8Array; contentType: string }> = [];

    for (const url of image_urls) {
      console.log(`Fetching image: ${url}`);
      const image = await fetchImage(url);
      validateImage(image.data, image.contentType);
      images.push(image);
    }

    console.log(`Successfully fetched ${images.length} image(s)`);

    let pdfUrl: string;

    // If single image and it's not being converted to PDF, upload directly
    // For multi-image or when PDF is preferred, create PDF
    if (images.length === 1) {
      // For single images, we still create a PDF for consistency
      // This ensures all documents are in the same format for parsing
      const pdfData = await createPdfFromImages(images);
      const storagePath = `${scan_id}/document.pdf`;
      pdfUrl = await uploadToStorage(supabase, STORAGE_BUCKET, storagePath, pdfData, 'application/pdf');
      console.log(`Uploaded single-page PDF: ${pdfUrl}`);
    } else {
      // Multiple images - combine into single PDF
      console.log(`Creating PDF from ${images.length} images`);
      const pdfData = await createPdfFromImages(images);
      const storagePath = `${scan_id}/document.pdf`;
      pdfUrl = await uploadToStorage(supabase, STORAGE_BUCKET, storagePath, pdfData, 'application/pdf');
      console.log(`Uploaded multi-page PDF: ${pdfUrl}`);
    }

    // Update scan record with PDF URL and mark as processed (ready for parsing)
    await updateScanStatus(supabase, scan_id, 'pending', pdfUrl);

    // Trigger the parse-ai function asynchronously
    // We don't await this - let it run in the background
    triggerParseAI(scan_id).catch((err) => {
      console.error(`Failed to trigger parse-ai: ${err.message}`);
    });

    // Return success response
    const response: ProcessScanResponse = {
      success: true,
      scan_id,
      pdf_url: pdfUrl,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing scan:', error);

    // Try to update scan status to error if we have the scan_id
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
