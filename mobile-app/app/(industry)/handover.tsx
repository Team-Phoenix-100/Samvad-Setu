import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CheckCircle2, Download, FileCheck, LockKeyhole, ShieldCheck, Share2, Award 
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useToastStore } from '../../store/toastStore';

export default function HandoverCertificationScreen() {
  const { theme, isDarkMode } = useTheme();
  const { showToast } = useToastStore();

  const [corporateSigned, setCorporateSigned] = useState(false);
  const [ulbSigned, setUlbSigned] = useState(false);

  const complete = corporateSigned && ulbSigned;

  const handleSignCorporate = () => {
    setCorporateSigned(true);
    showToast("Corporate audit sign-off successfully recorded.", "success");
  };

  const handleSignULB = () => {
    setUlbSigned(true);
    showToast("ULB municipal engineer handover signed.", "success");
  };

  const handleShareCertificate = async () => {
    const certificate = `MCA SECTION 135 CSR-1 IMPACT CERTIFICATE\n\nSamvad Setu Civic Commons Programme\nProject: Solar Water Pump & Purifier\nCorporate Contributor: Tata Steel Foundation\nImplementing HEI: Birsa Institute of Technology, Sindri\nULB: Ranchi Municipal Corporation\n\nImpact: Permanent civic handover completed after field validation.\nCSR Taxonomy: MCA Schedule VII Item IV & Item II\nTranche 3: Released (100% Escrow Cleared)\nIssued: ${new Date().toLocaleDateString('en-IN')}`;
    
    try {
      await Share.share({
        message: certificate,
        title: 'MCA SECTION 135 CSR-1 IMPACT CERTIFICATE',
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <FileCheck size={15} color={theme.authorityPrimary} />
            <Text style={{ fontSize: 11, color: theme.authorityPrimary, fontWeight: '800', letterSpacing: 1 }}>
              FINAL HANDOVER & AUDIT
            </Text>
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            Civic Handover Certification
          </Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4, lineHeight: 18 }}>
            Complete both institutional sign-offs to release Tranche 3 escrow and issue the MCA Section 135 CSR impact record.
          </Text>
        </View>

        {/* Two-Party Sign-Off Cards */}
        <View style={{ gap: 14, marginBottom: 20 }}>
          {/* Corporate Auditor Card */}
          <View style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 18,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkMode ? 0.2 : 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
                Corporate Auditor
              </Text>
              {corporateSigned && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}>
                  <CheckCircle2 size={12} color={theme.authorityPrimary} />
                  <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '800' }}>SIGNED</Text>
                </View>
              )}
            </View>

            <Text style={{ color: theme.subtext, fontSize: 12, lineHeight: 17, marginBottom: 14 }}>
              Confirm the prototype met its funded pilot milestones and public-use license terms under the CSR agreement.
            </Text>

            <TouchableOpacity
              disabled={corporateSigned}
              onPress={handleSignCorporate}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: corporateSigned ? theme.surface : theme.citizenPrimary,
                borderWidth: corporateSigned ? 1 : 0,
                borderColor: theme.border,
              }}
            >
              <CheckCircle2 size={16} color={corporateSigned ? theme.authorityPrimary : '#FFFFFF'} />
              <Text style={{
                color: corporateSigned ? theme.textSecondary : '#FFFFFF',
                fontWeight: '800',
                fontSize: 13,
              }}>
                {corporateSigned ? 'Corporate Sign-Off Complete' : 'Sign Corporate Audit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ULB Municipal Engineer Card */}
          <View style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 18,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkMode ? 0.2 : 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
                ULB Municipal Engineer
              </Text>
              {ulbSigned && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}>
                  <CheckCircle2 size={12} color={theme.authorityPrimary} />
                  <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '800' }}>SIGNED</Text>
                </View>
              )}
            </View>

            <Text style={{ color: theme.subtext, fontSize: 12, lineHeight: 17, marginBottom: 14 }}>
              Confirm site clearance, field performance benchmarks, and permanent civic handover to local ward.
            </Text>

            <TouchableOpacity
              disabled={ulbSigned}
              onPress={handleSignULB}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: ulbSigned ? theme.surface : theme.authorityPrimary,
                borderWidth: ulbSigned ? 1 : 0,
                borderColor: theme.border,
              }}
            >
              <CheckCircle2 size={16} color={ulbSigned ? theme.authorityPrimary : '#FFFFFF'} />
              <Text style={{
                color: ulbSigned ? theme.textSecondary : '#FFFFFF',
                fontWeight: '800',
                fontSize: 13,
              }}>
                {ulbSigned ? 'ULB Handover Complete' : 'Sign ULB Handover'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Escrow Release Card */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 18,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <LockKeyhole size={18} color={theme.citizenPrimary} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
              Escrow Release Status
            </Text>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: theme.surface,
            padding: 12,
            borderRadius: 12,
            marginBottom: complete ? 14 : 0
          }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Tranche 3 • Final Handover
            </Text>
            <Text style={{ 
              color: complete ? theme.authorityPrimary : theme.citizenPrimary, 
              fontSize: 12, 
              fontWeight: '900' 
            }}>
              {complete ? 'READY TO RELEASE • 30%' : 'LOCKED • 30%'}
            </Text>
          </View>

          {complete && (
            <View style={{ borderTopWidth: 1, borderTopColor: theme.borderSubtle, paddingTop: 14, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} color={theme.authorityPrimary} />
                <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: '700' }}>
                  Permanent civic handover certified.
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleShareCertificate}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.authorityPrimary,
                }}
              >
                <Share2 size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                  Share CSR-1 Certificate
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
