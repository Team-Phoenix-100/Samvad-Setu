import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  Mail,
  Phone,
  LogOut,
  CheckCircle2,
  Activity,
  FileText,
  Building2,
  ChevronRight,
  Shield,
  Server,
  Sparkles,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useGovStore } from '../../store/govStore';

export default function GovernmentProfileScreen() {
  const router = useRouter();
  const { summary } = useGovStore();
  const [officialEmail, setOfficialEmail] = useState('dhte.admin@jharkhand.gov.in');
  const [officialPhone, setOfficialPhone] = useState('+91 651 2490520');
  const [officialName, setOfficialName] = useState('Dr. Rajeshwar Soren, IAS');

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const sessionJson = await AsyncStorage.getItem('@app_current_session');
      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        if (session.name) setOfficialName(session.name);
        if (session.email) setOfficialEmail(session.email);
        if (session.phone) setOfficialPhone(`+91 ${session.phone}`);
      }
    } catch (error) {
      console.error('Error loading official user data', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Secure Sign Out', 'End your official DHTE administrative session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['@app_user_role', '@app_current_session', '@app_user_token']);
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0F1B1E' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.taglineBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.taglineText}>OFFICIAL DHTE DIRECTORY</Text>
          </View>
          <Text style={styles.title}>DHTE State Office</Text>
          <Text style={styles.subtitle}>
            Dept. of Higher & Technical Education • Govt. of Jharkhand
          </Text>
        </View>

        {/* Official Identity Card */}
        <View style={styles.identityCard}>
          <View style={styles.avatarBox}>
            <ShieldCheck size={38} color="#2F9E8F" />
          </View>
          <Text style={styles.officialName}>{officialName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>DIRECTOR GENERAL • STATE CONSOLE</Text>
          </View>

          <View style={styles.contactDetails}>
            <View style={styles.contactRow}>
              <Mail size={15} color="#9BA8A6" />
              <Text style={styles.contactText}>{officialEmail}</Text>
            </View>
            <View style={styles.contactRow}>
              <Phone size={15} color="#9BA8A6" />
              <Text style={styles.contactText}>{officialPhone}</Text>
            </View>
            <View style={styles.contactRow}>
              <Building2 size={15} color="#9BA8A6" />
              <Text style={styles.contactText}>DHTE Headquarters, Project Building, Dhurwa, Ranchi</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <Text style={styles.sectionHeader}>ADMINISTRATIVE CONTROLS</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(government)/audit-log' as any)}>
          <View style={styles.menuIconBox}>
            <FileText size={18} color="#2F9E8F" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Immutable Audit Trail</Text>
            <Text style={styles.menuSub}>View cryptographic ledger of all moderation actions</Text>
          </View>
          <ChevronRight size={18} color="#9BA8A6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(government)/institutions' as any)}>
          <View style={styles.menuIconBox}>
            <Building2 size={18} color="#E8A33D" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Accreditation Registry</Text>
            <Text style={styles.menuSub}>Verify AISHE university & corporate CSR registrations</Text>
          </View>
          <ChevronRight size={18} color="#9BA8A6" />
        </TouchableOpacity>

        {/* System Health */}
        <Text style={styles.sectionHeader}>SYSTEM & NODE STATUS</Text>
        <View style={styles.systemHealthCard}>
          <View style={styles.healthRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Server size={16} color="#2F9E8F" />
              <Text style={styles.healthLabel}>DHTE AI Engine Service</Text>
            </View>
            <View style={styles.healthStatusPill}>
              <Text style={styles.healthStatusText}>OPERATIONAL</Text>
            </View>
          </View>

          <View style={styles.healthRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#2F9E8F" />
              <Text style={styles.healthLabel}>Human-in-the-Loop Threshold</Text>
            </View>
            <Text style={styles.healthValue}>75% Confidence Cutoff</Text>
          </View>

          <View style={[styles.healthRow, { borderBottomWidth: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Building2 size={16} color="#4E7AFF" />
              <Text style={styles.healthLabel}>AISHE / CIN Validator</Text>
            </View>
            <Text style={styles.healthValue}>Connected (NIC Gateway)</Text>
          </View>
        </View>

        {/* Secure Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#F87171" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Secure Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2F9E8F',
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2F9E8F',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F2EFE9',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#9BA8A6',
    marginTop: 2,
  },
  identityCard: {
    backgroundColor: '#16262A',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1D3238',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(47, 158, 143, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2F9E8F',
  },
  officialName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F2EFE9',
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: '#0F1B1E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 16,
  },
  roleBadgeText: {
    color: '#2F9E8F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  contactDetails: {
    width: '100%',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
    paddingTop: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    color: '#9BA8A6',
    fontSize: 12,
    flex: 1,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9BA8A6',
    letterSpacing: 1,
    marginBottom: 10,
  },
  menuItem: {
    backgroundColor: '#16262A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1D3238',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F1B1E',
    borderWidth: 1,
    borderColor: '#1D3238',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F2EFE9',
  },
  menuSub: {
    fontSize: 11,
    color: '#9BA8A6',
    marginTop: 2,
  },
  systemHealthCard: {
    backgroundColor: '#16262A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 24,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1D3238',
  },
  healthLabel: {
    fontSize: 12,
    color: '#F2EFE9',
    fontWeight: '600',
  },
  healthStatusPill: {
    backgroundColor: 'rgba(47, 158, 143, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2F9E8F',
  },
  healthStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2F9E8F',
  },
  healthValue: {
    fontSize: 11,
    color: '#9BA8A6',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: 'rgba(193, 68, 59, 0.15)',
    borderWidth: 1,
    borderColor: '#C1443B',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 14,
  },
});