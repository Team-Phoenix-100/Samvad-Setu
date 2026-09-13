import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, Mail, Phone, MapPin, Building, ShieldCheck, 
  LogOut, Calendar, Fingerprint, Activity, ChevronRight
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, fetchProfile, isLoading, logout } = useAuthStore() as any;
  const { showToast } = useToastStore();
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast("Successfully logged out!", "success");
    router.replace('/(auth)/login');
  };

  if (isLoading && !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.citizenPrimary} />
        <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading profile data...</Text>
      </SafeAreaView>
    );
  }

  const formatDOB = (dobStr: string) => {
    if (!dobStr) return 'Not provided';
    const date = new Date(dobStr);
    return date.toLocaleDateString();
  };

  const getFullAddress = () => {
    const parts = [user?.address, user?.city, user?.district, user?.state, user?.pinCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: theme.text, marginBottom: 4 }}>Civic Profile</Text>
          <Text style={{ fontSize: 13, color: theme.subtext, lineHeight: 20 }}>
            Manage your identity, demographic data, and platform preferences.
          </Text>
        </View>

        {/* Avatar & Trust Score Card */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 24, alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.surface, borderWidth: 2, borderColor: theme.citizenPrimary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: theme.citizenPrimary }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </Text>
          </View>
          
          <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 8 }}>{user?.name || 'Citizen User'}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)', borderWidth: 1, borderColor: isDarkMode ? 'rgba(47, 158, 143, 0.3)' : 'rgba(5, 150, 105, 0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
            <ShieldCheck size={14} color={theme.authorityPrimary} style={{ marginRight: 6 }} />
            <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
              {user?.role?.replace('_', ' ') || 'Citizen'}
            </Text>
          </View>

          <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: theme.borderSubtle, marginTop: 24, paddingTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Activity size={14} color={theme.subtext} style={{ marginRight: 6 }} />
                <Text style={{ color: theme.subtext, fontSize: 12 }}>Civic Trust Score</Text>
              </View>
              <Text style={{ color: theme.citizenPrimary, fontSize: 14, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>842</Text>
            </View>
            <View style={{ width: '100%', height: 6, backgroundColor: theme.surface, borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ width: '84%', height: '100%', backgroundColor: theme.authorityPrimary }} />
            </View>
          </View>
        </View>

        {/* Digital Identity Block */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', marginBottom: 20 }}>
          <View style={{ backgroundColor: theme.surface, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <Text style={{ color: theme.text, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Digital Identity</Text>
          </View>
          <View style={{ padding: 20, gap: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ backgroundColor: theme.surface, padding: 10, borderRadius: 12, marginRight: 16 }}>
                <User size={18} color={theme.subtext} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>Full Legal Name</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{user?.name || 'Not provided'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ backgroundColor: theme.surface, padding: 10, borderRadius: 12, marginRight: 16 }}>
                <Fingerprint size={18} color={theme.subtext} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>Gender</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' }}>{user?.gender?.replace(/-/g, ' ') || 'Not provided'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ backgroundColor: theme.surface, padding: 10, borderRadius: 12, marginRight: 16 }}>
                <Calendar size={18} color={theme.subtext} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>Date of Birth</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{formatDOB(user?.dateOfBirth)}</Text>
              </View>
            </View>

            {(user?.role === 'hei' || user?.role === 'industry_csr') && (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ backgroundColor: theme.surface, padding: 10, borderRadius: 12, marginRight: 16 }}>
                  <Building size={18} color={theme.subtext} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>Organization / Registration ID</Text>
                  <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{user?.institutionName || user?.companyName || 'Not provided'}</Text>
                  {user?.regId && <Text style={{ color: theme.citizenPrimary, fontSize: 12, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>{user.regId}</Text>}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Contact & Location Block */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', marginBottom: 20 }}>
          <View style={{ backgroundColor: theme.surface, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <Text style={{ color: theme.text, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Contact & Geolocation</Text>
          </View>
          <View style={{ padding: 20, gap: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ backgroundColor: theme.surface, padding: 10, borderRadius: 12, marginRight: 16 }}>
                <Mail size={18} color={theme.subtext} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>Email Address</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{user?.email || 'Not provided'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ backgroundColor: theme.surface, padding: 10, borderRadius: 12, marginRight: 16 }}>
                <Phone size={18} color={theme.subtext} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>Phone Number</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ backgroundColor: theme.surface, padding: 10, borderRadius: 12, marginRight: 16 }}>
                <MapPin size={18} color={theme.subtext} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>Registered Address</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', lineHeight: 20 }}>{getFullAddress()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Block */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={{ color: theme.error, fontSize: 14, fontWeight: '800', marginBottom: 4 }}>Terminate Session</Text>
            <Text style={{ color: theme.subtext, fontSize: 12 }}>Securely sign out of this device.</Text>
          </View>
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.errorBg, borderWidth: 1, borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.25)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}
          >
            <LogOut size={16} color={theme.error} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.error, fontSize: 13, fontWeight: '700' }}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}