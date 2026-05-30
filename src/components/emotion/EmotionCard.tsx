// =============================================================================
// EmotionCard — Card display for emotion in grid/list views
// =============================================================================

import React from 'react';
import { Pressable, View, StyleSheet, type ViewStyle } from 'react-native';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing, radii } from '../../theme/spacing';
import { getEmotionById } from '../../utils/emotion-math';

interface EmotionCardProps {
  /** Emotion ID */
  emotionId: string;
  /** Called when the card is pressed */
  onPress?: (emotionId: string) => void;
  /** Custom style */
  style?: ViewStyle;
}

export function EmotionCard({ emotionId, onPress, style }: EmotionCardProps) {
  const colors = useThemeColors();
  const emotion = getEmotionById(emotionId);
  if (!emotion) return null;

  const layerLabel =
    emotion.layer === 'primary'
      ? 'Primária'
      : emotion.layer === 'secondary'
        ? 'Secundária'
        : 'Terciária';

  return (
    <Pressable onPress={() => onPress?.(emotionId)}>
      <Card style={{ ...styles.card, ...style }} borderColor={emotion.color + '40'}>
        {/* Color accent bar */}
        <View style={[styles.accentBar, { backgroundColor: emotion.color }]} />

        <View style={styles.content}>
          <View style={styles.header}>
            <Typography variant="heading-sm" color={emotion.color}>
              {emotion.name}
            </Typography>
            <Badge
              label={layerLabel}
              color={emotion.color + '30'}
              textColor={emotion.color}
              size="sm"
            />
          </View>

          <Typography
            variant="body-sm"
            color={colors.textSecondary}
            numberOfLines={2}
          >
            {emotion.nameEn} · {emotion.evolutionaryFunction}
          </Typography>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
