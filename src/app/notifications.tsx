import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Gift, Heart, MessageCircle, AtSign, UserPlus } from 'lucide-react-native';
import { useChatStore, useAuthStore } from '../store';
import { NotificationItem } from '../types';
import { FlashList } from '@shopify/flash-list';
import { apiClient } from '../api/client';

type ListItem = 
  | { type: 'header'; title: string; id: string }
  | { type: 'notification'; data: NotificationItem; id: string };

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, fetchNotifications, fetchNextNotifications, markNotificationsRead, hasMoreNotifications } = useChatStore();
  const { userProfile, followingIds, toggleFollow } = useAuthStore();
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
    return () => {
      markNotificationsRead();
      // Inform backend too
      apiClient.patch('/notifications/read-all').catch(() => {});
    };
  }, []);

  const flattenedData = useMemo(() => {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const thisWeek: NotificationItem[] = [];
    const older: NotificationItem[] = [];

    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;

    notifications.forEach(n => {
      const nDate = new Date(n.createdAt || Date.now());
      const diffMs = now.getTime() - nDate.getTime();
      const diffDays = diffMs / msInDay;

      if (diffDays < 1) today.push(n);
      else if (diffDays < 2) yesterday.push(n);
      else if (diffDays < 7) thisWeek.push(n);
      else older.push(n);
    });

    const result: ListItem[] = [];
    if (today.length > 0) {
      result.push({ type: 'header', title: 'Today', id: 'h-today' });
      today.forEach(n => result.push({ type: 'notification', data: n, id: n.id }));
    }
    if (yesterday.length > 0) {
      result.push({ type: 'header', title: 'Yesterday', id: 'h-yesterday' });
      yesterday.forEach(n => result.push({ type: 'notification', data: n, id: n.id }));
    }
    if (thisWeek.length > 0) {
      result.push({ type: 'header', title: 'This week', id: 'h-thisweek' });
      thisWeek.forEach(n => result.push({ type: 'notification', data: n, id: n.id }));
    }
    if (older.length > 0) {
      result.push({ type: 'header', title: 'Older', id: 'h-older' });
      older.forEach(n => result.push({ type: 'notification', data: n, id: n.id }));
    }

    return result;
  }, [notifications]);

  const handleEndReached = async () => {
    if (hasMoreNotifications && !loadingMore) {
      setLoadingMore(true);
      await fetchNextNotifications();
      setLoadingMore(false);
    }
  };

  const markAsRead = async (id: string) => {
    useChatStore.setState(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    }));
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch(e) {}
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return <Text className="text-white font-bold text-[15px] mt-4 mb-3 ml-2">{item.title}</Text>;
    }

    const n = item.data;
    const isNew = !n.isRead;
    
    // Time format helper (Instagram style: 1m, 2h, 3d, 4w)
    const timeAgo = () => {
      const ms = new Date().getTime() - new Date(n.createdAt).getTime();
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);

      if (weeks > 0) return `${weeks}w`;
      if (days > 0) return `${days}d`;
      if (hours > 0) return `${hours}h`;
      if (minutes > 0) return `${minutes}m`;
      return `${seconds}s`;
    };

    const handlePress = () => {
      markAsRead(n.id);
      
      const type = n.type?.toLowerCase();
      
      if (type === 'follow') {
        if (n.actorId) router.push(`/profile/${n.actorId}` as any);
      } else if (type === 'story_mention' && n.storyId) {
        router.push(`/story-viewer/${n.actorId}?storyId=${n.storyId}` as any);
      } else if (n.reelId || n.postId) {
        const targetReelId = n.reelId || n.postId;
        if (type === 'comment' || type === 'reply' || type === 'mention') {
          router.push(`/reel/${targetReelId}?commentId=${n.commentId}` as any);
        } else if (type === 'gift') {
          router.push(`/reel/${targetReelId}?showGiftSheet=true` as any);
        } else {
          router.push(`/reel/${targetReelId}` as any);
        }
      }
    };

    // Construct text logic
    const type = n.type?.toLowerCase();
    let actionText = '';
    let boldText = '';

    if (type === 'like') {
      actionText = ' liked your reel.';
    } else if (type === 'comment_like') {
      actionText = ' liked your comment.';
    } else if (type === 'comment') {
      actionText = ` commented: ${n.commentText || ''}`;
    } else if (type === 'reply') {
      actionText = ` replied to your comment: ${n.commentText || ''}`;
    } else if (type === 'mention') {
      actionText = ' mentioned you in a comment.';
    } else if (type === 'story_mention') {
      actionText = ' mentioned you in a story.';
    } else if (type === 'follow') {
      actionText = ' started following you.';
    } else if (type === 'gift') {
      actionText = ` sent you a ${n.giftType || 'gift'} on your reel.`;
    } else {
      actionText = ` ${n.type || 'interacted with you'}.`;
    }

    const t = n.postThumbnail || n.reelThumbnail || n.storyThumbnail;

    return (
      <Pressable 
        onPress={handlePress}
        className={`flex-row items-center justify-between p-3 active:bg-white/5 ${isNew ? 'bg-[#8B5CF6]/10' : 'bg-transparent'}`}
      >
        <View className="flex-row items-center gap-3 flex-1 pr-3">
          <Pressable onPress={() => n.actorId && router.push(`/profile/${n.actorId}` as any)}>
            <Image source={{ uri: n.actorAvatar || 'https://i.pravatar.cc/150' }} className="w-11 h-11 rounded-full bg-white/10" />
          </Pressable>
          
          <View className="flex-1 flex-col justify-center">
            <Text className="text-white text-[14px] leading-[18px]">
              <Text className="font-bold">{n.actorName || 'User'}</Text>
              <Text className="text-white/80">{actionText}</Text>
              <Text className="text-white/50 ml-1"> {timeAgo()}</Text>
            </Text>
            
            {type === 'story_mention' && n.storyId && (
              <View className="flex-row mt-1.5">
                <Pressable 
                  onPress={(e) => {
                    e.stopPropagation();
                    const url = `/(create)/story-editor?mode=STORY&type=image&uri=${encodeURIComponent(n.storyThumbnail || '')}&originalStoryId=${n.storyId}&originalOwnerId=${n.actorId}&originalOwnerUsername=${encodeURIComponent(n.actorName || '')}`;
                    router.push(url as any);
                  }}
                  className="py-1 px-3 bg-[#D946EF]/20 rounded-md border border-[#D946EF]/30 active:bg-[#D946EF]/30"
                >
                  <Text className="text-[#D946EF] text-[11px] font-bold">Add to your story</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Right side component */}
        <View className="items-center justify-center">
          {type === 'follow' ? (() => {
            const isFollowing = followingIds.includes(n.actorId as string);
            return (
              <Pressable 
                onPress={() => {
                  if (n.actorId) toggleFollow(n.actorId);
                }}
                className={`px-4 py-1.5 rounded-lg ${isFollowing ? 'bg-white/10' : 'bg-[#D946EF]'}`}
              >
                <Text className="text-white text-[13px] font-bold">
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            );
          })() : (
            t ? (
              <View className="relative w-11 h-11">
                <Image source={{ uri: t }} className="w-full h-full rounded-md border border-white/10" />
                {type === 'gift' && (
                  <View className="absolute -bottom-1 -left-1 bg-[#1D1037] rounded-full p-0.5">
                    <Gift size={12} color="#facc15" />
                  </View>
                )}
              </View>
            ) : null
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-[#0d071a] pt-12">
      {/* Header bar */}
      <View className="flex-row items-center px-4 pb-4 border-b border-white/5">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-70">
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-[19px] ml-2">Notifications</Text>
      </View>

      <View className="flex-1">
        {flattenedData.length === 0 && !loadingMore ? (
          <View className="py-20 items-center justify-center">
            <View className="w-16 h-16 border border-white/10 rounded-full items-center justify-center mb-4">
              <Heart size={24} color="#9CA3AF" />
            </View>
            <Text className="text-white/60 font-semibold">Activity On Your Posts</Text>
            <Text className="text-white/40 text-[13px] mt-2">When someone likes or comments on one of your posts, you'll see it here.</Text>
          </View>
        ) : (
          <FlashList
            data={flattenedData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            // @ts-ignore
            estimatedItemSize={70}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListFooterComponent={loadingMore ? <ActivityIndicator color="#8B5CF6" className="my-4" /> : null}
          />
        )}
      </View>
    </View>
  );
}
