import React, { useState } from 'react';
import { View, Text, Image, TextInput, Pressable, ScrollView, Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { X, Send, Heart, Smile } from 'lucide-react-native';
import { useFeedStore, useAuthStore } from '../../store';
import { formatSocialCount, getDefaultAvatar } from '../../utils';
import { MotiView } from 'moti';
import { apiClient } from '../../api/client';
import { Comment } from '../../types';

interface CommentsSheetProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentsSheet = ({ reelId, isOpen, onClose }: CommentsSheetProps) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<{id: string, username: string} | null>(null);
  const { addComment, toggleCommentLike } = useFeedStore();
  const { userProfile } = useAuthStore();

  React.useEffect(() => {
    if (isOpen && reelId) {
      apiClient.get(`/reels/${reelId}/comments`)
        .then(res => {
          const mapComment = (c: any): Comment => ({
            id: c.id,
            reelId: c.reelId,
            userId: c.userId,
            user: c.user,
            text: c.text,
            createdAt: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            likesCount: c.likesCount,
            isLiked: false, // In a real app, backend would send this
            parentId: c.parentId,
            replies: c.replies ? c.replies.map(mapComment) : []
          });
          const mapped = res.data.map(mapComment);
          setLocalComments(mapped);
        })
        .catch(err => console.log('Failed to fetch comments', err));
    }
  }, [isOpen, reelId]);

  const reelComments = localComments;

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    
    const textToPost = newCommentText.trim();
    const parentId = replyingTo ? replyingTo.id : undefined;
    
    setNewCommentText('');
    setReplyingTo(null);

    // Optimistic backend-connected store update
    addComment({
      reelId,
      userId: userProfile.id,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        isVerified: userProfile.isVerified
      },
      text: textToPost,
      parentId
    });

    // Optimistic local update
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      reelId,
      userId: userProfile.id,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        isVerified: userProfile.isVerified
      },
      text: textToPost,
      createdAt: 'Just now',
      likesCount: 0,
      parentId,
      replies: []
    };

    setLocalComments(prev => {
      if (parentId) {
        return prev.map(c => {
          if (c.id === parentId) {
            return { ...c, replies: [...(c.replies || []), optimisticComment] };
          }
          return c;
        });
      }
      return [optimisticComment, ...prev];
    });
  };

  const handleLike = (commentId: string) => {
    toggleCommentLike(commentId);
    
    // Optimistic local update
    const toggleInList = (list: Comment[]): Comment[] => {
      return list.map(c => {
        if (c.id === commentId) {
          const newLiked = !c.isLiked;
          return { ...c, isLiked: newLiked, likesCount: c.likesCount + (newLiked ? 1 : -1) };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: toggleInList(c.replies) };
        }
        return c;
      });
    };
    setLocalComments(prev => toggleInList(prev));
  };

  const renderCommentText = (text: string) => {
    const parts = text.split(/(@[\w.-]+)/g);
    return (
      <Text className="text-white text-xs leading-5 pr-4 font-normal">
        {parts.map((part, i) => 
          part.startsWith('@') ? (
            <Text key={i} className="text-[#D946EF] font-bold">{part}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  const renderCommentRow = (comment: Comment, isReply = false) => (
    <View key={comment.id} className={`flex-row items-start py-3.5 gap-3 border-b border-white/5 ${isReply ? 'ml-10 border-b-0 py-2' : ''}`}>
      <Image 
        source={{ 
          uri: comment.user?.avatar?.includes('unsplash.com') 
            ? getDefaultAvatar(comment.user?.username || 'user') 
            : (comment.user?.avatar || getDefaultAvatar(comment.user?.username || 'user'))
        }} 
        className="w-9 h-9 rounded-full" 
      />
      
      <View className="flex-1 gap-1">
        <View className="flex-row items-center flex-wrap gap-1.5">
          <Text className="text-white/80 font-bold text-xs">@{comment.user?.username}</Text>
          <Text className="text-neutral-grey text-[10px]">{comment.createdAt}</Text>
        </View>
        
        {renderCommentText(comment.text)}
        
        <View className="flex-row items-center gap-4 pt-1">
          <Pressable onPress={() => setReplyingTo({ id: isReply ? comment.parentId! : comment.id, username: comment.user?.username || 'user' })}>
            <Text className="text-neutral-grey text-[10px] font-semibold">Reply</Text>
          </Pressable>
          <Pressable onPress={() => handleLike(comment.id)} className="flex-row items-center gap-1 p-1">
            <Heart size={12} color={comment.isLiked ? "#D946EF" : "#9CA3AF"} fill={comment.isLiked ? "#D946EF" : "transparent"} />
            <Text className="text-neutral-grey text-[10px]">
              {comment.likesCount > 0 ? formatSocialCount(comment.likesCount) : 'Like'}
            </Text>
          </Pressable>
        </View>

        {/* Render Nested Replies */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <View className="mt-2">
            {comment.replies.map(reply => renderCommentRow(reply, true))}
          </View>
        )}
      </View>
    </View>
  );

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
        <View className="flex-row items-center gap-2">
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
          reelComments.map((comment) => renderCommentRow(comment))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Footer Input */}
      <View className="bg-background-dark/90 border-t border-white/10">
        {replyingTo && (
          <View className="flex-row items-center justify-between px-4 pt-3 pb-1">
            <Text className="text-white/60 text-xs font-semibold">
              Replying to <Text className="text-[#D946EF] font-bold">@{replyingTo.username}</Text>
            </Text>
            <Pressable onPress={() => setReplyingTo(null)}>
              <X size={14} color="#D1D5DB" />
            </Pressable>
          </View>
        )}
        <View className="px-4 py-4 pb-8 flex-row items-center gap-4">
          <Image 
            source={{ 
              uri: userProfile.avatar?.includes('unsplash.com') 
                ? getDefaultAvatar(userProfile.username) 
                : (userProfile.avatar || getDefaultAvatar(userProfile.username))
            }} 
            className="w-10 h-10 rounded-full bg-neutral-grey" 
          />
          
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
            <View className="ml-2 flex-row items-center gap-2 opacity-60">
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
