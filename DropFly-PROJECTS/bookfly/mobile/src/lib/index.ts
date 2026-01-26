/**
 * Library utilities barrel export
 */

export {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  onAuthStateChange,
} from './supabase';

export type { AuthChangeEvent, Session, User } from './supabase';

export {
  processFrameForEdges,
  checkDocumentStability,
  resetStabilityTracking,
  shouldAutoCapture,
  optimizeImage,
  generateThumbnail,
  applyPerspectiveCorrection,
  generatePdfFromImages,
  mergePdfs,
  createScanBatch,
  addDocumentToBatch,
  finalizeBatch,
  cleanupBatchFiles,
  clearScannerCache,
} from './scanner';

export type {
  Point,
  DocumentCorners,
  EdgeDetectionResult,
  ProcessedImage,
  ScannedDocument,
  ScanBatch,
} from './scanner';
