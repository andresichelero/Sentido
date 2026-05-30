import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Typography } from './Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, onFocus, onBlur, ...props }: InputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="label-md" color={colors.textSecondary} style={styles.label}>
          {label}
        </Typography>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface2,
            borderColor: error ? colors.error : isFocused ? colors.accentDefault : colors.borderSubtle,
            color: colors.textPrimary,
            fontFamily: typography['body-md'].fontFamily,
            fontSize: typography['body-md'].fontSize,
          },
          style,
        ]}
        placeholderTextColor={colors.textDisabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && (
        <Typography variant="label-sm" color={colors.error} style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
