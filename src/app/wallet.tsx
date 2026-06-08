import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Coins, ArrowUpRight, TrendingUp, Landmark, ShieldCheck, Wallet, ArrowDownLeft } from 'lucide-react-native';
import { useWalletStore, useKYCStore } from '../store';
import { formatINR } from '../utils';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

const COIN_PACKS = [
  { coins: 250, price: 199 },
  { coins: 650, price: 499 },
  { coins: 1400, price: 999 },
  { coins: 3000, price: 1999 }
];

export default function WalletScreen() {
  const router = useRouter();
  const { coinBalance, inrEarnings, transactions, rechargeCoins, withdrawEarnings } = useWalletStore();
  const { kycCompleted, upiId } = useKYCStore();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [customUpi, setCustomUpi] = useState(upiId || '');

  React.useEffect(() => {
    useWalletStore.getState().fetchWallet();
  }, []);

  const handleWithdraw = async () => {
    if (!kycCompleted) {
      return Alert.alert('KYC Required', 'Please complete your KYC verification profile first to enable bank withdrawals.', [
        { text: 'Verify Now', onPress: () => router.push('/kyc') }
      ]);
    }

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum < 500) {
      return Alert.alert('Invalid Amount', 'Minimum withdrawal limit is ₹500.');
    }

    if (amountNum > inrEarnings) {
      return Alert.alert('Insufficient Balance', 'Withdrawal amount exceeds your available cash earnings.');
    }

    if (!customUpi.trim()) {
      return Alert.alert('Error', 'Please enter your UPI ID.');
    }

    const success = await withdrawEarnings(amountNum, customUpi.trim());
    if (success) {
      Alert.alert(
        'Withdrawal Requested! 💸',
        `₹${amountNum.toLocaleString()} has been queued for transfer. Standard settlement takes 24 hours.`
      );
      setWithdrawAmount('');
    } else {
      Alert.alert('Withdrawal Failed', 'There was an error processing your withdrawal.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background-plum pt-12">
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-4 pb-3 border-b border-white/5 bg-background-card/15">
        <Pressable onPress={() => router.back()} className="p-1">
          <ArrowLeft size={20} color="#D1D5DB" />
        </Pressable>
        <Text className="text-white font-bold text-base">Creator Wallet</Text>
        <View className="w-5" />
      </View>

      <ScrollView className="flex-1 px-4 py-4 gap-6" showsVerticalScrollIndicator={false}>
        
        {/* Double Balances Cards */}
        <View className="flex-row justify-between gap-4 mt-2">
          {/* A. INR Cash Earnings Card */}
          <View className="flex-1 bg-background-card/70 border border-white/10 rounded-3xl p-4 shadow shadow-primary-purple/10">
            <View className="w-8 h-8 rounded-full bg-primary-pink/15 items-center justify-center border border-primary-pink/30 mb-3">
              <Wallet size={16} color="#EC4899" />
            </View>
            <Text className="text-white/60 text-[9px] font-bold uppercase tracking-wider">INR Cash Earnings</Text>
            <Text className="text-white font-black text-xl mt-1 pr-1" numberOfLines={1}>
              {formatINR(inrEarnings)}
            </Text>
            <Text className="text-accent-green text-[9px] font-bold mt-1">₹5/1K Views Monetized</Text>
          </View>

          {/* B. Coins Balance Card */}
          <View className="flex-1 bg-background-card/70 border border-white/10 rounded-3xl p-4 shadow shadow-primary-purple/10">
            <View className="w-8 h-8 rounded-full bg-accent-gold/20 items-center justify-center border border-accent-gold/30 mb-3">
              <Coins size={16} color="#FCD34D" fill="#F59E0B" />
            </View>
            <Text className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Virtual Coins Balance</Text>
            <Text className="text-accent-yellow font-black text-xl mt-1 pr-1" numberOfLines={1}>
              {coinBalance.toLocaleString()}
            </Text>
            <Text className="text-neutral-grey text-[9px] font-semibold mt-1">For Gifting Creators</Text>
          </View>
        </View>

        {/* Dynamic visual graph for coin earnings progress weekly */}
        <View className="bg-background-card/50 border border-white/5 rounded-3xl p-5">
          <View className="flex-row items-center justify-between pb-4 border-b border-white/5">
            <View className="flex-row items-center gap-2">
              <TrendingUp size={16} color="#D946EF" />
              <Text className="text-white font-bold text-xs">Earnings Performance Graph</Text>
            </View>
            <Text className="text-neutral-grey text-[9px] font-bold">WEEKLY SUMMARY</Text>
          </View>

          {/* Visual CSS-bar chart */}
          <View className="flex-row justify-between items-end h-28 pt-6 px-2">
            {[
              { day: 'Mon', coins: 40, active: false },
              { day: 'Tue', coins: 65, active: false },
              { day: 'Wed', coins: 95, active: true },
              { day: 'Thu', coins: 50, active: false },
              { day: 'Fri', coins: 120, active: true },
              { day: 'Sat', coins: 80, active: false },
              { day: 'Sun', coins: 150, active: true }
            ].map((bar, i) => (
              <View key={i} className="items-center gap-2 flex-1">
                <View className="w-4 bg-white/5 rounded-full h-20 justify-end overflow-hidden">
                  <View 
                    style={{ height: `${(bar.coins / 150) * 100}%` }}
                    className={`w-full rounded-full ${
                      bar.active ? 'bg-primary-pink' : 'bg-primary-purple/60'
                    }`}
                  />
                </View>
                <Text className="text-neutral-grey text-[8px] font-bold">{bar.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Withdrawal Section */}
        <View className="bg-background-card/50 border border-white/5 rounded-3xl p-6 gap-4">
          <View className="flex-row items-center gap-2 pb-2 border-b border-white/5">
            <Landmark size={16} color="#8B5CF6" />
            <Text className="text-white font-bold text-xs">Request Cash Withdrawal</Text>
          </View>

          <View className="gap-6">
            <View className="gap-2">
              <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Withdrawal Amount (Min ₹500)</Text>
              <TextInput
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="₹ Amount to withdraw"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="numeric"
                className="bg-background-dark/50 border border-white/10 text-white rounded-2xl px-4 h-12 text-xs font-semibold"
              />
            </View>

            <View className="gap-2">
              <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Recipient UPI ID</Text>
              <TextInput
                value={customUpi}
                onChangeText={setCustomUpi}
                placeholder="username@bank"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                className="bg-background-dark/50 border border-white/10 text-white rounded-2xl px-4 h-12 text-xs font-semibold"
              />
            </View>

            <Pressable
              onPress={handleWithdraw}
              className="bg-primary-purple h-12 rounded-2xl items-center justify-center shadow shadow-primary-purple/35 flex-row gap-2"
            >
              <Text className="text-white text-xs font-black uppercase tracking-wider">Submit Cash Withdrawal</Text>
            </Pressable>
          </View>
        </View>

        {/* Coin Packages Recharge */}
        <View className="gap-4">
          <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Recharge Coin Packages</Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {COIN_PACKS.map((pack) => (
              <Pressable
                key={pack.coins}
                onPress={async () => {
                  const success = await rechargeCoins(pack.coins);
                  if (success) {
                    Alert.alert('Recharge Success! 🎉', `Added ${pack.coins} coins to your balance.`);
                  } else {
                    Alert.alert('Recharge Failed', 'Could not process payment.');
                  }
                }}
                className="w-[48%] bg-background-card/50 border border-white/5 rounded-3xl p-4 items-center justify-center active:scale-[0.98]"
              >
                <View className="flex-row items-center gap-1">
                  <Coins size={14} color="#FCD34D" fill="#F59E0B" />
                  <Text className="text-accent-yellow font-black text-sm">{pack.coins.toLocaleString()}</Text>
                </View>
                <Text className="text-white text-[10px] mt-2 font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                  Pay ₹{pack.price}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Transaction History ledger */}
        <View className="gap-4 pb-24">
          <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Transaction History</Text>
          <View className="gap-3">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'gift_receive' || tx.type === 'coin_recharge';
              return (
                <View 
                  key={tx.id}
                  className="bg-background-card/40 border border-white/5 rounded-2xl p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1 pr-4">
                    <View className={`w-9 h-9 rounded-full items-center justify-center border ${
                      isIncome 
                        ? 'bg-green-500/10 border-green-500/25' 
                        : 'bg-red-500/10 border-red-500/25'
                    }`}>
                      {isIncome ? (
                        <ArrowDownLeft size={16} color="#10B981" />
                      ) : (
                        <ArrowUpRight size={16} color="#EF4444" />
                      )}
                    </View>

                    <View className="flex-1 gap-1">
                      <Text className="text-white text-xs font-bold" numberOfLines={1}>{tx.description}</Text>
                      <Text className="text-neutral-grey text-[9px] font-semibold">{tx.timestamp}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className={`font-black text-xs ${isIncome ? 'text-accent-green' : 'text-red-400'}`}>
                      {isIncome ? '+' : '-'}
                      {tx.currency === 'coins' ? `${tx.amount} 🪙` : `₹${tx.amount}`}
                    </Text>
                    <Text className="text-neutral-grey text-[8px] font-semibold uppercase mt-0.5">{tx.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
