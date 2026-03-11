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

// ============================================================================
// Brain Tension Manager
// Implements the PROPOSE → CHALLENGE → DEFEND → RESOLVE cycle
// ============================================================================

/**
 * Proposal state within a tension debate
 */
interface TensionProposal {
  id: string;
  brainId: BrainType;
  content: string;
  evidence: string[];
  challenges: TensionChallenge[];
  defenses: TensionDefense[];
  supporters: Set<BrainType>;
  opposers: Set<BrainType>;
  status: 'active' | 'withdrawn' | 'accepted' | 'rejected';
  createdAt: Date;
}

/**
 * Challenge against a proposal
 */
interface TensionChallenge {
  id: string;
  challengerId: BrainType;
  proposalId: string;
  objection: string;
  evidence: string[];
  addressed: boolean;
  createdAt: Date;
}

/**
 * Defense of a proposal against a challenge
 */
interface TensionDefense {
  id: string;
  proposalId: string;
  challengeId: string;
  response: string;
  additionalEvidence: string[];
  createdAt: Date;
}

/**
 * Configuration for a tension debate
 */
interface TensionDebateConfig {
  topic: string;
  participants: BrainType[];
  timeoutMs: number;
  consensusThreshold: number;
  maxRounds: number;
}

/**
 * State of an active tension debate
 */
interface TensionDebateState {
  id: string;
  config: TensionDebateConfig;
  proposals: Map<string, TensionProposal>;
  round: number;
  phase: 'proposal' | 'challenge' | 'defense' | 'resolution';
  startedAt: Date;
  timeoutHandle?: ReturnType<typeof setTimeout>;
  resolved: boolean;
  resolution?: TensionResolution;
}

/**
 * Resolution of a tension debate
 */
interface TensionResolution {
  winningProposalId: string | null;
  consensusReached: boolean;
  agreementLevel: number;
  resolvedBy: BrainType;
  rationale: string;
  learnings: Learning[];
  resolvedAt: Date;
}

/**
 * Result of attempting to propose, challenge, or defend
 */
interface TensionActionResult {
  success: boolean;
  error?: string;
  proposal?: TensionProposal;
  challenge?: TensionChallenge;
  defense?: TensionDefense;
}

/**
 * Brain Tension Manager
 * Implements structured debate protocol for resolving conflicts between brains
 *
 * Protocol:
 * 1. PROPOSE: Brain proposes an approach with evidence
 * 2. CHALLENGE: Other brains challenge with objections and evidence
 * 3. DEFEND: Original brain defends with additional evidence
 * 4. RESOLVE: If no consensus (70%+), CEO Brain makes final decision
 */
export class BrainTensionManager {
  private activeDebates: Map<string, TensionDebateState> = new Map();
  private debateHistory: TensionResolution[] = [];
  private defaultConfig: Partial<TensionDebateConfig> = {
    timeoutMs: 300000, // 5 minutes default
    consensusThreshold: 0.7, // 70% agreement required
    maxRounds: 5,
  };

  // ============================================================================
  // Debate Lifecycle
  // ============================================================================

  /**
   * Start a new tension debate
   */
  startDebate(config: TensionDebateConfig): string {
    const debateId = uuidv4();

    const fullConfig: TensionDebateConfig = {
      ...this.defaultConfig,
      ...config,
    };

    const state: TensionDebateState = {
      id: debateId,
      config: fullConfig,
      proposals: new Map(),
      round: 1,
      phase: 'proposal',
      startedAt: new Date(),
      resolved: false,
    };

    // Set up timeout handler
    state.timeoutHandle = setTimeout(() => {
      this.handleTimeout(debateId);
    }, fullConfig.timeoutMs);

    this.activeDebates.set(debateId, state);

    console.log(`[BrainTension] Started debate: ${config.topic}`);
    console.log(`[BrainTension] Participants: ${config.participants.join(', ')}`);
    console.log(`[BrainTension] Timeout: ${fullConfig.timeoutMs}ms, Consensus threshold: ${fullConfig.consensusThreshold * 100}%`);

    return debateId;
  }

