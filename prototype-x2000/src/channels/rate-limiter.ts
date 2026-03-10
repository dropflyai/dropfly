/**
 * X2000 Channel System - Rate Limit Manager
 *
 * Intelligent rate limiting with per-platform awareness.
 * Implements token bucket algorithm with exponential backoff and jitter.
 */

import type {
  PlatformType,
  RateLimitConfig,
  RateLimitState,
  BackoffState,
} from './types.js';

// ============================================================================
// Default Rate Limits
// ============================================================================

/**
 * Default rate limits per platform (requests per second)
 */
const DEFAULT_RATE_LIMITS: Record<PlatformType, number> = {
  // Priority 0 (Done)
  api: 100,
  discord: 50,
  slack: 20,
  // Priority 1
  telegram: 30,
  whatsapp: 80,
  signal: 10,
  // Priority 2
  imessage: 5,
  msteams: 50,
  matrix: 100,
  // Priority 3
  sms: 1,
  voice: 5,
  // Priority 4
  email: 10,
  irc: 50,
  mattermost: 50,
  googlechat: 30,
  line: 30,
  feishu: 30,
  twitch: 20,
  nostr: 50,
  zalo: 20,
  wechat: 20,
  nextcloud: 50,
  mumble: 20,
  rocketchat: 50,
  zulip: 50,
};

// ============================================================================
// Token Bucket
// ============================================================================

/**
 * Token bucket implementation for rate limiting
 */
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second

  constructor(options: { capacity: number; refillRate: number }) {
    this.capacity = options.capacity;
    this.refillRate = options.refillRate;
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Try to consume tokens from the bucket
   */
  tryConsume(count: number = 1): boolean {
    this.refill();

    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }

    return false;
  }

  /**
   * Get time until tokens will be available (ms)
   */
  getWaitTime(count: number = 1): number {
    this.refill();

    if (this.tokens >= count) {
      return 0;
    }

    const tokensNeeded = count - this.tokens;
    return Math.ceil((tokensNeeded / this.refillRate) * 1000);
  }

  /**
   * Get current token count
   */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const newTokens = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + newTokens);
    this.lastRefill = now;
  }

  /**
   * Get current state
   */
  getState(): { tokens: number; lastRefill: number } {
    return {
      tokens: this.tokens,
      lastRefill: this.lastRefill,
    };
  }
}

// ============================================================================
// Rate Limit Manager
// ============================================================================

/**
 * Manages rate limiting across all channels with per-platform awareness
 */
export class RateLimitManager {
  private buckets: Map<string, TokenBucket> = new Map();
  private backoffState: Map<string, BackoffState> = new Map();
  private platformConfigs: Map<PlatformType, RateLimitConfig> = new Map();

  // Singleton instance
  private static instance: RateLimitManager;

