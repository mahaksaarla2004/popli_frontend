import React, { useState } from 'react';
import { View, Text, Image, TextInput, Pressable, ScrollView, Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { X, Search, Send } from 'lucide-react-native';
import { useAuthStore, useChatStore, useFeedStore } from '../../store';
import { MotiView } from 'moti';

interface SendSheetProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SendSheet = ({ reelId, isOpen, onClose }: SendSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentTo, setSentTo] = useState<string[]>([]);
  const { userProfile, followingIds } = useAuthStore();
  const { chats, sendDirectMessage } = useChatStore();
  const { reels } = useFeedStore();

  const chatFriends = chats.map(c => ({
    id: c.creatorId,
    username: c.creatorUsername,
    name: c.creatorName,
    avatar: c.creatorAvatar
  }));

  const followedCreators = reels
    .filter(r => followingIds.includes(r.creatorId))
    .map(r => ({
      id: r.creatorId,
      username: r.creatorUsername,
      name: r.creatorName,
      avatar: r.creatorAvatar
    }));

  // Combine chats and followed creators, then deduplicate by ID
  const allCandidates = [...chatFriends, ...followedCreators];
  let friendsList = Array.from(new Map(allCandidates.map(item => [item.id, item])).values());

  // Optional: Prioritize strictly followed users or just show all combined
  // Since user asked for "following", we can ensure following users are at the top or just show them.
  // We'll show all (chats + following) as it's standard for sharing, but now following are included!

  const handleSend = (friend: typeof friendsList[0]) => {
    setSentTo(prev => [...prev, friend.id]);
    sendDirectMessage(friend, `Hey, check out this Reel! 🎥 popli.app/reels/${reelId}`);
  };

  const filteredFriends = friendsList.filter(f => 
    f.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <MotiView
          from={{ translateY: 600, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          exit={{ translateY: 600, opacity: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          className="h-[65%] bg-background-plum rounded-t-3xl border-t border-white/10 z-50 shadow-2xl flex-col"
        >
          {/* Drag handle line */}
          <View className="items-center py-2.5">
            <View className="w-10 h-1 bg-white/20 rounded-full" />
          </View>

          {/* Header bar */}
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Text className="text-white font-bold text-lg">Send to</Text>
            <Pressable onPress={onClose} className="p-1">
              <X size={20} color="#D1D5DB" />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View className="px-4 pb-3 border-b border-white/5">
            <View className="flex-row items-center bg-[#1D1037] rounded-xl px-3 h-10 border border-white/5">
              <Search size={16} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-white text-sm ml-2 font-normal"
              />
            </View>
          </View>

          {/* Friends List */}
          <ScrollView 
            className="flex-1 px-4 py-2" 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredFriends.map((friend) => {
              const isSent = sentTo.includes(friend.id);
              return (
                <View key={friend.id} className="flex-row items-center justify-between py-3 gap-3 border-b border-white/5">
                  <View className="flex-row items-center gap-3">
                    <Image source={{ uri: friend.avatar }} className="w-12 h-12 rounded-full" />
                    <View className="flex-col">
                      <Text className="text-white font-bold text-sm">{friend.name}</Text>
                      <Text className="text-white/60 text-xs">@{friend.username}</Text>
                    </View>
                  </View>
                  
                  <Pressable 
                    onPress={() => !isSent && handleSend(friend)}
                    className={`px-5 py-1.5 rounded-full items-center justify-center ${isSent ? 'bg-white/10' : 'bg-primary-pink'}`}
                  >
                    <Text className={`text-xs font-bold ${isSent ? 'text-white/60' : 'text-white'}`}>
                      {isSent ? 'Sent' : 'Send'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
            <View className="h-10" />
          </ScrollView>
        </MotiView>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
