/**
 * X2000 Brain Factory
 *
 * Uses SDK brain definitions as the single source of truth.
 * Only CEO Brain has a class implementation; other brains run through the SDK.
 */

import type { BrainType, BrainConfig, TrustLevel } from '../types/index.js';
import { BaseBrain } from './base.js';
import { allBrainNames, brainDefinitions } from '../sdk/brain-definitions.js';

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

// Cache for loaded brain instances
const brainCache = new Map<string, BaseBrain>();

// ============================================================================
// Brain Factory
// ============================================================================

export class BrainFactory {
  /**
   * Get a brain instance by type
   * Only CEO has a class implementation; other brains are SDK-only
   */
  async getBrain(type: BrainType | string, trustLevel: TrustLevel = 2): Promise<BaseBrain> {
    // Check cache first
    const cacheKey = `${type}-${trustLevel}`;
    if (brainCache.has(cacheKey)) {
      return brainCache.get(cacheKey)!;
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

      const config: BrainConfig = {
        type: type as BrainType,
        name: this.formatBrainName(type),
        description: `${this.formatBrainName(type)} specialized brain`,
        capabilities: this.getBrainCapabilities(type),
        trustLevel,
        maxConcurrentTasks: 3,
        defaultTimeout: 300000,
      };

      const brain = new BrainClass(config);
      brainCache.set(cacheKey, brain);
      return brain;
    } catch (error) {
      console.warn(`[BrainFactory] Failed to load brain '${type}':`, error);
      throw error;
    }
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
    brainCache.clear();
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
