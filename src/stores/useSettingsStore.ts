import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguageOption = 'pt-BR' | 'en-US';

interface SettingsState {
  language: LanguageOption;
  setLanguage: (lang: LanguageOption) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'pt-BR',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'sentido-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
