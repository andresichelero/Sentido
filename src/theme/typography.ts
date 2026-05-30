// =============================================================================
// TYPOGRAPHY — Sentido Design System
// Font families, sizes, line heights, and letter spacing scale
// Fonts: Playfair Display (display), DM Sans (body), DM Mono (labels)
// =============================================================================

/**
 * Font family constants.
 * These map to the font assets loaded via expo-font in the root layout.
 */
export const fontFamilies = {
  displayBold: 'PlayfairDisplay_700Bold',
  displayBlack: 'PlayfairDisplay_900Black',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  monoRegular: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
} as const;

/** A single typography style definition */
export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

/** Complete typographic scale */
export const typography: Record<string, TypographyStyle> = {
  'display-xl': {
    fontFamily: fontFamilies.displayBlack,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.03,
  },
  'display-lg': {
    fontFamily: fontFamilies.displayBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.02,
  },
  'display-md': {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.02,
  },
  'display-sm': {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.01,
  },
  'heading-lg': {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.01,
  },
  'heading-md': {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
  },
  'heading-sm': {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  'body-lg': {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
  },
  'body-md': {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
  },
  'body-sm': {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  },
  'label-lg': {
    fontFamily: fontFamilies.monoMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  'label-md': {
    fontFamily: fontFamilies.monoRegular,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.12,
  },
  'label-sm': {
    fontFamily: fontFamilies.monoRegular,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.15,
  },
} as const;
