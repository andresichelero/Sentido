import { supabase } from './client';

export interface RemoteCheckin {
  id: string;
  user_id: string;
  checked_at: string;
  emotions: any;
  context?: string;
  note?: string;
  entry_mode: string;
  valence_score?: number;
  arousal_score?: number;
  body_regions?: any;
  reflection?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all check-ins for the currently authenticated user from Supabase.
 * Uses the `updated_at` column to only fetch recent changes if `since` is provided.
 */
export async function fetchRemoteCheckins(since?: Date): Promise<RemoteCheckin[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('User must be authenticated to fetch remote checkins.');
  }

  let query = supabase
    .from('checkins')
    .select('*')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false });

  if (since) {
    query = query.gt('updated_at', since.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data as RemoteCheckin[];
}

/**
 * Deletes a check-in from the remote database.
 */
export async function deleteRemoteCheckin(id: string): Promise<void> {
  const { error } = await supabase
    .from('checkins')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}