  /**
   * Handle debate timeout - force resolution
   */
  private handleTimeout(debateId: string): void {
    const state = this.activeDebates.get(debateId);
    if (!state || state.resolved) return;

    console.log(`[BrainTension] Debate ${debateId} timed out, forcing CEO resolution`);

    // Force resolution by CEO Brain
    this.resolve(debateId);
  }

  // ============================================================================
  // PROPOSE Phase
  // ============================================================================

  /**
   * Submit a proposal in a tension debate
   * @param debateId - The debate to submit to
   * @param brainId - The brain making the proposal
   * @param content - The proposal content
   * @param evidence - Supporting evidence for the proposal
   */
  propose(
    debateId: string,
    brainId: BrainType,
    content: string,
    evidence: string[] = []
  ): TensionActionResult {
    const state = this.activeDebates.get(debateId);

    if (!state) {
      return { success: false, error: `Debate ${debateId} not found` };
    }

    if (state.resolved) {
      return { success: false, error: 'Debate already resolved' };
    }

    if (!state.config.participants.includes(brainId)) {
      return { success: false, error: `Brain ${brainId} is not a participant` };
    }

    const proposal: TensionProposal = {
      id: uuidv4(),
      brainId,
      content,
      evidence,
      challenges: [],
      defenses: [],
      supporters: new Set([brainId]), // Proposer automatically supports
      opposers: new Set(),
      status: 'active',
      createdAt: new Date(),
    };

    state.proposals.set(proposal.id, proposal);
    state.phase = 'challenge';

    console.log(`[BrainTension] ${brainId} proposes: ${content.substring(0, 80)}...`);
    console.log(`[BrainTension] Evidence provided: ${evidence.length} items`);

    // Log to memory
    this.logProposalToMemory(state, proposal);

    return { success: true, proposal };
  }

  // ============================================================================
  // CHALLENGE Phase
  // ============================================================================

  /**
   * Challenge an existing proposal
   * @param debateId - The debate containing the proposal
   * @param proposalId - The proposal being challenged
   * @param challengerId - The brain making the challenge
   * @param objection - The objection content
   * @param evidence - Evidence supporting the objection
   */
  challenge(
    debateId: string,
    proposalId: string,
    challengerId: BrainType,
    objection: string,
    evidence: string[] = []
  ): TensionActionResult {
    const state = this.activeDebates.get(debateId);

    if (!state) {
      return { success: false, error: `Debate ${debateId} not found` };
    }

    if (state.resolved) {
      return { success: false, error: 'Debate already resolved' };
    }

    const proposal = state.proposals.get(proposalId);
    if (!proposal) {
      return { success: false, error: `Proposal ${proposalId} not found` };
    }

    if (!state.config.participants.includes(challengerId)) {
      return { success: false, error: `Brain ${challengerId} is not a participant` };
    }

    if (challengerId === proposal.brainId) {
      return { success: false, error: 'Cannot challenge your own proposal' };
    }

    const challengeItem: TensionChallenge = {
      id: uuidv4(),
      challengerId,
      proposalId,
      objection,
      evidence,
      addressed: false,
      createdAt: new Date(),
    };

    proposal.challenges.push(challengeItem);
    proposal.opposers.add(challengerId);
    proposal.supporters.delete(challengerId);
    state.phase = 'defense';

    console.log(`[BrainTension] ${challengerId} challenges ${proposal.brainId}'s proposal`);
    console.log(`[BrainTension] Objection: ${objection.substring(0, 80)}...`);

    // Log challenge to memory
    this.logChallengeToMemory(state, proposal, challengeItem);

    return { success: true, challenge: challengeItem };
  }

  // ============================================================================
  // DEFEND Phase
  // ============================================================================

