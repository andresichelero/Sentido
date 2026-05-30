import { supabase } from './client';
import type { UserProfile } from '../../types/user.types';

/**
 * Fetches the user profile from Supabase.
 */
export async function fetchRemoteProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found - usually means the trigger hasn't fired or it's a new anonymous user
      return null;
    }
    console.error('[fetchRemoteProfile] Error:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    displayName: data.display_name || 'Convidado',
    avatarUrl: data.avatar_url,
    onboardingCompleted: data.onboarding_completed ?? false,
    notificationTimeMorning: data.notification_time_morning,
    notificationTimeEvening: data.notification_time_evening,
    preferredEntryMode: data.preferred_entry_mode || 'wheel',
    plan: data.plan || 'free',
    createdAt: new Date(data.created_at),
  };
}

/**
 * Updates the user profile in Supabase.
 */
export async function updateRemoteProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const remoteUpdates: any = {};
  
  if (updates.displayName !== undefined) remoteUpdates.display_name = updates.displayName;
  if (updates.avatarUrl !== undefined) remoteUpdates.avatar_url = updates.avatarUrl;
  if (updates.onboardingCompleted !== undefined) remoteUpdates.onboarding_completed = updates.onboardingCompleted;
  if (updates.notificationTimeMorning !== undefined) remoteUpdates.notification_time_morning = updates.notificationTimeMorning;
  if (updates.notificationTimeEvening !== undefined) remoteUpdates.notification_time_evening = updates.notificationTimeEvening;
  if (updates.preferredEntryMode !== undefined) remoteUpdates.preferred_entry_mode = updates.preferredEntryMode;
  if (updates.plan !== undefined) remoteUpdates.plan = updates.plan;
  
  if (Object.keys(remoteUpdates).length === 0) return;
  
  remoteUpdates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('profiles')
    .update(remoteUpdates)
    .eq('id', userId);

  if (error) {
    console.error('[updateRemoteProfile] Error:', error);
    throw error;
  }
}
