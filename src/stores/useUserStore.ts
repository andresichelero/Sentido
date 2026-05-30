// =============================================================================
// useUserStore — Authenticated user state
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserProfile } from '../types/user.types';
import { updateRemoteProfile } from '../services/supabase/profiles';

interface UserState {
  /** Current user profile, null if not authenticated */
  profile: UserProfile | null;
  /** The Supabase session object */
  session: Session | null;
  /** Whether the user is authenticated (has a Supabase session) */
  isAuthenticated: boolean;
  /** Whether the user has completed onboarding */
  isOnboarded: boolean;
  /** Whether the user profile is currently loading */
  isLoading: boolean;
  /** Whether the user has granted notification permissions */
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

      updateProfile: (updates) => {
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
          
          // Fire and forget remote update if authenticated
          if (state.session?.user?.id && state.profile.id !== 'guest') {
            updateRemoteProfile(state.session.user.id, updates).catch(console.error);
          }
          
          return { profile: { ...state.profile, ...updates } };
        });
      },

      setIsOnboarded: (value) => {
        set((state) => {
          if (state.session?.user?.id) {
             updateRemoteProfile(state.session.user.id, { onboardingCompleted: value }).catch(console.error);
          }
          return { isOnboarded: value };
        });
      },

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
