import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, ActivityIndicator, Dimensions, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ReelItem } from '../../components/feed/ReelItem';
import { CommentsSheet } from '../../components/sheets/CommentsSheet';
import { GiftSheet } from '../../components/sheets/GiftSheet';
import { SendSheet } from '../../components/sheets/SendSheet';
import { apiClient } from '../../api/client';
import { Reel } from '../../types';
import { MotiView } from 'moti';

const { height, width } = Dimensions.get('window');

export default function ReelViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);

  // Sheet States
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isGiftsOpen, setIsGiftsOpen] = useState(false);
  const [burstGift, setBurstGift] = useState<{ visible: boolean; icon: string }>({ visible: false, icon: '' });

  useEffect(() => {
    const fetchReel = async () => {
      console.log("Fetching reel with ID:", id);
      if (!id || id === 'undefined') {
        console.error("Invalid reel ID!");
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.get(`/reels/${id}`);
        const r = res.data;
        setReel({
          id: r.id,
          creatorId: r.creatorId,
          creatorName: r.creator?.name || 'User',
          creatorUsername: r.creator?.username || 'user',
          creatorAvatar: r.creator?.avatar || '',
          creatorIsVerified: r.creator?.isVerified || false,
          videoUrl: r.mediaUrl,
          thumbnailUrl: r.thumbnailUrl || r.mediaUrl,
          description: r.description || '',
          musicName: r.musicName || 'Original Audio',
          likesCount: r.likesCount || 0,
          commentsCount: r.commentsCount || 0,
          sharesCount: r.sharesCount || 0,
          viewsCount: r.viewsCount || 0,
          savesCount: r.savesCount || 0,
          isLiked: false, // Default or derived from backend
          isSaved: false,
          isFollowed: false,
          category: r.category || 'lifestyle',
          isMonetized: r.isMonetized,
          location: { city: r.city || 'Unknown', latitude: r.latitude || 0, longitude: r.longitude || 0 }
        });
      } catch (err) {
        console.error('Error fetching reel:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReel();
  }, [id]);

  const handleOpenComments = useCallback(() => setIsCommentsOpen(true), []);
  const handleOpenSend = useCallback(() => setIsSendOpen(true), []);
  const handleOpenGifts = useCallback(() => setIsGiftsOpen(true), []);
  const handleOpenProfile = useCallback((creatorUsername: string) => { router.push(`/user/${creatorUsername}`); }, [router]);

  const handleGiftSendSuccess = (icon: string) => {
    setBurstGift({ visible: true, icon });
    setTimeout(() => setBurstGift({ visible: false, icon: '' }), 1500);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  if (!reel) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Pressable onPress={() => router.back()} className="absolute top-14 left-4 p-2 z-50 rounded-full bg-black/40">
          <ChevronLeft color="white" size={28} />
        </Pressable>
        <Text className="text-white">Reel not found or has been deleted.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Pressable onPress={() => router.back()} className="absolute top-14 left-4 p-2 z-50 rounded-full bg-black/40 border border-white/10">
        <ChevronLeft color="white" size={28} />
      </Pressable>
      
      <View style={{ width, height }}>
        <ReelItem
          item={reel}
          isActive={true}
          onOpenComments={handleOpenComments}
          onOpenSend={handleOpenSend}
          onOpenGifts={handleOpenGifts}
          onOpenProfile={handleOpenProfile}
          windowWidth={width}
          windowHeight={height}
          isStandalone={true}
        />
      </View>

      {/* Sheets & Overlays */}
      <CommentsSheet reelId={reel.id} isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} />
      <SendSheet reelId={reel.id} isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
      <GiftSheet reel={reel} isOpen={isGiftsOpen} onClose={() => setIsGiftsOpen(false)} onSendSuccess={handleGiftSendSuccess} />

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
