import React, { useState } from 'react';
import { View, Text, Pressable, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useFeedStore, useAuthStore } from '../../store';
import { ChevronLeft, Compass, Sparkles, Navigation, ChevronRight, Check } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as Location from 'expo-location';

const FALLBACK_CITIES = [
  { name: 'Indore', lat: 22.7196, lon: 75.8577, label: '🌾 Indore' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, label: '🚀 Bengaluru' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, label: '🎬 Mumbai' },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025, label: '🏰 Delhi' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, label: '🎨 Kolkata' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, label: '🌊 Chennai' },
];

export default function LocationScreen() {
  const { setGPS, setNearbyEnabled } = useFeedStore();
  const { updateProfile } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const requestGPS = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Degrade gracefully and render manual list
        setShowFallback(true);
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Query geo-coder to find city name
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const cityName = address?.city || address?.subregion || 'Bengaluru';
      
      // Persist to store
      setGPS(location.coords.latitude, location.coords.longitude, cityName);
      setNearbyEnabled(true);
      updateProfile({ city: cityName });

      setIsLoading(false);
      // Route smoothly to permission checklist after render cycle
      setTimeout(() => {
        router.push('/(auth)/permissions');
      }, 0);

    } catch {
      console.warn("GPS Request Failed. Directing to fallback lists.");
      setShowFallback(true);
      setIsLoading(false);
    }
  };

  const handleSelectCity = (city: typeof FALLBACK_CITIES[0]) => {
    setSelectedCity(city.name);
    setGPS(city.lat, city.lon, city.name);
    setNearbyEnabled(true);
    updateProfile({ city: city.name });
  };

  const handleNext = () => {
    if (!selectedCity) return;
    setTimeout(() => {
      router.push('/(auth)/permissions');
    }, 0);
  };

  return (
    <View className="flex-1 bg-[#0B001A] justify-between py-8 px-6" style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
      
      {/* Top Navigation Row */}
      <View className="flex-row items-center justify-between w-full h-12">
     <Pressable 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/interests');
            }
          }}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/5 items-center justify-center active:scale-[0.9]"
        >
          <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
        <View className="flex-row items-center space-x-1.5 bg-primary-pink/15 px-3 py-1.5 rounded-full border border-primary-pink/20">
          <Sparkles size={11} color="#EC4899" />
          <Text className="text-primary-pink text-[9px] font-black uppercase tracking-wider">Step 3 of 4</Text>
        </View>
      </View>

      {/* Center Radar Visuals & Fallbacks */}
      <View className="flex-1 justify-center my-4 items-center">
        
        {!showFallback ? (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400 }}
            className="items-center space-y-6"
          >
            <View className="relative w-40 h-40 items-center justify-center">
              {/* Radar pulse rings */}
              <MotiView
                from={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ loop: true, type: 'timing', duration: 2000 }}
                className="absolute w-24 h-24 rounded-full border-2 border-primary-pink/30 bg-primary-pink/5"
              />
              <MotiView
                from={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ loop: true, type: 'timing', duration: 2000, delay: 500 }}
                className="absolute w-24 h-24 rounded-full border-2 border-primary-purple/30 bg-primary-purple/5"
              />
              
              {/* Center Radar emblem */}
              <View className="w-24 h-24 bg-gradient-to-tr from-primary-purple via-[#8B5CF6] to-primary-pink p-[2px] rounded-full shadow-2xl shadow-primary-purple/40 items-center justify-center">
                <View className="w-full h-full bg-[#110125] rounded-full items-center justify-center">
                  <Compass size={36} color="#EC4899" className="animate-spin" />
                </View>
              </View>
            </View>

            <View className="space-y-2 items-center">
              <Text className="text-white font-black text-2xl tracking-tight text-center px-4">
                Hyperlocal Setup
              </Text>
              <Text className="text-white/50 text-xs text-center leading-5 px-8">
                Configure your feed based on creators nearby. Discover local stories, talents, and trends.
              </Text>
            </View>

            <Pressable
              onPress={requestGPS}
              disabled={isLoading}
              className="bg-primary-pink py-4 px-8 rounded-full items-center justify-center flex-row space-x-2 active:scale-[0.98] shadow-lg shadow-primary-pink/40"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Navigation size={14} color="#FFFFFF" strokeWidth={3} fill="#FFFFFF" />
                  <Text className="text-white text-xs font-black uppercase tracking-wider">Auto-detect Location</Text>
                </>
              )}
            </Pressable>

            <Pressable onPress={() => setShowFallback(true)} className="py-2 active:opacity-75">
              <Text className="text-white/40 text-xs font-semibold hover:underline">Select City Manually</Text>
            </Pressable>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="w-full space-y-4"
          >
            <View className="space-y-1">
              <Text className="text-white font-black text-2xl tracking-tight">Select City</Text>
              <Text className="text-white/50 text-xs">GPS is disabled. Choose one of our main hubs to configure your feed.</Text>
            </View>

            {/* Manual fallback grid */}
            <View className="flex-row flex-wrap gap-2 py-2">
              {FALLBACK_CITIES.map((city) => {
                const isSelected = selectedCity === city.name;
                return (
                  <Pressable
                    key={city.name}
                    onPress={() => handleSelectCity(city)}
                    style={{ width: '48%' }}
                    className={`p-4 rounded-2xl border flex-row justify-between items-center active:scale-[0.96] transition-all h-14 ${
                      isSelected 
                        ? 'bg-primary-purple/20 border-primary-pink/80 shadow-md shadow-primary-pink/10' 
                        : 'bg-[#190C2C]/50 border-white/5'
                    }`}
                  >
                    <Text className="text-white font-bold text-xs">{city.label}</Text>
                    {isSelected && (
                      <MotiView
                        from={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 rounded-full bg-primary-pink items-center justify-center"
                      >
                        <Check size={8} color="#FFFFFF" strokeWidth={5} />
                      </MotiView>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </MotiView>
        )}

      </View>

      {/* Footer Navigation CTA */}
      <View className="w-full">
        {showFallback && (
          <Pressable
            onPress={handleNext}
            disabled={!selectedCity}
            className={`py-4 rounded-2xl items-center justify-center flex-row space-x-2 transition-all ${
              selectedCity
                ? 'bg-primary-purple active:scale-[0.98] shadow-lg shadow-primary-purple/40'
                : 'bg-white/5 border border-white/5 opacity-55'
            }`}
          >
            <Text className="text-white text-sm font-bold uppercase tracking-wider">
              {selectedCity ? 'Continue to Permissions' : 'Select a City'}
            </Text>
            {selectedCity && <ChevronRight size={16} color="#FFFFFF" strokeWidth={3} />}
          </Pressable>
        )}
      </View>

    </View>
  );
}
