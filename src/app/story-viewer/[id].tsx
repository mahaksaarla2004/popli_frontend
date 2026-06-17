import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, TextInput, Dimensions, KeyboardAvoidingView, Platform, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStoryStore, useAuthStore } from '../../store';
import { apiClient } from '../../api/client';
import { Heart, Send, MoreHorizontal, X, MessageCircle, Trash2, Eye } from 'lucide-react-native';
import Svg, { Path, G } from 'react-native-svg';
import { formatRelativeTime, getDefaultAvatar } from '../../utils';

import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');

const StoryVideo = ({ url, isPaused }: { url: string, isPaused: boolean }) => {
  const player = useVideoPlayer(url, p => {
    p.loop = true;
    p.muted = false;
    if (!isPaused) p.play();
    else p.pause();
  });

  useEffect(() => {
    if (!isPaused) player.play();
    else player.pause();
  }, [isPaused, player]);

  return (
    <VideoView 
      player={player} 
      style={{ width: '100%', height: '100%', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }} 
      contentFit="cover" 
      nativeControls={false} 
    />
  );
};

const MentionTag = React.memo(({ layer, onPress }: { layer: any, onPress: (userId: string) => void }) => {
  return (
    <Pressable 
      onPress={(e) => {
        e.stopPropagation(); // prevent pausing story
        onPress(layer.content.userId);
      }}
      className="bg-gradient-to-r from-[#D946EF] to-[#A855F7] px-4 py-2 rounded-xl shadow-lg shadow-[#D946EF]/30 border border-white/20"
      pointerEvents="auto"
    >
      <Text className="text-white font-bold text-lg">@{layer.content.text}</Text>
    </Pressable>
  );
});
MentionTag.displayName = 'MentionTag';

