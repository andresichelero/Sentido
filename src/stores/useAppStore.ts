// =============================================================================
// useAppStore — Global app state (theme, preferences)
// =============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ColorScheme = 'dark' | 'light' | 'system';

interface AppState {
  colorScheme: ColorScheme;
  activeEmotionColor: string;
  isFirstLaunch: boolean;
  audioEnabled: boolean;
  hapticsEnabled: boolean;
}

interface AppActions {
  setColorScheme: (scheme: ColorScheme) => void;
  setActiveEmotionColor: (color: string) => void;
  setIsFirstLaunch: (value: boolean) => void;
  toggleAudio: () => void;
  toggleHaptics: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'sentido-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        colorScheme: state.colorScheme,
        audioEnabled: state.audioEnabled,
        hapticsEnabled: state.hapticsEnabled,
        isFirstLaunch: state.isFirstLaunch
      }),
    }
  )
);
