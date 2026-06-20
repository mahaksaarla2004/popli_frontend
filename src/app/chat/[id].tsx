import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Platform, Modal, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore, useChatStore } from '../../store';
import { ChevronLeft, Info, BellOff, Ban, X, Phone, Video } from 'lucide-react-native';
import StoryRing from '../../components/StoryRing';
import { FlashList } from '@shopify/flash-list';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatInputBar from '../../components/chat/ChatInputBar';
import { apiClient } from '../../api/client';
import { formatRelativeTime } from '../../utils';

export default function ChatScreen() {
  const router = useRouter();
  const { id, creatorId, creatorName, creatorUsername, creatorAvatar } = useLocalSearchParams();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const { userProfile, toggleBlock, blockedUsers } = useAuthStore();
  const { 
    chats, 
    messages: storeMessages, 
    fetchMessages, 
    fetchChats, 
    sendMessage, 
    toggleMuteChat, 
    mutedChats, 
    markChatRead,
    markMessageSeen,
    isTyping,
    sendTyping
  } = useChatStore();
  
  const chat = chats.find(c => c.id === id);

  const displayAvatar = chat?.creatorAvatar || (creatorAvatar as string) || 'https://i.pravatar.cc/150';
  const displayName = chat?.creatorName || (creatorName as string) || 'Unknown User';
  const displayUsername = chat?.creatorUsername || (creatorUsername as string) || 'user';
  
  const targetUserId = chat?.creatorId || (creatorId as string);
  const isBlocked = blockedUsers.some(u => u.id === targetUserId);

  // Only show messages for this chat, sort newest first for inverted FlashList
  const messages = storeMessages
    .filter(m => m.chatId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  useEffect(() => {
    if (id) {
      fetchMessages(id as string);
      markChatRead(id as string);
      if (!chat) fetchChats();
    }
  }, [id]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    viewableItems.forEach((item: any) => {
      const msg = item.item;
      // Ensure we have userProfile.id and the message is from someone else
      if (userProfile?.id && msg.senderId !== userProfile.id && msg.status !== 'seen') {
        markMessageSeen(id as string, msg.id);
      }
    });
  });

  const handleSend = async (text: string, mediaUrl?: string, type?: 'TEXT'|'VOICE') => {
    console.log('[DEBUG-TRACE] 3. handleSend triggered with:', { text, mediaUrl, type });
    await sendMessage(id as string, text, mediaUrl, {
      type,
      replyToId: replyingTo?.id,
      replyToText: replyingTo?.text,
    });
    setReplyingTo(null);
  };

  const handleTyping = (typing: boolean) => {
    if (id && userProfile?.id) {
      sendTyping(id as string, typing);
    }
  };

  const latestSentMsgId = messages.find(m => m.senderId === userProfile?.id)?.id;

  const formattedMessages = messages.map(m => {
    return {
      ...m,
      isStoryMention: m.type === 'STORY_MENTION',
      isReelShare: (m.text?.includes('check out this Reel! 🎥') || m.text?.includes('tagged you')) && m.text?.includes('/reels/'),
      type: m.senderId === userProfile?.id ? 'sent' : 'received',
      time: formatRelativeTime(m.timestamp),
      senderAvatar: m.senderId === userProfile?.id ? userProfile?.avatar : displayAvatar,
      senderUsername: (m as any).sender?.username || (m.senderId === userProfile?.id ? userProfile?.username : displayUsername),
      attachment: m.mediaUrl,
      isVideo: m.mediaUrl?.endsWith('.mp4') || m.mediaUrl?.includes('/video/'),
      isLatestSent: m.id === latestSentMsgId
    };
  });

  return (
    <SafeScreen edgeToEdgeBottom className="bg-[#12081E]">
      <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-white/5 bg-[#12081E] z-10">
        <View className="flex-row items-center gap-3 flex-1">
          <Pressable onPress={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft size={28} color="#FFFFFF" />
          </Pressable>
          
          <Pressable 
            className="flex-row items-center gap-3 flex-1"
            onPress={() => router.push(`/user/${displayUsername}`)}
          >
            <View className="relative">
              <StoryRing userId={displayUsername} avatarUrl={displayAvatar} size={40} />
              {chat?.isOnline && (
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#12081E]" />
              )}
            </View>
            
            <View className="flex-1">
              <Text className="text-white font-bold text-base" numberOfLines={1}>{displayName}</Text>
              {isTyping[id as string] ? (
                <Text className="text-[#A855F7] text-xs">Typing...</Text>
              ) : chat?.isOnline ? (
                <Text className="text-[#10B981] text-xs">Active now</Text>
              ) : null}
            </View>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => setShowOptionsModal(true)}>
            <Info size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View className="flex-1 px-4">
        <FlatList
          data={formattedMessages}
          keyExtractor={(item: any) => item.id.toString()}
          inverted={true}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 20, paddingTop: 10 }}
          ListEmptyComponent={() => (
            <View style={{ transform: [{ scaleY: -1 }, { scaleX: -1 }] }} className="items-center justify-center flex-1 mt-20 mb-10">
              <Image source={{ uri: displayAvatar }} style={{ width: 90, height: 90, borderRadius: 45 }} className="mb-4" />
              <Text className="text-white font-bold text-xl mb-1">{displayName}</Text>
              <Text className="text-white/50 text-sm mb-6">Instagram</Text>
              <View className="bg-[#1A0E2C] px-4 py-2.5 rounded-full border border-white/10">
                <Text className="text-white font-semibold">Say hi to {displayUsername} 👋</Text>
              </View>
            </View>
          )}
          renderItem={({ item }: any) => (
            <MessageBubble 
              msg={item} 
              onReply={(msg: any) => setReplyingTo(msg)} 
              onImagePress={(url: string) => setViewerImage(url)}
            />
          )}
        />
      </View>

      <ChatInputBar 
        onSend={handleSend}
        onTyping={handleTyping}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {/* OPTIONS MODAL */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center items-center px-6 z-50"
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View className="bg-[#1A0E2C] w-full rounded-3xl overflow-hidden border border-white/5" onStartShouldSetResponder={() => true}>
            <View className="p-5 border-b border-white/5 flex-row items-center justify-between">
              <Text className="text-white font-bold text-lg">Chat Options</Text>
              <Pressable onPress={() => setShowOptionsModal(false)} className="p-1">
                <X size={20} color="#9CA3AF" />
              </Pressable>
            </View>
            
            <View className="p-2">
              <Pressable 
                onPress={() => {
                  toggleMuteChat(id as string);
                  setShowOptionsModal(false);
                }}
                className="flex-row items-center px-4 py-4 active:bg-white/5 rounded-xl"
              >
                <BellOff size={20} color="#FFFFFF" />
                <View className="ml-3">
                  <Text className="text-white font-semibold text-base">
                    {mutedChats.includes(id as string) ? 'Unmute Notifications' : 'Mute Notifications'}
                  </Text>
                  <Text className="text-neutral-grey text-xs mt-0.5">Stop receiving push notifications</Text>
                </View>
              </Pressable>

              <Pressable 
                onPress={() => {
                  if (targetUserId) {
                    toggleBlock(targetUserId);
                  }
                  // Let the modal stay open so they can see it changed to Unblock
                }}
                className="flex-row items-center px-4 py-4 active:bg-white/5 rounded-xl"
              >
                <Ban size={20} color="#EF4444" />
                <View className="ml-3">
                  <Text className="text-[#EF4444] font-semibold text-base">{isBlocked ? 'Unblock User' : 'Block User'}</Text>
                  <Text className="text-neutral-grey text-xs mt-0.5">{isBlocked ? 'They will be able to message you again' : "They won't be able to message you"}</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* IMAGE VIEWER MODAL */}
      <Modal visible={!!viewerImage} transparent={true} animationType="fade" onRequestClose={() => setViewerImage(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <Pressable 
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 }} 
            onPress={() => setViewerImage(null)}
          >
            <X size={28} color="white" />
          </Pressable>
          {viewerImage && (
            <Image source={{ uri: viewerImage }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
          )}
        </View>
      </Modal>

      </View>
    </SafeScreen>
  );
}
