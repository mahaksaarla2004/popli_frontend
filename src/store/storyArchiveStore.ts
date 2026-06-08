import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Creator, Reel, Comment, Chat, Message, NotificationItem, TransactionItem, GiftType } from '../types';
import { getHaversineDistance } from '../services/geoService';
import { apiClient } from '../api/client';
import { mmkvStoreStorage } from './storage';
import { Story } from './storyStore';
// ==========================================
// // 7. STORY ARCHIVE STORE
// ==========================================

interface StoryArchiveState {
  archivedStories: Story[];
  fetchArchivedStories: () => Promise<void>;
}

export const useStoryArchiveStore = create<StoryArchiveState>()(
  persist(
    (set) => ({
      archivedStories: [],
      fetchArchivedStories: async () => {
        try {
          const res = await apiClient.get('/stories/archive');
          const formattedStories = res.data.map((s: any) => ({
            id: s.id,
            creatorId: s.creator.username,
            mediaUrl: s.mediaUrl,
            viewers: s.views ? s.views.map((v: any) => v.user.username) : [],
            isCloseFriends: s.isCloseFriends,
            repliesAllowed: s.repliesAllowed,
            reactions: {}
          }));
          set({ archivedStories: formattedStories });
        } catch (error) {
          console.error("Error fetching archived stories:", error);
        }
      }
    }),
    {
      name: 'popli-story-archive-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);

