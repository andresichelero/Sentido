// =============================================================================
// useBodyMap — Hook for body map interaction logic
// Manages region selection, emotion suggestions, and store integration
// =============================================================================

import { useState, useMemo, useCallback } from 'react';
import type { BodyRegionId } from '../types/emotion.types';
import { suggestEmotionsFromBodyRegions } from '../utils/emotion-math';
import { useEmotionStore } from '../stores/useEmotionStore';
import { useHaptics } from './useHaptics';

/**
 * Encapsulates body map selection logic:
 * - Toggle regions on/off
 * - Auto-suggest emotions from selected regions
 * - Persist selections to the emotion store
 */
export function useBodyMap() {
  const [selectedRegions, setSelectedRegions] = useState<BodyRegionId[]>([]);
  const [selectedEmotionIds, setSelectedEmotionIds] = useState<string[]>([]);
  const addEmotion = useEmotionStore((s) => s.addEmotion);
  const { selectionFeedback, mediumImpact } = useHaptics();

  /** Toggle a body region on or off */
  const toggleRegion = useCallback(
    (regionId: BodyRegionId) => {
      selectionFeedback();
      setSelectedRegions((prev) => {
        const isSelected = prev.includes(regionId);
        return isSelected
          ? prev.filter((r) => r !== regionId)
          : [...prev, regionId];
      });
    },
    [selectionFeedback]
  );

  /** Memoized emotion suggestions based on selected regions */
  const suggestedEmotions = useMemo(
    () => suggestEmotionsFromBodyRegions(selectedRegions, 5),
    [selectedRegions]
  );

  /** Toggle an emotion from the suggested list */
  const toggleSuggestedEmotion = useCallback(
    (emotionId: string) => {
      selectionFeedback();
      setSelectedEmotionIds((prev) =>
        prev.includes(emotionId)
          ? prev.filter((id) => id !== emotionId)
          : [...prev, emotionId]
      );
    },
    [selectionFeedback]
  );

  /** Clear all region selections */
  const clearRegions = useCallback(() => {
    setSelectedRegions([]);
    setSelectedEmotionIds([]);
  }, []);

  /** Confirm selection: add all selected emotions to the store */
  const confirmSelection = useCallback(() => {
    for (const emotionId of selectedEmotionIds) {
      const emotion = suggestedEmotions.find((e) => e.id === emotionId);
      if (emotion) {
        addEmotion({
          emotionId: emotion.id,
          intensity: 5,
          layer: emotion.layer,
        });
      }
    }
    mediumImpact();
  }, [selectedEmotionIds, suggestedEmotions, addEmotion, mediumImpact]);

  return {
    selectedRegions,
    toggleRegion,
    clearRegions,
    suggestedEmotions,
    selectedEmotionIds,
    toggleSuggestedEmotion,
    confirmSelection,
    canConfirm: selectedEmotionIds.length > 0,
  };
}
