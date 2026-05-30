// =============================================================================
// TimelineCard — Individual check-in in the history list
// Shows date, emotion badges, context, truncated note
// =============================================================================

import React, { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { EmotionBadge } from '../emotion/EmotionBadge';
import { Spacer } from '../ui/Spacer';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing } from '../../theme/spacing';
import { duration } from '../../theme/motion';
import type { Checkin, CheckinContext } from '../../types/checkin.types';

interface TimelineCardProps {
  checkin: Checkin;
  onDelete?: (id: string) => void;
}

const CONTEXT_LABELS: Record<CheckinContext, string> = {
  work: 'Trabalho',
  relationship: 'Relacionamento',
  health: 'Saúde',
  leisure: 'Lazer',
  unknown: 'Outro',
};

function formatCheckinDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const time = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) return `Hoje, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return `Ontem, ${time}`;

  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  }) + `, ${time}`;
}

export function TimelineCard({ checkin, onDelete }: TimelineCardProps) {
  const colors = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const expandHeight = useSharedValue(0);

  const toggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    expandHeight.value = withTiming(next ? 1 : 0, {
      duration: duration.default,
    });
  };

  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: expandHeight.value * 200,
    opacity: expandHeight.value,
    overflow: 'hidden' as const,
  }));

  const dominantColor =
    checkin.emotions[0]
      ? undefined // Will use EmotionBadge's own color
      : colors.textTertiary;

  return (
    <Card padding={spacing.sm + 4}>
      <Pressable onPress={toggleExpand}>
        {/* Header row: date + context */}
        <View style={styles.headerRow}>
          <Typography variant="label-md" color={colors.textTertiary}>
            {formatCheckinDate(checkin.checkedAt)}
          </Typography>
          {checkin.context && (
            <View
              style={[styles.contextBadge, { backgroundColor: colors.surface3 }]}
            >
              <Typography variant="label-sm" color={colors.textSecondary}>
                {CONTEXT_LABELS[checkin.context]}
              </Typography>
            </View>
          )}
        </View>

        <Spacer height={spacing.xs} />

        {/* Emotion badges */}
        <View style={styles.badgeRow}>
          {checkin.emotions.map((e) => (
            <EmotionBadge
              key={e.emotionId}
              emotionId={e.emotionId}
              selected
            />
          ))}
        </View>

        {/* Truncated note */}
        {checkin.note && (
          <>
            <Spacer height={spacing.xs} />
            <Typography
              variant="body-sm"
              color={colors.textSecondary}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {checkin.note}
            </Typography>
          </>
        )}

        {/* Expand indicator */}
        <View style={styles.expandIndicator}>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.textTertiary}
          />
        </View>
      </Pressable>

      {/* Expanded content */}
      <Animated.View style={expandStyle}>
        <View style={styles.expandedContent}>
          {/* Valence/Arousal info */}
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Typography variant="label-sm" color={colors.textTertiary}>
                VALÊNCIA
              </Typography>
              <Typography variant="heading-sm">
                {checkin.valenceScore > 0 ? '+' : ''}
                {checkin.valenceScore}
              </Typography>
            </View>
            <View style={styles.metric}>
              <Typography variant="label-sm" color={colors.textTertiary}>
                ATIVAÇÃO
              </Typography>
              <Typography variant="heading-sm">
                {checkin.arousalScore}
              </Typography>
            </View>
            <View style={styles.metric}>
              <Typography variant="label-sm" color={colors.textTertiary}>
                MODO
              </Typography>
              <Typography variant="heading-sm">
                {checkin.entryMode === 'wheel'
                  ? '🎯'
                  : checkin.entryMode === 'body'
                    ? '🧍'
                    : '📊'}
              </Typography>
            </View>
          </View>

          {/* Delete button */}
          {onDelete && (
            <Pressable
              onPress={() => onDelete(checkin.id)}
              style={[styles.deleteButton, { borderColor: colors.error }]}
            >
              <Feather name="trash-2" size={14} color={colors.error} />
              <Typography variant="label-md" color={colors.error}>
                Deletar
              </Typography>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contextBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  expandIndicator: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  expandedContent: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
    gap: 2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
});
