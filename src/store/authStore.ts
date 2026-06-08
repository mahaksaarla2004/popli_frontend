import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Creator, Reel, Comment, Chat, Message, NotificationItem, TransactionItem, GiftType } from '../types';
import { getHaversineDistance } from '../services/geoService';
import { apiClient } from '../api/client';
import { mmkvStoreStorage } from './storage';

// ==========================================
// // 1. AUTH & PREFERENCES STORE
// ==========================================

interface AuthState {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  userProfile: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio: string;
    city: string;
    category: string;
    followersCount: number;
    followingCount: number;
    giftsReceivedCount: number;
    isVerified: boolean;
    isProfileComplete?: boolean;
  };
  followingIds: string[];
  theme: 'dark' | 'light';
  language: 'English' | 'Hindi' | 'Bengali' | 'Tamil';
  notificationsEnabled: boolean;
  isFirstLogin: boolean;
  setLogin: (status: boolean) => void;
  setOnboardingComplete: (status: boolean) => void;
  setFirstLogin: (status: boolean) => void;
  updateProfile: (profile: Partial<AuthState['userProfile']>) => Promise<void>;
  toggleTheme: () => void;
  setLanguage: (lang: AuthState['language']) => void;
  toggleNotifications: () => void;
  toggleFollow: (creatorId: string) => void;
  logout: () => void;
  mockRegisteredUsers: string[];
  registerMockUser: (identifier: string) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  blockedUsers: Creator[];
  fetchBlockedUsers: () => Promise<void>;
  toggleBlock: (creatorId: string) => Promise<void>;
  updatePreferences: (prefs: any) => Promise<void>;
  preferences: {
    isPrivateProfile: boolean;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      isOnboarded: false,
      token: null,
      userProfile: {
        id: '',
        name: '',
        username: '',
        avatar: '',
        bio: '',
        city: '',
        category: '',
        followersCount: 0,
        followingCount: 0,
        giftsReceivedCount: 0,
        isVerified: false
      },
      preferences: {
        isPrivateProfile: false
      },
      blockedUsers: [],
      followingIds: [],
      theme: 'dark',
      language: 'English',
      notificationsEnabled: true,
      isFirstLogin: true,
      mockRegisteredUsers: [],
      registerMockUser: (identifier) => set((state) => ({ 
        mockRegisteredUsers: [...state.mockRegisteredUsers, identifier.toLowerCase()] 
      })),
      setToken: (token) => set({ token }),
      setLogin: (status) => set({ isLoggedIn: status }),
      setOnboardingComplete: (status) => set({ isOnboarded: status }),
      setFirstLogin: (status) => set({ isFirstLogin: status }),
      updateProfile: async (profile) => {
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } }));
        try {
          await apiClient.put('/users/me', profile);
        } catch (e: any) {
          console.error("Failed to update profile to backend:", e.response?.data || e.message);
        }
      },
      updatePreferences: async (prefs) => {
        set((state) => ({ preferences: { ...state.preferences, ...prefs } }));
        try {
          await apiClient.put('/users/me/preferences', prefs);
        } catch (e: any) {
          console.error("Failed to update preferences:", e.response?.data || e.message);
        }
      },
      fetchBlockedUsers: async () => {
        try {
          const res = await apiClient.get('/social/blocked');
          set({ blockedUsers: res.data });
        } catch (error) {
          console.error("Failed to fetch blocked users:", error);
        }
      },
      toggleBlock: async (creatorId) => {
        try {
          await apiClient.post(`/social/block/${creatorId}`);
          get().fetchBlockedUsers(); // Refresh list
        } catch (error) {
          console.error("Failed to toggle block:", error);
        }
      },
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (lang) => set({ language: lang }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleFollow: async (creatorId) => {
        const state = useAuthStore.getState();
        const isFollowing = state.followingIds.includes(creatorId);
        
        // Optimistic UI update
        const newFollowing = isFollowing
          ? state.followingIds.filter((id) => id !== creatorId)
          : [...state.followingIds, creatorId];
          
        set({
          followingIds: newFollowing,
          userProfile: {
            ...state.userProfile,
            followingCount: state.userProfile.followingCount + (isFollowing ? -1 : 1)
          }
        });

        // API Call to sync with backend
        try {
          const { apiClient } = require('../api/client');
          await apiClient.post(`/social/follow/${creatorId}`);
        } catch (error) {
          console.error("Failed to toggle follow on backend:", error);
          // Optional: Revert local state on failure
        }
      },
      logout: () => set({ isLoggedIn: false, isOnboarded: false, followingIds: [], token: null })
    }),
    {
      name: 'popli-auth-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);
