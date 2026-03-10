/**
 * Result Fusion System
 * Implements Reciprocal Rank Fusion (RRF) with:
 * - Query-adaptive weights
 * - Learned weight optimization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/env.js';
import type {
  ProcessedQuery,
  QueryType,
  RetrievalResult,
  ParallelRetrievalResults,
  FusedResult,
  FusionSource,
  RetrieverWeights,
  DatabaseRetrieverWeights,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

/**
 * RRF constant (k = 60 is experimentally optimal)
 * Higher k reduces the impact of high-ranking documents
 */
const RRF_K = 60;

/**
 * Default retriever weights
 */
const DEFAULT_WEIGHTS: RetrieverWeights = {
  bm25: 1.0,
  vector: 1.0,
  splade: 1.0,
};

/**
 * Query-adaptive weight adjustments by query type
 */
const QUERY_ADAPTIVE_WEIGHTS: Record<QueryType, RetrieverWeights> = {
  keyword: {
    bm25: 1.5,    // Boost BM25 for exact match queries
    vector: 0.8,
    splade: 1.0,
  },
  semantic: {
    bm25: 0.8,
    vector: 1.5,  // Boost vector for natural language
    splade: 1.2,
  },
  hybrid: {
    bm25: 1.0,    // Balanced weights
    vector: 1.0,
    splade: 1.0,
  },
};

// ============================================================================
// Fusion Manager
// ============================================================================

export class FusionManager {
  private client: SupabaseClient | null = null;
  private learnedWeights: RetrieverWeights | null = null;
  private lastWeightsFetch: Date | null = null;
  private weightsCacheTTL = 3600000; // 1 hour cache

  // Table for learned weights
  private readonly WEIGHTS_TABLE = 'retriever_weights';

  /**
   * Initialize the fusion manager
   */
  async initialize(): Promise<boolean> {
    const supabaseConfig = getSupabaseConfig();

    if (!supabaseConfig) {
      console.log('[Fusion] Supabase not configured - using default weights');
      return false;
    }

    try {
      this.client = createClient(supabaseConfig.url, supabaseConfig.key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      // Load learned weights
      await this.loadLearnedWeights();

      console.log('[Fusion] Connected to Supabase');
      return true;
    } catch (error) {
      console.error('[Fusion] Failed to connect:', error);
      return false;
    }
  }

  /**
   * Fuse results from multiple retrievers using RRF
   */
  fuse(
    results: ParallelRetrievalResults,
    query: ProcessedQuery,
    topK: number = 50
  ): FusedResult[] {
    // Compute final weights
    const weights = this.computeFinalWeights(query);

    // Perform RRF fusion
    return this.reciprocalRankFusion(results, weights, topK);
  }

  /**
   * Perform Reciprocal Rank Fusion
   */
  reciprocalRankFusion(
    results: ParallelRetrievalResults,
    weights: RetrieverWeights,
    topK: number
  ): FusedResult[] {
    const documentScores = new Map<string, {
      result: FusedResult;
      score: number;
    }>();

    // Process each retriever's results
    const retrievers: Array<{
      name: keyof ParallelRetrievalResults;
      results: RetrievalResult[];
      weight: number;
    }> = [
      { name: 'bm25', results: results.bm25, weight: weights.bm25 },
      { name: 'vector', results: results.vector, weight: weights.vector },
      { name: 'splade', results: results.splade || [], weight: weights.splade },
    ];

    for (const { name, results: retrieverResults, weight } of retrievers) {
      retrieverResults.forEach((result, rank) => {
        // RRF formula: weight / (k + rank + 1)
        const rrfContribution = weight / (RRF_K + rank + 1);

        if (documentScores.has(result.id)) {
          // Update existing document
          const existing = documentScores.get(result.id)!;
          existing.score += rrfContribution;
          existing.result.sources.push({
            retriever: name as FusionSource['retriever'],
            rank: rank + 1,
            score: result.score,
          });
        } else {
          // Create new document entry
          const fusedResult: FusedResult = {
            id: result.id,
            content: result.content,
            rrfScore: rrfContribution,
            sources: [{
              retriever: name as FusionSource['retriever'],
              rank: rank + 1,
              score: result.score,
            }],
            metadata: result.metadata,
          };

          documentScores.set(result.id, {
            result: fusedResult,
            score: rrfContribution,
          });
        }
      });
    }

    // Update RRF scores in results
    for (const entry of documentScores.values()) {
      entry.result.rrfScore = entry.score;
    }

    // Sort by RRF score and return top-K
    return Array.from(documentScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(entry => entry.result);
  }

  /**
   * Compute final weights combining learned and query-adaptive weights
   */
  computeFinalWeights(query: ProcessedQuery): RetrieverWeights {
    // Get query-adaptive weights based on query type
    const adaptiveWeights = this.getQueryAdaptiveWeights(query);

    // Get learned weights (cached or default)
    const learned = this.learnedWeights || DEFAULT_WEIGHTS;

    // Combine: 70% learned, 30% query-adaptive
    const LEARNED_WEIGHT = 0.7;
    const ADAPTIVE_WEIGHT = 0.3;

    return {
      bm25: LEARNED_WEIGHT * learned.bm25 + ADAPTIVE_WEIGHT * adaptiveWeights.bm25,
      vector: LEARNED_WEIGHT * learned.vector + ADAPTIVE_WEIGHT * adaptiveWeights.vector,
      splade: LEARNED_WEIGHT * learned.splade + ADAPTIVE_WEIGHT * adaptiveWeights.splade,
    };
  }

  /**
   * Get query-adaptive weights based on query characteristics
   */
  getQueryAdaptiveWeights(query: ProcessedQuery): RetrieverWeights {
    return QUERY_ADAPTIVE_WEIGHTS[query.queryType] || DEFAULT_WEIGHTS;
  }

  /**
   * Get the current effective weights (for diagnostics)
   */
  getCurrentWeights(query: ProcessedQuery): RetrieverWeights {
    return this.computeFinalWeights(query);
  }

  // ============================================================================
  // Learned Weights Management
  // ============================================================================

  /**
   * Load learned weights from database
   */
  async loadLearnedWeights(): Promise<void> {
    if (!this.client) {
      return;
    }

    // Check cache
    if (
      this.learnedWeights &&
      this.lastWeightsFetch &&
      Date.now() - this.lastWeightsFetch.getTime() < this.weightsCacheTTL
    ) {
      return;
    }

    try {
      const { data, error } = await this.client
        .from(this.WEIGHTS_TABLE)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          console.error('[Fusion] Failed to load learned weights:', error);
        }
        return;
      }

      const dbWeights = data as DatabaseRetrieverWeights;
      this.learnedWeights = {
        bm25: dbWeights.bm25_weight,
        vector: dbWeights.vector_weight,
        splade: dbWeights.splade_weight,
      };
      this.lastWeightsFetch = new Date();

      console.log('[Fusion] Loaded learned weights:', this.learnedWeights);
    } catch (error) {
      console.error('[Fusion] Error loading weights:', error);
    }
  }

