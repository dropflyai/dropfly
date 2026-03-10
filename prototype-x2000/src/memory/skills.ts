/**
 * Skill Pooling System
 * Enables cross-brain knowledge transfer through shared skills
 */

import { v4 as uuidv4 } from 'uuid';
import type { Skill, BrainType, Learning, Pattern } from '../types/index.js';
import { memoryManager } from './manager.js';

// ============================================================================
// Types
// ============================================================================

interface SkillDiscovery {
  skill: Skill;
  relevance: number;
  matchedOn: string[];
}

interface SkillRecommendation {
  skill: Skill;
  reason: string;
  adoptedByCount: number;
  successRate: number;
}

interface SkillTransfer {
  skillId: string;
  fromBrain: BrainType;
  toBrain: BrainType;
  transferredAt: Date;
  adaptations: string[];
}

interface SkillCategory {
  name: string;
  description: string;
  skills: Skill[];
}

// ============================================================================
// Skill Pool Manager
// ============================================================================

export class SkillPoolManager {
  private skills: Map<string, Skill> = new Map();
  private categories: Map<string, SkillCategory> = new Map();
  private transfers: SkillTransfer[] = [];
  private categoryIndex: Map<string, Set<string>> = new Map();
  private brainSkillIndex: Map<BrainType, Set<string>> = new Map();

  constructor() {
    this.initializeCategories();
  }

  private initializeCategories(): void {
    const defaultCategories = [
      { name: 'analysis', description: 'Data analysis and research skills' },
      { name: 'implementation', description: 'Code and system building skills' },
      { name: 'communication', description: 'Writing and presentation skills' },
      { name: 'planning', description: 'Strategic planning and roadmap skills' },
      { name: 'optimization', description: 'Performance and efficiency skills' },
      { name: 'integration', description: 'System integration and API skills' },
      { name: 'validation', description: 'Testing and quality assurance skills' },
      { name: 'security', description: 'Security and compliance skills' },
    ];

    for (const cat of defaultCategories) {
      this.categories.set(cat.name, { ...cat, skills: [] });
      this.categoryIndex.set(cat.name, new Set());
    }
  }

  // ============================================================================
  // Skill Registration
  // ============================================================================

  /**
   * Register a new skill in the pool
   */
  registerSkill(
    name: string,
    description: string,
    category: string,
    implementation: string,
    inputSchema: Record<string, unknown>,
    outputSchema: Record<string, unknown>,
    createdBy: BrainType
  ): Skill {
    const skill: Skill = {
      id: uuidv4(),
      name,
      description,
      category,
      implementation,
      inputSchema,
      outputSchema,
      createdBy,
      adoptedBy: [createdBy],
      usageCount: 0,
      successRate: 1.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.addSkill(skill);
    console.log(`[SkillPool] Registered skill: ${name} by ${createdBy}`);

    return skill;
  }

  /**
   * Register skill from a successful pattern
   */
  registerFromPattern(pattern: Pattern, brainType: BrainType): Skill | null {
    // Don't duplicate skills
    const existing = this.findSimilarSkill(pattern.name, pattern.tags);
    if (existing) {
      return null;
    }

    const category = this.inferCategory(pattern.tags);

    return this.registerSkill(
      `Skill: ${pattern.name.replace('Pattern: ', '')}`,
      pattern.description,
      category,
      pattern.solution,
      { trigger: { type: 'string' } },
      { result: { type: 'object' } },
      brainType
    );
  }

  /**
   * Add a skill to the pool
   */
  private addSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);

    // Update category index
    if (!this.categoryIndex.has(skill.category)) {
      this.categoryIndex.set(skill.category, new Set());
    }
    this.categoryIndex.get(skill.category)!.add(skill.id);

    // Update brain index
    for (const brain of skill.adoptedBy) {
      if (!this.brainSkillIndex.has(brain)) {
        this.brainSkillIndex.set(brain, new Set());
      }
      this.brainSkillIndex.get(brain)!.add(skill.id);
    }

    // Update category
    const cat = this.categories.get(skill.category);
    if (cat) {
      cat.skills.push(skill);
    }

