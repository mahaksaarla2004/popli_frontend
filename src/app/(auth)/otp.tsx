import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore, useKYCStore } from '../../store';
import { ChevronLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; type?: string; target?: string }>();
  
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

  const triggerVerification = useCallback(async () => {
    if (isVerifying || isSuccess) return;
    setIsVerifying(true);

    // Simulated network validation delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsVerifying(false);
    setIsSuccess(true);

    // Play visual success delay then route accordingly
    setTimeout(() => {
      if (isResetMode) {
        try {
          router.replace('/(auth)/create-new-password');
        } catch {
          router.replace('/create-new-password');
        }
      } else {
        setOnboardingComplete(true);
        if (params.isSignup === 'true') {
          useAuthStore.getState().setFirstLogin(true);
        } else {
          useAuthStore.getState().setFirstLogin(false);
        }
        setLogin(true); // Log the user in
        router.replace('/(tabs)');
      }
    }, 800);
  }, [isVerifying, isSuccess, isResetMode, setOnboardingComplete, setLogin, router]);

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

  const otp = otpArray;
  const isOtpComplete = otp.join('').length === otpLength;

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
          style={{ width: isEmailType ? 42 : 62, height: isEmailType ? 48 : 62 }}
          className={`bg-[#1D1037]/45 rounded-2xl items-center justify-center border-2 ${
            isFocused 
              ? 'border-primary-pink shadow-lg shadow-primary-pink/30 scale-105' 
              : isFilled 
                ? 'border-primary-purple/60' 
                : 'border-primary-purple/20'
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
          className="w-10 h-10 rounded-full bg-white/5 border border-white/5 items-center justify-center active:scale-[0.9]"
        >
          <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* 2. Main content wrapper inside ScrollView to support smooth scrolling & tap persistent */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32, paddingTop: 100 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Center Verification Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="flex-1 justify-center space-y-8"
        >
          {isSuccess ? (
            <MotiView 
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="items-center space-y-4"
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
              <View className="space-y-2">
                <Text className="text-white font-black text-3xl tracking-tight">
                  {isResetMode && isEmailType ? 'Enter Reset Code' : 'Enter OTP'}
                </Text>
                <Text className="text-white/60 text-xs leading-5">
                  {isEmailType 
                    ? `Verify the code sent to your email ${targetLabel}`
                    : `Verify your number ${targetLabel}`
                  }
                </Text>
              </View>

              {/* Passcode Box Grid Layout */}
              <View className="space-y-6">
                <View className="flex-row justify-between w-full">
                  {renderOtpBoxes()}
                </View>

                {/* Centered purple timer below OTP grid */}
                <View className="items-center">
                  <Pressable 
                    onPress={handleResendOTP} 
                    disabled={timerSeconds > 0}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text className={`text-xs font-bold ${timerSeconds > 0 ? 'text-primary-pink' : 'text-primary-pink hover:underline'}`}>
                      {timerSeconds > 0 
                        ? `Resend OTP 00:${timerSeconds < 10 ? '0' + timerSeconds : timerSeconds}` 
                        : 'Resend Verification Code'
                      }
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </MotiView>

        {/* Footer Next Button */}
        <View className="w-full mt-4" pointerEvents="box-none">
          <Pressable
            onPress={() => {
              if (isOtpComplete) {
                // Reset KYC store so it starts fresh
                useKYCStore.getState().resetKYC();
                triggerVerification();
              }
            }}
            style={{
              backgroundColor: isOtpComplete ? '#8B5CF6' : '#1D1037',
              height: 54,
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
              opacity: !isOtpComplete ? 0.5 : 1,
            }}
            className="shadow-lg shadow-primary-purple/20 active:scale-[0.98] transition-all"
            disabled={!isOtpComplete || isVerifying || isSuccess}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="color-white font-extrabold text-sm uppercase tracking-wider">
                Sign Up
              </Text>
            )}
          </Pressable>
        </View>

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
