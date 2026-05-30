// =============================================================================
// HeatmapCalendar — 90-day grid showing check-in density
// Each cell: 12×12px, color = emotion dominant color, intensity = count
// =============================================================================

import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing } from '../../theme/spacing';

interface HeatmapCalendarProps {
  /** Map of 'YYYY-MM-DD' → { count, dominantColor } */
  data: Map<string, { count: number; dominantColor: string }>;
  /** Number of days to display */
  days?: number;
  /** Callback when a day cell is pressed */
  onDayPress?: (date: string) => void;
}

const CELL_SIZE = 12;
const CELL_GAP = 3;
const DAYS_OF_WEEK = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

export function HeatmapCalendar({
  data,
  days = 90,
  onDayPress,
}: HeatmapCalendarProps) {
  const colors = useThemeColors();

  const cells = useMemo(() => {
    const result: Array<{
      dateKey: string;
      dayOfWeek: number;
      weekIndex: number;
      count: number;
      color: string;
      monthLabel: string | null;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // We iterate backward from today
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const entry = data.get(key);
      const dayOfWeek = d.getDay(); // 0=Sun
      const weekIndex = Math.floor((days - 1 - i + ((today.getDay() + 7) % 7)) / 7);

      // Show month label on the first day of each month that appears
      const isFirstOfMonth = d.getDate() === 1;
      const monthLabel = isFirstOfMonth ? getMonthLabel(d) : null;

      result.push({
        dateKey: key,
        dayOfWeek,
        weekIndex: days - 1 - i, // Linear index for positioning
        count: entry?.count ?? 0,
        color: entry?.dominantColor ?? colors.surface2,
        monthLabel,
      });
    }

    return result;
  }, [data, days, colors.surface2]);

  // Group by week for column layout
  const weeks = useMemo(() => {
    const w: typeof cells[] = [];
    let currentWeek: typeof cells = [];

    for (const cell of cells) {
      currentWeek.push(cell);
      if (cell.dayOfWeek === 6 || cell === cells[cells.length - 1]) {
        w.push(currentWeek);
        currentWeek = [];
      }
    }
    return w;
  }, [cells]);

  // Compute opacity from count (0 = base, max count = full)
  const maxCount = useMemo(
    () => Math.max(1, ...cells.map((c) => c.count)),
    [cells]
  );

  return (
    <View style={styles.container}>
      {/* Day-of-week labels */}
      <View style={styles.dayLabels}>
        {DAYS_OF_WEEK.map((label, i) => (
          <Typography
            key={i}
            variant="label-sm"
            color={colors.textTertiary}
            style={styles.dayLabel}
          >
            {label}
          </Typography>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekColumn}>
            {week.map((cell) => {
              const opacity = cell.count > 0 ? 0.3 + (cell.count / maxCount) * 0.7 : 0;
              const bgColor =
                cell.count > 0
                  ? cell.color +
                    Math.round(opacity * 255)
                      .toString(16)
                      .padStart(2, '0')
                  : colors.surface2;

              return (
                <Pressable
                  key={cell.dateKey}
                  onPress={() => onDayPress?.(cell.dateKey)}
                  style={[styles.cell, { backgroundColor: bgColor }]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: spacing.xs,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  dayLabel: {
    height: CELL_SIZE + CELL_GAP,
    lineHeight: CELL_SIZE + CELL_GAP,
  },
  grid: {
    flexDirection: 'row',
    gap: CELL_GAP,
    flex: 1,
  },
  weekColumn: {
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
});
