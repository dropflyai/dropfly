/**
 * X2000 Web Search - Content Extractor
 *
 * Multi-strategy content extraction with fallbacks:
 * - Readability.js primary (via linkedom) - requires optional deps
 * - Firecrawl API fallback
 * - Custom parser for edge cases
 */

// Types for optional Readability dependency
interface ReadabilityResult {
  title?: string;
  content?: string;
  byline?: string;
  siteName?: string;
  lang?: string;
  excerpt?: string;
}

interface ReadabilityClass {
  new (document: unknown, options?: { charThreshold?: number; keepClasses?: boolean }): {
    parse(): ReadabilityResult | null;
  };
}

interface LinkedomModule {
  parseHTML(html: string): { document: unknown };
}

// ============================================================================
// Types
// ============================================================================

export interface ExtractorConfig {
  /** Firecrawl API key */
  firecrawlApiKey?: string;
  /** Maximum content characters */
  maxContentChars?: number;
  /** Timeout in milliseconds */
  timeoutMs?: number;
  /** User agent string */
  userAgent?: string;
}

export interface ExtractedContent {
  /** Extracted text content */
  text: string;
  /** Page title */
  title?: string;
  /** Word count */
  wordCount: number;
  /** Extraction timestamp */
  extractedAt: string;
  /** Which extractor was used */
  extractor: 'readability' | 'firecrawl' | 'custom';
  /** Additional metadata */
  metadata?: {
    author?: string;
    publishedDate?: string;
    description?: string;
    siteName?: string;
    language?: string;
  };
}

export type ExtractionMode = 'markdown' | 'text';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MAX_CHARS = 50000;
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; X2000Bot/1.0; +https://x2000.ai)';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/scrape';
const MIN_CONTENT_LENGTH = 100;

// ============================================================================
// Content Extractor Class
// ============================================================================

export class ContentExtractor {
  private config: ExtractorConfig;

  constructor(config: Partial<ExtractorConfig> = {}) {
    this.config = {
      maxContentChars: DEFAULT_MAX_CHARS,
      timeoutMs: DEFAULT_TIMEOUT_MS,
      userAgent: DEFAULT_USER_AGENT,
      ...config,
    };
  }

  /**
   * Configure the extractor
   */
  configure(config: Partial<ExtractorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Extract content from a URL using multiple strategies
   */
  async extract(
    url: string,
    mode: ExtractionMode = 'markdown'
  ): Promise<ExtractedContent | null> {
    const strategies = [
      () => this.extractWithReadability(url, mode),
      () => this.extractWithFirecrawl(url, mode),
      () => this.extractWithCustomParser(url, mode),
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result && result.text.length >= MIN_CONTENT_LENGTH) {
          return result;
        }
      } catch (error) {
        console.warn(`[ContentExtractor] Strategy failed for ${url}:`, error);
      }
    }

