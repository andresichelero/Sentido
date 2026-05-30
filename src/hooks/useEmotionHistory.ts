// =============================================================================
// useEmotionHistory — TanStack Query hooks for history data
// Reads from local SQLite via Drizzle
// =============================================================================

import { useQuery } from '@tanstack/react-query';
import { checkinsLocalDb } from '../services/database/checkins';
import { getEmotionById } from '../utils/emotion-math';
import type { Checkin } from '../types/checkin.types';

const USER_ID = 'local-anonymous'; // Until auth (FASE 9)

/** Get check-ins for the last N days */
export function useCheckinHistory(days: number = 90) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);
  const to = new Date();

  return useQuery({
    queryKey: ['checkins', 'history', days],
    queryFn: () => checkinsLocalDb.getCheckinsInRange(USER_ID, from, to),
    staleTime: 30_000, // 30s — refetch after new check-ins
  });
}

/** Get emotion frequency distribution for the last N days */
export function useEmotionFrequency(days: number = 7) {
  const { data: checkins } = useCheckinHistory(days);

  const frequency = (checkins ?? []).reduce<Record<string, number>>(
    (acc, checkin) => {
      for (const e of checkin.emotions) {
        acc[e.emotionId] = (acc[e.emotionId] ?? 0) + 1;
      }
      return acc;
    },
    {}
  );

  // Sort by frequency descending
  const sorted = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .map(([emotionId, count]) => ({
      emotionId,
      emotion: getEmotionById(emotionId),
      count,
    }));

  return { data: sorted, isLoading: !checkins };
}

/** Get weekly summary metrics */
export function useWeeklySummary() {
  const { data: checkins, isLoading } = useCheckinHistory(7);

  if (!checkins || checkins.length === 0) {
    return {
      data: {
        totalCheckins: 0,
        dominantEmotion: null as ReturnType<typeof getEmotionById> | null,
        averageValence: 0,
      },
      isLoading,
    };
  }

  const totalCheckins = checkins.length;

  // Find dominant emotion
  const freq: Record<string, number> = {};
  for (const c of checkins) {
    for (const e of c.emotions) {
      freq[e.emotionId] = (freq[e.emotionId] ?? 0) + 1;
    }
  }
  const dominantId = Object.entries(freq).sort(([, a], [, b]) => b - a)[0]?.[0];
  const dominantEmotion = dominantId ? getEmotionById(dominantId) ?? null : null;

  // Average valence
  const averageValence =
    checkins.reduce((sum, c) => sum + c.valenceScore, 0) / totalCheckins;

  return {
    data: { totalCheckins, dominantEmotion, averageValence },
    isLoading,
  };
}

/** Get valence/arousal scatter data for the last N days */
export function useValenceArousalData(days: number = 7) {
  const { data: checkins, isLoading } = useCheckinHistory(days);

  const points = (checkins ?? []).map((c) => {
    // Find dominant emotion color
    const dominantEmotion = c.emotions[0]
      ? getEmotionById(c.emotions[0].emotionId)
      : undefined;

    return {
      id: c.id,
      valence: c.valenceScore / 5, // Normalize to -1..+1
      arousal: c.arousalScore / 10, // Normalize to 0..1
      color: dominantEmotion?.color ?? '#818CF8',
      emotionCount: c.emotions.length,
      date: c.checkedAt,
      emotions: c.emotions,
    };
  });

  return { data: points, isLoading };
}

/**
 * Group checkins by date string for the heatmap calendar.
 * Returns a map of 'YYYY-MM-DD' → { count, dominantColor }
 */
export function useHeatmapData(days: number = 90) {
  const { data: checkins, isLoading } = useCheckinHistory(days);

  const heatmap = new Map<string, { count: number; dominantColor: string }>();

  for (const c of checkins ?? []) {
    const dateKey = formatDateKey(c.checkedAt);
    const existing = heatmap.get(dateKey);
    const dominantEmotion = c.emotions[0]
      ? getEmotionById(c.emotions[0].emotionId)
      : undefined;
    const color = dominantEmotion?.color ?? '#818CF8';

    if (existing) {
      existing.count += 1;
    } else {
      heatmap.set(dateKey, { count: 1, dominantColor: color });
    }
  }

  return { data: heatmap, isLoading };
}

function formatDateKey(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Get the current consecutive check-in streak */
export function useUserStreak() {
  return useQuery({
    queryKey: ['checkins', 'streak'],
    queryFn: () => checkinsLocalDb.getUserStreak(USER_ID),
  });
}

/** Get the total number of check-ins */
export function useTotalCheckins() {
  return useQuery({
    queryKey: ['checkins', 'total'],
    queryFn: () => checkinsLocalDb.getTotalCheckins(USER_ID),
  });
}
