// =============================================================================
// Divider — Horizontal line separator
// =============================================================================

import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing } from '../../theme/spacing';

interface DividerProps {
  /** Vertical margin above and below */
  spacing?: number;
  /** Custom color override */
  color?: string;
  /** Custom style */
  style?: ViewStyle;
}

export function Divider({
  spacing: dividerSpacing = spacing.md,
  color,
  style,
}: DividerProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: color ?? colors.borderSubtle,
          marginVertical: dividerSpacing,
        },
        style,
      ]}
    />
  );
}
