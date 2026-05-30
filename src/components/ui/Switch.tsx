import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useHaptics } from '../../hooks/useHaptics';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SWITCH_WIDTH = 50;
const SWITCH_HEIGHT = 30;
const CIRCLE_SIZE = 24;

export function Switch({ value, onValueChange, disabled }: SwitchProps) {
  const colors = useThemeColors();
  const { lightImpact } = useHaptics();
  const progress = useSharedValue(value ? 1 : 0);

  // Animate progress when value changes
  React.useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [colors.surface3, colors.accentDefault]
    );
    return { backgroundColor };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const translateX = progress.value * (SWITCH_WIDTH - CIRCLE_SIZE - 6);
    return {
      transform: [{ translateX }],
      backgroundColor: disabled ? colors.textDisabled : '#FFFFFF',
    };
  });

  const handlePress = () => {
    if (disabled) return;
    lightImpact();
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={[styles.container, disabled && { opacity: 0.5 }]}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    justifyContent: 'center',
  },
  track: {
    ...StyleSheet.absoluteFill,
    borderRadius: SWITCH_HEIGHT / 2,
    padding: 3,
  },
  thumb: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
