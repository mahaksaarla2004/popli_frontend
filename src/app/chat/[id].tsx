import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ChevronLeft, Video, Info, Plus, Mic, Image as ImageIcon, 
  Sticker, Play, CheckCheck
} from 'lucide-react-native';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [inputText, setInputText] = useState('');

  // Mock messages matching Figma design exactly
  const mockMessages = [
    {
      id: 'm1',
      type: 'received',
      text: 'Yo! Just saw your latest reel. The color grading is insane.',
      time: '10:42 AM',
      senderAvatar: 'https://i.pravatar.cc/150?img=44' // Peach/orange placeholder
    },
    {
      id: 'm2',
      type: 'sent',
      text: 'Thanks Alex! Spent way too long on those transitions. 😅',
      isSeen: false
    },
    {
      id: 'm3',
      type: 'sent',
      text: 'Thinking of dropping a tutorial on it soon.',
      isSeen: true
    },
    {
      id: 'm4',
      type: 'sent',
      attachment: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      isVideo: true
    }
  ];

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#12081E' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-white/5 bg-[#12081E] z-10">
        <View className="flex-row items-center space-x-3">
          <Pressable onPress={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft size={28} color="#FFFFFF" />
          </Pressable>
          
          <View className="relative">
            {/* Dark grey avatar placeholder like Figma */}
            <View className="w-10 h-10 rounded-full bg-[#4B5563] border border-white/10" />
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#12081E]" />
          </View>
          
          <View>
            <Text className="text-white font-bold text-base">Alex Rivera</Text>
            <Text className="text-neutral-grey text-xs">Active now</Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-4">
          <Pressable>
            <Video size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable>
            <Info size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Date Pill */}
        <View className="items-center mb-6">
          <View className="bg-[#1A0E2C] px-3 py-1 rounded-full border border-white/5">
            <Text className="text-neutral-grey text-[9px] font-bold uppercase tracking-widest">Today</Text>
          </View>
        </View>

        {/* MESSAGES */}
        <View className="space-y-4">
          {mockMessages.map((msg, index) => {
            const isSent = msg.type === 'sent';
            const isLastSent = isSent && (index === mockMessages.length - 1 || mockMessages[index + 1].type !== 'sent');

            if (!isSent) {
              return (
                <View key={msg.id} className="mb-4">
                  <View className="flex-row items-end space-x-3">
                    <Image source={{ uri: msg.senderAvatar }} className="w-8 h-8 rounded-full bg-[#F59E0B]/20" />
                    <View className="bg-[#2D1B4E] px-4 py-3 rounded-2xl rounded-bl-sm max-w-[75%]">
                      <Text className="text-white/90 text-[15px] leading-6">{msg.text}</Text>
                    </View>
                  </View>
                  <Text className="text-[#6B7280] text-[10px] ml-11 mt-1.5">{msg.time}</Text>
                </View>
              );
            } else {
              return (
                <View key={msg.id} className="items-end mb-1">
                  {msg.text && (
                    <View className="rounded-2xl rounded-br-sm px-4 py-3 max-w-[75%] shadow-sm" style={{ backgroundColor: '#A855F7' }}>
                      {/* Fake gradient background using view absolute */}
                      <View className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-[#D946EF] to-[#A855F7] rounded-2xl rounded-br-sm opacity-90 overflow-hidden" />
                      <Text className="text-white text-[15px] leading-6 z-10">{msg.text}</Text>
                    </View>
                  )}

                  {msg.attachment && (
                    <View className="bg-[#2D1B4E] p-1 rounded-2xl rounded-br-sm max-w-[65%] mt-1">
                      <View className="relative rounded-xl overflow-hidden">
                        <Image source={{ uri: msg.attachment }} style={{ width: 180, height: 240 }} resizeMode="cover" />
                        {msg.isVideo && (
                          <View className="absolute inset-0 items-center justify-center bg-black/20">
                            <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center backdrop-blur-md">
                              <Play size={20} color="#FFFFFF" fill="#FFFFFF" className="ml-1" />
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {msg.isSeen && (
                    <View className="flex-row items-center space-x-1 mt-1.5 mb-2">
                      <Text className="text-[#6B7280] text-[10px]">Seen</Text>
                      <CheckCheck size={12} color="#A855F7" />
                    </View>
                  )}
                </View>
              );
            }
          })}
        </View>
      </ScrollView>

      {/* BOTTOM INPUT BAR */}
      <View className="flex-row items-center px-4 py-3 bg-[#12081E] border-t border-white/5 space-x-3 pb-8">
        {/* Plus Button */}
        <Pressable className="w-10 h-10 rounded-full bg-[#1A0E2C] items-center justify-center border border-white/5">
          <Plus size={20} color="#9CA3AF" />
        </Pressable>

        {/* Text Input */}
        <View className="flex-1 bg-[#1A0E2C] h-10 rounded-full flex-row items-center px-4 border border-white/5">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Send a message..."
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-sm"
          />
          <Pressable className="ml-2">
            <Sticker size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Mic */}
        <Pressable className="p-1">
          <Mic size={20} color="#9CA3AF" />
        </Pressable>

        {/* Glowing Gallery Button */}
        <Pressable className="w-10 h-10 rounded-full bg-[#A855F7] items-center justify-center shadow-lg shadow-[#A855F7]/50">
          <View className="absolute inset-0 bg-[#D946EF] rounded-full opacity-50" />
          <ImageIcon size={18} color="#FFFFFF" className="z-10" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
