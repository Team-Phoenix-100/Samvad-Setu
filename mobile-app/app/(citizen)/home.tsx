import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, AlertCircle, CheckCircle2, Clock, MapPin } from 'lucide-react-native';
import { useProblemStore } from '../../store/problemStore';

// Helper component for Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = '#1D3238';
  let textColor = '#9BA8A6';
  let label = status?.toUpperCase() || 'UNKNOWN';

  if (status === 'new' || status === 'open') {
    bgColor = 'rgba(232, 163, 61, 0.15)';
    textColor = '#E8A33D';
  } else if (status === 'in-progress') {
    bgColor = 'rgba(59, 130, 246, 0.15)';
    textColor = '#3B82F6';
  } else if (status === 'resolved' || status === 'closed') {
    bgColor = 'rgba(47, 158, 143, 0.15)';
    textColor = '#2F9E8F';
  }

  return (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
      <Text style={{ color: textColor, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
};

// Helper for Signal Dot
const SignalDot = ({ status }: { status: string }) => {
  let color = '#9BA8A6';
  if (status === 'new' || status === 'open') color = '#E8A33D';
  else if (status === 'in-progress') color = '#3B82F6';
  else if (status === 'resolved' || status === 'closed') color = '#2F9E8F';

  return (
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, shadowColor: color, shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 }, elevation: 4 }} />
  );
};

export default function CitizenHomeScreen() {
  const router = useRouter();
  const { problems, isLoading, fetchProblems } = useProblemStore() as any;

  useEffect(() => {
    fetchProblems();
  }, []);

  const totalReported = problems.length;
  const resolvedCount = problems.filter((p: any) => p.status === 'resolved' || p.status === 'closed').length;
  const inProgressCount = problems.filter((p: any) => p.status === 'in-progress' || p.status === 'new' || p.status === 'open').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1B1E' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Top Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#F2EFE9', marginBottom: 4 }}>Citizen Dashboard</Text>
          <Text style={{ fontSize: 13, color: '#9BA8A6' }}>Track and manage civic issues reported by you.</Text>
        </View>

        {/* Quick Stats Strip */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
          <View style={{ flex: 1, backgroundColor: '#16262A', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1D3238', alignItems: 'flex-start' }}>
            <AlertCircle color="#E8A33D" size={24} style={{ marginBottom: 12 }} />
            <Text style={{ color: '#9BA8A6', fontSize: 11, marginBottom: 4 }}>Reported</Text>
            <Text style={{ color: '#F2EFE9', fontSize: 24, fontWeight: 'bold' }}>{totalReported}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#16262A', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1D3238', alignItems: 'flex-start' }}>
            <Clock color="#FBBF24" size={24} style={{ marginBottom: 12 }} />
            <Text style={{ color: '#9BA8A6', fontSize: 11, marginBottom: 4 }}>In Progress</Text>
            <Text style={{ color: '#F2EFE9', fontSize: 24, fontWeight: 'bold' }}>{inProgressCount}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#16262A', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1D3238', alignItems: 'flex-start' }}>
            <CheckCircle2 color="#2F9E8F" size={24} style={{ marginBottom: 12 }} />
            <Text style={{ color: '#9BA8A6', fontSize: 11, marginBottom: 4 }}>Resolved</Text>
            <Text style={{ color: '#F2EFE9', fontSize: 24, fontWeight: 'bold' }}>{resolvedCount}</Text>
          </View>
        </View>

        {/* Problems List */}
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F2EFE9', marginBottom: 16 }}>My Submitted Reports</Text>

          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator color="#E8A33D" size="large" />
              <Text style={{ color: '#9BA8A6', marginTop: 12 }}>Loading problem feeds...</Text>
            </View>
          ) : problems.length === 0 ? (
            /* Empty State */
            <View style={{ backgroundColor: '#16262A', borderWidth: 1, borderColor: '#1D3238', borderRadius: 16, padding: 32, alignItems: 'center', marginTop: 8 }}>
              <View style={{ opacity: 0.5, marginBottom: 16 }}>
                <SignalDot status="unresolved" />
              </View>
              <Text style={{ color: '#F2EFE9', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No problems submitted yet</Text>
              <Text style={{ color: '#9BA8A6', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                Report your first civic or educational infrastructure problem to initiate AI classification and routing.
              </Text>
            </View>
          ) : (
            /* Active List */
            <View style={{ gap: 12 }}>
              {problems.map((item: any) => (
                <TouchableOpacity 
                  key={item._id || item.id} 
                  onPress={() => router.push(`/problem/${item._id || item.id}` as any)}
                  style={{ backgroundColor: '#16262A', borderWidth: 1, borderColor: '#1D3238', borderRadius: 16, padding: 16 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
                      <View style={{ marginRight: 12, marginTop: 4 }}><SignalDot status={item.status} /></View>
                      <View>
                        <Text style={{ color: '#9BA8A6', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 2 }}>
                          #{String(item._id || item.id).slice(-6).toUpperCase()}
                        </Text>
                        <Text style={{ color: '#F2EFE9', fontSize: 15, fontWeight: 'bold' }} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>
                    </View>
                    <StatusBadge status={item.status} />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={12} color="#9BA8A6" style={{ marginRight: 4 }} />
                      <Text style={{ color: '#9BA8A6', fontSize: 11 }}>{item.location?.district || 'Jharkhand'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#9BA8A6', fontSize: 11 }}>Category: <Text style={{ color: '#F2EFE9', fontWeight: '600' }}>{item.category}</Text></Text>
                    </View>
                  </View>
                  
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1D3238' }}>
                    <Text style={{ color: '#9BA8A6', fontSize: 10 }}>
                      Submitted: {new Date(item.createdAt).toLocaleDateString()}
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
        onPress={() => router.push('/(citizen)/submit-problem')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          backgroundColor: '#E8A33D',
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#E8A33D',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus color="#0F1B1E" size={28} strokeWidth={2.5} />
      </TouchableOpacity>

    </SafeAreaView>
  );
}