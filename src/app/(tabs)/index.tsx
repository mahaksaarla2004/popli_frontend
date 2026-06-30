import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, ViewToken, StyleSheet, useWindowDimensions, ScrollView, RefreshControl, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Bell, MessageSquare, Send, Search } from 'lucide-react-native';
import { PostItem } from '../../components/feed/PostItem';
import { StoriesBar } from '../../components/feed/StoriesBar';
import { CommentsSheet } from '../../components/sheets/CommentsSheet';
import { GiftSheet } from '../../components/sheets/GiftSheet';
import { SendSheet } from '../../components/sheets/SendSheet';
import { useFeedStore, useAuthStore, useStoryStore, useChatStore } from '../../store';
import { requestGPSLocation } from '../../services/geoService';
import { Reel } from '../../types';
import { MotiView } from 'moti';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';

type TopTabType = 'for_you' | 'following' | 'nearby' | 'trending';

export default function HomeFeedScreen() {
  const router = useRouter();
  const { targetUsername } = useLocalSearchParams<{ targetUsername?: string }>();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { reels, setGPS } = useFeedStore();
  const { userProfile, followingIds } = useAuthStore();
  const { stories } = useStoryStore();
  
  const [activeTab, setActiveTab] = useState<TopTabType>('for_you');
  const [activeReelId, setActiveReelId] = useState<string>('');
  const [isFocused, setIsFocused] = useState(true);
  const [listHeight, setListHeight] = useState(height);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreReels, setHasMoreReels] = useState(true);
  const flashListRef = useRef<any>(null);
  
  const [refreshCount, setRefreshCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback((e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    if (offsetY > 20 && !isScrolled) {
      setIsScrolled(true);
    } else if (offsetY <= 20 && isScrolled) {
      setIsScrolled(false);
    }
  }, [isScrolled]);

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

  const { chats, unreadNotificationsCount } = useChatStore();
  const unreadChatsCount = chats.filter((chat) => (chat.unreadCount || 0) > 0).length;
  const hasUnreadNotifications = unreadNotificationsCount > 0;

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
    const { fetchExploreReels } = useFeedStore.getState();
    const { fetchStories } = useStoryStore.getState();
    const { fetchNotifications, fetchChats } = useChatStore.getState();
    
    fetchExploreReels(1, 10, 'all').then(() => {
      // If we got less than 10, there might not be more
      const currentReels = useFeedStore.getState().reels;
      if (currentReels.length < 10) setHasMoreReels(false);
    }).catch(console.error);
    fetchStories();
    fetchNotifications();
    fetchChats();
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { fetchExploreReels, fetchFollowingReels } = useFeedStore.getState();
    const { fetchStories } = useStoryStore.getState();
    
    // Fetch stories and page 1 of reels to reset the feed
    fetchStories();

    if (activeTab === 'following') {
      await fetchFollowingReels(1, 10);
    } else {
      await fetchExploreReels(1, 10, 'all');
    }
    
    setHasMoreReels(true);
    setPage(1);
    
    // Reset active reel and scroll to top
    const newReels = useFeedStore.getState().reels;
    if (newReels.length > 0) {
      setActiveReelId(newReels[0].id);
      flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
    
    setRefreshCount(prev => prev + 1);
    setRefreshing(false);
  }, [activeTab]);

  const loadMoreReels = useCallback(async () => {
    if (isLoadingMore || !hasMoreReels || refreshing) return;
    const { fetchExploreReels, fetchFollowingReels } = useFeedStore.getState();
    
    setIsLoadingMore(true);
    const beforeCount = useFeedStore.getState().reels.length;
    const nextPage = page + 1;
    
    if (activeTab === 'following') {
      await fetchFollowingReels(nextPage, 10);
    } else {
      await fetchExploreReels(nextPage, 10, 'all');
    }
    
    const afterCount = useFeedStore.getState().reels.length;
    
    if (afterCount === beforeCount) {
      setHasMoreReels(false); // No new reels added
    } else {
      setPage(nextPage);
    }
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMoreReels, refreshing, activeTab, page]);

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
      case 'nearby': return reels.filter((r) => r.location?.city === (useFeedStore.getState().gpsCity || 'Indore'));
      case 'trending': return reels.filter((r) => r.likesCount > 40000);
      case 'for_you': default: return reels;
    }
  };

  const filteredReels = getFilteredReels();

  useEffect(() => {
    if (filteredReels.length > 0) {
      // If the active reel is not in the new filtered list, or if we switched tabs, we should ensure we are at the top
      // We will handle the tab change explicitly
      if (!activeReelId || !filteredReels.find(r => r.id === activeReelId)) {
         setTimeout(() => setActiveReelId(filteredReels[0].id), 0);
      }
    }
  }, [filteredReels]);

  // When activeTab changes, force scroll to top and play the first reel of the new tab
  useEffect(() => {
    if (filteredReels.length > 0) {
      flashListRef.current?.scrollToOffset({ offset: 0, animated: false });
      setTimeout(() => setActiveReelId(filteredReels[0].id), 50);
    }
  }, [activeTab]);

  // Handle Initial Target User Navigation
  useEffect(() => {
    if (targetUsername && reels.length > 0 && userProfile) {
      const firstReel = reels[0];
      if (firstReel.creatorUsername === userProfile.username && activeReelId !== firstReel.id) {
        setTimeout(() => setActiveReelId(firstReel.id), 0);
        flashListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }
    }
  }, [reels.length]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].isViewable) {
      setActiveReelId(viewableItems[0].item.id);
    }
  }, []);

  const [viewabilityConfig] = useState(() => ({ 
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 50
  }));

  const handleOpenComments = useCallback((reelId: string) => { setSelectedReelId(reelId); setIsCommentsOpen(true); }, []);
  const handleOpenSend = useCallback((reelId: string) => { setSelectedReelId(reelId); setIsSendOpen(true); }, []);
  const handleOpenProfile = useCallback((creatorUsername: string) => { router.push(`/user/${creatorUsername}`); }, [router]);

  const renderItem = useCallback(({ item, index, extraData }: { item: Reel; index: number, extraData?: any }) => {
    // CRITICAL FIX: FlashList requires using extraData instead of closure variables to trigger re-renders!
    const currentActiveId = extraData?.activeReelId || activeReelId;
    const currentIsFocused = extraData?.isFocused ?? isFocused;
    
    const activeIndex = filteredReels.findIndex(r => r.id === currentActiveId);
    // Keep ONLY current and next video loaded to prevent OOM
    const isAdjacent = currentIsFocused && (index === activeIndex || index === activeIndex + 1);

    return (
      <PostItem
        item={item}
        isActive={currentIsFocused && item.id === currentActiveId}
        onOpenComments={handleOpenComments}
        onOpenSend={handleOpenSend}
        windowWidth={extraData?.width || width}
      />
    );
  }, [filteredReels, handleOpenComments, handleOpenSend]);

  const keyExtractor = useCallback((item: Reel) => `${item.id}-${refreshCount}`, [refreshCount]);

  // Removed getItemLayout as FlashList handles it efficiently with estimatedItemSize

  return (
    <View 
      style={{ flex: 1, backgroundColor: '#000000' }} 
      className="relative"
      onLayout={(e) => {
        const measuredHeight = Math.floor(e.nativeEvent.layout.height);
        if (measuredHeight > 0) {
          setListHeight(measuredHeight);
        }
      }}
    >
      
      {/* Top Header with Solid Background */}
      <View 
        className="absolute left-0 right-0 z-50 flex-row justify-between items-center px-3 pb-3"
        style={{ 
          top: 0,
          paddingTop: insets.top > 0 ? insets.top + 10 : 30,
          backgroundColor: '#12081E',
          elevation: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.05)'
        }}
      >
        <View className="flex-1 items-start">
          <Pressable onPress={() => router.push('/(tabs)/discover')} className="w-9 sm:w-10 h-9 sm:h-10 bg-white/10 rounded-full items-center justify-center active:scale-95">
            <Search size={20} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>

        <MotiView 
          className="flex-row items-center justify-center pointer-events-none absolute left-0 right-0 top-0 bottom-0"
          animate={{ opacity: isScrolled ? 0 : 1 }}
          transition={{ type: 'timing', duration: 250 }}
        >
          <Image 
            source={require('../../../assets/images/custom_logo.png')} 
            style={{ height: 28, width: 90, resizeMode: 'contain' }}
          />
        </MotiView>

        <View className="flex-1 flex-row items-center justify-end gap-1.5 sm:gap-2">
          <Pressable onPress={() => router.push('/notifications')} className="w-9 sm:w-10 h-9 sm:h-10 items-center justify-center active:scale-95">
            <Bell size={22} color="#FFFFFF" strokeWidth={2.5} />
            {hasUnreadNotifications && (
              <View className="absolute top-[6px] right-[6px] w-2.5 h-2.5 bg-[#D946EF] rounded-full border border-black" />
            )}
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/inbox')} className="w-9 sm:w-10 h-9 sm:h-10 bg-white/10 rounded-full items-center justify-center active:scale-95">
            <MessageSquare size={20} color="#FFFFFF" strokeWidth={2.5} className="mr-0.5 mt-0.5" />
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
        <FlashList
          ref={flashListRef}
          data={filteredReels}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          pagingEnabled={false}
          showsVerticalScrollIndicator={false}
          bounces={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          // @ts-ignore
          estimatedItemSize={width * 1.5}
          // @ts-ignore
          extraData={{ activeReelId, isFocused, listHeight, width }}
          onEndReached={loadMoreReels}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={StoriesBar}
          contentContainerStyle={{ backgroundColor: '#12081E', paddingTop: insets.top > 0 ? insets.top + 60 : 80, paddingBottom: 100 }}
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
    </View>
  );
}
