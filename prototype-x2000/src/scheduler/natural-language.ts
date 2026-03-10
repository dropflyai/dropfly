/**
 * Natural Language Schedule Parser
 * Parses human-readable schedule descriptions into cron expressions and JobSchedule objects
 */

import type {
  JobSchedule,
  ParsedSchedule,
  ParseOptions,
  Duration,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

const WEEKDAY_MAP: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

const MONTH_MAP: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

// ============================================================================
// Pattern Definitions
// ============================================================================

interface PatternDefinition {
  pattern: RegExp;
  parser: (match: RegExpMatchArray, options: ParseOptions) => JobSchedule;
  examples: string[];
  description: string;
}

const NATURAL_LANGUAGE_PATTERNS: PatternDefinition[] = [
  // Every X interval (minutes, hours, days, etc.)
  {
    pattern:
      /^every\s+(\d+)?\s*(second|minute|hour|day|week|month|year)s?$/i,
    parser: (match) => {
      const count = parseInt(match[1] || '1', 10);
      const unit = match[2].toLowerCase();
      return {
        type: 'interval',
        every: { [`${unit}s`]: count },
      };
    },
    examples: ['every 5 minutes', 'every hour', 'every 2 days'],
    description: 'Simple interval schedules',
  },

  // Every weekday at time
  {
    pattern:
      /^every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)s?\s+at\s+(.+)$/i,
    parser: (match) => {
      const day = match[1].toLowerCase();
      const timeStr = match[2];
      const time = parseTime(timeStr);
      const dayNum = WEEKDAY_MAP[day];

      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} * * ${dayNum}`,
      };
    },
    examples: ['every Monday at 9am', 'every Friday at 5:30pm'],
    description: 'Weekly schedule on specific day',
  },

  // Multiple weekdays at time
  {
    pattern:
      /^every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s+and\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s+at\s+(.+)$/i,
    parser: (match) => {
      const day1 = match[1].toLowerCase();
      const day2 = match[2].toLowerCase();
      const timeStr = match[3];
      const time = parseTime(timeStr);
      const dayNum1 = WEEKDAY_MAP[day1];
      const dayNum2 = WEEKDAY_MAP[day2];

      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} * * ${dayNum1},${dayNum2}`,
      };
    },
    examples: ['every Monday and Friday at 3:30pm'],
    description: 'Weekly schedule on multiple days',
  },

  // Every weekday (Mon-Fri)
  {
    pattern: /^every\s+weekday\s+at\s+(.+)$/i,
    parser: (match) => {
      const time = parseTime(match[1]);
      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} * * 1-5`,
      };
    },
    examples: ['every weekday at 9am'],
    description: 'Monday through Friday schedule',
  },

  // Every weekend
  {
    pattern: /^every\s+weekend\s+at\s+(.+)$/i,
    parser: (match) => {
      const time = parseTime(match[1]);
      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} * * 0,6`,
      };
    },
    examples: ['every weekend at 10am'],
    description: 'Saturday and Sunday schedule',
  },

  // Daily at time
  {
    pattern: /^(daily|every\s+day)\s+at\s+(.+)$/i,
    parser: (match) => {
      const time = parseTime(match[2]);
      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} * * *`,
      };
    },
    examples: ['daily at 9am', 'every day at noon'],
    description: 'Daily schedule',
  },

  // Hourly
  {
    pattern: /^hourly$/i,
    parser: () => ({
      type: 'cron',
      expression: '0 * * * *',
    }),
    examples: ['hourly'],
    description: 'Every hour on the hour',
  },

  // Hourly at specific minute
  {
    pattern: /^hourly\s+at\s+:?(\d{1,2})$/i,
    parser: (match) => {
      const minute = parseInt(match[1], 10);
      return {
        type: 'cron',
        expression: `${minute} * * * *`,
      };
    },
    examples: ['hourly at :30', 'hourly at 15'],
    description: 'Every hour at specific minute',
  },

  // Monthly on specific day(s)
  {
    pattern:
      /^on\s+the\s+(\d{1,2})(?:st|nd|rd|th)?\s+(?:and\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+)?(?:of\s+every\s+month\s+)?at\s+(.+)$/i,
    parser: (match) => {
      const day1 = match[1];
      const day2 = match[2];
      const time = parseTime(match[3]);
      const days = day2 ? `${day1},${day2}` : day1;

      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} ${days} * *`,
      };
    },
    examples: ['on the 1st and 15th at 2:30pm', 'on the 5th of every month at noon'],
    description: 'Monthly schedule on specific day(s)',
  },

  // First/Last of month
  {
    pattern: /^(first|last)\s+day\s+of\s+(every\s+)?month\s+at\s+(.+)$/i,
    parser: (match) => {
      const position = match[1].toLowerCase();
      const time = parseTime(match[3]);
      const day = position === 'first' ? '1' : 'L';

      return {
        type: 'cron',
        expression: `${time.minute} ${time.hour} ${day} * *`,
      };
    },
    examples: ['first day of month at 9am', 'last day of every month at 5pm'],
    description: 'First or last day of month',
  },

  // Every N hours
  {
    pattern: /^every\s+(\d+)\s+hours?$/i,
    parser: (match) => {
      const hours = parseInt(match[1], 10);
      return {
        type: 'interval',
        every: { hours },
      };
    },
    examples: ['every 4 hours', 'every 1 hour'],
    description: 'Interval in hours',
  },

  // Every N minutes
  {
    pattern: /^every\s+(\d+)\s+minutes?$/i,
    parser: (match) => {
      const minutes = parseInt(match[1], 10);
      return {
        type: 'interval',
        every: { minutes },
      };
    },
    examples: ['every 30 minutes', 'every 1 minute'],
    description: 'Interval in minutes',
  },

  // At specific time (one-shot)
  {
    pattern: /^(?:at|on)\s+(.+)$/i,
    parser: (match, options) => {
      const dateStr = match[1];
      const date = parseDateTime(dateStr, options);

      if (!date) {
        throw new Error(`Could not parse date: ${dateStr}`);
      }

      return {
        type: 'once',
        at: date,
      };
    },
    examples: ['at 3pm tomorrow', 'on March 15th 2025 at 10am'],
    description: 'One-time schedule',
  },

  // Cron passthrough
  {
    pattern: /^cron:\s*(.+)$/i,
    parser: (match) => ({
      type: 'cron',
      expression: match[1].trim(),
    }),
    examples: ['cron: 0 9 * * MON', 'cron: */15 * * * *'],
    description: 'Direct cron expression',
  },
];

