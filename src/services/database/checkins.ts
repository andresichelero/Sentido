import { eq, desc, and, gte, lte, isNull } from 'drizzle-orm';
import { db } from './client';
import { localCheckins } from './schema';
import type { Checkin } from '../../types/checkin.types';
import * as crypto from 'expo-crypto';

// Mapping from localCheckins to CheckinType
const mapCheckin = (row: typeof localCheckins.$inferSelect): Checkin => ({
  id: row.id,
  userId: row.userId,
  checkedAt: row.checkedAt,
  emotions: row.emotions as any,
  context: row.context as any,
  note: row.note,
  entryMode: row.entryMode as any,
  valenceScore: row.valenceScore ?? 0,
  arousalScore: row.arousalScore ?? 0,
  bodyRegions: (row.bodyRegions as any) ?? [],
  reflection: (row.reflection as any) ?? [],
  isSynced: row.syncStatus === 'synced',
  deletedAt: row.deletedAt,
});

export const checkinsLocalDb = {
  async createCheckin(draft: Omit<Checkin, 'id' | 'isSynced' | 'deletedAt'>): Promise<Checkin> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newCheckin: typeof localCheckins.$inferInsert = {
      id,
      userId: draft.userId,
      checkedAt: draft.checkedAt,
      emotions: draft.emotions,
      context: draft.context,
      note: draft.note,
      entryMode: draft.entryMode,
      valenceScore: draft.valenceScore,
      arousalScore: draft.arousalScore,
      bodyRegions: draft.bodyRegions,
      reflection: draft.reflection,
      syncStatus: 'pending',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await db.insert(localCheckins).values(newCheckin);
    
    return {
      ...draft,
      id,
      isSynced: false,
      deletedAt: null,
    };
  },

  async getCheckins(userId: string, limit: number, offset: number): Promise<Checkin[]> {
    const rows = await db.select()
      .from(localCheckins)
      .where(
        and(
          eq(localCheckins.userId, userId),
          isNull(localCheckins.deletedAt)
        )
      )
      .orderBy(desc(localCheckins.checkedAt))
      .limit(limit)
      .offset(offset);
      
    return rows.map(mapCheckin);
  },

  async getCheckinById(id: string): Promise<Checkin | null> {
    const rows = await db.select()
      .from(localCheckins)
      .where(eq(localCheckins.id, id))
      .limit(1);
      
    if (rows.length === 0) return null;
    return mapCheckin(rows[0]);
  },

  async getCheckinsInRange(userId: string, from: Date, to: Date): Promise<Checkin[]> {
    const rows = await db.select()
      .from(localCheckins)
      .where(
        and(
          eq(localCheckins.userId, userId),
          gte(localCheckins.checkedAt, from),
          lte(localCheckins.checkedAt, to),
          isNull(localCheckins.deletedAt)
        )
      )
      .orderBy(desc(localCheckins.checkedAt));
      
    return rows.map(mapCheckin);
  },
  
  async updateCheckin(id: string, updates: Partial<Checkin>): Promise<Checkin> {
    const now = new Date();
    
    const dbUpdates: Partial<typeof localCheckins.$inferInsert> = {
      ...updates,
      updatedAt: now,
      syncStatus: 'pending', // Modify means needs sync
    };
    
    if (updates.isSynced !== undefined) {
       dbUpdates.syncStatus = updates.isSynced ? 'synced' : 'pending';
    }

    delete dbUpdates.id;
    delete (dbUpdates as any).isSynced;

    await db.update(localCheckins)
      .set(dbUpdates)
      .where(eq(localCheckins.id, id));
      
    const updated = await this.getCheckinById(id);
    if (!updated) throw new Error('Checkin not found after update');
    return updated;
  },

  async deleteCheckin(id: string): Promise<void> {
    const now = new Date();
    await db.update(localCheckins)
      .set({ deletedAt: now, syncStatus: 'pending', updatedAt: now })
      .where(eq(localCheckins.id, id));
  },

  async getTotalCheckins(userId: string): Promise<number> {
    const rows = await db.select()
      .from(localCheckins)
      .where(
        and(
          eq(localCheckins.userId, userId),
          isNull(localCheckins.deletedAt)
        )
      );
    return rows.length;
  },

  async getUserStreak(userId: string): Promise<number> {
    const rows = await db.select()
      .from(localCheckins)
      .where(
        and(
          eq(localCheckins.userId, userId),
          isNull(localCheckins.deletedAt)
        )
      )
      .orderBy(desc(localCheckins.checkedAt));
      
    if (rows.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkinDates = new Set<string>();
    rows.forEach(r => {
      const d = new Date(r.checkedAt);
      checkinDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
    
    if (checkinDates.has(todayStr) || checkinDates.has(yesterdayStr)) {
      let d = new Date(checkinDates.has(todayStr) ? today : yesterday);
      while (true) {
        const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (checkinDates.has(dStr)) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
    }
    
    return streak;
  }
};
