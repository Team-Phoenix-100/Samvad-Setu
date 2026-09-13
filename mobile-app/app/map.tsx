import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function MapScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>Live Infrastructure Map</Text>
        <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 2 }}>Howrah Municipal Corporation Area</Text>
      </View>

      <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', alignItems: 'center' }}>
        <MapPin size={48} color={theme.authorityPrimary} style={{ marginBottom: 12 }} />
        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>Interactive Map View</Text>
        <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 4 }}>Displaying reported grievances around Howrah</Text>
      </View>
    </SafeAreaView>
  );
}