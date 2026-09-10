import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Moon, Shield, HelpCircle, LogOut, ChevronRight, User } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function CitizenSettingsScreen() {
  const { user, logout } = useAuthStore() as any;
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const SettingRow = ({ icon: Icon, title, subtitle, hasSwitch, switchValue, onSwitchChange, isDestructive, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={hasSwitch}
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#1D3238' 
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.1)' : '#1D3238', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
        <Icon size={20} color={isDestructive ? '#EF4444' : '#E8A33D'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: isDestructive ? '#EF4444' : '#F2EFE9', fontSize: 16, fontWeight: '600', marginBottom: subtitle ? 4 : 0 }}>{title}</Text>
        {subtitle && <Text style={{ color: '#9BA8A6', fontSize: 12 }}>{subtitle}</Text>}
      </View>
      {hasSwitch ? (
        <Switch
          trackColor={{ false: '#1D3238', true: 'rgba(232, 163, 61, 0.5)' }}
          thumbColor={switchValue ? '#E8A33D' : '#9BA8A6'}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        <ChevronRight size={20} color="#9BA8A6" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1B1E' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#F2EFE9', marginBottom: 4 }}>Settings</Text>
          <Text style={{ fontSize: 13, color: '#9BA8A6' }}>Manage your preferences and account settings.</Text>
        </View>

        {/* Account Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: '#9BA8A6', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>ACCOUNT</Text>
          <View style={{ backgroundColor: '#16262A', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: '#1D3238' }}>
            <SettingRow 
              icon={User} 
              title="Personal Information" 
              subtitle={user?.email || "Update your contact details"}
              onPress={() => router.push('/(citizen)/profile')}
            />
            <SettingRow 
              icon={Shield} 
              title="Security & Privacy" 
              subtitle="Password, DPDP consent"
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: '#9BA8A6', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>PREFERENCES</Text>
          <View style={{ backgroundColor: '#16262A', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: '#1D3238', paddingBottom: 16 }}>
            <SettingRow 
              icon={Bell} 
              title="Push Notifications" 
              subtitle="Alerts for ticket updates"
              hasSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
            
            <View style={{ paddingTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#1D3238', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <Moon size={20} color="#E8A33D" />
                </View>
                <View>
                  <Text style={{ color: '#F2EFE9', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>App Theme</Text>
                  <Text style={{ color: '#9BA8A6', fontSize: 12 }}>Select interface color scheme</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', backgroundColor: '#0F1B1E', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#1D3238' }}>
                {['Light', 'System', 'Dark'].map((themeOption) => {
                  const isActive = (themeOption === 'Dark' && isDarkMode) || (themeOption === 'System' && !isDarkMode); // simplified logic for UI simulation
                  return (
                    <TouchableOpacity
                      key={themeOption}
                      onPress={() => setIsDarkMode(themeOption === 'Dark')}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: themeOption === 'Dark' ? '#1D3238' : 'transparent',
                        borderRadius: 8,
                        borderWidth: themeOption === 'Dark' ? 1 : 0,
                        borderColor: themeOption === 'Dark' ? 'rgba(232, 163, 61, 0.3)' : 'transparent',
                      }}
                    >
                      <Text style={{ 
                        color: themeOption === 'Dark' ? '#E8A33D' : '#9BA8A6', 
                        fontSize: 13, 
                        fontWeight: themeOption === 'Dark' ? '700' : '500' 
                      }}>
                        {themeOption}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

          </View>
        </View>

        {/* Support Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: '#9BA8A6', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>SUPPORT</Text>
          <View style={{ backgroundColor: '#16262A', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: '#1D3238' }}>
            <SettingRow 
              icon={HelpCircle} 
              title="Help Center" 
              subtitle="FAQs and contact support"
            />
            <SettingRow 
              icon={LogOut} 
              title="Log Out" 
              isDestructive
              onPress={handleLogout}
            />
          </View>
        </View>
        
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ color: '#9BA8A6', fontSize: 11 }}>Samvad Setu App v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
