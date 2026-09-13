import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LayoutDashboard,
  ShieldAlert,
  Building2,
  BarChart2,
  UserCircle,
  Map as MapIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGovStore } from '../../store/govStore';
import { useTheme } from '../../context/ThemeContext';

export default function GovernmentTabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  
  // Strict login guard
  const [isAuthorized, setIsAuthorized] = useState(false);
  const moderationQueue = useGovStore(state => state.moderationQueue);
  const institutions = useGovStore(state => state.institutions);

  const pendingModerationCount = moderationQueue.length;
  const pendingInstitutionsCount = institutions.filter(i => i.verificationStatus === 'pending_verification').length;

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const role = await AsyncStorage.getItem('@app_user_role');
        const token = await AsyncStorage.getItem('@app_user_token');

        // Only allow official or government_admin roles in government portal
        if (role === 'official' || role === 'government_admin') {
          setIsAuthorized(true);
        } else {
          // If accessing directly without official role, redirect to login
          setIsAuthorized(false);
          router.replace({ pathname: '/(auth)/login', params: { portal: 'authority' } } as any);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthorized(true);
      }
    };

    checkAccess();
  }, [router]);

  if (!isAuthorized) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.authorityPrimary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.authorityPrimary,
        tabBarInactiveTintColor: theme.subtext,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
          height: 62 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <LayoutDashboard size={21} color={color} />,
        }}
      />

      <Tabs.Screen
        name="moderation"
        options={{
          title: 'Moderation',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <ShieldAlert size={21} color={color} />
              {pendingModerationCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: '#C1443B',
                    borderRadius: 8,
                    minWidth: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 3,
                  }}>
                  <Text style={{ color: '#F2EFE9', fontSize: 9, fontWeight: '800' }}>
                    {pendingModerationCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="institutions"
        options={{
          title: 'Registry',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <Building2 size={21} color={color} />
              {pendingInstitutionsCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: '#E8A33D',
                    borderRadius: 8,
                    minWidth: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 3,
                  }}>
                  <Text style={{ color: '#0F1B1E', fontSize: 9, fontWeight: '800' }}>
                    {pendingInstitutionsCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <BarChart2 size={21} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'DHTE Office',
          tabBarIcon: ({ color }) => <UserCircle size={21} color={color} />,
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen
        name="map"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />

      <Tabs.Screen
        name="ticket/[id]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />

      <Tabs.Screen
        name="audit-log"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}