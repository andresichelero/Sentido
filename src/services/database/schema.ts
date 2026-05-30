import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const localProfiles = sqliteTable('local_profile', {
  id: text('id').primaryKey(),
  displayName: text('display_name'),
  plan: text('plan').default('free'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const localCheckins = sqliteTable('local_checkins', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  checkedAt: integer('checked_at', { mode: 'timestamp' }).notNull(),
  emotions: text('emotions', { mode: 'json' }).notNull(), // Array of CheckinEmotion
  context: text('context'),
  note: text('note'),
  entryMode: text('entry_mode').notNull(),
  valenceScore: integer('valence_score'),
  arousalScore: integer('arousal_score'),
  bodyRegions: text('body_regions', { mode: 'json' }), // Array of BodyRegionId
  reflection: text('reflection', { mode: 'json' }), // Array of CheckinReflection
  syncStatus: text('sync_status', { enum: ['pending', 'synced', 'conflict'] }).default('pending').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