  /**
   * Defend a proposal against a challenge
   * @param debateId - The debate containing the proposal
   * @param proposalId - The proposal being defended
   * @param challengeId - The specific challenge being addressed
   * @param response - The defense response
   * @param additionalEvidence - New evidence supporting the defense
   */
  defend(
    debateId: string,
    proposalId: string,
    challengeId: string,
    response: string,
    additionalEvidence: string[] = []
  ): TensionActionResult {
    const state = this.activeDebates.get(debateId);

    if (!state) {
      return { success: false, error: `Debate ${debateId} not found` };
    }

    if (state.resolved) {
      return { success: false, error: 'Debate already resolved' };
    }

    const proposal = state.proposals.get(proposalId);
    if (!proposal) {
      return { success: false, error: `Proposal ${proposalId} not found` };
    }

    const challenge = proposal.challenges.find(c => c.id === challengeId);
    if (!challenge) {
      return { success: false, error: `Challenge ${challengeId} not found` };
    }

    if (challenge.addressed) {
      return { success: false, error: 'Challenge already addressed' };
    }

    const defense: TensionDefense = {
      id: uuidv4(),
      proposalId,
      challengeId,
      response,
      additionalEvidence,
      createdAt: new Date(),
    };

    proposal.defenses.push(defense);
    proposal.evidence.push(...additionalEvidence);
    challenge.addressed = true;

    console.log(`[BrainTension] ${proposal.brainId} defends against ${challenge.challengerId}`);
    console.log(`[BrainTension] Response: ${response.substring(0, 80)}...`);

    // Log defense to memory
    this.logDefenseToMemory(state, proposal, defense);

    return { success: true, defense };
  }

  // ============================================================================
  // Support/Oppose (Voting)
  // ============================================================================

  /**
   * Express support for a proposal
   */
  support(debateId: string, proposalId: string, brainId: BrainType): TensionActionResult {
    const state = this.activeDebates.get(debateId);

    if (!state) {
      return { success: false, error: `Debate ${debateId} not found` };
    }

    const proposal = state.proposals.get(proposalId);
    if (!proposal) {
      return { success: false, error: `Proposal ${proposalId} not found` };
    }

    if (!state.config.participants.includes(brainId)) {
      return { success: false, error: `Brain ${brainId} is not a participant` };
    }

    proposal.supporters.add(brainId);
    proposal.opposers.delete(brainId);

    console.log(`[BrainTension] ${brainId} supports proposal from ${proposal.brainId}`);

    return { success: true, proposal };
  }

  /**
   * Express opposition to a proposal
   */
  oppose(debateId: string, proposalId: string, brainId: BrainType): TensionActionResult {
    const state = this.activeDebates.get(debateId);

    if (!state) {
      return { success: false, error: `Debate ${debateId} not found` };
    }

    const proposal = state.proposals.get(proposalId);
    if (!proposal) {
      return { success: false, error: `Proposal ${proposalId} not found` };
    }

    if (!state.config.participants.includes(brainId)) {
      return { success: false, error: `Brain ${brainId} is not a participant` };
    }

    proposal.opposers.add(brainId);
    proposal.supporters.delete(brainId);

    console.log(`[BrainTension] ${brainId} opposes proposal from ${proposal.brainId}`);

    return { success: true, proposal };
  }

  // ============================================================================
  // RESOLVE Phase
  // ============================================================================

  /**
   * Calculate consensus level for the debate
   */
  calculateConsensus(debateId: string): {
    consensusReached: boolean;
    agreementLevel: number;
    leadingProposal: TensionProposal | null;
    voteCounts: Map<string, { supporters: number; opposers: number }>;
  } {
    const state = this.activeDebates.get(debateId);

    if (!state) {
      return {
        consensusReached: false,
        agreementLevel: 0,
        leadingProposal: null,
        voteCounts: new Map(),
      };
    }

    const totalParticipants = state.config.participants.length;
    const voteCounts = new Map<string, { supporters: number; opposers: number }>();
    let leadingProposal: TensionProposal | null = null;
    let maxSupport = 0;

    // Calculate support for each proposal
    for (const [proposalId, proposal] of state.proposals) {
      const supporters = proposal.supporters.size;
      const opposers = proposal.opposers.size;

      voteCounts.set(proposalId, { supporters, opposers });

      if (supporters > maxSupport) {
        maxSupport = supporters;
        leadingProposal = proposal;
      }
    }

    // Calculate agreement level (percentage of participants supporting leading proposal)
    const agreementLevel = totalParticipants > 0 ? maxSupport / totalParticipants : 0;
    const consensusReached = agreementLevel >= state.config.consensusThreshold;

    return {
      consensusReached,
      agreementLevel,
      leadingProposal,
      voteCounts,
    };
  }

