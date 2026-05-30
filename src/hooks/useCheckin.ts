// =============================================================================
// useCheckin — Orchestrates the full check-in flow
// Bridges Zustand draft state → SQLite persistence
// =============================================================================

import { useCallback } from 'react';
import { useEmotionStore } from '../stores/useEmotionStore';
import { useWheelStore } from '../stores/useWheelStore';
import { useUserStore } from '../stores/useUserStore';
import { useHaptics } from './useHaptics';
import { checkinsLocalDb } from '../services/database/checkins';
import { syncPendingCheckins } from '../services/database/sync';
import { calculateValenceScore, calculateArousalScore, getEmotionById } from '../utils/emotion-math';
import type { EntryMode } from '../types/checkin.types';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

/**
 * Hook that orchestrates the check-in lifecycle:
 * start → add emotions → (optional context/note) → finish (save to SQLite)
 */
export function useCheckin() {
  const initDraft = useEmotionStore((s) => s.initDraft);
  const addEmotionToStore = useEmotionStore((s) => s.addEmotion);
  const draft = useEmotionStore((s) => s.draft);
  const resetDraft = useEmotionStore((s) => s.resetDraft);
  const resetWheel = useWheelStore((s) => s.resetWheel);
  const session = useUserStore((s) => s.session);
  const { mediumImpact, successNotification } = useHaptics();
  const queryClient = useQueryClient();

  /** Start a new check-in draft */
  const startCheckin = useCallback(
    (mode: EntryMode = 'wheel') => {
      initDraft(mode);
    },
    [initDraft]
  );

  /**
   * Add an emotion to the current draft.
   * Automatically recalculates valence and arousal scores.
   */
  const addEmotion = useCallback(
    (emotionId: string, intensity: number = 0) => {
      const emotion = getEmotionById(emotionId);
      if (!emotion) return;

      addEmotionToStore({
        emotionId,
        intensity,
        layer: emotion.layer,
      });
      mediumImpact();
    },
    [addEmotionToStore, mediumImpact]
  );

  /** Whether we have an active draft with at least one emotion, and all have intensities set */
  const canFinish = !!draft && draft.emotions.length > 0 && draft.emotions.every(e => e.intensity > 0);

  /** Number of emotions in current draft */
  const emotionCount = draft?.emotions.length ?? 0;

  /**
   * Finalize the check-in: compute scores, save to SQLite, reset state.
   * Returns the saved check-in ID.
   */
  const finishCheckin = useCallback(async (): Promise<string | null> => {
    const currentDraft = useEmotionStore.getState().draft;
    if (!currentDraft || currentDraft.emotions.length === 0) {
      resetDraft();
      resetWheel();
      return null;
    }

    // Compute final valence and arousal from selected emotions
    const emotionIds = currentDraft.emotions.map((e) => e.emotionId);
    const valenceScore = calculateValenceScore(emotionIds);
    const arousalScore = calculateArousalScore(emotionIds);

    const userId = session?.user?.id || 'local-anonymous';

    try {
      const saved = await checkinsLocalDb.createCheckin({
        userId,
        checkedAt: currentDraft.checkedAt,
        emotions: currentDraft.emotions,
        context: currentDraft.context,
        note: currentDraft.note,
        entryMode: currentDraft.entryMode,
        valenceScore,
        arousalScore,
        bodyRegions: currentDraft.bodyRegions,
        reflection: currentDraft.reflection,
      });

      // Celebrate
      successNotification();

      // Reset all state
      resetDraft();
      resetWheel();

      // Invalidate history query so UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['checkins'] });

      // Fire and forget sync to Supabase
      syncPendingCheckins().catch(console.error);

      return saved.id;
    } catch (error: any) {
      console.error('[useCheckin] Failed to save check-in:', error);
      Alert.alert('Erro ao salvar', `Ocorreu um problema ao salvar seu check-in no banco local: ${error.message || 'Erro desconhecido'}`);
      return null;
    }
  }, [draft, resetDraft, resetWheel, successNotification, session]);

  return {
    /** Start a new check-in session */
    startCheckin,
    /** Add an emotion to the active draft */
    addEmotion,
    /** Finalize and persist the check-in */
    finishCheckin,
    /** Whether the draft has emotions and can be finalized */
    canFinish,
    /** Number of emotions selected in the current draft */
    emotionCount,
    /** The raw draft object */
    draft,
  };
}
