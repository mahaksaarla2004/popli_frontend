import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore, useKYCStore } from '../../store';
import { ChevronLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../../api/client';
import { verifyFirebaseOTP } from '../../lib/firebase';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; type?: string; target?: string; isSignup?: string }>();
  
  const isResetMode = params.mode === 'reset';
  const isEmailType = params.type === 'email';
  const otpLength = isEmailType ? 6 : 4;
  const targetLabel = params.target || '+91 987 xxx xxxx';

  const { setOnboardingComplete, setLogin } = useAuthStore();
  const [otpArray, setOtpArray] = useState<string[]>(() => Array(isEmailType ? 6 : 4).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(36);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const inputRefs = useRef<TextInput[]>([]);

  // Initialize otpArray size dynamically on mount or parameter changes
  useEffect(() => {
    setOtpArray(Array(otpLength).fill(''));
    setFocusedIndex(0);
    // Focus first input box on load
    setTimeout(() => {
      inputRefs.current[0]?.focus();
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

        // 2. Authenticate with backend using the Firebase Token
        const response = await apiClient.post('/auth/verify-firebase-token', { idToken });

        if (response.data.accessToken) {
          const { setToken, setLogin, setFirstLogin, updateProfile } = useAuthStore.getState();
          setToken(response.data.accessToken);

          const userFromBackend = response.data.user;

          // If the user already completed their profile, they are an existing user.
          // Don't overwrite their data even if they came through the Sign Up screen.
          if (userFromBackend?.isProfileComplete) {
            try {
              const fullProfileRes = await apiClient.get('/users/me', {
                headers: { Authorization: `Bearer ${response.data.accessToken}` }
              });
              const fullProfile = fullProfileRes.data;
              updateProfile({
                name: fullProfile.name || 'Popli User',
                username: fullProfile.username,
                avatar: fullProfile.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
                bio: fullProfile.bio || 'Living the life your style with your rules',
                city: fullProfile.city || '',
                category: fullProfile.category || '',
                followersCount: fullProfile.followersCount || 0,
                followingCount: fullProfile.followingCount || 0,
                giftsReceivedCount: fullProfile.giftsReceivedCount || 0,
                isVerified: fullProfile.isVerified || false
              });
            } catch (err) {
              console.error("Failed to fetch full profile", err);
              updateProfile({
                name: userFromBackend.name || 'Popli User',
                username: userFromBackend.username,
                avatar: userFromBackend.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
              });
            }
            
            setIsVerifying(false);
            setIsSuccess(true);
            setLogin(true);
            setFirstLogin(false);
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 800);
            return;
          }

          // If this was signup AND user is not complete, update their name/username
          if (params.isSignup === 'true') {
            let dobIso = undefined;
            if ((params as any).dob) {
              const parts = ((params as any).dob as string).split('/');
              if (parts.length === 3) {
                dobIso = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).toISOString();
              }
            }

            await apiClient.put('/users/me', {
              name: (params as any).name,
              username: (params as any).username,
              dob: dobIso
            }, {
              headers: { Authorization: `Bearer ${response.data.accessToken}` }
            });
            
            updateProfile({ name: (params as any).name, username: (params as any).username });
            
            setIsVerifying(false);
            setIsSuccess(true);
            setTimeout(() => {
              router.replace('/(auth)/profile-setup');
            }, 800);
            return;
          }
          
          // Existing User but profile not complete
          try {
            updateProfile({
              name: userFromBackend.name || 'Popli User',
              username: userFromBackend.username,
            });

            setIsVerifying(false);
            setIsSuccess(true);
            setLogin(true);
            setFirstLogin(false);

            setTimeout(() => {
              router.replace('/(tabs)');
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

  const handleResendOTP = () => {
    if (timerSeconds > 0) return;
    setOtpArray(Array(otpLength).fill(''));
    setTimerSeconds(36);
    setFocusedIndex(0);
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
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

  // Safe text change handler across slots
  const handleTextChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');

    // 1. Capture Paste Events (only when text length matches otpLength, and index is 0)
    if (cleanText.length === otpLength && index === 0) {
      const nextOtp = Array(otpLength).fill('');
      for (let i = 0; i < otpLength; i++) {
        nextOtp[i] = cleanText[i] || '';
      }
      setOtpArray(nextOtp);
      
      // Focus last pasted index
      const focusTarget = otpLength - 1;
      inputRefs.current[focusTarget]?.focus();
      setFocusedIndex(focusTarget);
      return;
    }

    // 2. Capture regular slot keyboard change: take ONLY the last character if multiple characters are present
    const cleanChar = cleanText.length > 0 ? cleanText[cleanText.length - 1] : '';
    const nextOtp = [...otpArray];
    nextOtp[index] = cleanChar;
    setOtpArray(nextOtp);

    // Auto-focus next slot on valid numeric typing
    if (cleanChar && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  // Backspace capture support on empty boxes
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      // If slot is empty and we have a previous slot, clear previous slot and jump focus back
      if (!otpArray[index] && index > 0) {
        const nextOtp = [...otpArray];
        nextOtp[index - 1] = '';
        setOtpArray(nextOtp);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };
  // Render individual inputs
  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < otpLength; i++) {
      const char = otpArray[i] || '';
      const isFocused = focusedIndex === i;
      const isFilled = char !== '';

      boxes.push(
        <Pressable
          key={i}
          onPress={() => {
            inputRefs.current[i]?.focus();
            setFocusedIndex(i);
          }}
          style={{ width: isEmailType ? 40 : 64, height: isEmailType ? 48 : 64 }}
          className={`bg-[#1D1037] rounded-2xl items-center justify-center border-2 ${
            isFocused 
              ? 'border-[#A78BFA] shadow-lg shadow-[#A78BFA]/30 scale-105' 
              : isFilled 
                ? 'border-[#A78BFA]/60' 
                : 'border-[#3E2B5C]'
          } active:scale-[0.97]`}
        >
          <TextInput
            ref={(ref) => {
              if (ref) inputRefs.current[i] = ref;
            }}
            value={char}
            onChangeText={(text) => handleTextChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            onFocus={() => setFocusedIndex(i)}
            keyboardType="number-pad"
            maxLength={otpLength} // allows paste expansion
            selectTextOnFocus={true}
            style={styles.otpInput}
            editable={!isVerifying && !isSuccess}
            placeholderTextColor="rgba(255, 255, 255, 0.15)"
          />
        </Pressable>
      );
    }
    return boxes;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                <View className="flex-row justify-between w-full">
                  {renderOtpBoxes()}
                </View>

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
                        ? `Resend OTP 00:${timerSeconds < 10 ? '0' + timerSeconds : timerSeconds}` 
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
                      Sign Up
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
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    padding: 0,
  },
});
