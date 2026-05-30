// =============================================================================
// SafeArea — Safe area wrapper with theme background
// =============================================================================

import React from 'react';
import { type ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SafeAreaProps extends ViewProps {
  /** Edge insets to apply */
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  children: React.ReactNode;
}

export function SafeArea({
  edges = ['top', 'bottom'],
  style,
  children,
  ...rest
}: SafeAreaProps) {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.base, { backgroundColor: 'transparent' }, style]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});
