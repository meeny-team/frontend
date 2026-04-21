/**
 * Meeny Design System - Typography Components
 */

import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors } from './token/colors';
import { typography } from './token/theme';

type ColorKey = keyof typeof colors;

interface TypoProps {
  children: React.ReactNode;
  color?: ColorKey | string;
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
  style?: TextStyle;
}

const getColor = (color: ColorKey | string | undefined): string => {
  if (!color) return colors.foreground;
  if (color in colors) {
    const value = colors[color as ColorKey];
    // Handle gradient arrays - return first color
    if (Array.isArray(value)) return value[0];
    return value as string;
  }
  return color;
};

export function Title({ children, color, align, numberOfLines, style }: TypoProps) {
  return (
    <Text
      style={[
        styles.title,
        { color: getColor(color), textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

export function Heading({ children, color, align, numberOfLines, style }: TypoProps) {
  return (
    <Text
      style={[
        styles.heading,
        { color: getColor(color), textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

export function Body({ children, color, align, numberOfLines, style }: TypoProps) {
  return (
    <Text
      style={[
        styles.body,
        { color: getColor(color), textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, color = 'muted', align, numberOfLines, style }: TypoProps) {
  return (
    <Text
      style={[
        styles.caption,
        { color: getColor(color), textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

export function Label({ children, color = 'tertiary', align, numberOfLines, style }: TypoProps) {
  return (
    <Text
      style={[
        styles.label,
        { color: getColor(color), textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

export function Mono({ children, color, align, numberOfLines, style }: TypoProps) {
  return (
    <Text
      style={[
        styles.mono,
        { color: getColor(color), textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.foreground,
    lineHeight: typography['2xl'] * typography.lineHeightTight,
  },
  heading: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.foreground,
    lineHeight: typography.lg * typography.lineHeightTight,
  },
  body: {
    fontSize: typography.base,
    fontWeight: typography.normal,
    color: colors.foreground,
    lineHeight: typography.base * typography.lineHeightNormal,
  },
  caption: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.muted,
    lineHeight: typography.sm * typography.lineHeightNormal,
  },
  label: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  mono: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    fontFamily: 'Menlo',
    color: colors.foreground,
  },
});
