import React from 'react';
import { Redirect, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../store';

export default function EntryRedirectScreen() {
  const { isLoggedIn, isOnboarded } = useAuthStore();
  const rootNavigationState = useRootNavigationState();

  if (!rootNavigationState?.key) return null;

  if (!isOnboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  } else if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  } else {
    return <Redirect href="/(tabs)" />;
  }
}
