import React from 'react';
import { View, Text, Pressable, ScrollView, Modal, StyleSheet } from 'react-native';
import { Play, X } from 'lucide-react-native';

interface ChallengeSubmissionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  challengeId?: string;
}

export default function ChallengeSubmissionSheet({ visible, onClose, onSubmit, challengeId }: ChallengeSubmissionSheetProps) {
  const router = require('expo-router').useRouter();
  


  const handleRecordNew = () => {
    onClose();
    if (challengeId) {
      router.push({ pathname: '/(tabs)/create', params: { challengeId } });
    } else {
      router.push('/(tabs)/create');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        
        <View className="bg-[#1D1037] rounded-t-3xl pt-2 pb-8 px-4 border-t border-[#3E2B5C] min-h-[50%]">
          {/* Handle */}
          <View className="w-12 h-1.5 bg-[#3E2B5C] rounded-full self-center mb-6" />
          
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white font-bold text-xl">Submit Entry</Text>
            <Pressable onPress={onClose} className="p-2 -mr-2 bg-[#2D1B4E] rounded-full active:opacity-70">
              <X size={20} color="white" />
            </Pressable>
          </View>
          <Text className="text-white/60 mb-6">Record a new video or choose a recent one</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {/* Record New Button */}
            <Pressable
              onPress={handleRecordNew}
              className="bg-gradient-to-r from-[#A855F7] to-[#D946EF] rounded-2xl p-4 flex-row items-center justify-center active:opacity-80 mt-2"
            >
              <Text className="text-white font-bold text-lg">🎥 Record New Video</Text>
            </Pressable>

            {/* In a real implementation we would fetch user's recent reels here */}
            <View className="items-center justify-center mt-6 p-4">
              <Text className="text-white/40 text-sm text-center">To submit a recent video, go to your profile and link it to the challenge.</Text>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
