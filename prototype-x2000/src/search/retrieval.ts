/**
 * Parallel Retrieval System
 * Handles parallel retrieval from multiple sources:
 * - BM25+ text search (pg_search or FTS)
 * - Dense vector search (pgvector)
 * - Optional SPLADE sparse retrieval
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/env.js';
import type {
  ProcessedQuery,
  SearchFilters,
  RetrievalResult,
  ParallelRetrievalResults,
  DatabaseMemoryChunk,
  EmbeddingConfig,
  EmbeddingResult,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_K = 100; // Default number of results per retriever

const DEFAULT_EMBEDDING_CONFIG: EmbeddingConfig = {
  provider: 'openai',
  model: 'text-embedding-3-small',
  dimensions: 1536,
  maxTokens: 8191,
};

// ============================================================================
// Retrieval Manager
// ============================================================================

export class RetrievalManager {
  private client: SupabaseClient | null = null;
  private embeddingConfig: EmbeddingConfig;
  private spladeEnabled = false;

  // Table name for memory chunks
  private readonly TABLE = 'memory_chunks';

  constructor(config?: { embeddingConfig?: Partial<EmbeddingConfig>; enableSplade?: boolean }) {
    this.embeddingConfig = {
      ...DEFAULT_EMBEDDING_CONFIG,
      ...config?.embeddingConfig,
    };
    this.spladeEnabled = config?.enableSplade ?? false;
  }

  /**
   * Initialize the retrieval manager
   */
  async initialize(): Promise<boolean> {
    const supabaseConfig = getSupabaseConfig();

    if (!supabaseConfig) {
      console.log('[Retrieval] Supabase not configured - running in offline mode');
      return false;
    }

    try {
      this.client = createClient(supabaseConfig.url, supabaseConfig.key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      // Test connection
      const { error } = await this.client
        .from(this.TABLE)
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = table doesn't exist, which is ok for now
        throw error;
      }

      console.log('[Retrieval] Connected to Supabase');
      return true;
    } catch (error) {
      console.error('[Retrieval] Failed to connect:', error);
      return false;
    }
  }

  /**
   * Check if retrieval is available
   */
  isOnline(): boolean {
    return this.client !== null;
  }

  /**
   * Execute parallel retrieval across all enabled retrievers
   */
  async retrieve(
    query: ProcessedQuery,
    filters: SearchFilters = {},
    k: number = DEFAULT_K
  ): Promise<ParallelRetrievalResults> {
    if (!this.isOnline()) {
      return this.offlineRetrieve(query, filters, k);
    }

    // Build filter clause
    const filterParams = this.buildFilterParams(filters);

    // Run all retrievers in parallel
    const [bm25Results, vectorResults, spladeResults] = await Promise.all([
      this.bm25Retrieve(query, filterParams, k),
      this.vectorRetrieve(query, filterParams, k),
      this.spladeEnabled ? this.spladeRetrieve(query, filterParams, k) : Promise.resolve([]),
    ]);

    return {
      bm25: bm25Results,
      vector: vectorResults,
      splade: spladeResults.length > 0 ? spladeResults : undefined,
    };
  }

  // ============================================================================
  // BM25+ Retrieval
  // ============================================================================

  /**
   * Perform BM25+ text search
   * Uses PostgreSQL full-text search or pg_search extension
   */
  private async bm25Retrieve(
    query: ProcessedQuery,
    filterParams: Record<string, unknown>,
    k: number
  ): Promise<RetrievalResult[]> {
    if (!this.client) return [];

    try {
      // Use expanded query for BM25 to benefit from synonyms
      const searchQuery = query.expanded;

      // Build the query with filters using chained builder
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dbQuery: any = this.client
        .from(this.TABLE)
        .select('*');

      // Apply full-text search using PostgreSQL ts_rank
      // Note: This assumes content_tsvector column exists
      // For pg_search, we would use the BM25 operator <@>
      dbQuery = dbQuery.textSearch('content', searchQuery, {
        type: 'websearch',
        config: 'english',
      });

      // Apply filters
      dbQuery = this.applyFilters(dbQuery, filterParams);

      // Limit results
      dbQuery = dbQuery.limit(k);

      const { data, error } = await dbQuery;

      if (error) {
        console.error('[Retrieval] BM25 search failed:', error);
        return [];
      }

      return (data as DatabaseMemoryChunk[]).map((row, index) => ({
        id: row.id,
        content: row.content,
        // Approximate BM25 score based on position (actual score would come from DB)
        score: 1 / (index + 1),
        retriever: 'bm25' as const,
        metadata: {
          brainType: row.brain_type as RetrievalResult['metadata']['brainType'],
          memoryType: row.memory_type,
          tags: row.tags,
          createdAt: new Date(row.created_at),
          importance: row.importance,
          verified: row.verified,
        },
      }));
    } catch (error) {
      console.error('[Retrieval] BM25 retrieval error:', error);
      return [];
    }
  }

  // ============================================================================
  // Vector Retrieval
  // ============================================================================

  /**
   * Perform dense vector search using pgvector
   */
  private async vectorRetrieve(
    query: ProcessedQuery,
    filterParams: Record<string, unknown>,
    k: number
  ): Promise<RetrievalResult[]> {
    if (!this.client) return [];

    try {
      // Get query embedding
      const embedding = query.embedding ?? await this.getEmbedding(query.corrected);
      if (!embedding) {
        console.warn('[Retrieval] Could not get embedding for query');
        return [];
      }

      // Use Supabase's vector similarity search via RPC
      // This assumes a stored procedure 'match_memories' exists
      const { data, error } = await this.client.rpc('match_memories', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: k,
        filter_brain_types: filterParams.brainTypes || null,
        filter_memory_types: filterParams.memoryTypes || null,
        filter_tags: filterParams.tags || null,
        filter_project_id: filterParams.projectId || null,
      });

      if (error) {
        // Fall back to basic similarity search if RPC doesn't exist
        return this.vectorRetrieveFallback(embedding, filterParams, k);
      }

      return (data as Array<DatabaseMemoryChunk & { similarity: number }>).map(row => ({
        id: row.id,
        content: row.content,
        score: row.similarity,
        retriever: 'vector' as const,
        metadata: {
          brainType: row.brain_type as RetrievalResult['metadata']['brainType'],
          memoryType: row.memory_type,
          tags: row.tags,
          createdAt: new Date(row.created_at),
          importance: row.importance,
          verified: row.verified,
        },
      }));
    } catch (error) {
      console.error('[Retrieval] Vector retrieval error:', error);
      return [];
    }
  }

  /**
   * Fallback vector search without RPC
   */
  private async vectorRetrieveFallback(
    embedding: number[],
    filterParams: Record<string, unknown>,
    k: number
  ): Promise<RetrievalResult[]> {
    if (!this.client) return [];

    try {
      // Basic query - pgvector similarity search requires RPC for proper ordering
      // This is a placeholder that fetches all and filters client-side
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dbQuery: any = this.client
        .from(this.TABLE)
        .select('*');

      dbQuery = this.applyFilters(dbQuery, filterParams);
      dbQuery = dbQuery.limit(k * 2); // Fetch more to account for filtering

      const { data, error } = await dbQuery;

      if (error) {
        console.error('[Retrieval] Vector fallback failed:', error);
        return [];
      }

      // Calculate cosine similarity client-side (not ideal for large datasets)
      const results = (data as Array<DatabaseMemoryChunk & { embedding?: number[] }>)
        .filter(row => row.embedding)
        .map(row => ({
          id: row.id,
          content: row.content,
          score: this.cosineSimilarity(embedding, row.embedding!),
          retriever: 'vector' as const,
          metadata: {
            brainType: row.brain_type as RetrievalResult['metadata']['brainType'],
            memoryType: row.memory_type,
            tags: row.tags,
            createdAt: new Date(row.created_at),
            importance: row.importance,
            verified: row.verified,
          },
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k);

      return results;
    } catch (error) {
      console.error('[Retrieval] Vector fallback error:', error);
      return [];
    }
  }

  // ============================================================================
  // SPLADE Retrieval (Optional)
  // ============================================================================

  /**
   * Perform SPLADE sparse retrieval
   * SPLADE produces sparse vectors that can be searched with inverted indices
   */
  private async spladeRetrieve(
    query: ProcessedQuery,
    filterParams: Record<string, unknown>,
    k: number
  ): Promise<RetrievalResult[]> {
    if (!this.client || !this.spladeEnabled) return [];

    try {
      // SPLADE would typically require a separate model service
      // For now, return empty - can be implemented when model is available
      console.log('[Retrieval] SPLADE retrieval not yet implemented');
      return [];
    } catch (error) {
      console.error('[Retrieval] SPLADE retrieval error:', error);
      return [];
    }
  }

  // ============================================================================
  // Offline Mode
  // ============================================================================

  /**
   * Handle retrieval in offline mode
   * Uses in-memory search with basic text matching
   */
  private offlineRetrieve(
    query: ProcessedQuery,
    filters: SearchFilters,
    k: number
  ): ParallelRetrievalResults {
    // In offline mode, return empty results
    // The memory manager's local search will be used instead
    console.log('[Retrieval] Operating in offline mode');
    return {
      bm25: [],
      vector: [],
    };
  }

  // ============================================================================
  // Embedding Generation
  // ============================================================================

  /**
   * Get embedding for a text query
   */
  async getEmbedding(text: string): Promise<number[] | null> {
    try {
      switch (this.embeddingConfig.provider) {
        case 'openai':
          return this.getOpenAIEmbedding(text);
        case 'cohere':
          return this.getCohereEmbedding(text);
        case 'local':
          return this.getLocalEmbedding(text);
        default:
          console.warn('[Retrieval] Unknown embedding provider');
          return null;
      }
    } catch (error) {
      console.error('[Retrieval] Embedding generation failed:', error);
      return null;
    }
  }

  /**
   * Get embedding from OpenAI
   */
  private async getOpenAIEmbedding(text: string): Promise<number[] | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[Retrieval] OPENAI_API_KEY not set');
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.embeddingConfig.model,
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('[Retrieval] OpenAI embedding error:', error);
      return null;
    }
  }

  /**
   * Get embedding from Cohere
   */
  private async getCohereEmbedding(text: string): Promise<number[] | null> {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      console.warn('[Retrieval] COHERE_API_KEY not set');
      return null;
    }

    try {
      const response = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'embed-english-v3.0',
          texts: [text],
          input_type: 'search_query',
        }),
      });

      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.status}`);
      }

      const data = await response.json();
      return data.embeddings[0];
    } catch (error) {
      console.error('[Retrieval] Cohere embedding error:', error);
      return null;
    }
  }

  /**
   * Get embedding from local model
   * Placeholder for local embedding (e.g., Stella-en-v5)
   */
  private async getLocalEmbedding(text: string): Promise<number[] | null> {
    // Local embedding would require a local model server
    // For now, return null
    console.warn('[Retrieval] Local embedding not yet implemented');
    return null;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Build filter parameters from SearchFilters
   */
  private buildFilterParams(filters: SearchFilters): Record<string, unknown> {
    return {
      brainTypes: filters.brainTypes,
      memoryTypes: filters.memoryTypes,
      tags: filters.tags,
      projectId: filters.projectId,
      dateFrom: filters.dateRange?.from?.toISOString(),
      dateTo: filters.dateRange?.to?.toISOString(),
      minImportance: filters.minImportance,
      verified: filters.verified,
    };
  }

  /**
   * Apply filters to a Supabase query
   * Uses generic type to preserve query builder chain
   */
  private applyFilters<T>(
    query: T,
    params: Record<string, unknown>
  ): T {
    // Note: This uses Supabase query builder's chaining
    // Type is complex due to Supabase's builder pattern
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result = query as any;

    if (params.brainTypes && Array.isArray(params.brainTypes) && params.brainTypes.length > 0) {
      result = result.in('brain_type', params.brainTypes);
    }

    if (params.memoryTypes && Array.isArray(params.memoryTypes) && params.memoryTypes.length > 0) {
      result = result.in('memory_type', params.memoryTypes);
    }

    if (params.tags && Array.isArray(params.tags) && params.tags.length > 0) {
      result = result.overlaps('tags', params.tags);
    }

    if (params.projectId) {
      result = result.eq('project_id', params.projectId);
    }

    if (params.dateFrom) {
      result = result.gte('created_at', params.dateFrom);
    }

    if (params.dateTo) {
      result = result.lte('created_at', params.dateTo);
    }

    if (params.minImportance !== undefined) {
      result = result.gte('importance', params.minImportance);
    }

    if (params.verified !== undefined) {
      result = result.eq('verified', params.verified);
    }

    return result;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

// Export singleton instance
export const retrievalManager = new RetrievalManager();
