/**
 * X2000 Web Search - Safety Filter
 *
 * Provides safety filtering for web search results:
 * - Google Safe Browsing API integration
 * - Custom blocklist support
 * - URL reputation checking
 */

// ============================================================================
// Types
// ============================================================================

export interface SafetyConfig {
  /** Google Safe Browsing API key */
  safeBrowsingApiKey?: string;
  /** Custom blocked domains */
  customBlocklist?: string[];
  /** Adult content filter strength */
  adultFilterStrength: 'strict' | 'moderate' | 'off';
  /** Cache TTL in milliseconds (default: 24 hours) */
  cacheTtlMs?: number;
}

export interface SafetyResult {
  safe: boolean;
  threats?: string[];
  checkedAt: string;
}

export interface SafetyFilterResult {
  safe: SearchResultWithSafety[];
  filtered: SearchResultWithSafety[];
  stats: {
    total: number;
    safeCount: number;
    filteredCount: number;
    blockedByThreat: number;
    blockedByBlocklist: number;
  };
}

export interface SearchResultWithSafety {
  url: string;
  domain: string;
  title?: string;
  description?: string;
  safety?: SafetyResult;
  [key: string]: unknown;
}

interface SafeBrowsingMatch {
  threatType: string;
  threat: { url: string };
  cacheDuration?: string;
}

interface SafeBrowsingResponse {
  matches?: SafeBrowsingMatch[];
}

interface CacheEntry {
  safe: boolean;
  threats: string[];
  checkedAt: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SAFE_BROWSING_API_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

const THREAT_TYPES = [
  'MALWARE',
  'SOCIAL_ENGINEERING',
  'UNWANTED_SOFTWARE',
  'POTENTIALLY_HARMFUL_APPLICATION',
] as const;

// Default blocklist of known malicious/spam domains
const DEFAULT_BLOCKLIST = [
  // Add known bad actors here
  'malware-domain.example',
  'phishing-site.example',
];

// ============================================================================
// Safety Filter Class
// ============================================================================

export class SafetyFilter {
  private config: SafetyConfig;
  private safeBrowsingCache = new Map<string, CacheEntry>();
  private readonly cacheTtlMs: number;

  constructor(config: Partial<SafetyConfig> = {}) {
    this.config = {
      adultFilterStrength: 'moderate',
      customBlocklist: [],
      ...config,
    };
    this.cacheTtlMs = config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
  }