  constructor() {
    // Initialize default configs
    for (const [platform, limit] of Object.entries(DEFAULT_RATE_LIMITS)) {
      this.platformConfigs.set(platform as PlatformType, {
        platform: platform as PlatformType,
        requestsPerSecond: limit,
        burstCapacity: limit * 2, // 2x burst capacity
      });
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager();
    }
    return RateLimitManager.instance;
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Configure rate limits for a platform
   */
  configure(config: RateLimitConfig): void {
    this.platformConfigs.set(config.platform, config);

    // Clear existing buckets for this platform
    for (const key of this.buckets.keys()) {
      if (key.startsWith(`${config.platform}:`)) {
        this.buckets.delete(key);
      }
    }
  }

  /**
   * Get configuration for a platform
   */
  getConfig(platform: PlatformType): RateLimitConfig | undefined {
    return this.platformConfigs.get(platform);
  }

  // ============================================================================
  // Rate Limiting
  // ============================================================================

  /**
   * Try to acquire a rate limit token
   *
   * @param platform - The platform type
   * @param key - Additional key for per-channel/per-user limits (default: 'default')
   * @returns true if token acquired, false if rate limited
   */
  acquire(platform: PlatformType, key: string = 'default'): boolean {
    const bucketKey = `${platform}:${key}`;

    // Check backoff state first
    const backoff = this.backoffState.get(bucketKey);
    if (backoff && Date.now() < backoff.retryAfter) {
      return false;
    }

    // Get or create bucket
    const bucket = this.getOrCreateBucket(platform, bucketKey);
    return bucket.tryConsume(1);
  }

  /**
   * Try to acquire, waiting if necessary
   *
   * @param platform - The platform type
   * @param key - Additional key for per-channel/per-user limits
   * @param maxWait - Maximum time to wait in ms (default: 5000)
   * @returns true if token acquired, false if timeout exceeded
   */
  async acquireWithWait(
    platform: PlatformType,
    key: string = 'default',
    maxWait: number = 5000
  ): Promise<boolean> {
    const bucketKey = `${platform}:${key}`;

    // Check backoff state
    const backoff = this.backoffState.get(bucketKey);
    if (backoff) {
      const waitTime = backoff.retryAfter - Date.now();
      if (waitTime > maxWait) {
        return false;
      }
      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }

    // Get or create bucket
    const bucket = this.getOrCreateBucket(platform, bucketKey);

    // Check if immediate acquire is possible
    if (bucket.tryConsume(1)) {
      return true;
    }

    // Wait for token
    const waitTime = bucket.getWaitTime(1);
    if (waitTime > maxWait) {
      return false;
    }

    await this.sleep(waitTime);
    return bucket.tryConsume(1);
  }

  /**
   * Get wait time until rate limit allows request
   */
  getWaitTime(platform: PlatformType, key: string = 'default'): number {
    const bucketKey = `${platform}:${key}`;

    // Check backoff state
    const backoff = this.backoffState.get(bucketKey);
    if (backoff) {
      const backoffWait = backoff.retryAfter - Date.now();
      if (backoffWait > 0) {
        return backoffWait;
      }
    }

    // Check bucket
    const bucket = this.getOrCreateBucket(platform, bucketKey);
    return bucket.getWaitTime(1);
  }

  /**
   * Check if rate limited (without consuming)
   */
  isRateLimited(platform: PlatformType, key: string = 'default'): boolean {
    const bucketKey = `${platform}:${key}`;

    // Check backoff
    const backoff = this.backoffState.get(bucketKey);
    if (backoff && Date.now() < backoff.retryAfter) {
      return true;
    }

    // Check bucket
    const bucket = this.buckets.get(bucketKey);
    if (!bucket) {
      return false;
    }

    return bucket.getTokens() < 1;
  }

  // ============================================================================
  // Backoff Handling
  // ============================================================================

  /**
   * Handle a rate limit response from the platform
   * Implements exponential backoff with jitter
   *
   * @param platform - The platform type
   * @param retryAfter - Seconds until retry (from platform response)
   * @param key - Additional key for per-channel/per-user limits
   */
  handleRateLimited(
    platform: PlatformType,
    retryAfter: number = 1,
    key: string = 'default'
  ): void {
    const bucketKey = `${platform}:${key}`;

    // Get current backoff state
    const current = this.backoffState.get(bucketKey);
    const attempt = current ? current.attempt + 1 : 1;

    // Calculate exponential backoff with jitter
    const baseDelay = retryAfter * 1000;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.2 * exponentialDelay; // 20% jitter
    const totalDelay = Math.min(exponentialDelay + jitter, 60000); // Max 60s

    this.backoffState.set(bucketKey, {
      attempt,
      retryAfter: Date.now() + totalDelay,
    });

    console.log(
      `[RateLimiter] ${platform} rate limited, retry in ${Math.round(totalDelay)}ms (attempt ${attempt})`
    );
  }

  /**
   * Reset backoff state after successful operation
   */
  resetBackoff(platform: PlatformType, key: string = 'default'): void {
    const bucketKey = `${platform}:${key}`;
    this.backoffState.delete(bucketKey);
  }

  /**
   * Clear all backoff state for a platform
   */
  clearPlatformBackoff(platform: PlatformType): void {
    for (const key of this.backoffState.keys()) {
      if (key.startsWith(`${platform}:`)) {
        this.backoffState.delete(key);
      }
    }
  }

  // ============================================================================
  // Status & Metrics
  // ============================================================================

  /**
   * Get rate limit status for a platform
   */
  getStatus(platform: PlatformType, key: string = 'default'): RateLimitState {
    const bucketKey = `${platform}:${key}`;
    const bucket = this.buckets.get(bucketKey);
    const backoff = this.backoffState.get(bucketKey);

    return {
      tokens: bucket?.getTokens() ?? this.getConfig(platform)?.burstCapacity ?? 10,
      lastRefill: bucket?.getState().lastRefill ?? Date.now(),
      backoff,
    };
  }

  /**
   * Get all active rate limit states
   */
  getAllStatus(): Map<string, RateLimitState> {
    const status = new Map<string, RateLimitState>();

    for (const [key, bucket] of this.buckets) {
      const backoff = this.backoffState.get(key);
      status.set(key, {
        tokens: bucket.getTokens(),
        lastRefill: bucket.getState().lastRefill,
        backoff,
      });
    }

    return status;
  }

  /**
   * Get platforms currently in backoff
   */
  getPlatformsInBackoff(): PlatformType[] {
    const platforms = new Set<PlatformType>();

    for (const [key, backoff] of this.backoffState) {
      if (Date.now() < backoff.retryAfter) {
        const platform = key.split(':')[0] as PlatformType;
        platforms.add(platform);
      }
    }

    return Array.from(platforms);
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  /**
   * Get or create a token bucket for a key
   */
  private getOrCreateBucket(platform: PlatformType, bucketKey: string): TokenBucket {
    let bucket = this.buckets.get(bucketKey);

    if (!bucket) {
      const config = this.platformConfigs.get(platform) || {
        requestsPerSecond: DEFAULT_RATE_LIMITS[platform] || 10,
        burstCapacity: (DEFAULT_RATE_LIMITS[platform] || 10) * 2,
      };

      bucket = new TokenBucket({
        capacity: config.burstCapacity || config.requestsPerSecond * 2,
        refillRate: config.requestsPerSecond,
      });

      this.buckets.set(bucketKey, bucket);
    }

    return bucket;
  }

  /**
   * Sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Clear all state (for testing)
   */
  clear(): void {
    this.buckets.clear();
    this.backoffState.clear();
  }

  /**
   * Remove stale buckets and backoff states
   * (Buckets not used in the last hour)
   */
  cleanup(): void {
    const now = Date.now();
    const staleThreshold = 60 * 60 * 1000; // 1 hour

    // Clean up backoff states that have expired
    for (const [key, backoff] of this.backoffState) {
      if (now > backoff.retryAfter) {
        this.backoffState.delete(key);
      }
    }

    // Clean up stale buckets
    for (const [key, bucket] of this.buckets) {
      const state = bucket.getState();
      if (now - state.lastRefill > staleThreshold) {
        this.buckets.delete(key);
      }
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Singleton rate limit manager instance
 */
export const rateLimitManager = RateLimitManager.getInstance();

/**
 * Convenience function to check rate limit
 */
export function checkRateLimit(
  platform: PlatformType,
  key?: string
): boolean {
  return rateLimitManager.acquire(platform, key);
}

/**
 * Convenience function to check rate limit with wait
 */
export async function checkRateLimitWithWait(
  platform: PlatformType,
  key?: string,
  maxWait?: number
): Promise<boolean> {
  return rateLimitManager.acquireWithWait(platform, key, maxWait);
}

/**
 * Decorator for rate-limited methods
 */
export function rateLimit(platform: PlatformType, key?: string) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const acquired = await rateLimitManager.acquireWithWait(platform, key);

      if (!acquired) {
        throw new Error(`Rate limited on ${platform}`);
      }

      try {
        const result = await originalMethod.apply(this, args);
        rateLimitManager.resetBackoff(platform, key);
        return result;
      } catch (error) {
        // Check if it's a rate limit error from the platform
        if (isRateLimitError(error)) {
          const retryAfter = extractRetryAfter(error);
          rateLimitManager.handleRateLimited(platform, retryAfter, key);
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Check if an error is a rate limit error
 */
function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('429')
    );
  }
  return false;
}

/**
 * Extract retry-after value from error
 */
function extractRetryAfter(error: unknown): number {
  if (error instanceof Error) {
    // Try to parse retry-after from error message
    const match = error.message.match(/retry.?after[:\s]+(\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return 1; // Default 1 second
}
