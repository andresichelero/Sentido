import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from './Typography';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing } from '../../theme/spacing';
import { Feather } from '@expo/vector-icons';

interface SettingsItemProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  description?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}

export function SettingsItem({
  icon,
  title,
  description,
  rightElement,
  onPress,
  destructive,
}: SettingsItemProps) {
  const colors = useThemeColors();

  const titleColor = destructive ? colors.error : colors.textPrimary;
  const iconColor = destructive ? colors.error : colors.textSecondary;

  const content = (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Typography variant="body-md" color={titleColor}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body-sm" color={colors.textTertiary}>
            {description}
          </Typography>
        )}
      </View>
      <View style={styles.rightContainer}>
        {rightElement || (onPress && !destructive && (
          <Feather name="chevron-right" size={20} color={colors.textTertiary} />
        ))}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && { backgroundColor: colors.surface2 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.pressable}>{content}</View>;
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  rightContainer: {
    justifyContent: 'center',
  },
});
