// =============================================================================
// useHaptics — Standardized haptic feedback patterns
// =============================================================================

import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../stores/useAppStore';

/**
 * Provides standardized haptic feedback methods.
 * Respects the user's haptics preference.
 */
export function useHaptics() {
  const enabled = useAppStore((s) => s.hapticsEnabled);

  /** Light impact — sector touch */
  const lightImpact = useCallback(() => {
    if (!enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [enabled]);

  /** Medium impact — emotion selection */
  const mediumImpact = useCallback(() => {
    if (!enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [enabled]);

  /** Heavy impact — significant action */
  const heavyImpact = useCallback(() => {
    if (!enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [enabled]);

  /** Success notification — check-in confirmed */
  const successNotification = useCallback(() => {
    if (!enabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [enabled]);

  /** Warning notification */
  const warningNotification = useCallback(() => {
    if (!enabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [enabled]);

  /** Selection feedback — subtle */
  const selectionFeedback = useCallback(() => {
    if (!enabled) return;
    Haptics.selectionAsync();
  }, [enabled]);

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    successNotification,
    warningNotification,
    selectionFeedback,
  };
}
