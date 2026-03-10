/**
 * X2000 Plugin System - Registry Client
 *
 * Client for interacting with the X2000 plugin registry.
 * Features:
 * - Plugin search and discovery
 * - Plugin download and installation
 * - Version checking and updates
 * - Statistics and reviews
 */

import type {
  PluginManifest,
  PluginSearchQuery,
  PluginSearchResult,
  PluginSummary,
  PluginStats,
  PluginReview,
  ReviewInput,
  PublishResult,
} from './types.js';

// ============================================================================
// Types
// ============================================================================

interface RegistryConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  cacheDir?: string;
}

interface CachedManifest {
  manifest: PluginManifest;
  fetchedAt: Date;
  expiresAt: Date;
}

interface DownloadProgress {
  pluginId: string;
  version: string;
  bytesDownloaded: number;
  totalBytes: number;
  percent: number;
}

type ProgressCallback = (progress: DownloadProgress) => void;

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: RegistryConfig = {
  baseUrl: 'https://registry.x2000.dropfly.io',
  timeout: 30000,
};

// ============================================================================
// Registry Error
// ============================================================================

export class RegistryError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly pluginId?: string
  ) {
    super(message);
    this.name = 'RegistryError';
  }
}

// ============================================================================
// Plugin Registry Client
// ============================================================================

/**
 * Client for the X2000 plugin registry
 */
export class PluginRegistry {
  private config: RegistryConfig;
  private manifestCache: Map<string, CachedManifest> = new Map();
  private versionCache: Map<string, { versions: string[]; fetchedAt: Date }> = new Map();

