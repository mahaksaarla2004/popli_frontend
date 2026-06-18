import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, TextInput, ActivityIndicator, Animated, PanResponder, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Building2, Smartphone, Check, ChevronRight, Clock, RefreshCw, Gift, Eye, CheckCircle2 } from 'lucide-react-native';
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

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{title: string, message: string, type: 'error' | 'success'}>({title: '', message: '', type: 'error'});

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const [pan] = useState(() => new Animated.ValueXY());
  const maxSwipe = width - 32 - 40 - 16; // container width minus padding and button size

  const viewEarnings = wallet?.viewEarnings ?? 0;
  const giftEarnings = wallet?.giftEarnings ?? 0;
  const availableBalance = viewEarnings + giftEarnings + (wallet?.referralEarnings ?? 0);

  const handleWithdrawSubmit = async () => {
    if (!upiId || !amount) {
      showAlert('Error', 'Please enter UPI ID and Amount', 'error');
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      return;
    }
    const amt = parseFloat(amount);
    if (amt < 500) {
      showAlert('Error', 'Minimum withdrawal is ₹500', 'error');
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      return;
    }
    if (amt > availableBalance) {
      showAlert('Error', 'Insufficient balance', 'error');
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      return;
    }

    try {
      setWithdrawing(true);
      await apiClient.post('/wallet/withdraw', { amount: amt, upiId });
      showAlert('Success', 'Withdrawal requested successfully!', 'success');
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (e: any) {
      showAlert('Error', e.response?.data?.message || 'Failed to withdraw', 'error');
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
      <View className="flex-1 bg-[#12081E] items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#12081E] pt-14">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-4">
        <Pressable onPress={() => router.back()} className="mr-4 active:opacity-70 p-2 -ml-2">
          <ChevronLeft color="white" size={24} />
        </Pressable>
        <Text className="text-white font-bold text-lg">Withdraw Funds</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        
        {/* Earnings Breakdown Card */}
        <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-5 mb-8">
          <Text className="text-white font-bold text-base mb-4">Earnings Breakdown</Text>
          
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="bg-[#F59E0B]/20 w-8 h-8 rounded-full items-center justify-center">
                <Gift size={16} color="#FBBF24" />
              </View>
              <Text className="text-white/80 font-medium text-sm">Gift Earnings</Text>
            </View>
            <Text className="text-white font-bold">₹{giftEarnings.toFixed(2)}</Text>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="bg-[#8B5CF6]/20 w-8 h-8 rounded-full items-center justify-center">
                <Eye size={16} color="#8B5CF6" />
              </View>
              <Text className="text-white/80 font-medium text-sm">View Earnings</Text>
            </View>
            <Text className="text-white font-bold">₹{viewEarnings.toFixed(2)}</Text>
          </View>

          <View className="h-[1px] bg-[#3E2B5C] w-full mb-4" />
          
          <View className="flex-row justify-between items-center">
            <Text className="text-white/60 font-medium text-sm">Total Available</Text>
            <Text className="text-[#10B981] font-black text-xl">₹{availableBalance.toFixed(2)}</Text>
          </View>
        </View>

        <Text className="text-white font-bold text-sm mb-4">Select Withdrawal Method</Text>

        {/* Methods */}
        <View className="flex-row gap-4 mb-6">
          <Pressable 
            onPress={() => setMethod('upi')}
            className={`flex-1 rounded-2xl p-6 border ${method === 'upi' ? 'border-[#A855F7]' : 'border-[#3E2B5C]'} bg-[#1D1037] items-center justify-center relative`}
          >
            {method === 'upi' && (
              <View className="absolute top-3 right-3 bg-[#A855F7] rounded-full p-0.5">
                <Check size={12} color="white" strokeWidth={3} />
              </View>
            )}
            <View className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 items-center justify-center mb-3">
               <Smartphone size={24} color="#A855F7" />
            </View>
            <Text className={`font-bold text-sm mb-1 ${method === 'upi' ? 'text-white' : 'text-white/60'}`}>UPI</Text>
            <Text className="text-white/40 text-[10px]">Instant transfer</Text>
          </Pressable>

          <Pressable 
            onPress={() => setMethod('bank')}
            className={`flex-1 rounded-2xl p-6 border ${method === 'bank' ? 'border-[#A855F7]' : 'border-[#3E2B5C]'} bg-[#1D1037] items-center justify-center relative`}
          >
            {method === 'bank' && (
              <View className="absolute top-3 right-3 bg-[#A855F7] rounded-full p-0.5">
                <Check size={12} color="white" strokeWidth={3} />
              </View>
            )}
            <View className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 items-center justify-center mb-3">
              <Building2 size={24} color="#A855F7" />
            </View>
            <Text className={`font-bold text-sm mb-1 ${method === 'bank' ? 'text-white' : 'text-white/60'}`}>Bank Transfer</Text>
            <Text className="text-white/40 text-[10px]">2-24 hours</Text>
          </Pressable>
        </View>

        {/* Form */}
        <View className="gap-6 mb-8">
          <View>
            <Text className="text-white font-semibold text-sm mb-2">UPI ID</Text>
            <View className="relative justify-center">
              <TextInput 
                value={upiId}
                onChangeText={setUpiId}
                placeholder="e.g. yourname@upi"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                className="bg-[#1D1037] border border-[#3E2B5C] rounded-xl px-4 h-14 text-white"
              />
              <View className="absolute right-4 w-8 h-8 bg-white/5 rounded-full items-center justify-center">
                <View className="w-3.5 h-3.5 rounded-full bg-white/20 border-2 border-white/40" />
              </View>
            </View>
          </View>

          <View>
            <Text className="text-white font-semibold text-sm mb-2">Enter Amount</Text>
            <View className="flex-row items-center bg-[#1D1037] border border-[#3E2B5C] rounded-xl px-4 h-14">
              <Text className="text-white text-lg mr-2 font-bold">₹</Text>
              <TextInput 
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                keyboardType="numeric"
                className="flex-1 text-white text-lg"
              />
              <Pressable onPress={() => setAmount(availableBalance.toString())} className="bg-[#3E2B5C] px-3 py-1.5 rounded-lg">
                <Text className="text-white/60 font-bold text-[10px]">MAX</Text>
              </Pressable>
            </View>
            <Text className="text-white/40 text-[10px] mt-2">Available: ₹{availableBalance.toFixed(2)}</Text>
          </View>
        </View>

        {/* Swipe Button */}
        <View className="bg-[#A855F7] h-14 rounded-full flex-row items-center px-2 mb-10 overflow-hidden relative">
          <Text className="text-white font-bold text-sm absolute w-full text-center z-0">
            {withdrawing ? 'Processing...' : 'Swipe to Withdraw'}
          </Text>
          <Animated.View 
            {...panResponder.panHandlers}
            style={{ transform: [{ translateX: pan.x }] }}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm z-10"
          >
            <ChevronRight size={20} color="#A855F7" strokeWidth={3} />
          </Animated.View>
          <View className="absolute right-4 w-6 h-6 items-center justify-center opacity-30 z-0">
             <ChevronRight size={20} color="white" />
          </View>
        </View>

        {/* History */}
        <View className="flex-row items-center gap-2 mb-4">
          <Clock size={16} color="white" />
          <Text className="text-white font-bold text-sm">My Withdrawal Requests</Text>
        </View>

        <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-8 items-center justify-center mb-10">
          <View className="opacity-40 mb-3">
             <RefreshCw size={24} color="white" />
          </View>
          <Text className="text-white/60 text-xs">No withdrawal requests yet</Text>
        </View>
        
      </ScrollView>

      {/* Custom Alert Modal */}
      <Modal visible={alertVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl">
            {alertConfig.type === 'error' ? (
              <View className="w-16 h-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
                <Text className="text-red-500 text-3xl font-bold">!</Text>
              </View>
            ) : (
              <View className="w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-4">
                <CheckCircle2 size={32} color="#10B981" />
              </View>
            )}
            <Text className="text-white font-bold text-xl mb-2 text-center">{alertConfig.title}</Text>
            <Text className="text-white/70 text-center mb-6 leading-5">{alertConfig.message}</Text>
            <Pressable 
              onPress={() => setAlertVisible(false)}
              className="bg-[#A855F7] w-full py-4 rounded-xl items-center active:scale-[0.98]"
            >
              <Text className="text-white font-bold uppercase tracking-wider">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
