/**
 * X2000 Documentation System - Type Definitions
 * Types for the comprehensive documentation generation, search, and serving system
 */

import type { BrainType } from '../types/index.js';

// ============================================================================
// Document Page Types
// ============================================================================

/**
 * Frontmatter metadata for a documentation page
 */
export interface DocFrontmatter {
  title: string;
  description: string;
  version?: string;
  lastUpdated?: string;
  author?: string;
  tags?: string[];
  category?: string;
  order?: number;
  draft?: boolean;
  deprecated?: boolean;
  deprecationMessage?: string;
}

/**
 * A section within a documentation page
 */
export interface DocSection {
  id: string;
  title: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  anchor: string;
  codeBlocks: CodeBlock[];
  subsections: DocSection[];
}

/**
 * Code block within documentation
 */
export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  title?: string;
  filename?: string;
  highlightLines?: number[];
  isRunnable: boolean;
  isInteractive: boolean;
}

/**
 * Complete documentation page
 */
export interface DocPage {
  id: string;
  slug: string;
  path: string;
  filePath: string;
  frontmatter: DocFrontmatter;
  content: string;
  sections: DocSection[];
  tableOfContents: TableOfContentsItem[];
  relatedPages: string[];
  examples: Example[];
  apiReferences: string[];
  navigation: {
    prev?: NavLink;
    next?: NavLink;
  };
  metadata: {
    wordCount: number;
    readingTime: number;
    hasInteractiveExamples: boolean;
    hasApiReference: boolean;
    codeBlockCount: number;
  };
}

/**
 * Table of contents item
 */
export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children: TableOfContentsItem[];
}

/**
 * Navigation link
 */
export interface NavLink {
  title: string;
  slug: string;
  path: string;
}

// ============================================================================
// API Reference Types
// ============================================================================

/**
 * TypeScript type kinds
 */
export type TypeKind =
  | 'class'
  | 'interface'
  | 'type'
  | 'enum'
  | 'function'
  | 'variable'
  | 'constant'
  | 'namespace'
  | 'module';

/**
 * Visibility modifier
 */
export type Visibility = 'public' | 'protected' | 'private';

/**
 * Parameter definition for functions/methods
 */
export interface ParameterDef {
  name: string;
  type: string;
  description?: string;
  optional: boolean;
  defaultValue?: string;
  rest: boolean;
}

/**
 * Property definition for classes/interfaces
 */
export interface PropertyDef {
  name: string;
  type: string;
  description?: string;
  visibility: Visibility;
  static: boolean;
  readonly: boolean;
  optional: boolean;
  defaultValue?: string;
  decorators?: string[];
}

/**
 * Method definition for classes/interfaces
 */
export interface MethodDef {
  name: string;
  signature: string;
  description?: string;
  visibility: Visibility;
  static: boolean;
  async: boolean;
  abstract: boolean;
  parameters: ParameterDef[];
  returnType: string;
  returnDescription?: string;
  throws?: ThrownError[];
  examples?: string[];
  decorators?: string[];
  overloads?: string[];
  deprecated?: boolean;
  deprecationMessage?: string;
  since?: string;
  see?: string[];
}

/**
 * Error that can be thrown
 */
export interface ThrownError {
  type: string;
  description: string;
}

/**
 * Type definition (interface, type alias, etc.)
 */
export interface TypeDefinition {
  id: string;
  name: string;
  kind: TypeKind;
  description?: string;
  sourceFile: string;
  sourceLine: number;
  signature: string;
  properties?: PropertyDef[];
  methods?: MethodDef[];
  constructors?: MethodDef[];
  extends?: string[];
  implements?: string[];
  typeParameters?: TypeParameterDef[];
  members?: EnumMemberDef[];
  exported: boolean;
  deprecated?: boolean;
  deprecationMessage?: string;
  since?: string;
  examples?: string[];
  see?: string[];
  tags?: string[];
}

/**
 * Type parameter definition (generics)
 */
export interface TypeParameterDef {
  name: string;
  constraint?: string;
  default?: string;
  description?: string;
}

/**
 * Enum member definition
 */
export interface EnumMemberDef {
  name: string;
  value: string | number;
  description?: string;
}

/**
 * Complete API reference document
 */
export interface APIReference {
  id: string;
  name: string;
  description?: string;
  sourceFile: string;
  module: string;
  types: TypeDefinition[];
  functions: TypeDefinition[];
  classes: TypeDefinition[];
  interfaces: TypeDefinition[];
  enums: TypeDefinition[];
  constants: TypeDefinition[];
  exports: string[];
  imports: ImportInfo[];
  dependencies: string[];
  dependents: string[];
}

/**
 * Import information
 */
export interface ImportInfo {
  module: string;
  imports: string[];
  isTypeOnly: boolean;
}

// ============================================================================
// Version Management Types
// ============================================================================

/**
 * Documentation version
 */
export interface DocVersion {
  version: string;
  label: string;
  path: string;
  isLatest: boolean;
  isStable: boolean;
  isPrerelease: boolean;
  isDeprecated: boolean;
  deprecationMessage?: string;
  releasedAt?: Date;
  supportedUntil?: Date;
  changelog?: string;
  migrationGuide?: string;
}

