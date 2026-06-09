import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Creator, Reel, Comment, Chat, Message, NotificationItem, TransactionItem, GiftType } from '../types';
import { getHaversineDistance } from '../services/geoService';
import { apiClient } from '../api/client';
import { mmkvStoreStorage } from './storage';

// ==========================================
// // 6. STORY STORE
// ==========================================

export interface Story {
  id: string;
  creatorId: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  viewers: string[];
  isCloseFriends: boolean;
  repliesAllowed: boolean;
  reactions: Record<string, string[]>;
  layersData?: any;
  createdAt: string;
}

interface StoryState {
  stories: Story[];
  addStory: (story: Story) => void;
  markStoryViewed: (storyId: string, viewerId: string) => void;
  addReaction: (storyId: string, viewerId: string, emoji: string) => void;
  fetchStories: () => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set) => ({
      stories: [],
      addStory: (story) => set((state) => ({ stories: [story, ...state.stories] })),
      markStoryViewed: async (storyId, viewerId) => {
        // Optimistic UI Update
        set((state) => ({
          stories: state.stories.map(s => 
            s.id === storyId && !s.viewers.includes(viewerId)
              ? { ...s, viewers: [...s.viewers, viewerId] }
              : s
          )
        }));
        // Backend Sync
        try {
          await apiClient.post(`/stories/${storyId}/view`);
        } catch (e) {
          console.error("Failed to mark story as viewed:", e);
        }
      },
      addReaction: async (storyId, viewerId, emoji) => {
        // Optimistic UI Update
        set((state) => ({
          stories: state.stories.map(s => {
            if (s.id === storyId) {
              const userReactions = s.reactions[viewerId] || [];
              return {
                ...s,
                reactions: {
                  ...s.reactions,
                  [viewerId]: [...userReactions, emoji]
                }
              };
            }
            return s;
          })
        }));
        // Backend Sync
        try {
          await apiClient.post(`/stories/${storyId}/react`, { reaction: emoji });
        } catch (e) {
          console.error("Failed to react to story:", e);
        }
      },
      fetchStories: async () => {
        try {
          const res = await apiClient.get('/stories');
          const formattedStories = res.data.map((s: any) => ({
            id: s.id,
            creatorId: s.creator?.username || s.creatorId,
            mediaUrl: s.mediaUrl,
            viewers: (s.viewers || []).map((v: any) => v.id || v.userId), // The backend only returns the viewer record ID right now if viewed
            isCloseFriends: s.isCloseFriends,
            repliesAllowed: s.repliesAllowed,
            reactions: {}, // Can be populated if backend provides reactions
            layersData: s.layersData,
            createdAt: s.createdAt || new Date().toISOString()
          }));
          set({ stories: formattedStories });
        } catch (error: any) {
          if (error.response?.status === 401) {
            console.log("Session expired. Could not fetch stories. User will be logged out.");
          } else {
            console.error("Error fetching stories:", error.message);
          }
        }
      },
      deleteStory: async (storyId) => {
        try {
          await apiClient.delete(`/stories/${storyId}`);
          set((state) => ({
            stories: state.stories.filter(s => s.id !== storyId)
          }));
        } catch (error) {
          console.error("Failed to delete story:", error);
        }
      }
    }),
    {
      name: 'popli-story-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);
