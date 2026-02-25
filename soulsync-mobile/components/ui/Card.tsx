import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadow } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
}

const paddingStyles = {
  sm: 'paddingSm',
  md: 'paddingMd',
  lg: 'paddingLg',
} as const;

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
}: CardProps) {
  const cardStyles = [
    styles.base,
    styles[variant],
    padding !== 'none' && styles[paddingStyles[padding]],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.card,
  },
  elevated: {
    ...Shadow.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filled: {
    backgroundColor: Colors.neutral[100],
  },
  paddingSm: {
    padding: Spacing.sm,
  },
  paddingMd: {
    padding: Spacing.md,
  },
  paddingLg: {
    padding: Spacing.lg,
  },
});
