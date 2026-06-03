import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, AlignLeft, LayoutGrid, Heart, Film, Play } from 'lucide-react-native';
import { useAuthStore, useFeedStore } from '../../store';
import { formatSocialCount } from '../../utils';

const { width } = Dimensions.get('window');

type ProfileTabType = 'reels' | 'likes';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const { reels } = useFeedStore();

  const [activeTab, setActiveTab] = useState<ProfileTabType>('reels');

  // Hardcoded as per Figma for now to match the visual exactly
  const displayProfile = {
    username: 'Sonali_1234',
    roles: 'Entertainer | Musician | Fitness Freak',
    bio: 'Living the life your style with your rules',
    link: 'www.appyhigh.com/projects',
    posts: 102,
    following: 91,
    followers: 1200000,
    likes: 30000000,
    avatar: 'https://i.pravatar.cc/300?img=47' // random female avatar for demo
  };

  const userReels = [
    { id: '1', thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', likesCount: 1200000 },
    { id: '2', thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', likesCount: 840000 },
    { id: '3', thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', likesCount: 2500000 },
    { id: '4', thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', likesCount: 450000 },
    { id: '5', thumbnailUrl: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', likesCount: 900000 },
    { id: '6', thumbnailUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', likesCount: 150000 }
  ];
  const likedReels = reels.filter((r) => r.isLiked);

  const activeGridData = activeTab === 'reels' ? userReels : likedReels;

  return (
    <View className="flex-1 bg-[#12081E] pt-12">
      {/* 1. HEADER */}
      <View className="flex-row items-center justify-between px-6 pb-3 border-b border-white/5">
        <Pressable className="p-2 -ml-2">
          <AlignLeft size={24} color="#FFFFFF" />
        </Pressable>
        
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
        
        {/* 2. AVATAR & BIO BLOCK */}
        <View className="items-center px-6 py-6">
          <View className="w-24 h-24 rounded-full border-[3px] border-[#A855F7] p-0.5 mb-4">
            <Image source={{ uri: displayProfile.avatar }} className="w-full h-full rounded-full" />
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
            <Pressable onPress={() => router.push('/network')} className="items-center">
              <Text className="text-white font-black text-[15px]">{displayProfile.following}</Text>
              <Text className="text-neutral-grey text-[9px] font-bold uppercase mt-1">Following</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/network')} className="items-center">
              <Text className="text-white font-black text-[15px]">1.2M</Text>
              <Text className="text-neutral-grey text-[9px] font-bold uppercase mt-1">Followers</Text>
            </Pressable>
            <View className="items-center">
              <Text className="text-white font-black text-[15px]">30M</Text>
              <Text className="text-neutral-grey text-[9px] font-bold uppercase mt-1">Likes</Text>
            </View>
          </View>
        </View>

        {/* 3. TABS SEGMENTS */}
        <View className="flex-row border-t border-b border-white/5 py-2 mt-2">
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
          <View className="py-16 items-center justify-center">
            <Text className="text-white/60 text-xs">No media found. 📷</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {activeGridData.map((reel, index) => (
              <Pressable
                key={reel.id}
                onPress={() => {
                  router.push({ pathname: '/(tabs)', params: { feed_reel_id: reel.id } });
                }}
                className="w-[33.33%] h-44 border-[0.5px] border-black active:opacity-80"
              >
                <Image source={{ uri: reel.thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute bottom-2 left-2 flex-row items-center space-x-1">
                  <Play size={10} color="#FFFFFF" fill="#FFFFFF" />
                  <Text className="text-white text-[10px] font-bold drop-shadow-md">
                    {formatSocialCount(reel.likesCount)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
