/**
 * X2000 Documentation System
 * Comprehensive documentation generation, search, and serving system
 *
 * Features:
 * - Auto-generated API docs from TypeScript source
 * - MDX support for rich content
 * - AI-powered semantic search
 * - Interactive code examples (playgrounds)
 * - Multi-version documentation
 * - Hot reload development server
 *
 * @module docs
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Document types
  DocPage,
  DocSection,
  DocFrontmatter,
  TableOfContentsItem,
  NavLink,
  CodeBlock,

  // API Reference types
  TypeKind,
  Visibility,
  ParameterDef,
  PropertyDef,
  MethodDef,
  ThrownError,
  TypeDefinition,
  TypeParameterDef,
  EnumMemberDef,
  APIReference,
  ImportInfo,

  // Version types
  DocVersion,
  VersionConfig,
  VersionDiff,
  DiffItem,

  // Search types
  DocChunk,
  SearchIndex,
  DocSearchResult,
  DocSearchOptions,
  DocSearchResponse,

  // Example types
  Example,
  ExampleFile,
  InteractivePlayground,
  SandboxConfig,
  PlaygroundResult,
  PlaygroundLog,

  // Configuration types
  DocConfig,
  APIConfig,
  SearchConfig,
  PlaygroundConfig,
  VersioningConfig,
  NavigationConfig,
  SidebarConfig,
  SidebarItem,
  HeaderConfig,
  FooterConfig,
  FooterLinkGroup,
  BuildConfig,
  ServerConfig,
  ThemeConfig,
  I18nConfig,
  LocaleConfig,

  // Generation types
  GenerationResult,
  GeneratedPage,
  GenerationError,
  GenerationWarning,
  GenerationStats,

  // Validation types
  ValidationResult,
  ValidationError,
  ValidationWarning,
  CoverageReport,
  FileCoverage,
  TypeCoverage,
  MissingDoc,
} from './types.js';

// ============================================================================
// Extractor
// ============================================================================

export {
  TypeDocExtractor,
  getExtractor,
  extractTypes,
} from './extractor.js';

// ============================================================================
// Generator
// ============================================================================

export {
  DocGenerator,
  createDocGenerator,
  generateDocs,
} from './generator.js';

// ============================================================================
// Search
// ============================================================================

export {
  SearchIndexBuilder,
  DocSearchEngine,
  docSearchEngine,
  buildSearchIndex,
  searchDocs,
} from './search.js';

// ============================================================================
// Playground
// ============================================================================

export {
  ExampleExtractor,
  PlaygroundManager,
  exampleExtractor,
  playgroundManager,
  extractExamples,
  createPlayground,
  executePlayground,
} from './playground.js';

// ============================================================================
// Versioning
// ============================================================================

export {
  VersionManager,
  VersionDiffGenerator,
  getVersionManager,
  versionDiffGenerator,
  createDocVersion,
  generateVersionDiff,
} from './versioning.js';

// ============================================================================
// Server
// ============================================================================

export {
  DocServer,
  getDocServer,
  startDocServer,
  stopDocServer,
} from './server.js';

// ============================================================================
// CLI
// ============================================================================

export {
  program as docsCli,
  runCli as runDocsCli,
} from './cli.js';

// ============================================================================
// Convenience Functions
// ============================================================================

import { generateDocs as _generateDocs } from './generator.js';
import { buildSearchIndex as _buildSearchIndex, docSearchEngine } from './search.js';
import { startDocServer as _startDocServer } from './server.js';
import type { GeneratedPage, SearchIndex } from './types.js';

/**
 * Build complete documentation with search index
 *
 * @param options - Build options
 * @returns Generation result with search index
 *
 * @example
 * ```typescript
 * import { buildDocs } from './docs';
 *
 * const result = await buildDocs({
 *   sourceDir: './src',
 *   docsDir: './docs',
 *   outDir: './docs-output',
 *   version: '1.0.0',
 * });
 *
 * console.log(`Generated ${result.pages.length} pages`);
 * ```
 */
export async function buildDocs(options: {
  sourceDir: string;
  docsDir: string;
  outDir: string;
  version?: string;
}): Promise<{
  success: boolean;
  pages: GeneratedPage[];
  searchIndex: SearchIndex;
  errors: Array<{ code: string; message: string }>;
}> {
  const result = await _generateDocs(options);

  const searchIndex = _buildSearchIndex(
    result.pages,
    options.version || '0.1.0'
  );

  return {
    success: result.success,
    pages: result.pages,
    searchIndex,
    errors: result.errors.map(e => ({ code: e.code, message: e.message })),
  };
}

/**
 * Start documentation server with all features
 *
 * @param options - Server options
 * @returns Server info
 *
 * @example
 * ```typescript
 * import { serveDocs } from './docs';
 *
 * const server = await serveDocs({
 *   docsDir: './docs-output',
 *   port: 4000,
 *   semanticSearch: true,
 * });
 *
 * console.log(`Server running at ${server.url}`);
 * ```
 */
export async function serveDocs(options: {
  docsDir: string;
  port?: number;
  host?: string;
  semanticSearch?: boolean;
  openaiApiKey?: string;
}): Promise<{
  url: string;
  port: number;
  stop: () => Promise<void>;
}> {
  const server = await _startDocServer({
    docsDir: options.docsDir,
    staticDir: options.docsDir,
    port: options.port || 4000,
    host: options.host || 'localhost',
    hotReload: true,
  });

  // Load search index
  const { readFileSync, existsSync } = await import('fs');
  const { join } = await import('path');

  const indexPath = join(options.docsDir, 'search-index.json');
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, 'utf-8');
    server.loadSearchIndex(JSON.parse(content));
  }

  // Enable semantic search
  if (options.semanticSearch && options.openaiApiKey) {
    await server.enableSemanticSearch(options.openaiApiKey);
  }

  const info = server.getInfo();

  return {
    url: info.url,
    port: info.port,
    stop: async () => {
      const { stopDocServer } = await import('./server.js');
      await stopDocServer();
    },
  };
}

/**
 * Search documentation
 *
 * @param query - Search query
 * @param options - Search options
 * @returns Search results
 *
 * @example
 * ```typescript
 * import { search, docSearchEngine, buildSearchIndex } from './docs';
 *
 * // First, load an index
 * docSearchEngine.loadIndex(searchIndex);
 *
 * // Then search
 * const results = await search('brain collaboration');
 * console.log(results.results);
 * ```
 */
export async function search(
  query: string,
  options?: {
    limit?: number;
    version?: string;
    semantic?: boolean;
  }
): Promise<{
  results: Array<{
    title: string;
    path: string;
    highlight: string;
    score: number;
  }>;
  total: number;
}> {
  const response = await docSearchEngine.search({
    query,
    limit: options?.limit || 10,
    version: options?.version,
    semanticSearch: options?.semantic || false,
  });

  return {
    results: response.results.map(r => ({
      title: r.title,
      path: r.path,
      highlight: r.highlight,
      score: r.score,
    })),
    total: response.totalResults,
  };
}
