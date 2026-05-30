// =============================================================================
// IntensityEntry — Interactive sliders to adjust intensity of drafted emotions
// =============================================================================

import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { Typography } from '../ui/Typography';
import { Spacer } from '../ui/Spacer';
import { Button } from '../ui/Button';
import { useEmotionStore } from '../../stores/useEmotionStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing, radii } from '../../theme/spacing';
import { getEmotionById } from '../../utils/emotion-math';

const INTENSITY_LABELS: Record<number, string> = {
  0: 'Não definida',
  1: 'Muito leve',
  2: 'Leve',
  3: 'Suave',
  4: 'Moderada',
  5: 'Média',
  6: 'Notável',
  7: 'Forte',
  8: 'Intensa',
  9: 'Muito intensa',
  10: 'Avassaladora',
};

export function IntensityEntry() {
  const draft = useEmotionStore((s) => s.draft);
  const setIntensity = useEmotionStore((s) => s.setIntensity);
  const setEntryMode = useEmotionStore((s) => s.setEntryMode);
  const resetDraft = useEmotionStore((s) => s.resetDraft);
  const colors = useThemeColors();
  const language = useSettingsStore((s) => s.language);

  const handleIntensityChange = useCallback(
    (emotionId: string, value: number) => {
      setIntensity(emotionId, Math.round(value));
    },
    [setIntensity]
  );

  if (!draft || draft.emotions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant="body-md" color={colors.textSecondary} center>
          Nenhuma emoção registrada.{'\n'}Volte para a Roda ou Corpo para escolher.
        </Typography>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Typography variant="heading-sm" color={colors.textPrimary}>
        Qual a intensidade dessas emoções?
      </Typography>
      <Spacer height={spacing.xs} />
      <Typography variant="body-sm" color={colors.textTertiary}>
        Arraste os controles para ajustar
      </Typography>
      <Spacer height={spacing.lg} />

      {draft.emotions.map((e) => {
        const emotion = getEmotionById(e.emotionId);
        if (!emotion) return null;

        const label = INTENSITY_LABELS[e.intensity] || '';

        return (
          <View
            key={e.emotionId}
            style={[styles.card, { backgroundColor: colors.surface2 }]}
          >
            {/* Header: emotion name + intensity number */}
            <View style={styles.headerRow}>
              <View style={styles.nameRow}>
                <View style={[styles.dot, { backgroundColor: emotion.color }]} />
                <Typography variant="label-lg">
                  {language === 'en-US' ? emotion.nameEn : emotion.name}
                </Typography>
              </View>
              <View style={[styles.intensityBadge, { backgroundColor: emotion.color + '25' }]}>
                <Typography variant="label-lg" color={emotion.color}>
                  {e.intensity}
                </Typography>
              </View>
            </View>

            {/* Slider */}
            <Spacer height={spacing.sm} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={e.intensity}
              onValueChange={(value) => handleIntensityChange(e.emotionId, value)}
              minimumTrackTintColor={emotion.color}
              maximumTrackTintColor={colors.surface3}
              thumbTintColor={emotion.color}
            />

            {/* Label */}
            <Typography variant="body-sm" color={colors.textSecondary} center>
              {label}
            </Typography>
          </View>
        );
      })}

      <Spacer height={spacing.xl} />
      
      {/* Actions */}
      <View style={styles.actionsRow}>
        <Button
          label="Voltar"
          variant="secondary"
          size="sm"
          onPress={() => setEntryMode('body')}
        />
        <Button
          label="Cancelar"
          variant="ghost"
          size="sm"
          onPress={() => resetDraft()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  intensityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 9999,
    minWidth: 32,
    alignItems: 'center',
  },
  slider: {
    height: 36,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
});