  /**
   * Resolve the debate
   * If consensus is not reached, CEO Brain makes the final decision
   */
  resolve(debateId: string, resolver: BrainType = 'ceo'): TensionResolution | null {
    const state = this.activeDebates.get(debateId);

    if (!state) {
      console.error(`[BrainTension] Cannot resolve: Debate ${debateId} not found`);
      return null;
    }

    if (state.resolved) {
      console.warn(`[BrainTension] Debate ${debateId} already resolved`);
      return state.resolution ?? null;
    }

    // Clear timeout
    if (state.timeoutHandle) {
      clearTimeout(state.timeoutHandle);
    }

    // Calculate consensus
    const { consensusReached, agreementLevel, leadingProposal, voteCounts } =
      this.calculateConsensus(debateId);

    // Generate rationale
    const rationale = this.generateResolutionRationale(
      state,
      leadingProposal,
      consensusReached,
      agreementLevel,
      voteCounts
    );

    // Create resolution
    const resolution: TensionResolution = {
      winningProposalId: leadingProposal?.id ?? null,
      consensusReached,
      agreementLevel,
      resolvedBy: consensusReached ? leadingProposal?.brainId ?? resolver : resolver,
      rationale,
      learnings: [],
      resolvedAt: new Date(),
    };

    // Extract learnings from the debate
    resolution.learnings = this.extractDebateLearnings(state, resolution);

    // Update state
    state.resolved = true;
    state.resolution = resolution;
    state.phase = 'resolution';

    if (leadingProposal) {
      leadingProposal.status = 'accepted';
      // Mark other proposals as rejected
      for (const [id, proposal] of state.proposals) {
        if (id !== leadingProposal.id) {
          proposal.status = 'rejected';
        }
      }
    }

    // Store in history
    this.debateHistory.push(resolution);

    // Log resolution to memory
    this.logResolutionToMemory(state, resolution);

    // Create decision record
    this.createDecisionRecord(state, resolution);

    console.log(`[BrainTension] Debate resolved by ${resolution.resolvedBy}`);
    console.log(`[BrainTension] Consensus: ${consensusReached ? 'YES' : 'NO'} (${(agreementLevel * 100).toFixed(1)}%)`);
    console.log(`[BrainTension] Winner: ${leadingProposal?.brainId ?? 'none'}`);

    // Remove from active debates
    this.activeDebates.delete(debateId);

    return resolution;
  }

  /**
   * Force resolution with a specific proposal (CEO override)
   */
  forceResolve(
    debateId: string,
    proposalId: string,
    rationale: string
  ): TensionResolution | null {
    const state = this.activeDebates.get(debateId);

    if (!state) {
      return null;
    }

    const proposal = state.proposals.get(proposalId);
    if (!proposal) {
      return null;
    }

    // Clear timeout
    if (state.timeoutHandle) {
      clearTimeout(state.timeoutHandle);
    }

    const { agreementLevel } = this.calculateConsensus(debateId);

    const resolution: TensionResolution = {
      winningProposalId: proposalId,
      consensusReached: false,
      agreementLevel,
      resolvedBy: 'ceo',
      rationale: `CEO Override: ${rationale}`,
      learnings: [],
      resolvedAt: new Date(),
    };

    resolution.learnings = this.extractDebateLearnings(state, resolution);

    state.resolved = true;
    state.resolution = resolution;
    proposal.status = 'accepted';

    this.debateHistory.push(resolution);
    this.logResolutionToMemory(state, resolution);
    this.createDecisionRecord(state, resolution);
    this.activeDebates.delete(debateId);

    console.log(`[BrainTension] CEO forced resolution for debate ${debateId}`);

    return resolution;
  }

  // ============================================================================
  // Memory Integration
  // ============================================================================

