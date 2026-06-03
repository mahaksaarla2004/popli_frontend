import React from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Settings, TrendingUp, Play, Gift, Users, Clock, CheckCircle2, Info } from 'lucide-react-native';
import { useWalletStore } from '../../store';
import { formatINR } from '../../utils';

const { width } = Dimensions.get('window');

export default function CreatorRewardsScreen() {
  const router = useRouter();
  const { inrEarnings } = useWalletStore();

  return (
    <View className="flex-1 bg-[#12081E] pt-14">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-2">
        <Text className="text-white font-black text-2xl">Creator Rewards</Text>
        <View className="flex-row space-x-3">
          <Pressable className="w-9 h-9 rounded-full bg-white/5 items-center justify-center border border-white/10">
            <Bell size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable className="w-9 h-9 rounded-full bg-white/5 items-center justify-center border border-white/10">
            <Settings size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        
        {/* Total Balance Card */}
        <View className="bg-[#1A0E2C] rounded-3xl p-6 mt-4 border border-white/5 items-center shadow-lg shadow-[#A855F7]/10" style={{ gap: 16 }}>
          <View className="items-center">
            <Text className="text-neutral-grey text-[10px] font-bold uppercase tracking-widest mb-1">Total Balance</Text>
            <Text 
              className="text-[#FACC15] font-black text-4xl" 
              style={{ textShadowColor: 'rgba(250, 204, 21, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
            >
              {formatINR(inrEarnings || 42850)}
            </Text>
          </View>

          <View className="bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1.5 rounded-full flex-row items-center space-x-1.5">
            <TrendingUp size={12} color="#10B981" />
            <Text className="text-[#10B981] text-[10px] font-bold">+12% from last month</Text>
          </View>

          <Pressable 
            onPress={() => router.push('/withdraw')}
            className="w-full bg-[#A855F7] py-4 rounded-xl items-center justify-center mt-2 shadow-sm shadow-[#A855F7]/40 active:scale-[0.98]"
          >
            <Text className="text-white font-bold text-sm">Withdraw Funds</Text>
          </Pressable>

          <View className="flex-row items-center justify-center space-x-4 w-full mt-2">
            <View className="flex-row items-center space-x-1">
              <Text className="text-neutral-grey text-[9px] font-medium">Tax (TDS) - 10%</Text>
              <Info size={10} color="#9CA3AF" />
            </View>
            <View className="flex-row items-center space-x-1">
              <Text className="text-neutral-grey text-[9px] font-medium">Platform Fee - 2%</Text>
              <Info size={10} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Revenue Sources */}
        <View className="mt-8 mb-8" style={{ gap: 12 }}>
          <Text className="text-white text-sm font-bold ml-1 mb-1">Revenue Sources</Text>
          
          <View className="bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <View className="w-12 h-12 bg-[#A855F7]/10 rounded-xl items-center justify-center">
                <Play size={20} color="#A855F7" fill="#A855F7" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm">Video Views</Text>
                <Text className="text-neutral-grey text-[10px] mt-0.5">Based on CPM & Engagement</Text>
              </View>
            </View>
            <Text className="text-white font-black text-lg">₹32,000</Text>
          </View>

          <View className="flex-row justify-between" style={{ gap: 12 }}>
            <View className="flex-1 bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 justify-between" style={{ minHeight: 90 }}>
              <View className="w-8 h-8 bg-[#FACC15]/10 rounded-lg items-center justify-center mb-2">
                <Gift size={16} color="#FACC15" />
              </View>
              <View>
                <Text className="text-neutral-grey text-[10px] font-medium">Gifts & Tips</Text>
                <Text className="text-white font-black text-lg mt-0.5">₹8,500</Text>
              </View>
            </View>

            <View className="flex-1 bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 justify-between" style={{ minHeight: 90 }}>
              <View className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg items-center justify-center mb-2">
                <Users size={16} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-neutral-grey text-[10px] font-medium">Referrals</Text>
                <Text className="text-white font-black text-lg mt-0.5">₹2,350</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mt-2 mb-6" style={{ gap: 12 }}>
          <View className="flex-row items-center justify-between ml-1 mb-1">
            <Text className="text-white text-sm font-bold">Recent Activity</Text>
            <Text className="text-[#A855F7] text-[10px] font-bold uppercase tracking-wider">View All</Text>
          </View>
          
          <View className="space-y-3">
            {/* Item 1 */}
            <View className="bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-full bg-[#FACC15]/10 items-center justify-center border border-[#FACC15]/20">
                  <Clock size={16} color="#FACC15" />
                </View>
                <View>
                  <Text className="text-white font-bold text-xs">Payout Requested</Text>
                  <Text className="text-neutral-grey text-[9px] mt-0.5">Oct 24, 2023 • 02:30 PM</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white font-black text-sm">₹15,000.00</Text>
                <View className="bg-[#FACC15]/20 px-2 py-0.5 rounded-sm mt-1 border border-[#FACC15]/30">
                  <Text className="text-[#FACC15] text-[7px] font-bold uppercase tracking-widest">Verifying</Text>
                </View>
              </View>
            </View>

            {/* Item 2 */}
            <View className="bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-full bg-[#10B981]/10 items-center justify-center border border-[#10B981]/20">
                  <CheckCircle2 size={16} color="#10B981" />
                </View>
                <View>
                  <Text className="text-white font-bold text-xs">Bank Transfer</Text>
                  <Text className="text-neutral-grey text-[9px] mt-0.5">Oct 18, 2023 • 11:15 AM</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white font-black text-sm">₹8,420.00</Text>
                <View className="bg-[#10B981]/20 px-2 py-0.5 rounded-sm mt-1 border border-[#10B981]/30">
                  <Text className="text-[#10B981] text-[7px] font-bold uppercase tracking-widest">Completed</Text>
                </View>
              </View>
            </View>
            
            {/* Item 3 */}
            <View className="bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-full bg-[#10B981]/10 items-center justify-center border border-[#10B981]/20">
                  <CheckCircle2 size={16} color="#10B981" />
                </View>
                <View>
                  <Text className="text-white font-bold text-xs">Bank Transfer</Text>
                  <Text className="text-neutral-grey text-[9px] mt-0.5">Oct 18, 2023 • 11:15 AM</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white font-black text-sm">₹8,420.00</Text>
                <View className="bg-[#10B981]/20 px-2 py-0.5 rounded-sm mt-1 border border-[#10B981]/30">
                  <Text className="text-[#10B981] text-[7px] font-bold uppercase tracking-widest">Completed</Text>
                </View>
              </View>
            </View>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}
