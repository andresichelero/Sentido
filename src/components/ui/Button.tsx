// =============================================================================
// Button — Primary interactive element
// =============================================================================

import React from 'react';
import {
  Pressable,
  type PressableProps,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Typography } from './Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useHaptics } from '../../hooks/useHaptics';
import { radii, spacing } from '../../theme/spacing';
import { spring } from '../../theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  /** Button label text */
  label: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size */
  size?: ButtonSize;
  /** Full width */
  fullWidth?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = (): string => {
    if (disabled) return colors.surface3;
    switch (variant) {
      case 'primary':
        return colors.activeEmotionColor;
      case 'secondary':
        return colors.surface2;
      case 'ghost':
        return 'transparent';
      case 'danger':
        return colors.error;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.textDisabled;
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.textPrimary;
      case 'ghost':
        return colors.activeEmotionColor;
      case 'danger':
        return '#FFFFFF';
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minHeight: 36 };
      case 'md':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, minHeight: 48 };
      case 'lg':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 56 };
    }
  };

  const textVariant = size === 'sm' ? 'body-sm' : size === 'lg' ? 'heading-sm' : 'body-md';

  return (
    <AnimatedPressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={label}
      onPressIn={() => {
        scale.value = withSpring(0.92, spring.liquid);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring.liquid);
      }}
      style={[
        styles.base,
        getSizeStyles(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'ghost' ? colors.borderDefault : 'transparent',
          borderWidth: variant === 'ghost' ? 1 : 0,
          width: fullWidth ? '100%' : undefined,
        },
        animatedStyle,
        style,
      ]}
      {...rest}
    >
      <Typography variant={textVariant} color={getTextColor()}>
        {label}
      </Typography>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
