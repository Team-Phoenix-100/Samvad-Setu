import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Bot, X, Send, Sparkles, MessageSquare, ChevronDown } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../api/client';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: string;
}

export default function ChatbotWidget() {
  const { theme, isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Namaste! I am the Samvad-Setu Civic Assistant. How can I help you today?',
      isBot: true,
      timestamp: 'Just now',
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Subtle pulsing animation on the FAB
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const quickQuestions = [
    'How do I report a pothole?',
    'What is the Municipal SLA?',
    'How does university adoption work?',
    'Can I track my complaint live?',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      text: textToSend,
      isBot: false,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(`${API_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const botReply =
          data.answer ||
          data.response ||
          data.message ||
          'I received your query. You can track all live resolutions directly in the Citizen Dashboard.';
        setMessages((prev) => [
          ...prev,
          { text: botReply, isBot: true, timestamp: 'Just now' },
        ]);
      } else {
        throw new Error('API returned status ' + res.status);
      }
    } catch (err) {
      // Smart contextual fallback answer
      let fallbackText =
        'I am here to guide you with Samvad-Setu. You can report civic problems (potholes, water leaks, electrical hazards) with photos and GPS. Municipal teams resolve them based on strict SLAs (48h to 14 days).';
      
      if (textToSend.toLowerCase().includes('sla') || textToSend.toLowerCase().includes('time')) {
        fallbackText =
          'Municipal SLA windows are dynamically calculated: Critical Hazards (48h), Urgent issues (72h), Medium priority (7 days), and Low priority (14 days). If unaddressed, issues auto-escalate to university engineering labs.';
      } else if (textToSend.toLowerCase().includes('university') || textToSend.toLowerCase().includes('hei')) {
        fallbackText =
          'When municipal corporations cannot resolve complex infrastructure challenges, our AI Engine automatically routes the ticket to partner HEIs (like BIT Sindri & Ranchi University) as student Capstone R&D projects.';
      }

      setMessages((prev) => [
        ...prev,
        { text: fallbackText, isBot: true, timestamp: 'Just now' },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 85,
          right: 18,
          zIndex: 999,
          transform: [{ scale: pulseAnim }],
        }}
      >
        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          activeOpacity={0.85}
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: theme.citizenPrimary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.citizenPrimary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
            borderWidth: 2,
            borderColor: isDarkMode ? '#1D3238' : '#FFF',
          }}
        >
          <Bot size={26} color="#0F1B1E" />
        </TouchableOpacity>
      </Animated.View>

      {/* Chatbot Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              height: '80%',
              backgroundColor: theme.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: theme.card,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(232, 163, 61, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(232, 163, 61, 0.3)',
                  }}
                >
                  <Bot size={22} color={theme.citizenPrimary} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
                    Civic AI Assistant
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 3.5,
                        backgroundColor: '#2F9E8F',
                      }}
                    />
                    <Text style={{ fontSize: 11, color: '#2F9E8F', fontWeight: '600' }}>
                      Online • Samvad-Setu Brain
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: theme.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Quick Suggestion Chips */}
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: theme.background,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {quickQuestions.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSend(q)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: theme.surface,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600' }}>
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Messages ScrollView */}
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1, padding: 16 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg, i) => (
                <View
                  key={i}
                  style={{
                    alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '82%',
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: msg.isBot ? theme.card : theme.citizenPrimary,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 18,
                      borderTopLeftRadius: msg.isBot ? 4 : 18,
                      borderTopRightRadius: msg.isBot ? 18 : 4,
                      borderWidth: msg.isBot ? 1 : 0,
                      borderColor: theme.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        lineHeight: 19,
                        color: msg.isBot ? theme.text : '#0F1B1E',
                        fontWeight: msg.isBot ? '400' : '600',
                      }}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}

              {isLoading && (
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: theme.card,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 18,
                    borderTopLeftRadius: 4,
                    borderWidth: 1,
                    borderColor: theme.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <ActivityIndicator size="small" color={theme.citizenPrimary} />
                  <Text style={{ fontSize: 12, color: theme.subtext }}>
                    Assistant is thinking...
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Input Bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: theme.card,
                borderTopWidth: 1,
                borderTopColor: theme.border,
                gap: 10,
              }}
            >
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask civic question or resolution..."
                placeholderTextColor={theme.subtext}
                style={{
                  flex: 1,
                  backgroundColor: theme.background,
                  borderRadius: 22,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  fontSize: 13,
                  color: theme.text,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity
                onPress={() => handleSend()}
                disabled={!input.trim() || isLoading}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: input.trim() && !isLoading ? theme.citizenPrimary : theme.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={18} color={input.trim() && !isLoading ? '#0F1B1E' : theme.subtext} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
