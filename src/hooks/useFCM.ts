import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
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
      try {
        // 1. Request Permission (Required for iOS, Recommended for Android 13+)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('FCM Permission not granted');
          return;
        }

        // 2. Get the Device Token
        const token = await messaging().getToken();
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
        return messaging().onTokenRefresh(async (newToken) => {
          console.log('FCM Token refreshed:', newToken);
          if (isMounted) {
             await apiClient.put('/users/me', { deviceToken: newToken });
          }
        });
      } catch (error) {
        console.error('Error during FCM setup:', error);
      }
    }

    setupFCM();

    // 4. Foreground Message Listener
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'New Notification',
          remoteMessage.notification.body || ''
        );
      }
    });

    return () => {
      isMounted = false;
      unsubscribeForeground();
    };
  }, [isLoggedIn]);
}
