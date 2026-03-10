#!/usr/bin/env node
/**
 * Generate TypeScript implementations for all brains
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BRAINS_DIR = path.resolve(__dirname, '../src/brains');

// Brain definitions with keywords and descriptions
const BRAIN_DEFINITIONS: Record<string, { keywords: string[]; description: string }> = {
  'ai': {
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural', 'model', 'training', 'inference', 'llm', 'deep learning'],
    description: 'AI and machine learning strategy, model selection, and implementation',
  },
  'analytics': {
    keywords: ['analytics', 'metrics', 'data analysis', 'insights', 'reporting', 'dashboard', 'kpi', 'tracking', 'measurement'],
    description: 'Data analytics, metrics tracking, and business intelligence',
  },
  'architecture': {
    keywords: ['architecture', 'system design', 'infrastructure', 'scalability', 'microservices', 'monolith', 'design patterns'],
    description: 'System architecture, design patterns, and technical decisions',
  },
  'automation': {
    keywords: ['automation', 'workflow', 'automate', 'script', 'bot', 'scheduled', 'trigger', 'pipeline'],
    description: 'Workflow automation, process optimization, and scripting',
  },
  'backend': {
    keywords: ['backend', 'api', 'server', 'database', 'endpoint', 'rest', 'graphql', 'microservice'],
    description: 'Backend development, APIs, and server-side architecture',
  },
  'branding': {
    keywords: ['brand', 'branding', 'identity', 'logo', 'visual', 'guidelines', 'voice', 'tone'],
    description: 'Brand identity, visual guidelines, and brand voice',
  },
  'cloud': {
    keywords: ['cloud', 'aws', 'gcp', 'azure', 'serverless', 'lambda', 'kubernetes', 'docker', 'container'],
    description: 'Cloud infrastructure, deployment, and DevOps',
  },
  'community': {
    keywords: ['community', 'forum', 'discord', 'slack', 'engagement', 'members', 'moderation'],
    description: 'Community building, engagement, and moderation',
  },
  'content': {
    keywords: ['content', 'writing', 'copywriting', 'blog', 'article', 'documentation', 'copy'],
    description: 'Content creation, copywriting, and editorial strategy',
  },
  'customer-success': {
    keywords: ['customer success', 'onboarding', 'retention', 'churn', 'nps', 'satisfaction', 'support'],
    description: 'Customer success, onboarding, and retention strategies',
  },
  'data': {
    keywords: ['data', 'database', 'sql', 'nosql', 'etl', 'pipeline', 'warehouse', 'lake'],
    description: 'Data engineering, databases, and data pipelines',
  },
  'database': {
    keywords: ['database', 'sql', 'postgres', 'mysql', 'mongodb', 'redis', 'schema', 'migration', 'query'],
    description: 'Database design, optimization, and management',
  },
  'debugger': {
    keywords: ['debug', 'bug', 'error', 'fix', 'issue', 'troubleshoot', 'diagnose', 'stack trace'],
    description: 'Debugging, error diagnosis, and issue resolution',
  },
  'devops': {
    keywords: ['devops', 'ci', 'cd', 'pipeline', 'deployment', 'infrastructure', 'monitoring', 'observability'],
    description: 'DevOps practices, CI/CD, and infrastructure automation',
  },
  'devrel': {
    keywords: ['devrel', 'developer relations', 'developer experience', 'dx', 'sdk', 'documentation', 'advocacy'],
    description: 'Developer relations, documentation, and developer experience',
  },
  'email': {
    keywords: ['email', 'newsletter', 'drip', 'campaign', 'mailchimp', 'sendgrid', 'deliverability'],
    description: 'Email marketing, campaigns, and deliverability',
  },
  'finance': {
    keywords: ['finance', 'budget', 'revenue', 'accounting', 'financial', 'forecast', 'p&l', 'cash flow'],
    description: 'Financial planning, budgeting, and accounting',
  },
  'frontend': {
    keywords: ['frontend', 'ui', 'react', 'vue', 'angular', 'css', 'html', 'javascript', 'typescript', 'component'],
    description: 'Frontend development, UI components, and user interfaces',
  },
  'game-design': {
    keywords: ['game', 'gaming', 'game design', 'mechanics', 'level', 'player', 'gamification'],
    description: 'Game design, mechanics, and gamification strategies',
  },
  'growth': {
    keywords: ['growth', 'acquisition', 'viral', 'referral', 'plg', 'product-led', 'funnel', 'conversion'],
    description: 'Growth strategies, user acquisition, and viral loops',
  },
  'hr': {
    keywords: ['hr', 'hiring', 'recruiting', 'culture', 'team', 'employee', 'onboarding', 'performance review'],
    description: 'Human resources, hiring, and team culture',
  },
  'innovation': {
    keywords: ['innovation', 'r&d', 'research', 'experiment', 'prototype', 'new', 'venture', 'incubate'],
    description: 'Innovation, R&D, and new venture exploration',
  },
  'investor': {
    keywords: ['investor', 'fundraising', 'pitch', 'deck', 'vc', 'angel', 'term sheet', 'valuation'],
    description: 'Investor relations, fundraising, and pitch preparation',
  },
  'legal': {
    keywords: ['legal', 'contract', 'compliance', 'privacy', 'gdpr', 'terms', 'ip', 'trademark', 'patent'],
    description: 'Legal matters, contracts, and compliance',
  },
  'localization': {
    keywords: ['localization', 'i18n', 'l10n', 'translation', 'international', 'locale', 'language'],
    description: 'Localization, internationalization, and translation',
  },
  'marketing': {
    keywords: ['marketing', 'campaign', 'ads', 'advertising', 'brand', 'awareness', 'launch'],
    description: 'Marketing strategy, campaigns, and brand awareness',
  },
  'mba': {
    keywords: ['business', 'strategy', 'mba', 'competitive', 'market', 'swot', 'business model'],
    description: 'Business strategy, competitive analysis, and market positioning',
  },
  'mobile': {
    keywords: ['mobile', 'ios', 'android', 'app', 'react native', 'flutter', 'swift', 'kotlin'],
    description: 'Mobile app development for iOS and Android',
  },
  'operations': {
    keywords: ['operations', 'ops', 'process', 'efficiency', 'supply chain', 'logistics', 'workflow'],
    description: 'Business operations, process optimization, and efficiency',
  },
  'options-trading': {
    keywords: ['options', 'trading', 'stocks', 'derivatives', 'hedge', 'portfolio', 'market', 'investment'],
    description: 'Options trading, market analysis, and investment strategies',
  },
  'partnership': {
    keywords: ['partnership', 'partner', 'alliance', 'integration', 'ecosystem', 'collaboration', 'bd'],
    description: 'Business partnerships, alliances, and ecosystem development',
  },
  'performance': {
    keywords: ['performance', 'optimization', 'speed', 'latency', 'benchmark', 'profiling', 'cache'],
    description: 'Performance optimization, profiling, and speed improvements',
  },
  'pricing': {
    keywords: ['pricing', 'price', 'monetization', 'subscription', 'tier', 'plan', 'revenue model'],
    description: 'Pricing strategy, monetization, and revenue optimization',
  },
  'sales': {
    keywords: ['sales', 'deal', 'pipeline', 'close', 'prospect', 'lead', 'crm', 'quota'],
    description: 'Sales strategy, pipeline management, and closing deals',
  },
  'security': {
    keywords: ['security', 'auth', 'authentication', 'authorization', 'vulnerability', 'penetration', 'audit'],
    description: 'Security practices, authentication, and vulnerability management',
  },
  'social-media': {
    keywords: ['social media', 'twitter', 'linkedin', 'instagram', 'tiktok', 'post', 'engagement', 'followers'],
    description: 'Social media strategy, content, and engagement',
  },
  'support': {
    keywords: ['support', 'help', 'ticket', 'customer service', 'helpdesk', 'zendesk', 'intercom'],
    description: 'Customer support, helpdesk, and issue resolution',
  },
  'video': {
    keywords: ['video', 'youtube', 'production', 'editing', 'streaming', 'content', 'tutorial'],
    description: 'Video production, editing, and content strategy',
  },
};

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function generateBrainFile(brainName: string): string {
  const def = BRAIN_DEFINITIONS[brainName];
  if (!def) {
    console.warn(`No definition for brain: ${brainName}`);
    return '';
  }

  const className = toPascalCase(brainName) + 'Brain';
  const varName = toCamelCase(brainName) + 'Brain';
  const keywords = def.keywords.map(k => `'${k}'`).join(', ');

  return `/**
 * ${toPascalCase(brainName)} Brain
 * ${def.description}
 *
 * This brain is a Department Head powered by Claude. It can:
 * - Execute tasks directly for simple work
 * - Spawn sub-agents (specialists) for complex tasks
 * - Challenge and collaborate with other brains
 */

