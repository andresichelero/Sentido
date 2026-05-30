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
import { Canvas, Path, Skia, RoundedRect } from '@shopify/react-native-skia';
import { Feather } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing, radii } from '../../theme/spacing';
import { duration } from '../../theme/motion';
import type { BodyRegionId, BodySide } from '../../types/emotion.types';

// ─── Types ───────────────────────────────────────────────────────────────────

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
  /** Constrained height (output mode uses 120px, input mode uses ~65% screen) */
  height?: number;
}

// ─── Region Box Definitions ─────────────────────────────────────────────────
// Normalized to a 200×400 canvas for higher resolution than MiniBodyMap

interface RegionBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FRONT_REGIONS: Record<string, RegionBox> = {
  'head':             { x: 76, y: 4,   w: 48, h: 36 },
  'face-upper':       { x: 80, y: 12,  w: 40, h: 16 },
  'face-lower':       { x: 82, y: 28,  w: 36, h: 12 },
  'neck-throat':      { x: 86, y: 40,  w: 28, h: 12 },
  'chest-upper':      { x: 64, y: 56,  w: 72, h: 32 },
  'chest-lower':      { x: 68, y: 88,  w: 64, h: 20 },
  'left-shoulder':    { x: 44, y: 56,  w: 24, h: 16 },
  'right-shoulder':   { x: 132, y: 56, w: 24, h: 16 },
  'left-upper-arm':   { x: 32, y: 72,  w: 20, h: 36 },
  'right-upper-arm':  { x: 148, y: 72, w: 20, h: 36 },
  'left-forearm':     { x: 24, y: 108, w: 20, h: 36 },
  'right-forearm':    { x: 156, y: 108, w: 20, h: 36 },
  'left-hand':        { x: 16, y: 144, w: 20, h: 20 },
  'right-hand':       { x: 164, y: 144, w: 20, h: 20 },
  'stomach':          { x: 72, y: 108, w: 56, h: 24 },
  'abdomen':          { x: 74, y: 132, w: 52, h: 20 },
  'hips':             { x: 68, y: 152, w: 64, h: 20 },
  'genitals':         { x: 84, y: 160, w: 32, h: 16 },
  'left-thigh':       { x: 64, y: 176, w: 32, h: 48 },
  'right-thigh':      { x: 104, y: 176, w: 32, h: 48 },
  'left-knee':        { x: 66, y: 224, w: 28, h: 20 },
  'right-knee':       { x: 106, y: 224, w: 28, h: 20 },
  'left-lower-leg':   { x: 68, y: 244, w: 24, h: 48 },
  'right-lower-leg':  { x: 108, y: 244, w: 24, h: 48 },
  'left-foot':        { x: 64, y: 292, w: 28, h: 16 },
  'right-foot':       { x: 108, y: 292, w: 28, h: 16 },
};

const BACK_REGIONS: Record<string, RegionBox> = {
  'head':             { x: 76, y: 4,   w: 48, h: 36 },
  'neck-throat':      { x: 86, y: 40,  w: 28, h: 12 },
  'upper-back':       { x: 64, y: 56,  w: 72, h: 40 },
  'lower-back':       { x: 70, y: 96,  w: 60, h: 36 },
  'left-shoulder':    { x: 44, y: 56,  w: 24, h: 16 },
  'right-shoulder':   { x: 132, y: 56, w: 24, h: 16 },
  'left-upper-arm':   { x: 32, y: 72,  w: 20, h: 36 },
  'right-upper-arm':  { x: 148, y: 72, w: 20, h: 36 },
  'left-forearm':     { x: 24, y: 108, w: 20, h: 36 },
  'right-forearm':    { x: 156, y: 108, w: 20, h: 36 },
  'left-hand':        { x: 16, y: 144, w: 20, h: 20 },
  'right-hand':       { x: 164, y: 144, w: 20, h: 20 },
  'hips':             { x: 68, y: 132, w: 64, h: 24 },
  'left-thigh':       { x: 64, y: 176, w: 32, h: 48 },
  'right-thigh':      { x: 104, y: 176, w: 32, h: 48 },
  'left-knee':        { x: 66, y: 224, w: 28, h: 20 },
  'right-knee':       { x: 106, y: 224, w: 28, h: 20 },
  'left-lower-leg':   { x: 68, y: 244, w: 24, h: 48 },
  'right-lower-leg':  { x: 108, y: 244, w: 24, h: 48 },
  'left-foot':        { x: 64, y: 292, w: 28, h: 16 },
  'right-foot':       { x: 108, y: 292, w: 28, h: 16 },
};

