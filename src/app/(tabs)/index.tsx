import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, FlatList, ViewToken, StyleSheet, useWindowDimensions, ScrollView, RefreshControl } from 'react-native';
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

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { fetchReels } = useFeedStore.getState();
    const { fetchStories } = useStoryStore.getState();
    
    // Fetch stories and page 1 of reels to reset the feed
    fetchStories();
    await fetchReels(1, 10, 'all');
    
    // Reset active reel and scroll to top
    const newReels = useFeedStore.getState().reels;
    if (newReels.length > 0) {
      setActiveReelId(newReels[0].id);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
    
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (userProfile?.id) {
      const { fetchFollowingIds } = useAuthStore.getState();
      fetchFollowingIds(userProfile.id);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (activeTab === 'following') {
      const { fetchFollowingReels } = useFeedStore.getState();
      fetchFollowingReels(1, 10);
    }
  }, [activeTab, followingIds.length]);

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
          maxToRenderPerBatch={1}
          windowSize={3}
          initialNumToRender={1}
          removeClippedSubviews={true}
          style={{ width, height }}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#A855F7"
              colors={['#A855F7']}
              progressViewOffset={100} // Push it below the top tabs
            />
          }
        />
      )}

      {/* Sheets & Overlays */}
      <CommentsSheet reelId={selectedReelId} isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} />
      <SendSheet reelId={selectedReelId} isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
      <GiftSheet reel={selectedReel} isOpen={isGiftsOpen} onClose={() => setIsGiftsOpen(false)} onSendSuccess={handleGiftSendSuccess} />

      {burstGift.visible && (
        <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-black/70 z-50" pointerEvents="none">
          {/* Glowing Aura Behind */}
          <MotiView
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
            transition={{ type: 'timing', duration: 1500, loop: true }}
            style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(217, 70, 239, 0.4)' }}
          />

          {/* Floating Confetti Elements */}
          {[
            { x: -100, y: -150, d: 0, s: '✨' },
            { x: 120, y: -200, d: 100, s: '🎉' },
            { x: -150, y: 50, d: 200, s: '💫' },
            { x: 140, y: 80, d: 300, s: '💖' },
            { x: 0, y: -250, d: 400, s: '🎊' }
          ].map((confetti, i) => (
            <MotiView
              key={i}
              from={{ translateY: 0, translateX: 0, opacity: 1, scale: 0 }}
              animate={{ 
                translateY: confetti.y, 
                translateX: confetti.x, 
                opacity: 0, 
                scale: 1.5,
                rotate: `${confetti.x}deg` 
              }}
              transition={{ type: 'timing', duration: 1200, delay: confetti.d }}
              style={{ position: 'absolute' }}
            >
              <Text style={{ fontSize: 28 }}>{confetti.s}</Text>
            </MotiView>
          ))}

          {/* Main Animated Icon & Text */}
          <MotiView
            from={{ scale: 0.1, opacity: 0, rotate: '-20deg', translateY: 50 }}
            animate={{ scale: [1.2, 2.2, 1.8], opacity: 1, rotate: '0deg', translateY: 0 }}
            transition={{ type: 'spring', damping: 6, stiffness: 120 }}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ fontSize: 130, textShadowColor: 'rgba(255,255,255,0.4)', textShadowRadius: 30 }}>
              {burstGift.icon}
            </Text>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', delay: 300, duration: 400 }}
              style={{ alignItems: 'center' }}
            >
              <Text className="text-yellow-400 font-black text-4xl mt-6 uppercase tracking-widest text-shadow shadow-black">
                GIFT SENT!
              </Text>
              <Text className="text-white font-bold text-sm tracking-widest mt-2 opacity-80">
                AWESOME VIBES 🚀
              </Text>
            </MotiView>
          </MotiView>
        </View>
      )}

    </View>
  );
}
