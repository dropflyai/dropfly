/**
 * Utility functions for BookFly Web
 *
 * Common helpers for class names, formatting, and validation.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Merge Tailwind classes with clsx and tailwind-merge
 * Handles conditional classes and resolves conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values with proper locale
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(
  dateString: string | Date,
  formatStr: string = 'MMM d, yyyy'
): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a date for display with time
 */
export function formatDateTime(
  dateString: string | Date,
  formatStr: string = 'MMM d, yyyy h:mm a'
): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, formatStr);
}

/**
 * Get confidence level category based on score
 */
export function getConfidenceLevel(
  score: number
): 'high' | 'medium' | 'low' {
  if (score >= 0.85) return 'high';
  if (score >= 0.6) return 'medium';
  return 'low';
}

/**
 * Get confidence level label and color
 */
export function getConfidenceInfo(score: number): {
  level: 'high' | 'medium' | 'low';
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
} {
  const level = getConfidenceLevel(score);

  const levelMap = {
    high: {
      level: 'high' as const,
      label: 'High Confidence',
      color: '#10B981',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    medium: {
      level: 'medium' as const,
      label: 'Medium Confidence',
      color: '#F59E0B',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    low: {
      level: 'low' as const,
      label: 'Low Confidence',
      color: '#EF4444',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
  };

  return levelMap[level];
}

/**
 * Format a percentage for display
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format large numbers with abbreviations (1K, 1M, etc.)
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounce function for search inputs, etc.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Sleep/delay function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID (for temporary keys, etc.)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Parse file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if a file type is allowed for upload
 */
export function isAllowedFileType(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Get status badge color classes
 */
export function getStatusColors(
  status: 'pending' | 'approved' | 'rejected' | 'synced' | 'syncing' | 'error'
): {
  bgColor: string;
  textColor: string;
  dotColor: string;
} {
  const statusMap = {
    pending: {
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
    },
    approved: {
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
    },
    rejected: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500',
    },
    synced: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      dotColor: 'bg-blue-500',
    },
    syncing: {
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      dotColor: 'bg-purple-500',
    },
    error: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500',
    },
  };

  return statusMap[status];
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}
