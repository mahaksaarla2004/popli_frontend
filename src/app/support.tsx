import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, AlertTriangle, ChevronDown, ChevronUp, Sparkles, Send } from 'lucide-react-native';
import { FAQ_LIST } from '../constants/staticData';

export default function SupportScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleRaiseTicket = async () => {
    if (!ticketSubject.trim()) return Alert.alert('Error', 'Please enter a ticket subject.');
    if (!ticketDescription.trim()) return Alert.alert('Error', 'Please describe the issue in detail.');

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500)); // Simulate sending support ticket
    setIsSubmitting(false);

    Alert.alert(
      'Ticket Created! 🎟️',
      'Your ticket has been raised. A dedicated Creator Relations manager will contact you in your Inbox within 4 hours.'
    );
    setTicketSubject('');
    setTicketDescription('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background-plum pt-12">
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-4 pb-3 border-b border-white/5 bg-background-card/15">
        <View className="flex-row items-center space-x-3">
          <Pressable onPress={() => router.back()} className="p-1">
            <ArrowLeft size={20} color="#D1D5DB" />
          </Pressable>
          <Text className="text-white font-bold text-base">Help & Support</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4 gap-6" showsVerticalScrollIndicator={false}>
        
        {/* Section 1: Support Form Card */}
        <View className="gap-4 mt-2">
          <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Raise Support Ticket</Text>
          <View className="bg-background-card/50 border border-white/5 rounded-3xl p-6 gap-6 shadow-lg shadow-primary-purple/10">
            
            <View className="gap-2">
              <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Issue Subject</Text>
              <TextInput
                value={ticketSubject}
                onChangeText={setTicketSubject}
                placeholder="Monetization, KYC issue, coin purchase fail..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                className="bg-background-dark/50 border border-white/10 text-white rounded-2xl px-4 h-12 text-xs font-semibold"
              />
            </View>

            <View className="gap-2">
              <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Detailed Description</Text>
              <TextInput
                value={ticketDescription}
                onChangeText={setTicketDescription}
                placeholder="Describe your query or issue in detail..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                multiline
                numberOfLines={4}
                className="bg-background-dark/50 border border-white/10 text-white rounded-2xl px-4 py-3.5 text-xs font-semibold leading-5 h-32"
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            <Pressable
              onPress={handleRaiseTicket}
              disabled={isSubmitting}
              className="bg-primary-purple h-12 rounded-2xl items-center justify-center shadow shadow-primary-purple/35 flex-row gap-2"
            >
              <Send size={14} color="#FFFFFF" />
              <Text className="text-white text-xs font-black uppercase tracking-wider">Raise Ticket</Text>
            </Pressable>

          </View>
        </View>

        {/* Section 2: Creator Monetization FAQs Accordions */}
        <View className="gap-4 pb-24">
          <Text className="text-white/60 text-[10px] font-bold uppercase pl-1">Creator FAQs</Text>
          <View className="gap-3">
            {FAQ_LIST.map((faq, i) => {
              const isExpanded = expandedIndex === i;
              return (
                <View 
                  key={i}
                  className="bg-background-card/40 border border-white/5 rounded-2xl overflow-hidden"
                >
                  {/* Collapsible Trigger */}
                  <Pressable 
                    onPress={() => toggleExpand(i)}
                    className="flex-row items-center justify-between p-4 bg-background-card/60"
                  >
                    <Text className="text-white text-xs font-bold flex-1 pr-4">{faq.q}</Text>
                    {isExpanded ? (
                      <ChevronUp size={16} color="#D1D5DB" />
                    ) : (
                      <ChevronDown size={16} color="#D1D5DB" />
                    )}
                  </Pressable>

                  {/* FAQ Answer Body */}
                  {isExpanded && (
                    <View className="p-4 border-t border-white/5 bg-background-plum/40">
                      <Text className="text-neutral-silver text-xs leading-5 pr-2 font-normal">
                        {faq.a}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
