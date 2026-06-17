import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal, FlatList, Switch, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Users, Lock, ChevronRight, Hash, Check } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { useHashtagStore } from '../../store';

export default function ShareScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri: string, type: string, mode: string, musicId?: string, challengeId?: string }>();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMonetized, setIsMonetized] = useState(true);

  const { searchHashtags, searchSuggestions, isSearching: isHashtagSearching } = useHashtagStore();
  const [activeHashtagQuery, setActiveHashtagQuery] = useState<string | null>(null);

  // Tagging State
  const [isTagModalVisible, setTagModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Topics State
  const [isTopicsModalVisible, setTopicsModalVisible] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const PREDEFINED_TOPICS = ["Gaming", "Music", "Comedy", "Tech", "Dance", "Vlog", "Education", "Food", "Fashion"];

  // Privacy State
  const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>('Everyone');
  const PRIVACY_OPTIONS = ['Everyone', 'Close Friends', 'Only Me'];

  const handleSearchUsers = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await apiClient.get(`/search?q=${text}`);
      setSearchResults(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCaptionChange = (text: string) => {
    setCaption(text);
    
    // Find if the cursor is at the end of a hashtag
    const words = text.split(/[\s\n]+/);
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('#') && lastWord.length > 1) {
      setActiveHashtagQuery(lastWord);
      searchHashtags(lastWord);
    } else {
      setActiveHashtagQuery(null);
    }
  };

  const handleSelectHashtag = (tagName: string) => {
    if (!activeHashtagQuery) return;
    
    const words = caption.split(/[\s\n]+/);
    words.pop(); // Remove the partial hashtag
    
    // Join back, add the full hashtag and a space
    const newCaption = words.length > 0 
      ? `${words.join(' ')} #${tagName} ` 
      : `#${tagName} `;
      
    setCaption(newCaption);
    setActiveHashtagQuery(null);
  };

  const toggleTagUser = (user: any) => {
    setTaggedUsers(prev => {
      if (prev.find(u => u.id === user.id)) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) return prev.filter(t => t !== topic);
      return [...prev, topic];
    });
  };

  const handleShare = async () => {
    if (!params.uri) {
      Alert.alert('Error', 'Missing media file. Please go back and try again.');
      return;
    }
    setIsUploading(true);

    try {
      // 1. Ideally upload to Cloudinary or similar here
      // const uploadedUrl = await uploadMedia(params.uri);
      const uploadedUrl = params.uri; // Mocking upload for now

      const isPostOrReel = params.mode === 'REEL' || params.mode === 'POST';
      const endpoint = isPostOrReel ? '/reels' : '/stories';
      
      const payload = isPostOrReel ? {
        mediaUrl: uploadedUrl,
        thumbnailUrl: uploadedUrl, // Mock thumbnail
        mediaType: params.type === 'video' ? 'VIDEO' : 'PHOTO',
        description: caption,
        city: location,
        musicName: params.musicId, // In a real app, pass the actual name
        taggedUserIds: taggedUsers.map((u: any) => u.id),
        category: selectedTopics.join(','),
        privacy: selectedPrivacy,
        challengeId: params.challengeId,
        isMonetized
      } : {
        mediaUrl: uploadedUrl,
        mediaType: params.type === 'video' ? 'VIDEO' : 'PHOTO'
      };

      await apiClient.post(endpoint, payload);
      
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Upload failed:', err.response?.data || err.message || err);
      Alert.alert('Upload Failed', err.response?.data?.message || 'There was an error sharing your post.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
    <View className="flex-1 bg-[#12081E]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Loading Overlay */}
        {isUploading && (
          <View className="absolute inset-0 z-50 items-center justify-center bg-black/60 backdrop-blur-sm">
            <View className="bg-[#1A0E2C] p-6 rounded-2xl items-center border border-white/10">
              <ActivityIndicator size="large" color="#A855F7" />
              <Text className="text-white font-bold mt-4 text-base">Sharing Post...</Text>
            </View>
          </View>
        )}
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-white/5">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>
          <Text className="text-white font-bold text-[19px] ml-2">New Post</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Caption & Preview */}
        <View className="flex-row p-4 border-b border-white/5">
          <Image 
            source={{ uri: params.uri }} 
            className="w-16 h-24 rounded-lg bg-white/10"
            resizeMode="cover"
          />
          <TextInput
            className="flex-1 ml-4 text-white text-base"
            placeholder="Write a caption..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={caption}
            onChangeText={handleCaptionChange}
            textAlignVertical="top"
          />
        </View>

        {/* Hashtag Suggestions */}
        {activeHashtagQuery && (
          <View className="px-4 py-2 border-b border-white/5 bg-[#1A0E2C]">
            {isHashtagSearching ? (
              <ActivityIndicator size="small" color="#A855F7" />
            ) : searchSuggestions.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {searchSuggestions.map((tag) => (
                  <Pressable 
                    key={tag.id} 
                    onPress={() => handleSelectHashtag(tag.name)}
                    className="mr-3 bg-[#3E2B5C] px-3 py-1.5 rounded-full flex-row items-center"
                  >
                    <Text className="text-white font-bold">#{tag.name}</Text>
                    <Text className="text-white/50 text-xs ml-1">{tag.usageCount}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Text className="text-white/50 text-xs">No matching hashtags</Text>
            )}
          </View>
        )}

        {/* Options */}
        <View className="mt-2">
          <Pressable className="flex-row items-center justify-between p-4 border-b border-white/5">
            <View className="flex-row items-center gap-3">
              <MapPin size={20} color="#FFFFFF" />
              <TextInput 
                className="text-white text-base font-medium flex-1"
                placeholder="Add location"
                placeholderTextColor="#FFFFFF"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </Pressable>

          <Pressable onPress={() => setTagModalVisible(true)} className="flex-row items-center justify-between p-4 border-b border-white/5">
            <View className="flex-row items-center gap-3">
              <Users size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-medium">Tag people</Text>
            </View>
            <View className="flex-row items-center gap-2">
              {taggedUsers.length > 0 && (
                <Text className="text-[#A855F7] text-sm">{taggedUsers.length} tagged</Text>
              )}
              <ChevronRight size={20} color="#6B7280" />
            </View>
          </Pressable>

          <Pressable onPress={() => setTopicsModalVisible(true)} className="flex-row items-center justify-between p-4 border-b border-white/5">
            <View className="flex-row items-center gap-3">
              <Hash size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-medium">Add topics</Text>
            </View>
            <View className="flex-row items-center gap-2">
              {selectedTopics.length > 0 && (
                <Text className="text-[#A855F7] text-sm truncate max-w-[150px]">{selectedTopics.join(', ')}</Text>
              )}
              <ChevronRight size={20} color="#6B7280" />
            </View>
          </Pressable>

          <Pressable onPress={() => setPrivacyModalVisible(true)} className="flex-row items-center justify-between p-4 border-b border-white/5">
            <View className="flex-row items-center gap-3">
              <Lock size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-medium">Privacy Settings</Text>
            </View>
            <Text className="text-neutral-grey text-sm">{selectedPrivacy}</Text>
          </Pressable>

          {params.mode === 'REEL' && (
            <View className="flex-row items-center justify-between p-4 border-b border-white/5">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-[#10B981]/20 items-center justify-center">
                  <Text className="text-[#10B981] font-bold text-lg">₹</Text>
                </View>
                <View>
                  <Text className="text-white text-base font-bold">View based earning</Text>
                  <Text className="text-[#10B981] text-xs font-semibold">Earn ₹0.15 per view</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#3E2B5C", true: "#10B981" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#3E2B5C"
                onValueChange={setIsMonetized}
                value={isMonetized}
              />
            </View>
          )}
        </View>
      </ScrollView>

      </KeyboardAvoidingView>

      {/* Share Button Bottom */}
      <View className="p-4 pb-8 border-t border-white/5 bg-[#12081E]">
        <Pressable 
          onPress={handleShare}
          disabled={isUploading}
          className="bg-[#A855F7] py-4 rounded-full items-center justify-center flex-row gap-2"
        >
          {isUploading ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-bold text-base">Sharing...</Text>
            </>
          ) : (
            <Text className="text-white font-bold text-base">Share {params.mode === 'REEL' ? 'Reel' : 'Post'}</Text>
          )}
        </Pressable>
      </View>
    </View>

      {/* Tag People Modal */}
      <Modal visible={isTagModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setTagModalVisible(false)}>
        <View className="flex-1 bg-[#12081E] pt-14 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-bold text-xl">Tag People</Text>
            <Pressable onPress={() => setTagModalVisible(false)}>
              <Text className="text-[#A855F7] font-bold text-base">Done</Text>
            </Pressable>
          </View>
          <View className="bg-[#1D1037] border border-[#3E2B5C] rounded-2xl p-3 flex-row items-center mb-4">
            <TextInput 
              className="flex-1 text-white text-base ml-2"
              placeholder="Search users..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearchUsers}
              autoFocus
            />
          </View>
          {isSearching ? (
            <ActivityIndicator color="#A855F7" />
          ) : (
            <FlatList 
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({item}) => {
                const isSelected = taggedUsers.some(u => u.id === item.id);
                return (
                  <Pressable onPress={() => toggleTagUser(item)} className="flex-row items-center justify-between py-3 border-b border-white/5">
                    <View className="flex-row items-center gap-3">
                      <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} className="w-10 h-10 rounded-full" />
                      <View>
                        <Text className="text-white font-bold">{item.name}</Text>
                        <Text className="text-white/50 text-xs">@{item.username}</Text>
                      </View>
                    </View>
                    {isSelected && <View className="w-6 h-6 rounded-full bg-[#A855F7] items-center justify-center"><Check size={14} color="white" /></View>}
                  </Pressable>
                )
              }}
              ListEmptyComponent={() => (
                <Text className="text-white/40 text-center mt-4">
                  {searchQuery.length < 2 ? 'Type to search...' : 'No users found'}
                </Text>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Topics Modal */}
      <Modal visible={isTopicsModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setTopicsModalVisible(false)}>
        <View className="flex-1 bg-[#12081E] pt-14 px-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-bold text-xl">Add Topics</Text>
            <Pressable onPress={() => setTopicsModalVisible(false)}>
              <Text className="text-[#A855F7] font-bold text-base">Done</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-3">
              {PREDEFINED_TOPICS.map(topic => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <Pressable 
                    key={topic} 
                    onPress={() => toggleTopic(topic)}
                    className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-[#A855F7] border-[#A855F7]' : 'bg-[#1D1037] border-[#3E2B5C]'}`}
                  >
                    <Text className={`font-bold ${isSelected ? 'text-white' : 'text-white/70'}`}>{topic}</Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={isPrivacyModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPrivacyModalVisible(false)}>
        <View className="flex-1 bg-[#12081E] pt-14 px-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-bold text-xl">Privacy Settings</Text>
            <Pressable onPress={() => setPrivacyModalVisible(false)}>
              <Text className="text-[#A855F7] font-bold text-base">Done</Text>
            </Pressable>
          </View>
          <View className="gap-2">
            {PRIVACY_OPTIONS.map(option => {
              const isSelected = selectedPrivacy === option;
              return (
                <Pressable 
                  key={option} 
                  onPress={() => setSelectedPrivacy(option)}
                  className="flex-row items-center justify-between py-4 border-b border-white/5"
                >
                  <Text className="text-white font-bold text-base">{option}</Text>
                  {isSelected && <View className="w-6 h-6 rounded-full bg-[#A855F7] items-center justify-center"><Check size={14} color="white" /></View>}
                </Pressable>
              )
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}
