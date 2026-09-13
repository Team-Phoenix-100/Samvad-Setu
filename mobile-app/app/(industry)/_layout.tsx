import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Compass, Layers, Award, UserCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function IndustryTabLayout() {
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
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        }
      }}>
      
      <Tabs.Screen
        name="home"
        options={{
          title: 'CSR Hub',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="browse"
        options={{
          title: 'Explore & Fund',
          tabBarIcon: ({ color, focused }) => (
            <Compass size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Tracking',
          tabBarIcon: ({ color, focused }) => (
            <Layers size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="handover"
        options={{
          title: 'Certification',
          tabBarIcon: ({ color, focused }) => (
            <Award size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <UserCircle size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      
    </Tabs>
  );
}
