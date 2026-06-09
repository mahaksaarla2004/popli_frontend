import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, FlatList, ViewToken, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { Bell, MessageSquare, Send } from 'lucide-react-native';
import { ReelItem } from '../../components/feed/ReelItem';
import { CommentsSheet } from '../../components/sheets/CommentsSheet';
import { GiftSheet } from '../../components/sheets/GiftSheet';
import { SendSheet } from '../../components/sheets/SendSheet';
import { useFeedStore, useAuthStore, useStoryStore, useChatStore } from '../../store';
import { requestGPSLocation, getClosestMockCity } from '../../services/geoService';
import { Reel } from '../../types';
import { MotiView } from 'moti';
import { useRouter, useFocusEffect } from 'expo-router';

type TopTabType = 'for_you' | 'following' | 'nearby' | 'trending';

export default function HomeFeedScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const { reels, setGPS } = useFeedStore();
  const { userProfile, followingIds } = useAuthStore();
  const { stories } = useStoryStore();
  
  const [activeTab, setActiveTab] = useState<TopTabType>('for_you');
  const [activeReelId, setActiveReelId] = useState<string>('');
  const [isFocused, setIsFocused] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setTimeout(() => {
        if (mounted) setIsFocused(true);
      }, 0);
      return () => {
        mounted = false;
        setIsFocused(false);
      };
    }, [])
  );
  
  // Sheet Overlays States
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState<string>('');
  
  const [isGiftsOpen, setIsGiftsOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);

  // Success Burst Haptic overlay
  const [burstGift, setBurstGift] = useState<{ visible: boolean; icon: string }>({ visible: false, icon: '' });

  const { chats, notifications } = useChatStore();
  const unreadChatsCount = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
  const hasUnreadNotifications = notifications.some(n => !n.isRead);

  useEffect(() => {
    async function initLocation() {
      const gps = await requestGPSLocation();
      if (gps) {
        setGPS(gps.latitude, gps.longitude, gps.city);
      } else {
        setGPS(22.7196, 75.8577, 'Indore');
      }
    }
    initLocation();
    
    // Fetch real reels on mount
    const { fetchReels } = useFeedStore.getState();
    const { fetchStories } = useStoryStore.getState();
    fetchReels(1, 10, 'all');
    fetchStories();
  }, []);

  const getFilteredReels = () => {
    switch (activeTab) {
      case 'following': return reels.filter((r) => followingIds.includes(r.creatorId));
      case 'nearby': return reels.filter((r) => r.location.city === (useFeedStore.getState().gpsCity || 'Indore'));
      case 'trending': return reels.filter((r) => r.likesCount > 40000);
      case 'for_you': default: return reels;
    }
  };

  const filteredReels = getFilteredReels();

  useEffect(() => {
    if (filteredReels.length > 0 && !activeReelId) {
      setActiveReelId(filteredReels[0].id);
    }
  }, [filteredReels]);

  useEffect(() => {
    if (reels.length > 0) {
      const firstReel = reels[0];
      if (firstReel.creatorUsername === userProfile.username && activeReelId !== firstReel.id) {
        setActiveReelId(firstReel.id);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }
    }
  }, [reels.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].isViewable) {
      setActiveReelId(viewableItems[0].item.id);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const handleOpenComments = useCallback((reelId: string) => { setSelectedReelId(reelId); setIsCommentsOpen(true); }, []);
  const handleOpenSend = useCallback((reelId: string) => { setSelectedReelId(reelId); setIsSendOpen(true); }, []);
  const handleOpenGifts = useCallback((reel: Reel) => { setSelectedReel(reel); setIsGiftsOpen(true); }, []);
  const handleOpenProfile = useCallback((creatorUsername: string) => { router.push(`/user/${creatorUsername}`); }, [router]);

  const handleGiftSendSuccess = (icon: string) => {
    setBurstGift({ visible: true, icon });
    setTimeout(() => setBurstGift({ visible: false, icon: '' }), 1500);
  };

  const renderItem = useCallback(({ item }: { item: Reel }) => {
    return (
      <ReelItem
        item={item}
        isActive={isFocused && item.id === activeReelId}
        onOpenComments={handleOpenComments}
        onOpenSend={handleOpenSend}
        onOpenGifts={handleOpenGifts}
        onOpenProfile={handleOpenProfile}
        windowWidth={width}
        windowHeight={height}
      />
    );
  }, [isFocused, activeReelId, handleOpenComments, handleOpenSend, handleOpenGifts, handleOpenProfile, width, height]);

  const keyExtractor = useCallback((item: Reel) => item.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }} className="relative">
      
      {/* Top Segmented Tabs Overlay & Notification Bell */}
      <View className="absolute top-12 left-0 right-0 z-20 flex-row justify-between items-center px-4">
        <View className="w-[84px] h-10" />

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
                <Text className={`text-[15px] ${isCurrent ? 'text-white font-bold' : 'text-white/80 font-semibold'}`}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => router.push('/notifications')} className="w-10 h-10 items-center justify-center active:scale-95">
            <Bell size={24} color="#FFFFFF" strokeWidth={2.5} />
            {hasUnreadNotifications && (
              <View className="absolute top-[8px] right-[8px] w-2.5 h-2.5 bg-[#D946EF] rounded-full border border-black" />
            )}
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/inbox')} className="w-10 h-10 bg-black/40 rounded-full items-center justify-center active:scale-95">
            <Send size={20} color="#FFFFFF" strokeWidth={2.5} className="mr-0.5 mt-0.5" />
            {unreadChatsCount > 0 && (
              <View className="absolute top-0 right-0 bg-[#D946EF] rounded-full px-[5px] py-[1px] border-[1.5px] border-black">
                <Text className="text-white text-[8px] font-bold">{unreadChatsCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Vertical Reels List */}
      {filteredReels.length === 0 ? (
        <View className="flex-1 items-center justify-center bg-background-plum">
          <Text className="text-white/60 text-sm font-semibold">No reels available in this tab yet.</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
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
          disableIntervalMomentum={true}
        />
      )}

      {/* Sheets & Overlays */}
      <CommentsSheet reelId={selectedReelId} isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} />
      <SendSheet reelId={selectedReelId} isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
      <GiftSheet reel={selectedReel} isOpen={isGiftsOpen} onClose={() => setIsGiftsOpen(false)} onSendSuccess={handleGiftSendSuccess} />

      {burstGift.visible && (
        <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-black/40 z-50">
          <MotiView
            from={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: [1, 2.5, 1.8], opacity: 1 }}
            transition={{ type: 'spring', damping: 8 }}
            style={{ alignItems: 'center' }}
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
