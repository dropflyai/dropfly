import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
// import 'react-native-reanimated';

import { useAuthStore, useOnboardingStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';
// import { useNotifications } from '@/hooks/useNotifications';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Re-export expo-router's ErrorBoundary for route-level error handling
export { ErrorBoundary as RouteErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { user, isAuthenticated, setUser, setSession, setLoading } = useAuthStore();
  const { isCompleted: onboardingCompleted } = useOnboardingStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
          });
          setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at!,
            user: {
              id: session.user.id,
              email: session.user.email!,
              created_at: session.user.created_at,
            },
          });
        } else {
          setUser(null);
          setSession(null);
        }
        setLoading(false);
        setIsReady(true);
      }
    );

    // Check initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        });
        setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at!,
          user: {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
          },
        });
      }
      setLoading(false);
      setIsReady(true);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading]);

  useEffect(() => {
    if (!isReady || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inMainGroup = segments[0] === '(main)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated, redirect to auth
      router.replace('/(auth)');
    } else if (isAuthenticated && !onboardingCompleted && !inOnboardingGroup) {
      // Authenticated but onboarding not complete
      router.replace('/(onboarding)/basics');
    } else if (isAuthenticated && onboardingCompleted && (inAuthGroup || inOnboardingGroup)) {
      // Authenticated and onboarding complete, go to main app
      router.replace('/(main)/discover');
    }
  }, [isReady, isAuthenticated, onboardingCompleted, segments, navigationState?.key]);

  return isReady;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const isReady = useProtectedRoute();

  // Note: useNotifications disabled temporarily - native module issue
  // TODO: Re-enable after fixing NativeEventEmitter crash
  // useNotifications();

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(main)" />
      <Stack.Screen
        name="(connectivity)"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
});
