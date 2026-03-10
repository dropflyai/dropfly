/**
 * LLM Provider Types
 *
 * Comprehensive type definitions for the LLM-agnostic provider system.
 * Supports multiple providers with unified interfaces.
 */

/**
 * Supported LLM providers
 */
export enum LLMProvider {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek',
  KIMI = 'kimi',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  META = 'meta',
  XAI = 'xai',
  GROQ = 'groq',
  TOGETHER = 'together',
  OLLAMA = 'ollama',
  OPENROUTER = 'openrouter',
}

/**
 * LLM configuration options
 */
export interface LLMConfig {
  /** The provider to use */
  provider: LLMProvider;
  /** Model name/identifier */
  model: string;
  /** API key (read from env if not provided) */
  apiKey?: string;
  /** Base URL override (useful for proxies, local servers) */
  baseUrl?: string;
  /** Additional provider-specific options */
  options?: LLMOptions;
}

/**
 * Additional LLM options
 */
export interface LLMOptions {
  /** Temperature for response randomness (0-2) */
  temperature?: number;
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Top-p nucleus sampling */
  topP?: number;
  /** Top-k sampling */
  topK?: number;
  /** Stop sequences */
  stopSequences?: string[];
  /** Presence penalty (-2 to 2) */
  presencePenalty?: number;
  /** Frequency penalty (-2 to 2) */
  frequencyPenalty?: number;
  /** System message/prompt */
  systemPrompt?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Enable JSON mode if supported */
  jsonMode?: boolean;
  /** Additional headers */
  headers?: Record<string, string>;
}

/**
 * Message roles
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * Tool call definition within a message
 */
export interface ToolCall {
  /** Unique identifier for this tool call */
  id: string;
  /** Tool/function name */
  name: string;
  /** Arguments as JSON string or object */
  arguments: string | Record<string, unknown>;
}

/**
 * Tool result to send back
 */
export interface ToolResult {
  /** ID of the tool call this is responding to */
  toolCallId: string;
  /** Result content */
  content: string;
  /** Whether the tool call was successful */
  isError?: boolean;
}

/**
 * Content block types
 */
export type ContentBlock =
  | TextContent
  | ImageContent
  | ToolUseContent
  | ToolResultContent;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  /** Base64 encoded image data or URL */
  source: {
    type: 'base64' | 'url';
    mediaType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data?: string;
    url?: string;
  };
}

export interface ToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultContent {
  type: 'tool_result';
  toolUseId: string;
  content: string;
  isError?: boolean;
}

/**
 * LLM message format
 */
export interface LLMMessage {
  /** Message role */
  role: MessageRole;
  /** Message content (string or structured content blocks) */
  content: string | ContentBlock[];
  /** Tool calls made by the assistant */
  toolCalls?: ToolCall[];
  /** Tool results from previous tool calls */
  toolResults?: ToolResult[];
  /** Optional name for the message sender */
  name?: string;
}

/**
 * Usage statistics
 */
export interface LLMUsage {
  /** Input/prompt tokens */
  inputTokens: number;
  /** Output/completion tokens */
  outputTokens: number;
  /** Total tokens */
  totalTokens: number;
  /** Estimated cost in USD (if calculable) */
  estimatedCost?: number;
}

/**
 * Finish reasons
 */
export type FinishReason =
  | 'stop'           // Natural completion
  | 'length'         // Max tokens reached
  | 'tool_calls'     // Waiting for tool results
  | 'content_filter' // Blocked by safety filter
  | 'error';         // An error occurred

/**
 * LLM response
 */
export interface LLMResponse {
  /** Response content */
  content: string;
  /** Tool calls if any */
  toolCalls?: ToolCall[];
  /** Usage statistics */
  usage: LLMUsage;
  /** Reason for completion */
  finishReason: FinishReason;
  /** Raw response from provider (for debugging) */
  raw?: unknown;
  /** Model used */
  model: string;
  /** Response ID if available */
  id?: string;
}

/**
 * Streaming chunk
 */
export interface LLMStreamChunk {
  /** Content delta */
  content?: string;
  /** Tool call delta */
  toolCallDelta?: {
    id?: string;
    name?: string;
    arguments?: string;
  };
  /** Whether this is the final chunk */
  done: boolean;
  /** Finish reason (only on final chunk) */
  finishReason?: FinishReason;
  /** Usage (only on final chunk) */
  usage?: LLMUsage;
}

/**
 * JSON Schema for tool parameters
 */
