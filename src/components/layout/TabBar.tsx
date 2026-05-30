// =============================================================================
// TabBar — Custom tab bar with icon-only navigation and animated dot indicator
// NOTE: This component is prepared for when we switch from Expo Router's
// built-in tab bar to a fully custom one. For now, it's a standalone component.
// =============================================================================

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing } from '../../theme/spacing';
import { duration } from '../../theme/motion';

/** Tab configuration */
interface TabConfig {
  name: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
}

/** Default tab configuration matching the app spec */
export const TAB_CONFIG: TabConfig[] = [
  { name: 'index', icon: 'circle', label: 'Check-in' },
  { name: 'explore', icon: 'compass', label: 'Explorar' },
  { name: 'history', icon: 'bar-chart-2', label: 'Histórico' },
  { name: 'profile', icon: 'user', label: 'Perfil' },
];

interface TabBarProps {
  /** Currently active tab index */
  activeIndex: number;
  /** Called when a tab is pressed */
  onTabPress: (index: number) => void;
  /** Tab configurations */
  tabs?: TabConfig[];
}

export function TabBar({
  activeIndex,
  onTabPress,
  tabs = TAB_CONFIG,
}: TabBarProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface1,
          borderTopColor: colors.borderSubtle,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {tabs.map((tab, index) => (
        <TabBarItem
          key={tab.name}
          iconName={tab.icon}
          label={tab.label}
          isFocused={activeIndex === index}
          onPress={() => onTabPress(index)}
          activeColor={colors.activeEmotionColor}
          inactiveColor={colors.textTertiary}
        />
      ))}
    </View>
  );
}

interface TabBarItemProps {
  iconName: keyof typeof Feather.glyphMap;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
}

function TabBarItem({
  iconName,
  label,
  isFocused,
  onPress,
  activeColor,
  inactiveColor,
}: TabBarItemProps) {
  const dotStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: duration.fast }),
    transform: [
      {
        scale: withTiming(isFocused ? 1 : 0.5, { duration: duration.fast }),
      },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
    >
      <Feather
        name={iconName}
        size={22}
        color={isFocused ? activeColor : inactiveColor}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: activeColor },
          dotStyle,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