    // Also store in memory manager
    memoryManager.storeSkill(skill);
  }

  // ============================================================================
  // Skill Discovery
  // ============================================================================

  /**
   * Discover relevant skills for a brain
   */
  discoverSkills(
    brainType: BrainType,
    context: string,
    limit: number = 10
  ): SkillDiscovery[] {
    const discoveries: SkillDiscovery[] = [];
    const contextWords = context.toLowerCase().split(/\s+/);
    const alreadyAdopted = this.brainSkillIndex.get(brainType) ?? new Set();

    for (const skill of this.skills.values()) {
      // Skip already adopted skills
      if (alreadyAdopted.has(skill.id)) continue;

      const matchedOn: string[] = [];
      let relevance = 0;

      // Check name match
      const nameWords = skill.name.toLowerCase().split(/\s+/);
      const nameMatches = contextWords.filter((w) =>
        nameWords.some((nw) => nw.includes(w) || w.includes(nw))
      );
      if (nameMatches.length > 0) {
        matchedOn.push(...nameMatches.map((m) => `name:${m}`));
        relevance += nameMatches.length * 0.3;
      }

      // Check description match
      const descWords = skill.description.toLowerCase().split(/\s+/);
      const descMatches = contextWords.filter((w) =>
        descWords.some((dw) => dw.includes(w) || w.includes(dw))
      );
      if (descMatches.length > 0) {
        matchedOn.push(...descMatches.map((m) => `desc:${m}`));
        relevance += descMatches.length * 0.2;
      }

      // Check category match
      if (contextWords.includes(skill.category)) {
        matchedOn.push(`category:${skill.category}`);
        relevance += 0.5;
      }

      // Boost by success rate and adoption
      relevance *= skill.successRate;
      relevance *= 1 + skill.adoptedBy.length * 0.1;

      if (relevance > 0.2 && matchedOn.length > 0) {
        discoveries.push({ skill, relevance, matchedOn });
      }
    }

    return discoveries
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  /**
   * Get skill recommendations for a brain based on other brains' success
   */
  getRecommendations(brainType: BrainType, limit: number = 5): SkillRecommendation[] {
    const recommendations: SkillRecommendation[] = [];
    const adopted = this.brainSkillIndex.get(brainType) ?? new Set();

    for (const skill of this.skills.values()) {
      if (adopted.has(skill.id)) continue;

      // Skills with high adoption and success are recommended
      if (skill.adoptedBy.length >= 2 && skill.successRate >= 0.8) {
        recommendations.push({
          skill,
          reason: `Adopted by ${skill.adoptedBy.length} brains with ${(skill.successRate * 100).toFixed(0)}% success`,
          adoptedByCount: skill.adoptedBy.length,
          successRate: skill.successRate,
        });
      }
    }

    return recommendations
      .sort((a, b) => {
        const scoreA = a.adoptedByCount * 0.4 + a.successRate * 0.6;
        const scoreB = b.adoptedByCount * 0.4 + b.successRate * 0.6;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  // ============================================================================
  // Skill Adoption
  // ============================================================================

  /**
   * Adopt a skill for a brain
   */
  adoptSkill(skillId: string, brainType: BrainType, adaptations?: string[]): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) {
      console.log(`[SkillPool] Skill not found: ${skillId}`);
      return false;
    }

    if (skill.adoptedBy.includes(brainType)) {
      console.log(`[SkillPool] ${brainType} already adopted: ${skill.name}`);
      return false;
    }

    // Add brain to adopters
    skill.adoptedBy.push(brainType);
    skill.updatedAt = new Date();

    // Update brain index
    if (!this.brainSkillIndex.has(brainType)) {
      this.brainSkillIndex.set(brainType, new Set());
    }
    this.brainSkillIndex.get(brainType)!.add(skillId);

    // Record transfer
    const transfer: SkillTransfer = {
      skillId,
      fromBrain: skill.createdBy,
      toBrain: brainType,
      transferredAt: new Date(),
      adaptations: adaptations ?? [],
    };
    this.transfers.push(transfer);

    // Update memory manager
    memoryManager.recordSkillAdoption(skillId, brainType);

    console.log(`[SkillPool] ${brainType} adopted skill: ${skill.name}`);
    return true;
  }

  /**
   * Get all skills adopted by a brain
   */
  getSkillsForBrain(brainType: BrainType): Skill[] {
    const skillIds = this.brainSkillIndex.get(brainType) ?? new Set();
    return [...skillIds].map((id) => this.skills.get(id)!).filter(Boolean);
  }

  // ============================================================================
  // Skill Usage
  // ============================================================================

  /**
   * Record skill usage
   */
  recordUsage(skillId: string, brainType: BrainType, success: boolean): void {
    const skill = this.skills.get(skillId);
    if (!skill) return;

    skill.usageCount++;
    skill.updatedAt = new Date();

    // Update success rate with exponential moving average
    const alpha = 0.1;
    skill.successRate = skill.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;

    memoryManager.recordSkillUsage(skillId, success);
  }

  /**
   * Get most used skills
   */
  getMostUsedSkills(limit: number = 10): Skill[] {
    return [...this.skills.values()]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Get highest success rate skills
   */
  getMostSuccessfulSkills(minUsage: number = 5, limit: number = 10): Skill[] {
    return [...this.skills.values()]
      .filter((s) => s.usageCount >= minUsage)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  }

  // ============================================================================
  // Skill Search
  // ============================================================================

  /**
   * Search skills by query
   */
  searchSkills(query: string, category?: string): Skill[] {
    const queryWords = query.toLowerCase().split(/\s+/);

    let skills = [...this.skills.values()];

    if (category) {
      skills = skills.filter((s) => s.category === category);
    }

    return skills
      .map((skill) => {
        const text = `${skill.name} ${skill.description} ${skill.category}`.toLowerCase();
        const matches = queryWords.filter((w) => text.includes(w)).length;
        return { skill, score: matches / queryWords.length };
      })
      .filter((r) => r.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.skill);
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: string): Skill[] {
    const skillIds = this.categoryIndex.get(category) ?? new Set();
    return [...skillIds].map((id) => this.skills.get(id)!).filter(Boolean);
  }

  /**
   * Get all categories with skill counts
   */
  getCategories(): Array<{ name: string; description: string; count: number }> {
    return [...this.categories.values()].map((cat) => ({
      name: cat.name,
      description: cat.description,
      count: cat.skills.length,
    }));
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  /**
   * Get skill transfer statistics
   */
  getTransferStats(): {
    totalTransfers: number;
    topProviders: Array<{ brain: BrainType; count: number }>;
    topAdopters: Array<{ brain: BrainType; count: number }>;
  } {
    const providers = new Map<BrainType, number>();
    const adopters = new Map<BrainType, number>();

    for (const transfer of this.transfers) {
      providers.set(transfer.fromBrain, (providers.get(transfer.fromBrain) ?? 0) + 1);
      adopters.set(transfer.toBrain, (adopters.get(transfer.toBrain) ?? 0) + 1);
    }

    return {
      totalTransfers: this.transfers.length,
      topProviders: [...providers.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([brain, count]) => ({ brain, count })),
      topAdopters: [...adopters.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([brain, count]) => ({ brain, count })),
    };
  }

  /**
   * Get skill pool statistics
   */
  getPoolStats(): {
    totalSkills: number;
    avgAdoptionRate: number;
    avgSuccessRate: number;
    categoryBreakdown: Array<{ category: string; count: number }>;
  } {
    const skills = [...this.skills.values()];

    if (skills.length === 0) {
      return {
        totalSkills: 0,
        avgAdoptionRate: 0,
        avgSuccessRate: 0,
        categoryBreakdown: [],
      };
    }

    const avgAdoptionRate =
      skills.reduce((sum, s) => sum + s.adoptedBy.length, 0) / skills.length;
    const avgSuccessRate =
      skills.reduce((sum, s) => sum + s.successRate, 0) / skills.length;

    const categoryBreakdown = this.getCategories().map((c) => ({
      category: c.name,
      count: c.count,
    }));

    return {
      totalSkills: skills.length,
      avgAdoptionRate,
      avgSuccessRate,
      categoryBreakdown,
    };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private findSimilarSkill(name: string, tags: string[]): Skill | null {
    const nameWords = name.toLowerCase().split(/\s+/);

    for (const skill of this.skills.values()) {
      const skillNameWords = skill.name.toLowerCase().split(/\s+/);
      const commonWords = nameWords.filter((w) => skillNameWords.includes(w)).length;
      const similarity = commonWords / Math.max(nameWords.length, skillNameWords.length);

      if (similarity > 0.7) {
        return skill;
      }
    }

    return null;
  }

  private inferCategory(tags: string[]): string {
    const categoryKeywords: Record<string, string[]> = {
      analysis: ['analyze', 'research', 'data', 'metrics', 'insights'],
      implementation: ['build', 'code', 'implement', 'create', 'develop'],
      communication: ['write', 'document', 'present', 'report', 'email'],
      planning: ['plan', 'strategy', 'roadmap', 'schedule', 'prioritize'],
      optimization: ['optimize', 'improve', 'performance', 'efficiency', 'speed'],
      integration: ['integrate', 'api', 'connect', 'sync', 'pipeline'],
      validation: ['test', 'validate', 'verify', 'qa', 'quality'],
      security: ['security', 'auth', 'encrypt', 'protect', 'compliance'],
    };

    const tagSet = new Set(tags.map((t) => t.toLowerCase()));

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter((k) => tagSet.has(k)).length;
      if (matches > 0) {
        return category;
      }
    }

    return 'implementation'; // Default category
  }
}

// Export singleton instance
export const skillPoolManager = new SkillPoolManager();
