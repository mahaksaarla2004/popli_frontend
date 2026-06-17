import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Image, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore, useChatStore, useStoryStore, useFeedStore } from '../../store';
import { 
  ChevronLeft, Video, Info, Plus, Mic, Image as ImageIcon, 
  Sticker, Play, CheckCheck, Send, BellOff, Ban, X
} from 'lucide-react-native';
import StoryRing from '../../components/StoryRing';
import { formatRelativeTime } from '../../utils';
import { apiClient } from '../../api/client';

const ReelPreviewCard = ({ reelId }: { reelId: string }) => {
  const { reels, userReels, likedReels, watchHistory } = useFeedStore();
  
  // Try to find the reel in any of our cached lists
  const allCachedReels = [...reels, ...userReels, ...likedReels, ...watchHistory];
  const reel = allCachedReels.find(r => r.id === reelId);

  const thumbnailUrl = reel?.thumbnailUrl || reel?.videoUrl;
  const getSafeThumbnail = (url: string) => {
    if (!url) return null;
    if (url.includes('cloudinary') && url.endsWith('.mp4')) {
      return url.replace('.mp4', '.jpg');
    }
    return url;
  };
  const safeThumb = thumbnailUrl ? getSafeThumbnail(thumbnailUrl) : null;

  return (
    <View className="w-full h-full bg-[#1A0E2C] relative border border-white/10">
      {safeThumb ? (
        <Image 
          source={{ uri: safeThumb }} 
          className="w-full h-full opacity-90"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full bg-[#2D1B4E] items-center justify-center">
           <Video size={40} color="#FFFFFF" style={{ opacity: 0.3 }} />
        </View>
      )}
      
      <View className="absolute inset-0 bg-black/20 items-center justify-center">
        <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center backdrop-blur-md">
          <Play size={20} color="#FFFFFF" fill="#FFFFFF" className="ml-1" />
        </View>
      </View>

      <View className="absolute top-0 left-0 right-0 p-3 flex-row items-center gap-2 bg-black/40">
        {reel?.creatorAvatar ? (
            <Image source={{ uri: reel.creatorAvatar }} className="w-6 h-6 rounded-full border border-white/20" />
        ) : (
            <View className="w-6 h-6 rounded-full bg-white/20" />
        )}
        <Text className="text-white text-xs font-bold" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }} numberOfLines={1}>
          {reel?.creatorUsername || 'Shared Reel'}
        </Text>
      </View>

      <View className="absolute bottom-3 left-3 flex-row items-center">
        <View className="bg-[#D946EF] px-2 py-1 rounded-md shadow-sm">
          <Text className="text-white text-[10px] font-black uppercase tracking-wider">Reel</Text>
        </View>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, creatorName, creatorUsername, creatorAvatar } = useLocalSearchParams();
  const [inputText, setInputText] = useState('');
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const { userProfile, toggleBlock } = useAuthStore();
  const { chats, messages: storeMessages, fetchMessages, fetchChats, sendMessage, deleteMessage, isTyping, toggleMuteChat, mutedChats, markChatRead } = useChatStore();
  const { stories } = useStoryStore();
  
  const chat = chats.find(c => c.id === id);

  const displayAvatar = chat?.creatorAvatar || (creatorAvatar as string) || 'https://i.pravatar.cc/150';
  const displayName = chat?.creatorName || (creatorName as string) || 'Unknown User';
  const displayUsername = chat?.creatorUsername || (creatorUsername as string) || 'user';

  // Only show messages for this chat
  const messages = storeMessages.filter(m => m.chatId === id);

  useEffect(() => {
    if (id) {
      fetchMessages(id as string);
      markChatRead(id as string);
      if (!chat) fetchChats();
    }
  }, [id]);

  // Failsafe: if userProfile doesn't have an ID (due to older cache), fetch it
  useEffect(() => {
    if (!userProfile?.id && useAuthStore.getState().token) {
      apiClient.get('/users/me').then(res => {
        useAuthStore.getState().updateProfile({ id: res.data.id });
      }).catch(e => console.error('Failed failsafe ID fetch', e));
    }
  }, [userProfile?.id]);

  const handleSend = async () => {
    if (inputText.trim()) {
      const textToSend = inputText.trim();
      setInputText('');
      await sendMessage(id as string, textToSend);
    }
  };

  const handleLongPressMessage = (messageId: string) => {
    Alert.alert(
      "Unsend Message",
      "Are you sure you want to unsend this message for everyone?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Unsend", style: "destructive", onPress: () => deleteMessage(id as string, messageId) }
      ]
    );
  };

  // Keep scroll view at bottom (handled with contentContainerStyle or a ref)
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Format messages to UI structure
  const formattedMessages = messages.map(m => {
    let text = m.text || '';
    let storyId: string | null = null;
    let isStoryAvailable = true;
    let storyCreator = null;
    let reelId: string | null = null;
    let isReel = false;

    if (m.type === 'STORY_MENTION') {
      storyId = m.storyId || null;
      text = "Mentioned you in a story";
      const story = stories.find(s => s.id === storyId);
      isStoryAvailable = !!story;
      storyCreator = story ? story.creatorId : (m.senderId === userProfile?.id ? userProfile?.username : displayUsername);
    } else if (text?.startsWith('[STORY:')) {
      const match = text.match(/\[STORY:(.*?)\]\s*(.*)/);
      if (match) {
        storyId = match[1];
        text = match[2];
        const story = stories.find(s => s.id === storyId);
        isStoryAvailable = !!story;
        if (story) storyCreator = story.creatorId;
      }
    } else if (text?.includes('/reels/')) {
      const match = text.match(/\/reels\/([a-zA-Z0-9-]+)/);
      if (match) {
        reelId = match[1];
        isReel = true;
        text = text.replace(/https?:\/\/[^\s]+reels\/[a-zA-Z0-9-]+/i, '')
                   .replace('Hey, check out this Reel! 🎥', '')
                   .trim();
      }
    }

    return {
      id: m.id,
      type: m.senderId === userProfile?.username || m.senderId === userProfile?.id ? 'sent' : 'received',
      text,
      storyId,
      isStoryAvailable,
      storyCreator,
      isStoryMention: m.type === 'STORY_MENTION',
      reelId,
      isReel,
      time: m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderAvatar: m.senderId === userProfile?.id ? userProfile?.avatar : displayAvatar, 
      isSeen: m.status === 'seen',
      attachment: (m as any).mediaUrl,
      isVideo: (m as any).mediaUrl?.endsWith('.mp4') || (m as any).mediaUrl?.includes('/video/')
    };
  });

  const getThumbnailUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('cloudinary') && url.endsWith('.mp4')) {
      return url.replace('.mp4', '.jpg');
    }
    return url;
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#12081E' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-white/5 bg-[#12081E] z-10">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft size={28} color="#FFFFFF" />
          </Pressable>
          
          <Pressable 
            className="flex-row items-center gap-3"
            onPress={() => router.push(`/user/${displayUsername}`)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View className="relative">
              <StoryRing userId={displayUsername} avatarUrl={displayAvatar} size={40} />
              {chat?.isOnline && (
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#12081E]" />
              )}
            </View>
            
            <View>
              <Text className="text-white font-bold text-base">{displayName}</Text>
              <Text className="text-neutral-grey text-xs">
                {chat?.isOnline ? 'Active now' : `Last seen at ${chat?.lastMessageTime || 'recently'}`}
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => setShowOptionsModal(true)}>
            <Info size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Date Pill */}
        <View className="items-center mb-6">
          <View className="bg-[#1A0E2C] px-3 py-1 rounded-full border border-white/5">
            <Text className="text-neutral-grey text-[9px] font-bold uppercase tracking-widest">Today</Text>
          </View>
        </View>

        {/* MESSAGES */}
        <View className="gap-4">
          {formattedMessages.map((msg, index) => {
            const isSent = msg.type === 'sent';
            const isLastSent = isSent && (index === formattedMessages.length - 1 || formattedMessages[index + 1].type !== 'sent');

            if (!isSent) {
              return (
                <View key={msg.id} className="mb-4">
                  <View className="flex-row items-end gap-3">
                    <Image source={{ uri: msg.senderAvatar }} className="w-8 h-8 rounded-full bg-[#F59E0B]/20" />
                    <View>
                      {msg.text && !msg.isStoryMention ? (
                        <View className="bg-[#2D1B4E] px-4 py-3 rounded-2xl rounded-bl-sm max-w-[75%]">
                          <Text className="text-white/90 text-[15px] leading-6">{msg.text}</Text>
                        </View>
                      ) : null}

                      {msg.isStoryMention && msg.storyId ? (
                        <Pressable 
                          className="bg-gradient-to-br from-[#D946EF]/20 to-[#A855F7]/20 p-4 rounded-2xl rounded-bl-sm mt-1 border border-[#D946EF]/30 w-[240px]"
                          onPress={() => router.push(`/story-viewer/${msg.storyCreator || 'unknown'}?storyId=${msg.storyId}`)}
                        >
                          <View className="flex-row items-center gap-2 mb-3">
                            <Image source={{ uri: displayAvatar }} className="w-6 h-6 rounded-full" />
                            <Text className="text-white font-medium text-sm flex-1" numberOfLines={2}>{displayName} mentioned you in a story</Text>
                          </View>
                          <View className="bg-[#D946EF] py-2 rounded-xl items-center justify-center">
                            <Text className="text-white font-bold text-[13px]">View Story</Text>
                          </View>
                        </Pressable>
                      ) : null}
                      
                      {msg.isReel && msg.reelId ? (
                        <Pressable 
                          className="mt-1 rounded-2xl overflow-hidden"
                          style={{ width: 180, height: 260 }}
                          onPress={() => router.push(`/reel/${msg.reelId}`)} 
                        >
                          <ReelPreviewCard reelId={msg.reelId} />
                        </Pressable>
                      ) : msg.storyId && !msg.isStoryAvailable && !msg.isStoryMention ? (
                        <View className="bg-[#2D1B4E] p-4 rounded-2xl rounded-bl-sm max-w-[75%] mt-1 opacity-70 items-center justify-center border border-white/10">
                          <Text className="text-white font-medium">Story Unavailable</Text>
                          <Text className="text-white/50 text-xs mt-1">This story was deleted or expired.</Text>
                        </View>
                      ) : msg.attachment && !msg.isStoryMention ? (
                        <Pressable 
                          className="bg-[#2D1B4E] p-1 rounded-2xl rounded-bl-sm max-w-[65%] mt-1"
                          onPress={() => {
                            if (msg.storyId && msg.storyCreator) {
                              router.push(`/story-viewer/${msg.storyCreator}`);
                            }
                          }}
                        >
                          <View className="relative rounded-xl overflow-hidden">
                            <Image source={{ uri: getThumbnailUrl(msg.attachment) }} style={{ width: 180, height: 240 }} resizeMode="cover" />
                            {msg.isVideo && (
                              <View className="absolute inset-0 items-center justify-center bg-black/20">
                                <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center backdrop-blur-md">
                                  <Play size={20} color="#FFFFFF" fill="#FFFFFF" className="ml-1" />
                                </View>
                              </View>
                            )}
                          </View>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                  <Text className="text-[#6B7280] text-[10px] ml-11 mt-1.5">{msg.time}</Text>
                </View>
              );
            } else {
              return (
                <Pressable 
                  key={msg.id} 
                  className="items-end mb-1"
                  onLongPress={() => handleLongPressMessage(msg.id)}
                >
                  {msg.text && !msg.isStoryMention ? (
                    <View className="rounded-2xl rounded-br-sm px-4 py-3 max-w-[75%] shadow-sm" style={{ backgroundColor: '#A855F7' }}>
                      {/* Fake gradient background using view absolute */}
                      <View className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-[#D946EF] to-[#A855F7] rounded-2xl rounded-br-sm opacity-90 overflow-hidden" />
                      <Text className="text-white text-[15px] leading-6 z-10">{msg.text}</Text>
                    </View>
                  ) : null}

                  {msg.isStoryMention && msg.storyId ? (
                    <Pressable 
                      className="p-4 rounded-2xl rounded-br-sm mt-1 w-[240px] shadow-sm relative overflow-hidden"
                      style={{ backgroundColor: '#A855F7' }}
                      onPress={() => router.push(`/story-viewer/${msg.storyCreator || 'unknown'}?storyId=${msg.storyId}`)}
                    >
                      <View className="absolute top-0 bottom-0 left-0 right-0 bg-[#D946EF] opacity-40" />
                      <View className="flex-row items-center gap-2 mb-3 z-10">
                        <Text className="text-white font-medium text-sm flex-1" numberOfLines={2}>You mentioned {displayName} in a story</Text>
                      </View>
                      <View className="bg-white py-2 rounded-xl items-center justify-center z-10">
                        <Text className="text-[#A855F7] font-bold text-[13px]">View Story</Text>
                      </View>
                    </Pressable>
                  ) : null}

                  {msg.isReel && msg.reelId ? (
                    <Pressable 
                      className="mt-1 rounded-2xl overflow-hidden shadow-sm max-w-[65%]"
                      style={{ width: 180, height: 260, borderColor: '#A855F7', borderWidth: 2 }}
                      onPress={() => router.push(`/reel/${msg.reelId}`)}
                    >
                      <ReelPreviewCard reelId={msg.reelId} />
                    </Pressable>
                  ) : msg.storyId && !msg.isStoryAvailable && !msg.isStoryMention ? (
                    <View className="bg-[#2D1B4E] p-4 rounded-2xl rounded-br-sm max-w-[75%] mt-1 opacity-70 items-center justify-center border border-white/10 shadow-sm" style={{ backgroundColor: '#A855F7' }}>
                      <Text className="text-white font-medium">Story Unavailable</Text>
                      <Text className="text-white/70 text-xs mt-1">This story was deleted.</Text>
                    </View>
                  ) : msg.attachment && !msg.isStoryMention ? (
                    <Pressable 
                      className="bg-[#2D1B4E] p-1 rounded-2xl rounded-br-sm max-w-[65%] mt-1 shadow-sm"
                      style={{ backgroundColor: msg.storyId ? '#A855F7' : '#2D1B4E' }}
                      onPress={() => {
                        if (msg.storyId && msg.storyCreator) {
                          router.push(`/story-viewer/${msg.storyCreator}`);
                        }
                      }}
                    >
                      <View className="relative rounded-xl overflow-hidden">
                        <Image source={{ uri: getThumbnailUrl(msg.attachment) }} style={{ width: 180, height: 240 }} resizeMode="cover" />
                        {msg.isVideo && (
                          <View className="absolute inset-0 items-center justify-center bg-black/20">
                            <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center backdrop-blur-md">
                              <Play size={20} color="#FFFFFF" fill="#FFFFFF" className="ml-1" />
                            </View>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  ) : null}

                  {msg.isSeen && (
                    <View className="flex-row items-center gap-1 mt-1.5 mb-2">
                      <Text className="text-[#6B7280] text-[10px]">Seen</Text>
                      <CheckCheck size={12} color="#A855F7" />
                    </View>
                  )}
                </Pressable>
              );
            }
          })}
        </View>
      </ScrollView>

      {/* BOTTOM INPUT BAR */}
      <View 
        className="flex-row items-center px-4 pt-3 bg-[#12081E] border-t border-white/5 gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        {/* Plus Button */}
        <Pressable className="w-10 h-10 rounded-full bg-[#1A0E2C] items-center justify-center border border-white/5">
          <Plus size={20} color="#9CA3AF" />
        </Pressable>

        {/* Text Input */}
        <View className="flex-1 bg-[#1A0E2C] h-10 rounded-full flex-row items-center px-4 border border-white/5">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Send a message..."
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-sm"
          />
          <Pressable className="ml-2">
            <Sticker size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {inputText.trim().length > 0 ? (
          <Pressable 
            onPress={handleSend}
            className="w-10 h-10 rounded-full bg-[#D946EF] items-center justify-center shadow-lg shadow-[#D946EF]/50 ml-1"
          >
            <Send size={18} color="#FFFFFF" className="mr-0.5 mt-0.5" />
          </Pressable>
        ) : (
          <>
            {/* Mic */}
            <Pressable className="p-1">
              <Mic size={20} color="#9CA3AF" />
            </Pressable>

            {/* Glowing Gallery Button */}
            <Pressable className="w-10 h-10 rounded-full bg-[#A855F7] items-center justify-center shadow-lg shadow-[#A855F7]/50">
              <View className="absolute inset-0 bg-[#D946EF] rounded-full opacity-50" />
              <ImageIcon size={18} color="#FFFFFF" className="z-10" />
            </Pressable>
          </>
        )}
      </View>

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
                  toggleBlock(chat?.creatorId || id as string);
                  setShowOptionsModal(false);
                  router.back();
                }}
                className="flex-row items-center px-4 py-4 active:bg-white/5 rounded-xl"
              >
                <Ban size={20} color="#EF4444" />
                <View className="ml-3">
                  <Text className="text-[#EF4444] font-semibold text-base">Block User</Text>
                  <Text className="text-neutral-grey text-xs mt-0.5">They won&apos;t be able to message you</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </KeyboardAvoidingView>
  );
}
