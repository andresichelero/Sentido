// =============================================================================
// ScreenHeader — Reusable screen header component
// =============================================================================

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing } from '../../theme/spacing';

interface ScreenHeaderProps {
  /** Title text */
  title?: string;
  /** Show back button */
  showBack?: boolean;
  /** Right side component */
  rightComponent?: React.ReactNode;
  /** Title variant */
  titleVariant?: 'display-md' | 'heading-lg' | 'heading-md';
}

export function ScreenHeader({
  title,
  showBack = false,
  rightComponent,
  titleVariant = 'heading-lg',
}: ScreenHeaderProps) {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>

      {title && (
        <Typography variant={titleVariant} style={styles.title}>
          {title}
        </Typography>
      )}

      <View style={styles.right}>{rightComponent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  left: {
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
});
