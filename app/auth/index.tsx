import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '../../src/stores/useUserStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { Typography } from '../../src/components/ui/Typography';
import { spacing } from '../../src/theme/spacing';

export default function AuthCallbackScreen() {
  const session = useUserStore((s) => s.session);
  const colors = useThemeColors();

  useEffect(() => {
    // If the session is available, or after a short delay, redirect to profile
    // The delay ensures the root layout's deep link listener has time to process the token.
    const timer = setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [session]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.textPrimary} />
      <Typography variant="body" color={colors.textSecondary} style={styles.text}>
        Autenticando...
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: spacing.md,
  },
});
