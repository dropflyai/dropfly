/**
 * X2000 CLI - Memory Command
 * Query the forever-learning memory system
 */

import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { memoryManager } from '../../memory/manager.js';

export const memoryCommand = new Command('memory')
  .description('Query the forever-learning memory system')
  .argument('<action>', 'Action: search, patterns, learnings, skills, decisions, stats')
  .argument('[query]', 'Search query (required for search action)')
  .option('-l, --limit <number>', 'Limit number of results', '10')
  .option('-t, --type <type>', 'Filter by type: success, failure, insight')
  .option('-b, --brain <brain>', 'Filter by brain type')
  .option('--json', 'Output as JSON')
  .action(async (
    action: string,
    query: string | undefined,
    options: { limit?: string; type?: string; brain?: string; json?: boolean }
  ) => {
    const limit = parseInt(options.limit ?? '10', 10);

    // Initialize memory
    const spinner = ora('Connecting to memory system...').start();
    try {
      await memoryManager.initialize();
      spinner.succeed('Memory system connected');
    } catch {
      spinner.warn('Running in offline mode');
    }

    console.log('');

    switch (action) {
      case 'search':
        await handleSearch(query, limit, options.json);
        break;
      case 'patterns':
        await handlePatterns(limit, options);
        break;
      case 'learnings':
        await handleLearnings(limit, options);
        break;
      case 'skills':
        await handleSkills(limit, options);
        break;
      case 'decisions':
        await handleDecisions(limit, options);
        break;
      case 'stats':
        await handleStats(options.json);
        break;
      default:
        console.log(chalk.red(`  Unknown action: ${action}`));
        console.log(chalk.dim('\n  Available actions:'));
        console.log(chalk.dim('    search <query>  - Search across all memory'));
        console.log(chalk.dim('    patterns        - List stored patterns'));
        console.log(chalk.dim('    learnings       - List captured learnings'));
        console.log(chalk.dim('    skills          - List skills in pool'));
        console.log(chalk.dim('    decisions       - List logged decisions'));
        console.log(chalk.dim('    stats           - Show memory statistics\n'));
    }
  });

