// =============================================================================
// BodyRegion — Individual touchable body region for the BodyMapCanvas
// Renders a Skia RoundedRect with animated opacity overlay
// =============================================================================

import React from 'react';
import { RoundedRect } from '@shopify/react-native-skia';
import type { BodyRegionId } from '../../types/emotion.types';

interface BodyRegionProps {
  regionId: BodyRegionId;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  isDeactivated: boolean;
  activeColor: string;
}

/**
 * A single body region rendered as a Skia rounded rect.
 * Active = emotion color at 50% opacity.
 * Deactivated = cool blue at 30% opacity.
 * Inactive = transparent (not rendered).
 */
export function BodyRegion({
  x,
  y,
  width,
  height,
  isActive,
  isDeactivated,
  activeColor,
}: BodyRegionProps) {
  if (!isActive && !isDeactivated) return null;

  const fillColor = isActive
    ? activeColor + '80' // 50% opacity
    : '#2563EB4D'; // cool blue 30%

  return (
    <RoundedRect
      x={x}
      y={y}
      width={width}
      height={height}
      r={3}
      color={fillColor}
    />
  );
}