// ─── Silhouette Path Builder ─────────────────────────────────────────────────

function buildSilhouette(sx: number, sy: number) {
  const p = (x: number, y: number) => ({ x: x * sx, y: y * sy });
  const builder = Skia.PathBuilder.Make();

  // Head oval
  builder.addOval({
    x: p(76, 4).x,
    y: p(76, 4).y,
    width: 48 * sx,
    height: 36 * sy,
  });

  // Body path (simplified)
  builder.moveTo(p(88, 40).x, p(88, 40).y);
  builder.lineTo(p(112, 40).x, p(112, 40).y);
  // Neck to shoulders
  builder.lineTo(p(112, 52).x, p(112, 52).y);
  builder.lineTo(p(156, 60).x, p(156, 60).y);
  // Right arm
  builder.lineTo(p(168, 72).x, p(168, 72).y);
  builder.lineTo(p(176, 108).x, p(176, 108).y);
  builder.lineTo(p(184, 144).x, p(184, 144).y);
  builder.lineTo(p(184, 164).x, p(184, 164).y);
  builder.lineTo(p(164, 164).x, p(164, 164).y);
  builder.lineTo(p(156, 144).x, p(156, 144).y);
  builder.lineTo(p(148, 108).x, p(148, 108).y);
  builder.lineTo(p(140, 80).x, p(140, 80).y);
  // Right torso
  builder.lineTo(p(136, 108).x, p(136, 108).y);
  builder.lineTo(p(136, 152).x, p(136, 152).y);
  builder.lineTo(p(136, 176).x, p(136, 176).y);
  // Right leg
  builder.lineTo(p(134, 224).x, p(134, 224).y);
  builder.lineTo(p(132, 244).x, p(132, 244).y);
  builder.lineTo(p(136, 292).x, p(136, 292).y);
  builder.lineTo(p(136, 308).x, p(136, 308).y);
  builder.lineTo(p(108, 308).x, p(108, 308).y);
  builder.lineTo(p(108, 292).x, p(108, 292).y);
  builder.lineTo(p(106, 244).x, p(106, 244).y);
  // Crotch
  builder.lineTo(p(104, 184).x, p(104, 184).y);
  builder.lineTo(p(96, 184).x, p(96, 184).y);
  // Left leg
  builder.lineTo(p(94, 244).x, p(94, 244).y);
  builder.lineTo(p(92, 292).x, p(92, 292).y);
  builder.lineTo(p(92, 308).x, p(92, 308).y);
  builder.lineTo(p(64, 308).x, p(64, 308).y);
  builder.lineTo(p(64, 292).x, p(64, 292).y);
  builder.lineTo(p(68, 244).x, p(68, 244).y);
  builder.lineTo(p(66, 224).x, p(66, 224).y);
  // Left hip up
  builder.lineTo(p(64, 176).x, p(64, 176).y);
  builder.lineTo(p(64, 152).x, p(64, 152).y);
  builder.lineTo(p(64, 108).x, p(64, 108).y);
  builder.lineTo(p(60, 80).x, p(60, 80).y);
  // Left arm
  builder.lineTo(p(52, 108).x, p(52, 108).y);
  builder.lineTo(p(44, 144).x, p(44, 144).y);
  builder.lineTo(p(36, 164).x, p(36, 164).y);
  builder.lineTo(p(16, 164).x, p(16, 164).y);
  builder.lineTo(p(16, 144).x, p(16, 144).y);
  builder.lineTo(p(24, 108).x, p(24, 108).y);
  builder.lineTo(p(32, 72).x, p(32, 72).y);
  builder.lineTo(p(44, 60).x, p(44, 60).y);
  // Left shoulder to neck
  builder.lineTo(p(88, 52).x, p(88, 52).y);
  builder.close();

  return builder.build();
}

// ─── Touch hit-test ──────────────────────────────────────────────────────────

