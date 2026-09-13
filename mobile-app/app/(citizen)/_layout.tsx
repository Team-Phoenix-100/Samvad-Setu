import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Settings as SettingsIcon, UserCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function CitizenTabLayout() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.citizenPrimary, 
        tabBarInactiveTintColor: theme.subtext,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          height: 65 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
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