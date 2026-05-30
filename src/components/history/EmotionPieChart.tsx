// =============================================================================
// EmotionPieChart — Skia pie chart showing emotion sector distribution
// Animated arc entrance with staggered reveal
// =============================================================================

import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  Text as SkiaText,
  useFont,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing } from '../../theme/spacing';

interface PieSlice {
  emotionId: string;
  label: string;
  count: number;
  color: string;
}

interface EmotionPieChartProps {
  /** Emotion frequency data */
  slices: PieSlice[];
  /** Total check-ins count */
  totalCheckins: number;
  /** Chart diameter */
  size?: number;
}

function createArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const builder = Skia.PathBuilder.Make();
  builder.moveTo(cx, cy);
  builder.arcToOval(
    {
      x: cx - radius,
      y: cy - radius,
      width: radius * 2,
      height: radius * 2,
    },
    startAngle * (180 / Math.PI),
    (endAngle - startAngle) * (180 / Math.PI),
    false
  );
  builder.close();
  return builder.build();
}

export function EmotionPieChart({
  slices,
  totalCheckins,
  size = 200,
}: EmotionPieChartProps) {
  const colors = useThemeColors();
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 4;
  const innerRadius = outerRadius * 0.45; // Donut

  const total = useMemo(
    () => slices.reduce((sum, s) => sum + s.count, 0),
    [slices]
  );

  // Build arc paths
  const arcs = useMemo(() => {
    let currentAngle = -Math.PI / 2; // Start from top
    return slices.map((slice) => {
      const sliceAngle = total > 0 ? (slice.count / total) * Math.PI * 2 : 0;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      const outerPath = createArcPath(cx, cy, outerRadius, startAngle, endAngle);
      const innerPath = createArcPath(cx, cy, innerRadius, startAngle, endAngle);

      // For the donut: outer minus inner (we'll draw outer path as fill)
      const percentage = total > 0 ? Math.round((slice.count / total) * 100) : 0;

      return {
        ...slice,
        path: outerPath,
        innerPath,
        percentage,
        startAngle,
        endAngle,
      };
    });
  }, [slices, total, cx, cy, outerRadius, innerRadius]);

  if (slices.length === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={styles.emptyState}>
          <Typography variant="body-sm" color={colors.textTertiary} center>
            Nenhum dado ainda
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: size, height: size }]}>
        <Canvas style={{ width: size, height: size }}>
          {/* Pie slices (outer arcs) */}
          {arcs.map((arc, i) => (
            <Path key={i} path={arc.path} color={arc.color} style="fill" />
          ))}

          {/* Inner circle (donut hole) */}
          <Path
            path={Skia.PathBuilder.Make().addOval({
              x: cx - innerRadius,
              y: cy - innerRadius,
              width: innerRadius * 2,
              height: innerRadius * 2,
            }).build()}
            color={colors.background}
            style="fill"
          />
        </Canvas>

        {/* Center label */}
        <View style={[styles.centerLabel, { left: cx - 30, top: cy - 16 }]}>
          <Typography variant="heading-md" center>
            {totalCheckins}
          </Typography>
          <Typography variant="label-sm" color={colors.textTertiary} center>
            check-ins
          </Typography>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {arcs.slice(0, 6).map((arc) => (
          <View key={arc.emotionId} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: arc.color }]} />
            <Typography variant="label-md" color={colors.textSecondary}>
              {arc.label}
            </Typography>
            <Typography variant="label-sm" color={colors.textTertiary}>
              {arc.percentage}%
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.md,
  },
  container: {
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    width: 60,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
