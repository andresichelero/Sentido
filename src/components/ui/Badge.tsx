// =============================================================================
// Badge — Inline tag/label with color
// =============================================================================

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { radii, spacing } from '../../theme/spacing';

interface BadgeProps {
  /** Badge label */
  label: string;
  /** Background color */
  color: string;
  /** Text color — defaults to white */
  textColor?: string;
  /** Small or default size */
  size?: 'sm' | 'md';
  /** Custom style */
  style?: ViewStyle;
}

export function Badge({
  label,
  color,
  textColor = '#FFFFFF',
  size = 'md',
  style,
}: BadgeProps) {
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: color,
          paddingHorizontal: isSmall ? spacing.xs : spacing.sm,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      <Typography
        variant={isSmall ? 'label-sm' : 'label-md'}
        color={textColor}
      >
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
});