// ============================================================================
// Time Parsing
// ============================================================================

interface ParsedTime {
  hour: number;
  minute: number;
}

/**
 * Parse time string into hour and minute
 * Supports: 9am, 9:30am, 14:00, noon, midnight
 */
function parseTime(timeStr: string): ParsedTime {
  const normalized = timeStr.toLowerCase().trim();

  // Special cases
  if (normalized === 'noon' || normalized === 'midday') {
    return { hour: 12, minute: 0 };
  }
  if (normalized === 'midnight') {
    return { hour: 0, minute: 0 };
  }

  // Pattern: HH:MM am/pm or HH am/pm
  const match12h = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (match12h) {
    let hour = parseInt(match12h[1], 10);
    const minute = parseInt(match12h[2] || '0', 10);
    const period = match12h[3];

    if (period === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }

    return { hour, minute };
  }

  // Pattern: HH:MM (24-hour)
  const match24h = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (match24h) {
    return {
      hour: parseInt(match24h[1], 10),
      minute: parseInt(match24h[2], 10),
    };
  }

  throw new Error(`Could not parse time: ${timeStr}`);
}

// ============================================================================
// Date/Time Parsing
// ============================================================================

/**
 * Parse a date/time string into a Date object
 * Supports various formats including relative dates
 */
