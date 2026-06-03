import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');

  const handleSave = () => {
    if (newPassword !== reenterPassword) {
      return Alert.alert('Error', 'New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters long.');
    }

    Alert.alert('Success', 'Your password has been changed successfully.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const InputField = ({ label, value, onChange, placeholder }: any) => (
    <View className="mb-5">
      <Text className="text-white/60 text-[9px] font-bold uppercase tracking-widest pl-1 mb-2">{label}</Text>
      <View className="bg-[#1A0E2C] border border-white/5 rounded-2xl flex-row px-4 h-[52px] items-center">
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.2)"
          secureTextEntry
          className="flex-1 text-white font-medium text-sm"
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#12081E] pt-14">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-4">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-base ml-2">Change Password</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* Inputs */}
        <InputField 
          label="CURRENT PASSWORD" 
          value={currentPassword} 
          onChange={setCurrentPassword} 
          placeholder="********" 
        />
        
        <InputField 
          label="NEW PASSWORD" 
          value={newPassword} 
          onChange={setNewPassword} 
          placeholder="Enter new password" 
        />
        
        <InputField 
          label="RE-ENTER NEW PASSWORD" 
          value={reenterPassword} 
          onChange={setReenterPassword} 
          placeholder="Enter re-enter new password" 
        />

        {/* Save Button */}
        <Pressable 
          onPress={handleSave}
          className="w-full h-14 rounded-full mt-6 flex-row items-center justify-center active:scale-[0.98] shadow-lg shadow-[#A855F7]/30"
          style={{ backgroundColor: '#A855F7' }}
        >
          {/* Gradient Simulation */}
          <View className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-[#D946EF] to-[#A855F7] rounded-full opacity-90" />
          <Text className="text-white font-bold text-sm z-10">Save Password</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
