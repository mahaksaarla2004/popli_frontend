import React, { useState } from 'react';
import { View, Text, Pressable, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { ChevronLeft, Sparkles, Bell, Image, Camera, Mic } from 'lucide-react-native';

// Safe mock wrapper or conditional execution for camera/mic permissions
export default function PermissionsScreen() {
  const router = useRouter();
  const { toggleNotifications } = useAuthStore();

  const [permissionsState, setPermissionsState] = useState({
    notifications: false,
    media: false,
    camera: false,
    mic: false,
  });

  const handleRequestPermission = async (key: 'notifications' | 'media' | 'camera' | 'mic') => {
    // Toggling the state to simulate/enable success visually
    setPermissionsState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    if (key === 'notifications') {
      toggleNotifications();
    }
  };

  const handleRequestAll = () => {
    // Bulk grant permissions for quick onboarding bypass
    setPermissionsState({
      notifications: true,
      media: true,
      camera: true,
      mic: true,
    });

    setTimeout(() => {
      router.push('/(auth)/personalization-loader');
    }, 450);
  };

  const handleNext = () => {
    router.push('/(auth)/personalization-loader');
  };

  return (
    <View className="flex-1 bg-[#0B001A] justify-between py-8 px-6" style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
      
      {/* Top Navigation Row */}
      <View className="flex-row items-center justify-between w-full h-12">
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/5 items-center justify-center active:scale-[0.9]"
        >
          <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
        <View className="flex-row items-center space-x-1.5 bg-primary-pink/15 px-3 py-1.5 rounded-full border border-primary-pink/20">
          <Sparkles size={11} color="#EC4899" />
          <Text className="text-primary-pink text-[9px] font-black uppercase tracking-wider">Step 4 of 4</Text>
        </View>
      </View>

      {/* Checklist Grid */}
      <View className="flex-1 justify-center my-4">
        
        <View className="space-y-1 mb-6">
          <Text className="text-white font-black text-3xl tracking-tight">Access Permissions</Text>
          <Text className="text-white/50 text-xs">Enable these features to create, capture, and share your hyperlocal vibe.</Text>
        </View>

        <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          
          {/* Notifications Card */}
          <Pressable 
            onPress={() => handleRequestPermission('notifications')}
            className={`p-5 rounded-3xl border flex-row items-center active:scale-[0.98] transition-all ${
              permissionsState.notifications 
                ? 'bg-primary-purple/10 border-primary-pink/40' 
                : 'bg-[#190C2C]/50 border-white/5'
            }`}
          >
            <View className={`p-3.5 rounded-2xl ${permissionsState.notifications ? 'bg-primary-pink/20' : 'bg-white/5'}`}>
              <Bell size={20} color={permissionsState.notifications ? '#EC4899' : '#FFFFFF'} />
            </View>
            <View className="flex-1 ml-4 mr-3">
              <Text className="text-white font-bold text-[15px] mb-1">Push Notifications</Text>
              <Text className="text-white/40 text-[11px] leading-4">Receive coin recharge, gifting, and comment alerts.</Text>
            </View>
            <View className={`w-6 h-6 rounded-full items-center justify-center border ${
              permissionsState.notifications ? 'bg-primary-pink border-primary-pink' : 'border-white/10'
            }`}>
              {permissionsState.notifications && <Text className="text-white text-[9px] font-black">✓</Text>}
            </View>
          </Pressable>

          {/* Media access Card */}
          <Pressable 
            onPress={() => handleRequestPermission('media')}
            className={`p-5 rounded-3xl border flex-row items-center active:scale-[0.98] transition-all ${
              permissionsState.media 
                ? 'bg-primary-purple/10 border-primary-pink/40' 
                : 'bg-[#190C2C]/50 border-white/5'
            }`}
          >
            <View className={`p-3.5 rounded-2xl ${permissionsState.media ? 'bg-primary-pink/20' : 'bg-white/5'}`}>
              <Image size={20} color={permissionsState.media ? '#EC4899' : '#FFFFFF'} />
            </View>
            <View className="flex-1 ml-4 mr-3">
              <Text className="text-white font-bold text-[15px] mb-1">Media & Gallery</Text>
              <Text className="text-white/40 text-[11px] leading-4">Select and upload video recordings from local storage.</Text>
            </View>
            <View className={`w-6 h-6 rounded-full items-center justify-center border ${
              permissionsState.media ? 'bg-primary-pink border-primary-pink' : 'border-white/10'
            }`}>
              {permissionsState.media && <Text className="text-white text-[9px] font-black">✓</Text>}
            </View>
          </Pressable>

          {/* Camera Card */}
          <Pressable 
            onPress={() => handleRequestPermission('camera')}
            className={`p-5 rounded-3xl border flex-row items-center active:scale-[0.98] transition-all ${
              permissionsState.camera 
                ? 'bg-primary-purple/10 border-primary-pink/40' 
                : 'bg-[#190C2C]/50 border-white/5'
            }`}
          >
            <View className={`p-3.5 rounded-2xl ${permissionsState.camera ? 'bg-primary-pink/20' : 'bg-white/5'}`}>
              <Camera size={20} color={permissionsState.camera ? '#EC4899' : '#FFFFFF'} />
            </View>
            <View className="flex-1 ml-4 mr-3">
              <Text className="text-white font-bold text-[15px] mb-1">Video Camera</Text>
              <Text className="text-white/40 text-[11px] leading-4">Capture original videos directly using the custom app lens.</Text>
            </View>
            <View className={`w-6 h-6 rounded-full items-center justify-center border ${
              permissionsState.camera ? 'bg-primary-pink border-primary-pink' : 'border-white/10'
            }`}>
              {permissionsState.camera && <Text className="text-white text-[9px] font-black">✓</Text>}
            </View>
          </Pressable>

          {/* Microphone Card */}
          <Pressable 
            onPress={() => handleRequestPermission('mic')}
            className={`p-5 rounded-3xl border flex-row items-center active:scale-[0.98] transition-all ${
              permissionsState.mic 
                ? 'bg-primary-purple/10 border-primary-pink/40' 
                : 'bg-[#190C2C]/50 border-white/5'
            }`}
          >
            <View className={`p-3.5 rounded-2xl ${permissionsState.mic ? 'bg-primary-pink/20' : 'bg-white/5'}`}>
              <Mic size={20} color={permissionsState.mic ? '#EC4899' : '#FFFFFF'} />
            </View>
            <View className="flex-1 ml-4 mr-3">
              <Text className="text-white font-bold text-[15px] mb-1">Microphone Audio</Text>
              <Text className="text-white/40 text-[11px] leading-4">Record high-fidelity audio voiceovers & sounds during shoots.</Text>
            </View>
            <View className={`w-6 h-6 rounded-full items-center justify-center border ${
              permissionsState.mic ? 'bg-primary-pink border-primary-pink' : 'border-white/10'
            }`}>
              {permissionsState.mic && <Text className="text-white text-[9px] font-black">✓</Text>}
            </View>
          </Pressable>

        </ScrollView>
      </View>

      {/* Footer Navigation CTA */}
      <View className="w-full space-y-4">
        
        {/* Enable All Button */}
        <Pressable
          onPress={handleRequestAll}
          className="bg-primary-purple py-4 rounded-2xl items-center justify-center shadow-lg shadow-primary-purple/40 active:scale-[0.98]"
        >
          <Text className="text-white text-sm font-bold uppercase tracking-wider">Enable All & Setup Feed</Text>
        </Pressable>

        {/* Skip button */}
        <Pressable onPress={handleNext} className="items-center py-1">
          <Text className="text-white/40 text-xs font-semibold hover:underline">Configure Later in Settings</Text>
        </Pressable>
      </View>

    </View>
  );
}