export interface JSONSchema {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array' | 'null';
  description?: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: (string | number | boolean | null)[];
  const?: unknown;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  additionalProperties?: boolean | JSONSchema;
}

/**
 * Tool/function definition
 */
export interface ToolDefinition {
  /** Tool name (alphanumeric, underscores, hyphens) */
  name: string;
  /** Description of what the tool does */
  description: string;
  /** JSON Schema for the parameters */
  parameters: JSONSchema;
  /** Whether the tool is required to be called */
  required?: boolean;
}

/**
 * Provider capabilities
 */
export interface LLMCapabilities {
  /** Supports streaming responses */
  streaming: boolean;
  /** Supports tool/function calling */
  toolCalling: boolean;
  /** Supports vision/image inputs */
  vision: boolean;
  /** Supports JSON mode */
  jsonMode: boolean;
  /** Supports system messages */
  systemMessages: boolean;
  /** Maximum context length */
  maxContextLength: number;
  /** Maximum output tokens */
  maxOutputTokens: number;
  /** Supports multiple tool calls per response */
  parallelToolCalls?: boolean;
}

/**
 * Model information
 */
export interface ModelInfo {
  /** Model identifier */
  id: string;
  /** Display name */
  name: string;
  /** Provider */
  provider: LLMProvider;
  /** Capabilities */
  capabilities: LLMCapabilities;
  /** Cost per 1M input tokens (USD) */
  inputCostPer1M?: number;
  /** Cost per 1M output tokens (USD) */
  outputCostPer1M?: number;
  /** Model context length */
  contextLength: number;
  /** Whether the model is deprecated */
  deprecated?: boolean;
  /** Release date */
  releaseDate?: string;
}

/**
 * Chat options for a single request
 */
export interface ChatOptions extends LLMOptions {
  /** Tools available for this request */
  tools?: ToolDefinition[];
  /** Tool choice strategy */
  toolChoice?: 'auto' | 'none' | 'required' | { name: string };
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Streaming options
 */
export interface StreamOptions extends ChatOptions {
  /** Callback for each chunk */
  onChunk?: (chunk: LLMStreamChunk) => void;
  /** Callback for tool calls */
  onToolCall?: (toolCall: ToolCall) => void;
}

/**
 * Error types
 */
export enum LLMErrorType {
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  INVALID_REQUEST = 'invalid_request',
  CONTEXT_LENGTH = 'context_length',
  CONTENT_FILTER = 'content_filter',
  SERVER_ERROR = 'server_error',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * LLM error
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public type: LLMErrorType,
    public provider: LLMProvider,
    public statusCode?: number,
    public retryable: boolean = false,
    public raw?: unknown
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Provider registry entry
 */
export interface ProviderRegistryEntry {
  /** Provider enum value */
  provider: LLMProvider;
  /** Available models */
  models: ModelInfo[];
  /** Default model */
  defaultModel: string;
  /** Create a client instance */
  createClient: (config: Partial<LLMConfig>) => BaseLLMClient;
  /** Environment variable name for API key */
  envKey: string;
  /** Default base URL */
  defaultBaseUrl: string;
}

/**
 * Base LLM client interface
 */
export interface BaseLLMClient {
  /** Provider */
  readonly provider: LLMProvider;
  /** Model */
  readonly model: string;
  /** Capabilities */
  readonly capabilities: LLMCapabilities;

  /** Send a chat message and get a response */
  chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse>;

  /** Stream a chat response */
  stream(messages: LLMMessage[], options?: StreamOptions): AsyncIterable<LLMStreamChunk>;

  /** Chat with tool calling */
  toolCall(
    messages: LLMMessage[],
    tools: ToolDefinition[],
    options?: ChatOptions
  ): Promise<LLMResponse>;

  /** Count tokens for messages */
  countTokens(messages: LLMMessage[]): Promise<number>;

  /** Calculate cost for usage */
  calculateCost(usage: LLMUsage): number;

  /** Get model info */
  getModelInfo(): ModelInfo;
}

/**
 * Fallback configuration
 */
export interface FallbackConfig {
  /** Primary provider config */
  primary: LLMConfig;
  /** Fallback providers in order */
  fallbacks: LLMConfig[];
  /** Max retries before falling back */
  maxRetries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
  /** Errors that should trigger fallback */
  fallbackOn?: LLMErrorType[];
}

/**
 * Usage tracking entry
 */
export interface UsageEntry {
  timestamp: Date;
  provider: LLMProvider;
  model: string;
  usage: LLMUsage;
  cost: number;
  success: boolean;
  latencyMs: number;
}
