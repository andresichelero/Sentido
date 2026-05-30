// =============================================================================
// CHECK-IN TYPES — Sentido App
// Types for the emotion check-in flow and records
// =============================================================================

import type { BodyRegionId, EmotionLayer } from './emotion.types';

/** A single emotion selection within a check-in */
export interface CheckinEmotion {
  /** Reference to an EmotionNode.id */
  emotionId: string;
  /** User-set intensity from 1 (barely felt) to 10 (overwhelming) */
  intensity: number;
  /** Which layer this emotion was selected from */
  layer: EmotionLayer;
}

/** Contextual category for the check-in */
export type CheckinContext = 'work' | 'relationship' | 'health' | 'leisure' | 'unknown';

/** How the user entered/discovered the emotion */
export type EntryMode = 'wheel' | 'body' | 'intensity';

/** A single reflection question and answer pair */
export interface CheckinReflection {
  /** Reference to a predefined question ID */
  questionId: string;
  /** User's free-text answer */
  answer: string;
}

/** A complete check-in record */
export interface Checkin {
  /** Unique identifier (UUID) */
  id: string;
  /** User who performed the check-in */
  userId: string;
  /** Timestamp of when the check-in was performed (may differ from created_at for offline sync) */
  checkedAt: Date;
  /** Array of emotions selected during this check-in */
  emotions: CheckinEmotion[];
  /** Optional context category */
  context: CheckinContext | null;
  /** Optional free-text note (max 2000 chars) */
  note: string | null;
  /** How the user discovered/selected the emotion */
  entryMode: EntryMode;
  /** Calculated valence score: -5 to +5 */
  valenceScore: number;
  /** Calculated arousal score: 1 to 10 */
  arousalScore: number;
  /** Body regions selected (if entry_mode = 'body') */
  bodyRegions: BodyRegionId[];
  /** Reflection question/answer pairs */
  reflection: CheckinReflection[];
  /** Whether this check-in has been synced to Supabase */
  isSynced: boolean;
  /** When this check-in was deleted (soft delete) */
  deletedAt: Date | null;
}

/** Draft check-in used during creation (before saving) */
export type CheckinDraft = Omit<Checkin, 'id' | 'userId' | 'isSynced' | 'deletedAt'>;

/** Steps in the check-in flow */
export type CheckinStep = 'entry' | 'emotions' | 'context' | 'note' | 'reflection' | 'complete';
