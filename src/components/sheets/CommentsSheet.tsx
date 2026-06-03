import React, { useState } from 'react';
import { View, Text, Image, TextInput, Pressable, ScrollView, Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { X, Send, Heart, Smile } from 'lucide-react-native';
import { useFeedStore, useAuthStore } from '../../store';
import { formatSocialCount } from '../../utils';
import { MotiView } from 'moti';

interface CommentsSheetProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentsSheet = ({ reelId, isOpen, onClose }: CommentsSheetProps) => {
  const [newCommentText, setNewCommentText] = useState('');
  const { comments, addComment } = useFeedStore();
  const { userProfile } = useAuthStore();

  const reelComments = comments.filter((c) => c.reelId === reelId);

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;
    
    addComment({
      reelId,
      username: userProfile.username,
      avatar: userProfile.avatar,
      text: newCommentText.trim(),
      isCreator: false // User is commenting
    });
    setNewCommentText('');
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <MotiView
          from={{ translateY: 600, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          exit={{ translateY: 600, opacity: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          className="h-[65%] bg-background-plum rounded-t-3xl border-t border-white/10 z-50 shadow-2xl flex-col"
        >
      {/* Drag handle line */}
      <View className="items-center py-2.5">
        <View className="w-10 h-1 bg-white/20 rounded-full" />
      </View>

      {/* Header bar */}
      <View className="flex-row items-center justify-between px-4 pb-3 border-b border-white/5">
        <View className="flex-row items-center space-x-2">
          <Text className="text-white font-bold text-lg">Comments</Text>
          <View className="bg-[#D946EF]/20 px-1.5 py-0.5 rounded">
            <Text className="text-[#D946EF] text-[10px] font-bold">{formatSocialCount(reelComments.length)}</Text>
          </View>
        </View>
        <Pressable onPress={onClose} className="p-1">
          <X size={20} color="#D1D5DB" />
        </Pressable>
      </View>

      {/* Comments List */}
      <ScrollView 
        className="flex-1 px-4 py-2" 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {reelComments.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <Text className="text-white/60 text-sm">No comments yet. Be the first to vibe! 💬</Text>
          </View>
        ) : (
          reelComments.map((comment) => (
            <View key={comment.id} className="flex-row items-start py-3.5 space-x-3 border-b border-white/5">
              <Image source={{ uri: comment.avatar }} className="w-9 h-9 rounded-full" />
              
              <View className="flex-1 space-y-1">
                <View className="flex-row items-center flex-wrap gap-1.5">
                  <Text className="text-white/80 font-bold text-xs">@{comment.username}</Text>
                  
                  {comment.isCreator && (
                    <View className="bg-[#D946EF] px-1.5 py-0.5 rounded">
                      <Text className="text-white text-[9px] font-black uppercase tracking-widest">Creator</Text>
                    </View>
                  )}
                  {comment.isTopGifter && (
                    <View className="bg-[#FACC15] px-1.5 py-0.5 rounded">
                      <Text className="text-black text-[9px] font-black uppercase tracking-widest">Top Gifter</Text>
                    </View>
                  )}
                  
                  <Text className="text-neutral-grey text-[10px]">{comment.createdAt}</Text>
                </View>
                
                <Text className="text-white text-xs leading-5 pr-4 font-normal">{comment.text}</Text>
                
                <View className="flex-row items-center space-x-4 pt-1">
                  <Text className="text-neutral-grey text-[10px] font-semibold">Reply</Text>
                  <View className="flex-row items-center space-x-1">
                    <Heart size={10} color="#9CA3AF" />
                    <Text className="text-neutral-grey text-[10px]">
                      {comment.likesCount > 0 ? formatSocialCount(comment.likesCount) : 'Like'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Footer Input */}
      <View className="bg-background-dark/90 border-t border-white/10">
        <View className="px-4 py-4 pb-8 flex-row items-center space-x-4">
          <Image source={{ uri: userProfile.avatar }} className="w-10 h-10 rounded-full bg-neutral-grey" />
          
          <View className="flex-1 flex-row items-center bg-[#1D1037] rounded-full px-4 py-2.5 border border-white/5">
            <TextInput
              value={newCommentText}
              onChangeText={setNewCommentText}
              placeholder="Add a comment..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              className="flex-1 text-white text-sm py-1 font-normal"
              style={{ maxHeight: 80, minHeight: 36 }}
              multiline
            />
            <View className="ml-2 flex-row items-center space-x-1.5 opacity-60">
              <Smile size={18} color="#D1D5DB" />
              <View className="bg-white/10 rounded px-1 py-0.5">
                <Text className="text-white text-[9px] font-bold">GIF</Text>
              </View>
            </View>
          </View>

          <Pressable onPress={handlePostComment} className="px-2 py-2">
            <Text className={`font-bold text-base ${newCommentText.trim() ? 'text-[#D946EF]' : 'text-[#D946EF]/50'}`}>Post</Text>
          </Pressable>
        </View>
      </View>
        </MotiView>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