async function handleSearch(
  query: string | undefined,
  limit: number,
  json?: boolean
): Promise<void> {
  if (!query) {
    console.log(chalk.red('  Error: Search query required'));
    console.log(chalk.dim('  Usage: x2000 memory search "authentication patterns"\n'));
    return;
  }

  console.log(chalk.cyan(`  Searching for: "${query}"\n`));

  const results = memoryManager.search(query, { limit });

  if (json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  let totalResults = 0;

  // Patterns
  if (results.patterns.length > 0) {
    console.log(chalk.white('  Patterns:'));
    results.patterns.forEach((pattern) => {
      const score = results.relevanceScores.get(pattern.id) ?? 0;
      console.log(chalk.dim(`    [${(score * 100).toFixed(0)}%] ${pattern.name}`));
      console.log(chalk.dim(`         ${pattern.description.substring(0, 60)}...`));
    });
    totalResults += results.patterns.length;
    console.log('');
  }

  // Learnings
  if (results.learnings.length > 0) {
    console.log(chalk.white('  Learnings:'));
    results.learnings.forEach((learning) => {
      const icon = learning.type === 'success' ? chalk.green('+') :
                   learning.type === 'failure' ? chalk.red('-') : chalk.yellow('*');
      console.log(chalk.dim(`    ${icon} ${learning.description.substring(0, 60)}...`));
      console.log(chalk.dim(`      Recommendation: ${learning.recommendation.substring(0, 50)}...`));
    });
    totalResults += results.learnings.length;
    console.log('');
  }

  // Skills
  if (results.skills.length > 0) {
    console.log(chalk.white('  Skills:'));
    results.skills.forEach((skill) => {
      console.log(chalk.dim(`    - ${skill.name} (${skill.category})`));
      console.log(chalk.dim(`      Adopted by: ${skill.adoptedBy.join(', ')}`));
    });
    totalResults += results.skills.length;
    console.log('');
  }

  // Decisions
  if (results.decisions.length > 0) {
    console.log(chalk.white('  Decisions:'));
    results.decisions.forEach((decision) => {
      const outcome = decision.outcome === 'positive' ? chalk.green(decision.outcome) :
                      decision.outcome === 'negative' ? chalk.red(decision.outcome) :
                      chalk.dim(decision.outcome ?? 'unknown');
      console.log(chalk.dim(`    - ${decision.description.substring(0, 50)}...`));
      console.log(chalk.dim(`      Outcome: ${outcome}`));
    });
    totalResults += results.decisions.length;
    console.log('');
  }

  if (totalResults === 0) {
    console.log(chalk.dim('  No results found for your query.\n'));
  } else {
    console.log(chalk.dim(`  Total results: ${totalResults}\n`));
  }
}

async function handlePatterns(
  limit: number,
  options: { brain?: string; json?: boolean }
): Promise<void> {
  console.log(chalk.cyan('  Stored Patterns\n'));

  const patterns = memoryManager.queryPatterns({
    brainType: options.brain as any,
    limit,
  });

  if (options.json) {
    console.log(JSON.stringify(patterns, null, 2));
    return;
  }

  if (patterns.length === 0) {
    console.log(chalk.dim('  No patterns stored yet.'));
    console.log(chalk.dim('  Patterns are extracted from successful task completions.\n'));
    return;
  }

  patterns.forEach((pattern, index) => {
    console.log(chalk.white(`  ${index + 1}. ${pattern.name}`));
    console.log(chalk.dim(`     Trigger: ${pattern.trigger}`));
    console.log(chalk.dim(`     Success Rate: ${(pattern.successRate * 100).toFixed(0)}%`));
    console.log(chalk.dim(`     Usage Count: ${pattern.usageCount}`));
    console.log(chalk.dim(`     Created By: ${pattern.createdBy}`));
    console.log(chalk.dim(`     Tags: ${pattern.tags.join(', ')}`));
    console.log('');
  });
}

async function handleLearnings(
  limit: number,
  options: { type?: string; brain?: string; json?: boolean }
): Promise<void> {
  console.log(chalk.cyan('  Captured Learnings\n'));

  const learnings = memoryManager.queryLearnings({
    brainType: options.brain as any,
    limit,
  });

  // Filter by type if specified
  const filteredLearnings = options.type
    ? learnings.filter((l) => l.type === options.type)
    : learnings;

  if (options.json) {
    console.log(JSON.stringify(filteredLearnings, null, 2));
    return;
  }

  if (filteredLearnings.length === 0) {
    console.log(chalk.dim('  No learnings captured yet.'));
    console.log(chalk.dim('  Learnings are generated from task outcomes.\n'));
    return;
  }

  filteredLearnings.forEach((learning, index) => {
    const icon = learning.type === 'success' ? chalk.green('[SUCCESS]') :
                 learning.type === 'failure' ? chalk.red('[FAILURE]') :
                 chalk.yellow('[INSIGHT]');

    console.log(chalk.white(`  ${index + 1}. ${icon} ${learning.description.substring(0, 60)}...`));
    console.log(chalk.dim(`     Source: ${learning.source}`));
    console.log(chalk.dim(`     Confidence: ${(learning.confidence * 100).toFixed(0)}%`));
    console.log(chalk.dim(`     Applied: ${learning.appliedCount} times`));
    console.log(chalk.dim(`     Recommendation: ${learning.recommendation}`));
    if (learning.rootCause) {
      console.log(chalk.dim(`     Root Cause: ${learning.rootCause}`));
    }
    console.log('');
  });
}

async function handleSkills(
  limit: number,
  options: { brain?: string; json?: boolean }
): Promise<void> {
  console.log(chalk.cyan('  Skill Pool\n'));

  const skills = memoryManager.querySkills({
    brainType: options.brain as any,
    limit,
  });

  if (options.json) {
    console.log(JSON.stringify(skills, null, 2));
    return;
  }

  if (skills.length === 0) {
    console.log(chalk.dim('  No skills in pool yet.'));
    console.log(chalk.dim('  Skills are shared capabilities that brains can adopt.\n'));
    return;
  }

  skills.forEach((skill, index) => {
    console.log(chalk.white(`  ${index + 1}. ${skill.name}`));
    console.log(chalk.dim(`     Category: ${skill.category}`));
    console.log(chalk.dim(`     Description: ${skill.description}`));
    console.log(chalk.dim(`     Created By: ${skill.createdBy}`));
    console.log(chalk.dim(`     Adopted By: ${skill.adoptedBy.join(', ')}`));
    console.log(chalk.dim(`     Success Rate: ${(skill.successRate * 100).toFixed(0)}%`));
    console.log(chalk.dim(`     Usage: ${skill.usageCount} times`));
    console.log('');
  });
}

async function handleDecisions(
  limit: number,
  options: { brain?: string; json?: boolean }
): Promise<void> {
  console.log(chalk.cyan('  Decision Log\n'));

  const decisions = memoryManager.queryDecisions({
    brainType: options.brain as any,
    limit,
  });

  if (options.json) {
    console.log(JSON.stringify(decisions, null, 2));
    return;
  }

  if (decisions.length === 0) {
    console.log(chalk.dim('  No decisions logged yet.'));
    console.log(chalk.dim('  Decisions are recorded during brain collaboration.\n'));
    return;
  }

  decisions.forEach((decision, index) => {
    const outcomeColor = decision.outcome === 'positive' ? chalk.green :
                         decision.outcome === 'negative' ? chalk.red :
                         chalk.dim;

    console.log(chalk.white(`  ${index + 1}. ${decision.description}`));
    console.log(chalk.dim(`     Participants: ${decision.participants.join(', ')}`));
    console.log(chalk.dim(`     Rationale: ${decision.rationale}`));
    console.log(outcomeColor(`     Outcome: ${decision.outcome ?? 'pending'}`));
    console.log(chalk.dim(`     Options considered: ${decision.options.length}`));
    if (decision.debate) {
      console.log(chalk.dim(`     Debate statements: ${decision.debate.statements.length}`));
      console.log(chalk.dim(`     Consensus: ${decision.debate.consensus ? 'Yes' : 'No'}`));
    }
    console.log('');
  });
}

async function handleStats(json?: boolean): Promise<void> {
  const stats = memoryManager.getStats();

  if (json) {
    console.log(JSON.stringify(stats, null, 2));
    return;
  }

  console.log(chalk.cyan('  Memory Statistics\n'));

  console.log(chalk.white('  Storage:'));
  console.log(chalk.dim(`    Patterns: ${stats.totalPatterns}`));
  console.log(chalk.dim(`    Learnings: ${stats.totalLearnings}`));
  console.log(chalk.dim(`    Skills: ${stats.totalSkills}`));
  console.log(chalk.dim(`    Decisions: ${stats.totalDecisions}`));

  console.log(chalk.white('\n  Usage Metrics:'));
  console.log(chalk.dim(`    Pattern Usage Rate: ${(stats.patternUsageRate * 100).toFixed(1)}%`));
  console.log(chalk.dim(`    Skill Adoption Rate: ${(stats.skillAdoptionRate * 100).toFixed(1)}%`));
  console.log(chalk.dim(`    Learning Application Rate: ${(stats.learningApplicationRate * 100).toFixed(1)}%`));

  console.log(chalk.white('\n  Persistence:'));
  console.log(chalk.dim(`    Status: ${stats.persistenceStatus.isOnline ? 'Online' : 'Offline'}`));
  console.log(chalk.dim(`    Pending Operations: ${stats.persistenceStatus.pendingOperations}`));
  if (stats.persistenceStatus.lastSyncAt) {
    console.log(chalk.dim(`    Last Sync: ${stats.persistenceStatus.lastSyncAt.toISOString()}`));
  }

  console.log('');
}
