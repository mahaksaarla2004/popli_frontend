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
  sendMessage: (chatId: string, text: string) => void;
  sendDirectMessage: (receiver: { id: string, name: string, username: string, avatar: string }, text: string) => void;
  markChatRead: (chatId: string) => void;
  markNotificationsRead: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
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
      isTyping: {},
      connectSocket: () => {
        if (socket?.connected) return;
        
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

        socket.on('new_message', (message: Message) => {
          set((state) => {
            const isChatActive = state.messages.some(m => m.chatId === message.chatId);
            const updatedMessages = isChatActive ? [...state.messages, message] : state.messages;

            const updatedChats = state.chats.map((c) => {
              if (c.id === message.chatId) {
                return {
                  ...c,
                  lastMessage: message.text,
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
      sendMessage: async (chatId, text) => {
        try {
          const res = await apiClient.post(`/chats/${chatId}/messages`, { text });
          const newMsg = res.data;
          
          set((state) => ({
            messages: [...state.messages, newMsg],
            chats: state.chats.map((c) => {
              if (c.id === chatId) {
                return {
                  ...c,
                  lastMessage: text,
                  lastMessageTime: formatRelativeTime(new Date().toISOString())
                };
              }
              return c;
            })
          }));
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      },
      sendDirectMessage: async (receiver, text) => {
        // Find existing chat with this user
        try {
          const res = await apiClient.get('/chats');
          const existingChats = res.data;
          let chat = existingChats.find((c: any) => 
            c.participants.some((p: any) => p.id === receiver.id)
          );
          
          let chatId = chat?.id;
          
          // If no chat exists, the backend will create one when sending the first message
          if (!chatId) {
            // Wait, we need a special endpoint to send a message by userId
            // For now, let's assume the backend handles creating a chat if we post to `/chats/user/:userId/messages` or similar.
            // Actually, we can fetch from the backend later. For now, create dummy chat locally and send later,
            // or post to standard endpoint if supported.
            const createRes = await apiClient.post(`/chats/user/${receiver.id}/messages`, { text });
            chatId = createRes.data.chatId;
          } else {
            await get().sendMessage(chatId, text);
          }
          await get().fetchChats();
        } catch (error) {
          console.error("Failed to send direct message:", error);
        }
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
      markNotificationsRead: async () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
        }));
        try {
          await apiClient.post('/notifications/read-all');
        } catch (e) {
          console.error("Failed to mark notifications read:", e);
        }
      },
      fetchChats: async () => {
        try {
          const res = await apiClient.get('/chats');
          const formattedChats = res.data.map((c: any) => ({
            id: c.id,
            creatorId: c.participants[0]?.user?.id || 'unknown',
            creatorName: c.participants[0]?.user?.name || 'Unknown',
            creatorAvatar: c.participants[0]?.user?.avatar || 'https://i.pravatar.cc/150',
            lastMessage: c.lastMessage || 'No messages yet',
            lastMessageTime: c.lastMessageAt 
              ? formatRelativeTime(c.lastMessageAt)
              : '',
            unreadCount: 0 // Will need to sync from backend if provided
          }));
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
          const res = await apiClient.get('/notifications');
          const formattedNotifs = res.data.map((n: any) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            senderName: n.sender?.username,
            senderAvatar: n.sender?.avatar,
            timestamp: formatRelativeTime(n.createdAt),
            isRead: n.isRead,
            coinsCount: n.type === 'gift' ? 100 : undefined // default mock coins for gifts
          }));
          set({ notifications: formattedNotifs });
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      }
    }),
    {
      name: 'popli-chat-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);
