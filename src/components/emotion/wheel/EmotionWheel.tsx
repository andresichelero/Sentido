import { Canvas, Group } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useDerivedValue, useSharedValue, withSpring, withDelay, withTiming } from 'react-native-reanimated';

import { DYADS } from '../../../data/dyads';
import { EMOTIONS } from '../../../data/emotions';
import { useAppStore } from '../../../stores/useAppStore';
import { useWheelStore } from '../../../stores/useWheelStore';
import type { EmotionNode, PlutchikSector } from '../../../types/emotion.types';
import { DyadLabel } from './DyadLabel';
import { WheelIdle } from './WheelIdle';
import { WheelRing } from './WheelRing';

export const SECTOR_ORDER: PlutchikSector[] = [
  'joy',
  'trust',
  'fear',
  'surprise',
  'sadness',
  'disgust',
  'anger',
  'anticipation',
];

interface EmotionWheelProps {
  size?: number;
  mode?: 'full' | 'compact';
  animateEntrance?: boolean;
}

export const EmotionWheel: React.FC<EmotionWheelProps> = ({ size, mode = 'full', animateEntrance = false }) => {
  const windowWidth = Dimensions.get('window').width;
  const defaultSize = windowWidth - 32;
  const wheelSize = size || defaultSize;
  const cx = wheelSize / 2;
  const cy = wheelSize / 2;

  const activeSector = useWheelStore((s) => s.activeSector);
  const setActiveSector = useWheelStore((s) => s.setActiveSector);
  const selectEmotion = useWheelStore((s) => s.selectEmotion);
  const setActiveEmotionColor = useAppStore((s) => s.setActiveEmotionColor);
  
  const primaryEmotions = useMemo(() => EMOTIONS.filter((e) => e.layer === 'primary'), []);
  
  const getSortedRings = (intensity: 1 | 2 | 3) => {
    return SECTOR_ORDER.map((sector) => 
      primaryEmotions.find((e) => e.sector === sector && e.intensityLevel === intensity)
    ).filter((e): e is EmotionNode => e !== undefined);
  };

  const intensity3 = useMemo(() => getSortedRings(3), [primaryEmotions]);
  const intensity2 = useMemo(() => getSortedRings(2), [primaryEmotions]);
  const intensity1 = useMemo(() => getSortedRings(1), [primaryEmotions]);

  const radiusOuter = cx * 0.85;
  const radiusMid = cx * 0.65;
  const radiusInner = cx * 0.40;
  const radiusCenter = cx * 0.18;

  const rotation = useSharedValue(0);
  const startRotation = useSharedValue(0);
  const touchStartAngle = useSharedValue(0);
  const lastNotch = useSharedValue(0);
  const isRotating = useSharedValue(false);

  const clearRotationFlag = () => {
    setTimeout(() => {
      isRotating.value = false;
    }, 300);
  };

  // Entrance animations
  const dyadsOpacity = useSharedValue(animateEntrance ? 0 : 1);
  const ring1Scale = useSharedValue(animateEntrance ? 0 : 1);
  const ring2Scale = useSharedValue(animateEntrance ? 0 : 1);
  const ring3Scale = useSharedValue(animateEntrance ? 0 : 1);

  useEffect(() => {
    if (animateEntrance) {
      dyadsOpacity.value = withTiming(1, { duration: 1200 });
      ring1Scale.value = withDelay(400, withTiming(1, { duration: 800 }));
      ring2Scale.value = withDelay(800, withTiming(1, { duration: 800 }));
      ring3Scale.value = withDelay(1200, withTiming(1, { duration: 800 }));
    }
  }, [animateEntrance, dyadsOpacity, ring1Scale, ring2Scale, ring3Scale]);

  const ring1Transform = useDerivedValue(() => [{ scale: ring1Scale.value }]);
  const ring2Transform = useDerivedValue(() => [{ scale: ring2Scale.value }]);
  const ring3Transform = useDerivedValue(() => [{ scale: ring3Scale.value }]);
  const dyadsTransform = useDerivedValue(() => [{ scale: ring1Scale.value }]); // Optional scale for dyads

  useEffect(() => {
    if (activeSector) {
      const sectorIndex = SECTOR_ORDER.indexOf(activeSector);
      if (sectorIndex !== -1) {
        // Rotate to the bottom instead of the top (+180 degrees)
        const targetAngle = 180 - sectorIndex * 45;
        let currentRaw = rotation.value;
        let delta = (targetAngle - currentRaw) % 360;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        rotation.value = withSpring(currentRaw + delta, {
          damping: 20,
          stiffness: 250,
        });
      }
    }
  }, [activeSector, rotation]);

  const handleWheelTouch = (x: number, y: number, isDoubleTap: boolean) => {
    if (isRotating.value) return;

    const dx = x - cx;
    const dy = y - cy;
    const radius = Math.sqrt(dx * dx + dy * dy);

    // Center tap
    if (radius < radiusCenter) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveSector(null);
      selectEmotion(null);
      return;
    }

    // Outside bounds
    if (radius > radiusOuter) return;

    let touchAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    
    // Compensate for current rotation
    touchAngle -= rotation.value;
    
    // Normalize to 0-360
    touchAngle = touchAngle % 360;
    if (touchAngle < 0) touchAngle += 360;

    // First sector (Joy) starts at -112.5 degrees (or 247.5 degrees)
    let relativeAngle = touchAngle - 247.5;
    relativeAngle = relativeAngle % 360;
    if (relativeAngle < 0) relativeAngle += 360;

    const sectorIndex = Math.floor(relativeAngle / 45);
    const sectorId = SECTOR_ORDER[sectorIndex];

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Find the exact emotion node touched based on radius
    let selectedNode: EmotionNode | undefined;
    if (radius >= radiusCenter && radius < radiusInner) {
      selectedNode = intensity3[sectorIndex];
    } else if (radius >= radiusInner && radius < radiusMid) {
      selectedNode = intensity2[sectorIndex];
    } else if (radius >= radiusMid && radius <= radiusOuter) {
      selectedNode = intensity1[sectorIndex];
    }

    if (selectedNode) {
      setActiveSector(sectorId);
      if (mode === 'full') {
        selectEmotion(selectedNode.id);
        setActiveEmotionColor(selectedNode.color);
      }
    }
  };

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onEnd((e) => {
      runOnJS(handleWheelTouch)(e.x, e.y, false);
    });

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      const dx = e.x - cx;
      const dy = e.y - cy;
      touchStartAngle.value = Math.atan2(dy, dx);
      startRotation.value = rotation.value;
      lastNotch.value = Math.round(rotation.value / 45) * 45;
    })
    .onChange((e) => {
      const dx = e.x - cx;
      const dy = e.y - cy;
      const currentAngle = Math.atan2(dy, dx);
      
      let delta = currentAngle - touchStartAngle.value;
      
      // Handle cross boundary (-PI and PI)
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      
      if (Math.abs(delta) > 0.05) {
        isRotating.value = true;
      }
      
      const rawAngle = startRotation.value + (delta * 180) / Math.PI;
      
      // Detent knob mechanics (Mathematical Sine Wave)
      // This applies a smooth acceleration/deceleration between notches
      const detentAmplitude = 5.5; // Controls the "stickiness" of the notches
      rotation.value = rawAngle - detentAmplitude * Math.sin((rawAngle / 45) * 2 * Math.PI);

      const nearestNotch = Math.round(rawAngle / 45) * 45;
      if (nearestNotch !== lastNotch.value) {
        lastNotch.value = nearestNotch;
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    })
    .onFinalize(() => {
      if (isRotating.value) {
        const snapAngle = Math.round(rotation.value / 45) * 45;
        rotation.value = withSpring(snapAngle, {
          damping: 20,
          stiffness: 250,
        });
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(clearRotationFlag)();
      } else {
        rotation.value = withSpring(startRotation.value, {
          damping: 20,
          stiffness: 250,
        });
      }
    });

  const taps = singleTap;
  const composedGesture = Gesture.Simultaneous(panGesture, taps);

  const wheelTransform = useDerivedValue(() => {
    return [{ rotate: (rotation.value * Math.PI) / 180 }];
  });

  const handleRotateLeft = () => {
    rotation.value = withSpring(rotation.value - 45, { damping: 20, stiffness: 250 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleRotateRight = () => {
    rotation.value = withSpring(rotation.value + 45, { damping: 20, stiffness: 250 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const content = (
    <View style={{ width: wheelSize, height: wheelSize, alignItems: 'center' }}>
      <View style={{ width: wheelSize, height: wheelSize, position: 'absolute' }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <WheelIdle cx={cx} cy={cy} delay={animateEntrance ? 2000 : 0}>
          {/* Added a Group for Rotation */}
          <Group origin={{ x: cx, y: cy }} transform={wheelTransform}>
            <Group origin={{ x: cx, y: cy }} transform={ring1Transform}>
              <WheelRing
                cx={cx}
                cy={cy}
                innerRadius={radiusMid}
                outerRadius={radiusOuter}
                emotions={intensity1}
                baseOpacity={0.3}
                fontSize={12}
                activeSector={activeSector}
                mode={mode}
              />
            </Group>
            
            <Group origin={{ x: cx, y: cy }} transform={ring2Transform}>
              <WheelRing
                cx={cx}
                cy={cy}
                innerRadius={radiusInner}
                outerRadius={radiusMid}
                emotions={intensity2}
                baseOpacity={1.0}
                fontSize={11}
                activeSector={activeSector}
                mode={mode}
              />
            </Group>
            
            <Group origin={{ x: cx, y: cy }} transform={ring3Transform}>
              <WheelRing
                cx={cx}
                cy={cy}
                innerRadius={radiusCenter}
                outerRadius={radiusInner}
                emotions={intensity3}
                baseOpacity={0.3}
                fontSize={10}
                activeSector={activeSector}
                mode={mode}
                alwaysAnimate={true}
              />
            </Group>

            {/* Outer Dyad Labels */}
            {mode === 'full' && (
              <Group opacity={dyadsOpacity} origin={{ x: cx, y: cy }} transform={dyadsTransform}>
                {DYADS.slice(0, 8).map((dyad, index) => {
                  const baseAngle = -112.5; // Start offset
                  const sweepAngle = 45;
                  const boundaryAngle = baseAngle + (index * sweepAngle) + sweepAngle;
                  
                  return (
                    <DyadLabel
                      key={dyad.id}
                      cx={cx}
                      cy={cy}
                      radius={cx * 0.92}
                      dyad={dyad}
                      angle={boundaryAngle}
                    />
                  );
                })}
              </Group>
            )}
          </Group>
        </WheelIdle>
      </Canvas>
      </View>
      
      {/* Rotation Controls */}
      <View style={{ 
        position: 'absolute', 
        bottom: -90, 
        flexDirection: 'row', 
        gap: 24, 
        backgroundColor: 'rgba(20,20,30,0.1)', 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 30,
        borderWidth: 0,
      }}>
        <Pressable 
          onPress={handleRotateRight}
          style={({ pressed }) => [{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent' }]}>
          <Feather name="rotate-ccw" size={20} color="rgba(255,255,255,0.4)" />
        </Pressable>
        <Pressable 
          onPress={handleRotateLeft}
          style={({ pressed }) => [{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent' }]}>
          <Feather name="rotate-cw" size={20} color="rgba(255,255,255,0.4)" />
        </Pressable>
      </View>
    </View>
  );

  // In compact mode, we still wrap with GestureDetector to allow selecting a sector
  return (
    <GestureDetector gesture={composedGesture}>
      {content}
    </GestureDetector>
  );
};
