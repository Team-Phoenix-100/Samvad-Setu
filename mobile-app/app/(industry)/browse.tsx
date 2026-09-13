import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Building2, Award, CheckCircle, ShieldCheck, X, Search, 
  ArrowUpRight, DollarSign, Layers, Compass, CheckSquare, Square
} from 'lucide-react-native';
import { useProblemStore } from '../../store/problemStore';
import { useTheme } from '../../context/ThemeContext';
import { useToastStore } from '../../store/toastStore';

export default function IndustryBrowseScreen() {
  const router = useRouter();
  const { problems, isLoading, fetchProblems } = useProblemStore() as any;
  const { theme, isDarkMode } = useTheme();
  const { showToast } = useToastStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [pledged, setPledged] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const filteredProjects = useMemo(() => {
    return problems.filter((p: any) => {
      const text = `${p.title} ${p.description} ${p.category} ${p.location?.district || ''}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });
  }, [problems, searchQuery]);

  const handleOpenPledge = (item: any) => {
    setSelectedProject(item);
    setPledged(false);
  };

  const handleConfirmPledge = () => {
    if (!agreedTerms) {
      Alert.alert('Escrow Acceptance', 'Please accept the 3-tranche escrow terms to confirm pledge.');
      return;
    }
    setPledged(true);
    showToast(`CSR pledge of ₹45,000 recorded for ${selectedProject.title}!`, 'success');
    setTimeout(() => {
      setSelectedProject(null);
      setPledged(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Award size={14} color={theme.citizenPrimary} />
            <Text style={{ fontSize: 11, color: theme.citizenPrimary, fontWeight: '800', letterSpacing: 1 }}>
              PHASE 7 • CORPORATE SOCIAL RESPONSIBILITY
            </Text>
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            CSR Funding Explorer
          </Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4, lineHeight: 18 }}>
            Browse verified academic prototypes requiring funding, equipment, or industry mentorship under MCA Section 135.
          </Text>
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
            placeholder="Search projects by domain, district or SDG..."
            placeholderTextColor={theme.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: theme.text, fontSize: 14 }}
          />
        </View>

        {/* Projects List */}
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={theme.citizenPrimary} size="large" />
            <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading CSR showcase opportunities...</Text>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Compass size={36} color={theme.subtext} style={{ marginBottom: 12 }} />
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
              No matching projects
            </Text>
            <Text style={{ color: theme.subtext, fontSize: 13, textAlign: 'center' }}>
              Clear or broaden your query to view all available civic prototypes.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {filteredProjects.map((item: any) => (
              <View
                key={item._id || item.id}
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
                {/* Header Strip */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: theme.subtext, fontSize: 10, fontFamily: 'monospace' }}>
                    #{String(item._id || item.id).slice(-6).toUpperCase()}
                  </Text>
                  <View style={{
                    backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}>
                    <Text style={{ color: theme.authorityPrimary, fontSize: 11, fontWeight: '800' }}>
                      Target: ₹45,000
                    </Text>
                  </View>
                </View>

                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 6 }} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={{ color: theme.subtext, fontSize: 13, lineHeight: 18, marginBottom: 12 }} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Compliance & TRL Tags */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  <View style={{ backgroundColor: isDarkMode ? 'rgba(232, 163, 61, 0.15)' : 'rgba(203, 125, 24, 0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 10, fontWeight: '800' }}>
                      TRL {item.trl || 3} • Lab Validated
                    </Text>
                  </View>
                  <View style={{ backgroundColor: theme.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '700' }}>
                      MCA Sched. VII: Item IV
                    </Text>
                  </View>
                  <View style={{ backgroundColor: theme.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '700' }}>
                      Item II (Rural Dev)
                    </Text>
                  </View>
                </View>

                {/* Footer Strip */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  borderTopWidth: 1, 
                  borderTopColor: theme.borderSubtle, 
                  paddingTop: 12,
                  gap: 8,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                    <Building2 size={13} color={theme.authorityPrimary} style={{ marginRight: 4 }} />
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }} numberOfLines={1}>
                      {item.assignedInstitution || 'BIT Sindri Lab Team'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push(`/problem/${item._id || item.id}` as any)}
                    style={{ paddingVertical: 6, paddingHorizontal: 8 }}
                  >
                    <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '600' }}>Audit Timeline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenPledge(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      backgroundColor: theme.citizenPrimary,
                    }}
                  >
                    <Award size={13} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>Pledge Grant</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* CSR Pledge Modal */}
      <Modal visible={!!selectedProject} transparent animationType="slide" onRequestClose={() => setSelectedProject(null)}>
        {selectedProject ? (
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
            <View style={{ 
              backgroundColor: theme.card, 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24, 
              padding: 24, 
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View>
                  <Text style={{ color: theme.citizenPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
                    CSR PLEDGE INTENT
                  </Text>
                  <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', marginTop: 2 }}>
                    Fund Civic Prototype
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedProject(null)} style={{ padding: 6 }}>
                  <X size={22} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '700', marginBottom: 14 }} numberOfLines={1}>
                {selectedProject.title}
              </Text>

              {/* Escrow 3-Tranche Breakdown */}
              <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>
                3-TRANCHE MILESTONE ESCROW
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <View style={{ flex: 1, backgroundColor: theme.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.authorityPrimary, alignItems: 'center' }}>
                  <Text style={{ color: theme.authorityPrimary, fontSize: 16, fontWeight: '900' }}>30%</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>Lab Build</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: theme.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.citizenPrimary, alignItems: 'center' }}>
                  <Text style={{ color: theme.citizenPrimary, fontSize: 16, fontWeight: '900' }}>40%</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>Field Pilot</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: theme.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border, alignItems: 'center' }}>
                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '900' }}>30%</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>Handover</Text>
                </View>
              </View>

              {/* Terms checkbox */}
              <TouchableOpacity 
                onPress={() => setAgreedTerms(!agreedTerms)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}
              >
                {agreedTerms ? (
                  <CheckSquare size={18} color={theme.citizenPrimary} />
                ) : (
                  <Square size={18} color={theme.subtext} />
                )}
                <Text style={{ color: theme.textSecondary, fontSize: 12, flex: 1 }}>
                  I accept the 3-tranche escrow and Civic Commons License terms.
                </Text>
              </TouchableOpacity>

              <Text style={{ color: theme.subtext, fontSize: 11, lineHeight: 16, marginBottom: 18 }}>
                Tranche 2 remains locked until a ULB municipal engineer clears the test site. MCA Schedule VII eligibility is officially stamped.
              </Text>

              {pledged && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <CheckCircle size={16} color={theme.authorityPrimary} />
                  <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: '700' }}>
                    Pledge intent recorded in blockchain registry.
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setSelectedProject(null)}
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
                  onPress={handleConfirmPledge}
                  style={{
                    flex: 1.6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 13,
                    borderRadius: 12,
                    backgroundColor: theme.citizenPrimary,
                  }}
                >
                  <ShieldCheck size={16} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Confirm Pledge</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </Modal>

    </SafeAreaView>
  );
}
