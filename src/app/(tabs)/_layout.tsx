import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { Home, Compass, Plus, MessageSquare, User, Award } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FACC15', // Yellow
        tabBarInactiveTintColor: '#9CA3AF', // Cool Grey
        tabBarStyle: {
          backgroundColor: 'rgba(26, 11, 46, 0.95)', // Glassmorphic Dark Purple
          borderTopWidth: 1,
          borderTopColor: 'rgba(139, 92, 246, 0.2)', // Translucent Violet
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'SF Pro Rounded',
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center ${focused ? 'scale-110' : ''}`}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="h-[3px] w-[3px] rounded-full bg-primary-pink mt-1" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center ${focused ? 'scale-110' : ''}`}>
              <Compass size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="h-[3px] w-[3px] rounded-full bg-primary-pink mt-1" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => (
            <View 
              className="items-center justify-center bg-[#8B5CF6] rounded-xl shadow-lg shadow-primary-purple/40"
              style={{
                width: 44,
                height: 44,
                marginTop: 4,
              }}
            >
              <Plus size={24} color="#FFFFFF" strokeWidth={3} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'SF Pro Rounded',
            fontWeight: '600',
            marginTop: 4,
          }
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center ${focused ? 'scale-110' : ''}`}>
              <Award size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="h-[3px] w-[3px] rounded-full bg-primary-pink mt-1" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center ${focused ? 'scale-110' : ''}`}>
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="h-[3px] w-[3px] rounded-full bg-primary-pink mt-1" />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
