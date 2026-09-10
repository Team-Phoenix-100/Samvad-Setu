import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  MapPin, 
  ChevronRight, 
  Filter, 
  LogOut, 
  BarChart2, 
  CheckCircle2, 
  Clock 
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext'; // Import the Theme Hook

const THEMATIC_DOMAINS = [
  'All',
  'Agriculture & Rural Livelihoods',
  'Water Resources & Sanitation',
  'Smart Education & Skilling',
  'Healthcare & Accessibility',
  'Environment & Clean Energy',
  'Urban & Rural Infrastructure'
];

export default function GovernmentHomeScreen() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  
  // Pull dynamic theme variables
  const { theme, isDarkMode } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadAllChallenges();
    }, [])
  );

  const loadAllChallenges = async () => {
    try {
      const stored = await AsyncStorage.getItem('@citizen_tickets');
      if (stored) {
        setChallenges(JSON.parse(stored));
      } else {
        const defaultChallenges = [
          {
            id: 'CHAL-2026-8432',
            title: 'Solar Cold Storage for Tribal Farmers',
            domain: 'Agriculture & Rural Livelihoods',
            description: 'Low-cost decentralized preservation units needed for forest produce in Khunti.',
            stage: 'Claimed by University',
            status: 'Team Formed',
            assignedDept: 'AgriTech & Bioengineering',
            suggestedHEI: 'Birsa Agricultural University',
            industryPledge: 'Tata Steel CSR',
            location: 'Khunti, Jharkhand',
            priority: 'High'
          },
          {
            id: 'CHAL-2026-8721',
            title: 'Fluoride and Arsenic Filtration in Rural Wells',
            domain: 'Water Resources & Sanitation',
            description: 'Indigenous filtration cartridge using locally sourced activated carbon.',
            stage: 'AI Validated',
            status: 'Open for HEI Claim',
            assignedDept: 'Civil & Environmental Engg',
            suggestedHEI: 'IIT (ISM) Dhanbad',
            industryPledge: null,
            location: 'Dhanbad, Jharkhand',
            priority: 'High'
          },
          {
            id: 'CHAL-2026-9012',
            title: 'Offline Multilingual STEM Kits',
            domain: 'Smart Education & Skilling',
            description: 'Gamified regional language science kits for middle school students.',
            stage: 'Deployed Solution',
            status: 'Pilot Successful',
            assignedDept: 'Computer Science & EdTech',
            suggestedHEI: 'IIIT Ranchi',
            industryPledge: 'Jharkhand Innovation Council',
            location: 'Ranchi, Jharkhand',
            priority: 'Medium'
          }
        ];
        setChallenges(defaultChallenges);
        await AsyncStorage.setItem('@citizen_tickets', JSON.stringify(defaultChallenges));
      }
    } catch (error) {
      console.error('Failed to load challenges for DHTE queue', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllChallenges();
    setRefreshing(false);
  };

  const filteredChallenges = selectedFilter === 'All'
    ? challenges
    : challenges.filter((c) => (c.domain || '').trim().toLowerCase() === selectedFilter.trim().toLowerCase());

  const openForHEICount = challenges.filter(c => c.stage === 'Submitted' || c.stage === 'AI Validated').length;
  const activeHEICount = challenges.filter(c => c.stage === 'Claimed by University' || c.stage === 'Industry Pledged').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.authorityPrimary} />}
      >
        {/* Top Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <View>
            <Text style={{ fontSize: 10, color: theme.subtext, letterSpacing: 1.2, fontWeight: '700' }}>
              GOVT. OF JHARKHAND • DHTE
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, marginTop: 2 }}>
              Innovation Control Center
            </Text>
            <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>
              Higher & Technical Education Directorate
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={() => router.push('/(government)/analytics' as any)} 
              style={{ backgroundColor: theme.card, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
            >
              <BarChart2 size={18} color={theme.authorityPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.replace('/(auth)/login' as any)} 
              style={{ backgroundColor: theme.card, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
            >
              <LogOut size={18} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Oversight Metrics Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>TOTAL CROWDSOURCED</Text>
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800' }}>{challenges.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>OPEN FOR HEI CLAIM</Text>
            <Text style={{ color: theme.citizenPrimary, fontSize: 22, fontWeight: '800' }}>{openForHEICount}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>ACTIVE HEI TEAMS</Text>
            <Text style={{ color: '#4E7AFF', fontSize: 22, fontWeight: '800' }}>{activeHEICount}</Text>
          </View>
        </View>

        {/* Thematic Domain Filter Bar */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Filter size={14} color={theme.subtext} style={{ marginRight: 6 }} />
            <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>
              FILTER BY THEMATIC DOMAIN
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {THEMATIC_DOMAINS.map((domain) => (
              <TouchableOpacity
                key={domain}
                onPress={() => setSelectedFilter(domain)}
                style={{
                  backgroundColor: selectedFilter === domain ? theme.authorityPrimary : theme.card,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: selectedFilter === domain ? theme.authorityPrimary : theme.border,
                }}
              >
                <Text style={{ color: selectedFilter === domain ? (isDarkMode ? '#0F1B1E' : '#FFFFFF') : theme.text, fontWeight: '700', fontSize: 12 }}>
                  {domain}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Challenges Moderation Queue */}
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
          Statewide Innovation Queue ({filteredChallenges.length})
        </Text>

        {filteredChallenges.length === 0 ? (
          <View style={{ backgroundColor: theme.card, padding: 30, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
           <Text style={{ color: theme.subtext, fontSize: 14 }}>{`No challenges found for "${selectedFilter}".`}</Text>
          </View>
        ) : (
          filteredChallenges.map((item, index) => {
            const isClaimed = item.stage === 'Claimed by University' || item.stage === 'Deployed Solution';

            return (
              <TouchableOpacity 
                key={index}
                onPress={() => router.push(`/problem/${item.id}` as any)}
                style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 }}>
                      {item.domain || 'Grassroots Innovation'}
                    </Text>
                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
                      {item.title || item.description}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={12} color={theme.subtext} style={{ marginRight: 4 }} />
                      <Text style={{ color: theme.subtext, fontSize: 12 }}>{item.location || 'Jharkhand Region'}</Text>
                    </View>
                  </View>

                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: isClaimed ? (isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(35, 122, 110, 0.15)') : (isDarkMode ? 'rgba(232, 163, 61, 0.15)' : 'rgba(212, 138, 34, 0.15)'), 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isClaimed ? theme.authorityPrimary : theme.citizenPrimary
                  }}>
                    {isClaimed ? (
                      <CheckCircle2 size={12} color={theme.authorityPrimary} style={{ marginRight: 4 }} />
                    ) : (
                      <Clock size={12} color={theme.citizenPrimary} style={{ marginRight: 4 }} />
                    )}
                    <Text style={{ color: isClaimed ? theme.authorityPrimary : theme.citizenPrimary, fontSize: 10, fontWeight: '800' }}>
                      {item.stage || 'AI Validated'}
                    </Text>
                  </View>
                </View>

                {/* Institutional & Partner Links */}
                <View style={{ backgroundColor: theme.background, borderRadius: 10, padding: 10, marginTop: 6, marginBottom: 8, borderWidth: 1, borderColor: theme.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: item.industryPledge ? 4 : 0 }}>
                    <GraduationCap size={13} color={theme.authorityPrimary} style={{ marginRight: 6 }} />
                    <Text style={{ color: theme.text, fontSize: 11, fontWeight: '600' }}>
                      Target HEI: <Text style={{ color: theme.subtext }}>{item.suggestedHEI || 'Pending Allocation'}</Text>
                    </Text>
                  </View>
                  {item.industryPledge && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Briefcase size={13} color="#A855F7" style={{ marginRight: 6 }} />
                      <Text style={{ color: theme.text, fontSize: 11, fontWeight: '600' }}>
                        CSR Partner: <Text style={{ color: theme.subtext }}>{item.industryPledge}</Text>
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.border }}>
                  <Text style={{ color: theme.subtext, fontSize: 11 }}>{item.id}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: '700', marginRight: 2 }}>Inspect Lifecycle</Text>
                    <ChevronRight size={14} color={theme.authorityPrimary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}