  private logProposalToMemory(state: TensionDebateState, proposal: TensionProposal): void {
    const learning: Learning = {
      id: uuidv4(),
      type: 'insight',
      source: proposal.brainId,
      taskId: state.id,
      description: `Proposal made: ${proposal.content.substring(0, 200)}`,
      recommendation: `Evidence provided: ${proposal.evidence.join('; ')}`,
      confidence: 0.6,
      createdAt: new Date(),
      appliedCount: 0,
      tags: ['brain-tension', 'proposal', state.config.topic.toLowerCase().split(' ').slice(0, 3).join('-')],
    };
    memoryManager.storeLearning(learning);
  }

  private logChallengeToMemory(
    state: TensionDebateState,
    proposal: TensionProposal,
    challenge: TensionChallenge
  ): void {
    const learning: Learning = {
      id: uuidv4(),
      type: 'insight',
      source: challenge.challengerId,
      taskId: state.id,
      description: `Challenge to ${proposal.brainId}: ${challenge.objection.substring(0, 200)}`,
      recommendation: `Consider: ${challenge.evidence.join('; ')}`,
      confidence: 0.6,
      createdAt: new Date(),
      appliedCount: 0,
      tags: ['brain-tension', 'challenge', proposal.brainId],
    };
    memoryManager.storeLearning(learning);
  }

  private logDefenseToMemory(
    state: TensionDebateState,
    proposal: TensionProposal,
    defense: TensionDefense
  ): void {
    const learning: Learning = {
      id: uuidv4(),
      type: 'insight',
      source: proposal.brainId,
      taskId: state.id,
      description: `Defense: ${defense.response.substring(0, 200)}`,
      recommendation: `Additional evidence: ${defense.additionalEvidence.join('; ')}`,
      confidence: 0.6,
      createdAt: new Date(),
      appliedCount: 0,
      tags: ['brain-tension', 'defense', proposal.brainId],
    };
    memoryManager.storeLearning(learning);
  }

  private logResolutionToMemory(state: TensionDebateState, resolution: TensionResolution): void {
    const learning: Learning = {
      id: uuidv4(),
      type: resolution.consensusReached ? 'success' : 'insight',
      source: resolution.resolvedBy,
      taskId: state.id,
      description: `Debate "${state.config.topic}" resolved: ${resolution.rationale.substring(0, 200)}`,
      recommendation: resolution.consensusReached
        ? 'Consensus-based decisions tend to have better outcomes'
        : 'CEO resolution was required - consider clearer criteria for similar debates',
      confidence: resolution.consensusReached ? 0.85 : 0.7,
      createdAt: new Date(),
      appliedCount: 0,
      tags: ['brain-tension', 'resolution', resolution.consensusReached ? 'consensus' : 'ceo-override'],
    };
    memoryManager.storeLearning(learning);

    // Store all extracted learnings
    for (const l of resolution.learnings) {
      memoryManager.storeLearning(l);
    }
  }

  private createDecisionRecord(state: TensionDebateState, resolution: TensionResolution): void {
    const proposals = Array.from(state.proposals.values());

    const options: DecisionOption[] = proposals.map(p => ({
      id: p.id,
      description: p.content,
      pros: p.evidence,
      cons: p.challenges.map(c => c.objection),
      proposedBy: p.brainId,
      votes: Array.from(p.supporters),
    }));

    // Create underlying debate record
    const debate: Debate = {
      id: state.id,
      topic: state.config.topic,
      participants: state.config.participants,
      statements: this.convertToDebateStatements(state),
      resolution: resolution.rationale,
      resolvedBy: resolution.resolvedBy,
      consensus: resolution.consensusReached,
      startedAt: state.startedAt,
      resolvedAt: resolution.resolvedAt,
    };

    const decision: Decision = {
      id: uuidv4(),
      description: `Brain Tension Resolution: ${state.config.topic}`,
      options,
      selectedOption: resolution.winningProposalId ?? '',
      rationale: resolution.rationale,
      participants: state.config.participants,
      debate,
      outcome: 'unknown',
      createdAt: new Date(),
    };

    memoryManager.storeDecision(decision);
  }

