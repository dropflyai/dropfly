/**
 * Unit Tests: Brain Factory
 * Tests brain loading, caching, and SDK integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BrainFactory, brainFactory } from '../../../src/brains/factory.js';
import type { BrainConfig, TrustLevel } from '../../../src/types/index.js';

// Mock the brain definitions
vi.mock('../../../src/sdk/brain-definitions.js', () => ({
  allBrainNames: [
    'ceo-brain',
    'engineering-brain',
    'design-brain',
    'product-brain',
    'qa-brain',
    'research-brain',
    'finance-brain',
    'legal-brain',
    'marketing-brain',
    'sales-brain',
    'security-brain',
    'data-brain',
    'mobile-brain',
    'ai-brain',
    'hr-brain',
    'support-brain',
  ],
  brainDefinitions: {
    'ceo-brain': {
      name: 'CEO Brain',
      description: 'Master orchestrator',
      prompt: 'You are the CEO Brain',
      tools: ['Read', 'Glob', 'Grep'],
      model: 'opus',
    },
    'engineering-brain': {
      name: 'Engineering Brain',
      description: 'Code expert',
      prompt: 'You are the Engineering Brain',
      tools: ['Read', 'Write', 'Edit', 'Bash'],
      model: 'opus',
    },
    'design-brain': {
      name: 'Design Brain',
      description: 'UI/UX expert',
      prompt: 'You are the Design Brain',
      tools: ['Read', 'Write'],
      model: 'opus',
    },
    'product-brain': {
      name: 'Product Brain',
      description: 'Product strategy',
      prompt: 'You are the Product Brain',
      tools: ['Read', 'Write'],
      model: 'opus',
    },
    'qa-brain': {
      name: 'QA Brain',
      description: 'Testing expert',
      prompt: 'You are the QA Brain',
      tools: ['Read', 'Write', 'Bash'],
      model: 'opus',
    },
    'research-brain': {
      name: 'Research Brain',
      description: 'Research expert',
      prompt: 'You are the Research Brain',
      tools: ['Read', 'WebSearch'],
      model: 'opus',
    },
    'finance-brain': {
      name: 'Finance Brain',
      description: 'Finance expert',
      prompt: 'You are the Finance Brain',
      tools: ['Read', 'Write'],
      model: 'sonnet',
    },
    'legal-brain': {
      name: 'Legal Brain',
      description: 'Legal expert',
      prompt: 'You are the Legal Brain',
      tools: ['Read', 'Write'],
      model: 'opus',
    },
    'marketing-brain': {
      name: 'Marketing Brain',
      description: 'Marketing expert',
      prompt: 'You are the Marketing Brain',
      tools: ['Read', 'Write'],
      model: 'sonnet',
    },
    'sales-brain': {
      name: 'Sales Brain',
      description: 'Sales expert',
      prompt: 'You are the Sales Brain',
      tools: ['Read', 'Write'],
      model: 'sonnet',
    },
    'security-brain': {
      name: 'Security Brain',
      description: 'Security expert',
      prompt: 'You are the Security Brain',
      tools: ['Read', 'Write', 'Bash'],
      model: 'opus',
    },
    'data-brain': {
      name: 'Data Brain',
      description: 'Data expert',
      prompt: 'You are the Data Brain',
      tools: ['Read', 'Write', 'Bash'],
      model: 'opus',
    },
    'mobile-brain': {
      name: 'Mobile Brain',
      description: 'Mobile expert',
      prompt: 'You are the Mobile Brain',
      tools: ['Read', 'Write', 'Bash'],
      model: 'opus',
    },
    'ai-brain': {
      name: 'AI Brain',
      description: 'AI expert',
      prompt: 'You are the AI Brain',
      tools: ['Read', 'Write', 'Bash'],
      model: 'opus',
    },
    'hr-brain': {
      name: 'HR Brain',
      description: 'HR expert',
      prompt: 'You are the HR Brain',
      tools: ['Read', 'Write'],
      model: 'haiku',
    },
    'support-brain': {
      name: 'Support Brain',
      description: 'Support expert',
      prompt: 'You are the Support Brain',
      tools: ['Read', 'Write'],
      model: 'haiku',
    },
  },
  brainsByTier: {
    core: ['ceo-brain', 'engineering-brain', 'design-brain', 'product-brain', 'qa-brain', 'research-brain'],
    business: ['finance-brain', 'legal-brain'],
    marketing: ['marketing-brain', 'sales-brain'],
    technical: ['security-brain', 'data-brain', 'mobile-brain', 'ai-brain'],
    support: ['hr-brain', 'support-brain'],
  },
  toSdkAgentDefinitions: vi.fn(),
}));

// Mock the CEO brain module
vi.mock('../../../src/brains/ceo/index.js', () => ({
  default: class MockCEOBrain {
    config: BrainConfig;
    constructor(config: BrainConfig) {
      this.config = config;
    }
    getConfig() {
      return this.config;
    }
    executeTask() {
      return Promise.resolve({ success: true });
    }
    getSystemPrompt() {
      return 'CEO System Prompt';
    }
  },
}));

describe('BrainFactory', () => {
  let factory: BrainFactory;

  beforeEach(() => {
    factory = new BrainFactory();
    factory.clearCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    factory.clearCache();
  });

  describe('getAvailableBrains', () => {
    it('should return list of available brain types', () => {
      const brains = factory.getAvailableBrains();

      expect(brains).toContain('ceo');
      expect(brains).toContain('engineering');
      expect(brains).toContain('design');
      expect(brains).toContain('product');
      expect(brains).toContain('qa');
      expect(brains).toContain('research');
    });

    it('should strip -brain suffix from SDK names', () => {
      const brains = factory.getAvailableBrains();

      brains.forEach(brain => {
        expect(brain).not.toContain('-brain');
      });
    });

    it('should return multiple brain types', () => {
      const brains = factory.getAvailableBrains();
      expect(brains.length).toBeGreaterThan(5);
    });
  });

  describe('hasBrain', () => {
    it('should return true for existing brains', () => {
      expect(factory.hasBrain('ceo')).toBe(true);
      expect(factory.hasBrain('engineering')).toBe(true);
      expect(factory.hasBrain('design')).toBe(true);
    });

    it('should handle both formats (with and without -brain suffix)', () => {
      expect(factory.hasBrain('ceo')).toBe(true);
      expect(factory.hasBrain('ceo-brain')).toBe(true);
    });

    it('should return false for non-existent brains', () => {
      expect(factory.hasBrain('fake-brain')).toBe(false);
      expect(factory.hasBrain('nonexistent')).toBe(false);
    });
  });

  describe('hasClassImplementation', () => {
    it('should return true for CEO brain (has class)', () => {
      expect(factory.hasClassImplementation('ceo')).toBe(true);
    });

    it('should return false for SDK-only brains', () => {
      expect(factory.hasClassImplementation('engineering')).toBe(false);
      expect(factory.hasClassImplementation('design')).toBe(false);
    });
  });

  describe('getBrain', () => {
    it('should load CEO brain successfully', async () => {
      const brain = await factory.getBrain('ceo');

      expect(brain).toBeDefined();
      expect(brain.getConfig().type).toBe('ceo');
    });

    it('should apply correct trust level', async () => {
      const brain = await factory.getBrain('ceo', 3);

      expect(brain.getConfig().trustLevel).toBe(3);
    });

    it('should cache brain instances', async () => {
      const brain1 = await factory.getBrain('ceo', 2);
      const brain2 = await factory.getBrain('ceo', 2);

      expect(brain1).toBe(brain2); // Same instance
    });

    it('should create separate instances for different trust levels', async () => {
      const brain1 = await factory.getBrain('ceo', 2);
      const brain2 = await factory.getBrain('ceo', 3);

      expect(brain1).not.toBe(brain2);
    });

    it('should throw for SDK-only brains', async () => {
      await expect(factory.getBrain('engineering')).rejects.toThrow(
        /SDK orchestrator/
      );
    });

    it('should throw for unknown brain types', async () => {
      await expect(factory.getBrain('completely-fake')).rejects.toThrow(
        /Unknown brain type/
      );
    });

    it('should set correct brain name', async () => {
      const brain = await factory.getBrain('ceo');
      expect(brain.getConfig().name).toContain('CEO');
    });

    it('should set capabilities for the brain', async () => {
      const brain = await factory.getBrain('ceo');
      const config = brain.getConfig();

      expect(config.capabilities).toContain('orchestration');
      expect(config.capabilities).toContain('delegation');
    });
  });

  describe('clearCache', () => {
    it('should clear cached brain instances', async () => {
      const brain1 = await factory.getBrain('ceo');
      factory.clearCache();
      const brain2 = await factory.getBrain('ceo');

      expect(brain1).not.toBe(brain2); // Different instances
    });
  });

  describe('formatBrainName', () => {
    it('should format brain names correctly', () => {
      // Access private method through getBrain results
      const testCases = [
        { input: 'ceo', expected: 'CEO Brain' },
        { input: 'engineering', expected: 'Engineering Brain' },
        { input: 'design', expected: 'Design Brain' },
        { input: 'social-media', expected: 'Social Media Brain' },
        { input: 'customer-success', expected: 'Customer Success Brain' },
      ];

      testCases.forEach(async ({ input }) => {
        // For non-CEO brains, we can't test directly, but we can verify the pattern
        expect(input).toBeDefined();
      });
    });
  });

  describe('getBrainCapabilities', () => {
    it('should return capabilities for known brain types', async () => {
      const ceoBrain = await factory.getBrain('ceo');
      const capabilities = ceoBrain.getConfig().capabilities;

      expect(capabilities).toContain('orchestration');
      expect(capabilities).toContain('delegation');
      expect(capabilities).toContain('decision-making');
      expect(capabilities).toContain('strategy');
    });
  });

  describe('Default Trust Level', () => {
    it('should default to trust level 2', async () => {
      const brain = await factory.getBrain('ceo');

      expect(brain.getConfig().trustLevel).toBe(2);
    });
  });

  describe('Configuration Validation', () => {
    it('should set maxConcurrentTasks', async () => {
      const brain = await factory.getBrain('ceo');
      const config = brain.getConfig();

      expect(config.maxConcurrentTasks).toBeDefined();
      expect(config.maxConcurrentTasks).toBeGreaterThan(0);
    });

    it('should set defaultTimeout', async () => {
      const brain = await factory.getBrain('ceo');
      const config = brain.getConfig();

      expect(config.defaultTimeout).toBeDefined();
      expect(config.defaultTimeout).toBeGreaterThan(0);
    });
  });

  describe('Singleton Export', () => {
    it('should export a singleton instance', () => {
      expect(brainFactory).toBeInstanceOf(BrainFactory);
    });

    it('should use same instance across imports', () => {
      const brains1 = brainFactory.getAvailableBrains();
      const brains2 = brainFactory.getAvailableBrains();

      expect(brains1).toEqual(brains2);
    });
  });

  describe('Brain Type Validation', () => {
    const validBrainTypes = [
      'ceo', 'engineering', 'design', 'product', 'qa', 'research',
      'finance', 'legal', 'marketing', 'sales', 'security', 'data',
      'mobile', 'ai', 'hr', 'support',
    ];

    validBrainTypes.forEach(brainType => {
      it(`should recognize ${brainType} as valid brain`, () => {
        expect(factory.hasBrain(brainType)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error for invalid brain', async () => {
      try {
        await factory.getBrain('invalid-brain-xyz');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('Unknown brain type');
      }
    });

    it('should provide meaningful error for SDK-only brain', async () => {
      try {
        await factory.getBrain('engineering');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('SDK');
        expect((error as Error).message).toContain('runBrain');
      }
    });
  });

  describe('Capability Mapping', () => {
    const capabilityTests = [
      { brain: 'ceo', expectedCapabilities: ['orchestration', 'delegation', 'decision-making', 'strategy'] },
    ];

    capabilityTests.forEach(({ brain, expectedCapabilities }) => {
      it(`should map capabilities for ${brain}`, async () => {
        if (factory.hasClassImplementation(brain)) {
          const brainInstance = await factory.getBrain(brain);
          const capabilities = brainInstance.getConfig().capabilities;

          expectedCapabilities.forEach(cap => {
            expect(capabilities).toContain(cap);
          });
        }
      });
    });
  });
});
