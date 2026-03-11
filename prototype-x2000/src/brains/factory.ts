/**
 * X2000 Brain Factory
 *
 * Uses SDK brain definitions as the single source of truth.
 * Only CEO Brain has a class implementation; other brains run through the SDK.
 *
 * Performance Optimizations:
 * - Lazy loading of brain modules
 * - LRU cache for brain instances with TTL
 * - Lazy metadata loading
 * - Preloading of commonly used brains
 */

import type { BrainType, BrainConfig, TrustLevel } from '../types/index.js';
import { BaseBrain } from './base.js';
import { allBrainNames, brainDefinitions, type BrainDefinition } from '../sdk/brain-definitions.js';
import {
  LRUCache,
  brainCache as globalBrainCache,
  CACHE_TTL,
  cacheKeys,
} from '../cache/index.js';

// ============================================================================
// Brain Registry
// ============================================================================

interface BrainModule {
  default: new (config: BrainConfig) => BaseBrain;
}

type BrainLoader = () => Promise<BrainModule>;

// Only CEO Brain has a real class implementation
// All other brains use SDK agent definitions
const brainLoaders: Record<string, BrainLoader> = {
  ceo: () => import('./ceo/index.js'),
};

// Cache for loaded brain instances with TTL
const brainInstanceCache = new LRUCache<BaseBrain>({
  maxSize: 50,
  defaultTtl: CACHE_TTL.BRAIN_DEFINITIONS,
  onEvict: (key, reason) => {
    console.debug(`[BrainFactory] Brain evicted: ${key} (${reason})`);
  },
});

// Lazy-loaded metadata cache
const brainMetadataCache = new LRUCache<{
  name: string;
  description: string;
  capabilities: string[];
}>({
  maxSize: 100,
  defaultTtl: CACHE_TTL.BRAIN_DEFINITIONS,
});

// Track preloaded brains
const preloadedBrains = new Set<string>();

// Commonly used brains that should be preloaded
const PRIORITY_BRAINS = ['ceo', 'engineering', 'product', 'design', 'qa'];

// Legacy cache reference for backwards compatibility
const brainCache = brainInstanceCache;

// ============================================================================
// Brain Factory
// ============================================================================

export class BrainFactory {
  private isPreloading = false;
  private preloadPromise: Promise<void> | null = null;

  /**
   * Get a brain instance by type
   * Only CEO has a class implementation; other brains are SDK-only
   */
  async getBrain(type: BrainType | string, trustLevel: TrustLevel = 2): Promise<BaseBrain> {
    // Check cache first
    const cacheKey = cacheKeys.brainDefinition(`${type}-${trustLevel}`);
    const cached = brainInstanceCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Load the brain module (only CEO has class implementation)
    const loader = brainLoaders[type];
    if (!loader) {
      // For non-CEO brains, check if it exists in SDK definitions
      if (this.hasBrain(type)) {
        throw new Error(
          `Brain '${type}' is defined in SDK but has no class implementation. ` +
          `Use the SDK orchestrator (runBrain) instead of factory for this brain.`
        );
      }
      throw new Error(`Unknown brain type: ${type}`);
    }

    try {
      const module = await loader();
      const BrainClass = module.default;

      // Use lazy-loaded metadata if available
      const metadata = this.getBrainMetadataLazy(type);

      const config: BrainConfig = {
        type: type as BrainType,
        name: metadata.name,
        description: metadata.description,
        capabilities: metadata.capabilities,
        trustLevel,
        maxConcurrentTasks: 3,
        defaultTimeout: 300000,
      };

      const brain = new BrainClass(config);
      brainInstanceCache.set(cacheKey, brain);
      return brain;
    } catch (error) {
      console.warn(`[BrainFactory] Failed to load brain '${type}':`, error);
      throw error;
    }
  }

  /**
   * Get brain metadata with lazy loading
   */
  getBrainMetadataLazy(type: string): {
    name: string;
    description: string;
    capabilities: string[];
  } {
    const cacheKey = `metadata:${type}`;
    const cached = brainMetadataCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Get from SDK definitions if available
    const sdkName = type.includes('-brain') ? type : `${type}-brain`;
    const definition = brainDefinitions[sdkName];

    const metadata = {
      name: definition?.name ?? this.formatBrainName(type),
      description: definition?.description ?? `${this.formatBrainName(type)} specialized brain`,
      capabilities: this.getBrainCapabilities(type),
    };

    brainMetadataCache.set(cacheKey, metadata);
    return metadata;
  }

  /**
   * Preload commonly used brains for faster access
   */
  async preloadPriorityBrains(): Promise<void> {
    if (this.isPreloading) {
      return this.preloadPromise ?? Promise.resolve();
    }

    this.isPreloading = true;
    this.preloadPromise = this.doPreload();

    try {
      await this.preloadPromise;
    } finally {
      this.isPreloading = false;
    }
  }