  constructor(config: Partial<RegistryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // Search & Discovery
  // ============================================================================

  /**
   * Search for plugins
   */
  async search(query: PluginSearchQuery): Promise<PluginSearchResult> {
    const params = new URLSearchParams();

    if (query.text) params.set('q', query.text);
    if (query.category) params.set('category', query.category);
    if (query.tags?.length) params.set('tags', query.tags.join(','));
    if (query.author) params.set('author', query.author);
    if (query.minRating) params.set('minRating', query.minRating.toString());
    if (query.sortBy) params.set('sort', query.sortBy);
    if (query.limit) params.set('limit', query.limit.toString());
    if (query.offset) params.set('offset', query.offset.toString());

    try {
      const response = await this.fetch(`/plugins/search?${params.toString()}`);
      return response as PluginSearchResult;
    } catch (error) {
      // For development/offline, return empty results
      console.warn('[Registry] Search failed, returning empty results:', error);
      return { total: 0, plugins: [] };
    }
  }

  /**
   * Get featured plugins
   */
  async getFeatured(): Promise<PluginSummary[]> {
    try {
      const response = await this.fetch('/plugins/featured');
      return response as PluginSummary[];
    } catch (error) {
      console.warn('[Registry] Failed to get featured plugins:', error);
      return [];
    }
  }

  /**
   * Get popular plugins
   */
  async getPopular(limit: number = 10): Promise<PluginSummary[]> {
    return this.search({ sortBy: 'downloads', limit }).then(r => r.plugins);
  }

  /**
   * Get recent plugins
   */
  async getRecent(limit: number = 10): Promise<PluginSummary[]> {
    return this.search({ sortBy: 'recent', limit }).then(r => r.plugins);
  }

  // ============================================================================
  // Plugin Information
  // ============================================================================

  /**
   * Get plugin manifest
   */
  async getManifest(id: string, version?: string): Promise<PluginManifest> {
    const cacheKey = `${id}@${version ?? 'latest'}`;

    // Check cache
    const cached = this.manifestCache.get(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
      return cached.manifest;
    }

    try {
      const endpoint = version
        ? `/plugins/${encodeURIComponent(id)}/versions/${version}`
        : `/plugins/${encodeURIComponent(id)}`;

      const manifest = await this.fetch(endpoint) as PluginManifest;

      // Cache for 5 minutes
      this.manifestCache.set(cacheKey, {
        manifest,
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      return manifest;
    } catch (error) {
      throw new RegistryError(
        `Failed to get manifest for ${id}${version ? `@${version}` : ''}`,
        undefined,
        id
      );
    }
  }

  /**
   * Get all versions of a plugin
   */
  async getVersions(id: string): Promise<string[]> {
    // Check cache (1 minute)
    const cached = this.versionCache.get(id);
    if (cached && Date.now() - cached.fetchedAt.getTime() < 60000) {
      return cached.versions;
    }

    try {
      const response = await this.fetch(`/plugins/${encodeURIComponent(id)}/versions`);
      const versions = (response as { versions: string[] }).versions;

      this.versionCache.set(id, {
        versions,
        fetchedAt: new Date(),
      });

      return versions;
    } catch (error) {
      throw new RegistryError(`Failed to get versions for ${id}`, undefined, id);
    }
  }

  /**
   * Check if a specific version exists
   */
  async versionExists(id: string, version: string): Promise<boolean> {
    try {
      const versions = await this.getVersions(id);
      return versions.includes(version);
    } catch {
      return false;
    }
  }

  /**
   * Get plugin statistics
   */
  async getStats(id: string): Promise<PluginStats> {
    try {
      const response = await this.fetch(`/plugins/${encodeURIComponent(id)}/stats`);
      return response as PluginStats;
    } catch (error) {
      // Return default stats if unavailable
      return {
        totalDownloads: 0,
        weeklyDownloads: 0,
        dailyDownloads: [],
        averageRating: 0,
        reviewCount: 0,
        dependents: [],
      };
    }
  }

  // ============================================================================
  // Download
  // ============================================================================

  /**
   * Download plugin tarball
   */
  async download(
    id: string,
    version: string,
    onProgress?: ProgressCallback
  ): Promise<Buffer> {
    const url = `${this.config.baseUrl}/plugins/${encodeURIComponent(id)}/-/${version}.tgz`;

    try {
      // For now, use a simple fetch
      // In production, this would stream the download with progress
      const response = await fetch(url, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.timeout * 5), // Longer timeout for downloads
      });

      if (!response.ok) {
        throw new RegistryError(
          `Download failed: ${response.statusText}`,
          response.status,
          id
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Report completion
      if (onProgress) {
        onProgress({
          pluginId: id,
          version,
          bytesDownloaded: buffer.length,
          totalBytes: buffer.length,
          percent: 100,
        });
      }

      return buffer;
    } catch (error) {
      if (error instanceof RegistryError) {
        throw error;
      }
      throw new RegistryError(
        `Failed to download ${id}@${version}: ${error}`,
        undefined,
        id
      );
    }
  }

  /**
   * Check for updates to a plugin
   */
  async checkForUpdates(
    id: string,
    currentVersion: string
  ): Promise<{ hasUpdate: boolean; latestVersion: string; changelog?: string }> {
    try {
      const manifest = await this.getManifest(id);
      const hasUpdate = this.isNewerVersion(manifest.version, currentVersion);

      return {
        hasUpdate,
        latestVersion: manifest.version,
        // changelog would come from registry API
      };
    } catch {
      return {
        hasUpdate: false,
        latestVersion: currentVersion,
      };
    }
  }

  /**
   * Check for updates to multiple plugins
   */
  async checkForBulkUpdates(
    plugins: Array<{ id: string; version: string }>
  ): Promise<Map<string, { hasUpdate: boolean; latestVersion: string }>> {
    const results = new Map<string, { hasUpdate: boolean; latestVersion: string }>();

    await Promise.all(
      plugins.map(async ({ id, version }) => {
        const update = await this.checkForUpdates(id, version);
        results.set(id, {
          hasUpdate: update.hasUpdate,
          latestVersion: update.latestVersion,
        });
      })
    );

    return results;
  }

  // ============================================================================
  // Reviews
  // ============================================================================

  /**
   * Get plugin reviews
   */
  async getReviews(
    id: string,
    options?: { limit?: number; offset?: number }
  ): Promise<PluginReview[]> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.offset) params.set('offset', options.offset.toString());

      const response = await this.fetch(
        `/plugins/${encodeURIComponent(id)}/reviews?${params.toString()}`
      );
      return (response as { reviews: PluginReview[] }).reviews;
    } catch {
      return [];
    }
  }

