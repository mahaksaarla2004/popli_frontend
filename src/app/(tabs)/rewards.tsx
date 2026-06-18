import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator, TextInputPlatform, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Landmark, Coins, Clock, CheckCircle2, History } from 'lucide-react-native';
import RechargeCoinsSheet from '../../components/RechargeCoinsSheet';
import { apiClient } from '../../api/client';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
  const router = useRouter();
  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const [wallet, setWallet] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>('PENDING');
  const [localCoinsAdded, setLocalCoinsAdded] = useState(0);

  const [activeTab, setActiveTab] = useState<'ALL' | 'VIEW' | 'GIFT'>('ALL');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

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

  const viewEarnings = wallet?.inrEarnings ?? 0;
  const giftEarnings = wallet?.totalEarnings ?? 0; // Using totalEarnings to aggregate
  const totalEarnings = wallet?.totalEarnings ?? 0;
  
  const pendingValidation = wallet?.pendingBalance ?? 0;
  const withdrawable = wallet?.withdrawableBalance ?? 0;
  
  const coins = (wallet?.coins ?? 0) + localCoinsAdded;
  const transactions = wallet?.transactions || [];

  const handleWithdrawClick = async () => {
    if (kycStatus !== 'APPROVED' && kycStatus !== 'COMPLETED') {
      router.push('/kyc' as any);
      return;
    }
    // Alternatively, send them to detailed withdraw page if they just click a button
    router.push('/withdraw' as any);
  };

  const submitWithdrawRequest = async () => {
    if (!upiId || !amount) {
      Alert.alert('Error', 'Please enter UPI ID and Amount');
      return;
    }
    const amt = parseFloat(amount);
    if (amt < 500) {
      Alert.alert('Error', 'Minimum withdrawal is ₹500');
      return;
    }
    if (amt > withdrawable) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      setWithdrawing(true);
      await apiClient.post('/wallet/withdraw', { amount: amt, upiId });
      Alert.alert('Success', 'Withdrawal requested successfully!');
      setAmount('');
      setUpiId('');
      // Refresh wallet
      const res = await apiClient.get('/wallet');
      setWallet(res.data);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to withdraw');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#12081E] items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-[#12081E]">
      <ScrollView className="flex-1 pt-14" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER */}
        <View className="flex-row items-center justify-center px-4 mb-6 relative">
          <Pressable onPress={() => router.back()} className="absolute left-4 p-2 -ml-2 z-10">
            <ChevronLeft color="white" size={28} />
          </Pressable>
          <Text className="text-white font-bold text-lg">Creator Rewards</Text>
        </View>

        {/* HUGE BALANCE */}
        <View className="items-center mb-6">
          <Text className="text-white font-black text-5xl">₹{totalEarnings.toFixed(2)}</Text>
        </View>

        <View className="px-4">
          {/* TOP CARD */}
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-5 mb-6 shadow-lg flex-row justify-between">
            <View className="flex-1 border-r border-[#3E2B5C] pr-4">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Clock size={12} color="#FBBF24" />
                <Text className="text-white/60 font-bold text-[10px] uppercase tracking-wider">Pending Validation</Text>
              </View>
              <Text className="text-[#FBBF24] font-bold text-xl">₹{pendingValidation.toFixed(2)}</Text>
            </View>
            <View className="flex-1 pl-4">
               <View className="flex-row items-center gap-1.5 mb-1">
                <CheckCircle2 size={12} color="#10B981" />
                <Text className="text-white/60 font-bold text-[10px] uppercase tracking-wider">Withdrawable</Text>
              </View>
              <Text className="text-[#10B981] font-bold text-xl">₹{withdrawable.toFixed(2)}</Text>
            </View>
          </View>

          {/* REQUEST CASH WITHDRAWAL CARD */}
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-5 mb-6">
            <View className="flex-row items-center gap-2 mb-6">
              <Landmark size={20} color="#A855F7" />
              <Text className="text-white font-bold text-base">Request Cash Withdrawal</Text>
            </View>

            <View className="gap-5">
              <View>
                <Text className="text-white/60 font-bold text-[11px] mb-2 uppercase tracking-wide">Withdrawal Amount (Min ₹500)</Text>
                <View className="bg-[#12081E] border border-[#3E2B5C] rounded-xl h-14 justify-center px-4">
                  <TextInput 
                    value={amount}
                    onChangeText={setAmount}
                    placeholder={`Max available: ₹${withdrawable.toFixed(0)}`}
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    keyboardType="numeric"
                    className="text-white text-base w-full h-full"
                  />
                </View>
              </View>

              <View>
                <Text className="text-white/60 font-bold text-[11px] mb-2 uppercase tracking-wide">Recipient UPI ID</Text>
                <View className="bg-[#12081E] border border-[#3E2B5C] rounded-xl h-14 justify-center px-4">
                  <TextInput 
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder="username@bank"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    className="text-white text-base w-full h-full"
                  />
                </View>
              </View>

              <Pressable 
                onPress={submitWithdrawRequest}
                disabled={withdrawing}
                className="bg-[#A855F7] h-14 rounded-xl items-center justify-center mt-2 active:scale-[0.98]"
              >
                {withdrawing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-sm uppercase tracking-wider">Submit Request</Text>
                )}
              </Pressable>
            </View>
          </View>


          {/* LEDGER & HISTORY */}
          <View className="flex-row items-center gap-2 mb-4">
            <History size={18} color="white" />
            <Text className="text-white font-bold text-sm uppercase tracking-wider">Ledger & History</Text>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 mb-6">
            <Pressable 
              onPress={() => setActiveTab('ALL')}
              className={`flex-1 items-center justify-center py-3 rounded-xl border ${activeTab === 'ALL' ? 'bg-[#A855F7]/20 border-[#A855F7]' : 'bg-[#1D1037] border-[#3E2B5C]'}`}
            >
              <Text className={`font-bold text-[11px] ${activeTab === 'ALL' ? 'text-white' : 'text-white/60'}`}>ALL TRANSACTIONS</Text>
            </Pressable>
            <Pressable 
              onPress={() => setActiveTab('VIEW')}
              className={`flex-1 items-center justify-center py-3 rounded-xl border ${activeTab === 'VIEW' ? 'bg-[#A855F7]/20 border-[#A855F7]' : 'bg-[#1D1037] border-[#3E2B5C]'}`}
            >
              <Text className={`font-bold text-[11px] ${activeTab === 'VIEW' ? 'text-white' : 'text-white/60'}`}>VIEW EARNINGS</Text>
            </Pressable>
            <Pressable 
              onPress={() => setActiveTab('GIFT')}
              className={`flex-1 items-center justify-center py-3 rounded-xl border ${activeTab === 'GIFT' ? 'bg-[#A855F7]/20 border-[#A855F7]' : 'bg-[#1D1037] border-[#3E2B5C]'}`}
            >
              <Text className={`font-bold text-[11px] ${activeTab === 'GIFT' ? 'text-white' : 'text-white/60'}`}>GIFT EARNINGS</Text>
            </Pressable>
          </View>

          {/* Transactions Area */}
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-8 items-center justify-center mb-8 border-dashed">
             <Text className="text-white/40 text-sm font-medium">No transactions found.</Text>
          </View>

        </View>
      </ScrollView>

      <RechargeCoinsSheet
        visible={rechargeVisible}
        onClose={() => setRechargeVisible(false)}
        onSuccess={(addedCoins) => {
          setLocalCoinsAdded(prev => prev + addedCoins);
        }}
      />
    </KeyboardAvoidingView>
  );
}
