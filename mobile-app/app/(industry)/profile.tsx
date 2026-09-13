import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Building2, ShieldCheck, Mail, Phone, LogOut, Award, 
  Palette, FileCheck, CheckCircle2 
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useTheme, ThemeSelector } from '../../context/ThemeContext';

export default function IndustryProfileScreen() {
  const router = useRouter();
  const { user, fetchProfile, isLoading, logout } = useAuthStore() as any;
  const { showToast } = useToastStore();
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast("Successfully logged out!", "success");
    router.replace('/(auth)/login');
  };

  if (isLoading && !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.citizenPrimary} />
        <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading corporate profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            Corporate Profile
          </Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 3 }}>
            CSR compliance credentials, audit records & platform display settings
          </Text>
        </View>

        {/* Corporate Card */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 22,
          alignItems: 'center',
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.2 : 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}>
          <View style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            backgroundColor: theme.surface,
            borderWidth: 2,
            borderColor: theme.citizenPrimary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}>
            <Building2 size={36} color={theme.citizenPrimary} />
          </View>

          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 4 }}>
            {user?.companyName || 'Tata Steel Foundation'}
          </Text>
          <Text style={{ fontSize: 12, color: theme.subtext, textAlign: 'center', marginBottom: 12 }}>
            Empanelled CSR Implementing Agency • MCA Govt. of India
          </Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? 'rgba(232, 163, 61, 0.15)' : 'rgba(203, 125, 24, 0.12)',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(232, 163, 61, 0.3)' : 'rgba(203, 125, 24, 0.25)',
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            gap: 6,
          }}>
            <ShieldCheck size={14} color={theme.citizenPrimary} />
            <Text style={{ color: theme.citizenPrimary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              MCA Section 135 Compliant
            </Text>
          </View>

          {/* Metrics Strip */}
          <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: theme.borderSubtle, marginTop: 20, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.citizenPrimary }}>₹4.5L</Text>
              <Text style={{ fontSize: 11, color: theme.subtext, marginTop: 2 }}>Committed</Text>
            </View>
            <View style={{ height: 30, width: 1, backgroundColor: theme.borderSubtle }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.authorityPrimary }}>08</Text>
              <Text style={{ fontSize: 11, color: theme.subtext, marginTop: 2 }}>Sponsored</Text>
            </View>
            <View style={{ height: 30, width: 1, backgroundColor: theme.borderSubtle }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.accent }}>12.4k</Text>
              <Text style={{ fontSize: 11, color: theme.subtext, marginTop: 2 }}>Beneficiaries</Text>
            </View>
          </View>
        </View>

        {/* Theme Mode Selector */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 18,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Palette size={18} color={theme.citizenPrimary} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text }}>
              Display Theme Mode
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.subtext, marginBottom: 14 }}>
            Choose between Light Mode, Dark Mode, or auto-sync with your device system preferences.
          </Text>
          <ThemeSelector />
        </View>

        {/* CSR Registration Details */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          <View style={{ backgroundColor: theme.surface, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <Text style={{ color: theme.text, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
              Corporate Registration
            </Text>
          </View>
          <View style={{ padding: 18, gap: 16 }}>
            <View>
              <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 }}>CSR-1 Registration Number</Text>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', fontFamily: 'monospace' }}>
                {user?.regId || 'CSR00018492 (Ministry of Corporate Affairs)'}
              </Text>
            </View>

            <View>
              <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 }}>Authorized Representative</Text>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>
                {user?.name || 'Sourav Mukherjee (Head CSR Operations)'}
              </Text>
            </View>

            <View>
              <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 }}>Official Communication</Text>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>
                {user?.email || 'csr.initiatives@tatasteel.com'}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 14 }}>
            <Text style={{ color: theme.error, fontSize: 14, fontWeight: '800', marginBottom: 2 }}>Sign Out</Text>
            <Text style={{ color: theme.subtext, fontSize: 12 }}>Terminate corporate session.</Text>
          </View>
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.errorBg, borderWidth: 1, borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.25)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}
          >
            <LogOut size={16} color={theme.error} style={{ marginRight: 6 }} />
            <Text style={{ color: theme.error, fontSize: 13, fontWeight: '700' }}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
