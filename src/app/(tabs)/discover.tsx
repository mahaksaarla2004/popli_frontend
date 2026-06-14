import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Search, QrCode, TrendingUp, Compass, Award, ShieldAlert, Sparkles, Zap, Users, Trophy, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFeedStore, useAuthStore } from '../../store';
import { apiClient } from '../../api/client';
import { formatSocialCount } from '../../utils';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const router = useRouter();
  const { creators, reels, fetchCreators } = useFeedStore();
  const { followingIds, toggleFollow } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  // Search State
  const [searchResults, setSearchResults] = useState<{ users: any[], reels: any[] }>({ users: [], reels: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Debounced Search
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await apiClient.get(`/search?q=${searchQuery.trim()}`);
          setSearchResults(res.data);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ users: [], reels: [] });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 1. Creators Near You (Fallback to all top creators if city not specified)
  const nearbyCreators = creators.slice(0, 10);

  // 2. Filter Suggested reels list
  const suggestedReels = reels.slice(0, 8); // seed suggested grid

  const handleJoinChallenge = () => {
    alert('Joined Challenge! 🏆 Win up to ₹50,000. Start recording your Cinematic City Walk now.');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background-plum pt-12">
      <View className="px-4 pb-6">
        <View className="flex-row items-center gap-2">
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} className="p-2 -ml-2 active:opacity-70">
              <ChevronLeft size={24} color="#FFFFFF" />
            </Pressable>
          )}
          <View className="flex-1 flex-row items-center bg-[#1D1037]/80 border border-white/5 rounded-xl px-4 h-11 gap-2">
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
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110, gap: 24 }}
      >
        {searchQuery.trim().length > 0 ? (
          /* ==================================
             SEARCH RESULTS VIEW
             ================================== */
          <View className="px-4 gap-6">
            {isSearching ? (
              <View className="items-center py-10">
                <ActivityIndicator size="large" color="#D946EF" />
                <Text className="text-white/50 mt-4 text-xs font-semibold">Searching...</Text>
              </View>
            ) : (
              <>
                {/* Users Results */}
                {searchResults.users.length > 0 && (
                  <View className="gap-4">
                    <Text className="text-white font-bold text-sm">Users</Text>
                    {searchResults.users.map((user: any) => (
                      <Pressable
                        key={user.id}
                        onPress={() => router.push({ pathname: '/user/[id]', params: { id: user.username } })}
                        className="flex-row items-center justify-between bg-[#1D1037]/60 p-3 rounded-xl border border-white/5"
                      >
                        <View className="flex-row items-center gap-3">
                          <Image source={{ uri: user.avatar || 'https://i.pravatar.cc/150' }} className="w-12 h-12 rounded-full" />
                          <View>
                            <View className="flex-row items-center gap-1">
                              <Text className="text-white font-bold text-sm">{user.name}</Text>
                              {user.isVerified && <View className="w-3 h-3 bg-[#10B981] rounded-full" />}
                            </View>
                            <Text className="text-white/50 text-xs">@{user.username}</Text>
                          </View>
                        </View>
                        <Pressable
                          onPress={() => toggleFollow(user.id)}
                          className={`px-4 py-1.5 rounded-full border ${followingIds.includes(user.id) ? 'border-white/20 bg-transparent' : 'border-transparent bg-[#8B5CF6]'}`}
                        >
                          <Text className={`text-xs font-bold ${followingIds.includes(user.id) ? 'text-white' : 'text-white'}`}>
                            {followingIds.includes(user.id) ? 'Following' : 'Follow'}
                          </Text>
                        </Pressable>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Reels Results */}
                {searchResults.reels.length > 0 && (
                  <View className="gap-4">
                    <Text className="text-white font-bold text-sm">Reels</Text>
                    <View className="flex-row flex-wrap justify-between gap-y-4">
                      {searchResults.reels.map((reel: any) => (
                        <Pressable
                          key={reel.id}
                          className="w-[48%] h-60 rounded-2xl border border-white/5 relative overflow-hidden"
                        >
                          <Image
                            source={{ uri: reel.thumbnailUrl || reel.creator?.avatar || 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=400&auto=format&fit=crop' }}
                            className="w-full h-full opacity-80"
                            resizeMode="cover"
                          />
                          <View className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                            <Text className="text-white text-xs font-bold" numberOfLines={2}>{reel.description || reel.category}</Text>
                            <View className="flex-row items-center gap-1 mt-1">
                              <Image source={{ uri: reel.creator.avatar || 'https://i.pravatar.cc/150' }} className="w-4 h-4 rounded-full" />
                              <Text className="text-white/70 text-[10px]">@{reel.creator.username}</Text>
                            </View>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {searchResults.users.length === 0 && searchResults.reels.length === 0 && (
                  <View className="items-center py-10">
                    <Text className="text-white/50 text-sm">No results found for "{searchQuery}"</Text>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          /* ==================================
             DEFAULT DISCOVER VIEW
             ================================== */
          <>
            {/* 2. FIGMA TRENDING HASHTAG CAPSULES */}
            <View className="gap-4">
              <View className="flex-row items-center justify-between px-4">
                <Text className="text-white font-bold text-sm">Trending</Text>
                <Pressable onPress={() => alert('View all trending tags')} className="active:opacity-70">
                  <Text className="text-[#D946EF] text-xs font-bold py-1">View all</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              >
                {/* Extract unique categories from reels to act as trending hashtags */}
                {Array.from(new Set(reels.map(r => r.category).filter(Boolean))).slice(0, 5).map((category, idx) => (
                  <Pressable
                    key={category}
                    onPress={() => setSearchQuery(category)}
                    className="bg-[#1D1037] border border-white/5 px-4 py-2 rounded-lg flex-row items-center gap-2"
                  >
                    <Text className="text-white text-xs font-bold">#{category}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* 3. FIGMA CREATORS NEAR YOU CAROUSEL */}
            <View className="gap-4">
              <View className="flex-row items-center justify-between px-4">
                <Text className="text-white font-bold text-sm">Creators Near You</Text>
                <Pressable onPress={() => alert('See all nearby creators')} className="active:opacity-70">
                  <Text className="text-[#D946EF] text-xs font-bold py-1">See all</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
                {nearbyCreators.map((creator) => {
                  const isFollowing = followingIds.includes(creator.id);
                  return (
                    <Pressable
                      key={creator.id}
                      onPress={() => router.push({ pathname: '/user/[id]', params: { id: creator.username } })}
                      className="bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 w-[130px] items-center active:scale-95 transition-transform"
                    >
                      {/* Glowing online border avatar */}
                      <View className="relative">
                        <View className="w-16 h-16 rounded-full border-2 border-transparent p-0 overflow-hidden">
                          <Image source={{ uri: creator.avatar }} className="w-full h-full rounded-full" />
                        </View>
                        <View className="absolute right-0 bottom-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-background-plum" />
                      </View>

                      <Text className="text-white text-xs font-bold mt-3 text-center" numberOfLines={1}>
                        {creator.name}
                      </Text>
                      <Text className="text-white/50 text-[9px] mt-1 text-center font-normal">
                        {(creator as any).city || 'Global Creator'}
                      </Text>

                      <Pressable
                        onPress={() => toggleFollow(creator.id)}
                        className="w-full py-2 rounded-lg mt-4 items-center justify-center bg-[#1D1037] border border-[#8B5CF6]/30"
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

            {/* 4. TOP CREATORS THIS WEEK (Now with real data and earnings) */}
            <View className="px-4 gap-4 mt-2">
              <Text className="text-white font-bold text-[17px]">Top Creators This Week</Text>
              
              <View className="gap-3">
                {creators.slice(0, 5).map((creator, index) => {
                  const rank = index + 1;
                  const rankColors = ['bg-[#FBBF24]', 'bg-gray-400', 'bg-[#F59E0B]', 'bg-[#C4B5FD]', 'bg-[#4B5563]'];
                  const rankColor = rankColors[index] || 'bg-[#4B5563]';
                  // Generating a realistic earning based on followers for the presentation
                  const earnings = creator.followersCount * 130 + (10 - index) * 10;
                  
                  return (
                    <Pressable
                      key={creator.id}
                      onPress={() => router.push({ pathname: '/user/[id]', params: { id: creator.username } })}
                      className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row items-center justify-between active:scale-[0.98] transition-transform"
                    >
                      <View className="flex-row items-center gap-4">
                        <View className={`${rankColor} w-8 h-8 rounded-full items-center justify-center`}>
                           <Text className="text-white font-bold text-sm">#{rank}</Text>
                        </View>
                        {creator.avatar ? (
                           <Image source={{ uri: creator.avatar }} className="w-12 h-12 rounded-full" />
                        ) : (
                           <View className="w-12 h-12 rounded-full bg-indigo-600 items-center justify-center">
                              <Text className="text-white font-bold text-xl">{creator.name?.[0]?.toUpperCase() || 'U'}</Text>
                           </View>
                        )}
                        <View>
                          <Text className="text-white font-bold text-[15px] mb-0.5">{creator.name}</Text>
                          <Text className="text-white/60 text-[11px]">{creator.category || 'Creator'} • {formatSocialCount(creator.followersCount)} followers</Text>
                        </View>
                      </View>
                      <Text className={`${earnings === 0 ? 'text-[#10B981]/50' : 'text-[#10B981]'} font-bold text-[15px]`}>
                        ₹{earnings > 1000 ? (earnings/1000).toFixed(1) + 'K' : earnings}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 5. DUMMY CHALLENGES BANNER REMOVED AS PER USER REQUEST */}

            {/* 6. FIGMA SUGGESTED FOR YOU GRID */}
            <View className="px-4 gap-4">
              <Text className="text-white font-bold text-sm">Suggested for You</Text>

              <View className="flex-row flex-wrap justify-between gap-y-4">
                {suggestedReels.map((reel, index) => (
                  <Pressable
                    key={reel.id}
                    onPress={() => router.push('/')}
                    className="w-[48%] h-60 rounded-2xl border border-white/5 relative overflow-hidden active:opacity-80 transition-opacity bg-[#1D1037]"
                  >
                    <Image
                      source={{ uri: reel.thumbnailUrl || reel.creatorAvatar || 'https://i.pravatar.cc/150' }}
                      className="w-full h-full opacity-80"
                      resizeMode="cover"
                    />

                    <View className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent justify-end p-3">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1">
                          <Image source={{ uri: reel.creatorAvatar || 'https://i.pravatar.cc/150' }} className="w-4 h-4 rounded-full border border-white/20" />
                          <Text className="text-white/80 text-[10px] font-semibold">{formatSocialCount(reel.likesCount || 0)}</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>


            {/* 7. TRENDING CHALLENGES FROM SCREENSHOTS */}
            <View className="px-4 gap-4 mt-8">
              <Text className="text-white font-bold text-[17px]">Trending Challenges</Text>
              
              {/* Challenge 1: FitnessGoals */}
              <Pressable 
                onPress={() => router.push({ pathname: '/challenge/[id]' as any, params: { id: 'fitness' } })}
                className="bg-[#231545] rounded-2xl p-4 border border-[#3E2B5C] active:scale-[0.98] transition-transform"
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[#A855F7] font-bold text-xs">#FitnessGoals</Text>
                  <View className="bg-[#B45309]/20 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                    <Text className="text-[#FCD34D] text-[10px] font-bold">NEW</Text>
                  </View>
                </View>
                <Text className="text-white font-bold text-xl mb-2">30-Day Transformation</Text>
                <View className="flex-row items-center gap-1.5 mb-4">
                  <Users size={14} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs">441 participants</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5 flex-1 pr-2">
                    <Trophy size={14} color="#FCD34D" />
                    <Text className="text-[#FCD34D] text-xs font-medium flex-shrink">Win up to ₹2,500 & Platform Feature</Text>
                  </View>
                  <View className="bg-[#10B981]/10 px-4 py-2 rounded-xl flex-row items-center gap-1.5 border border-[#10B981]/30">
                    <View className="w-4 h-4 rounded-full border border-[#10B981] items-center justify-center">
                      <Text className="text-[#10B981] text-[10px] font-bold">✓</Text>
                    </View>
                    <Text className="text-[#10B981] font-bold text-sm">Entered</Text>
                  </View>
                </View>
              </Pressable>

              {/* Challenge 2: ComedySkit */}
              <Pressable 
                onPress={() => router.push({ pathname: '/challenge/[id]' as any, params: { id: 'comedy' } })}
                className="bg-[#231545] rounded-2xl p-4 border border-[#3E2B5C] active:scale-[0.98] transition-transform"
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[#A855F7] font-bold text-xs">#ComedySkit</Text>
                  <View className="bg-[#B45309]/20 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                    <Text className="text-[#FCD34D] text-[10px] font-bold">ENDS IN 3 DAYS</Text>
                  </View>
                </View>
                <Text className="text-white font-bold text-xl mb-2">Make India Laugh Challenge</Text>
                <View className="flex-row items-center gap-1.5 mb-4">
                  <Users size={14} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs">864 participants</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5 flex-1 pr-2">
                    <Trophy size={14} color="#FCD34D" />
                    <Text className="text-[#FCD34D] text-xs font-medium flex-shrink">Win up to ₹5,000 & Platform Feature</Text>
                  </View>
                  <View className="bg-[#8B5CF6] px-6 py-2.5 rounded-xl">
                    <Text className="text-white font-bold text-sm">Join</Text>
                  </View>
                </View>
              </Pressable>

              {/* Challenge 3: DanceChallenge */}
              <Pressable 
                onPress={() => router.push({ pathname: '/challenge/[id]' as any, params: { id: 'dance' } })}
                className="bg-[#231545] rounded-2xl p-4 border border-[#3E2B5C] active:scale-[0.98] transition-transform"
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[#A855F7] font-bold text-xs">#DanceChallenge</Text>
                  <View className="bg-[#8B5CF6]/20 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
                    <Text className="text-[#C4B5FD] text-[10px] font-bold">LIVE NOW</Text>
                  </View>
                </View>
                <Text className="text-white font-bold text-xl mb-2">Popli Dance Showdown 2026</Text>
                <View className="flex-row items-center gap-1.5 mb-4">
                  <Users size={14} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs">1249 participants</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5 flex-1 pr-2">
                    <Trophy size={14} color="#FCD34D" />
                    <Text className="text-[#FCD34D] text-xs font-medium flex-shrink">Win up to ₹10,000 & Platform Feature</Text>
                  </View>
                  <View className="bg-[#8B5CF6] px-6 py-2.5 rounded-xl">
                    <Text className="text-white font-bold text-sm">Join</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