/**
 * Version configuration
 */
export interface VersionConfig {
  current: DocVersion;
  stable: DocVersion;
  versions: DocVersion[];
  maxVersions: number;
  archiveOld: boolean;
}

/**
 * Version diff for API changes
 */
export interface VersionDiff {
  fromVersion: string;
  toVersion: string;
  added: DiffItem[];
  removed: DiffItem[];
  modified: DiffItem[];
  deprecated: DiffItem[];
}

/**
 * Single diff item
 */
export interface DiffItem {
  type: TypeKind;
  name: string;
  path: string;
  description?: string;
  breaking: boolean;
}

// ============================================================================
// Search Types
// ============================================================================

/**
 * Document chunk for search indexing
 */
export interface DocChunk {
  id: string;
  pageId: string;
  path: string;
  title: string;
  section: string;
  sectionAnchor: string;
  content: string;
  type: 'page' | 'section' | 'api' | 'example';
  category?: string;
  tags?: string[];
  version: string;
  embedding?: number[];
  importance: number;
}

/**
 * Search index containing all indexed content
 */
export interface SearchIndex {
  id: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  chunks: DocChunk[];
  totalChunks: number;
  totalPages: number;
  categories: string[];
  tags: string[];
  embeddingModel?: string;
  embeddingDimensions?: number;
}

/**
 * Search result from documentation search
 */
export interface DocSearchResult {
  id: string;
  chunkId: string;
  pageId: string;
  path: string;
  title: string;
  section: string;
  sectionAnchor: string;
  content: string;
  highlight: string;
  type: 'page' | 'section' | 'api' | 'example';
  category?: string;
  tags?: string[];
  version: string;
  score: number;
  keywordScore?: number;
  semanticScore?: number;
}

/**
 * Search query options
 */
export interface DocSearchOptions {
  query: string;
  version?: string;
  categories?: string[];
  tags?: string[];
  types?: ('page' | 'section' | 'api' | 'example')[];
  limit?: number;
  offset?: number;
  semanticSearch?: boolean;
  highlightLength?: number;
}

/**
 * Search response with metadata
 */
export interface DocSearchResponse {
  query: string;
  results: DocSearchResult[];
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
  timing: {
    queryProcessing: number;
    search: number;
    total: number;
  };
  suggestions?: string[];
}

// ============================================================================
// Interactive Example Types
// ============================================================================

/**
 * Code example that can be displayed or run
 */
export interface Example {
  id: string;
  title: string;
  description?: string;
  type: 'static' | 'interactive' | 'live-api' | 'terminal';
  files: ExampleFile[];
  dependencies?: Record<string, string>;
  template?: 'node' | 'react' | 'vanilla';
  autoRun?: boolean;
  showConsole?: boolean;
  showPreview?: boolean;
  editorHeight?: number;
  tags?: string[];
  brainType?: BrainType;
}

/**
 * File within an example
 */
export interface ExampleFile {
  path: string;
  content: string;
  language: string;
  hidden?: boolean;
  readonly?: boolean;
  active?: boolean;
}

/**
 * Interactive playground configuration
 */
export interface InteractivePlayground {
  id: string;
  example: Example;
  sandboxConfig: SandboxConfig;
  initialOutput?: string;
  expectedOutput?: string;
}

/**
 * Sandbox configuration for code execution
 */
export interface SandboxConfig {
  template: 'node' | 'react' | 'vanilla' | 'custom';
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  environment?: Record<string, string>;
  entryPoint: string;
  timeout: number;
  memoryLimit: number;
  networkAccess: boolean;
  fileSystemAccess: boolean;
}

/**
 * Execution result from playground
 */
export interface PlaygroundResult {
  id: string;
  playgroundId: string;
  success: boolean;
  output: string;
  error?: string;
  logs: PlaygroundLog[];
  timing: {
    compilation: number;
    execution: number;
    total: number;
  };
}

/**
 * Log entry from playground execution
 */
export interface PlaygroundLog {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  args?: unknown[];
}

// ============================================================================
// Documentation Configuration
// ============================================================================

/**
 * Main documentation configuration
 */
export interface DocConfig {
  /** Project name */
  name: string;

  /** Project description */
  description: string;

  /** Base URL for documentation */
  baseUrl: string;

  /** Source directories to extract types from */
  sourceDirectories: string[];

  /** Documentation content directory */
  docsDirectory: string;

  /** Output directory for generated docs */
  outputDirectory: string;

  /** API reference configuration */
  api: APIConfig;

  /** Search configuration */
  search: SearchConfig;

  /** Playground configuration */
  playground: PlaygroundConfig;

  /** Version configuration */
  versioning: VersioningConfig;

  /** Navigation configuration */
  navigation: NavigationConfig;

  /** Build configuration */
  build: BuildConfig;

  /** Server configuration */
  server: ServerConfig;

  /** Theme configuration */
  theme: ThemeConfig;

  /** i18n configuration */
  i18n: I18nConfig;
}

/**
 * API documentation configuration
 */
