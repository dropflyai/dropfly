/**
 * X2000 Hybrid Search System
 * Main search interface orchestrating the 4-stage pipeline:
 * 1. Query Processing
 * 2. Parallel Retrieval (BM25+, Vector, SPLADE)
 * 3. Fusion (RRF with learned weights)
 * 4. Neural Reranking
 */

import { queryProcessor, QueryProcessor } from './query-processor.js';
import { retrievalManager, RetrievalManager } from './retrieval.js';
import { fusionManager, FusionManager } from './fusion.js';
import { reranker, Reranker, createReranker } from './reranker.js';
import { learningManager, LearningManager } from './learning.js';
import type {
  SearchOptions,
  SearchResult,
  FinalResult,
  RerankedResult,
  ProcessedQuery,
  SearchFilters,
  RetrieverWeights,
  RetrieverType,
  PostProcessConfig,
  TemporalDecayConfig,
  MMRConfig,
} from './types.js';

// Re-export types
export * from './types.js';

// Re-export managers
export {
  queryProcessor,
  QueryProcessor,
  retrievalManager,
  RetrievalManager,
  fusionManager,
  FusionManager,
  reranker,
  Reranker,
  createReranker,
  learningManager,
  LearningManager,
};

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_OPTIONS: Required<SearchOptions> = {
  filters: {},
  topK: 10,
  rerank: true,
  explain: false,
  temporalDecay: false,
  temporalDecayHalfLifeDays: 30,
  mmr: false,
  mmrLambda: 0.7,
  minConfidence: 0.3,
};

// ============================================================================
// Hybrid Search Engine
// ============================================================================

export class HybridSearchEngine {
  private queryProcessor: QueryProcessor;
  private retrievalManager: RetrievalManager;
  private fusionManager: FusionManager;
  private reranker: Reranker;
  private learningManager: LearningManager;
  private isInitialized = false;

  constructor() {
    this.queryProcessor = queryProcessor;
    this.retrievalManager = retrievalManager;
    this.fusionManager = fusionManager;
    this.reranker = reranker;
    this.learningManager = learningManager;
  }

  /**
   * Initialize all search components
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    console.log('[HybridSearch] Initializing search engine...');

    // Initialize all managers in parallel
    const [retrievalOk, fusionOk, learningOk] = await Promise.all([
      this.retrievalManager.initialize(),
      this.fusionManager.initialize(),
      this.learningManager.initialize(),
    ]);

    const allOnline = retrievalOk && fusionOk;
    this.isInitialized = true;

    console.log(`[HybridSearch] Initialization complete. Online: ${allOnline}`);
    return allOnline;
  }

  /**
   * Execute a hybrid search
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const startTime = Date.now();
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const timing: SearchResult['timing'] = {
      queryProcessing: 0,
      retrieval: 0,
      fusion: 0,
      reranking: 0,
      postProcessing: 0,
      total: 0,
    };

    // Stage 1: Query Processing
    const queryStart = Date.now();
    const processedQuery = await this.queryProcessor.process(query);

    // Get embedding for vector search
    if (this.retrievalManager.isOnline()) {
      processedQuery.embedding = await this.retrievalManager.getEmbedding(processedQuery.corrected) || undefined;
    }

    timing.queryProcessing = Date.now() - queryStart;

    // Stage 2: Parallel Retrieval
    const retrievalStart = Date.now();
    const retrievalResults = await this.retrievalManager.retrieve(
      processedQuery,
      opts.filters || {},
      100 // Retrieve top 100 from each source
    );
    timing.retrieval = Date.now() - retrievalStart;

    // Stage 3: Fusion
    const fusionStart = Date.now();
    const fusedResults = this.fusionManager.fuse(
      retrievalResults,
      processedQuery,
      50 // Top 50 for reranking
    );
    timing.fusion = Date.now() - fusionStart;

    // Stage 4: Reranking
    const rerankStart = Date.now();
    let rerankedResults: RerankedResult[];

    if (opts.rerank && fusedResults.length > 0) {
      rerankedResults = await this.reranker.rerank(
        processedQuery.corrected,
        fusedResults,
        {
          topK: opts.topK * 2, // Get extra for post-filtering
          explain: opts.explain,
        }
      );
    } else {
      // No reranking - convert fused results to reranked format
      rerankedResults = fusedResults.slice(0, opts.topK * 2).map(r => ({
        ...r,
        relevanceScore: r.rrfScore,
      }));
    }
    timing.reranking = Date.now() - rerankStart;

    // Stage 5: Post-Processing
    const postProcessStart = Date.now();
    const postProcessConfig: PostProcessConfig = {
      temporalDecay: {
        enabled: opts.temporalDecay,
        halfLifeDays: opts.temporalDecayHalfLifeDays,
      },
      mmr: {
        enabled: opts.mmr,
        lambda: opts.mmrLambda,
      },
      minConfidence: opts.minConfidence,
    };

    const finalResults = this.postProcess(rerankedResults, postProcessConfig, opts.topK);
    timing.postProcessing = Date.now() - postProcessStart;

    timing.total = Date.now() - startTime;

    // Get the weights used
    const weights = this.fusionManager.getCurrentWeights(processedQuery);

    // Determine which retrievers were used
    const retrieversUsed: RetrieverType[] = [];
    if (retrievalResults.bm25.length > 0) retrieversUsed.push('bm25');
    if (retrievalResults.vector.length > 0) retrieversUsed.push('vector');
    if (retrievalResults.splade && retrievalResults.splade.length > 0) retrieversUsed.push('splade');

    // Log search event for learning
    if (finalResults.length > 0) {
      await this.learningManager.logSearchEvent(
        query,
        finalResults,
        processedQuery.embedding,
        undefined // sessionId would come from context
      );
    }

    return {
      query: processedQuery,
      results: finalResults,
      timing,
      metadata: {
        retrieversUsed,
        weights,
        candidatesRetrieved:
          retrievalResults.bm25.length +
          retrievalResults.vector.length +
          (retrievalResults.splade?.length || 0),
        candidatesFused: fusedResults.length,
        candidatesReranked: rerankedResults.length,
        finalCount: finalResults.length,
      },
    };
  }

  /**
   * Post-process results with temporal decay and MMR
   */
  private postProcess(
    results: RerankedResult[],
    config: PostProcessConfig,
    topK: number
  ): FinalResult[] {
    let processed: FinalResult[] = results.map(r => ({
      ...r,
      decayedScore: r.relevanceScore,
      diversityRank: 0,
    }));

    // Filter by minimum confidence
    processed = processed.filter(r => r.relevanceScore >= config.minConfidence);

    // Apply temporal decay
    if (config.temporalDecay.enabled) {
      processed = this.applyTemporalDecay(processed, config.temporalDecay);
    }

    // Apply MMR for diversity
    if (config.mmr.enabled) {
      processed = this.applyMMR(processed, config.mmr);
    }

    // Sort by final score and limit
    return processed
      .sort((a, b) => b.decayedScore - a.decayedScore)
      .slice(0, topK)
      .map((r, i) => ({ ...r, diversityRank: i + 1 }));
  }

