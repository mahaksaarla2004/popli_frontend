import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, Alert, Platform } from 'react-native';
import { X, Award, Coins } from 'lucide-react-native';
import { useWalletStore, useFeedStore } from '../../store';
import { GIFT_CATALOG } from '../../services/mockApi';
import { Reel } from '../../types';
import { MotiView } from 'moti';

interface GiftSheetProps {
  reel: Reel | null;
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess: (giftIcon: string) => void;
}

export const GiftSheet = ({ reel, isOpen, onClose, onSendSuccess }: GiftSheetProps) => {
  const [selectedGiftId, setSelectedGiftId] = useState<typeof GIFT_CATALOG[number]['id']>('rocket');
  const [giftMessage, setGiftMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { coinBalance, sendGiftCoins, rechargeCoins } = useWalletStore();

  const selectedGift = GIFT_CATALOG.find((g) => g.id === selectedGiftId)!;

  const handleSendGift = () => {
    if (!reel) return;

    const cost = selectedGift.cost;
    const desc = `Sent ${selectedGift.name} gift to @${reel.creatorUsername}`;

    // Deduct coins from persistent store
    const success = sendGiftCoins(cost, desc);
    
    if (success) {
      // Add mock coin receipt to the creator balance
      useFeedStore.getState().creators = useFeedStore.getState().creators.map((c) => {
        if (c.id === reel.creatorId) {
          return {
            ...c,
            coinsEarned: c.coinsEarned + cost,
            giftsReceivedCount: c.giftsReceivedCount + 1
          };
        }
        return c;
      });

      // Play success visual burst animation
      onSendSuccess(selectedGift.icon);
      onClose();
      
      // Reset input message
      setGiftMessage('');
    } else {
      // Triggers recharging modal helper
      Alert.alert(
        'Insufficient Balance',
        `You need ${cost - coinBalance} more coins to send this ${selectedGift.name}. Would you like to recharge?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Recharge 500 Coins', onPress: () => rechargeCoins(500) },
          { text: 'Recharge 2000 Coins', onPress: () => rechargeCoins(2000) }
        ]
      );
    }
  };

  if (!isOpen || !reel) return null;

  return (
    <MotiView
      from={{ translateY: 600, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: 600, opacity: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      className="absolute bottom-0 left-0 right-0 h-[75%] bg-[#0B001A] rounded-t-[32px] border-t border-white/10 z-50 shadow-2xl flex-col"
    >
      {/* Drag handle line */}
      <View className="items-center py-3">
        <View className="w-10 h-1 bg-white/20 rounded-full" />
      </View>

      {/* Header bar with close button */}
      <View className="flex-row items-center justify-between px-5 pb-3 border-b border-white/5">
        <Text className="text-white font-extrabold text-lg">Send Gift</Text>
        <Pressable onPress={onClose} className="p-1.5 rounded-full bg-white/5 active:scale-[0.9]">
          <X size={18} color="#D1D5DB" />
        </Pressable>
      </View>

      {/* Wallet Balance Display Card matching Figma */}
      <View className="bg-[#190C2C]/50 mx-5 mt-4 p-4 rounded-2xl border border-white/5 flex-row items-center justify-between">
        <View className="flex-col">
          <Text className="text-white/40 text-[9px] font-bold uppercase tracking-wider">MY BALANCE</Text>
          <View className="flex-row items-center space-x-1.5 mt-0.5">
            <Coins size={14} color="#EAB308" fill="#EAB308" />
            <Text className="text-yellow-400 font-extrabold text-base">
              {coinBalance.toLocaleString()} Coins
            </Text>
          </View>
        </View>
        
        <Pressable 
          onPress={() => {
            rechargeCoins(1000);
            Alert.alert('Recharge Success! 🎉', 'Added 1,000 coins to your wallet balance.');
          }}
          className="bg-primary-purple px-4 py-2 rounded-xl shadow active:scale-[0.95]"
        >
          <Text className="text-white text-xs font-bold uppercase tracking-wider">Recharge</Text>
        </Pressable>
      </View>

      {/* Gifts 8-Grid exactly as in Figma screenshot */}
      <View className="flex-row flex-wrap px-5 py-4 justify-between gap-y-4">
        {GIFT_CATALOG.map((gift) => {
          const isSelected = gift.id === selectedGiftId;
          return (
            <Pressable
              key={gift.id}
              onPress={() => setSelectedGiftId(gift.id)}
              className="w-[23%] items-center"
            >
              <View 
                className={`w-[68px] h-[68px] rounded-2xl justify-center items-center relative border ${
                  isSelected 
                    ? 'bg-primary-purple/20 border-primary-purple shadow shadow-primary-purple/40' 
                    : 'bg-[#190C2C]/65 border-white/5'
                }`}
              >
                <Text style={{ fontSize: 26 }} className="mb-0.5">{gift.icon}</Text>
                
                {/* Cost Tag */}
                <View className="absolute bottom-1 bg-black/40 px-1 rounded">
                  <Text className="text-yellow-400 text-[8px] font-bold">{gift.cost}</Text>
                </View>
              </View>
              <Text className="text-white/80 text-[10px] font-medium mt-1" numberOfLines={1}>{gift.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Input Message box */}
      <View className="px-5 py-1">
        <TextInput
          value={giftMessage}
          onChangeText={setGiftMessage}
          placeholder="Write a message..."
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          className="bg-[#190C2C]/50 border border-white/5 text-white rounded-xl px-4 py-2.5 text-xs font-normal"
        />
      </View>

      {/* Anonymous Toggle Option */}
      <View className="flex-row items-center justify-between px-5 py-2 mt-1">
        <View>
          <Text className="text-white text-xs font-bold">Send Anonymously</Text>
          <Text className="text-white/40 text-[9px]">Hide your name from other viewers</Text>
        </View>
        <Switch
          value={isAnonymous}
          onValueChange={setIsAnonymous}
          trackColor={{ false: '#1F1235', true: '#8B5CF6' }}
          thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#0B001A'}
        />
      </View>

      {/* Send CTA Gradient Button styled dynamically */}
      <View className="px-5 py-3 pb-[90px]">
        <Pressable
          onPress={handleSendGift}
          className="bg-primary-purple py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-primary-purple/30"
        >
          <Text className="text-white text-sm font-bold uppercase tracking-wider">
            Send {selectedGift.name} ({selectedGift.cost})
          </Text>
        </Pressable>
        
        {/* Notice text below the button */}
        <Text className="text-white/30 text-[8px] text-center mt-2.5 leading-3">
          By sending a gift, you agree to our Terms of Service and virtual goods policy.
        </Text>
      </View>
    </MotiView>
  );
};
