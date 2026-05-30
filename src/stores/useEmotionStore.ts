// =============================================================================
// useEmotionStore — Check-in draft state
// =============================================================================

import { create } from 'zustand';
import type { BodyRegionId } from '../types/emotion.types';
import type {
  CheckinContext,
  CheckinDraft,
  CheckinEmotion,
  CheckinReflection,
  CheckinStep,
  EntryMode,
} from '../types/checkin.types';
import { suggestEmotionsFromBodyRegions } from '../utils/emotion-math';

interface EmotionStoreState {
  /** The check-in currently being drafted */
  draft: CheckinDraft | null;
  /** Current step in the check-in flow */
  step: CheckinStep;
  /** How the user is entering the emotion */
  entryMode: EntryMode;
  /** Body regions selected (body-map entry mode) */
  selectedBodyRegions: BodyRegionId[];
  /** Emotion IDs suggested from body region selection */
  suggestedEmotionIds: string[];
}

interface EmotionStoreActions {
  initDraft: (entryMode: EntryMode) => void;
  addEmotion: (emotion: CheckinEmotion) => void;
  removeEmotion: (emotionId: string) => void;
  setIntensity: (emotionId: string, intensity: number) => void;
  setContext: (context: CheckinContext | null) => void;
  setNote: (note: string | null) => void;
  addReflection: (reflection: CheckinReflection) => void;
  setEntryMode: (mode: EntryMode) => void;
  setStep: (step: CheckinStep) => void;
  toggleBodyRegion: (regionId: BodyRegionId) => void;
  computeSuggestions: () => void;
  resetDraft: () => void;
}

const INITIAL_STATE: EmotionStoreState = {
  draft: null,
  step: 'entry',
  entryMode: 'wheel',
  selectedBodyRegions: [],
  suggestedEmotionIds: [],
};

export const useEmotionStore = create<EmotionStoreState & EmotionStoreActions>((set, get) => ({
  ...INITIAL_STATE,

  initDraft: (entryMode) =>
    set({
      draft: {
        checkedAt: new Date(),
        emotions: [],
        context: null,
        note: null,
        entryMode,
        valenceScore: 0,
        arousalScore: 0,
        bodyRegions: [],
        reflection: [],
      },
      step: 'emotions',
      entryMode,
    }),

  addEmotion: (emotion) =>
    set((state) => {
      if (!state.draft) return state;
      const exists = state.draft.emotions.some((e) => e.emotionId === emotion.emotionId);
      if (exists) return state;
      return {
        draft: {
          ...state.draft,
          emotions: [...state.draft.emotions, emotion],
        },
      };
    }),

  removeEmotion: (emotionId) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          emotions: state.draft.emotions.filter((e) => e.emotionId !== emotionId),
        },
      };
    }),

  setIntensity: (emotionId, intensity) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          emotions: state.draft.emotions.map((e) =>
            e.emotionId === emotionId ? { ...e, intensity } : e
          ),
        },
      };
    }),

  setContext: (context) =>
    set((state) => {
      if (!state.draft) return state;
      return { draft: { ...state.draft, context } };
    }),

  setNote: (note) =>
    set((state) => {
      if (!state.draft) return state;
      return { draft: { ...state.draft, note } };
    }),

  addReflection: (reflection) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          reflection: [...state.draft.reflection, reflection],
        },
      };
    }),

  setEntryMode: (mode) => set({ entryMode: mode }),

  setStep: (step) => set({ step }),

  toggleBodyRegion: (regionId) =>
    set((state) => {
      const isSelected = state.selectedBodyRegions.includes(regionId);
      const newRegions = isSelected
        ? state.selectedBodyRegions.filter((r) => r !== regionId)
        : [...state.selectedBodyRegions, regionId];
      return { selectedBodyRegions: newRegions };
    }),

  computeSuggestions: () => {
    const { selectedBodyRegions } = get();
    const suggested = suggestEmotionsFromBodyRegions(selectedBodyRegions, 5);
    set({ suggestedEmotionIds: suggested.map((e) => e.id) });
  },

  resetDraft: () => set(INITIAL_STATE),
}));
