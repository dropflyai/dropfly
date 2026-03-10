/**
 * Query Processor
 * Handles query processing pipeline:
 * - Spell correction
 * - Entity extraction
 * - Synonym expansion
 * - Query type detection
 */

import type { BrainType } from '../types/index.js';
import type {
  ProcessedQuery,
  Entity,
  QueryType,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

/**
 * Common synonyms for query expansion
 */
const SYNONYM_MAP: Record<string, string[]> = {
  // General terms
  error: ['bug', 'issue', 'problem', 'failure', 'exception'],
  fix: ['repair', 'resolve', 'solve', 'patch', 'correct'],
  create: ['make', 'build', 'generate', 'add', 'new'],
  delete: ['remove', 'drop', 'destroy', 'clear', 'erase'],
  update: ['modify', 'change', 'edit', 'revise', 'alter'],
  find: ['search', 'locate', 'lookup', 'get', 'retrieve'],

  // Technical terms
  api: ['endpoint', 'interface', 'service', 'rest'],
  database: ['db', 'datastore', 'storage', 'persistence'],
  authentication: ['auth', 'login', 'signin', 'credentials'],
  performance: ['speed', 'latency', 'optimization', 'efficiency'],
  deployment: ['deploy', 'release', 'publish', 'ship'],
  testing: ['test', 'spec', 'unit', 'integration'],

  // X2000 specific
  brain: ['agent', 'specialist'],
  pattern: ['template', 'solution'],
  learning: ['insight', 'knowledge'],
  memory: ['history', 'context'],
};

/**
 * Brain name aliases
 */
const BRAIN_ALIASES: Record<string, BrainType> = {
  ceo: 'ceo',
  chief: 'ceo',
  orchestrator: 'ceo',
  eng: 'engineering',
  engineer: 'engineering',
  engineering: 'engineering',
  dev: 'engineering',
  developer: 'engineering',
  product: 'product',
  pm: 'product',
  design: 'design',
  ux: 'design',
  ui: 'design',
  qa: 'qa',
  test: 'qa',
  testing: 'qa',
  quality: 'qa',
  research: 'research',
  researcher: 'research',
  marketing: 'marketing',
  market: 'marketing',
  sales: 'sales',
  finance: 'finance',
  financial: 'finance',
  legal: 'legal',
  security: 'security',
  data: 'data',
  analytics: 'analytics',
  ai: 'ai',
  ml: 'ai',
};

/**
 * Common misspellings and corrections
 */
const COMMON_CORRECTIONS: Record<string, string> = {
  teh: 'the',
  hte: 'the',
  adn: 'and',
  taht: 'that',
  wiht: 'with',
  funciton: 'function',
  fucntion: 'function',
  functoin: 'function',
  databse: 'database',
  databaes: 'database',
  reqeust: 'request',
  reponse: 'response',
  responce: 'response',
  authenitcation: 'authentication',
  authentcation: 'authentication',
  deploymnet: 'deployment',
  preformance: 'performance',
  perfomance: 'performance',
};

// ============================================================================
// Query Processor Implementation
// ============================================================================

export class QueryProcessor {
  private vocabulary: Set<string> = new Set();

  constructor() {
    // Build vocabulary from synonyms and common terms
    this.buildVocabulary();
  }

  /**
   * Build vocabulary for spell correction
   */
  private buildVocabulary(): void {
    // Add all synonym keys and values
    for (const [key, values] of Object.entries(SYNONYM_MAP)) {
      this.vocabulary.add(key);
      values.forEach(v => this.vocabulary.add(v));
    }

    // Add brain aliases
    Object.keys(BRAIN_ALIASES).forEach(alias => this.vocabulary.add(alias));

    // Add common technical terms
    const technicalTerms = [
      'api', 'rest', 'graphql', 'database', 'sql', 'postgres', 'supabase',
      'typescript', 'javascript', 'node', 'react', 'vue', 'angular',
      'function', 'class', 'interface', 'type', 'const', 'let', 'var',
      'async', 'await', 'promise', 'callback', 'event', 'handler',
      'component', 'module', 'import', 'export', 'default', 'named',
      'error', 'exception', 'throw', 'catch', 'try', 'finally',
      'pattern', 'learning', 'memory', 'brain', 'agent', 'orchestrator',
      'deployment', 'production', 'staging', 'development', 'test',
    ];
    technicalTerms.forEach(term => this.vocabulary.add(term));
  }

  /**
   * Process a raw query through all stages
   */
  async process(query: string): Promise<ProcessedQuery> {
    // Stage 1: Normalize
    const normalized = this.normalize(query);

    // Stage 2: Spell correction
    const corrected = this.correctSpelling(normalized);

    // Stage 3: Entity extraction
    const entities = this.extractEntities(corrected);

    // Stage 4: Query type detection
    const queryType = this.detectQueryType(corrected, entities);

    // Stage 5: Synonym expansion (for non-keyword queries)
    const expanded = queryType !== 'keyword'
      ? this.expandWithSynonyms(corrected)
      : corrected;

    return {
      original: query,
      normalized,
      corrected,
      expanded,
      entities,
      queryType,
    };
  }

  /**
   * Normalize the query (lowercase, trim, collapse whitespace)
   */
  normalize(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Correct common spelling mistakes
   */
  correctSpelling(query: string): string {
    const words = query.split(' ');
    const corrected = words.map(word => {
      // Check for known corrections
      if (COMMON_CORRECTIONS[word]) {
        return COMMON_CORRECTIONS[word];
      }

      // If word is in vocabulary, keep it
      if (this.vocabulary.has(word)) {
        return word;
      }

      // Try to find a close match using Levenshtein distance
      const bestMatch = this.findClosestWord(word);
      if (bestMatch && this.levenshteinDistance(word, bestMatch) <= 2) {
        return bestMatch;
      }

      return word;
    });

    return corrected.join(' ');
  }

  /**
   * Extract entities from the query
   */
  extractEntities(query: string): Entity[] {
    const entities: Entity[] = [];

    // Extract brain references
    const words = query.split(' ');
    words.forEach((word, index) => {
      const brainType = BRAIN_ALIASES[word];
      if (brainType) {
        const position = query.indexOf(word);
        entities.push({
          type: 'brain',
          value: brainType,
          confidence: 0.9,
          position: { start: position, end: position + word.length },
        });
      }
    });

    // Extract file paths (anything with / or .)
    const filePathRegex = /(?:\/[\w.-]+)+(?:\.[\w]+)?|[\w.-]+\.(?:ts|js|tsx|jsx|json|md|yaml|yml|sql)/g;
    let match;
    while ((match = filePathRegex.exec(query)) !== null) {
      entities.push({
        type: 'file_path',
        value: match[0],
        confidence: 0.85,
        position: { start: match.index, end: match.index + match[0].length },
      });
    }

    // Extract error codes (common patterns)
    const errorCodeRegex = /(?:error|err|e)\s*(?:code\s*)?[:=]?\s*(\d+|[A-Z_]{2,})/gi;
    while ((match = errorCodeRegex.exec(query)) !== null) {
      entities.push({
        type: 'error_code',
        value: match[1],
        confidence: 0.8,
        position: { start: match.index, end: match.index + match[0].length },
      });
    }

    // Extract function names (camelCase or snake_case patterns)
    const functionRegex = /\b[a-z]+(?:[A-Z][a-z]+)+(?:\(\))?|\b[a-z]+(?:_[a-z]+)+(?:\(\))?/g;
    while ((match = functionRegex.exec(query)) !== null) {
      entities.push({
        type: 'function',
        value: match[0].replace(/\(\)$/, ''),
        confidence: 0.75,
        position: { start: match.index, end: match.index + match[0].length },
      });
    }

    // Extract tags (hashtags or common tag patterns)
    const tagRegex = /#[\w-]+/g;
    while ((match = tagRegex.exec(query)) !== null) {
      entities.push({
        type: 'tag',
        value: match[0].slice(1), // Remove #
        confidence: 0.95,
        position: { start: match.index, end: match.index + match[0].length },
      });
    }

    return entities;
  }

  /**
   * Detect the query type based on content
   */
  detectQueryType(query: string, entities: Entity[]): QueryType {
    // Keyword indicators: specific identifiers, error codes, file paths
    const keywordIndicators = [
      /^(error|err)[:=\s]/i,
      /\.[a-z]{2,4}$/i, // File extensions
      /\b\d{3,}\b/, // Numeric codes
      /["'`].*["'`]/, // Quoted strings
      /[A-Z_]{2,}/, // Constants
      /^[\w.-]+\(/, // Function calls
    ];

    const hasKeywordIndicators = keywordIndicators.some(regex => regex.test(query));
    const hasFileOrFunctionEntities = entities.some(e =>
      e.type === 'file_path' || e.type === 'error_code' || e.type === 'function'
    );

    if (hasKeywordIndicators || hasFileOrFunctionEntities) {
      // Check if it's purely keyword or mixed
      const semanticIndicators = [
        /\b(how|what|why|when|where|which|who)\b/i,
        /\b(should|would|could|can|does|is|are)\b/i,
        /\?$/,
      ];

      const hasSemanticIndicators = semanticIndicators.some(regex => regex.test(query));

      return hasSemanticIndicators ? 'hybrid' : 'keyword';
    }

    // Semantic indicators: question words, natural language
    const semanticPatterns = [
      /\b(how|what|why|when|where|which|who)\b/i,
      /\b(explain|describe|tell me|show me|help me)\b/i,
      /\b(best|better|worst|recommend|suggest)\b/i,
      /\?$/,
    ];

    const isSemanticQuery = semanticPatterns.some(regex => regex.test(query));

    return isSemanticQuery ? 'semantic' : 'hybrid';
  }

  /**
   * Expand query with synonyms
   */
  expandWithSynonyms(query: string): string {
    const words = query.split(' ');
    const expanded: string[] = [];

    for (const word of words) {
      expanded.push(word);

      // Check if word has synonyms
      const synonyms = SYNONYM_MAP[word];
      if (synonyms) {
        // Add top 2 most relevant synonyms
        expanded.push(...synonyms.slice(0, 2));
      }

      // Check if any synonym key contains this word as a synonym
      for (const [key, values] of Object.entries(SYNONYM_MAP)) {
        if (values.includes(word) && !expanded.includes(key)) {
          expanded.push(key);
          break; // Only add one reverse mapping
        }
      }
    }

    // Remove duplicates while preserving order
    return [...new Set(expanded)].join(' ');
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Find the closest word in vocabulary using Levenshtein distance
   */
  private findClosestWord(word: string): string | null {
    let bestMatch: string | null = null;
    let bestDistance = Infinity;

    for (const vocabWord of this.vocabulary) {
      // Only check words of similar length
      if (Math.abs(vocabWord.length - word.length) > 2) {
        continue;
      }

      const distance = this.levenshteinDistance(word, vocabWord);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = vocabWord;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // Deletion
          matrix[i][j - 1] + 1,     // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    return matrix[a.length][b.length];
  }
}

// Export singleton instance
export const queryProcessor = new QueryProcessor();
