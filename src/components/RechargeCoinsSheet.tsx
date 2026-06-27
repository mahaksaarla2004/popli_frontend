import React, { useState } from 'react';
import { View, Text, Pressable, Modal, Dimensions, Alert } from 'react-native';
import { X, Lock, CheckCircle2, Zap, Coins } from 'lucide-react-native';
import { useWalletStore } from '../store';

interface RechargeCoinsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (coins: number) => void;
}

const { width } = Dimensions.get('window');

export default function RechargeCoinsSheet({ visible, onClose, onSuccess }: RechargeCoinsSheetProps) {
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const rechargeCoins = useWalletStore(state => state.rechargeCoins);

  const packs = [
    { id: '1', coins: 100, price: 10, tag: null, tagColor: null },
    { id: '2', coins: 500, price: 50, tag: null, tagColor: null },
    { id: '3', coins: 1000, price: 100, tag: '10% Bonus', tagColor: 'bg-[#A855F7]/20 text-[#A855F7]', badge: 'Popular', bonus: '+100 bonus', bonusCoins: 100 },
    { id: '4', coins: 2000, price: 200, tag: '15% Bonus', tagColor: 'bg-[#10B981]/20 text-[#10B981]', bonus: '+300 bonus', bonusCoins: 300 },
    { id: '5', coins: 5000, price: 500, tag: '20% Bonus', tagColor: 'bg-[#10B981]/20 text-[#10B981]', badge: 'Best value', bonus: '+1,000 bonus', bonusCoins: 1000 },
    { id: '6', coins: 10000, price: 1000, tag: '25% Bonus', tagColor: 'bg-[#EAB308]/20 text-[#EAB308]', badge: '🔥 Max value', bonus: '+2,500 bonus', bonusCoins: 2500 },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="flex-1" onPress={onClose} />
        
        <View className="bg-[#12081E] rounded-t-[32px] pt-3 pb-8 shadow-2xl border-t border-white/10">
          {/* Handle */}
          <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-4" />
          
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 mb-2">
            <View className="flex-row items-center gap-2">
              <View className="bg-[#EAB308]/20 p-1.5 rounded-full">
                <Coins size={16} color="#EAB308" fill="#EAB308" />
              </View>
              <Text className="text-white font-extrabold text-lg">Recharge Pop Coins</Text>
            </View>
            <Pressable onPress={onClose} className="p-1.5 bg-white/5 rounded-full active:scale-95">
              <X size={18} color="#D1D5DB" />
            </Pressable>
          </View>

          <Text className="text-white/50 text-xs px-5 mb-3">
            Use Pop Coins to send gifts to your favourite creators
          </Text>

          <View className="bg-[#EAB308]/10 border border-[#EAB308]/30 rounded-xl py-2 mx-5 mb-4 flex-row items-center justify-center">
            <Coins size={14} color="#EAB308" fill="#EAB308" />
            <Text className="text-[#EAB308] font-bold text-xs ml-1.5">1 ₹ = 10 Pop Coins</Text>
          </View>

          {/* Grid */}
          <View className="flex-row flex-wrap px-4 justify-between gap-y-3">
            {packs.map((pack) => {
              const isSelected = selectedPackId === pack.id;
              return (
                <Pressable
                  key={pack.id}
                  onPress={() => setSelectedPackId(pack.id)}
                  className="bg-[#1D1037]/60 rounded-2xl p-4 items-center border relative active:scale-95 transition-all"
                  style={[{ borderColor: isSelected ? '#A855F7' : 'rgba(255,255,255,0.05)' }, { width: '48%' }]}
                >
                  {isSelected && (
                    <View className="absolute top-2 left-2">
                      <CheckCircle2 size={18} color="#EAB308" fill="#FEF08A" />
                    </View>
                  )}
                  {pack.badge && (
                    <View className="absolute -top-2 right-2 bg-[#A855F7] px-2 py-0.5 rounded flex-row items-center gap-1">
                      <Text className="text-white text-[8px] font-bold">✨ {pack.badge}</Text>
                    </View>
                  )}
                  
                  <View className="bg-[#EAB308]/20 w-10 h-10 rounded-full items-center justify-center mb-2">
                    <Coins size={20} color="#EAB308" fill="#EAB308" />
                  </View>
                  
                  <Text className="text-white font-black text-lg mb-1">{pack.coins.toLocaleString()}</Text>
                  
                  {pack.bonus && (
                    <Text className="text-green-500 text-[9px] font-bold mb-1">{pack.bonus}</Text>
                  )}
                  
                  <Text className="text-[#A855F7] font-bold text-base mb-2">₹{pack.price}</Text>
                  
                  {pack.tag && (
                    <View className={`px-2 py-0.5 rounded-sm ${pack.tagColor}`}>
                      <Text className="text-[9px] font-bold">{pack.tag}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Footer */}
          <View className="px-5 pt-6 pb-2">
            <View className="flex-row items-center justify-between gap-2 mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
              <Text className="text-white/50 text-xs">
                🔒 Secured via Razorpay · PCI-DSS compliant
              </Text>
              <Zap size={14} color="#6B7280" />
            </View>

            <Pressable 
              disabled={!selectedPackId || isProcessing}
              onPress={() => {
                const pack = packs.find(p => p.id === selectedPackId);
                if (!pack) return;

                Alert.alert(
                  'Razorpay Checkout',
                  `Confirm payment of ₹${pack.price.toFixed(2)}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Pay', 
                      onPress: async () => {
                        setIsProcessing(true);
                        const totalCoins = pack.coins + (pack.bonusCoins || 0);
                        try {
                          const success = await rechargeCoins(totalCoins);
                          if (success) {
                            Alert.alert('Payment Successful!', `₹${pack.price.toFixed(2)} paid successfully. ${totalCoins.toLocaleString()} Coins added to your wallet!`);
                            if (onSuccess) onSuccess(totalCoins);
                            onClose();
                          } else {
                            Alert.alert('Payment Failed', 'Something went wrong while processing the payment.');
                          }
                        } catch (e) {
                          Alert.alert('Error', 'Payment failed.');
                        } finally {
                          setIsProcessing(false);
                        }
                      }
                    }
                  ]
                );
              }}
              className={`w-full py-4 rounded-xl items-center justify-center active:scale-95 transition-all ${selectedPackId ? 'bg-[#A855F7]' : 'bg-[#A855F7]/30'}`}
            >
              <Text className={`font-bold text-sm ${selectedPackId ? 'text-white' : 'text-white/50'}`}>
                {isProcessing ? 'Processing...' : (selectedPackId 
                  ? `Pay ₹${packs.find(p => p.id === selectedPackId)?.price} · Get ${(packs.find(p => p.id === selectedPackId)!.coins + (packs.find(p => p.id === selectedPackId)!.bonusCoins || 0)).toLocaleString()} Coins`
                  : 'Select a Pack')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
