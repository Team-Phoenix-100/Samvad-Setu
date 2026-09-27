import React from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import OfflineBanner from '../components/OfflineBanner'; // Import the banner
import { ThemeProvider } from '../context/ThemeContext'; // Import the ThemeProvider
import Toast from '../components/ui/Toast';
import ChatbotWidget from '../components/ChatbotWidget';

// Suppress yellow warning popups on the mobile screen
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <ThemeProvider>
      {/* The banner sits at the very top of the app */}
      <OfflineBanner />
      
      {/* Global Toast Message */}
      <Toast />
      
      {/* Your existing navigation stack */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(citizen)" />
        <Stack.Screen name="(government)" />
        <Stack.Screen name="(hei)" />
        <Stack.Screen name="(industry)" />
      </Stack>

      {/* Global AI Civic Assistant Chatbot */}
      <ChatbotWidget />
    </ThemeProvider>
  );
}