/**
 * X2000 Brain Factory
 *
 * Lazy loading factory for all 44+ specialized brains.
 */

import type { BrainType, BrainConfig, TrustLevel } from '../types/index.js';
import { BaseBrain } from './base.js';

// ============================================================================
// Brain Registry
// ============================================================================

interface BrainModule {
  default: new (config: BrainConfig) => BaseBrain;
}

type BrainLoader = () => Promise<BrainModule>;

const brainLoaders: Record<string, BrainLoader> = {
  ceo: () => import('./ceo/index.js'),
  engineering: () => import('./engineering/index.js'),
  design: () => import('./design/index.js'),
  product: () => import('./product/index.js'),
  research: () => import('./research/index.js'),
  qa: () => import('./qa/index.js'),
  finance: () => import('./finance/index.js'),
  marketing: () => import('./marketing/index.js'),
  sales: () => import('./sales/index.js'),
  operations: () => import('./operations/index.js'),
  legal: () => import('./legal/index.js'),
  hr: () => import('./hr/index.js'),
  security: () => import('./security/index.js'),
  data: () => import('./data/index.js'),
  cloud: () => import('./cloud/index.js'),
  mobile: () => import('./mobile/index.js'),
  ai: () => import('./ai/index.js'),
  automation: () => import('./automation/index.js'),
  analytics: () => import('./analytics/index.js'),
  devrel: () => import('./devrel/index.js'),
  branding: () => import('./branding/index.js'),
  email: () => import('./email/index.js'),
  'social-media': () => import('./social-media/index.js'),
  video: () => import('./video/index.js'),
  community: () => import('./community/index.js'),
  support: () => import('./support/index.js'),
  investor: () => import('./investor/index.js'),
  pricing: () => import('./pricing/index.js'),
  innovation: () => import('./innovation/index.js'),
  content: () => import('./content/index.js'),
  localization: () => import('./localization/index.js'),
  'game-design': () => import('./game-design/index.js'),
  partnership: () => import('./partnership/index.js'),
  'customer-success': () => import('./customer-success/index.js'),
  growth: () => import('./growth/index.js'),
  'options-trading': () => import('./options-trading/index.js'),
  mba: () => import('./mba/index.js'),
  debugger: () => import('./debugger/index.js'),
  testing: () => import('./testing/index.js'),
  frontend: () => import('./frontend/index.js'),
  backend: () => import('./backend/index.js'),
  database: () => import('./database/index.js'),
  devops: () => import('./devops/index.js'),
  architecture: () => import('./architecture/index.js'),
  optimize: () => import('./optimize/index.js'),
};

// Cache for loaded brain instances
const brainCache = new Map<string, BaseBrain>();

// ============================================================================
// Brain Factory
// ============================================================================

export class BrainFactory {
  /**
   * Get a brain instance by type
   */
  async getBrain(type: BrainType | string, trustLevel: TrustLevel = 2): Promise<BaseBrain> {
    // Check cache first
    const cacheKey = `${type}-${trustLevel}`;
    if (brainCache.has(cacheKey)) {
      return brainCache.get(cacheKey)!;
    }

    // Load the brain module
    const loader = brainLoaders[type];
    if (!loader) {
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
   * Get all available brain types
   */
  getAvailableBrains(): string[] {
    return Object.keys(brainLoaders);
  }

  /**
   * Check if a brain type exists
   */
  hasBrain(type: string): boolean {
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
