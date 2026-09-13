import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  GraduationCap, CheckCircle2, Clock3, MapPin, Search, ArrowRight, Layers 
} from 'lucide-react-native';
import { useProblemStore } from '../../store/problemStore';
import { useTheme } from '../../context/ThemeContext';

export default function HeiTrackingScreen() {
  const router = useRouter();
  const { problems, isLoading, fetchProblems } = useProblemStore() as any;
  const { theme, isDarkMode } = useTheme();

  const [view, setView] = useState<'all' | 'available' | 'claimed'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const tracked = useMemo(() => {
    return problems.filter((p: any) => {
      const text = `${p.title} ${p.description} ${p.location?.district || ''}`.toLowerCase();
      const claimed = Boolean(p.assignedInstitution || p.status === 'in-progress');
      const matchesView = view === 'all' || (view === 'claimed' && claimed) || (view === 'available' && !claimed);
      return matchesView && text.includes(query.toLowerCase());
    });
  }, [problems, view, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <GraduationCap size={15} color={theme.authorityPrimary} />
            <Text style={{ fontSize: 11, color: theme.authorityPrimary, fontWeight: '800', letterSpacing: 1 }}>
              UNIVERSITY INNOVATION CELL
            </Text>
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            Problem Tracking
          </Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4, lineHeight: 18 }}>
            Monitor adopted challenges, team progress, and open civic problems allocated to academic labs.
          </Text>
        </View>

        {/* View Filter Switcher */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'all', label: 'All Challenges' },
            { key: 'available', label: 'Available' },
            { key: 'claimed', label: 'Claimed (Active)' },
          ].map((item) => {
            const isSelected = view === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setView(item.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  alignItems: 'center',
                  borderRadius: 12,
                  backgroundColor: isSelected ? theme.authorityPrimary : theme.surface,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.authorityPrimary : theme.border,
                }}
              >
                <Text style={{ 
                  color: isSelected ? '#FFFFFF' : theme.textSecondary, 
                  fontSize: 12, 
                  fontWeight: isSelected ? '800' : '600' 
                }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search Input */}
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
            placeholder="Search tracked problems..."
            placeholderTextColor={theme.subtext}
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, color: theme.text, fontSize: 14 }}
          />
        </View>

        {/* Challenge Cards */}
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={theme.authorityPrimary} size="large" />
            <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading tracked problems...</Text>
          </View>
        ) : tracked.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Layers size={36} color={theme.subtext} style={{ marginBottom: 12 }} />
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
              No problems found
            </Text>
            <Text style={{ color: theme.subtext, fontSize: 13, textAlign: 'center' }}>
              Try toggling filters or clearing your search term.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {tracked.map((problem: any) => {
              const claimed = Boolean(problem.assignedInstitution || problem.status === 'in-progress');
              return (
                <View
                  key={problem._id || problem.id}
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
                      #{String(problem._id || problem.id).slice(-6).toUpperCase()}
                    </Text>
                    <View style={{
                      backgroundColor: claimed ? (isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)') : (isDarkMode ? 'rgba(232, 163, 61, 0.15)' : 'rgba(203, 125, 24, 0.12)'),
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}>
                      <Text style={{
                        color: claimed ? theme.authorityPrimary : theme.citizenPrimary,
                        fontSize: 10,
                        fontWeight: '800'
                      }}>
                        {claimed ? 'TEAM ASSIGNED' : 'OPEN FOR CLAIM'}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 6 }} numberOfLines={1}>
                    {problem.title}
                  </Text>
                  <Text style={{ color: theme.subtext, fontSize: 13, lineHeight: 18, marginBottom: 14 }} numberOfLines={2}>
                    {problem.description}
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={13} color={theme.subtext} style={{ marginRight: 4 }} />
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                        {problem.location?.district || 'Jharkhand'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {claimed ? (
                        <CheckCircle2 size={13} color={theme.authorityPrimary} />
                      ) : (
                        <Clock3 size={13} color={theme.citizenPrimary} />
                      )}
                      <Text style={{ color: claimed ? theme.authorityPrimary : theme.citizenPrimary, fontSize: 11, fontWeight: '700' }}>
                        {claimed ? 'Active Field R&D' : 'Awaiting Student Lead'}
                      </Text>
                    </View>
                  </View>

                  {/* Workflow Pipeline & SLA Status Row */}
                  {(() => {
                    const urg = (problem.urgency || 'medium').toLowerCase();
                    const targetHrs = urg === 'critical' ? 48 : urg === 'high' || urg === 'urgent' ? 72 : 168;
                    const cAt = new Date(problem.createdAt || Date.now()).getTime();
                    const remHrs = Math.max(0, Math.ceil((cAt + targetHrs * 3600000 - Date.now()) / 3600000));
                    const breached = remHrs === 0;
                    return (
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
                        <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '800' }}>
                          ⚡ AI ROUTED TO HEI
                        </Text>
                        <Text style={{ color: breached ? '#EF4444' : theme.subtext, fontSize: 10, fontWeight: '700' }}>
                          {breached ? 'SLA EXPIRED • ESCALATED' : `${remHrs}h SLA REMAINING`}
                        </Text>
                      </View>
                    );
                  })()}

                  <TouchableOpacity
                    onPress={() => router.push(`/problem/${problem._id || problem.id}` as any)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      borderTopWidth: 1,
                      borderTopColor: theme.borderSubtle,
                      paddingTop: 12,
                    }}
                  >
                    <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: '800' }}>
                      {claimed ? 'Open Project Timeline' : 'Review Challenge Brief'}
                    </Text>
                    <ArrowRight size={14} color={theme.authorityPrimary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
