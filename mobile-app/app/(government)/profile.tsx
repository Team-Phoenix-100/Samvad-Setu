import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, Mail, Phone, LogOut, CheckCircle2, Activity } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function GovernmentProfileScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, resolved: 0 });
  const [officialEmail, setOfficialEmail] = useState('admin@hmc.gov');
  const [officialPhone, setOfficialPhone] = useState('+91 ----------');
  const [officialName, setOfficialName] = useState('HMC Administrator');
  const { theme, isDarkMode } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
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

  const loadStats = async () => {
    try {
      const storedTickets = await AsyncStorage.getItem('@citizen_tickets');
      if (storedTickets) {
        const parsed = JSON.parse(storedTickets);
        const resolvedCount = parsed.filter((t: any) => t.status === 'Resolved').length;
        setStats({ total: parsed.length, resolved: resolvedCount });
      }
    } catch (error) {
      console.error('Error loading stats', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Secure Sign Out', 'End this official session?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['@app_user_role', '@app_current_session', '@app_user_token']);
          router.replace('/(auth)/login' as any);
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View style={{ marginBottom: 28, marginTop: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text }}>Official Profile</Text>
        </View>

        {/* Official Identity Card */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.border, marginBottom: 24, alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.1)' : 'rgba(35, 122, 110, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: theme.authorityPrimary }}>
            <ShieldCheck size={40} color={theme.authorityPrimary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 4 }}>{officialName}</Text>
          <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: 'bold', marginBottom: 16, letterSpacing: 1 }}>ZONE 2 SUPERVISOR</Text>
          
          <View style={{ width: '100%', gap: 10, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Mail size={16} color={theme.subtext} style={{ marginRight: 10 }} />
              <Text style={{ color: theme.subtext, fontSize: 13, flex: 1 }}>{officialEmail}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Phone size={16} color={theme.subtext} style={{ marginRight: 10 }} />
              <Text style={{ color: theme.subtext, fontSize: 13, flex: 1 }}>{officialPhone}</Text>
            </View>
          </View>
        </View>

        {/* Team Performance Stats */}
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Department Performance</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, alignItems: 'center' }}>
            <Activity size={24} color={theme.citizenPrimary} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>{stats.total}</Text>
            <Text style={{ color: theme.subtext, fontSize: 11, marginTop: 4, textAlign: 'center' }}>TOTAL TICKETS ASSIGNED</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, alignItems: 'center' }}>
            <CheckCircle2 size={24} color={theme.authorityPrimary} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>{stats.resolved}</Text>
            <Text style={{ color: theme.subtext, fontSize: 11, marginTop: 4, textAlign: 'center' }}>ISSUES RESOLVED</Text>
          </View>
        </View>

        {/* Secure Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(217, 56, 56, 0.1)', 
            borderWidth: 1, 
            borderColor: theme.error, 
            borderRadius: 12, 
            paddingVertical: 16, 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <LogOut size={18} color={theme.error} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.error, fontWeight: 'bold', fontSize: 16 }}>Secure Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}