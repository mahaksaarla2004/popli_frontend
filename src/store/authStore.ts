/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
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
    gender?: string;
    followersCount: number;
    followingCount: number;
    giftsReceivedCount: number;
    wallet?: { totalEarnings: number };
    coinsEarned?: number;
    isVerified: boolean;
    isProfileComplete?: boolean;
    email?: string;
    phone?: string;
    socialLinks?: { title: string; url: string }[];
  };
  followingIds: string[];
  theme: 'dark' | 'light';
  language: 'English' | 'Hindi' | 'Bengali' | 'Tamil';
  notificationsEnabled: boolean;
  isFirstLogin: boolean;
  setLogin: (status: boolean) => void;
  setOnboardingComplete: (status: boolean) => void;
  setFirstLogin: (status: boolean) => void;
  updateProfile: (profile: Partial<AuthState['userProfile']>) => Promise<{ success: boolean; error?: string }>;
  fetchProfile: () => Promise<void>;
  toggleTheme: () => void;
  setLanguage: (lang: AuthState['language']) => void;
  toggleNotifications: () => void;
  toggleFollow: (creatorId: string) => void;
  logout: () => void;

  token: string | null;
  setToken: (token: string | null) => void;
  blockedUsers: Creator[];
  fetchBlockedUsers: () => Promise<void>;
  fetchFollowingIds: (userId: string) => Promise<void>;
  toggleBlock: (creatorId: string) => Promise<void>;
  updatePreferences: (prefs: any) => Promise<void>;
  preferences: {
    isPrivateProfile: boolean;
  };
}

const inFlightFollows = new Set<string>();

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

      setToken: (token) => set({ token }),
      setLogin: (status) => set({ isLoggedIn: status }),
      setOnboardingComplete: (status) => set({ isOnboarded: status }),
      setFirstLogin: (status) => set({ isFirstLogin: status }),
  updateProfile: async (profile) => {
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } }));
        try {
          const res = await apiClient.put('/users/me', profile);

          if (res.data?.isProfileComplete !== undefined) {
            set((state) => ({ userProfile: { ...state.userProfile, isProfileComplete: res.data.isProfileComplete } }));
          }

          // Also update the feedStore so reels instantly show the new name/username/avatar
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useFeedStore } = require('./feedStore');
          useFeedStore.getState().updateCreatorInfo(useAuthStore.getState().userProfile.id, profile);
          
          return { success: true };
        } catch (e: any) {
          const errorMessage = e.response?.data?.message || e.message || 'Failed to update profile';
          console.error("Failed to update profile to backend:", errorMessage);
          return { success: false, error: errorMessage };
        }
      },
      fetchProfile: async () => {
        try {
          const res = await apiClient.get('/users/me');
          if (res.data) {
            set((state) => ({ userProfile: { ...state.userProfile, ...res.data } }));
          }
        } catch (error) {
          console.error("Failed to fetch fresh profile data:", error);
        }
      },
      updatePreferences: async (prefs) => {
        const backupPrefs = get().preferences;
        set((state) => ({ preferences: { ...state.preferences, ...prefs } }));
        try {
          await apiClient.put('/users/me/preferences', prefs);
        } catch (e: any) {
          console.error("Failed to update preferences, rolling back:", e.response?.data || e.message);
          set({ preferences: backupPrefs });
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
      fetchFollowingIds: async (userId: string) => {
        if (!userId) return;
        try {
          const res = await apiClient.get(`/social/${userId}/following`);
          const ids = res.data.filter((f: any) => f.following?.id).map((f: any) => f.following.id);
          set({ followingIds: ids });
        } catch (error) {
          console.error("Failed to fetch following ids:", error);
        }
      },
      toggleBlock: async (creatorId) => {
        // Optimistic UI update for immediate feedback
        set((state) => {
          const isBlocked = state.blockedUsers.some(u => u.id === creatorId);
          if (isBlocked) {
            return { blockedUsers: state.blockedUsers.filter(u => u.id !== creatorId) };
          } else {
            // Add a mock object so it appears instantly; fetchBlockedUsers will correct it later
            return { blockedUsers: [...state.blockedUsers, { id: creatorId, name: 'Blocked User', username: 'blocked', avatar: 'https://i.pravatar.cc/150' } as any] };
          }
        });

        try {
          await apiClient.post(`/social/block/${creatorId}`);
          get().fetchBlockedUsers(); // Refresh list to get accurate user details
        } catch (error) {
          console.warn("Failed to toggle block (silenced):", error);
          get().fetchBlockedUsers(); // Revert on failure
        }
      },
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (lang) => set({ language: lang }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleFollow: async (creatorId) => {
        const state = useAuthStore.getState();
        
        // Prevent concurrent identical requests
        if (inFlightFollows.has(creatorId)) return;
        inFlightFollows.add(creatorId);

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
          console.log(`Attempting to toggle follow for creator: ${creatorId}`);
          await apiClient.post(`/social/follow/${creatorId}`);
          console.log(`Successfully toggled follow on backend for: ${creatorId}`);
        } catch (error: any) {
          console.error("Failed to toggle follow on backend:", error?.message || error);
          // Revert local state on failure
          set({
            followingIds: state.followingIds,
            userProfile: {
              ...state.userProfile,
              followingCount: state.userProfile.followingCount // Restore original
            }
          });
        } finally {
          inFlightFollows.delete(creatorId);
        }
      },
      logout: async () => {
        try {
          // Sign out from Firebase
          const { firebaseAuth } = require('../lib/firebase');
          await firebaseAuth.signOut().catch(() => {});

          const SecureStore = require('expo-secure-store');
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          if (refreshToken) {
            await apiClient.post('/auth/logout', { refreshToken }).catch(() => {});
            await SecureStore.deleteItemAsync('refreshToken');
          }
        } catch (e) {
          console.error('Logout error', e);
        }

        // Fully reset auth state
        set({ 
          isLoggedIn: false, 
          followingIds: [], 
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
          blockedUsers: [],
          preferences: { isPrivateProfile: false }
        });

        // Trigger feedStore wipe
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useFeedStore } = require('./feedStore');
          useFeedStore.getState().clearCache();
        } catch(e) {}
        
        // Trigger storyStore wipe
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useStoryStore } = require('./storyStore');
          useStoryStore.getState().clearCache();
        } catch(e) {}
      }
    }),
    {
      name: 'popli-auth-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);
