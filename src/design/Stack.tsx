/**
 * Meeny Design System - Stack Components
 * Inspired by mohe_app patterns
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { spacing } from './token/theme';

type SpacingKey = keyof typeof spacing;

interface StackProps {
  children: React.ReactNode;
  gap?: SpacingKey | number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  flex?: number;
  padding?: SpacingKey | number;
  paddingHorizontal?: SpacingKey | number;
  paddingVertical?: SpacingKey | number;
  style?: ViewStyle;
}

const getSpacing = (value: SpacingKey | number | undefined): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  return spacing[value];
};

export function VStack({
  children,
  gap,
  align,
  justify,
  flex,
  padding,
  paddingHorizontal,
  paddingVertical,
  style,
}: StackProps) {
  return (
    <View
      style={[
        styles.vstack,
        {
          gap: getSpacing(gap),
          alignItems: align,
          justifyContent: justify,
          flex,
          padding: getSpacing(padding),
          paddingHorizontal: getSpacing(paddingHorizontal),
          paddingVertical: getSpacing(paddingVertical),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function HStack({
  children,
  gap,
  align = 'center',
  justify,
  flex,
  padding,
  paddingHorizontal,
  paddingVertical,
  style,
}: StackProps) {
  return (
    <View
      style={[
        styles.hstack,
        {
          gap: getSpacing(gap),
          alignItems: align,
          justifyContent: justify,
          flex,
          padding: getSpacing(padding),
          paddingHorizontal: getSpacing(paddingHorizontal),
          paddingVertical: getSpacing(paddingVertical),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Spacer() {
  return <View style={styles.spacer} />;
}

export function Divider({ color = '#27272a' }: { color?: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  vstack: {
    flexDirection: 'column',
  },
  hstack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
