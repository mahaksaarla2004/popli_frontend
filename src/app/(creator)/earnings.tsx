import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, TrendingUp, PieChart, Download } from 'lucide-react-native';

export default function EarningsHistoryScreen() {
  const router = useRouter();

  const HistoryRow = ({ date, amount, source }: any) => (
    <View className="flex-row items-center justify-between border-b border-white/5 py-4">
      <View>
        <Text className="text-white font-bold text-sm">{source}</Text>
        <Text className="text-neutral-grey text-[10px] mt-1">{date}</Text>
      </View>
      <Text className="text-[#10B981] font-bold text-base">+{amount}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#12081E] pt-14">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-6 border-b border-white/5">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <Text className="text-white font-bold text-base ml-2">Earnings History</Text>
        </View>
        <Pressable className="bg-[#3B82F6]/20 p-2 rounded-full border border-[#3B82F6]/30">
          <Download size={16} color="#3B82F6" />
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ gap: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-[#1A0E2C] border border-white/5 rounded-3xl p-6 gap-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-neutral-grey text-xs font-medium">Last 30 Days</Text>
              <Text className="text-white text-3xl font-black mt-1">$0.00</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-[#3B82F6]/10 items-center justify-center border border-[#3B82F6]/20">
              <TrendingUp size={24} color="#3B82F6" />
            </View>
          </View>
          
          <View className="flex-row gap-4 border-t border-white/5 pt-4">
            <View className="flex-1">
              <Text className="text-neutral-grey text-[10px] uppercase">Ads</Text>
              <Text className="text-white font-bold mt-1">$0.00</Text>
            </View>
            <View className="flex-1 border-l border-white/5 pl-4">
              <Text className="text-neutral-grey text-[10px] uppercase">Gifts</Text>
              <Text className="text-white font-bold mt-1">$0.00</Text>
            </View>
            <View className="flex-1 border-l border-white/5 pl-4">
              <Text className="text-neutral-grey text-[10px] uppercase">Subs</Text>
              <Text className="text-white font-bold mt-1">$0.00</Text>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Recent Transactions</Text>
          <View className="bg-[#1A0E2C] border border-white/5 rounded-3xl px-4">
            {/* Empty State */}
            <View className="py-12 items-center justify-center opacity-50">
              <Calendar size={32} color="#9CA3AF" />
              <Text className="text-white font-medium mt-4">No earnings yet</Text>
              <Text className="text-neutral-grey text-xs mt-2 text-center px-8">
                When you start earning from your content, your transaction history will appear here.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
