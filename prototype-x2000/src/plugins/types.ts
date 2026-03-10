/**
 * X2000 Plugin System - Type Definitions
 *
 * Comprehensive types for the plugin architecture including:
 * - Plugin manifest format
 * - Plugin context and APIs
 * - Lifecycle hooks
 * - Capability-based permissions
 */

import type { BrainType, TrustLevel, Pattern, Learning, Skill } from '../types/index.js';

// ============================================================================
// Plugin Manifest Types
// ============================================================================

/**
 * Author information for a plugin
 */
export interface PluginAuthor {
  name: string;
  email?: string;
  url?: string;
}

/**
 * Network capability configuration
 */
export interface CapabilityNetwork {
  domains: string[];
  ports?: number[];
}

/**
 * Filesystem capability configuration
 */
export interface CapabilityFilesystem {
  read: string[];
  write: string[];
}

/**
 * Environment variable capability configuration
 */
export interface CapabilityEnv {
  read: string[];
  write: string[];
}

/**
 * System capability configuration
 */
export interface CapabilitySystem {
  subprocess: boolean;
  native: boolean;
}

/**
 * X2000 internal capability configuration
 */
export interface CapabilityX2000 {
  memory: 'none' | 'read' | 'write';
  brains: string[] | '*';
  tools: string[] | '*';
  guardrails: 'none' | 'extend';
}

/**
 * Plugin capabilities - what the plugin is allowed to access
 */
export interface PluginCapabilities {
  network?: CapabilityNetwork;
  filesystem?: CapabilityFilesystem;
  env?: CapabilityEnv;
  system?: CapabilitySystem;
  x2000?: CapabilityX2000;
}

/**
 * Base provider definition (tool, brain, channel, guardrail)
 */
export interface PluginProvider {
  id: string;
  name: string;
  description: string;
}

/**
 * Tool provider definition
 */
export interface PluginToolProvider extends PluginProvider {
  category: string;
}

/**
 * What a plugin provides to X2000
 */
export interface PluginProvides {
  channels?: PluginProvider[];
  tools?: PluginToolProvider[];
  brains?: PluginProvider[];
  guardrails?: PluginProvider[];
  hooks?: X2000Hook[];
}

/**
 * Plugin marketplace metadata
 */
export interface PluginMarketplace {
  category: string;
  tags: string[];
  icon?: string;
  screenshots?: string[];
  documentation?: string;
}

/**
 * Plugin engine requirements
 */
export interface PluginEngines {
  x2000: string;
  node?: string;
}

/**
 * Full plugin manifest (x2000.plugin.json)
 */
export interface PluginManifest {
  $schema?: string;
  id: string;
  version: string;
  name: string;
  description: string;
  author: PluginAuthor;
  license: string;
  main: string;
  types?: string;
  engines: PluginEngines;
  dependencies?: Record<string, string>;
  peerPlugins?: Record<string, string>;
  provides: PluginProvides;
  capabilities: PluginCapabilities;
  configSchema?: Record<string, unknown>;
  marketplace?: PluginMarketplace;
}

// ============================================================================
// Plugin State
// ============================================================================

/**
 * Plugin loading state
 */
export type PluginState =
  | 'unloaded'
  | 'loading'
  | 'loaded'
  | 'activating'
  | 'active'
  | 'deactivating'
  | 'error';

/**
 * Information about a loaded plugin
 */
export interface LoadedPlugin {
  manifest: PluginManifest;
  state: PluginState;
  path: string;
  instance?: X2000Plugin;
  sandboxId?: string;
  loadedAt?: Date;
  activatedAt?: Date;
  error?: string;
  config: Record<string, unknown>;
}

// ============================================================================
// Plugin Context & APIs
// ============================================================================

/**
 * Logger interface for plugins
 */
export interface PluginLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Storage interface for plugin data
 */
export interface PluginStorage {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
  clear(): Promise<void>;
  export(): Promise<Record<string, unknown>>;
  import(data: Record<string, unknown>): Promise<void>;
}

/**
 * Secrets interface for sensitive data
 */
