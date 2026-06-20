import { useEffect } from 'react';
import { getMessaging, getToken, requestPermission, AuthorizationStatus, onTokenRefresh, onMessage } from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { useAuthStore } from '../store';
import { apiClient } from '../api/client';

export function useFCM() {
  const { isLoggedIn, updateProfile } = useAuthStore();

  useEffect(() => {
    // We only want to set up FCM if the user is actually logged in
    if (!isLoggedIn) return;

    let isMounted = true;

    async function setupFCM() {
      if (Platform.OS === 'web') return;
      try {
        // Test if Firebase is available
        const m = getMessaging();
        
        // 1. Request Permission (Required for iOS, Recommended for Android 13+)
        const authStatus = await requestPermission(m);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('FCM Permission not granted');
          return;
        }

        // 2. Get the Device Token
        const token = await getToken(m);
        console.log('FCM Token:', token);

        // 3. Send the token to our backend
        if (token && isMounted) {
          try {
            await apiClient.put('/users/me', { deviceToken: token });
          } catch (error: any) {
            console.log('Failed to sync device token to backend (likely session expired).');
          }
        }

        // Listen to whether the token changes
        return onTokenRefresh(m, async (newToken) => {
          console.log('FCM Token refreshed:', newToken);
          if (isMounted) {
             await apiClient.put('/users/me', { deviceToken: newToken });
          }
        });
      } catch (error) {
        console.warn('Firebase is not initialized (likely running in Web or Expo Go). Skipping FCM setup.');
      }
    }

    setupFCM();

    // 4. Foreground Message Listener
    let unsubscribeForeground = () => {};
    if (Platform.OS !== 'web') {
      try {
        unsubscribeForeground = onMessage(getMessaging(), async (remoteMessage) => {
          console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
          if (remoteMessage.notification) {
            Alert.alert(
              remoteMessage.notification.title || 'New Notification',
              remoteMessage.notification.body || ''
            );
          }
        });
      } catch (error) {
        // Ignore if Expo Go
      }
    }

    return () => {
      isMounted = false;
      unsubscribeForeground();
    };
  }, [isLoggedIn]);
}