function parseDateTime(dateStr: string, options: ParseOptions): Date | null {
  const now = options.referenceDate || new Date();
  const normalized = dateStr.toLowerCase().trim();

  // Tomorrow at time
  const tomorrowMatch = normalized.match(
    /^tomorrow\s+at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)$/
  );
  if (tomorrowMatch) {
    const time = parseTime(tomorrowMatch[1]);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(time.hour, time.minute, 0, 0);
    return tomorrow;
  }

  // Next weekday at time
  const nextWeekdayMatch = normalized.match(
    /^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s+at\s+(.+)$/
  );
  if (nextWeekdayMatch) {
    const targetDay = WEEKDAY_MAP[nextWeekdayMatch[1]];
    const time = parseTime(nextWeekdayMatch[2]);
    const currentDay = now.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;

    const date = new Date(now);
    date.setDate(date.getDate() + daysUntil);
    date.setHours(time.hour, time.minute, 0, 0);
    return date;
  }

  // Month Day Year at time (e.g., "March 15th 2025 at 10am")
  const fullDateMatch = normalized.match(
    /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})\s+at\s+(.+)$/
  );
  if (fullDateMatch) {
    const month = MONTH_MAP[fullDateMatch[1]] - 1; // JS months are 0-indexed
    const day = parseInt(fullDateMatch[2], 10);
    const year = parseInt(fullDateMatch[3], 10);
    const time = parseTime(fullDateMatch[4]);

    return new Date(year, month, day, time.hour, time.minute, 0, 0);
  }

  // In X hours/minutes/days
  const inDurationMatch = normalized.match(
    /^in\s+(\d+)\s+(minute|hour|day|week)s?$/
  );
  if (inDurationMatch) {
    const amount = parseInt(inDurationMatch[1], 10);
    const unit = inDurationMatch[2];
    const date = new Date(now);

    switch (unit) {
      case 'minute':
        date.setMinutes(date.getMinutes() + amount);
        break;
      case 'hour':
        date.setHours(date.getHours() + amount);
        break;
      case 'day':
        date.setDate(date.getDate() + amount);
        break;
      case 'week':
        date.setDate(date.getDate() + amount * 7);
        break;
    }

    return date;
  }

  return null;
}

// ============================================================================
// Cron Next Occurrence Calculator
// ============================================================================

/**
 * Calculate next occurrences from a cron expression
 * Simple implementation supporting standard 5-field cron
 */
function getNextCronOccurrences(
  expression: string,
  count: number,
  referenceDate?: Date
): Date[] {
  const now = referenceDate || new Date();
  const parts = expression.split(/\s+/);

  if (parts.length !== 5) {
    return [];
  }

  const [minuteField, hourField, dayField, monthField, weekdayField] = parts;
  const occurrences: Date[] = [];

  // Simple implementation: iterate through future dates
  const candidate = new Date(now);
  candidate.setSeconds(0);
  candidate.setMilliseconds(0);
  candidate.setMinutes(candidate.getMinutes() + 1);

  const maxIterations = 365 * 24 * 60; // One year of minutes
  let iterations = 0;

  while (occurrences.length < count && iterations < maxIterations) {
    if (matchesCronField(candidate, minuteField, hourField, dayField, monthField, weekdayField)) {
      occurrences.push(new Date(candidate));
    }
    candidate.setMinutes(candidate.getMinutes() + 1);
    iterations++;
  }

  return occurrences;
}

function matchesCronField(
  date: Date,
  minute: string,
  hour: string,
  day: string,
  month: string,
  weekday: string
): boolean {
  return (
    matchesField(date.getMinutes(), minute) &&
    matchesField(date.getHours(), hour) &&
    matchesField(date.getDate(), day) &&
    matchesField(date.getMonth() + 1, month) &&
    matchesField(date.getDay(), weekday)
  );
}

