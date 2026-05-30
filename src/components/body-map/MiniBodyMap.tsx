// =============================================================================
// MiniBodyMap — Simplified non-interactive body silhouette (output mode)
// Used inside EmotionSheet to show "Onde você sente" (where you feel it)
// Draws a programmatic Skia silhouette highlighting active body regions
// Full interactive BodyMapCanvas with SVG will be built in FASE 6
// =============================================================================

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Group, Path, Skia, RoundedRect, Circle, Oval } from '@shopify/react-native-skia';
import type { BodyRegionId } from '../../types/emotion.types';
import { useThemeColors } from '../../hooks/useThemeColors';

interface MiniBodyMapProps {
  /** Body regions to highlight with the emotion color */
  activeRegions: BodyRegionId[];
  /** Deactivated body regions (shown in cool blue) */
  deactivatedRegions?: BodyRegionId[];
  /** Emotion color for highlighting */
  accentColor: string;
  /** Total height of the component */
  height?: number;
}

// Map body regions to approximate rectangles on a normalized silhouette
// Coordinates are normalized to a 100x200 canvas (width x height)
// These are rough approximations for the mini preview
interface RegionBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const REGION_BOXES: Partial<Record<BodyRegionId, RegionBox>> = {
  'head': { x: 38, y: 2, w: 24, h: 18 },
  'face-upper': { x: 40, y: 6, w: 20, h: 8 },
  'face-lower': { x: 41, y: 14, w: 18, h: 6 },
  'neck-throat': { x: 43, y: 20, w: 14, h: 6 },
  'chest-upper': { x: 32, y: 28, w: 36, h: 16 },
  'chest-lower': { x: 34, y: 44, w: 32, h: 10 },
  'left-shoulder': { x: 22, y: 28, w: 12, h: 8 },
  'right-shoulder': { x: 66, y: 28, w: 12, h: 8 },
  'left-upper-arm': { x: 16, y: 36, w: 10, h: 18 },
  'right-upper-arm': { x: 74, y: 36, w: 10, h: 18 },
  'left-forearm': { x: 12, y: 54, w: 10, h: 18 },
  'right-forearm': { x: 78, y: 54, w: 10, h: 18 },
  'left-hand': { x: 8, y: 72, w: 10, h: 10 },
  'right-hand': { x: 82, y: 72, w: 10, h: 10 },
  'stomach': { x: 36, y: 54, w: 28, h: 12 },
  'abdomen': { x: 37, y: 66, w: 26, h: 10 },
  'upper-back': { x: 33, y: 30, w: 34, h: 14 },
  'lower-back': { x: 35, y: 56, w: 30, h: 10 },
  'hips': { x: 34, y: 76, w: 32, h: 10 },
  'genitals': { x: 42, y: 80, w: 16, h: 8 },
  'left-thigh': { x: 32, y: 88, w: 16, h: 24 },
  'right-thigh': { x: 52, y: 88, w: 16, h: 24 },
  'left-knee': { x: 33, y: 112, w: 14, h: 10 },
  'right-knee': { x: 53, y: 112, w: 14, h: 10 },
  'left-lower-leg': { x: 34, y: 122, w: 12, h: 24 },
  'right-lower-leg': { x: 54, y: 122, w: 12, h: 24 },
  'left-foot': { x: 32, y: 146, w: 14, h: 8 },
  'right-foot': { x: 54, y: 146, w: 14, h: 8 },
};

/**
 * Build a simple Skia path for a human silhouette outline.
 * This is a minimal programmatic shape — the full artístic SVG comes in FASE 6.
 */
