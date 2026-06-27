import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Modal , Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Landmark, Clock, CheckCircle2, History } from 'lucide-react-native';
import { apiClient } from '../api/client';
import { SafeScreen } from '../components/layout/SafeScreen';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function WithdrawScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VIEW' | 'GIFT'>('ALL');

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{title: string, message: string, type: 'error' | 'success'}>({title: '', message: '', type: 'error'});

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

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

  const totalEarnings = wallet?.totalEarnings ?? 0;
  const pendingValidation = wallet?.pendingBalance ?? 0;
  const withdrawable = wallet?.withdrawableBalance ?? 0;
  const ledgers = wallet?.ledgers || [];

  const handleWithdrawSubmit = async () => {
    if (!upiId || !amount) {
      showAlert('Error', 'Please enter UPI ID and Amount', 'error');
      return;
    }
    const amt = parseFloat(amount);
    if (amt < 500) {
      showAlert('Error', 'Minimum withdrawal is ₹500', 'error');
      return;
    }
    if (amt > withdrawable) {
      showAlert('Error', 'Insufficient withdrawable balance', 'error');
      return;
    }

    try {
      setWithdrawing(true);
      await apiClient.post('/wallet/withdraw', { amount: amt, upiId });
      showAlert('Success', 'Withdrawal requested successfully!', 'success');
      setAmount('');
      setUpiId('');
      const res = await apiClient.get('/wallet');
      setWallet(res.data);
    } catch (e: any) {
      showAlert('Error', e.response?.data?.message || 'Failed to withdraw', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredLedgers = ledgers.filter((l: any) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'VIEW') return l.source === 'VIEW_EARNING';
    if (activeTab === 'GIFT') return l.source === 'GIFT_RECEIVED';
    return true;
  });

  if (loading) {
    return (
      <View className="flex-1 bg-[#12081E] items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <SafeScreen edgeToEdgeBottom className="bg-[#12081E] flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-center px-4 pt-4 pb-4 relative">
          <Pressable onPress={() => router.back()} className="absolute left-4 p-2 -ml-2 z-10 active:opacity-70">
            <ChevronLeft color="white" size={28} />
          </Pressable>
          <Text className="text-white font-bold text-lg tracking-wide">Creator Rewards</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Huge Balance */}
          <View className="items-center mt-2 mb-8">
             <Text className="text-white font-black text-6xl tracking-tighter">₹{totalEarnings.toFixed(2)}</Text>
          </View>

          <View className="px-5">
            
            {/* Pending & Withdrawable Split Card */}
            <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-5 mb-6 flex-row justify-between shadow-lg">
              <View className="flex-1 border-r border-[#3E2B5C] pr-4">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Clock size={14} color="#FBBF24" />
                  <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Pending Validation</Text>
                </View>
                <Text className="text-[#FBBF24] font-black text-xl">₹{pendingValidation.toFixed(2)}</Text>
              </View>
              <View className="flex-1 pl-4">
                 <View className="flex-row items-center gap-1.5 mb-2">
                  <CheckCircle2 size={14} color="#10B981" />
                  <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Withdrawable</Text>
                </View>
                <Text className="text-[#10B981] font-black text-xl">₹{withdrawable.toFixed(2)}</Text>
              </View>
            </View>

            {/* Request Cash Withdrawal Form */}
            <View className="bg-[#1D1037] rounded-[24px] p-6 mb-8 border border-[#3E2B5C] shadow-lg">
              <View className="flex-row items-center gap-2 mb-6">
                <Landmark size={20} color="#A855F7" />
                <Text className="text-white font-bold text-base">Request Cash Withdrawal</Text>
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">Withdrawal Amount (Min ₹500)</Text>
                <TextInput 
                  value={amount}
                  onChangeText={setAmount}
                  placeholder={`Max available: ₹${withdrawable.toFixed(0)}`}
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  keyboardType="numeric"
                  className="bg-[#12081E] border border-[#3E2B5C] rounded-xl px-4 h-14 text-white font-medium"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">Recipient UPI ID</Text>
                <TextInput 
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="username@bank"
                  placeholderTextColor="rgba(255, 255, 255, 0.2)"
                  className="bg-[#12081E] border border-[#3E2B5C] rounded-xl px-4 h-14 text-white font-medium"
                />
              </View>

              <Pressable 
                onPress={handleWithdrawSubmit}
                disabled={withdrawing}
                className="bg-[#A855F7] py-4 rounded-xl items-center justify-center active:scale-95"
              >
                {withdrawing ? (
                   <ActivityIndicator color="white" />
                ) : (
                   <Text className="text-white font-bold text-sm uppercase tracking-widest">Submit Request</Text>
                )}
              </Pressable>
            </View>

            {/* Ledger & History */}
            <View className="flex-row items-center gap-2 mb-4">
              <History size={18} color="white" />
              <Text className="text-white font-bold text-base">LEDGER & HISTORY</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row">
              <Pressable 
                onPress={() => setActiveTab('ALL')}
                className={`px-4 py-3 rounded-xl border mr-3 ${activeTab === 'ALL' ? 'border-[#A855F7] bg-[#1D1037]' : 'border-[#3E2B5C] bg-[#1D1037]/50'}`}
              >
                <Text className={`font-bold text-[11px] uppercase tracking-wider ${activeTab === 'ALL' ? 'text-white' : 'text-gray-400'}`}>All Transactions</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => setActiveTab('VIEW')}
                className={`px-4 py-3 rounded-xl border mr-3 ${activeTab === 'VIEW' ? 'border-[#A855F7] bg-[#1D1037]' : 'border-[#3E2B5C] bg-[#1D1037]/50'}`}
              >
                <Text className={`font-bold text-[11px] uppercase tracking-wider ${activeTab === 'VIEW' ? 'text-white' : 'text-gray-400'}`}>View Earnings</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => setActiveTab('GIFT')}
                className={`px-4 py-3 rounded-xl border ${activeTab === 'GIFT' ? 'border-[#A855F7] bg-[#1D1037]' : 'border-[#3E2B5C] bg-[#1D1037]/50'}`}
              >
                <Text className={`font-bold text-[11px] uppercase tracking-wider ${activeTab === 'GIFT' ? 'text-white' : 'text-gray-400'}`}>Gift Earnings</Text>
              </Pressable>
            </ScrollView>

            <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-6 min-h-[150px] justify-center shadow-lg border-dashed">
               {filteredLedgers.length === 0 ? (
                 <Text className="text-gray-500 text-center font-medium">No transactions found.</Text>
               ) : (
                 filteredLedgers.map((l: any, i: number) => (
                   <View key={i} className="flex-row justify-between items-center mb-4 last:mb-0 border-b border-[#3E2B5C] pb-4 last:border-0 last:pb-0">
                     <View>
                       <Text className="text-white font-bold text-sm">{l.source}</Text>
                       <Text className="text-gray-400 text-[10px] mt-0.5">{new Date(l.createdAt).toLocaleDateString()}</Text>
                     </View>
                     <View className="items-end">
                       <Text className={`${l.credit > 0 ? 'text-[#10B981]' : 'text-red-400'} font-black text-sm`}>
                         {l.credit > 0 ? '+' : '-'}₹{Math.abs(l.credit > 0 ? l.credit : l.debit).toFixed(2)}
                       </Text>
                       <Text className="text-gray-500 text-[10px] mt-0.5">Bal: ₹{l.balanceAfter?.toFixed(2)}</Text>
                     </View>
                   </View>
                 ))
               )}
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    </SafeScreen>
  );
}