export interface PluginSecrets {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Memory API for plugin access
 */
export interface MemoryAPI {
  queryPatterns(query: string, limit?: number): Promise<Pattern[]>;
  queryLearnings(filter: { tags?: string[]; limit?: number }): Promise<Learning[]>;
  storePattern?(pattern: Omit<Pattern, 'id' | 'createdAt' | 'lastUsedAt'>): Promise<Pattern>;
  storeLearning?(learning: Omit<Learning, 'id' | 'createdAt'>): Promise<Learning>;
}

/**
 * Brain info returned by brains API
 */
export interface BrainInfo {
  id: string;
  type: BrainType;
  name: string;
  description: string;
  capabilities: string[];
}

/**
 * Brain execution options
 */
export interface BrainExecuteOptions {
  timeout?: number;
  context?: Record<string, unknown>;
}

/**
 * Brain execution result
 */
export interface BrainResult {
  success: boolean;
  output?: unknown;
  error?: string;
  duration: number;
}

/**
 * Brains API for plugin access
 */
export interface BrainsAPI {
  list(): Promise<BrainInfo[]>;
  execute(brainId: string, task: string, options?: BrainExecuteOptions): Promise<BrainResult>;
  isAvailable(brainId: string): Promise<boolean>;
}

/**
 * Tool info returned by tools API
 */
export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

/**
 * Tool execution result
 */
export interface ToolResult<T = unknown> {
  success: boolean;
  output?: T;
  error?: string;
  duration: number;
}

/**
 * Tools API for plugin access
 */
export interface ToolsAPI {
  list(): Promise<ToolInfo[]>;
  execute<T = unknown>(toolId: string, params: unknown): Promise<ToolResult<T>>;
  isAvailable(toolId: string): Promise<boolean>;
}

/**
 * Session info
 */
export interface SessionInfo {
  id: string;
  brainType: BrainType;
  state: string;
  startedAt: Date;
}

/**
 * Sessions API
 */
export interface SessionsAPI {
  list(): Promise<SessionInfo[]>;
  get(sessionId: string): Promise<SessionInfo | undefined>;
}

/**
 * Event subscription
 */
export type EventHandler = (event: { type: string; data: unknown }) => void;

/**
 * Events API
 */
export interface EventsAPI {
  on(eventType: string, handler: EventHandler): Disposable;
  emit(eventType: string, data: unknown): void;
}

/**
 * X2000 APIs available to plugins (based on capabilities)
 */
export interface X2000API {
  readonly memory?: MemoryAPI;
  readonly brains?: BrainsAPI;
  readonly tools?: ToolsAPI;
  readonly sessions: SessionsAPI;
  readonly events: EventsAPI;
}

/**
 * Disposable for cleanup
 */
export interface Disposable {
  dispose(): void;
}

/**
 * Context provided to plugins during activation
 */
export interface PluginContext {
  readonly pluginId: string;
  readonly config: Readonly<Record<string, unknown>>;
  readonly logger: PluginLogger;
  readonly storage: PluginStorage;
  readonly secrets: PluginSecrets;
  readonly x2000: X2000API;
  readonly register: PluginRegistrar;
  readonly hooks: PluginHooks;
  readonly ipc: PluginIPC;
}

// ============================================================================
// Plugin Registration
// ============================================================================

/**
 * TypeBox-style schema for parameters
 */
export type TypeBoxSchema = Record<string, unknown>;

/**
 * Tool context passed during execution
 */
export interface ToolExecutionContext {
  brainType: BrainType;
  trustLevel: TrustLevel;
  sessionId: string;
  pluginId: string;
}

/**
 * Tool definition for registration
 */
export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: TypeBoxSchema;
  execute: (params: unknown, context: ToolExecutionContext) => Promise<ToolResult>;
}

/**
 * Brain definition for registration
 */
export interface BrainDefinition {
  id: string;
  name: string;
  description: string;
  specialty: string;
  defaultTrustLevel?: TrustLevel;
}

/**
 * Channel connection interface
 */
export interface ChannelConnection {
  send(message: unknown): Promise<void>;
  onMessage(handler: (message: unknown) => void): Disposable;
  close(): Promise<void>;
}

/**
 * Channel definition for registration
 */
export interface ChannelDefinition {
  id: string;
  name: string;
  description: string;
  configSchema: TypeBoxSchema;
  connect(config: unknown): Promise<ChannelConnection>;
}

/**
 * Guardrail action for checking
 */
export interface GuardrailAction {
  action: string;
  brain: BrainType;
  target?: string;
  payload?: unknown;
}

/**
 * Guardrail check result
 */
export interface GuardrailCheckResult {
  allowed: boolean;
  reason?: string;
  severity?: 'block' | 'warn' | 'audit';
}

