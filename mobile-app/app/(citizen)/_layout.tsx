import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Settings as SettingsIcon, UserCircle } from 'lucide-react-native';

export default function CitizenTabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E8A33D', 
        tabBarInactiveTintColor: '#5c6d6a', // Slightly darker inactive
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F1B1E', // Very dark background
          borderTopColor: '#1D3238',
          borderTopWidth: 1,
          height: 65 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
          // Premium shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        }
      }}>
      
      {/* 🟢 VISIBLE TABS */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Problems',
          tabBarIcon: ({ color, focused }) => <LayoutDashboard size={24} color={color} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <SettingsIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <UserCircle size={24} color={color} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />

      {/* 🔴 HIDDEN TABS */}
      <Tabs.Screen name="map" options={{ href: null }} />
      <Tabs.Screen name="submit-problem" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      
    </Tabs>
  );
}