import { BaseBrain, registerBrain } from '../base.js';
import { DepartmentHeadAgent } from '../../agents/sdk-agent.js';
import type { Task, TaskResult, BrainConfig, CollaborationRequest, DebateStatement } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ${className} extends BaseBrain {
  private knowledge: string = '';
  private agent: DepartmentHeadAgent;

  // Keywords for task matching
  private keywords = [${keywords}];

  constructor(config?: Partial<BrainConfig>) {
    super({
      type: '${brainName}',
      name: '${toPascalCase(brainName)} Brain',
      description: '${def.description}',
      capabilities: [],
      trustLevel: 1,
      teamSize: 1,
      ...config,
    });
    this.loadKnowledge();

    // Initialize the Department Head agent
    this.agent = new DepartmentHeadAgent({
      id: '${brainName}-department-head',
      name: '${toPascalCase(brainName)} Department Head',
      role: '${def.description}',
      systemPrompt: this.buildSystemPrompt(),
      brainType: '${brainName}' as any,
      departmentName: '${toPascalCase(brainName)}',
      knowledgeBase: this.knowledge,
    });
  }

  private loadKnowledge(): void {
    try {
      const claudePath = path.join(__dirname, 'CLAUDE.md');
      if (fs.existsSync(claudePath)) {
        this.knowledge = fs.readFileSync(claudePath, 'utf-8');
      }
    } catch {
      // Knowledge file not available
    }
  }

  private buildSystemPrompt(): string {
    return \`# ${toPascalCase(brainName)} Department Head

You are the head of the ${toPascalCase(brainName)} Department with PhD-level expertise.

## Your Domain
${def.description}

## Your Capabilities
1. **Direct Execution**: Handle tasks within your expertise
2. **Department Management**: Spawn specialist sub-agents when needed
3. **Collaboration**: Work with other departments to improve outcomes
4. **Quality Assurance**: Ensure all work meets the highest standards

## Your Knowledge Base
\${this.knowledge}

## Operating Principles
- Be direct and decisive
- Challenge assumptions (yours and others')
- Prioritize outcomes over process
- Spawn sub-agents for complex multi-specialty tasks
- Synthesize team work into cohesive deliverables

## When to Spawn Sub-Agents
Spawn specialists when the task requires:
- Multiple distinct skill sets
- Parallel workstreams
- Deep expertise in sub-domains
- Quality review from different perspectives\`;
  }

  canHandle(task: Task): boolean {
    const text = \`\${task.subject} \${task.description}\`.toLowerCase();
    return this.keywords.some(kw => text.includes(kw));
  }

  async execute(task: Task): Promise<TaskResult> {
    const startTime = Date.now();
    console.log(\`[${toPascalCase(brainName)} Brain] Executing: \${task.subject}\`);

    try {
      // Delegate to the Department Head agent
      const result = await this.agent.execute(task);

      return {
        taskId: task.id,
        brainType: '${brainName}' as any,
        success: result.success,
        output: result.output,
        learnings: result.learnings || [],
        duration: Date.now() - startTime,
      };
    } catch (error) {
      console.error(\`[${toPascalCase(brainName)} Brain] Error:\`, error);
      return {
        taskId: task.id,
        brainType: '${brainName}' as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        learnings: [],
        duration: Date.now() - startTime,
      };
    }
  }

  async respondToCollaboration(request: CollaborationRequest): Promise<DebateStatement> {
    // Use the agent to generate a thoughtful response
    const response = await this.agent.chat(
      \`Another department is requesting collaboration on: \${request.topic}\\n\\n\` +
      \`Context: \${JSON.stringify(request.context || {})}\\n\\n\` +
      \`As the ${toPascalCase(brainName)} Department Head, provide your perspective and recommendations.\`
    );

    return {
      id: uuidv4(),
      type: 'propose',
      brain: this.config.type,
      content: response.content,
      timestamp: new Date(),
    };
  }

  /**
   * Challenge another brain's proposal (agent-based collaboration)
   */
  async challengeProposal(proposal: string, proposer: string): Promise<string> {
    return this.agent.challenge(proposal, proposer);
  }

  /**
   * Collaborate with another brain on a shared problem
   */
  async collaborateWith(otherBrain: ${className}, problem: string): Promise<string> {
    return this.agent.collaborateWith(otherBrain.agent, problem);
  }

  async getRecommendations(context: Record<string, unknown>): Promise<string[]> {
    const response = await this.agent.chat(
      \`Given this context: \${JSON.stringify(context)}\\n\\n\` +
      \`Provide 3-5 actionable recommendations from the ${toPascalCase(brainName)} perspective.\`
    );

    // Parse recommendations from response
    const lines = response.content.split('\\n').filter(l => l.trim().startsWith('-') || l.trim().match(/^\\d/));
    return lines.length > 0 ? lines.map(l => l.replace(/^[-\\d.\\s]+/, '').trim()) : [response.content];
  }

  /**
   * Get the brain's knowledge base content
   */
  getKnowledge(): string {
    return this.knowledge;
  }

  /**
   * Get the underlying Department Head agent
   */
  getAgent(): DepartmentHeadAgent {
    return this.agent;
  }

  /**
   * Get all currently active sub-agents
   */
  getSubAgents() {
    return this.agent.getSubAgents();
  }

  /**
   * Clear agent conversation history
   */
  clearHistory(): void {
    this.agent.clearHistory();
  }
}

// Register brain with factory
registerBrain('${brainName}' as any, ${className} as unknown as typeof BaseBrain);

export const ${varName} = new ${className}();
`;
}

// Main execution
const existingBrains = ['ceo', 'design', 'engineering', 'product', 'qa', 'research'];

// Check for --force flag to regenerate existing brains
const forceRegenerate = process.argv.includes('--force');

if (forceRegenerate) {
  console.log('🔄 Force regenerate mode: will overwrite generated brains\\n');
}

for (const brainName of Object.keys(BRAIN_DEFINITIONS)) {
  // Never touch core brains - they have custom implementations
  if (existingBrains.includes(brainName)) {
    console.log(`⏭️  Skipping ${brainName} (core brain with custom implementation)`);
    continue;
  }

  const brainDir = path.join(BRAINS_DIR, brainName);
  const indexPath = path.join(brainDir, 'index.ts');

  // Create directory if it doesn't exist
  if (!fs.existsSync(brainDir)) {
    fs.mkdirSync(brainDir, { recursive: true });
  }

  // Skip if index.ts already exists (unless force flag is set)
  if (fs.existsSync(indexPath) && !forceRegenerate) {
    console.log(`⏭️  Skipping ${brainName} (index.ts exists, use --force to overwrite)`);
    continue;
  }

  const content = generateBrainFile(brainName);
  if (content) {
    fs.writeFileSync(indexPath, content);
    console.log(`✅ Generated ${brainName}/index.ts (AI-powered department head)`);
  }
}

console.log('\\n✨ Done generating brain implementations!');
console.log('All brains are now AI-powered department heads that can spawn sub-agents.');
