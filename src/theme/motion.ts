// =============================================================================
// MOTION — Sentido Design System
// Animation durations, easings, and spring configurations
// All animations use Reanimated 3 exclusively — never React Native Animated.
// =============================================================================

import { Easing } from 'react-native-reanimated';

/** Animation duration presets (in milliseconds) */
export const duration = {
  /** 100ms — micro-interactions, instant feedback */
  instant: 100,
  /** 200ms — quick transitions, hover states */
  fast: 200,
  /** 300ms — default transitions */
  default: 300,
  /** 500ms — deliberate transitions, reveals */
  slow: 500,
  /** 800ms — dramatic transitions, onboarding */
  verySlow: 800,
} as const;

/** Easing curves for timing-based animations */
export const easing = {
  /** Standard ease — suitable for most transitions */
  default: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  /** Ease-in — accelerating from rest */
  in: Easing.bezier(0.42, 0.0, 1.0, 1.0),
  /** Ease-out — decelerating to rest */
  out: Easing.bezier(0.0, 0.0, 0.58, 1.0),
} as const;

/** Spring configuration presets */
export const spring = {
  /** Standard spring — responsive interactions */
  default: { damping: 18, stiffness: 200, mass: 1 },
  /** Gentle spring — softer, slower interactions */
  gentle: { damping: 22, stiffness: 150, mass: 1 },
  /** Snappy spring — quick, energetic interactions */
  snappy: { damping: 15, stiffness: 250, mass: 0.8 },
  /** Wheel entry spring — for the initial wheel appearance */
  wheelEntry: { damping: 12, stiffness: 100, mass: 1 },
  /** Liquid spring — bouncy, under-damped interactions */
  liquid: { damping: 10, stiffness: 120, mass: 1 },
} as const;

/** Wheel breathing animation constants */
export const wheelBreathing = {
  /** Scale range for the idle breathing animation */
  scaleMin: 0.98,
  scaleMax: 1.02,
  /** Duration of one breath cycle (half period) in ms */
  halfCycleDuration: 1500,
} as const;
