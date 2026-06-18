/*  */import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Pressable, ScrollView, PlatformModal, ActivityIndicator } from 'react-native';
import { X, Search, Send } from 'lucide-react-native';
import { useAuthStore, useChatStore } from '../../store';
import { MotiView } from 'moti';
import { apiClient, BASE_URL } from '../../api/client';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

interface SendSheetProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SendSheet = ({ reelId, isOpen, onClose }: SendSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentTo, setSentTo] = useState<string[]>([]);
  const { sendDirectMessage } = useChatStore();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (!searchQuery.trim()) {
          const { userProfile } = useAuthStore.getState();
          const res = await apiClient.get(`/social/${userProfile.id}/following`);
          setUsers(res.data.map((item: any) => item.following));
        } else {
          const res = await apiClient.get(`/users/search?q=${searchQuery}`);
          setUsers(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isOpen]);

  const handleSend = (friend: any) => {
    setSentTo(prev => [...prev, friend.id]);
    // The mediaUrl is technically not the direct video file unless we fetch the Reel,
    // but we can just send the text link for now since we don't have the mediaUrl in this context,
    // OR we could pass mediaUrl to SendSheetProps! 
    // The user's goal is sharing the reel, so sending the link is standard.
    sendDirectMessage(friend, `Hey, check out this Reel! 🎥 ${BASE_URL.replace('/api', '')}/reels/${reelId}`);
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior="padding"
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
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Friends List */}
            <ScrollView
              className="flex-1 px-4 py-2"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {loading && <ActivityIndicator color="#A855F7" className="mt-4" />}

              {!loading && users.map((friend) => {
                const isSent = sentTo.includes(friend.id);
                return (
                  <View key={friend.id} className="flex-row items-center justify-between py-3 gap-3 border-b border-white/5">
                    <View className="flex-row items-center gap-3">
                      <Image source={{ uri: friend.avatar || 'https://i.pravatar.cc/150' }} className="w-12 h-12 rounded-full" />
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
