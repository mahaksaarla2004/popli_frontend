import React from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, Alert, Share, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, useWalletStore } from '../store';
import { ArrowLeft, Gift, Users, Wallet, Video, UserPlus, MessageCircle, Aperture, X, Share2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ReferralsScreen() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const { inrEarnings } = useWalletStore();

  const handleCopyLink = () => {
    Alert.alert('Copied', 'Your referral link has been copied to clipboard!');
  };

  const referralLink = `app.vibe/${userProfile?.username || 'user'}`;

  const handleShareSpecific = async (platform: string) => {
    const message = encodeURIComponent(`Join Vibe and let's earn rewards together! Use my link: ${referralLink}`);
    try {
      if (platform === 'whatsapp') {
        await Linking.openURL(`whatsapp://send?text=${message}`);
      } else if (platform === 'twitter') {
        await Linking.openURL(`twitter://post?message=${message}`);
      } else {
        await Share.share({ message: decodeURIComponent(message) });
      }
    } catch (error) {
      // Fallback to generic system share if the specific app is not installed
      await Share.share({ message: decodeURIComponent(message) });
    }
  };

  return (
    <View className="flex-1 bg-background-plum pt-12">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-base">Referrals & Rewards</Text>
        <View className="w-8" />
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 64, gap: 24 }}
      >
        {/* Banner Card */}
        <View className="rounded-3xl p-6 items-center justify-center overflow-hidden" style={{ backgroundColor: '#21133D' }}>
          <View className="absolute top-0 right-0 left-0 bottom-0 opacity-40 bg-gradient-to-br from-[#A855F7] to-transparent" />
          
          <View className="w-16 h-16 rounded-full items-center justify-center border border-[#A855F7]/30 mb-4" style={{ backgroundColor: '#A855F720' }}>
            <Gift size={26} color="#A855F7" />
          </View>
          
          <Text className="text-white text-2xl font-black text-center leading-8">
            Invite Friends &
          </Text>
          <Text className="text-[#A855F7] text-2xl font-black text-center leading-8 mb-4">
            Earn Real Cash
          </Text>
          
          <Text className="text-neutral-silver text-[11px] text-center leading-5 px-4 font-medium">
            Build your squad on Vibe and unlock premium milestones together.
          </Text>
        </View>

        {/* Personal Link */}
        <View className="gap-4">
          <Text className="text-neutral-grey text-[10px] font-bold uppercase tracking-widest">Your Personal Link</Text>
          <View className="flex-row items-center justify-between bg-[#150B24] rounded-2xl p-2 border border-white/5">
            <Text className="text-white/80 text-xs font-semibold pl-4">{referralLink}</Text>
            <Pressable 
              onPress={handleCopyLink}
              className="bg-[#A855F7] px-5 py-3 rounded-xl shadow-sm shadow-[#A855F7]/30"
            >
              <Text className="text-white text-xs font-bold">Copy Link</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between gap-4">
          <Pressable 
            onPress={() => router.push('/(settings)/referral-list')}
            className="flex-1 bg-[#1A0E2C] rounded-3xl py-6 px-4 border border-white/5 shadow-sm shadow-black/20 justify-center"
          >
            <View className="mb-4">
              <Users size={22} color="#A855F7" />
            </View>
            <Text className="text-white font-black text-[28px]">0</Text>
            <Text className="text-neutral-grey text-[11px] font-medium mt-2">Total Referrals</Text>
          </Pressable>

          <Pressable 
            onPress={() => router.push('/(creator)/earnings')}
            className="flex-1 bg-[#1A0E2C] rounded-3xl py-6 px-4 border border-white/5 shadow-sm shadow-black/20 justify-center"
          >
            <View className="mb-4">
              <Wallet size={22} color="#FACC15" />
            </View>
            <Text className="text-white font-black text-[28px]">₹{inrEarnings.toLocaleString('en-IN')}</Text>
            <Text className="text-neutral-grey text-[11px] font-medium mt-2">Earnings (₹)</Text>
          </Pressable>
        </View>

        {/* Reward Tiers */}
        <View className="gap-4">
          <Text className="text-neutral-grey text-[10px] font-bold uppercase tracking-widest">Reward Tiers</Text>
          
          <View className="gap-4">
            {/* Tier 1 */}
            <View className="flex-row items-center justify-between bg-[#1A0E2C] rounded-2xl p-4 border-l-4 border-l-[#A855F7] border-y border-r border-white/5 shadow-sm shadow-black/20">
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-11 h-11 rounded-full bg-[#A855F7]/10 items-center justify-center">
                  <Video size={18} color="#A855F7" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-white text-[14px] font-bold">Creator Referral</Text>
                  <Text className="text-neutral-grey text-[11px] mt-1">Friends with 1k+ followers</Text>
                </View>
              </View>
              <Text className="text-[#A855F7] text-xl font-black tracking-wide">₹50</Text>
            </View>

            {/* Tier 2 */}
            <View className="flex-row items-center justify-between bg-[#150B24] rounded-2xl p-4 border border-white/5">
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-11 h-11 rounded-full bg-white/5 items-center justify-center">
                  <UserPlus size={18} color="#9CA3AF" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-white text-[14px] font-bold">Standard User</Text>
                  <Text className="text-neutral-grey text-[11px] mt-1">New viewers and fans</Text>
                </View>
              </View>
              <Text className="text-white text-xl font-black tracking-wide">₹20</Text>
            </View>
          </View>
        </View>

        {/* Share Instant Invite */}
        <View className="items-center gap-4">
          <Text className="text-neutral-grey text-[10px] font-bold uppercase tracking-widest">Share Instant Invite</Text>
          
          <View className="flex-row justify-center w-full gap-8">
            <View className="items-center">
              <Pressable 
                onPress={() => handleShareSpecific('whatsapp')}
                className="w-14 h-14 rounded-full items-center justify-center shadow-sm"
                style={{ backgroundColor: '#10B981', shadowColor: '#10B981' }}
              >
                <MessageCircle size={24} color="#FFFFFF" />
              </Pressable>
              <Text className="text-neutral-grey text-[9px] font-medium mt-2">WhatsApp</Text>
            </View>

            <View className="items-center">
              <Pressable 
                onPress={() => handleShareSpecific('generic')}
                className="w-14 h-14 rounded-full items-center justify-center shadow-sm"
                style={{ backgroundColor: '#F97316', shadowColor: '#F97316' }}
              >
                <Aperture size={24} color="#FFFFFF" />
              </Pressable>
              <Text className="text-neutral-grey text-[9px] font-medium mt-2">Stories</Text>
            </View>

            <View className="items-center">
              <Pressable 
                onPress={() => handleShareSpecific('twitter')}
                className="w-14 h-14 rounded-full items-center justify-center shadow-sm"
                style={{ backgroundColor: '#FFFFFF', shadowColor: '#FFFFFF' }}
              >
                <X size={24} color="#000000" />
              </Pressable>
              <Text className="text-neutral-grey text-[9px] font-medium mt-2">X / Twitter</Text>
            </View>

            <View className="items-center">
              <Pressable 
                onPress={() => handleShareSpecific('generic')}
                className="w-14 h-14 rounded-full items-center justify-center shadow-sm"
                style={{ backgroundColor: '#A855F7', shadowColor: '#A855F7' }}
              >
                <Share2 size={24} color="#FFFFFF" />
              </Pressable>
              <Text className="text-neutral-grey text-[9px] font-medium mt-2">More</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
