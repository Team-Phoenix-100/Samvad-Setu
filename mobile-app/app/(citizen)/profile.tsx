import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, MapPin, Mail, Phone, Award, LogOut, Clock, CheckCircle2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

export default function CitizenProfileScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const { theme, isDarkMode } = useTheme();
  
  const [userName, setUserName] = useState('Citizen User');
  const [userEmail, setUserEmail] = useState('Not provided');
  const [userPhone, setUserPhone] = useState('+91 ----------');

  const { logout } = useAuthStore();
  const { showToast } = useToastStore();

  useFocusEffect(
    React.useCallback(() => {
      loadTickets();
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const sessionJson = await AsyncStorage.getItem('@app_current_session');
      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        if (session.name) setUserName(session.name);
        if (session.email) setUserEmail(session.email);
        if (session.phone) setUserPhone(`+91 ${session.phone}`);
      }
    } catch (error) {
      console.error('Failed to load user session', error);
    }
  };

  const loadTickets = async () => {
    try {
      const stored = await AsyncStorage.getItem('@citizen_tickets');
      if (stored) setTickets(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to load tickets', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await logout();
          showToast('Logged out successfully', 'success');
          router.replace('/(auth)/login' as any);
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, marginBottom: 20 }}>Citizen Profile</Text>

        {/* User Info Card */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.border, alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.citizenPrimary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <User size={40} color={isDarkMode ? '#0F1B1E' : '#FFFFFF'} />
          </View>
          
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 4 }}>{userName}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MapPin size={14} color={theme.subtext} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 13, color: theme.subtext }}>Howrah, West Bengal, India</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? 'rgba(232, 163, 61, 0.1)' : 'rgba(212, 138, 34, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.citizenPrimary }}>
            <Award size={16} color={theme.citizenPrimary} style={{ marginRight: 6 }} />
            <Text style={{ color: theme.citizenPrimary, fontSize: 12, fontWeight: 'bold' }}>Civic Contributor • Level 2</Text>
          </View>
        </View>

        {/* Contact Details */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 24 }}>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Account Details</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Mail size={18} color={theme.subtext} style={{ marginRight: 12 }} />
            <View>
              <Text style={{ color: theme.subtext, fontSize: 11 }}>EMAIL</Text>
              <Text style={{ color: theme.text, fontSize: 14 }}>{userEmail}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Phone size={18} color={theme.subtext} style={{ marginRight: 12 }} />
            <View>
              <Text style={{ color: theme.subtext, fontSize: 11 }}>PHONE</Text>
              <Text style={{ color: theme.text, fontSize: 14 }}>{userPhone}</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Stored Reports */}
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>My Submitted Reports</Text>
        
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 24 }}>
          {tickets.length === 0 ? (
            <Text style={{ color: theme.subtext, fontSize: 13, textAlign: 'center', paddingVertical: 10 }}>No reports submitted yet.</Text>
          ) : (
            tickets.map((item, index) => {
              const isResolved = item.status === 'Resolved';
              return (
                <View 
                  key={index} 
                  style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    paddingBottom: index < tickets.length - 1 ? 12 : 0, 
                    borderBottomWidth: index < tickets.length - 1 ? 1 : 0, 
                    borderBottomColor: theme.border, 
                    marginBottom: index < tickets.length - 1 ? 12 : 0 
                  }}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 14 }}>{item.description}</Text>
                    <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 4 }}>{item.id} • {item.category}</Text>
                  </View>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: isResolved ? (isDarkMode ? 'rgba(47, 158, 143, 0.1)' : 'rgba(35, 122, 110, 0.1)') : (isDarkMode ? 'rgba(232, 163, 61, 0.1)' : 'rgba(212, 138, 34, 0.1)'), 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: isResolved ? theme.authorityPrimary : theme.citizenPrimary
                  }}>
                    {isResolved ? (
                      <CheckCircle2 size={12} color={theme.authorityPrimary} style={{ marginRight: 4 }} />
                    ) : (
                      <Clock size={12} color={theme.citizenPrimary} style={{ marginRight: 4 }} />
                    )}
                    <Text style={{ color: isResolved ? theme.authorityPrimary : theme.citizenPrimary, fontSize: 11, fontWeight: 'bold' }}>{item.status}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Secure Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(217, 56, 56, 0.1)', 
            borderWidth: 1, 
            borderColor: theme.error, 
            paddingVertical: 14, 
            borderRadius: 12, 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <LogOut size={18} color={theme.error} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.error, fontWeight: 'bold', fontSize: 15 }}>Secure Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}