  private async doPreload(): Promise<void> {
    const preloadPromises = PRIORITY_BRAINS
      .filter((type) => this.hasClassImplementation(type) && !preloadedBrains.has(type))
      .map(async (type) => {
        try {
          await this.getBrain(type as BrainType, 2);
          preloadedBrains.add(type);
          console.debug(`[BrainFactory] Preloaded: ${type}`);
        } catch (error) {
          console.warn(`[BrainFactory] Failed to preload ${type}:`, error);
        }
      });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Get all brain definitions (lazy-loaded)
   */
  getAllBrainDefinitions(): Map<string, BrainDefinition> {
    const definitions = new Map<string, BrainDefinition>();

    for (const [key, def] of Object.entries(brainDefinitions)) {
      definitions.set(key, def);
    }

    return definitions;
  }

  /**
   * Get brain definition by type (cached)
   */
  getBrainDefinition(type: string): BrainDefinition | undefined {
    const sdkName = type.includes('-brain') ? type : `${type}-brain`;
    return brainDefinitions[sdkName];
  }

  /**
   * Get all available brain types from SDK definitions
   */
  getAvailableBrains(): string[] {
    // Use SDK brain definitions as single source of truth
    // Convert from 'ceo-brain' format to 'ceo' format for CLI compatibility
    return allBrainNames.map(name => name.replace('-brain', ''));
  }

  /**
   * Check if a brain type exists in SDK definitions
   */
  hasBrain(type: string): boolean {
    const sdkName = type.includes('-brain') ? type : `${type}-brain`;
    return sdkName in brainDefinitions;
  }

  /**
   * Check if a brain has a class implementation (not just SDK definition)
   */
  hasClassImplementation(type: string): boolean {
    return type in brainLoaders;
  }

  /**
   * Clear the brain cache
   */
  clearCache(): void {
    brainInstanceCache.clear();
    brainMetadataCache.clear();
    preloadedBrains.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    instances: { size: number; hits: number; misses: number; hitRate: number };
    metadata: { size: number; hits: number; misses: number; hitRate: number };
    preloaded: string[];
  } {
    const instanceStats = brainInstanceCache.getStats();
    const metadataStats = brainMetadataCache.getStats();

    return {
      instances: {
        size: instanceStats.size,
        hits: instanceStats.hits,
        misses: instanceStats.misses,
        hitRate: instanceStats.hitRate,
      },
      metadata: {
        size: metadataStats.size,
        hits: metadataStats.hits,
        misses: metadataStats.misses,
        hitRate: metadataStats.hitRate,
      },
      preloaded: Array.from(preloadedBrains),
    };
  }

  /**
   * Warm up cache with specific brain types
   */
  async warmCache(brainTypes: Array<BrainType | string>): Promise<number> {
    let warmed = 0;

    const promises = brainTypes.map(async (type) => {
      if (this.hasClassImplementation(type)) {
        try {
          await this.getBrain(type, 2);
          warmed++;
        } catch {
          // Ignore failures during warm-up
        }
      } else {
        // Just load metadata for SDK-only brains
        this.getBrainMetadataLazy(type);
        warmed++;
      }
    });

    await Promise.allSettled(promises);
    return warmed;
  }

  /**
   * Format brain name from type
   */
  private formatBrainName(type: string): string {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Brain';
  }

  /**
   * Get default capabilities for a brain type
   */
  private getBrainCapabilities(type: string): string[] {
    const capabilityMap: Record<string, string[]> = {
      ceo: ['orchestration', 'delegation', 'decision-making', 'strategy'],
      engineering: ['coding', 'architecture', 'debugging', 'optimization'],
      design: ['ui-design', 'ux-research', 'visual-design', 'prototyping'],
      product: ['roadmapping', 'requirements', 'prioritization', 'user-research'],
      research: ['market-research', 'competitor-analysis', 'trend-analysis'],
      qa: ['testing', 'quality-assurance', 'automation', 'bug-tracking'],
      finance: ['financial-modeling', 'budgeting', 'forecasting', 'accounting'],
      marketing: ['growth', 'acquisition', 'retention', 'branding'],
      sales: ['lead-generation', 'closing', 'negotiation', 'crm'],
      operations: ['process-optimization', 'logistics', 'supply-chain'],
      legal: ['contracts', 'compliance', 'ip-protection', 'risk-assessment'],
      hr: ['hiring', 'culture', 'team-building', 'performance'],
      security: ['cybersecurity', 'audit', 'penetration-testing'],
      data: ['data-analysis', 'ml', 'pipelines', 'visualization'],
      cloud: ['aws', 'gcp', 'azure', 'infrastructure'],
      mobile: ['ios', 'android', 'react-native', 'mobile-ux'],
      ai: ['llm', 'ml-models', 'prompting', 'ai-strategy'],
      automation: ['workflow', 'integrations', 'n8n', 'zapier'],
      analytics: ['metrics', 'dashboards', 'reporting', 'insights'],
    };

    return capabilityMap[type] || ['general'];
  }
}

export const brainFactory = new BrainFactory();
export default BrainFactory;
