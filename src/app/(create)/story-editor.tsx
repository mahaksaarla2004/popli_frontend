import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEditorStore } from '../../store';
import { ChevronLeft, ChevronRight, Type, Sticker as StickerIcon, Music as MusicIcon, MoreHorizontal, Download, Sparkles, Navigation, Send as SendIcon, PlusCircle, Play, Pause, Trash2, Pencil } from 'lucide-react-native';
import { useAudioPlayer } from 'expo-audio';
import DraggableLayer from '../../components/editor/DraggableLayer';
import TextEditorOverlay, { TextLayerData } from '../../components/editor/TextEditorOverlay';
import MusicEditorOverlay, { MusicLayerData } from '../../components/editor/MusicEditorOverlay';
import InteractiveStickerOverlay, { InteractiveStickerData } from '../../components/editor/InteractiveStickerOverlay';
import DrawingOverlay, { DrawingPath } from '../../components/editor/DrawingOverlay';
import ReelTimelineEditor, { ReelTimelineData } from '../../components/editor/ReelTimelineEditor';
import Svg, { Path, G } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';

export type EditorLayer = {
  id: string;
  type: 'text' | 'sticker' | 'music' | 'emoji' | 'interactive' | 'drawing';
  content: any;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

import MusicPickerSheet from '../../components/sheets/MusicPickerSheet';
import StickerSheet from '../../components/sheets/StickerSheet';
import EffectsSheet from '../../components/sheets/EffectsSheet';
import SendToSheet from '../../components/sheets/SendToSheet';

export default function StoryEditorScreen() {
  const router = useRouter();
  const { uri, mode, type, speed, effect, musicId } = useLocalSearchParams<{ 
    uri: string; 
    mode: string; 
    type?: string;
    speed?: string;
    effect?: string;
    musicId?: string;
  }>();

  const setEditorData = useEditorStore(state => state.setEditorData);

  const isVideo = type === 'video' || mode === 'REEL';

  const videoPlayer = useVideoPlayer(uri, player => {
    if (isVideo) {
      player.loop = true;
      player.play();
    }
  });

  const [textMode, setTextMode] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [storyText, setStoryText] = useState('');
  
  const [showMusicSheet, setShowMusicSheet] = useState(false);
  const [showStickerSheet, setShowStickerSheet] = useState(false);
  const [showEffectsSheet, setShowEffectsSheet] = useState(false);
  const [showSendToSheet, setShowSendToSheet] = useState(false);
  const [showTimelineEditor, setShowTimelineEditor] = useState(false);

  const [timelineData, setTimelineData] = useState<ReelTimelineData | null>(null);

  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  const [editingMusic, setEditingMusic] = useState<any>(null);
  const [editingInteractiveSticker, setEditingInteractiveSticker] = useState<'location' | 'mention' | 'question' | 'hashtag' | null>(null);
  
  const [selectedMusic, setSelectedMusic] = useState<MusicLayerData | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);

  const audioPlayer = useAudioPlayer();

  useEffect(() => {
    return () => {
      try { audioPlayer?.pause(); } catch(e) {}
      try { videoPlayer?.pause(); } catch(e) {}
    };
  }, [audioPlayer, videoPlayer]);

  const navigateToShare = (target: 'your_story' | 'close_friends' | 'share') => {
    try { audioPlayer?.pause(); } catch(e) {}
    try { videoPlayer?.pause(); } catch(e) {}
    setEditorData({
      layers,
      timelineData,
      musicData: selectedMusic
    });
    router.push({
      pathname: '/(create)/share-story',
      params: { 
        uri, type, target, text: storyText, mode, speed, effect, 
        musicId: selectedMusic?.id || musicId,
        musicTitle: selectedMusic?.title,
        musicArtist: selectedMusic?.artist,
        musicUrl: selectedMusic?.audioUrl,
        isStory: 'true' 
      }
    });
  };

  const handleMusicSelect = (song: any) => {
    setShowMusicSheet(false);
    setEditingMusic(song);
  };

  const handleMusicEditorComplete = (musicData: MusicLayerData | null) => {
    setEditingMusic(null);
    if (musicData) {
      setSelectedMusic(musicData);
      setIsPlayingMusic(true);
      
      if (musicData.audioUrl) {
        audioPlayer?.replace(musicData.audioUrl);
        audioPlayer?.play();
      }

      setLayers(prev => [...prev.filter(l => l.type !== 'music'), {
        id: 'music-layer',
        type: 'music',
        content: musicData,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
      }]);
    }
  };

  const toggleMusicPlayback = () => {
    if (isPlayingMusic) {
      audioPlayer?.pause();
      setIsPlayingMusic(false);
    } else {
      audioPlayer?.play();
      setIsPlayingMusic(true);
    }
  };

  const handleTextComplete = (textData: TextLayerData | null) => {
    setTextMode(false);
    if (textData) {
      setLayers(prev => [...prev, {
        id: Date.now().toString(),
        type: 'text',
        content: textData,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
      }]);
    }
  };

  const handleStickerSelect = (sticker: any) => {
    setShowStickerSheet(false);
    if (sticker.type === 'EMOJI' || sticker.type === 'IMAGE') {
      setLayers(prev => [...prev, {
        id: Date.now().toString(),
        type: sticker.type === 'EMOJI' ? 'emoji' : 'sticker',
        content: sticker.value,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
      }]);
    } else if (['LOCATION', 'MENTION', 'QUESTION', 'HASHTAG', 'TEMPERATURE'].includes(sticker.type)) {
      if (sticker.type === 'TEMPERATURE') {
        setLayers(prev => [...prev, {
          id: Date.now().toString(),
          type: 'interactive',
          content: { type: 'temperature', text: '84°F', styleVariant: 0 },
          x: 0, y: 0, scale: 1, rotation: 0
        }]);
      } else {
        setEditingInteractiveSticker(sticker.type.toLowerCase());
      }
    } else {
      setLayers(prev => [...prev, {
        id: Date.now().toString(),
        type: 'text',
        content: sticker.value || `[${sticker.type}]`,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
      }]);
    }
  };

  const handleLayerUpdate = (id: string, state: any) => {
    setLayers(prev => prev.map(layer => layer.id === id ? { ...layer, ...state } : layer));
  };

  const handleInteractiveStickerComplete = (data: InteractiveStickerData | null) => {
    setEditingInteractiveSticker(null);
    if (data) {
      setLayers(prev => [...prev, {
        id: Date.now().toString(),
        type: 'interactive',
        content: data,
        x: 0, y: 0, scale: 1, rotation: 0
      }]);
    }
  };

  const handleDrawingComplete = (paths: DrawingPath[] | null) => {
    setDrawingMode(false);
    if (paths && paths.length > 0) {
      setLayers(prev => [...prev, {
        id: Date.now().toString(),
        type: 'drawing',
        content: paths,
        x: 0, y: 0, scale: 1, rotation: 0
      }]);
    }
  };

  const deleteActiveLayer = () => {
    if (activeLayerId) {
      setLayers(prev => prev.filter(l => l.id !== activeLayerId));
      setActiveLayerId(null);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black">
      
      <Pressable onPress={() => setActiveLayerId(null)} className="flex-1 rounded-3xl overflow-hidden mt-12 mb-20 relative bg-neutral-900">
        {uri ? (
          isVideo ? (
            <VideoView player={videoPlayer} style={{ width: '100%', height: '100%', borderRadius: 24 }} nativeControls={false} />
          ) : (
            <Image source={{ uri }} className="w-full h-full rounded-3xl" resizeMode="cover" />
          )
        ) : (
          <View className="w-full h-full bg-neutral-900 rounded-3xl items-center justify-center">
            <Text className="text-white/50">No Media</Text>
          </View>
        )}

        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 5 }} pointerEvents="none">
          <Svg width="100%" height="100%">
            {layers.filter(l => l.type === 'drawing').map(layer => (
              <G key={layer.id}>
                {layer.content && Array.isArray(layer.content) && layer.content.map(p => (
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

        <View className="absolute inset-0 z-10" pointerEvents="box-none">
          {layers.filter(l => l.type !== 'drawing').map(layer => (
            <DraggableLayer
              key={layer.id}
              id={layer.id}
              isActive={activeLayerId === layer.id}
              onActivate={setActiveLayerId}
              onUpdate={handleLayerUpdate}
              initialX={layer.x}
              initialY={layer.y}
              initialScale={layer.scale}
              initialRotation={layer.rotation}
            >
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
                <Text style={{ fontSize: 60 }}>
                  {layer.content}
                </Text>
              )}
              {layer.type === 'sticker' && layer.content && (
                <Image source={{ uri: layer.content }} className="w-32 h-32" resizeMode="contain" />
              )}
              {layer.type === 'interactive' && layer.content && layer.content.type === 'location' && (
                <View className={`px-6 py-3 rounded-full flex-row items-center gap-2 ${layer.content.styleVariant === 0 ? 'bg-white' : 'bg-transparent border-2 border-white'}`}>
                  <Text className={`${layer.content.styleVariant === 0 ? 'text-purple-600' : 'text-white'} font-bold text-xl`}>📍 {layer.content.text}</Text>
                </View>
              )}
              {layer.type === 'interactive' && layer.content && layer.content.type === 'mention' && (
                <View className={`px-6 py-3 rounded-lg flex-row items-center gap-2 ${layer.content.styleVariant === 0 ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-white'}`}>
                  <Text className={`${layer.content.styleVariant === 0 ? 'text-white' : 'text-orange-500'} font-bold text-2xl`}>@{layer.content.text}</Text>
                </View>
              )}
              {layer.type === 'interactive' && layer.content && layer.content.type === 'hashtag' && (
                <View className={`px-6 py-2 rounded-md ${layer.content.styleVariant === 0 ? 'bg-white' : 'bg-black/50'}`}>
                  <Text className={`${layer.content.styleVariant === 0 ? 'text-black' : 'text-white'} font-bold text-3xl`}>#{layer.content.text}</Text>
                </View>
              )}
              {layer.type === 'interactive' && layer.content && layer.content.type === 'question' && (
                <View className={`w-72 ${layer.content.styleVariant === 0 ? 'bg-white' : layer.content.styleVariant === 1 ? 'bg-purple-500' : 'bg-black'} rounded-2xl overflow-hidden shadow-2xl`}>
                  <View className="p-6 items-center">
                    <Text className={`${layer.content.styleVariant === 0 ? 'text-black' : 'text-white'} font-bold text-xl text-center`} numberOfLines={3}>
                      {layer.content.text}
                    </Text>
                  </View>
                  <View className="bg-white/20 p-4 items-center">
                    <Text className={`${layer.content.styleVariant === 0 ? 'text-black' : 'text-white'} opacity-50 font-semibold`}>Type something...</Text>
                  </View>
                </View>
              )}
              {layer.type === 'interactive' && layer.content && layer.content.type === 'temperature' && (
                <View className="bg-transparent border-4 border-white px-6 py-2 rounded-full items-center justify-center">
                  <Text className="text-white font-bold text-3xl">84°F</Text>
                </View>
              )}
              {layer.type === 'music' && layer.content && (
                layer.content.style === 'cover' ? (
                  <View className="bg-white/10 backdrop-blur-md rounded-2xl p-4 items-center w-48 border border-white/20 shadow-2xl">
                    <Image source={{ uri: layer.content.coverUrl || 'https://via.placeholder.com/150' }} className="w-24 h-24 rounded-xl mb-3" />
                    <Text className="text-white font-bold text-base text-center" numberOfLines={1}>{layer.content.title}</Text>
                    <Text className="text-white/60 text-xs mt-1 text-center" numberOfLines={1}>{layer.content.artist}</Text>
                  </View>
                ) : (
                  <View className="bg-black/60 rounded-full px-6 py-3 flex-row items-center gap-3 border border-white/30">
                    <MusicIcon size={16} color="#FFF" />
                    <View>
                      <Text className="text-white font-bold text-xs" numberOfLines={1}>{layer.content.title}</Text>
                      <Text className="text-white/60 text-[10px]" numberOfLines={1}>{layer.content.artist}</Text>
                    </View>
                  </View>
                )
              )}
            </DraggableLayer>
          ))}
        </View>

        {selectedMusic && !textMode && !drawingMode && (
          <Pressable 
            onPress={toggleMusicPlayback}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex-row items-center gap-2 z-10 border border-white/20"
          >
            {isPlayingMusic ? <MusicIcon size={14} color="#FFFFFF" /> : <Pause size={14} color="#FFFFFF" />}
            <Text className="text-white text-xs font-bold" numberOfLines={1} style={{ maxWidth: 150 }}>
              {selectedMusic.title}
            </Text>
          </Pressable>
        )}

        {textMode && <TextEditorOverlay onComplete={handleTextComplete} />}
        {editingMusic && <MusicEditorOverlay song={editingMusic} onComplete={handleMusicEditorComplete} />}
        {editingInteractiveSticker && <InteractiveStickerOverlay type={editingInteractiveSticker} onComplete={handleInteractiveStickerComplete} />}



        {!textMode && !drawingMode && (
          <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center z-10">
            <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full">
              <ChevronLeft size={24} color="#FFFFFF" />
            </Pressable>
            <View className="flex-row items-center gap-4">
              <Pressable onPress={() => setTextMode(true)} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full">
                <Type size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable onPress={() => setDrawingMode(true)} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full">
                <Pencil size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable onPress={() => setShowStickerSheet(true)} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full">
                <StickerIcon size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable onPress={() => setShowMusicSheet(true)} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full">
                <MusicIcon size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable onPress={() => setShowEffectsSheet(true)} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full">
                <Sparkles size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        )}

        {activeLayerId && !textMode && !drawingMode && (
          <View className="absolute bottom-8 left-0 right-0 items-center justify-center z-20 pointer-events-box-none">
            <Pressable onPress={deleteActiveLayer} className="w-14 h-14 bg-red-500/80 rounded-full items-center justify-center border border-white/20">
              <Trash2 size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </Pressable>

      {!textMode && !drawingMode && (
        <View className="absolute bottom-6 left-4 right-4 flex-row justify-between items-center z-10">
          {mode === 'REEL' ? (
            <>
              <Pressable onPress={() => setShowTimelineEditor(true)} className="bg-black/60 px-4 py-2 rounded-full flex-row items-center gap-2">
                <Text className="text-white font-bold">Edit video</Text>
              </Pressable>
              <Pressable 
                onPress={() => {
                  try { audioPlayer?.pause(); } catch(e) {}
                  try { videoPlayer?.pause(); } catch(e) {}
                  setEditorData({
                    layers,
                    timelineData,
                    musicData: selectedMusic
                  });
                  router.push({ 
                    pathname: '/(create)/post-editor', 
                    params: { 
                      uri, mode, type, speed, effect, 
                      musicId: selectedMusic?.id || musicId,
                      musicTitle: selectedMusic?.title,
                      musicUrl: selectedMusic?.audioUrl
                    } 
                  });
                }}
                className="items-center justify-center bg-[#A855F7] px-8 py-3 rounded-full flex-row gap-2 shadow-lg"
              >
                <Text className="text-white text-sm font-bold">Next</Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={() => navigateToShare('your_story')} className="items-center justify-center bg-black/60 px-4 py-3 rounded-full flex-row gap-2">
                <View className="w-6 h-6 rounded-full border border-white/20 items-center justify-center bg-white">
                  <PlusCircle size={24} color="#A855F7" />
                </View>
                <Text className="text-white text-xs font-bold">Your Story</Text>
              </Pressable>
              <Pressable onPress={() => navigateToShare('close_friends')} className="items-center justify-center bg-black/60 px-4 py-3 rounded-full flex-row gap-2">
                <View className="w-6 h-6 rounded-full border-2 border-[#10B981] items-center justify-center bg-[#10B981]/20">
                  <Text className="text-white text-[10px] font-bold">★</Text>
                </View>
                <Text className="text-white text-xs font-bold">Close Friends</Text>
              </Pressable>
              <Pressable onPress={() => setShowSendToSheet(true)} className="items-center justify-center bg-white px-6 py-3 rounded-full flex-row gap-2">
                <Text className="text-black text-sm font-bold">Share</Text>
                <SendIcon size={16} color="#000000" />
              </Pressable>
            </>
          )}
        </View>
      )}

      {/* Bottom Sheets */}
      {showMusicSheet && (
        <>
          <Pressable onPress={() => setShowMusicSheet(false)} className="absolute inset-0 bg-black/50 z-40" />
          <MusicPickerSheet onClose={() => setShowMusicSheet(false)} onSelect={handleMusicSelect} />
        </>
      )}

      {showStickerSheet && (
        <>
          <Pressable onPress={() => setShowStickerSheet(false)} className="absolute inset-0 bg-black/50 z-40" />
          <StickerSheet 
            onClose={() => setShowStickerSheet(false)} 
            onSelect={handleStickerSelect} 
          />
        </>
      )}

      {/* Drawing Overlay */}
      {drawingMode && (
        <DrawingOverlay onComplete={handleDrawingComplete} />
      )}


    {showEffectsSheet && (
      <>
        <Pressable onPress={() => setShowEffectsSheet(false)} className="absolute inset-0 z-40" />
        <EffectsSheet onClose={() => setShowEffectsSheet(false)} onSelect={(effect) => setShowEffectsSheet(false)} />
      </>
    )}

    {showSendToSheet && (
      <>
        <Pressable onPress={() => setShowSendToSheet(false)} className="absolute inset-0 bg-black/50 z-40" />
        <SendToSheet 
          onClose={() => setShowSendToSheet(false)} 
          onSend={(users) => {
            setShowSendToSheet(false);
            navigateToShare('share');
          }} 
        />
      </>
    )}

      {/* Timeline Editor */}
      {showTimelineEditor && (
        <ReelTimelineEditor 
          player={videoPlayer}
          duration={15} // Mock duration since we don't have metadata immediately
          initialData={timelineData || undefined}
          onComplete={(data) => {
            setTimelineData(data);
            setShowTimelineEditor(false);
          }}
          onCancel={() => setShowTimelineEditor(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
