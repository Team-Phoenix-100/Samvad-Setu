import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, AlertCircle, CheckCircle2, Clock, MapPin, Search, Map, Bell, Filter } from 'lucide-react-native';
import { useProblemStore } from '../../store/problemStore';
import { useTheme } from '../../context/ThemeContext';

// Helper component for Status Badge
const StatusBadge = ({ status, isDarkMode }: { status: string; isDarkMode: boolean }) => {
  let bgColor = isDarkMode ? '#1D3238' : '#E2ECEB';
  let textColor = isDarkMode ? '#9BA8A6' : '#5B7276';
  let label = status?.toUpperCase() || 'UNKNOWN';

  if (status === 'new' || status === 'open') {
    bgColor = isDarkMode ? 'rgba(232, 163, 61, 0.15)' : 'rgba(203, 125, 24, 0.12)';
    textColor = isDarkMode ? '#E8A33D' : '#CB7D18';
  } else if (status === 'in-progress') {
    bgColor = isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.12)';
    textColor = isDarkMode ? '#60A5FA' : '#2563EB';
  } else if (status === 'resolved' || status === 'closed') {
    bgColor = isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)';
    textColor = isDarkMode ? '#2F9E8F' : '#059669';
  }

  return (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 }}>
      <Text style={{ color: textColor, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
};

// Helper for Signal Dot
const SignalDot = ({ status, isDarkMode }: { status: string; isDarkMode: boolean }) => {
  let color = isDarkMode ? '#9BA8A6' : '#8E9E9C';
  if (status === 'new' || status === 'open') color = isDarkMode ? '#E8A33D' : '#CB7D18';
  else if (status === 'in-progress') color = isDarkMode ? '#38BDF8' : '#0284C7';
  else if (status === 'resolved' || status === 'closed') color = isDarkMode ? '#2F9E8F' : '#059669';

  return (
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, shadowColor: color, shadowOpacity: 0.6, shadowRadius: 4, shadowOffset: { width: 0, height: 0 }, elevation: 3 }} />
  );
};

export default function CitizenHomeScreen() {
  const router = useRouter();
  const { problems, isLoading, fetchProblems } = useProblemStore() as any;
  const { theme, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');

  useEffect(() => {
    fetchProblems();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProblems();
    setRefreshing(false);
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((p: any) => {
      const matchesSearch = searchQuery === '' || 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.district?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'open') return p.status === 'new' || p.status === 'open';
      if (selectedFilter === 'in-progress') return p.status === 'in-progress';
      if (selectedFilter === 'resolved') return p.status === 'resolved' || p.status === 'closed';
      return true;
    });
  }, [problems, searchQuery, selectedFilter]);

  const totalReported = problems.length;
  const resolvedCount = problems.filter((p: any) => p.status === 'resolved' || p.status === 'closed').length;
  const inProgressCount = problems.filter((p: any) => p.status === 'in-progress' || p.status === 'new' || p.status === 'open').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.citizenPrimary} 
            colors={[theme.citizenPrimary]} 
          />
        }
      >
        {/* Top Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
              Citizen Portal
            </Text>
            <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 3 }}>
              Voice issues, track resolutions & inspect local initiatives
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={() => router.push('/(citizen)/map' as any)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Map size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/notifications' as any)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats Strip */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <AlertCircle color={theme.citizenPrimary} size={22} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '600' }}>Reported</Text>
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', marginTop: 2 }}>{totalReported}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Clock color="#FBBF24" size={22} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '600' }}>In Progress</Text>
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', marginTop: 2 }}>{inProgressCount}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <CheckCircle2 color={theme.authorityPrimary} size={22} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '600' }}>Resolved</Text>
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', marginTop: 2 }}>{resolvedCount}</Text>
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
          marginBottom: 14,
        }}>
          <Search size={18} color={theme.subtext} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search problems by keyword, district..."
            placeholderTextColor={theme.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: theme.text, fontSize: 14 }}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 20 }}>
          {[
            { key: 'all', label: 'All Issues' },
            { key: 'open', label: 'Open / New' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'resolved', label: 'Resolved' },
          ].map((chip) => {
            const isSelected = selectedFilter === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                onPress={() => setSelectedFilter(chip.key as any)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isSelected ? theme.citizenPrimary : theme.surface,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.citizenPrimary : theme.border,
                }}
              >
                <Text style={{ 
                  color: isSelected ? '#FFFFFF' : theme.textSecondary, 
                  fontSize: 12, 
                  fontWeight: isSelected ? '700' : '500' 
                }}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Problems List */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
              My Submitted Reports ({filteredProblems.length})
            </Text>
          </View>

          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator color={theme.citizenPrimary} size="large" />
              <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading problem feeds...</Text>
            </View>
          ) : filteredProblems.length === 0 ? (
            /* Empty State */
            <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 18, padding: 32, alignItems: 'center', marginTop: 8 }}>
              <View style={{ opacity: 0.6, marginBottom: 14 }}>
                <SignalDot status="unresolved" isDarkMode={isDarkMode} />
              </View>
              <Text style={{ color: theme.text, fontSize: 17, fontWeight: '700', marginBottom: 6, textAlign: 'center' }}>
                {searchQuery ? 'No issues matched your search' : 'No problems submitted yet'}
              </Text>
              <Text style={{ color: theme.subtext, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 280 }}>
                {searchQuery ? 'Try adjusting your search terms or filters.' : 'Report civic or educational infrastructure problems to route them to college labs and authorities.'}
              </Text>
            </View>
          ) : (
            /* Active List */
            <View style={{ gap: 12 }}>
              {filteredProblems.map((item: any) => (
                <TouchableOpacity 
                  key={item._id || item.id} 
                  activeOpacity={0.7}
                  onPress={() => router.push(`/problem/${item._id || item.id}` as any)}
                  style={{ 
                    backgroundColor: theme.card, 
                    borderWidth: 1, 
                    borderColor: theme.border, 
                    borderRadius: 16, 
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDarkMode ? 0.2 : 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                      <View style={{ marginRight: 10, marginTop: 2 }}>
                        <SignalDot status={item.status} isDarkMode={isDarkMode} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.subtext, fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 2 }}>
                          #{String(item._id || item.id).slice(-6).toUpperCase()}
                        </Text>
                        <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>
                    </View>
                    <StatusBadge status={item.status} isDarkMode={isDarkMode} />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={13} color={theme.subtext} style={{ marginRight: 4 }} />
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{item.location?.district || 'Jharkhand'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: theme.subtext, fontSize: 12 }}>Category: <Text style={{ color: theme.text, fontWeight: '600' }}>{item.category}</Text></Text>
                    </View>
                  </View>
                  
                  <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.borderSubtle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: theme.subtext, fontSize: 11 }}>
                      Submitted: {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 11, fontWeight: '700' }}>
                      View Details →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/(citizen)/submit-problem')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 20,
          backgroundColor: theme.citizenPrimary,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 30,
          gap: 8,
          shadowColor: theme.citizenPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Plus color="#FFFFFF" size={20} strokeWidth={2.5} />
        <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Report Issue</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}