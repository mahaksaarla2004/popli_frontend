import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStoryStore, useAuthStore, useFeedStore, useEditorStore } from '../../store';
import { MotiView } from 'moti';
import { CheckCircle } from 'lucide-react-native';
import { apiClient } from '../../api/client';

export default function ShareStoryScreen() {
  const router = useRouter();
  const { uri, type, target, text, mode, isStory, speed, effect, musicId } = useLocalSearchParams<{ 
    uri: string, type: 'photo'|'video', target: string, text: string, mode: string, isStory: string, speed?: string, effect?: string, musicId?: string 
  }>();
  const { addStory } = useStoryStore();
  const { fetchReels } = useFeedStore();
  const { userProfile } = useAuthStore();
  const { layers, timelineData, musicData } = useEditorStore();
  const [status, setStatus] = React.useState<'uploading' | 'success' | 'error'>('uploading');
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);

  useEffect(() => {
    const uploadMedia = async () => {
      try {
        if (!uri) throw new Error('No media URI provided');
        
        // Normalize URI: decode it and ensure it has file:// prefix for Android if it's a local file path
        let decodedUri = decodeURIComponent(uri);
        if (Platform.OS === 'android' && !decodedUri.startsWith('file://') && !decodedUri.startsWith('content://') && !decodedUri.startsWith('http')) {
          decodedUri = 'file://' + decodedUri;
        }

        const fileType = decodedUri.split('.').pop() || (type === 'video' ? 'mp4' : 'jpg');
        const mimeType = type === 'video' ? `video/${fileType}` : `image/${fileType}`;

        if (mode === 'REEL' && isStory !== 'true') {
          // Cloudinary Upload
          const sigResponse = await apiClient.get('/upload/signature?folder=reels');
          const { timestamp, signature, cloudName, apiKey, folder } = sigResponse.data;

          const formData = new FormData();
          formData.append('file', {
            uri: decodedUri,
            type: mimeType,
            name: `upload-${Date.now()}.${fileType}`
          } as any);
          formData.append('api_key', String(apiKey || ''));
          formData.append('timestamp', String(timestamp || ''));
          formData.append('signature', String(signature || ''));
          formData.append('folder', String(folder || ''));

          // Use axios instead of fetch to avoid Expo SDK 56 WinterCG FormDataPart issues
          const axios = require('axios').default;
          
          const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/${type === 'video' ? 'video' : 'image'}/upload`, formData, {
            onUploadProgress: (progressEvent: any) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
              }
            }
          });
          
          const uploadData = uploadRes.data;
          if (!uploadData.secure_url) throw new Error('Cloudinary upload failed: File might be too large');

          let finalUrl = uploadData.secure_url;
          const transformations = [];
          if (type === 'video') {
            if (speed === '2') transformations.push('e_accelerate:100');
            if (speed === '3') transformations.push('e_accelerate:200');
          }
          if (effect === 'Paris') transformations.push('e_art:zorro');
          if (effect === 'Vintage') transformations.push('e_sepia');
          if (effect === 'Neon') transformations.push('e_tint:100:blue:purple');
          if (effect === 'B&W') transformations.push('e_grayscale');
          if (effect === 'Blur') transformations.push('e_blur:300');

          if (transformations.length > 0) {
            finalUrl = finalUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
          }

          // Prepare metadata JSON
          const metadata = {
            layers,
            timeline: timelineData,
            music: musicData
          };

          // Save to backend DB
          await apiClient.post('/reels', {
            mediaUrl: finalUrl,
            thumbnailUrl: finalUrl.replace(/\.[^/.]+$/, ".jpg"), // auto-generate thumbnail from video via cloudinary
            mediaType: type === 'video' ? 'VIDEO' : 'PHOTO',
            description: text || 'New post!',
            category: 'comedy', // default for now
            musicName: musicId ? `Track ${musicId}` : undefined,
            layersData: JSON.stringify(metadata)
          });
          
          // Refresh feed
          fetchReels(1, 10, 'all');

        } else {
          // It's a Story! Upload to Cloudinary first
          const sigResponse = await apiClient.get('/upload/signature?folder=stories');
          const { timestamp, signature, cloudName, apiKey, folder } = sigResponse.data;

          const formData = new FormData();
          formData.append('file', {
            uri: decodedUri,
            type: mimeType,
            name: `story-${Date.now()}.${fileType}`
          } as any);
          formData.append('api_key', String(apiKey || ''));
          formData.append('timestamp', String(timestamp || ''));
          formData.append('signature', String(signature || ''));
          formData.append('folder', String(folder || ''));

          // Use axios instead of fetch to avoid Expo SDK 56 WinterCG FormDataPart issues
          const axios = require('axios').default;

          const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/${type === 'video' ? 'video' : 'image'}/upload`, formData, {
            onUploadProgress: (progressEvent: any) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
              }
            }
          });
          
          const uploadData = uploadRes.data;
          if (!uploadData.secure_url) throw new Error('Cloudinary upload failed');

          let finalUrl = uploadData.secure_url;
          const transformations = [];
          if (type === 'video') {
            if (speed === '2') transformations.push('e_accelerate:100');
            if (speed === '3') transformations.push('e_accelerate:200');
          }
          if (effect === 'Paris') transformations.push('e_art:zorro');
          if (effect === 'Vintage') transformations.push('e_sepia');
          if (effect === 'Neon') transformations.push('e_tint:100:blue:purple');
          if (effect === 'B&W') transformations.push('e_grayscale');
          if (effect === 'Blur') transformations.push('e_blur:300');

          if (transformations.length > 0) {
            finalUrl = finalUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
          }

          // Prepare metadata JSON
          const metadata = {
            layers,
            timeline: timelineData,
            music: musicData
          };

          // Save to backend DB
          const res = await apiClient.post('/stories', {
            mediaUrl: finalUrl,
            mediaType: type === 'video' ? 'VIDEO' : 'PHOTO',
            isCloseFriends: target === 'close_friends',
            repliesAllowed: true,
            layersData: JSON.stringify(metadata)
          });

          // Optimistic UI update
          addStory({
            id: res.data.id,
            creatorId: userProfile.username,
            mediaUrl: finalUrl,
            isCloseFriends: target === 'close_friends',
            repliesAllowed: true,
            viewers: [],
            reactions: {},
            layersData: metadata,
            createdAt: res.data.createdAt
          });
        }

        setStatus('success');
        setTimeout(() => {
          router.replace('/');
        }, 1000);

      } catch (err: any) {
        console.error("Upload error details:", err.response?.data || err);
        setStatus('error');
        const detailedError = err.response?.data?.message || err.response?.data?.error?.message || err.message;
        Alert.alert('Upload Failed', typeof detailedError === 'object' ? JSON.stringify(detailedError) : detailedError);
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    };

    uploadMedia();
  }, []);

  return (
    <View className="flex-1 bg-[#12081E] items-center justify-center">
      {status === 'uploading' ? (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="items-center"
        >
          <ActivityIndicator size="large" color="#A855F7" />
          <Text className="text-white mt-4 font-bold text-lg">
            {mode === 'REEL' && isStory !== 'true' ? 'Posting Reel...' : 'Posting Story...'} {uploadProgress > 0 ? `${uploadProgress}%` : ''}
          </Text>
          <View className="w-48 h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
            <View className="h-full bg-[#A855F7] rounded-full" style={{ width: `${uploadProgress}%` }} />
          </View>
          <Text className="text-neutral-grey mt-4 text-sm text-center px-6">
            {mode === 'REEL' && isStory !== 'true'
              ? 'Uploading to Cloudinary (please wait, large videos take time)' 
              : (target === 'close_friends' ? 'Sharing with Close Friends' : 'Sharing to Your Story')}
          </Text>
        </MotiView>
      ) : status === 'error' ? (
        <View className="items-center">
          <Text className="text-red-500 font-bold text-2xl">Failed</Text>
        </View>
      ) : (
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="items-center"
        >
          <View className="w-20 h-20 bg-[#10B981]/20 rounded-full items-center justify-center mb-4">
            <CheckCircle size={40} color="#10B981" />
          </View>
          <Text className="text-white font-bold text-2xl">Story Posted!</Text>
        </MotiView>
      )}
    </View>
  );
}
