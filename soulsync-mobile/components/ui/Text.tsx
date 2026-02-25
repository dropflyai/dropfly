import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native';
import { Colors, FontSize, FontWeight, LineHeight } from '@/constants/theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'error' | 'success';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export function Text({
  variant = 'body',
  weight,
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}: TextProps) {
  const textStyles = [
    styles.base,
    styles[variant],
    weight && { fontWeight: FontWeight[weight] },
    { color: colorMap[color] },
    { textAlign: align },
    style,
  ];

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
}

const colorMap = {
  primary: Colors.text.primary,
  secondary: Colors.text.secondary,
  muted: Colors.text.muted,
  inverse: Colors.text.inverse,
  error: Colors.error,
  success: Colors.success,
};

const styles = StyleSheet.create({
  base: {
    color: Colors.text.primary,
  },
  h1: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['4xl'] * LineHeight.tight,
  },
  h2: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['3xl'] * LineHeight.tight,
  },
  h3: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize['2xl'] * LineHeight.tight,
  },
  h4: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.xl * LineHeight.normal,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.normal,
    lineHeight: FontSize.base * LineHeight.relaxed,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.normal,
    lineHeight: FontSize.sm * LineHeight.relaxed,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.normal,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
});
