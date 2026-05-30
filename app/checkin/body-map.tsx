import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { AuraBackground } from '../../src/components/ui/AuraBackground';
import { BodyMapEntry } from '../../src/components/checkin/BodyMapEntry';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing } from '../../src/theme/spacing';

export default function IndependentBodyMapScreen() {
  const colors = useThemeColors();

  return (
    <>
      <AuraBackground />
      <SafeArea edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Header with back button */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surface2 }]}
            >
              <Feather name="x" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Reusing the BodyMapEntry component that contains the interactive body map logic */}
          <View style={styles.content}>
            <BodyMapEntry />
          </View>
        </View>
      </SafeArea>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginTop: spacing.md,
  },
});
