import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, ActivityIndicator, ScrollView, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Award, Coins, Gift, Heart, Crown, Gem, Rocket, PartyPopper, Sparkles, Star, Flower2, Zap, CheckCircle2 } from 'lucide-react-native';
import { useWalletStore, useKYCStore } from '../../store';
import { GIFT_CATALOG } from '../../constants/staticData';
import { Reel } from '../../types';
import { MotiView } from 'moti';

interface GiftSheetProps {
  reel: Reel | null;
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess: (giftIcon: string) => void;
}

const getGiftIconComponent = (id: string, size: number) => {
  switch (id) {
    case 'rocket': return <Rocket color="#F97316" size={size} />;
    case 'rose': return <Flower2 color="#EF4444" size={size} />;
    case 'heart': return <Heart color="#F43F5E" size={size} />;
    case 'crown': return <Crown color="#F59E0B" size={size} />;
    case 'diamond': return <Gem color="#3B82F6" size={size} />;
    case 'party': return <PartyPopper color="#F97316" size={size} />;
    case 'sparkle': return <Sparkles color="#EAB308" size={size} />;
    case 'star': return <Star color="#EAB308" size={size} />;
    default: return <Gift color="#8B5CF6" size={size} />;
  }
};

export const GiftSheet = ({ reel, isOpen, onClose, onSendSuccess }: GiftSheetProps) => {
  const [viewMode, setViewMode] = useState<'gifts' | 'recharge'>('gifts');
  const [selectedGiftId, setSelectedGiftId] = useState<typeof GIFT_CATALOG[number]['id']>('rose');
  const [selectedRechargePack, setSelectedRechargePack] = useState<number | null>(null);
  
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { coinBalance, sendGiftCoins, rechargeCoins } = useWalletStore();
  const { kycCompleted } = useKYCStore();

  const selectedGift = GIFT_CATALOG.find((g) => g.id === selectedGiftId)!;

  const handleSendGift = async () => {
    if (!reel || isSending) return;

    if (coinBalance < selectedGift.cost) {
      setShowInsufficientModal(true);
      return;
    }

    setIsSending(true);
    const success = await sendGiftCoins(reel.creatorId, selectedGift.id, selectedGift.cost, ''); 
    setIsSending(false);
    
    if (success) {
      onClose();
      onSendSuccess(selectedGift.icon);
    } else {
      setShowErrorModal(true);
    }
  };

  const handleRecharge = () => {
    if (!selectedRechargePack) return;

    if (!kycCompleted) {
      Alert.alert(
        'KYC Required',
        'Please complete your KYC verification to recharge coins.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify Now', onPress: () => {
            onClose();
            router.push('/kyc');
          }}
        ]
      );
      return;
    }

    rechargeCoins(selectedRechargePack);
    setShowSuccessModal(true);
    setTimeout(() => {
      setViewMode('gifts');
    }, 1500);
  };

  const RECHARGE_PACKS = [
    { coins: 50, price: 5, tag: null, tagColor: null },
    { coins: 250, price: 20, tag: '20% off', tagColor: 'bg-purple-100 text-purple-600' },
    { coins: 600, price: 45, tag: '25% off', tagColor: 'bg-purple-100 text-purple-600', badge: 'Popular' },
    { coins: 1500, price: 100, tag: '33% off', tagColor: 'bg-purple-100 text-purple-600', bonus: '+100 bonus', bonusCoins: 100 },
    { coins: 3500, price: 200, tag: 'Best value', tagColor: 'bg-green-100 text-green-600', bonus: '+350 bonus', bonusCoins: 350 },
    { coins: 10000, price: 500, tag: '🔥 Max value', tagColor: 'bg-green-100 text-green-600', bonus: '+1,500 bonus', bonusCoins: 1500 },
  ];

  if (!reel) return null;

  return (
    <Modal transparent visible={isOpen} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity className="absolute inset-0 bg-black/40 z-40" onPress={onClose} activeOpacity={1} />

      <MotiView
        from={{ translateY: 600, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        exit={{ translateY: 600, opacity: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 shadow-2xl flex-col"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View className="items-center py-3">
          <View className="w-10 h-1 bg-gray-300 rounded-full" />
        </View>

        {viewMode === 'gifts' ? (
          <>
            <View className="flex-row items-center justify-between px-5 pb-4">
              <View className="flex-row items-center gap-2">
                <Gift size={20} color="#A855F7" />
                <Text className="text-gray-900 font-extrabold text-lg">Send a Gift</Text>
              </View>

              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1.5">
                  <Coins size={14} color="#EAB308" fill="#EAB308" />
                  <Text className="text-yellow-500 font-bold">{coinBalance.toLocaleString()} Coins</Text>
                </View>
                
                <TouchableOpacity 
                  onPress={() => setViewMode('recharge')}
                  className="border border-[#D8B4FE] bg-white px-3 py-1.5 rounded-lg active:scale-95"
                >
                  <Text className="text-[#A855F7] text-xs font-bold">+ Recharge</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="py-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {GIFT_CATALOG.map((gift) => {
                  const isSelected = gift.id === selectedGiftId;
                  return (
                    <TouchableOpacity
                      key={gift.id}
                      onPress={() => setSelectedGiftId(gift.id)}
                      activeOpacity={0.7}
                      className="w-[90px] h-[110px] items-center justify-center rounded-2xl border"
                      style={
                        isSelected 
                          ? { backgroundColor: '#F3E8FF', borderColor: '#D8B4FE' }
                          : { backgroundColor: '#FFFFFF', borderColor: '#F3F4F6' }
                      }
                    >
                      <View className="mb-3">
                        {getGiftIconComponent(gift.id, 32)}
                      </View>
                      <Text className="text-gray-700 font-bold text-xs mb-1">{gift.name}</Text>
                      <View className="flex-row items-center gap-1">
                        <Coins size={10} color="#EAB308" fill="#EAB308" />
                        <Text className="text-gray-500 text-[10px] font-medium">{gift.cost}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View className="px-5 pt-6 pb-2 items-center">
              <Text className="text-gray-500 text-xs mb-3">
                Sending to @{reel.creatorUsername}
              </Text>
              
              <TouchableOpacity
                onPress={handleSendGift}
                disabled={isSending}
                className={`w-full py-4 rounded-xl items-center justify-center ${isSending ? 'bg-[#A855F7]/50' : 'bg-[#A855F7]'}`}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-sm font-bold">Send Gift</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View className="flex-row items-center justify-between px-5 pb-2">
              <View className="flex-row items-center gap-2">
                <View className="bg-yellow-100 p-1.5 rounded-full">
                  <Coins size={16} color="#EAB308" fill="#EAB308" />
                </View>
                <Text className="text-gray-900 font-extrabold text-lg">Recharge Coins</Text>
              </View>
              <TouchableOpacity onPress={() => setViewMode('gifts')} className="p-1.5 rounded-full bg-gray-100 active:scale-95">
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-500 text-xs px-5 mb-4">
              Use coins to send gifts to your favourite creators
            </Text>

            <View className="flex-row flex-wrap px-4 justify-between gap-y-3">
              {RECHARGE_PACKS.map((pack) => {
                const isSelected = selectedRechargePack === pack.coins;
                return (
                  <TouchableOpacity
                    key={pack.coins}
                    onPress={() => setSelectedRechargePack(pack.coins)}
                    activeOpacity={0.7}
                    className="w-[48%] bg-white rounded-2xl p-4 items-center border relative"
                    style={{ borderColor: isSelected ? '#A855F7' : '#F3F4F6' }}
                  >
                    {isSelected && (
                      <View className="absolute top-2 left-2">
                        <CheckCircle2 size={18} color="#EAB308" fill="#FEF08A" />
                      </View>
                    )}
                    {pack.badge && (
                      <View className="absolute -top-2 right-2 bg-[#8B5CF6] px-2 py-0.5 rounded flex-row items-center gap-1">
                        <Text className="text-white text-[8px] font-bold">✨ Popular</Text>
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
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="px-5 pt-6 pb-2">
              <View className="flex-row items-center justify-between gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <Text className="text-gray-500 text-xs">
                  🔒 Secured via Razorpay · PCI-DSS compliant
                </Text>
                <Zap size={14} color="#6B7280" />
              </View>

              <TouchableOpacity
                onPress={handleRecharge}
                className={`w-full py-4 rounded-xl items-center justify-center ${!selectedRechargePack ? 'bg-[#FBBF24]/50' : 'bg-[#F97316]'}`}
                disabled={!selectedRechargePack}
              >
                <Text className="text-black text-sm font-bold">
                  {selectedRechargePack 
                    ? `Pay ₹${RECHARGE_PACKS.find(p => p.coins === selectedRechargePack)?.price} · Get ${(selectedRechargePack + (RECHARGE_PACKS.find(p => p.coins === selectedRechargePack)?.bonusCoins || 0)).toLocaleString()} Coins` 
                    : 'Select a Pack'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </MotiView>

      {showInsufficientModal && (
        <View style={[StyleSheet.absoluteFill, { elevation: 100, zIndex: 100 }]} className="flex-1 bg-black/50 items-center justify-center px-6">
          <MotiView 
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-white w-full rounded-[24px] p-6 items-center shadow-2xl"
          >
            <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
              <Coins size={32} color="#EF4444" />
            </View>
            <Text className="text-gray-900 text-xl font-black mb-2 text-center">Insufficient Balance</Text>
            <Text className="text-gray-500 text-xs text-center leading-5 mb-6 px-4">
              You need {selectedGift.cost - coinBalance} more coins to send this {selectedGift.name}.
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setShowInsufficientModal(false);
                setViewMode('recharge');
              }}
              className="bg-[#A855F7] w-full py-4 rounded-full items-center active:scale-95 transition-all mb-3"
            >
              <Text className="text-white font-bold text-sm">Recharge Coins</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowInsufficientModal(false)}
              className="py-2"
            >
              <Text className="text-gray-400 font-medium text-xs">Cancel</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      )}

      {showSuccessModal && (
        <View style={[StyleSheet.absoluteFill, { elevation: 100, zIndex: 100 }]} className="flex-1 bg-black/50 items-center justify-center px-6">
          <MotiView 
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-white w-full rounded-[24px] p-6 items-center shadow-2xl"
          >
            <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
              <Award size={32} color="#10B981" />
            </View>
            <Text className="text-gray-900 text-xl font-black mb-2 text-center">Recharge Success!</Text>
            <Text className="text-gray-500 text-xs text-center leading-5 mb-6 px-4">
              Successfully added coins to your wallet balance. Keep spreading the vibe!
            </Text>
            <TouchableOpacity 
              onPress={() => setShowSuccessModal(false)}
              className="bg-[#10B981] w-full py-4 rounded-full items-center active:scale-95 transition-all"
            >
              <Text className="text-white font-bold text-sm">Awesome</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      )}

      {showErrorModal && (
        <View style={[StyleSheet.absoluteFill, { elevation: 100, zIndex: 100 }]} className="flex-1 bg-black/50 items-center justify-center px-6">
          <MotiView 
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-white w-full rounded-[24px] p-6 items-center shadow-2xl"
          >
            <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
              <X size={32} color="#EF4444" />
            </View>
            <Text className="text-gray-900 text-xl font-black mb-2 text-center">Transfer Failed</Text>
            <Text className="text-gray-500 text-xs text-center leading-5 mb-6 px-4">
              We couldn't process your gift. Please try again.
            </Text>
            <TouchableOpacity 
              onPress={() => setShowErrorModal(false)}
              className="bg-[#EF4444] w-full py-4 rounded-full items-center active:scale-95 transition-all"
            >
              <Text className="text-white font-bold text-sm">Dismiss</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      )}
    </Modal>
  );
};