/**
 * Guardrail definition for registration
 */
export interface GuardrailDefinition {
  id: string;
  name: string;
  description: string;
  layer: 1 | 2 | 3 | 4 | 5;
  check: (action: GuardrailAction) => Promise<GuardrailCheckResult>;
}

/**
 * Command definition for CLI/API
 */
export interface CommandDefinition {
  id: string;
  name: string;
  description: string;
  args: TypeBoxSchema;
  execute: (args: unknown) => Promise<unknown>;
}

/**
 * Registrar for adding extension points
 */
export interface PluginRegistrar {
  tool(definition: ToolDefinition): Disposable;
  brain(definition: BrainDefinition): Disposable;
  channel(definition: ChannelDefinition): Disposable;
  guardrail(definition: GuardrailDefinition): Disposable;
  command(definition: CommandDefinition): Disposable;
}

// ============================================================================
// Lifecycle Hooks
// ============================================================================

/**
 * All available hooks in X2000
 */
export type X2000Hook =
  // System Layer (4 hooks)
  | 'system:startup'
  | 'system:shutdown'
  | 'system:config_changed'
  | 'system:health_check'
  // Plugin Layer (4 hooks)
  | 'plugin:before_load'
  | 'plugin:after_load'
  | 'plugin:before_unload'
  | 'plugin:after_unload'
  // Session Layer (6 hooks)
  | 'session:created'
  | 'session:resumed'
  | 'session:paused'
  | 'session:ended'
  | 'session:context_updated'
  | 'session:state_changed'
  // Brain Layer (6 hooks)
  | 'brain:before_spawn'
  | 'brain:after_spawn'
  | 'brain:before_execute'
  | 'brain:after_execute'
  | 'brain:collaboration_start'
  | 'brain:collaboration_end'
  // Tool Layer (4 hooks)
  | 'tool:before_call'
  | 'tool:after_call'
  | 'tool:error'
  | 'tool:timeout'
  // Memory Layer (4 hooks)
  | 'memory:pattern_stored'
  | 'memory:learning_stored'
  | 'memory:query_executed'
  | 'memory:skill_shared'
  // Channel Layer (4 hooks)
  | 'channel:message_received'
  | 'channel:message_sending'
  | 'channel:message_sent'
  | 'channel:error';

/**
 * Hook payload types for type-safe hook handling
 */
export interface HookPayloads {
  'system:startup': { config: Record<string, unknown> };
  'system:shutdown': { reason: string };
  'system:config_changed': { oldConfig: Record<string, unknown>; newConfig: Record<string, unknown> };
  'system:health_check': { status: 'healthy' | 'degraded' | 'unhealthy' };

  'plugin:before_load': { pluginId: string; manifest: PluginManifest };
  'plugin:after_load': { pluginId: string; success: boolean };
  'plugin:before_unload': { pluginId: string; reason: string };
  'plugin:after_unload': { pluginId: string };

  'session:created': { sessionId: string; config: Record<string, unknown> };
  'session:resumed': { sessionId: string; state: Record<string, unknown> };
  'session:paused': { sessionId: string };
  'session:ended': { sessionId: string; result: unknown };
  'session:context_updated': { sessionId: string; context: Record<string, unknown> };
  'session:state_changed': { sessionId: string; oldState: string; newState: string };

  'brain:before_spawn': { brainType: BrainType; config: Record<string, unknown> };
  'brain:after_spawn': { brainId: string; brainType: BrainType };
  'brain:before_execute': { brainId: string; task: { subject: string; description: string } };
  'brain:after_execute': { brainId: string; result: { success: boolean; output?: unknown } };
  'brain:collaboration_start': { brainIds: string[]; topic: string };
  'brain:collaboration_end': { brainIds: string[]; consensus: boolean };

  'tool:before_call': { toolId: string; params: unknown };
  'tool:after_call': { toolId: string; result: ToolResult };
  'tool:error': { toolId: string; error: Error };
  'tool:timeout': { toolId: string; timeout: number };

  'memory:pattern_stored': { pattern: Pattern };
  'memory:learning_stored': { learning: Learning };
  'memory:query_executed': { query: string; results: number };
  'memory:skill_shared': { skill: Skill; fromBrain: BrainType; toBrain: BrainType };

