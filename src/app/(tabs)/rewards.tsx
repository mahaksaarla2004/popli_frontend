import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Eye, Gift, Users, ChevronRight, TrendingUp, UserRound, ArrowRight, Activity, LineChart, Banknote } from 'lucide-react-native';
import RechargeCoinsSheet from '../../components/RechargeCoinsSheet';
import { apiClient } from '../../api/client';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { useAuthStore } from '../../store';

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
  const router = useRouter();
  const user = useAuthStore(state => state.userProfile);
  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const [wallet, setWallet] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>('PENDING');

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const [walletRes, kycRes] = await Promise.all([
            apiClient.get('/wallet'),
            apiClient.get('/kyc/status')
          ]);
          setWallet(walletRes.data);
          setKycStatus(kycRes.data?.status || 'PENDING');
        } catch (error) {
          console.error('Failed to fetch rewards data', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const viewEarnings = wallet?.viewEarnings ?? 0;
  const giftEarnings = wallet?.giftEarnings ?? 0;
  const referralEarnings = wallet?.referralEarnings ?? 0;
  const totalEarnings = wallet?.totalEarnings ?? 0;
  const coins = wallet?.coinBalance ?? wallet?.coins ?? 0;
  
  // Combine ledgers and transactions for history
  const historyItems = [
    ...(wallet?.ledgers || []).map((l: any) => {
      const isDebit = l.debit > 0;
      const amountVal = Math.abs(isDebit ? l.debit : l.credit).toFixed(2);
      return {
        id: l.id,
        title: l.source === 'WITHDRAWAL' ? 'Withdrawal' : l.source === 'GIFT_RECEIVED' ? 'Gift Received' : l.description || l.source.replace('_', ' '),
        amount: isDebit ? `-₹${amountVal}` : `+₹${amountVal}`,
        isNegative: isDebit,
        date: new Date(l.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: 'LEDGER',
        icon: <Gift size={20} color="#FBBF24" />
      };
    }),
    ...(wallet?.transactions || []).map((t: any) => {
      const isEarning = t.type === 'AD_REVENUE' || t.type === 'GIFT_RECEIVE' || t.type === 'REFERRAL_BONUS' || t.type === 'CHALLENGE_REWARD';
      let amountStr = '';
      if (t.type === 'COIN_RECHARGE') {
         amountStr = `-₹${(t.amount / 10).toFixed(0)}`;
      } else if (isEarning) {
         amountStr = `+${Math.abs(t.amount)} coins`;
      } else {
         amountStr = `-${Math.abs(t.amount)} coins`;
      }
      return {
        id: t.id,
        title: t.type === 'COIN_RECHARGE' ? `Coin Recharge • ${t.amount} coins` 
          : t.type === 'GIFT_SEND' ? (t.description || 'Gift Sent') 
          : t.type === 'AD_REVENUE' ? (t.description || 'Watch Reward')
          : t.type === 'REFERRAL_BONUS' ? 'Referral Bonus'
          : t.type === 'CHALLENGE_REWARD' ? 'Challenge Reward'
          : t.type === 'GIFT_RECEIVE' ? 'Gift Received'
          : t.type.replace(/_/g, ' '),
        amount: amountStr,
        isNegative: !isEarning,
        date: new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: t.status === 'SUCCESS' ? 'Completed' : t.status,
        type: 'TRANSACTION',
        icon: <Banknote size={20} color="#FBBF24" />
      };
    })
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);

  const handleWithdrawClick = () => {
    router.push('/withdraw' as any);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#12081E] items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <SafeScreen edgeToEdgeBottom className="bg-[#12081E] flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <Text className="text-white font-black text-2xl tracking-tight">Creator Rewards</Text>
        <Pressable onPress={() => router.push('/profile')} className="p-2">
          <UserRound size={24} color="white" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-5">
          
          {/* TOTAL BALANCE CARD */}
          <View className="bg-[#1D1037] rounded-[24px] p-6 mb-8 border border-[#3E2B5C] shadow-lg">
            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Total Balance</Text>
            <Text className="text-[#FBBF24] font-black text-5xl mb-3 tracking-tighter">₹{totalEarnings.toFixed(0)}</Text>
            
            <View className="bg-green-900/30 self-start px-3 py-1.5 rounded-full flex-row items-center gap-1.5 mb-6 border border-green-500/20">
              <TrendingUp size={14} color="#4ade80" />
              <Text className="text-green-400 font-bold text-xs">+0% from last month</Text>
            </View>

            <View className="flex-row items-center justify-center mb-6">
              <View className="items-center px-6">
                <Text className="text-gray-400 font-medium text-xs mb-1">Tax (TDS)</Text>
                <Text className="text-white font-bold text-lg">10%</Text>
              </View>
              <View className="w-[1px] h-8 bg-[#3E2B5C]" />
              <View className="items-center px-6">
                <Text className="text-gray-400 font-medium text-xs mb-1">Platform Fee</Text>
                <Text className="text-white font-bold text-lg">2%</Text>
              </View>
            </View>

            <Pressable 
              onPress={handleWithdrawClick}
              className="bg-[#7C3AED] py-4 rounded-2xl flex-row justify-center items-center active:scale-95"
            >
              <Text className="text-white font-bold text-base mr-2">Withdraw Funds</Text>
              <ArrowRight size={18} color="white" />
            </Pressable>
          </View>

          {/* EARNINGS BREAKDOWN */}
          <Text className="text-white font-black text-lg mb-4">Earnings Breakdown</Text>
          
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 mb-4 flex-row items-center shadow-lg">
            <View className="w-12 h-12 rounded-full bg-[#2D1B4E] items-center justify-center mr-4">
              <Eye size={24} color="#A855F7" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-white font-bold text-sm">View Earnings</Text>
                <Text className="text-green-400 font-bold text-sm">₹{viewEarnings.toFixed(2)}</Text>
              </View>
              <Text className="text-gray-400 text-xs mb-2">₹5 per 1,000 views</Text>
              <View className="h-1.5 bg-[#2D1B4E] rounded-full w-full overflow-hidden">
                <View className="h-full bg-purple-500 rounded-full" style={{ width: `${totalEarnings > 0 ? (viewEarnings/totalEarnings)*100 : 0}%` }} />
              </View>
              <Text className="text-gray-400 text-[10px] mt-1.5">{totalEarnings > 0 ? ((viewEarnings/totalEarnings)*100).toFixed(0) : 0}% of earnings</Text>
            </View>
          </View>

          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 mb-4 flex-row items-center shadow-lg">
            <View className="w-12 h-12 rounded-full bg-yellow-900/30 items-center justify-center mr-4">
              <Gift size={24} color="#FBBF24" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-white font-bold text-sm">Gifts & Tips</Text>
                <Text className="text-green-400 font-bold text-sm">₹{giftEarnings.toFixed(2)}</Text>
              </View>
              <Text className="text-gray-400 text-xs mb-2">Virtual gifts from fans</Text>
              <View className="h-1.5 bg-[#2D1B4E] rounded-full w-full overflow-hidden">
                 <View className="h-full bg-yellow-400 rounded-full" style={{ width: `${totalEarnings > 0 ? (giftEarnings/totalEarnings)*100 : 0}%` }} />
              </View>
              <Text className="text-gray-400 text-[10px] mt-1.5">{totalEarnings > 0 ? ((giftEarnings/totalEarnings)*100).toFixed(0) : 0}% of earnings</Text>
            </View>
          </View>

          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 mb-8 flex-row items-center shadow-lg">
            <View className="w-12 h-12 rounded-full bg-teal-900/30 items-center justify-center mr-4">
              <Users size={24} color="#2DD4BF" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-white font-bold text-sm">Referrals</Text>
                <Text className="text-green-400 font-bold text-sm">₹{referralEarnings.toFixed(2)}</Text>
              </View>
              <Text className="text-gray-400 text-xs mb-2">From your network</Text>
              <View className="h-1.5 bg-[#2D1B4E] rounded-full w-full overflow-hidden">
                 <View className="h-full bg-teal-500 rounded-full" style={{ width: `${totalEarnings > 0 ? (referralEarnings/totalEarnings)*100 : 0}%` }} />
              </View>
              <Text className="text-gray-400 text-[10px] mt-1.5">{totalEarnings > 0 ? ((referralEarnings/totalEarnings)*100).toFixed(0) : 0}% of earnings</Text>
            </View>
          </View>

          {/* COIN WALLET */}
          <Text className="text-white font-black text-lg mb-4">Coin Wallet</Text>
          
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-5 mb-4 flex-row items-center justify-between shadow-lg">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-yellow-900/30 items-center justify-center mr-3 border border-yellow-700/30">
                <Banknote size={24} color="#FBBF24" />
              </View>
              <View>
                <Text className="text-[#FBBF24] font-black text-xl">{coins.toLocaleString()} Coins</Text>
                <Text className="text-gray-400 text-xs mt-0.5 max-w-[150px]">Use coins to gift your favourite creators</Text>
              </View>
            </View>
            <Pressable 
              onPress={() => setRechargeVisible(true)}
              className="bg-[#FBBF24] px-4 py-2.5 rounded-xl active:scale-95"
            >
              <Text className="text-gray-900 font-bold text-sm">+ Recharge</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-4 mb-8">
            <Pressable 
              onPress={() => router.push('/analytics')}
              className="flex-1 bg-[#1D1037] border border-[#3E2B5C] rounded-xl py-4 flex-row items-center justify-center shadow-lg active:scale-95"
            >
              <LineChart size={18} color="#A855F7" />
              <Text className="text-white font-bold ml-2">Analytics</Text>
            </Pressable>
            <Pressable 
              onPress={() => router.push('/referrals')}
              className="flex-1 bg-[#1D1037] border border-[#3E2B5C] rounded-xl py-4 flex-row items-center justify-center shadow-lg active:scale-95"
            >
              <Gift size={18} color="#EF4444" />
              <Text className="text-white font-bold ml-2">Referrals</Text>
            </Pressable>
          </View>

          {/* TRANSACTION HISTORY */}
          <View className="flex-row justify-between items-center mb-4">
             <Text className="text-white font-black text-lg">Transaction History</Text>
             <Text className="text-gray-400 text-xs">{historyItems.length} transactions</Text>
          </View>

          <View className="gap-3">
            {historyItems.length > 0 ? historyItems.map((item: any, i: number) => (
              <View key={i} className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row justify-between items-center shadow-lg">
                <View className="flex-row items-center flex-1 pr-4">
                   <View className="w-10 h-10 rounded-full bg-[#2D1B4E] items-center justify-center mr-3 shrink-0">
                     {item.icon}
                   </View>
                   <View className="flex-1">
                     <Text className="text-white font-bold text-sm mb-0.5" numberOfLines={2}>{item.title}</Text>
                     <Text className="text-gray-400 text-[10px]">{item.date}</Text>
                   </View>
                </View>
                <View className="items-end shrink-0">
                   <Text className="text-white font-black text-sm">{item.amount}</Text>
                   {item.status && (
                     <Text className="text-yellow-500 font-bold text-[10px] mt-0.5 capitalize">{item.status}</Text>
                   )}
                </View>
              </View>
            )) : (
              <Text className="text-center text-gray-400 mt-4">No transactions found</Text>
            )}
          </View>

        </View>
      </ScrollView>

      <RechargeCoinsSheet
        visible={rechargeVisible}
        onClose={() => setRechargeVisible(false)}
        onSuccess={(added) => {
           setWallet((prev: any) => ({ ...prev, coinBalance: (prev?.coinBalance || 0) + added }));
           setRechargeVisible(false);
        }}
      />
    </SafeScreen>
  );
}
