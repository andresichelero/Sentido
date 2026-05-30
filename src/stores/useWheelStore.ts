// =============================================================================
// useWheelStore — Emotion wheel interaction state
// =============================================================================

import { create } from 'zustand';
import type { EmotionLayer, PlutchikSector } from '../types/emotion.types';

interface WheelState {
  /** Currently visible layer of the wheel */
  activeLayer: EmotionLayer;
  /** Currently expanded sector (null = no sector expanded) */
  activeSector: PlutchikSector | null;
  /** Currently selected emotion for detail view */
  selectedEmotionId: string | null;
  /** Currently hovered/touched emotion */
  hoveredEmotionId: string | null;
  /** Current wheel scale (for zoom) */
  wheelScale: number;
  /** Whether dyad selection mode is active */
  isDyadMode: boolean;
  /** First sector selected in dyad mode */
  dyadFirstSector: PlutchikSector | null;
}

interface WheelActions {
  setActiveLayer: (layer: EmotionLayer) => void;
  setActiveSector: (sector: PlutchikSector | null) => void;
  selectEmotion: (emotionId: string | null) => void;
  hoverEmotion: (emotionId: string | null) => void;
  enterDyadMode: () => void;
  selectDyadSecondSector: (sector: PlutchikSector) => void;
  exitDyadMode: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetWheel: () => void;
}

const INITIAL_STATE: WheelState = {
  activeLayer: 'primary',
  activeSector: null,
  selectedEmotionId: null,
  hoveredEmotionId: null,
  wheelScale: 1,
  isDyadMode: false,
  dyadFirstSector: null,
};

export const useWheelStore = create<WheelState & WheelActions>((set) => ({
  ...INITIAL_STATE,

  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setActiveSector: (sector) => set({ activeSector: sector }),
  selectEmotion: (emotionId) => set({ selectedEmotionId: emotionId }),
  hoverEmotion: (emotionId) => set({ hoveredEmotionId: emotionId }),

  enterDyadMode: () => set({ isDyadMode: true, dyadFirstSector: null }),
  selectDyadSecondSector: (sector) =>
    set((state) => {
      if (!state.dyadFirstSector) {
        return { dyadFirstSector: sector };
      }
      // Both sectors selected — exit dyad mode
      return { isDyadMode: false, dyadFirstSector: null };
    }),
  exitDyadMode: () => set({ isDyadMode: false, dyadFirstSector: null }),

  zoomIn: () =>
    set((state) => ({ wheelScale: Math.min(state.wheelScale + 0.2, 2.0) })),
  zoomOut: () =>
    set((state) => ({ wheelScale: Math.max(state.wheelScale - 0.2, 0.5) })),
  resetWheel: () => set(INITIAL_STATE),
}));