export interface APIConfig {
  enabled: boolean;
  entryPoints: string[];
  exclude: string[];
  excludePrivate: boolean;
  excludeProtected: boolean;
  excludeInternal: boolean;
  categorize: boolean;
  categoryOrder: string[];
  validation: {
    notExported: boolean;
    invalidLink: boolean;
    notDocumented: boolean;
  };
}

/**
 * Search configuration
 */
export interface SearchConfig {
  enabled: boolean;
  provider: 'local' | 'typesense' | 'algolia';
  semanticSearch: boolean;
  embeddingProvider?: 'openai' | 'cohere' | 'local';
  embeddingModel?: string;
  apiKey?: string;
  indexName?: string;
  chunkSize: number;
  chunkOverlap: number;
}

/**
 * Playground configuration
 */
export interface PlaygroundConfig {
  enabled: boolean;
  provider: 'sandpack' | 'codapi' | 'custom';
  defaultTemplate: 'node' | 'react' | 'vanilla';
  timeout: number;
  memoryLimit: number;
  allowNetworkAccess: boolean;
  allowFileSystemAccess: boolean;
  mockDependencies?: Record<string, string>;
}

/**
 * Versioning configuration
 */
export interface VersioningConfig {
  enabled: boolean;
  current: string;
  stable: string;
  maxVersions: number;
  archiveOld: boolean;
  showBanner: boolean;
}

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  sidebar: SidebarConfig;
  header: HeaderConfig;
  footer: FooterConfig;
}

/**
 * Sidebar configuration
 */
export interface SidebarConfig {
  items: SidebarItem[];
  collapsible: boolean;
  defaultCollapsed: boolean;
}

/**
 * Sidebar item
 */
export interface SidebarItem {
  label: string;
  path?: string;
  icon?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
  external?: boolean;
}

/**
 * Header configuration
 */
export interface HeaderConfig {
  logo: string;
  title: string;
  links: NavLink[];
  search: boolean;
  versionSelector: boolean;
  languageSelector: boolean;
  darkModeToggle: boolean;
  github?: string;
}

/**
 * Footer configuration
 */
export interface FooterConfig {
  copyright: string;
  links: FooterLinkGroup[];
}

/**
 * Footer link group
 */
export interface FooterLinkGroup {
  title: string;
  links: NavLink[];
}

/**
 * Build configuration
 */
export interface BuildConfig {
  outDir: string;
  clean: boolean;
  minify: boolean;
  sourceMaps: boolean;
  sitemap: boolean;
  robots: boolean;
  parallelism: number;
}

/**
 * Server configuration
 */
export interface ServerConfig {
  port: number;
  host: string;
  cors: boolean;
  hotReload: boolean;
  staticDir?: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
  codeTheme: string;
  fontFamily: string;
  codeFontFamily: string;
  customCss?: string;
}

/**
 * i18n configuration
 */
export interface I18nConfig {
  enabled: boolean;
  defaultLocale: string;
  locales: LocaleConfig[];
}

/**
 * Locale configuration
 */
export interface LocaleConfig {
  code: string;
  name: string;
  path: string;
  direction: 'ltr' | 'rtl';
}

// ============================================================================
// Generator Types
// ============================================================================

/**
 * Documentation generation result
 */
export interface GenerationResult {
  success: boolean;
  pages: GeneratedPage[];
  apiReference: APIReference[];
  searchIndex: SearchIndex;
  errors: GenerationError[];
  warnings: GenerationWarning[];
  timing: {
    extraction: number;
    generation: number;
    indexing: number;
    total: number;
  };
  stats: GenerationStats;
}

/**
 * Generated page
 */
export interface GeneratedPage {
  path: string;
  slug: string;
  content: string;
  frontmatter: DocFrontmatter;
  sourceFile?: string;
}

/**
 * Generation error
 */
export interface GenerationError {
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  severity: 'error' | 'fatal';
}

/**
 * Generation warning
 */
export interface GenerationWarning {
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

/**
 * Generation statistics
 */
export interface GenerationStats {
  totalPages: number;
  totalSections: number;
  totalCodeBlocks: number;
  totalExamples: number;
  totalApiTypes: number;
  totalApiMethods: number;
  totalWords: number;
  coverage: {
    documented: number;
    undocumented: number;
    percentage: number;
  };
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  coverage: CoverageReport;
}

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  file: string;
  line?: number;
  symbol?: string;
  suggestion?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  file: string;
  line?: number;
  symbol?: string;
  suggestion?: string;
}

/**
 * Documentation coverage report
 */
export interface CoverageReport {
  total: number;
  documented: number;
  undocumented: number;
  percentage: number;
  byFile: FileCoverage[];
  byType: TypeCoverage[];
  missing: MissingDoc[];
}

/**
 * File-level coverage
 */
export interface FileCoverage {
  file: string;
  total: number;
  documented: number;
  percentage: number;
}

/**
 * Type-level coverage
 */
export interface TypeCoverage {
  type: TypeKind;
  total: number;
  documented: number;
  percentage: number;
}

/**
 * Missing documentation entry
 */
export interface MissingDoc {
  file: string;
  line: number;
  name: string;
  kind: TypeKind;
  visibility: Visibility;
}
