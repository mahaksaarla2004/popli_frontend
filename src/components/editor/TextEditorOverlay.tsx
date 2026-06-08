import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react-native';

interface TextEditorOverlayProps {
  initialText?: string;
  onComplete: (textData: TextLayerData | null) => void;
}

export type TextLayerData = {
  text: string;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundStyle: 'none' | 'solid' | 'transparent';
};

const COLORS = [
  '#FFFFFF', '#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
];

const FONTS = [
  { id: 'classic', label: 'Classic', family: 'System' },
  { id: 'neon', label: 'Neon', family: 'System' }, // Add custom fonts later if available
  { id: 'typewriter', label: 'Typewriter', family: 'monospace' },
  { id: 'modern', label: 'Modern', family: 'sans-serif-medium' },
  { id: 'strong', label: 'Strong', family: 'sans-serif-condensed' },
];

export default function TextEditorOverlay({ initialText = '', onComplete }: TextEditorOverlayProps) {
  const [text, setText] = useState(initialText);
  const [color, setColor] = useState(COLORS[0]);
  const [font, setFont] = useState(FONTS[0]);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [bgStyle, setBgStyle] = useState<'none' | 'solid' | 'transparent'>('none');
  
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus automatically when opened
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleDone = () => {
    if (text.trim().length === 0) {
      onComplete(null);
    } else {
      let finalBgColor = 'transparent';
      let finalTextColor = color;

      if (bgStyle === 'solid') {
        finalBgColor = color;
        finalTextColor = color === '#FFFFFF' ? '#000000' : '#FFFFFF';
      } else if (bgStyle === 'transparent') {
        finalBgColor = 'rgba(0,0,0,0.5)';
        finalTextColor = color;
      }

      onComplete({
        text,
        fontFamily: font.family,
        color: finalTextColor,
        textAlign: align,
        backgroundStyle: bgStyle,
        backgroundColor: finalBgColor,
      });
    }
  };

  const toggleAlignment = () => {
    if (align === 'center') setAlign('left');
    else if (align === 'left') setAlign('right');
    else setAlign('center');
  };

  const toggleBackgroundStyle = () => {
    if (bgStyle === 'none') setBgStyle('solid');
    else if (bgStyle === 'solid') setBgStyle('transparent');
    else setBgStyle('none');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="absolute inset-0 bg-black/80 z-50">
      
      {/* Top Controls */}
      <View className="flex-row justify-between items-center px-4 pt-16 pb-4">
        <View className="flex-row gap-4">
          <Pressable onPress={toggleAlignment} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full">
            {align === 'center' ? <AlignCenter size={20} color="#FFF" /> : 
             align === 'left' ? <AlignLeft size={20} color="#FFF" /> : 
             <AlignRight size={20} color="#FFF" />}
          </Pressable>
          <Pressable onPress={toggleBackgroundStyle} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full">
            <Type size={20} color={bgStyle !== 'none' ? '#000' : '#FFF'} className={bgStyle !== 'none' ? 'bg-white rounded-sm' : ''} />
          </Pressable>
        </View>

        <Pressable onPress={handleDone} className="bg-white px-4 py-2 rounded-full">
          <Text className="text-black font-bold">Done</Text>
        </Pressable>
      </View>

      {/* Main Text Input Area */}
      <View className="flex-1 justify-center px-4">
        <View style={{
          alignSelf: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
          backgroundColor: bgStyle === 'solid' ? color : bgStyle === 'transparent' ? 'rgba(0,0,0,0.5)' : 'transparent',
          paddingHorizontal: bgStyle !== 'none' ? 16 : 0,
          paddingVertical: bgStyle !== 'none' ? 8 : 0,
          borderRadius: 12,
        }}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Type something..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            multiline
            textAlign={align}
            style={{
              color: bgStyle === 'solid' ? (color === '#FFFFFF' ? '#000000' : '#FFFFFF') : color,
              fontFamily: font.family,
              fontSize: 32,
              fontWeight: 'bold',
              minWidth: 100,
            }}
          />
        </View>
      </View>

      {/* Bottom Controls */}
      <View className="pb-8">
        
        {/* Font Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 px-4">
          <View className="flex-row gap-3">
            {FONTS.map(f => (
              <Pressable 
                key={f.id} 
                onPress={() => setFont(f)}
                className={`px-4 py-2 rounded-full ${font.id === f.id ? 'bg-white' : 'bg-black/40 border border-white/20'}`}
              >
                <Text style={{ fontFamily: f.family, color: font.id === f.id ? '#000' : '#FFF', fontWeight: 'bold' }}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Color Picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-4">
          <View className="flex-row gap-4 items-center">
            {COLORS.map(c => (
              <Pressable 
                key={c}
                onPress={() => setColor(c)}
                className={`w-10 h-10 rounded-full border-2 items-center justify-center ${color === c ? 'border-white' : 'border-transparent'}`}
              >
                <View className="w-8 h-8 rounded-full border border-black/20" style={{ backgroundColor: c }} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

    </KeyboardAvoidingView>
  );
}
