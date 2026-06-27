import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Dimensions, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Settings, AlignLeft, LayoutGrid, Heart, Play, Plus, BarChart2 } from 'lucide-react-native';
import { useAuthStore, useFeedStore, useStoryHighlightStore } from '../../store';
import { formatSocialCount, getDefaultAvatar } from '../../utils';
import StoryRing from '../../components/StoryRing';
import { LinksSheet } from '../../components/sheets/LinksSheet';
import { SafeScreen } from '../../components/layout/SafeScreen';

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

  const [isLinksSheetOpen, setIsLinksSheetOpen] = useState(false);

  const displayProfile = {
    username: userProfile.username,
    roles: userProfile.category ? userProfile.category.toUpperCase() + ' CREATOR' : '',
    bio: userProfile.bio || '',
    socialLinks: userProfile.socialLinks || [],
    posts: userReels.length, // Real stat
    following: followingIds.length || 0,
    followers: userProfile.followersCount || 0,
    likes: totalLikes, // Real stat
    avatar: userProfile.avatar || getDefaultAvatar(userProfile.username)
  };

  const totalEarnings = userProfile.wallet?.totalEarnings ?? userProfile.coinsEarned ?? 0;

  const displayReels = userReels;

  const activeGridData = activeTab === 'reels' ? displayReels : likedReels;

  const handleLinkPress = () => {
    if (displayProfile.socialLinks.length === 1) {
      let url = displayProfile.socialLinks[0].url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      import('react-native').then(rn => rn.Linking.openURL(url)).catch(console.error);
    } else if (displayProfile.socialLinks.length > 1) {
      setIsLinksSheetOpen(true);
    }
  };

  return (
    <SafeScreen edgeToEdgeBottom className="bg-[#12081E]">
      {/* 1. HEADER */}
      <View className="flex-row items-center justify-between px-4 pb-6 border-b border-white/5">
        <View className="w-10" />
        
        <Text className="text-white font-bold text-lg">Profile</Text>
        
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
        contentContainerStyle={{ paddingBottom: 150 }}
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
    <StoryRing 
      userId={displayProfile.username} 
      avatarUrl={displayProfile.avatar} 
      size={96} 
      onPress={() => {
        Alert.alert(
          "Profile Options",
          "What would you like to do?",
          [
            { 
              text: "View Story", 
              onPress: () => router.push(`/story-viewer/${displayProfile.username}`) 
            },
            { 
              text: "Edit Profile", 
              onPress: () => router.push('/edit-profile') 
            },
            { text: "Cancel", style: "cancel" }
          ]
        );
      }}
    />

          <Text className="text-white font-bold text-lg mb-1">@{displayProfile.username}</Text>
          {displayProfile.roles ? <Text className="text-neutral-grey text-[11px] mb-1">{displayProfile.roles}</Text> : null}
          {displayProfile.bio ? <Text className="text-white/60 text-[10px] mb-1 text-center">{displayProfile.bio}</Text> : null}
          
          {displayProfile.socialLinks.length > 0 && (
            <Pressable onPress={handleLinkPress} className="mt-1">
              <Text className="text-[#D946EF] text-[10px] font-bold">
                {displayProfile.socialLinks[0].title || displayProfile.socialLinks[0].url.replace(/^https?:\/\//, '').split('/')[0]}
                {displayProfile.socialLinks.length > 1 ? ` and ${displayProfile.socialLinks.length - 1} other${displayProfile.socialLinks.length > 2 ? 's' : ''}` : ''}
              </Text>
            </Pressable>
          )}

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
              <Text className="text-white font-black text-[15px]">₹{Number(totalEarnings).toFixed(2)}</Text>
              <Text className="text-neutral-grey text-[9px] font-bold uppercase mt-1">Earnings</Text>
            </View>
          </View>
        </View>

        {/* 2.2 CREATOR PORTAL BANNER */}
        <Pressable 
          onPress={() => router.push('/(creator)/portal')}
          className="mx-4 mb-6 bg-[#D946EF]/10 border border-[#D946EF]/20 p-4 rounded-xl flex-row items-center justify-between active:scale-[0.98]"
        >
          <View>
            <Text className="text-white font-bold text-[15px]">Creator Portal</Text>
            <Text className="text-white/60 text-[11px] mt-0.5">Analytics, earnings & growth tools</Text>
          </View>
          
          <View className="flex-row items-center gap-2">
            <View className="items-end">
             <Text className="text-[#10B981] font-black text-[15px]">₹{Number(totalEarnings).toFixed(2)}</Text>
              <Text className="text-white/50 text-[9px]">earned</Text>
            </View>
            <Text className="text-[#D946EF] font-bold text-lg ml-1">›</Text>
          </View>
        </Pressable>

        {/* 2.5 STORY HIGHLIGHTS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2 px-4 mb-4" contentContainerStyle={{ gap: 16 }}>
          <Pressable 
            onPress={() => router.push('/story-archive' as any)}
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
                  router.push({
                    pathname: `/reel/${reel.id}` as any,
                    params: { source: activeTab === 'reels' ? 'userReels' : 'likedReels' }
                  });
                }}
                className="w-[33.33%] h-44 border-[0.5px] border-black active:opacity-80"
              >
                <Image source={{ uri: reel.thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute bottom-2 left-2 flex-row items-center gap-1">
                  <Play size={10} color="#FFFFFF" fill="#FFFFFF" />
                  <Text className="text-white text-[10px] font-bold drop-shadow-md">
                    {formatSocialCount(reel.viewsCount || 0)}
                  </Text>
                </View>
                {reel.isMonetized && activeTab === 'reels' && (
                  <View className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded flex-row items-center border border-white/10">
                    <Text className="text-[#10B981] text-[9px] font-bold">
                      ₹{((reel.viewsCount || 0) * 0.005) > 0 ? ((reel.viewsCount || 0) * 0.005).toFixed(2) : '0'}
                    </Text>
                  </View>
                )}
                {activeTab === 'reels' && (
                  <Pressable 
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/(creator)/reel-analytics/${reel.id}` as any);
                    }}
                    className="absolute top-2 left-2 bg-black/70 w-6 h-6 rounded flex items-center justify-center border border-white/10"
                  >
                    <BarChart2 size={12} color="#A855F7" />
                  </Pressable>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <LinksSheet 
        isVisible={isLinksSheetOpen} 
        onClose={() => setIsLinksSheetOpen(false)} 
        links={displayProfile.socialLinks} 
      />
    </SafeScreen>
  );
}