  /**
   * Save new learned weights to database
   */
  async saveLearnedWeights(
    weights: RetrieverWeights,
    metrics?: { ndcg?: number; mrr?: number }
  ): Promise<boolean> {
    if (!this.client) {
      console.warn('[Fusion] Cannot save weights - not connected');
      return false;
    }

    try {
      const { error } = await this.client.from(this.WEIGHTS_TABLE).insert({
        bm25_weight: weights.bm25,
        vector_weight: weights.vector,
        splade_weight: weights.splade,
        updated_at: new Date().toISOString(),
        metrics: metrics || null,
      });

      if (error) {
        throw error;
      }

      // Update cache
      this.learnedWeights = weights;
      this.lastWeightsFetch = new Date();

      console.log('[Fusion] Saved new learned weights:', weights);
      return true;
    } catch (error) {
      console.error('[Fusion] Failed to save weights:', error);
      return false;
    }
  }

  /**
   * Get the current learned weights
   */
  getLearnedWeights(): RetrieverWeights {
    return this.learnedWeights || DEFAULT_WEIGHTS;
  }

  // ============================================================================
  // Analysis Helpers
  // ============================================================================

  /**
   * Analyze fusion results for diagnostics
   */
  analyzeFusionResults(fusedResults: FusedResult[]): {
    totalDocuments: number;
    singleSourceDocs: number;
    multiSourceDocs: number;
    averageSources: number;
    sourceDistribution: Record<string, number>;
    averageRRFScore: number;
  } {
    const sourceDistribution: Record<string, number> = {
      bm25: 0,
      vector: 0,
      splade: 0,
    };

    let totalSources = 0;
    let singleSourceDocs = 0;
    let multiSourceDocs = 0;
    let totalRRFScore = 0;

    for (const result of fusedResults) {
      totalRRFScore += result.rrfScore;
      totalSources += result.sources.length;

      if (result.sources.length === 1) {
        singleSourceDocs++;
      } else {
        multiSourceDocs++;
      }

      for (const source of result.sources) {
        sourceDistribution[source.retriever]++;
      }
    }

    return {
      totalDocuments: fusedResults.length,
      singleSourceDocs,
      multiSourceDocs,
      averageSources: fusedResults.length > 0 ? totalSources / fusedResults.length : 0,
      sourceDistribution,
      averageRRFScore: fusedResults.length > 0 ? totalRRFScore / fusedResults.length : 0,
    };
  }

  /**
   * Get contribution breakdown for a specific result
   */
  getContributionBreakdown(result: FusedResult, weights: RetrieverWeights): {
    retriever: string;
    contribution: number;
    percentage: number;
  }[] {
    const contributions = result.sources.map(source => {
      const weight = weights[source.retriever as keyof RetrieverWeights];
      const contribution = weight / (RRF_K + source.rank);
      return {
        retriever: source.retriever,
        contribution,
        percentage: 0, // Will be calculated after
      };
    });

    const totalContribution = contributions.reduce((sum, c) => sum + c.contribution, 0);

    return contributions.map(c => ({
      ...c,
      percentage: totalContribution > 0 ? (c.contribution / totalContribution) * 100 : 0,
    }));
  }
}

// Export singleton instance
export const fusionManager = new FusionManager();
