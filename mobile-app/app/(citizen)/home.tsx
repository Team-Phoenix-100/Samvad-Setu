import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Bell, 
  GraduationCap, 
  Briefcase, 
  Sparkles,
  Layers
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext'; // Import the Theme Hook

export default function CitizenHomeScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pull dynamic theme variables
  const { theme, isDarkMode } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadTickets();
    }, [])
  );

  const loadTickets = async () => {
    try {
      const stored = await AsyncStorage.getItem('@citizen_tickets');
      if (stored) {
        setTickets(JSON.parse(stored));
      } else {
        const defaultChallenges = [
          {
            id: 'CHAL-2026-8432',
            title: 'Solar-Powered Cold Storage for Tribal Farmers',
            domain: 'Agriculture & Rural Livelihoods',
            description: 'Low-cost decentralized preservation units needed for minor forest produce in Khunti district.',
            stage: 'Claimed by University',
            status: 'Team Formed',
            assignedDept: 'AgriTech & Bioengineering',
            suggestedHEI: 'Birsa Agricultural University',
            industryPledge: 'Tata Steel CSR (Mentorship + ₹75,000 Grant)',
            location: 'Khunti, Jharkhand',
            date: '2 hrs ago'
          },
          {
            id: 'CHAL-2026-8721',
            title: 'Fluoride and Arsenic Filtration in Rural Wells',
            domain: 'Water Resources & Sanitation',
            description: 'Indigenous filtration cartridge using locally sourced clay and activated carbon.',
            stage: 'AI Validated',
            status: 'Open for HEI Claim',
            assignedDept: 'Civil & Environmental Engg',
            suggestedHEI: 'IIT (ISM) Dhanbad',
            industryPledge: null,
            location: 'Dhanbad, Jharkhand',
            date: 'Today, 8:40 AM'
          },
          {
            id: 'CHAL-2026-9012',
            title: 'Offline Multilingual STEM Kits for Rural Schools',
            domain: 'Smart Education & Skilling',
            description: 'Gamified regional language science kits for middle school students without internet.',
            stage: 'Deployed Solution',
            status: 'Pilot Successful',
            assignedDept: 'Computer Science & EdTech',
            suggestedHEI: 'IIIT Ranchi',
            industryPledge: 'Jharkhand Innovation Council',
            location: 'Ranchi, Jharkhand',
            date: 'Yesterday'
          }
        ];
        setTickets(defaultChallenges);
        await AsyncStorage.setItem('@citizen_tickets', JSON.stringify(defaultChallenges));
      }
    } catch (error) {
      console.error('Failed to load challenges', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'Deployed Solution':
        return { 
          bg: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(35, 122, 110, 0.15)', 
          border: theme.authorityPrimary, 
          color: theme.authorityPrimary, 
          icon: CheckCircle2, 
          text: 'Deployed Solution' 
        };
      case 'Claimed by University':
        return { 
          bg: isDarkMode ? 'rgba(78, 122, 255, 0.15)' : 'rgba(78, 122, 255, 0.1)', 
          border: '#4E7AFF', 
          color: '#4E7AFF', 
          icon: GraduationCap, 
          text: 'HEI Team Active' 
        };
      case 'Industry Pledged':
        return { 
          bg: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)', 
          border: '#A855F7', 
          color: '#A855F7', 
          icon: Briefcase, 
          text: 'Industry Funded' 
        };
      default:
        return { 
          bg: isDarkMode ? 'rgba(232, 163, 61, 0.15)' : 'rgba(212, 138, 34, 0.15)', 
          border: theme.citizenPrimary, 
          color: theme.citizenPrimary, 
          icon: Sparkles, 
          text: 'Open for HEI Claim' 
        };
    }
  };

  const activeCount = tickets.filter((t) => t.stage !== 'Deployed Solution').length;
  const deployedCount = tickets.filter((t) => t.stage === 'Deployed Solution').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.citizenPrimary} />}
      >
        {/* Header Branding */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 10, color: theme.subtext, letterSpacing: 1.2, fontWeight: '700' }}>
              GOVERNMENT OF JHARKHAND • DHTE
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: theme.text, marginTop: 2 }}>
              SICP Portal
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/notifications' as any)} 
            style={{ backgroundColor: theme.card, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
          >
            <Bell size={20} color={theme.citizenPrimary} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>RESEARCH IN PROGRESS</Text>
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800' }}>{activeCount}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>DEPLOYED SOLUTIONS</Text>
            <Text style={{ color: theme.authorityPrimary, fontSize: 22, fontWeight: '800' }}>{deployedCount}</Text>
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity 
          onPress={() => router.push('/(citizen)/submit-problem' as any)}
          style={{ 
            backgroundColor: theme.citizenPrimary, 
            borderRadius: 18, 
            padding: 18, 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: 24,
            shadowColor: theme.citizenPrimary,
            shadowOpacity: 0.25,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 }
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: isDarkMode ? '#0F1B1E' : '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 3 }}>
              Crowdsource Challenge
            </Text>
            <Text style={{ color: isDarkMode ? '#0F1B1E' : '#FFFFFF', fontSize: 12, fontWeight: '600', opacity: 0.85 }}>
              Submit grassroots problems for university and industry co-innovation
            </Text>
          </View>
          <View style={{ backgroundColor: isDarkMode ? 'rgba(15, 27, 30, 0.12)' : 'rgba(255, 255, 255, 0.25)', padding: 10, borderRadius: 12 }}>
            <PlusCircle size={26} color={isDarkMode ? '#0F1B1E' : '#FFFFFF'} />
          </View>
        </TouchableOpacity>

        {/* Challenges Feed Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Layers size={16} color={theme.citizenPrimary} style={{ marginRight: 6 }} />
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>My Submitted Challenges</Text>
          </View>
          <Text style={{ color: theme.subtext, fontSize: 12 }}>{tickets.length} total</Text>
        </View>

        {/* Dynamic Challenges List */}
        {tickets.length === 0 ? (
          <View style={{ backgroundColor: theme.card, padding: 32, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
            <Sparkles size={32} color={theme.citizenPrimary} style={{ marginBottom: 12 }} />
            <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700', marginBottom: 4 }}>No challenges reported yet</Text>
            <Text style={{ color: theme.subtext, fontSize: 13, textAlign: 'center' }}>
              Crowdsource problems in agriculture, education, water, or energy to initiate HEI research.
            </Text>
          </View>
        ) : (
          tickets.map((item, index) => {
            const stageStyle = getStageBadge(item.stage || 'Submitted');
            const StageIcon = stageStyle.icon;

            return (
              <TouchableOpacity 
                key={index} 
                onPress={() => router.push(`/problem/${item.id}` as any)}
                style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 14 }}
              >
                {/* Header: Title & Stage */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
                      {item.title || item.description}
                    </Text>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 11, fontWeight: '700' }}>
                      {item.domain || item.category || 'Grassroots Innovation'}
                    </Text>
                  </View>

                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: stageStyle.bg, 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: stageStyle.border 
                  }}>
                    <StageIcon size={12} color={stageStyle.color} style={{ marginRight: 4 }} />
                    <Text style={{ color: stageStyle.color, fontSize: 10, fontWeight: '800' }}>
                      {stageStyle.text}
                    </Text>
                  </View>
                </View>

                {/* Description Excerpt */}
                <Text numberOfLines={2} style={{ color: theme.subtext, fontSize: 13, marginBottom: 10, lineHeight: 18 }}>
                  {item.description}
                </Text>

                {/* HEI & Industry Match Badges */}
                <View style={{ backgroundColor: theme.background, borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: theme.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: item.industryPledge ? 4 : 0 }}>
                    <GraduationCap size={13} color={theme.authorityPrimary} style={{ marginRight: 6 }} />
                    <Text style={{ color: theme.text, fontSize: 11, fontWeight: '600' }}>
                      HEI: <Text style={{ color: theme.subtext }}>{item.suggestedHEI || 'Pending Allocation'}</Text>
                    </Text>
                  </View>
                  {item.industryPledge && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Briefcase size={13} color={theme.citizenPrimary} style={{ marginRight: 6 }} />
                      <Text style={{ color: theme.text, fontSize: 11, fontWeight: '600' }}>
                        Partner: <Text style={{ color: theme.subtext }}>{item.industryPledge}</Text>
                      </Text>
                    </View>
                  )}
                </View>

                {/* Location & Meta Footer */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPin size={12} color={theme.subtext} style={{ marginRight: 4 }} />
                    <Text style={{ color: theme.subtext, fontSize: 11 }}>{item.location || 'Jharkhand Region'}</Text>
                  </View>
                  <Text style={{ color: theme.subtext, fontSize: 11 }}>{item.id}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}