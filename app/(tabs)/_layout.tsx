// =============================================================================
// Tab Layout — 4 tabs: Check-in, Explore, History, Profile
// =============================================================================

import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { AuraBackground } from '../../src/components/ui/AuraBackground';

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AuraBackground />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
          tabBarActiveTintColor: colors.activeEmotionColor,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopColor: colors.borderSubtle,
            height: 60,
            elevation: 0,
          },
          tabBarBackground: () => (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ),
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="circle" size={22} color={color} />
          ),
          tabBarAccessibilityLabel: 'Check-in',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" size={22} color={color} />
          ),
          tabBarAccessibilityLabel: 'Explorar',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={22} color={color} />
          ),
          tabBarAccessibilityLabel: 'Histórico',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={22} color={color} />
          ),
          tabBarAccessibilityLabel: 'Perfil',
        }}
      />
    </Tabs>
    </View>
  );
}
