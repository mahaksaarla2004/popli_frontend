import React, { useEffect } from 'react';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore, useKYCStore } from '../store';
import { useFCM } from '../hooks/useFCM';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import axios from 'axios';
import { BASE_URL } from '../api/client';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

// Register background handler safely
try {
  if (Platform.OS !== 'web') {
    setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  }
} catch (e) {
  console.warn('Firebase is not fully initialized. If you are in Expo Go or Web, this is expected.', e);
}

// Disable strict mode to suppress internal library warnings (e.g. from react-native-css-interop)
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  const { isLoggedIn, isOnboarded } = useAuthStore();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  // Initialize FCM
  useFCM();

  // Verify API Connection on Startup
  useEffect(() => {
    const verifyApiConnection = async () => {
      console.log(`[STARTUP] Verifying API Connection to: ${BASE_URL}`);
      try {
        const response = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
        if (response.status === 200) {
          console.log(`✅ [STARTUP] API Connected successfully to ${BASE_URL}`);
        }
      } catch (error: any) {
        console.warn(`❌ [STARTUP WARNING] API Unreachable at ${BASE_URL}`);
        console.warn(`Error details: ${error.message}`);
        console.warn(`Please check if your backend is running or update EXPO_PUBLIC_API_URL in .env`);
      }
    };
    verifyApiConnection();
  }, []);

  // Root Navigation Guard: Ensures absolute route safety across groups
  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const rootSegment = segments[0] as string;
    const inAuthGroup = rootSegment === '(auth)';
    const inTabsGroup = rootSegment === '(tabs)';
    const inSplash = !rootSegment || rootSegment === 'index';

    // 1. Initial boot: let index.tsx play animations and handle the splash redirect
    if (inSplash) {
      return;
    }

    // 2. Protect Onboarding/Auth lines
    if (!isOnboarded) {
      // Force un-onboarded users to onboarding
      if (rootSegment !== '(auth)' || segments[1] !== 'onboarding') {
        setTimeout(() => router.replace('/(auth)/onboarding'), 0);
      }
      return;
    }

    // 3. Protect Authentication for onboarded but unauthenticated users
    if (isOnboarded && !isLoggedIn) {
      // If not in auth group, force to login
      if (!inAuthGroup) {
        setTimeout(() => router.replace('/(auth)/login'), 0);
      }
      return;
    }

    // 4. Protect Main tabs for logged in sessions
    if (isLoggedIn) {
      if (inAuthGroup) {
        // Allow logged in users to access profile completion pages
        const allowedAuthRoutes = ['profile-setup', 'interests', 'location', 'permissions'];
        if (!allowedAuthRoutes.includes(segments[1] as string)) {
          if (useAuthStore.getState().isFirstLogin) {
            useAuthStore.getState().setFirstLogin(false);
            setTimeout(() => router.replace('/kyc'), 0);
          } else {
            setTimeout(() => router.replace('/(tabs)'), 0);
          }
        }
      }
    }
  }, [isLoggedIn, isOnboarded, segments, rootNavigationState?.key]);

  // Handle Splash Screen Removal
  useEffect(() => {
    if (rootNavigationState?.key) {
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 500); 
    }
  }, [rootNavigationState?.key]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#0B001A' }} edges={['left', 'right']}>
            <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0B001A' },
              animation: 'fade',
            }}
          >
            {/* Main Route Groups */}
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            
            {/* Main stack sub-pages */}
            <Stack.Screen name="kyc" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="wallet" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="support" />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
