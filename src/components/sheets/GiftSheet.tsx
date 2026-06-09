import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Platform, StyleSheet, Alert } from 'react-native';
import { X, Award, Coins } from 'lucide-react-native';
import { useWalletStore, useFeedStore } from '../../store';
import { GIFT_CATALOG } from '../../constants/staticData';
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
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { coinBalance, sendGiftCoins, rechargeCoins } = useWalletStore();

  const selectedGift = GIFT_CATALOG.find((g) => g.id === selectedGiftId)!;


  const handleSendGift = async () => {
    if (!reel) return;

    // Show native popup as requested by user
    Alert.alert(
      'Insufficient Balance', 
      `You need more coins to send ${selectedGift.name}. Please recharge your wallet!`,
      [{ text: 'OK', style: 'cancel' }]
    );
    
    // Also trigger the custom modal just in case
    setShowInsufficientModal(true);
  };

  if (!isOpen || !reel) return null;

  return (
    <>
      {/* Background Dimmer when Sheet is Open */}
      <TouchableOpacity className="absolute inset-0 bg-black/40 z-40" onPress={onClose} />

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
        <TouchableOpacity onPress={onClose} className="p-1.5 rounded-full bg-white/5 active:scale-[0.9]">
          <X size={18} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      {/* Wallet Balance Display Card matching Figma */}
      <View className="bg-[#190C2C]/50 mx-5 mt-4 p-4 rounded-2xl border border-white/5 flex-row items-center justify-between">
        <View className="flex-col">
          <Text className="text-white/40 text-[9px] font-bold uppercase tracking-wider">MY BALANCE</Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <Coins size={14} color="#EAB308" fill="#EAB308" />
            <Text className="text-yellow-400 font-extrabold text-base">
              {coinBalance.toLocaleString()} Coins
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => {
            rechargeCoins(1000);
            setShowSuccessModal(true);
          }}
          className="bg-primary-purple px-4 py-2 rounded-xl shadow active:scale-[0.95]"
        >
          <Text className="text-white text-xs font-bold uppercase tracking-wider">Recharge</Text>
        </TouchableOpacity>
      </View>

      {/* Gifts 8-Grid exactly as in Figma screenshot */}
      <View className="flex-row flex-wrap px-5 py-4 justify-between gap-y-4">
        {GIFT_CATALOG.map((gift) => {
          const isSelected = gift.id === selectedGiftId;
          return (
            <TouchableOpacity
              key={gift.id}
              onPress={() => setSelectedGiftId(gift.id)}
              className="w-[23%] items-center"
              activeOpacity={0.7}
            >
              <View 
                className="w-[68px] h-[68px] rounded-2xl justify-center items-center relative border"
                style={
                  isSelected 
                    ? { backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: '#A855F7' }
                    : { backgroundColor: 'rgba(25, 12, 44, 0.65)', borderColor: 'rgba(255, 255, 255, 0.05)' }
                }
              >
                <Text style={{ fontSize: 26 }} className="mb-0.5">{gift.icon}</Text>
                
                {/* Cost Tag */}
                <View className="absolute bottom-1 bg-black/40 px-1 rounded">
                  <Text className="text-yellow-400 text-[8px] font-bold">{gift.cost}</Text>
                </View>
              </View>
              <Text className="text-white/80 text-[10px] font-medium mt-1" numberOfLines={1}>{gift.name}</Text>
            </TouchableOpacity>
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
        <TouchableOpacity
          onPress={handleSendGift}
          className="bg-primary-purple py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-primary-purple/30"
        >
          <Text className="text-white text-sm font-bold uppercase tracking-wider">
            Send {selectedGift.name} ({selectedGift.cost})
          </Text>
        </TouchableOpacity>
        
        {/* Notice text below the button */}
        <Text className="text-white/30 text-[8px] text-center mt-2.5 leading-3">
          By sending a gift, you agree to our Terms of Service and virtual goods policy.
        </Text>
      </View>

      </MotiView>

      {/* Premium Insufficient Balance Modal */}
      {showInsufficientModal && (
        <View style={StyleSheet.absoluteFill} className="z-[100] flex-1 bg-black/80 items-center justify-center px-6">
          <View className="bg-[#1A0E2C] w-full rounded-3xl p-6 items-center border border-[#EF4444]/30 shadow-2xl shadow-[#EF4444]/20">
            <View className="w-16 h-16 rounded-full bg-[#EF4444]/20 items-center justify-center mb-4">
              <Coins size={32} color="#EF4444" />
            </View>
            <Text className="text-white text-xl font-black mb-2 text-center">Insufficient Balance</Text>
            <Text className="text-neutral-silver text-xs text-center leading-5 mb-6 px-4">
              You need {selectedGift.cost - coinBalance} more coins to send this {selectedGift.name}. Recharge your wallet!
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setShowInsufficientModal(false);
                rechargeCoins(500);
                setShowSuccessModal(true);
              }}
              className="bg-[#A855F7] w-full py-4 rounded-xl items-center active:scale-95 transition-all mb-3"
            >
              <Text className="text-white font-bold text-sm">Recharge 500 Coins</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowInsufficientModal(false)}
              className="py-2"
            >
              <Text className="text-white/50 font-medium text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Premium Recharge Success Modal */}
      {showSuccessModal && (
        <View style={StyleSheet.absoluteFill} className="z-[100] flex-1 bg-black/80 items-center justify-center px-6">
          <View className="bg-[#1A0E2C] w-full rounded-3xl p-6 items-center border border-[#10B981]/30 shadow-2xl shadow-[#10B981]/20">
            <View className="w-16 h-16 rounded-full bg-[#10B981]/20 items-center justify-center mb-4">
              <Award size={32} color="#10B981" />
            </View>
            <Text className="text-white text-xl font-black mb-2 text-center">Recharge Success!</Text>
            <Text className="text-neutral-silver text-xs text-center leading-5 mb-6 px-4">
              Successfully added coins to your wallet balance. Keep spreading the vibe!
            </Text>
            <TouchableOpacity 
              onPress={() => setShowSuccessModal(false)}
              className="bg-[#10B981] w-full py-4 rounded-xl items-center active:scale-95 transition-all"
            >
              <Text className="text-white font-bold text-sm">Awesome</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};
