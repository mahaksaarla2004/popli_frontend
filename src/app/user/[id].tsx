import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Award, Play } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../../api/client';
import { useAuthStore, useChatStore } from '../../store';
import { formatSocialCount } from '../../utils';

const { width } = Dimensions.get('window');
const REEL_THUMB_WIDTH = (width - 4) / 3;

export default function PublicProfileScreen() {
  const { id: username } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sendDirectMessage } = useChatStore();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { followingIds, toggleFollow, userProfile } = useAuthStore();
  const isFollowing = profile ? followingIds.includes(profile.id) : false;
  const isOwnProfile = profile ? userProfile.username === profile.username : false;

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await apiClient.get(`/users/creator/${username}`);
        setProfile(res.data);
      } catch (e: any) {
        console.error("Error fetching creator profile:", e);
        setError("Creator not found");
      } finally {
        setLoading(false);
      }
    }
    
    if (username) fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B001A' }} className="items-center justify-center">
        <ActivityIndicator size="large" color="#D946EF" />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B001A' }}>
        <View className="flex-row items-center p-4">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg font-bold">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B001A' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-white/10">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center active:scale-95">
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-lg ml-2">{profile.username}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            {/* Avatar */}
            <View className="w-20 h-20 rounded-full border-[3px] border-primary-purple overflow-hidden">
              <Image 
                source={{ uri: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop' }} 
                className="w-full h-full" 
              />
            </View>

            {/* Stats */}
            <View className="flex-1 flex-row justify-around ml-4">
              <View className="items-center">
                <Text className="text-white font-bold text-lg">{formatSocialCount(profile.reels?.length || 0)}</Text>
                <Text className="text-neutral-silver text-xs">Reels</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold text-lg">{formatSocialCount(profile.followersCount || 0)}</Text>
                <Text className="text-neutral-silver text-xs">Followers</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold text-lg">{formatSocialCount(profile.followingCount || 0)}</Text>
                <Text className="text-neutral-silver text-xs">Following</Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          <View className="mt-4">
            <Text className="text-white font-bold text-base">{profile.name}</Text>
            {profile.category && (
              <Text className="text-primary-pink text-xs font-semibold mt-0.5">{profile.category.toUpperCase()}</Text>
            )}
            <Text className="text-white/80 mt-1 leading-5">{profile.bio}</Text>
            
            <View className="flex-row items-center mt-2">
              <MapPin size={14} color="#9CA3AF" />
              <Text className="text-neutral-silver text-sm ml-1">{profile.city || 'Unknown Location'}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2 mt-5">
            {!isOwnProfile ? (
              <Pressable 
                onPress={() => {
                  toggleFollow(profile.id);
                  setProfile((prev: any) => ({
                    ...prev,
                    followersCount: Math.max(0, prev.followersCount + (isFollowing ? -1 : 1))
                  }));
                }}
                className={`flex-1 py-2.5 rounded-lg items-center justify-center ${isFollowing ? 'bg-white/10' : 'bg-primary-pink'}`}
              >
                <Text className={`font-bold text-sm ${isFollowing ? 'text-white' : 'text-white'}`}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            ) : (
              <Pressable 
                onPress={() => router.push('/(tabs)/profile')}
                className="flex-1 py-2.5 rounded-lg items-center justify-center bg-white/10"
              >
                <Text className="font-bold text-sm text-white">Edit Profile</Text>
              </Pressable>
            )}
            
            {!isOwnProfile && (
              <Pressable 
                onPress={async () => {
                  try {
                    // Start a chat with this user
                    const res = await apiClient.post(`/chats/user/${profile.id}`);
                    if (res.data && res.data.id) {
                      router.push(`/chat/${res.data.id}`);
                    }
                  } catch (e) {
                    console.error("Failed to start chat", e);
                  }
                }}
                className="flex-1 py-2.5 rounded-lg items-center justify-center bg-white/10"
              >
                <Text className="text-white font-bold text-sm">Message</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Reels Grid */}
        <View className="mt-4">
          <View className="flex-row items-center border-b border-white/20">
            <View className="flex-1 items-center pb-2 border-b-2 border-primary-pink">
              <Play size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1 items-center pb-2">
              <Award size={20} color="#6B7280" />
            </View>
          </View>

          <View className="flex-row flex-wrap mt-[2px] gap-[2px]">
            {profile.reels && profile.reels.length > 0 ? (
              profile.reels.map((reel: any) => (
                <Pressable 
                  key={reel.id} 
                  style={{ width: REEL_THUMB_WIDTH, height: REEL_THUMB_WIDTH * 1.5 }}
                  className="bg-neutral-grey relative"
                  // onPress={() => router.push(`/reel/${reel.id}`)} // Phase 2: deep linking to specific reel
                >
                  <Image 
                    source={{ uri: reel.thumbnailUrl || reel.mediaUrl }} 
                    className="w-full h-full opacity-90"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-1.5 left-1.5 flex-row items-center">
                    <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                    <Text className="text-white text-xs font-bold ml-1">
                      {formatSocialCount(reel.viewsCount || 0)}
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-neutral-silver font-semibold">No reels yet</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Bottom Spacing */}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
