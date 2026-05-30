// =============================================================================
// IntensitySlider — Slider for emotion intensity (1-10)
// =============================================================================

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  clamp,
} from 'react-native-reanimated';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing, radii } from '../../theme/spacing';
import { spring as springConfig } from '../../theme/motion';

const SLIDER_WIDTH = 280;
const THUMB_SIZE = 28;

interface IntensitySliderProps {
  /** Current value (1-10) */
  value: number;
  /** Called when value changes */
  onChange: (value: number) => void;
  /** Accent color for the slider fill */
  color: string;
  /** Label above the slider */
  label?: string;
}

export function IntensitySlider({
  value,
  onChange,
  color,
  label = 'Intensidade',
}: IntensitySliderProps) {
  const colors = useThemeColors();
  const translateX = useSharedValue(((value - 1) / 9) * (SLIDER_WIDTH - THUMB_SIZE));

  const handleChange = useCallback(
    (newValue: number) => {
      onChange(newValue);
    },
    [onChange]
  );

  const context = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateX.value;
    })
    .onUpdate((event) => {
      const newX = clamp(
        context.value + event.translationX,
        0,
        SLIDER_WIDTH - THUMB_SIZE
      );
      translateX.value = newX;

      // Convert position to value 1-10
      const normalized = newX / (SLIDER_WIDTH - THUMB_SIZE);
      const newValue = Math.round(normalized * 9) + 1;
      runOnJS(handleChange)(newValue);
    })
    .onEnd(() => {
      // Snap to nearest integer position
      const normalized = translateX.value / (SLIDER_WIDTH - THUMB_SIZE);
      const snapped = Math.round(normalized * 9) / 9;
      translateX.value = withSpring(
        snapped * (SLIDER_WIDTH - THUMB_SIZE),
        springConfig.default
      );
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE / 2,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="label-lg" color={colors.textSecondary}>
          {label}
        </Typography>
        <Typography variant="heading-sm" color={color}>
          {value}
        </Typography>
      </View>

      <View style={styles.sliderContainer}>
        {/* Track */}
        <View
          style={[
            styles.track,
            { backgroundColor: colors.surface2, width: SLIDER_WIDTH },
          ]}
        >
          {/* Fill */}
          <Animated.View
            style={[styles.fill, { backgroundColor: color }, fillStyle]}
          />
        </View>

        {/* Thumb */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.thumb,
              {
                backgroundColor: color,
                borderColor: colors.surface1,
              },
              thumbStyle,
            ]}
          />
        </GestureDetector>
      </View>

      {/* Scale labels */}
      <View style={styles.labels}>
        <Typography variant="label-sm" color={colors.textTertiary}>
          Sutil
        </Typography>
        <Typography variant="label-sm" color={colors.textTertiary}>
          Intenso
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderContainer: {
    height: THUMB_SIZE + 8,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    top: (THUMB_SIZE + 8 - THUMB_SIZE) / 2 - 3,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
