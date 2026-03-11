/**
 * X2000 Caching Layer
 *
 * High-performance caching with:
 * - LRU (Least Recently Used) eviction
 * - TTL (Time To Live) support
 * - Memory-based cache for development
 * - Redis adapter interface for production
 * - Cache statistics and monitoring
 */

// ============================================================================
// Types
// ============================================================================

export interface CacheEntry<T> {
  value: T;
  createdAt: number;
  lastAccessedAt: number;
  accessCount: number;
  ttl: number | null; // null = no expiration
}

export interface CacheOptions {
  /** Maximum number of entries in the cache */
  maxSize: number;
  /** Default TTL in milliseconds (null = no expiration) */
  defaultTtl: number | null;
  /** Enable LRU eviction */
  enableLru: boolean;
  /** Callback when an entry is evicted */
  onEvict?: (key: string, reason: 'lru' | 'ttl' | 'manual') => void;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

export interface CacheAdapter<T = unknown> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T, ttl?: number | null): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

// ============================================================================
// LRU Cache Implementation
// ============================================================================

export class LRUCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: CacheOptions;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  } = { hits: 0, misses: 0, evictions: 0 };

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      maxSize: options.maxSize ?? 1000,
      defaultTtl: options.defaultTtl ?? null,
      enableLru: options.enableLru ?? true,
      onEvict: options.onEvict,
    };
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check TTL expiration
    if (entry.ttl !== null && Date.now() > entry.createdAt + entry.ttl) {
      this.delete(key, 'ttl');
      this.stats.misses++;
      return undefined;
    }

    // Update access metadata for LRU
    entry.lastAccessedAt = Date.now();
    entry.accessCount++;

    // Move to end of Map (most recently used) for LRU
    if (this.options.enableLru) {
      this.cache.delete(key);
      this.cache.set(key, entry);
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T, ttl?: number | null): void {
    // Check if we need to evict
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLru();
    }

    const entry: CacheEntry<T> = {
      value,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 1,
      ttl: ttl !== undefined ? ttl : this.options.defaultTtl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if a key exists (without updating LRU)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check TTL
    if (entry.ttl !== null && Date.now() > entry.createdAt + entry.ttl) {
      this.delete(key, 'ttl');
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string, reason: 'lru' | 'ttl' | 'manual' = 'manual'): boolean {
    const existed = this.cache.delete(key);
    if (existed) {
      this.stats.evictions++;
      this.options.onEvict?.(key, reason);
    }
    return existed;
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  /**
   * Get or set with a factory function
   */
  getOrSet(key: string, factory: () => T, ttl?: number | null): T {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Async get or set with a factory function
   */
  async getOrSetAsync(
    key: string,
    factory: () => Promise<T>,
    ttl?: number | null
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Evict expired entries
   */
  evictExpired(): number {
    let evicted = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl !== null && now > entry.createdAt + entry.ttl) {
        this.delete(key, 'ttl');
        evicted++;
      }
    }

    return evicted;
  }

  /**
   * Evict least recently used entry
   */
  private evictLru(): void {
    if (!this.options.enableLru || this.cache.size === 0) return;

    // Map maintains insertion order, so first entry is least recently used
    const firstKey = this.cache.keys().next().value;
    if (firstKey !== undefined) {
      this.delete(firstKey, 'lru');
    }
  }
}

// ============================================================================
// Cache Manager (Namespaced Caches)
// ============================================================================

export class CacheManager {
  private caches: Map<string, LRUCache<unknown>> = new Map();
  private defaultOptions: Partial<CacheOptions>;

  constructor(defaultOptions: Partial<CacheOptions> = {}) {
    this.defaultOptions = {
      maxSize: 500,
      defaultTtl: 5 * 60 * 1000, // 5 minutes default
      enableLru: true,
      ...defaultOptions,
    };
  }

  /**
   * Get or create a namespaced cache
   */
  getCache<T>(namespace: string, options?: Partial<CacheOptions>): LRUCache<T> {
    if (!this.caches.has(namespace)) {
      this.caches.set(
        namespace,
        new LRUCache<T>({
          ...this.defaultOptions,
          ...options,
        })
      );
    }
    return this.caches.get(namespace) as LRUCache<T>;
  }

  /**
   * Clear a specific namespace
   */
  clearNamespace(namespace: string): void {
    this.caches.get(namespace)?.clear();
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Get aggregated stats across all caches
   */
  getAllStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    for (const [namespace, cache] of this.caches.entries()) {
      stats[namespace] = cache.getStats();
    }
    return stats;
  }

  /**
   * Evict expired entries from all caches
   */
  evictAllExpired(): number {
    let total = 0;
    for (const cache of this.caches.values()) {
      total += cache.evictExpired();
    }
    return total;
  }
}

// ============================================================================
// Redis Adapter Interface (for production use)
// ============================================================================

/**
 * Redis adapter interface for production deployments
 * Implement this interface to use Redis instead of in-memory cache
 */
export interface RedisAdapterConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

/**
 * Factory function type for creating Redis adapter
 * Users can provide their own Redis implementation
 */
export type RedisAdapterFactory = (
  config: RedisAdapterConfig
) => CacheAdapter<unknown>;

// ============================================================================
// Specialized Caches for X2000
// ============================================================================

/** Cache TTL constants */
export const CACHE_TTL = {
  /** Brain definitions rarely change */
  BRAIN_DEFINITIONS: 60 * 60 * 1000, // 1 hour
  /** Provider configs can be cached longer */
  PROVIDER_CONFIGS: 30 * 60 * 1000, // 30 minutes
  /** Memory queries should be short-lived */
  MEMORY_QUERIES: 2 * 60 * 1000, // 2 minutes
  /** Pattern matches can be cached briefly */
  PATTERN_MATCHES: 1 * 60 * 1000, // 1 minute
  /** Skill lookups */
  SKILL_LOOKUPS: 5 * 60 * 1000, // 5 minutes
} as const;

/** Cache namespace constants */
export const CACHE_NAMESPACE = {
  BRAIN_DEFINITIONS: 'brain-definitions',
  PROVIDER_CONFIGS: 'provider-configs',
  MEMORY_QUERIES: 'memory-queries',
  PATTERN_MATCHES: 'pattern-matches',
  SKILL_LOOKUPS: 'skill-lookups',
  AGENT_SESSIONS: 'agent-sessions',
} as const;

// ============================================================================
// Global Cache Manager Instance
// ============================================================================

export const cacheManager = new CacheManager({
  maxSize: 1000,
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  enableLru: true,
});

// Pre-configured caches for common use cases
export const brainCache = cacheManager.getCache<unknown>(
  CACHE_NAMESPACE.BRAIN_DEFINITIONS,
  { maxSize: 100, defaultTtl: CACHE_TTL.BRAIN_DEFINITIONS }
);

export const memoryQueryCache = cacheManager.getCache<unknown>(
  CACHE_NAMESPACE.MEMORY_QUERIES,
  { maxSize: 500, defaultTtl: CACHE_TTL.MEMORY_QUERIES }
);

export const patternCache = cacheManager.getCache<unknown>(
  CACHE_NAMESPACE.PATTERN_MATCHES,
  { maxSize: 200, defaultTtl: CACHE_TTL.PATTERN_MATCHES }
);

export const skillCache = cacheManager.getCache<unknown>(
  CACHE_NAMESPACE.SKILL_LOOKUPS,
  { maxSize: 200, defaultTtl: CACHE_TTL.SKILL_LOOKUPS }
);

// ============================================================================
// Cache Key Builders
// ============================================================================

/**
 * Build consistent cache keys
 */
export const cacheKeys = {
  brainDefinition: (brainType: string) => `brain:${brainType}`,
  memoryQuery: (queryHash: string) => `memory:query:${queryHash}`,
  patternMatch: (context: string) => `pattern:match:${hashString(context)}`,
  skillLookup: (category: string, brainType: string) =>
    `skill:${category}:${brainType}`,
  agentSession: (sessionId: string) => `session:${sessionId}`,
};

/**
 * Simple string hash for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create a cache key from a query object
 */
export function queryCacheKey(query: Record<string, unknown>): string {
  const sorted = Object.keys(query)
    .sort()
    .map((k) => `${k}:${JSON.stringify(query[k])}`)
    .join('|');
  return hashString(sorted);
}

// ============================================================================
// Exports
// ============================================================================

export default CacheManager;