function matchesField(value: number, field: string): boolean {
  if (field === '*') return true;

  // Range (e.g., 1-5)
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number);
    return value >= start && value <= end;
  }

  // List (e.g., 1,3,5)
  if (field.includes(',')) {
    return field.split(',').map(Number).includes(value);
  }

  // Step (e.g., */5)
  if (field.startsWith('*/')) {
    const step = parseInt(field.substring(2), 10);
    return value % step === 0;
  }

  // Last day of month
  if (field === 'L') {
    // This is a simplification - would need actual month handling
    return false;
  }

  // Exact value
  return parseInt(field, 10) === value;
}

// ============================================================================
// Duration Utilities
// ============================================================================

export function durationToMs(duration: Duration): number {
  let ms = 0;
  if (duration.milliseconds) ms += duration.milliseconds;
  if (duration.seconds) ms += duration.seconds * 1000;
  if (duration.minutes) ms += duration.minutes * 60 * 1000;
  if (duration.hours) ms += duration.hours * 60 * 60 * 1000;
  if (duration.days) ms += duration.days * 24 * 60 * 60 * 1000;
  if (duration.weeks) ms += duration.weeks * 7 * 24 * 60 * 60 * 1000;
  return ms;
}

export function msToDuration(ms: number): Duration {
  if (ms < 1000) return { milliseconds: ms };
  if (ms < 60000) return { seconds: Math.round(ms / 1000) };
  if (ms < 3600000) return { minutes: Math.round(ms / 60000) };
  if (ms < 86400000) return { hours: Math.round(ms / 3600000) };
  return { days: Math.round(ms / 86400000) };
}

// ============================================================================
// Natural Language Parser Class
// ============================================================================

