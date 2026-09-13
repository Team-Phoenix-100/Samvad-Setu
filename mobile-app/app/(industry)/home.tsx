import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Building2, Award, Search, FileText, CheckCircle2, 
  TrendingUp, Compass, ArrowUpRight, DollarSign, Layers 
} from 'lucide-react-native';
import { useProblemStore } from '../../store/problemStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { useToastStore } from '../../store/toastStore';

export default function IndustryHomeScreen() {
  const router = useRouter();
  const { problems, fetchProblems, isLoading } = useProblemStore() as any;
  const { user } = useAuthStore() as any;
  const { theme, isDarkMode } = useTheme();
  const { showToast } = useToastStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProblems();
    setRefreshing(false);
  };

  const pledges = [
    {
      id: 'SICP-2026-8901',
      title: 'Solar Water Pump Malfunction in Secondary School',
      hei: 'Birsa Institute of Technology, Sindri',
      pledgedAmount: '₹15,000',
      status: 'in-progress',
      district: 'Khunti',
    },
    {
      id: 'SICP-2026-4412',
      title: 'Rural Micro-Grid Telemetry & Load Balancer',
      hei: 'National Institute of Technology, Jamshedpur',
      pledgedAmount: '₹30,000',
      status: 'in-progress',
      district: 'Ranchi',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView 
        contentContainerStyle={{ padding: 18, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.citizenPrimary} 
            colors={[theme.citizenPrimary]} 
          />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Building2 size={14} color={theme.citizenPrimary} />
            <Text style={{ fontSize: 11, color: theme.citizenPrimary, fontWeight: '800', letterSpacing: 1 }}>
              {user?.companyName || 'Tata Steel Foundation (CSR Partner)'}
            </Text>
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            Industry & CSR Portal
          </Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4 }}>
            Direct corporate capital into verified university prototypes under MCA Section 135.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
          <TouchableOpacity
            onPress={() => router.push('/(industry)/browse')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: theme.citizenPrimary,
              shadowColor: theme.citizenPrimary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Search size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Browse to Fund</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(industry)/handover')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Award size={16} color={theme.text} />
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 13 }}>Certifications</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>COMMITTED</Text>
            <Text style={{ color: theme.citizenPrimary, fontSize: 22, fontWeight: '900', marginTop: 4 }}>₹4.5L</Text>
            <Text style={{ color: theme.subtext, fontSize: 10, marginTop: 2 }}>CSR Escrow</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>SPONSORED</Text>
            <Text style={{ color: theme.authorityPrimary, fontSize: 22, fontWeight: '900', marginTop: 4 }}>08</Text>
            <Text style={{ color: theme.subtext, fontSize: 10, marginTop: 2 }}>Projects</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>IMPACT</Text>
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>12.4k+</Text>
            <Text style={{ color: theme.subtext, fontSize: 10, marginTop: 2 }}>Beneficiaries</Text>
          </View>
        </View>

        {/* Active Funded Projects */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 18,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.2 : 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
              Active Funded Projects
            </Text>
            <TouchableOpacity onPress={() => router.push('/(industry)/browse')}>
              <Text style={{ fontSize: 12, color: theme.citizenPrimary, fontWeight: '700' }}>Explore More →</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 14 }}>
            {pledges.map((item) => (
              <View 
                key={item.id}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.borderSubtle,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ color: theme.subtext, fontSize: 10, fontFamily: 'monospace' }}>
                    {item.id}
                  </Text>
                  <View style={{
                    backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}>
                    <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '800' }}>
                      IN PROGRESS
                    </Text>
                  </View>
                </View>

                <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800', marginBottom: 6 }}>
                  {item.title}
                </Text>

                <Text style={{ color: theme.subtext, fontSize: 11, marginBottom: 12 }}>
                  Technical Partner: <Text style={{ color: theme.authorityPrimary, fontWeight: '700' }}>{item.hei}</Text>
                </Text>

                {/* Grant Pledged and Audit Action */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderTopColor: theme.borderSubtle,
                  paddingTop: 10,
                }}>
                  <View>
                    <Text style={{ color: theme.subtext, fontSize: 10 }}>PLEDGED GRANT</Text>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 14, fontWeight: '800', marginTop: 1 }}>{item.pledgedAmount}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push('/(industry)/handover')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: theme.card,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text style={{ color: theme.text, fontSize: 11, fontWeight: '800' }}>Audit Project</Text>
                    <ArrowUpRight size={13} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}