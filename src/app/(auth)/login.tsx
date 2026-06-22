import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { User, Lock, Eye, EyeOff, Play } from 'lucide-react-native';
import { MotiView } from 'moti';
import { apiClient } from '../../api/client';
import { sendFirebaseOTP } from '../../lib/firebase';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function LoginScreen() {
  const router = useRouter();
  const { setLogin, setFirstLogin } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    api?: string;
  }>({});
  const [accountNotFound, setAccountNotFound] = useState(false);

  const handleLogin = async () => {
    const newErrors: typeof errors = {};

    let identTrimmed = identifier.trim();
    if (!identTrimmed) {
      newErrors.identifier = 'Please enter your phone number.';
    } else {
      // Simple phone format validation
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(identTrimmed)) {
        newErrors.identifier = 'Please enter a valid phone number.';
      } else if (!identTrimmed.startsWith('+')) {
        // Auto-prepend +91 for Indian numbers if no country code provided
        identTrimmed = `+91${identTrimmed}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const targetPhone = identTrimmed.startsWith('+') ? identTrimmed : `+91${identTrimmed}`;
      
      // 1. Check if user exists
      const checkRes = await apiClient.post('/auth/check-user', { identifier: targetPhone });
      
      if (!checkRes.data.exists) {
        setIsLoading(false);
        Alert.alert(
          "Account Not Found", 
          "This number is not registered. Please create an account first.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Up", onPress: () => router.push('/(auth)/signup') }
          ]
        );
        return;
      }

      // Navigate directly to OTP screen
      setIsLoading(false);
      router.push({
        pathname: '/(auth)/otp',
        params: { target: identTrimmed, type: 'phone', phone: identTrimmed, intent: 'login' }
      });

    } catch (error: any) {
      setIsLoading(false);
      console.error('Login Check User Error:', error);
      setErrors({ api: error?.response?.data?.message || 'Failed to connect to server. Please try again.' });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior="padding"
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
            </View>
          </View>

          {errors.api && (
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              className="mb-6 p-4 bg-red-500/10 rounded-2xl border border-red-500/20"
            >
              <Text className="text-red-400 text-center font-outfit">{errors.api}</Text>
            </MotiView>
          )}

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className={`bg-primary-purple py-4 rounded-2xl items-center justify-center shadow-lg shadow-primary-purple/40 transition-all ${isLoading ? 'opacity-70' : 'active:scale-[0.98]'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-black tracking-wide">Login</Text>
            )}
          </Pressable>



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
