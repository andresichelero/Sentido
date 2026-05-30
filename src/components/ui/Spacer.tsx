// =============================================================================
// Spacer — Layout spacing utility
// =============================================================================

import React from 'react';
import { View } from 'react-native';

interface SpacerProps {
  /** Vertical spacing in px */
  height?: number;
  /** Horizontal spacing in px */
  width?: number;
  /** Flex to fill available space */
  flex?: number;
}

export function Spacer({ height, width, flex }: SpacerProps) {
  return <View style={{ height, width, flex }} />;
}
