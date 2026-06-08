import React from 'react';
import { View, Text, Pressable, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MapPin, Hash, Search, Flame, Music, HelpCircle, Thermometer, Smile, Clock, Camera } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface StickerSheetProps {
  onClose: () => void;
  onSelect: (sticker: any) => void;
}

const WIDGETS = [
  { id: '1', type: 'LOCATION', icon: MapPin, label: 'LOCATION', colors: ['#A855F7', '#EC4899'] },
  { id: '2', type: 'MENTION', icon: Search, label: '@MENTION', colors: ['#F59E0B', '#EF4444'] },
  { id: '3', type: 'HASHTAG', icon: Hash, label: '#HASHTAG', colors: ['#3B82F6', '#8B5CF6'] },
  { id: '4', type: 'MUSIC', icon: Music, label: 'MUSIC', colors: ['#10B981', '#3B82F6'] },
  { id: '5', type: 'POLL', icon: Flame, label: 'POLL', colors: ['#EF4444', '#F59E0B'] },
  { id: '6', type: 'QUESTION', icon: HelpCircle, label: 'QUESTIONS', colors: ['#8B5CF6', '#EC4899'] },
  { id: '7', type: 'TEMPERATURE', icon: Thermometer, label: '84°F', colors: ['#000000', '#121212'] },
  { id: '8', type: 'TIME', icon: Clock, label: '12:00', colors: ['#000000', '#121212'] },
  { id: '9', type: 'REACTION', icon: Smile, label: 'REACTION', colors: ['#000000', '#121212'] },
  { id: '10', type: 'ADD_YOURS', icon: Camera, label: 'ADD YOURS', colors: ['#000000', '#121212'] },
];

const EMOJIS = ['😂', '😍', '🔥', '👏', '😢', '😮', '❤️', '🎉', '🙌', '💯', '🙏', '✨', '🥺', '👍', '🤔'];

export default function StickerSheet({ onClose, onSelect }: StickerSheetProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-[#1A0E2C] rounded-t-3xl border-t border-white/10 z-50 h-[80%]">
      {/* Handle */}
      <View className="items-center py-3">
        <View className="w-12 h-1.5 bg-white/20 rounded-full" />
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Search Bar */}
        <View className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center gap-3 mb-6">
          <Search size={18} color="#6B7280" />
          <Text className="text-neutral-grey font-medium">Search stickers...</Text>
        </View>

        {/* Widgets Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          {WIDGETS.map((widget) => {
            const Icon = widget.icon;
            return (
              <Pressable 
                key={widget.id}
                onPress={() => onSelect(widget)}
                style={{ width: (width - 40) / 2 - 8 }}
                className="bg-white rounded-xl items-center justify-center p-3 h-16 border-b-4 border-black/20"
              >
                <View className="flex-row items-center gap-2">
                  <Icon size={18} color={widget.colors[0]} />
                  <Text className="text-black font-black text-xs tracking-wider">{widget.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Emojis Grid */}
        <Text className="text-white font-bold mb-4 ml-2 text-base">Emoji</Text>
        <View className="flex-row flex-wrap gap-4 px-2">
          {EMOJIS.map((emoji, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => onSelect({ type: 'EMOJI', value: emoji })}
              className="w-12 h-12 items-center justify-center bg-black/20 rounded-full"
            >
              <Text className="text-3xl">{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