  'channel:message_received': { channelId: string; message: unknown };
  'channel:message_sending': { channelId: string; message: unknown };
  'channel:message_sent': { channelId: string; messageId: string };
  'channel:error': { channelId: string; error: Error };
}

/**
 * Hook handler function
 */
export type HookHandler<T> = (payload: T) => void | Promise<void>;

/**
 * Intercept handler can modify payload
 */
export type InterceptHandler<T> = (payload: T) => T | Promise<T>;

/**
 * Hook registration options
 */
export interface HookOptions {
  priority?: number;
  timeout?: number;
  stopOnError?: boolean;
}

/**
 * Plugin hooks registration interface
 */
export interface PluginHooks {
  on<H extends X2000Hook>(
    hook: H,
    handler: HookHandler<HookPayloads[H]>,
    options?: HookOptions
  ): Disposable;

  once<H extends X2000Hook>(
    hook: H,
    handler: HookHandler<HookPayloads[H]>,
    options?: HookOptions
  ): Disposable;

  intercept<H extends X2000Hook>(
    hook: H,
    handler: InterceptHandler<HookPayloads[H]>,
    options?: HookOptions
  ): Disposable;
}

// ============================================================================
// Inter-Plugin Communication
// ============================================================================

/**
 * IPC message
 */
export interface IPCMessage {
  from: string;
  to: string;
  type: string;
  payload: unknown;
  replyTo?: string;
}

/**
 * IPC handler
 */
export type IPCHandler = (message: IPCMessage) => void | Promise<void>;

/**
 * Inter-plugin communication interface
 */
export interface PluginIPC {
  send(targetPluginId: string, type: string, payload: unknown): Promise<void>;
  request<T>(targetPluginId: string, type: string, payload: unknown, timeout?: number): Promise<T>;
  onMessage(type: string, handler: IPCHandler): Disposable;
  broadcast(type: string, payload: unknown): Promise<void>;
}

// ============================================================================
// Plugin Interface
// ============================================================================

/**
 * Serialized state for hot reload
 */
export interface SerializedState {
  version: string;
  data: Record<string, unknown>;
  metadata: {
    serializedAt: string;
    pluginVersion: string;
  };
}

/**
 * Base interface all plugins must implement
 */
export interface X2000Plugin {
  readonly manifest: PluginManifest;
  onLoad?(): Promise<void>;
  onActivate?(context: PluginContext): Promise<void>;
  onDeactivate?(): Promise<void>;
  onUnload?(): Promise<void>;
  onConfigChange?(newConfig: unknown, oldConfig: unknown): Promise<void>;
  serialize?(): Promise<SerializedState>;
  deserialize?(state: SerializedState): Promise<void>;
}

// ============================================================================
// Sandbox Types
// ============================================================================

/**
 * Sandbox configuration
 */
export interface SandboxConfig {
  memoryLimit: number;
  cpuTimeLimit: number;
  allowAsync: boolean;
}

/**
 * Sandbox memory usage
 */
export interface MemoryUsage {
  used: number;
  total: number;
  limit: number;
}

/**
 * Sandbox interface
 */
export interface Sandbox {
  id: string;
  execute(code: string): Promise<unknown>;
  call(fn: string, args: unknown[]): Promise<unknown>;
  getMemoryUsage(): MemoryUsage | null;
  dispose(): Promise<void>;
}

// ============================================================================
// Registry Types
// ============================================================================

/**
 * Plugin search query
 */
export interface PluginSearchQuery {
  text?: string;
  category?: string;
  tags?: string[];
  author?: string;
  minRating?: number;
  sortBy?: 'relevance' | 'downloads' | 'rating' | 'recent';
  limit?: number;
  offset?: number;
}

/**
 * Plugin search result summary
 */
export interface PluginSummary {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  icon?: string;
}

/**
 * Plugin search results
 */
export interface PluginSearchResult {
  total: number;
  plugins: PluginSummary[];
}

/**
 * Plugin statistics
 */
export interface PluginStats {
  totalDownloads: number;
  weeklyDownloads: number;
  dailyDownloads: number[];
  averageRating: number;
  reviewCount: number;
  dependents: string[];
}

/**
 * Plugin review
 */
export interface PluginReview {
  id: string;
  pluginId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Review input for submission
 */
export interface ReviewInput {
  rating: number;
  title: string;
  body: string;
}

/**
 * Publish result
 */
export interface PublishResult {
  success: boolean;
  version: string;
  error?: string;
}
