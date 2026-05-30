// =============================================================================
// useAppStore — Global app state (theme, preferences)
// =============================================================================

import { create } from 'zustand';

export type ColorScheme = 'dark' | 'light' | 'system';

interface AppState {
  /** Current color scheme preference */
  colorScheme: ColorScheme;
  /** Color of the currently active emotion sector — tints UI elements */
  activeEmotionColor: string;
  /** Whether this is the user's first launch (shows onboarding) */
  isFirstLaunch: boolean;
  /** Audio guides enabled */
  audioEnabled: boolean;
  /** Haptic feedback enabled */
  hapticsEnabled: boolean;
}

interface AppActions {
  setColorScheme: (scheme: ColorScheme) => void;
  setActiveEmotionColor: (color: string) => void;
  setIsFirstLaunch: (value: boolean) => void;
  toggleAudio: () => void;
  toggleHaptics: () => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  // State
  colorScheme: 'dark',
  activeEmotionColor: '#818CF8', // accent-default
  isFirstLaunch: true,
  audioEnabled: true,
  hapticsEnabled: true,

  // Actions
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  setActiveEmotionColor: (color) => set({ activeEmotionColor: color }),
  setIsFirstLaunch: (value) => set({ isFirstLaunch: value }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
}));
