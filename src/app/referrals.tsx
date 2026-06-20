import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, Share, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ChevronLeft, User, Link as LinkIcon, Star, UserPlus, Trophy, Send } from 'lucide-react-native';
import { apiClient } from '../api/client';

const { width } = Dimensions.get('window');

export default function ReferralsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [configs, setConfigs] = useState<any>({});
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, configRes, referralsRes] = await Promise.all([
          apiClient.get('/users/me'),
          apiClient.get('/system/configs?keys=REFERRAL_CREATOR_REWARD,REFERRAL_STANDARD_REWARD,REFERRAL_SUPER_REWARD'),
          apiClient.get('/users/me/referrals')
        ]);
        setProfile(profileRes.data);
        setConfigs(configRes.data);
        setReferralsList(referralsRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const referralCode = profile?.referralCode || 'G7BML8CS';
  const referralLink = `app.popli.in/join/${referralCode}`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Popli using my referral code: ${referralCode}\n${referralLink}`,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0D0518] items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0D0518] pt-14 relative">
      {/* Header */}
      <View className="flex-row items-center justify-center relative px-4 pb-6">
        <Pressable onPress={() => router.back()} className="absolute left-4 top-0 p-2 -ml-2 active:opacity-70">
          <ChevronLeft color="white" size={28} />
        </Pressable>
        <Text className="text-white font-bold text-xl">Referrals & Rewards</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        
        {/* Purple Banner */}
        <View className="bg-gradient-to-br from-[#A855F7] to-[#8B5CF6] rounded-3xl p-6 items-center mb-6 shadow-lg shadow-[#8B5CF6]/20">
          <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4 border border-white/30">
            <User size={32} color="white" />
          </View>
          <Text className="text-white font-black text-2xl text-center mb-2 leading-8">
            Invite Friends &{"\n"}Earn Real Cash
          </Text>
          <Text className="text-white/90 text-center text-sm px-4">
            Build your squad on Popli and unlock premium milestones together.
          </Text>
        </View>

        {/* Your Referral Code */}
        <Text className="text-white font-bold text-base mb-3">Your Referral Code</Text>
        <Pressable 
          onPress={handleCopyCode}
          className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl py-5 mb-2 items-center active:opacity-70"
        >
          <Text className="text-[#A855F7] font-black text-2xl tracking-[0.2em]">{referralCode}</Text>
        </Pressable>
        <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-3 flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-2 flex-1 overflow-hidden pr-4">
            <LinkIcon size={16} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm" numberOfLines={1}>{referralLink}</Text>
          </View>
          <Pressable 
            onPress={handleCopyLink}
            className="bg-[#8B5CF6] px-4 py-2 rounded-xl active:opacity-80"
          >
            <Text className="text-white font-bold text-sm">Copy</Text>
          </Pressable>
        </View>

        {/* Your Referred Friends */}
        <Text className="text-white font-bold text-base mb-3">Your Referred Friends ({referralsList.length})</Text>
        
        {referralsList.length === 0 ? (
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-6 items-center mb-6">
            <User size={32} color="#6B7280" className="mb-3" />
            <Text className="text-white font-bold text-lg mb-2">No referrals yet</Text>
            <Text className="text-gray-400 text-center text-sm leading-5">
              Share your code below to start earning bonus rewards for each friend who joins Popli.
            </Text>
          </View>
        ) : (
          <View className="mb-6 gap-3">
            {referralsList.map((ref: any, idx: number) => (
              <View key={idx} className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  {ref.referredUser?.avatar ? (
                    <Image source={{ uri: ref.referredUser.avatar }} className="w-12 h-12 rounded-full border border-white/10" />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center border border-white/20">
                      <User size={20} color="white" />
                    </View>
                  )}
                  <View>
                    <Text className="text-white font-bold text-base">{ref.referredUser?.name || 'Unknown User'}</Text>
                    <Text className="text-gray-400 text-xs mt-1">@{ref.referredUser?.username || 'unknown'}</Text>
                  </View>
                </View>
                <View className={`px-3 py-1 rounded-full border ${ref.status === 'COMPLETED' ? 'bg-[#34D399]/10 border-[#34D399]/30' : 'bg-[#F59E0B]/10 border-[#F59E0B]/30'}`}>
                  <Text className={`text-xs font-bold ${ref.status === 'COMPLETED' ? 'text-[#34D399]' : 'text-[#F59E0B]'}`}>
                    {ref.status === 'COMPLETED' ? 'Earned ₹100' : 'Pending KYC'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Reward Tiers */}
        <Text className="text-white font-bold text-base mb-3">Reward Tiers</Text>
        
        <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-[#F59E0B]/10 rounded-full items-center justify-center border border-[#F59E0B]/20">
              <Star size={20} color="#FBBF24" />
            </View>
            <View>
              <Text className="text-white font-bold text-base">Creator Referral</Text>
              <Text className="text-gray-400 text-xs mt-1">Referred friend with 1K+ followers</Text>
            </View>
          </View>
          <Text className="text-[#34D399] font-bold text-lg">₹{configs?.REFERRAL_CREATOR_REWARD ?? 50}</Text>
        </View>

        <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-[#60A5FA]/10 rounded-full items-center justify-center border border-[#60A5FA]/20">
              <UserPlus size={20} color="#60A5FA" />
            </View>
            <View>
              <Text className="text-white font-bold text-base">Standard User</Text>
              <Text className="text-gray-400 text-xs mt-1">New viewer or fan account</Text>
            </View>
          </View>
          <Text className="text-[#34D399] font-bold text-lg">₹{configs?.REFERRAL_STANDARD_REWARD ?? 20}</Text>
        </View>

        <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-4 flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-[#A855F7]/10 rounded-full items-center justify-center border border-[#A855F7]/20">
              <Trophy size={20} color="#A855F7" />
            </View>
            <View>
              <Text className="text-white font-bold text-base">Super Referral</Text>
              <Text className="text-gray-400 text-xs mt-1">Refer 10+ creators this month</Text>
            </View>
          </View>
          <Text className="text-[#34D399] font-bold text-lg">₹{configs?.REFERRAL_SUPER_REWARD ?? 500}</Text>
        </View>

      </ScrollView>

      {/* Bottom Sticky Share Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-[#0D0518]/90">
        <Text className="text-white font-bold text-base mb-3">Share Your Invite</Text>
        <Pressable 
          onPress={handleShare}
          className="bg-[#8B5CF6] w-full py-4 rounded-2xl flex-row justify-center items-center gap-2 active:scale-[0.98]"
        >
          <Send size={20} color="white" />
          <Text className="text-white font-bold text-lg">Share Invite Link</Text>
        </Pressable>
      </View>

    </View>
  );
}
