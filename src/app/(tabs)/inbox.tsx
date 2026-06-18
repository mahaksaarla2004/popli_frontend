import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, TextInput, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, Edit, Search, MessageSquare, Bell, 
  Heart, Award, ShieldAlert, Sparkles, ChevronRight, Video, X, User, Trash2
} from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { useAuthStore, useChatStore } from '../../store';
import StoryRing from '../../components/StoryRing';

export default function InboxScreen() {
  const router = useRouter();
  const { chats, fetchChats, connectSocket, deleteChat } = useChatStore();
  const { userProfile, blockedUsers } = useAuthStore();
  
  const blockedIds = blockedUsers.map(u => u.id);
  const visibleChats = chats.filter(chat => !blockedIds.includes(chat.creatorId));

  const [isNewMessageModalVisible, setIsNewMessageModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    connectSocket();
    fetchChats();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setTimeout(() => setSearchResults([]), 0);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiClient.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
        // Filter out current user and blocked users
        const results = res.data.filter((u: any) => u.id !== userProfile?.id && !blockedIds.includes(u.id));
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, userProfile]);

  const handleStartChat = async (userId: string, name: string, username: string, avatar: string) => {
    try {
      const res = await apiClient.post(`/chats/user/${userId}`);
      setIsNewMessageModalVisible(false);
      setSearchQuery('');
      if (res.data && res.data.id) {
        router.push({
          pathname: `/chat/[id]`,
          params: { id: res.data.id, creatorName: name, creatorUsername: username, creatorAvatar: avatar }
        });
      }
    } catch (e) {
      console.error("Failed to start chat", e);
    }
  };

  const handleLongPressChat = (chatId: string) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteChat(chatId) }
      ]
    );
  };

  // Map recent friends from existing chats
  const activeFriends = visibleChats.slice(0, 15).map((chat) => ({
    id: chat?.id || ('active-' + (chat?.creatorId || 'unknown')), // Use chat.id for unique React key
    userId: chat?.creatorId || 'unknown',
    name: chat?.creatorName ? chat.creatorName.split(' ')[0] : 'Unknown',
    avatar: chat?.creatorAvatar || 'https://i.pravatar.cc/150',
    active: (chat?.creatorName ? chat.creatorName.length : 0) % 2 === 0 // Simulated online status
  }));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#12081E] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 pb-6">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-base">Messages</Text>
        <Pressable onPress={() => setIsNewMessageModalVisible(true)} className="p-2 -mr-2">
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

            {/* Recent Friends Horizontal List */}
            <View className="mb-6">
              <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest px-4 mb-4">Recent</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
                {activeFriends.map((friend) => (
                  <View key={friend.id} className="items-center">
                    <View className="relative">
                      <StoryRing userId={friend.userId} avatarUrl={friend.avatar} size={56} />
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
              {visibleChats.filter(c => c.lastMessage !== 'No messages yet').length === 0 ? (
                <View className="items-center justify-center py-10">
                  <MessageSquare size={48} color="#9CA3AF" />
                  <Text className="text-white font-bold mt-4 text-center">No messages yet</Text>
                  <Text className="text-[#9CA3AF] text-sm mt-2 text-center px-6">
                    Start a conversation with your friends or favorite creators.
                  </Text>
                </View>
              ) : (
                visibleChats.filter(c => c.lastMessage !== 'No messages yet').map((chat) => (
                  <Pressable
                    key={chat.id}
                    onPress={() => router.push(`/chat/${chat.id}`)}
                    onLongPress={() => handleLongPressChat(chat.id)}
                    className="flex-row items-center justify-between active:scale-[0.99]"
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-4">
                      <StoryRing userId={chat.creatorId} avatarUrl={chat.creatorAvatar} size={48} />
                      
                      <View className="flex-1 justify-center gap-1">
                        <Text className="text-white font-bold text-sm" numberOfLines={1}>
                          {chat?.creatorName || 'Unknown'}
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

      {/* New Message Modal */}
      <Modal visible={isNewMessageModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#12081E] pt-14">
          <View className="flex-row items-center justify-between px-4 pb-4 border-b border-white/10">
            <Text className="text-white font-bold text-base">New Message</Text>
            <Pressable onPress={() => setIsNewMessageModalVisible(false)} className="p-2 -mr-2">
              <X size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          <View className="p-4 border-b border-white/10 flex-row items-center gap-3">
            <Text className="text-white font-bold">To:</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-white text-base py-2"
              autoFocus
            />
          </View>

          <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
            {isSearching ? (
              <ActivityIndicator size="small" color="#D946EF" className="mt-6" />
            ) : searchResults.length > 0 ? (
              searchResults.map(user => (
                <Pressable
                  key={user.id}
                  onPress={() => handleStartChat(user.id, user.name, user.username, user.avatar)}
                  className="flex-row items-center gap-3 py-4 border-b border-white/5"
                >
                  <View className="w-12 h-12 rounded-full overflow-hidden bg-white/10 items-center justify-center">
                    {user.avatar ? (
                      <Image source={{ uri: user.avatar }} className="w-full h-full" />
                    ) : (
                      <User size={20} color="#9CA3AF" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold">{user.name}</Text>
                    <Text className="text-neutral-grey text-xs">@{user.username}</Text>
                  </View>
                </Pressable>
              ))
            ) : searchQuery.trim().length > 0 ? (
              <Text className="text-neutral-grey text-center mt-6">No users found.</Text>
            ) : (
              <Text className="text-neutral-grey text-center mt-6">Search for a user to start a chat.</Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </KeyboardAvoidingView>
  );
}
