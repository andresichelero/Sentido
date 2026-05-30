import React, { useMemo } from 'react';
import { Path, TextPath, useFont } from '@shopify/react-native-skia';
import { createTextPath } from './wheel-math';
import type { EmotionDyad } from '../../../types/emotion.types';

interface DyadLabelProps {
  cx: number;
  cy: number;
  radius: number;
  dyad: EmotionDyad;
  angle: number;
}

export const DyadLabel: React.FC<DyadLabelProps> = ({
  cx,
  cy,
  radius,
  dyad,
  angle,
}) => {
  const font = useFont(require('../../../../assets/fonts/SpaceMono-Regular.ttf'), 11);
  
  const textPath = useMemo(() => {
    return createTextPath(cx, cy, radius, angle - 15, 30);
  }, [cx, cy, radius, angle]);

  const textWidth = font ? font.getTextWidth(dyad.name) : 0;
  const arcLength = 2 * Math.PI * radius * (30 / 360);
  const textOffset = Math.max(0, (arcLength - textWidth) / 2);

  if (!font) return null;

  return (
    <TextPath
      path={textPath}
      font={font}
      text={dyad.name}
      initialOffset={textOffset}
      color="rgba(255, 255, 255, 0.45)"
    />
  );
};
