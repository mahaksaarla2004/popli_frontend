import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Settings, AlignLeft, LayoutGrid, Heart, Play, Plus } from 'lucide-react-native';
import { useAuthStore, useFeedStore, useStoryHighlightStore } from '../../store';
import { formatSocialCount, getDefaultAvatar } from '../../utils';
import StoryRing from '../../components/StoryRing';

const { width } = Dimensions.get('window');

type ProfileTabType = 'reels' | 'likes';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const { reels, userReels, likedReels, fetchUserReels, fetchLikedReels } = useFeedStore();
  const { highlights, fetchHighlights } = useStoryHighlightStore();

  const [activeTab, setActiveTab] = useState<ProfileTabType>('reels');

  useFocusEffect(
    React.useCallback(() => {
      if (userProfile.id) {
        const { fetchProfile, fetchFollowingIds } = useAuthStore.getState();
        fetchProfile();
        fetchFollowingIds(userProfile.id);
        fetchHighlights(userProfile.id);
        fetchUserReels(userProfile.id);
        fetchLikedReels();
      }
    }, [userProfile.id])
  );

  const followingIds = useAuthStore(state => state.followingIds);

  const isProfileIncomplete = !userProfile.isProfileComplete && !userProfile.category;

  // Use the directly fetched userReels to get accurate, up-to-date stats
  const totalLikes = userReels.reduce((acc, reel) => acc + reel.likesCount, 0);

  const displayProfile = {
    username: userProfile.username,
    roles: userProfile.category ? userProfile.category.toUpperCase() + ' CREATOR' : 'CREATOR',
    bio: userProfile.bio || 'Living the life your style with your rules',
    link: 'www.appyhigh.com/projects',
    posts: userReels.length, // Real stat
    following: followingIds.length || 0,
    followers: userProfile.followersCount || 0,
    likes: totalLikes, // Real stat
    avatar: userProfile.avatar?.includes('unsplash.com') ? getDefaultAvatar(userProfile.username) : (userProfile.avatar || getDefaultAvatar(userProfile.username))
  };

  const monetizedReels = userReels.filter(r => r.isMonetized);
  const totalMonetizedViews = monetizedReels.reduce((acc, reel) => acc + (reel.viewsCount || 0), 0);
  const totalEarnings = (totalMonetizedViews * 0.0044).toFixed(3);

  const displayReels = userReels;

  const activeGridData = activeTab === 'reels' ? displayReels : likedReels;

  return (
    <View className="flex-1 bg-[#12081E] pt-12">
      {/* 1. HEADER */}
      <View className="flex-row items-center justify-between px-4 pb-6 border-b border-white/5">
        <View className="w-10" />
        
        <Text className="text-white font-bold text-lg">Appyhigh live</Text>
        
        <Pressable 
          onPress={() => router.push('/settings')}
          className="p-2 -mr-2"
        >
          <Settings size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        
        {/* INCOMPLETE PROFILE BANNER */}
        {isProfileIncomplete && (
          <Pressable 
            onPress={() => router.push('/(auth)/profile-setup')}
            className="mx-4 mt-4 bg-primary-purple/20 border border-primary-purple p-3 rounded-xl flex-row items-center justify-between active:scale-[0.98]"
          >
            <View className="flex-1 mr-2">
              <Text className="text-white font-bold text-sm">Profile Incomplete</Text>
              <Text className="text-white/70 text-[11px] mt-0.5">Complete your profile to unlock all features.</Text>
            </View>
            <View className="bg-primary-purple px-3 py-1.5 rounded-full">
              <Text className="text-white font-bold text-[10px] uppercase">Complete Now</Text>
            </View>
          </Pressable>
        )}

        {/* 2. AVATAR & BIO BLOCK */}
        <View className="items-center px-4 py-6">
          <View className="mb-4">
            <StoryRing userId={displayProfile.username} avatarUrl={displayProfile.avatar} size={96} />
          </View>

          <Text className="text-white font-bold text-lg mb-1">@{displayProfile.username}</Text>
          <Text className="text-neutral-grey text-[11px] mb-1">{displayProfile.roles}</Text>
          <Text className="text-white/60 text-[10px] mb-1">{displayProfile.bio}</Text>
          <Text className="text-[#D946EF] text-[10px] font-medium">{displayProfile.link}</Text>

          {/* Social Stats */}
          <View className="flex-row items-center justify-between mt-6 w-[85%]">
            <View className="items-center">
              <Text className="text-white font-black text-[15px]">{displayProfile.posts}</Text>
              <Text className="text-neutral-grey text-[9px] font-bold uppercase mt-1">Posts</Text>
            </View>
            <Pressable 
              onPress={() => router.push({ pathname: '/network', params: { userId: userProfile.id, type: 'following' } })}
              className="items-center"
            >
              <Text className="text-white font-black text-[15px]">{displayProfile.following}</Text>
              <Text className="text-neutral-grey text-[9px] font-bold uppercase mt-1">Following</Text>
            </Pressable>
            <Pressable 
              onPress={() => router.push({ pathname: '/network', params: { userId: userProfile.id, type: 'followers' } })}
              className="items-center"
            >
              <Text className="text-white font-black text-[15px]">{formatSocialCount(displayProfile.followers)}</Text>
              <Text className="text-neutral-grey text-[9px] font-bold uppercase mt-1">Followers</Text>
            </Pressable>
            <View className="items-center">
              <Text className="text-white font-black text-[15px]">{formatSocialCount(displayProfile.likes)}</Text>
              <Text className="text-neutral-grey text-[9px] font-bold uppercase mt-1">Likes</Text>
            </View>
          </View>
        </View>

        {/* 2.2 EARNINGS HIGHLIGHT BANNER */}
        <Pressable 
          onPress={() => router.push('/analytics')}
          className="mx-4 mb-6 bg-[#10B981]/10 border border-[#10B981]/30 p-3 rounded-xl flex-row items-center justify-between active:scale-[0.98]"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-[#10B981]/20 rounded-full items-center justify-center">
              <Text className="text-[#10B981] font-bold text-lg">₹</Text>
            </View>
            <View>
              <Text className="text-[#10B981] font-black text-lg">₹{totalEarnings}</Text>
              <Text className="text-white/70 text-[10px] font-bold uppercase">Total View Earnings</Text>
            </View>
          </View>
          <View className="bg-[#10B981] px-3 py-1.5 rounded-full">
            <Text className="text-black font-bold text-[10px] uppercase">Analytics</Text>
          </View>
        </Pressable>

        {/* 2.5 STORY HIGHLIGHTS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2 px-4 mb-4" contentContainerStyle={{ gap: 16 }}>
          <Pressable 
            onPress={() => router.push('/story-archive')}
            className="items-center"
          >
            <View className="w-16 h-16 rounded-full border border-white/20 items-center justify-center mb-1">
              <Plus size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-[10px]">New</Text>
          </Pressable>

          {highlights.map(highlight => (
            <Pressable key={highlight.id} className="items-center" onPress={() => router.push({ pathname: '/highlight-viewer/[id]', params: { id: highlight.id } } as any)}>
              <View className="w-16 h-16 rounded-full border border-white/10 p-0.5 mb-1 bg-black/50">
                <Image source={{ uri: highlight.coverUrl }} className="w-full h-full rounded-full" />
              </View>
              <Text className="text-white text-[10px]">{highlight.title}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 3. TABS SEGMENTS */}
        <View className="flex-row border-t border-b border-white/5 py-2">
          <Pressable
            onPress={() => setActiveTab('reels')}
            className={`flex-1 items-center justify-center py-2 ${activeTab === 'reels' ? 'border-b-2 border-[#A855F7]' : ''}`}
          >
            <LayoutGrid size={22} color={activeTab === 'reels' ? '#A855F7' : '#9CA3AF'} />
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('likes')}
            className={`flex-1 items-center justify-center py-2 ${activeTab === 'likes' ? 'border-b-2 border-[#A855F7]' : ''}`}
          >
            <Heart size={22} color={activeTab === 'likes' ? '#A855F7' : '#9CA3AF'} />
          </Pressable>
        </View>

        {/* 4. GRID OF VIDEO PREVIEWS */}
        {activeGridData.length === 0 ? (
          <View className="py-24 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
              <LayoutGrid size={32} color="#FFFFFF" opacity={0.5} />
            </View>
            <Text className="text-white font-bold text-lg mb-2">No reels yet</Text>
            <Text className="text-neutral-grey text-xs text-center px-10">
              {activeTab === 'reels' ? 'When you post reels, they will appear here.' : 'When you like reels, they will appear here.'}
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {activeGridData.map((reel, index) => (
              <Pressable
                key={reel.id}
                onPress={() => {
                  router.push(`/reel/${reel.id}`);
                }}
                className="w-[33.33%] h-44 border-[0.5px] border-black active:opacity-80"
              >
                <Image source={{ uri: reel.thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute bottom-2 left-2 flex-row items-center gap-1">
                  <Play size={10} color="#FFFFFF" fill="#FFFFFF" />
                  <Text className="text-white text-[10px] font-bold drop-shadow-md">
                    {formatSocialCount(reel.likesCount)}
                  </Text>
                </View>
                {reel.isMonetized && activeTab === 'reels' && (
                  <View className="absolute top-1 right-1 bg-[#F59E0B]/90 px-1 py-0.5 rounded flex-row items-center">
                    <Text className="text-black text-[9px] font-black">₹{((reel.viewsCount || 0) * 0.0044).toFixed(3)}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
