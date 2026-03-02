import {
  calculateAge,
  isValidAge,
  formatTimeRemaining,
  formatRelativeTime,
  calculateDeadline,
  extendDeadline,
  getSecondsUntilDeadline,
  generateId,
  isValidEmail,
  isValidPassword,
  truncateText,
  formatCompatibility,
  getCompatibilityColor,
  capitalize,
  formatList,
} from '../lib/utils';

describe('calculateAge', () => {
  it('calculates age correctly', () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 25;
    const birthdate = `${birthYear}-01-15`;

    const age = calculateAge(birthdate);
    // Age should be 25 or 24 depending on current date
    expect(age).toBeGreaterThanOrEqual(24);
    expect(age).toBeLessThanOrEqual(25);
  });

  it('accounts for birthday not yet passed', () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 30;
    // Set birthdate to next month
    const futureMonth = ((today.getMonth() + 2) % 12) + 1;
    const birthdate = `${birthYear}-${String(futureMonth).padStart(2, '0')}-15`;

    const age = calculateAge(birthdate);
    expect(age).toBe(29); // Not yet 30
  });
});

describe('isValidAge', () => {
  it('returns true for 18+', () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 25;
    expect(isValidAge(`${birthYear}-01-01`)).toBe(true);
  });

  it('returns false for under 18', () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 15;
    expect(isValidAge(`${birthYear}-01-01`)).toBe(false);
  });

  it('handles edge case of exactly 18', () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 18;
    // Use a date in the past this year
    const pastMonth = Math.max(1, today.getMonth());
    expect(isValidAge(`${birthYear}-${String(pastMonth).padStart(2, '0')}-01`)).toBe(true);
  });
});

describe('formatTimeRemaining', () => {
  it('formats hours and minutes', () => {
    expect(formatTimeRemaining(3700)).toBe('1h 1m');
  });

  it('formats minutes and seconds', () => {
    expect(formatTimeRemaining(125)).toBe('2:05');
  });

  it('formats seconds only', () => {
    expect(formatTimeRemaining(45)).toBe('0:45');
  });

  it('handles zero', () => {
    expect(formatTimeRemaining(0)).toBe('0:00');
  });

  it('handles negative values', () => {
    expect(formatTimeRemaining(-10)).toBe('0:00');
  });
});

describe('formatRelativeTime', () => {
  it('shows "Just now" for recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('Just now');
  });

  it('shows minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('shows singular minute', () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
  });

  it('shows hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
  });

  it('shows days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');
  });
});

describe('calculateDeadline', () => {
  it('adds 8 hours for voice rounds', () => {
    const before = Date.now();
    const deadline = calculateDeadline('voice');
    const after = Date.now();

    const expectedMin = before + 8 * 60 * 60 * 1000;
    const expectedMax = after + 8 * 60 * 60 * 1000;

    expect(deadline.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(deadline.getTime()).toBeLessThanOrEqual(expectedMax);
  });

  it('adds 24 hours for video rounds', () => {
    const before = Date.now();
    const deadline = calculateDeadline('video');
    const after = Date.now();

    const expectedMin = before + 24 * 60 * 60 * 1000;
    const expectedMax = after + 24 * 60 * 60 * 1000;

    expect(deadline.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(deadline.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});

describe('extendDeadline', () => {
  it('adds 12 hours to deadline', () => {
    const original = new Date();
    const extended = extendDeadline(original);

    const expectedMs = original.getTime() + 12 * 60 * 60 * 1000;
    expect(extended.getTime()).toBe(expectedMs);
  });
});

describe('getSecondsUntilDeadline', () => {
  it('returns positive seconds for future deadline', () => {
    const futureDeadline = new Date(Date.now() + 60 * 1000); // 1 minute from now
    const seconds = getSecondsUntilDeadline(futureDeadline);

    expect(seconds).toBeGreaterThanOrEqual(59);
    expect(seconds).toBeLessThanOrEqual(60);
  });

  it('returns 0 for past deadline', () => {
    const pastDeadline = new Date(Date.now() - 60 * 1000); // 1 minute ago
    expect(getSecondsUntilDeadline(pastDeadline)).toBe(0);
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
  });

  it('includes timestamp', () => {
    const id = generateId();
    const timestamp = parseInt(id.split('-')[0]);

    expect(timestamp).toBeGreaterThan(Date.now() - 1000);
    expect(timestamp).toBeLessThanOrEqual(Date.now());
  });
});

describe('isValidEmail', () => {
  it('validates correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('no@domain')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('validates strong passwords', () => {
    expect(isValidPassword('password1')).toBe(true);
    expect(isValidPassword('MySecure123')).toBe(true);
    expect(isValidPassword('12345678a')).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(isValidPassword('short1')).toBe(false); // Too short
    expect(isValidPassword('noNumbers')).toBe(false); // No numbers
    expect(isValidPassword('12345678')).toBe(false); // No letters
  });
});

describe('truncateText', () => {
  it('truncates long text', () => {
    expect(truncateText('This is a long text', 10)).toBe('This is...');
  });

  it('keeps short text unchanged', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });

  it('handles exact length', () => {
    expect(truncateText('Exact', 5)).toBe('Exact');
  });
});

describe('formatCompatibility', () => {
  it('formats score as percentage', () => {
    expect(formatCompatibility(85.7)).toBe('86%');
    expect(formatCompatibility(50)).toBe('50%');
    expect(formatCompatibility(99.9)).toBe('100%');
  });
});

describe('getCompatibilityColor', () => {
  it('returns green for high compatibility', () => {
    expect(getCompatibilityColor(85)).toBe('#22c55e');
  });

  it('returns yellow for medium-high compatibility', () => {
    expect(getCompatibilityColor(65)).toBe('#eab308');
  });

  it('returns orange for medium-low compatibility', () => {
    expect(getCompatibilityColor(45)).toBe('#f97316');
  });

  it('returns red for low compatibility', () => {
    expect(getCompatibilityColor(30)).toBe('#ef4444');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  it('handles already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('formatList', () => {
  it('handles empty array', () => {
    expect(formatList([])).toBe('');
  });

  it('handles single item', () => {
    expect(formatList(['Apple'])).toBe('Apple');
  });

  it('handles two items', () => {
    expect(formatList(['Apple', 'Banana'])).toBe('Apple and Banana');
  });

  it('handles three+ items with Oxford comma', () => {
    expect(formatList(['Apple', 'Banana', 'Cherry'])).toBe('Apple, Banana, and Cherry');
    expect(formatList(['A', 'B', 'C', 'D'])).toBe('A, B, C, and D');
  });
});