  /**
   * Apply temporal decay to boost recent results
   */
  private applyTemporalDecay(
    results: FinalResult[],
    config: TemporalDecayConfig
  ): FinalResult[] {
    const halfLifeMs = config.halfLifeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return results.map(r => {
      const createdAt = r.metadata.createdAt
        ? new Date(r.metadata.createdAt).getTime()
        : now;

      const age = now - createdAt;
      const decay = Math.pow(0.5, age / halfLifeMs);

      // Apply decay: 70% relevance + 30% recency
      const decayedScore = r.relevanceScore * (0.7 + 0.3 * decay);

      return { ...r, decayedScore };
    });
  }

  /**
   * Apply Maximal Marginal Relevance for diversity
   */
  private applyMMR(results: FinalResult[], config: MMRConfig): FinalResult[] {
    const lambda = config.lambda;
    const selected: FinalResult[] = [];
    const remaining = [...results];

    while (remaining.length > 0 && selected.length < results.length) {
      let bestScore = -Infinity;
      let bestIndex = 0;

      for (let i = 0; i < remaining.length; i++) {
        const relevance = remaining[i].decayedScore;

        // Calculate diversity (1 - max similarity to selected)
        let diversity = 1;
        if (selected.length > 0) {
          const maxSim = Math.max(
            ...selected.map(s => this.contentSimilarity(remaining[i].content, s.content))
          );
          diversity = 1 - maxSim;
        }

        // MMR score
        const mmrScore = lambda * relevance + (1 - lambda) * diversity;

        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestIndex = i;
        }
      }

      selected.push({
        ...remaining[bestIndex],
        diversityRank: selected.length + 1,
      });
      remaining.splice(bestIndex, 1);
    }

    return selected;
  }

  /**
   * Simple content similarity based on word overlap
   */
  private contentSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));

    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) intersection++;
    }

    const union = wordsA.size + wordsB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  // ============================================================================
  // User Feedback
  // ============================================================================

  /**
   * Record user selection for learning
   */
  async recordSelection(
    queryId: string,
    selectedId: string,
    selectedPosition: number
  ): Promise<void> {
    await this.learningManager.recordSelection(queryId, selectedId, selectedPosition);
  }

  // ============================================================================
  // Diagnostics
  // ============================================================================

  /**
   * Get search engine status
   */
  getStatus(): {
    initialized: boolean;
    retrievalOnline: boolean;
    rerankerProvider: string;
    weights: RetrieverWeights;
  } {
    return {
      initialized: this.isInitialized,
      retrievalOnline: this.retrievalManager.isOnline(),
      rerankerProvider: this.reranker.getProvider(),
      weights: this.fusionManager.getLearnedWeights(),
    };
  }

  /**
   * Run weight optimization
   */
  async optimizeWeights(): Promise<RetrieverWeights | null> {
    return this.learningManager.updateRetrieverWeights();
  }

  /**
   * Get learning stats
   */
  async getLearningStats(): Promise<{
    totalFeedback: number;
    recentFeedback: number;
    lastWeightUpdate: Date | null;
    propensities: number[];
  }> {
    return this.learningManager.getStats();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const hybridSearchEngine = new HybridSearchEngine();

/**
 * Simple search function for convenience
 */
export async function search(
  query: string,
  options?: SearchOptions
): Promise<SearchResult> {
  if (!hybridSearchEngine['isInitialized']) {
    await hybridSearchEngine.initialize();
  }
  return hybridSearchEngine.search(query, options);
}

/**
 * Initialize the search engine
 */
export async function initializeSearch(): Promise<boolean> {
  return hybridSearchEngine.initialize();
}
