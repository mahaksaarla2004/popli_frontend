import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Creator, Reel, Comment, Chat, Message, NotificationItem, TransactionItem, GiftType } from '../types';
import { getHaversineDistance } from '../services/geoService';
import { apiClient } from '../api/client';
import { mmkvStoreStorage } from './storage';
import { getDefaultAvatar } from '../utils';

// ==========================================
// // 4. VIDEO FEED & DYNAMIC REELS STORE
// ==========================================

interface FeedState {
  creators: Creator[];
  reels: Reel[];
  comments: Comment[];
  moodFilter: string; // 'comedy' | 'motivation' | 'music' | 'all' etc
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  gpsCity: string | null;
  nearbyEnabled: boolean;
  setGPS: (lat: number, lon: number, city: string) => void;
  setNearbyEnabled: (enabled: boolean) => void;
  toggleLikeReel: (reelId: string) => void;
  toggleSaveReel: (reelId: string) => void;
  addLocalReel: (reel: Reel) => void;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'likesCount'>) => void;
  toggleCommentLike: (commentId: string) => void;
  setMoodFilter: (filter: string) => void;
  registerValidView: (reelId: string, creatorUsername: string) => void;
  fetchReels: (page?: number, limit?: number, category?: string) => Promise<void>;
  fetchCreators: () => Promise<void>;
  likedReels: Reel[];
  watchHistory: Reel[];
  userReels: Reel[];
  fetchLikedReels: () => Promise<void>;
  fetchWatchHistory: () => Promise<void>;
  fetchUserReels: (userId: string) => Promise<void>;
  fetchFollowingReels: (page?: number, limit?: number) => Promise<void>;
  updateCreatorInfo: (creatorId: string, updates: Partial<{name: string, username: string, avatar: string}>) => void;
  deleteReel: (reelId: string) => Promise<void>;
  isGlobalMuted: boolean;
  toggleGlobalMute: () => void;
  seenReelIds: string[];
  clearSeenReels: () => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      creators: [],
      reels: [], // Start with empty, let fetchReels populate it
      likedReels: [],
      watchHistory: [],
      userReels: [],
      comments: [],
      seenReelIds: [],
      moodFilter: 'all',
      gpsLatitude: null,
      gpsLongitude: null,
      gpsCity: null,
      nearbyEnabled: false,
      isGlobalMuted: false,
      clearSeenReels: () => set({ seenReelIds: [] }),
      toggleGlobalMute: () => set((state) => ({ isGlobalMuted: !state.isGlobalMuted })),
      setGPS: (lat, lon, city) => {
        set({ gpsLatitude: lat, gpsLongitude: lon, gpsCity: city });
        // Recalculate distances for all creators dynamically
        set((state) => {
          const updatedCreators = state.creators.map((c) => {
            if (!c.location?.latitude || !c.location?.longitude) return c;
            const distance = getHaversineDistance(lat, lon, c.location.latitude, c.location.longitude);
            return { ...c, distanceKm: distance };
          });
          const updatedReels = state.reels.map((r) => {
            if (!r.location?.latitude || !r.location?.longitude) return r;
            const distance = getHaversineDistance(lat, lon, r.location.latitude, r.location.longitude);
            return { ...r, distanceKm: distance };
          });
          return { creators: updatedCreators, reels: updatedReels };
        });
      },
      setNearbyEnabled: (enabled) => set({ nearbyEnabled: enabled }),
      toggleLikeReel: async (reelId) => {
        // Optimistic UI update
        set((state) => {
          const updatedReels = state.reels.map((r) => {
            if (r.id === reelId) {
              const newLiked = !r.isLiked;
              return {
                ...r,
                isLiked: newLiked,
                likesCount: r.likesCount + (newLiked ? 1 : -1)
              };
            }
            return r;
          });
          return { reels: updatedReels };
        });

        // Backend sync
        try {
          await apiClient.post(`/reels/${reelId}/like`);
        } catch (e) {
          console.error("Failed to toggle like:", e);
        }
      },
      toggleSaveReel: async (reelId) => {
        // Optimistic UI update
        set((state) => {
          const updatedReels = state.reels.map((r) => {
            if (r.id === reelId) {
              const newSaved = !r.isSaved;
              return {
                ...r,
                isSaved: newSaved,
                savesCount: r.savesCount + (newSaved ? 1 : -1)
              };
            }
            return r;
          });
          return { reels: updatedReels };
        });

        // Backend sync
        try {
          await apiClient.post(`/reels/${reelId}/save`);
        } catch (e) {
          console.error("Failed to toggle save:", e);
        }
      },
      addLocalReel: (reel) =>
        set((state) => ({
          reels: [reel, ...state.reels]
        })),
      addComment: async (comment) => {
        // Backend sync first to get the actual ID
        try {
          const payload: any = { text: comment.text };
          if (comment.parentId) payload.parentId = comment.parentId;
          const res = await apiClient.post(`/reels/${comment.reelId}/comments`, payload);
          const savedComment = res.data;
          
          set((state) => {
            const formattedComment: Comment = {
              id: savedComment.id,
              reelId: savedComment.reelId,
              userId: savedComment.userId,
              text: savedComment.text,
              likesCount: 0,
              createdAt: 'Just now',
              user: savedComment.user,
              parentId: savedComment.parentId,
              replies: [],
            };

            // If it's a reply, nest it under the parent locally
            if (formattedComment.parentId) {
              return {
                comments: state.comments.map(c => {
                  if (c.id === formattedComment.parentId) {
                    return { ...c, replies: [...(c.replies || []), formattedComment] };
                  }
                  return c;
                }),
                reels: state.reels.map((r) => r.id === comment.reelId ? { ...r, commentsCount: r.commentsCount + 1 } : r)
              };
            }

            return {
              comments: [formattedComment, ...state.comments],
              reels: state.reels.map((r) => r.id === comment.reelId ? { ...r, commentsCount: r.commentsCount + 1 } : r)
            };
          });
        } catch (e) {
          console.error("Failed to add comment to backend:", e);
        }
      },
      toggleCommentLike: async (commentId) => {
        set((state) => {
          // Recursive function to toggle like in potentially nested comments
          const toggleInComments = (commentsList: Comment[]): Comment[] => {
            return commentsList.map(c => {
              if (c.id === commentId) {
                const newLiked = !c.isLiked;
                return {
                  ...c,
                  isLiked: newLiked,
                  likesCount: c.likesCount + (newLiked ? 1 : -1)
                };
              }
              if (c.replies && c.replies.length > 0) {
                return { ...c, replies: toggleInComments(c.replies) };
              }
              return c;
            });
          };

          return { comments: toggleInComments(state.comments) };
        });

        // Backend Sync
        try {
          await apiClient.post(`/reels/comments/${commentId}/like`);
        } catch (e) {
          console.error("Failed to toggle comment like:", e);
        }
      },
      setMoodFilter: (filter) => set({ moodFilter: filter }),
      registerValidView: async (reelId, creatorUsername) => {
        set((state) => {
          // Track seen reel to prevent repetition (limit to 50 max)
          let newSeenIds = [...state.seenReelIds];
          if (!newSeenIds.includes(reelId)) {
            newSeenIds.push(reelId);
            if (newSeenIds.length > 50) newSeenIds.shift();
          }

          return {
            reels: state.reels.map(r => 
              r.id === reelId ? { ...r, viewsCount: (r.viewsCount || 0) + 1 } : r
            ),
            seenReelIds: newSeenIds
          };
        });
        
        try {
          await apiClient.post(`/reels/${reelId}/view`);
        } catch (e) {
          console.error("Failed to register view:", e);
        }
      },
      fetchReels: async (page = 1, limit = 10, category = 'all') => {
        try {
          const currentReels = get().reels;
          const seenIds = get().seenReelIds;
          
          // Combine persistent seenIds with current page reels, taking up to 50 max
          let allExcludeIds = page === 1 ? [...seenIds] : [...seenIds, ...currentReels.map(r => r.id)];
          // Only send the last 50 to avoid huge query strings
          let excludeIdsParam = allExcludeIds.slice(-50).join(',');
          
          let res = await apiClient.get(`/reels/feed?page=${page}&limit=${limit}&category=${category}&excludeIds=${excludeIdsParam}`);
          
          // Fallback: If we exhausted the pool, clear seenReels and retry once!
          if (res.data.length === 0 && seenIds.length > 0) {
            console.log("Feed exhausted! Clearing seenReelIds and looping.");
            get().clearSeenReels();
            excludeIdsParam = page === 1 ? '' : currentReels.map(r => r.id).join(',');
            res = await apiClient.get(`/reels/feed?page=${page}&limit=${limit}&category=${category}&excludeIds=${excludeIdsParam}`);
          }

          const fetchedReels = res.data.map((r: any) => ({
            id: r.id,
            creatorId: r.creatorId,
            creatorUsername: r.creator?.username || 'user',
            creatorAvatar: r.creator?.avatar || getDefaultAvatar(r.creator?.username || 'user'),
            creatorIsVerified: r.creator?.isVerified || false,
            videoUrl: r.mediaUrl, // Maps backend mediaUrl to frontend videoUrl
            thumbnailUrl: r.thumbnailUrl || r.mediaUrl, 
            description: r.description || '', // Maps backend description to frontend description
            musicName: r.musicName || 'Original Audio',
            likesCount: r.likesCount || 0,
            commentsCount: r.commentsCount || 0,
            savesCount: r.savesCount || 0,
            sharesCount: r.sharesCount || 0,
            viewsCount: r.viewsCount || 0,
            isLiked: false, 
            isSaved: false,
            category: r.category || 'lifestyle',
            isMonetized: r.isMonetized !== undefined ? r.isMonetized : true,
            location: { city: 'Bengaluru', latitude: r.latitude || 12.9716, longitude: r.longitude || 77.5946 }
          }));

          set((state) => {
            const existingIds = new Set(state.reels.map(r => r.id));
            const newReels = fetchedReels.filter((r: any) => !existingIds.has(r.id));
            return {
              reels: page === 1 ? fetchedReels : [...state.reels, ...newReels]
            };
          });
        } catch (error) {
          console.error("Error fetching reels:", error);
        }
      },
      fetchFollowingReels: async (page = 1, limit = 10) => {
        try {
          const res = await apiClient.get(`/reels/following?page=${page}&limit=${limit}`);
          const fetchedReels = res.data.map((r: any) => ({
            id: r.id,
            creatorId: r.creatorId,
            creatorUsername: r.creator?.username || 'user',
            creatorAvatar: r.creator?.avatar || getDefaultAvatar(r.creator?.username || 'user'),
            creatorIsVerified: r.creator?.isVerified || false,
            videoUrl: r.mediaUrl,
            thumbnailUrl: r.thumbnailUrl || r.mediaUrl, 
            description: r.description || '',
            musicName: r.musicName || 'Original Audio',
            likesCount: r.likesCount || 0,
            commentsCount: r.commentsCount || 0,
            savesCount: r.savesCount || 0,
            sharesCount: r.sharesCount || 0,
            viewsCount: r.viewsCount || 0,
            isLiked: false, 
            isSaved: false,
            category: r.category || 'lifestyle',
            location: { city: 'Bengaluru', latitude: r.latitude || 12.9716, longitude: r.longitude || 77.5946 }
          }));

          set((state) => {
            const existingIds = new Set(state.reels.map(r => r.id));
            const newReels = fetchedReels.filter((r: any) => !existingIds.has(r.id));
            return { reels: [...state.reels, ...newReels] };
          });
        } catch (error) {
          console.error("Error fetching following reels:", error);
        }
      },
      fetchCreators: async () => {
        try {
          const res = await apiClient.get('/users/creators');
          // Format creator structure if needed
          const creators = res.data.map((c: any) => ({
            ...c,
            location: { latitude: c.latitude, longitude: c.longitude, city: c.city }
          }));
          set({ creators });
        } catch (error) {
          console.error("Error fetching creators:", error);
        }
      },
      fetchLikedReels: async () => {
        try {
          const res = await apiClient.get('/reels/liked');
          const fetchedReels = res.data.map((r: any) => ({
            id: r.id,
            creatorId: r.creatorId,
            creatorName: r.creator?.name || 'User',
            creatorUsername: r.creator?.username || 'user',
            creatorAvatar: r.creator?.avatar || getDefaultAvatar(r.creator?.username || 'user'),
            creatorIsVerified: r.creator?.isVerified || false,
            videoUrl: r.mediaUrl,
            thumbnailUrl: r.thumbnailUrl || r.mediaUrl, 
            description: r.description || '',
            musicName: r.musicName || 'Original Audio',
            likesCount: r.likesCount || 0,
            commentsCount: r.commentsCount || 0,
            savesCount: r.savesCount || 0,
            sharesCount: r.sharesCount || 0,
            viewsCount: r.viewsCount || 0,
            isLiked: true, // We know it's liked because it's from the liked endpoint
            isSaved: false,
            category: r.category || 'lifestyle',
            isMonetized: r.isMonetized !== undefined ? r.isMonetized : true,
            location: { city: 'Bengaluru', latitude: r.latitude || 12.9716, longitude: r.longitude || 77.5946 }
          }));
          set({ likedReels: fetchedReels });
        } catch (error) {
          console.error("Error fetching liked reels:", error);
        }
      },
      fetchWatchHistory: async () => {
        try {
          const res = await apiClient.get('/reels/history');
          const fetchedReels = res.data.map((r: any) => ({
            id: r.id,
            creatorId: r.creatorId,
            creatorName: r.creator?.name || 'User',
            creatorUsername: r.creator?.username || 'user',
            creatorAvatar: r.creator?.avatar || getDefaultAvatar(r.creator?.username || 'user'),
            creatorIsVerified: r.creator?.isVerified || false,
            videoUrl: r.mediaUrl,
            thumbnailUrl: r.thumbnailUrl || r.mediaUrl, 
            description: r.description || '',
            musicName: r.musicName || 'Original Audio',
            likesCount: r.likesCount || 0,
            commentsCount: r.commentsCount || 0,
            savesCount: r.savesCount || 0,
            sharesCount: r.sharesCount || 0,
            viewsCount: r.viewsCount || 0,
            isLiked: false,
            isSaved: false,
            category: r.category || 'lifestyle',
            isMonetized: r.isMonetized !== undefined ? r.isMonetized : true,
            location: { city: 'Bengaluru', latitude: r.latitude || 12.9716, longitude: r.longitude || 77.5946 }
          }));
          set({ watchHistory: fetchedReels });
        } catch (error) {
          console.error("Error fetching watch history:", error);
        }
      },
      fetchUserReels: async (userId: string) => {
        try {
          const res = await apiClient.get(`/reels/user/${userId}`);
          const fetchedReels = res.data.map((r: any) => ({
            id: r.id,
            creatorId: r.creatorId,
            creatorName: r.creator?.name || 'User',
            creatorUsername: r.creator?.username || 'user',
            creatorAvatar: r.creator?.avatar || getDefaultAvatar(r.creator?.username || 'user'),
            creatorIsVerified: r.creator?.isVerified || false,
            videoUrl: r.mediaUrl,
            thumbnailUrl: r.thumbnailUrl || r.mediaUrl, 
            description: r.description || '',
            musicName: r.musicName || 'Original Audio',
            likesCount: r.likesCount || 0,
            commentsCount: r.commentsCount || 0,
            savesCount: r.savesCount || 0,
            sharesCount: r.sharesCount || 0,
            viewsCount: r.viewsCount || 0,
            isLiked: false, 
            isSaved: false,
            category: r.category || 'lifestyle',
            isMonetized: r.isMonetized !== undefined ? r.isMonetized : true,
            location: { city: 'Bengaluru', latitude: r.latitude || 12.9716, longitude: r.longitude || 77.5946 }
          }));

          set({ userReels: fetchedReels });
        } catch (error) {
          console.error("Error fetching user reels:", error);
        }
      },
      updateCreatorInfo: (creatorId, updates) => {
        set((state) => {
          const updateReel = (r: Reel) => {
            if (r.creatorId === creatorId) {
              return {
                ...r,
                creatorName: updates.name || r.creatorName,
                creatorUsername: updates.username || r.creatorUsername,
                creatorAvatar: updates.avatar || r.creatorAvatar,
              };
            }
            return r;
          };

          return {
            reels: state.reels.map(updateReel),
            userReels: state.userReels.map(updateReel),
            likedReels: state.likedReels.map(updateReel),
            watchHistory: state.watchHistory.map(updateReel),
            creators: state.creators.map(c => 
              c.id === creatorId ? { ...c, ...updates } : c
            )
          };
        });
      },
      deleteReel: async (reelId) => {
        try {
          await apiClient.delete(`/reels/${reelId}`);
          set((state) => ({
            reels: state.reels.filter(r => r.id !== reelId),
            userReels: state.userReels.filter(r => r.id !== reelId),
            likedReels: state.likedReels.filter(r => r.id !== reelId),
            watchHistory: state.watchHistory.filter(r => r.id !== reelId)
          }));
        } catch (error) {
          console.error("Error deleting reel:", error);
          throw error;
        }
      }
    }),
    {
      name: 'popli-feed-store-v2',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);
