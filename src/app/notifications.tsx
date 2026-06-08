import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Award, Gift, TrendingUp, Megaphone, Heart, MessageCircle, UserPlus } from 'lucide-react-native';
import { useChatStore } from '../store';
import { NotificationItem } from '../types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, fetchNotifications, markNotificationsRead } = useChatStore();

  useEffect(() => {
    fetchNotifications();
    return () => {
      markNotificationsRead();
    };
  }, []);

  const groupedNotifs = useMemo(() => {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const thisWeek: NotificationItem[] = [];

    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;

    notifications.forEach(n => {
      const nDate = new Date(n.timestamp);
      const diffMs = now.getTime() - nDate.getTime();
      const diffDays = diffMs / msInDay;

      if (diffDays < 1) today.push(n);
      else if (diffDays < 2) yesterday.push(n);
      else thisWeek.push(n);
    });

    return { today, yesterday, thisWeek };
  }, [notifications]);

  const renderNotification = (n: NotificationItem) => {
    const isNew = !n.isRead;
    
    // Time format helper
    const timeAgo = () => {
      const diffHours = Math.floor((new Date().getTime() - new Date(n.timestamp).getTime()) / (1000 * 60 * 60));
      if (diffHours < 1) return 'JUST NOW';
      if (diffHours < 24) return `${diffHours}H AGO`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}D AGO`;
    };

    if (n.type === 'milestone') {
      return (
        <Pressable key={n.id} className={`bg-[#1D1037]/80 border ${isNew ? 'border-[#8B5CF6]/40 shadow-lg shadow-[#8B5CF6]/20' : 'border-white/5 opacity-80'} rounded-2xl p-4 flex-row items-center gap-4 active:opacity-80 transition-opacity mb-4`}>
          <View className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 items-center justify-center">
            <Award size={18} color="#A855F7" />
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-white text-[13px] leading-5">{n.body}</Text>
            <Text className="text-white/40 text-[9px] font-bold mt-2 uppercase tracking-widest">{n.title} • {timeAgo()}</Text>
          </View>
        </Pressable>
      );
    }

    if (n.type === 'gift') {
      return (
        <Pressable key={n.id} className={`bg-[#1D1037]/60 border border-white/5 border-l-4 border-l-[#eab308] rounded-2xl p-4 flex-row items-center gap-4 active:opacity-80 transition-opacity mb-4 ${!isNew && 'opacity-80'}`}>
          <View className="w-10 h-10 rounded-full bg-[#854d0e]/30 items-center justify-center">
            <Gift size={18} color="#facc15" />
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-white text-[13px] leading-5">{n.body}</Text>
            <Text className="text-white/40 text-[9px] font-bold mt-2 uppercase tracking-widest">{n.title} • {timeAgo()}</Text>
          </View>
        </Pressable>
      );
    }

    if (n.type === 'follow') {
      return (
        <Pressable key={n.id} className={`bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 flex-row items-center justify-between active:opacity-80 transition-opacity mb-4 ${!isNew && 'opacity-80'}`}>
          <View className="flex-row items-center gap-4 flex-1">
            <Image source={{ uri: n.senderAvatar || 'https://i.pravatar.cc/150' }} className="w-10 h-10 rounded-full" />
            <View className="flex-1 pr-2">
              <Text className="text-white text-[13px] leading-5"><Text className="font-bold">{n.senderName}</Text> {n.body}</Text>
              <Text className="text-white/40 text-[9px] font-bold mt-2 uppercase tracking-widest">{n.title} • {timeAgo()}</Text>
            </View>
          </View>
          <Pressable className="bg-[#A855F7] px-5 py-2 rounded-full">
            <Text className="text-white text-[11px] font-bold">Follow</Text>
          </Pressable>
        </Pressable>
      );
    }

    if (n.type === 'comment' || n.type === 'like') {
      return (
        <Pressable key={n.id} className={`bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 flex-row items-center justify-between active:opacity-80 transition-opacity mb-4 ${!isNew && 'opacity-80'}`}>
          <View className="flex-row items-center gap-4 flex-1 pr-3">
            <Image source={{ uri: n.senderAvatar || 'https://i.pravatar.cc/150' }} className="w-10 h-10 rounded-full" />
            <View className="flex-1">
              <Text className="text-white text-[13px] leading-5"><Text className="font-bold">{n.senderName}</Text> {n.body}</Text>
              <Text className="text-white/40 text-[9px] font-bold mt-2 uppercase tracking-widest">{n.title} • {timeAgo()}</Text>
            </View>
          </View>
          <View className="w-11 h-11 items-center justify-center bg-black/40 rounded-[10px] border border-white/10">
            {n.type === 'comment' ? <MessageCircle size={16} color="#A855F7" /> : <Heart size={16} color="#EC4899" />}
          </View>
        </Pressable>
      );
    }

    // Default announcement/insight
    return (
      <Pressable key={n.id} className={`bg-[#1D1037]/60 border border-white/5 rounded-2xl p-4 flex-row items-center gap-4 active:opacity-80 transition-opacity mb-4 ${!isNew && 'opacity-80'}`}>
        <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
          <Megaphone size={18} color="#9CA3AF" />
        </View>
        <View className="flex-1 pr-2">
          <Text className="text-white text-[13px] leading-5">{n.body}</Text>
          <Text className="text-white/40 text-[9px] font-bold mt-2 uppercase tracking-widest">{n.title} • {timeAgo()}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-[#0d071a] pt-12">
      {/* Header bar */}
      <View className="flex-row items-center px-4 pb-4 border-b border-transparent">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-70">
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-[19px] ml-2">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {groupedNotifs.today.length > 0 && (
          <>
            <Text className="text-white/50 text-[10px] font-bold tracking-widest mt-4 mb-3">TODAY</Text>
            <View>{groupedNotifs.today.map(renderNotification)}</View>
          </>
        )}

        {groupedNotifs.yesterday.length > 0 && (
          <>
            <Text className="text-white/50 text-[10px] font-bold tracking-widest mt-4 mb-3">YESTERDAY</Text>
            <View>{groupedNotifs.yesterday.map(renderNotification)}</View>
          </>
        )}

        {groupedNotifs.thisWeek.length > 0 && (
          <>
            <Text className="text-white/50 text-[10px] font-bold tracking-widest mt-4 mb-3">THIS WEEK</Text>
            <View>{groupedNotifs.thisWeek.map(renderNotification)}</View>
          </>
        )}

        {notifications.length === 0 && (
          <View className="py-20 items-center justify-center">
            <View className="w-16 h-16 bg-white/5 rounded-full items-center justify-center mb-4">
              <Megaphone size={24} color="#9CA3AF" />
            </View>
            <Text className="text-white/60 font-semibold">No notifications yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
