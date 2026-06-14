import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { ChevronLeft, Trophy, Users, Clock, Info, ChevronDown, ChevronUp, Play, UploadCloud, CheckCircle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import ChallengeSubmissionSheet from '../../components/ChallengeSubmissionSheet';
import { useFeedStore, useAuthStore } from '../../store';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

const CHALLENGES_DB: Record<string, any> = {
  'fitness': {
    tag: '#FitnessGoals',
    title: '30-Day Transformation',
    status: 'LIVE',
    prizePool: '₹2,500',
    participants: 441,
    state: 'Active'
  },
  'comedy': {
    tag: '#ComedySkit',
    title: 'Make India Laugh Challenge',
    status: 'ENDS IN 3 DAYS',
    prizePool: '₹5,000',
    participants: 864,
    state: 'Active'
  },
  'dance': {
    tag: '#DanceChallenge',
    title: 'Popli Dance Showdown 2026',
    status: 'LIVE NOW',
    prizePool: '₹10,000',
    participants: 1249,
    state: 'Active'
  }
};

export default function ChallengeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const challengeId = typeof id === 'string' ? id : 'comedy';
  const challengeData = CHALLENGES_DB[challengeId] || CHALLENGES_DB['comedy'];

  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const { reels, fetchReels } = useFeedStore();
  const { userProfile } = useAuthStore();

  React.useEffect(() => {
    if (reels.length === 0) fetchReels();
  }, []);

  // Map real reels to submissions sorted by views
  const sortedReels = [...reels].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  
  const submissions = sortedReels.length > 0 ? sortedReels.slice(0, 10).map((reel, index) => ({
    id: reel.id,
    rank: index + 1,
    type: reel.videoUrl ? 'video' : 'photo',
    username: reel.creatorUsername,
    location: reel.location?.city || 'India',
    views: reel.viewsCount || Math.floor(Math.random() * 500) + 10,
    thumbnail: reel.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
    isYou: userProfile?.username === reel.creatorUsername
  })) : [
    { id: '1', rank: 1, type: 'video', username: 'kanha Meena', location: 'Indore', views: 174, thumbnail: 'https://images.unsplash.com/photo-1516280440502-6c175373a84b?w=400&auto=format&fit=crop', isYou: true }
  ];

  const handleSubmit = () => {
    setSheetVisible(false);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D0518]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
        <View className="flex-row items-center flex-1">
          <Pressable onPress={() => router.back()} className="mr-4 active:opacity-70 p-2 -ml-2">
            <ChevronLeft color="white" size={28} />
          </Pressable>
          <View>
            <Text className="text-[#A855F7] font-bold text-xs">{challengeData.tag}</Text>
            <Text className="text-white font-bold text-xl">{challengeData.title}</Text>
          </View>
        </View>
        <View className="bg-[#1D1037] border border-[#3E2B5C] px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
          <View className="w-2 h-2 rounded-full bg-[#A855F7]" />
          <Text className="text-[#A855F7] text-xs font-bold">{challengeData.status}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Stats */}
        <View className="bg-[#1D1037]/60 rounded-2xl mx-4 mt-4 p-5 flex-row justify-between border border-[#3E2B5C]/50">
          <View className="items-center flex-1">
            <Trophy size={24} color="#FCD34D" className="mb-2" />
            <Text className="text-[#FCD34D] font-bold text-lg">{challengeData.prizePool}</Text>
            <Text className="text-white/50 text-xs mt-1">Prize Pool</Text>
          </View>
          <View className="w-[1px] h-full bg-[#3E2B5C]/50" />
          <View className="items-center flex-1">
            <Users size={24} color="#A855F7" className="mb-2" />
            <Text className="text-white font-bold text-lg">{challengeData.participants}</Text>
            <Text className="text-white/50 text-xs mt-1">Participants</Text>
          </View>
          <View className="w-[1px] h-full bg-[#3E2B5C]/50" />
          <View className="items-center flex-1">
            <Clock size={24} color="#EF4444" className="mb-2" />
            <Text className="text-white font-bold text-lg">{challengeData.state}</Text>
            <Text className="text-white/50 text-xs mt-1">Status</Text>
          </View>
        </View>

        {/* Rules Accordion */}
        <View className="mx-4 mt-6">
          <Pressable 
            onPress={() => setRulesExpanded(!rulesExpanded)}
            className={`flex-row justify-between items-center p-4 bg-[#1D1037] border border-[#3E2B5C] ${rulesExpanded ? 'rounded-t-2xl border-b-0' : 'rounded-2xl'} active:opacity-80`}
          >
            <View className="flex-row items-center gap-2">
              <Info size={18} color="#A855F7" />
              <Text className="text-white font-bold text-sm">How it Works & Rules</Text>
            </View>
            {rulesExpanded ? <ChevronUp size={20} color="white" /> : <ChevronDown size={20} color="white" />}
          </Pressable>
          
          {rulesExpanded && (
            <View className="bg-[#1D1037] border border-[#3E2B5C] border-t-0 rounded-b-2xl p-4 pt-2 gap-4">
              <View className="flex-row gap-3"><Text>📹</Text><Text className="text-white/70 text-sm flex-1">Post a video that fits the challenge theme.</Text></View>
              <View className="flex-row gap-3"><Text>🔗</Text><Text className="text-white/70 text-sm flex-1">Submit your entry using the Submit Entry button below.</Text></View>
              <View className="flex-row gap-3"><Text>👁</Text><Text className="text-white/70 text-sm flex-1">Rankings are based on total views — the more views, the higher you rank.</Text></View>
              <View className="flex-row gap-3"><Text>🏆</Text><Text className="text-white/70 text-sm flex-1">Top 3 creators split the prize pool at the end of the challenge.</Text></View>
              <View className="flex-row gap-3"><Text>⏰</Text><Text className="text-white/70 text-sm flex-1">Entries must be submitted before the countdown ends.</Text></View>
              <View className="flex-row gap-3"><Text>✅</Text><Text className="text-white/70 text-sm flex-1">Only one entry per creator — re-submitting swaps your video.</Text></View>
              <View className="flex-row gap-3"><Text>🚫</Text><Text className="text-white/70 text-sm flex-1">Content must be original and follow Popli community guidelines.</Text></View>
            </View>
          )}
        </View>

        {/* Current Leader */}
        <View className="mx-4 mt-6 bg-gradient-to-r from-[#F59E0B]/20 to-[#A855F7]/20 border border-[#FCD34D]/50 rounded-2xl p-4 flex-row items-center gap-4">
          <View className="relative">
            <Image source={{ uri: submissions[0].thumbnail }} className="w-14 h-14 rounded-full border-2 border-[#FCD34D]" />
            <View className="absolute -bottom-2 -right-2 bg-[#FCD34D] w-6 h-6 rounded-full items-center justify-center border-2 border-[#0D0518]">
              <Trophy size={12} color="black" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-[#FCD34D] font-bold text-xs uppercase tracking-widest mb-1">Current Leader</Text>
            <Text className="text-white font-bold text-lg">{submissions[0].username}</Text>
            <Text className="text-white/80 text-xs mt-0.5 font-medium">{submissions[0].views} views</Text>
          </View>
        </View>

        {/* Submissions Section */}
        <View className="px-4 mt-6">
          <Text className="text-white font-bold text-xl mb-1">Submissions</Text>
          <Text className="text-white/50 text-xs mb-4">Ranked by views · refreshes every 30s</Text>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            {submissions.map((sub) => (
              <View 
                key={sub.id} 
                className={`rounded-2xl border ${sub.isYou ? 'border-[#A855F7]' : 'border-white/5'} overflow-hidden bg-[#1D1037] relative`}
                style={{ width: ITEM_WIDTH, height: 280 }}
              >
                {/* Background Video/Image Thumbnail */}
                <View className="absolute inset-0 bg-blue-900/40">
                   <Image source={{ uri: sub.thumbnail }} className="w-full h-full opacity-60" resizeMode="cover" />
                   {/* Gradient overlay */}
                   <View className="absolute inset-0 bg-gradient-to-t from-[#1D1037] via-transparent to-transparent" />
                </View>

                {/* Top Badges */}
                <View className="absolute top-3 left-3 right-3 flex-row justify-between">
                  <View className={`${sub.rank === 1 ? 'bg-[#FCD34D]' : 'bg-white/20'} px-2 py-1 rounded`}>
                    <Text className={`${sub.rank === 1 ? 'text-black' : 'text-white'} text-xs font-bold`}>#{sub.rank}</Text>
                  </View>
                  {sub.isYou && (
                    <View className="bg-[#A855F7] px-2 py-1 rounded">
                      <Text className="text-white text-xs font-bold">YOU</Text>
                    </View>
                  )}
                </View>

                {/* Center Play Icon */}
                {sub.type === 'video' && (
                  <View className="absolute inset-0 items-center justify-center pointer-events-none">
                    <Play size={32} color="white" fill="transparent" opacity={0.8} />
                  </View>
                )}

                {/* Bottom Info */}
                <View className="absolute bottom-0 left-0 right-0 p-3 bg-[#1D1037]">
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>{sub.username}</Text>
                  <Text className="text-white/60 text-xs mt-0.5">{sub.views} views</Text>
                  <Text className="text-[#A855F7] text-xs mt-2">{sub.location}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action / Toasts */}
      <View className="absolute bottom-6 left-4 right-4 gap-4">
        {toastVisible && (
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 20 }}
            className="gap-3"
          >
            <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row items-center justify-between">
               <View className="flex-row items-center gap-4">
                 <View className="bg-[#A855F7] w-12 h-12 rounded-xl items-center justify-center">
                   <Text className="text-white font-black text-lg">#1</Text>
                 </View>
                 <View>
                   <Text className="text-white/50 text-xs">Your Rank</Text>
                   <Text className="text-white font-bold text-lg">174 views</Text>
                 </View>
               </View>
               <Pressable onPress={() => {}} className="active:opacity-70">
                 <Text className="text-[#A855F7] font-bold text-sm">Refresh</Text>
               </Pressable>
            </View>

            <View className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl p-4 flex-row items-center gap-3">
              <CheckCircle size={20} color="#10B981" />
              <Text className="text-[#10B981] font-medium flex-1">Entry submitted! Keep getting views to climb.</Text>
            </View>
          </MotiView>
        )}

        <Pressable 
          onPress={() => setSheetVisible(true)}
          className="bg-[#A855F7] py-4 rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98]"
        >
          <UploadCloud size={20} color="white" />
          <Text className="text-white font-bold text-lg">Submit Entry</Text>
        </Pressable>
      </View>

      {/* Bottom Sheet */}
      <ChallengeSubmissionSheet 
        visible={sheetVisible} 
        onClose={() => setSheetVisible(false)} 
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
