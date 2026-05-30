// =============================================================================
// useUserStore — Authenticated user state
// =============================================================================

import { create } from 'zustand';
import type { UserProfile } from '../types/user.types';
import type { Session } from '@supabase/supabase-js';

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

export const useUserStore = create<UserState & UserActions>((set) => ({
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
      if (!state.profile) return state;
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
}));
