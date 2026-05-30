// =============================================================================
// Card — Container component with surface styling
// =============================================================================

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { radii, spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
  borderColor?: string;
}

export function Card({
  children,
  padding = spacing.md,
  style,
  borderColor,
}: CardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface1 + 'B3', // 70% opacity for glass effect without BlurView
          borderColor: borderColor || colors.borderSubtle,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
});
