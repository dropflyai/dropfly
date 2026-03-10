/**
 * X2000 Documentation System - AI-Powered Search
 * Implements hybrid keyword + vector search for documentation
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  DocChunk,
  SearchIndex,
  DocSearchResult,
  DocSearchOptions,
  DocSearchResponse,
  DocPage,
  DocSection,
  GeneratedPage,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;
const DEFAULT_HIGHLIGHT_LENGTH = 150;

// Stop words for keyword search
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
  'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
  'that', 'the', 'to', 'was', 'were', 'will', 'with',
]);

// ============================================================================
// Text Processing Utilities
// ============================================================================

/**
 * Tokenize text into words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Calculate term frequency
 */
function termFrequency(term: string, tokens: string[]): number {
  const count = tokens.filter(t => t === term).length;
  return count / tokens.length;
}

/**
 * Calculate inverse document frequency
 */
function inverseDocFrequency(term: string, documents: string[][]): number {
  const containingDocs = documents.filter(doc => doc.includes(term)).length;
  if (containingDocs === 0) return 0;
  return Math.log(documents.length / containingDocs);
}

/**
 * Calculate BM25 score
 */
function bm25Score(
  queryTokens: string[],
  docTokens: string[],
  avgDocLength: number,
  k1 = 1.5,
  b = 0.75
): number {
  let score = 0;
  const docLength = docTokens.length;

  for (const term of queryTokens) {
    const tf = termFrequency(term, docTokens);
    const idf = 1; // Simplified - would need corpus for proper IDF
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
    score += idf * (numerator / denominator);
  }

  return score;
}

/**
 * Generate highlight snippet
 */
