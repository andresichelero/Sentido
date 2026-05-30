// =============================================================================
// EmotionCard — Card used in the explore grid
// =============================================================================

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { radii, spacing } from '../../theme/spacing';
import type { EmotionNode } from '../../types/emotion.types';

interface EmotionCardProps {
  emotion: EmotionNode;
  onPress: () => void;
}

import { useSettingsStore } from '../../stores/useSettingsStore';

export function EmotionCard({ emotion, onPress }: EmotionCardProps) {
  const colors = useThemeColors();
  const language = useSettingsStore((s) => s.language);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface1,
          borderColor: emotion.color + '40', // 25% opacity
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.colorBar, { backgroundColor: emotion.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="heading-sm" numberOfLines={1}>
            {language === 'en-US' ? emotion.nameEn : emotion.name}
          </Typography>
          <View
            style={[
              styles.intensityDot,
              { backgroundColor: emotion.color + '40' },
            ]}
          >
            <View
              style={[
                styles.intensityDotInner,
                { backgroundColor: emotion.color },
              ]}
            />
          </View>
        </View>
        <Typography
          variant="body-sm"
          color={colors.textSecondary}
          numberOfLines={3}
          style={styles.description}
        >
          {emotion.evolutionaryFunction}
        </Typography>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    minHeight: 120,
  },
  colorBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: spacing.sm,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  intensityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  intensityDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  description: {
    fontStyle: 'italic',
  },
});
