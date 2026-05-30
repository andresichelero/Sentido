// =============================================================================
// useUserStore — Authenticated user state
// =============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../types/user.types';
import type { Session } from '@supabase/supabase-js';

interface UserState {
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  hasNotificationPermission: boolean;
}

interface UserActions {
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setIsOnboarded: (value: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setHasNotificationPermission: (value: boolean) => void;
  signOut: () => void;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      // State
      profile: null,
      session: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: true,
      hasNotificationPermission: false,

      // Actions
      setSession: (session) =>
        set({
          session,
          isAuthenticated: session !== null,
        }),

      setProfile: (profile) =>
        set({
          profile,
          isOnboarded: profile?.onboardingCompleted ?? false,
          isLoading: false,
        }),

      updateProfile: (updates) =>
        set((state) => {
          if (!state.profile) {
            return {
              profile: {
                id: 'guest',
                displayName: 'Convidado',
                avatarUrl: null,
                onboardingCompleted: state.isOnboarded,
                notificationTimeMorning: null,
                notificationTimeEvening: null,
                preferredEntryMode: 'wheel',
                plan: 'free',
                createdAt: new Date(),
                ...updates,
              }
            };
          }
          return { profile: { ...state.profile, ...updates } };
        }),

      setIsOnboarded: (value) => set({ isOnboarded: value }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setHasNotificationPermission: (value) => set({ hasNotificationPermission: value }),

      signOut: () =>
        set({
          profile: null,
          session: null,
          isAuthenticated: false,
          isOnboarded: false,
          isLoading: false,
          hasNotificationPermission: false,
        }),
    }),
    {
      name: 'sentido-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        profile: state.profile,
        hasNotificationPermission: state.hasNotificationPermission,
        isOnboarded: state.isOnboarded
      }), // only persist these fields
    }
  )
);
