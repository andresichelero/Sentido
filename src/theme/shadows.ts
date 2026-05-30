// =============================================================================
// SHADOWS — Sentido Design System
// Elevation-based shadow definitions
// =============================================================================

import { Platform } from 'react-native';

/** Shadow style for a given elevation level */
export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // Android
}

/** Predefined shadow elevations */
export const shadows: Record<string, ShadowStyle> = {
  /** No shadow */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  /** Subtle shadow for cards */
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  /** Medium shadow for elevated components */
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  /** Prominent shadow for floating elements */
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  /** Maximum shadow for modals and overlays */
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 16,
  },
} as const;

/**
 * Get shadow styles compatible with the current platform.
 * On Android, only the `elevation` property is used.
 */
export function getShadow(level: keyof typeof shadows): ShadowStyle {
  const shadow = shadows[level];
  if (Platform.OS === 'android') {
    return { ...shadows.none, elevation: shadow.elevation };
  }
  return shadow;
}