export class NaturalLanguageScheduleParser {
  /**
   * Parse a natural language schedule description
   */
  parse(input: string, options: ParseOptions = {}): ParsedSchedule {
    const normalized = input.trim();
    const warnings: string[] = [];

    // Try pattern matching (highest confidence)
    for (const { pattern, parser, description } of NATURAL_LANGUAGE_PATTERNS) {
      const match = normalized.match(pattern);
      if (match) {
        try {
          const schedule = parser(match, options);
          const nextOccurrences = this.getNextOccurrences(schedule, options, 5);

          return {
            input,
            schedule,
            humanReadable: this.describeSchedule(schedule),
            nextOccurrences,
            confidence: 0.95,
            warnings: warnings.length > 0 ? warnings : undefined,
          };
        } catch (error) {
          warnings.push(
            `Pattern matched (${description}) but parsing failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    }

    // No pattern matched
    return {
      input,
      schedule: { type: 'cron', expression: '0 0 * * *' }, // Default: daily at midnight
      humanReadable: 'Could not parse schedule',
      nextOccurrences: [],
      confidence: 0,
      warnings: [
        `Could not understand: "${input}"`,
        'Try formats like: "every Monday at 9am", "every 5 minutes", "daily at 3pm"',
        'Supported patterns:',
        ...NATURAL_LANGUAGE_PATTERNS.map(
          (p) => `  - ${p.examples[0]} (${p.description})`
        ),
      ],
    };
  }

  /**
   * Check if a string looks like a cron expression
   */
  isCronExpression(input: string): boolean {
    const parts = input.trim().split(/\s+/);
    return parts.length === 5 && parts.every((p) => /^[\d*,\-/LW#]+$/.test(p));
  }

  /**
   * Parse schedule from string or JobSchedule
   * Handles both natural language and direct cron expressions
   */
  parseScheduleInput(
    input: string | { type: string },
    options: ParseOptions = {}
  ): ParsedSchedule {
    // Already a JobSchedule object
    if (typeof input !== 'string') {
      return {
        input: JSON.stringify(input),
        schedule: input as unknown as ParsedSchedule['schedule'],
        humanReadable: this.describeSchedule(input as unknown as ParsedSchedule['schedule']),
        nextOccurrences: this.getNextOccurrences(
          input as unknown as ParsedSchedule['schedule'],
          options,
          5
        ),
        confidence: 1.0,
      };
    }

    // Direct cron expression
    if (this.isCronExpression(input)) {
      const schedule = { type: 'cron' as const, expression: input };
      return {
        input,
        schedule,
        humanReadable: this.describeCronExpression(input),
        nextOccurrences: getNextCronOccurrences(input, 5, options.referenceDate),
        confidence: 1.0,
      };
    }

    // Natural language
    return this.parse(input, options);
  }

  /**
   * Describe a schedule in human-readable form
   */
  describeSchedule(schedule: ParsedSchedule['schedule']): string {
    switch (schedule.type) {
      case 'once':
        return `Once at ${schedule.at.toLocaleString()}`;

      case 'interval': {
        const parts: string[] = [];
        const every = schedule.every;
        if (every.weeks) parts.push(`${every.weeks} week(s)`);
        if (every.days) parts.push(`${every.days} day(s)`);
        if (every.hours) parts.push(`${every.hours} hour(s)`);
        if (every.minutes) parts.push(`${every.minutes} minute(s)`);
        if (every.seconds) parts.push(`${every.seconds} second(s)`);
        return `Every ${parts.join(', ')}`;
      }

      case 'cron':
        return this.describeCronExpression(schedule.expression);

      case 'natural':
        return schedule.description;

      case 'dependent':
        return `After job ${schedule.afterJob}${
          schedule.delay ? ` (delay: ${JSON.stringify(schedule.delay)})` : ''
        }`;

      default:
        return 'Unknown schedule type';
    }
  }

  /**
   * Describe a cron expression in human-readable form
   */
  private describeCronExpression(expr: string): string {
    const parts = expr.split(/\s+/);
    if (parts.length !== 5) return `Cron: ${expr}`;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Common patterns
    if (minute === '0' && dayOfMonth === '*' && month === '*') {
      if (hour === '*') {
        return 'Every hour on the hour';
      }
      if (dayOfWeek === '1-5') {
        return `Every weekday at ${hour}:00`;
      }
      if (dayOfWeek === '0,6') {
        return `Every weekend at ${hour}:00`;
      }
      if (dayOfWeek === '*') {
        return `Daily at ${hour}:${minute.padStart(2, '0')}`;
      }
      const dayName = Object.entries(WEEKDAY_MAP).find(
        ([, v]) => String(v) === dayOfWeek
      )?.[0];
      if (dayName) {
        return `Every ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} at ${hour}:${minute.padStart(2, '0')}`;
      }
    }

    if (minute.startsWith('*/')) {
      const interval = minute.substring(2);
      return `Every ${interval} minutes`;
    }

    return `Cron: ${expr}`;
  }

  /**
   * Get next occurrences for a schedule
   */
  private getNextOccurrences(
    schedule: ParsedSchedule['schedule'],
    options: ParseOptions,
    count: number
  ): Date[] {
    const now = options.referenceDate || new Date();
    const occurrences: Date[] = [];

    switch (schedule.type) {
      case 'once':
        if (schedule.at > now) {
          occurrences.push(schedule.at);
        }
        break;

      case 'interval': {
        const intervalMs = durationToMs(schedule.every);
        let next = schedule.startAt || now;
        while (next <= now) {
          next = new Date(next.getTime() + intervalMs);
        }
        for (let i = 0; i < count; i++) {
          occurrences.push(new Date(next.getTime() + i * intervalMs));
        }
        break;
      }

      case 'cron':
        return getNextCronOccurrences(schedule.expression, count, now);

      case 'natural':
        // If parsed, use cron logic
        if (schedule.parsed) {
          return getNextCronOccurrences(schedule.parsed, count, now);
        }
        break;
    }

    return occurrences;
  }
}

// Export singleton instance
export const naturalLanguageParser = new NaturalLanguageScheduleParser();

// Export utility functions
export { parseTime, parseDateTime, getNextCronOccurrences };
