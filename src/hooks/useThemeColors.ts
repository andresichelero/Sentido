// =============================================================================
// useThemeColors — Reactive color hook based on current theme
// =============================================================================

import { useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useAppStore } from '../stores/useAppStore';
import { darkColors, lightColors, emotionColors } from '../theme/colors';
import type { UIColorPalette } from '../theme/colors';

/**
 * Returns the active UI color palette based on user preference and system scheme.
 * Also exposes the current active emotion color for UI tinting.
 */
export function useThemeColors(): UIColorPalette & {
  activeEmotionColor: string;
  isDark: boolean;
} {
  const colorScheme = useAppStore((s) => s.colorScheme);
  const activeEmotionColor = useAppStore((s) => s.activeEmotionColor);
  const systemScheme = useSystemColorScheme();

  const resolvedScheme =
    colorScheme === 'system' ? (systemScheme ?? 'dark') : colorScheme;

  const palette = useMemo(
    () => (resolvedScheme === 'dark' ? darkColors : lightColors),
    [resolvedScheme]
  );

  return useMemo(
    () => ({
      ...palette,
      activeEmotionColor,
      isDark: resolvedScheme === 'dark',
    }),
    [palette, activeEmotionColor, resolvedScheme]
  );
}

/**
 * Get the emotion color set for a given sector name.
 */
export function useEmotionColor(sector: string) {
  return useMemo(() => {
    const colors = emotionColors[sector];
    return colors ?? { primary: '#818CF8', light: '#C7D2FE', dark: '#4338CA' };
  }, [sector]);
}
