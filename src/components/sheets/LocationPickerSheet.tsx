import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import { MapPin, Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../api/client';

interface LocationPickerSheetProps {
  onSelect: (location: { locationName: string; latitude: number; longitude: number; placeId: string } | null) => void;
  onClose: () => void;
  currentLocation?: { locationName: string; latitude?: number; longitude?: number; placeId?: string } | null;
}

export default function LocationPickerSheet({ onSelect, onClose, currentLocation }: LocationPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchLocations(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchLocations = async (q: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/search/locations?q=${encodeURIComponent(q)}`);
      setResults(res.data || []);
    } catch (err) {
      console.warn("Failed to search locations:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#12081E]" style={{ paddingTop: Math.max(insets.top, 16) }}>
      <View className="flex-row items-center justify-between px-4 pb-4 border-b border-white/10">
        <Text className="text-white font-bold text-lg">Add Location</Text>
        <Pressable onPress={onClose} className="p-2">
          <X size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View className="p-4">
        <View className="flex-row items-center bg-[#1A0E2C] rounded-xl px-4 py-3 border border-white/5">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-white ml-3 text-base"
            placeholder="Search places..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <X size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        {currentLocation && !query && (
          <View className="mb-4">
            <Text className="text-[#9CA3AF] text-xs font-bold mb-2 uppercase">Current Selection</Text>
            <Pressable
              onPress={() => {
                onSelect(null);
                onClose();
              }}
              className="flex-row items-center py-3 border-b border-white/5"
            >
              <View className="w-10 h-10 rounded-full bg-[#10B981]/20 items-center justify-center mr-3">
                <MapPin size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base" numberOfLines={1}>{currentLocation.locationName}</Text>
                <Text className="text-[#10B981] text-xs mt-0.5">Remove location</Text>
              </View>
            </Pressable>
          </View>
        )}

        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color="#A855F7" />
            <Text className="text-[#9CA3AF] mt-4">Searching places...</Text>
          </View>
        ) : (
          <View>
            {results.map((loc, idx) => (
              <Pressable
                key={loc.placeId || idx}
                onPress={() => {
                  Keyboard.dismiss();
                  onSelect(loc);
                  onClose();
                }}
                className="flex-row items-center py-3 border-b border-white/5"
              >
                <View className="w-10 h-10 rounded-full bg-[#3E2B5C] items-center justify-center mr-3">
                  <MapPin size={20} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-base" numberOfLines={1}>{loc.locationName.split(',')[0]}</Text>
                  <Text className="text-[#9CA3AF] text-xs mt-0.5" numberOfLines={1}>{loc.locationName}</Text>
                </View>
              </Pressable>
            ))}

            {query.length > 0 && results.length === 0 && !isLoading && (
              <View className="py-8 items-center">
                <Text className="text-[#9CA3AF]">No places found for "{query}"</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
