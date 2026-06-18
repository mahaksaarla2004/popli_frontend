import React, { useEffect } from 'react';
import { router, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../store';

export default function EntryRedirectScreen() {
  const { isLoggedIn, isOnboarded } = useAuthStore();
  const rootNavigationState = useRootNavigationState();

  if (!rootNavigationState?.key) return null;

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    if (!isOnboarded) {
      router.replace('/(auth)/onboarding');
    } else if (!isLoggedIn) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)');
    }
  }, [rootNavigationState?.key, isOnboarded, isLoggedIn]);

  return null;
}
