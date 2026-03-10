/**
 * X2000 Hybrid Search System - Type Definitions
 * Types for the 4-stage hybrid search pipeline
 */

import type { BrainType } from '../types/index.js';

// ============================================================================
// Query Processing Types
// ============================================================================

/**
 * Entity extracted from a query
 */
export interface Entity {
  type: 'brain' | 'file_path' | 'error_code' | 'function' | 'tag' | 'project';
  value: string;
  confidence: number;
  position: { start: number; end: number };
}

/**
 * Query type classification
 * - keyword: Exact match queries (error codes, function names, file paths)
 * - semantic: Natural language questions
 * - hybrid: Mix of both
 */
export type QueryType = 'keyword' | 'semantic' | 'hybrid';

/**
 * Processed query after all query processing stages
 */
export interface ProcessedQuery {
  original: string;
  normalized: string;
  corrected: string;
  expanded: string;
  entities: Entity[];
  queryType: QueryType;
  embedding?: number[];
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Search filters for faceted search
 */
export interface SearchFilters {
  brainTypes?: BrainType[];
  memoryTypes?: ('pattern' | 'learning' | 'skill' | 'decision')[];
  tags?: string[];
  projectId?: string;
  dateRange?: { from: Date; to: Date };
  minImportance?: number;
  verified?: boolean;
}

// ============================================================================
// Retrieval Types
// ============================================================================

/**
 * Which retriever produced the result
 */
export type RetrieverType = 'bm25' | 'vector' | 'splade';

/**
 * Single result from a retriever
 */
export interface RetrievalResult {
  id: string;
  content: string;
  score: number;
  retriever: RetrieverType;
  metadata: {
    brainType?: BrainType;
    memoryType?: string;
    tags?: string[];
    createdAt?: Date;
    importance?: number;
    verified?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Results from parallel retrieval stage
 */
export interface ParallelRetrievalResults {
  bm25: RetrievalResult[];
  vector: RetrievalResult[];
  splade?: RetrievalResult[];
}

// ============================================================================
// Fusion Types
// ============================================================================

/**
 * Source information for a fused result
 */
export interface FusionSource {
  retriever: RetrieverType;
  rank: number;
  score: number;
}

/**
 * Result after RRF fusion
 */
export interface FusedResult {
  id: string;
  content: string;
  rrfScore: number;
  sources: FusionSource[];
  metadata: RetrievalResult['metadata'];
}

/**
 * Retriever weights for RRF fusion
 */
export interface RetrieverWeights {
  bm25: number;
  vector: number;
  splade: number;
}

// ============================================================================
// Reranking Types
// ============================================================================

/**
 * Reranker provider options
 */
export type RerankerProvider = 'cohere' | 'local' | 'none';

/**
 * Configuration for the reranker
 */
export interface RerankerConfig {
  provider: RerankerProvider;
  cohereApiKey?: string;
  localModelPath?: string;
  topK: number;
  minConfidence: number;
}

/**
 * Result after neural reranking
 */
export interface RerankedResult extends FusedResult {
  relevanceScore: number;
  explanation?: string;
}

// ============================================================================
// Post-Processing Types
// ============================================================================

/**
 * Configuration for temporal decay
 */
export interface TemporalDecayConfig {
  enabled: boolean;
  halfLifeDays: number;
}

/**
 * Configuration for MMR diversity
 */
export interface MMRConfig {
  enabled: boolean;
  lambda: number; // 0-1, higher = more relevance, lower = more diversity
}

/**
 * Configuration for post-processing
 */
export interface PostProcessConfig {
  temporalDecay: TemporalDecayConfig;
  mmr: MMRConfig;
  minConfidence: number;
}

/**
 * Final search result after all processing
 */
export interface FinalResult extends RerankedResult {
  decayedScore: number;
  diversityRank: number;
}

// ============================================================================
// Learning to Rank Types
// ============================================================================

/**
 * Search event for learning to rank feedback
 */
export interface SearchEvent {
  queryId: string;
  query: string;
  queryEmbedding?: number[];
  results: Array<{
    id: string;
    position: number;
    retriever: RetrieverType;
    score: number;
  }>;
  selectedId: string | null;
  selectedPosition: number | null;
  sessionId: string;
  timestamp: Date;
}

/**
 * Debiased feedback after position bias correction
 */
export interface DebaisedFeedback {
  queryId: string;
  docId: string;
  relevance: number;
}

/**
 * Propensity model for position bias correction
 */
export interface PropensityModel {
  propensities: number[]; // Probability of examination at each position
  getPropensity(position: number): number;
}

// ============================================================================
// Search Pipeline Types
// ============================================================================

/**
 * Search options for the main search interface
 */
export interface SearchOptions {
  filters?: SearchFilters;
  topK?: number;
  rerank?: boolean;
  explain?: boolean;
  temporalDecay?: boolean;
  temporalDecayHalfLifeDays?: number;
  mmr?: boolean;
  mmrLambda?: number;
  minConfidence?: number;
}

/**
 * Complete search result with metadata
 */
export interface SearchResult {
  query: ProcessedQuery;
  results: FinalResult[];
  timing: {
    queryProcessing: number;
    retrieval: number;
    fusion: number;
    reranking: number;
    postProcessing: number;
    total: number;
  };
  metadata: {
    retrieversUsed: RetrieverType[];
    weights: RetrieverWeights;
    candidatesRetrieved: number;
    candidatesFused: number;
    candidatesReranked: number;
    finalCount: number;
  };
}

// ============================================================================
// Database Types
// ============================================================================

/**
 * Database representation of a memory chunk (for vector/BM25 search)
 */
export interface DatabaseMemoryChunk {
  id: string;
  content: string;
  embedding?: number[];
  brain_type: string;
  memory_type: string;
  tags: string[];
  source_file?: string;
  project_id?: string;
  created_at: string;
  accessed_at: string;
  access_count: number;
  importance: number;
  verified: boolean;
}

/**
 * Database representation of search feedback
 */
export interface DatabaseSearchFeedback {
  id: string;
  query: string;
  query_embedding?: number[];
  result_ids: string[];
  selected_id?: string;
  selected_position?: number;
  session_id?: string;
  created_at: string;
}

/**
 * Database representation of retriever weights
 */
export interface DatabaseRetrieverWeights {
  id: number;
  bm25_weight: number;
  vector_weight: number;
  splade_weight: number;
  updated_at: string;
  metrics?: {
    ndcg?: number;
    mrr?: number;
  };
}

// ============================================================================
// Embedding Types
// ============================================================================

/**
 * Embedding provider options
 */
export type EmbeddingProvider = 'openai' | 'cohere' | 'local';

/**
 * Configuration for embeddings
 */
export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model: string;
  dimensions: number;
  apiKey?: string;
  maxTokens: number;
}

/**
 * Embedding result
 */
export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}
