import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const expoDb = openDatabaseSync('sentido.db', { enableChangeListener: true });

// Initialize schema on startup
expoDb.execSync(`
  PRAGMA journal_mode = WAL;
  
  CREATE TABLE IF NOT EXISTS local_profile (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    plan TEXT DEFAULT 'free',
    onboarding_completed INTEGER DEFAULT 0,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS local_checkins (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    checked_at INTEGER NOT NULL,
    emotions TEXT NOT NULL,
    context TEXT,
    note TEXT,
    entry_mode TEXT NOT NULL,
    valence_score INTEGER,
    arousal_score INTEGER,
    body_regions TEXT,
    reflection TEXT,
    sync_status TEXT DEFAULT 'pending' NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  );
`);

export const db = drizzle(expoDb, { schema });
