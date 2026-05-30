import React, { useEffect } from 'react';
import { Group } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface WheelIdleProps {
  cx: number;
  cy: number;
  delay?: number;
  children: React.ReactNode;
}

export const WheelIdle: React.FC<WheelIdleProps> = ({ cx, cy, delay = 0, children }) => {
  // Start slightly scaled down
  const breathScale = useSharedValue(0.98);

  useEffect(() => {
    // Oscillate between 0.98 and 1.02 smoothly
    breathScale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.02, {
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1, // infinite loop
        true // reverse on each iteration
      )
    );
  }, [breathScale]);

  const transform = useDerivedValue(() => {
    return [{ scale: breathScale.value }];
  });

  return (
    <Group origin={{ x: cx, y: cy }} transform={transform}>
      {children}
    </Group>
  );
};
