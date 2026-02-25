// Utility functions for SoulSync

// Calculate age from birthdate
export const calculateAge = (birthdate: string): number => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

// Validate age is 18+
export const isValidAge = (birthdate: string): boolean => {
  return calculateAge(birthdate) >= 18;
};

// Format time remaining for timers
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  return `0:${secs.toString().padStart(2, '0')}`;
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffMins > 0) {
    return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  }
  return 'Just now';
};

// Calculate deadline (8 hours for voice, 24 hours for video)
export const calculateDeadline = (roundType: 'voice' | 'video'): Date => {
  const now = new Date();
  const hours = roundType === 'voice' ? 8 : 24;
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
};

// Calculate extended deadline with lifeline (+12 hours)
export const extendDeadline = (currentDeadline: Date): Date => {
  return new Date(currentDeadline.getTime() + 12 * 60 * 60 * 1000);
};

// Get seconds until deadline
export const getSecondsUntilDeadline = (deadline: string | Date): number => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
};

// Generate a unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength (min 8 chars, 1 number, 1 letter)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
};

// Format compatibility score as percentage
export const formatCompatibility = (score: number): string => {
  return `${Math.round(score)}%`;
};

// Get compatibility color based on score
export const getCompatibilityColor = (score: number): string => {
  if (score >= 80) return '#22c55e'; // Green
  if (score >= 60) return '#eab308'; // Yellow
  if (score >= 40) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Sleep/delay helper
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format list with "and" (e.g., "A, B, and C")
export const formatList = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};
