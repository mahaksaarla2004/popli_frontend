import React, { useState } from 'react';
import { View, Text, Pressable, Modal, Dimensions, Alert } from 'react-native';
import { X, Lock, Check } from 'lucide-react-native';

interface RechargeCoinsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (coins: number) => void;
}

const { width } = Dimensions.get('window');

export default function RechargeCoinsSheet({ visible, onClose, onSuccess }: RechargeCoinsSheetProps) {
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  const packs = [
    { id: '1', coins: 50, price: 5.00 },
    { id: '2', coins: 250, price: 20.00 },
    { id: '3', coins: 600, price: 45.00, popular: true },
    { id: '4', coins: 1500, price: 100.00 },
    { id: '5', coins: 3000, price: 190.00 },
    { id: '6', coins: 5000, price: 300.00 },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        
        <View className="bg-[#1D1037] rounded-t-3xl pt-2 pb-8 px-4 border-t border-[#3E2B5C]">
          {/* Handle */}
          <View className="w-12 h-1.5 bg-[#3E2B5C] rounded-full self-center mb-6" />
          
          {/* Header */}
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-white font-bold text-xl mb-1">Recharge Coins</Text>
              <Text className="text-[#FCD34D] font-bold text-sm">Current Balance: 3,289</Text>
            </View>
            <Pressable onPress={onClose} className="p-2 -mr-2 bg-[#2D1B4E] rounded-full active:opacity-70">
              <X size={20} color="white" />
            </Pressable>
          </View>

          {/* Grid */}
          <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
            {packs.map((pack) => {
              const isSelected = selectedPackId === pack.id;
              return (
                <Pressable
                  key={pack.id}
                  onPress={() => setSelectedPackId(pack.id)}
                  style={{ width: (width - 48) / 2 }}
                  className={`rounded-2xl p-4 border relative ${isSelected ? 'border-[#FCD34D] bg-[#F59E0B]/10' : 'border-[#3E2B5C] bg-[#0D0518]'}`}
                >
                  {pack.popular && (
                    <View className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EF4444] px-2 py-0.5 rounded-full z-10">
                      <Text className="text-white font-bold text-[10px]">Popular</Text>
                    </View>
                  )}
                  {isSelected && (
                    <View className="absolute top-2 right-2 bg-[#FCD34D] rounded-full p-0.5">
                      <Check size={12} color="black" />
                    </View>
                  )}
                  <View className="items-center">
                    <Text className="text-white font-black text-2xl mb-1">{pack.coins}</Text>
                    <Text className="text-[#FCD34D] text-xs font-bold mb-3">Coins</Text>
                    <View className={`px-4 py-1.5 rounded-full ${isSelected ? 'bg-[#FCD34D]' : 'bg-[#2D1B4E]'}`}>
                      <Text className={`font-bold text-sm ${isSelected ? 'text-black' : 'text-white'}`}>
                        ₹{pack.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center gap-2 mb-4">
            <Lock size={14} color="#9CA3AF" />
            <Text className="text-gray-400 font-bold text-xs">Secured via Razorpay</Text>
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
                      Alert.alert('Payment Successful!', `₹${pack.price.toFixed(2)} paid successfully. ${pack.coins} Coins added to your wallet!`);
                      if (onSuccess) onSuccess(pack.coins);
                      onClose();
                    }
                  }
                ]
              );
            }}
            className={`py-4 rounded-full flex-row justify-center items-center ${selectedPackId ? 'bg-[#A855F7]' : 'bg-[#3E2B5C]'}`}
          >
            <Text className={`font-bold text-lg ${selectedPackId ? 'text-white' : 'text-gray-400'}`}>
              {selectedPackId ? 'Continue to Pay' : 'Select a Pack'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
