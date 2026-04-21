/**
 * Meeny Design System - Button Component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from './token/colors';
import { radius, spacing, typography } from './token/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'brand' | 'kakao' | 'apple' | 'google';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled,
  loading,
  fullWidth,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color as string} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function getVariantStyles(variant: ButtonVariant): { container: ViewStyle; text: TextStyle } {
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: colors.brand },
        text: { color: colors.brandForeground },
      };
    case 'secondary':
      return {
        container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
        text: { color: colors.foreground },
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent' },
        text: { color: colors.foreground },
      };
    case 'brand':
      return {
        container: { backgroundColor: colors.brand },
        text: { color: colors.brandForeground },
      };
    case 'kakao':
      return {
        container: { backgroundColor: colors.kakao },
        text: { color: colors.kakaoForeground },
      };
    case 'apple':
      return {
        container: { backgroundColor: colors.apple },
        text: { color: colors.appleForeground },
      };
    case 'google':
      return {
        container: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        text: { color: colors.foreground },
      };
    default:
      return {
        container: { backgroundColor: colors.brand },
        text: { color: colors.brandForeground },
      };
  }
}

function getSizeStyles(size: ButtonSize): { container: ViewStyle; text: TextStyle } {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
        },
        text: { fontSize: typography.sm },
      };
    case 'md':
      return {
        container: {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
        },
        text: { fontSize: typography.base },
      };
    case 'lg':
      return {
        container: {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          borderRadius: radius.lg,
        },
        text: { fontSize: typography.lg },
      };
    default:
      return {
        container: {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
        },
        text: { fontSize: typography.base },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    fontWeight: typography.semibold,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
