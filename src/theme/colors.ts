// =============================================================================
// COLORS — Sentido Design System
// Complete color palette for emotions and UI (dark + light themes)
// Do NOT alter the emotion hex values — they are part of the Plutchik mapping.
// =============================================================================

/** Per-sector emotion color set with primary, light, and dark variants */
export interface EmotionColorSet {
  primary: string;
  light: string;
  dark: string;
}

/** All 8 emotion sector color sets */
export const emotionColors: Record<string, EmotionColorSet> = {
  joy: { primary: '#F9C74F', light: '#FDE68A', dark: '#D97706' },
  trust: { primary: '#90BE6D', light: '#BBF7D0', dark: '#15803D' },
  fear: { primary: '#43AA8B', light: '#99F6E4', dark: '#0F766E' },
  surprise: { primary: '#4CC9F0', light: '#BAE6FD', dark: '#0284C7' },
  sadness: { primary: '#4361EE', light: '#BFDBFE', dark: '#1D4ED8' },
  disgust: { primary: '#7B2D8B', light: '#E9D5FF', dark: '#6B21A8' },
  anger: { primary: '#E63946', light: '#FECACA', dark: '#B91C1C' },
  anticipation: { primary: '#F4A261', light: '#FED7AA', dark: '#C2410C' },
} as const;

/** UI color palette — all semantic tokens */
export interface UIColorPalette {
  background: string;
  surface1: string;
  surface2: string;
  surface3: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  accentDefault: string;
  accentHover: string;
  error: string;
  success: string;
  warning: string;
}

/** Dark theme — default */
export const darkColors: UIColorPalette = {
  background: '#0D0D1A',
  surface1: '#13131F',
  surface2: '#1A1A2E',
  surface3: '#232338',
  borderSubtle: '#1E1E2E',
  borderDefault: '#2A2A3E',
  borderStrong: '#3A3A5A',
  textPrimary: '#E8E8F8',
  textSecondary: '#9898B8',
  textTertiary: '#6868A0',
  textDisabled: '#3A3A5A',
  accentDefault: '#818CF8',
  accentHover: '#6366F1',
  error: '#F87171',
  success: '#4ADE80',
  warning: '#FACC15',
} as const;

/** Light theme */
export const lightColors: UIColorPalette = {
  background: '#F8F8FF',
  surface1: '#FFFFFF',
  surface2: '#F0F0F8',
  surface3: '#E8E8F2',
  borderSubtle: '#E0E0EE',
  borderDefault: '#C8C8E0',
  borderStrong: '#A0A0C0',
  textPrimary: '#1A1A2E',
  textSecondary: '#4A4A6E',
  textTertiary: '#6868A0',
  textDisabled: '#B0B0C8',
  accentDefault: '#4361EE',
  accentHover: '#3451D1',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#CA8A04',
} as const;

/**
 * Get the UI color palette for the given color scheme.
 */
export function getUIColors(scheme: 'dark' | 'light'): UIColorPalette {
  return scheme === 'dark' ? darkColors : lightColors;
}
