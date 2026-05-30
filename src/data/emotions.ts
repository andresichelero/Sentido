// =============================================================================
// EMOTIONS — Complete Plutchik Emotion Tree
// Barrel export combining all 8 sectors into a single EMOTIONS array
// Minimum 90 nodes required
// =============================================================================

import type { EmotionNode } from '../types/emotion.types';
import { joyEmotions } from './sectors/joy';
import { trustEmotions } from './sectors/trust';
import { fearEmotions } from './sectors/fear';
import { surpriseEmotions } from './sectors/surprise';
import { sadnessEmotions } from './sectors/sadness';
import { disgustEmotions } from './sectors/disgust';
import { angerEmotions } from './sectors/anger';
import { anticipationEmotions } from './sectors/anticipation';

/**
 * Complete emotion tree with all nodes across 8 Plutchik sectors.
 * Each node has full metadata: descriptions, body regions, triggers, regulation techniques, etc.
 */
export const EMOTIONS: EmotionNode[] = [
  ...joyEmotions,
  ...trustEmotions,
  ...fearEmotions,
  ...surpriseEmotions,
  ...sadnessEmotions,
  ...disgustEmotions,
  ...angerEmotions,
  ...anticipationEmotions,
];

/** Quick-access map by emotion ID */
export const EMOTIONS_BY_ID: ReadonlyMap<string, EmotionNode> = new Map(
  EMOTIONS.map((e) => [e.id, e])
);

/** Total count of emotions in the tree */
export const EMOTION_COUNT = EMOTIONS.length;
