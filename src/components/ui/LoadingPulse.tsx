// =============================================================================
// LoadingPulse — Pulsing loading indicator
// =============================================================================

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { radii } from '../../theme/spacing';
import { duration } from '../../theme/motion';

interface LoadingPulseProps {
  /** Size of the pulse circle */
  size?: number;
  /** Pulse color — defaults to activeEmotionColor */
  color?: string;
}

export function LoadingPulse({ size = 48, color }: LoadingPulseProps) {
  const colors = useThemeColors();
  const pulseColor = color ?? colors.activeEmotionColor;
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: duration.slow }),
        withTiming(1, { duration: duration.slow })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: pulseColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
