// =============================================================================
// Typography — Text component using the design system
// =============================================================================

import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { typography } from '../../theme/typography';
import { useThemeColors } from '../../hooks/useThemeColors';

type TypographyVariant = keyof typeof typography;

interface TypographyProps extends TextProps {
  /** Typography variant from the design system scale */
  variant?: TypographyVariant;
  /** Text color — defaults to textPrimary */
  color?: string;
  /** Center alignment */
  center?: boolean;
  /** Children text content */
  children: React.ReactNode;
}

export function Typography({
  variant = 'body-md',
  color,
  center,
  style,
  children,
  ...rest
}: TypographyProps) {
  const colors = useThemeColors();
  const variantStyle = typography[variant];

  const textStyle: TextStyle = {
    fontFamily: variantStyle.fontFamily,
    fontSize: variantStyle.fontSize,
    lineHeight: variantStyle.lineHeight,
    letterSpacing: variantStyle.letterSpacing,
    color: color ?? colors.textPrimary,
    textAlign: center ? 'center' : undefined,
  };

  return (
    <Text style={[textStyle, style]} {...rest}>
      {children}
    </Text>
  );
}
