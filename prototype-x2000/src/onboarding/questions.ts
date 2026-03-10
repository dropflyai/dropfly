/**
 * Onboarding Questions
 * Question definitions and logic for the hybrid onboarding flow
 */

import { select, input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

// ============================================================================
// Types
// ============================================================================

export type ProblemType = 'hair-on-fire' | 'painkiller' | 'vitamin';
export type Timeline = 'fast' | 'medium' | 'extended';
export type FounderRole = 'technical' | 'non-technical' | 'team';
export type Budget = 'bootstrapped' | 'seed' | 'series-a-plus';

export interface QuickContext {
  projectName: string;
  problemType: ProblemType;
  timeline: Timeline;
  founderRole: FounderRole;
  budget: Budget;
  description: string;
}

export interface DeepContext {
  targetCustomer: string;
  competitors: string[];
  techPreferences: string[];
  constraints: string[];
  uniqueValue: string;
  revenueModel: string;
}

export interface ResearchContext {
  marketSize: string;
  competitorInsights: string[];
  trendInsights: string[];
  risks: string[];
}

// ============================================================================
// Quick Context Questions (Phase 1)
// ============================================================================

/**
 * Gather quick context in 30 seconds
 * These questions help us understand the basics before diving deep
 */
export async function gatherQuickContext(): Promise<QuickContext> {
  console.log(chalk.bold.cyan('\n  Phase 1: Quick Context\n'));
  console.log(chalk.dim('  Let\'s understand the basics (30 seconds)\n'));

  // Project name
  const projectName = await input({
    message: chalk.white('What do you want to call this project?'),
    default: 'my-project',
    validate: (value) => {
      if (value.length < 2) return 'Project name must be at least 2 characters';
      if (!/^[a-z0-9-]+$/i.test(value)) return 'Project name can only contain letters, numbers, and hyphens';
      return true;
    },
  });

  // Brief description
  const description = await input({
    message: chalk.white('In one sentence, what are you building?'),
    validate: (value) => {
      if (value.length < 10) return 'Please provide a bit more detail';
      return true;
    },
  });

  // Problem type
  const problemType = await select<ProblemType>({
    message: chalk.white('What type of problem does this solve?'),
    choices: [
      {
        name: `${chalk.green('Hair on Fire')} ${chalk.dim('- Urgent, painful problem users desperately need solved')}`,
        value: 'hair-on-fire' as ProblemType,
      },
      {
        name: `${chalk.yellow('Painkiller')} ${chalk.dim('- Real pain that users will pay to eliminate')}`,
        value: 'painkiller' as ProblemType,
      },
      {
        name: `${chalk.blue('Vitamin')} ${chalk.dim('- Nice-to-have improvement, harder to monetize')}`,
        value: 'vitamin' as ProblemType,
      },
    ],
  });

  // Timeline
  const timeline = await select<Timeline>({
    message: chalk.white('What\'s your target timeline for MVP?'),
    choices: [
      {
        name: `${chalk.green('< 4 weeks')} ${chalk.dim('- Move fast, validate quick')}`,
        value: 'fast' as Timeline,
      },
      {
        name: `${chalk.yellow('4-8 weeks')} ${chalk.dim('- Balanced approach (recommended)')}`,
        value: 'medium' as Timeline,
      },
      {
        name: `${chalk.blue('8+ weeks')} ${chalk.dim('- More thorough, more features')}`,
        value: 'extended' as Timeline,
      },
    ],
  });

  // Founder role
  const founderRole = await select<FounderRole>({
    message: chalk.white('What\'s your technical background?'),
    choices: [
      {
        name: `${chalk.green('Technical Founder')} ${chalk.dim('- You can code and review PRs')}`,
        value: 'technical' as FounderRole,
      },
      {
        name: `${chalk.yellow('Non-Technical')} ${chalk.dim('- You\'ll need more AI assistance')}`,
        value: 'non-technical' as FounderRole,
      },
      {
        name: `${chalk.blue('Team')} ${chalk.dim('- Multiple people, mixed skills')}`,
        value: 'team' as FounderRole,
      },
    ],
  });

  // Budget
  const budget = await select<Budget>({
    message: chalk.white('What\'s your current funding situation?'),
    choices: [
      {
        name: `${chalk.green('Bootstrapped')} ${chalk.dim('- Optimize for cost efficiency')}`,
        value: 'bootstrapped' as Budget,
      },
      {
        name: `${chalk.yellow('Seed Funded')} ${chalk.dim('- Some runway, balance speed/cost')}`,
        value: 'seed' as Budget,
      },
      {
        name: `${chalk.blue('Series A+')} ${chalk.dim('- Prioritize speed over cost')}`,
        value: 'series-a-plus' as Budget,
      },
    ],
  });

  return {
    projectName,
    description,
    problemType,
    timeline,
    founderRole,
    budget,
  };
}

// ============================================================================
// Deep Context Questions (Phase 3)
// ============================================================================

/**
 * Gather deep context based on research findings
 * These questions are tailored based on what the research discovered
 */
export async function gatherDeepContext(
  quickContext: QuickContext,
  researchContext: ResearchContext
): Promise<DeepContext> {
  console.log(chalk.bold.cyan('\n  Phase 3: Deep Questions\n'));
  console.log(chalk.dim('  Based on our research, we have some specific questions\n'));

  // Target customer
  const targetCustomer = await input({
    message: chalk.white('Who is your ideal first customer? (be specific)'),
    default: getDefaultCustomer(quickContext),
    validate: (value) => value.length >= 5 || 'Please be more specific',
  });

  // Competitors (based on research)
  const competitorList = researchContext.competitorInsights.slice(0, 3);
  let competitorResponse = '';
  if (competitorList.length > 0) {
    console.log(chalk.dim('\n  We found these potential competitors:'));
    competitorList.forEach((c, i) => {
      console.log(chalk.dim(`    ${i + 1}. ${c}`));
    });
    competitorResponse = await input({
      message: chalk.white('Who else are they comparing you to? (or press Enter to continue)'),
      default: '',
    });
  }

  const competitors = competitorList.concat(
    competitorResponse ? [competitorResponse] : []
  );

  // Tech preferences (tailored to founder role)
  const techChoices = getTechChoices(quickContext.founderRole);
  const techPreferences: string[] = [];

  console.log(chalk.dim('\n  Select your technical preferences:'));

  for (const choice of techChoices.slice(0, 3)) {
    const useThis = await confirm({
      message: chalk.white(`${choice.name}?`),
      default: choice.recommended,
    });
    if (useThis) {
      techPreferences.push(choice.value);
    }
  }

  // Constraints
  const constraintsInput = await input({
    message: chalk.white('Any specific constraints? (timeline, tech, legal, etc.)'),
    default: getDefaultConstraints(quickContext),
  });
  const constraints = constraintsInput.split(',').map((s) => s.trim()).filter(Boolean);

  // Unique value
  const uniqueValue = await input({
    message: chalk.white('What makes your approach unique?'),
    validate: (value) => value.length >= 10 || 'Please elaborate',
  });

  // Revenue model
  const revenueModel = await select({
    message: chalk.white('What\'s your primary revenue model?'),
    choices: [
      {
        name: `${chalk.green('SaaS Subscription')} ${chalk.dim('- Monthly/annual recurring')}`,
        value: 'saas-subscription',
      },
      {
        name: `${chalk.yellow('Usage-Based')} ${chalk.dim('- Pay for what you use')}`,
        value: 'usage-based',
      },
      {
        name: `${chalk.blue('Freemium')} ${chalk.dim('- Free tier + paid upgrades')}`,
        value: 'freemium',
      },
      {
        name: `${chalk.magenta('Marketplace')} ${chalk.dim('- Transaction fees')}`,
        value: 'marketplace',
      },
      {
        name: `${chalk.cyan('One-Time')} ${chalk.dim('- Single purchase')}`,
        value: 'one-time',
      },
      {
        name: `${chalk.dim('Not sure yet')}`,
        value: 'undecided',
      },
    ],
  });

  return {
    targetCustomer,
    competitors,
    techPreferences,
    constraints,
    uniqueValue,
    revenueModel,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDefaultCustomer(context: QuickContext): string {
  const templates: Record<ProblemType, string> = {
    'hair-on-fire': 'Startups struggling with [specific urgent problem]',
    'painkiller': 'SMBs who spend too much time on [pain point]',
    'vitamin': 'Teams who want to improve [workflow/metric]',
  };
  return templates[context.problemType];
}

function getTechChoices(founderRole: FounderRole): Array<{
  name: string;
  value: string;
  recommended: boolean;
}> {
  if (founderRole === 'non-technical') {
    return [
      { name: 'No-code friendly approach', value: 'no-code', recommended: true },
      { name: 'Simple deployment (Vercel/Netlify)', value: 'simple-deploy', recommended: true },
      { name: 'Managed database (Supabase)', value: 'managed-db', recommended: true },
    ];
  }

  if (founderRole === 'technical') {
    return [
      { name: 'TypeScript everywhere', value: 'typescript', recommended: true },
      { name: 'React/Next.js frontend', value: 'nextjs', recommended: true },
      { name: 'Serverless backend', value: 'serverless', recommended: false },
      { name: 'PostgreSQL database', value: 'postgres', recommended: true },
    ];
  }

  return [
    { name: 'Modern web stack', value: 'modern-web', recommended: true },
    { name: 'Cloud-native infrastructure', value: 'cloud-native', recommended: true },
    { name: 'CI/CD from day one', value: 'cicd', recommended: true },
  ];
}

function getDefaultConstraints(context: QuickContext): string {
  const constraints: string[] = [];

  if (context.budget === 'bootstrapped') {
    constraints.push('minimize infrastructure costs');
  }

  if (context.timeline === 'fast') {
    constraints.push('MVP in < 4 weeks');
  }

  if (context.founderRole === 'non-technical') {
    constraints.push('simple to maintain');
  }

  return constraints.join(', ');
}

// ============================================================================
// Question Display Helpers
// ============================================================================

export function displayQuickContextSummary(context: QuickContext): void {
  console.log(chalk.bold.cyan('\n  Quick Context Summary\n'));
  console.log(chalk.dim('  ───────────────────────────────────────────\n'));

  console.log(`  ${chalk.bold('Project:')} ${context.projectName}`);
  console.log(`  ${chalk.bold('Description:')} ${context.description}`);
  console.log(`  ${chalk.bold('Problem Type:')} ${formatProblemType(context.problemType)}`);
  console.log(`  ${chalk.bold('Timeline:')} ${formatTimeline(context.timeline)}`);
  console.log(`  ${chalk.bold('Role:')} ${formatFounderRole(context.founderRole)}`);
  console.log(`  ${chalk.bold('Budget:')} ${formatBudget(context.budget)}`);

  console.log(chalk.dim('\n  ───────────────────────────────────────────\n'));
}

function formatProblemType(type: ProblemType): string {
  const formats: Record<ProblemType, string> = {
    'hair-on-fire': chalk.green('Hair on Fire'),
    'painkiller': chalk.yellow('Painkiller'),
    'vitamin': chalk.blue('Vitamin'),
  };
  return formats[type];
}

function formatTimeline(timeline: Timeline): string {
  const formats: Record<Timeline, string> = {
    'fast': chalk.green('< 4 weeks'),
    'medium': chalk.yellow('4-8 weeks'),
    'extended': chalk.blue('8+ weeks'),
  };
  return formats[timeline];
}

function formatFounderRole(role: FounderRole): string {
  const formats: Record<FounderRole, string> = {
    'technical': chalk.green('Technical Founder'),
    'non-technical': chalk.yellow('Non-Technical'),
    'team': chalk.blue('Team'),
  };
  return formats[role];
}

function formatBudget(budget: Budget): string {
  const formats: Record<Budget, string> = {
    'bootstrapped': chalk.green('Bootstrapped'),
    'seed': chalk.yellow('Seed Funded'),
    'series-a-plus': chalk.blue('Series A+'),
  };
  return formats[budget];
}
