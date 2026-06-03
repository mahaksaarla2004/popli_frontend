import React, { useState } from 'react';
import { View, Text, TextInput, Image, Pressable, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { User, Lock, Eye, EyeOff, Play } from 'lucide-react-native';
import { MotiView } from 'moti';

export default function LoginScreen() {
  const router = useRouter();
  const { setLogin, setFirstLogin, mockRegisteredUsers } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const [accountNotFound, setAccountNotFound] = useState(false);

  const handleLogin = () => {
    const newErrors: typeof errors = {};

    const identTrimmed = identifier.trim();
    if (!identTrimmed) {
      newErrors.identifier = 'Please enter phone, email or username.';
    } else if (/^\d+$/.test(identTrimmed)) {
      if (identTrimmed.length !== 10) {
        newErrors.identifier = 'Phone number must be exactly 10 digits.';
      }
    } else if (identTrimmed.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identTrimmed)) {
        newErrors.identifier = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setAccountNotFound(false);
    
    // TODO: Replace with actual API check
    // Simulating user not found error for demo purposes
    const isMockRegistered = mockRegisteredUsers?.includes(identTrimmed.toLowerCase());
    if (identTrimmed !== 'demo@popli.com' && identTrimmed !== '9876543210' && !isMockRegistered) {
      setAccountNotFound(true);
      return;
    }

    // Simulate successful login session
    setFirstLogin(false);
    setLogin(true);
    // Note: _layout.tsx will intercept this and route to /(tabs)
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0B001A]"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
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
          className="w-full"
          style={{ gap: 24 }}
        >
          {/* Brand Logo & Headline */}
          <View className="items-center mb-2 mt-4">
            <Image 
              source={require('../../../assets/images/brand_logo.png')} 
              className="w-32 h-32 mb-1"
              resizeMode="contain"
            />
            
            <Text className="text-white font-extrabold text-base mt-1 tracking-tight text-center">{"India's creator platform"}</Text>
            <Text className="text-white/50 text-xs font-semibold mt-1">Join 10,000+ creators already earning</Text>
          </View>

          {/* Inputs section in stadium pill shape layout */}
          <View className="flex-col" style={{ gap: 14 }}>
            
            {/* Identifier Input */}
            <View className="flex-col">
              <View className={`bg-[#1D1037]/45 border rounded-2xl px-4 flex-row items-center space-x-3 h-12 ${errors.identifier ? 'border-red-500' : 'border-primary-purple/20'}`}>
                <User size={16} color="rgba(255, 255, 255, 0.4)" />
                <TextInput
                  value={identifier}
                  onChangeText={(val) => {
                    setIdentifier(val);
                    if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined }));
                  }}
                  placeholder="Phone number, Username or email"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  className="flex-1 text-white text-sm font-semibold py-2"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setAccountNotFound(false)}
                />
              </View>
              {errors.identifier && (
                <Text className="text-red-500 text-[10px] pl-1 mt-1 font-semibold">{errors.identifier}</Text>
              )}
            </View>

            {/* Password Input */}
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
                    className="flex-1 text-white text-sm font-semibold py-2"
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

          {/* Forgot password */}
          <View className="flex-row justify-end px-1 -mt-2">
            <Pressable 
              onPress={() => router.push('/(auth)/forgot-password')} 
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text className="text-primary-purple text-xs font-bold">Forgot Password?</Text>
            </Pressable>
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            className="bg-primary-purple py-4 rounded-2xl items-center justify-center shadow-lg shadow-primary-purple/40 active:scale-[0.98] transition-all"
          >
            <Text className="text-white text-base font-black tracking-wide">Login</Text>
          </Pressable>

          {/* Divider */}
          <View className="items-center mt-2 w-full">
            <View className="flex-row items-center justify-center space-x-3 w-full px-2">
              <View className="flex-1 h-[1px] bg-white/5" />
              <Text className="text-white/30 text-[9px] font-black uppercase tracking-widest">Or Connect With</Text>
              <View className="flex-1 h-[1px] bg-white/5" />
            </View>
          </View>
            
          {/* Social login buttons */}
          <View className="flex-row justify-center space-x-4 w-full">
            <Pressable 
              onPress={() => { setLogin(true); }}
              className="flex-1 flex-row bg-[#1D1037]/30 border border-white/10 py-3 rounded-2xl items-center justify-center space-x-2 h-12 active:scale-[0.97]"
            >
              <Text className="text-white text-sm font-black mr-0.5">G</Text>
              <Text className="text-white text-xs font-bold">Google</Text>
            </Pressable>
            
            <Pressable 
              onPress={() => { setLogin(true); }}
              className="flex-1 flex-row bg-[#1D1037]/30 border border-white/10 py-3 rounded-2xl items-center justify-center space-x-2 h-12 active:scale-[0.97]"
            >
              <Text className="text-white text-sm font-black mr-0.5">f</Text>
              <Text className="text-white text-xs font-bold">Facebook</Text>
            </Pressable>
          </View>

          {/* Footer links */}
          <View className="flex-row items-center justify-center space-x-1 mt-4">
            <Text className="text-white/50 text-xs">Don&apos;t have an account?</Text>
            <Pressable 
              onPress={() => router.push('/(auth)/signup')}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              className="py-1 px-1.5"
            >
              <Text className="text-primary-pink text-xs font-bold">Sign Up</Text>
            </Pressable>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