function buildSilhouettePath(scaleX: number, scaleY: number) {
  const s = (x: number, y: number) => ({ x: x * scaleX, y: y * scaleY });

  const builder = Skia.PathBuilder.Make();
  
  // Head (ellipse approximation using bezier curves)
  const headCx = 50 * scaleX;
  const headCy = 10 * scaleY;
  const headRx = 11 * scaleX;
  const headRy = 10 * scaleY;
  builder.addOval({
    x: headCx - headRx,
    y: headCy - headRy,
    width: headRx * 2,
    height: headRy * 2,
  });

  // Neck
  builder.moveTo(s(44, 20).x, s(44, 20).y);
  builder.lineTo(s(44, 26).x, s(44, 26).y);
  builder.lineTo(s(56, 26).x, s(56, 26).y);
  builder.lineTo(s(56, 20).x, s(56, 20).y);

  // Torso
  builder.moveTo(s(44, 26).x, s(44, 26).y);
  // Left shoulder outward
  builder.lineTo(s(24, 30).x, s(24, 30).y);
  // Left arm
  builder.lineTo(s(18, 38).x, s(18, 38).y);
  builder.lineTo(s(14, 56).x, s(14, 56).y);
  builder.lineTo(s(10, 74).x, s(10, 74).y);
  // Left hand
  builder.lineTo(s(8, 80).x, s(8, 80).y);
  builder.lineTo(s(16, 80).x, s(16, 80).y);
  // Back up arm
  builder.lineTo(s(20, 72).x, s(20, 72).y);
  builder.lineTo(s(24, 56).x, s(24, 56).y);
  builder.lineTo(s(28, 42).x, s(28, 42).y);
  // Torso side
  builder.lineTo(s(32, 54).x, s(32, 54).y);
  builder.lineTo(s(32, 76).x, s(32, 76).y);
  // Hip
  builder.lineTo(s(34, 86).x, s(34, 86).y);
  // Left leg
  builder.lineTo(s(32, 112).x, s(32, 112).y);
  builder.lineTo(s(33, 130).x, s(33, 130).y);
  builder.lineTo(s(30, 148).x, s(30, 148).y);
  // Left foot
  builder.lineTo(s(28, 154).x, s(28, 154).y);
  builder.lineTo(s(46, 154).x, s(46, 154).y);
  builder.lineTo(s(46, 148).x, s(46, 148).y);
  builder.lineTo(s(44, 130).x, s(44, 130).y);
  // Crotch
  builder.lineTo(s(48, 92).x, s(48, 92).y);
  builder.lineTo(s(52, 92).x, s(52, 92).y);
  // Right leg
  builder.lineTo(s(56, 130).x, s(56, 130).y);
  builder.lineTo(s(54, 148).x, s(54, 148).y);
  // Right foot
  builder.lineTo(s(54, 154).x, s(54, 154).y);
  builder.lineTo(s(72, 154).x, s(72, 154).y);
  builder.lineTo(s(70, 148).x, s(70, 148).y);
  builder.lineTo(s(67, 130).x, s(67, 130).y);
  builder.lineTo(s(68, 112).x, s(68, 112).y);
  // Right hip
  builder.lineTo(s(66, 86).x, s(66, 86).y);
  builder.lineTo(s(68, 76).x, s(68, 76).y);
  builder.lineTo(s(68, 54).x, s(68, 54).y);
  // Right arm inner
  builder.lineTo(s(72, 42).x, s(72, 42).y);
  builder.lineTo(s(76, 56).x, s(76, 56).y);
  builder.lineTo(s(80, 72).x, s(80, 72).y);
  // Right hand
  builder.lineTo(s(84, 80).x, s(84, 80).y);
  builder.lineTo(s(92, 80).x, s(92, 80).y);
  builder.lineTo(s(90, 74).x, s(90, 74).y);
  // Right arm outer
  builder.lineTo(s(86, 56).x, s(86, 56).y);
  builder.lineTo(s(82, 38).x, s(82, 38).y);
  builder.lineTo(s(76, 30).x, s(76, 30).y);
  // Right shoulder
  builder.lineTo(s(56, 26).x, s(56, 26).y);
  builder.close();

  return builder.build();
}

export function MiniBodyMap({
  activeRegions,
  deactivatedRegions = [],
  accentColor,
  height = 120,
}: MiniBodyMapProps) {
  const colors = useThemeColors();
  
  // Scale the 100x160 virtual canvas into the available height
  const canvasHeight = height;
  const canvasWidth = height * (100 / 160);
  const scaleX = canvasWidth / 100;
  const scaleY = canvasHeight / 160;

  const silhouettePath = useMemo(
    () => buildSilhouettePath(scaleX, scaleY),
    [scaleX, scaleY]
  );

  const activeSet = useMemo(() => new Set(activeRegions), [activeRegions]);
  const deactivatedSet = useMemo(() => new Set(deactivatedRegions), [deactivatedRegions]);

  return (
    <View style={[styles.container, { height: canvasHeight }]}>
      <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
        {/* Base silhouette outline */}
        <Path
          path={silhouettePath}
          color={colors.surface3}
          style="fill"
        />
        <Path
          path={silhouettePath}
          color={colors.borderDefault}
          style="stroke"
          strokeWidth={1}
        />

        {/* Active region highlights */}
        {Object.entries(REGION_BOXES).map(([regionId, box]) => {
          if (!box) return null;
          const isActive = activeSet.has(regionId as BodyRegionId);
          const isDeactivated = deactivatedSet.has(regionId as BodyRegionId);
          if (!isActive && !isDeactivated) return null;

          const fillColor = isActive
            ? accentColor + '60' // 37% opacity
            : '#2563EB40'; // cool blue for deactivated

          return (
            <RoundedRect
              key={regionId}
              x={box.x * scaleX}
              y={box.y * scaleY}
              width={box.w * scaleX}
              height={box.h * scaleY}
              r={2 * scaleX}
              color={fillColor}
            />
          );
        })}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
