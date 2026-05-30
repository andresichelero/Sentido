// =============================================================================
// ExploreFilter — Horizontal scrollable sector filters
// =============================================================================

import React from 'react';
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../ui/Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { radii, spacing } from '../../theme/spacing';
import { SECTOR_ORDER } from '../emotion/wheel/EmotionWheel';
import { EMOTIONS } from '../../data/emotions';
import type { PlutchikSector } from '../../types/emotion.types';

interface ExploreFilterProps {
  activeSector: PlutchikSector | null;
  onSelectSector: (sector: PlutchikSector | null) => void;
}

const SECTOR_COLORS: Record<PlutchikSector, string> = {
  joy: '#FBBF24',
  trust: '#34D399',
  fear: '#10B981',
  surprise: '#38BDF8',
  sadness: '#60A5FA',
  disgust: '#A78BFA',
  anger: '#F87171',
  anticipation: '#F97316',
};

const SECTOR_LABELS: Record<PlutchikSector, string> = {
  joy: 'Alegria',
  trust: 'Confiança',
  fear: 'Medo',
  surprise: 'Surpresa',
  sadness: 'Tristeza',
  disgust: 'Aversão',
  anger: 'Raiva',
  anticipation: 'Antecipação',
};

export function ExploreFilter({
  activeSector,
  onSelectSector,
}: ExploreFilterProps) {
  const colors = useThemeColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        onPress={() => onSelectSector(null)}
        style={[
          styles.pill,
          {
            backgroundColor:
              activeSector === null ? colors.textPrimary : colors.surface2,
            borderColor: colors.borderDefault,
          },
        ]}
      >
        <Typography
          variant="label-md"
          color={activeSector === null ? colors.surface1 : colors.textSecondary}
        >
          Todas
        </Typography>
      </Pressable>

      {SECTOR_ORDER.map((sector) => {
        const isActive = activeSector === sector;
        const color = SECTOR_COLORS[sector];

        return (
          <Pressable
            key={sector}
            onPress={() => onSelectSector(isActive ? null : sector)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? color : colors.surface2,
                borderColor: isActive ? color : colors.borderDefault,
              },
            ]}
          >
            <Typography
              variant="label-md"
              color={isActive ? '#FFFFFF' : colors.textSecondary}
            >
              {SECTOR_LABELS[sector]}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
  },
});
