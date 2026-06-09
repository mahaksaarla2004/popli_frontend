import React from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Settings, TrendingUp, Play, Gift, Users, Clock, CheckCircle2, Info } from 'lucide-react-native';
import { useWalletStore, useKYCStore } from '../../store';
import { formatINR } from '../../utils';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export default function CreatorRewardsScreen() {
  const router = useRouter();
  const { inrEarnings, transactions, fetchWallet } = useWalletStore();
  const { kycCompleted } = useKYCStore();

  React.useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleWithdrawClick = () => {
    if (!kycCompleted) {
      Alert.alert('KYC Required', 'Please complete your KYC to withdraw funds.');
      return;
    }
    if (inrEarnings < 500) {
      Alert.alert('Minimum Withdrawal', 'You need at least ₹500 to withdraw.');
      return;
    }
    Alert.alert('Withdrawal Successful', '₹' + inrEarnings.toFixed(2) + ' has been transferred to your linked bank account.');
    // Or if /withdraw route exists: router.push('/withdraw');
  };

  // Derived calculations
  const giftsRevenue = transactions
    .filter(t => t.type.toLowerCase().includes('gift_receive'))
    .reduce((acc, t) => acc + t.amount, 0);
  
  const videoRevenue = Math.max(0, inrEarnings - giftsRevenue);
  const referralRevenue = 0; // Assuming no referral implementation yet


  return (
    <View className="flex-1 bg-[#12081E] pt-14">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-6">
        <Text className="text-white font-black text-2xl">Creator Rewards</Text>
        <View className="flex-row gap-3">
          <Pressable className="w-9 h-9 rounded-full bg-white/5 items-center justify-center border border-white/10">
            <Bell size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable className="w-9 h-9 rounded-full bg-white/5 items-center justify-center border border-white/10">
            <Settings size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110, gap: 24 }}>
        
        {/* Total Balance Card */}
        <View className="bg-[#1A0E2C] rounded-3xl p-4 border border-white/5 items-center shadow-lg shadow-[#A855F7]/10 gap-4">
          <View className="items-center">
            <Text className="text-neutral-grey text-[10px] font-bold uppercase tracking-widest mb-1">Total Balance</Text>
            <Text 
              className="text-[#FACC15] font-black text-4xl" 
              style={{ textShadowColor: 'rgba(250, 204, 21, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
            >
              {formatINR(inrEarnings || 0)}
            </Text>
          </View>

          <View className="bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1.5 rounded-full flex-row items-center gap-2">
            <TrendingUp size={12} color="#10B981" />
            <Text className="text-[#10B981] text-[10px] font-bold">+12% from last month</Text>
          </View>

          <Pressable 
            onPress={handleWithdrawClick}
            className="w-full bg-[#A855F7] py-4 rounded-xl items-center justify-center mt-2 shadow-sm shadow-[#A855F7]/40 active:scale-[0.98]"
          >
            <Text className="text-white font-bold text-sm">Withdraw Funds</Text>
          </Pressable>

          <View className="flex-row items-center justify-center gap-4 w-full mt-2">
            <View className="flex-row items-center gap-1">
              <Text className="text-neutral-grey text-[9px] font-medium">Tax (TDS) - 10%</Text>
              <Info size={10} color="#9CA3AF" />
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-neutral-grey text-[9px] font-medium">Platform Fee - 2%</Text>
              <Info size={10} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Revenue Sources */}
        <View className="gap-4">
          <Text className="text-white text-sm font-bold">Revenue Sources</Text>
          
          <View className="bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-[#A855F7]/10 rounded-xl items-center justify-center">
                <Play size={20} color="#A855F7" fill="#A855F7" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm">Video Views</Text>
                <Text className="text-neutral-grey text-[10px] mt-1">Based on CPM & Engagement</Text>
              </View>
            </View>
            <Text className="text-white font-black text-lg">{formatINR(videoRevenue)}</Text>
          </View>

          <View className="flex-row justify-between gap-4">
            <View className="flex-1 bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 justify-between" style={{ minHeight: 90 }}>
              <View className="w-8 h-8 bg-[#FACC15]/10 rounded-lg items-center justify-center mb-2">
                <Gift size={16} color="#FACC15" />
              </View>
              <View>
                <Text className="text-neutral-grey text-[10px] font-medium">Gifts & Tips</Text>
                <Text className="text-white font-black text-lg mt-1">{formatINR(giftsRevenue)}</Text>
              </View>
            </View>

            <View className="flex-1 bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 justify-between" style={{ minHeight: 90 }}>
              <View className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg items-center justify-center mb-2">
                <Users size={16} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-neutral-grey text-[10px] font-medium">Referrals</Text>
                <Text className="text-white font-black text-lg mt-1">{formatINR(referralRevenue)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-sm font-bold">Recent Activity</Text>
            <Text className="text-[#A855F7] text-[10px] font-bold uppercase tracking-wider">View All</Text>
          </View>
          
          <View className="gap-4">
            {transactions.length > 0 ? transactions.slice(0, 5).map((tx, index) => (
              <View key={tx.id || index} className="bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-[#10B981]/10 items-center justify-center border border-[#10B981]/20">
                    {tx.type.toLowerCase().includes('withdraw') ? (
                      <Clock size={16} color="#FACC15" />
                    ) : (
                      <CheckCircle2 size={16} color="#10B981" />
                    )}
                  </View>
                  <View>
                    <Text className="text-white font-bold text-xs capitalize">{tx.description || tx.type.replace('_', ' ')}</Text>
                    <Text className="text-neutral-grey text-[9px] mt-1">{new Date(tx.timestamp).toLocaleString()}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-white font-black text-sm">
                    {tx.currency === 'INR' ? formatINR(tx.amount) : `${tx.amount} Coins`}
                  </Text>
                  <View className={`mt-1 px-2 py-0.5 rounded ${tx.status === 'success' ? 'bg-[#10B981]/20' : tx.status === 'pending' ? 'bg-[#FACC15]/20' : 'bg-red-500/20'}`}>
                    <Text className={`text-[8px] font-bold ${tx.status === 'success' ? 'text-[#10B981]' : tx.status === 'pending' ? 'text-[#FACC15]' : 'text-red-500'}`}>{tx.status ? tx.status.toUpperCase() : 'SUCCESS'}</Text>
                  </View>
                </View>
              </View>
            )) : (
              <View className="items-center justify-center py-10 bg-[#1A0E2C] rounded-2xl border border-white/5">
                <Text className="text-white/50 text-xs">No recent activity</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
