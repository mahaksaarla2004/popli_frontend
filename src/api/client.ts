import axios from 'axios';
import { Platform } from 'react-native';

// We use EXPO_PUBLIC_API_URL from .env. If not set, fallback to the production URL.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://popli-backend.onrender.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Dynamically require to avoid require cycle with authStore
    const { useAuthStore } = require('../store/authStore');
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor to handle token refresh automatically if needed in the future
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token might be expired. For Phase 1, we just log out.
      // In Phase 2, implement refresh token logic here.
      const { useAuthStore } = require('../store/authStore');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
