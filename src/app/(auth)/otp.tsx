import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, PressablePlatform, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
// (assuming we can just replace Pressable with TouchableOpacity inside renderOtpBoxes)
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore, useKYCStore } from '../../store';
import { getDefaultAvatar } from '../../utils';
import { ChevronLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../../api/client';
import { sendFirebaseOTP, verifyFirebaseOTP } from '../../lib/firebase';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; type?: string; target?: string; isSignup?: string; referredByCode?: string; }>();
  
  const isResetMode = params.mode === 'reset';
  const isEmailType = params.type === 'email';
  const otpLength = 4;
  const targetLabel = params.target || '+91 987 xxx xxxx';

  const { setOnboardingComplete, setLogin } = useAuthStore();
  const [otpArray, setOtpArray] = useState<string[]>(() => Array(4).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(300);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const hiddenInputRef = useRef<TextInput>(null);

  // Initialize otpArray size dynamically on mount or parameter changes
  useEffect(() => {
    setTimeout(() => {
      setOtpArray(Array(otpLength).fill(''));
      setFocusedIndex(0);
    }, 0);
    // Focus first input box on load
    setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 450);
  }, [otpLength]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const otp = otpArray;
  const isOtpComplete = otpArray.every(val => val !== '');

  const triggerVerification = useCallback(async () => {
    if (isVerifying || isSuccess) return;
    setIsVerifying(true);

    try {
      if (isOtpComplete) {
        // 1. Verify OTP with Firebase natively
        let idToken;
        try {
          idToken = await verifyFirebaseOTP(otp.join(''));
        } catch (err: any) {
          throw new Error('Invalid OTP or Firebase not configured.');
        }

        // 2. Ensure deviceId is generated and stored persistently
        let deviceId = await SecureStore.getItemAsync('deviceId');
        if (!deviceId) {
          deviceId = `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
          await SecureStore.setItemAsync('deviceId', deviceId);
        }

        // 3. Authenticate with backend using the Firebase Token
        const response = await apiClient.post('/auth/verify-firebase-token', { 
          idToken,
          deviceId,
          referredByCode: params.referredByCode,
          intent: (params as any).intent || (params.isSignup === 'true' ? 'signup' : 'login'),
          name: (params as any).name,
          username: (params as any).username,
          email: (params as any).email,
          dob: (params as any).dob
        });

        if (response.data.accessToken) {
          const { setToken, setLogin, setFirstLogin, updateProfile } = useAuthStore.getState();
          setToken(response.data.accessToken);

          if (response.data.refreshToken) {
            await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
          }

          const userFromBackend = response.data.user;

          // If the user already completed their profile, they are an existing user.
          if (userFromBackend?.isProfileComplete) {
            try {
              const fullProfileRes = await apiClient.get('/users/me', {
                headers: { Authorization: `Bearer ${response.data.accessToken}` }
              });
              const fullProfile = fullProfileRes.data;
              updateProfile({
                id: fullProfile.id,
                name: fullProfile.name || 'Popli User',
                username: fullProfile.username,
                avatar: fullProfile.avatar || getDefaultAvatar(fullProfile.username),
                bio: fullProfile.bio || 'Living the life your style with your rules',
                city: fullProfile.city || '',
                category: fullProfile.category || '',
                followersCount: fullProfile.followersCount || 0,
                followingCount: fullProfile.followingCount || 0,
                giftsReceivedCount: fullProfile.giftsReceivedCount || 0,
                isVerified: fullProfile.isVerified || false
              });
            } catch (err) {
              updateProfile({
                id: userFromBackend.id,
                name: userFromBackend.name || 'Popli User',
                username: userFromBackend.username,
                avatar: userFromBackend.avatar || getDefaultAvatar(userFromBackend.username),
              });
            }
            
            setIsVerifying(false);
            setIsSuccess(true);
            setTimeout(() => {
              setLogin(true);
              setFirstLogin(false);
              router.replace('/(tabs)');
            }, 800);
            return;
          }

          // Existing User but profile not complete
          try {
            updateProfile({
              id: userFromBackend.id,
              name: userFromBackend.name || 'Popli User',
              username: userFromBackend.username,
            });

            setIsVerifying(false);
            setIsSuccess(true);

            setTimeout(() => {
              setLogin(true);
              setFirstLogin(false);
              router.replace('/(auth)/profile-setup');
            }, 800);
          } catch (profileError) {
            console.error('Failed to process user profile:', profileError);
            setIsVerifying(false);
            alert('Failed to load profile. Please try again.');
          }
        }
      }
    } catch (e: any) {
      setIsVerifying(false);
      console.error('OTP Verification Error:', e.response?.data || e.message);
      const errorMessage = typeof e.response?.data?.message === 'string' 
        ? e.response.data.message 
        : (e.response?.data?.message?.[0] || e.message || 'Invalid OTP. Please try again.');
      alert(errorMessage);
    }
  }, [isVerifying, isSuccess, isOtpComplete, otp, params]);

  const handleResendOTP = async () => {
    if (timerSeconds > 0) return;
    try {
      await sendFirebaseOTP(params.target as string);
      setOtpArray(Array(otpLength).fill(''));
      setTimerSeconds(300);
      setFocusedIndex(0);
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 100);
    } catch (err: any) {
      alert('Failed to resend OTP');
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      try {
        router.replace('/(auth)/login');
      } catch {
        router.replace('/login');
      }
    }
  };

  // Single text change handler
  const handleTextChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, otpLength);
    
    const nextOtp = Array(otpLength).fill('');
    for (let i = 0; i < cleanText.length; i++) {
      nextOtp[i] = cleanText[i];
    }
    setOtpArray(nextOtp);
    setFocusedIndex(Math.min(cleanText.length, otpLength - 1));
  };
  // Render visual boxes + single hidden input
  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < otpLength; i++) {
      const char = otpArray[i] || '';
      const isFilled = char !== '';
      const isFocused = focusedIndex === i;

      boxes.push(
        <View
          key={i}
          style={{ 
            flex: 1,
            marginHorizontal: 4,
            height: 56,
            backgroundColor: '#1D1037',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: isFocused ? '#A78BFA' : isFilled ? 'rgba(167, 139, 250, 0.6)' : '#3E2B5C',
            transform: isFocused ? [{ scale: 1.05 }] : [{ scale: 1 }]
          }}
        >
          <Text style={styles.otpInputText}>{char}</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity activeOpacity={1} onPress={() => hiddenInputRef.current?.focus()} style={{ width: '100%', position: 'relative' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }} pointerEvents="none">
          {boxes}
        </View>
        <TextInput
          ref={hiddenInputRef}
          value={otpArray.join('')}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          inputMode="numeric"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={otpLength}
          style={styles.hiddenInput}
          editable={!isVerifying && !isSuccess}
          caretHidden={true}
        />
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-[#0B001A]"
    >
      {/* 1. Header completely isolated outside main body container for zIndex safety */}
      <View 
        className="absolute top-12 left-6 right-6 h-12 flex-row items-center justify-between"
        style={{ zIndex: 999, elevation: 999 }}
        pointerEvents="box-none"
      >
        <Pressable 
          onPress={handleBack}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={({ pressed }) => ({ 
            opacity: pressed ? 0.6 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }]
          })}
          className="w-11 h-11 rounded-full bg-[#2D1B4E] items-center justify-center active:scale-[0.9]"
        >
          <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* 2. Main content wrapper inside ScrollView to support smooth scrolling & tap persistent */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32, paddingTop: 40 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Center Verification Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="flex-1 justify-center gap-8"
        >
          {isSuccess ? (
            <MotiView 
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="items-center gap-4"
            >
              <View className="w-18 h-18 bg-[#10B981]/20 border border-[#10B981]/30 rounded-full items-center justify-center">
                <Text className="text-[#10B981] text-3xl font-bold">✓</Text>
              </View>
              <Text className="text-white font-black text-2xl tracking-tight">Code Verified!</Text>
              <Text className="text-white/60 text-xs text-center px-8">
                {isResetMode ? 'Setting up secure password reset...' : 'Creating your custom creator profile...'}
              </Text>
            </MotiView>
          ) : (
            <>
              <View className="gap-2 mb-2">
                <Text className="text-white font-bold text-[28px] tracking-tight">
                  {isResetMode && isEmailType ? 'Enter Reset Code' : 'Enter OTP'}
                </Text>
                <Text className="text-white/60 text-[14px] mt-1">
                  {isEmailType 
                    ? `Verify the code sent to your email ${targetLabel}`
                    : `Verify your number ${targetLabel}`
                  }
                </Text>
              </View>

                {/* Passcode Box Grid Layout */}
                <View className="gap-6">
                  {renderOtpBoxes()}

                {/* Centered purple timer below OTP grid */}
                <View className="items-center mt-4">
                  <Pressable 
                    onPress={handleResendOTP} 
                    disabled={timerSeconds > 0}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text className={`text-[13px] font-bold ${timerSeconds > 0 ? 'text-[#A78BFA]' : 'text-[#A78BFA] hover:underline'}`}>
                      {timerSeconds > 0 
                        ? `Resend OTP in ${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}` 
                        : 'Resend Verification Code'
                      }
                    </Text>
                  </Pressable>
                </View>
              </View>
              
              {/* Footer Next Button */}
              <View className="w-full mt-8" pointerEvents="box-none">
                <Pressable
                  onPress={() => {
                    if (isOtpComplete) {
                      // Reset KYC store so it starts fresh
                      useKYCStore.getState().resetKYC();
                      triggerVerification();
                    }
                  }}
                  style={{
                    backgroundColor: isOtpComplete ? '#A855F7' : '#1D1037',
                    height: 56,
                    borderRadius: 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: !isOtpComplete ? 0.5 : 1,
                  }}
                  className="shadow-lg shadow-[#A855F7]/40 active:scale-[0.98] transition-all"
                  disabled={!isOtpComplete || isVerifying || isSuccess}
                >
                  {isVerifying ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="color-white font-bold text-[16px]">
                      {params.isSignup === 'true' ? 'Sign Up' : 'Log In'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  otpInputText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    color: 'transparent',
  },
});
