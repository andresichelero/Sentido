// =============================================================================
// Sync Engine — Offline-first synchronization with Supabase
// =============================================================================

import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../supabase/client';
import { db } from './client';
import { localCheckins } from './schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { Alert } from 'react-native';

let syncLockTime = 0;
let pullLockTime = 0;
const LOCK_TIMEOUT = 60000; // 1 minute

/**
 * Attempts to push all pending local check-ins to Supabase in bulk.
 */
export async function syncPendingCheckins(): Promise<void> {
  const now = Date.now();
  if (now - syncLockTime < LOCK_TIMEOUT) return;

  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  syncLockTime = now;
  try {
    // Get all pending check-ins
    const pending = await db
      .select()
      .from(localCheckins)
      .where(eq(localCheckins.syncStatus, 'pending'));

    if (pending.length === 0) {
      syncLockTime = 0;
      return;
    }

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      // Cannot sync if not authenticated (anonymous mode)
      syncLockTime = 0;
      return;
    }

    // Map local to remote schema
    const remoteCheckins = pending.map((checkin) => ({
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
      deleted_at: checkin.deletedAt ? checkin.deletedAt.toISOString() : null,
    }));

    // Bulk upsert to Supabase
    const { error } = await supabase
      .from('checkins')
      .upsert(remoteCheckins, { onConflict: 'id' });

    if (error) {
      console.error('Failed to bulk sync check-ins:', error);
      throw error;
    }

    // Mark as synced locally
    const pendingIds = pending.map((p) => p.id);
    await db
      .update(localCheckins)
      .set({ syncStatus: 'synced' })
      .where(inArray(localCheckins.id, pendingIds));

  } catch (error: any) {
    console.error('Error during synchronization:', error);
    Alert.alert('Erro de Sincronização', error.message || 'Falha ao enviar check-ins para a nuvem.');
  } finally {
    syncLockTime = 0;
  }
}

/**
 * Pulls new check-ins from Supabase that might have been created on another device.
 * Merges them into the local SQLite database.
 */
export async function pullRemoteCheckins(): Promise<void> {
  const now = Date.now();
  if (now - pullLockTime < LOCK_TIMEOUT) return;

  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  pullLockTime = now;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      pullLockTime = 0;
      return;
    }

    // Fetch the most recent updated_at from local db
    const latestLocal = await db
      .select()
      .from(localCheckins)
      .orderBy(desc(localCheckins.updatedAt))
      .limit(1);

    let query = supabase.from('checkins').select('*').eq('user_id', session.user.id);

    // If we have local records, only pull newer ones
    if (latestLocal.length > 0 && latestLocal[0].updatedAt) {
      query = query.gt('updated_at', latestLocal[0].updatedAt.toISOString());
    }

    const { data: remoteData, error } = await query;

    if (error) {
      console.error('Failed to pull remote check-ins:', error);
      throw error;
    }

    if (!remoteData || remoteData.length === 0) {
      pullLockTime = 0;
      return;
    }

    // Upsert remote data into SQLite
    for (const remote of remoteData) {
      const localRecord = {
        id: remote.id,
        userId: remote.user_id,
        checkedAt: new Date(remote.checked_at),
        emotions: remote.emotions,
        context: remote.context,
        note: remote.note,
        entryMode: remote.entry_mode,
        valenceScore: remote.valence_score,
        arousalScore: remote.arousal_score,
        bodyRegions: remote.body_regions,
        reflection: remote.reflection,
        syncStatus: 'synced' as const,
        createdAt: new Date(remote.created_at),
        updatedAt: new Date(remote.updated_at),
        deletedAt: remote.deleted_at ? new Date(remote.deleted_at) : null,
      };

      await db.insert(localCheckins).values(localRecord).onConflictDoUpdate({
        target: localCheckins.id,
        set: localRecord,
      });
    }

  } catch (error) {
    console.error('Error during pulling remote data:', error);
  } finally {
    pullLockTime = 0;
  }
}

/**
 * Migrates 'local-anonymous' check-ins to a real authenticated user ID.
 * Should be called right after a successful login/signup.
 */
export async function migrateAnonymousCheckins(newUserId: string): Promise<void> {
  try {
    const anonymousCheckins = await db
      .select()
      .from(localCheckins)
      .where(eq(localCheckins.userId, 'local-anonymous'));

    if (anonymousCheckins.length > 0) {
      console.log(`Migrating ${anonymousCheckins.length} anonymous checkins to user ${newUserId}`);
      
      await db
        .update(localCheckins)
        .set({ userId: newUserId, syncStatus: 'pending', updatedAt: new Date() })
        .where(eq(localCheckins.userId, 'local-anonymous'));
      
      // Trigger a sync immediately after migration
      syncPendingCheckins().catch(console.error);
    }
  } catch (error) {
    console.error('Failed to migrate anonymous check-ins:', error);
  }
}

