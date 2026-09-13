import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Filter, MapPin, CheckCircle2, ShieldAlert, FileText, Search, 
  Share2, X, Compass, Award, ExternalLink 
} from 'lucide-react-native';
import { useProblemStore } from '../../store/problemStore';
import { useTheme } from '../../context/ThemeContext';
import { useToastStore } from '../../store/toastStore';

export default function HeiProblemReviewScreen() {
  const router = useRouter();
  const { problems, isLoading, fetchProblems } = useProblemStore() as any;
  const { theme, isDarkMode } = useTheme();
  const { showToast } = useToastStore();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDossier, setActiveDossier] = useState<any>(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const getTier = (item: any) => {
    return item.complexityTier || (item.urgency === 'urgent' ? 3 : item.urgency === 'high' ? 2 : 1);
  };

  const getTierLabel = (tier: number) => {
    if (tier === 4) return 'Tier 4 • R&D Intensive';
    if (tier === 3) return 'Tier 3 • Advanced Capstone';
    if (tier === 2) return 'Tier 2 • Applied Engineering';
    return 'Tier 1 • Foundation Civic';
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((p: any) => {
      const text = `${p.title} ${p.description} ${p.category} ${p.location?.district || ''}`.toLowerCase();
      const matchesSearch = text.includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'energy') return p.category?.toLowerCase().includes('energy') || p.category?.toLowerCase().includes('water') || p.title?.toLowerCase().includes('water') || p.title?.toLowerCase().includes('solar');
      if (selectedFilter === 'infra') return p.category?.toLowerCase().includes('infra') || p.category?.toLowerCase().includes('road') || p.category?.toLowerCase().includes('bridge');
      if (selectedFilter === 'agritech') return p.category?.toLowerCase().includes('agri') || p.category?.toLowerCase().includes('rural');
      return true;
    });
  }, [problems, searchQuery, selectedFilter]);

  const handleClaim = (problemId: string, title: string) => {
    Alert.alert(
      "Claim Societal Challenge",
      `Allocate "${title}" to your institution's Capstone / R&D laboratory and assign a student research team?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Claim",
          onPress: () => {
            showToast("Challenge claimed! Assigned to institutional repository.", "success");
            router.push('/(hei)/home');
          }
        }
      ]
    );
  };

  const openDossier = (item: any) => {
    const tier = getTier(item);
    setActiveDossier({
      id: item._id || item.id,
      title: item.title,
      district: item.location?.district || 'Jharkhand',
      description: item.description,
      tier,
      tierLabel: getTierLabel(tier),
      urgency: item.urgency || 'Standard',
      category: item.category || 'Civic Infrastructure',
      content: `SAMVAD SETU ENGINEERING DOSSIER\n\nREF: ${item._id || item.id}\nWHAT: ${item.title}\nWHERE: ${item.location?.district || 'Jharkhand'}\nWHY: ${item.description}\nWHO: Municipal ULB + HEI Student Team\nHOW: Validate proposed prototype through phased field testing.\nCOMPLEXITY: Tier ${tier} (${getTierLabel(tier)})`
    });
  };

  const handleShareDossier = async () => {
    if (!activeDossier) return;
    try {
      await Share.share({
        message: activeDossier.content,
        title: `${activeDossier.title} - Engineering Dossier`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Compass size={14} color={theme.authorityPrimary} />
            <Text style={{ fontSize: 11, color: theme.authorityPrimary, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
              Phase 5 • Institutional Workflow
            </Text>
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            Review & Claim Queue
          </Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4, lineHeight: 18 }}>
            Adopt AI-categorized civic problems near your institution for student Capstone & R&D projects.
          </Text>
        </View>

        {/* Safety Guardrail Alert */}
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: theme.errorBg, 
          borderWidth: 1, 
          borderColor: isDarkMode ? 'rgba(248, 113, 113, 0.3)' : 'rgba(220, 38, 38, 0.25)', 
          borderRadius: 14, 
          padding: 14, 
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 18
        }}>
          <ShieldAlert size={20} color={theme.error} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.error, fontSize: 12, fontWeight: '800', marginBottom: 2 }}>
              1st-Year Safety Guardrail
            </Text>
            <Text style={{ color: isDarkMode ? '#FCA5A5' : '#B91C1C', fontSize: 12, lineHeight: 17 }}>
              Tier 3 and Tier 4 R&D briefs require senior faculty supervision and are restricted from junior-only teams.
            </Text>
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
          marginBottom: 12,
        }}>
          <Search size={18} color={theme.subtext} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search problems by domain or district..."
            placeholderTextColor={theme.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: theme.text, fontSize: 14 }}
          />
        </View>

        {/* Domain Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 20 }}>
          {[
            { key: 'all', label: 'All Open Issues' },
            { key: 'energy', label: 'Renewable & Water' },
            { key: 'infra', label: 'Infrastructure' },
            { key: 'agritech', label: 'Agritech & Rural' },
          ].map((chip) => {
            const isSelected = selectedFilter === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                onPress={() => setSelectedFilter(chip.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isSelected ? theme.authorityPrimary : theme.surface,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.authorityPrimary : theme.border,
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
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={theme.authorityPrimary} size="large" />
            <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading available institutional problems...</Text>
          </View>
        ) : filteredProblems.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Award size={36} color={theme.subtext} style={{ marginBottom: 12 }} />
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
              No issues match your criteria
            </Text>
            <Text style={{ color: theme.subtext, fontSize: 13, textAlign: 'center' }}>
              Try broadening your search or domain filter to explore more civic challenges.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {filteredProblems.map((item: any) => {
              const tier = getTier(item);
              const tierLabel = getTierLabel(tier);
              const isHighUrgency = item.urgency === 'urgent' || item.urgency === 'high';

              return (
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
                  {/* Card Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: theme.subtext, fontSize: 11, fontFamily: 'monospace' }}>
                        #{String(item._id || item.id).slice(-6).toUpperCase()}
                      </Text>
                      <View style={{ 
                        backgroundColor: isHighUrgency ? (isDarkMode ? 'rgba(232, 163, 61, 0.15)' : 'rgba(203, 125, 24, 0.12)') : theme.surface, 
                        paddingHorizontal: 8, 
                        paddingVertical: 3, 
                        borderRadius: 6 
                      }}>
                        <Text style={{ 
                          color: isHighUrgency ? theme.citizenPrimary : theme.subtext, 
                          fontSize: 10, 
                          fontWeight: '800' 
                        }}>
                          AI: {item.urgency?.toUpperCase() || 'NORMAL'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ 
                      backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)', 
                      paddingHorizontal: 8, 
                      paddingVertical: 3, 
                      borderRadius: 6 
                    }}>
                      <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '800' }}>
                        {tierLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Title & Description */}
                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 6 }} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={{ color: theme.subtext, fontSize: 13, lineHeight: 18, marginBottom: 14 }} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Meta Strip */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={13} color={theme.citizenPrimary} style={{ marginRight: 4 }} />
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                        {item.location?.district || 'Jharkhand'}
                      </Text>
                    </View>
                    <Text style={{ color: theme.subtext, fontSize: 12 }}>
                      Domain: <Text style={{ color: theme.text, fontWeight: '600' }}>{item.category}</Text>
                    </Text>
                  </View>

                  {/* Actions Row */}
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    borderTopWidth: 1, 
                    borderTopColor: theme.borderSubtle, 
                    paddingTop: 12,
                    gap: 8,
                  }}>
                    <TouchableOpacity
                      onPress={() => openDossier(item)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        backgroundColor: theme.surface,
                      }}
                    >
                      <FileText size={13} color={theme.textSecondary} />
                      <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '700' }}>Dossier</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => router.push(`/problem/${item._id || item.id}` as any)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                      }}
                    >
                      <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '600' }}>Details →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleClaim(item._id || item.id, item.title)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        backgroundColor: theme.authorityPrimary,
                      }}
                    >
                      <CheckCircle2 size={14} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>Claim</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* Dossier Inspection Modal */}
      <Modal visible={!!activeDossier} transparent animationType="slide" onRequestClose={() => setActiveDossier(null)}>
        {activeDossier ? (
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
            <View style={{ 
              backgroundColor: theme.card, 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24, 
              padding: 24, 
              maxHeight: '85%',
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View>
                  <Text style={{ color: theme.authorityPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
                    ENGINEERING DOSSIER
                  </Text>
                  <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', marginTop: 2 }}>
                    {activeDossier.title}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setActiveDossier(null)} style={{ padding: 6 }}>
                  <X size={22} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginBottom: 20 }}>
                <View style={{ backgroundColor: theme.surface, padding: 14, borderRadius: 12, marginBottom: 12 }}>
                  <Text style={{ color: theme.subtext, fontSize: 11, marginBottom: 4 }}>MUNICIPAL LOCATION & DOMAIN</Text>
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>
                    {activeDossier.district} • {activeDossier.category}
                  </Text>
                </View>

                <View style={{ backgroundColor: theme.surface, padding: 14, borderRadius: 12, marginBottom: 12 }}>
                  <Text style={{ color: theme.subtext, fontSize: 11, marginBottom: 4 }}>RESEARCH CLASSIFICATION</Text>
                  <Text style={{ color: theme.authorityPrimary, fontSize: 13, fontWeight: '700' }}>
                    {activeDossier.tierLabel}
                  </Text>
                </View>

                <View style={{ backgroundColor: theme.surface, padding: 14, borderRadius: 12, marginBottom: 12 }}>
                  <Text style={{ color: theme.subtext, fontSize: 11, marginBottom: 4 }}>PROBLEM CONTEXT & BRIEF</Text>
                  <Text style={{ color: theme.text, fontSize: 13, lineHeight: 20 }}>
                    {activeDossier.description}
                  </Text>
                </View>

                <View style={{ backgroundColor: isDarkMode ? '#0F1A1D' : '#F0F5F4', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}>
                  <Text style={{ color: theme.subtext, fontSize: 11, fontFamily: 'monospace', marginBottom: 6 }}>EXPECTED LAB OUTCOME</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 18 }}>
                    Design a robust, low-cost prototype (TRL 3-5), validate under field conditions with the local civic body, and prepare a bill of materials for CSR co-financing.
                  </Text>
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={handleShareDossier}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: theme.surface,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Share2 size={16} color={theme.text} />
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>Share Brief</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const id = activeDossier?.id;
                    const title = activeDossier?.title || '';
                    setActiveDossier(null);
                    if (id) handleClaim(id, title);
                  }}
                  style={{
                    flex: 1.4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: theme.authorityPrimary,
                  }}
                >
                  <CheckCircle2 size={16} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Claim Challenge</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </Modal>

    </SafeAreaView>
  );
}
