import React, { useState } from 'react';
import { View, Text, TextInput, Image, Pressable, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { User, Lock, Eye, EyeOff, Play } from 'lucide-react-native';
import { MotiView } from 'moti';
import { apiClient } from '../../api/client';
import { sendFirebaseOTP } from '../../lib/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const { setLogin, setFirstLogin, mockRegisteredUsers } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    api?: string;
  }>({});
  const [accountNotFound, setAccountNotFound] = useState(false);

  const handleLogin = async () => {
    const newErrors: typeof errors = {};

    const identTrimmed = identifier.trim();
    if (!identTrimmed) {
      newErrors.identifier = 'Please enter your phone number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setAccountNotFound(false);
    setIsLoading(true);

    try {
      // 1. Check if user exists
      const checkRes = await apiClient.post('/auth/check-user', { identifier: identTrimmed });
      
      if (!checkRes.data.exists) {
        // User not found -> Direct them to signup
        setIsLoading(false);
        setAccountNotFound(true);
        return;
      }

      // 2. Existing user -> Send Firebase OTP
      const targetPhone = checkRes.data.phone || identTrimmed;
      
      try {
        await sendFirebaseOTP(targetPhone);
      } catch (err: any) {
        console.error('Firebase error:', err);
        setIsLoading(false);
        setErrors({ api: 'Firebase Auth failed. Ensure native modules are configured and the phone format is correct (+91...).' });
        return;
      }

      setIsLoading(false);
      // Navigate to OTP screen
      router.push({
        pathname: '/(auth)/otp',
        params: { target: targetPhone, type: identTrimmed.includes('@') ? 'email' : 'phone', phone: targetPhone, isSignup: 'false' }
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 100, paddingTop: Platform.OS === 'ios' ? 60 : 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative radial background glows */}
        <View className="absolute top-10 left-[-40px] w-80 h-80 rounded-full bg-primary-purple/10 blur-3xl opacity-75" />
        <View className="absolute bottom-10 right-[-40px] w-80 h-80 rounded-full bg-primary-pink/5 blur-3xl opacity-70" />

        <MotiView 
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          className="w-full gap-6"
        >
          {/* Brand Logo & Headline */}
          <View className="items-center mb-2 mt-4">
            <Image 
              source={require('../../../assets/images/popli_logo.png')} 
              className="mb-1"
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
            
            <Text className="text-white font-extrabold text-base mt-1 tracking-tight text-center">{"India's creator platform"}</Text>
            <Text className="text-white/50 text-xs font-semibold mt-1">Join 10,000+ creators already earning</Text>
          </View>

          {/* Inputs section in stadium pill shape layout */}
          <View className="flex-col gap-4">
            
            {/* Identifier Input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/45 border rounded-2xl px-4 flex-row items-center gap-3 h-12 ${errors.identifier ? 'border-red-500' : 'border-primary-purple/20'}`}>
                <User size={16} color="rgba(255, 255, 255, 0.4)" />
                <TextInput
                  value={identifier}
                  onChangeText={(val) => {
                    setIdentifier(val);
                    if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined }));
                  }}
                  placeholder="Phone number"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  className="flex-1 text-white text-sm font-semibold py-2"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  onFocus={() => setAccountNotFound(false)}
                />
              </View>
              {errors.identifier && (
                <Text className="text-red-500 text-[10px] pl-1 mt-1 font-semibold">{errors.identifier}</Text>
              )}
              {errors.api && (
                <Text className="text-red-500 text-[12px] pl-1 mt-2 font-bold">{errors.api}</Text>
              )}
            </View>
          </View>

          {/* Account Not Found Error Prompt */}
          {accountNotFound && (
            <MotiView 
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex-col items-center mt-2"
            >
              <Text className="text-red-400 font-bold text-sm text-center mb-3">
                Account not found. Please try again with valid credentials or Sign up to create a new account.
              </Text>
              <Pressable
                onPress={() => router.push('/(auth)/signup')}
                className="bg-primary-pink py-3 px-6 rounded-xl w-full items-center active:scale-[0.98]"
              >
                <Text className="text-white font-black">Try again with Sign Up</Text>
              </Pressable>
            </MotiView>
          )}

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            className="bg-primary-purple py-4 rounded-2xl items-center justify-center shadow-lg shadow-primary-purple/40 active:scale-[0.98] transition-all"
          >
            <Text className="text-white text-base font-black tracking-wide">Login</Text>
          </Pressable>

          {/* Divider */}
          <View className="items-center mt-2 w-full">
            <View className="flex-row items-center justify-center gap-3 w-full px-2">
              <View className="flex-1 h-[1px] bg-white/5" />
              <Text className="text-white/30 text-[9px] font-black uppercase tracking-widest">Or Connect With</Text>
              <View className="flex-1 h-[1px] bg-white/5" />
            </View>
          </View>
            
          {/* Social login buttons */}
          <View className="flex-row justify-center gap-5 w-full mt-2">
            <Pressable 
              onPress={() => { setLogin(true); }}
              className="flex-1 flex-row bg-[#1D1037]/30 border border-white/10 py-3 rounded-2xl items-center justify-center gap-2 h-12 active:scale-[0.97]"
            >
              <Text className="text-white text-sm font-black mr-0.5">G</Text>
              <Text className="text-white text-xs font-bold">Google</Text>
            </Pressable>
            
            <Pressable 
              onPress={() => { setLogin(true); }}
              className="flex-1 flex-row bg-[#1D1037]/30 border border-white/10 py-3 rounded-2xl items-center justify-center gap-2 h-12 active:scale-[0.97]"
            >
              <Text className="text-white text-sm font-black mr-0.5">f</Text>
              <Text className="text-white text-xs font-bold">Facebook</Text>
            </Pressable>
          </View>

          {/* Footer links */}
          <View className="flex-row items-center justify-center gap-1 mt-4">
            <Text className="text-white/50 text-xs">Don&apos;t have an account?</Text>
            <Pressable 
              onPress={() => router.push('/(auth)/signup')}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              className="py-1 px-1.5"
            >
              <Text className="text-primary-purple text-xs font-bold">Sign Up</Text>
            </Pressable>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
