// =============================================================================
// EMOTION MATH — Utility functions for emotion calculations
// Pure functions with no side effects
// =============================================================================

import type { BodyRegionId, EmotionLayer, EmotionNode, PlutchikSector, EmotionDyad } from '../types/emotion.types';
import { EMOTIONS, EMOTIONS_BY_ID } from '../data/emotions';
import { DYADS } from '../data/dyads';
import { BODY_REGION_EMOTION_MAP } from '../data/body-map';

/** Get a single emotion by its ID */
export function getEmotionById(id: string): EmotionNode | undefined {
  return EMOTIONS_BY_ID.get(id);
}

/** Get all emotions that share a parent ID */
export function getEmotionsByParent(parentId: string): EmotionNode[] {
  return EMOTIONS.filter((e) => e.parentId === parentId);
}

/** Get all emotions in a given Plutchik sector */
export function getEmotionsBySector(sector: PlutchikSector): EmotionNode[] {
  return EMOTIONS.filter((e) => e.sector === sector);
}

/** Get all emotions in a given layer */
export function getEmotionsByLayer(layer: EmotionLayer): EmotionNode[] {
  return EMOTIONS.filter((e) => e.layer === layer);
}

/** Get emotions by intensity level within a sector */
export function getEmotionsByIntensity(sector: PlutchikSector, intensityLevel: 1 | 2 | 3): EmotionNode[] {
  return EMOTIONS.filter((e) => e.sector === sector && e.intensityLevel === intensityLevel);
}

/**
 * Calculate the aggregate valence score for a set of emotions.
 * Returns a value between -5 and +5.
 */
export function calculateValenceScore(emotionIds: string[]): number {
  if (emotionIds.length === 0) return 0;
  const emotions = emotionIds
    .map((id) => EMOTIONS_BY_ID.get(id))
    .filter((e): e is EmotionNode => e !== undefined);
  if (emotions.length === 0) return 0;
  const avgValence = emotions.reduce((sum, e) => sum + e.valence, 0) / emotions.length;
  return Math.round(avgValence * 5);
}

/**
 * Calculate the aggregate arousal score for a set of emotions.
 * Returns a value between 1 and 10.
 */
export function calculateArousalScore(emotionIds: string[]): number {
  if (emotionIds.length === 0) return 1;
  const emotions = emotionIds
    .map((id) => EMOTIONS_BY_ID.get(id))
    .filter((e): e is EmotionNode => e !== undefined);
  if (emotions.length === 0) return 1;
  const avgArousal = emotions.reduce((sum, e) => sum + e.arousal, 0) / emotions.length;
  return Math.max(1, Math.round(avgArousal * 10));
}

/**
 * Suggest emotions based on selected body regions.
 * Algorithm: score each emotion by (matching active regions / total regions for that emotion).
 * Returns top N emotions sorted by score descending.
 */
export function suggestEmotionsFromBodyRegions(
  regionIds: BodyRegionId[],
  topN: number = 5
): EmotionNode[] {
  if (regionIds.length === 0) return [];

  // Collect all candidate emotion IDs from selected regions
  const candidateIds = new Set<string>();
  for (const regionId of regionIds) {
    const emotionIds = BODY_REGION_EMOTION_MAP[regionId];
    if (emotionIds) {
      for (const eid of emotionIds) {
        candidateIds.add(eid);
      }
    }
  }

  // Score each candidate
  const scored: Array<{ emotion: EmotionNode; score: number }> = [];
  for (const id of candidateIds) {
    const emotion = EMOTIONS_BY_ID.get(id);
    if (!emotion) continue;
    if (emotion.bodyRegions.length === 0) continue;

    const matchingRegions = regionIds.filter((r) => emotion.bodyRegions.includes(r)).length;
    const score = matchingRegions / emotion.bodyRegions.length;
    scored.push({ emotion, score });
  }

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((s) => s.emotion);
}

/**
 * Find a dyad by its two constituent sectors (order-independent).
 */
export function getDyadBySectors(s1: PlutchikSector, s2: PlutchikSector): EmotionDyad | undefined {
  return DYADS.find(
    (d) =>
      (d.sectors[0] === s1 && d.sectors[1] === s2) ||
      (d.sectors[0] === s2 && d.sectors[1] === s1)
  );
}

/**
 * Get all dyads that involve a given sector.
 */
export function getDyadsBySector(sector: PlutchikSector): EmotionDyad[] {
  return DYADS.filter((d) => d.sectors.includes(sector));
}

/**
 * Search emotions by name (Portuguese or English), case-insensitive.
 * Simple substring match — for fuzzy matching, extend as needed.
 */
export function searchEmotions(query: string): EmotionNode[] {
  const q = query.toLowerCase().trim();
  if (q.length === 0) return [];
  return EMOTIONS.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.nameEn.toLowerCase().includes(q) ||
      e.id.includes(q)
  );
}
