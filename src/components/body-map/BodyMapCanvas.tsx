// =============================================================================
// BodyMapCanvas — Interactive full-size body map with Skia
// Two modes: Input (touchable regions) and Output (heatmap display)
// Supports front/back flip with animated transition
// =============================================================================

import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Canvas, Path, Skia, Group, BlurMask } from '@shopify/react-native-skia';
import { Feather } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing, radii } from '../../theme/spacing';
import { duration } from '../../theme/motion';
import type { BodyRegionId, BodySide } from '../../types/emotion.types';
import { BODY_PATHS } from './BodyPaths';

interface BodyMapCanvasProps {
  /** 'input' = user touches regions; 'output' = display-only heatmap */
  mode: 'input' | 'output';
  /** Currently selected/active regions (input mode: toggled; output mode: emotion's bodyRegions) */
  activeRegions: BodyRegionId[];
  /** Deactivated regions (output mode only) */
  deactivatedRegions?: BodyRegionId[];
  /** Accent color for highlights */
  accentColor?: string;
  /** Callback when a region is tapped (input mode) */
  onRegionPress?: (regionId: BodyRegionId) => void;
  /** Callback to clear all active regions */
  onClearRegions?: () => void;
  /** Constrained height (output mode uses 120px, input mode uses ~65% screen) */
  height?: number;
}

const RAW_HEIGHT = 93;
const RAW_WIDTH = 35;
const BACK_OFFSET_X = 37;

// Pre-parse all paths globally to avoid re-parsing
const PARSED_PATHS: Record<string, ReturnType<typeof Skia.Path.MakeFromSVGString>[]> = {};
for (const [region, paths] of Object.entries(BODY_PATHS)) {
  PARSED_PATHS[region] = paths.map(p => Skia.Path.MakeFromSVGString(p)).filter(Boolean);
}

