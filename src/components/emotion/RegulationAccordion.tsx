// =============================================================================
// RegulationAccordion — Collapsible regulation technique card
// Animated expand/collapse with Reanimated
// =============================================================================

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { radii, spacing } from '../../theme/spacing';
import { duration, easing } from '../../theme/motion';
import type { RegulationTechnique } from '../../types/emotion.types';

interface RegulationAccordionProps {
  technique: RegulationTechnique;
  /** Accent color for the timer badge */
  accentColor?: string;
}

/** Category icons for regulation techniques */
const CATEGORY_ICONS: Record<RegulationTechnique['category'], keyof typeof Feather.glyphMap> = {
  breathing: 'wind',
  grounding: 'anchor',
  movement: 'activity',
  cognitive: 'edit-3',
  somatic: 'heart',
  social: 'users',
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return `${seconds}s`;
  return `${mins} min`;
}

export function RegulationAccordion({
  technique,
  accentColor,
}: RegulationAccordionProps) {
  const colors = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useSharedValue(0);
  const chevronRotation = useSharedValue(0);

  const toggleExpand = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);

    // Animate content height (0 = collapsed, 1 = expanded)
    animatedHeight.value = withTiming(nextExpanded ? 1 : 0, {
      duration: duration.default,
      easing: easing.default,
    });
    chevronRotation.value = withTiming(nextExpanded ? 180 : 0, {
      duration: duration.fast,
    });
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: animatedHeight.value,
    maxHeight: animatedHeight.value * 600, // Large enough for all steps
    overflow: 'hidden' as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const iconName = CATEGORY_ICONS[technique.category];
  const accent = accentColor ?? colors.accentDefault;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface2,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <Pressable onPress={toggleExpand} style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: accent + '20' }]}>
          <Feather name={iconName} size={16} color={accent} />
        </View>
        <View style={styles.headerText}>
          <Typography variant="heading-sm">{technique.name}</Typography>
          <View style={styles.metaRow}>
            <Typography variant="label-sm" color={colors.textTertiary}>
              {formatDuration(technique.duration)}
            </Typography>
            {technique.hasTimer && (
              <View style={[styles.timerBadge, { backgroundColor: accent + '20' }]}>
                <Feather name="clock" size={10} color={accent} />
                <Typography variant="label-sm" color={accent}>
                  Timer
                </Typography>
              </View>
            )}
          </View>
        </View>
        <Animated.View style={chevronStyle}>
          <Feather name="chevron-down" size={20} color={colors.textTertiary} />
        </Animated.View>
      </Pressable>

      <Animated.View style={contentStyle}>
        <View style={styles.stepsContainer}>
          {technique.steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: accent + '15' }]}>
                <Typography variant="label-sm" color={accent}>
                  {index + 1}
                </Typography>
              </View>
              <Typography
                variant="body-sm"
                color={colors.textSecondary}
                style={styles.stepText}
              >
                {step}
              </Typography>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  stepsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepText: {
    flex: 1,
  },
});
