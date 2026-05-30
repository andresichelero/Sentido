import { create } from 'zustand';

export type LanguageOption = 'pt-BR' | 'en-US';

interface SettingsState {
  language: LanguageOption;
  setLanguage: (lang: LanguageOption) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'pt-BR',
  setLanguage: (lang) => set({ language: lang }),
}));
