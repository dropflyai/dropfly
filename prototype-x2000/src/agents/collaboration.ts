/**
 * Brain Tension Protocol
 * Structured debate and collaboration between brains
 * Source: AutoGen debate patterns, prototype_x1000 collaboration protocol
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  BrainType,
  Debate,
  DebateStatement,
  Decision,
  DecisionOption,
  CollaborationRequest,
  CollaborationResult,
  Learning,
} from '../types/index.js';
import { memoryManager } from '../memory/manager.js';

// ============================================================================
// Types
// ============================================================================

interface DebateConfig {
  maxRounds: number;
  consensusThreshold: number; // 0-1, percentage of agreement needed
  timeoutMs: number;
  requireEvidence: boolean;
}

interface DebateParticipant {
  brainType: BrainType;
  position?: string;
  statements: DebateStatement[];
  votedFor?: string;
}

interface DebateRound {
  roundNumber: number;
  statements: DebateStatement[];
  consensus: boolean;
  dominantPosition?: string;
}

interface ChallengeResult {
  challenged: boolean;
  challengeStatement?: DebateStatement;
  reason: string;
}

interface ConsensusResult {
  reached: boolean;
  agreementLevel: number;
  winningPosition?: string;
  dissenters: BrainType[];
}

const DEFAULT_CONFIG: DebateConfig = {
  maxRounds: 5,
  consensusThreshold: 0.7,
  timeoutMs: 60000,
  requireEvidence: true,
};

// ============================================================================
// Collaboration Manager
// ============================================================================

export class CollaborationManager {
  private activeDebates: Map<string, Debate> = new Map();
  private debateHistory: Debate[] = [];
  private config: DebateConfig;

  constructor(config: Partial<DebateConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // Debate Lifecycle
  // ============================================================================

  /**
   * Start a new debate on a topic
   */
  startDebate(
    topic: string,
    participants: BrainType[],
    context?: Record<string, unknown>
  ): Debate {
    const debate: Debate = {
      id: uuidv4(),
      topic,
      participants,
      statements: [],
      consensus: false,
      startedAt: new Date(),
    };

    this.activeDebates.set(debate.id, debate);
    console.log(`[Collaboration] Started debate: ${topic}`);
    console.log(`[Collaboration] Participants: ${participants.join(', ')}`);

    return debate;
  }

  /**
   * Add a proposal to a debate
   */
  propose(
    debateId: string,
    brain: BrainType,
    content: string,
    evidence?: string[]
  ): DebateStatement {
    const debate = this.activeDebates.get(debateId);
    if (!debate) {
      throw new Error(`Debate ${debateId} not found`);
    }

    if (!debate.participants.includes(brain)) {
      throw new Error(`Brain ${brain} is not a participant in this debate`);
    }

    const statement: DebateStatement = {
      id: uuidv4(),
      type: 'propose',
      brain,
      content,
      evidence: evidence ?? [],
      timestamp: new Date(),
    };

    debate.statements.push(statement);
    console.log(`[Collaboration] ${brain} proposes: ${content.substring(0, 50)}...`);

    return statement;
  }

  /**
   * Challenge a statement in a debate
   */
  challenge(
    debateId: string,
    brain: BrainType,
    targetStatementId: string,
    content: string,
    evidence?: string[]
  ): DebateStatement {
    const debate = this.activeDebates.get(debateId);
    if (!debate) {
      throw new Error(`Debate ${debateId} not found`);
    }

    const targetStatement = debate.statements.find((s) => s.id === targetStatementId);
    if (!targetStatement) {
      throw new Error(`Statement ${targetStatementId} not found`);
    }

    const statement: DebateStatement = {
      id: uuidv4(),
      type: 'challenge',
      brain,
      content,
      evidence: evidence ?? [],
      referencesStatementId: targetStatementId,
      timestamp: new Date(),
    };

    debate.statements.push(statement);
    console.log(
      `[Collaboration] ${brain} challenges ${targetStatement.brain}: ${content.substring(0, 50)}...`
    );

    return statement;
  }

  /**
   * Defend against a challenge
   */
  defend(
    debateId: string,
    brain: BrainType,
    challengeStatementId: string,
    content: string,
    evidence?: string[]
  ): DebateStatement {
    const debate = this.activeDebates.get(debateId);
    if (!debate) {
      throw new Error(`Debate ${debateId} not found`);
    }

    const statement: DebateStatement = {
      id: uuidv4(),
      type: 'defend',
      brain,
      content,
      evidence: evidence ?? [],
      referencesStatementId: challengeStatementId,
      timestamp: new Date(),
    };

    debate.statements.push(statement);
    console.log(`[Collaboration] ${brain} defends: ${content.substring(0, 50)}...`);

    return statement;
  }

  /**
   * Concede a point in a debate
   */
  concede(
    debateId: string,
    brain: BrainType,
    targetStatementId: string,
    content: string
  ): DebateStatement {
    const debate = this.activeDebates.get(debateId);
    if (!debate) {
      throw new Error(`Debate ${debateId} not found`);
    }

    const statement: DebateStatement = {
      id: uuidv4(),
      type: 'concede',
      brain,
      content,
      referencesStatementId: targetStatementId,
      timestamp: new Date(),
    };

    debate.statements.push(statement);
    console.log(`[Collaboration] ${brain} concedes: ${content.substring(0, 50)}...`);

    return statement;
  }

  // ============================================================================
  // Debate Resolution
  // ============================================================================

  /**
   * Resolve a debate and create a decision
   */
  resolveDebate(debateId: string, resolverBrain: BrainType = 'ceo'): Decision {
    const debate = this.activeDebates.get(debateId);
    if (!debate) {
      throw new Error(`Debate ${debateId} not found`);
    }

    // Analyze the debate
    const proposals = debate.statements.filter((s) => s.type === 'propose');
    const challenges = debate.statements.filter((s) => s.type === 'challenge');
    const concessions = debate.statements.filter((s) => s.type === 'concede');

    // Score each proposal
    const proposalScores = new Map<string, number>();
    for (const proposal of proposals) {
      let score = 1; // Base score

      // Add points for evidence
      score += (proposal.evidence?.length ?? 0) * 0.2;

      // Subtract for challenges against this proposal
      const challengesAgainst = challenges.filter(
        (c) => c.referencesStatementId === proposal.id
      );
      score -= challengesAgainst.length * 0.3;

      // Add points for successful defenses
      const defenses = debate.statements.filter(
        (s) =>
          s.type === 'defend' &&
          s.brain === proposal.brain &&
          challengesAgainst.some((c) => c.id === s.referencesStatementId)
      );
      score += defenses.length * 0.2;

      // Add points for others conceding to this proposal
      const concedesToThis = concessions.filter(
        (c) => c.referencesStatementId === proposal.id
      );
      score += concedesToThis.length * 0.5;

      proposalScores.set(proposal.id, score);
    }

    // Find the winning proposal
    let winningProposal = proposals[0];
    let highestScore = proposalScores.get(proposals[0]?.id) ?? 0;

    for (const proposal of proposals) {
      const score = proposalScores.get(proposal.id) ?? 0;
      if (score > highestScore) {
        highestScore = score;
        winningProposal = proposal;
      }
    }

    // Check for consensus
    const totalParticipants = debate.participants.length;
    const concedingBrains = new Set(concessions.map((c) => c.brain));
    const agreementLevel = (concedingBrains.size + 1) / totalParticipants; // +1 for proposer
    const consensus = agreementLevel >= this.config.consensusThreshold;

    // Create decision options from proposals
    const options: DecisionOption[] = proposals.map((p) => ({
      id: p.id,
      description: p.content,
      pros: p.evidence ?? [],
      cons: challenges
        .filter((c) => c.referencesStatementId === p.id)
        .map((c) => c.content),
      proposedBy: p.brain,
      votes: [p.brain],
    }));

    // Create the decision
    const decision: Decision = {
      id: uuidv4(),
      description: `Decision for: ${debate.topic}`,
      options,
      selectedOption: winningProposal?.id ?? '',
      rationale: this.generateRationale(debate, winningProposal, proposalScores),
      participants: debate.participants,
      debate,
      outcome: 'unknown',
      createdAt: new Date(),
    };

    // Update debate
    debate.resolution = decision.rationale;
    debate.consensus = consensus;
    debate.resolvedBy = resolverBrain;
    debate.resolvedAt = new Date();

    // Move to history
    this.activeDebates.delete(debateId);
    this.debateHistory.push(debate);

    // Store in memory
    memoryManager.storeDecision(decision);

    console.log(`[Collaboration] Debate resolved by ${resolverBrain}`);
    console.log(`[Collaboration] Consensus: ${consensus ? 'YES' : 'NO'} (${(agreementLevel * 100).toFixed(0)}%)`);
    console.log(`[Collaboration] Winner: ${winningProposal?.brain ?? 'none'}`);

    return decision;
  }

  private generateRationale(
    debate: Debate,
    winningProposal: DebateStatement | undefined,
    scores: Map<string, number>
  ): string {
    if (!winningProposal) {
      return 'No proposals were made during the debate.';
    }

    const proposals = debate.statements.filter((s) => s.type === 'propose');
    const challenges = debate.statements.filter((s) => s.type === 'challenge');

    const parts: string[] = [
      `After ${proposals.length} proposals and ${challenges.length} challenges,`,
      `${winningProposal.brain}'s approach was selected.`,
    ];

    const winningScore = scores.get(winningProposal.id) ?? 0;
    if (winningScore > 1.5) {
      parts.push('This proposal had strong evidence and withstood challenges effectively.');
    } else if (winningScore > 1) {
      parts.push('This proposal was moderately supported with some contested points.');
    } else {
      parts.push('This proposal was selected as the best available option despite limited support.');
    }

    return parts.join(' ');
  }

  // ============================================================================
  // Collaboration Requests
  // ============================================================================

  /**
   * Handle a collaboration request
   */
  async handleCollaborationRequest(
    request: CollaborationRequest
  ): Promise<CollaborationResult> {
    const startTime = Date.now();

    // Start debate
    const debate = this.startDebate(
      request.topic,
      [request.fromBrain, ...request.toBrains]
    );

    // In a real implementation, this would invoke each brain
    // For now, simulate the debate structure

    // Resolve and return
    const decision = this.resolveDebate(debate.id);

    const learnings = this.extractLearnings(debate, decision);

    return {
      requestId: request.id,
      participants: debate.participants,
      debate,
      decision,
      learnings,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Extract learnings from a debate
   */
  private extractLearnings(debate: Debate, decision: Decision): Learning[] {
    const learnings: Learning[] = [];

    // Learning from consensus or lack thereof
    if (debate.consensus) {
      learnings.push({
        id: uuidv4(),
        type: 'success',
        source: 'ceo',
        taskId: debate.id,
        description: `Debate on "${debate.topic}" reached consensus`,
        recommendation: 'Similar topics can likely achieve agreement with structured debate',
        confidence: 0.8,
        createdAt: new Date(),
        appliedCount: 0,
        tags: ['debate', 'consensus', ...debate.participants],
      });
    } else {
      learnings.push({
        id: uuidv4(),
        type: 'insight',
        source: 'ceo',
        taskId: debate.id,
        description: `Debate on "${debate.topic}" did not reach consensus - CEO resolution required`,
        recommendation: 'Topics like this may need clearer criteria or additional information',
        confidence: 0.7,
        createdAt: new Date(),
        appliedCount: 0,
        tags: ['debate', 'no-consensus', ...debate.participants],
      });
    }

    // Store learnings
    for (const learning of learnings) {
      memoryManager.storeLearning(learning);
    }

    return learnings;
  }

  // ============================================================================
  // Structured Collaboration Patterns
  // ============================================================================

  /**
   * Run a PROPOSE-CHALLENGE-RESOLVE cycle
   * This is the standard X2000 collaboration pattern
   */
  async runPCRCycle(
    topic: string,
    proposer: BrainType,
    challengers: BrainType[],
    resolver: BrainType = 'ceo',
    proposalContent: string,
    proposalEvidence?: string[]
  ): Promise<Decision> {
    // Step 1: Start debate
    const debate = this.startDebate(topic, [proposer, ...challengers, resolver]);

    // Step 2: Proposer makes proposal
    const proposal = this.propose(debate.id, proposer, proposalContent, proposalEvidence);

    // Step 3: Each challenger reviews and potentially challenges
    // In production, this would invoke actual brain logic
    // For now, return the decision with just the proposal

    // Step 4: Resolve
    return this.resolveDebate(debate.id, resolver);
  }

  /**
   * Run a multi-brain validation
   * Multiple brains independently validate an approach
   */
  async runValidation(
    topic: string,
    approach: string,
    validators: BrainType[]
  ): Promise<{
    approved: boolean;
    approvals: BrainType[];
    rejections: BrainType[];
    concerns: string[];
  }> {
    const approvals: BrainType[] = [];
    const rejections: BrainType[] = [];
    const concerns: string[] = [];

    // In production, each validator would independently assess
    // For now, return a structure for the pattern

    const approved = approvals.length > rejections.length;

    return { approved, approvals, rejections, concerns };
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  /**
   * Get debate statistics
   */
  getStats(): {
    totalDebates: number;
    activeDebates: number;
    consensusRate: number;
    avgParticipants: number;
    avgStatements: number;
  } {
    const completed = this.debateHistory;
    const consensusCount = completed.filter((d) => d.consensus).length;

    return {
      totalDebates: completed.length + this.activeDebates.size,
      activeDebates: this.activeDebates.size,
      consensusRate: completed.length > 0 ? consensusCount / completed.length : 0,
      avgParticipants:
        completed.length > 0
          ? completed.reduce((sum, d) => sum + d.participants.length, 0) / completed.length
          : 0,
      avgStatements:
        completed.length > 0
          ? completed.reduce((sum, d) => sum + d.statements.length, 0) / completed.length
          : 0,
    };
  }

  /**
   * Get most active collaborators
   */
  getMostActiveCollaborators(): Array<{ brain: BrainType; count: number }> {
    const counts = new Map<BrainType, number>();

    for (const debate of this.debateHistory) {
      for (const statement of debate.statements) {
        counts.set(statement.brain, (counts.get(statement.brain) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .map(([brain, count]) => ({ brain, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get collaboration summary
   */
  getSummary(): string {
    const stats = this.getStats();
    const activeCollaborators = this.getMostActiveCollaborators().slice(0, 5);

    return `
Collaboration System Status:
----------------------------
Total Debates: ${stats.totalDebates}
Active Debates: ${stats.activeDebates}
Consensus Rate: ${(stats.consensusRate * 100).toFixed(1)}%
Avg Participants: ${stats.avgParticipants.toFixed(1)}
Avg Statements: ${stats.avgStatements.toFixed(1)}

Most Active:
${activeCollaborators.map((c) => `  ${c.brain}: ${c.count} statements`).join('\n')}
    `.trim();
  }
}

// Export singleton instance
export const collaborationManager = new CollaborationManager();