function generateHighlight(
  content: string,
  query: string,
  maxLength: number
): string {
  const queryTerms = tokenize(query);
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

  // Find the best matching sentence
  let bestSentence = sentences[0] || content.substring(0, maxLength);
  let bestScore = 0;

  for (const sentence of sentences) {
    const sentenceTokens = tokenize(sentence);
    let score = 0;
    for (const term of queryTerms) {
      if (sentenceTokens.includes(term)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }

  // Truncate if needed
  if (bestSentence.length > maxLength) {
    bestSentence = bestSentence.substring(0, maxLength - 3) + '...';
  }

  // Highlight matching terms
  for (const term of queryTerms) {
    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
    bestSentence = bestSentence.replace(regex, '**$1**');
  }

  return bestSentence;
}

// ============================================================================
// Search Index Builder
// ============================================================================

export class SearchIndexBuilder {
  private chunks: DocChunk[] = [];
  private chunkSize: number;
  private chunkOverlap: number;
  private version: string;

  constructor(options: {
    chunkSize?: number;
    chunkOverlap?: number;
    version: string;
  }) {
    this.chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
    this.chunkOverlap = options.chunkOverlap || DEFAULT_CHUNK_OVERLAP;
    this.version = options.version;
  }

  /**
   * Add a page to the index
   */
  addPage(page: GeneratedPage): void {
    // Add page-level chunk
    this.chunks.push({
      id: uuidv4(),
      pageId: page.slug,
      path: page.path,
      title: page.frontmatter.title,
      section: '',
      sectionAnchor: '',
      content: this.extractPlainText(page.content),
      type: 'page',
      category: page.frontmatter.category,
      tags: page.frontmatter.tags,
      version: this.version,
      importance: 1.0,
    });

    // Extract and add sections
    const sections = this.extractSections(page.content);
    for (const section of sections) {
      // Split large sections into chunks
      const sectionChunks = this.chunkText(section.content);
      for (let i = 0; i < sectionChunks.length; i++) {
        this.chunks.push({
          id: uuidv4(),
          pageId: page.slug,
          path: page.path,
          title: page.frontmatter.title,
          section: section.title,
          sectionAnchor: section.anchor,
          content: sectionChunks[i],
          type: 'section',
          category: page.frontmatter.category,
          tags: page.frontmatter.tags,
          version: this.version,
          importance: section.level <= 2 ? 0.9 : 0.7,
        });
      }
    }

    // Extract and add code examples
    const codeBlocks = this.extractCodeBlocks(page.content);
    for (const block of codeBlocks) {
      this.chunks.push({
        id: uuidv4(),
        pageId: page.slug,
        path: page.path,
        title: page.frontmatter.title,
        section: block.title || 'Code Example',
        sectionAnchor: '',
        content: block.code,
        type: 'example',
        category: page.frontmatter.category,
        tags: [...(page.frontmatter.tags || []), block.language],
        version: this.version,
        importance: 0.6,
      });
    }
  }

  /**
   * Add API reference to the index
   */
  addApiReference(
    name: string,
    description: string,
    signature: string,
    path: string,
    tags?: string[]
  ): void {
    this.chunks.push({
      id: uuidv4(),
      pageId: path,
      path,
      title: name,
      section: 'API Reference',
      sectionAnchor: '',
      content: `${name}\n\n${description}\n\n${signature}`,
      type: 'api',
      category: 'API',
      tags,
      version: this.version,
      importance: 0.85,
    });
  }

  /**
   * Build the final search index
   */
  build(): SearchIndex {
    const categories = [...new Set(this.chunks.map(c => c.category).filter(Boolean))];
    const tags = [...new Set(this.chunks.flatMap(c => c.tags || []))];
    const pageIds = [...new Set(this.chunks.map(c => c.pageId))];

    return {
      id: `index-${Date.now()}`,
      version: this.version,
      createdAt: new Date(),
      updatedAt: new Date(),
      chunks: this.chunks,
      totalChunks: this.chunks.length,
      totalPages: pageIds.length,
      categories: categories as string[],
      tags,
    };
  }

  /**
   * Extract sections from MDX content
   */
  private extractSections(content: string): Array<{
    title: string;
    anchor: string;
    content: string;
    level: number;
  }> {
    const sections: Array<{
      title: string;
      anchor: string;
      content: string;
      level: number;
    }> = [];

    const lines = content.split('\n');
    let currentSection: { title: string; anchor: string; content: string; level: number } | null = null;

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        const level = headingMatch[1].length;
        const title = headingMatch[2];
        const anchor = title.toLowerCase().replace(/[^\w]+/g, '-');
        currentSection = { title, anchor, content: '', level };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Extract code blocks from content
   */
  private extractCodeBlocks(content: string): Array<{
    language: string;
    code: string;
    title?: string;
  }> {
    const blocks: Array<{ language: string; code: string; title?: string }> = [];
    const pattern = /```(\w+)?(?:\s+title="([^"]+)")?\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        title: match[2],
        code: match[3].trim(),
      });
    }

    return blocks;
  }

  /**
   * Extract plain text from MDX content
   */
  private extractPlainText(content: string): string {
    return content
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]+`/g, '')
      // Remove MDX components
      .replace(/<[^>]+>/g, '')
      // Remove markdown links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown formatting
      .replace(/[*_~]+/g, '')
      // Remove headings markers
      .replace(/^#{1,6}\s+/gm, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Chunk text into smaller pieces with overlap
   */
  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    const words = text.split(/\s+/);

    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + this.chunkSize, words.length);
      chunks.push(words.slice(start, end).join(' '));
      start += this.chunkSize - this.chunkOverlap;
    }

    return chunks.length > 0 ? chunks : [text];
  }
}

// ============================================================================
// Doc Search Engine
// ============================================================================

export class DocSearchEngine {
  private index: SearchIndex | null = null;
  private tokenizedDocs: Map<string, string[]> = new Map();
  private avgDocLength = 0;
  private embeddingProvider: 'openai' | 'local' | 'none' = 'none';
  private embeddings: Map<string, number[]> = new Map();

  /**
   * Load a search index
   */
  loadIndex(index: SearchIndex): void {
    this.index = index;
    this.buildTokenIndex();
  }

  /**
   * Enable semantic search with embeddings
   */
  async enableSemanticSearch(
    provider: 'openai' | 'local',
    options?: { apiKey?: string; model?: string }
  ): Promise<void> {
    this.embeddingProvider = provider;

    if (provider === 'openai' && !options?.apiKey) {
      console.warn('[DocSearch] OpenAI API key not provided, semantic search disabled');
      this.embeddingProvider = 'none';
      return;
    }

    // Generate embeddings for all chunks
    if (this.index) {
      console.log('[DocSearch] Generating embeddings for', this.index.chunks.length, 'chunks');
      for (const chunk of this.index.chunks) {
        if (!chunk.embedding) {
          chunk.embedding = await this.generateEmbedding(chunk.content, options);
        }
        this.embeddings.set(chunk.id, chunk.embedding);
      }
      console.log('[DocSearch] Embedding generation complete');
    }
  }

  /**
   * Search the documentation
   */
  async search(options: DocSearchOptions): Promise<DocSearchResponse> {
    const startTime = Date.now();
    const queryProcessingStart = Date.now();

    if (!this.index) {
      return {
        query: options.query,
        results: [],
        totalResults: 0,
        page: 1,
        pageSize: options.limit || 10,
        totalPages: 0,
        timing: {
          queryProcessing: 0,
          search: 0,
          total: 0,
        },
      };
    }

    const query = options.query.trim();
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const highlightLength = options.highlightLength || DEFAULT_HIGHLIGHT_LENGTH;

    // Tokenize query
    const queryTokens = tokenize(query);
    const queryProcessingTime = Date.now() - queryProcessingStart;

    const searchStart = Date.now();

    // Filter chunks
    let candidates = this.index.chunks;

    // Apply filters
    if (options.version) {
      candidates = candidates.filter(c => c.version === options.version);
    }
    if (options.categories && options.categories.length > 0) {
      candidates = candidates.filter(c => c.category && options.categories!.includes(c.category));
    }
    if (options.tags && options.tags.length > 0) {
      candidates = candidates.filter(c =>
        c.tags && c.tags.some(t => options.tags!.includes(t))
      );
    }
    if (options.types && options.types.length > 0) {
      candidates = candidates.filter(c => options.types!.includes(c.type));
    }

    // Score candidates
    const scoredResults: Array<{
      chunk: DocChunk;
      keywordScore: number;
      semanticScore: number;
      totalScore: number;
    }> = [];

    // Get query embedding for semantic search
    let queryEmbedding: number[] | null = null;
    if (options.semanticSearch && this.embeddingProvider !== 'none') {
      queryEmbedding = await this.generateEmbedding(query);
    }

    for (const chunk of candidates) {
      const docTokens = this.tokenizedDocs.get(chunk.id) || tokenize(chunk.content);

      // Keyword score (BM25)
      const keywordScore = bm25Score(queryTokens, docTokens, this.avgDocLength);

      // Semantic score (cosine similarity)
      let semanticScore = 0;
      if (queryEmbedding && chunk.embedding) {
        semanticScore = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      }

      // Combined score with importance weighting
      const totalScore = (
        (keywordScore * 0.6 + semanticScore * 0.4) * chunk.importance
      );

      if (totalScore > 0) {
        scoredResults.push({
          chunk,
          keywordScore,
          semanticScore,
          totalScore,
        });
      }
    }

    // Sort by total score
    scoredResults.sort((a, b) => b.totalScore - a.totalScore);

    const searchTime = Date.now() - searchStart;

    // Paginate results
    const totalResults = scoredResults.length;
    const paginatedResults = scoredResults.slice(offset, offset + limit);

    // Build search results
    const results: DocSearchResult[] = paginatedResults.map(({ chunk, keywordScore, semanticScore, totalScore }) => ({
      id: uuidv4(),
      chunkId: chunk.id,
      pageId: chunk.pageId,
      path: chunk.path,
      title: chunk.title,
      section: chunk.section,
      sectionAnchor: chunk.sectionAnchor,
      content: chunk.content,
      highlight: generateHighlight(chunk.content, query, highlightLength),
      type: chunk.type,
      category: chunk.category,
      tags: chunk.tags,
      version: chunk.version,
      score: totalScore,
      keywordScore,
      semanticScore,
    }));

    const totalTime = Date.now() - startTime;

    // Generate suggestions for low/no results
    const suggestions = totalResults < 3 ? this.generateSuggestions(query) : undefined;

    return {
      query,
      results,
      totalResults,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      totalPages: Math.ceil(totalResults / limit),
      timing: {
        queryProcessing: queryProcessingTime,
        search: searchTime,
        total: totalTime,
      },
      suggestions,
    };
  }

  /**
   * Get search suggestions based on indexed content
   */
  getSuggestions(prefix: string, limit = 5): string[] {
    if (!this.index || prefix.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();
    const prefixLower = prefix.toLowerCase();

    for (const chunk of this.index.chunks) {
      // Check title
      if (chunk.title.toLowerCase().includes(prefixLower)) {
        suggestions.add(chunk.title);
      }

      // Check section
      if (chunk.section && chunk.section.toLowerCase().includes(prefixLower)) {
        suggestions.add(chunk.section);
      }

      // Check tags
      if (chunk.tags) {
        for (const tag of chunk.tags) {
          if (tag.toLowerCase().includes(prefixLower)) {
            suggestions.add(tag);
          }
        }
      }

      if (suggestions.size >= limit * 2) break;
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Build tokenized document index for efficient searching
   */
  private buildTokenIndex(): void {
    if (!this.index) return;

    let totalTokens = 0;
    for (const chunk of this.index.chunks) {
      const tokens = tokenize(chunk.content);
      this.tokenizedDocs.set(chunk.id, tokens);
      totalTokens += tokens.length;
    }

    this.avgDocLength = totalTokens / this.index.chunks.length;
  }

  /**
   * Generate embedding for text
   */
  private async generateEmbedding(
    text: string,
    options?: { apiKey?: string; model?: string }
  ): Promise<number[]> {
    if (this.embeddingProvider === 'openai' && options?.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${options.apiKey}`,
          },
          body: JSON.stringify({
            model: options.model || 'text-embedding-3-small',
            input: text.substring(0, 8000), // Truncate to max tokens
          }),
        });

        const data = await response.json();
        return data.data?.[0]?.embedding || this.localEmbedding(text);
      } catch (error) {
        console.error('[DocSearch] OpenAI embedding error:', error);
        return this.localEmbedding(text);
      }
    }

    return this.localEmbedding(text);
  }

  /**
   * Generate a simple local embedding (bag of words TF-IDF-like)
   */
  private localEmbedding(text: string): number[] {
    const tokens = tokenize(text);
    const vocab = new Map<string, number>();

    // Build vocabulary from tokens
    for (const token of tokens) {
      vocab.set(token, (vocab.get(token) || 0) + 1);
    }

    // Create a simple embedding (limited vocabulary size for efficiency)
    const embedding = new Array(256).fill(0);
    for (const [token, count] of vocab) {
      const hash = this.hashString(token) % 256;
      embedding[hash] += count / tokens.length;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Generate search suggestions for failed queries
   */
  private generateSuggestions(query: string): string[] {
    if (!this.index) return [];

    const suggestions: string[] = [];
    const queryTerms = tokenize(query);

    // Find related categories
    for (const category of this.index.categories) {
      if (queryTerms.some(term => category.toLowerCase().includes(term))) {
        suggestions.push(`Search in ${category}`);
      }
    }

    // Suggest related tags
    for (const tag of this.index.tags) {
      if (queryTerms.some(term => tag.toLowerCase().includes(term))) {
        suggestions.push(`Try: ${tag}`);
      }
    }

    // Suggest broader searches
    if (queryTerms.length > 1) {
      suggestions.push(`Try: ${queryTerms[0]}`);
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Get index statistics
   */
  getStats(): {
    totalChunks: number;
    totalPages: number;
    categories: string[];
    tags: string[];
    hasEmbeddings: boolean;
  } | null {
    if (!this.index) return null;

    return {
      totalChunks: this.index.totalChunks,
      totalPages: this.index.totalPages,
      categories: this.index.categories,
      tags: this.index.tags,
      hasEmbeddings: this.embeddingProvider !== 'none',
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const docSearchEngine = new DocSearchEngine();

/**
 * Build a search index from generated pages
 */
export function buildSearchIndex(
  pages: GeneratedPage[],
  version: string,
  options?: { chunkSize?: number; chunkOverlap?: number }
): SearchIndex {
  const builder = new SearchIndexBuilder({
    version,
    chunkSize: options?.chunkSize,
    chunkOverlap: options?.chunkOverlap,
  });

  for (const page of pages) {
    builder.addPage(page);
  }

  return builder.build();
}

/**
 * Search documentation with default engine
 */
export async function searchDocs(
  options: DocSearchOptions
): Promise<DocSearchResponse> {
  return docSearchEngine.search(options);
}
