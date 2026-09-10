import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  GraduationCap, 
  Sparkles, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  LogOut,
  Layers,
  Building2
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

export default function HEIHomeScreen() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'open' | 'claimed'>('open');

  useFocusEffect(
    React.useCallback(() => {
      loadChallenges();
    }, [])
  );

  const loadChallenges = async () => {
    try {
      const stored = await AsyncStorage.getItem('@citizen_tickets');
      if (stored) {
        setChallenges(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load challenges in HEI portal', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const handleClaimChallenge = (challengeId: string) => {
    Alert.alert(
      'Claim Societal Challenge',
      'Allocate this problem statement to your university innovation cell and assign a multidisciplinary student/faculty project team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Form Team & Claim',
          onPress: async () => {
            const updated = challenges.map((item) => {
              if (item.id === challengeId) {
                return {
                  ...item,
                  stage: 'Claimed by University',
                  status: 'Team Formed',
                  claimedBy: 'Birsa Agricultural University - Innovation Cell',
                  assignedLead: 'Faculty Mentor: Dr. A. K. Verma'
                };
              }
              return item;
            });
            setChallenges(updated);
            await AsyncStorage.setItem('@citizen_tickets', JSON.stringify(updated));
            Alert.alert('Challenge Claimed', 'Problem assigned to your institution repository.');
          }
        }
      ]
    );
  };

  const openChallenges = challenges.filter(c => c.stage !== 'Claimed by University' && c.stage !== 'Deployed Solution');
  const claimedChallenges = challenges.filter(c => c.stage === 'Claimed by University' || c.stage === 'Deployed Solution');

  const displayedList = selectedTab === 'open' ? openChallenges : claimedChallenges;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1B1E', padding: 16 }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2F9E8F" />}
      >
        {/* Top Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 10, color: '#9BA8A6', letterSpacing: 1.2, fontWeight: '700' }}>
              NEP-2020 EXPERIENTIAL RESEARCH PORTAL
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#F2EFE9', marginTop: 2 }}>
              University Hub
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.replace('/(auth)/login' as any)}
            style={{ backgroundColor: '#16262A', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#1D3238' }}
          >
            <LogOut size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Institution Info Card */}
        <View style={{ backgroundColor: '#16262A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1D3238', marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Building2 size={16} color="#2F9E8F" style={{ marginRight: 8 }} />
            <Text style={{ color: '#F2EFE9', fontSize: 15, fontWeight: '700' }}>Birsa Agricultural University</Text>
          </View>
          <Text style={{ color: '#9BA8A6', fontSize: 12 }}>
            Dept: AgriTech, Bioengineering & Rural Innovation Hub
          </Text>
        </View>

        {/* Segmented Filter Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: '#16262A', borderRadius: 12, padding: 4, marginBottom: 18, borderWidth: 1, borderColor: '#1D3238' }}>
          <TouchableOpacity
            onPress={() => setSelectedTab('open')}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderRadius: 10,
              backgroundColor: selectedTab === 'open' ? '#2F9E8F' : 'transparent',
            }}
          >
            <Text style={{ color: selectedTab === 'open' ? '#0F1B1E' : '#9BA8A6', fontWeight: '700', fontSize: 13 }}>
              Open Challenges ({openChallenges.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab('claimed')}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderRadius: 10,
              backgroundColor: selectedTab === 'claimed' ? '#2F9E8F' : 'transparent',
            }}
          >
            <Text style={{ color: selectedTab === 'claimed' ? '#0F1B1E' : '#9BA8A6', fontWeight: '700', fontSize: 13 }}>
              Claimed Projects ({claimedChallenges.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Challenge Cards Feed */}
        {displayedList.length === 0 ? (
          <View style={{ backgroundColor: '#16262A', padding: 32, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1D3238' }}>
            <GraduationCap size={32} color="#2F9E8F" style={{ marginBottom: 12 }} />
            <Text style={{ color: '#F2EFE9', fontSize: 15, fontWeight: '700', marginBottom: 4 }}>
              {selectedTab === 'open' ? 'No pending allocations' : 'No active university projects'}
            </Text>
            <Text style={{ color: '#9BA8A6', fontSize: 13, textAlign: 'center' }}>
              {selectedTab === 'open' 
                ? 'All domain-relevant societal problems have been claimed by innovation cells.' 
                : 'Claim an open challenge to form a student research group.'}
            </Text>
          </View>
        ) : (
          displayedList.map((item, index) => {
            const isClaimed = item.stage === 'Claimed by University' || item.stage === 'Deployed Solution';

            return (
              <View 
                key={index}
                style={{ backgroundColor: '#16262A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1D3238', marginBottom: 14 }}
              >
                {/* Domain & Department Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: '#E8A33D', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
                      {item.domain || 'Multidisciplinary'}
                    </Text>
                    <Text style={{ color: '#F2EFE9', fontWeight: '700', fontSize: 16, marginTop: 2 }}>
                      {item.title || item.description}
                    </Text>
                  </View>

                  <View style={{
                    backgroundColor: isClaimed ? 'rgba(47, 158, 143, 0.15)' : 'rgba(232, 163, 61, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isClaimed ? '#2F9E8F' : '#E8A33D'
                  }}>
                    <Text style={{ color: isClaimed ? '#2F9E8F' : '#E8A33D', fontSize: 10, fontWeight: '800' }}>
                      {isClaimed ? 'Active Team' : 'Unassigned'}
                    </Text>
                  </View>
                </View>

                {/* Problem Description */}
                <Text style={{ color: '#9BA8A6', fontSize: 13, marginBottom: 12, lineHeight: 18 }}>
                  {item.description}
                </Text>

                {/* Allocation Match Banner */}
                <View style={{ backgroundColor: '#0F1B1E', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#1D3238' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Sparkles size={12} color="#2F9E8F" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#F2EFE9', fontSize: 11, fontWeight: '600' }}>
                      Mapped Dept: <Text style={{ color: '#9BA8A6' }}>{item.assignedDept || 'General Engineering'}</Text>
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPin size={12} color="#9BA8A6" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#9BA8A6', fontSize: 11 }}>{item.location || 'Jharkhand Region'}</Text>
                  </View>
                </View>

                {/* Action Footer */}
                {isClaimed ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1D3238' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Users size={14} color="#2F9E8F" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#2F9E8F', fontSize: 12, fontWeight: '700' }}>R&D Team Assigned</Text>
                    </View>
                    <Text style={{ color: '#9BA8A6', fontSize: 11 }}>{item.id}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleClaimChallenge(item.id)}
                    style={{
                      backgroundColor: '#2F9E8F',
                      borderRadius: 12,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 4
                    }}
                  >
                    <Users size={16} color="#0F1B1E" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#0F1B1E', fontWeight: '800', fontSize: 13 }}>
                      Form Project Team & Claim
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}