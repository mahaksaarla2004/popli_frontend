import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store';

export default function EntryRedirectScreen() {
  console.log('INDEX MOUNTED');
  const router = useRouter();
  const { isLoggedIn, isOnboarded } = useAuthStore();

  useEffect(() => {
    // Schedule redirect on the next event loop tick to allow Root Layout to fully mount
    const redirectTimeout = setTimeout(() => {
      if (!isOnboarded) {
        router.replace('/(auth)/onboarding');
      } else if (!isLoggedIn) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(tabs)');
      }
    }, 20);

    return () => clearTimeout(redirectTimeout);
  }, [isLoggedIn, isOnboarded, router]);

  // Renders a solid matching dark background to ensure absolute zero visual flicker during instant boot
  return <View className="bg-[#0B001A] flex-1" />;
}
