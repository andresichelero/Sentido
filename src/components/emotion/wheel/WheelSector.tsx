import { Group, Path, TextPath, useFont } from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { createSectorPath, createTextPath } from './wheel-math';

interface WheelSectorProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  sweepAngle: number;
  color: string;
  label: string;
  opacity?: number;
  fontSize?: number;
  showText?: boolean;
  isSectorActive?: boolean;
  alwaysAnimate?: boolean;
}

export const WheelSector: React.FC<WheelSectorProps> = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  sweepAngle,
  color,
  label,
  opacity = 1.0,
  fontSize = 12,
  showText = true,
  isSectorActive = false,
  alwaysAnimate = false,
}) => {
  // Use a fallback font if DM Sans isn't directly resolvable by require yet
  const font = useFont(require('../../../../assets/fonts/SpaceMono-Regular.ttf'), fontSize);

  const sectorPath = useMemo(() => {
    return createSectorPath(cx, cy, innerRadius, outerRadius, startAngle, sweepAngle);
  }, [cx, cy, innerRadius, outerRadius, startAngle, sweepAngle]);

  const textPath = useMemo(() => {
    const midRadius = (innerRadius + outerRadius) / 2;
    // Extend the path by 30 degrees on both sides so text has a track to slide on
    return createTextPath(cx, cy, midRadius, startAngle - 30, sweepAngle + 60);
  }, [cx, cy, innerRadius, outerRadius, startAngle, sweepAngle]);

  // Rough calculation to center text in the path
  const textWidth = font ? font.getTextWidth(label) : 0;
  
  const visualArcLength = 2 * Math.PI * ((innerRadius + outerRadius) / 2) * (sweepAngle / 360);
  const extendedArcLength = 2 * Math.PI * ((innerRadius + outerRadius) / 2) * ((sweepAngle + 60) / 360);
  const centerOffset = (extendedArcLength - textWidth) / 2;

  // The extended path starts 30 degrees earlier. The visual path starts at distance:
  const visualStartDistance = 2 * Math.PI * ((innerRadius + outerRadius) / 2) * (30 / 360);

  const marqueeProgress = useSharedValue(0);
  const sharedIsActive = useSharedValue(isSectorActive);

  useEffect(() => {
    sharedIsActive.value = isSectorActive;
  }, [isSectorActive, sharedIsActive]);

  useEffect(() => {
    const shouldAnimate = isSectorActive || alwaysAnimate;
    if (shouldAnimate && font && label.length > 6 && textWidth > visualArcLength * 0.9) {
      // The amount to travel is the text width minus visual area plus some padding
      const overflowAmount = textWidth - visualArcLength + 20;
      const duration = overflowAmount * 120; // Slower for readability

      marqueeProgress.value = 0;
      marqueeProgress.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1500 }), // Pause showing first letter
          withTiming(-overflowAmount, { duration, easing: Easing.linear }), // Scroll left
          withTiming(-overflowAmount, { duration: 1500 }), // Pause showing last letter
          withTiming(0, { duration, easing: Easing.linear }) // Scroll back to start
        ),
        -1,
        false
      );
    } else {
      marqueeProgress.value = 0;
    }
  }, [textWidth, visualArcLength, font, label.length, isSectorActive, alwaysAnimate]);

  const animatedOffset = useDerivedValue(() => {
    const isActive = sharedIsActive.value || alwaysAnimate;
    if (!isActive || label.length <= 6 || textWidth <= visualArcLength * 0.9) {
      // Center statically inside the extended arc (which perfectly centers inside the visual arc)
      return centerOffset;
    }
    // Animated marquee offset starting from the left visual edge (+10px padding)
    const startOffset = visualStartDistance + 10;
    return startOffset + marqueeProgress.value;
  });

  return (
    <>
      <Path path={sectorPath} color={color} opacity={opacity} />
      {font && showText && (
        <Group clip={sectorPath}>
          <TextPath
            path={textPath}
            font={font}
            text={label}
            initialOffset={animatedOffset}
            color="rgba(255, 255, 255, 0.9)"
          />
        </Group>
      )}
    </>
  );
};
