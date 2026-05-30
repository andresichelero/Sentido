// =============================================================================
// Intensity Entry Mode — Initial screen to start a check-in by intensity
// =============================================================================
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { Button } from '../../src/components/ui/Button';
import { useEmotionStore } from '../../src/stores/useEmotionStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing } from '../../src/theme/spacing';

const INTENSITY_LABELS: Record<number, string> = {
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

export default function IntensityRoute() {
  const colors = useThemeColors();
  const initDraft = useEmotionStore((s) => s.initDraft);
  const [value, setValue] = useState(5);

  const handleConfirm = () => {
    initDraft('intensity');
    // Em uma implementação futura, a Roda pode ler esse parâmetro para focar o zoom
    router.push({ pathname: '/(tabs)', params: { initialIntensity: value } });
  };

  return (
    <SafeArea>
      <View style={styles.container}>
        <View style={styles.header}>
          <Feather name="activity" size={32} color={colors.accentDefault} />
          <Spacer height={spacing.md} />
          <Typography variant="display-md" color={colors.textPrimary} center>
            Qual o tamanho do que você está sentindo?
          </Typography>
          <Spacer height={spacing.sm} />
          <Typography variant="body-md" color={colors.textSecondary} center>
            Mesmo sem saber o nome da emoção, defina a intensidade para começarmos.
          </Typography>
        </View>

        <View style={styles.sliderContainer}>
          <Typography variant="display-xl" color={colors.accentDefault} center>
            {value}
          </Typography>
          <Spacer height={spacing.xs} />
          <Typography variant="heading-sm" color={colors.textSecondary} center>
            {INTENSITY_LABELS[value]}
          </Typography>

          <Spacer height={spacing['2xl']} />

          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={value}
            onValueChange={setValue}
            minimumTrackTintColor={colors.accentDefault}
            maximumTrackTintColor={colors.surface3}
            thumbTintColor={colors.accentDefault}
          />
          <View style={styles.sliderLabels}>
            <Typography variant="label-sm" color={colors.textTertiary}>Leve</Typography>
            <Typography variant="label-sm" color={colors.textTertiary}>Forte</Typography>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label="Continuar para a Roda"
            onPress={handleConfirm}
            variant="primary"
          />
          <Spacer height={spacing.sm} />
          <Button
            label="Voltar"
            onPress={() => router.back()}
            variant="ghost"
          />
        </View>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  sliderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.md,
  },
});
