// =============================================================================
// Sync Engine — Offline-first synchronization with Supabase
// =============================================================================

import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../supabase/client';
import { db } from './client';
import { localCheckins } from './schema';
import { eq } from 'drizzle-orm';

let isSyncing = false;

/**
 * Attempts to push all pending local check-ins to Supabase.
 * Should be called when network connectivity is restored or when a new check-in is created.
 */
export async function syncPendingCheckins(): Promise<void> {
  if (isSyncing) return;

  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  isSyncing = true;
  try {
    // Get all pending check-ins
    const pending = await db
      .select()
      .from(localCheckins)
      .where(eq(localCheckins.syncStatus, 'pending'));

    if (pending.length === 0) {
      isSyncing = false;
      return;
    }

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      // Cannot sync if not authenticated (anonymous mode)
      isSyncing = false;
      return;
    }

    // Process each pending check-in
    for (const checkin of pending) {
      // Map local to remote schema
      const remoteCheckin = {
        id: checkin.id,
        user_id: checkin.userId,
        checked_at: checkin.checkedAt.toISOString(),
        emotions: checkin.emotions,
        context: checkin.context,
        note: checkin.note,
        entry_mode: checkin.entryMode,
        valence_score: checkin.valenceScore,
        arousal_score: checkin.arousalScore,
        body_regions: checkin.bodyRegions,
        reflection: checkin.reflection,
        created_at: checkin.createdAt.toISOString(),
        updated_at: checkin.updatedAt?.toISOString() || new Date().toISOString(),
      };

      // Fetch remote to check for conflicts
      const { data: remoteData, error: fetchError } = await supabase
        .from('checkins')
        .select('updated_at')
        .eq('id', checkin.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means zero rows, which is fine for a new insert
        console.error(`Failed to fetch remote check-in ${checkin.id}:`, fetchError);
        continue;
      }

      if (remoteData?.updated_at) {
        const remoteDate = new Date(remoteData.updated_at);
        const localDate = new Date(remoteCheckin.updated_at);
        if (remoteDate > localDate) {
          // Remote is newer, mark local as synced to stop retrying,
          // ideally we'd pull the remote state here (conflict resolution).
          await db
            .update(localCheckins)
            .set({ syncStatus: 'synced' })
            .where(eq(localCheckins.id, checkin.id));
          continue;
        }
      }

      const { error } = await supabase
        .from('checkins')
        .upsert(remoteCheckin, { onConflict: 'id' });

      if (error) {
        console.error(`Failed to sync check-in ${checkin.id}:`, error);
        // We leave it as 'pending' to retry later
      } else {
        // Mark as synced locally
        await db
          .update(localCheckins)
          .set({ syncStatus: 'synced' })
          .where(eq(localCheckins.id, checkin.id));
      }
    }
  } catch (error) {
    console.error('Error during synchronization:', error);
  } finally {
    isSyncing = false;
  }
}

/**
 * Pulls new check-ins from Supabase that might have been created on another device.
 * (Optional for offline-first, but good for multi-device sync).
 */
export async function pullRemoteCheckins(): Promise<void> {
  // To be implemented as needed.
}
