import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, AtSign, Link as LinkIcon, UserPlus } from 'lucide-react-native';

export default function EditProfileScreen() {
  const router = useRouter();

  // Mock initial state based on Figma
  const [username, setUsername] = useState('@alex_curates');
  const [fullName, setFullName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex.curates@neon.app');
  const [phone, setPhone] = useState('+1 (555) 012-3456');
  const [bio, setBio] = useState('Digital curator of nocturnal aesthetics. Capturing the glow in the darkness 🌠');
  const [website, setWebsite] = useState('https://curator.pro/alex');

  const handleSave = () => {
    Alert.alert('Success', 'Profile changes saved successfully.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    rightIcon: RightIcon, 
    multiline = false 
  }: any) => (
    <View className="mb-4">
      <Text className="text-white/60 text-[9px] font-bold uppercase tracking-widest pl-1 mb-2">{label}</Text>
      <View className={`bg-[#1A0E2C] border border-white/5 rounded-2xl flex-row px-4 ${multiline ? 'py-4 min-h-[90px]' : 'h-[52px] items-center'}`}>
        {RightIcon && label === 'WEBSITE OR CONTACT LINK' && (
          <View className="mr-3">
            <RightIcon size={16} color="#9CA3AF" />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          multiline={multiline}
          className={`flex-1 text-white font-medium text-sm ${multiline ? 'leading-5' : ''}`}
          style={multiline ? { textAlignVertical: 'top' } : {}}
        />
        {RightIcon && label === 'USERNAME' && (
          <View className="ml-3">
            <RightIcon size={16} color="#9CA3AF" />
          </View>
        )}
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
        <Text className="text-white font-bold text-base ml-2">Edit Profile</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Avatar Section */}
        <View className="items-center py-6">
          <View className="w-24 h-24 rounded-full bg-[#F59E0B]/20 items-center justify-center border-4 border-[#F59E0B]/50 mb-3">
             <UserPlus size={40} color="#F59E0B" />
          </View>
          <View className="bg-[#FACC15] px-3 py-1 rounded-full -mt-6 z-10 shadow-sm shadow-[#FACC15]/40">
            <Text className="text-black text-[9px] font-black uppercase tracking-wider">Premium Creator</Text>
          </View>
        </View>

        {/* Inputs */}
        <InputField label="USERNAME" value={username} onChange={setUsername} rightIcon={AtSign} />
        <InputField label="FULL NAME" value={fullName} onChange={setFullName} />
        <InputField label="EMAIL ID" value={email} onChange={setEmail} />
        <InputField label="PHONE NUMBER" value={phone} onChange={setPhone} />
        <InputField label="BIO" value={bio} onChange={setBio} multiline />
        <InputField label="WEBSITE OR CONTACT LINK" value={website} onChange={setWebsite} rightIcon={LinkIcon} />

        {/* Change Password Link */}
        <Pressable 
          onPress={() => router.push('/change-password')}
          className="items-center py-4 mt-2"
        >
          <Text className="text-[#EC4899] text-xs font-bold uppercase tracking-widest">Change Password</Text>
        </Pressable>

        {/* Save Button */}
        <Pressable 
          onPress={handleSave}
          className="w-full h-14 rounded-full mt-4 flex-row items-center justify-center active:scale-[0.98] shadow-lg shadow-[#EC4899]/30"
          style={{ backgroundColor: '#EC4899' }}
        >
          {/* Gradient Simulation */}
          <View className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-[#D946EF] to-[#EC4899] rounded-full opacity-90" />
          <Text className="text-white font-bold text-sm z-10">Save Changes</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
