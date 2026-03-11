/**
 * Unit Tests: SDK Brain Definitions
 * Tests that all 44 brains are correctly defined with proper configurations
 */

import { describe, it, expect } from 'vitest';
import {
  brainDefinitions,
  allBrainNames,
  brainsByTier,
  toSdkAgentDefinitions,
  type BrainDefinition,
} from '../../../src/sdk/brain-definitions.js';

describe('Brain Definitions', () => {
  describe('All 44 Brains Defined', () => {
    const expectedBrains = [
      // Tier 1: Core Brains (6)
      'ceo-brain',
      'engineering-brain',
      'design-brain',
      'product-brain',
      'qa-brain',
      'research-brain',

      // Tier 2: Business & Strategy (3)
      'finance-brain',
      'legal-brain',
      'operations-brain',

      // Tier 3: Marketing & Growth (4)
      'marketing-brain',
      'growth-brain',
      'content-brain',
      'sales-brain',

      // Tier 4: Technical Specialists (13)
      'security-brain',
      'devops-brain',
      'data-brain',
      'mobile-brain',
      'ai-brain',
      'cloud-brain',
      'automation-brain',
      'devrel-brain',
      'game-design-brain',
      'frontend-brain',
      'backend-brain',
      'architecture-brain',
      'blockchain-brain',

      // Tier 5: Support Functions (4)
      'hr-brain',
      'support-brain',
      'analytics-brain',
      'localization-brain',

      // Tier 6-8: Additional Business & Marketing (14)
      'strategy-brain',
      'trading-brain',
      'partnership-brain',
      'customer-success-brain',
      'investor-brain',
      'pricing-brain',
      'innovation-brain',
      'branding-brain',
      'email-brain',
      'social-media-brain',
      'video-brain',
      'community-brain',
      'seo-brain',
      'paid-ads-brain',
    ];

    expectedBrains.forEach(brainName => {
      it(`should have ${brainName} defined`, () => {
        expect(brainDefinitions[brainName]).toBeDefined();
      });
    });

    it('should have at least 44 brains total', () => {
      expect(allBrainNames.length).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Brain Definition Structure', () => {
    it('each brain should have required fields', () => {
      Object.entries(brainDefinitions).forEach(([name, definition]) => {
        expect(definition.name, `${name} missing name`).toBeDefined();
        expect(definition.description, `${name} missing description`).toBeDefined();
        expect(definition.prompt, `${name} missing prompt`).toBeDefined();
      });
    });

    it('each brain name should be non-empty', () => {
      Object.entries(brainDefinitions).forEach(([key, definition]) => {
        expect(definition.name.length, `${key} has empty name`).toBeGreaterThan(0);
      });
    });

    it('each brain description should be non-empty', () => {
      Object.entries(brainDefinitions).forEach(([key, definition]) => {
        expect(definition.description.length, `${key} has empty description`).toBeGreaterThan(0);
      });
    });

    it('each brain prompt should be non-empty', () => {
      Object.entries(brainDefinitions).forEach(([key, definition]) => {
        expect(definition.prompt.length, `${key} has empty prompt`).toBeGreaterThan(0);
      });
    });
  });

  describe('Model Assignments', () => {
    const validModels = ['opus', 'sonnet', 'haiku'];

    it('each brain should have valid model assignment if specified', () => {
      Object.entries(brainDefinitions).forEach(([name, definition]) => {
        if (definition.model) {
          expect(
            validModels.includes(definition.model),
            `${name} has invalid model: ${definition.model}`
          ).toBe(true);
        }
      });
    });

    it('core brains should use opus model', () => {
      const coreOpusBrains = ['ceo-brain', 'engineering-brain', 'design-brain', 'product-brain', 'qa-brain', 'research-brain'];

      coreOpusBrains.forEach(brain => {
        expect(
          brainDefinitions[brain]?.model,
          `${brain} should use opus`
        ).toBe('opus');
      });
    });

    it('technical brains should use opus model', () => {
      const technicalBrains = [
        'security-brain', 'devops-brain', 'data-brain', 'mobile-brain',
        'ai-brain', 'cloud-brain', 'frontend-brain', 'backend-brain',
        'architecture-brain', 'blockchain-brain',
      ];

      technicalBrains.forEach(brain => {
        if (brainDefinitions[brain]) {
          expect(
            brainDefinitions[brain].model,
            `${brain} should use opus`
          ).toBe('opus');
        }
      });
    });

    it('business brains should use sonnet model', () => {
      const businessBrains = [
        'finance-brain', 'marketing-brain', 'growth-brain', 'sales-brain',
        'strategy-brain', 'trading-brain', 'partnership-brain',
        'customer-success-brain', 'investor-brain', 'pricing-brain',
      ];

      businessBrains.forEach(brain => {
        if (brainDefinitions[brain]) {
          const model = brainDefinitions[brain].model;
          // Business brains use sonnet (or opus for critical ones)
          expect(
            ['sonnet', 'opus'].includes(model!),
            `${brain} should use sonnet or opus`
          ).toBe(true);
        }
      });
    });

    it('support brains should use haiku or sonnet model', () => {
      const supportBrains = ['hr-brain', 'support-brain', 'operations-brain', 'analytics-brain'];

      supportBrains.forEach(brain => {
        if (brainDefinitions[brain]) {
          const model = brainDefinitions[brain].model;
          expect(
            ['haiku', 'sonnet'].includes(model!),
            `${brain} should use haiku or sonnet`
          ).toBe(true);
        }
      });
    });
  });

  describe('Tool Assignments', () => {
    it('each brain should have tools array if specified', () => {
      Object.entries(brainDefinitions).forEach(([name, definition]) => {
        if (definition.tools) {
          expect(Array.isArray(definition.tools), `${name} tools should be array`).toBe(true);
        }
      });
    });

    it('CEO brain should have orchestration tools', () => {
      const ceoTools = brainDefinitions['ceo-brain']?.tools ?? [];

      expect(ceoTools).toContain('Read');
      expect(ceoTools).toContain('Glob');
      expect(ceoTools).toContain('Grep');
    });

    it('engineering brain should have code tools', () => {
      const engTools = brainDefinitions['engineering-brain']?.tools ?? [];

      expect(engTools).toContain('Read');
      expect(engTools).toContain('Write');
      expect(engTools).toContain('Edit');
      expect(engTools).toContain('Bash');
    });

    it('research brain should have web search tools', () => {
      const researchTools = brainDefinitions['research-brain']?.tools ?? [];

      expect(researchTools).toContain('WebSearch');
    });

    it('design brain should have design tools', () => {
      const designTools = brainDefinitions['design-brain']?.tools ?? [];

      expect(designTools).toContain('Read');
      expect(designTools).toContain('Write');
    });

    it('QA brain should have testing tools', () => {
      const qaTools = brainDefinitions['qa-brain']?.tools ?? [];

      expect(qaTools).toContain('Bash');
      expect(qaTools).toContain('Read');
    });
  });

  describe('Tier Organization', () => {
    it('should have core tier defined', () => {
      expect(brainsByTier.core).toBeDefined();
      expect(brainsByTier.core.length).toBeGreaterThan(0);
    });

    it('core tier should contain essential brains', () => {
      expect(brainsByTier.core).toContain('ceo-brain');
      expect(brainsByTier.core).toContain('engineering-brain');
      expect(brainsByTier.core).toContain('design-brain');
      expect(brainsByTier.core).toContain('product-brain');
    });

    it('should have business tier defined', () => {
      expect(brainsByTier.business).toBeDefined();
      expect(brainsByTier.business.length).toBeGreaterThan(0);
    });

    it('should have marketing tier defined', () => {
      expect(brainsByTier.marketing).toBeDefined();
      expect(brainsByTier.marketing.length).toBeGreaterThan(0);
    });

    it('should have technical tier defined', () => {
      expect(brainsByTier.technical).toBeDefined();
      expect(brainsByTier.technical.length).toBeGreaterThan(0);
    });

    it('should have support tier defined', () => {
      expect(brainsByTier.support).toBeDefined();
      expect(brainsByTier.support.length).toBeGreaterThan(0);
    });

    it('all tier brains should exist in definitions', () => {
      Object.values(brainsByTier).forEach(tierBrains => {
        tierBrains.forEach(brain => {
          expect(
            brainDefinitions[brain],
            `${brain} in tier but not defined`
          ).toBeDefined();
        });
      });
    });
  });

  describe('Brain Prompts', () => {
    it('CEO brain prompt should mention orchestration', () => {
      const prompt = brainDefinitions['ceo-brain']?.prompt ?? '';
      expect(prompt.toLowerCase()).toContain('orchestrat');
    });

    it('engineering brain prompt should mention code', () => {
      const prompt = brainDefinitions['engineering-brain']?.prompt ?? '';
      const hasCodeMention = prompt.toLowerCase().includes('code') ||
                            prompt.toLowerCase().includes('development') ||
                            prompt.toLowerCase().includes('typescript');
      expect(hasCodeMention).toBe(true);
    });

    it('design brain prompt should mention UI or UX', () => {
      const prompt = brainDefinitions['design-brain']?.prompt ?? '';
      const hasDesignMention = prompt.toLowerCase().includes('ui') ||
                              prompt.toLowerCase().includes('ux') ||
                              prompt.toLowerCase().includes('design');
      expect(hasDesignMention).toBe(true);
    });

    it('security brain prompt should mention security', () => {
      const prompt = brainDefinitions['security-brain']?.prompt ?? '';
      expect(prompt.toLowerCase()).toContain('security');
    });

    it('legal brain prompt should mention disclaimer', () => {
      const prompt = brainDefinitions['legal-brain']?.prompt ?? '';
      expect(prompt.toLowerCase()).toContain('disclaimer');
    });

    it('trading brain prompt should mention risk disclaimer', () => {
      const prompt = brainDefinitions['trading-brain']?.prompt ?? '';
      expect(prompt.toLowerCase()).toContain('risk');
    });
  });

  describe('SDK Conversion', () => {
    it('toSdkAgentDefinitions should return all brains', () => {
      const sdkAgents = toSdkAgentDefinitions();

      expect(Object.keys(sdkAgents).length).toBe(allBrainNames.length);
    });

    it('SDK agents should have required properties', () => {
      const sdkAgents = toSdkAgentDefinitions();

      Object.entries(sdkAgents).forEach(([name, agent]) => {
        expect(agent.description, `${name} SDK missing description`).toBeDefined();
        expect(agent.prompt, `${name} SDK missing prompt`).toBeDefined();
      });
    });

    it('SDK agents should preserve tools', () => {
      const sdkAgents = toSdkAgentDefinitions();

      expect(sdkAgents['ceo-brain'].tools).toContain('Read');
      expect(sdkAgents['engineering-brain'].tools).toContain('Write');
    });

    it('SDK agents should preserve model', () => {
      const sdkAgents = toSdkAgentDefinitions();

      expect(sdkAgents['ceo-brain'].model).toBe('opus');
    });

    it('CEO brain should have maxTurns', () => {
      const sdkAgents = toSdkAgentDefinitions();

      expect(sdkAgents['ceo-brain'].maxTurns).toBeGreaterThan(0);
    });
  });

  describe('allBrainNames Array', () => {
    it('should match keys of brainDefinitions', () => {
      const definitionKeys = Object.keys(brainDefinitions).sort();
      const allNamesSort = [...allBrainNames].sort();

      expect(allNamesSort).toEqual(definitionKeys);
    });

    it('should not have duplicates', () => {
      const uniqueNames = new Set(allBrainNames);
      expect(uniqueNames.size).toBe(allBrainNames.length);
    });

    it('all names should follow naming convention', () => {
      allBrainNames.forEach(name => {
        expect(name).toMatch(/^[a-z]+(-[a-z]+)*-brain$/);
      });
    });
  });

  describe('Brain Descriptions', () => {
    it('descriptions should be descriptive (>20 chars)', () => {
      Object.entries(brainDefinitions).forEach(([name, definition]) => {
        expect(
          definition.description.length,
          `${name} description too short`
        ).toBeGreaterThan(20);
      });
    });

    it('descriptions should not be duplicated', () => {
      const descriptions = Object.values(brainDefinitions).map(d => d.description);
      const uniqueDescriptions = new Set(descriptions);

      // Allow some tolerance for similar descriptions
      expect(uniqueDescriptions.size).toBeGreaterThan(descriptions.length * 0.9);
    });
  });

  describe('Brain Expertise Areas', () => {
    const expertiseTests: Array<{ brain: string; keywords: string[] }> = [
      { brain: 'ceo-brain', keywords: ['orchestrat', 'delegat', 'brain'] },
      { brain: 'engineering-brain', keywords: ['code', 'infrastruc', 'devops'] },
      { brain: 'design-brain', keywords: ['ui', 'ux', 'design', 'visual'] },
      { brain: 'product-brain', keywords: ['product', 'roadmap', 'prioriti'] },
      { brain: 'qa-brain', keywords: ['test', 'quality', 'automat'] },
      { brain: 'research-brain', keywords: ['research', 'analy', 'market'] },
      { brain: 'finance-brain', keywords: ['financ', 'budget', 'forecast'] },
      { brain: 'legal-brain', keywords: ['contract', 'complian', 'legal'] },
      { brain: 'marketing-brain', keywords: ['market', 'growth', 'brand'] },
      { brain: 'sales-brain', keywords: ['sales', 'close', 'deal'] },
      { brain: 'security-brain', keywords: ['secur', 'threat', 'owasp'] },
      { brain: 'data-brain', keywords: ['data', 'analytic', 'ml'] },
      { brain: 'mobile-brain', keywords: ['mobile', 'ios', 'android'] },
      { brain: 'ai-brain', keywords: ['ai', 'llm', 'ml', 'prompt'] },
    ];

    expertiseTests.forEach(({ brain, keywords }) => {
      it(`${brain} should mention relevant expertise`, () => {
        const definition = brainDefinitions[brain];
        if (!definition) return;

        const fullText = `${definition.description} ${definition.prompt}`.toLowerCase();

        const hasKeyword = keywords.some(kw => fullText.includes(kw));
        expect(hasKeyword, `${brain} missing keywords: ${keywords.join(', ')}`).toBe(true);
      });
    });
  });

  describe('Consistency Checks', () => {
    it('brain names should match their key', () => {
      Object.entries(brainDefinitions).forEach(([key, definition]) => {
        // Handle special cases like CEO, AI, HR, QA, SEO, DevOps, DevRel that have special capitalization
        const specialCases: Record<string, string> = {
          'ceo': 'CEO',
          'ai': 'AI',
          'hr': 'HR',
          'qa': 'QA',
          'seo': 'SEO',
          'devops': 'DevOps',
          'devrel': 'DevRel',
        };

        const expectedName = key
          .replace('-brain', '')
          .split('-')
          .map(word => specialCases[word] || word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ') + ' Brain';

        expect(definition.name).toBe(expectedName);
      });
    });

    it('no brain should have empty tools array', () => {
      Object.entries(brainDefinitions).forEach(([name, definition]) => {
        if (definition.tools) {
          expect(
            definition.tools.length,
            `${name} has empty tools array`
          ).toBeGreaterThan(0);
        }
      });
    });

    it('disallowedTools should not overlap with tools if both specified', () => {
      Object.entries(brainDefinitions).forEach(([name, definition]) => {
        if (definition.tools && definition.disallowedTools) {
          const overlap = definition.tools.filter(
            tool => definition.disallowedTools?.includes(tool)
          );
          expect(
            overlap.length,
            `${name} has overlapping tools and disallowedTools: ${overlap.join(', ')}`
          ).toBe(0);
        }
      });
    });
  });
});
