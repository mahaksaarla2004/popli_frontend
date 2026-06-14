import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet, Animated, Platform, Alert, Share, Modal } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAudioPlayer } from 'expo-audio';
import { useEventListener } from 'expo';
import { Heart, MessageCircle, Share2, Award, Music, Plus, Send, Check, Eye, VolumeX, Volume2, Users, MapPin, Bookmark, TrendingUp, Trash2 } from 'lucide-react-native';
import { Reel } from '../../types';
import { useFeedStore, useAuthStore, useWalletStore } from '../../store';
import { formatSocialCount, formatRelativeTime, getDefaultAvatar } from '../../utils';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import Svg, { Path, G } from 'react-native-svg';

interface ReelItemProps {
  item: Reel;
  isActive: boolean;
  onOpenComments: (reelId: string) => void;
  onOpenSend: (reelId: string) => void;
  onOpenGifts: (reel: Reel) => void;
  onOpenProfile: (creatorId: string) => void;
  windowWidth: number;
  windowHeight: number;
  isStandalone?: boolean;
}

const ActiveVideoPlayer = ({ url, isMuted, isActive, isHeldPaused, width, height, onLoaded }: { url: string, isMuted: boolean, isActive: boolean, isHeldPaused: boolean, width: number, height: number, onLoaded: () => void }) => {
  const player = useVideoPlayer(url, player => {
    player.loop = true;
    player.muted = isMuted;
    if (isActive && !isHeldPaused) {
      player.play();
    } else {
      player.pause();
    }
  });

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') {
      onLoaded();
    }
  });

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    if (isPlaying) {
      onLoaded();
    }
  });

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    if (isActive && !isHeldPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isHeldPaused, player]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

