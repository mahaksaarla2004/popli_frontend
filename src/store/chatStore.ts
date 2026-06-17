/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Creator, Reel, Comment, Chat, Message, NotificationItem, TransactionItem, GiftType } from '../types';
import { getHaversineDistance } from '../services/geoService';
import { apiClient, BASE_URL } from '../api/client';
import io, { Socket } from 'socket.io-client';
import { formatRelativeTime } from '../utils';
import { mmkvStoreStorage } from './storage';

// ==========================================
// // 5. INBOX, DMs & CHAT STORE
// ==========================================

interface ChatState {
  chats: Chat[];
  messages: Message[];
  notifications: NotificationItem[];
  isTyping: Record<string, boolean>;
  mutedChats: string[];
  sendMessage: (chatId: string, text: string, mediaUrl?: string) => Promise<void>;
  toggleMuteChat: (chatId: string) => void;
  sendDirectMessage: (receiver: { id: string, name?: string, username?: string, avatar?: string }, text?: string, mediaUrl?: string) => void;
  markChatRead: (chatId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchNextNotifications: () => Promise<void>;
  notificationsCursor?: string;
  hasMoreNotifications: boolean;
}

// Keep a reference to the active socket outside the store state 
// to prevent recursive serialization issues with Zustand/MMKV
let socket: Socket | null = null;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      messages: [],
      notifications: [],
      notificationsCursor: undefined,
      hasMoreNotifications: true,
      isTyping: {},
      mutedChats: [],
      toggleMuteChat: (chatId) => {
        set((state) => ({
          mutedChats: state.mutedChats.includes(chatId)
            ? state.mutedChats.filter(id => id !== chatId)
            : [...state.mutedChats, chatId]
        }));
      },
      connectSocket: () => {
        if (socket?.connected) return;
        
        // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useAuthStore } = require('./authStore');
        const token = useAuthStore.getState().token;
        if (!token) return;

        socket = io(BASE_URL, {
          auth: { token },
          transports: ['websocket'],
        });

        socket.on('connect', () => {
          console.log('Chat socket connected:', socket?.id);
        });

        socket.on('new_message', (message: any) => {
          set((state) => {
            if (state.messages.some(m => m.id === message.id)) return state; // Prevent duplicates

            const formattedMsg = {
              id: message.id,
              chatId: message.chatId,
              senderId: message.senderId,
              text: message.text,
              mediaUrl: message.mediaUrl,
              type: message.type,
              storyId: message.storyId,
              timestamp: formatRelativeTime(message.createdAt || new Date().toISOString()),
              status: 'seen'
            };

            const isChatActive = state.messages.some(m => m.chatId === message.chatId);
            const updatedMessages = isChatActive ? [...state.messages, formattedMsg as any] : state.messages;

            const updatedChats = state.chats.map((c) => {
              if (c.id === message.chatId) {
                return {
                  ...c,
                  lastMessage: message.text || 'Sent media',
                  lastMessageTime: formatRelativeTime(new Date().toISOString()),
                  unreadCount: c.unreadCount + 1
                };
              }
              return c;
            });

            return { messages: updatedMessages, chats: updatedChats };
          });
        });

        socket.on('typing', (data: { chatId: string, isTyping: boolean, userId: string }) => {
          set((state) => ({ isTyping: { ...state.isTyping, [data.chatId]: data.isTyping } }));
        });

        socket.on('new_notification', (notification: any) => {
          set((state) => {
            const exists = state.notifications.some(n => n.id === notification.id);
            if (exists) return state;
            return { notifications: [notification, ...state.notifications] };
          });
        });

        socket.on('disconnect', () => {
          console.log('Chat socket disconnected');
        });
      },
      disconnectSocket: () => {
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      },
      sendMessage: async (chatId, text, mediaUrl) => {
        try {
          const res = await apiClient.post(`/chats/${chatId}/messages`, { text: text || 'Sent media', mediaUrl });
          const rawMsg = res.data;
          
          const newMsg = {
            id: rawMsg.id,
            chatId: rawMsg.chatId,
            senderId: rawMsg.senderId,
            text: rawMsg.text,
            mediaUrl: rawMsg.mediaUrl,
            type: rawMsg.type,
            storyId: rawMsg.storyId,
            timestamp: formatRelativeTime(rawMsg.createdAt || new Date().toISOString()),
            status: 'seen'
          };
          
          set((state) => {
            if (state.messages.some(m => m.id === newMsg.id)) return state;
            return {
            messages: [...state.messages, newMsg as any],
            chats: state.chats.map((c) => {
              if (c.id === chatId) {
                return {
                  ...c,
                  lastMessage: text || 'Sent media',
                  lastMessageTime: formatRelativeTime(new Date().toISOString())
                };
              }
              return c;
            })
            };
          });
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      },
      sendDirectMessage: async (receiver, text, mediaUrl) => {
        try {
          const chatRes = await apiClient.post(`/chats/user/${receiver.id}`);
          const chatId = chatRes.data.id;
          
          if (chatId) {
            await get().sendMessage(chatId, text || '', mediaUrl);
          }
          await get().fetchChats();
        } catch (error) {
          console.error("Failed to send direct message:", error);
        }
      },
      markChatRead: async (chatId) => {
        set((state) => ({
          chats: state.chats.map((c) => {
            if (c.id === chatId) {
              return { ...c, unreadCount: 0 };
            }
            return c;
          })
        }));
        try {
          await apiClient.post(`/chats/${chatId}/read`);
        } catch (error) {
          console.error("Failed to mark chat read on backend", error);
        }
      },
      deleteChat: async (chatId) => {
        try {
          await apiClient.delete(`/chats/${chatId}`);
          set(state => ({
            chats: state.chats.filter(c => c.id !== chatId)
          }));
        } catch (e) {
          console.error('Error deleting chat:', e);
        }
      },
      deleteMessage: async (chatId, messageId) => {
        try {
          await apiClient.delete(`/chats/${chatId}/messages/${messageId}`);
          set(state => ({
            messages: state.messages.filter(m => m.id !== messageId)
          }));
        } catch (e) {
          console.error('Error deleting message:', e);
        }
      },
      markNotificationsRead: async () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
        }));
        try {
          const { notificationsApi } = require('../api/services');
          await notificationsApi.markAllRead();
        } catch (e) {
          console.error("Failed to mark notifications read:", e);
        }
      },
      fetchChats: async () => {
        try {
          const res = await apiClient.get('/chats');
          const formattedChats = res.data.map((cp: any) => {
            const chat = cp.chat || cp; // Handle both formats just in case
            return {
              id: chat.id,
              creatorId: chat.participants?.[0]?.user?.id || 'unknown',
              creatorName: chat.participants?.[0]?.user?.name || 'Unknown',
              creatorUsername: chat.participants?.[0]?.user?.username || 'user',
              creatorAvatar: chat.participants?.[0]?.user?.avatar || 'https://i.pravatar.cc/150',
              lastMessage: chat.lastMessage || 'No messages yet',
              lastMessageTime: chat.lastMessageAt 
                ? formatRelativeTime(chat.lastMessageAt)
                : '',
              unreadCount: cp.unreadCount || 0
            };
          });
          set({ chats: formattedChats });
        } catch (error) {
          console.error("Failed to fetch chats:", error);
        }
      },
      fetchMessages: async (chatId) => {
        try {
          const res = await apiClient.get(`/chats/${chatId}/messages`);
          const fetchedMessages = res.data.map((m: any) => ({
            id: m.id,
            chatId: m.chatId,
            senderId: m.senderId,
            text: m.text,
            mediaUrl: m.mediaUrl,
            type: m.type,
            storyId: m.storyId,
            timestamp: formatRelativeTime(m.createdAt),
            status: 'seen'
          }));
          set({ messages: fetchedMessages });
          
          if (socket) {
            socket.emit('join_chat', chatId);
          }
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        }
      },
      fetchNotifications: async () => {
        try {
          const { notificationsApi } = require('../api/services');
          const res = await notificationsApi.getNotifications();
          const rawNotifications = res.data.notifications || res.data;
          
          const formattedNotifs = rawNotifications.map((n: any) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            senderName: n.senderAvatar ? n.user?.name || 'User' : (n.sender?.username || 'User'),
            senderAvatar: n.senderAvatar || n.sender?.avatar || 'https://i.pravatar.cc/150',
            timestamp: n.createdAt,
            isRead: n.isRead,
            coinsCount: n.type === 'gift' ? 100 : undefined
          }));
          set({ 
            notifications: formattedNotifs, 
            notificationsCursor: res.data.nextCursor,
            hasMoreNotifications: !!res.data.nextCursor
          });
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      },
      fetchNextNotifications: async () => {
        const state = get();
        if (!state.hasMoreNotifications || !state.notificationsCursor) return;
        
        try {
          const { notificationsApi } = require('../api/services');
          const res = await notificationsApi.getNotifications(state.notificationsCursor);
          const rawNotifications = res.data.notifications || res.data;
          
          const formattedNotifs = rawNotifications.map((n: any) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            senderName: n.senderAvatar ? n.user?.name || 'User' : (n.sender?.username || 'User'),
            senderAvatar: n.senderAvatar || n.sender?.avatar || 'https://i.pravatar.cc/150',
            timestamp: n.createdAt,
            isRead: n.isRead,
            coinsCount: n.type === 'gift' ? 100 : undefined
          }));
          
          set({ 
            notifications: [...state.notifications, ...formattedNotifs], 
            notificationsCursor: res.data.nextCursor,
            hasMoreNotifications: !!res.data.nextCursor
          });
        } catch (error) {
          console.error("Failed to fetch next notifications:", error);
        }
      }
    }),
    {
      name: 'popli-chat-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);
