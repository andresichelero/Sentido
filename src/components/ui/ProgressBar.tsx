// =============================================================================
// ProgressBar — Horizontal progress indicator
// =============================================================================

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { radii } from '../../theme/spacing';
import { duration } from '../../theme/motion';

interface ProgressBarProps {
  /** Progress value from 0 to 1 */
  progress: number;
  /** Bar color — defaults to activeEmotionColor */
  color?: string;
  /** Height of the bar */
  height?: number;
  /** Custom style */
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  color,
  height = 4,
  style,
}: ProgressBarProps) {
  const colors = useThemeColors();
  const barColor = color ?? colors.activeEmotionColor;

  const clampedProgress = useDerivedValue(() =>
    Math.max(0, Math.min(1, progress))
  );

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${clampedProgress.value * 100}%` as unknown as number,
  }));

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: colors.surface2 },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { height, backgroundColor: barColor },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radii.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radii.full,
  },
});
