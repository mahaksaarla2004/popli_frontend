import axios from 'axios';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Cloudflare fallback for remote testing if all else fails
const CLOUDFLARE_FALLBACK = 'https://organize-equality-revenue-years.trycloudflare.com';

const resolveBaseUrl = () => {
  // 1. Primary: Use exactly what is configured in .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.trim();
  }

  // 2. Optional Development Convenience: Extract from Expo Host URI
  if (__DEV__) {
    // @ts-ignore
    const hostUri = Constants.expoConfig?.hostUri || (Constants.manifest as any)?.hostUri || (Constants.manifest2 as any)?.extra?.expoGo?.debuggerHost;
    // Do NOT use hostUri if it's an ngrok/exp.direct tunnel, because it won't route port 3000 to the backend.
    if (hostUri && !hostUri.includes('exp.direct') && !hostUri.includes('ngrok.io')) {
      const lanIp = hostUri.split(':')[0].trim(); // e.g. "192.168.1.28"
      return `http://${lanIp}:3001`;
    }
  }

  // 3. Ultimate Fallback
  return CLOUDFLARE_FALLBACK.trim();
};

export const BASE_URL = resolveBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

// Request interceptor to attach JWT token and log requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    
    // Dynamically require to avoid require cycle with authStore
    const { useAuthStore } = require('../store/authStore');
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error(`[API REQUEST ERROR]`, error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh automatically and log responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (axios.isCancel(error)) {
      console.log(`[API REQUEST CANCELED] ${originalRequest?.url}`);
      return Promise.reject(error);
    }
    
    console.error(`[API ERROR] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - Status: ${error.response?.status || 'NETWORK_ERROR'}`);
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { useAuthStore } = require('../store/authStore');
        const SecureStore = require('expo-secure-store');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
          if (res.data.accessToken) {
            useAuthStore.getState().setToken(res.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token failed -> Log out
        const { useAuthStore } = require('../store/authStore');
        const SecureStore = require('expo-secure-store');
        await SecureStore.deleteItemAsync('refreshToken');
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);
