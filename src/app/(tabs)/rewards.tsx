import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Eye, Gift, Users, Wallet, Plus, LineChart, TrendingUp, History, ArrowRight } from 'lucide-react-native';
import RechargeCoinsSheet from '../../components/RechargeCoinsSheet';
import { apiClient } from '../../api/client';

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
  const router = useRouter();
  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const [wallet, setWallet] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>('PENDING');
  const [localCoinsAdded, setLocalCoinsAdded] = useState(0);

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

  const handleWithdrawClick = () => {
    if (kycStatus === 'APPROVED' || kycStatus === 'COMPLETED') {
      router.push('/withdraw' as any);
    } else {
      router.push('/kyc' as any);
    }
  };

  const viewEarnings = wallet?.viewEarnings ?? 0;
  const giftEarnings = wallet?.giftEarnings ?? 0;
  const referralEarnings = wallet?.referralEarnings ?? 0;
  const coins = (wallet?.coins ?? 0) + localCoinsAdded;

  const totalEarnings = viewEarnings + giftEarnings + referralEarnings;
  const viewPercentage = totalEarnings > 0 ? Math.round((viewEarnings / totalEarnings) * 100) : 0;
  const giftPercentage = totalEarnings > 0 ? Math.round((giftEarnings / totalEarnings) * 100) : 0;
  const referralPercentage = totalEarnings > 0 ? Math.round((referralEarnings / totalEarnings) * 100) : 0;
  const transactions = wallet?.transactions || [];

  if (loading) {
    return (
      <View className="flex-1 bg-[#0D0518] items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0D0518] pt-14">
      {/* Header handled by Expo Router possibly, or we can add one */}
      <View className="px-4 pb-4">
        <Pressable
          onPress={handleWithdrawClick}
          className="bg-[#8B5CF6] w-full py-4 rounded-2xl flex-row justify-center items-center gap-2 active:scale-[0.98]"
        >
          <Text className="text-white font-bold text-lg">Withdraw Funds</Text>
          <ArrowRight size={20} color="white" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        {/* Earnings Breakdown */}
        <Text className="text-white font-bold text-lg mb-4">Earnings Breakdown</Text>

        <View className="gap-3 mb-6">
          {/* View Earnings */}
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row justify-between items-start">
            <View className="flex-row gap-4">
              <View className="bg-[#8B5CF6]/10 w-12 h-12 rounded-full items-center justify-center border border-[#8B5CF6]/20">
                <Eye size={24} color="#8B5CF6" />
              </View>
              <View>
                <Text className="text-white font-bold text-base">View Earnings</Text>
                <Text className="text-white/50 text-xs mt-1">₹5 per 1,000 views</Text>
                <View className="mt-3 w-40 h-1 bg-[#3E2B5C] rounded-full overflow-hidden">
                  <View style={{ width: `${viewPercentage}%` }} className="h-full bg-[#8B5CF6] rounded-full" />
                </View>
                <Text className="text-white/40 text-xs mt-2">{viewPercentage}% of earnings</Text>
              </View>
            </View>
            <Text className="text-[#10B981] font-bold text-lg">₹{viewEarnings.toFixed(2)}</Text>
          </View>

          {/* Gifts & Tips */}
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row justify-between items-start">
            <View className="flex-row gap-4">
              <View className="bg-[#F59E0B]/10 w-12 h-12 rounded-full items-center justify-center border border-[#F59E0B]/20">
                <Gift size={24} color="#FBBF24" />
              </View>
              <View>
                <Text className="text-white font-bold text-base">Gifts & Tips</Text>
                <Text className="text-white/50 text-xs mt-1">Virtual gifts from fans</Text>
                <View className="mt-3 w-40 h-1 bg-[#3E2B5C] rounded-full overflow-hidden">
                  <View style={{ width: `${giftPercentage}%` }} className="h-full bg-[#FBBF24] rounded-full" />
                </View>
                <Text className="text-white/40 text-xs mt-2">{giftPercentage}% of earnings</Text>
              </View>
            </View>
            <Text className="text-[#10B981] font-bold text-lg">₹{giftEarnings.toFixed(2)}</Text>
          </View>

          {/* Referrals */}
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row justify-between items-start">
            <View className="flex-row gap-4">
              <View className="bg-[#3B82F6]/10 w-12 h-12 rounded-full items-center justify-center border border-[#3B82F6]/20">
                <Users size={24} color="#60A5FA" />
              </View>
              <View>
                <Text className="text-white font-bold text-base">Referrals</Text>
                <Text className="text-white/50 text-xs mt-1">From your network</Text>
                <View className="mt-3 w-40 h-1 bg-[#3E2B5C] rounded-full overflow-hidden">
                  <View style={{ width: `${referralPercentage}%` }} className="h-full bg-[#60A5FA] rounded-full" />
                </View>
                <Text className="text-white/40 text-xs mt-2">{referralPercentage}% of earnings</Text>
              </View>
            </View>
            <Text className="text-[#10B981] font-bold text-lg">₹{referralEarnings.toFixed(2)}</Text>
          </View>
        </View>

        {/* Coin Wallet */}
        <Text className="text-white font-bold text-lg mb-4">Coin Wallet</Text>
        <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-3">
            <View className="bg-[#F59E0B]/20 w-10 h-10 rounded-full items-center justify-center">
              <Wallet size={20} color="#FBBF24" />
            </View>
            <View>
              <Text className="text-[#FBBF24] font-bold text-lg">{coins.toLocaleString()} Coins</Text>
              <Text className="text-white/50 text-xs max-w-[150px]">Use coins to gift your favourite creators</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setRechargeVisible(true)}
            className="bg-[#FBBF24] px-4 py-2.5 rounded-xl flex-row items-center gap-1 active:opacity-80"
          >
            <Plus size={16} color="black" />
            <Text className="text-black font-bold text-sm">Recharge</Text>
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mb-8">
          <Pressable
            onPress={() => router.push('/analytics' as any)}
            className="flex-1 bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row justify-center items-center gap-2 active:opacity-80"
          >
            <LineChart size={20} color="#A855F7" />
            <Text className="text-white font-bold">Analytics</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/referrals' as any)}
            className="flex-1 bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row justify-center items-center gap-2 active:opacity-80"
          >
            <Gift size={20} color="#F87171" />
            <Text className="text-white font-bold">Referrals</Text>
          </Pressable>
        </View>

        {/* Transaction History */}
        <Text className="text-white font-bold text-lg mb-4">Transaction History</Text>
        {transactions.length > 0 ? (
          <View className="gap-3">
            {transactions.map((tx: any) => (
              <View key={tx.id} className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${tx.type === 'WITHDRAWAL' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    <History size={20} color={tx.type === 'WITHDRAWAL' ? '#EF4444' : '#10B981'} />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-base">{tx.type.replace(/_/g, ' ')}</Text>
                    <Text className="text-white/50 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className={`font-bold text-lg ${tx.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.type === 'WITHDRAWAL' ? '-' : '+'}{tx.currency === 'INR' ? '₹' : ''}{tx.amount}
                  </Text>
                  <Text className="text-white/50 text-xs">{tx.status}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-8">
            <History size={32} color="#3E2B5C" className="mb-2" />
            <Text className="text-white/40 text-sm">No recent transactions</Text>
          </View>
        )}

      </ScrollView>
      <RechargeCoinsSheet
        visible={rechargeVisible}
        onClose={() => setRechargeVisible(false)}
        onSuccess={(addedCoins) => {
          setLocalCoinsAdded(prev => prev + addedCoins);
        }}
      />
    </View>
  );
}
