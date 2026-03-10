/**
 * X2000 Web Search - Semantic Re-ranker
 *
 * Improves search result relevance through:
 * - Cohere Rerank API integration
 * - Local TF-IDF fallback scoring
 * - Confidence thresholds
 */

// ============================================================================
// Types
// ============================================================================

export interface RerankerConfig {
  /** Reranking provider */
  provider: 'cohere' | 'local';
  /** Cohere API key */
  apiKey?: string;
  /** Cohere model to use */
  model?: string;
  /** Number of top results to return */
  topK?: number;
  /** Minimum confidence threshold (0-1) */
  confidenceThreshold?: number;
}

export interface RerankableResult {
  title: string;
  description: string;
  url: string;
  relevanceScore?: number;
  [key: string]: unknown;
}

export interface RerankResult<T extends RerankableResult> {
  results: T[];
  provider: 'cohere' | 'local';
  durationMs: number;
  originalCount: number;
  returnedCount: number;
}

interface CohereRerankResponse {
  results: Array<{
    index: number;
    relevance_score: number;
  }>;
}

// ============================================================================
// Constants
// ============================================================================

const COHERE_RERANK_URL = 'https://api.cohere.ai/v1/rerank';
const DEFAULT_MODEL = 'rerank-english-v3.0';
const DEFAULT_TOP_K = 10;
const DEFAULT_CONFIDENCE_THRESHOLD = 0.0;

// Common English stop words for TF-IDF
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this',
  'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
]);

// ============================================================================
// Semantic Re-ranker Class
// ============================================================================

export class SemanticReranker {
  private config: RerankerConfig;

  constructor(config: Partial<RerankerConfig> = {}) {
    this.config = {
      provider: config.apiKey ? 'cohere' : 'local',
      topK: DEFAULT_TOP_K,
      confidenceThreshold: DEFAULT_CONFIDENCE_THRESHOLD,
      model: DEFAULT_MODEL,
      ...config,
    };
  }

  /**
   * Configure the reranker
   */
  configure(config: Partial<RerankerConfig>): void {
    this.config = { ...this.config, ...config };
    // Auto-switch to Cohere if API key provided
    if (config.apiKey && !config.provider) {
      this.config.provider = 'cohere';
    }
  }

  /**
   * Re-rank search results based on query relevance
   */
  async rerank<T extends RerankableResult>(
    query: string,
    results: T[],
    options: Partial<RerankerConfig> = {}
  ): Promise<RerankResult<T>> {
    const startTime = Date.now();
    const topK = options.topK ?? this.config.topK ?? DEFAULT_TOP_K;
    const threshold = options.confidenceThreshold ?? this.config.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;

    if (results.length <= 1) {
      return {
        results: results.map((r) => ({ ...r, relevanceScore: 1.0 })),
        provider: 'local',
        durationMs: Date.now() - startTime,
        originalCount: results.length,
        returnedCount: results.length,
      };
    }

    const provider = options.provider ?? this.config.provider;
    let rerankedResults: T[];

    if (provider === 'cohere' && this.config.apiKey) {
      try {
        rerankedResults = await this.rerankWithCohere(query, results, topK);
      } catch (error) {
        console.warn('[SemanticReranker] Cohere API failed, falling back to local:', error);
        rerankedResults = this.rerankLocal(query, results, topK);
      }
    } else {
      rerankedResults = this.rerankLocal(query, results, topK);
    }

    // Apply confidence threshold
    const filteredResults = rerankedResults.filter(
      (r) => (r.relevanceScore ?? 0) >= threshold
    );

    return {
      results: filteredResults,
      provider: provider === 'cohere' && this.config.apiKey ? 'cohere' : 'local',
      durationMs: Date.now() - startTime,
      originalCount: results.length,
      returnedCount: filteredResults.length,
    };
  }

  /**
   * Re-rank using Cohere Rerank API
   */
  private async rerankWithCohere<T extends RerankableResult>(
    query: string,
    results: T[],
    topK: number
  ): Promise<T[]> {
    const documents = results.map((r) => `${r.title}\n${r.description}`);

    const response = await fetch(COHERE_RERANK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        documents,
        top_n: Math.min(topK, results.length),
        model: this.config.model ?? DEFAULT_MODEL,
        return_documents: false,
      }),
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cohere API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as CohereRerankResponse;

    return data.results.map((r) => ({
      ...results[r.index],
      relevanceScore: r.relevance_score,
    }));
  }

  /**
   * Re-rank using local TF-IDF scoring
   */
  private rerankLocal<T extends RerankableResult>(
    query: string,
    results: T[],
    topK: number
  ): T[] {
    const queryTerms = this.tokenize(query.toLowerCase());
    const queryTermSet = new Set(queryTerms);

    // Calculate IDF for query terms across all documents
    const documentFrequency = new Map<string, number>();
    for (const result of results) {
      const text = `${result.title} ${result.description}`.toLowerCase();
      const textTerms = new Set(this.tokenize(text));
      for (const term of queryTermSet) {
        if (textTerms.has(term)) {
          documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
        }
      }
    }

    const scored = results.map((result) => {
      const text = `${result.title} ${result.description}`.toLowerCase();
      const textTerms = this.tokenize(text);
      const textTermCounts = new Map<string, number>();

      for (const term of textTerms) {
        textTermCounts.set(term, (textTermCounts.get(term) || 0) + 1);
      }

      // Calculate TF-IDF score
      let score = 0;
      for (const queryTerm of queryTerms) {
        const tf = (textTermCounts.get(queryTerm) || 0) / Math.max(textTerms.length, 1);
        const df = documentFrequency.get(queryTerm) || 0;
        const idf = df > 0 ? Math.log(results.length / df) : 0;
        score += tf * idf;
      }

      // Boost for title matches
      const titleTerms = new Set(this.tokenize(result.title.toLowerCase()));
      const titleMatches = queryTerms.filter((t) => titleTerms.has(t)).length;
      score += titleMatches * 0.5;

      // Boost for exact phrase matches
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      if (lowerText.includes(lowerQuery)) {
        score += 1.0;
      }

      // Normalize score to 0-1 range (approximate)
      const normalizedScore = Math.min(score / (queryTerms.length + 1), 1.0);

      return { ...result, relevanceScore: normalizedScore };
    });

    return scored
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
      .slice(0, topK);
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .split(/\W+/)
      .filter((w) => w.length > 2)
      .filter((w) => !STOP_WORDS.has(w));
  }

  /**
   * Check if Cohere API is available
   */
  isCohereAvailable(): boolean {
    return !!(this.config.apiKey && this.config.provider === 'cohere');
  }

  /**
   * Get current provider
   */
  getProvider(): 'cohere' | 'local' {
    return this.isCohereAvailable() ? 'cohere' : 'local';
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const semanticReranker = new SemanticReranker();

export function createSemanticReranker(config?: Partial<RerankerConfig>): SemanticReranker {
  return new SemanticReranker(config);
}
