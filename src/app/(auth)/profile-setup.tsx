import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollViewPlatform, Image , ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { ChevronLeft, Camera, Sparkles, Globe, ChevronRight } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../api/client';
import axios from 'axios';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=150&auto=format&fit=crop',
];

const CATEGORIES = [
  { value: 'comedy', label: '😂 Comedy' },
  { value: 'motivation', label: '🔥 Motivation' },
  { value: 'dance', label: '💃 Dance' },
  { value: 'gaming', label: '🎮 Gaming' },
  { value: 'fashion', label: '✨ Fashion' },
];

const LANGUAGES: ('English' | 'Hindi' | 'Bengali' | 'Tamil')[] = ['English', 'Hindi', 'Bengali', 'Tamil'];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { userProfile, updateProfile, setLanguage } = useAuthStore();

  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [gender, setGender] = useState<string>('Male');
  const [category, setCategory] = useState<string>('comedy');
  const [selectedLang, setSelectedLang] = useState<'English' | 'Hindi' | 'Bengali' | 'Tamil'>('English');
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsUploading(true);
        const imageUri = result.assets[0].uri;
        
        // Get Cloudinary signature from backend
        const sigResponse = await apiClient.get('/upload/signature?folder=profiles');
        const { timestamp, signature, cloudName, apiKey, folder } = sigResponse.data;

        // Construct FormData for Cloudinary
        const formData = new FormData();
        const fileType = imageUri.split('.').pop() || 'jpg';
        formData.append('file', {
          uri: imageUri,
          type: `image/${fileType}`,
          name: `profile-${Date.now()}.${fileType}`
        } as any);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        // Upload directly to Cloudinary
        const axios = require('axios').default;
        const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
        
        const uploadData = uploadRes.data;
        if (uploadData.secure_url) {
          setAvatar(uploadData.secure_url);
        } else {
          throw new Error('Cloudinary upload failed');
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    // Persist current profiling data to global auth state store
    updateProfile({
      avatar,
      bio: bio.trim() || 'Indian video creator 🚀',
      category,
    });
    setLanguage(selectedLang);

    // Slide smoothly into interest selection
    router.push('/(auth)/interests');
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-[#0B001A]"
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, paddingTop: Platform.OS === 'ios' ? 60 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          className="gap-6"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between w-full">
            <Pressable 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/5 items-center justify-center active:scale-[0.9]"
            >
              <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
            <View className="flex-row items-center gap-2 bg-primary-pink/15 px-3 py-1.5 rounded-full border border-primary-pink/20">
              <Sparkles size={11} color="#EC4899" />
              <Text className="text-primary-pink text-[9px] font-black uppercase tracking-wider">Step 1 of 4</Text>
            </View>
          </View>

          {/* Intro titles */}
          <View className="gap-2">
            <Text className="text-white font-black text-3xl tracking-tight">Setup Profile</Text>
            <Text className="text-white/50 text-xs">{"Let's create your creator identity and match you with local fans."}</Text>
          </View>

          {/* Avatar Selector */}
          <View className="gap-3">
            <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Choose Creator Avatar</Text>
            
            <View className="items-center py-4">
              <Pressable onPress={pickImage} className="relative active:scale-95 transition-all">
                <Image 
                  source={{ uri: avatar }} 
                  className="w-24 h-24 rounded-full border-4 border-primary-pink shadow-lg shadow-primary-pink/40"
                />
                <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-purple border-2 border-[#0B001A] items-center justify-center">
                  {isUploading ? <ActivityIndicator size="small" color="#FFF" /> : <Camera size={14} color="#FFFFFF" />}
                </View>
              </Pressable>
            </View>

            {/* Presets Horizontal Row */}
            <View className="flex-row justify-center gap-3 py-2">
              {AVATAR_PRESETS.map((preset, idx) => {
                const isSelected = preset === avatar;
                return (
                  <Pressable 
                    key={idx} 
                    onPress={() => setAvatar(preset)}
                    className={`rounded-full p-[2px] transition-all ${
                      isSelected ? 'bg-primary-pink scale-110' : 'bg-transparent'
                    }`}
                  >
                    <Image 
                      source={{ uri: preset }} 
                      className="w-10 h-10 rounded-full border border-white/10"
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Bio input Card */}
          <View className="gap-2">
            <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Your Bio</Text>
            <View className="bg-[#190C2C] border border-white/5 rounded-2xl p-4">
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Write a catchy bio for your fans (e.g. Village vlogger making funny daily reels! 🌾😂)"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                multiline
                numberOfLines={3}
                maxLength={100}
                style={{ textAlignVertical: 'top' }}
                className="text-white text-sm leading-5 h-20 py-1"
              />
              <View className="items-end mt-2">
                <Text className="text-white/30 text-[10px]">{bio.length}/100</Text>
              </View>
            </View>
          </View>

          {/* Gender selector grid */}
          <View className="gap-2">
            <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Gender</Text>
            <View className="flex-row gap-2 w-full">
              {['Male', 'Female', 'Other'].map((item) => {
                const isSelected = gender === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setGender(item)}
                    className={`flex-1 py-3 rounded-2xl items-center border ${
                      isSelected 
                        ? 'bg-primary-purple/20 border-primary-purple' 
                        : 'bg-[#190C2C]/65 border-white/5'
                    } active:scale-[0.97]`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Category Dropdown/Selector Grid */}
          <View className="gap-2">
            <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Creator Vibe Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <Pressable
                    key={cat.value}
                    onPress={() => setCategory(cat.value)}
                    className={`px-4 py-2.5 rounded-full border ${
                      isSelected 
                        ? 'bg-primary-pink/25 border-primary-pink' 
                        : 'bg-[#190C2C]/50 border-white/5'
                    } active:scale-[0.96]`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Language Preference */}
          <View className="gap-2">
            <View className="flex-row items-center gap-1">
              <Globe size={12} color="#A78BFA" />
              <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">App Language</Text>
            </View>
            <View className="flex-row gap-2 w-full">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => setSelectedLang(lang)}
                    className={`flex-1 py-3 rounded-2xl items-center border ${
                      isSelected 
                        ? 'bg-primary-purple border-primary-purple' 
                        : 'bg-[#190C2C]/50 border-white/5'
                    } active:scale-[0.97]`}
                  >
                    <Text className="text-white text-xs font-bold">{lang}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Submit Next Button */}
          <View className="pt-4">
            <Pressable
              onPress={handleNext}
              className="bg-primary-purple py-4 rounded-2xl items-center justify-center flex-row gap-2 active:scale-[0.98] shadow-lg shadow-primary-purple/40"
            >
              <Text className="text-white text-sm font-bold uppercase tracking-wider">Continue to Interests</Text>
              <ChevronRight size={16} color="#FFFFFF" strokeWidth={3} />
            </Pressable>
          </View>

        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