export function BodyMapCanvas({
  mode,
  activeRegions,
  deactivatedRegions = [],
  accentColor = '#818CF8',
  onRegionPress,
  onClearRegions,
  height: propHeight,
}: BodyMapCanvasProps) {
  const colors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const [side, setSide] = useState<BodySide>('front');
  const [availableHeight, setAvailableHeight] = useState(propHeight ?? 400);

  // Flip animation
  const flipOpacity = useSharedValue(1);

  // Use available height (measured via onLayout) if propHeight is not provided
  const canvasHeight = propHeight ?? availableHeight;
  const scale = canvasHeight / RAW_HEIGHT;
  const canvasWidth = RAW_WIDTH * scale;

  const activeSet = useMemo(() => new Set(activeRegions), [activeRegions]);
  const deactivatedSet = useMemo(() => new Set(deactivatedRegions), [deactivatedRegions]);

  const handleFlip = useCallback(() => {
    flipOpacity.value = withTiming(0, { duration: duration.fast }, () => {
      runOnJS(setSide)(side === 'front' ? 'back' : 'front');
      flipOpacity.value = withTiming(1, { duration: duration.fast });
    });
  }, [side, flipOpacity]);

  const flipStyle = useAnimatedStyle(() => ({
    opacity: flipOpacity.value,
  }));

  // Hit testing
  const handleCanvasTouch = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      if (mode !== 'input' || !onRegionPress) return;

      const { locationX, locationY } = e.nativeEvent;
      
      // Convert touch coordinates back to raw SVG coordinates
      let rawX = locationX / scale;
      const rawY = locationY / scale;

      if (side === 'back') {
        rawX += BACK_OFFSET_X;
      }

      // Check which region contains the point
      let hitRegion: BodyRegionId | null = null;
      for (const [regionId, paths] of Object.entries(PARSED_PATHS)) {
        for (const path of paths) {
          if (path && path.contains(rawX, rawY)) {
            // Because our back paths and front paths are grouped under the same BodyRegionId,
            // we check if the rawX falls into the valid range for the current side
            const isBackPath = rawX >= 35; // Front X goes up to 35, Back starts at 37
            if ((side === 'front' && !isBackPath) || (side === 'back' && isBackPath)) {
              hitRegion = regionId as BodyRegionId;
              break;
            }
          }
        }
        if (hitRegion) break;
      }

      if (hitRegion) {
        onRegionPress(hitRegion);
      }
    },
    [mode, onRegionPress, scale, side]
  );

  return (
    <View 
      style={[styles.container, { height: propHeight ?? '100%' }]}
      onLayout={(e) => {
        if (!propHeight) {
          // Leave some padding so it doesn't touch the very edges if possible
          setAvailableHeight(e.nativeEvent.layout.height);
        }
      }}
    >
      <Animated.View style={[styles.canvasWrapper, flipStyle]}>
        <Pressable onPress={handleCanvasTouch} disabled={mode !== 'input'}>
          <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
            <Group
              transform={[
                { scale },
                { translateX: side === 'front' ? 0 : -BACK_OFFSET_X }
              ]}
            >
              {/* Draw Base Silhouette (Glass effect) */}
              {Object.entries(PARSED_PATHS).map(([regionId, paths]) => {
                return paths.map((path, index) => {
                  if (!path) return null;
                  
                  // Simple check if path belongs to current side based on its bounding box
                  const bounds = path.computeTightBounds();
                  const isBackPath = bounds.x >= 35;
                  if (side === 'front' && isBackPath) return null;
                  if (side === 'back' && !isBackPath) return null;

                  return (
                    <Path
                      key={`base-${regionId}-${index}`}
                      path={path}
                      color={colors.surface3}
                      style="fill"
                    />
                  );
                });
              })}

              {/* Draw Outline (Glass effect) */}
              {Object.entries(PARSED_PATHS).map(([regionId, paths]) => {
                return paths.map((path, index) => {
                  if (!path) return null;
                  const bounds = path.computeTightBounds();
                  const isBackPath = bounds.x >= 35;
                  if (side === 'front' && isBackPath) return null;
                  if (side === 'back' && !isBackPath) return null;

                  return (
                    <Path
                      key={`outline-${regionId}-${index}`}
                      path={path}
                      color={colors.borderDefault}
                      style="stroke"
                      strokeWidth={0.5 / scale} // Keep stroke thin despite scaling
                    />
                  );
                });
              })}

              {/* Draw Active Regions (Heatmap effect) */}
              {Object.entries(PARSED_PATHS).map(([regionId, paths]) => {
                const isActive = activeSet.has(regionId as BodyRegionId);
                const isDeactivated = deactivatedSet.has(regionId as BodyRegionId);
                if (!isActive && !isDeactivated) return null;

                return paths.map((path, index) => {
                  if (!path) return null;
                  const bounds = path.computeTightBounds();
                  const isBackPath = bounds.x >= 35;
                  if (side === 'front' && isBackPath) return null;
                  if (side === 'back' && !isBackPath) return null;

                  if (isDeactivated) {
                    return (
                      <Path
                        key={`deact-${regionId}-${index}`}
                        path={path}
                        color={'#2563EB66'}
                        style="fill"
                      />
                    );
                  }

                  return (
                    <Group key={`active-${regionId}-${index}`}>
                      {/* Aura Glow */}
                      <Path
                        path={path}
                        color={accentColor}
                        style="fill"
                      >
                        <BlurMask blur={5} style="normal" />
                      </Path>
                      
                      {/* White Core for high contrast against any background */}
                      <Path
                        path={path}
                        color="#FFFFFFCC" 
                        style="fill"
                      />
                      
                      {/* Sharp outline */}
                      <Path
                        path={path}
                        color="#FFFFFF"
                        style="stroke"
                        strokeWidth={0.5 / scale}
                      />
                    </Group>
                  );
                });
              })}
            </Group>
          </Canvas>
        </Pressable>
      </Animated.View>

      {/* Side label */}
      <View style={styles.sideLabel}>
        <Typography variant="label-sm" color={colors.textTertiary}>
          {side === 'front' ? 'FRENTE' : 'COSTAS'}
        </Typography>
      </View>

      {/* Floating Actions */}
      {mode === 'input' && (
        <>
          {onClearRegions && activeRegions.length > 0 && (
            <Pressable
              onPress={onClearRegions}
              style={[styles.floatingButton, styles.clearButton, { backgroundColor: colors.surface2 }]}
            >
              <Feather name="trash-2" size={18} color={colors.error || colors.textSecondary} />
            </Pressable>
          )}
          
          <Pressable
            onPress={handleFlip}
            style={[styles.floatingButton, styles.flipButton, { backgroundColor: colors.surface2 }]}
          >
            <Feather name="rotate-cw" size={18} color={colors.textSecondary} />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  canvasWrapper: {
    alignItems: 'center',
  },
  sideLabel: {
    position: 'absolute',
    top: spacing.xs,
    alignSelf: 'center',
  },
  clearButton: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
  },
  flipButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
