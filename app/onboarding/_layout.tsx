import { Stack } from 'expo-router';
import { useThemeColors } from '../../src/hooks/useThemeColors';

export default function OnboardingLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="intro-wheel" />
      <Stack.Screen name="first-checkin" />
    </Stack>
  );
}
