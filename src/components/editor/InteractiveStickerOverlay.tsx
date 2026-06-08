import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';

interface InteractiveStickerOverlayProps {
  type: 'location' | 'mention' | 'question' | 'hashtag';
  onComplete: (data: InteractiveStickerData | null) => void;
}

export type InteractiveStickerData = {
  type: 'location' | 'mention' | 'question' | 'hashtag';
  text: string;
  styleVariant: number; // For toggling between different visual styles of the same sticker
};

export default function InteractiveStickerOverlay({ type, onComplete }: InteractiveStickerOverlayProps) {
  const [text, setText] = useState('');
  const [styleVariant, setStyleVariant] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleDone = () => {
    if (text.trim().length === 0) {
      onComplete(null);
    } else {
      onComplete({
        type,
        text: text.trim(),
        styleVariant
      });
    }
  };

  const toggleStyle = () => {
    setStyleVariant(prev => (prev + 1) % 3); // Cycle through 3 styles max
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'location': return 'Search location...';
      case 'mention': return 'Mention someone...';
      case 'question': return 'Ask a question...';
      case 'hashtag': return 'Hashtag...';
      default: return 'Type something...';
    }
  };

  const renderPreview = () => {
    // This renders a live preview of what the sticker will look like while typing
    const displayText = text || getPlaceholder();

    if (type === 'location') {
      const isStyle1 = styleVariant === 0;
      return (
        <Pressable onPress={toggleStyle} className={`px-6 py-3 rounded-full flex-row items-center gap-2 ${isStyle1 ? 'bg-white' : 'bg-transparent border-2 border-white'}`}>
          <Text className={`${isStyle1 ? 'text-purple-600' : 'text-white'} font-bold text-xl`}>📍 {displayText}</Text>
        </Pressable>
      );
    }

    if (type === 'mention') {
      const isStyle1 = styleVariant === 0;
      return (
        <Pressable onPress={toggleStyle} className={`px-6 py-3 rounded-lg flex-row items-center gap-2 ${isStyle1 ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-white'}`}>
          <Text className={`${isStyle1 ? 'text-white' : 'text-orange-500'} font-bold text-2xl`}>@{displayText}</Text>
        </Pressable>
      );
    }

    if (type === 'hashtag') {
      const isStyle1 = styleVariant === 0;
      return (
        <Pressable onPress={toggleStyle} className={`px-6 py-2 rounded-md ${isStyle1 ? 'bg-white' : 'bg-black/50'}`}>
          <Text className={`${isStyle1 ? 'text-black' : 'text-white'} font-bold text-3xl`}>#{displayText}</Text>
        </Pressable>
      );
    }

    if (type === 'question') {
      const colors = ['bg-white', 'bg-purple-500', 'bg-black'];
      const textColors = ['text-black', 'text-white', 'text-white'];
      const bgColor = colors[styleVariant % colors.length];
      const textColor = textColors[styleVariant % textColors.length];

      return (
        <Pressable onPress={toggleStyle} className={`w-72 ${bgColor} rounded-2xl overflow-hidden shadow-2xl`}>
          <View className="p-6 items-center">
            <Text className={`${textColor} font-bold text-xl text-center`} numberOfLines={3}>
              {displayText}
            </Text>
          </View>
          <View className="bg-white/20 p-4 items-center">
            <Text className={`${textColor} opacity-50 font-semibold`}>Type something...</Text>
          </View>
        </Pressable>
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="absolute inset-0 bg-black/80 z-50">
      
      {/* Top Controls */}
      <View className="flex-row justify-between items-center px-4 pt-16 pb-4">
        <Pressable onPress={() => onComplete(null)}>
          <Text className="text-white font-bold text-lg">Cancel</Text>
        </Pressable>
        <Pressable onPress={handleDone} className="bg-white px-4 py-2 rounded-full">
          <Text className="text-black font-bold">Done</Text>
        </Pressable>
      </View>

      <Text className="text-white/60 text-center text-xs mt-4">Tap the sticker to change style</Text>

      {/* Main Area */}
      <View className="flex-1 items-center justify-center px-4 relative">
        
        {/* The Visual Preview */}
        <View className="items-center justify-center w-full mb-8">
          {renderPreview()}
        </View>

        {/* Hidden/Transparent Input that captures the keyboard typing */}
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={getPlaceholder()}
          placeholderTextColor="rgba(255,255,255,0.3)"
          className="absolute opacity-0 w-full h-full"
          autoCapitalize={type === 'mention' || type === 'hashtag' ? 'none' : 'sentences'}
          autoCorrect={type === 'question'}
        />

      </View>
    </KeyboardAvoidingView>
  );
}
