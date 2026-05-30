import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useUserStore } from '../stores/useUserStore';
import { useWheelStore } from '../stores/useWheelStore';
import { useEmotionStore } from '../stores/useEmotionStore';

export const completeOnboarding = async () => {
  // Clear any residual interaction state from the onboarding wheel
  useWheelStore.getState().resetWheel();
  useEmotionStore.getState().resetDraft();
  
  // Set completion flag
  await SecureStore.setItemAsync('has_completed_onboarding', 'true');
  useUserStore.getState().setIsOnboarded(true);

  // Navigate directly to the main check-in tab
  router.replace('/(tabs)');
};
