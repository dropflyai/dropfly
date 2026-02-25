// SoulSync Design System

export const Colors = {
  // Primary - Warm, inviting coral/rose
  primary: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e', // Main primary
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },

  // Secondary - Calming purple
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Main secondary
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Neutral
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',

  // Background
  background: {
    light: '#ffffff',
    dark: '#0a0a0a',
    elevated: '#f5f5f5',
    card: '#ffffff',
  },

  // Text
  text: {
    primary: '#171717',
    secondary: '#525252',
    muted: '#a3a3a3',
    inverse: '#ffffff',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Timer durations (in hours)
export const TimerDurations = {
  voiceRound: 8,
  videoRound: 24,
  lifelineExtension: 12,
};

// App-specific constants
export const AppConstants = {
  maxLifelines: 2,
  maxCoreValues: 5,
  maxLoveLanguages: 3,
  voiceIntroMaxDuration: 60, // seconds
  voiceNoteMaxDuration: 120, // seconds
  videoMaxDuration: 60, // seconds
  minAge: 18,
  maxAge: 100,
};

// Onboarding step names
export const OnboardingSteps = [
  'basics',        // Name, age, gender
  'location',      // LA only for MVP
  'goal',          // Relationship goal
  'values',        // Core values (5)
  'attachment',    // Attachment style quiz
  'love-language', // Love language quiz
  'voice-intro',   // Record voice intro
] as const;

export type OnboardingStep = typeof OnboardingSteps[number];
