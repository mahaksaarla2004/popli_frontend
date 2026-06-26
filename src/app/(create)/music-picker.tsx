/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Image, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, Play, Pause, Bookmark, Music, Flame, Star, Clock, User } from 'lucide-react-native';
import { useAudioPlayer } from 'expo-audio';
import { fetchTrendingTracks, fetchPopularTracks, fetchRecentTracks, searchJamendoTracks, JamendoTrack } from '../../lib/jamendo';

const CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'recommended', label: 'Recommended', icon: Star },
  { id: 'popular', label: 'Popular', icon: Music },
  { id: 'recent', label: 'Recently Used', icon: Clock },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'creator', label: 'Creator Sounds', icon: User },
];

export default function MusicPickerScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
const [playingId, setPlayingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedTracksData, setSavedTracksData] = useState<JamendoTrack[]>([]);
  const [songs, setSongs] = useState<JamendoTrack[]>([]);
  const [loading, setLoading] = useState(false);

  const player = useAudioPlayer();

  const loadCategory = async (category: string) => {
    if (category === 'saved') {
      setSongs(savedTracksData);
      return;
    }
    setLoading(true);
    try {
      let data: JamendoTrack[] = [];
      if (category === 'trending') data = await fetchTrendingTracks();
      else if (category === 'recent') data = await fetchRecentTracks();
      else data = await fetchPopularTracks();
      setSongs(data);
    } catch (e) {
      console.warn("Jamendo API Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search.trim()) return;
    loadCategory(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!search.trim()) {
        loadCategory(activeCategory);
        return;
      }
      setLoading(true);
      try {
        const data = await searchJamendoTracks(search);
        setSongs(data);
      } catch (e) {
        console.warn("Jamendo API Error:", e);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const togglePlay = (id: string, url: string) => {
    if (playingId === id) {
      setPlayingId(null);
      player?.pause();
    } else {
      setPlayingId(id);
      player?.replace(url);
      player?.play();
    }
  };

const toggleSave = (song: JamendoTrack) => {
    setSavedIds(prev => prev.includes(song.id) ? prev.filter(x => x !== song.id) : [...prev, song.id]);
    setSavedTracksData(prev => prev.some(s => s.id === song.id) ? prev.filter(s => s.id !== song.id) : [...prev, song]);
  };

  const handleSelect = (song: any) => {
    player?.pause();
    router.back();
    router.setParams({ 
      selectedMusicId: song.id, 
      selectedMusicTitle: song.title, 
      selectedMusicArtist: song.artist,
      selectedMusicUrl: song.audioUrl 
    });
  };

  return (
    <View className="flex-1 bg-black pt-safe">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-white/10">
        <Pressable onPress={() => { player?.pause(); router.back(); }} className="w-10 h-10 items-center justify-center -ml-2">
          <ChevronLeft size={28} color="#FFFFFF" />
        </Pressable>
        <Text className="flex-1 text-center text-white text-lg font-bold pr-8">Popli Music Library</Text>
      </View>

      {/* Search */}
      <View className="px-4 py-4">
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search music, artists, genres..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-white font-medium text-base"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Categories */}
      <View className="mb-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full ${isActive ? 'bg-white' : 'bg-white/10'}`}
              >
                <Icon size={16} color={isActive ? '#000000' : '#FFFFFF'} />
                <Text className={`font-bold ${isActive ? 'text-black' : 'text-white'}`}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Song List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#A855F7" />
        <Text className="text-white mt-4 font-bold">Loading sounds...</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between mb-5 bg-black/20 p-2 rounded-2xl">
              <Pressable onPress={() => handleSelect(item)} className="flex-row items-center flex-1 pr-4">
                <Image source={{ uri: item.cover }} className="w-14 h-14 rounded-lg" />
                <View className="ml-3 flex-1">
                  <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-neutral-grey text-sm">{item.artist} • {item.uses}</Text>
                </View>
              </Pressable>

              <View className="flex-row items-center gap-4">
               <Pressable onPress={() => toggleSave(item)} className="w-10 h-10 items-center justify-center">
                  <Bookmark 
                    size={22} 
                    color={savedIds.includes(item.id) ? '#A855F7' : '#FFFFFF'} 
                    fill={savedIds.includes(item.id) ? '#A855F7' : 'transparent'} 
                  />
                </Pressable>
                <Pressable 
                  onPress={() => togglePlay(item.id, item.audioUrl)}
                  className={`w-10 h-10 rounded-full items-center justify-center ${playingId === item.id ? 'bg-[#A855F7]' : 'border border-white/20'}`}
                >
                  {playingId === item.id ? (
                    <Pause size={18} color="#FFFFFF" />
                  ) : (
                    <Play size={18} color="#FFFFFF" className="ml-0.5" />
                  )}
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
