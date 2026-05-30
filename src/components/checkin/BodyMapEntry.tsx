// =============================================================================
// Body Map Check-in — Tela de entrada de emoção pelo corpo
// Spec section 11.6
// =============================================================================

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '../ui/Typography';
import { Spacer } from '../ui/Spacer';
import { Button } from '../ui/Button';
import { EmotionBadge } from '../emotion/EmotionBadge';
import { BodyMapCanvas } from '../body-map/BodyMapCanvas';
import { useBodyMap } from '../../hooks/useBodyMap';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useEmotionStore } from '../../stores/useEmotionStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { spacing } from '../../theme/spacing';

export function BodyMapEntry() {
  const colors = useThemeColors();
  const setEntryMode = useEmotionStore((s) => s.setEntryMode);
  const draft = useEmotionStore((s) => s.draft);
  const language = useSettingsStore((s) => s.language);
  
  const {
    selectedRegions,
    toggleRegion,
    suggestedEmotions,
    selectedEmotionIds,
    toggleSuggestedEmotion,
    confirmSelection,
    canConfirm,
    clearRegions,
  } = useBodyMap();

  const handleConfirm = () => {
    confirmSelection();
    setEntryMode('intensity');
  };

  useEffect(() => {
    if (!draft) {
      clearRegions();
    }
  }, [draft, clearRegions]);

  return (
    <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="display-md">
            {language === 'en-US' ? 'In the Body' : 'No Corpo'}
          </Typography>
          <Spacer height={spacing.xs} />
          <Typography variant="body-md" color={colors.textSecondary}>
            {language === 'en-US' ? 'Tap where you are feeling something right now' : 'Toque onde você está sentindo algo agora'}
          </Typography>
        </View>

        {/* Body map — ~65% screen */}
        <View style={styles.bodyMapContainer}>
          <BodyMapCanvas
            mode="input"
            activeRegions={selectedRegions}
            onRegionPress={toggleRegion}
            onClearRegions={clearRegions}
            accentColor={colors.activeEmotionColor}
          />
        </View>

        {/* Suggestions section */}
        <View style={styles.suggestionsSection}>
          {suggestedEmotions.length > 0 && (
            <>
              <Typography
                variant="label-lg"
                color={colors.textTertiary}
                style={styles.sectionLabel}
              >
                {language === 'en-US' ? 'COULD BE...' : 'PODE SER...'}
              </Typography>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgeRow}
              >
                {suggestedEmotions.map((emotion) => (
                  <EmotionBadge
                    key={emotion.id}
                    emotionId={emotion.id}
                    selected={selectedEmotionIds.includes(emotion.id)}
                    onPress={toggleSuggestedEmotion}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {selectedRegions.length === 0 && (
            <View style={styles.emptyState}>
              <Typography
                variant="body-sm"
                color={colors.textTertiary}
                center
              >
                {language === 'en-US' ? 'Tap the silhouette to indicate where you feel something' : 'Toque na silhueta para indicar onde sente algo'}
              </Typography>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label={`${language === 'en-US' ? 'Confirm selection' : 'Confirmar seleção'}${canConfirm ? ` (${selectedEmotionIds.length})` : ''}`}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canConfirm}
            onPress={handleConfirm}
          />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  bodyMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsSection: {
    minHeight: 70,
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
    letterSpacing: 1.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  actions: {
    paddingBottom: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
});
