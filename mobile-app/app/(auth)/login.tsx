import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ActivityIndicator, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Mail, Lock, ArrowRight, ShieldCheck, Building2, 
  Sparkles, User, GraduationCap, Award 
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen() {
  const router = useRouter();
  const { portal } = useLocalSearchParams<{ portal?: string }>();
  const { login, isLoading, error } = useAuthStore();
  const { showToast } = useToastStore();
  const { theme, isDarkMode } = useTheme();

  const [selectedPortal, setSelectedPortal] = useState<'citizen' | 'hei' | 'industry' | 'authority'>(
    (portal as any) || 'citizen'
  );

  const [identifier, setIdentifier] = useState('citizen100@test.com');
  const [password, setPassword] = useState('password123');

  // Keep selectedPortal in sync with incoming route parameter
  useEffect(() => {
    if (portal && ['citizen', 'hei', 'industry', 'authority'].includes(portal)) {
      setSelectedPortal(portal as any);
    }
  }, [portal]);

  // Update default credentials whenever portal tab switches
  useEffect(() => {
    if (selectedPortal === 'authority') {
      setIdentifier('dhte.admin@jharkhand.gov.in');
      setPassword('admin123');
    } else if (selectedPortal === 'citizen') {
      setIdentifier('citizen100@test.com');
      setPassword('password123');
    } else if (selectedPortal === 'hei') {
      setIdentifier('hei.bitsindri@test.com');
      setPassword('password123');
    } else if (selectedPortal === 'industry') {
      setIdentifier('csr.tatasteel@test.com');
      setPassword('password123');
    }
  }, [selectedPortal]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      showToast('Please enter both identifier and password', 'error');
      return;
    }

    // Attempt backend authentication with portal context
    const success = await login({ 
      email: identifier.trim(), 
      password, 
      portal: selectedPortal 
    });

    if (success) {
      showToast('Successfully signed in!', 'success');
      const userRole = useAuthStore.getState().user?.role;

      if (selectedPortal === 'citizen' || userRole === 'citizen') {
        router.replace('/(citizen)/home');
      } else if (selectedPortal === 'hei' || userRole === 'hei' || userRole === 'hei_admin') {
        router.replace('/(hei)/home' as any);
      } else if (selectedPortal === 'industry' || userRole === 'industry_csr' || userRole === 'industry_admin') {
        router.replace('/(industry)/home' as any);
      } else if (selectedPortal === 'authority' || userRole === 'government_admin' || userRole === 'official') {
        router.replace('/(government)/home' as any);
      } else {
        router.replace('/(citizen)/home');
      }
    } else {
      const errorMessage = useAuthStore.getState().error || 'Invalid credentials. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const portalConfig = {
    citizen: {
      title: 'Citizen Portal Sign In',
      subtitle: 'Voice civic problems, monitor municipal progress, and view local initiatives.',
      badge: 'CITIZEN INTAKE',
      color: theme.citizenPrimary,
      icon: User,
    },
    hei: {
      title: 'HEI & University Hub',
      subtitle: 'Allocate municipal challenges to student labs, review dossiers, and submit prototypes.',
      badge: 'NEP-2020 RESEARCH HUB',
      color: theme.authorityPrimary,
      icon: GraduationCap,
    },
    industry: {
      title: 'Industry & CSR Portal',
      subtitle: 'Direct corporate capital into verified prototypes with milestone escrow under MCA Sec 135.',
      badge: 'MCA SEC 135 CSR PARTNER',
      color: '#A855F7',
      icon: Award,
    },
    authority: {
      title: 'State Authority Login',
      subtitle: 'Jharkhand DHTE Statewide Oversight, AI Moderation Queue & Cryptographic Audit Logs.',
      badge: 'DHTE STATE OFFICE',
      color: theme.accent,
      icon: Building2,
    },
  }[selectedPortal];

  const CurrentIcon = portalConfig.icon;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30, justifyContent: 'center' }}>
          
          {/* 4-way Portal Switcher Tabs */}
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: theme.surface, 
            borderRadius: 14, 
            padding: 4, 
            borderWidth: 1, 
            borderColor: theme.border,
            marginBottom: 24,
            gap: 4 
          }}>
            {[
              { id: 'citizen', label: 'Citizen', icon: User },
              { id: 'hei', label: 'HEI Hub', icon: GraduationCap },
              { id: 'industry', label: 'CSR / Ind', icon: Award },
              { id: 'authority', label: 'Govt DHTE', icon: Building2 },
            ].map((tab) => {
              const isSelected = selectedPortal === tab.id;
              const TabIcon = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setSelectedPortal(tab.id as any)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 9,
                    borderRadius: 10,
                    backgroundColor: isSelected ? theme.card : 'transparent',
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: theme.border,
                    gap: 4,
                  }}
                >
                  <TabIcon size={13} color={isSelected ? portalConfig.color : theme.subtext} />
                  <Text style={{ 
                    fontSize: 11, 
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? theme.text : theme.subtext 
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Portal Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 6, 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', 
              paddingHorizontal: 12, 
              paddingVertical: 5, 
              borderRadius: 10, 
              borderWidth: 1, 
              borderColor: theme.border, 
              marginBottom: 10 
            }}>
              <CurrentIcon size={14} color={portalConfig.color} />
              <Text style={{ color: portalConfig.color, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
                {portalConfig.badge}
              </Text>
            </View>

            <Text style={{ fontSize: 24, fontWeight: '900', color: theme.text, marginBottom: 6, textAlign: 'center' }}>
              {portalConfig.title}
            </Text>
            <Text style={{ fontSize: 12, color: theme.subtext, textAlign: 'center', lineHeight: 17, paddingHorizontal: 16 }}>
              {portalConfig.subtitle}
            </Text>
          </View>

          {error ? (
            <View style={{ backgroundColor: theme.errorBg, borderColor: theme.error, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 14 }}>
              <Text style={{ color: theme.error, fontSize: 12, textAlign: 'center', fontWeight: '600' }}>{error}</Text>
            </View>
          ) : null}

          {/* Input Card */}
          <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: theme.border }}>
            
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: theme.subtext, fontSize: 10, letterSpacing: 1, marginBottom: 6, fontWeight: '800' }}>
                EMAIL OR OFFICIAL REGISTRATION ID
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 12, paddingVertical: 11 }}>
                <Mail size={16} color={theme.subtext} style={{ marginRight: 10 }} />
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="name@organization.in"
                  placeholderTextColor={theme.subtext}
                  autoCapitalize="none"
                  style={{ flex: 1, color: theme.text, fontSize: 13 }}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.subtext, fontSize: 10, letterSpacing: 1, marginBottom: 6, fontWeight: '800' }}>
                PASSWORD
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 12, paddingVertical: 11 }}>
                <Lock size={16} color={theme.subtext} style={{ marginRight: 10 }} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.subtext}
                  secureTextEntry
                  style={{ flex: 1, color: theme.text, fontSize: 13 }}
                />
              </View>
            </View>

            {/* 1-Tap Demo Credentials Bar */}
            <TouchableOpacity
              onPress={() => {
                if (selectedPortal === 'authority') {
                  setIdentifier('dhte.admin@jharkhand.gov.in');
                  setPassword('admin123');
                } else if (selectedPortal === 'citizen') {
                  setIdentifier('citizen100@test.com');
                  setPassword('password123');
                } else if (selectedPortal === 'hei') {
                  setIdentifier('hei.bitsindri@test.com');
                  setPassword('password123');
                } else if (selectedPortal === 'industry') {
                  setIdentifier('csr.tatasteel@test.com');
                  setPassword('password123');
                }
                showToast(`Loaded ${selectedPortal.toUpperCase()} credentials`, 'success');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 9,
                backgroundColor: theme.surface,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.border,
                marginBottom: 16,
              }}>
              <Sparkles size={13} color={portalConfig.color} />
              <Text style={{ fontSize: 11, fontWeight: '800', color: portalConfig.color }}>
                Use Demo {selectedPortal.toUpperCase()} Credentials
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity 
              onPress={handleLogin} 
              disabled={isLoading}
              style={{ 
                backgroundColor: portalConfig.color, 
                borderRadius: 12, 
                paddingVertical: 14, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 8,
                shadowColor: portalConfig.color,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900' }}>
                    Access {selectedPortal.toUpperCase()} Portal
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

          </View>

          {/* Bottom Back Button */}
          <TouchableOpacity 
            onPress={() => router.replace('/')}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ color: theme.subtext, fontSize: 12, fontWeight: '600' }}>
              ← Return to Portal Selection
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}