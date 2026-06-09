import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, CheckCircle2 } from 'lucide-react-native';
import StoryRing from '../components/StoryRing';
import { useFeedStore, useAuthStore } from '../store';

export default function NetworkScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [searchQuery, setSearchQuery] = useState('');
  const { creators } = useFeedStore();
  const { userProfile } = useAuthStore();
  const filteredCreators = creators.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const networkUsers = filteredCreators.slice(0, Math.floor(filteredCreators.length / 2));
  const suggestedUsers = filteredCreators.slice(Math.floor(filteredCreators.length / 2));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#12081E] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center px-4 pb-4">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-base ml-2">Network</Text>
      </View>

      {/* TOGGLE PILLS */}
      <View className="px-4 mb-5">
        <View className="bg-[#1A0E2C] rounded-xl flex-row p-1 border border-white/5">
          <Pressable 
            onPress={() => setActiveTab('followers')}
            className={`flex-1 py-2.5 items-center justify-center rounded-lg ${activeTab === 'followers' ? 'bg-[#2D1B4E]' : 'bg-transparent'}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'followers' ? 'text-[#A855F7]' : 'text-neutral-grey'}`}>
              Followers ({userProfile.followersCount > 1000 ? (userProfile.followersCount / 1000).toFixed(1) + 'k' : userProfile.followersCount})
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => setActiveTab('following')}
            className={`flex-1 py-2.5 items-center justify-center rounded-lg ${activeTab === 'following' ? 'bg-[#2D1B4E]' : 'bg-transparent'}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'following' ? 'text-[#A855F7]' : 'text-neutral-grey'}`}>
              Following ({userProfile.followingCount > 1000 ? (userProfile.followingCount / 1000).toFixed(1) + 'k' : userProfile.followingCount})
            </Text>
          </Pressable>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View className="px-4 mb-6">
        <View className="bg-[#1A0E2C] border border-white/5 rounded-2xl h-12 flex-row items-center px-4 gap-2">
          <Search size={16} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search people..."
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-sm font-medium"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* USERS LIST */}
        <View className="px-4 gap-3 mb-8">
          {networkUsers.map((user) => (
            <View key={user.id} className="bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 flex-row items-center justify-between">
              
              <View className="flex-row items-center gap-4 flex-1 pr-2">
                <View className="relative">
                  <StoryRing userId={user.username.replace('@','')} avatarUrl={user.avatar} size={48} />
                  {user.isVerified && (
                    <View className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full">
                      <CheckCircle2 size={16} color="#A855F7" fill="#FFFFFF" />
                    </View>
                  )}
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-white font-bold text-sm" numberOfLines={1}>{user.name}</Text>
                    {user.isVerified && <CheckCircle2 size={14} color="#A855F7" fill="#FFFFFF" />}
                  </View>
                  <Text className="text-neutral-grey text-xs mt-1">{user.username}</Text>
                </View>
              </View>

              <Pressable 
                className={`px-4 py-1.5 rounded-full items-center justify-center border bg-transparent border-[#A855F7]`}
              >
                <Text className={`text-[10px] font-bold text-[#A855F7]`}>
                  Following
                </Text>
              </Pressable>

            </View>
          ))}
        </View>

        {/* SUGGESTED FOR YOU */}
        <View>
          <Text className="text-neutral-grey text-[10px] font-bold uppercase tracking-widest pl-5 mb-4">Suggested For You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 pr-4 pb-4">
            {suggestedUsers.map((user) => (
              <View key={user.id} className="bg-[#2D1B4E] rounded-2xl p-4 items-center w-32 mr-3 border border-white/5 shadow-md shadow-black/20">
                <View className="mb-3">
                  <StoryRing userId={user.username.replace('@','')} avatarUrl={user.avatar} size={56} />
                </View>
                <Text className="text-white font-bold text-xs" numberOfLines={1}>{user.name}</Text>
                <Text className="text-[#9CA3AF] text-[10px] mb-4" numberOfLines={1}>{user.username}</Text>
                
                <Pressable className="w-full bg-[#1A0E2C] py-2 rounded-full items-center border border-white/5 active:scale-95 transition-all">
                  <Text className="text-[#A855F7] text-[10px] font-bold">Follow</Text>
                </Pressable>
              </View>
            ))}
            {/* Empty space at end for scroll padding */}
            <View className="w-4" />
          </ScrollView>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
