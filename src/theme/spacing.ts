// =============================================================================
// SPACING — Sentido Design System
// Base-4 multiplicative spacing scale
// =============================================================================

/** Full spacing scale (all values in px) */
export const spacingScale = [2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96] as const;

/** Named spacing tokens for common use */
export const spacing = {
  /** 4px — extra small gaps, icon padding */
  xs: 4,
  /** 8px — small gaps, compact padding */
  sm: 8,
  /** 16px — default padding, standard gaps */
  md: 16,
  /** 24px — section spacing, card padding */
  lg: 24,
  /** 32px — large section gaps */
  xl: 32,
  /** 48px — extra large spacing, section dividers */
  '2xl': 48,
  /** 64px — layout-level spacing */
  '3xl': 64,
} as const;

/** Border radius scale */
export const radii = {
  /** 4px — subtle rounding */
  xs: 4,
  /** 8px — small components like badges */
  sm: 8,
  /** 12px — cards, inputs */
  md: 12,
  /** 16px — larger cards, modals */
  lg: 16,
  /** 24px — prominent rounded elements */
  xl: 24,
  /** 9999px — fully round (pills, circles) */
  full: 9999,
} as const;
