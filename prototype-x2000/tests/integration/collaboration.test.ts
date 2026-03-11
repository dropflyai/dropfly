/**
 * Integration Tests: Brain Tension Protocol
 * Tests structured debate, consensus, and collaboration between brains
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CollaborationManager } from '../../src/agents/collaboration.js';
import type { BrainType, CollaborationRequest } from '../../src/types/index.js';

// Mock dependencies
vi.mock('../../src/memory/manager.js', () => ({
  memoryManager: {
    storeDecision: vi.fn(),
    storeLearning: vi.fn(),
  },
}));

describe('Brain Tension Protocol', () => {
  let collaborationManager: CollaborationManager;

  beforeEach(() => {
    collaborationManager = new CollaborationManager({
      maxRounds: 5,
      consensusThreshold: 0.7,
      timeoutMs: 60000,
      requireEvidence: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Debate Lifecycle', () => {
    it('should start a new debate', () => {
      const debate = collaborationManager.startDebate(
        'API Architecture Decision',
        ['engineering', 'security', 'product']
      );

      expect(debate.id).toBeDefined();
      expect(debate.topic).toBe('API Architecture Decision');
      expect(debate.participants).toContain('engineering');
      expect(debate.participants).toContain('security');
      expect(debate.participants).toContain('product');
      expect(debate.statements).toHaveLength(0);
      expect(debate.consensus).toBe(false);
    });

    it('should allow proposals from participants', () => {
      const debate = collaborationManager.startDebate(
        'Framework Choice',
        ['engineering', 'qa']
      );

      const proposal = collaborationManager.propose(
        debate.id,
        'engineering',
        'We should use React for the frontend framework',
        ['Widely adopted', 'Good ecosystem', 'Team familiarity']
      );

      expect(proposal.type).toBe('propose');
      expect(proposal.brain).toBe('engineering');
      expect(proposal.content).toContain('React');
      expect(proposal.evidence).toHaveLength(3);
    });

    it('should reject proposals from non-participants', () => {
      const debate = collaborationManager.startDebate(
        'Design System',
        ['design', 'engineering']
      );

      expect(() => {
        collaborationManager.propose(
          debate.id,
          'finance', // Not a participant
          'We should use minimal design'
        );
      }).toThrow('not a participant');
    });

    it('should allow challenges to proposals', () => {
      const debate = collaborationManager.startDebate(
        'Database Choice',
        ['engineering', 'data']
      );

      const proposal = collaborationManager.propose(
        debate.id,
        'engineering',
        'Use PostgreSQL for main database'
      );

      const challenge = collaborationManager.challenge(
        debate.id,
        'data',
        proposal.id,
        'PostgreSQL may not scale well for our write-heavy workload',
        ['Benchmark data shows write bottlenecks at 10K TPS']
      );

      expect(challenge.type).toBe('challenge');
      expect(challenge.referencesStatementId).toBe(proposal.id);
    });

    it('should allow defense against challenges', () => {
      const debate = collaborationManager.startDebate(
        'Auth Strategy',
        ['engineering', 'security']
      );

      const proposal = collaborationManager.propose(
        debate.id,
        'engineering',
        'Use JWT for authentication'
      );

      const challenge = collaborationManager.challenge(
        debate.id,
        'security',
        proposal.id,
        'JWT has token revocation issues'
      );

      const defense = collaborationManager.defend(
        debate.id,
        'engineering',
        challenge.id,
        'We can implement a token blacklist for revocation',
        ['Redis-based blacklist adds minimal latency']
      );

      expect(defense.type).toBe('defend');
      expect(defense.referencesStatementId).toBe(challenge.id);
    });

    it('should allow conceding points', () => {
      const debate = collaborationManager.startDebate(
        'Testing Strategy',
        ['engineering', 'qa']
      );

      const proposal = collaborationManager.propose(
        debate.id,
        'qa',
        'We need 90% code coverage'
      );

      const concession = collaborationManager.concede(
        debate.id,
        'engineering',
        proposal.id,
        'Agreed, high coverage is important for this project'
      );

      expect(concession.type).toBe('concede');
      expect(concession.referencesStatementId).toBe(proposal.id);
    });
  });

  describe('Debate Resolution', () => {
    it('should resolve debate and create decision', () => {
      const debate = collaborationManager.startDebate(
        'Deployment Strategy',
        ['engineering', 'devops']
      );

      collaborationManager.propose(
        debate.id,
        'engineering',
        'Use Kubernetes for container orchestration',
        ['Industry standard', 'Good scaling']
      );

      const decision = collaborationManager.resolveDebate(debate.id);

      expect(decision.id).toBeDefined();
      expect(decision.description).toContain('Deployment Strategy');
      expect(decision.options.length).toBeGreaterThan(0);
      expect(decision.selectedOption).toBeDefined();
      expect(decision.rationale).toBeDefined();
    });

    it('should track consensus status', () => {
      const debate = collaborationManager.startDebate(
        'API Version',
        ['engineering', 'product']
      );

      const proposal = collaborationManager.propose(
        debate.id,
        'engineering',
        'Use versioned URLs for API'
      );

      collaborationManager.concede(
        debate.id,
        'product',
        proposal.id,
        'Good for backward compatibility'
      );

      const decision = collaborationManager.resolveDebate(debate.id);

      expect(decision.debate?.consensus).toBe(true);
    });

    it('should handle no consensus', () => {
      const debate = collaborationManager.startDebate(
        'Language Choice',
        ['engineering', 'data', 'mobile']
      );

      collaborationManager.propose(
        debate.id,
        'engineering',
        'Use TypeScript'
      );

      collaborationManager.challenge(
        debate.id,
        'data',
        debate.statements[0].id,
        'Python would be better for ML tasks'
      );

      // No concessions, no consensus

      const decision = collaborationManager.resolveDebate(debate.id);

      // With 3 participants and no concessions, consensus threshold (0.7) not met
      expect(decision.debate?.consensus).toBe(false);
    });

    it('should score proposals based on evidence', () => {
      const debate = collaborationManager.startDebate(
        'Cache Strategy',
        ['engineering', 'data']
      );

      // Proposal with evidence
      const strongProposal = collaborationManager.propose(
        debate.id,
        'engineering',
        'Use Redis for caching',
        ['Sub-millisecond latency', 'Persistence options', 'Cluster support', 'Pub/sub capability']
      );

      // Proposal without evidence
      collaborationManager.propose(
        debate.id,
        'data',
        'Use Memcached'
      );

      const decision = collaborationManager.resolveDebate(debate.id);

      // Redis proposal should win due to evidence
      expect(decision.selectedOption).toBe(strongProposal.id);
    });

    it('should generate meaningful rationale', () => {
      const debate = collaborationManager.startDebate(
        'Monitoring Solution',
        ['devops', 'engineering']
      );

      collaborationManager.propose(
        debate.id,
        'devops',
        'Use Datadog for monitoring',
        ['All-in-one platform', 'Good APM']
      );

      const decision = collaborationManager.resolveDebate(debate.id);

      expect(decision.rationale).toBeDefined();
      expect(decision.rationale.length).toBeGreaterThan(20);
    });
  });

  describe('PCR Cycle (Propose-Challenge-Resolve)', () => {
    it('should run complete PCR cycle', async () => {
      const decision = await collaborationManager.runPCRCycle(
        'Error Handling Strategy',
        'engineering',
        ['qa', 'security'],
        'ceo',
        'Implement centralized error handling with structured logging',
        ['Easier debugging', 'Consistent error formats', 'Better monitoring']
      );

      expect(decision.id).toBeDefined();
      expect(decision.description).toContain('Error Handling');
      expect(decision.participants).toContain('engineering');
      expect(decision.participants).toContain('qa');
      expect(decision.participants).toContain('security');
    });

    it('should use CEO as default resolver', async () => {
      const decision = await collaborationManager.runPCRCycle(
        'API Design',
        'product',
        ['engineering'],
        undefined, // Use default resolver
        'RESTful design with OpenAPI spec'
      );

      expect(decision.debate?.resolvedBy).toBe('ceo');
    });
  });

  describe('Validation Runs', () => {
    it('should run multi-brain validation', async () => {
      const result = await collaborationManager.runValidation(
        'Security Review',
        'Proposed authentication flow with OAuth2 and MFA',
        ['security', 'engineering', 'qa']
      );

      expect(result).toHaveProperty('approved');
      expect(result).toHaveProperty('approvals');
      expect(result).toHaveProperty('rejections');
      expect(result).toHaveProperty('concerns');
    });
  });

  describe('Collaboration Requests', () => {
    it('should handle collaboration request', async () => {
      const request: CollaborationRequest = {
        id: 'collab-req-1',
        topic: 'Architecture Decision',
        fromBrain: 'ceo',
        toBrains: ['engineering', 'security'],
        context: { urgency: 'high' },
        requestedAt: new Date(),
      };

      const result = await collaborationManager.handleCollaborationRequest(request);

      expect(result.requestId).toBe(request.id);
      expect(result.participants).toContain('ceo');
      expect(result.participants).toContain('engineering');
      expect(result.participants).toContain('security');
      expect(result.debate).toBeDefined();
      expect(result.decision).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should extract learnings from collaboration', async () => {
      const request: CollaborationRequest = {
        id: 'collab-learn-1',
        topic: 'Performance Optimization',
        fromBrain: 'engineering',
        toBrains: ['data'],
        context: {},
        requestedAt: new Date(),
      };

      const result = await collaborationManager.handleCollaborationRequest(request);

      expect(result.learnings.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('should track debate statistics', () => {
      // Create and resolve some debates
      const debate1 = collaborationManager.startDebate('Topic 1', ['engineering', 'design']);
      collaborationManager.propose(debate1.id, 'engineering', 'Proposal 1');
      collaborationManager.resolveDebate(debate1.id);

      const debate2 = collaborationManager.startDebate('Topic 2', ['product', 'qa']);
      collaborationManager.propose(debate2.id, 'product', 'Proposal 2');
      collaborationManager.resolveDebate(debate2.id);

      const stats = collaborationManager.getStats();

      expect(stats.totalDebates).toBe(2);
      expect(stats.activeDebates).toBe(0);
      expect(stats.avgParticipants).toBeGreaterThan(0);
    });

    it('should track active debates', () => {
      collaborationManager.startDebate('Active Topic', ['engineering', 'design']);

      const stats = collaborationManager.getStats();

      expect(stats.activeDebates).toBe(1);
    });

    it('should calculate consensus rate', () => {
      // Debate with consensus
      const debate1 = collaborationManager.startDebate('Consensus Topic', ['engineering', 'qa']);
      const proposal1 = collaborationManager.propose(debate1.id, 'engineering', 'Idea');
      collaborationManager.concede(debate1.id, 'qa', proposal1.id, 'Agreed');
      collaborationManager.resolveDebate(debate1.id);

      // Debate without consensus
      const debate2 = collaborationManager.startDebate('No Consensus', ['engineering', 'design', 'data']);
      collaborationManager.propose(debate2.id, 'engineering', 'Idea');
      collaborationManager.resolveDebate(debate2.id);

      const stats = collaborationManager.getStats();

      expect(stats.consensusRate).toBeGreaterThanOrEqual(0);
      expect(stats.consensusRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Most Active Collaborators', () => {
    it('should track most active collaborators', () => {
      const debate = collaborationManager.startDebate('Active Test', ['engineering', 'qa', 'design']);

      collaborationManager.propose(debate.id, 'engineering', 'Idea 1');
      collaborationManager.propose(debate.id, 'engineering', 'Idea 2');
      collaborationManager.propose(debate.id, 'qa', 'Question');

      collaborationManager.resolveDebate(debate.id);

      const active = collaborationManager.getMostActiveCollaborators();

      expect(active[0].brain).toBe('engineering');
      expect(active[0].count).toBe(2);
    });
  });

  describe('Summary', () => {
    it('should generate collaboration summary', () => {
      const debate = collaborationManager.startDebate('Summary Test', ['engineering', 'design']);
      collaborationManager.propose(debate.id, 'engineering', 'Proposal');
      collaborationManager.resolveDebate(debate.id);

      const summary = collaborationManager.getSummary();

      expect(summary).toContain('Collaboration System Status');
      expect(summary).toContain('Total Debates');
      expect(summary).toContain('Consensus Rate');
    });
  });

  describe('Error Handling', () => {
    it('should throw for non-existent debate', () => {
      expect(() => {
        collaborationManager.propose('fake-debate-id', 'engineering', 'Test');
      }).toThrow('not found');
    });

    it('should throw for non-existent statement reference', () => {
      const debate = collaborationManager.startDebate('Error Test', ['engineering', 'qa']);

      expect(() => {
        collaborationManager.challenge(debate.id, 'qa', 'fake-statement-id', 'Challenge');
      }).toThrow('not found');
    });
  });

  describe('Custom Configuration', () => {
    it('should respect custom consensus threshold', () => {
      const strictManager = new CollaborationManager({
        consensusThreshold: 0.9, // 90% agreement
      });

      const debate = strictManager.startDebate('Strict Consensus', ['a', 'b', 'c', 'd', 'e'] as BrainType[]);
      const proposal = strictManager.propose(debate.id, 'a' as BrainType, 'Idea');

      // Only 2 of 5 agree (40%) - below 90%
      strictManager.concede(debate.id, 'b' as BrainType, proposal.id, 'OK');

      const decision = strictManager.resolveDebate(debate.id);

      expect(decision.debate?.consensus).toBe(false);
    });

    it('should respect max rounds configuration', () => {
      const limitedManager = new CollaborationManager({
        maxRounds: 2,
      });

      // Manager should work with limited rounds
      const debate = limitedManager.startDebate('Limited Rounds', ['engineering']);
      expect(debate).toBeDefined();
    });
  });

  describe('Debate with Evidence', () => {
    it('should track evidence across statements', () => {
      const debate = collaborationManager.startDebate('Evidence Test', ['engineering', 'qa']);

      const proposal = collaborationManager.propose(
        debate.id,
        'engineering',
        'Implement microservices',
        ['Better scalability', 'Independent deployment', 'Technology flexibility']
      );

      const challenge = collaborationManager.challenge(
        debate.id,
        'qa',
        proposal.id,
        'Microservices add complexity',
        ['More failure points', 'Distributed tracing needed']
      );

      const decision = collaborationManager.resolveDebate(debate.id);

      // Check that evidence is tracked
      const proposalOption = decision.options.find(o => o.id === proposal.id);
      expect(proposalOption?.pros).toHaveLength(3);
      expect(proposalOption?.cons.length).toBeGreaterThan(0);
    });
  });

  describe('Learning Extraction', () => {
    it('should generate success learning for consensus', async () => {
      const request: CollaborationRequest = {
        id: 'learning-test',
        topic: 'Consensus Test',
        fromBrain: 'engineering',
        toBrains: ['qa'],
        context: {},
        requestedAt: new Date(),
      };

      const result = await collaborationManager.handleCollaborationRequest(request);

      // Learnings array contains Learning objects directly (not wrapped)
      const successLearning = result.learnings.find(l => l.type === 'success' || l.type === 'insight');
      expect(successLearning).toBeDefined();
    });
  });
});
