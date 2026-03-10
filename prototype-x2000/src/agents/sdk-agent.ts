/**
 * SDK Agent - Base class for all AI agents in X2000
 * Each agent is powered by Claude and can spawn sub-agents
 */

import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import type { BrainType, Task, TaskResult, Learning } from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  parentId?: string;
  brainType?: BrainType;
  model?: string;
  maxTokens?: number;
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentResponse {
  content: string;
  thinking?: string;
  toolCalls?: ToolCall[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: string;
}

export interface SubAgentSpec {
  role: string;
  specialty: string;
  task: string;
}

// ============================================================================
// SDK Agent Implementation
// ============================================================================

export class SDKAgent {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly brainType?: BrainType;

  protected client: Anthropic;
  protected systemPrompt: string;
  protected conversationHistory: AgentMessage[] = [];
  protected subAgents: Map<string, SDKAgent> = new Map();
  protected parentId?: string;
  protected model: string;
  protected maxTokens: number;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.systemPrompt = config.systemPrompt;
    this.parentId = config.parentId;
    this.brainType = config.brainType;
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.maxTokens = config.maxTokens || 4096;

    // Initialize Anthropic client
    this.client = new Anthropic();
  }

  // ============================================================================
  // Core Agent Methods
  // ============================================================================

  /**
   * Send a message to the agent and get a response
   */
  async chat(message: string): Promise<AgentResponse> {
    // Add user message to history
    this.conversationHistory.push({ role: 'user', content: message });

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: this.systemPrompt,
        messages: this.conversationHistory.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Extract text response
      const textContent = response.content.find(c => c.type === 'text');
      const content = textContent?.type === 'text' ? textContent.text : '';

      // Add assistant response to history
      this.conversationHistory.push({ role: 'assistant', content });

      return {
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error(`[${this.name}] Error in chat:`, error);
      throw error;
    }
  }

  /**
   * Execute a task - main entry point for work
   */
  async execute(task: Task): Promise<TaskResult> {
    const startTime = Date.now();
    console.log(`[${this.name}] Executing: ${task.subject}`);

    try {
      // Determine if we need sub-agents for this task
      const complexity = this.assessComplexity(task);

      let result: string;
      const learnings: Learning[] = [];

      if (complexity === 'simple') {
        // Handle directly
        result = await this.handleDirectly(task);
      } else {
        // Spawn department and delegate
        result = await this.handleWithDepartment(task);
      }

      return {
        taskId: task.id,
        brainType: this.brainType,
        success: true,
        output: { result },
        learnings,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`[${this.name}] Error executing task:`, error);
      return {
        taskId: task.id,
        brainType: this.brainType,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        learnings: [],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Handle a simple task directly without sub-agents
   */
  protected async handleDirectly(task: Task): Promise<string> {
    const prompt = this.buildTaskPrompt(task);
    const response = await this.chat(prompt);
    return response.content;
  }

  /**
   * Handle a complex task by spawning department sub-agents
   */
  protected async handleWithDepartment(task: Task): Promise<string> {
    console.log(`[${this.name}] Spawning department for complex task...`);

    // Determine what specialists we need
    const specialists = await this.determineSpecialists(task);

    // Spawn sub-agents
    const subAgentResults: Array<{ role: string; result: string }> = [];

    for (const spec of specialists) {
      const subAgent = await this.spawnSubAgent(spec);
      console.log(`[${this.name}] Delegating to ${spec.role}...`);

      const subResult = await subAgent.chat(spec.task);
      subAgentResults.push({ role: spec.role, result: subResult.content });
    }

    // Synthesize results from all sub-agents
    const synthesis = await this.synthesizeResults(task, subAgentResults);

    return synthesis;
  }

  // ============================================================================
  // Sub-Agent Management
  // ============================================================================

  /**
   * Spawn a sub-agent for a specific specialty
   */
  async spawnSubAgent(spec: SubAgentSpec): Promise<SDKAgent> {
    const subAgentId = `${this.id}-${spec.role.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().slice(0, 8)}`;

    const subAgent = new SDKAgent({
      id: subAgentId,
      name: `${spec.role}`,
      role: spec.role,
      parentId: this.id,
      brainType: this.brainType,
      systemPrompt: this.buildSubAgentPrompt(spec),
      model: this.model,
      maxTokens: this.maxTokens,
    });

    this.subAgents.set(subAgentId, subAgent);
    console.log(`[${this.name}] Spawned sub-agent: ${spec.role}`);

    return subAgent;
  }

  /**
   * Get all active sub-agents
   */
  getSubAgents(): SDKAgent[] {
    return Array.from(this.subAgents.values());
  }

  /**
   * Dismiss a sub-agent
   */
  dismissSubAgent(agentId: string): void {
    this.subAgents.delete(agentId);
  }

  /**
   * Dismiss all sub-agents
   */
  dismissAllSubAgents(): void {
    this.subAgents.clear();
  }

  // ============================================================================
  // Collaboration Methods
  // ============================================================================

  /**
   * Challenge another agent's proposal
   */
  async challenge(proposal: string, proposer: string): Promise<string> {
    const prompt = `Another department (${proposer}) has proposed the following:

${proposal}

As the ${this.role}, critically evaluate this proposal:
1. What are the potential issues or risks?
2. What assumptions might be flawed?
3. What alternatives should be considered?
4. What would you do differently?

Be direct and constructive. Your goal is to make the final outcome better, not to be agreeable.`;

    const response = await this.chat(prompt);
    return response.content;
  }

  /**
   * Respond to a challenge from another agent
   */
  async respondToChallenge(challenge: string, challenger: string): Promise<string> {
    const prompt = `${challenger} has challenged your approach:

${challenge}

Respond to this challenge:
1. Which points are valid and should be incorporated?
2. Which points do you disagree with and why?
3. How would you modify your approach based on this feedback?

Be open to good ideas but defend your reasoning where appropriate.`;

    const response = await this.chat(prompt);
    return response.content;
  }

  /**
   * Collaborate with another agent on a shared problem
   */
  async collaborateWith(otherAgent: SDKAgent, problem: string): Promise<string> {
    // Initial proposal from this agent
    const myProposal = await this.chat(`As the ${this.role}, propose an approach to: ${problem}`);

    // Get challenge from other agent
    const theirChallenge = await otherAgent.challenge(myProposal.content, this.name);

    // Respond to challenge
    const myResponse = await this.respondToChallenge(theirChallenge, otherAgent.name);

    // Final synthesis
    const synthesis = await this.chat(`Based on this discussion:
- Your initial proposal: ${myProposal.content}
- ${otherAgent.name}'s challenge: ${theirChallenge}
- Your response: ${myResponse}

Synthesize the final approach incorporating the best ideas from both perspectives.`);

    return synthesis.content;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Assess task complexity to determine if sub-agents are needed
   */
  protected assessComplexity(task: Task): 'simple' | 'moderate' | 'complex' {
    const description = `${task.subject} ${task.description}`.toLowerCase();
    const wordCount = description.split(/\s+/).length;

    // Complex indicators
    const complexIndicators = [
      'comprehensive', 'full', 'complete', 'entire', 'all aspects',
      'strategy', 'plan', 'analysis', 'research', 'design',
      'build', 'create', 'develop', 'implement', 'launch',
    ];

    const hasComplexIndicator = complexIndicators.some(ind => description.includes(ind));

    if (hasComplexIndicator || wordCount > 50) {
      return 'complex';
    } else if (wordCount > 20) {
      return 'moderate';
    }
    return 'simple';
  }

  /**
   * Determine what specialists are needed for a task
   */
  protected async determineSpecialists(task: Task): Promise<SubAgentSpec[]> {
    const prompt = `As the ${this.role}, you need to delegate parts of this task to specialists in your department.

Task: ${task.subject}
Description: ${task.description}

What 2-4 specialist roles would you assign to handle different aspects of this task?
For each specialist, specify:
1. Their role/title
2. Their specialty area
3. The specific sub-task they should handle

Respond in this exact format:
SPECIALIST: [role]
SPECIALTY: [area]
TASK: [specific sub-task]
---`;

    const response = await this.chat(prompt);
    return this.parseSpecialists(response.content);
  }

  /**
   * Parse specialist specifications from agent response
   */
  protected parseSpecialists(response: string): SubAgentSpec[] {
    const specialists: SubAgentSpec[] = [];
    const blocks = response.split('---').filter(b => b.trim());

    for (const block of blocks) {
      const roleMatch = block.match(/SPECIALIST:\s*(.+)/i);
      const specialtyMatch = block.match(/SPECIALTY:\s*(.+)/i);
      const taskMatch = block.match(/TASK:\s*(.+)/i);

      if (roleMatch && specialtyMatch && taskMatch) {
        specialists.push({
          role: roleMatch[1].trim(),
          specialty: specialtyMatch[1].trim(),
          task: taskMatch[1].trim(),
        });
      }
    }

    // Fallback if parsing fails
    if (specialists.length === 0) {
      specialists.push({
        role: 'General Specialist',
        specialty: 'General',
        task: `Handle: ${response.slice(0, 200)}`,
      });
    }

    return specialists.slice(0, 4); // Max 4 specialists
  }

  /**
   * Synthesize results from multiple sub-agents
   */
  protected async synthesizeResults(
    task: Task,
    results: Array<{ role: string; result: string }>
  ): Promise<string> {
    const resultsSummary = results
      .map(r => `## ${r.role}\n${r.result}`)
      .join('\n\n');

    const prompt = `As the ${this.role} (department head), synthesize the work from your team:

Original Task: ${task.subject}

Team Results:
${resultsSummary}

Create a cohesive final deliverable that:
1. Integrates all contributions
2. Resolves any conflicts or inconsistencies
3. Adds your executive perspective
4. Ensures quality and completeness`;

    const response = await this.chat(prompt);
    return response.content;
  }

  /**
   * Build a prompt for executing a task
   */
  protected buildTaskPrompt(task: Task): string {
    return `Execute the following task:

Subject: ${task.subject}
Description: ${task.description}
Priority: ${task.priority}

Provide a thorough, actionable response as the ${this.role}.`;
  }

  /**
   * Build system prompt for a sub-agent
   */
  protected buildSubAgentPrompt(spec: SubAgentSpec): string {
    return `You are a ${spec.role} specialist, working as part of the ${this.name} department.

Your specialty: ${spec.specialty}

You report to ${this.name}. Your job is to provide expert analysis and execution in your specialty area.

Be thorough, precise, and actionable. Your work will be synthesized with other specialists' work by your department head.`;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): AgentMessage[] {
    return [...this.conversationHistory];
  }
}

// ============================================================================
// Department Head Agent - Extended agent for brain department heads
// ============================================================================

export class DepartmentHeadAgent extends SDKAgent {
  private knowledgeBase: string = '';
  private departmentName: string;

  constructor(config: AgentConfig & { knowledgeBase?: string; departmentName?: string }) {
    super(config);
    this.knowledgeBase = config.knowledgeBase || '';
    this.departmentName = config.departmentName || config.name;

    // Auto-initialize knowledge-enhanced system prompt if knowledge provided
    if (this.knowledgeBase) {
      this.systemPrompt = this.buildDepartmentHeadPrompt();
    }
  }

  /**
   * Load knowledge base from CLAUDE.md content
   */
  loadKnowledge(content: string): void {
    this.knowledgeBase = content;
    // Update system prompt to include knowledge
    this.systemPrompt = this.buildDepartmentHeadPrompt();
  }

  /**
   * Build comprehensive system prompt for department head
   */
  private buildDepartmentHeadPrompt(): string {
    return `# You are the ${this.departmentName} Department Head

## Your Role
You are a senior executive and domain expert leading the ${this.departmentName} department. You have PhD-level expertise in your field and decades of practical experience.

## Your Capabilities
1. **Direct Execution**: Handle tasks within your expertise
2. **Department Management**: Spawn specialist sub-agents when needed
3. **Collaboration**: Work with other department heads to challenge and improve ideas
4. **Quality Assurance**: Ensure all work meets the highest standards

## Your Knowledge Base
${this.knowledgeBase}

## Operating Principles
- Be direct and decisive
- Challenge assumptions (yours and others')
- Prioritize outcomes over process
- Collaborate genuinely - best ideas win regardless of source
- Spawn sub-agents for complex tasks requiring multiple specialties
- Synthesize team work into cohesive deliverables

## Response Style
- Be thorough but concise
- Provide actionable recommendations
- Support claims with reasoning
- Acknowledge uncertainty when present`;
  }

  /**
   * Override to use knowledge-enhanced prompts
   */
  protected buildTaskPrompt(task: Task): string {
    return `## Task Assignment

**Subject**: ${task.subject}
**Description**: ${task.description}
**Priority**: ${task.priority}

As the ${this.departmentName} Department Head, execute this task using your expertise and knowledge base.

If this task is complex and would benefit from multiple specialists, indicate that you'll be spawning your department team.

Provide your response:`;
  }

  /**
   * Override sub-agent prompt to include department context
   */
  protected buildSubAgentPrompt(spec: SubAgentSpec): string {
    return `# You are a ${spec.role} in the ${this.departmentName} Department

## Your Specialty
${spec.specialty}

## Your Department Head
You report to the ${this.departmentName} Department Head. Your work will be synthesized with other specialists.

## Relevant Knowledge
${this.knowledgeBase.slice(0, 4000)} // Truncate for sub-agents

## Your Assignment
${spec.task}

## Response Guidelines
- Be thorough and expert in your specialty
- Provide actionable, specific recommendations
- Flag any concerns or risks you identify
- Your work will be reviewed and integrated by your department head`;
  }
}

// ============================================================================
// Exports
// ============================================================================

export { SDKAgent as Agent };
