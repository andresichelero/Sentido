import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  DMMono_400Regular,
  DMMono_500Medium,
} from '@expo-google-fonts/dm-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import { router } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';

import { supabase } from '../src/services/supabase/client';
import { useUserStore } from '../src/stores/useUserStore';
import { syncPendingCheckins } from '../src/services/database/sync';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  
  // Set up default behavior for notifications in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('expo-notifications not available:', e);
}

// Export error boundary from expo-router
export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent splash screen from hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

// Create TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  const setSession = useUserStore((s) => s.setSession);
  const isOnboarded = useUserStore((s) => s.isOnboarded);
  const isLoading = useUserStore((s) => s.isLoading);
  const setIsLoading = useUserStore((s) => s.setIsLoading);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Supabase Auth Listener & Local State
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      // Always load onboarding state from local storage on launch
      try {
        const onboarded = await SecureStore.getItemAsync('has_completed_onboarding');
        if (onboarded === 'true') {
          useUserStore.getState().setIsOnboarded(true);
        }
      } catch (e) {
        console.warn('Failed to load onboarding state', e);
      }
      
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Deep link handler for Magic Links
    const handleDeepLink = async (event: { url: string }) => {
      if (event.url) {
        try {
          const urlObj = new URL(event.url);
          // Check for PKCE code flow
          const code = urlObj.searchParams.get('code');
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            return;
          }
          // Check for Implicit flow (hash fragment)
          const hash = urlObj.hash;
          if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.replace('#', ''));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            }
          }
        } catch (error) {
          console.error('Deep link handling error:', error);
        }
      }
    };

    const linkSubscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, [setSession, setIsLoading]);

  // Sync Engine Listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPendingCheckins().catch(console.error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Notification interaction listener
  useEffect(() => {
    if (!Notifications) return;

    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      // Navigate to the check-in screen (root) when user taps a notification
      router.navigate('/(tabs)');
    });

    return () => subscription.remove();
  }, []);

  // Initial Routing & Splash Screen
  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
      
      // Navigate to onboarding if not completed yet
      if (!isOnboarded) {
        router.replace('/onboarding/welcome');
      }
    }
  }, [fontsLoaded, isLoading, isOnboarded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="emotion/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="checkin/intensity" options={{ headerShown: false }} />
          <Stack.Screen name="checkin/reflection" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
