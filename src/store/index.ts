import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Creator, Reel, Comment, Chat, Message, NotificationItem, TransactionItem, GiftType } from '../types';
import { generateMockDatabase, MOCK_COMMENTS } from '../services/mockApi';
import { getHaversineDistance } from '../services/geoService';

// 1. Initialize storage instance with a safe fallback for Expo Go environments
let mmkvStoreStorage: StateStorage;

try {
  const { MMKV } = require('react-native-mmkv');
  const mmkvInstance = new MMKV();
  mmkvStoreStorage = {
    setItem: (name, value) => {
      mmkvInstance.set(name, value);
    },
    getItem: (name) => {
      const value = mmkvInstance.getString(name);
      return value ?? null;
    },
    removeItem: (name) => {
      mmkvInstance.delete(name);
    },
  };
} catch (e) {
  console.warn("Native MMKV/NitroModules not available in Expo Go. Falling back to in-memory store.");
  const memoryStore = new Map<string, string>();
  mmkvStoreStorage = {
    setItem: (name, value) => {
      memoryStore.set(name, value);
    },
    getItem: (name) => {
      return memoryStore.get(name) ?? null;
    },
    removeItem: (name) => {
      memoryStore.delete(name);
    },
  };
}

// Seeding the initial database once
const initialMockData = generateMockDatabase();

