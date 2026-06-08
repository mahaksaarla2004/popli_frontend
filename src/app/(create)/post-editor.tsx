import React, { useState } from 'react';
import { View, Text, Image, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Users, Music, ChevronRight, Check } from 'lucide-react-native';
import { useFeedStore, useAuthStore } from '../../store';

export default function PostEditorScreen() {
  const router = useRouter();
  const { uri, mode, type } = useLocalSearchParams<{ uri: string, mode: string, type?: string }>();
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { addLocalReel } = useFeedStore();
  const { userProfile } = useAuthStore();

  const handlePost = () => {
    // Navigate to share-story which handles the actual Cloudinary and backend API upload
    router.push({
      pathname: '/(create)/share-story',
      params: { 
        uri, 
        type: type || (mode === 'REEL' ? 'video' : 'photo'), 
        target: 'feed', 
        text: caption, 
        mode,
        isStory: 'false'
      }
    });
  };

  if (isPosting) {
    return (
      <View className="flex-1 bg-[#12081E] items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
        <Text className="text-white mt-4 font-bold">Uploading Post...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#12081E] pt-12">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-4 border-b border-white/10">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={28} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-lg">New Post</Text>
        <Pressable onPress={handlePost} className="bg-[#A855F7] px-4 py-1.5 rounded-full">
          <Text className="text-white font-bold text-sm">Share</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {/* Input Area */}
        <View className="flex-row p-4 border-b border-white/5">
          <Image source={{ uri: uri || 'https://picsum.photos/200' }} className="w-20 h-20 rounded-xl bg-black/20" />
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 ml-4 text-white text-base h-20"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Options */}
        <Pressable className="flex-row items-center justify-between p-4 border-b border-white/5 bg-black/10">
          <View className="flex-row items-center gap-3">
            <Users size={20} color="#FFFFFF" />
            <Text className="text-white text-base">Tag people</Text>
          </View>
          <ChevronRight size={20} color="#6B7280" />
        </Pressable>

        <Pressable className="flex-row items-center justify-between p-4 border-b border-white/5 bg-black/10">
          <View className="flex-row items-center gap-3">
            <Music size={20} color="#FFFFFF" />
            <Text className="text-white text-base">Add music</Text>
          </View>
          <ChevronRight size={20} color="#6B7280" />
        </Pressable>

        <Pressable className="flex-row items-center justify-between p-4 border-b border-white/5 bg-black/10">
          <View className="flex-row items-center gap-3">
            <MapPin size={20} color="#FFFFFF" />
            <Text className="text-white text-base">Add location</Text>
          </View>
          <ChevronRight size={20} color="#6B7280" />
        </Pressable>

        <View className="p-4 mt-4">
          <Text className="text-neutral-grey text-xs">By sharing, you agree to our Terms of Service and Community Guidelines.</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
