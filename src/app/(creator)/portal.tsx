import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BarChart2, Star, Target, Shield, Settings } from 'lucide-react-native';
import { useAuthStore } from '../../store';

const ActionCard = ({ icon: Icon, title, description, onPress }: any) => (
  <Pressable onPress={onPress} className="bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 gap-2 mb-4">
    <View className="flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-full bg-[#A855F7]/10 items-center justify-center border border-[#A855F7]/20">
        <Icon size={20} color="#A855F7" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-sm">{title}</Text>
        <Text className="text-neutral-grey text-xs mt-1 leading-5">{description}</Text>
      </View>
    </View>
  </Pressable>
);

export default function CreatorPortalScreen() {
  const router = useRouter();

  const { userProfile } = useAuthStore();
  const level = Math.floor((userProfile?.followersCount || 0) / 100) + 1;

  return (
    <View className="flex-1 bg-[#12081E] pt-14">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-6 border-b border-white/5">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-base ml-2">Creator Portal</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ gap: 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center py-6 gap-2">
          <Star size={48} color={userProfile?.isVerified ? "#FACC15" : "#9CA3AF"} fill={userProfile?.isVerified ? "#FACC15" : "transparent"} />
          <Text className="text-white text-xl font-bold mt-2">Level {level} Creator</Text>
          <Text className="text-neutral-grey text-sm text-center px-6">
            You have {userProfile?.followersCount || 0} followers and {userProfile?.giftsReceivedCount || 0} gifts! Keep up the great work.
          </Text>
        </View>

        <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-4 mb-2">Creator Tools</Text>

        <ActionCard 
          icon={BarChart2} 
          title="Creator Analytics" 
          description="Deep dive into your audience, views, and engagement metrics." 
          onPress={() => router.push('/analytics')}
        />
        <ActionCard 
          icon={Target} 
          title="Content Performance" 
          description="See which of your videos are trending and why." 
          onPress={() => router.push('/analytics')}
        />
        <ActionCard 
          icon={Shield} 
          title="Creator Verification" 
          description="Apply for the verified badge and unlock exclusive features." 
          onPress={() => router.push('/kyc')}
        />
        <ActionCard 
          icon={Settings} 
          title="Creator Settings" 
          description="Manage your specific creator account preferences." 
          onPress={() => router.push('/settings')}
        />

      </ScrollView>
    </View>
  );
}
