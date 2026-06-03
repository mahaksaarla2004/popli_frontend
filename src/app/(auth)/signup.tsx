import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useKYCStore, useAuthStore } from '../../store';
import { User, Phone, Lock, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { MotiView } from 'moti';

export default function SignupScreen() {
  const router = useRouter();
  const kyc = useKYCStore();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    mobile?: string;
    password?: string;
    dob?: string;
    agreeTerms?: string;
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
    if (age < 18) {
      return 'You must be at least 18 years old to create an account.';
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

  const handleSignupSubmit = () => {
    const newErrors: typeof errors = {};

    const nameTrimmed = fullName.trim();
    if (!nameTrimmed) {
      newErrors.fullName = 'Please enter your Full Name.';
    } else if (nameTrimmed.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
      newErrors.fullName = 'Name can only contain letters and spaces.';
    }

    const mobileTrimmed = mobile.trim();
    if (!mobileTrimmed) {
      newErrors.mobile = 'Please enter your mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(mobileTrimmed)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number (starting with 6-9).';
    }

    if (!password) {
      newErrors.password = 'Please enter a password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    const dobErrorMsg = validateDOB(dob.trim());
    if (dobErrorMsg) {
      newErrors.dob = dobErrorMsg;
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service & Privacy Policy.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Save details to store
    kyc.updateKYCField({
      fullName,
      fullName_reg: fullName,
    } as any);

    const { registerMockUser } = useAuthStore.getState();
    registerMockUser(mobileTrimmed);
    registerMockUser(fullName.toLowerCase().replace(/\s+/g, ''));
    
    // Route user to OTP confirmation
    router.push({
      pathname: '/(auth)/otp',
      params: { target: `+91 ${mobile}`, isSignup: 'true' }
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0B001A]"
    >
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, paddingTop: Platform.OS === 'ios' ? 60 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          className="space-y-6"
        >
          {/* Custom Header with Back Button */}
          <View className="flex-row items-center justify-between w-full pb-2">
            <Pressable 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/5 items-center justify-center active:scale-[0.9] transition-all"
            >
              <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Header titles */}
          <View className="mb-2">
            <Text className="text-white font-extrabold text-3xl tracking-tight">Create Account</Text>
            <Text className="text-white/60 text-xs font-semibold mt-1">Join the community and start sharing your vibe.</Text>
          </View>

          {/* Form Fields */}
          <View className="flex-col" style={{ gap: 14 }}>
            {/* Full Name input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/45 border rounded-2xl px-4 flex-row items-center space-x-3 h-12 ${errors.fullName ? 'border-red-500' : 'border-primary-purple/20'}`}>
                <User size={16} color="rgba(255, 255, 255, 0.4)" />
                <TextInput
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  className="flex-1 text-white text-xs font-normal py-2"
                />
              </View>
              {errors.fullName && (
                <Text className="text-red-500 text-[10px] pl-1 mt-1 font-semibold">{errors.fullName}</Text>
              )}
            </View>

            {/* Mobile Number input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/45 border rounded-2xl px-4 flex-row items-center space-x-3 h-12 ${errors.mobile ? 'border-red-500' : 'border-primary-purple/20'}`}>
                <Phone size={16} color="rgba(255, 255, 255, 0.4)" />
                <TextInput
                  value={mobile}
                  onChangeText={(val) => {
                    setMobile(val.replace(/[^0-9]/g, ''));
                    if (errors.mobile) setErrors(prev => ({ ...prev, mobile: undefined }));
                  }}
                  placeholder="+91 9876543210"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="phone-pad"
                  maxLength={10}
                  className="flex-1 text-white text-xs font-normal py-2"
                />
              </View>
              {errors.mobile && (
                <Text className="text-red-500 text-[10px] pl-1 mt-1 font-semibold">{errors.mobile}</Text>
              )}
            </View>

            {/* Password input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/45 border rounded-2xl px-4 flex-row items-center justify-between h-12 ${errors.password ? 'border-red-500' : 'border-primary-purple/20'}`}>
                <View className="flex-row items-center space-x-3 flex-1">
                  <Lock size={16} color="rgba(255, 255, 255, 0.4)" />
                  <TextInput
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    secureTextEntry={!showPassword}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    className="flex-1 text-white text-xs font-normal py-2"
                    autoCapitalize="none"
                  />
                </View>
                <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                  {showPassword ? (
                    <EyeOff size={16} color="rgba(255, 255, 255, 0.4)" />
                  ) : (
                    <Eye size={16} color="rgba(255, 255, 255, 0.4)" />
                  )}
                </Pressable>
              </View>
                {errors.password && (
                <Text className="text-red-500 text-[10px] pl-1 mt-1 font-semibold">{errors.password}</Text>
              )}
            </View>

            {/* DOB input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/45 border rounded-2xl px-4 flex-row items-center space-x-3 h-12 ${errors.dob ? 'border-red-500' : 'border-primary-purple/20'}`}>
                <User size={16} color="rgba(255, 255, 255, 0.4)" />
                <TextInput
                  value={dob}
                  onChangeText={handleDOBChange}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="number-pad"
                  maxLength={10}
                  className="flex-1 text-white text-xs font-normal py-2"
                />
              </View>
              {errors.dob && (
                <Text className="text-red-500 text-[10px] pl-1 mt-1 font-semibold">{errors.dob}</Text>
              )}
            </View>
          </View>

          {/* Terms checkbox */}
          <View className="flex-col">
            <Pressable 
              onPress={() => {
                setAgreeTerms(!agreeTerms);
                if (errors.agreeTerms) setErrors(prev => ({ ...prev, agreeTerms: undefined }));
              }}
              className="flex-row items-start space-x-3 px-1 py-1"
            >
              <View className={`w-5 h-5 rounded-md border items-center justify-center mt-0.5 ${
                agreeTerms ? 'bg-primary-pink border-primary-pink' : errors.agreeTerms ? 'border-red-500 bg-[#1D1037]/45' : 'border-white/20 bg-[#1D1037]/45'
              }`}>
                {agreeTerms && <Text className="text-white text-[10px] font-bold">✓</Text>}
              </View>
              <Text className="text-white/60 text-xs flex-1 leading-4">
                I agree to the <Text className="text-primary-pink font-semibold">Terms of Service</Text> and <Text className="text-primary-pink font-semibold">Privacy Policy</Text>.
              </Text>
            </Pressable>
            {errors.agreeTerms && (
              <Text className="text-red-500 text-[10px] pl-1 mt-1 font-semibold">{errors.agreeTerms}</Text>
            )}
          </View>

          {/* CTA Submit Button */}
          <Pressable
            onPress={handleSignupSubmit}
            className="bg-primary-purple py-4 rounded-2xl items-center justify-center shadow-lg shadow-primary-purple/40 active:scale-[0.98] transition-all"
          >
            <Text className="text-white text-sm font-bold uppercase tracking-wider">Sign Up</Text>
          </Pressable>

          {/* Social connections */}
          <View className="items-center space-y-4 pt-1">
            <View className="flex-row items-center justify-center space-x-2 w-full px-2">
              <View className="flex-1 h-[1px] bg-white/5" />
              <Text className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Or Connect With</Text>
              <View className="flex-1 h-[1px] bg-white/5" />
            </View>
            
            <View className="flex-row justify-center space-x-4 w-full">
              <Pressable 
                onPress={handleSignupSubmit}
                className="flex-1 flex-row bg-[#1D1037]/30 border border-white/10 py-3 rounded-2xl items-center justify-center space-x-2 h-12 active:scale-[0.97]"
              >
                <Text className="text-white text-sm font-black mr-0.5">G</Text>
                <Text className="text-white text-xs font-bold">Google</Text>
              </Pressable>
              
              <Pressable 
                onPress={handleSignupSubmit}
                className="flex-1 flex-row bg-[#1D1037]/30 border border-white/10 py-3 rounded-2xl items-center justify-center space-x-2 h-12 active:scale-[0.97]"
              >
                <Text className="text-white text-sm font-black mr-0.5">f</Text>
                <Text className="text-white text-xs font-bold">Facebook</Text>
              </Pressable>
            </View>

            {/* Footer Navigation */}
            <View className="flex-row items-center justify-center space-x-1 pt-2">
              <Text className="text-white/50 text-xs">Already have an account?</Text>
              <Pressable 
                onPress={() => router.push('/(auth)/login')}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                className="py-1 px-1.5"
              >
                <Text className="text-primary-pink text-xs font-bold hover:underline">Log in</Text>
              </Pressable>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
