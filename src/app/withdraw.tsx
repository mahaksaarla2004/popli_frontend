import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, TextInput, ActivityIndicator, Animated, PanResponder, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Building2, Smartphone, Check, ChevronRight, Clock, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { apiClient } from '../api/client';

const { width } = Dimensions.get('window');

export default function WithdrawScreen() {
  const router = useRouter();
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const [pan] = useState(() => new Animated.ValueXY());
  const maxSwipe = width - 32 - 40 - 16; // container width minus padding and button size

  const availableBalance = (wallet?.viewEarnings ?? 0) + (wallet?.giftEarnings ?? 0) + (wallet?.referralEarnings ?? 0);

  const handleWithdrawSubmit = async () => {
    if (!upiId || !amount) {
      Alert.alert('Error', 'Please enter UPI ID and Amount');
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      return;
    }
    const amt = parseFloat(amount);
    if (amt < 500) {
      Alert.alert('Error', 'Minimum withdrawal is ₹500');
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      return;
    }
    if (amt > availableBalance) {
      Alert.alert('Error', 'Insufficient balance');
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      return;
    }

    try {
      setWithdrawing(true);
      await apiClient.post('/wallet/withdraw', { amount: amt, upiId });
      Alert.alert('Success', 'Withdrawal requested successfully!');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to withdraw');
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    } finally {
      setWithdrawing(false);
    }
  };

  const panResponder = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx < maxSwipe) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > maxSwipe * 0.8) {
          Animated.spring(pan, { toValue: { x: maxSwipe, y: 0 }, useNativeDriver: false }).start();
          handleWithdrawSubmit();
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  )[0];

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await apiClient.get('/wallet');
        setWallet(res.data);
      } catch (error) {
        console.error('Failed to fetch wallet', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);
  
  if (loading) {
    return (
      <View className="flex-1 bg-[#0D0518] items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0D0518] pt-14">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-4">
        <Pressable onPress={() => router.back()} className="mr-4 active:opacity-70 p-2 -ml-2">
          <ChevronLeft color="white" size={28} />
        </Pressable>
        <Text className="text-white font-bold text-xl">Withdraw Funds</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <View className="bg-gradient-to-r from-[#A855F7] to-[#8B5CF6] rounded-[24px] p-6 mb-6">
           <Text className="text-white/80 text-sm mb-2">Total Balance</Text>
           <Text className="text-white font-black text-5xl mb-4">₹{availableBalance.toFixed(2)}</Text>
           <Text className="text-white/70 text-xs">Gifts & Tips + View Earnings · minimum ₹500</Text>
        </View>

        <Text className="text-white font-bold text-lg mb-4">Select Withdrawal Method</Text>

        {/* Methods */}
        <View className="flex-row gap-4 mb-6">
          <Pressable 
            onPress={() => setMethod('upi')}
            className={`flex-1 rounded-2xl p-6 border ${method === 'upi' ? 'border-[#A855F7] bg-[#1D1037]' : 'border-[#3E2B5C] bg-[#1D1037]'} items-center justify-center relative`}
          >
            {method === 'upi' && (
              <View className="absolute top-3 right-3 bg-[#A855F7] rounded-full p-0.5">
                <Check size={14} color="white" />
              </View>
            )}
            <View className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 items-center justify-center mb-3">
               <Smartphone size={24} color="#A855F7" />
            </View>
            <Text className={`font-bold mb-1 ${method === 'upi' ? 'text-white' : 'text-gray-400'}`}>UPI</Text>
            <Text className="text-gray-500 text-xs">Instant transfer</Text>
          </Pressable>

          <Pressable 
            onPress={() => setMethod('bank')}
            className={`flex-1 rounded-2xl p-6 border ${method === 'bank' ? 'border-[#A855F7] bg-[#1D1037]' : 'border-[#3E2B5C] bg-[#1D1037]'} items-center justify-center relative`}
          >
            {method === 'bank' && (
              <View className="absolute top-3 right-3 bg-[#A855F7] rounded-full p-0.5">
                <Check size={14} color="white" />
              </View>
            )}
            <View className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 items-center justify-center mb-3">
              <Building2 size={24} color="#A855F7" />
            </View>
            <Text className={`font-bold mb-1 ${method === 'bank' ? 'text-white' : 'text-gray-400'}`}>Bank Transfer</Text>
            <Text className="text-gray-500 text-xs">2-24 hours</Text>
          </Pressable>
        </View>

        {/* Form */}
        <View className="gap-4 mb-8">
          <View>
            <Text className="text-white/80 font-bold mb-2">UPI ID</Text>
            <TextInput 
              value={upiId}
              onChangeText={setUpiId}
              placeholder="e.g. yourname@upi"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              className="bg-[#1D1037] border border-[#3E2B5C] rounded-xl px-4 h-14 text-white"
            />
          </View>

          <View>
            <Text className="text-white/80 font-bold mb-2">Enter Amount</Text>
            <View className="flex-row items-center bg-[#1D1037] border border-[#3E2B5C] rounded-xl px-4 h-14">
              <Text className="text-white text-lg mr-2 font-bold">₹</Text>
              <TextInput 
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="numeric"
                className="flex-1 text-white text-lg"
              />
              <Pressable onPress={() => setAmount(availableBalance.toString())} className="bg-[#3E2B5C] px-3 py-1.5 rounded-lg">
                <Text className="text-[#A855F7] font-bold text-xs">MAX</Text>
              </Pressable>
            </View>
            <Text className="text-white/50 text-xs mt-2">Available: ₹{availableBalance.toFixed(2)}</Text>
          </View>
        </View>

        {/* Swipe Button */}
        <View className="bg-[#8B5CF6] h-14 rounded-full flex-row items-center px-2 mb-10 overflow-hidden relative">
          <Text className="text-white font-bold text-lg absolute w-full text-center z-0">
            {withdrawing ? 'Processing...' : 'Swipe to Withdraw'}
          </Text>
          <Animated.View 
            {...panResponder.panHandlers}
            style={{ transform: [{ translateX: pan.x }] }}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm z-10"
          >
            <ChevronRight size={24} color="#8B5CF6" />
          </Animated.View>
          {/* Faded right side styling */}
          <View className="absolute right-4 w-6 h-6 items-center justify-center opacity-30 z-0">
             <ChevronRight size={24} color="white" />
          </View>
        </View>

        {/* History */}
        <View className="flex-row items-center gap-2 mb-4">
          <Clock size={20} color="white" className="opacity-60" />
          <Text className="text-white font-bold text-lg">My Withdrawal Requests</Text>
        </View>

        <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-8 items-center justify-center">
          <View className="opacity-40 mb-3">
             <RefreshCw size={28} color="white" />
          </View>
          <Text className="text-white/60 text-sm">No withdrawal requests yet</Text>
        </View>
        
      </ScrollView>
    </View>
  );
}