  /**
   * Configure the safety filter
   */
  configure(config: Partial<SafetyConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Filter search results for safety
   */
  async filter(results: SearchResultWithSafety[]): Promise<SafetyFilterResult> {
    const safe: SearchResultWithSafety[] = [];
    const filtered: SearchResultWithSafety[] = [];
    let blockedByThreat = 0;
    let blockedByBlocklist = 0;

    // Batch check URLs with Safe Browsing API
    const urlsToCheck = results
      .map((r) => r.url)
      .filter((url) => !this.isCached(url));

    if (urlsToCheck.length > 0 && this.config.safeBrowsingApiKey) {
      await this.batchSafeBrowsingCheck(urlsToCheck);
    }

    for (const result of results) {
      const safety = this.checkUrl(result.url);

      // Check Safe Browsing result
      if (!safety.safe) {
        filtered.push({ ...result, safety });
        blockedByThreat++;
        continue;
      }

      // Check blocklist
      if (this.isBlocklisted(result.domain)) {
        const blocklistSafety: SafetyResult = {
          safe: false,
          threats: ['CUSTOM_BLOCKLIST'],
          checkedAt: new Date().toISOString(),
        };
        filtered.push({ ...result, safety: blocklistSafety });
        blockedByBlocklist++;
        continue;
      }

      safe.push({ ...result, safety });
    }

    return {
      safe,
      filtered,
      stats: {
        total: results.length,
        safeCount: safe.length,
        filteredCount: filtered.length,
        blockedByThreat,
        blockedByBlocklist,
      },
    };
  }

  /**
   * Check a single URL for safety (uses cache)
   */
  checkUrl(url: string): SafetyResult {
    const cached = this.safeBrowsingCache.get(url);
    if (cached && Date.now() - cached.checkedAt < this.cacheTtlMs) {
      return {
        safe: cached.safe,
        threats: cached.threats.length > 0 ? cached.threats : undefined,
        checkedAt: new Date(cached.checkedAt).toISOString(),
      };
    }

    // Default to safe if not checked (fail-open for availability)
    return { safe: true, checkedAt: new Date().toISOString() };
  }

  /**
   * Check if a URL is in the cache
   */
  private isCached(url: string): boolean {
    const cached = this.safeBrowsingCache.get(url);
    return cached !== undefined && Date.now() - cached.checkedAt < this.cacheTtlMs;
  }

  /**
   * Batch check URLs with Google Safe Browsing API
   */
  private async batchSafeBrowsingCheck(urls: string[]): Promise<void> {
    if (!this.config.safeBrowsingApiKey) return;

    try {
      const response = await fetch(
        `${SAFE_BROWSING_API_URL}?key=${this.config.safeBrowsingApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: { clientId: 'x2000-web-search', clientVersion: '1.0.0' },
            threatInfo: {
              threatTypes: THREAT_TYPES,
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: urls.map((url) => ({ url })),
            },
          }),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) {
        console.warn(`[SafetyFilter] Safe Browsing API returned ${response.status}`);
        return;
      }

      const data = (await response.json()) as SafeBrowsingResponse;
      const threats = new Map<string, string[]>();

      for (const match of data.matches || []) {
        const url = match.threat?.url;
        if (url) {
          if (!threats.has(url)) threats.set(url, []);
          threats.get(url)!.push(match.threatType);
        }
      }

      // Update cache
      const now = Date.now();
      for (const url of urls) {
        const urlThreats = threats.get(url) || [];
        this.safeBrowsingCache.set(url, {
          safe: urlThreats.length === 0,
          threats: urlThreats,
          checkedAt: now,
        });
      }

      // Clean old cache entries periodically
      if (this.safeBrowsingCache.size > 10000) {
        this.cleanCache();
      }
    } catch (error) {
      // Fail open - don't block results if API fails
      console.warn('[SafetyFilter] Safe Browsing API error:', error);
    }
  }

  /**
   * Check if a domain is in the blocklist
   */
  private isBlocklisted(domain: string): boolean {
    const normalizedDomain = domain.toLowerCase();
    const combinedBlocklist = [
      ...DEFAULT_BLOCKLIST,
      ...(this.config.customBlocklist || []),
    ];

    return combinedBlocklist.some(
      (blocked) =>
        normalizedDomain === blocked.toLowerCase() ||
        normalizedDomain.endsWith(`.${blocked.toLowerCase()}`)
    );
  }

  /**
   * Clean old entries from cache
   */
  private cleanCache(): void {
    const now = Date.now();
    for (const [url, entry] of this.safeBrowsingCache) {
      if (now - entry.checkedAt > this.cacheTtlMs) {
        this.safeBrowsingCache.delete(url);
      }
    }
  }

  /**
   * Add domains to the blocklist
   */
  addToBlocklist(domains: string[]): void {
    this.config.customBlocklist = [
      ...(this.config.customBlocklist || []),
      ...domains,
    ];
  }

  /**
   * Remove domains from the blocklist
   */
  removeFromBlocklist(domains: string[]): void {
    const domainsSet = new Set(domains.map((d) => d.toLowerCase()));
    this.config.customBlocklist = (this.config.customBlocklist || []).filter(
      (d) => !domainsSet.has(d.toLowerCase())
    );
  }

  /**
   * Get current blocklist
   */
  getBlocklist(): string[] {
    return [...DEFAULT_BLOCKLIST, ...(this.config.customBlocklist || [])];
  }

  /**
   * Clear the safety cache
   */
  clearCache(): void {
    this.safeBrowsingCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; oldestEntry: number | null } {
    let oldest: number | null = null;
    for (const entry of this.safeBrowsingCache.values()) {
      if (oldest === null || entry.checkedAt < oldest) {
        oldest = entry.checkedAt;
      }
    }
    return {
      size: this.safeBrowsingCache.size,
      oldestEntry: oldest,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const safetyFilter = new SafetyFilter();

export function createSafetyFilter(config?: Partial<SafetyConfig>): SafetyFilter {
  return new SafetyFilter(config);
}
