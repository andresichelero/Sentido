import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { EmotionWheel } from '../../src/components/emotion/wheel/EmotionWheel';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing } from '../../src/theme/spacing';

export default function IntroWheelScreen() {
  const colors = useThemeColors();
  
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Sequence of entrance animations
    textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(300, withTiming(0, { duration: 800 }));
    
    // EmotionWheel does its own internal 1500ms animation, so delay button
    buttonOpacity.value = withDelay(2500, withTiming(1, { duration: 500 }));
  }, [textOpacity, textTranslateY, buttonOpacity]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const wheelStyle = useAnimatedStyle(() => ({
    opacity: 1, // Let EmotionWheel handle its own entrance
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  return (
    <SafeArea>
      <View style={styles.container}>
        <Animated.View style={[styles.header, textStyle]}>
          <Typography variant="display-md" style={styles.centerText}>
            Esta é a Roda das Emoções.
          </Typography>
          <Spacer height={spacing.sm} />
          <Typography variant="body-md" color={colors.textSecondary} style={styles.centerText}>
            Cada cor é uma família de sentimentos. As emoções mais intensas ficam no centro, e as mais suaves nas bordas.
          </Typography>
        </Animated.View>

        <Animated.View style={[styles.wheelContainer, wheelStyle]}>
          {/* We use compact mode to prevent sheet opening, but it will hide text. 
              Let's use full mode, but without checking the store to open sheet.
              Since we are not in (tabs), the sheet from index.tsx won't open here!
          */}
          <EmotionWheel size={320} mode="full" animateEntrance={true} />
        </Animated.View>

        <Animated.View style={[styles.footer, buttonStyle]}>
          <Pressable
            style={({ pressed }) => [
              styles.buttonPrimary,
              { backgroundColor: colors.textPrimary },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push('/onboarding/first-checkin' as any)}
          >
            <Typography variant="label-lg" color={colors.background}>
              Entendi
            </Typography>
          </Pressable>
          <Spacer height={spacing.md} />
          <Pressable
            style={styles.buttonSecondary}
            onPress={() => router.push('/onboarding/first-checkin' as any)}
          >
            <Typography variant="label-md" color={colors.textTertiary}>
              Pular
            </Typography>
          </Pressable>
        </Animated.View>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  centerText: {
    textAlign: 'center',
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    width: '100%',
    paddingBottom: spacing.lg,
  },
  buttonPrimary: {
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
