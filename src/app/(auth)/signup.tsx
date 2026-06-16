import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useKYCStore, useAuthStore } from '../../store';
import { User, Phone, Lock, ChevronLeft, Eye, EyeOff, AtSign } from 'lucide-react-native';
import { MotiView } from 'moti';

import { sendFirebaseOTP } from '../../lib/firebase';
import { apiClient } from '../../api/client';

export default function SignupScreen() {
  const router = useRouter();
  const kyc = useKYCStore();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    mobile?: string;
    dob?: string;
    agreeTerms?: string;
    api?: string;
  }>({});

  const validateDOB = (dobStr: string): string | null => {
    if (!dobStr) return 'Please enter your DOB (DD/MM/YYYY).';
    const parts = dobStr.split('/');
    if (parts.length !== 3) return 'Invalid format. Use DD/MM/YYYY.';
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Invalid date characters.';
    if (month < 1 || month > 12) return 'Month must be between 01 and 12.';
    if (day < 1 || day > 31) return 'Day must be between 01 and 31.';
    if (year < 1900 || year > new Date().getFullYear()) return 'Invalid year.';
    const dateObj = new Date(year, month - 1, day);
    if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
      return 'Date does not exist in the calendar.';
    }
    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() - (month - 1);
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }
    if (age < 13) {
      return 'You must be at least 13 years old to use Popli.';
    }
    return null;
  };

  const handleDOBChange = (text: string) => {
    const prevVal = dob;
    if (prevVal.length > text.length && prevVal.endsWith('/')) {
      setDob(text);
      return;
    }
    const cleanText = text.replace(/[^0-9]/g, '');
    let formatted = '';
    if (cleanText.length <= 2) {
      formatted = cleanText;
    } else if (cleanText.length <= 4) {
      formatted = `${cleanText.slice(0, 2)}/${cleanText.slice(2)}`;
    } else {
      formatted = `${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}/${cleanText.slice(4, 8)}`;
    }
    setDob(formatted);
    if (errors.dob) setErrors(prev => ({ ...prev, dob: undefined }));
  };

  // ... (keep validateDOB and handleDOBChange intact)

  const handleSignupSubmit = async () => {
    const newErrors: typeof errors = {};

    const nameTrimmed = fullName.trim();
    if (!nameTrimmed) {
      newErrors.fullName = 'Please enter your Full Name.';
    } else if (nameTrimmed.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
      newErrors.fullName = 'Name can only contain letters and spaces.';
    }

    const usernameTrimmed = username.trim().toLowerCase();
    if (!usernameTrimmed) {
      newErrors.username = 'Please enter a username.';
    } else if (usernameTrimmed.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-z0-9_]+$/.test(usernameTrimmed)) {
      newErrors.username = 'Username can only contain lowercase letters, numbers, and underscores.';
    }

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed) {
      newErrors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = 'Please enter a valid email format.';
    }

    const mobileTrimmed = mobile.trim();
    if (!mobileTrimmed) {
      newErrors.mobile = 'Please enter your mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(mobileTrimmed)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number (starting with 6-9).';
    }



    const dobError = validateDOB(dob);
    if (dobError) {
      newErrors.dob = dobError;
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service & Privacy Policy.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const targetPhone = `+91${mobileTrimmed}`;
      
      // 1. Check if user already exists
      const checkRes = await apiClient.post('/auth/check-user', { 
        identifier: targetPhone,
        username: usernameTrimmed,
        email: emailTrimmed
      });
      
      if (checkRes.data.exists) {
        setIsLoading(false);
        if (checkRes.data.field === 'username') {
          setErrors({ username: checkRes.data.message });
        } else if (checkRes.data.field === 'email') {
          setErrors({ email: checkRes.data.message });
        } else {
          setErrors({ mobile: checkRes.data.message });
        }
        return;
      }

      // 2. Send Firebase OTP
      try {
        await sendFirebaseOTP(targetPhone);
      } catch (err) {
        console.error('Firebase error:', err);
        setIsLoading(false);
        setErrors({ api: 'Firebase Auth failed. Ensure native modules are configured.' });
        return;
      }

      setIsLoading(false);
      // Route user to OTP confirmation
      router.push({
        pathname: '/(auth)/otp',
        params: { 
          target: targetPhone, 
          isSignup: 'true',
          name: nameTrimmed,
          username: usernameTrimmed,
          email: emailTrimmed,
          phone: targetPhone,
          dob: dob,
          referredByCode: referralCode.trim(),
          intent: 'signup'
        }
      });
    } catch (error: any) {
      setIsLoading(false);
      console.error('Check User Error:', error);
      setErrors({ api: error?.response?.data?.message || 'Failed to connect to server. Please try again.' });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0B001A]"
    >
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, paddingTop: Platform.OS === 'ios' ? 60 : 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          className="gap-6"
        >
          {/* Custom Header with Back Button */}
          <View className="flex-row items-center justify-between w-full pb-4 mt-2">
            <Pressable 
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-[#2D1B4E] items-center justify-center active:scale-[0.9] transition-all"
            >
              <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Header titles */}
          <View className="mb-6">
            <Text className="text-white font-bold text-[28px] tracking-tight">Create Account</Text>
            <Text className="text-white/60 text-[14px] mt-1">Join the community and start sharing your vibe.</Text>
          </View>

          {/* Form Fields */}
          <View className="flex-col gap-4">
            {/* Full Name input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/80 border rounded-full px-5 flex-row items-center gap-4 h-14 ${errors.fullName ? 'border-red-500' : 'border-[#3E2B5C]'}`}>
                <User size={20} color="#A78BFA" strokeWidth={2} />
                <TextInput
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  className="flex-1 text-white text-[14px] py-2"
                />
              </View>
              {errors.fullName && (
                <Text className="text-red-500 text-[10px] pl-5 mt-1 font-semibold">{errors.fullName}</Text>
              )}
            </View>

            {/* Username input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/80 border rounded-full px-5 flex-row items-center gap-4 h-14 ${errors.username ? 'border-red-500' : 'border-[#3E2B5C]'}`}>
                <AtSign size={20} color="#A78BFA" strokeWidth={2} />
                <TextInput
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                  }}
                  placeholder="username_123"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="none"
                  className="flex-1 text-white text-[14px] py-2"
                />
              </View>
              {errors.username && (
                <Text className="text-red-500 text-[10px] pl-5 mt-1 font-semibold">{errors.username}</Text>
              )}
            </View>

            {/* Email input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/80 border rounded-full px-5 flex-row items-center gap-4 h-14 ${errors.email ? 'border-red-500' : 'border-[#3E2B5C]'}`}>
                <AtSign size={20} color="#A78BFA" strokeWidth={2} />
                <TextInput
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="mahaksaarla2004@gmail.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 text-white text-[14px] py-2"
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-[10px] pl-5 mt-1 font-semibold">{errors.email}</Text>
              )}
            </View>

            {/* Mobile Number input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/80 border rounded-full px-5 flex-row items-center gap-4 h-14 ${errors.mobile ? 'border-red-500' : 'border-[#3E2B5C]'}`}>
                <Phone size={20} color="#A78BFA" strokeWidth={2} />
                <TextInput
                  value={mobile}
                  onChangeText={(val) => {
                    setMobile(val.replace(/[^0-9]/g, ''));
                    if (errors.mobile) setErrors(prev => ({ ...prev, mobile: undefined }));
                  }}
                  placeholder="+91 9876543210"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="phone-pad"
                  maxLength={10}
                  className="flex-1 text-white text-[14px] py-2"
                />
              </View>
              {errors.mobile && (
                <Text className="text-red-500 text-[10px] pl-5 mt-1 font-semibold">{errors.mobile}</Text>
              )}
            </View>



            {/* DOB input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/80 border rounded-full px-5 flex-row items-center gap-4 h-14 ${errors.dob ? 'border-red-500' : 'border-[#3E2B5C]'}`}>
                <User size={20} color="#A78BFA" strokeWidth={2} />
                <TextInput
                  value={dob}
                  onChangeText={handleDOBChange}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="numeric"
                  maxLength={10}
                  className="flex-1 text-white text-[14px] py-2"
                />
              </View>
              {errors.dob && (
                <Text className="text-red-500 text-[10px] pl-5 mt-1 font-semibold">{errors.dob}</Text>
              )}
            </View>

            {/* Referral Code input */}
            <View className="flex-col">
              <View className="bg-[#1D1037]/80 border rounded-full px-5 flex-row items-center gap-4 h-14 border-[#3E2B5C]">
                <User size={20} color="#A78BFA" strokeWidth={2} />
                <TextInput
                  value={referralCode}
                  onChangeText={(val) => setReferralCode(val.toUpperCase())}
                  placeholder="Referral Code (Optional)"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="characters"
                  className="flex-1 text-white text-[14px] py-2"
                />
              </View>
            </View>
          </View>

          {/* Terms checkbox */}
          <View className="flex-col mt-5 mb-2">
            <Pressable 
              onPress={() => {
                setAgreeTerms(!agreeTerms);
                if (errors.agreeTerms) setErrors(prev => ({ ...prev, agreeTerms: undefined }));
              }}
              className="flex-row items-center gap-4 px-1"
            >
              <View className={`w-[18px] h-[18px] rounded-full border items-center justify-center ${
                agreeTerms ? 'bg-[#2D1B4E] border-[#A78BFA]' : errors.agreeTerms ? 'border-red-500 bg-[#1D1037]/45' : 'border-[#3E2B5C] bg-[#1D1037]/45'
              }`}>
                {agreeTerms && <Text className="text-[#A78BFA] text-[10px] font-bold">✓</Text>}
              </View>
              <Text className="text-white/60 text-[13px] flex-1">
                I agree to the <Text className="text-[#A78BFA]">Terms of Service</Text> and <Text className="text-[#A78BFA]">Privacy Policy</Text>.
              </Text>
            </Pressable>
            {errors.agreeTerms && (
              <Text className="text-red-500 text-[10px] pl-1 mt-1 font-semibold">{errors.agreeTerms}</Text>
            )}
          </View>

          {/* CTA Submit Button */}
          <Pressable
            onPress={handleSignupSubmit}
            className="bg-[#A855F7] h-14 mt-4 rounded-full items-center justify-center shadow-lg shadow-primary-purple/40 active:scale-[0.98] transition-all"
          >
            <Text className="text-white text-[16px] font-bold">Sign Up</Text>
          </Pressable>



            {/* Footer Navigation */}
            <View className="flex-row items-center justify-center gap-1 pt-4">
              <Text className="text-white/50 text-[14px]">Already have an account?</Text>
              <Pressable 
                onPress={() => router.push('/(auth)/login')}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                className="py-1 px-1.5"
              >
                <Text className="text-[#A78BFA] text-[14px] font-bold">Log in</Text>
              </Pressable>
            </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
