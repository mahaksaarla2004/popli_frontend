import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store';
import { apiClient } from '../../api/client';
import { ChevronLeft, Sparkles, ChevronRight, Check } from 'lucide-react-native';
import { MotiView } from 'moti';

const INTERESTS = [
  { id: 'comedy', label: 'Comedy', emoji: '😂', description: 'Funny sketches & voiceovers' },
  { id: 'emotional', label: 'Emotional', emoji: '😢', description: 'Drama, stories & poetry' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮', description: 'Pubg, streaming & clips' },
  { id: 'dance', label: 'Dance', emoji: '💃', description: 'Reels, trends & beats' },
  { id: 'village_life', label: 'Village Life', emoji: '🌾', description: 'Desi vloggers & culture' },
  { id: 'motivation', label: 'Motivation', emoji: '🔥', description: 'Success & daily quotes' },
  { id: 'fashion', label: 'Fashion', emoji: '✨', description: 'Outfits, trends & beauty' },
  { id: 'fitness', label: 'Fitness', emoji: '💪', description: 'Gym, workouts & health' },
  { id: 'tech', label: 'Tech', emoji: '💻', description: 'Unboxing, tips & hacks' },
  { id: 'food', label: 'Food', emoji: '🥘', description: 'Recipes, street food & vlogs' },
  { id: 'sports', label: 'Sports', emoji: '🏏', description: 'Cricket, updates & plays' },
];

export default function InterestsScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [interests, setInterests] = useState<any[]>(INTERESTS);
  const [isSaving, setIsSaving] = useState(false);
  const { updateProfile } = useAuthStore();

  useEffect(() => {
    apiClient.get('/interests')
      .then(res => {
        if (res.data && res.data.length > 0) {
          const EMOJI_MAP: Record<string, string> = {
            technology: '💻',
            tech: '💻',
            sports: '🏏',
            music: '🎵',
            art: '🎨',
            gaming: '🎮',
            fashion: '👗',
            comedy: '😂',
            emotional: '😢',
            dance: '💃',
            'village life': '🌾',
            motivation: '🔥',
            fitness: '💪',
            food: '🥘',
          };

          const mapped = res.data.map((i: any) => {
            const localMatch = INTERESTS.find(local => local.label.toLowerCase() === i.name.toLowerCase());
            return {
              id: i.id, // backend UUID
              label: i.name,
              emoji: i.emoji || EMOJI_MAP[i.name.toLowerCase()] || localMatch?.emoji || '✨',
              description: i.description || localMatch?.description || ''
            };
          });
          setInterests(mapped);
        }
      })
      .catch(err => console.log('Interests fetch failed', err));
  }, []);

  const handleToggleInterest = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleNext = async () => {
    if (selectedIds.length < 3) return;
    setIsSaving(true);

    try {
      const authState = useAuthStore.getState();
      const profile = authState.userProfile;
      
      // Map selectedIds to their actual string labels/names
      const selectedNames = selectedIds.map(id => {
        const found = interests.find(i => i.id === id);
        return found ? found.label : id;
      });

      // Update auth store (this automatically triggers apiClient.put('/users/me') internally)
      await updateProfile({
        interestNames: selectedNames,
        selectedInterests: selectedIds, // frontend cache
      } as any);

      setIsSaving(false);
      // Navigate smoothly to location configuration page on next tick to avoid Navigation Context errors
      setTimeout(() => {
        router.push('/(auth)/location');
      }, 50);
    } catch (error) {
      setIsSaving(false);
      console.error('Failed to update profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const isMinSelected = selectedIds.length >= 3;
  const remaining = 3 - selectedIds.length;

  return (
    <View className="flex-1 bg-[#0B001A] justify-between py-8 px-6" style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
      
      {/* Top Navigation Row */}
      <View className="flex-row items-center justify-between w-full h-12">
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/5 items-center justify-center active:scale-[0.9]"
        >
          <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
        <View className="flex-row items-center gap-2 bg-primary-pink/15 px-3 py-1.5 rounded-full border border-primary-pink/20">
          <Sparkles size={11} color="#EC4899" />
          <Text className="text-primary-pink text-[9px] font-black uppercase tracking-wider">Step 2 of 4</Text>
        </View>
      </View>

      {/* Main Container */}
      <View className="flex-1 justify-center my-4">
        <View className="gap-2 mb-4">
          <Text className="text-white font-black text-3xl tracking-tight">Choose Interests</Text>
          <Text className="text-white/50 text-xs">
            {isMinSelected 
              ? 'Great choices! Select more if you wish.' 
              : `Select at least ${remaining} more genre${remaining > 1 ? 's' : ''} to unlock personalized reels.`
            }
          </Text>
        </View>

        {/* Categories Scrollable grid with customized layout */}
        <ScrollView 
          className="flex-grow-0 h-[380px]"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          <View className="flex-row flex-wrap gap-3 py-2 justify-between">
            {interests.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleToggleInterest(item.id)}
                  style={{ width: '48%' }}
                  className={`p-4 rounded-3xl border relative justify-between h-28 active:scale-[0.96] transition-all overflow-hidden ${
                    isSelected 
                      ? 'bg-primary-purple/20 border-primary-pink/70 shadow-lg shadow-primary-pink/20' 
                      : 'bg-[#190C2C]/50 border-white/5'
                  }`}
                >
                  {/* Decorative background glow for active card */}
                  {isSelected && (
                    <MotiView
                      from={{ scale: 0.8, opacity: 0.1 }}
                      animate={{ scale: 1.5, opacity: 0.25 }}
                      transition={{ type: 'timing', duration: 300 }}
                      className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-primary-pink/30 blur-md"
                    />
                  )}

                  <View className="flex-row justify-between items-start">
                    <Text className="text-3xl">{item.emoji}</Text>
                    {isSelected && (
                      <MotiView
                        from={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-5 h-5 rounded-full bg-primary-pink items-center justify-center border border-white/20"
                      >
                        <Check size={10} color="#FFFFFF" strokeWidth={4} />
                      </MotiView>
                    )}
                  </View>

                  <View className="gap-1">
                    <Text className="text-white font-black text-sm">{item.label}</Text>
                    <Text className="text-white/40 text-[9px] font-medium" numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Footer Navigation CTA */}
      <View className="w-full">
        <Pressable
          onPress={handleNext}
          disabled={!isMinSelected}
          className={`py-4 rounded-2xl items-center justify-center flex-row gap-2 transition-all ${
            isMinSelected
              ? 'bg-primary-purple active:scale-[0.98] shadow-lg shadow-primary-purple/40'
              : 'bg-white/5 border border-white/5 opacity-55'
          }`}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text className="text-white text-sm font-bold uppercase tracking-wider">
                {isMinSelected ? 'Continue to Location' : `Choose ${remaining} More`}
              </Text>
              {isMinSelected && <ChevronRight size={16} color="#FFFFFF" strokeWidth={3} />}
            </>
          )}
        </Pressable>
      </View>

    </View>
  );
}
