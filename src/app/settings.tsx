import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, useKYCStore } from '../store';
import { 
  ArrowLeft, Star, CreditCard, BarChart2, Clock, 
  Heart, Download, Bell, Database, Lock, Ban, 
  UserPlus, HelpCircle, AlertOctagon, Info, ChevronRight 
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { userProfile, notificationsEnabled, toggleNotifications, logout } = useAuthStore();
  const { resetKYC } = useKYCStore();

  const [dataSaver, setDataSaver] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            logout();
            resetKYC();
            router.replace('/login');
          } 
        }
      ]
    );
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-neutral-grey text-[10px] font-bold uppercase tracking-widest pl-1 mt-6 mb-3">{title}</Text>
  );

  const ListItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    rightElement, 
    onPress 
  }: { 
    icon: any, 
    title: string, 
    subtitle?: string, 
    rightElement?: React.ReactNode,
    onPress?: () => void 
  }) => (
    <Pressable 
      onPress={onPress}
      className="flex-row items-center justify-between bg-[#1A0E2C] border-b border-[#2D1B4E]/50 px-4 py-4"
    >
      <View className="flex-row items-center space-x-3">
        <Icon size={20} color="#9CA3AF" />
        <View>
          <Text className="text-white font-medium text-sm">{title}</Text>
          {subtitle && <Text className="text-neutral-grey text-[10px] mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <ChevronRight size={18} color="#4B5563" />}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-[#12081E] pt-14">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-4">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-base ml-2">Settings</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View className="bg-[#1A0E2C] rounded-2xl mx-4 mt-2 p-4 flex-row items-center justify-between border border-white/5">
          <View className="flex-row items-center space-x-4">
            <View className="w-14 h-14 rounded-full bg-[#F59E0B]/20 items-center justify-center border-2 border-[#F59E0B]/50">
              {/* Silhouette placeholder as per Figma */}
              <UserPlus size={24} color="#F59E0B" />
            </View>
            <View>
              <Text className="text-white font-bold text-base">Alex Rivera</Text>
              <Text className="text-neutral-grey text-xs">@ALEX_CURATES</Text>
            </View>
          </View>
          <Pressable 
            onPress={() => router.push('/edit-profile')}
            className="bg-[#A855F7] px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold text-xs uppercase">Edit Profile</Text>
          </Pressable>
        </View>

        <View className="px-4">
          
          {/* MONETIZATION */}
          <SectionTitle title="Monetization" />
          
          <Pressable className="flex-row items-center justify-between bg-[#1A0E2C] rounded-2xl p-4 mb-3 shadow-sm border border-white/5" style={{ borderLeftWidth: 4, borderLeftColor: '#FACC15' }}>
            <View className="flex-row items-center space-x-3">
              <View className="w-8 h-8 rounded-full bg-[#FACC15]/10 items-center justify-center border border-[#FACC15]/20">
                <Star size={16} color="#FACC15" fill="#FACC15" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm">Creator Portal</Text>
                <Text className="text-neutral-grey text-[10px] mt-0.5">View your growth & tools</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#4B5563" />
          </Pressable>

          <View className="flex-row justify-between mb-2" style={{ gap: 12 }}>
            <Pressable className="flex-1 bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 justify-between shadow-sm" style={{ minHeight: 90 }}>
              <View className="mb-2">
                <CreditCard size={20} color="#EC4899" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm mb-0.5">Payout Settings</Text>
                <Text className="text-neutral-grey text-[9px] uppercase tracking-wider">Configure</Text>
              </View>
            </Pressable>

            <Pressable className="flex-1 bg-[#1A0E2C] border border-white/5 rounded-2xl p-4 justify-between shadow-sm" style={{ minHeight: 90 }}>
              <View className="mb-2">
                <BarChart2 size={20} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm mb-0.5">Earnings History</Text>
                <Text className="text-neutral-grey text-[9px] uppercase tracking-wider">Last 30 Days</Text>
              </View>
            </Pressable>
          </View>

          {/* CONTENT & ACTIVITY */}
          <SectionTitle title="Content & Activity" />
          <View className="rounded-2xl overflow-hidden border border-white/5 bg-[#1A0E2C]">
            <ListItem icon={Clock} title="Watch History" />
            <ListItem icon={Heart} title="Liked Videos" />
            <ListItem icon={Download} title="Downloads" />
          </View>

          {/* PREFERENCES */}
          <SectionTitle title="Preferences" />
          <View className="rounded-2xl overflow-hidden border border-white/5 bg-[#1A0E2C]">
            <ListItem 
              icon={Bell} 
              title="Push Notifications" 
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: '#374151', true: '#A855F7' }}
                  thumbColor={'#FFFFFF'}
                />
              } 
            />
            <ListItem 
              icon={Database} 
              title="Data Saver" 
              rightElement={
                <Switch
                  value={dataSaver}
                  onValueChange={setDataSaver}
                  trackColor={{ false: '#374151', true: '#A855F7' }}
                  thumbColor={'#FFFFFF'}
                />
              } 
            />
          </View>

          {/* PRIVACY & SAFETY */}
          <SectionTitle title="Privacy & Safety" />
          <View className="rounded-2xl overflow-hidden border border-white/5 bg-[#1A0E2C]">
            <ListItem 
              icon={Lock} 
              title="Account Privacy" 
              rightElement={<Text className="text-neutral-grey text-xs">Public</Text>} 
            />
            <ListItem icon={Ban} title="Blocked Accounts" />
          </View>

          {/* SUPPORT */}
          <SectionTitle title="Support" />
          <View className="rounded-2xl overflow-hidden border border-white/5 bg-[#1A0E2C]">
            <ListItem icon={UserPlus} title="Refer a Friend" onPress={() => router.push('/referrals')} />
            <ListItem icon={HelpCircle} title="Help Center" />
            <ListItem icon={AlertOctagon} title="Report a Problem" />
            <ListItem icon={Info} title="About" />
          </View>

          {/* LOG OUT */}
          <Pressable onPress={handleLogout} className="mt-8 mb-4 items-center py-4">
            <Text className="text-[#EF4444] font-bold text-sm tracking-widest">LOG OUT</Text>
          </Pressable>

          {/* FOOTER */}
          <View className="items-center pb-12 opacity-50">
            <Text className="text-neutral-grey text-[10px] font-medium tracking-widest">THE NEON CURATOR</Text>
            <Text className="text-neutral-grey text-[9px] mt-1">v2.0.0 (Preview)</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
