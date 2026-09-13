import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ShieldCheck, User, ArrowRight, Building2, Activity, 
  Clock3, Sun, Moon, GraduationCap, Award, Compass, Sparkles 
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const portals = [
    {
      id: 'citizen',
      title: 'Citizen Portal',
      tagline: 'Public Issues & Community Reports',
      desc: 'Report civic issues, track real-time resolution SLAs, and inspect local infrastructure initiatives.',
      icon: User,
      color: theme.citizenPrimary,
      badgeBg: isDarkMode ? 'rgba(232, 163, 61, 0.15)' : 'rgba(203, 125, 24, 0.12)',
      route: '/(auth)/login',
      params: { portal: 'citizen' },
    },
    {
      id: 'hei',
      title: 'HEI & University Hub',
      tagline: 'NEP-2020 Capstone & R&D Labs',
      desc: 'Adopt municipal challenges, assign student teams (Tiers 1–4), access engineering dossiers & submit prototypes.',
      icon: GraduationCap,
      color: theme.authorityPrimary,
      badgeBg: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)',
      route: '/(auth)/login',
      params: { portal: 'hei' },
    },
    {
      id: 'industry',
      title: 'Industry & CSR Portal',
      tagline: 'MCA Section 135 Co-Innovation',
      desc: 'Explore lab solutions seeking grants, commit milestone escrow (30/40/30), and certify civic handovers.',
      icon: Award,
      color: '#A855F7',
      badgeBg: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(147, 51, 234, 0.12)',
      route: '/(auth)/login',
      params: { portal: 'industry' },
    },
    {
      id: 'authority',
      title: 'State Authority Portal',
      tagline: 'Govt. of Jharkhand • DHTE',
      desc: 'Statewide oversight, AI moderation queue, AISHE/CIN institutional verification, and cryptographic audit logs.',
      icon: Building2,
      color: theme.accent,
      badgeBg: isDarkMode ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)',
      route: '/(auth)/login',
      params: { portal: 'authority' },
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 18 }}>
      
      {/* Top Header & Theme Switcher */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <ShieldCheck size={22} color={theme.authorityPrimary} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text }}>
            Samvad-Setu
          </Text>
        </View>

        <TouchableOpacity 
          onPress={toggleTheme}
          style={{
            backgroundColor: theme.surface,
            padding: 9,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDarkMode ? <Sun size={17} color={theme.subtext} /> : <Moon size={17} color={theme.subtext} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Banner Section */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            Select Your Portal
          </Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4, lineHeight: 18 }}>
            Unified digital infrastructure connecting Citizens, Academia, Corporate CSR, and the State Government.
          </Text>
        </View>

        {/* Live System Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: theme.border }}>
            <Activity size={15} color={theme.authorityPrimary} style={{ marginBottom: 6 }} />
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700' }}>NETWORK NODES</Text>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900', marginTop: 2 }}>128 Active</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: theme.border }}>
            <Clock3 size={15} color={theme.citizenPrimary} style={{ marginBottom: 6 }} />
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700' }}>AVG. RESOLUTION</Text>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900', marginTop: 2 }}>48h SLA</Text>
          </View>
        </View>

        {/* 4 Portal Cards */}
        <View style={{ gap: 12 }}>
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <TouchableOpacity 
                key={p.id}
                activeOpacity={0.75}
                onPress={() => router.push({ pathname: p.route, params: p.params } as any)}
                style={{ 
                  backgroundColor: theme.card, 
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDarkMode ? 0.2 : 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ backgroundColor: p.badgeBg, padding: 10, borderRadius: 12 }}>
                      <Icon size={22} color={p.color} />
                    </View>
                    <View>
                      <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800' }}>
                        {p.title}
                      </Text>
                      <Text style={{ color: p.color, fontSize: 11, fontWeight: '700', marginTop: 1 }}>
                        {p.tagline}
                      </Text>
                    </View>
                  </View>
                  <ArrowRight size={18} color={p.color} style={{ marginTop: 6 }} />
                </View>

                <Text style={{ color: theme.subtext, fontSize: 12, lineHeight: 17 }}>
                  {p.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}