export default function StoryViewerScreen() {
  const { id: rawId, storyId } = useLocalSearchParams<{ id: string, storyId?: string }>();
  const id = rawId ? decodeURIComponent(rawId) : '';
  const router = useRouter();
  const { stories, markStoryViewed, addReaction, deleteStory, fetchStories, isFetchingStories } = useStoryStore();
  const { userProfile } = useAuthStore();

  const handleMentionPress = async (userId: string) => {
    setIsPaused(true);
    try {
      // Analytics tracking
      apiClient.post('/analytics/track', { event: 'mention_tag_clicked', metadata: { mentionedUserId: userId } }).catch(() => {});
      
      const res = await apiClient.get(`/users/${userId}`);
      if (res.data) {
        apiClient.post('/analytics/track', { event: 'profile_opened_from_story', metadata: { mentionedUserId: userId } }).catch(() => {});
        router.push(`/user/${res.data.username}`);
      } else {
        alert("User no longer available");
        setIsPaused(false);
      }
    } catch (error) {
      alert("User no longer available");
      setIsPaused(false);
    }
  };

  const userStories = stories.filter(s => s.creatorId === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [initialStoryLoaded, setInitialStoryLoaded] = useState(false);

  const [progressAnim] = useState(() => new Animated.Value(0));

  const handleNext = () => {
    if (currentIndex < userStories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      router.back();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      progressAnim.setValue(0);
    }
  };

  // Initialize with correct story index
  useEffect(() => {
    if (stories.length === 0 && !isFetchingStories) {
      fetchStories();
    }
  }, [stories.length, isFetchingStories]);

  useEffect(() => {
    if (!initialStoryLoaded && !isFetchingStories && stories.length > 0) {
      if (storyId) {
        const idx = userStories.findIndex(s => s.id === storyId);
        if (idx !== -1) {
          setTimeout(() => setCurrentIndex(idx), 0);
        } else {
          setTimeout(() => setInitialStoryLoaded(true), 0);
        }
      } else {
        setTimeout(() => setInitialStoryLoaded(true), 0);
      }
    }
  }, [initialStoryLoaded, isFetchingStories, stories.length, storyId, userStories]);

  useEffect(() => {
    if (stories.length > 0 && userStories.length === 0 && !isFetchingStories) {
      setTimeout(() => setInitialStoryLoaded(true), 0);
    }
    
    if (userStories.length === 0) return;

    // Mark current story as viewed
    const currentStory = userStories[currentIndex];
    if (currentStory && !currentStory.viewers.includes(userProfile.username)) {
      markStoryViewed(currentStory.id, userProfile.username);
    }

    progressAnim.setValue(0);
    if (!isPaused) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000, // 5 seconds per story
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          handleNext();
        }
      });
    }

    return () => progressAnim.stopAnimation();
  }, [currentIndex, isPaused, userStories.length, handleNext, progressAnim, markStoryViewed, userProfile.username, stories.length, isFetchingStories]);



  const handlePress = (e: any) => {
    const x = e.nativeEvent.locationX;
    if (x < width * 0.3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    const storyId = userStories[currentIndex]?.id;
    if (storyId) {
      setIsDeleting(true);
      setIsPaused(true);
      try {
        await deleteStory(storyId);
        if (userStories.length <= 1) {
          router.back();
        } else {
          setIsPaused(false);
          if (currentIndex >= userStories.length - 1) {
            setCurrentIndex(prev => Math.max(0, prev - 1));
          }
        }
      } catch (error) {
        console.error('Failed to delete story:', error);
        setIsPaused(false);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const activeStory = userStories[currentIndex];
  if (userStories.length === 0 || !activeStory) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        {isFetchingStories ? (
          <ActivityIndicator size="large" color="#A855F7" />
        ) : (
          <View className="items-center justify-center p-8">
            <Text className="text-white text-lg font-semibold mb-4 text-center">This story is no longer available or has expired.</Text>
            <Pressable 
              className="bg-[#D946EF] px-6 py-3 rounded-full"
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/');
              }}
            >
              <Text className="text-white font-bold">Go Back</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  let parsedLayersData = activeStory?.layersData;
  if (typeof parsedLayersData === 'string') {
    try { parsedLayersData = JSON.parse(parsedLayersData); } catch (e) {}
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black">
      <View className="flex-1 relative">
        
        {/* Background Media */}
        {activeStory.mediaType === 'VIDEO' && activeStory.mediaUrl ? (
          <StoryVideo url={activeStory.mediaUrl} isPaused={isPaused} />
        ) : activeStory.mediaUrl ? (
          <Image 
            source={{ uri: activeStory.mediaUrl }} 
            className="w-full h-full rounded-b-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-black rounded-b-xl" />
        )}

        {/* METADATA LAYERS OVERLAY */}
        {parsedLayersData?.layers && (
          <View style={{ ...StyleSheet.absoluteFill, zIndex: 5 }} pointerEvents="none">
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
                  { rotate: `${layer.rotation}rad` }
                ];

                return (
                  <View key={layer.id} style={{ position: 'absolute', left: 0, top: 0, transform }} pointerEvents="none">
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
                    {layer.type === 'sticker' && layer.content && (
                      <Image source={{ uri: layer.content }} className="w-32 h-32" resizeMode="contain" />
                    )}
                    {layer.type === 'interactive' && layer.content?.type === 'mention' && (
                      <MentionTag layer={layer} onPress={handleMentionPress} />
                    )}
                    {layer.type === 'interactive' && layer.content?.type === 'location' && (
                      <View className="bg-white/90 px-4 py-2 rounded-xl flex-row items-center gap-1">
                        <Text className="text-black font-bold text-lg">{layer.content.text}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Tap/Hold Overlays */}
        <Pressable 
          onPress={handlePress}
          onPressIn={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
          className="absolute inset-0 z-10"
        />

        {/* Top Progress Bars */}
        <View className="absolute top-12 left-0 right-0 px-2 flex-row gap-1 z-20">
          {userStories.map((_, idx) => (
            <View key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <Animated.View 
                style={{
                  width: idx === currentIndex 
                    ? progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                    : idx < currentIndex ? '100%' : '0%',
                  height: '100%',
                  backgroundColor: 'white'
                }} 
              />
            </View>
          ))}
        </View>

        {/* Header Info */}
        <View className="absolute top-16 left-4 right-4 flex-col z-20">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Image 
                source={{ 
                  uri: activeStory.creatorAvatar?.includes('unsplash.com') 
                    ? getDefaultAvatar(activeStory.creatorId) 
                    : (activeStory.creatorAvatar || getDefaultAvatar(activeStory.creatorId))
                }} 
                className="w-8 h-8 rounded-full border border-white/20" 
              />
              <Text className="text-white font-bold text-sm">{activeStory.creatorId}</Text>
              <Text className="text-white/60 text-xs">{formatRelativeTime(activeStory.createdAt)}</Text>
            </View>
            
            <View className="flex-row gap-4 items-center">
              {activeStory.creatorId === userProfile.username ? (
                <Pressable onPress={handleDelete} className="p-2" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                  <Trash2 size={24} color="#EF4444" />
                </Pressable>
              ) : (
                <MoreHorizontal size={24} color="#FFFFFF" />
              )}
              <Pressable onPress={() => router.back()} className="p-2" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <X size={26} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
          
          {/* Attribution Header */}
          {activeStory.originalOwnerUsername && (
            <Pressable 
              className="mt-2 flex-row items-center bg-black/40 px-2 py-1 rounded-full self-start border border-white/10 backdrop-blur-md"
              onPress={() => {
                if (activeStory.originalStoryId) {
                  router.push(`/story-viewer/${activeStory.originalOwnerUsername}?storyId=${activeStory.originalStoryId}`);
                }
              }}
            >
              <Text className="text-white/80 text-xs font-medium">Originally shared by </Text>
              <Text className="text-white font-bold text-xs">@{activeStory.originalOwnerUsername}</Text>
            </Pressable>
          )}
        </View>

        {/* Reshare Controls for Mentioned Users */}
        {(() => {
          const isMentioned = parsedLayersData?.layers?.some((l: any) => 
            l.type === 'interactive' && l.content?.type === 'mention' && 
            (l.content.userId === userProfile.id || l.content.text === userProfile.username)
          );
          
          if (isMentioned && !activeStory.isCloseFriends) {
            return (
              <View className="absolute bottom-20 left-4 right-4 flex-row justify-between z-30">
                <Pressable 
                  className="bg-white/20 px-4 py-2.5 rounded-full border border-white/30 backdrop-blur-md flex-row items-center flex-1 mr-2 justify-center"
                  onPress={() => {
                    setIsPaused(true);
                    router.push({
                      pathname: '/(create)/story-editor',
                      params: { 
                        uri: activeStory.mediaUrl,
                        type: activeStory.mediaType.toLowerCase(),
                        mode: 'STORY',
                        originalStoryId: activeStory.originalStoryId || activeStory.id,
                        originalOwnerId: activeStory.originalOwnerId || activeStory.creatorId,
                        originalOwnerUsername: activeStory.originalOwnerUsername || activeStory.creatorId, // fallback to creatorId as username
                        returnTo: 'dismiss3'
                      }
                    });
                  }}
                >
                  <Text className="text-white font-bold text-sm">Add to Your Story</Text>
                </Pressable>
                
                <Pressable className="bg-white/20 px-4 py-2.5 rounded-full border border-white/30 backdrop-blur-md flex-row items-center justify-center flex-1 ml-2">
                  <Text className="text-white font-bold text-sm">Share Story</Text>
                </Pressable>
              </View>
            );
          }
          return null;
        })()}

        {/* Bottom Reply Bar */}
        {activeStory.repliesAllowed && activeStory.creatorId !== userProfile.username && (
          <View className="absolute bottom-4 left-4 right-4 flex-row items-center gap-3 z-30">
            <View className="flex-1 border border-white/30 rounded-full px-4 py-3 bg-black/20 backdrop-blur-md flex-row items-center">
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Send message"
                placeholderTextColor="rgba(255,255,255,0.6)"
                className="flex-1 text-white text-sm"
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              />
            </View>
            <Pressable onPress={() => { addReaction(activeStory.id, userProfile.username, '❤️'); }}>
              <Heart size={28} color="#FFFFFF" />
            </Pressable>
            <Pressable>
              <Send size={28} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        {/* View Count for own stories */}
        {activeStory.creatorId === userProfile.username && (
          <View className="absolute bottom-6 left-4 z-30 flex-row items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
            <Text className="text-white text-xs font-bold">👁️ {activeStory.viewers.length} Views</Text>
          </View>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}
