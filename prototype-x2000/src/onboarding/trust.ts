/**
 * Trust Level Selection
 * Progressive autonomy configuration during onboarding
 */

import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import type { TrustLevel } from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

export type AutonomyMode = 'supervised' | 'guided' | 'autonomous';

export interface TrustPreference {
  mode: AutonomyMode;
  trustLevel: TrustLevel;
  notifyOn: NotificationTrigger[];
  approvalRequired: ApprovalAction[];
}

export type NotificationTrigger =
  | 'task-complete'
  | 'milestone-reached'
  | 'decision-made'
  | 'error-occurred'
  | 'cost-threshold';

export type ApprovalAction =
  | 'commit-code'
  | 'deploy-production'
  | 'external-api'
  | 'spend-money'
  | 'delete-data'
  | 'change-config';

// ============================================================================
// Trust Level Selection
// ============================================================================

/**
 * Guide the user through selecting their trust/autonomy preferences
 */
export async function selectTrustPreference(): Promise<TrustPreference> {
  console.log(chalk.bold.cyan('\n  Phase 4: Trust Level Selection\n'));
  console.log(chalk.dim('  How autonomous should X2000 be?\n'));

  // Display explanation
  console.log(chalk.dim('  X2000 can work at different autonomy levels:'));
  console.log(chalk.dim('  '));
  console.log(chalk.dim(`  ${chalk.green('Supervised')}  - You approve every action before it happens`));
  console.log(chalk.dim(`  ${chalk.yellow('Guided')}      - You approve milestones, X2000 handles details`));
  console.log(chalk.dim(`  ${chalk.blue('Autonomous')} - X2000 works independently, notifies when done`));
  console.log('');

  const mode = await select<AutonomyMode>({
    message: chalk.white('Choose your preferred autonomy level:'),
    choices: [
      {
        name: `${chalk.green('[1] Supervised')} ${chalk.dim('- Approve every action')}`,
        value: 'supervised' as AutonomyMode,
      },
      {
        name: `${chalk.yellow('[2] Guided')} ${chalk.dim('- Approve milestones')} ${chalk.bgYellow.black(' recommended ')}`,
        value: 'guided' as AutonomyMode,
      },
      {
        name: `${chalk.blue('[3] Autonomous')} ${chalk.dim('- Notify when done')}`,
        value: 'autonomous' as AutonomyMode,
      },
    ],
  });

  // Get notification preferences
  const notifyOn = await selectNotificationTriggers(mode);

  // Get approval requirements
  const approvalRequired = await selectApprovalActions(mode);

  // Calculate trust level based on mode
  const trustLevel = modeToTrustLevel(mode);

  const preference: TrustPreference = {
    mode,
    trustLevel,
    notifyOn,
    approvalRequired,
  };

  // Show summary
  displayTrustSummary(preference);

  // Confirm
  const confirmed = await confirm({
    message: chalk.white('Continue with these settings?'),
    default: true,
  });

  if (!confirmed) {
    console.log(chalk.yellow('\n  Let\'s try again...\n'));
    return selectTrustPreference();
  }

  return preference;
}

// ============================================================================
// Notification Selection
// ============================================================================

async function selectNotificationTriggers(mode: AutonomyMode): Promise<NotificationTrigger[]> {
  // Supervised mode: notify on everything
  if (mode === 'supervised') {
    return [
      'task-complete',
      'milestone-reached',
      'decision-made',
      'error-occurred',
      'cost-threshold',
    ];
  }

  // Guided mode: ask what they want notifications for
  if (mode === 'guided') {
    console.log(chalk.dim('\n  What should X2000 notify you about?\n'));

    const triggers: NotificationTrigger[] = [];

    const notifyMilestones = await confirm({
      message: chalk.white('Notify when milestones are reached?'),
      default: true,
    });
    if (notifyMilestones) triggers.push('milestone-reached');

    const notifyDecisions = await confirm({
      message: chalk.white('Notify when major decisions are made?'),
      default: true,
    });
    if (notifyDecisions) triggers.push('decision-made');

    const notifyErrors = await confirm({
      message: chalk.white('Notify when errors occur?'),
      default: true,
    });
    if (notifyErrors) triggers.push('error-occurred');

    const notifyCost = await confirm({
      message: chalk.white('Notify when spending thresholds are reached?'),
      default: true,
    });
    if (notifyCost) triggers.push('cost-threshold');

    return triggers;
  }

  // Autonomous mode: minimal notifications
  return ['milestone-reached', 'error-occurred', 'cost-threshold'];
}

// ============================================================================
// Approval Selection
// ============================================================================