// ==========================================
// 1. AUTH & PREFERENCES STORE
// ==========================================
interface AuthState {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  userProfile: {
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
  };
  followingIds: string[];
  theme: 'dark' | 'light';
  language: 'English' | 'Hindi' | 'Bengali' | 'Tamil';
  notificationsEnabled: boolean;
  isFirstLogin: boolean;
  setLogin: (status: boolean) => void;
  setOnboardingComplete: (status: boolean) => void;
  setFirstLogin: (status: boolean) => void;
  updateProfile: (profile: Partial<AuthState['userProfile']>) => void;
  toggleTheme: () => void;
  setLanguage: (lang: AuthState['language']) => void;
  toggleNotifications: () => void;
  toggleFollow: (creatorId: string) => void;
  logout: () => void;
  mockRegisteredUsers: string[];
  registerMockUser: (identifier: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isOnboarded: false,
      userProfile: {
        name: 'Alex Rivera',
        username: 'alex_rivera',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
        bio: 'Creator Tier 1 🚀 | Living in India\'s tech heart Bengaluru.',
        city: 'Bengaluru',
        category: 'comedy',
        followersCount: 0,
        followingCount: 3,
        giftsReceivedCount: 0,
        isVerified: false
      },
      followingIds: ['aria_styles', 'marcus_vlogs', 'elena_fashion'],
      theme: 'dark',
      language: 'English',
      notificationsEnabled: true,
      isFirstLogin: true,
      mockRegisteredUsers: [],
      registerMockUser: (identifier) => set((state) => ({ 
        mockRegisteredUsers: [...state.mockRegisteredUsers, identifier.toLowerCase()] 
      })),
      setLogin: (status) => set({ isLoggedIn: status }),
      setOnboardingComplete: (status) => set({ isOnboarded: status }),
      setFirstLogin: (status) => set({ isFirstLogin: status }),
      updateProfile: (profile) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (lang) => set({ language: lang }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleFollow: (creatorId) =>
        set((state) => {
          const isFollowing = state.followingIds.includes(creatorId);
          const newFollowing = isFollowing
            ? state.followingIds.filter((id) => id !== creatorId)
            : [...state.followingIds, creatorId];
          return {
            followingIds: newFollowing,
            userProfile: {
              ...state.userProfile,
              followingCount: state.userProfile.followingCount + (isFollowing ? -1 : 1)
            }
          };
        }),
      logout: () => set({ isLoggedIn: false, isOnboarded: false, followingIds: [] })
    }),
    {
      name: 'popli-auth-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);

// ==========================================
// 2. KYC & ONBOARDING STATE STORE
// ==========================================
interface KYCState {
  currentStep: number;
  fullName: string;
  dob: string;
  city: string;
  address: string;
  category: string;
  panNumber: string;
  aadharNumber: string;
  upiId: string;
  bankAccount: string;
  ifscCode: string;
  accountType: 'Savings' | 'Current';
  isPanVerified: boolean;
  isAadharVerified: boolean;
  isUpiLinked: boolean;
  isBankLinked: boolean;
  kycCompleted: boolean;
  updateKYCField: (fields: Partial<Omit<KYCState, 'updateKYCField' | 'setKYCStep' | 'verifyPAN' | 'verifyAadhar' | 'linkUPI' | 'linkBank' | 'resetKYC'>>) => void;
  setKYCStep: (step: number) => void;
  verifyPAN: () => Promise<boolean>;
  verifyAadhar: () => Promise<boolean>;
  linkUPI: () => Promise<boolean>;
  linkBank: () => Promise<boolean>;
  resetKYC: () => void;
}

export const useKYCStore = create<KYCState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      fullName: '',
      dob: '',
      city: 'Bengaluru',
      address: '',
      category: 'comedy',
      panNumber: '',
      aadharNumber: '',
      upiId: '',
      bankAccount: '',
      ifscCode: '',
      accountType: 'Savings',
      isPanVerified: false,
      isAadharVerified: false,
      isUpiLinked: false,
      isBankLinked: false,
      kycCompleted: false,
      updateKYCField: (fields) => set(fields),
      setKYCStep: (step) => set({ currentStep: step }),
      verifyPAN: async () => {
        const isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(get().panNumber.toUpperCase());
        if (isValid) {
          await new Promise((r) => setTimeout(r, 1200)); // Simulate animation
          set({ isPanVerified: true });
          return true;
        }
        return false;
      },
      verifyAadhar: async () => {
        const isValid = /^[0-9]{12}$/.test(get().aadharNumber.replace(/\s/g, ''));
        if (isValid) {
          await new Promise((r) => setTimeout(r, 1200));
          set({ isAadharVerified: true });
          return true;
        }
        return false;
      },
      linkUPI: async () => {
        const isValid = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(get().upiId);
        if (isValid) {
          await new Promise((r) => setTimeout(r, 1000));
          set({ isUpiLinked: true });
          return true;
        }
        return false;
      },
      linkBank: async () => {
        const isAcValid = get().bankAccount.length >= 9 && get().bankAccount.length <= 18;
        const isIfscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(get().ifscCode.toUpperCase());
        if (isAcValid && isIfscValid) {
          await new Promise((r) => setTimeout(r, 1000));
          set({ isBankLinked: true, kycCompleted: true });
          useAuthStore.getState().updateProfile({ isVerified: true }); // Unlock verified gold badge!
          return true;
        }
        return false;
      },
      resetKYC: () =>
        set({
          currentStep: 1,
          fullName: '',
          dob: '',
          city: 'Bengaluru',
          address: '',
          category: 'comedy',
          panNumber: '',
          aadharNumber: '',
          upiId: '',
          bankAccount: '',
          ifscCode: '',
          accountType: 'Savings',
          isPanVerified: false,
          isAadharVerified: false,
          isUpiLinked: false,
          isBankLinked: false,
          kycCompleted: false
        })
    }),
    {
      name: 'popli-kyc-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);

// ==========================================
// 3. WALLET & COINS STORE
// ==========================================
interface WalletState {
  coinBalance: number;
  inrEarnings: number;
  transactions: TransactionItem[];
  rechargeCoins: (coins: number) => void;
  sendGiftCoins: (coins: number, desc: string) => boolean;
  receiveGiftCoins: (coins: number, desc: string) => void;
  withdrawEarnings: (amount: number, upiId: string) => boolean;
  addTransaction: (tx: Omit<TransactionItem, 'id' | 'timestamp'>) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      coinBalance: 1250, // Standard starting coins in Figma
      inrEarnings: 2450.0, // Starting earnings in Figma
      transactions: initialMockData.transactions,
      rechargeCoins: (coins) => {
        set((state) => ({ coinBalance: state.coinBalance + coins }));
        get().addTransaction({
          type: 'coin_recharge',
          amount: coins,
          currency: 'coins',
          description: `Bought ${coins} coins pack`,
          status: 'success'
        });
      },
      sendGiftCoins: (coins, desc) => {
        if (get().coinBalance >= coins) {
          set((state) => ({ coinBalance: state.coinBalance - coins }));
          get().addTransaction({
            type: 'gift_send',
            amount: coins,
            currency: 'coins',
            description: desc,
            status: 'success'
          });
          return true;
        }
        return false;
      },
      receiveGiftCoins: (coins, desc) => {
        // 1 Coin = ₹0.50 conversion
        const convertedINR = coins * 0.50;
        set((state) => ({
          inrEarnings: state.inrEarnings + convertedINR
        }));
        get().addTransaction({
          type: 'gift_receive',
          amount: coins,
          currency: 'coins',
          description: desc,
          status: 'success'
        });
      },
      withdrawEarnings: (amount, upiId) => {
        if (get().inrEarnings >= amount) {
          set((state) => ({ inrEarnings: state.inrEarnings - amount }));
          get().addTransaction({
            type: 'withdrawal',
            amount: amount,
            currency: 'INR',
            description: `Withdrew earnings to UPI: ${upiId}`,
            status: 'success'
          });
          return true;
        }
        return false;
      },
      addTransaction: (tx) =>
        set((state) => {
          const dateStr = new Date()
            .toISOString()
            .slice(0, 16)
            .replace('T', ' ');
          const newTx: TransactionItem = {
            id: `tx_${Date.now()}`,
            timestamp: dateStr,
            ...tx
          };
          return { transactions: [newTx, ...state.transactions] };
        })
    }),
    {
      name: 'popli-wallet-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);

// ==========================================
// 4. VIDEO FEED & DYNAMIC REELS STORE
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
  setMoodFilter: (filter: string) => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      creators: initialMockData.creators,
      reels: initialMockData.reels,
      comments: MOCK_COMMENTS,
      moodFilter: 'all',
      gpsLatitude: null,
      gpsLongitude: null,
      gpsCity: null,
      nearbyEnabled: false,
      setGPS: (lat, lon, city) => {
        set({ gpsLatitude: lat, gpsLongitude: lon, gpsCity: city });
        // Recalculate distances for all creators dynamically
        set((state) => {
          const updatedCreators = state.creators.map((c) => {
            const distance = getHaversineDistance(lat, lon, c.location.latitude, c.location.longitude);
            return { ...c, distanceKm: distance };
          });
          const updatedReels = state.reels.map((r) => {
            const distance = getHaversineDistance(lat, lon, r.location.latitude, r.location.longitude);
            return { ...r, distanceKm: distance };
          });
          return { creators: updatedCreators, reels: updatedReels };
        });
      },
      setNearbyEnabled: (enabled) => set({ nearbyEnabled: enabled }),
      toggleLikeReel: (reelId) =>
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
        }),
      toggleSaveReel: (reelId) =>
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
        }),
      addLocalReel: (reel) =>
        set((state) => ({
          reels: [reel, ...state.reels]
        })),
      addComment: (comment) =>
        set((state) => {
          const newComment: Comment = {
            id: `c_${Date.now()}`,
            createdAt: '1s ago',
            likesCount: 0,
            ...comment
          };
          return {
            comments: [newComment, ...state.comments],
            reels: state.reels.map((r) => {
              if (r.id === comment.reelId) {
                return { ...r, commentsCount: r.commentsCount + 1 };
              }
              return r;
            })
          };
        }),
      setMoodFilter: (filter) => set({ moodFilter: filter })
    }),
    {
      name: 'popli-feed-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);

// ==========================================
// 5. INBOX, DMs & CHAT STORE
// ==========================================
interface ChatState {
  chats: Chat[];
  messages: Message[];
  notifications: NotificationItem[];
  isTyping: Record<string, boolean>;
  sendMessage: (chatId: string, text: string) => void;
  markChatRead: (chatId: string) => void;
  markNotificationsRead: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: initialMockData.chats,
      messages: [
        {
          id: 'm_1',
          chatId: 'chat_1',
          senderId: 'aria_styles',
          text: 'Hey! Loved your new video.',
          timestamp: '9:30 AM',
          status: 'seen'
        },
        {
          id: 'm_2',
          chatId: 'chat_1',
          senderId: 'alex_rivera',
          text: 'Thanks Aria! Means a lot coming from you.',
          timestamp: '9:35 AM',
          status: 'seen'
        },
        {
          id: 'm_3',
          chatId: 'chat_1',
          senderId: 'aria_styles',
          text: 'The transitions are absolutely fire! That lighting in the beginning. Wow. ✨',
          timestamp: '9:41 AM',
          status: 'seen'
        }
      ],
      notifications: initialMockData.notifications,
      isTyping: {},
      sendMessage: (chatId, text) => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const senderId = 'alex_rivera';
        
        const newMsg: Message = {
          id: `m_${Date.now()}`,
          chatId,
          senderId,
          text,
          timestamp: timeStr,
          status: 'sent'
        };

        set((state) => ({
          messages: [...state.messages, newMsg],
          chats: state.chats.map((c) => {
            if (c.id === chatId) {
              return {
                ...c,
                lastMessage: text,
                lastMessageTime: timeStr
              };
            }
            return c;
          })
        }));

        // Simulate Dynamic Creator replies! Very Interactive!
        set((state) => ({ isTyping: { ...state.isTyping, [chatId]: true } }));

        setTimeout(() => {
          const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const activeChat = get().chats.find((c) => c.id === chatId);
          
          const replyMsg: Message = {
            id: `m_reply_${Date.now()}`,
            chatId,
            senderId: activeChat?.creatorId || 'aria_styles',
            text: 'Aww thank you! Let\'s catch up or collab on this soon! 🔥💯',
            timestamp: replyTime,
            status: 'seen'
          };

          set((state) => ({
            messages: [...state.messages, replyMsg],
            isTyping: { ...state.isTyping, [chatId]: false },
            chats: state.chats.map((c) => {
              if (c.id === chatId) {
                return {
                  ...c,
                  lastMessage: replyMsg.text,
                  lastMessageTime: replyTime,
                  unreadCount: c.unreadCount + 1
                };
              }
              return c;
            })
          }));
        }, 3000);
      },
      markChatRead: (chatId) =>
        set((state) => ({
          chats: state.chats.map((c) => {
            if (c.id === chatId) {
              return { ...c, unreadCount: 0 };
            }
            return c;
          })
        })),
      markNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
        }))
    }),
    {
      name: 'popli-chat-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);
