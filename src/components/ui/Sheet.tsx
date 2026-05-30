// =============================================================================
// Sheet — Custom bottom sheet using Reanimated + Gesture Handler
// No external libraries (per spec: no Gorhom)
// =============================================================================

import React, { useCallback, useEffect } from 'react';
import { Dimensions, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeColors } from '../../hooks/useThemeColors';
import { radii, spacing } from '../../theme/spacing';
import { spring as springConfig } from '../../theme/motion';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Snap points as percentages of screen height */
const SNAP_POINTS = {
  closed: 0,
  preview: 0.45,
  expanded: 0.92,
};

interface SheetProps {
  /** Whether the sheet is visible */
  isOpen: boolean;
  /** Called when the sheet is dismissed (dragged to closed) */
  onClose: () => void;
  /** Initial snap point */
  snapTo?: 'preview' | 'expanded';
  /** Custom style for the sheet container */
  style?: ViewStyle;
  children: React.ReactNode;
}

export function Sheet({
  isOpen,
  onClose,
  snapTo = 'preview',
  style,
  children,
}: SheetProps) {
  const colors = useThemeColors();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const snapToPosition = useCallback(
    (point: keyof typeof SNAP_POINTS) => {
      'worklet';
      const target = SCREEN_HEIGHT * (1 - SNAP_POINTS[point]);
      translateY.value = withSpring(target, springConfig.default);
      backdropOpacity.value = withTiming(point === 'closed' ? 0 : 0.5, {
        duration: 300,
      });
    },
    [translateY, backdropOpacity]
  );

  useEffect(() => {
    if (isOpen) {
      snapToPosition(snapTo);
    } else {
      snapToPosition('closed');
    }
  }, [isOpen, snapTo, snapToPosition]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(
        context.value + event.translationY,
        SCREEN_HEIGHT * (1 - SNAP_POINTS.expanded)
      );
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      const velocity = event.velocityY;

      // Determine snap point based on position and velocity
      const previewY = SCREEN_HEIGHT * (1 - SNAP_POINTS.preview);
      const expandedY = SCREEN_HEIGHT * (1 - SNAP_POINTS.expanded);

      if (velocity > 500 || currentY > SCREEN_HEIGHT * 0.75) {
        // Fast downward swipe or past 75% — close
        translateY.value = withSpring(SCREEN_HEIGHT, springConfig.default);
        backdropOpacity.value = withTiming(0, { duration: 300 });
        runOnJS(onClose)();
      } else if (velocity < -500 || currentY < previewY) {
        // Fast upward swipe or above preview — expand
        snapToPosition('expanded');
      } else {
        // Snap to preview
        snapToPosition('preview');
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' as const : 'none' as const,
  }));

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]} />
        <Animated.View
          style={[
            styles.sheet,
            {
              borderColor: colors.borderSubtle,
            },
            sheetStyle,
            style,
          ]}
        >
          <BlurView 
            intensity={40} 
            tint="dark" 
            style={[
              StyleSheet.absoluteFill, 
              { backgroundColor: colors.surface1 + 'CC' }
            ]} 
          />
          {/* Drag handle */}
          <GestureDetector gesture={panGesture}>
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.borderStrong },
                ]}
              />
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
    zIndex: 11,
    paddingHorizontal: spacing.md,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
