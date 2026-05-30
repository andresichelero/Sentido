// =============================================================================
// EmotionBadge — Compact inline emotion indicator
// =============================================================================

import React from 'react';
import { Pressable, View, StyleSheet, type ViewStyle } from 'react-native';
import { Typography } from '../ui/Typography';
import { radii, spacing } from '../../theme/spacing';
import { getEmotionById } from '../../utils/emotion-math';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface EmotionBadgeProps {
  /** Emotion ID to display */
  emotionId: string;
  /** Whether the badge is interactive */
  onPress?: (emotionId: string) => void;
  /** Selected state */
  selected?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

export function EmotionBadge({
  emotionId,
  onPress,
  selected = false,
  style,
}: EmotionBadgeProps) {
  const emotion = getEmotionById(emotionId);
  const language = useSettingsStore((s) => s.language);
  if (!emotion) return null;

  const content = (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: selected ? emotion.color : emotion.color + '20',
          borderColor: emotion.color,
          borderWidth: selected ? 0 : 1,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: emotion.color }]} />
      <Typography
        variant="label-md"
        color={selected ? '#FFFFFF' : emotion.color}
      >
        {language === 'en-US' ? emotion.nameEn : emotion.name}
      </Typography>
    </View>
  );

  if (onPress) {
    return (
      <Pressable 
        onPress={() => onPress(emotionId)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={emotion.name}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
