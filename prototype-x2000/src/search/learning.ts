/**
 * Learning to Rank System
 * Handles:
 * - Click feedback collection
 * - Position bias correction
 * - Weight optimization
 */

import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/env.js';
import { fusionManager } from './fusion.js';
import type {
  SearchEvent,
  DebaisedFeedback,
  PropensityModel,
  RetrieverWeights,
  DatabaseSearchFeedback,
  FinalResult,
  RetrieverType,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

/**
 * Default propensity values by position
 * Based on typical click distributions where higher positions get more attention
 */
const DEFAULT_PROPENSITIES = [
  1.0,    // Position 1
  0.85,   // Position 2
  0.72,   // Position 3
  0.62,   // Position 4
  0.53,   // Position 5
  0.45,   // Position 6
  0.38,   // Position 7
  0.32,   // Position 8
  0.27,   // Position 9
  0.23,   // Position 10
];

/**
 * Minimum feedback samples needed for weight update
 */
const MIN_FEEDBACK_SAMPLES = 50;

/**
 * Learning rate for weight updates
 */
const LEARNING_RATE = 0.1;

// ============================================================================
// Learning Manager
// ============================================================================

export class LearningManager {
  private client: SupabaseClient | null = null;
  private propensityModel: PropensityModel;
  private feedbackBuffer: SearchEvent[] = [];
  private lastWeightUpdate: Date | null = null;

  // Tables
  private readonly FEEDBACK_TABLE = 'search_feedback';
  private readonly WEIGHTS_TABLE = 'retriever_weights';

  constructor() {
    this.propensityModel = this.createDefaultPropensityModel();
  }

  /**
   * Initialize the learning manager
   */
  async initialize(): Promise<boolean> {
    const supabaseConfig = getSupabaseConfig();

    if (!supabaseConfig) {
      console.log('[Learning] Supabase not configured - feedback logging disabled');
      return false;
    }

    try {
      this.client = createClient(supabaseConfig.url, supabaseConfig.key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      console.log('[Learning] Connected to Supabase');
      return true;
    } catch (error) {
      console.error('[Learning] Failed to connect:', error);
      return false;
    }
  }

  // ============================================================================
  // Feedback Collection
  // ============================================================================

  /**
   * Log a search event (query + results shown)
   */
  async logSearchEvent(
    query: string,
    results: FinalResult[],
    queryEmbedding?: number[],
    sessionId?: string
  ): Promise<string> {
    const eventId = uuidv4();

    const event: SearchEvent = {
      queryId: eventId,
      query,
      queryEmbedding,
      results: results.map((r, index) => ({
        id: r.id,
        position: index + 1,
        retriever: r.sources[0]?.retriever || 'vector',
        score: r.relevanceScore,
      })),
      selectedId: null,
      selectedPosition: null,
      sessionId: sessionId || uuidv4(),
      timestamp: new Date(),
    };

    // Buffer locally
    this.feedbackBuffer.push(event);

    // Persist to database
    if (this.client) {
      await this.persistSearchEvent(event);
    }

    return eventId;
  }

  /**
   * Record user selection (click feedback)
   */
  async recordSelection(
    queryId: string,
    selectedId: string,
    selectedPosition: number
  ): Promise<void> {
    // Update buffer
    const event = this.feedbackBuffer.find(e => e.queryId === queryId);
    if (event) {
      event.selectedId = selectedId;
      event.selectedPosition = selectedPosition;
    }

    // Update database
    if (this.client) {
      try {
        const { error } = await this.client
          .from(this.FEEDBACK_TABLE)
          .update({
            selected_id: selectedId,
            selected_position: selectedPosition,
          })
          .eq('id', queryId);

        if (error) {
          console.error('[Learning] Failed to record selection:', error);
        }
      } catch (error) {
        console.error('[Learning] Error recording selection:', error);
      }
    }
  }

  /**
   * Persist search event to database
   */
  private async persistSearchEvent(event: SearchEvent): Promise<void> {
    if (!this.client) return;

    try {
      const dbFeedback: DatabaseSearchFeedback = {
        id: event.queryId,
        query: event.query,
        query_embedding: event.queryEmbedding,
        result_ids: event.results.map(r => r.id),
        selected_id: event.selectedId ?? undefined,
        selected_position: event.selectedPosition ?? undefined,
        session_id: event.sessionId,
        created_at: event.timestamp.toISOString(),
      };

      const { error } = await this.client
        .from(this.FEEDBACK_TABLE)
        .insert(dbFeedback);

      if (error) {
        console.error('[Learning] Failed to persist feedback:', error);
      }
    } catch (error) {
      console.error('[Learning] Error persisting feedback:', error);
    }
  }

  // ============================================================================
  // Position Bias Correction
  // ============================================================================

  /**
   * Create default propensity model
   */
  private createDefaultPropensityModel(): PropensityModel {
    return {
      propensities: DEFAULT_PROPENSITIES,
      getPropensity(position: number): number {
        if (position <= 0) return 0;
        if (position > this.propensities.length) {
          // Extrapolate for positions beyond the model
          return this.propensities[this.propensities.length - 1] *
            Math.pow(0.85, position - this.propensities.length);
        }
        return this.propensities[position - 1];
      },
    };
  }

  /**
   * Correct click feedback for position bias
   */
  correctPositionBias(feedback: SearchEvent[]): DebaisedFeedback[] {
    const debiased: DebaisedFeedback[] = [];

    for (const event of feedback) {
      if (!event.selectedId || event.selectedPosition === null) {
        continue;
      }

      // Positive signal (clicked result)
      const propensity = this.propensityModel.getPropensity(event.selectedPosition);
      const correctedRelevance = 1 / propensity;

      debiased.push({
        queryId: event.queryId,
        docId: event.selectedId,
        relevance: correctedRelevance,
      });

      // Negative signals (non-clicked results above the clicked position)
      // These were examined but not clicked
      for (const result of event.results) {
        if (result.id === event.selectedId) continue;
        if (result.position >= event.selectedPosition) continue;

        const negPropensity = this.propensityModel.getPropensity(result.position);
        debiased.push({
          queryId: event.queryId,
          docId: result.id,
          relevance: -0.1 / negPropensity, // Small negative signal
        });
      }
    }

    return debiased;
  }

  /**
   * Update propensity model from observed data
   */
  async updatePropensityModel(): Promise<void> {
    if (!this.client) return;

    try {
      // Fetch recent feedback with selections
      const { data, error } = await this.client
        .from(this.FEEDBACK_TABLE)
        .select('selected_position')
        .not('selected_position', 'is', null)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1000);

      if (error || !data || data.length < 100) {
        return; // Not enough data
      }

      // Count selections by position
      const positionCounts = new Map<number, number>();
      let totalSelections = 0;

      for (const row of data) {
        const pos = row.selected_position;
        positionCounts.set(pos, (positionCounts.get(pos) || 0) + 1);
        totalSelections++;
      }

      // Estimate propensities (normalize to position 1)
      const pos1Count = positionCounts.get(1) || 1;
      const newPropensities: number[] = [];

      for (let i = 1; i <= 10; i++) {
        const count = positionCounts.get(i) || 0;
        newPropensities.push(count / pos1Count);
      }

      // Smooth propensities (exponential decay constraint)
      for (let i = 1; i < newPropensities.length; i++) {
        newPropensities[i] = Math.min(
          newPropensities[i],
          newPropensities[i - 1] * 0.95
        );
      }

      this.propensityModel.propensities = newPropensities;
      console.log('[Learning] Updated propensity model:', newPropensities);
    } catch (error) {
      console.error('[Learning] Failed to update propensity model:', error);
    }
  }

  // ============================================================================
  // Weight Optimization
  // ============================================================================

  /**
   * Update retriever weights based on feedback
   */
  async updateRetrieverWeights(): Promise<RetrieverWeights | null> {
    if (!this.client) {
      return null;
    }

    try {
      // Fetch recent feedback
      const { data, error } = await this.client
        .from(this.FEEDBACK_TABLE)
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('selected_id', 'is', null);

      if (error || !data || data.length < MIN_FEEDBACK_SAMPLES) {
        console.log('[Learning] Not enough feedback for weight update');
        return null;
      }

      // Convert to SearchEvent format
      const feedback: SearchEvent[] = data.map(row => ({
        queryId: row.id,
        query: row.query,
        queryEmbedding: row.query_embedding,
        results: row.result_ids.map((id: string, index: number) => ({
          id,
          position: index + 1,
          retriever: 'vector' as RetrieverType, // Default, actual would be stored
          score: 0,
        })),
        selectedId: row.selected_id,
        selectedPosition: row.selected_position,
        sessionId: row.session_id || '',
        timestamp: new Date(row.created_at),
      }));

      // Correct for position bias
      const debiased = this.correctPositionBias(feedback);

      // Evaluate retriever performance
      const performance = this.evaluateRetrieverPerformance(debiased, feedback);

      // Optimize weights
      const newWeights = this.optimizeWeights(performance);

      // Evaluate metrics
      const metrics = this.evaluateMetrics(debiased);

      // Save to database
      await fusionManager.saveLearnedWeights(newWeights, metrics);

      this.lastWeightUpdate = new Date();
      console.log('[Learning] Updated retriever weights:', newWeights);

      return newWeights;
    } catch (error) {
      console.error('[Learning] Failed to update weights:', error);
      return null;
    }
  }

  /**
   * Evaluate retriever performance from debiased feedback
   */
  private evaluateRetrieverPerformance(
    debiased: DebaisedFeedback[],
    feedback: SearchEvent[]
  ): Record<RetrieverType, { hits: number; misses: number; avgPosition: number }> {
    const performance: Record<RetrieverType, { hits: number; misses: number; avgPosition: number }> = {
      bm25: { hits: 0, misses: 0, avgPosition: 0 },
      vector: { hits: 0, misses: 0, avgPosition: 0 },
      splade: { hits: 0, misses: 0, avgPosition: 0 },
    };

    const positionSums: Record<RetrieverType, { sum: number; count: number }> = {
      bm25: { sum: 0, count: 0 },
      vector: { sum: 0, count: 0 },
      splade: { sum: 0, count: 0 },
    };

    for (const event of feedback) {
      if (!event.selectedId) continue;

      for (const result of event.results) {
        const retriever = result.retriever;

        if (result.id === event.selectedId) {
          performance[retriever].hits++;
          positionSums[retriever].sum += result.position;
          positionSums[retriever].count++;
        } else if (result.position < (event.selectedPosition || Infinity)) {
          performance[retriever].misses++;
        }
      }
    }

    // Calculate average positions
    for (const retriever of Object.keys(performance) as RetrieverType[]) {
      if (positionSums[retriever].count > 0) {
        performance[retriever].avgPosition =
          positionSums[retriever].sum / positionSums[retriever].count;
      }
    }

    return performance;
  }

  /**
   * Optimize weights using simple gradient descent
   */
  private optimizeWeights(
    performance: Record<RetrieverType, { hits: number; misses: number; avgPosition: number }>
  ): RetrieverWeights {
    const currentWeights = fusionManager.getLearnedWeights();

    // Calculate performance scores
    const scores: Record<RetrieverType, number> = {
      bm25: 0,
      vector: 0,
      splade: 0,
    };

    for (const retriever of Object.keys(performance) as RetrieverType[]) {
      const p = performance[retriever];
      const total = p.hits + p.misses;

      if (total > 0) {
        const hitRate = p.hits / total;
        const positionBonus = p.avgPosition > 0 ? 1 / p.avgPosition : 0;
        scores[retriever] = hitRate * 0.7 + positionBonus * 0.3;
      } else {
        scores[retriever] = 0.5; // Default
      }
    }

    // Normalize scores
    const totalScore = scores.bm25 + scores.vector + scores.splade;
    if (totalScore > 0) {
      scores.bm25 /= totalScore;
      scores.vector /= totalScore;
      scores.splade /= totalScore;
    }

    // Update weights with learning rate
    const newWeights: RetrieverWeights = {
      bm25: currentWeights.bm25 + LEARNING_RATE * (scores.bm25 * 3 - currentWeights.bm25),
      vector: currentWeights.vector + LEARNING_RATE * (scores.vector * 3 - currentWeights.vector),
      splade: currentWeights.splade + LEARNING_RATE * (scores.splade * 3 - currentWeights.splade),
    };

    // Clamp to reasonable range
    newWeights.bm25 = Math.max(0.5, Math.min(2.0, newWeights.bm25));
    newWeights.vector = Math.max(0.5, Math.min(2.0, newWeights.vector));
    newWeights.splade = Math.max(0.5, Math.min(2.0, newWeights.splade));

    return newWeights;
  }

  /**
   * Calculate ranking metrics (NDCG, MRR)
   */
  private evaluateMetrics(debiased: DebaisedFeedback[]): { ndcg: number; mrr: number } {
    if (debiased.length === 0) {
      return { ndcg: 0, mrr: 0 };
    }

    // Group by query
    const queryGroups = new Map<string, DebaisedFeedback[]>();
    for (const fb of debiased) {
      const existing = queryGroups.get(fb.queryId) || [];
      existing.push(fb);
      queryGroups.set(fb.queryId, existing);
    }

    let totalNDCG = 0;
    let totalMRR = 0;

    for (const [, feedbacks] of queryGroups) {
      // Sort by relevance
      feedbacks.sort((a, b) => b.relevance - a.relevance);

      // Calculate DCG
      let dcg = 0;
      for (let i = 0; i < feedbacks.length; i++) {
        const rel = Math.max(0, feedbacks[i].relevance);
        dcg += (Math.pow(2, rel) - 1) / Math.log2(i + 2);
      }

      // Calculate ideal DCG
      const idealOrder = [...feedbacks].sort((a, b) => b.relevance - a.relevance);
      let idcg = 0;
      for (let i = 0; i < idealOrder.length; i++) {
        const rel = Math.max(0, idealOrder[i].relevance);
        idcg += (Math.pow(2, rel) - 1) / Math.log2(i + 2);
      }

      // NDCG
      if (idcg > 0) {
        totalNDCG += dcg / idcg;
      }

      // MRR (first relevant document)
      const firstRelevant = feedbacks.findIndex(f => f.relevance > 0);
      if (firstRelevant >= 0) {
        totalMRR += 1 / (firstRelevant + 1);
      }
    }

    return {
      ndcg: queryGroups.size > 0 ? totalNDCG / queryGroups.size : 0,
      mrr: queryGroups.size > 0 ? totalMRR / queryGroups.size : 0,
    };
  }

  // ============================================================================
  // Scheduled Tasks
  // ============================================================================

  /**
   * Run weekly weight optimization
   */
  async runWeeklyOptimization(): Promise<void> {
    console.log('[Learning] Starting weekly weight optimization...');

    // Update propensity model first
    await this.updatePropensityModel();

    // Update retriever weights
    const newWeights = await this.updateRetrieverWeights();

    if (newWeights) {
      console.log('[Learning] Weekly optimization complete');
    } else {
      console.log('[Learning] Weekly optimization skipped (insufficient data)');
    }
  }

  /**
   * Get current feedback stats
   */
  async getStats(): Promise<{
    totalFeedback: number;
    recentFeedback: number;
    lastWeightUpdate: Date | null;
    propensities: number[];
  }> {
    let totalFeedback = 0;
    let recentFeedback = 0;

    if (this.client) {
      try {
        // Total count
        const { count: total } = await this.client
          .from(this.FEEDBACK_TABLE)
          .select('*', { count: 'exact', head: true });

        totalFeedback = total || 0;

        // Recent count (last 7 days)
        const { count: recent } = await this.client
          .from(this.FEEDBACK_TABLE)
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        recentFeedback = recent || 0;
      } catch (error) {
        console.error('[Learning] Failed to get stats:', error);
      }
    }

    return {
      totalFeedback,
      recentFeedback,
      lastWeightUpdate: this.lastWeightUpdate,
      propensities: this.propensityModel.propensities,
    };
  }
}

// Export singleton instance
export const learningManager = new LearningManager();
