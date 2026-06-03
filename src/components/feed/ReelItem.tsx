import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, Pressable, Dimensions, StyleSheet, Animated, Platform, Alert } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Heart, MessageCircle, Share2, Award, Music, Plus, Send, Check } from 'lucide-react-native';
import { Reel } from '../../types';
import { useFeedStore, useAuthStore, useWalletStore } from '../../store';
import { formatSocialCount } from '../../utils';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';

interface ReelItemProps {
  item: Reel;
  isActive: boolean;
  onOpenComments: (reelId: string) => void;
  onOpenGifts: (reel: Reel) => void;
  onOpenProfile: (creatorId: string) => void;
  windowWidth: number;
  windowHeight: number;
}

export const ReelItem = React.memo(({
  item,
  isActive,
  onOpenComments,
  onOpenGifts,
  onOpenProfile,
  windowWidth: width,
  windowHeight: height
}: ReelItemProps) => {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toggleLikeReel, toggleSaveReel } = useFeedStore();
  const { followingIds, toggleFollow } = useAuthStore();

  // Heart Burst Double-Tap Animation States
  const [doubleTapHearts, setDoubleTapHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastTapRef = useRef<number | null>(null);

  // Audio setup for native sound respect
  useEffect(() => {
    if (isActive) {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    }
  }, [isActive]);

  const handleDoubleTap = useCallback((e: any) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      // Trigger like state
      if (!item.isLiked) {
        toggleLikeReel(item.id);
      }
      
      // Heart burst positions from touch coordinate
      const { locationX, locationY } = e.nativeEvent;
      const newHeart = {
        id: Date.now(),
        x: locationX - 40, // offset half size
        y: locationY - 40
      };
      
      setDoubleTapHearts((prev) => [...prev, newHeart]);
      
      // Clean up heart after animation completes
      setTimeout(() => {
        setDoubleTapHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 800);
    } else {
      // Toggle play/pause or mute on single tap
      setIsMuted((prev) => !prev);
    }
    lastTapRef.current = now;
  }, [item.isLiked, toggleLikeReel]);

  const isFollowing = followingIds.includes(item.creatorId);
  const isVerifiedCreator = ['rahul_dance_off', 'aria_styles', 'marcus_vlogs', 'vikram_tech', 'elena_fashion'].includes(item.creatorUsername);
  
  const isPhotoPost = item.videoUrl.includes('unsplash.com') || item.videoUrl.includes('picsum.photos') || item.videoUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null;

  return (
    <View style={{ width, height, backgroundColor: '#000000' }} className="relative">
      
      {/* 0. TOP FLOATING ACTIONS (Figma-level: Plus & Direct Inbox Plane) */}
      <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center z-20">
        {/* Plus Button on Left */}
        <Pressable 
          onPress={() => Alert.alert('Add Creator Reel', 'Select a video from your gallery or start recording to go viral!')}
          className="w-10 h-10 bg-black/35 border border-white/10 rounded-full items-center justify-center active:scale-95"
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>

        {/* Paper Plane Button on Right */}
        <Pressable 
          onPress={() => router.push('/notifications')}
          className="w-10 h-10 bg-black/35 border border-white/10 rounded-full items-center justify-center active:scale-95 pl-0.5"
        >
          <Send size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* 1. EXPO AV VIDEO PLAYER CELL OR IMAGE CELL */}
      <Pressable onPress={handleDoubleTap} style={StyleSheet.absoluteFill}>
        {isPhotoPost ? (
          <Image
            source={{ uri: item.videoUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <>
            {isActive && (
              <Video
                ref={videoRef}
                source={{ uri: item.videoUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode={ResizeMode.COVER}
                shouldPlay={isActive}
                isLooping
                isMuted={isMuted}
                onLoad={() => setIsLoaded(true)}
                videoStyle={{ width, height }}
              />
            )}

            {/* Static high-res placeholder before play or fallback */}
            {(!isLoaded || !isActive) && (
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                className="blur-lg opacity-80"
              />
            )}
          </>
        )}
      </Pressable>

      {/* 2. REANIMATED DOUBLE TAP HEART BURST */}
      {doubleTapHearts.map((heart) => (
        <MotiView
          key={heart.id}
          from={{ opacity: 0, scale: 0.3, translateY: 0 }}
          animate={{ opacity: 1, scale: 1.4, translateY: -40 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', damping: 10, stiffness: 150 }}
          style={{
            position: 'absolute',
            left: heart.x,
            top: heart.y,
            zIndex: 99,
          }}
        >
          <Heart size={80} color="#EC4899" fill="#EC4899" />
        </MotiView>
      ))}

      {/* 3. FIGMA FIGURATIVE INTERACTION OVERLAYS (Right Sidebar) */}
      <View className="absolute right-4 bottom-28 items-center z-10">
        {/* Creator Avatar with follow + button */}
        <View className="relative items-center mb-6">
          <Pressable 
            onPress={() => onOpenProfile(item.creatorId)}
            className="w-12 h-12 rounded-full border-2 border-primary-purple overflow-hidden"
          >
            <Image source={{ uri: item.creatorAvatar }} className="w-full h-full" />
          </Pressable>
          
          <Pressable 
            onPress={() => toggleFollow(item.creatorId)}
            className={`absolute -bottom-1.5 w-5 h-5 rounded-full items-center justify-center ${
              isFollowing ? 'bg-neutral-grey' : 'bg-primary-pink'
            }`}
          >
            <Text className="text-white text-xs font-bold -mt-0.5">{isFollowing ? '✓' : '+'}</Text>
          </Pressable>
        </View>

        {/* Like Button */}
        <Pressable 
          onPress={() => toggleLikeReel(item.id)} 
          className="items-center mb-6"
        >
          <MotiView
            animate={{ scale: item.isLiked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 300 }}
          >
            <Heart 
              size={28} 
              color={item.isLiked ? '#EC4899' : '#FFFFFF'} 
              fill={item.isLiked ? '#EC4899' : 'transparent'} 
            />
          </MotiView>
          <Text className="text-white text-xs font-semibold mt-1">
            {formatSocialCount(item.likesCount)}
          </Text>
        </Pressable>

        {/* Comment Button */}
        <Pressable onPress={() => onOpenComments(item.id)} className="items-center mb-6">
          <MessageCircle size={28} color="#FFFFFF" />
          <Text className="text-white text-xs font-semibold mt-1">
            {formatSocialCount(item.commentsCount)}
          </Text>
        </Pressable>

        {/* Save/Bookmark */}
        <Pressable onPress={() => toggleSaveReel(item.id)} className="items-center mb-6">
          <Share2 size={28} color="#FFFFFF" />
          <Text className="text-white text-xs font-semibold mt-1">Share</Text>
        </Pressable>

        {/* Gift Button - Glowing Gold Figma Element */}
        <View className="items-center">
          <Pressable 
            onPress={() => onOpenGifts(item)} 
            className="w-12 h-12 bg-yellow-500 border-2 border-yellow-400 rounded-full items-center justify-center shadow-lg shadow-yellow-500/50"
          >
            <Award size={24} color="#0B001A" fill="#0B001A" strokeWidth={2} />
          </Pressable>
          <Text className="text-yellow-400 text-xs font-bold mt-1 shadow-sm shadow-black">Gift</Text>
        </View>
      </View>

      {/* 4. REEL DESCRIPTIONS (Bottom Overlay) */}
      <View className="absolute left-4 bottom-28 right-20 space-y-2.5 z-10">
        <Pressable onPress={() => onOpenProfile(item.creatorId)}>
          <View className="flex-row items-center space-x-2">
            <Text className="text-white font-bold text-base">@{item.creatorUsername}</Text>
            
            {/* Verified badge matching Figma */}
            {isVerifiedCreator && (
              <View className="bg-blue-500 w-[15px] h-[15px] rounded-full items-center justify-center pl-0.5 border border-white/20">
                <Check size={9} color="#FFFFFF" strokeWidth={4.5} />
              </View>
            )}

          </View>
        </Pressable>

        <Text className="text-neutral-silver text-sm leading-5 font-normal" numberOfLines={3}>
          {item.description}
        </Text>

        {/* Music Ticker */}
        <View className="flex-row items-center space-x-2 pt-1">
          <Music size={14} color="#D1D5DB" />
          <View className="w-48 overflow-hidden">
            <Text className="text-neutral-silver text-xs font-medium" numberOfLines={1}>
              {item.musicName}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom navigation shade blocker */}
      <View style={{ height: Platform.OS === 'ios' ? 88 : 68 }} className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent" />
    </View>
  );
});

ReelItem.displayName = 'ReelItem';

