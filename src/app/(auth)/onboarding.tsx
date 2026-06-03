import React, { useState, useRef } from 'react';
import { View, Text, Image, Pressable, Dimensions, ScrollView, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { ArrowRight, Landmark, CreditCard, Sparkles, Coins, MapPin, UserPlus, Plus, ShieldCheck, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'slide_0',
    title: 'Earn From Your First Video',
    subtitle: 'NO 10K followers required.',
    payoutText: '₹5 per 1,000 views guaranteed.',
  },
  {
    key: 'slide_1',
    title: 'How It Works',
    subtitle: 'Upload videos and get views.\nEarn money and withdraw easily.',
  },
  {
    key: 'slide_2',
    title: 'Get Paid Fast',
    subtitle: 'Withdraw minimum ₹500.\nReal money, not points or coins.',
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const { setOnboardingComplete } = useAuthStore();
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < 2) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      const prevIndex = currentSlide - 1;
      setCurrentSlide(prevIndex);
      scrollViewRef.current?.scrollTo({ x: prevIndex * width, animated: true });
    }
  };

  const handleComplete = () => {
    console.log('ONBOARDING COMPLETE');
    setOnboardingComplete(true);
    router.replace('/(auth)/login');
  };

  const onScrollEnd = (e: any) => {
    const pageIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (pageIndex !== currentSlide) {
      setCurrentSlide(pageIndex);
    }
  };

  return (
    <View className="flex-1 bg-[#0B001A] justify-between py-6" style={{ paddingTop: Platform.OS === 'ios' ? 50 : 20 }}>
      
      {/* TOP HEADER NAVIGATION */}
      <View className="flex-row items-center justify-between w-full h-12 mt-2 z-20 px-6">
        {currentSlide > 0 ? (
          <Pressable 
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/5 active:scale-[0.9]"
          >
            <Text className="text-white text-base">←</Text>
          </Pressable>
        ) : (
          <View className="w-10" />
        )}
        
        {currentSlide < 2 ? (
          <Pressable onPress={handleComplete} className="py-2 px-4 active:opacity-75">
            <Text className="text-white/60 text-sm font-semibold hover:text-white">Skip</Text>
          </Pressable>
        ) : (
          <View className="w-16" />
        )}
      </View>

      {/* HORIZONTAL CAROUSEL */}
      <View className="flex-1 justify-center my-1">
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {SLIDES.map((slide, index) => {
            const opacity = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });

            const scale = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [0.93, 1, 0.93],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={slide.key}
                style={{
                  width: width,
                  opacity,
                  transform: [{ scale }],
                }}
                className="items-center justify-center px-6"
              >
                {/* 1. VISUAL CARD PANEL */}
                {index === 0 && (
                  <View 
                    className="w-full rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
                    style={{ aspectRatio: 1.05 }}
                  >
                    <Image 
                      source={require('../../../assets/images/creator_illustration.png')} 
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    
                    {/* Floating Live Badge */}
                    <View className="absolute top-4 right-4 bg-[#EF4444] px-2.5 py-1 rounded-lg flex-row items-center space-x-1 shadow-lg">
                      <View className="w-1.5 h-1.5 rounded-full bg-white" />
                      <Text className="text-white text-[9px] font-black tracking-wider uppercase">LIVE</Text>
                    </View>

                    {/* Lower Overlay tag */}
                    <View className="absolute bottom-4 left-4 right-4 bg-[#0B001A]/85 p-3.5 rounded-2xl border border-white/10 flex-row items-center justify-between shadow-lg backdrop-blur-sm">
                      <View>
                        <Text className="text-white text-xs font-black tracking-tight">Alex Rivera</Text>
                        <Text className="text-white/45 text-[9px] font-medium uppercase tracking-wider mt-0.5">CREATOR PARTNER</Text>
                      </View>
                      <View className="bg-primary-pink/20 px-2.5 py-1 rounded-lg border border-primary-pink/30">
                        <Text className="text-primary-pink text-[9px] font-black">LEVEL 4</Text>
                      </View>
                    </View>
                  </View>
                )}

                {index === 1 && (
                  <View 
                    className="w-full items-center justify-center relative"
                    style={{ aspectRatio: 1.05 }}
                  >
                    {/* Glowing background */}
                    <View className="absolute w-56 h-56 rounded-full bg-yellow-500/10 blur-3xl" />
                    <View className="absolute w-44 h-44 rounded-full bg-primary-pink/5 blur-2xl" />

                    {/* Concentric outer ring */}
                    <View className="w-[230px] h-[230px] rounded-full border border-yellow-500/20 items-center justify-center relative">
                      
                      {/* Big Stylized Gold Coin */}
                      <LinearGradient
                        colors={['#FFFFFF', '#FDE047', '#EAB308']}
                        start={{ x: 0.8, y: 0 }}
                        end={{ x: 0.2, y: 1 }}
                        style={{
                          width: 170,
                          height: 170,
                          borderRadius: 85,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#EAB308',
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.4,
                          shadowRadius: 15,
                          elevation: 8,
                        }}
                      >
                        {/* Inner white circle */}
                        <View style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          backgroundColor: '#FFFFFF',
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#000000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 5,
                          elevation: 3,
                        }}>
                          {/* Dollar symbol to match PDF */}
                          <Text style={{
                            color: '#EAB308',
                            fontSize: 48,
                            fontWeight: '900',
                            textAlign: 'center',
                            lineHeight: 52,
                            marginTop: Platform.OS === 'ios' ? 0 : -2,
                          }}>$</Text>
                        </View>
                      </LinearGradient>

                      {/* Floating Star Badge at top-right of concentric circle */}
                      <View 
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: '#FBBF24',
                          borderWidth: 2.5,
                          borderColor: '#FDE047',
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#000000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 5,
                          elevation: 5,
                        }}
                      >
                        <Star size={18} color="#0B001A" fill="#0B001A" strokeWidth={2.5} />
                      </View>

                      {/* Floating Plus Badge at bottom-left of concentric circle */}
                      <View 
                        style={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: '#8B5CF6',
                          borderWidth: 2,
                          borderColor: '#A78BFA',
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#000000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 5,
                          elevation: 5,
                        }}
                      >
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 20,
                          fontWeight: 'bold',
                          marginTop: Platform.OS === 'ios' ? -2 : -4,
                        }}>+</Text>
                      </View>
                    </View>
                  </View>
                )}

                {index === 2 && (
                  <View 
                    className="w-full rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
                    style={{ aspectRatio: 1.05 }}
                  >
                    <Image 
                      source={require('../../../assets/images/workspace_illustration.png')} 
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                )}

                {/* 2. TEXT LABELS */}
                <Text className="text-white font-extrabold text-[26px] text-center mt-6 tracking-tight leading-8 px-4">
                  {slide.title}
                </Text>
                
                {index === 0 && (
                  <View className="items-center mt-2.5">
                    <Text className="text-yellow-400 font-extrabold text-xs uppercase tracking-widest mb-2">
                      {slide.subtitle}
                    </Text>
                    <View className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex-row items-center space-x-1.5 shadow-md">
                      <Coins size={14} color="#EC4899" fill="#EC4899" />
                      <Text className="text-white/80 text-[11px] font-bold">
                        {slide.payoutText}
                      </Text>
                    </View>
                  </View>
                )}

                {index === 1 && (
                  <Text className="text-white/50 text-xs text-center mt-2.5 px-6 leading-5 font-normal">
                    {slide.subtitle}
                  </Text>
                )}

                {index === 2 && (
                  <View className="w-full mt-4 bg-background-card border border-white/10 p-5 rounded-3xl space-y-4 shadow-lg">
                    <View className="flex-row items-start space-x-3.5">
                      <View className="w-9 h-9 rounded-xl bg-primary-purple/20 border border-primary-purple/35 items-center justify-center mt-0.5">
                        <Landmark size={16} color="#D946EF" strokeWidth={2.5} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-xs font-extrabold">Withdraw Anytime</Text>
                        <Text className="text-white/60 text-[10px] leading-4 mt-1">Withdraw your earnings to bank or UPI whenever you want.</Text>
                      </View>
                    </View>

                    <View className="flex-row items-start space-x-3.5">
                      <View className="w-9 h-9 rounded-xl bg-primary-purple/20 border border-primary-purple/35 items-center justify-center mt-0.5">
                        <ShieldCheck size={16} color="#D946EF" strokeWidth={2.5} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-xs font-extrabold">Fast & Secure Payments</Text>
                        <Text className="text-white/60 text-[10px] leading-4 mt-1">Money arrives within 24 hours. Safe and reliable payouts.</Text>
                      </View>
                    </View>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      </View>

      {/* BOTTOM PAGE FOOTER INDICATORS & PROGRESS CTAS */}
      <View className="w-full space-y-5 mb-2 px-6">
        {/* Pagination Dots */}
        <View className="flex-row items-center justify-center space-x-2">
          {SLIDES.map((_, i) => {
            const dotScaleX = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [1, 2.2, 1],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.2, 1, 0.2],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  opacity: dotOpacity,
                  transform: [{ scaleX: dotScaleX }],
                }}
                className="bg-primary-pink"
              />
            );
          })}
        </View>

        {currentSlide === 2 && (
          <Text className="text-white/50 text-xs text-center font-medium px-6 leading-4 mb-2">
            {SLIDES[2].subtitle}
          </Text>
        )}

        <Pressable
          onPress={handleNext}
          className="bg-primary-purple py-4 rounded-2xl items-center justify-center shadow-lg shadow-primary-purple/40 flex-row space-x-2 active:scale-[0.98] transition-all"
        >
          <Text className="text-white text-sm font-black tracking-wide">
            {currentSlide === 0 ? 'Start earning today' : currentSlide === 1 ? 'Next' : 'Get Started'}
          </Text>
          {currentSlide < 2 && <ArrowRight size={16} color="#FFFFFF" strokeWidth={3} />}
        </Pressable>
      </View>
    </View>
  );
}
