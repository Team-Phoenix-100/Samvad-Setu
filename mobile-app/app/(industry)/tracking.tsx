import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Building2, CircleDollarSign, MapPin, Search, TrendingUp, ArrowRight, Layers 
} from 'lucide-react-native';
import { useProblemStore } from '../../store/problemStore';
import { useTheme } from '../../context/ThemeContext';

export default function IndustryTrackingScreen() {
  const router = useRouter();
  const { problems, isLoading, fetchProblems } = useProblemStore() as any;
  const { theme, isDarkMode } = useTheme();

  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const projects = useMemo(() => {
    return problems.filter((p: any) => {
      const text = `${p.title} ${p.description} ${p.assignedInstitution || ''} ${p.location?.district || ''}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }, [problems, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Building2 size={14} color={theme.citizenPrimary} />
            <Text style={{ fontSize: 11, color: theme.citizenPrimary, fontWeight: '800', letterSpacing: 1 }}>
              CSR IMPACT PORTFOLIO
            </Text>
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            Project Tracking
          </Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4, lineHeight: 18 }}>
            Follow funded civic projects from academic research handover through verified community field impact.
          </Text>
        </View>

        {/* Commitment Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800' }}>COMMITTED CAPITAL</Text>
            <Text style={{ color: theme.citizenPrimary, fontSize: 22, fontWeight: '900', marginTop: 4 }}>₹4.5L</Text>
            <Text style={{ color: theme.subtext, fontSize: 11, marginTop: 2 }}>Released in escrow</Text>
          </View>

          <View style={{ flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800' }}>FUNDED PROJECTS</Text>
            <Text style={{ color: theme.authorityPrimary, fontSize: 22, fontWeight: '900', marginTop: 4 }}>08</Text>
            <Text style={{ color: theme.subtext, fontSize: 11, marginTop: 2 }}>University labs</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: theme.inputBg, 
          borderWidth: 1, 
          borderColor: theme.border, 
          borderRadius: 14, 
          paddingHorizontal: 14, 
          height: 48,
          marginBottom: 18,
        }}>
          <Search size={18} color={theme.subtext} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search your supported projects..."
            placeholderTextColor={theme.subtext}
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, color: theme.text, fontSize: 14 }}
          />
        </View>

        {/* Projects Feed */}
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={theme.citizenPrimary} size="large" />
            <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading portfolio projects...</Text>
          </View>
        ) : projects.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Layers size={36} color={theme.subtext} style={{ marginBottom: 12 }} />
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
              No portfolio projects found
            </Text>
            <Text style={{ color: theme.subtext, fontSize: 13, textAlign: 'center' }}>
              Explore the CSR Funding Explorer to sponsor university prototypes.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {projects.map((project: any) => (
              <View
                key={project._id || project.id}
                style={{
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 18,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDarkMode ? 0.2 : 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: theme.subtext, fontSize: 10, fontFamily: 'monospace' }}>
                    #{String(project._id || project.id).slice(-6).toUpperCase()}
                  </Text>
                  <View style={{
                    backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}>
                    <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '800' }}>
                      IMPACT VERIFIED
                    </Text>
                  </View>
                </View>

                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 6 }} numberOfLines={1}>
                  {project.title}
                </Text>
                <Text style={{ color: theme.subtext, fontSize: 13, lineHeight: 18, marginBottom: 12 }} numberOfLines={2}>
                  {project.description}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPin size={13} color={theme.subtext} style={{ marginRight: 4 }} />
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                      {project.location?.district || 'Jharkhand'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={13} color={theme.authorityPrimary} />
                    <Text style={{ color: theme.authorityPrimary, fontSize: 11, fontWeight: '700' }}>
                      Field reporting active
                    </Text>
                  </View>
                </View>

                {/* CSR Escrow & Prototype Milestone */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  backgroundColor: isDarkMode ? '#111E22' : '#F6FAF9', 
                  borderRadius: 10, 
                  paddingHorizontal: 10, 
                  paddingVertical: 6, 
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.borderSubtle
                }}>
                  <Text style={{ color: theme.citizenPrimary, fontSize: 10, fontWeight: '800' }}>
                    💰 CSR ESCROW: DISBURSED
                  </Text>
                  <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '700' }}>
                    PROTOTYPE IN PILOT
                  </Text>
                </View>

                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTopWidth: 1, 
                  borderTopColor: theme.borderSubtle, 
                  paddingTop: 12,
                }}>
                  <View>
                    <Text style={{ color: theme.subtext, fontSize: 10 }}>GRANT ALLOCATED</Text>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 14, fontWeight: '800', marginTop: 1 }}>₹45,000</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push(`/problem/${project._id || project.id}` as any)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: theme.surface,
                      borderWidth: 1,
                      borderColor: theme.border,
                      paddingVertical: 7,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                    }}
                  >
                    <CircleDollarSign size={13} color={theme.text} />
                    <Text style={{ color: theme.text, fontSize: 11, fontWeight: '800' }}>View Impact</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
