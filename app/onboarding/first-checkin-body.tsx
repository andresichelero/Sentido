import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { useEmotionStore } from '../../src/stores/useEmotionStore';
import { useUserStore } from '../../src/stores/useUserStore';
import { useCheckin } from '../../src/hooks/useCheckin';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing } from '../../src/theme/spacing';
import type { BodyRegionId } from '../../src/types/emotion.types';

// Simple mapping of body regions for the onboarding
const BODY_REGIONS: { id: BodyRegionId; label: string }[] = [
  { id: 'head', label: 'Cabeça' },
  { id: 'chest-upper', label: 'Peito' },
  { id: 'stomach', label: 'Estômago' },
  { id: 'left-shoulder', label: 'Ombros' },
  { id: 'neck-throat', label: 'Pescoço' },
  { id: 'left-upper-arm', label: 'Braços' },
  { id: 'left-hand', label: 'Mãos' },
  { id: 'left-thigh', label: 'Pernas' },
  { id: 'left-foot', label: 'Pés' },
  { id: 'face-upper', label: 'Rosto' },
];

export default function FirstCheckinBodyScreen() {
  const colors = useThemeColors();
  const setIsOnboarded = useUserStore((s) => s.setIsOnboarded);
  const { finishCheckin } = useCheckin();

  const [selectedRegions, setSelectedRegions] = useState<Set<BodyRegionId>>(new Set());

  const handleToggle = (id: BodyRegionId) => {
    const newSet = new Set(selectedRegions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRegions(newSet);
  };

  const handleFinish = async () => {
    // 1. Save selected body regions to draft
    useEmotionStore.setState((state) => ({
      draft: state.draft
        ? { ...state.draft, bodyRegions: Array.from(selectedRegions) }
        : null,
    }));

    // 2. Mark as onboarded locally
    await SecureStore.setItemAsync('has_completed_onboarding', 'true');
    setIsOnboarded(true);

    // 3. Finalize the checkin (saves to SQLite, calculates scores, triggers sync)
    await finishCheckin();

    // 4. Navigate home!
    router.replace('/(tabs)');
  };

  return (
    <SafeArea>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="display-md" style={styles.centerText}>
            E no corpo?
          </Typography>
          <Spacer height={spacing.sm} />
          <Typography variant="body-md" color={colors.textSecondary} style={styles.centerText}>
            Como isso está se manifestando fisicamente?
          </Typography>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {BODY_REGIONS.map((region) => {
              const isSelected = selectedRegions.has(region.id);
              return (
                <Pressable
                  key={region.id}
                  style={[
                    styles.regionButton,
                    { borderColor: colors.surface3 },
                    isSelected && {
                      backgroundColor: colors.textPrimary,
                      borderColor: colors.textPrimary,
                    },
                  ]}
                  onPress={() => handleToggle(region.id)}
                >
                  <Typography
                    variant="label-md"
                    color={isSelected ? colors.background : colors.textPrimary}
                  >
                    {region.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.buttonPrimary,
              { backgroundColor: colors.textPrimary },
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleFinish}
          >
            <Typography variant="label-lg" color={colors.background}>
              Finalizar Check-in
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  regionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
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
