import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  GraduationCap, Sparkles, MapPin, Users, CheckCircle2, 
  Clock, ArrowRight, ArrowUpRight, Plus, Trash2, Send, X, Layers, Compass 
} from 'lucide-react-native';
import { useProblemStore } from '../../store/problemStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { useToastStore } from '../../store/toastStore';

export default function HEIHomeScreen() {
  const router = useRouter();
  const { problems, fetchProblems, isLoading } = useProblemStore() as any;
  const { user } = useAuthStore() as any;
  const { theme, isDarkMode } = useTheme();
  const { showToast } = useToastStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [materials, setMaterials] = useState<string[]>(['Solar pump controller', 'Weatherproof enclosure']);
  const [form, setForm] = useState({ trl: '3', funding: '45000', abstract: '' });

  useEffect(() => {
    fetchProblems();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProblems();
    setRefreshing(false);
  };

  const handleAddMaterial = () => {
    setMaterials([...materials, '']);
  };

  const handleUpdateMaterial = (text: string, index: number) => {
    const updated = [...materials];
    updated[index] = text;
    setMaterials(updated);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, idx) => idx !== index));
  };

  const handleSubmitPrototype = () => {
    if (!form.abstract.trim() || !form.funding) {
      Alert.alert('Required Fields', 'Please complete the technical abstract and funding estimate.');
      return;
    }
    showToast('Working prototype brief submitted to showcase queue!', 'success');
    setShowSubmission(false);
    setForm({ trl: '3', funding: '', abstract: '' });
  };

  const activeClaims = [
    {
      id: 'SICP-2026-8901',
      title: 'Solar Water Pump Malfunction in Secondary School',
      district: 'Khunti',
      team: 'Team Alpha (CSE)',
      status: 'in-progress',
      progress: '60%',
    },
    {
      id: 'SICP-2026-4412',
      title: 'Rural Micro-Grid Telemetry & Load Balancer',
      district: 'Ranchi',
      team: 'Team Vidyut (EE)',
      status: 'in-progress',
      progress: '85%',
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
            tintColor={theme.authorityPrimary} 
            colors={[theme.authorityPrimary]} 
          />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles size={14} color={theme.authorityPrimary} />
            <Text style={{ fontSize: 11, color: theme.authorityPrimary, fontWeight: '800', letterSpacing: 1 }}>
              {user?.institutionName || 'BIT Sindri • Innovation & R&D Cell'}
            </Text>
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            HEI Portal & Workspace
          </Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4 }}>
            Direct students to civic Capstone projects and deploy validated prototypes.
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
          <TouchableOpacity
            onPress={() => router.push('/(hei)/browse')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: theme.authorityPrimary,
              shadowColor: theme.authorityPrimary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Compass size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Browse Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSubmission(true)}
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
            <Plus size={16} color={theme.text} />
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 13 }}>Submit Prototype</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>CLAIMED</Text>
            <Text style={{ color: theme.citizenPrimary, fontSize: 24, fontWeight: '900', marginTop: 4 }}>04</Text>
            <Text style={{ color: theme.subtext, fontSize: 10, marginTop: 2 }}>Problems</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>TEAMS</Text>
            <Text style={{ color: theme.authorityPrimary, fontSize: 24, fontWeight: '900', marginTop: 4 }}>06</Text>
            <Text style={{ color: theme.subtext, fontSize: 10, marginTop: 2 }}>Assigned</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>DEPLOYED</Text>
            <Text style={{ color: theme.text, fontSize: 24, fontWeight: '900', marginTop: 4 }}>02</Text>
            <Text style={{ color: theme.subtext, fontSize: 10, marginTop: 2 }}>Solutions</Text>
          </View>
        </View>

        {/* Active Projects Table */}
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
              Active Institutional Projects
            </Text>
            <TouchableOpacity onPress={() => router.push('/(hei)/tracking')}>
              <Text style={{ fontSize: 12, color: theme.authorityPrimary, fontWeight: '700' }}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 14 }}>
            {activeClaims.map((item) => (
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

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: theme.subtext, fontSize: 11 }}>
                    District: {item.district} | <Text style={{ color: theme.authorityPrimary, fontWeight: '700' }}>{item.team}</Text>
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: theme.subtext, fontSize: 10 }}>Milestone Progress</Text>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 11, fontWeight: '800' }}>{item.progress}</Text>
                  </View>
                  <View style={{ height: 6, width: '100%', backgroundColor: theme.card, borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: item.progress as any, backgroundColor: theme.citizenPrimary }} />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => router.push('/(hei)/tracking')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 4,
                  }}
                >
                  <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: '800' }}>Open Workspace</Text>
                  <ArrowUpRight size={14} color={theme.authorityPrimary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Capstone Intake Modal */}
      <Modal visible={showSubmission} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: theme.card, 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24, 
            maxHeight: '90%',
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text style={{ color: theme.authorityPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
                  CAPSTONE INTAKE
                </Text>
                <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', marginTop: 2 }}>
                  Submit Working Prototype
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSubmission(false)} style={{ padding: 6 }}>
                <X size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {/* TRL & Funding */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
                    TRL Level (1 - 7)
                  </Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={form.trl}
                    onChangeText={(val) => setForm({ ...form, trl: val })}
                    style={{
                      backgroundColor: theme.inputBg,
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      padding: 12,
                      color: theme.text,
                      fontSize: 14,
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
                    Funding Goal (₹ INR)
                  </Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={form.funding}
                    onChangeText={(val) => setForm({ ...form, funding: val })}
                    style={{
                      backgroundColor: theme.inputBg,
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      padding: 12,
                      color: theme.text,
                      fontSize: 14,
                    }}
                  />
                </View>
              </View>

              {/* Technical Abstract */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
                  Technical Abstract & Outcome
                </Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  placeholder="State the prototype design, test methodology, and expected civic impact..."
                  placeholderTextColor={theme.subtext}
                  value={form.abstract}
                  onChangeText={(val) => setForm({ ...form, abstract: val })}
                  style={{
                    backgroundColor: theme.inputBg,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 12,
                    padding: 12,
                    color: theme.text,
                    fontSize: 14,
                    minHeight: 90,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              {/* Bill of Materials */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700' }}>
                    Bill of Materials (BoM)
                  </Text>
                  <TouchableOpacity onPress={handleAddMaterial} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Plus size={13} color={theme.citizenPrimary} />
                    <Text style={{ color: theme.citizenPrimary, fontSize: 12, fontWeight: '700' }}>Add Item</Text>
                  </TouchableOpacity>
                </View>

                {materials.map((mat, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <TextInput
                      value={mat}
                      onChangeText={(val) => handleUpdateMaterial(val, idx)}
                      placeholder="Component or service..."
                      placeholderTextColor={theme.subtext}
                      style={{
                        flex: 1,
                        backgroundColor: theme.inputBg,
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        color: theme.text,
                        fontSize: 13,
                      }}
                    />
                    <TouchableOpacity onPress={() => handleRemoveMaterial(idx)} style={{ padding: 8 }}>
                      <Trash2 size={16} color={theme.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowSubmission(false)}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 12,
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmitPrototype}
                style={{
                  flex: 1.5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 13,
                  borderRadius: 12,
                  backgroundColor: theme.authorityPrimary,
                }}
              >
                <Send size={15} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Submit Brief</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}