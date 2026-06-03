import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable, Dimensions } from 'react-native';
import { Search, QrCode, TrendingUp, Compass, Award, ShieldAlert, Sparkles, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFeedStore, useAuthStore } from '../../store';
import { formatSocialCount } from '../../utils';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const router = useRouter();
  const { creators, reels } = useFeedStore();
  const { followingIds, toggleFollow } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Creators Near You (Filter creators in Indore/current city)
  const nearbyCreators = creators.filter((c) => c.location.city === 'Indore');

  // 2. Filter Suggested reels list
  const suggestedReels = reels.slice(0, 8); // seed suggested grid

  const handleJoinChallenge = () => {
    alert('Joined Challenge! 🏆 Win up to ₹50,000. Start recording your Cinematic City Walk now.');
  };

  return (
    <View className="flex-1 bg-background-plum pt-12">
      {/* 1. FIGMA SEARCH BAR */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center bg-[#1D1037]/80 border border-white/5 rounded-xl px-4 h-11 space-x-2">
          <Search size={18} color="rgba(255, 255, 255, 0.5)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            className="flex-1 text-white text-[13px] font-normal"
          />
          <Pressable onPress={() => alert('QR Scanner coming soon!')} className="p-1 active:opacity-70">
            <QrCode size={18} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1 py-3" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        
        {/* 2. FIGMA TRENDING HASHTAG CAPSULES */}
        <View className="py-2 space-y-3">
          <View className="flex-row items-center justify-between px-4">
            <Text className="text-white font-bold text-sm">Trending</Text>
            <Pressable onPress={() => alert('View all trending tags')} className="active:opacity-70">
              <Text className="text-[#D946EF] text-[11px] font-bold py-1">View all</Text>
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="flex-row"
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {[
              { label: '#StreetDance', icon: '⚡' },
              { label: '#TechHacks', icon: '🏕️' },
              { label: '#CookingDiaries', icon: '👨‍🍳' }
            ].map((tag) => (
              <Pressable 
                key={tag.label} 
                onPress={() => setSearchQuery(tag.label)}
                className="bg-[#1D1037] border border-white/5 px-3.5 py-2 rounded-lg flex-row items-center space-x-1.5"
              >
                <Text className="text-xs">{tag.icon}</Text>
                <Text className="text-white text-xs font-bold">{tag.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* 3. FIGMA CREATORS NEAR YOU CAROUSEL */}
        <View className="py-4 space-y-3.5">
          <View className="flex-row items-center justify-between px-4">
            <Text className="text-white font-bold text-sm">Creators Near You</Text>
            <Pressable onPress={() => alert('See all nearby creators')} className="active:opacity-70">
              <Text className="text-[#D946EF] text-[11px] font-bold w-10 text-right py-1">See all</Text>
            </Pressable>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row px-4 space-x-4">
            {nearbyCreators.map((creator) => {
              const isFollowing = followingIds.includes(creator.id);
              return (
                <Pressable 
                  key={creator.id}
                  onPress={() => router.push('/profile')}
                  className="bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 w-[130px] items-center active:scale-95 transition-transform"
                >
                  {/* Glowing online border avatar */}
                  <View className="relative">
                    <View className="w-16 h-16 rounded-full border-2 border-transparent p-0 overflow-hidden">
                      <Image source={{ uri: creator.avatar }} className="w-full h-full rounded-full" />
                    </View>
                    <View className="absolute right-0 bottom-0 w-3.5 h-3.5 bg-[#10B981] rounded-full border-2 border-background-plum" />
                  </View>
                  
                  <Text className="text-white text-xs font-bold mt-2.5 text-center" numberOfLines={1}>
                    {creator.name}
                  </Text>
                  <Text className="text-white/50 text-[9px] mt-0.5 text-center font-normal">
                    {creator.distanceKm ? `${creator.distanceKm}km away` : creator.location.city}
                  </Text>

                  <Pressable 
                    onPress={() => toggleFollow(creator.id)}
                    className="w-full py-1.5 rounded-lg mt-3 items-center justify-center bg-[#1D1037] border border-[#8B5CF6]/30"
                  >
                    <Text className="text-[#8B5CF6] text-[10px] font-bold">
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. FIGMA WEEKLY TOP EARNERS LEADERBOARD */}
        <View className="px-4 py-2 space-y-3.5">
          <Text className="text-white font-bold text-sm">Top Earning Creators This Week</Text>

          <View className="space-y-2.5">
            {/* Hardcoded high earners from Figma */}
            <Pressable 
              onPress={() => router.push('/profile')}
              className="bg-[#1D1037]/80 border border-white/5 rounded-2xl p-3 flex-row items-center justify-between active:scale-[0.98] transition-transform"
            >
              <View className="flex-row items-center">
                <Text className="text-[#D946EF] font-black text-[17px] w-9">#1</Text>
                <Image source={{ uri: AVATARS[3] }} className="w-11 h-11 rounded-[12px] ml-1" />
                <View className="ml-3.5">
                  <Text className="text-white text-[14px] font-bold">Vikram Tech</Text>
                  <Text className="text-white/50 text-[11px] font-normal mt-0.5">Gadget Reviewer</Text>
                </View>
              </View>
              <View className="bg-[#854d0e]/40 px-3 py-1.5 rounded-full border border-[#eab308]/30">
                <Text className="text-[#facc15] text-[10px] font-bold">Earned ₹1.8L</Text>
              </View>
            </Pressable>

            <Pressable 
              onPress={() => router.push('/profile')}
              className="bg-[#1D1037]/80 border border-white/5 rounded-2xl p-3 flex-row items-center justify-between active:scale-[0.98] transition-transform"
            >
              <View className="flex-row items-center">
                <Text className="text-[#8B5CF6] font-black text-[17px] w-9">#2</Text>
                <Image source={{ uri: AVATARS[2] }} className="w-11 h-11 rounded-[12px] ml-1" />
                <View className="ml-3.5">
                  <Text className="text-white text-[14px] font-bold">Elena Fashion</Text>
                  <Text className="text-white/50 text-[11px] font-normal mt-0.5">Style Guru</Text>
                </View>
              </View>
              <View className="bg-[#854d0e]/40 px-3 py-1.5 rounded-full border border-[#eab308]/30">
                <Text className="text-[#facc15] text-[10px] font-bold">Earned ₹1.2L</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* 5. FIGMA TRENDING CHALLENGES BANNER */}
        <View className="px-4 py-4 space-y-3.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-bold text-sm">Trending Challenges</Text>
            <View className="bg-[#1D1037]/50 px-2 py-1 rounded-md flex-row items-center space-x-1 border border-[#D946EF]/30">
              <Zap size={10} color="#D946EF" fill="#D946EF" />
              <Text className="text-[#D946EF] text-[9px] font-bold uppercase tracking-widest">LIVE NOW</Text>
            </View>
          </View>
          
          <View className="rounded-2xl relative overflow-hidden h-[160px] border border-white/5 bg-[#1D1037]">
            {/* Background Image for Challenge */}
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop' }} 
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5 }} 
              resizeMode="cover" 
            />
            {/* Gradient Overlay for text readability */}
            <View style={{ position: 'absolute', width: '100%', height: '100%' }} className="bg-gradient-to-r from-[#0d071a]/90 via-[#0d071a]/60 to-transparent" />
            
            <View className="absolute inset-0 p-5 justify-center">
              <Text className="text-[#D946EF] text-[10px] font-black tracking-widest uppercase mb-1">#NEONVIBES24</Text>
              <Text className="text-white font-black text-xl leading-6 w-[70%]">Cinematic City Walk</Text>
              <Text className="text-white/70 text-[10px] mt-1 font-normal w-[70%] leading-4">
                Win up to ₹50,000 & Platform Feature
              </Text>
              
              <Pressable 
                onPress={handleJoinChallenge}
                className="bg-[#A855F7] px-6 py-2 rounded-full mt-4 self-start shadow-md shadow-[#A855F7]/30"
              >
                <Text className="text-white text-[11px] font-bold tracking-wide">Join</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 6. FIGMA SUGGESTED FOR YOU GRID */}
        <View className="px-4 py-2 space-y-3.5">
          <Text className="text-white font-bold text-sm">Suggested for You</Text>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            {suggestedReels.map((reel, index) => (
              <Pressable
                key={reel.id}
                onPress={() => router.push('/')}
                className="w-[48%] h-60 rounded-2xl border border-white/5 relative overflow-hidden active:opacity-80 transition-opacity"
              >
                {/* Fallback specific images to match Figma design vibe */}
                <Image 
                  source={{ uri: index === 0 ? 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&auto=format&fit=crop' : index === 1 ? 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=400&auto=format&fit=crop' : reel.thumbnailUrl }} 
                  className="w-full h-full" 
                  resizeMode="cover" 
                />
                
                {/* Reward Badge Overlay for first item */}
                {index === 0 && (
                  <View className="absolute top-2 left-2 bg-[#1D1037]/80 px-1.5 py-0.5 rounded border border-[#8B5CF6]/30 flex-row items-center space-x-1">
                    <Text className="text-white text-[8px] font-bold">💎 REWARD</Text>
                  </View>
                )}

                {/* Info absolute layout bottom */}
                <View className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent justify-end p-2.5">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-1">
                      <Image source={{ uri: reel.creatorAvatar }} className="w-4 h-4 rounded-full border border-white/20" />
                      <Text className="text-white/80 text-[10px] font-semibold">{index === 0 ? '842K' : '1.2M'}</Text>
                    </View>
                    <View className="bg-white/20 p-1 rounded-full">
                      <Image source={{ uri: reel.creatorAvatar }} className="w-3.5 h-3.5 rounded-full" />
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
];
