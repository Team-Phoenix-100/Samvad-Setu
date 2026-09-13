import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Shield, HelpCircle, LogOut, ChevronRight, User, Globe, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { useTheme, ThemeSelector } from '../../context/ThemeContext';

export default function CitizenSettingsScreen() {
  const { user, logout } = useAuthStore() as any;
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const SettingRow = ({
    icon: Icon,
    title,
    subtitle,
    hasSwitch,
    switchValue,
    onSwitchChange,
    isDestructive,
    onPress,
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={hasSwitch}
      activeOpacity={0.7}
      style={[styles.settingRow, { borderBottomColor: theme.borderSubtle }]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: isDestructive ? theme.errorBg : theme.surface,
          },
        ]}
      >
        <Icon size={20} color={isDestructive ? theme.error : theme.citizenPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.rowTitle,
            { color: isDestructive ? theme.error : theme.text, marginBottom: subtitle ? 3 : 0 },
          ]}
        >
          {title}
        </Text>
        {subtitle && <Text style={[styles.rowSubtitle, { color: theme.subtext }]}>{subtitle}</Text>}
      </View>
      {hasSwitch ? (
        <Switch
          trackColor={{ false: theme.surface, true: theme.citizenSecondary }}
          thumbColor={switchValue ? theme.citizenPrimary : theme.subtext}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        <ChevronRight size={18} color={theme.subtext} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            Customize your interface, language, and account security.
          </Text>
        </View>

        {/* Appearance / Theme Mode Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.citizenPrimary }]}>
            APPEARANCE & THEME
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Sparkles size={16} color={theme.citizenPrimary} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Display Theme</Text>
              </View>
              <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>
                Choose between pristine Light Mode, sleek Dark Mode, or sync with your phone's System appearance.
              </Text>
            </View>
            <ThemeSelector />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SettingRow
              icon={User}
              title="Personal Information"
              subtitle={user?.email || 'Update your profile & location'}
              onPress={() => router.push('/(citizen)/profile')}
            />
            <SettingRow
              icon={Shield}
              title="Security & Privacy"
              subtitle="Password, biometric auth, DPDP consent"
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SettingRow
              icon={Bell}
              title="Push Notifications"
              subtitle="Alerts for civic ticket resolution"
              hasSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
            <SettingRow
              icon={Globe}
              title="Portal Language"
              subtitle="English (हिंदी / संथाली supported)"
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>SUPPORT & SESSION</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SettingRow
              icon={HelpCircle}
              title="Jharkhand Citizen Helpdesk"
              subtitle="Call 181 or read citizen handbook"
            />
            <SettingRow
              icon={LogOut}
              title="Sign Out"
              isDestructive
              onPress={handleLogout}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.subtext }]}>
            Samvad Setu • Jharkhand State Civic Innovation Platform
          </Text>
          <Text style={[styles.subVersionText, { color: theme.subtext }]}>
            v1.2.0 • Active Mode: {isDarkMode ? '🌙 Dark' : '☀️ Light'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subVersionText: {
    fontSize: 10,
  },
});
