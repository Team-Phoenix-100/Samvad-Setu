import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Building2, 
  GraduationCap, 
  PieChart, 
  Layers,
  ArrowLeft
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext'; // Import theme hook

export default function GovernmentAnalyticsScreen() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pull dynamic theme variables
  const { theme, isDarkMode } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('@citizen_tickets');
      if (stored) {
        setChallenges(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load DHTE analytics', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Analytics Computations
  const totalChallenges = challenges.length;
  const claimedByHEI = challenges.filter(c => c.stage === 'Claimed by University' || c.stage === 'Deployed Solution').length;
  const industryPledgedCount = challenges.filter(c => Boolean(c.industryPledge)).length;
  const deployedCount = challenges.filter(c => c.stage === 'Deployed Solution').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.authorityPrimary} />}
      >
        {/* Top Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ backgroundColor: theme.card, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginRight: 16 }}
          >
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 10, color: theme.subtext, letterSpacing: 1.2, fontWeight: '700' }}>
              GOVT. OF JHARKHAND • DHTE
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, marginTop: 2 }}>
              Innovation Analytics
            </Text>
          </View>
        </View>

        {/* Primary KPI Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <View style={{ width: '48%', backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>TOTAL CHALLENGES</Text>
            <Text style={{ color: theme.text, fontSize: 24, fontWeight: '800' }}>{totalChallenges}</Text>
          </View>

          <View style={{ width: '48%', backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>HEI RESEARCH TEAMS</Text>
            <Text style={{ color: '#4E7AFF', fontSize: 24, fontWeight: '800' }}>{claimedByHEI}</Text>
          </View>

          <View style={{ width: '48%', backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>CSR PARTNERSHIPS</Text>
            <Text style={{ color: '#A855F7', fontSize: 24, fontWeight: '800' }}>{industryPledgedCount}</Text>
          </View>

          <View style={{ width: '48%', backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>FIELD PROTOTYPES</Text>
            <Text style={{ color: theme.authorityPrimary, fontSize: 24, fontWeight: '800' }}>{deployedCount}</Text>
          </View>
        </View>

        {/* Thematic Domain Breakdown */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <PieChart size={16} color={theme.citizenPrimary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700' }}>Statewide Thematic Allocation</Text>
          </View>

          <View style={{ gap: 10 }}>
            {[
              { label: 'Agriculture & Rural Livelihoods', count: '40%', color: theme.citizenPrimary },
              { label: 'Water Resources & Sanitation', count: '25%', color: theme.authorityPrimary },
              { label: 'Smart Education & Skilling', count: '20%', color: '#4E7AFF' },
              { label: 'Clean Energy & Environment', count: '15%', color: '#A855F7' },
            ].map((dom, i) => (
              <View key={i}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>{dom.label}</Text>
                  <Text style={{ color: dom.color, fontSize: 12, fontWeight: '700' }}>{dom.count}</Text>
                </View>
                <View style={{ height: 6, backgroundColor: theme.background, borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                  <View style={{ width: dom.count as any, height: '100%', backgroundColor: dom.color }} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Participating Institutional Hubs */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <GraduationCap size={16} color={theme.authorityPrimary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700' }}>Key Participating Universities</Text>
          </View>

          <View style={{ gap: 8 }}>
            {[
              { name: 'Birsa Agricultural University', role: 'AgriTech & Rural Solutions Hub', projects: '12 Teams' },
              { name: 'IIT (ISM) Dhanbad', role: 'Water, Mining & Environmental Systems', projects: '9 Teams' },
              { name: 'IIIT Ranchi & BIT Mesra', role: 'Smart EdTech, AI & Digital Governance', projects: '15 Teams' },
              { name: 'NIT Jamshedpur', role: 'Infrastructure & Mechanical Prototyping', projects: '8 Teams' },
            ].map((univ, idx) => (
              <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: idx < 3 ? 1 : 0, borderBottomColor: theme.border }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>{univ.name}</Text>
                  <Text style={{ color: theme.subtext, fontSize: 11 }}>{univ.role}</Text>
                </View>
                <View style={{ backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(35, 122, 110, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: theme.authorityPrimary }}>
                  <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '700' }}>{univ.projects}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}