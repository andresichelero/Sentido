// =============================================================================
// ValenceArousalPlot — Skia scatter plot of valence × arousal
// Each point = one check-in, colored by dominant emotion
// Spec section 10.5
// =============================================================================

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Circle, Line, vec } from '@shopify/react-native-skia';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing } from '../../theme/spacing';

interface ScatterPoint {
  id: string;
  /** -1 to +1 */
  valence: number;
  /** 0 to 1 */
  arousal: number;
  /** Hex color */
  color: string;
  /** Number of emotions in this check-in (maps to dot size) */
  emotionCount: number;
}

interface ValenceArousalPlotProps {
  points: ScatterPoint[];
  size?: number;
}

const PADDING = 24;
const QUADRANT_LABELS = [
  { label: 'Alta Energia\nPositiva', x: 0.75, y: 0.15 },
  { label: 'Alta Energia\nNegativa', x: 0.25, y: 0.15 },
  { label: 'Baixa Energia\nPositiva', x: 0.75, y: 0.85 },
  { label: 'Baixa Energia\nNegativa', x: 0.25, y: 0.85 },
];

export function ValenceArousalPlot({
  points,
  size = 280,
}: ValenceArousalPlotProps) {
  const colors = useThemeColors();
  const plotSize = size - PADDING * 2;

  // Map data coordinates to canvas coordinates
  const toCanvasX = (valence: number) =>
    PADDING + ((valence + 1) / 2) * plotSize; // -1..+1 → 0..plotSize
  const toCanvasY = (arousal: number) =>
    PADDING + (1 - arousal) * plotSize; // 0..1 → plotSize..0 (flip Y)

  const centerX = toCanvasX(0);
  const centerY = toCanvasY(0.5);

  // Dot size: min 6, max 14, scaled by emotion count
  const getDotRadius = (count: number) =>
    Math.max(3, Math.min(7, 3 + count * 1.5));

  if (points.length === 0) {
    return (
      <View style={[styles.container, { height: size }]}>
        <Typography variant="body-sm" color={colors.textTertiary} center>
          Faça check-ins para ver seu mapa emocional
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Axis labels */}
      <View style={[styles.axisLabelLeft, { height: size }]}>
        <Typography variant="label-sm" color={colors.textTertiary}>
          Ativado
        </Typography>
        <Typography variant="label-sm" color={colors.textTertiary}>
          Calmo
        </Typography>
      </View>

      <View style={styles.plotArea}>
        <Canvas style={{ width: size, height: size }}>
          {/* Grid lines — cross axes */}
          <Line
            p1={vec(PADDING, centerY)}
            p2={vec(size - PADDING, centerY)}
            color={colors.borderSubtle}
            strokeWidth={1}
          />
          <Line
            p1={vec(centerX, PADDING)}
            p2={vec(centerX, size - PADDING)}
            color={colors.borderSubtle}
            strokeWidth={1}
          />

          {/* Scatter points */}
          {points.map((point) => (
            <Circle
              key={point.id}
              cx={toCanvasX(point.valence)}
              cy={toCanvasY(point.arousal)}
              r={getDotRadius(point.emotionCount)}
              color={point.color + 'CC'} // 80% opacity
            />
          ))}
        </Canvas>

        {/* Quadrant labels */}
        {QUADRANT_LABELS.map((q, i) => (
          <View
            key={i}
            style={[
              styles.quadrantLabel,
              {
                left: PADDING + q.x * plotSize - 40,
                top: PADDING + q.y * plotSize - 12,
              },
            ]}
          >
            <Typography
              variant="label-sm"
              color={colors.textTertiary + '60'}
              center
            >
              {q.label}
            </Typography>
          </View>
        ))}
      </View>

      {/* Bottom axis labels */}
      <View style={styles.axisLabelBottom}>
        <Typography variant="label-sm" color={colors.textTertiary}>
          Negativo
        </Typography>
        <Typography variant="label-sm" color={colors.textTertiary}>
          Positivo
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  axisLabelLeft: {
    justifyContent: 'space-between',
    paddingVertical: PADDING,
    marginRight: 4,
  },
  plotArea: {
    position: 'relative',
  },
  quadrantLabel: {
    position: 'absolute',
    width: 80,
  },
  axisLabelBottom: {
    position: 'absolute',
    bottom: 0,
    left: PADDING + 40,
    right: PADDING + 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
