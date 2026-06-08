import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, QrCode, Landmark, Info, ArrowRight } from 'lucide-react-native';
import { useWalletStore } from '../store';
import { formatINR } from '../utils';

export default function WithdrawScreen() {
  const router = useRouter();
  const { inrEarnings, withdrawEarnings } = useWalletStore();

  const [method, setMethod] = useState<'upi' | 'bank'>('upi');
  const [amount, setAmount] = useState('');

  const handleMax = () => {
    setAmount(inrEarnings.toString());
  };

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 500) {
      return Alert.alert('Invalid Amount', 'Minimum withdrawal limit is ₹500.');
    }
    if (amountNum > inrEarnings) {
      return Alert.alert('Insufficient Balance', 'Withdrawal amount exceeds your available cash earnings.');
    }
    
    // Using a fake UPI ID for demo purposes since we don't have the full KYC flow tied here
    const success = await withdrawEarnings(amountNum, 'user@upi');
    if (success) {
      Alert.alert(
        'Withdrawal Requested! 💸',
        `₹${amountNum.toLocaleString()} has been queued for transfer.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#12081E] pt-14">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-4">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-base ml-2">Withdraw</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 112 }}>
        
        {/* Total Balance Card */}
        <View className="bg-[#1A0E2C] rounded-2xl p-6 mt-2 border border-white/5 items-center shadow-lg shadow-[#A855F7]/5 gap-2">
          <Text className="text-neutral-grey text-[10px] font-bold uppercase tracking-widest mb-1">Total Balance</Text>
          <Text 
            className="text-[#FACC15] font-black text-[32px]" 
            style={{ textShadowColor: 'rgba(250, 204, 21, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
          >
            {formatINR(inrEarnings || 42850.50)}
          </Text>
          <Text className="text-neutral-grey text-[9px] font-medium mt-1">Minimum Withdraw: ₹500</Text>
        </View>

        {/* Select Method */}
        <View className="mt-8 mb-6 gap-3">
          <Text className="text-white text-sm font-bold ml-1">Select Withdrawal Method</Text>
          
          <View className="flex-row justify-between gap-3">
            <Pressable 
              onPress={() => setMethod('upi')}
              className={`flex-1 rounded-2xl p-4 border ${method === 'upi' ? 'bg-[#1A0E2C] border-[#A855F7]' : 'bg-[#150B24] border-white/5'} justify-between shadow-sm min-h-[112px]`}
            >
              <View className="w-10 h-10 bg-[#06B6D4]/10 rounded-xl items-center justify-center mb-3">
                <QrCode size={20} color="#06B6D4" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm">UPI</Text>
                <Text className="text-neutral-grey text-[9px] mt-0.5">Instant transfer</Text>
              </View>
            </Pressable>

            <Pressable 
              onPress={() => setMethod('bank')}
              className={`flex-1 rounded-2xl p-4 border ${method === 'bank' ? 'bg-[#1A0E2C] border-[#A855F7]' : 'bg-[#150B24] border-white/5'} justify-between shadow-sm min-h-[112px]`}
            >
              <View className="w-10 h-10 bg-[#10B981]/10 rounded-xl items-center justify-center mb-3">
                <Landmark size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm">Bank Transfer</Text>
                <Text className="text-neutral-grey text-[9px] mt-0.5">2-24 hours</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Enter Amount */}
        <View className="mt-2 gap-3">
          <Text className="text-white text-sm font-bold ml-1">Enter Amount</Text>
          
          <View className="bg-[#150B24] border border-white/5 rounded-2xl flex-row items-center px-4 h-16">
            <Text className="text-white/60 text-lg font-medium mr-3">₹</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="numeric"
              className="flex-1 text-white text-lg font-bold"
            />
            <Pressable onPress={handleMax} className="bg-[#A855F7]/10 border border-[#A855F7]/30 px-3 py-1.5 rounded-lg">
              <Text className="text-[#A855F7] text-[10px] font-black uppercase tracking-wide">MAX</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center space-x-4 w-full mt-1 ml-1">
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

        {/* Swipe to Withdraw Button */}
        <View className="mt-10">
          <Pressable 
            onPress={handleWithdraw}
            className="w-full h-14 rounded-full overflow-hidden flex-row items-center px-2 active:scale-[0.98]"
            style={{ backgroundColor: '#D946EF' }} // Using a solid magenta/pink for the gradient look
          >
            {/* The absolute gradient background can be simulated or we use solid for safety */}
            <View className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-[#D946EF] to-[#A855F7] opacity-90" />
            
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30 z-10">
              <ArrowRight size={20} color="#FFFFFF" />
            </View>
            
            <View className="flex-1 items-center justify-center -ml-10 z-0">
              <Text className="text-white font-bold text-sm">Swipe to withdraw</Text>
            </View>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
