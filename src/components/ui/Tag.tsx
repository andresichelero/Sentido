// =============================================================================
// Tag — Horizontal scrollable tag chip
// =============================================================================

import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { radii, spacing } from '../../theme/spacing';

interface TagProps {
  /** Tag label */
  label: string;
  /** Whether this tag is currently selected/active */
  active?: boolean;
  /** Active color override */
  activeColor?: string;
  /** onPress handler */
  onPress?: () => void;
  /** Custom style */
  style?: ViewStyle;
}

export function Tag({
  label,
  active = false,
  activeColor,
  onPress,
  style,
}: TagProps) {
  const colors = useThemeColors();
  const bgColor = active
    ? (activeColor ?? colors.activeEmotionColor)
    : colors.surface2;
  const textColor = active ? '#FFFFFF' : colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderColor: active ? 'transparent' : colors.borderDefault,
        },
        style,
      ]}
    >
      <Typography variant="label-md" color={textColor}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
