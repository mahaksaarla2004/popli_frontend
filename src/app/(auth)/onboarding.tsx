import React, { useState, useRef } from 'react';
import { View, Text, Image, Pressable, Dimensions, ScrollView, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { ArrowRight, Landmark, CreditCard, Sparkles, Coins, MapPin, UserPlus, Plus, ShieldCheck, Star, Zap, ArrowDownToLine, ChevronLeft } from 'lucide-react-native';
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
    <View className="flex-1 bg-[#0B001A]" style={{ flex: 1, backgroundColor: '#0B001A' }}>
      <LinearGradient 
        colors={['#2E064A', '#130422', '#0A0114']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="flex-1 justify-between py-6" style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 20 }}>
        
      {/* TOP HEADER NAVIGATION */}
      <View className="flex-row items-center justify-between w-full h-12 mt-2 z-20 px-6">
        <View className="w-10" />
        
        {currentSlide < 2 ? (
          <Pressable onPress={handleComplete} className="py-2 px-4 active:opacity-75">
            <Text className="text-white text-sm font-bold tracking-wide">Skip</Text>
          </Pressable>
        ) : (
          <View className="w-16" />
        )}
      </View>

      {/* HORIZONTAL CAROUSEL */}
      <View className="flex-1 justify-center my-1 mt-6">
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
                    className="w-full rounded-[32px] bg-[#1C1F2E] relative overflow-hidden"
                    style={{ aspectRatio: 1.15 }}
                  >
                    <Image 
                      source={require('../../../assets/images/creator_illustration.jpg')}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    
                    {/* Floating Live Badge */}
                    <View className="absolute top-4 right-4 bg-[#231A31]/90 px-3 py-1.5 rounded-full flex-row items-center gap-2 border border-white/5">
                      <View className="w-2 h-2 rounded-full bg-[#E5B5D8]" />
                      <Text className="text-white text-[10px] font-bold tracking-wider">LIVE</Text>
                    </View>

                    {/* Lower Overlay tag */}
                    <View className="absolute bottom-6 left-6 right-6 bg-[#231A31]/90 p-3 rounded-2xl border border-white/5 flex-row items-center gap-3 shadow-lg">
                      <View className="w-10 h-10 rounded-full border border-[#FDBA74] bg-[#3B2A45] items-center justify-center overflow-hidden">
                        <Image source={require('../../../assets/images/creator_illustration.jpg')} className="w-8 h-8 rounded-full" />
                      </View>
                      <View>
                        <Text className="text-white text-sm font-bold">Alex Rivera</Text>
                        <Text className="text-[#A78BFA] text-[10px] font-semibold uppercase tracking-wider mt-0.5">CREATOR TIER 1</Text>
                      </View>
                    </View>
                  </View>
                )}

                {index === 1 && (
                  <View 
                    className="w-full items-center justify-center relative"
                    style={{ aspectRatio: 1.15 }}
                  >
                    {/* Glowing background */}
                    <View className="absolute w-56 h-56 rounded-full bg-yellow-500/10 blur-3xl" />
                    <View className="absolute w-44 h-44 rounded-full bg-[#8B5CF6]/10 blur-2xl" />

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
                          }}>₹</Text>
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
                    className="w-full rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden bg-[#1C1F2E]"
                    style={{ aspectRatio: 1.15 }}
                  >
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop' }} 
                      className="w-full h-full opacity-60"
                      resizeMode="cover"
                    />

                    {/* Floating Earnings Badge */}
                    <View className="absolute top-4 right-4 bg-white/10 px-4 py-2 rounded-2xl flex-row items-center gap-3 border border-white/10 backdrop-blur-md">
                      <View className="w-8 h-8 rounded-full bg-[#10B981]/20 items-center justify-center border border-[#10B981]/30">
                        <Text className="text-[#10B981] font-bold text-xs">↗</Text>
                      </View>
                      <View>
                        <Text className="text-white/60 text-[8px] font-bold tracking-wider uppercase">Earnings</Text>
                        <Text className="text-white text-sm font-bold mt-0.5">+₹2,450.00</Text>
                      </View>
                    </View>

                    {/* Creator Mode Badge */}
                    <View className="absolute bottom-[52px] left-5 bg-[#8B5CF6] px-3 py-1 rounded-full">
                      <Text className="text-white text-[10px] font-bold tracking-wider uppercase">Creator Mode</Text>
                    </View>

                    {/* Title moved inside image */}
                    <Text className="absolute bottom-4 left-5 text-white font-black text-[28px] tracking-tight leading-[34px]">
                      Get Paid Fast
                    </Text>
                  </View>
                )}

                {/* 2. TEXT LABELS */}
                {index !== 2 && (
                  <Text className="text-white font-black text-[28px] text-center mt-8 tracking-tight px-4 leading-[34px]">
                    {slide.title}
                  </Text>
                )}
                
                {index === 0 && (
                  <View className="items-center mt-3">
                    <Text className="text-[#FDE047] font-bold text-[13px] tracking-wide mb-3">
                      {slide.subtitle}
                    </Text>
                    <View className="bg-[#231A31] border border-white/5 px-4 py-2.5 rounded-xl flex-row items-center gap-2 shadow-md">
                      <View className="w-5 h-5 rounded-md bg-[#8B5CF6]/20 items-center justify-center border border-[#8B5CF6]/40">
                        <Coins size={12} color="#A78BFA" />
                      </View>
                      <Text className="text-white/70 text-[12px] font-medium">
                        {slide.payoutText}
                      </Text>
                    </View>
                  </View>
                )}

                {index === 1 && (
                  <Text className="text-white/60 text-[13px] text-center mt-3 px-6 leading-5 font-medium">
                    {slide.subtitle}
                  </Text>
                )}

                {index === 2 && (
                  <View className="w-full mt-4 gap-4">
                    {/* Box 1 */}
                    <View className="bg-[#1C122C] border border-[#3E2B5C] py-3.5 px-5 rounded-[24px] flex-row items-center gap-5 shadow-lg">
                      <View className="w-[48px] h-[48px] rounded-[16px] bg-[#8B5CF6]/10 items-center justify-center">
                        <ArrowDownToLine size={22} color="#A78BFA" strokeWidth={2} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-[16px] font-bold tracking-wide">Withdraw Anytime</Text>
                        <Text className="text-white/50 text-[13px] leading-[20px] mt-1 font-medium pr-2">Withdraw your earnings to bank or UPI whenever you want.</Text>
                      </View>
                    </View>

                    {/* Box 2 */}
                    <View className="bg-[#1C122C] border border-[#3E2B5C] py-3.5 px-5 rounded-[24px] flex-row items-center gap-5 shadow-lg">
                      <View className="w-[48px] h-[48px] rounded-[16px] bg-[#8B5CF6]/10 items-center justify-center">
                        <Zap size={22} color="#A78BFA" strokeWidth={2} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-[16px] font-bold tracking-wide">Fast & Secure Payments</Text>
                        <Text className="text-white/50 text-[13px] leading-[20px] mt-1 font-medium pr-2">Money arrives within 24 hours. Safe and reliable payouts.</Text>
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
      <View className="w-full mb-8 px-6 mt-4">
        {currentSlide === 2 && (
          <Text className="text-white/40 text-xs text-center font-medium px-6 leading-4 mb-5">
            {SLIDES[2].subtitle}
          </Text>
        )}

        {/* Pagination Dots */}
        <View className="flex-row items-center justify-center gap-3 mb-6">
          {SLIDES.map((_, i) => {
            const dotScaleX = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [1, 2.5, 1],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.5, 1, 0.5],
              extrapolate: 'clamp',
            });
            
            const dotColor = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: ['#3A2C54', '#8B5CF6', '#3A2C54'],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  opacity: dotOpacity,
                  backgroundColor: dotColor,
                  transform: [{ scaleX: dotScaleX }],
                }}
              />
            );
          })}
        </View>

        <Pressable
          onPress={handleNext}
          className="bg-[#8B5CF6] py-4 rounded-full items-center justify-center shadow-2xl shadow-[#8B5CF6]/50 flex-row gap-2 active:scale-[0.98] transition-all"
        >
          <Text className="text-white text-[16px] font-bold tracking-wide">
            {currentSlide === 0 ? 'Start earning today' : currentSlide === 1 ? 'Next' : 'Get Started'}
          </Text>
          {currentSlide < 2 && <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />}
        </Pressable>
      </View>
    </View>
    </View>
  );
}
