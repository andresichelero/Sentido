import React from 'react';
import { Group } from '@shopify/react-native-skia';
import { WheelSector } from './WheelSector';
import type { EmotionNode, PlutchikSector } from '../../../types/emotion.types';
import { useSettingsStore } from '../../../stores/useSettingsStore';

interface WheelRingProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  emotions: EmotionNode[];
  startOffset?: number;
  baseOpacity?: number;
  fontSize?: number;
  activeSector?: PlutchikSector | null;
  mode?: 'full' | 'compact';
  alwaysAnimate?: boolean;
}

export const WheelRing: React.FC<WheelRingProps> = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  emotions,
  startOffset,
  baseOpacity = 1.0,
  fontSize = 12,
  activeSector = null,
  mode = 'full',
  alwaysAnimate = false,
}) => {
  const language = useSettingsStore(s => s.language);
  const count = emotions.length;
  const sweepAngle = count > 0 ? 360 / count : 0;
  
  // By default, center the first sector at -90 degrees (12 o'clock)
  const actualStartOffset = startOffset !== undefined 
    ? startOffset 
    : -90 - (sweepAngle / 2);

  return (
    <Group>
      {emotions.map((emotion, index) => {
        const startAngle = actualStartOffset + index * sweepAngle;
        
        const isSectorActive = activeSector === emotion.sector;
        
        // In compact mode, we NEVER show text because it's too small/cluttered
        // In full mode, we show text normally.
        let showText = mode === 'full';

        // Calculate opacity based on interaction and active sector
        let sectorOpacity = baseOpacity;
        if (activeSector !== null) {
          sectorOpacity = isSectorActive ? 1.0 : 0.2;
        } else if (mode === 'compact') {
          // If compact wheel and no sector is selected, make all rings full opacity colors
          sectorOpacity = 1.0;
        }

        return (
          <WheelSector
            key={emotion.id}
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            sweepAngle={sweepAngle}
            color={emotion.color}
            label={language === 'en-US' ? emotion.nameEn : emotion.name}
            fontSize={fontSize}
            opacity={sectorOpacity}
            showText={showText}
            isSectorActive={isSectorActive}
            alwaysAnimate={alwaysAnimate}
          />
        );
      })}
    </Group>
  );
};
