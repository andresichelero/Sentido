// =============================================================================
// Reflection Route Stub
// =============================================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../src/hooks/useThemeColors';

export default function ReflectionRoute() {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.textPrimary }}>Reflexão (Em Breve)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