function hitTestRegion(
  touchX: number,
  touchY: number,
  regions: Record<string, RegionBox>,
  sx: number,
  sy: number
): BodyRegionId | null {
  for (const [regionId, box] of Object.entries(regions)) {
    const rx = box.x * sx;
    const ry = box.y * sy;
    const rw = box.w * sx;
    const rh = box.h * sy;

    if (
      touchX >= rx &&
      touchX <= rx + rw &&
      touchY >= ry &&
      touchY <= ry + rh
    ) {
      return regionId as BodyRegionId;
    }
  }
  return null;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BodyMapCanvas({
  mode,
  activeRegions,
  deactivatedRegions = [],
  accentColor = '#818CF8',
  onRegionPress,
  height: propHeight,
}: BodyMapCanvasProps) {
  const colors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const [side, setSide] = useState<BodySide>('front');

  // Flip animation
  const flipRotation = useSharedValue(0);
  const flipOpacity = useSharedValue(1);

  const canvasHeight = propHeight ?? screenWidth * 1.5;
  const canvasWidth = propHeight
    ? propHeight * (200 / 320)
    : screenWidth - spacing.md * 2;

  const sx = canvasWidth / 200;
  const sy = canvasHeight / 320;

  const silhouettePath = useMemo(
    () => buildSilhouette(sx, sy),
    [sx, sy]
  );

  const currentRegions = side === 'front' ? FRONT_REGIONS : BACK_REGIONS;

  const activeSet = useMemo(() => new Set(activeRegions), [activeRegions]);
  const deactivatedSet = useMemo(
    () => new Set(deactivatedRegions),
    [deactivatedRegions]
  );

  const handleFlip = useCallback(() => {
    flipOpacity.value = withTiming(0, { duration: duration.fast }, () => {
      runOnJS(setSide)(side === 'front' ? 'back' : 'front');
      flipOpacity.value = withTiming(1, { duration: duration.fast });
    });
  }, [side, flipOpacity]);

  const flipStyle = useAnimatedStyle(() => ({
    opacity: flipOpacity.value,
  }));

  const handleCanvasTouch = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      if (mode !== 'input' || !onRegionPress) return;

      const hit = hitTestRegion(
        e.nativeEvent.locationX,
        e.nativeEvent.locationY,
        currentRegions,
        sx,
        sy
      );
      if (hit) {
        onRegionPress(hit);
      }
    },
    [mode, onRegionPress, currentRegions, sx, sy]
  );

  return (
    <View style={[styles.container, { height: canvasHeight }]}>
      <Animated.View style={[styles.canvasWrapper, flipStyle]}>
        <Pressable onPress={handleCanvasTouch} disabled={mode !== 'input'}>
          <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
            {/* Base silhouette */}
            <Path path={silhouettePath} color={colors.surface3} style="fill" />
            <Path
              path={silhouettePath}
              color={colors.borderDefault}
              style="stroke"
              strokeWidth={1.5}
            />

            {/* Region overlays */}
            {Object.entries(currentRegions).map(([regionId, box]) => {
              const isActive = activeSet.has(regionId as BodyRegionId);
              const isDeactivated = deactivatedSet.has(regionId as BodyRegionId);
              if (!isActive && !isDeactivated) return null;

              const fillColor = isActive
                ? accentColor + '80'
                : '#2563EB4D';

              return (
                <RoundedRect
                  key={regionId}
                  x={box.x * sx}
                  y={box.y * sy}
                  width={box.w * sx}
                  height={box.h * sy}
                  r={3 * sx}
                  color={fillColor}
                />
              );
            })}
          </Canvas>
        </Pressable>
      </Animated.View>

      {/* Side label */}
      <View style={styles.sideLabel}>
        <Typography variant="label-sm" color={colors.textTertiary}>
          {side === 'front' ? 'FRENTE' : 'COSTAS'}
        </Typography>
      </View>

      {/* Flip button */}
      {mode === 'input' && (
        <Pressable
          onPress={handleFlip}
          style={[styles.flipButton, { backgroundColor: colors.surface2 }]}
        >
          <Feather name="rotate-cw" size={18} color={colors.textSecondary} />
        </Pressable>
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
  flipButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
