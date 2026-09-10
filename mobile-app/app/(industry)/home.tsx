import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  LogOut, 
  Layers,
  Award,
  X
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

const PLEDGE_AMOUNTS = ['₹25,000', '₹50,000', '₹1,00,000', 'Mentorship Only'];

export default function IndustryHomeScreen() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [pledgeType, setPledgeType] = useState(PLEDGE_AMOUNTS[0]);
  const [corporateNotes, setCorporateNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      console.error('Failed to load challenges in Industry portal', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const openPledgeModal = (item: any) => {
    setSelectedChallenge(item);
    setIsModalOpen(true);
  };

  const handleConfirmPledge = async () => {
    if (!selectedChallenge) return;

    try {
      const updated = challenges.map((item) => {
        if (item.id === selectedChallenge.id) {
          return {
            ...item,
            stage: 'Industry Pledged',
            industryPledge: `Tata Steel CSR (${pledgeType}${corporateNotes ? ` - ${corporateNotes}` : ''})`,
          };
        }
        return item;
      });

      setChallenges(updated);
      await AsyncStorage.setItem('@citizen_tickets', JSON.stringify(updated));
      setIsModalOpen(false);
      setCorporateNotes('');
      Alert.alert('Pledge Confirmed', 'Your CSR funding & technical mentorship commitment has been linked to the HEI research team.');
    } catch (e) {
      Alert.alert('Error', 'Unable to commit pledge at this time.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1B1E', padding: 16 }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 10, color: '#9BA8A6', letterSpacing: 1.2, fontWeight: '700' }}>
              CSR & INDUSTRY CO-INNOVATION
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#F2EFE9', marginTop: 2 }}>
              Industry Partner Hub
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.replace('/(auth)/login' as any)}
            style={{ backgroundColor: '#16262A', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#1D3238' }}
          >
            <LogOut size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Corporate Profile Card */}
        <View style={{ backgroundColor: '#16262A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1D3238', marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Award size={18} color="#A855F7" style={{ marginRight: 8 }} />
            <Text style={{ color: '#F2EFE9', fontSize: 15, fontWeight: '700' }}>Tata Steel CSR & Sustainability Cell</Text>
          </View>
          <Text style={{ color: '#9BA8A6', fontSize: 12 }}>
            Focus: Rural Livelihoods, Clean Water & STEM Education in Eastern India
          </Text>
        </View>

        {/* Section Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Layers size={16} color="#A855F7" style={{ marginRight: 6 }} />
          <Text style={{ color: '#F2EFE9', fontSize: 16, fontWeight: '700' }}>
            Validated Academic Projects ({challenges.length})
          </Text>
        </View>

        {/* Projects Feed */}
        {challenges.length === 0 ? (
          <View style={{ backgroundColor: '#16262A', padding: 32, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1D3238' }}>
            <Briefcase size={32} color="#A855F7" style={{ marginBottom: 12 }} />
            <Text style={{ color: '#F2EFE9', fontSize: 15, fontWeight: '700', marginBottom: 4 }}>No projects seeking funding</Text>
            <Text style={{ color: '#9BA8A6', fontSize: 13, textAlign: 'center' }}>
              Active university R&D projects will appear here once claimed by academic institutions.
            </Text>
          </View>
        ) : (
          challenges.map((item, index) => {
            const hasPledge = Boolean(item.industryPledge);

            return (
              <View 
                key={index}
                style={{ backgroundColor: '#16262A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1D3238', marginBottom: 14 }}
              >
                {/* Domain & Stage Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: '#E8A33D', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
                      {item.domain || 'Societal Challenge'}
                    </Text>
                    <Text style={{ color: '#F2EFE9', fontWeight: '700', fontSize: 16, marginTop: 2 }}>
                      {item.title || item.description}
                    </Text>
                  </View>

                  <View style={{
                    backgroundColor: hasPledge ? 'rgba(168, 85, 247, 0.15)' : 'rgba(47, 158, 143, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: hasPledge ? '#A855F7' : '#2F9E8F'
                  }}>
                    <Text style={{ color: hasPledge ? '#A855F7' : '#2F9E8F', fontSize: 10, fontWeight: '800' }}>
                      {hasPledge ? 'Pledge Active' : 'Seeking Partner'}
                    </Text>
                  </View>
                </View>

                {/* Problem Summary */}
                <Text style={{ color: '#9BA8A6', fontSize: 13, marginBottom: 12, lineHeight: 18 }}>
                  {item.description}
                </Text>

                {/* Institutional Allocation Box */}
                <View style={{ backgroundColor: '#0F1B1E', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#1D3238' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <GraduationCap size={13} color="#2F9E8F" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#F2EFE9', fontSize: 11, fontWeight: '600' }}>
                      Leading HEI: <Text style={{ color: '#9BA8A6' }}>{item.suggestedHEI || 'Academic Team'}</Text>
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPin size={12} color="#9BA8A6" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#9BA8A6', fontSize: 11 }}>{item.location || 'Jharkhand Region'}</Text>
                  </View>
                </View>

                {/* Pledge Action or Status */}
                {hasPledge ? (
                  <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#A855F7' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CheckCircle2 size={14} color="#A855F7" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#A855F7', fontSize: 12, fontWeight: '700' }}>
                        Partner: {item.industryPledge}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => openPledgeModal(item)}
                    style={{
                      backgroundColor: '#A855F7',
                      borderRadius: 12,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 4
                    }}
                  >
                    <IndianRupee size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                      Pledge CSR Grant / Mentorship
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Structured Pledge Bottom Sheet Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#16262A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1D3238' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ color: '#F2EFE9', fontSize: 18, fontWeight: '800' }}>Pledge CSR Support</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={22} color="#9BA8A6" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#9BA8A6', fontSize: 13, marginBottom: 14 }}>
              Support: <Text style={{ color: '#E8A33D', fontWeight: '700' }}>{selectedChallenge?.title || selectedChallenge?.description}</Text>
            </Text>

            {/* Select Tier */}
            <Text style={{ color: '#F2EFE9', fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Select Contribution Tier</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {PLEDGE_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setPledgeType(amt)}
                  style={{
                    backgroundColor: pledgeType === amt ? '#A855F7' : '#0F1B1E',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: pledgeType === amt ? '#A855F7' : '#1D3238',
                  }}
                >
                  <Text style={{ color: pledgeType === amt ? '#FFFFFF' : '#9BA8A6', fontSize: 12, fontWeight: '700' }}>
                    {amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Mentorship / Notes */}
            <Text style={{ color: '#F2EFE9', fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Mentorship & Technical Offering</Text>
            <TextInput
              placeholder="e.g. 10 hours of technical mentorship, IoT sensor hardware kits..."
              placeholderTextColor="#9BA8A6"
              value={corporateNotes}
              onChangeText={setCorporateNotes}
              style={{ backgroundColor: '#0F1B1E', color: '#F2EFE9', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1D3238', marginBottom: 20, fontSize: 13 }}
            />

            <TouchableOpacity
              onPress={handleConfirmPledge}
              style={{ backgroundColor: '#A855F7', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>Confirm & Allocate Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}