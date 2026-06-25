import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, Platform, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, AtSign, Link as LinkIcon, UserPlus, Check } from 'lucide-react-native';
import { useAuthStore, useFeedStore } from '../store';
import { uploadToCloudinary } from '../api/upload';
import * as ImagePicker from 'expo-image-picker';
import { getDefaultAvatar } from '../utils';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

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
  const [socialLinks, setSocialLinks] = useState<{title: string, url: string}[]>(userProfile.socialLinks || []);
  const [avatarUri, setAvatarUri] = useState(userProfile.avatar || '');
 const [gender, setGender] = useState<string>(userProfile.gender || 'Male');
  const [category, setCategory] = useState<string>(userProfile.category || 'comedy');
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
    let finalAvatarUrl = avatarUri;
    
    try {
      if (avatarUri && avatarUri.startsWith('file://')) {
        finalAvatarUrl = await uploadToCloudinary(avatarUri, 'image', 'avatars');
      }

const result = await updateProfile({
        name: fullName,
        username: username,
        bio: bio,
        avatar: finalAvatarUrl,
        email: email || undefined,
        socialLinks: socialLinks,
        gender: gender,
        category: category,
      } as any);
      setIsSaving(false);
      
      if (result.success) {
        // Refresh feed stores to instantly reflect new profile data
        fetchReels(null);
        fetchUserReels(userProfile.id);

        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to save profile changes. Please try again.');
      }
    } catch (error: any) {
      setIsSaving(false);
      Alert.alert('Upload Error', error.message || 'Failed to upload profile picture.');
    }
  };



  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-[#12081E] pt-14">
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
               <Image source={{ uri: getDefaultAvatar(userProfile?.username || 'user') }} className="w-full h-full" resizeMode="cover" />
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
     <View className="mb-4">
          <Text className="text-white/60 text-[9px] font-bold uppercase tracking-widest pl-1 mb-2">PHONE NUMBER</Text>
          <View className="bg-[#1A0E2C] border border-white/5 rounded-2xl flex-row items-center justify-between px-4 h-[52px]">
            <Text className="text-white font-medium text-sm">{userProfile.phone || 'Not set'}</Text>
         <Pressable
              onPress={() => router.push('/(auth)/change-phone-otp')}
            >
              <Text className="text-[#EC4899] text-xs font-bold">CHANGE</Text>
            </Pressable>
          </View>
        </View>
      <InputField label="BIO" value={bio} onChange={setBio} multiline />

      {/* Gender */}
        <View className="mb-4">
          <Text className="text-white/60 text-[9px] font-bold uppercase tracking-widest pl-1 mb-2">GENDER</Text>
          <View className="flex-row gap-2">
            {['Male', 'Female', 'Other'].map((item) => {
              const isLocked = !!userProfile.gender;
              return (
                <Pressable
                  key={item}
                  onPress={() => { if (!isLocked) setGender(item); }}
                  disabled={isLocked}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: gender === item ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)',
                    borderWidth: 1,
                    borderColor: gender === item ? '#EC4899' : 'rgba(255,255,255,0.08)',
                    opacity: isLocked && gender !== item ? 0.4 : 1,
                  }}
                >
                  <Text className="text-xs font-bold" style={{ color: gender === item ? '#fff' : 'rgba(255,255,255,0.4)' }}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
          {!!userProfile.gender && (
            <Text className="text-white/30 text-[10px] mt-2 pl-1">Gender can only be set once and cannot be changed later.</Text>
          )}
        </View>

        {/* Creator Category */}
        <View className="mb-4">
          <Text className="text-white/60 text-[9px] font-bold uppercase tracking-widest pl-1 mb-2">CREATOR CATEGORY</Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              { value: 'comedy', label: 'Comedy' },
              { value: 'motivation', label: 'Motivation' },
              { value: 'dance', label: 'Dance' },
              { value: 'gaming', label: 'Gaming' },
              { value: 'fashion', label: 'Fashion' },
            ].map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: category === cat.value ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)',
                  borderWidth: 1,
                  borderColor: category === cat.value ? '#EC4899' : 'rgba(255,255,255,0.08)',
                }}
              >
                <Text className="text-xs font-semibold" style={{ color: category === cat.value ? '#fff' : 'rgba(255,255,255,0.4)' }}>{cat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Social Links Section */}
        <View className="mb-4 mt-2">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white/60 text-[9px] font-bold uppercase tracking-widest pl-1">Social Links (Max 3)</Text>
            {socialLinks.length < 3 && (
              <Pressable onPress={() => setSocialLinks([...socialLinks, { title: '', url: '' }])} className="px-2 py-1 bg-white/10 rounded">
                <Text className="text-white text-[10px] font-bold">+ ADD LINK</Text>
              </Pressable>
            )}
          </View>
          
          {socialLinks.map((link, index) => (
            <View key={index} className="bg-[#1A0E2C] border border-white/5 rounded-2xl p-3 mb-2">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white text-xs font-bold">Link {index + 1}</Text>
                <Pressable onPress={() => {
                  const newLinks = [...socialLinks];
                  newLinks.splice(index, 1);
                  setSocialLinks(newLinks);
                }}>
                  <Text className="text-red-400 text-xs font-bold">Remove</Text>
                </Pressable>
              </View>
              <TextInput
                value={link.title}
                onChangeText={(text) => {
                  const newLinks = [...socialLinks];
                  newLinks[index].title = text;
                  setSocialLinks(newLinks);
                }}
                placeholder="Title (e.g. YouTube)"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                className="text-white font-medium text-sm border-b border-white/10 pb-2 mb-2"
              />
              <TextInput
                value={link.url}
                onChangeText={(text) => {
                  const newLinks = [...socialLinks];
                  newLinks[index].url = text;
                  setSocialLinks(newLinks);
                }}
                placeholder="URL (e.g. https://youtube.com/...)"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                className="text-white font-medium text-sm"
                autoCapitalize="none"
              />
            </View>
          ))}
        </View>

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
