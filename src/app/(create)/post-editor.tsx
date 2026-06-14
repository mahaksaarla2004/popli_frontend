import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal, FlatList, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Users, Music, ChevronRight, Check, Search, X, IndianRupee } from 'lucide-react-native';
import { useFeedStore, useAuthStore } from '../../store';
import { apiClient } from '../../api/client';

const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const MUSIC_TRACKS = ['Trending Track 1', 'Bollywood Mashup', 'Lo-Fi Chill', 'Gym Motivation', 'Romantic Hits', 'Aesthetic Vibes', 'Viral Audio 2026'];

export default function PostEditorScreen() {
  const router = useRouter();
  const { uri, mode, type } = useLocalSearchParams<{ uri: string, mode: string, type?: string }>();
  
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  // New States for Features
  const [taggedUsers, setTaggedUsers] = useState<any[]>([]);
  const [musicName, setMusicName] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [isMonetized, setIsMonetized] = useState<boolean>(true);

  // Modal Visibility States
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Tag Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers(searchQuery);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async (q: string) => {
    setIsSearching(true);
    try {
      const res = await apiClient.get(`/users/search?q=${q}`);
      setSearchResults(res.data);
    } catch (e) {
      console.log('Error searching users', e);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleTagUser = (user: any) => {
    if (taggedUsers.find(u => u.id === user.id)) {
      setTaggedUsers(taggedUsers.filter(u => u.id !== user.id));
    } else {
      setTaggedUsers([...taggedUsers, user]);
    }
  };

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
        isStory: 'false',
        musicName,
        city,
        isMonetized: isMonetized ? 'true' : 'false',
        taggedUserIds: JSON.stringify(taggedUsers.map(u => u.id))
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
      <View className="flex-row items-center px-4 pb-4 border-b border-white/10">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={28} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-lg ml-2">New Post</Text>
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
        <Pressable onPress={() => setIsTagModalOpen(true)} className="flex-row items-center justify-between p-4 border-b border-white/5 bg-black/10">
          <View className="flex-row items-center gap-3">
            <Users size={20} color={taggedUsers.length > 0 ? "#A855F7" : "#FFFFFF"} />
            <Text className="text-white text-base">
              {taggedUsers.length > 0 ? `${taggedUsers.length} People Tagged` : 'Tag people'}
            </Text>
          </View>
          <ChevronRight size={20} color="#6B7280" />
        </Pressable>

        <Pressable onPress={() => setIsMusicModalOpen(true)} className="flex-row items-center justify-between p-4 border-b border-white/5 bg-black/10">
          <View className="flex-row items-center gap-3">
            <Music size={20} color={musicName ? "#A855F7" : "#FFFFFF"} />
            <Text className="text-white text-base">
              {musicName || 'Add music'}
            </Text>
          </View>
          <ChevronRight size={20} color="#6B7280" />
        </Pressable>

        <Pressable onPress={() => setIsLocationModalOpen(true)} className="flex-row items-center justify-between p-4 border-b border-white/5 active:bg-white/5">
          <View className="flex-row items-center">
            <MapPin size={24} color="#A855F7" />
            <Text className="text-white text-base ml-3 font-medium">{city || 'Add Location'}</Text>
          </View>
          <ChevronRight size={20} color="#6B7280" />
        </Pressable>

        {/* View-Based Earning Toggle */}
        <View className="flex-row items-center justify-between p-4 border-b border-white/5">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center mr-3">
              <IndianRupee size={16} color="#22C55E" />
            </View>
            <View className="flex-1 pr-4">
              <Text className="text-white text-base font-medium">View-based Earning</Text>
              <Text className="text-neutral-grey text-xs mt-0.5 leading-4">Earn ₹0.0044 per view instantly on this video.</Text>
            </View>
          </View>
          <Switch
            value={isMonetized}
            onValueChange={setIsMonetized}
            trackColor={{ false: '#374151', true: '#22C55E' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#374151"
          />
        </View>

        <View className="p-4 mt-4">
          <Text className="text-neutral-grey text-xs">By sharing, you agree to our Terms of Service and Community Guidelines.</Text>
        </View>

      </ScrollView>

      {/* Share Button Bottom */}
      <View className="p-4 pb-8 border-t border-white/5 bg-[#12081E]">
        <Pressable 
          onPress={handlePost}
          disabled={isPosting}
          className="bg-[#A855F7] py-4 rounded-full items-center justify-center flex-row gap-2"
        >
          {isPosting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-bold text-base">Share Post</Text>
          )}
        </Pressable>
      </View>

      {/* --- MODALS --- */}

      {/* Tag People Modal */}
      <Modal visible={isTagModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#1A0B2E] pt-10">
          <View className="flex-row items-center justify-between px-4 pb-4 border-b border-white/10">
            <Text className="text-white font-bold text-lg">Tag People</Text>
            <Pressable onPress={() => setIsTagModalOpen(false)}>
              <Text className="text-[#A855F7] font-bold">Done</Text>
            </Pressable>
          </View>
          <View className="p-4 border-b border-white/10">
            <View className="flex-row items-center bg-black/30 rounded-xl px-4 py-2">
              <Search size={20} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search usernames..."
                placeholderTextColor="#6B7280"
                className="flex-1 ml-3 text-white h-10"
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={20} color="#6B7280" />
                </Pressable>
              )}
            </View>
          </View>
          
          {taggedUsers.length > 0 && (
            <View className="p-4 border-b border-white/10">
              <Text className="text-neutral-grey mb-2 text-xs font-bold">TAGGED ({taggedUsers.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {taggedUsers.map(u => (
                  <Pressable key={u.id} onPress={() => toggleTagUser(u)} className="mr-3 items-center bg-black/20 p-2 rounded-xl">
                    <Image source={{ uri: u.avatar || 'https://i.pravatar.cc/150' }} className="w-12 h-12 rounded-full mb-1" />
                    <Text className="text-white text-xs">@{u.username}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {isSearching ? (
            <ActivityIndicator className="mt-10" color="#A855F7" />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => {
                const isSelected = taggedUsers.find(u => u.id === item.id);
                return (
                  <Pressable onPress={() => toggleTagUser(item)} className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} className="w-12 h-12 rounded-full" />
                      <View className="ml-3">
                        <Text className="text-white font-bold">{item.name}</Text>
                        <Text className="text-neutral-grey">@{item.username}</Text>
                      </View>
                    </View>
                    {isSelected && <Check size={24} color="#A855F7" />}
                  </Pressable>
                );
              }}
              ListEmptyComponent={() => (
                <Text className="text-neutral-grey text-center mt-10">
                  {searchQuery.length > 0 ? "No users found" : "Search to tag people"}
                </Text>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Add Music Modal */}
      <Modal visible={isMusicModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#1A0B2E] pt-10">
          <View className="flex-row items-center justify-between px-4 pb-4 border-b border-white/10">
            <Text className="text-white font-bold text-lg">Add Music</Text>
            <Pressable onPress={() => setIsMusicModalOpen(false)}>
              <Text className="text-[#A855F7] font-bold">Cancel</Text>
            </Pressable>
          </View>
          <FlatList
            data={MUSIC_TRACKS}
            keyExtractor={(item) => item}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <Pressable 
                onPress={() => { setMusicName(item); setIsMusicModalOpen(false); }}
                className="flex-row items-center justify-between py-4 border-b border-white/5"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-black/30 rounded-lg items-center justify-center">
                    <Music size={20} color="#A855F7" />
                  </View>
                  <Text className="text-white text-base">{item}</Text>
                </View>
                {musicName === item && <Check size={24} color="#A855F7" />}
              </Pressable>
            )}
            ListHeaderComponent={() => (
              <Pressable 
                onPress={() => { setMusicName(''); setIsMusicModalOpen(false); }}
                className="py-4 border-b border-white/5 mb-2"
              >
                <Text className="text-red-400 font-bold">Remove Music</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>

      {/* Add Location Modal */}
      <Modal visible={isLocationModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#1A0B2E] pt-10">
          <View className="flex-row items-center justify-between px-4 pb-4 border-b border-white/10">
            <Text className="text-white font-bold text-lg">Add Location</Text>
            <Pressable onPress={() => setIsLocationModalOpen(false)}>
              <Text className="text-[#A855F7] font-bold">Cancel</Text>
            </Pressable>
          </View>
          <FlatList
            data={CITIES}
            keyExtractor={(item) => item}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <Pressable 
                onPress={() => { setCity(item); setIsLocationModalOpen(false); }}
                className="flex-row items-center justify-between py-4 border-b border-white/5"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-black/30 rounded-lg items-center justify-center">
                    <MapPin size={20} color="#A855F7" />
                  </View>
                  <Text className="text-white text-base">{item}</Text>
                </View>
                {city === item && <Check size={24} color="#A855F7" />}
              </Pressable>
            )}
            ListHeaderComponent={() => (
              <Pressable 
                onPress={() => { setCity(''); setIsLocationModalOpen(false); }}
                className="py-4 border-b border-white/5 mb-2"
              >
                <Text className="text-red-400 font-bold">Remove Location</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}
