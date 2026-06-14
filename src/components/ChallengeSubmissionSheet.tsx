import React from 'react';
import { View, Text, Pressable, ScrollView, Modal, StyleSheet } from 'react-native';
import { Play, X } from 'lucide-react-native';

interface ChallengeSubmissionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ChallengeSubmissionSheet({ visible, onClose, onSubmit }: ChallengeSubmissionSheetProps) {
  const recentVideos = [
    { id: '1', title: 'Indore', views: 174, category: 'Dance' },
    { id: '2', title: 'My new video', views: 50, category: 'Music' },
  ];

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
            <Text className="text-white font-bold text-xl">Pick a Video to Submit</Text>
            <Pressable onPress={onClose} className="p-2 -mr-2 bg-[#2D1B4E] rounded-full active:opacity-70">
              <X size={20} color="white" />
            </Pressable>
          </View>
          <Text className="text-white/60 mb-6">Choose one of your recent videos as your challenge entry</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {recentVideos.map((video) => (
              <Pressable
                key={video.id}
                onPress={onSubmit}
                className="bg-[#0D0518] border border-[#3E2B5C] rounded-2xl p-4 flex-row items-center active:bg-[#2D1B4E] transition-colors"
              >
                <View className="w-16 h-20 bg-blue-900/40 rounded-xl items-center justify-center mr-4 relative overflow-hidden">
                   <View className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                   <Play size={24} color="white" fill="transparent" opacity={0.8} />
                </View>
                
                <View className="flex-1">
                  <Text className="text-white font-bold text-base mb-1">{video.title}</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-white/50 text-xs flex-row items-center gap-1">
                      👁 {video.views}
                    </Text>
                    <Text className="text-white/30 text-xs">•</Text>
                    <Text className="text-white/50 text-xs">{video.category}</Text>
                  </View>
                </View>

                <Text className="text-white/50 text-lg">›</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
