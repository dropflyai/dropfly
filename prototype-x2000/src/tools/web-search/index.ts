/**
 * X2000 Web Search Tool - Submodule Exports
 *
 * Re-exports all web search components for convenient importing.
 */

// Safety filtering
export {
  SafetyFilter,
  safetyFilter,
  createSafetyFilter,
} from './safety.js';

export type {
  SafetyConfig,
  SafetyResult,
  SafetyFilterResult,
  SearchResultWithSafety,
} from './safety.js';

// Semantic re-ranking
export {
  SemanticReranker,
  semanticReranker,
  createSemanticReranker,
} from './reranker.js';

export type {
  RerankerConfig,
  RerankableResult,
  RerankResult,
} from './reranker.js';

// Content extraction
export {
  ContentExtractor,
  contentExtractor,
  createContentExtractor,
} from './extractor.js';

export type {
  ExtractorConfig,
  ExtractedContent,
  ExtractionMode,
} from './extractor.js';
