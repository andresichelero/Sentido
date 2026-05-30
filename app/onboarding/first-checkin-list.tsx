import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { EmotionBadge } from '../../src/components/emotion/EmotionBadge';
import { EMOTIONS } from '../../src/data/emotions';
import { useEmotionStore } from '../../src/stores/useEmotionStore';
import { useCheckin } from '../../src/hooks/useCheckin';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing } from '../../src/theme/spacing';
import type { EmotionNode } from '../../src/types/emotion.types';

export default function FirstCheckinListScreen() {
  const colors = useThemeColors();
  const draft = useEmotionStore((s) => s.draft);
  const { addEmotion } = useCheckin();
  
  // Track selected sub-emotions locally before adding them to draft
  const [selectedSubIds, setSelectedSubIds] = useState<Set<string>>(new Set());

  // Get children of the primary emotions already in the draft
  const getSubEmotions = (): EmotionNode[] => {
    if (!draft) return [];
    
    // Find all primary emotion IDs in the draft
    const primaryIds = draft.emotions
      .filter((e) => e.layer === 'primary')
      .map((e) => e.emotionId);

    if (primaryIds.length === 0) {
      // If user skipped or didn't select primary, maybe show a generic list
      // For now, just return all secondary emotions as fallback
      return EMOTIONS.filter((e) => e.layer === 'secondary');
    }

    // Return secondary and tertiary emotions that belong to the selected primary families
    return EMOTIONS.filter(
      (e) => (e.layer === 'secondary' || e.layer === 'tertiary') && primaryIds.includes(e.parentId!)
    );
  };

  const subEmotions = getSubEmotions();

  const handleToggle = (id: string) => {
    const newSet = new Set(selectedSubIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedSubIds(newSet);
  };

  const handleContinue = () => {
    // Add all selected sub-emotions to the draft
    selectedSubIds.forEach((id) => {
      addEmotion(id, 5);
    });
    router.push('/onboarding/first-checkin-body' as any);
  };

  return (
    <SafeArea>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="display-md" style={styles.centerText}>
            Alguma nuance a mais?
          </Typography>
          <Spacer height={spacing.sm} />
          <Typography variant="body-md" color={colors.textSecondary} style={styles.centerText}>
            Você pode refinar como está se sentindo, ou apenas continuar.
          </Typography>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.badgeContainer}>
            {subEmotions.map((emotion) => {
              const isSelected = selectedSubIds.has(emotion.id);
              return (
                <Pressable key={emotion.id} onPress={() => handleToggle(emotion.id)}>
                  <EmotionBadge
                    emotionId={emotion.id}
                    selected={isSelected}
                  />
                </Pressable>
              );
            })}
            {subEmotions.length === 0 && (
              <Typography variant="body-md" color={colors.textSecondary} style={styles.centerText}>
                Nenhuma emoção primária foi selecionada no passo anterior.
              </Typography>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.buttonPrimary,
              { backgroundColor: colors.textPrimary },
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleContinue}
          >
            <Typography variant="label-lg" color={colors.background}>
              {selectedSubIds.size > 0 ? 'Continuar' : 'Pular'}
            </Typography>
          </Pressable>
        </View>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  centerText: {
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: spacing.lg,
  },
  buttonPrimary: {
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