const ActiveAudioPlayer = ({ url, isMuted, isActive, isHeldPaused }: { url: string, isMuted: boolean, isActive: boolean, isHeldPaused: boolean }) => {
  const audioPlayer = useAudioPlayer(url);
  
  useEffect(() => {
    if (audioPlayer && url) {
      audioPlayer.loop = true;
      audioPlayer.muted = isMuted;
      if (isActive && !isHeldPaused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    }
    
    // Crucial cleanup: stop audio when component unmounts!
    return () => {
      if (audioPlayer) {
        try {
          audioPlayer.pause();
        } catch (e) {
          console.log('Error pausing audio on unmount:', e);
        }
      }
    };
  }, [isActive, isHeldPaused, isMuted, audioPlayer, url]);
  
  return null;
};

export const ReelItem = React.memo(({
  item,
  isActive,
  onOpenComments,
  onOpenSend,
  onOpenGifts,
  onOpenProfile,
  windowWidth: width,
  windowHeight: height,
  isStandalone = false
}: ReelItemProps) => {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHeldPaused, setIsHeldPaused] = useState(false);
  const [muteIndicator, setMuteIndicator] = useState<'muted' | 'unmuted' | null>(null);
  
  const { toggleLikeReel, toggleSaveReel, registerValidView, deleteReel } = useFeedStore();
  const { followingIds, toggleFollow, userProfile } = useAuthStore();
  
  // View tracking
  const [hasRegisteredView, setHasRegisteredView] = useState(false);

  // Layers Metadata
  const parsedLayersData = React.useMemo(() => {
    if (!item.layersData) return null;
    try {
      return typeof item.layersData === 'string' ? JSON.parse(item.layersData) : item.layersData;
    } catch (e) {
      return null;
    }
  }, [item.layersData]);

  // Heart Burst Double-Tap Animation States
  const [doubleTapHearts, setDoubleTapHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastTapRef = useRef<number | null>(null);

  const isOwnReel = item.creatorId === userProfile?.id;
  const safeCreatorUsername = isOwnReel ? userProfile?.username : (item.creator?.username || item.creatorUsername || '');
  const safeCreatorAvatar = isOwnReel ? userProfile?.avatar : (item.creator?.avatar || item.creatorAvatar || '');
  const isVerifiedCreator = isOwnReel ? userProfile?.isVerified : (item.creator?.isVerified || ['rahul_dance_off', 'aria_styles', 'marcus_vlogs', 'vikram_tech', 'elena_fashion'].includes(safeCreatorUsername));

  // Audio setup for native sound respect
  const musicAudioUrl = parsedLayersData?.music?.audioUrl;

  // 10-Second View Tracker (Works even if short videos loop)
  useEffect(() => {
    let viewTimer: ReturnType<typeof setTimeout>;
    
    // If the reel is active and we haven't registered a view yet, and it's not the user's own reel
    if (isActive && !hasRegisteredView && safeCreatorUsername !== userProfile.username) {
      // Start a 10 second timer
      viewTimer = setTimeout(() => {
        setHasRegisteredView(true);
        registerValidView(item.id, safeCreatorUsername);
      }, 10000); // 10 seconds
    }
    
    return () => {
      if (viewTimer) clearTimeout(viewTimer);
    };
  }, [isActive, hasRegisteredView, item.id, safeCreatorUsername, registerValidView, userProfile.username]);

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
      setIsMuted((prev) => {
        const newMutedState = !prev;
        // Show mute indicator briefly
        setMuteIndicator(newMutedState ? 'muted' : 'unmuted');
        setTimeout(() => {
          setMuteIndicator(null);
        }, 1000);
        return newMutedState;
      });
    }
    lastTapRef.current = now;
  }, [item.isLiked, toggleLikeReel]);

  const isFollowing = followingIds.includes(item.creatorId);
  
  const safeVideoUrl = item.videoUrl || item.mediaUrl || '';
  const isPhotoPost = safeVideoUrl === '' || safeVideoUrl.includes('unsplash.com') || safeVideoUrl.includes('picsum.photos') || safeVideoUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing reel by @${safeCreatorUsername} on Popli! 🚀\n\nhttps://popli.app/reel/${item.id}`,
        title: `Popli Reel from @${safeCreatorUsername}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <View style={{ width, height, backgroundColor: '#000000' }} className="relative">
      
      {/* 0. TOP FLOATING ACTIONS (Figma-level: Direct Inbox Plane) */}
      <View className="absolute top-12 left-4 right-4 flex-row justify-end items-center z-20">
        {/* Paper Plane Button on Right */}
        <Pressable 
          onPress={() => router.push('/notifications')}
          className="w-10 h-10 bg-black/35 border border-white/10 rounded-full items-center justify-center active:scale-95 pl-0.5"
        >
          <Send size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* 1. EXPO AV VIDEO PLAYER CELL OR IMAGE CELL */}
      <Pressable 
        onPress={handleDoubleTap}
        onLongPress={() => setIsHeldPaused(true)}
        delayLongPress={200}
        onPressOut={() => setIsHeldPaused(false)}
        style={StyleSheet.absoluteFill}
      >
        {isPhotoPost ? (
          <ExpoImage 
            source={{ uri: safeVideoUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <>
            <>
              {console.log('RENDERING PLAYER WITH URL:', safeVideoUrl)}
              <ActiveVideoPlayer 
                url={safeVideoUrl} 
                isMuted={isMuted} 
                isActive={isActive} 
                isHeldPaused={isHeldPaused}
                width={width} 
                height={height} 
                onLoaded={() => {
                  if (!isLoaded) setTimeout(() => setIsLoaded(true), 0);
                }}
              />
            </>

            {/* Render audio player only if active */}
            {isActive && musicAudioUrl && (
              <ActiveAudioPlayer 
                url={musicAudioUrl} 
                isMuted={isMuted} 
                isActive={isActive} 
                isHeldPaused={isHeldPaused} 
              />
            )}

            {/* Static high-res placeholder before play or fallback */}
            {(!isLoaded || !isActive) && (
              <ExpoImage
                source={{ uri: item.thumbnailUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                className="blur-lg opacity-80"
              />
            )}
          </>
        )}
      </Pressable>

      {/* Large Visual Indicator for Mute/Unmute */}
      {muteIndicator && (
        <View className="absolute inset-0 flex items-center justify-center z-50" pointerEvents="none">
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 9999, padding: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            {muteIndicator === 'muted' ? (
              <VolumeX color="white" size={32} strokeWidth={2.5} />
            ) : (
              <Volume2 color="white" size={32} strokeWidth={2.5} />
            )}
          </MotiView>
        </View>
      )}

      {/* METADATA LAYERS OVERLAY */}
        {parsedLayersData?.layers && (
          <View style={{ ...StyleSheet.absoluteFill, zIndex: 10 }} pointerEvents="none">
            {/* Draw drawings */}
            <View style={{ ...StyleSheet.absoluteFill, zIndex: 5 }} pointerEvents="none">
              <Svg width="100%" height="100%">
                {parsedLayersData.layers.filter((l: any) => l.type === 'drawing').map((layer: any) => (
                  <G key={layer.id}>
                    {layer.content && Array.isArray(layer.content) && layer.content.map((p: any) => (
                      <Path
                        key={p.id}
                        d={p.path}
                        stroke={p.color}
                        strokeWidth={p.strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    ))}
                  </G>
                ))}
              </Svg>
            </View>

            {/* Render Text, Stickers, and Interactives */}
            <View className="absolute inset-0 z-10" pointerEvents="box-none">
              {parsedLayersData.layers.filter((l: any) => l.type !== 'drawing' && l.type !== 'music').map((layer: any) => {
                const transform = [
                  { translateX: layer.x },
                  { translateY: layer.y },
                  { scale: layer.scale },
                  { rotate: `${layer.rotation || 0}rad` }
                ];
                return (
                  <Animated.View key={layer.id} style={{ position: 'absolute', left: 0, top: 0, transform }} pointerEvents={layer.type === 'interactive' ? 'auto' : 'none'}>
                    {layer.type === 'text' && layer.content && typeof layer.content === 'object' && (
                      <View style={{
                        backgroundColor: layer.content.backgroundColor,
                        paddingHorizontal: layer.content.backgroundStyle !== 'none' ? 16 : 0,
                        paddingVertical: layer.content.backgroundStyle !== 'none' ? 8 : 0,
                        borderRadius: 12,
                      }}>
                        <Text style={{
                          color: layer.content.color,
                          fontFamily: layer.content.fontFamily,
                          fontSize: 32,
                          fontWeight: 'bold',
                          textAlign: layer.content.textAlign,
                        }}>
                          {layer.content.text}
                        </Text>
                      </View>
                    )}
                    {layer.type === 'text' && typeof layer.content === 'string' && (
                      <Text className="text-white text-3xl font-bold bg-black/50 px-4 py-2 rounded-xl text-center">
                        {layer.content}
                      </Text>
                    )}
                    {layer.type === 'emoji' && (
                      <Text style={{ fontSize: 60 }}>{layer.content}</Text>
                    )}
                    {layer.type === 'sticker' && layer.content && (
                      <ExpoImage source={{ uri: layer.content }} style={{ width: 128, height: 128 }} contentFit="contain" />
                    )}
                    {layer.type === 'interactive' && layer.content && layer.content.type === 'location' && (
                      <Pressable 
                        onPress={() => console.log('Location pressed')}
                        className={`px-6 py-3 rounded-full flex-row items-center gap-2 ${layer.content.styleVariant === 0 ? 'bg-white' : 'bg-transparent border-2 border-white'}`}
                      >
                        <Text className={`${layer.content.styleVariant === 0 ? 'text-purple-600' : 'text-white'} font-bold text-xl`}>📍 {layer.content.text}</Text>
                      </Pressable>
                    )}
                    {layer.type === 'interactive' && layer.content && layer.content.type === 'mention' && (
                      <Pressable 
                        onPress={() => onOpenProfile(layer.content.text)}
                        className={`px-6 py-3 rounded-lg flex-row items-center gap-2 ${layer.content.styleVariant === 0 ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-white'}`}
                      >
                        <Text className={`${layer.content.styleVariant === 0 ? 'text-white' : 'text-orange-500'} font-bold text-2xl`}>@{layer.content.text}</Text>
                      </Pressable>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          </View>
        )}

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
            onPress={() => onOpenProfile(safeCreatorUsername)}
            className="w-12 h-12 rounded-full border-2 border-primary-purple overflow-hidden"
          >
            <ExpoImage 
              source={{ 
                uri: safeCreatorAvatar || getDefaultAvatar(safeCreatorUsername)
              }} 
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
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

        {/* View Count */}
        <View className="items-center mb-6">
          <Eye size={28} color="#FFFFFF" />
          <Text className="text-white text-xs font-semibold mt-1">
            {formatSocialCount(item.viewsCount || (item.likesCount * 4))}
          </Text>
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

        {/* Share Button (Native Share) */}
        <Pressable onPress={handleShare} className="items-center mb-6">
          <Share2 size={28} color="#FFFFFF" />
          <Text className="text-white text-xs font-semibold mt-1">Share</Text>
        </Pressable>

        {/* Send Button (In-app Chat Share) */}
        <Pressable onPress={() => onOpenSend(item.id)} className="items-center mb-6">
          <Send size={28} color="#FFFFFF" />
          <Text className="text-white text-xs font-semibold mt-1">Send</Text>
        </Pressable>

        {/* Gift Button - Glowing Gold Figma Element */}
        <View className="items-center mb-6">
          <Pressable 
            onPress={() => onOpenGifts(item)} 
            className="w-12 h-12 bg-yellow-500 border-2 border-yellow-400 rounded-full items-center justify-center shadow-lg shadow-yellow-500/50"
          >
            <Award size={24} color="#0B001A" fill="#0B001A" strokeWidth={2} />
          </Pressable>
          <Text className="text-yellow-400 text-xs font-bold mt-1 shadow-sm shadow-black">Gift</Text>
        </View>

        {/* Delete Button - Only visible if it's the user's own reel */}
        {isOwnReel && (
          <View className="items-center">
            <Pressable 
              onPress={() => setIsDeleteModalVisible(true)}
              className="items-center"
            >
              <Trash2 size={26} color="#EF4444" />
              <Text className="text-red-500 text-xs font-semibold mt-1">Delete</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 4. REEL DESCRIPTIONS (Bottom Overlay) */}
      <View 
        className="absolute left-4 right-20 gap-3 z-10"
        style={{ bottom: isStandalone ? 32 : (Platform.OS === 'ios' ? 95 : 75) }}
      >
        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => onOpenProfile(safeCreatorUsername)}>
            <Text className="text-white font-bold text-base">@{safeCreatorUsername}</Text>
          </Pressable>
            
          {/* Verified badge matching Figma */}
          {isVerifiedCreator && (
            <View className="bg-blue-500 w-[15px] h-[15px] rounded-full items-center justify-center pl-0.5 border border-white/20">
              <Check size={9} color="#FFFFFF" strokeWidth={4.5} />
            </View>
          )}

          {item.createdAt && (
            <Text className="text-white/60 text-xs ml-1 font-medium">
              • {formatRelativeTime(item.createdAt)}
            </Text>
          )}

          {/* Follow Button Next to Username */}
          {!isFollowing && (
            <Pressable 
              onPress={() => toggleFollow(item.creatorId)}
              className="bg-transparent border border-white/80 px-2.5 py-0.5 rounded-full ml-1"
            >
              <Text className="text-white text-[10px] font-bold">Follow</Text>
            </Pressable>
          )}
        </View>

        <Text className="text-neutral-silver text-sm leading-5 font-normal" numberOfLines={3}>
          {item.description}
        </Text>

        {/* Music Ticker */}
        <View className="flex-row items-center gap-2 pt-1">
          <Music size={14} color="#D1D5DB" />
          <View className="overflow-hidden">
            <Text className="text-neutral-silver text-xs font-medium" numberOfLines={1}>
              {item.musicName || 'Original Audio'}
            </Text>
          </View>
        </View>

        {/* Location Ticker */}
        {item.city && (
          <View className="flex-row items-center gap-2 pt-1">
            <MapPin size={14} color="#D1D5DB" />
            <View className="overflow-hidden">
              <Text className="text-neutral-silver text-xs font-medium" numberOfLines={1}>
                {item.city}
              </Text>
            </View>
          </View>
        )}

        {/* Tagged Users */}
        {item.taggedUsers && item.taggedUsers.length > 0 && (
          <View className="flex-row items-center gap-2 pt-1">
            <Users size={14} color="#D1D5DB" />
            <View className="overflow-hidden">
              <Text className="text-neutral-silver text-xs font-medium" numberOfLines={1}>
                {item.taggedUsers.map((u: any) => `@${u.username}`).join(', ')}
              </Text>
            </View>
          </View>
        )}

        {/* Creator Insights & Earnings */}
        {userProfile?.id === item.creatorId && (
          <View className="flex-row items-center gap-4 pt-3 pb-1">
            <Pressable 
              onPress={() => router.push({ pathname: '/analytics', params: { videoId: item.id } })}
              className="flex-row items-center gap-2"
            >
              <TrendingUp size={14} color="#A855F7" />
              <Text className="text-[#A855F7] text-xs font-bold uppercase tracking-wider">View Insights</Text>
            </Pressable>
            
            {item.isMonetized && (
              <View className="flex-row items-center gap-1.5 bg-[#F59E0B]/20 px-2 py-0.5 rounded-sm">
                <Text className="text-[#F59E0B] text-xs font-bold">₹{((item.viewsCount || 0) * 0.0044).toFixed(3)}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom navigation shade blocker */}
      <View style={{ height: Platform.OS === 'ios' ? 88 : 68 }} className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <View className="bg-[#1A1A1A] rounded-3xl w-full max-w-[340px] p-6 border border-white/10 items-center shadow-2xl shadow-black">
            <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-5 border border-red-500/20">
              <Trash2 size={32} color="#EF4444" />
            </View>
            <Text className="text-white text-xl font-bold mb-2 text-center tracking-wide">Delete Reel?</Text>
            <Text className="text-white/60 text-center text-sm mb-8 leading-5">
              Are you sure you want to delete this reel? This action cannot be undone and it will be permanently removed.
            </Text>
            <View className="flex-row gap-3 w-full">
              <Pressable 
                onPress={() => setIsDeleteModalVisible(false)}
                className="flex-1 py-3.5 rounded-2xl border border-white/20 items-center bg-white/5 active:bg-white/10"
              >
                <Text className="text-white font-semibold text-base">Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={async () => {
                  try {
                    await deleteReel(item.id);
                    setIsDeleteModalVisible(false);
                  } catch (error) {
                    Alert.alert("Error", "Failed to delete reel");
                    setIsDeleteModalVisible(false);
                  }
                }}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 items-center shadow-lg shadow-red-500/30 active:bg-red-600"
              >
                <Text className="text-white font-bold text-base">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

ReelItem.displayName = 'ReelItem';

