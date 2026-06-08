import React from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Play, Eye, TrendingUp, DollarSign, Heart, MessageSquare, Share2, Globe } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#150F26] pt-12">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-4">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-70">
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-[19px] ml-2">Video Analytics</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* LAST UPLOADED VIDEO */}
        <View className="bg-[#1D1037]/60 border border-white/5 rounded-3xl p-5 flex-row items-center gap-4 mb-5">
          <View className="relative w-20 h-20 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-md">
            {/* Fallback image representing Night City */}
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop' }} 
              style={{ width: '100%', height: '100%', position: 'absolute' }} 
              resizeMode="cover" 
            />
            <View className="absolute inset-0 items-center justify-center bg-black/30">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center border border-white/40 pl-0.5">
                <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            </View>
            <View className="absolute bottom-1 right-1 bg-black/80 px-2 py-1 rounded">
              <Text className="text-white text-[9px] font-bold">0:45</Text>
            </View>
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-[#A855F7] text-[10px] font-black tracking-widest uppercase mb-2">Last Uploaded</Text>
            <Text className="text-white font-bold text-[15px] leading-5" numberOfLines={2}>Night City Dreams: A Cinematic Journey...</Text>
            <Text className="text-white/40 text-[11px] mt-2 font-semibold">Uploaded Apr 24, 2024</Text>
          </View>
        </View>

        {/* TOTAL VIEWS */}
        <View className="bg-[#1D1037]/60 border border-white/5 rounded-3xl p-5 mb-5">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white/50 text-[10px] font-bold tracking-widest uppercase">Total Views</Text>
            <Eye size={16} color="#A855F7" />
          </View>
          <Text className="text-white font-black text-4xl tracking-tight mb-2">1.2M</Text>
          <View className="flex-row items-center gap-2">
            <TrendingUp size={12} color="#10B981" />
            <Text className="text-[#10B981] font-bold text-[10px]">12.4% vs last video</Text>
          </View>
        </View>

        {/* STATS ROW */}
        <View className="flex-row justify-between mb-5">
          {/* Watch Time */}
          <View className="bg-[#1D1037]/60 border border-white/5 rounded-3xl p-5 w-[48%]">
            <Text className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-3">Avg Watch Time</Text>
            <Text className="text-white font-black text-2xl tracking-tight mb-4">0:45s</Text>
            <View className="h-2 bg-white/10 rounded-full overflow-hidden">
              <View className="h-full w-[100%] bg-[#A855F7] rounded-full" />
            </View>
          </View>
          
          {/* Completion Rate */}
          <View className="bg-[#1D1037]/60 border border-white/5 rounded-3xl p-5 w-[48%]">
            <Text className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-3">Completion Rate</Text>
            <Text className="text-white font-black text-2xl tracking-tight mb-4">68%</Text>
            <View className="h-2 bg-white/10 rounded-full overflow-hidden">
              <View className="h-full w-[68%] bg-[#facc15] rounded-full" />
            </View>
          </View>
        </View>

        {/* EARNINGS */}
        <View className="bg-gradient-to-tr from-[#2E1854] via-[#432371] to-[#734379] rounded-3xl p-5 mb-5 border border-[#8B5CF6]/20 relative overflow-hidden">
          {/* Fake glow effect */}
          <View className="absolute -top-10 -right-10 w-32 h-32 bg-[#F59E0B]/20 rounded-full blur-3xl" />
          
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-5 h-5 rounded-full bg-[#facc15] items-center justify-center">
              <DollarSign size={12} color="#432371" strokeWidth={3} />
            </View>
            <Text className="text-white font-bold text-[10px] tracking-widest uppercase">Earnings From This Video</Text>
          </View>
          
          <View className="flex-row items-start mb-8">
            <Text className="text-[#facc15] font-bold text-xl mt-1 mr-1">₹</Text>
            <Text className="text-[#facc15] font-black text-[40px] tracking-tight">17,500</Text>
          </View>

          {/* Breakdown */}
          <View className="gap-y-4">
            <View className="flex-row items-center">
              <Text className="text-white/60 text-[11px] font-semibold w-24">Ad Revenue</Text>
              <Text className="text-white font-bold text-[12px] w-16">₹12,450</Text>
              <View className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden ml-2">
                <View className="h-full w-[70%] bg-[#A855F7] rounded-full" />
              </View>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-white/60 text-[11px] font-semibold w-24">Virtual Gifts</Text>
              <Text className="text-white font-bold text-[12px] w-16">₹4,200</Text>
              <View className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden ml-2">
                <View className="h-full w-[25%] bg-[#facc15] rounded-full" />
              </View>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-white/60 text-[11px] font-semibold w-24">Referral Bonus</Text>
              <Text className="text-white font-bold text-[12px] w-16">₹850</Text>
              <View className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden ml-2">
                <View className="h-full w-[5%] bg-white/40 rounded-full" />
              </View>
            </View>
          </View>
        </View>

        {/* VIEW VELOCITY */}
        <View className="bg-[#1D1037]/60 border border-white/5 rounded-3xl p-5 mb-5">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-white font-bold text-[14px]">View Velocity</Text>
              <Text className="text-white/50 text-[10px] mt-1">First 24 Hours Performance</Text>
            </View>
            <View className="bg-[#A855F7]/20 px-3 py-1 rounded-full">
              <Text className="text-[#A855F7] font-bold text-[8px] tracking-widest uppercase">Live</Text>
            </View>
          </View>
          
          {/* Chart Placeholder (using an image that looks like a neon chart or CSS waves) */}
          <View className="h-28 w-full justify-end border-b border-white/10 pb-2 relative mt-4">
             {/* Fake SVG Curve using overlapping borders/views for a quick mockup */}
             <View className="absolute bottom-0 left-0 right-0 h-[60%] bg-[#A855F7]/30 opacity-70 border-t border-[#A855F7]" style={{ borderTopLeftRadius: 100, borderTopRightRadius: 40 }} />
             <View className="absolute bottom-0 left-[20%] right-[10%] h-[80%] bg-[#A855F7]/40 opacity-80 border-t border-[#D946EF]" style={{ borderTopLeftRadius: 60, borderTopRightRadius: 90 }} />
          </View>
          <View className="flex-row justify-between mt-3 px-1">
            <Text className="text-white/40 text-[9px] font-bold">0h</Text>
            <Text className="text-white/40 text-[9px] font-bold">6h</Text>
            <Text className="text-white/40 text-[9px] font-bold">12h</Text>
            <Text className="text-white/40 text-[9px] font-bold">18h</Text>
            <Text className="text-white/40 text-[9px] font-bold">24h</Text>
          </View>
        </View>

        {/* METRICS ROW */}
        <View className="flex-row justify-between mb-5">
          <View className="bg-[#1D1037]/60 border border-white/5 rounded-3xl p-4 w-[31%] items-center">
            <Heart size={16} color="#A855F7" fill="#A855F7" className="mb-3" />
            <Text className="text-white font-black text-[17px] mb-2">12.4%</Text>
            <Text className="text-white/50 text-[7px] font-bold tracking-widest uppercase">Like Rate</Text>
          </View>
          <View className="bg-[#1D1037]/60 border border-white/5 rounded-3xl p-4 w-[31%] items-center">
            <MessageSquare size={16} color="#A855F7" fill="#A855F7" className="mb-3" />
            <Text className="text-white font-black text-[17px] mb-2">3.2%</Text>
            <Text className="text-white/50 text-[7px] font-bold tracking-widest uppercase">Comment Rate</Text>
          </View>
          <View className="bg-[#1D1037]/60 border border-white/5 rounded-3xl p-4 w-[31%] items-center">
            <Share2 size={16} color="#A855F7" className="mb-3" />
            <Text className="text-white font-black text-[17px] mb-2">5.8%</Text>
            <Text className="text-white/50 text-[7px] font-bold tracking-widest uppercase">Share Rate</Text>
          </View>
        </View>

        {/* TOP LOCATIONS */}
        <View className="bg-[#1D1037]/60 border border-white/5 rounded-3xl p-5 mb-5">
          <View className="flex-row items-center gap-2 mb-6">
            <Globe size={16} color="#A855F7" />
            <Text className="text-white font-bold text-[13px]">Top Locations</Text>
          </View>
          
          <View className="gap-y-6">
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-white text-[11px] font-semibold">Mumbai</Text>
                <Text className="text-white font-bold text-[11px]">42%</Text>
              </View>
              <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                <View className="h-full w-[42%] bg-[#A855F7] rounded-full" />
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-white text-[11px] font-semibold">Delhi</Text>
                <Text className="text-white font-bold text-[11px]">28%</Text>
              </View>
              <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                <View className="h-full w-[28%] bg-[#A855F7] rounded-full" />
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-white text-[11px] font-semibold">Bengaluru</Text>
                <Text className="text-white font-bold text-[11px]">18%</Text>
              </View>
              <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                <View className="h-full w-[18%] bg-[#A855F7] rounded-full" />
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-white text-[11px] font-semibold">Pune</Text>
                <Text className="text-white font-bold text-[11px]">12%</Text>
              </View>
              <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                <View className="h-full w-[12%] bg-[#A855F7] rounded-full" />
              </View>
            </View>
          </View>

          <Pressable className="bg-white/5 border border-white/10 rounded-2xl py-3 mt-6 items-center active:opacity-70">
            <Text className="text-white/80 font-bold text-[11px]">View All Demographics</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}
