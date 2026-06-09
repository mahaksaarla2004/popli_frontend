import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, Edit, Search, MessageSquare, Bell, 
  Heart, Award, ShieldAlert, Sparkles, ChevronRight, Video
} from 'lucide-react-native';
import { useAuthStore, useChatStore } from '../../store';
import StoryRing from '../../components/StoryRing';

export default function InboxScreen() {
  const router = useRouter();
  const { chats, fetchChats, connectSocket } = useChatStore();
  const { blockedUsers } = useAuthStore();
  
  const blockedIds = blockedUsers.map(u => u.id);
  const visibleChats = chats.filter(chat => !blockedIds.includes(chat.creatorId));

  useEffect(() => {
    connectSocket();
    fetchChats();
  }, []);

  // Map active friends from existing chats (fallback logic until real presence is added)
  const activeFriends = visibleChats.slice(0, 5).map((chat) => ({
    id: chat.creatorId,
    name: chat.creatorName.split(' ')[0],
    avatar: chat.creatorAvatar,
    active: Math.random() > 0.5 // Simulated online status for now
  }));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#12081E] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 pb-6">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-base">Messages</Text>
        <Pressable className="p-2 -mr-2">
          <Edit size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* SEGMENTED TABS (MESSAGES / NOTIFICATIONS) REMOVED */}

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        
        {/* ==========================================
            MESSAGES CHAT LISTING (FIGMA DESIGN)
            ========================================== */}
        <View>
          {/* Search Bar */}
          <View className="px-4 mb-6">
            <View className="bg-[#2D1B4E] h-10 rounded-2xl flex-row items-center px-4 gap-2">
                <Search size={16} color="#9CA3AF" />
                <TextInput
                  placeholder="Search messages"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-white font-medium text-sm"
                />
              </View>
            </View>

            {/* Active Friends Horizontal List */}
            <View className="mb-6">
              <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest px-4 mb-4">Active Friends</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
                {activeFriends.map((friend) => (
                  <View key={friend.id} className="items-center">
                    <View className="relative">
                      <StoryRing userId={friend.name} avatarUrl={friend.avatar} size={56} />
                      {friend.active && (
                        <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] rounded-full border-[2.5px] border-[#12081E]" />
                      )}
                    </View>
                    <Text className="text-white text-xs font-medium mt-2">{friend.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Messages List */}
            <View className="px-4 gap-6">
              {visibleChats.length === 0 ? (
                <View className="items-center justify-center py-10">
                  <MessageSquare size={48} color="#9CA3AF" />
                  <Text className="text-white font-bold mt-4 text-center">No messages yet</Text>
                  <Text className="text-[#9CA3AF] text-sm mt-2 text-center px-6">
                    Start a conversation with your friends or favorite creators.
                  </Text>
                </View>
              ) : (
                visibleChats.map((chat) => (
                  <Pressable
                    key={chat.id}
                    onPress={() => router.push(`/chat/${chat.id}`)}
                    className="flex-row items-center justify-between active:scale-[0.99]"
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-4">
                      <StoryRing userId={chat.creatorId} avatarUrl={chat.creatorAvatar} size={48} />
                      
                      <View className="flex-1 justify-center gap-1">
                        <Text className="text-white font-bold text-sm" numberOfLines={1}>
                          {chat.creatorName}
                        </Text>
                        <Text className={`${chat.unreadCount && chat.unreadCount > 0 ? 'text-white font-medium' : 'text-neutral-grey font-medium'} text-xs`} numberOfLines={1}>
                          {chat.lastMessage}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end gap-1">
                      <Text className={`${chat.unreadCount && chat.unreadCount > 0 ? 'text-white' : 'text-neutral-grey'} text-[10px] font-medium`}>
                        {chat.lastMessageTime}
                      </Text>
                      
                      {chat.unreadCount && chat.unreadCount > 0 ? (
                        <View className="w-2.5 h-2.5 bg-white rounded-full mt-1" />
                      ) : null}
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
