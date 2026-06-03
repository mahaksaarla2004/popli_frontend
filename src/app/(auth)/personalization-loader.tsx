import React, { useState, useEffect } from 'react';
import { View, Text, Platform, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, useFeedStore } from '../../store';
import { Play, Sparkles } from 'lucide-react-native';
import { MotiView } from 'moti';

const PROGRESS_MESSAGES = [
  'Preparing Your Custom Feed...',
  'Finding Nearby Creators...',
  'Curating Viral Reels...',
];

const MOCK_CREATOR_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
];

export default function PersonalizationLoaderScreen() {
  const router = useRouter();
  const { setLogin, userProfile } = useAuthStore();
  const { gpsCity } = useFeedStore();

  const [messageIndex, setMessageIndex] = useState(0);
  const currentCity = gpsCity || userProfile?.city || 'Indore';

  // Cycle messages sequentially every 500ms
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 500);

    return () => clearInterval(messageInterval);
  }, []);

  // Complete personalization after 1.5 seconds
  useEffect(() => {
    const redirectionTimeout = setTimeout(() => {
      // Set authenticated session status to true
      setLogin(true);

      // Instantly replace navigation route to tabs reels feed
      router.replace('/(tabs)');
    }, 1600);

    return () => clearTimeout(redirectionTimeout);
  }, [setLogin, router]);

  return (
    <View style={styles.container} className="bg-[#0B001A] flex-1 justify-center items-center px-6">
      
      {/* Visual Floating Mock Cards (Simulates feed downloading) */}
      <View className="absolute top-20 flex-row space-x-4 w-full justify-center">
        {MOCK_CREATOR_AVATARS.map((avatarUrl, idx) => {
          const delay = idx * 200;
          return (
            <MotiView
              key={idx}
              from={{ opacity: 0, scale: 0.7, translateY: -20 }}
              animate={{ opacity: 0.35, scale: 0.9, translateY: 0 }}
              transition={{ type: 'spring', delay, duration: 800 }}
              className="w-14 h-14 rounded-full border border-primary-pink/30 p-[2px]"
            >
              <Image 
                source={{ uri: avatarUrl }} 
                className="w-full h-full rounded-full"
              />
            </MotiView>
          );
        })}
      </View>

      {/* Main loading emblem */}
      <View className="items-center justify-center relative my-8">
        
        {/* Breathing backdrop shimmer */}
        <MotiView
          from={{ opacity: 0.25, scale: 0.9 }}
          animate={{ opacity: [0.25, 0.6, 0.25], scale: [0.9, 1.25, 0.9] }}
          transition={{ loop: true, type: 'timing', duration: 1500 }}
          className="absolute w-28 h-28 rounded-full bg-primary-purple/10 blur-xl"
        />

        {/* Outer glowing border ring */}
        <MotiView
          from={{ rotate: '0deg' }}
          animate={{ rotate: '360deg' }}
          transition={{ loop: true, type: 'timing', duration: 1500 }}
          className="w-24 h-24 rounded-full border-2 border-dashed border-primary-pink/30 items-center justify-center"
        />

        {/* Center branding box */}
        <MotiView
          from={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="absolute w-16 h-16 bg-gradient-to-tr from-primary-purple via-[#8B5CF6] to-primary-pink p-[2px] rounded-3xl shadow-xl shadow-primary-purple/30 items-center justify-center"
        >
          <View className="w-full h-full bg-[#110125] rounded-[22px] items-center justify-center">
            <Play size={20} color="#D946EF" fill="#D946EF" className="ml-0.5" />
          </View>
        </MotiView>
      </View>

      {/* Progress Messaging */}
      <View className="items-center space-y-3 mt-4 h-16 justify-center">
        <MotiView
          key={messageIndex}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 250 }}
          className="items-center"
        >
          <Text className="text-white font-extrabold text-base tracking-tight text-center">
            {messageIndex === 1 ? `Finding Creators in ${currentCity}...` : PROGRESS_MESSAGES[messageIndex]}
          </Text>
        </MotiView>

        <View className="flex-row items-center space-x-1.5 bg-primary-pink/10 px-3 py-1 rounded-full border border-primary-pink/10">
          <Sparkles size={10} color="#EC4899" />
          <Text className="text-primary-pink text-[9px] font-black uppercase tracking-wider">AI Personalization Enabled</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        cursor: 'default',
      } as any
    })
  }
});
