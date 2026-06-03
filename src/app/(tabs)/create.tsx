import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, Switch, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { X, Settings, RotateCw, RefreshCcw, Gauge, Wand2, Timer, Sparkles, Sliders, Globe, ShieldAlert, MessageCircle, GitCompare, Download, Music, Play, Banknote, Gift, Aperture, Smile } from 'lucide-react-native';
import { useFeedStore, useAuthStore } from '../../store';
import { MotiView, AnimatePresence } from 'moti';

export default function CreateScreen() {
  const router = useRouter();
  const { addLocalReel, gpsCity } = useFeedStore();
  const { userProfile } = useAuthStore();

  // Screen state toggle: 'camera' | 'settings'
  const [screenMode, setScreenMode] = useState<'camera' | 'settings'>('camera');
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('video');
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
  
  // Post settings form state
  const [caption, setCaption] = useState('');
  const [monetization, setMonetization] = useState(true);
  const [allowGifting, setAllowGifting] = useState(true);
  const [visibility, setVisibility] = useState<'Public' | 'Friends' | 'Private'>('Public');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(false);
  const [saveToDevice, setSaveToDevice] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Gallery Picker Trigger
  const handleSelectVideo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert('Permission Denied', 'Please grant library access to select videos.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: captureMode === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedVideoUri(result.assets[0].uri);
        setScreenMode('settings');
      }
    } catch (error) {
      console.warn('Picker failed:', error);
      // Fallback in case emulator doesn't support real library
      setSelectedVideoUri(
        captureMode === 'photo' 
          ? 'https://images.unsplash.com/photo-1516280440502-6c24388e3328?q=80&w=800&auto=format&fit=crop'
          : 'https://assets.mixkit.co/videos/preview/mixkit-young-man-dancing-in-studio-40026-large.mp4'
      );
      setScreenMode('settings');
    }
  };

  // Video recording simulator
  const handleRecordVideo = async () => {
    // Alert user recording has started
    setIsPosting(true);
    await new Promise((r) => setTimeout(r, 2000)); // simulate recording 2s
    setIsPosting(false);
    
    // Auto select mock video loop or dummy image based on mode
    setSelectedVideoUri(
      captureMode === 'photo'
        ? 'https://images.unsplash.com/photo-1529156069898-49953eb1b5b4?q=80&w=800&auto=format&fit=crop'
        : 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-dancing-40030-large.mp4'
    );
    setScreenMode('settings');
  };

  const handlePostNow = async () => {
    if (!selectedVideoUri) return;
    
    setIsPosting(true);
    await new Promise((r) => setTimeout(r, 2500)); // Simulate upload progress loader
    
    const city = gpsCity || 'Indore';
    const newReel = {
      id: `reel_user_${Date.now()}`,
      creatorId: 'alex_rivera',
      creatorName: userProfile.name,
      creatorUsername: userProfile.username,
      creatorAvatar: userProfile.avatar,
      videoUrl: selectedVideoUri,
      thumbnailUrl: selectedVideoUri, // use same image for thumbnail if it's a photo
      description: caption.trim() || 'My custom uploaded post! 🚀 #PopliCreator #' + city,
      musicName: 'Original Audio - ' + userProfile.name,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      isLiked: false,
      isSaved: false,
      isFollowed: true,
      category: userProfile.category,
      location: {
        city,
        latitude: 22.7196,
        longitude: 75.8577
      },
      rewardEarned: 0
    };

    // Prepend reel to dynamic stores in memory
    addLocalReel(newReel);
    setIsPosting(false);

    Alert.alert('Posted Successfully! 🎉', 'Your video is live. It has been pinned to the top of your For You and Profile feeds!', [
      {
        text: 'Go to Feed',
        onPress: () => {
          setCaption('');
          setSelectedVideoUri(null);
          setScreenMode('camera');
          router.replace('/(tabs)');
        }
      }
    ]);
  };

  return (
    <AnimatePresence exitBeforeEnter>
      {/* ==========================================
          CAMERA VIEW / VIEWFINDER SIMULATOR
          ========================================== */}
      {screenMode === 'camera' && (
        <MotiView 
          key="cameraScreen"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 bg-black"
        >
          {/* Mock Viewfinder background matching Figma mountain view */}
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop' }} 
            className="absolute inset-0 w-full h-full opacity-90"
            resizeMode="cover"
          />

          {/* Top overlays: Close, Music ticker, Settings */}
          <View className="absolute top-12 left-0 right-0 px-4 flex-row items-center justify-between z-10">
            <Pressable 
              onPress={() => router.replace('/(tabs)')}
              className="w-10 h-10 rounded-full bg-black/45 items-center justify-center border border-white/10"
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>

            <View className="bg-black/60 border border-white/10 px-4 py-2 rounded-full flex-row items-center space-x-2 max-w-[200px]">
              <Music size={12} color="#A855F7" />
              <Text className="text-white text-[10px] font-semibold truncate" numberOfLines={1}>
                Tum Tum - Thaman S, Sri Vardhini...
              </Text>
            </View>

            <Pressable className="w-10 h-10 rounded-full bg-black/45 items-center justify-center border border-white/10">
              <Settings size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Right sidebar options */}
          <View className="absolute right-4 top-28 space-y-7 bg-black/30 px-3.5 py-6 rounded-full border border-white/10 z-10 shadow-sm shadow-black/20">
            <Pressable className="items-center">
              <RefreshCcw size={22} color="#FFFFFF" />
              <Text className="text-white text-[8px] font-bold mt-1.5 tracking-wider">FLIP</Text>
            </Pressable>
            <Pressable className="items-center">
              <Gauge size={22} color="#FFFFFF" />
              <Text className="text-white text-[8px] font-bold mt-1.5 tracking-wider">SPEED</Text>
            </Pressable>
            <Pressable className="items-center">
              <Aperture size={22} color="#FFFFFF" />
              <Text className="text-white text-[8px] font-bold mt-1.5 tracking-wider">FILTERS</Text>
            </Pressable>
            <Pressable className="items-center">
              <Timer size={22} color="#FFFFFF" />
              <Text className="text-white text-[8px] font-bold mt-1.5 tracking-wider">TIMER</Text>
            </Pressable>
            <Pressable className="items-center">
              <Smile size={22} color="#FFFFFF" />
              <Text className="text-white text-[8px] font-bold mt-1.5 tracking-wider">BEAUTIFY</Text>
            </Pressable>
          </View>

          {/* Bottom viewfinder controls */}
          <View className="absolute bottom-24 left-0 right-0 px-6 items-center z-10 space-y-6">
            
            {/* Mode selector tab */}
            <View className="bg-black/55 px-4 py-1.5 rounded-full flex-row space-x-6 border border-white/10 mb-2">
              <Pressable onPress={() => setCaptureMode('video')} className={`px-4 py-1.5 rounded-full ${captureMode === 'video' ? 'bg-white/20' : ''}`}>
                <Text className={`text-xs font-bold ${captureMode === 'video' ? 'text-white' : 'text-white/60'}`}>Video</Text>
              </Pressable>
              <Pressable onPress={() => setCaptureMode('photo')} className={`px-4 py-1.5 rounded-full ${captureMode === 'photo' ? 'bg-white/20' : ''}`}>
                <Text className={`text-xs font-bold ${captureMode === 'photo' ? 'text-white' : 'text-white/60'}`}>Photo</Text>
              </Pressable>
            </View>

            {/* Triggers: Gallery, Record, Effects */}
            <View className="flex-row items-center justify-between w-full px-6">
              
              {/* Gallery upload */}
              <Pressable 
                onPress={handleSelectVideo}
                className="w-12 h-12 bg-black/60 border border-white/20 rounded-xl overflow-hidden items-center justify-center"
              >
                <Image 
                  source={{ uri: 'https://picsum.photos/id/111/100/100' }} 
                  className="w-full h-full opacity-80" 
                />
                <View className="absolute inset-0 bg-black/30 items-center justify-center">
                  <Text className="text-white text-[8px] font-bold uppercase">Upload</Text>
                </View>
              </Pressable>

              {/* Record Central Purple Button */}
              <Pressable 
                onPress={handleRecordVideo}
                className="w-20 h-20 rounded-full border-4 border-[#A855F7]/80 items-center justify-center p-1 bg-black/20"
              >
                <View className="w-full h-full bg-[#A855F7] rounded-full items-center justify-center">
                  {isPosting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View className="w-6 h-6 bg-white rounded-sm" />
                  )}
                </View>
              </Pressable>

              {/* Effects selector */}
              <Pressable className="w-12 h-12 bg-black/60 border border-white/20 rounded-xl items-center justify-center">
                <Sliders size={20} color="#FFFFFF" />
                <Text className="text-white text-[7px] font-black uppercase mt-0.5">Effects</Text>
              </Pressable>
            </View>
          </View>
        </MotiView>
      )}

      {/* ==========================================
          POST CONFIGURATION SETTINGS SCREEN
          ========================================== */}
      {screenMode === 'settings' && (
        <MotiView
          key="settingsScreen"
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0 }}
          className="flex-1 bg-background-plum pt-12"
        >
          {/* Header */}
          <View className="flex-row items-center px-4 pb-4 border-b border-white/5 justify-between">
            <Pressable onPress={() => setScreenMode('camera')} className="p-1">
              <Text className="text-neutral-grey text-base">←</Text>
            </Pressable>
            <Text className="text-white font-bold text-base">Post Settings</Text>
            <View className="w-5" />
          </View>

          <ScrollView 
            className="flex-1 px-4 py-4 space-y-5" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* Caption & Video preview block */}
            <View className="flex-row space-x-4">
              <View className="w-28 h-36 bg-black rounded-3xl overflow-hidden border border-white/10 relative shadow-sm">
                {selectedVideoUri && (
                  <Image 
                    source={{ uri: 'https://picsum.photos/id/106/150/200' }} 
                    className="w-full h-full opacity-80"
                    resizeMode="cover"
                  />
                )}
                <View className="absolute inset-0 bg-black/20 items-center justify-center">
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                </View>
              </View>

              <View className="flex-1 space-y-2">
                <TextInput
                  value={caption}
                  onChangeText={(val) => {
                    if (val.length <= 200) setCaption(val);
                  }}
                  placeholder="Write a caption..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  multiline
                  numberOfLines={4}
                  className="bg-background-card/40 border border-white/5 text-white rounded-2xl px-4 py-3.5 text-xs leading-5 flex-1 pr-4 font-normal"
                  style={{ textAlignVertical: 'top' }}
                />
                
                <View className="flex-row justify-between items-center px-1">
                  <View className="flex-row gap-2">
                    <Pressable 
                      onPress={() => setCaption((c) => c + ' #Hashtag')}
                      className="bg-[#A855F7]/10 px-3 py-1.5 rounded-full border border-[#A855F7]/20"
                    >
                      <Text className="text-[#A855F7] text-[11px] font-semibold"># Hashtag</Text>
                    </Pressable>
                    <Pressable 
                      onPress={() => setCaption((c) => c + ' @Mention')}
                      className="bg-[#A855F7]/10 px-3 py-1.5 rounded-full border border-[#A855F7]/20"
                    >
                      <Text className="text-[#A855F7] text-[11px] font-semibold">@ Mention</Text>
                    </Pressable>
                  </View>
                  <Text className="text-neutral-grey text-[10px] font-semibold">{caption.length}/200</Text>
                </View>
              </View>
            </View>

            {/* Monetisation & Gifting Toggles */}
            <View className="space-y-3.5">
              <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Monetization & Rewards</Text>
              
              <View className="bg-background-card/50 border border-white/5 rounded-3xl p-4 space-y-4">
                {/* Monetisation */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className="w-10 h-10 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/20 items-center justify-center mr-3">
                      <Banknote size={18} color="#A855F7" />
                    </View>
                    <View>
                      <Text className="text-white text-[13px] font-semibold">Monetisation</Text>
                      <Text className="text-neutral-grey text-[10px] mt-0.5">Earn from views ₹5 per 1,000 views</Text>
                    </View>
                  </View>
                  <Switch
                    value={monetization}
                    onValueChange={setMonetization}
                    trackColor={{ false: '#374151', true: '#A855F7' }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                {/* Gifting */}
                <View className="flex-row items-center justify-between border-t border-white/5 pt-4">
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className="w-10 h-10 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/20 items-center justify-center mr-3">
                      <Gift size={18} color="#EC4899" />
                    </View>
                    <View>
                      <Text className="text-white text-[13px] font-semibold">Allow Virtual Gifting</Text>
                      <Text className="text-neutral-grey text-[10px] mt-0.5">Receive gifts from fans</Text>
                    </View>
                  </View>
                  <Switch
                    value={allowGifting}
                    onValueChange={setAllowGifting}
                    trackColor={{ false: '#374151', true: '#A855F7' }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              </View>
            </View>

            {/* Visibility Options */}
            <View className="space-y-2.5">
              <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Visibility</Text>
              <View className="bg-background-card/50 border border-white/5 rounded-3xl p-2 flex-row justify-between space-x-2">
                {(['Public', 'Friends', 'Private'] as const).map((mode) => {
                  const isSel = visibility === mode;
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setVisibility(mode)}
                      className={`flex-1 h-10 rounded-2xl items-center justify-center ${
                        isSel ? 'bg-[#A855F7]' : 'bg-transparent'
                      }`}
                    >
                      <Text className={`text-[12px] font-semibold ${isSel ? 'text-white' : 'text-neutral-silver'}`}>
                        {mode}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Engagement Controls */}
            <View className="space-y-3">
              <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Engagement & Controls</Text>
              
              <View className="bg-background-card/50 border border-white/5 rounded-3xl px-4 py-1">
                {/* Allow comments */}
                <View className="flex-row items-center justify-between py-3 border-b border-white/5">
                  <View className="flex-row items-center flex-1">
                    <MessageCircle size={18} color="#9CA3AF" className="mr-3" />
                    <Text className="text-white text-[13px] font-semibold">Allow Comments</Text>
                  </View>
                  <Switch
                    value={allowComments}
                    onValueChange={setAllowComments}
                    trackColor={{ false: '#374151', true: '#D946EF' }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#1D1037'}
                  />
                </View>

                {/* Allow duets */}
                <View className="flex-row items-center justify-between py-3 border-b border-white/5">
                  <View className="flex-row items-center flex-1">
                    <GitCompare size={18} color="#9CA3AF" className="mr-3" />
                    <Text className="text-white text-[13px] font-semibold">Allow Duet / Remix</Text>
                  </View>
                  <Switch
                    value={allowDuet}
                    onValueChange={setAllowDuet}
                    trackColor={{ false: '#374151', true: '#D946EF' }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#1D1037'}
                  />
                </View>

                {/* Save to device */}
                <View className="flex-row items-center justify-between py-3">
                  <View className="flex-row items-center flex-1">
                    <Download size={18} color="#9CA3AF" className="mr-3" />
                    <Text className="text-white text-[13px] font-semibold">Save to Device</Text>
                  </View>
                  <Switch
                    value={saveToDevice}
                    onValueChange={setSaveToDevice}
                    trackColor={{ false: '#374151', true: '#D946EF' }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#1D1037'}
                  />
                </View>
              </View>
            </View>

            {/* Post CTA Pink-Gradient Button */}
            <View className="pt-3">
              <Pressable
                onPress={handlePostNow}
                disabled={isPosting}
                className="bg-gradient-to-tr from-primary-pink to-primary-purple h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary-pink/35 flex-row space-x-2 mt-2"
                style={{ backgroundColor: '#EC4899' }} // Gradient fallback
              >
                {isPosting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text className="text-white text-[15px] font-bold tracking-wide">Post Now</Text>
                    <Sparkles size={18} color="#FFFFFF" strokeWidth={2} />
                  </>
                )}
              </Pressable>
              
              <Text className="text-neutral-grey text-[10px] text-center mt-3 px-2 leading-4">
                By posting, you agree to our Content Policy and acknowledge that monetization rewards are subject to traffic verification.
              </Text>
            </View>
          </ScrollView>
        </MotiView>
      )}
    </AnimatePresence>
  );
}
