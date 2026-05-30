import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Canvas, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { spacing } from '../../src/theme/spacing';
import { useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const radius = useSharedValue(width * 0.4);

  useEffect(() => {
    // Pulsing gradient background
    radius.value = withRepeat(
      withSequence(
        withTiming(width * 0.5, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(width * 0.4, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, [radius, width]);

  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={vec(width / 2, height / 2)}
            r={radius}
            colors={['#1E1B4B', '#09090B']} // Very deep violet to black
          />
        </Rect>
      </Canvas>

      <SafeArea>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Typography variant="display-lg" color="#F8FAFC" style={styles.centerText}>
              Tudo que você sente tem um nome.
            </Typography>
            <Spacer height={spacing.md} />
            <Typography variant="body-lg" color="#94A3B8" style={styles.centerText}>
              Descubra o mapa das suas emoções.
            </Typography>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/onboarding/intro-wheel')}
          >
            <Typography variant="label-lg" color="#09090B">
              Descobrir
            </Typography>
            <Feather name="arrow-right" size={20} color="#09090B" />
          </Pressable>
        </View>
      </SafeArea>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 999,
    gap: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
