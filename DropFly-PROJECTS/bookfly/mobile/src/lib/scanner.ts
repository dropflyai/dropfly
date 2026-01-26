/**
 * Document scanning utilities for BookFly
 * Handles edge detection, image processing, and PDF generation
 */

import * as FileSystem from 'expo-file-system';

// ============================================================================
// Types
// ============================================================================

/** Point coordinates for edge detection */
export interface Point {
  x: number;
  y: number;
}

/** Four corner points of detected document */
export interface DocumentCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

/** Result of edge detection process */
export interface EdgeDetectionResult {
  detected: boolean;
  confidence: number; // 0-1
  corners: DocumentCorners | null;
  isStable: boolean; // True when document hasn't moved for threshold duration
}

/** Processed image ready for OCR/upload */
export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  format: 'jpeg' | 'png';
}

/** Scanned document with metadata */
export interface ScannedDocument {
  id: string;
  originalUri: string;
  processedUri: string;
  thumbnailUri: string;
  capturedAt: Date;
  corners: DocumentCorners | null;
}

/** Batch of scanned documents */
export interface ScanBatch {
  id: string;
  documents: ScannedDocument[];
  clientId: string;
  createdAt: Date;
  status: 'scanning' | 'processing' | 'ready' | 'uploaded';
}

// ============================================================================
// Constants
// ============================================================================

/** Minimum confidence threshold for auto-capture */
const AUTO_CAPTURE_CONFIDENCE = 0.85;

/** Duration (ms) document must be stable before auto-capture */
const STABILITY_THRESHOLD_MS = 500;

/** Maximum image dimension for processing */
const MAX_IMAGE_DIMENSION = 2048;

/** JPEG quality for processed images (0-1) */
const JPEG_QUALITY = 0.85;

/** Thumbnail size */
const THUMBNAIL_SIZE = 200;

// ============================================================================
// Edge Detection Processing
// ============================================================================

/**
 * Simulates edge detection processing
 * In production, this would use ML Kit or Vision Camera frame processor
 *
 * @param frameData - Raw frame data from camera
 * @returns Edge detection result with corners and confidence
 */
export function processFrameForEdges(frameData: unknown): EdgeDetectionResult {
  // This is a placeholder for actual ML Kit integration
  // Real implementation would process the frame using:
  // - ML Kit Document Scanner API
  // - Vision Camera frame processor
  // - Custom TensorFlow Lite model

  // For now, return mock data structure
  return {
    detected: false,
    confidence: 0,
    corners: null,
    isStable: false,
  };
}

/** Previous detection state for stability tracking */
let previousCorners: DocumentCorners | null = null;
let stableStartTime: number | null = null;

/**
 * Check if document has been stable (not moving) for threshold duration
 *
 * @param currentCorners - Current detected corners
 * @returns Whether document is stable enough for capture
 */
export function checkDocumentStability(currentCorners: DocumentCorners | null): boolean {
  if (!currentCorners) {
    previousCorners = null;
    stableStartTime = null;
    return false;
  }

  const isStable = previousCorners
    ? cornersAreSimilar(previousCorners, currentCorners)
    : false;

  if (isStable) {
    if (!stableStartTime) {
      stableStartTime = Date.now();
    }
    const stableDuration = Date.now() - stableStartTime;
    previousCorners = currentCorners;
    return stableDuration >= STABILITY_THRESHOLD_MS;
  } else {
    stableStartTime = null;
    previousCorners = currentCorners;
    return false;
  }
}

/**
 * Compare two sets of corners to determine if document has moved
 *
 * @param prev - Previous corners
 * @param current - Current corners
 * @param threshold - Maximum allowed movement in pixels
 */
function cornersAreSimilar(
  prev: DocumentCorners,
  current: DocumentCorners,
  threshold: number = 10
): boolean {
  const points = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const;

  for (const point of points) {
    const dx = Math.abs(prev[point].x - current[point].x);
    const dy = Math.abs(prev[point].y - current[point].y);
    if (dx > threshold || dy > threshold) {
      return false;
    }
  }

  return true;
}

/**
 * Reset stability tracking state
 */
export function resetStabilityTracking(): void {
  previousCorners = null;
  stableStartTime = null;
}

/**
 * Determine if auto-capture should trigger
 *
 * @param result - Edge detection result
 */
export function shouldAutoCapture(result: EdgeDetectionResult): boolean {
  return (
    result.detected &&
    result.confidence >= AUTO_CAPTURE_CONFIDENCE &&
    result.isStable
  );
}

// ============================================================================
// Image Optimization
// ============================================================================

/**
 * Optimize image for processing and upload
 * - Resizes to max dimension while maintaining aspect ratio
 * - Compresses to JPEG format
 * - Returns processed image info
 *
 * @param uri - Original image URI
 * @returns Processed image with optimized size
 */
export async function optimizeImage(uri: string): Promise<ProcessedImage> {
  // Get original file info
  const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });

  if (!fileInfo.exists) {
    throw new Error('Image file not found');
  }

  // For Expo, we'd use expo-image-manipulator for actual resizing
  // This is a placeholder that copies the file
  const processedUri = `${FileSystem.cacheDirectory}processed_${Date.now()}.jpg`;

  await FileSystem.copyAsync({
    from: uri,
    to: processedUri,
  });

  // In production, use expo-image-manipulator:
  // const manipulated = await ImageManipulator.manipulateAsync(
  //   uri,
  //   [{ resize: { width: MAX_IMAGE_DIMENSION } }],
  //   { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  // );

  const processedInfo = await FileSystem.getInfoAsync(processedUri, { size: true });

  return {
    uri: processedUri,
    width: MAX_IMAGE_DIMENSION, // Would come from actual processing
    height: MAX_IMAGE_DIMENSION, // Would come from actual processing
    fileSize: processedInfo.exists ? (processedInfo as { size: number }).size : 0,
    format: 'jpeg',
  };
}