  private convertToDebateStatements(state: TensionDebateState): DebateStatement[] {
    const statements: DebateStatement[] = [];

    for (const proposal of state.proposals.values()) {
      // Add proposal statement
      statements.push({
        id: proposal.id,
        type: 'propose',
        brain: proposal.brainId,
        content: proposal.content,
        evidence: proposal.evidence,
        timestamp: proposal.createdAt,
      });

      // Add challenge statements
      for (const challenge of proposal.challenges) {
        statements.push({
          id: challenge.id,
          type: 'challenge',
          brain: challenge.challengerId,
          content: challenge.objection,
          evidence: challenge.evidence,
          referencesStatementId: proposal.id,
          timestamp: challenge.createdAt,
        });
      }

      // Add defense statements
      for (const defense of proposal.defenses) {
        statements.push({
          id: defense.id,
          type: 'defend',
          brain: proposal.brainId,
          content: defense.response,
          evidence: defense.additionalEvidence,
          referencesStatementId: defense.challengeId,
          timestamp: defense.createdAt,
        });
      }
    }

    return statements.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // ============================================================================
  // Learning Extraction
  // ============================================================================

  private extractDebateLearnings(
    state: TensionDebateState,
    resolution: TensionResolution
  ): Learning[] {
    const learnings: Learning[] = [];

    // Learning about consensus patterns
    if (resolution.consensusReached) {
      learnings.push({
        id: uuidv4(),
        type: 'success',
        source: resolution.resolvedBy,
        taskId: state.id,
        description: `High consensus (${(resolution.agreementLevel * 100).toFixed(0)}%) achieved on "${state.config.topic}"`,
        recommendation: 'Similar debates may benefit from the same structured approach',
        confidence: 0.8,
        createdAt: new Date(),
        appliedCount: 0,
        tags: ['consensus', 'brain-tension', ...state.config.participants.slice(0, 3)],
      });
    } else {
      learnings.push({
        id: uuidv4(),
        type: 'insight',
        source: 'ceo',
        taskId: state.id,
        description: `Low consensus (${(resolution.agreementLevel * 100).toFixed(0)}%) required CEO resolution for "${state.config.topic}"`,
        recommendation: 'Topics of this nature may need additional context or constraints upfront',
        confidence: 0.75,
        createdAt: new Date(),
        appliedCount: 0,
        tags: ['no-consensus', 'ceo-resolution', ...state.config.participants.slice(0, 3)],
      });
    }

    // Learning from winning proposal
    const winningProposal = resolution.winningProposalId
      ? state.proposals.get(resolution.winningProposalId)
      : null;

    if (winningProposal) {
      // What made this proposal successful?
      const factors: string[] = [];

      if (winningProposal.evidence.length > 2) {
        factors.push('strong evidence base');
      }
      if (winningProposal.defenses.length > 0) {
        factors.push('effective defense of challenges');
      }
      if (winningProposal.supporters.size > state.config.participants.length / 2) {
        factors.push('broad support');
      }

      if (factors.length > 0) {
        learnings.push({
          id: uuidv4(),
          type: 'success',
          source: winningProposal.brainId,
          taskId: state.id,
          description: `Winning proposal characterized by: ${factors.join(', ')}`,
          recommendation: `In future debates, emphasize: ${factors.join(', ')}`,
          confidence: 0.7,
          createdAt: new Date(),
          appliedCount: 0,
          tags: ['winning-strategy', 'brain-tension', winningProposal.brainId],
        });
      }
    }

    // Learning from failed proposals
    for (const proposal of state.proposals.values()) {
      if (proposal.id !== resolution.winningProposalId && proposal.challenges.length > 0) {
        const unaddressedChallenges = proposal.challenges.filter(c => !c.addressed);

        if (unaddressedChallenges.length > 0) {
          learnings.push({
            id: uuidv4(),
            type: 'failure',
            source: proposal.brainId,
            taskId: state.id,
            description: `Proposal failed with ${unaddressedChallenges.length} unaddressed challenges`,
            rootCause: unaddressedChallenges.map(c => c.objection).join('; '),
            recommendation: 'Address all challenges promptly to maintain proposal viability',
            confidence: 0.65,
            createdAt: new Date(),
            appliedCount: 0,
            tags: ['failed-proposal', 'unaddressed-challenges', proposal.brainId],
          });
        }
      }
    }

    return learnings;
  }

  // ============================================================================
  // Rationale Generation
  // ============================================================================

  private generateResolutionRationale(
    state: TensionDebateState,
    leadingProposal: TensionProposal | null,
    consensusReached: boolean,
    agreementLevel: number,
    voteCounts: Map<string, { supporters: number; opposers: number }>
  ): string {
    const parts: string[] = [];

    parts.push(`Debate on "${state.config.topic}" involved ${state.config.participants.length} brains.`);
    parts.push(`${state.proposals.size} proposals were considered.`);

    if (leadingProposal) {
      const counts = voteCounts.get(leadingProposal.id);
      parts.push(
        `${leadingProposal.brainId}'s proposal received ${counts?.supporters ?? 0} supporters and ${counts?.opposers ?? 0} opposers.`
      );

      if (consensusReached) {
        parts.push(
          `Consensus threshold of ${state.config.consensusThreshold * 100}% was met with ${(agreementLevel * 100).toFixed(1)}% agreement.`
        );
      } else {
        parts.push(
          `Consensus threshold of ${state.config.consensusThreshold * 100}% was NOT met (${(agreementLevel * 100).toFixed(1)}% agreement).`
        );
        parts.push('CEO Brain resolution was required.');
      }

      if (leadingProposal.challenges.length > 0) {
        const addressed = leadingProposal.challenges.filter(c => c.addressed).length;
        parts.push(
          `${leadingProposal.challenges.length} challenges were raised, ${addressed} were addressed.`
        );
      }

      if (leadingProposal.evidence.length > 0) {
        parts.push(`Winning proposal was supported by ${leadingProposal.evidence.length} pieces of evidence.`);
      }
    } else {
      parts.push('No proposals received sufficient support. No winner selected.');
    }

    return parts.join(' ');
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  /**
   * Get the current state of a debate
   */
  getDebateState(debateId: string): TensionDebateState | undefined {
    return this.activeDebates.get(debateId);
  }

  /**
   * Get all active debates
   */
  getActiveDebates(): TensionDebateState[] {
    return Array.from(this.activeDebates.values());
  }

  /**
   * Get proposals for a debate
   */
  getProposals(debateId: string): TensionProposal[] {
    const state = this.activeDebates.get(debateId);
    return state ? Array.from(state.proposals.values()) : [];
  }

  /**
   * Get debate history (resolved debates)
   */
  getDebateHistory(): TensionResolution[] {
    return [...this.debateHistory];
  }

  /**
   * Get statistics about brain tension debates
   */
  getStats(): {
    totalDebates: number;
    activeDebates: number;
    resolvedDebates: number;
    consensusRate: number;
    avgAgreementLevel: number;
  } {
    const resolved = this.debateHistory.length;
    const consensusCount = this.debateHistory.filter(r => r.consensusReached).length;
    const avgAgreement = resolved > 0
      ? this.debateHistory.reduce((sum, r) => sum + r.agreementLevel, 0) / resolved
      : 0;

    return {
      totalDebates: resolved + this.activeDebates.size,
      activeDebates: this.activeDebates.size,
      resolvedDebates: resolved,
      consensusRate: resolved > 0 ? consensusCount / resolved : 0,
      avgAgreementLevel: avgAgreement,
    };
  }

  /**
   * Get a summary of the brain tension system
   */
  getSummary(): string {
    const stats = this.getStats();

    return `
Brain Tension Protocol Status:
------------------------------
Total Debates: ${stats.totalDebates}
Active Debates: ${stats.activeDebates}
Resolved Debates: ${stats.resolvedDebates}
Consensus Rate: ${(stats.consensusRate * 100).toFixed(1)}%
Avg Agreement Level: ${(stats.avgAgreementLevel * 100).toFixed(1)}%
    `.trim();
  }
}

// Export singleton instance
export const brainTensionManager = new BrainTensionManager();
