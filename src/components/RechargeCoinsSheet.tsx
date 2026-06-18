import React, { useState } from 'react';
import { View, Text, Pressable, Modal, Dimensions, Alert } from 'react-native';
import { X, Lock, CheckCircle2, Zap, Coins } from 'lucide-react-native';

interface RechargeCoinsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (coins: number) => void;
}

const { width } = Dimensions.get('window');

export default function RechargeCoinsSheet({ visible, onClose, onSuccess }: RechargeCoinsSheetProps) {
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  const packs = [
    { id: '1', coins: 50, price: 5, tag: null, tagColor: null },
    { id: '2', coins: 250, price: 20, tag: '20% off', tagColor: 'bg-purple-100 text-purple-600' },
    { id: '3', coins: 600, price: 45, tag: '25% off', tagColor: 'bg-purple-100 text-purple-600', badge: 'Popular' },
    { id: '4', coins: 1500, price: 100, tag: '33% off', tagColor: 'bg-purple-100 text-purple-600', bonus: '+100 bonus', bonusCoins: 100 },
    { id: '5', coins: 3500, price: 200, tag: 'Best value', tagColor: 'bg-green-100 text-green-600', bonus: '+350 bonus', bonusCoins: 350 },
    { id: '6', coins: 10000, price: 500, tag: '🔥 Max value', tagColor: 'bg-green-100 text-green-600', bonus: '+1,500 bonus', bonusCoins: 1500 },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />
        
        <View className="bg-white rounded-t-[32px] pt-3 pb-8 shadow-2xl">
          {/* Handle */}
          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
          
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 mb-2">
            <View className="flex-row items-center gap-2">
              <View className="bg-yellow-100 p-1.5 rounded-full">
                <Coins size={16} color="#EAB308" fill="#EAB308" />
              </View>
              <Text className="text-gray-900 font-extrabold text-lg">Recharge Coins</Text>
            </View>
            <Pressable onPress={onClose} className="p-1.5 bg-gray-100 rounded-full active:scale-95">
              <X size={18} color="#6B7280" />
            </Pressable>
          </View>

          <Text className="text-gray-500 text-xs px-5 mb-4">
            Use coins to send gifts to your favourite creators
          </Text>

          {/* Grid */}
          <View className="flex-row flex-wrap px-4 justify-between gap-y-3">
            {packs.map((pack) => {
              const isSelected = selectedPackId === pack.id;
              return (
                <Pressable
                  key={pack.id}
                  onPress={() => setSelectedPackId(pack.id)}
                  className="bg-white rounded-2xl p-4 items-center border relative active:scale-95 transition-all"
                  style={[{ borderColor: isSelected ? '#A855F7' : '#F3F4F6' }, { width: '48%' }]}
                >
                  {isSelected && (
                    <View className="absolute top-2 left-2">
                      <CheckCircle2 size={18} color="#EAB308" fill="#FEF08A" />
                    </View>
                  )}
                  {pack.badge && (
                    <View className="absolute -top-2 right-2 bg-[#8B5CF6] px-2 py-0.5 rounded flex-row items-center gap-1">
                      <Text className="text-white text-[8px] font-bold">✨ {pack.badge}</Text>
                    </View>
                  )}
                  
                  <View className="bg-yellow-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                    <Coins size={20} color="#EAB308" fill="#EAB308" />
                  </View>
                  
                  <Text className="text-gray-900 font-black text-lg mb-1">{pack.coins.toLocaleString()}</Text>
                  
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
            <View className="flex-row items-center justify-between gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Text className="text-gray-500 text-xs">
                🔒 Secured via Razorpay · PCI-DSS compliant
              </Text>
              <Zap size={14} color="#6B7280" />
            </View>

            <Pressable 
              disabled={!selectedPackId}
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
                      onPress: () => {
                        const totalCoins = pack.coins + (pack.bonusCoins || 0);
                        Alert.alert('Payment Successful!', `₹${pack.price.toFixed(2)} paid successfully. ${totalCoins.toLocaleString()} Coins added to your wallet!`);
                        if (onSuccess) onSuccess(totalCoins);
                        onClose();
                      }
                    }
                  ]
                );
              }}
              className={`w-full py-4 rounded-xl items-center justify-center active:scale-95 transition-all ${selectedPackId ? 'bg-[#F97316]' : 'bg-[#FBBF24]/50'}`}
            >
              <Text className={`font-bold text-sm ${selectedPackId ? 'text-black' : 'text-white'}`}>
                {selectedPackId 
                  ? `Pay ₹${packs.find(p => p.id === selectedPackId)?.price} · Get ${(packs.find(p => p.id === selectedPackId)!.coins + (packs.find(p => p.id === selectedPackId)!.bonusCoins || 0)).toLocaleString()} Coins`
                  : 'Select a Pack'
                }
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