    return null;
  }

  /**
   * Extract content for multiple URLs
   */
  async extractBatch(
    urls: string[],
    mode: ExtractionMode = 'markdown',
    concurrency: number = 3
  ): Promise<Map<string, ExtractedContent | null>> {
    const results = new Map<string, ExtractedContent | null>();
    const queue = [...urls];

    const worker = async () => {
      while (queue.length > 0) {
        const url = queue.shift();
        if (url) {
          try {
            const content = await this.extract(url, mode);
            results.set(url, content);
          } catch (error) {
            console.warn(`[ContentExtractor] Failed to extract ${url}:`, error);
            results.set(url, null);
          }
        }
      }
    };

    const workers = Array(Math.min(concurrency, urls.length))
      .fill(null)
      .map(() => worker());

    await Promise.all(workers);
    return results;
  }

  /**
   * Extract using Readability.js (primary strategy)
   */
  private async extractWithReadability(
    url: string,
    mode: ExtractionMode
  ): Promise<ExtractedContent | null> {
    const timeout = this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const response = await fetch(url, {
      headers: {
        'User-Agent': this.config.userAgent ?? DEFAULT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error(`Not HTML content: ${contentType}`);
    }

    const html = await response.text();

    // Dynamic import for Readability and linkedom (optional dependencies)
    let Readability: ReadabilityClass;
    let parseHTML: LinkedomModule['parseHTML'];

    try {
      // Use dynamic import with string literal to avoid bundler/TypeScript module resolution
      const readabilityModuleName = '@mozilla/readability';
      const linkedomModuleName = 'linkedom';
      const readabilityModule = await (Function('moduleName', 'return import(moduleName)')(readabilityModuleName) as Promise<{ Readability: ReadabilityClass }>);
      const linkedomModule = await (Function('moduleName', 'return import(moduleName)')(linkedomModuleName) as Promise<LinkedomModule>);
      Readability = readabilityModule.Readability;
      parseHTML = linkedomModule.parseHTML;
    } catch {
      throw new Error('Readability extraction requires @mozilla/readability and linkedom packages. Install them with: npm install @mozilla/readability linkedom');
    }

    const { document } = parseHTML(html);
    const reader = new Readability(document, {
      charThreshold: 0,
      keepClasses: false,
    });
    const parsed = reader.parse();

    if (!parsed?.content) {
      return null;
    }

    const text =
      mode === 'text'
        ? this.htmlToText(parsed.content)
        : this.htmlToMarkdown(parsed.content);

    const maxChars = this.config.maxContentChars ?? DEFAULT_MAX_CHARS;

    return {
      text: text.slice(0, maxChars),
      title: parsed.title || undefined,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      extractedAt: new Date().toISOString(),
      extractor: 'readability',
      metadata: {
        author: parsed.byline || undefined,
        siteName: parsed.siteName || undefined,
        language: parsed.lang || undefined,
        description: parsed.excerpt || undefined,
      },
    };
  }

  /**
   * Extract using Firecrawl API (fallback #1)
   */
  private async extractWithFirecrawl(
    url: string,
    mode: ExtractionMode
  ): Promise<ExtractedContent | null> {
    if (!this.config.firecrawlApiKey) {
      throw new Error('Firecrawl API key not configured');
    }

    const timeout = this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const response = await fetch(FIRECRAWL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: Math.floor(timeout / 1000),
      }),
      signal: AbortSignal.timeout(timeout + 5000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firecrawl API error: ${response.status} - ${errorText}`);
    }

    interface FirecrawlResponse {
      success?: boolean;
      data?: {
        markdown?: string;
        metadata?: {
          title?: string;
          description?: string;
          language?: string;
          author?: string;
          publishedTime?: string;
        };
      };
    }

    const data = (await response.json()) as FirecrawlResponse;

    if (!data.success || !data.data?.markdown) {
      return null;
    }

    let text = data.data.markdown;
    if (mode === 'text') {
      text = this.markdownToText(text);
    }

    const maxChars = this.config.maxContentChars ?? DEFAULT_MAX_CHARS;

    return {
      text: text.slice(0, maxChars),
      title: data.data.metadata?.title,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      extractedAt: new Date().toISOString(),
      extractor: 'firecrawl',
      metadata: {
        description: data.data.metadata?.description,
        language: data.data.metadata?.language,
        author: data.data.metadata?.author,
        publishedDate: data.data.metadata?.publishedTime,
      },
    };
  }

  /**
   * Extract using custom heuristic parser (fallback #2)
   */
  private async extractWithCustomParser(
    url: string,
    mode: ExtractionMode
  ): Promise<ExtractedContent | null> {
    const timeout = this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const response = await fetch(url, {
      headers: {
        'User-Agent': this.config.userAgent ?? DEFAULT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? this.htmlToText(titleMatch[1]).trim() : undefined;

    // Remove non-content elements
    let cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    // Find the largest text block (likely main content)
    const paragraphs = cleaned.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    const articleContent = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);

    let textContent: string;

    if (articleContent) {
      // Prefer article content
      textContent = this.htmlToText(articleContent[1]);
    } else if (paragraphs.length > 0) {
      // Fall back to paragraphs
      textContent = paragraphs
        .map((p) => this.htmlToText(p))
        .filter((t) => t.length > 50)
        .join('\n\n');
    } else {
      // Last resort: extract all text
      textContent = this.htmlToText(cleaned);
    }

    if (textContent.length < MIN_CONTENT_LENGTH) {
      return null;
    }

    const maxChars = this.config.maxContentChars ?? DEFAULT_MAX_CHARS;
    const finalText = mode === 'markdown' ? textContent : textContent;

    return {
      text: finalText.slice(0, maxChars),
      title,
      wordCount: textContent.split(/\s+/).filter(Boolean).length,
      extractedAt: new Date().toISOString(),
      extractor: 'custom',
    };
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .replace(/\n +/g, '\n')
      .replace(/ +\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Convert HTML to Markdown
   */
  private htmlToMarkdown(html: string): string {
    return (
      html
        // Headers
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `# ${this.htmlToText(t)}\n\n`)
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `## ${this.htmlToText(t)}\n\n`)
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `### ${this.htmlToText(t)}\n\n`)
        .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `#### ${this.htmlToText(t)}\n\n`)
        .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `##### ${this.htmlToText(t)}\n\n`)
        .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `###### ${this.htmlToText(t)}\n\n`)
        // Lists
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${this.htmlToText(t)}\n`)
        // Links
        .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, h, t) =>
          `[${this.htmlToText(t)}](${h})`
        )
        // Bold/italic
        .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `**${this.htmlToText(t)}**`)
        .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `*${this.htmlToText(t)}*`)
        // Code
        .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${this.htmlToText(t)}\``)
        .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, t) => `\`\`\`\n${this.htmlToText(t)}\n\`\`\`\n`)
        // Blockquote
        .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) =>
          this.htmlToText(t)
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n') + '\n'
        )
        // Paragraphs
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `${this.htmlToText(t)}\n\n`)
        // Clean up remaining tags
        .replace(/<[^>]+>/g, '')
        // Fix multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    );
  }

  /**
   * Convert Markdown to plain text
   */
  private markdownToText(md: string): string {
    return md
      .replace(/!\[[^\]]*]\([^)]+\)/g, '') // Remove images
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1') // Links to text
      .replace(/```[\s\S]*?```/g, '') // Code blocks
      .replace(/`([^`]+)`/g, '$1') // Inline code
      .replace(/^#{1,6}\s+/gm, '') // Headers
      .replace(/^\s*[-*+]\s+/gm, '') // List markers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
      .replace(/\*([^*]+)\*/g, '$1') // Italic
      .replace(/^>\s*/gm, '') // Blockquotes
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const contentExtractor = new ContentExtractor();

export function createContentExtractor(config?: Partial<ExtractorConfig>): ContentExtractor {
  return new ContentExtractor(config);
}
