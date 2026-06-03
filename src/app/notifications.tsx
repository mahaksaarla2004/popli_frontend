import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Award, Gift, TrendingUp, Megaphone } from 'lucide-react-native';

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0d071a] pt-12">
      {/* Header bar */}
      <View className="flex-row items-center px-4 pb-4 border-b border-transparent">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-70">
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-[19px] ml-2">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* TODAY */}
        <Text className="text-white/50 text-[10px] font-bold tracking-widest mt-4 mb-3">TODAY</Text>
        <View>
          {/* Milestone */}
          <Pressable className="bg-[#1D1037]/80 border border-[#8B5CF6]/40 rounded-2xl p-4 flex-row items-center gap-4 shadow-lg shadow-[#8B5CF6]/20 active:opacity-80 transition-opacity mb-4">
            <View className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 items-center justify-center">
              <Award size={18} color="#A855F7" />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-white text-[13px] leading-5">
                Congratulations! You just hit your first <Text className="text-[#A855F7] font-bold">100 views</Text> and earned <Text className="text-[#facc15] font-bold">₹0.50</Text>!
              </Text>
              <Text className="text-white/40 text-[9px] font-bold mt-1.5 uppercase tracking-widest">MILESTONE REACHED • 2H AGO</Text>
            </View>
          </Pressable>

          {/* New Follower */}
          <Pressable className="bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 flex-row items-center justify-between active:opacity-80 transition-opacity mb-4">
            <View className="flex-row items-center gap-4 flex-1">
              <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }} className="w-10 h-10 rounded-full" />
              <View className="flex-1 pr-2">
                <Text className="text-white text-[13px] leading-5">
                  <Text className="font-bold">Alex Rivera</Text> started following you.
                </Text>
                <Text className="text-white/40 text-[9px] font-bold mt-1.5 uppercase tracking-widest">NEW FOLLOWER • 4H AGO</Text>
              </View>
            </View>
            <Pressable className="bg-[#A855F7] px-5 py-2 rounded-full">
              <Text className="text-white text-[11px] font-bold">Follow</Text>
            </Pressable>
          </Pressable>

          {/* Virtual Gift */}
          <Pressable className="bg-[#1D1037]/60 border border-white/5 border-l-4 border-l-[#eab308] rounded-2xl p-4 flex-row items-center gap-4 active:opacity-80 transition-opacity relative overflow-hidden mb-4">
            <View className="w-10 h-10 rounded-full bg-[#854d0e]/30 items-center justify-center">
              <Gift size={18} color="#facc15" />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-white text-[13px] leading-5">
                You earned <Text className="text-[#facc15] font-bold">₹10.00</Text> from a virtual gift!
              </Text>
              <Text className="text-white/40 text-[9px] font-bold mt-1.5 uppercase tracking-widest">GIFT RECEIVED • 6H AGO</Text>
            </View>
          </Pressable>
        </View>

        {/* YESTERDAY */}
        <Text className="text-white/50 text-[10px] font-bold tracking-widest mt-4 mb-3">YESTERDAY</Text>
        <View>
          {/* Comment */}
          <Pressable className="bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 flex-row items-center justify-between active:opacity-80 transition-opacity mb-4">
            <View className="flex-row items-center gap-4 flex-1 pr-3">
              <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }} className="w-10 h-10 rounded-full" />
              <View className="flex-1">
                <Text className="text-white text-[13px] leading-5">
                  <Text className="font-bold">Sarah Chen</Text> commented: &quot;The lighting in this transitions is absolutely insane!🔥&quot;
                </Text>
                <Text className="text-white/40 text-[9px] font-bold mt-1.5 uppercase tracking-widest">COMMENT • 1D AGO</Text>
              </View>
            </View>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1555685812-4b743e83f510?q=80&w=200&auto=format&fit=crop' }} className="w-11 h-11 rounded-[10px]" />
          </Pressable>

          {/* Insight */}
          <Pressable className="bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 flex-row items-center gap-4 active:opacity-80 transition-opacity mb-4">
            <View className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 items-center justify-center">
              <TrendingUp size={18} color="#A855F7" />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-white text-[13px] leading-5">
                Your latest video is performing <Text className="text-[#A855F7] font-bold">2.4x better</Text> than average!
              </Text>
              <Text className="text-white/40 text-[9px] font-bold mt-1.5 uppercase tracking-widest">INSIGHT • 1D AGO</Text>
            </View>
          </Pressable>
        </View>

        {/* THIS WEEK */}
        <Text className="text-white/50 text-[10px] font-bold tracking-widest mt-4 mb-3">THIS WEEK</Text>
        <View>
          {/* Announcement */}
          <Pressable className="bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 flex-row items-center gap-4 active:opacity-80 transition-opacity mb-4">
            <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
              <Megaphone size={18} color="#9CA3AF" />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-white text-[13px] leading-5">
                Check out the new <Text className="font-bold">#NeonChallenge</Text> for a chance to win exclusive rewards.
              </Text>
              <Text className="text-white/40 text-[9px] font-bold mt-1.5 uppercase tracking-widest">ANNOUNCEMENT • 3D AGO</Text>
            </View>
          </Pressable>

          {/* New Follower (Following) */}
          <Pressable className="bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 flex-row items-center justify-between active:opacity-80 transition-opacity mb-4">
            <View className="flex-row items-center space-x-3.5 flex-1">
              <Image source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }} className="w-10 h-10 rounded-full" />
              <View className="flex-1 pr-2">
                <Text className="text-white text-[13px] leading-5">
                  <Text className="font-bold">Jordan Blake</Text> started following you.
                </Text>
                <Text className="text-white/40 text-[9px] font-bold mt-1.5 uppercase tracking-widest">NEW FOLLOWER • 4D AGO</Text>
              </View>
            </View>
            <Pressable className="border border-white/20 px-4 py-2 rounded-full">
              <Text className="text-white/80 text-[11px] font-bold">Following</Text>
            </Pressable>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}
