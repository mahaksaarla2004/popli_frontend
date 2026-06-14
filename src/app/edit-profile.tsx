import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, AtSign, Link as LinkIcon, UserPlus, Check } from 'lucide-react-native';
import { useAuthStore, useFeedStore } from '../store';
import * as ImagePicker from 'expo-image-picker';

const InputField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rightIcon: RightIcon, 
  multiline = false,
  ...rest
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
        {...rest}
      />
      {RightIcon && label === 'USERNAME' && (
        <View className="ml-3">
          <RightIcon size={16} color="#9CA3AF" />
        </View>
      )}
    </View>
  </View>
);
export default function EditProfileScreen() {
  const router = useRouter();

  const { userProfile, updateProfile } = useAuthStore();
  const { fetchReels, fetchUserReels } = useFeedStore();

  const [username, setUsername] = useState(userProfile.username);
  const [fullName, setFullName] = useState(userProfile.name);
  const [email, setEmail] = useState(''); // not in store currently
  const [phone, setPhone] = useState(''); // not in store currently
  const [bio, setBio] = useState(userProfile.bio || '');
  const [website, setWebsite] = useState(''); // not in store currently
  const [avatarUri, setAvatarUri] = useState(userProfile.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address format.');
        return;
      }
    }

    if (phone) {
      const phoneRegex = /^[0-9+\s-]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        Alert.alert('Invalid Phone', 'Please enter a valid phone number (only numbers, min 10 digits).');
        return;
      }
    }

    setIsSaving(true);
    const result = await updateProfile({
      name: fullName,
      username: username,
      bio: bio,
      avatar: avatarUri,
      // email and phone can be sent to backend if supported
      email: email || undefined,
      phone: phone || undefined,
    });
    setIsSaving(false);
    
    if (result.success) {
      // Refresh feed stores to instantly reflect new profile data
      fetchReels(1);
      fetchUserReels(userProfile.id);

      setShowSuccessModal(true);
    } else {
      Alert.alert('Error', result.error || 'Failed to save profile changes. Please try again.');
    }
  };



  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#12081E] pt-14">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-4">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-base ml-2">Edit Profile</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Avatar Section */}
        <View className="items-center py-6">
          <Pressable 
            onPress={handlePickImage}
            className="w-24 h-24 rounded-full bg-[#F59E0B]/20 items-center justify-center border-4 border-[#F59E0B]/50 mb-3 overflow-hidden"
          >
             {avatarUri ? (
               <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
             ) : (
               <UserPlus size={40} color="#F59E0B" />
             )}
          </Pressable>
          <View className="bg-[#FACC15] px-3 py-1 rounded-full -mt-6 z-10 shadow-sm shadow-[#FACC15]/40">
            <Text className="text-black text-[9px] font-black uppercase tracking-wider">Premium Creator</Text>
          </View>
        </View>

        {/* Inputs */}
        <InputField label="USERNAME" value={username} onChange={setUsername} rightIcon={AtSign} />
        <InputField label="FULL NAME" value={fullName} onChange={setFullName} />
          <InputField 
            label="EMAIL ID" 
            value={email} 
            onChange={setEmail} 
            placeholder="mahaksaarla2004@gmail.com" 
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField 
            label="PHONE NUMBER" 
            value={phone} 
            onChange={(text: string) => {
              // Only allow numbers, plus sign, and spaces
              const filtered = text.replace(/[^0-9+\s-]/g, '');
              setPhone(filtered);
            }} 
            placeholder="+91 0000000000" 
            keyboardType="phone-pad"
            maxLength={15}
          />
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
          <Text className="text-white font-bold text-sm z-10">{isSaving ? 'Saving...' : 'Save Changes'}</Text>
        </Pressable>

      </ScrollView>

      {/* Premium Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="bg-[#1A0E2C] rounded-3xl w-full p-8 items-center border border-green-500/30 shadow-2xl shadow-green-500/20">
            <View className="w-20 h-20 bg-green-500/10 rounded-full items-center justify-center mb-6 border-2 border-green-500/30">
               <Check size={40} color="#22C55E" />
            </View>
            <Text className="text-white text-2xl font-bold mb-3 text-center">Profile Updated!</Text>
            <Text className="text-white/60 text-center text-sm mb-8 leading-5">
              Your profile changes have been saved successfully and are now live.
            </Text>
            <Pressable 
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
              className="w-full h-14 rounded-full bg-green-500 items-center justify-center active:bg-green-600 shadow-lg shadow-green-500/30"
            >
              <Text className="text-white font-bold text-base">Awesome!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}
