import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, Platform, Dimensions } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { ChevronLeft, Check, Music } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface MusicEditorOverlayProps {
  song: any;
  onComplete: (musicData: MusicLayerData | null) => void;
}

export type MusicLayerData = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  startTime: number;
  duration: number; // usually 15s
  style: 'cover' | 'waveform'; // We skip lyrics for now as per plan
};

export default function MusicEditorOverlay({ song, onComplete }: MusicEditorOverlayProps) {
  const [style, setStyle] = useState<'cover' | 'waveform'>('cover');
  const [startTime, setStartTime] = useState(0); // in seconds
  const player = useAudioPlayer(song?.audioUrl);

  useEffect(() => {
    if (player) {
      player.play();
    }
    return () => {
      try { player?.pause(); } catch (e) {}
    };
  }, [player]);

  const handleDone = () => {
    try { player?.pause(); } catch (e) {}
    onComplete({
      id: song.id || Date.now().toString(),
      title: song.title || song.trackName,
      artist: song.artist || song.artistName,
      coverUrl: song.artworkUrl100 || song.coverUrl,
      audioUrl: song.audioUrl || song.previewUrl,
      startTime,
      duration: 15,
      style,
    });
  };

  const handleCancel = () => {
    try { player?.pause(); } catch (e) {}
    onComplete(null);
  };

  return (
    <View className="absolute inset-0 bg-black/90 z-50">
      
      {/* Top Controls */}
      <View className="flex-row justify-between items-center px-4 pt-16 pb-4">
        <Pressable onPress={handleCancel} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full">
          <ChevronLeft size={24} color="#FFF" />
        </Pressable>
        <Pressable onPress={handleDone} className="bg-white px-4 py-2 rounded-full flex-row items-center gap-2">
          <Text className="text-black font-bold">Done</Text>
        </Pressable>
      </View>

      {/* Main Preview Area */}
      <View className="flex-1 items-center justify-center px-4">
        {style === 'cover' ? (
          <View className="bg-white/10 backdrop-blur-md rounded-2xl p-4 items-center w-64 border border-white/20 shadow-2xl">
            <Image 
              source={{ uri: song.artworkUrl100 || song.coverUrl || 'https://via.placeholder.com/150' }} 
              className="w-32 h-32 rounded-xl mb-4" 
            />
            <Text className="text-white font-bold text-lg text-center" numberOfLines={1}>{song.title || song.trackName}</Text>
            <Text className="text-white/60 text-sm mt-1 text-center" numberOfLines={1}>{song.artist || song.artistName}</Text>
          </View>
        ) : (
          <View className="bg-black/60 rounded-full px-6 py-3 flex-row items-center gap-3 border border-white/30">
            <Music size={18} color="#FFF" />
            <View>
              <Text className="text-white font-bold text-sm" numberOfLines={1}>{song.title || song.trackName}</Text>
              <Text className="text-white/60 text-xs" numberOfLines={1}>{song.artist || song.artistName}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View className="pb-12 pt-4 px-4 bg-black/50 border-t border-white/10">
        
        {/* Style Selector */}
        <View className="flex-row justify-center gap-6 mb-8">
          <Pressable 
            onPress={() => setStyle('cover')}
            className={`items-center justify-center w-14 h-14 rounded-full border-2 ${style === 'cover' ? 'border-white bg-white/20' : 'border-transparent bg-white/5'}`}
          >
            <View className="w-6 h-6 bg-white rounded-sm" />
          </Pressable>
          <Pressable 
            onPress={() => setStyle('waveform')}
            className={`items-center justify-center w-14 h-14 rounded-full border-2 ${style === 'waveform' ? 'border-white bg-white/20' : 'border-transparent bg-white/5'}`}
          >
            <View className="w-8 h-3 flex-row justify-between items-center">
              <View className="w-1 h-3 bg-white rounded-full" />
              <View className="w-1 h-5 bg-white rounded-full" />
              <View className="w-1 h-2 bg-white rounded-full" />
              <View className="w-1 h-4 bg-white rounded-full" />
            </View>
          </Pressable>
        </View>

        {/* Pseudo Timeline Slider (Visual mock for now, actual implementation requires advanced pan handler) */}
        <View className="bg-white/10 h-16 rounded-xl flex-row items-center justify-center relative overflow-hidden border border-white/20">
          <View className="absolute inset-0 flex-row items-center justify-between px-2 opacity-50">
             {Array.from({length: 40}).map((_, i) => (
                <View key={i} className="w-1 bg-white rounded-full" style={{ height: Math.max(4, Math.random() * 32) }} />
             ))}
          </View>
          <View className="w-24 h-full bg-white/20 border-x-2 border-white absolute z-10 shadow-lg" />
        </View>
        <Text className="text-white/50 text-xs text-center mt-3 font-medium">Drag to select 15s segment (Mock)</Text>

      </View>
    </View>
  );
}
