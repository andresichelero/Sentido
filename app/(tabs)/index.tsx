// =============================================================================
// Check-in Tab — Main screen with emotion wheel + EmotionSheet
// FASE 5: Full check-in flow with bottom sheet and floating CTA
// =============================================================================

import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  FadeInDown,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { Button } from '../../src/components/ui/Button';
import { EmotionBadge } from '../../src/components/emotion/EmotionBadge';
import { BodyMapEntry } from '../../src/components/checkin/BodyMapEntry';
import { IntensityEntry } from '../../src/components/checkin/IntensityEntry';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { useCheckin } from '../../src/hooks/useCheckin';
import { useWheelStore } from '../../src/stores/useWheelStore';
import { useEmotionStore } from '../../src/stores/useEmotionStore';
import { spacing } from '../../src/theme/spacing';
import { spring as springConfig } from '../../src/theme/motion';
import { EmotionSheet } from '../../src/components/emotion/EmotionSheet';
import { AuraBackground } from '../../src/components/ui/AuraBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { EmotionWheel } from '../../src/components/emotion/wheel/EmotionWheel';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function CheckinScreen() {
  const colors = useThemeColors();
  const today = format(new Date(), "EEEE, d 'de' MMMM");

  // Wheel state
  const selectedEmotionId = useWheelStore((s) => s.selectedEmotionId);
  const selectEmotion = useWheelStore((s) => s.selectEmotion);

  // Check-in flow
  const {
    startCheckin,
    finishCheckin,
    canFinish,
    emotionCount,
    draft,
  } = useCheckin();

  const entryMode = useEmotionStore((s) => s.entryMode);
  const setEntryMode = useEmotionStore((s) => s.setEntryMode);

  // Auto-init draft when screen mounts if none exists
  useEffect(() => {
    if (!draft) {
      startCheckin('wheel');
    }
  }, [draft, startCheckin]);

  // Sheet open state derived from wheel selection
  const isSheetOpen = selectedEmotionId !== null;

  const handleCloseSheet = useCallback(() => {
    selectEmotion(null);
  }, [selectEmotion]);

  const handleFinishCheckin = useCallback(async () => {
    const id = await finishCheckin();
    if (id) {
      // Check-in saved successfully — draft and wheel already reset by the hook
      // Could navigate to a celebration screen in the future
    }
  }, [finishCheckin]);

  // Entry mode pill press handlers
  const handleModeWheel = useCallback(() => setEntryMode('wheel'), [setEntryMode]);
  const handleModeBody = useCallback(() => setEntryMode('body'), [setEntryMode]);
  
  const handleModeIntensity = useCallback(() => {
    setEntryMode('intensity');
  }, [setEntryMode]);

  // Sliding panels animations
  const wheelTranslateX = useSharedValue(0);
  const bodyTranslateX = useSharedValue(SCREEN_WIDTH);
  const intensityTranslateX = useSharedValue(SCREEN_WIDTH);

  useEffect(() => {
    wheelTranslateX.value = withSpring(entryMode === 'wheel' ? 0 : -SCREEN_WIDTH, {
      damping: 15,
      stiffness: 120,
    });
    bodyTranslateX.value = withSpring(entryMode === 'body' ? 0 : SCREEN_WIDTH, {
      damping: 15,
      stiffness: 120,
    });
    intensityTranslateX.value = withSpring(entryMode === 'intensity' ? 0 : SCREEN_WIDTH, {
      damping: 15,
      stiffness: 120,
    });
  }, [entryMode, wheelTranslateX, bodyTranslateX, intensityTranslateX]);

  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: wheelTranslateX.value }],
  }));
  
  const bodyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bodyTranslateX.value }],
  }));

  const intensityAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: intensityTranslateX.value }],
  }));

  // Floating CTA animation
  const ctaScale = useSharedValue(0);
  useEffect(() => {
    ctaScale.value = withSpring(canFinish ? 1 : 0, springConfig.default);
  }, [canFinish, ctaScale]);

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
    opacity: ctaScale.value,
  }));

  return (
    <>
      <AuraBackground />
      <SafeArea edges={['top']}>
        <View style={styles.container}>
          {/* Header */}
        <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.header}>
          <View>
            <Typography variant="display-md">Sentido</Typography>
            <Spacer height={4} />
            <Typography variant="body-sm" color={colors.textSecondary}>
              {getGreeting()} · {today}
            </Typography>
          </View>
          {/* Profile icon */}
          <Pressable
            style={[styles.profileIcon, { borderColor: colors.borderDefault }]}
            onPress={() => router.push('/profile')}
          >
            <Feather name="user" size={18} color={colors.textSecondary} />
          </Pressable>
        </Animated.View>

        {/* Entry Area (Sliding Panels) */}
        <Animated.View entering={FadeIn.delay(800).duration(1200)} style={styles.entryArea}>
          <Animated.View style={[StyleSheet.absoluteFill, wheelAnimatedStyle]}>
            <View style={styles.wheelContainer}>
              <EmotionWheel animateEntrance={true} />
            </View>
          </Animated.View>
          
          <Animated.View style={[StyleSheet.absoluteFill, bodyAnimatedStyle]}>
            <View style={styles.bodyMapContainer}>
              <BodyMapEntry />
            </View>
          </Animated.View>
          
          <Animated.View style={[StyleSheet.absoluteFill, intensityAnimatedStyle]}>
            <View style={styles.bodyMapContainer}>
              <IntensityEntry />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Registered emotions badges */}
        {draft && draft.emotions.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.registeredEmotions}
          >
            <Typography
              variant="label-sm"
              color={colors.textTertiary}
              style={styles.registeredLabel}
            >
              REGISTRADAS ({draft.emotions.length})
            </Typography>
            <View style={styles.badgeRow}>
              {draft.emotions.map((e) => (
                <EmotionBadge
                  key={e.emotionId}
                  emotionId={e.emotionId}
                  selected
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Entry mode pills */}
        <Animated.View entering={FadeInDown.delay(1400).duration(800)} style={styles.entryModes}>
          <Pressable
            onPress={handleModeWheel}
            style={[
              styles.pill,
              {
                backgroundColor:
                  entryMode === 'wheel'
                    ? colors.activeEmotionColor
                    : colors.surface2,
              },
            ]}
          >
            <Typography
              variant="label-md"
              color={entryMode === 'wheel' ? '#FFFFFF' : colors.textSecondary}
            >
              Roda
            </Typography>
          </Pressable>
          <Pressable
            onPress={handleModeBody}
            style={[
              styles.pill,
              {
                backgroundColor:
                  entryMode === 'body'
                    ? colors.activeEmotionColor
                    : colors.surface2,
              },
            ]}
          >
            <Typography
              variant="label-md"
              color={entryMode === 'body' ? '#FFFFFF' : colors.textSecondary}
            >
              Corpo
            </Typography>
          </Pressable>
          <Pressable
            onPress={handleModeIntensity}
            style={[
              styles.pill,
              {
                backgroundColor:
                  entryMode === 'intensity'
                    ? colors.activeEmotionColor
                    : colors.surface2,
              },
            ]}
          >
            <Typography
              variant="label-md"
              color={
                entryMode === 'intensity' ? '#FFFFFF' : colors.textSecondary
              }
            >
              Intensidade
            </Typography>
          </Pressable>
        </Animated.View>

        {/* Floating "Concluir check-in" CTA */}
        {canFinish && (
          <Animated.View style={[styles.floatingCta, ctaAnimatedStyle]}>
            <Button
              label={`Concluir check-in (${emotionCount})`}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleFinishCheckin}
            />
          </Animated.View>
        )}

        {/* EmotionSheet */}
        <EmotionSheet
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          emotionId={selectedEmotionId}
        />
      </View>
    </SafeArea>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  entryArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyMapContainer: {
    flex: 1,
  },
  registeredEmotions: {
    paddingBottom: spacing.sm,
  },
  registeredLabel: {
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  entryModes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 9999,
  },
  floatingCta: {
    position: 'absolute',
    bottom: spacing.xl + 60, // Above tab bar
    left: spacing.md,
    right: spacing.md,
  },
});
