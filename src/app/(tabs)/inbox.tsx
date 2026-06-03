import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, Edit, Search, MessageSquare, Bell, 
  Heart, Award, ShieldAlert, Sparkles, ChevronRight, Video
} from 'lucide-react-native';
import { useChatStore } from '../../store';

export default function InboxScreen() {
  const router = useRouter();
  const { chats } = useChatStore();

  // Mock Active Friends data based on Figma
  const activeFriends = [
    { id: '1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?img=11', active: true, selected: true },
    { id: '2', name: 'Jordan', avatar: 'https://i.pravatar.cc/150?img=12', active: true },
    { id: '3', name: 'Taylor', avatar: 'https://i.pravatar.cc/150?img=13', active: true },
    { id: '4', name: 'Morgan', avatar: 'https://i.pravatar.cc/150?img=14', active: true },
    { id: '5', name: 'Casey', avatar: 'https://i.pravatar.cc/150?img=15', active: false },
  ];

  // Mock Messages list based on Figma
  const figmaMessages = [
    {
      id: 'c1',
      creatorName: 'Riley Cooper',
      creatorAvatar: 'https://i.pravatar.cc/150?img=33',
      lastMessage: 'Check out this new video I posted! 🔥',
      lastMessageTime: '2m ago',
      unreadCount: 1, // Will show white dot
      isVideo: false
    },
    {
      id: 'c2',
      creatorName: 'Jamie Smith',
      creatorAvatar: 'https://i.pravatar.cc/150?img=34',
      lastMessage: 'That edit was insane, teach me!',
      lastMessageTime: '1h ago',
      unreadCount: 0,
      isVideo: false
    },
    {
      id: 'c3',
      creatorName: 'Sam Wilson',
      creatorAvatar: 'https://i.pravatar.cc/150?img=35',
      lastMessage: 'Sent a video clip',
      lastMessageTime: '4h ago',
      unreadCount: 0,
      isVideo: true // Will show video icon
    },
    {
      id: 'c4',
      creatorName: 'Sarah Jenkins',
      creatorAvatar: 'https://i.pravatar.cc/150?img=36',
      lastMessage: 'Are we still meeting at the studio?',
      lastMessageTime: 'Yesterday',
      unreadCount: 1, // Will show white dot
      isVideo: false
    },
    {
      id: 'c5',
      creatorName: 'Chris Evans',
      creatorAvatar: 'https://i.pravatar.cc/150?img=37',
      lastMessage: 'Haha for sure!',
      lastMessageTime: 'Tue',
      unreadCount: 0,
      isVideo: false
    }
  ];

  return (
    <View className="flex-1 bg-[#12081E] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 pb-2">
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
          <View className="px-4 pt-4 pb-2">
            <View className="bg-[#2D1B4E] h-10 rounded-2xl flex-row items-center px-4 space-x-2">
                <Search size={16} color="#9CA3AF" />
                <TextInput
                  placeholder="Search messages"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-white font-medium text-sm"
                />
              </View>
            </View>

            {/* Active Friends Horizontal List */}
            <View className="pt-4 pb-2">
              <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest pl-5 mb-3">Active Friends</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 pr-4">
                {activeFriends.map((friend) => (
                  <View key={friend.id} className="items-center mr-5">
                    <View className={`relative rounded-full ${friend.selected ? 'border-2 border-[#A855F7] p-0.5' : ''}`}>
                      <Image source={{ uri: friend.avatar }} className="w-14 h-14 rounded-full" />
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
            <View className="px-4 pt-4">
              {figmaMessages.map((chat) => (
                <Pressable
                  key={chat.id}
                  onPress={() => router.push(`/chat/${chat.id}`)}
                  className="flex-row items-center justify-between mb-6 active:scale-[0.99]"
                >
                  <View className="flex-row items-center space-x-3.5 flex-1 pr-4">
                    <Image source={{ uri: chat.creatorAvatar }} className="w-12 h-12 rounded-full" />
                    
                    <View className="flex-1 justify-center space-y-1">
                      <Text className="text-white font-bold text-sm" numberOfLines={1}>
                        {chat.creatorName}
                      </Text>
                      <Text className={`${chat.unreadCount > 0 ? 'text-white font-medium' : 'text-neutral-grey font-medium'} text-xs`} numberOfLines={1}>
                        {chat.lastMessage}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end space-y-2">
                    <Text className={`${chat.unreadCount > 0 ? 'text-white' : 'text-neutral-grey'} text-[10px] font-medium`}>{chat.lastMessageTime}</Text>
                    
                    {chat.unreadCount > 0 && (
                      <View className="w-2.5 h-2.5 bg-white rounded-full mt-1" />
                    )}
                    {chat.isVideo && (
                      <Video size={14} color="#9CA3AF" className="mt-1" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
      </ScrollView>
    </View>
  );
}