async function selectApprovalActions(mode: AutonomyMode): Promise<ApprovalAction[]> {
  // Supervised mode: approve everything
  if (mode === 'supervised') {
    return [
      'commit-code',
      'deploy-production',
      'external-api',
      'spend-money',
      'delete-data',
      'change-config',
    ];
  }

  // Autonomous mode: minimal approvals
  if (mode === 'autonomous') {
    console.log(chalk.dim('\n  Even in autonomous mode, some actions may need approval:\n'));

    const actions: ApprovalAction[] = [];

    const approveProd = await confirm({
      message: chalk.white('Require approval for production deployments?'),
      default: true,
    });
    if (approveProd) actions.push('deploy-production');

    const approveSpend = await confirm({
      message: chalk.white('Require approval for spending money?'),
      default: true,
    });
    if (approveSpend) actions.push('spend-money');

    const approveDelete = await confirm({
      message: chalk.white('Require approval for deleting data?'),
      default: true,
    });
    if (approveDelete) actions.push('delete-data');

    return actions;
  }

  // Guided mode: approve high-impact actions
  return [
    'deploy-production',
    'spend-money',
    'delete-data',
  ];
}

// ============================================================================
// Trust Level Mapping
// ============================================================================

function modeToTrustLevel(mode: AutonomyMode): TrustLevel {
  const mapping: Record<AutonomyMode, TrustLevel> = {
    'supervised': 1,
    'guided': 2,
    'autonomous': 3,
  };
  return mapping[mode];
}

// ============================================================================
// Display Functions
// ============================================================================

function displayTrustSummary(preference: TrustPreference): void {
  console.log(chalk.bold.cyan('\n  Trust Configuration Summary\n'));
  console.log(chalk.dim('  ───────────────────────────────────────────\n'));

  // Mode
  const modeColor = preference.mode === 'supervised' ? chalk.green :
    preference.mode === 'guided' ? chalk.yellow : chalk.blue;
  console.log(`  ${chalk.bold('Mode:')} ${modeColor(preference.mode.toUpperCase())}`);
  console.log(`  ${chalk.bold('Trust Level:')} ${preference.trustLevel}/4`);

  // Notifications
  console.log(`\n  ${chalk.bold('Notify on:')}`);
  if (preference.notifyOn.length === 0) {
    console.log(chalk.dim('    - None'));
  } else {
    preference.notifyOn.forEach((trigger) => {
      console.log(chalk.dim(`    - ${formatTrigger(trigger)}`));
    });
  }

  // Approvals
  console.log(`\n  ${chalk.bold('Approval required for:')}`);
  if (preference.approvalRequired.length === 0) {
    console.log(chalk.dim('    - None (full autonomy)'));
  } else {
    preference.approvalRequired.forEach((action) => {
      console.log(chalk.dim(`    - ${formatAction(action)}`));
    });
  }

  console.log(chalk.dim('\n  ───────────────────────────────────────────\n'));
}

function formatTrigger(trigger: NotificationTrigger): string {
  const formats: Record<NotificationTrigger, string> = {
    'task-complete': 'Task completions',
    'milestone-reached': 'Milestone achievements',
    'decision-made': 'Major decisions',
    'error-occurred': 'Errors and failures',
    'cost-threshold': 'Cost thresholds',
  };
  return formats[trigger];
}

function formatAction(action: ApprovalAction): string {
  const formats: Record<ApprovalAction, string> = {
    'commit-code': 'Committing code',
    'deploy-production': 'Deploying to production',
    'external-api': 'External API calls',
    'spend-money': 'Spending money',
    'delete-data': 'Deleting data',
    'change-config': 'Changing configuration',
  };
  return formats[action];
}

// ============================================================================
// Trust Configuration
// ============================================================================

export interface TrustConfig {
  preference: TrustPreference;
  escalationThreshold: number;
  autoApprovePatterns: string[];
  requireApprovalPatterns: string[];
}

/**
 * Build a full trust configuration from the preference
 */
export function buildTrustConfig(preference: TrustPreference): TrustConfig {
  const config: TrustConfig = {
    preference,
    escalationThreshold: getEscalationThreshold(preference.mode),
    autoApprovePatterns: getAutoApprovePatterns(preference.mode),
    requireApprovalPatterns: getRequireApprovalPatterns(preference.mode),
  };

  return config;
}

function getEscalationThreshold(mode: AutonomyMode): number {
  // Number of consecutive issues before escalating to user
  const thresholds: Record<AutonomyMode, number> = {
    'supervised': 1,  // Escalate immediately
    'guided': 3,      // Allow some self-correction
    'autonomous': 5,  // Try harder before escalating
  };
  return thresholds[mode];
}

function getAutoApprovePatterns(mode: AutonomyMode): string[] {
  if (mode === 'supervised') {
    return []; // No auto-approve
  }

  if (mode === 'guided') {
    return [
      'read-*',      // All read operations
      'analyze-*',   // All analysis
      'draft-*',     // Creating drafts
    ];
  }

  // Autonomous
  return [
    'read-*',
    'analyze-*',
    'draft-*',
    'write-*',     // Writing files
    'commit-*',    // Committing code
  ];
}

function getRequireApprovalPatterns(mode: AutonomyMode): string[] {
  if (mode === 'autonomous') {
    return [
      'deploy-production',
      'delete-*',
      'spend-*',
    ];
  }

  if (mode === 'guided') {
    return [
      'deploy-*',
      'delete-*',
      'spend-*',
      'external-*',
    ];
  }

  // Supervised - everything requires approval
  return ['*'];
}
