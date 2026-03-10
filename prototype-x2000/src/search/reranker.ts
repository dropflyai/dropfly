/**
 * Neural Reranking System
 * Provides two options:
 * - Cohere Rerank API (cloud)
 * - Local mxbai-rerank fallback
 */

import type {
  FusedResult,
  RerankedResult,
  RerankerConfig,
  RerankerProvider,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: RerankerConfig = {
  provider: 'none',
  topK: 10,
  minConfidence: 0.3,
};

// ============================================================================
// Reranker Implementation
// ============================================================================

export class Reranker {
  private config: RerankerConfig;

  constructor(config?: Partial<RerankerConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Auto-detect provider if not specified
    if (this.config.provider === 'none') {
      this.config.provider = this.detectProvider();
    }
  }

  /**
   * Auto-detect available reranking provider
   */
  private detectProvider(): RerankerProvider {
    // Check for Cohere API key
    if (process.env.COHERE_API_KEY) {
      return 'cohere';
    }

    // Check for local model (would need to verify model exists)
    if (this.config.localModelPath) {
      return 'local';
    }

    return 'none';
  }

  /**
   * Get the current provider
   */
  getProvider(): RerankerProvider {
    return this.config.provider;
  }

  /**
   * Rerank candidates using neural cross-encoder
   */
  async rerank(
    query: string,
    candidates: FusedResult[],
    options?: {
      topK?: number;
      explain?: boolean;
    }
  ): Promise<RerankedResult[]> {
    const topK = options?.topK ?? this.config.topK;
    const explain = options?.explain ?? false;

    switch (this.config.provider) {
      case 'cohere':
        return this.cohereRerank(query, candidates, topK, explain);

      case 'local':
        return this.localRerank(query, candidates, topK, explain);

      case 'none':
      default:
        return this.noRerank(candidates, topK);
    }
  }

  // ============================================================================
  // Cohere Rerank
  // ============================================================================

  /**
   * Rerank using Cohere Rerank API
   */
  private async cohereRerank(
    query: string,
    candidates: FusedResult[],
    topK: number,
    explain: boolean
  ): Promise<RerankedResult[]> {
    const apiKey = process.env.COHERE_API_KEY || this.config.cohereApiKey;

    if (!apiKey) {
      console.warn('[Reranker] COHERE_API_KEY not set, falling back to no reranking');
      return this.noRerank(candidates, topK);
    }

    try {
      const response = await fetch('https://api.cohere.ai/v1/rerank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'rerank-english-v3.0',
          query,
          documents: candidates.map(c => c.content),
          top_n: topK,
          return_documents: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cohere API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Map results back to our format
      const rerankedResults: RerankedResult[] = data.results.map((result: {
        index: number;
        relevance_score: number;
      }) => {
        const candidate = candidates[result.index];
        return {
          ...candidate,
          relevanceScore: result.relevance_score,
          explanation: explain
            ? `Cohere relevance: ${(result.relevance_score * 100).toFixed(1)}%`
            : undefined,
        };
      });

      // Filter by minimum confidence
      return rerankedResults.filter(r => r.relevanceScore >= this.config.minConfidence);
    } catch (error) {
      console.error('[Reranker] Cohere rerank failed:', error);
      return this.noRerank(candidates, topK);
    }
  }

  // ============================================================================
  // Local Rerank
  // ============================================================================

  /**
   * Rerank using local mxbai-rerank model
   * Note: This requires a local inference server
   */
  private async localRerank(
    query: string,
    candidates: FusedResult[],
    topK: number,
    explain: boolean
  ): Promise<RerankedResult[]> {
    const modelPath = this.config.localModelPath;

    if (!modelPath) {
      console.warn('[Reranker] Local model path not configured, falling back to no reranking');
      return this.noRerank(candidates, topK);
    }

    try {
      // Assuming a local server running at localhost:8080
      // This would need to be configured based on actual deployment
      const response = await fetch('http://localhost:8080/rerank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          documents: candidates.map(c => c.content),
          top_k: topK,
        }),
      });

      if (!response.ok) {
        throw new Error(`Local reranker error: ${response.status}`);
      }

      const data = await response.json();

      // Map results back to our format
      const rerankedResults: RerankedResult[] = data.results.map((result: {
        index: number;
        score: number;
      }) => {
        const candidate = candidates[result.index];
        return {
          ...candidate,
          relevanceScore: result.score,
          explanation: explain
            ? `Local model relevance: ${(result.score * 100).toFixed(1)}%`
            : undefined,
        };
      });

      // Filter by minimum confidence
      return rerankedResults.filter(r => r.relevanceScore >= this.config.minConfidence);
    } catch (error) {
      console.error('[Reranker] Local rerank failed:', error);
      return this.noRerank(candidates, topK);
    }
  }

  // ============================================================================
  // No Rerank (Fallback)
  // ============================================================================

  /**
   * No reranking - use RRF scores directly
   */
  private noRerank(candidates: FusedResult[], topK: number): RerankedResult[] {
    // Normalize RRF scores to 0-1 range for use as relevance scores
    const maxScore = Math.max(...candidates.map(c => c.rrfScore));
    const minScore = Math.min(...candidates.map(c => c.rrfScore));
    const scoreRange = maxScore - minScore || 1;

    return candidates
      .slice(0, topK)
      .map(candidate => ({
        ...candidate,
        relevanceScore: (candidate.rrfScore - minScore) / scoreRange,
      }))
      .filter(r => r.relevanceScore >= this.config.minConfidence);
  }

  // ============================================================================
  // Batch Reranking
  // ============================================================================

  /**
   * Batch rerank multiple queries (more efficient for Cohere API)
   */
  async batchRerank(
    queries: string[],
    candidateSets: FusedResult[][],
    options?: {
      topK?: number;
    }
  ): Promise<RerankedResult[][]> {
    if (queries.length !== candidateSets.length) {
      throw new Error('Queries and candidate sets must have same length');
    }

    // For now, rerank each query individually
    // Could be optimized with batch API calls if supported
    const results = await Promise.all(
      queries.map((query, i) => this.rerank(query, candidateSets[i], options))
    );

    return results;
  }

  // ============================================================================
  // Confidence Calibration
  // ============================================================================

  /**
   * Calibrate relevance scores to be more interpretable
   * Uses Platt scaling approximation
   */
  calibrateScores(results: RerankedResult[]): RerankedResult[] {
    if (results.length === 0) {
      return results;
    }

    // Calculate mean and std of scores
    const scores = results.map(r => r.relevanceScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const std = Math.sqrt(variance) || 1;

    // Apply sigmoid calibration
    return results.map(result => {
      const zScore = (result.relevanceScore - mean) / std;
      const calibrated = 1 / (1 + Math.exp(-zScore));

      return {
        ...result,
        relevanceScore: calibrated,
      };
    });
  }

  // ============================================================================
  // Explanation Generation
  // ============================================================================

  /**
   * Generate explanations for why a result is relevant
   */
  generateExplanation(
    query: string,
    result: RerankedResult
  ): string {
    const explanationParts: string[] = [];

    // Relevance score
    explanationParts.push(
      `Relevance: ${(result.relevanceScore * 100).toFixed(1)}%`
    );

    // Source contributions
    const sourceInfo = result.sources
      .map(s => `${s.retriever} (rank ${s.rank})`)
      .join(', ');
    explanationParts.push(`Found via: ${sourceInfo}`);

    // Metadata info
    if (result.metadata.brainType) {
      explanationParts.push(`Brain: ${result.metadata.brainType}`);
    }

    if (result.metadata.memoryType) {
      explanationParts.push(`Type: ${result.metadata.memoryType}`);
    }

    if (result.metadata.tags && result.metadata.tags.length > 0) {
      explanationParts.push(`Tags: ${result.metadata.tags.join(', ')}`);
    }

    return explanationParts.join(' | ');
  }
}

// Export singleton with auto-detection
export const reranker = new Reranker();

// Export factory for custom configuration
export function createReranker(config: Partial<RerankerConfig>): Reranker {
  return new Reranker(config);
}
