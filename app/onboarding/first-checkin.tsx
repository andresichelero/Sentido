import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useDerivedValue,
  SharedValue,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { EMOTIONS } from '../../src/data/emotions';
import { useCheckin } from '../../src/hooks/useCheckin';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing } from '../../src/theme/spacing';

const { width } = Dimensions.get('window');
const WHEEL_RADIUS = width * 0.35;
const BUBBLE_BASE_SIZE = width * 0.16;
const BUBBLE_ACTIVE_SIZE = width * 0.28;

const primaryEmotions = EMOTIONS.filter((e) => e.layer === 'primary');

interface BubbleProps {
  emotion: typeof primaryEmotions[0];
  index: number;
  total: number;
  rotation: SharedValue<number>;
  isSelected: boolean;
  onToggle: () => void;
}

const Bubble = ({ emotion, index, total, rotation, isSelected, onToggle }: BubbleProps) => {
  const colors = useThemeColors();
  const initialAngle = (index / total) * Math.PI * 2;
  
  // The angle of this specific bubble in the global space
  const currentAngle = useDerivedValue(() => {
    // Normalize angle between 0 and 2*PI
    const a = (initialAngle + rotation.value) % (Math.PI * 2);
    return a < 0 ? a + Math.PI * 2 : a;
  });

  // Calculate if bubble is near the bottom (6 o'clock position = Math.PI / 2)
  const isAtBottom = useDerivedValue(() => {
    // Math.PI / 2 is bottom in standard circle (cos(pi/2)=0, sin(pi/2)=1)
    const target = Math.PI / 2;
    // Distance to target, wrapping around
    let diff = Math.abs(currentAngle.value - target);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;
    
    // Threshold: if within ~22 degrees
    return diff < 0.4;
  });

  const animatedStyle = useAnimatedStyle(() => {
    const cx = Math.cos(currentAngle.value) * WHEEL_RADIUS;
    const cy = Math.sin(currentAngle.value) * WHEEL_RADIUS;
    
    const scale = withSpring(isAtBottom.value ? 1 : 0.8, { damping: 15 });
    const opacity = withTiming(isAtBottom.value ? 1 : 0.4, { duration: 200 });

    return {
      transform: [
        { translateX: cx },
        { translateY: cy },
        { scale },
      ],
      opacity,
      zIndex: isAtBottom.value ? 10 : 1,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isAtBottom.value ? 1 : 0, { duration: 200 }),
      transform: [{ translateY: withSpring(isAtBottom.value ? 0 : 10) }],
    };
  });

  const outlineStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelected ? 1 : 0, { duration: 200 }),
      transform: [{ scale: withSpring(isSelected ? 1.15 : 1) }],
    };
  });

  return (
    <Animated.View style={[styles.bubbleWrapper, animatedStyle]}>
      {/* Selection Ring */}
      <Animated.View
        style={[
          styles.selectionRing,
          { borderColor: emotion.color },
          outlineStyle
        ]}
      />
      
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.bubble,
          { backgroundColor: emotion.color },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Typography variant="label-sm" color="rgba(255,255,255,0.9)" style={styles.bubbleText}>
            {emotion.name}
          </Typography>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default function FirstCheckinScreen() {
  const colors = useThemeColors();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { startCheckin, addEmotion } = useCheckin();

  const rotation = useSharedValue(0);
  const contextRotation = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      contextRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      // Convert translationX into rotation angle
      // Dragging right rotates clockwise, left counter-clockwise
      const deltaRotation = event.translationX / (WHEEL_RADIUS * 1.5);
      rotation.value = contextRotation.value + deltaRotation;
    })
    .onEnd((event) => {
      // Optional: add decay/inertia here
      // To keep it simple, we just snap to nearest sector
      const sectorAngle = (Math.PI * 2) / primaryEmotions.length;
      const nearestSector = Math.round(rotation.value / sectorAngle);
      rotation.value = withSpring(nearestSector * sectorAngle, {
        damping: 15,
        stiffness: 90,
      });
    });

  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleContinue = () => {
    if (selectedIds.size === 0) return;
    
    // Start the check-in and add the selected primary emotions
    startCheckin('wheel');
    selectedIds.forEach((id) => {
      addEmotion(id, 5);
    });

    // Navigate to next step
    router.push('/onboarding/first-checkin-list' as any);
  };

  return (
    <SafeArea>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="display-md" style={styles.centerText}>
            Como você está chegando aqui hoje?
          </Typography>
          <Spacer height={spacing.sm} />
          <Typography variant="body-md" color={colors.textSecondary} style={styles.centerText}>
            Gire as bolhas e toque para selecionar. Você pode escolher mais de uma.
          </Typography>
        </View>

        <View style={styles.wheelContainer}>
          <GestureDetector gesture={pan}>
            <View style={styles.gestureArea}>
              <View style={styles.centerPoint}>
                {primaryEmotions.map((emotion, index) => (
                  <Bubble
                    key={emotion.id}
                    emotion={emotion}
                    index={index}
                    total={primaryEmotions.length}
                    rotation={rotation}
                    isSelected={selectedIds.has(emotion.id)}
                    onToggle={() => handleToggle(emotion.id)}
                  />
                ))}
              </View>
            </View>
          </GestureDetector>
        </View>

        <View style={styles.footer}>
          {selectedIds.size > 0 ? (
            <Animated.View entering={undefined}>
              <Pressable
                style={({ pressed }) => [
                  styles.buttonPrimary,
                  { backgroundColor: colors.textPrimary },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleContinue}
              >
                <Typography variant="label-lg" color={colors.background}>
                  Continuar
                </Typography>
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable
              style={styles.skipButton}
              onPress={() => router.push('/onboarding/first-checkin-list' as any)}
            >
              <Typography variant="label-md" color={colors.textTertiary}>
                Pular
              </Typography>
            </Pressable>
          )}
        </View>
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
    zIndex: 10,
  },
  centerText: {
    textAlign: 'center',
  },
  wheelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gestureArea: {
    width: WHEEL_RADIUS * 2.5,
    height: WHEEL_RADIUS * 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'rgba(255,255,255,0.05)', // Debug area
    borderRadius: 999,
  },
  centerPoint: {
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleWrapper: {
    position: 'absolute',
    width: BUBBLE_ACTIVE_SIZE,
    height: BUBBLE_ACTIVE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    // offset so the center of the bubble is at 0,0
    left: -BUBBLE_ACTIVE_SIZE / 2,
    top: -BUBBLE_ACTIVE_SIZE / 2,
  },
  selectionRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 2,
  },
  bubble: {
    width: BUBBLE_BASE_SIZE,
    height: BUBBLE_BASE_SIZE,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  textContainer: {
    position: 'absolute',
    width: '200%', // Allow text to extend outside bubble
    alignItems: 'center',
  },
  bubbleText: {
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
  },
  buttonPrimary: {
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
