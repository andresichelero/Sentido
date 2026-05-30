// =============================================================================
// USER TYPES — Sentido App
// Types for user profile and preferences
// =============================================================================

/** Subscription plan tiers */
export type UserPlan = 'free' | 'plus' | 'pro';

/** Preferred emotion entry mode */
export type EntryModePreference = 'wheel' | 'body' | 'intensity';

/** User profile data (mirrors Supabase profiles table) */
export interface UserProfile {
  /** UUID — matches auth.users(id) */
  id: string;
  /** User-chosen display name */
  displayName: string;
  /** Avatar URL in Supabase Storage, null if not set */
  avatarUrl: string | null;
  /** Whether the user has completed the onboarding flow */
  onboardingCompleted: boolean;
  /** Morning reminder time in HH:MM format, null if disabled */
  notificationTimeMorning: string | null;
  /** Evening reminder time in HH:MM format, null if disabled */
  notificationTimeEvening: string | null;
  /** User's preferred way of selecting emotions */
  preferredEntryMode: EntryModePreference;
  /** Current subscription plan */
  plan: UserPlan;
  /** Account creation timestamp */
  createdAt: Date;
}
