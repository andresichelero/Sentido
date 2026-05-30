// =============================================================================
// AuraBackground — Animated Mesh Gradient / Aurora Effect
// Skia powered fluid blur blobs reacting to emotion colors
// =============================================================================

import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  vec,
  BlurMask,
  Group,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { useAppStore } from '../../stores/useAppStore';

const { width, height } = Dimensions.get('window');

// Blobs start positions
const BLOB1_START = { x: width * 0.2, y: height * 0.3 };
const BLOB2_START = { x: width * 0.8, y: height * 0.4 };
const BLOB3_START = { x: width * 0.5, y: height * 0.6 };

export function AuraBackground() {
  const activeEmotionColor = useAppStore((s) => s.activeEmotionColor);
  const isDefault = activeEmotionColor === '#818CF8';

  // Float animations
  const t1 = useSharedValue(0);
  const t2 = useSharedValue(0);
  const t3 = useSharedValue(0);

  useEffect(() => {
    t1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    t2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    t3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 7000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [t1, t2, t3]);

  // Derived positions (drifting around)
  const cx1 = useDerivedValue(() => BLOB1_START.x + Math.sin(t1.value * Math.PI) * 60);
  const cy1 = useDerivedValue(() => BLOB1_START.y + Math.cos(t1.value * Math.PI) * 40);

  const cx2 = useDerivedValue(() => BLOB2_START.x - Math.cos(t2.value * Math.PI) * 70);
  const cy2 = useDerivedValue(() => BLOB2_START.y + Math.sin(t2.value * Math.PI) * 50);

  const cx3 = useDerivedValue(() => BLOB3_START.x + Math.sin(t3.value * Math.PI) * 80);
  const cy3 = useDerivedValue(() => BLOB3_START.y - Math.cos(t3.value * Math.PI) * 60);

  // Colors
  const color1 = useDerivedValue(() => isDefault ? '#4285f460' : activeEmotionColor + '70');
  const color2 = useDerivedValue(() => isDefault ? '#9b72cb60' : activeEmotionColor + '40');
  const color3 = useDerivedValue(() => isDefault ? '#12b5cb60' : activeEmotionColor + '55');

  return (
    <View style={styles.container} pointerEvents="none">
      <Canvas style={styles.canvas}>
        <Group blendMode="screen">
          <Circle cx={cx1} cy={cy1} r={width * 0.45} color={color1}>
            <BlurMask blur={80} style="normal" />
          </Circle>
          
          <Circle cx={cx2} cy={cy2} r={width * 0.55} color={color2}>
            <BlurMask blur={100} style="normal" />
          </Circle>
          
          <Circle cx={cx3} cy={cy3} r={width * 0.40} color={color3}>
            <BlurMask blur={70} style="normal" />
          </Circle>
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
});