/**
 * Generate thumbnail for image
 *
 * @param uri - Source image URI
 * @returns Thumbnail URI
 */
export async function generateThumbnail(uri: string): Promise<string> {
  const thumbnailUri = `${FileSystem.cacheDirectory}thumb_${Date.now()}.jpg`;

  // In production, use expo-image-manipulator:
  // const thumbnail = await ImageManipulator.manipulateAsync(
  //   uri,
  //   [{ resize: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE } }],
  //   { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  // );

  // Placeholder: just copy for now
  await FileSystem.copyAsync({
    from: uri,
    to: thumbnailUri,
  });

  return thumbnailUri;
}

/**
 * Apply perspective correction to straighten document
 *
 * @param uri - Source image URI
 * @param corners - Detected document corners
 * @returns Corrected image URI
 */
export async function applyPerspectiveCorrection(
  uri: string,
  corners: DocumentCorners
): Promise<string> {
  // This would use a native module or Skia for actual perspective transform
  // Placeholder returns original image
  const correctedUri = `${FileSystem.cacheDirectory}corrected_${Date.now()}.jpg`;

  await FileSystem.copyAsync({
    from: uri,
    to: correctedUri,
  });

  return correctedUri;
}

// ============================================================================
// PDF Generation
// ============================================================================

/**
 * Generate PDF from array of scanned images
 *
 * @param images - Array of image URIs
 * @param title - PDF title/filename
 * @returns URI of generated PDF
 */
export async function generatePdfFromImages(
  images: string[],
  title: string = 'scanned_documents'
): Promise<string> {
  // In production, this would use a PDF library like react-native-pdf-lib
  // or send images to a backend service for PDF generation

  const pdfUri = `${FileSystem.documentDirectory}${title}_${Date.now()}.pdf`;

  // Placeholder: For actual implementation, use:
  // - react-native-pdf-lib
  // - PDFKit via native module
  // - Backend API endpoint

  // Create a placeholder file to represent the PDF
  await FileSystem.writeAsStringAsync(pdfUri, 'PDF_PLACEHOLDER', {
    encoding: FileSystem.EncodingType.UTF8,
  });

  console.log(`PDF generated with ${images.length} pages at: ${pdfUri}`);

  return pdfUri;
}

/**
 * Merge multiple PDFs into one
 *
 * @param pdfUris - Array of PDF URIs to merge
 * @returns URI of merged PDF
 */
export async function mergePdfs(pdfUris: string[]): Promise<string> {
  // Placeholder for PDF merging functionality
  const mergedUri = `${FileSystem.documentDirectory}merged_${Date.now()}.pdf`;

  await FileSystem.writeAsStringAsync(mergedUri, 'MERGED_PDF_PLACEHOLDER', {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return mergedUri;
}

// ============================================================================
// Batch Management
// ============================================================================

/**
 * Create a new scan batch
 *
 * @param clientId - Client ID for this batch
 */
export function createScanBatch(clientId: string): ScanBatch {
  return {
    id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    documents: [],
    clientId,
    createdAt: new Date(),
    status: 'scanning',
  };
}

/**
 * Add scanned document to batch
 *
 * @param batch - Current batch
 * @param uri - Captured image URI
 * @param corners - Detected corners (if any)
 */
export async function addDocumentToBatch(
  batch: ScanBatch,
  uri: string,
  corners: DocumentCorners | null
): Promise<ScanBatch> {
  // Process the image
  const processed = await optimizeImage(uri);
  const thumbnail = await generateThumbnail(processed.uri);

  // Apply perspective correction if corners detected
  const finalUri = corners
    ? await applyPerspectiveCorrection(processed.uri, corners)
    : processed.uri;

  const document: ScannedDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    originalUri: uri,
    processedUri: finalUri,
    thumbnailUri: thumbnail,
    capturedAt: new Date(),
    corners,
  };

  return {
    ...batch,
    documents: [...batch.documents, document],
  };
}

/**
 * Finalize batch and prepare for upload
 *
 * @param batch - Batch to finalize
 */
export async function finalizeBatch(batch: ScanBatch): Promise<ScanBatch> {
  return {
    ...batch,
    status: 'ready',
  };
}

// ============================================================================
// Cleanup Utilities
// ============================================================================

/**
 * Clean up temporary files from scanning session
 *
 * @param batch - Batch with files to clean
 * @param keepProcessed - Whether to keep processed files (default: true)
 */
export async function cleanupBatchFiles(
  batch: ScanBatch,
  keepProcessed: boolean = true
): Promise<void> {
  for (const doc of batch.documents) {
    // Always delete thumbnails and originals from cache
    try {
      await FileSystem.deleteAsync(doc.originalUri, { idempotent: true });
      await FileSystem.deleteAsync(doc.thumbnailUri, { idempotent: true });

      if (!keepProcessed) {
        await FileSystem.deleteAsync(doc.processedUri, { idempotent: true });
      }
    } catch (error) {
      console.warn('Error cleaning up file:', error);
    }
  }
}

/**
 * Clear all cached scanner files
 */
export async function clearScannerCache(): Promise<void> {
  const cacheDir = FileSystem.cacheDirectory;

  if (!cacheDir) {
    return;
  }

  try {
    const files = await FileSystem.readDirectoryAsync(cacheDir);
    const scannerFiles = files.filter(
      f => f.startsWith('processed_') ||
           f.startsWith('thumb_') ||
           f.startsWith('corrected_')
    );

    for (const file of scannerFiles) {
      await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
    }
  } catch (error) {
    console.warn('Error clearing scanner cache:', error);
  }
}
