import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, FlatList, ViewToken, StyleSheet, useWindowDimensions } from 'react-native';
import { Bell } from 'lucide-react-native';
import { ReelItem } from '../../components/feed/ReelItem';
import { CommentsSheet } from '../../components/sheets/CommentsSheet';
import { GiftSheet } from '../../components/sheets/GiftSheet';
import { useFeedStore, useAuthStore } from '../../store';
import { requestGPSLocation, getClosestMockCity } from '../../services/geoService';
import { Reel } from '../../types';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';

type TopTabType = 'for_you' | 'following' | 'nearby' | 'trending';

export default function HomeFeedScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const { reels, setGPS } = useFeedStore();
  const { followingIds } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<TopTabType>('for_you');
  const [activeReelId, setActiveReelId] = useState<string>('');
  
  // Sheet Overlays States
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState<string>('');
  
  const [isGiftsOpen, setIsGiftsOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);

  // Success Burst Haptic overlay
  const [burstGift, setBurstGift] = useState<{ visible: boolean; icon: string }>({ visible: false, icon: '' });

  // 1. Core location initialization
  useEffect(() => {
    async function initLocation() {
      const gps = await requestGPSLocation();
      if (gps) {
        setGPS(gps.latitude, gps.longitude, gps.city);
      } else {
        // Preset fallbacks
        setGPS(22.7196, 75.8577, 'Indore');
      }
    }
    initLocation();
  }, []);

  // 2. Filter reels based on active top tab
  const getFilteredReels = () => {
    switch (activeTab) {
      case 'following':
        return reels.filter((r) => followingIds.includes(r.creatorId));
      case 'nearby':
        // Filter reels close to current city
        const currentCity = useFeedStore.getState().gpsCity || 'Indore';
        return reels.filter((r) => r.location.city === currentCity);
      case 'trending':
        return reels.filter((r) => r.likesCount > 40000);
      case 'for_you':
      default:
        return reels;
    }
  };

  const filteredReels = getFilteredReels();

  // Set the first item active initially
  useEffect(() => {
    if (filteredReels.length > 0 && !activeReelId) {
      setActiveReelId(filteredReels[0].id);
    }
  }, [filteredReels]);

  // 3. Viewable Items Change listener for playing ONLY visible reels
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].isViewable) {
      setActiveReelId(viewableItems[0].item.id);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80, // Renders active if 80% visible
  }).current;

  // Interactivity triggers
  const handleOpenComments = useCallback((reelId: string) => {
    setSelectedReelId(reelId);
    setIsCommentsOpen(true);
  }, []);

  const handleOpenGifts = useCallback((reel: Reel) => {
    setSelectedReel(reel);
    setIsGiftsOpen(true);
  }, []);

  const handleOpenProfile = useCallback((creatorId: string) => {
    // Navigate dynamically to profile tab
    router.push('/(tabs)/profile');
  }, [router]);

  const handleGiftSendSuccess = (icon: string) => {
    setBurstGift({ visible: true, icon });
    setTimeout(() => {
      setBurstGift({ visible: false, icon: '' });
    }, 1500);
  };

  const renderItem = useCallback(({ item }: { item: Reel }) => {
    return (
      <ReelItem
        item={item}
        isActive={item.id === activeReelId}
        onOpenComments={handleOpenComments}
        onOpenGifts={handleOpenGifts}
        onOpenProfile={handleOpenProfile}
        windowWidth={width}
        windowHeight={height}
      />
    );
  }, [activeReelId, handleOpenComments, handleOpenGifts, handleOpenProfile, width, height]);

  const keyExtractor = useCallback((item: Reel) => item.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }} className="relative">
      
      {/* Top Segmented Tabs Overlay & Notification Bell */}
      <View className="absolute top-12 left-0 right-0 z-20 flex-row justify-between items-center px-4">
        {/* Spacer for exact centering */}
        <View className="w-10 h-10" />

        <View className="flex-row bg-black/40 rounded-full p-1">
          {(['for_you', 'following'] as const).map((tab) => {
            const isCurrent = activeTab === tab;
            const label = tab === 'for_you' ? 'For you' : 'Following';
            return (
              <Pressable 
                key={tab} 
                onPress={() => setActiveTab(tab)} 
                className={`items-center px-4 py-1.5 rounded-full ${isCurrent ? 'bg-white/20' : 'bg-transparent'}`}
              >
                <Text className={`text-[15px] ${isCurrent ? 'text-white font-bold' : 'text-white/80 font-semibold'}`}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Notifications Icon (Right) */}
        <Pressable 
          onPress={() => router.push('/notifications')} 
          className="w-10 h-10 items-center justify-center active:scale-95"
        >
          <Bell size={24} color="#FFFFFF" strokeWidth={2.5} />
          {/* Unread alert dot */}
          <View className="absolute top-[8px] right-[8px] w-2.5 h-2.5 bg-[#D946EF] rounded-full border border-black" />
        </Pressable>
      </View>

      {/* Vertical Reels List */}
      {filteredReels.length === 0 ? (
        <View className="flex-1 items-center justify-center bg-background-plum">
          <Text className="text-white/60 text-sm font-semibold">No reels available in this tab yet.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReels}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          maxToRenderPerBatch={2}
          removeClippedSubviews
          style={{ width, height }}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      )}

      {/* Comments Sliding Bottom Sheet */}
      <CommentsSheet
        reelId={selectedReelId}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      />

      {/* Gifts Sliding Bottom Sheet */}
      <GiftSheet
        reel={selectedReel}
        isOpen={isGiftsOpen}
        onClose={() => setIsGiftsOpen(false)}
        onSendSuccess={handleGiftSendSuccess}
      />

      {/* Virtual Gift Send Success Burst Overlay */}
      {burstGift.visible && (
        <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-black/40 z-50">
          <MotiView
            from={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: [1, 2.5, 1.8], opacity: 1 }}
            transition={{ type: 'spring', damping: 8 }}
            className="items-center"
          >
            <Text style={{ fontSize: 110 }}>{burstGift.icon}</Text>
            <Text className="text-accent-yellow font-black text-2xl mt-4 uppercase tracking-widest text-shadow shadow-black/80">
              Gift Sent! 🎉
            </Text>
          </MotiView>
        </View>
      )}

    </View>
  );
}

const Transition = {
  type: 'spring',
  damping: 15,
} as const;

import { Alert } from 'react-native';
