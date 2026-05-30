// =============================================================================
// MiniBodyMap — Simplified non-interactive body silhouette (output mode)
// Used inside EmotionSheet to show "Onde você sente" (where you feel it)
// =============================================================================

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Group, Path, Skia, BlurMask } from '@shopify/react-native-skia';
import type { BodyRegionId } from '../../types/emotion.types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { BODY_PATHS } from './BodyPaths';

interface MiniBodyMapProps {
  activeRegions: BodyRegionId[];
  deactivatedRegions?: BodyRegionId[];
  accentColor: string;
  height?: number;
}

const RAW_HEIGHT = 93;
const RAW_WIDTH = 35; // We only show the front view for the mini map, or front and back side by side? 
// The old MiniBodyMap only showed a front silhouette. We will keep it front-only to fit.

const PARSED_PATHS: Record<string, ReturnType<typeof Skia.Path.MakeFromSVGString>[]> = {};
for (const [region, paths] of Object.entries(BODY_PATHS)) {
  PARSED_PATHS[region] = paths.map(p => Skia.Path.MakeFromSVGString(p)).filter(Boolean);
}

export function MiniBodyMap({
  activeRegions,
  deactivatedRegions = [],
  accentColor,
  height = 120,
}: MiniBodyMapProps) {
  const colors = useThemeColors();
  
  const canvasHeight = height;
  const scale = canvasHeight / RAW_HEIGHT;
  const canvasWidth = RAW_WIDTH * scale;

  const activeSet = useMemo(() => new Set(activeRegions), [activeRegions]);
  const deactivatedSet = useMemo(() => new Set(deactivatedRegions), [deactivatedRegions]);

  return (
    <View style={[styles.container, { height: canvasHeight }]}>
      <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
        <Group transform={[{ scale }]}>
          {/* Base silhouette outline (Front only) */}
          {Object.entries(PARSED_PATHS).map(([regionId, paths]) => {
            return paths.map((path, index) => {
              if (!path) return null;
              
              const bounds = path.computeTightBounds();
              const isBackPath = bounds.x >= 35;
              if (isBackPath) return null;

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

          {Object.entries(PARSED_PATHS).map(([regionId, paths]) => {
            return paths.map((path, index) => {
              if (!path) return null;
              
              const bounds = path.computeTightBounds();
              const isBackPath = bounds.x >= 35;
              if (isBackPath) return null;

              return (
                <Path
                  key={`outline-${regionId}-${index}`}
                  path={path}
                  color={colors.borderDefault}
                  style="stroke"
                  strokeWidth={0.5 / scale}
                />
              );
            });
          })}

          {/* Active region highlights */}
          {Object.entries(PARSED_PATHS).map(([regionId, paths]) => {
            const isActive = activeSet.has(regionId as BodyRegionId);
            const isDeactivated = deactivatedSet.has(regionId as BodyRegionId);
            if (!isActive && !isDeactivated) return null;

            return paths.map((path, index) => {
              if (!path) return null;
              
              const bounds = path.computeTightBounds();
              const isBackPath = bounds.x >= 35;
              if (isBackPath) return null;

              if (isDeactivated) {
                return (
                  <Path
                    key={`deact-${regionId}-${index}`}
                    path={path}
                    color={'#2563EB40'}
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
                    <BlurMask blur={3} style="normal" />
                  </Path>
                  
                  {/* White Core */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