  /**
   * Submit a review
   */
  async submitReview(id: string, review: ReviewInput): Promise<PluginReview> {
    const response = await this.fetch(
      `/plugins/${encodeURIComponent(id)}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify(review),
      }
    );
    return response as PluginReview;
  }

  // ============================================================================
  // Publishing
  // ============================================================================

  /**
   * Publish a new plugin version
   */
  async publish(tarball: Buffer, manifest: PluginManifest): Promise<PublishResult> {
    if (!this.config.apiKey) {
      throw new RegistryError('API key required for publishing');
    }

    try {
      // Create form data with tarball and manifest
      const formData = new FormData();
      // Convert Buffer to Uint8Array for Blob compatibility
      formData.append('tarball', new Blob([new Uint8Array(tarball)]), `${manifest.id}-${manifest.version}.tgz`);
      formData.append('manifest', JSON.stringify(manifest));

      const response = await fetch(`${this.config.baseUrl}/plugins/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: formData,
        signal: AbortSignal.timeout(this.config.timeout * 5),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        return {
          success: false,
          version: manifest.version,
          error: error.error || 'Publish failed',
        };
      }

      return {
        success: true,
        version: manifest.version,
      };
    } catch (error) {
      return {
        success: false,
        version: manifest.version,
        error: String(error),
      };
    }
  }

  /**
   * Deprecate a version
   */
  async deprecate(id: string, version: string, message: string): Promise<void> {
    await this.fetch(`/plugins/${encodeURIComponent(id)}/versions/${version}/deprecate`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Unpublish a version (if allowed)
   */
  async unpublish(id: string, version: string): Promise<void> {
    await this.fetch(`/plugins/${encodeURIComponent(id)}/versions/${version}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Validate a plugin manifest
   */
  validateManifest(manifest: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!manifest || typeof manifest !== 'object') {
      return { valid: false, errors: ['Manifest must be an object'] };
    }

    const m = manifest as Record<string, unknown>;

    // Required fields
    if (!m.id || typeof m.id !== 'string') {
      errors.push('Missing or invalid "id" field');
    } else if (!/^@?[a-z0-9-]+\/[a-z0-9-]+$|^[a-z0-9-]+$/.test(m.id)) {
      errors.push('Invalid "id" format. Use lowercase letters, numbers, and hyphens');
    }

    if (!m.version || typeof m.version !== 'string') {
      errors.push('Missing or invalid "version" field');
    } else if (!/^\d+\.\d+\.\d+/.test(m.version)) {
      errors.push('Invalid "version" format. Use semver (e.g., 1.0.0)');
    }

    if (!m.name || typeof m.name !== 'string') {
      errors.push('Missing or invalid "name" field');
    }

    if (!m.description || typeof m.description !== 'string') {
      errors.push('Missing or invalid "description" field');
    }

    if (!m.main || typeof m.main !== 'string') {
      errors.push('Missing or invalid "main" field');
    }

    if (!m.license || typeof m.license !== 'string') {
      errors.push('Missing or invalid "license" field');
    }

    if (!m.author || typeof m.author !== 'object') {
      errors.push('Missing or invalid "author" field');
    }

    if (!m.engines || typeof m.engines !== 'object') {
      errors.push('Missing or invalid "engines" field');
    }

    if (!m.provides || typeof m.provides !== 'object') {
      errors.push('Missing or invalid "provides" field');
    }

    if (!m.capabilities || typeof m.capabilities !== 'object') {
      errors.push('Missing or invalid "capabilities" field');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear the manifest cache
   */
  clearCache(): void {
    this.manifestCache.clear();
    this.versionCache.clear();
  }

  /**
   * Get registry health status
   */
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.fetch('/health');
      return {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
      };
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new RegistryError(
        `Registry request failed: ${response.statusText}`,
        response.status
      );
    }

    return response.json();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'X2000-Plugin-System/1.0',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  private isNewerVersion(a: string, b: string): boolean {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if ((partsA[i] ?? 0) > (partsB[i] ?? 0)) return true;
      if ((partsA[i] ?? 0) < (partsB[i] ?? 0)) return false;
    }

    return false;
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

/**
 * Create a new registry client
 */
export function createPluginRegistry(config?: Partial<RegistryConfig>): PluginRegistry {
  return new PluginRegistry(config);
}

/**
 * Default registry client instance
 */
export const pluginRegistry = new PluginRegistry();
