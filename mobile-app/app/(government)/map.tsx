import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { MapPin, Shield, Layers } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import LeafletMap, { MapMarker } from '../../components/LeafletMap';

const { width } = Dimensions.get('window');

const defaultJharkhandChallenges: MapMarker[] = [
  { id: 'JH-01', latitude: 23.3441, longitude: 85.3096, title: 'Ranchi Smart Water Grid Failure', category: 'Civil Infra', status: 'Pending', urgency: 'urgent' },
  { id: 'JH-02', latitude: 23.7957, longitude: 86.4304, title: 'Dhanbad Pithead Air Quality Sensors', category: 'Environmental', status: 'In Progress', urgency: 'high' },
  { id: 'JH-03', latitude: 22.8046, longitude: 86.2029, title: 'Jamshedpur Industrial Effluent Flow', category: 'Water & Sanitation', status: 'Critical', urgency: 'urgent' },
  { id: 'JH-04', latitude: 23.6693, longitude: 86.1511, title: 'Bokaro Thermal Solar Microgrid', category: 'Renewable Energy', status: 'In Progress' },
  { id: 'JH-05', latitude: 23.9925, longitude: 85.3637, title: 'Hazaribagh Agricultural Irrigation Sluice', category: 'Agriculture', status: 'Pending' },
  { id: 'JH-06', latitude: 24.4826, longitude: 86.6974, title: 'Deoghar Pilgrimage Route Waste Recycling', category: 'Civic Sanitation', status: 'Resolved' },
];

export default function GovernmentMapScreen() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, isDarkMode } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadMapData();
    }, [])
  );

  const loadMapData = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('@citizen_tickets');
      if (stored) {
        setChallenges(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load map data', error);
    } finally {
      setLoading(false);
    }
  };

  const markers: MapMarker[] = React.useMemo(() => {
    if (challenges.length > 0) {
      const parsedMarkers = challenges
        .filter(c => (c.latitude || c.location?.lat) && (c.longitude || c.location?.lng))
        .map((c, i) => {
          const lat = c.latitude !== undefined ? c.latitude : c.location?.lat;
          const lng = c.longitude !== undefined ? c.longitude : c.location?.lng;
          return {
            id: String(c.id || c._id || i),
            latitude: typeof lat === 'string' ? parseFloat(lat) : Number(lat),
            longitude: typeof lng === 'string' ? parseFloat(lng) : Number(lng),
            title: c.title || c.domain || 'State Challenge',
            category: c.category || c.domain || 'Infrastructure',
            status: c.status || c.stage || 'Pending',
            urgency: c.urgency || 'Standard',
          };
        });

      if (parsedMarkers.length > 0) {
        return parsedMarkers;
      }
    }
    return defaultJharkhandChallenges;
  }, [challenges]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 14, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 10, color: theme.subtext, letterSpacing: 1.2, fontWeight: '700' }}>
            DHTE SPATIAL INTELLIGENCE
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, marginTop: 2 }}>
            Jharkhand Innovation Map
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(47, 158, 143, 0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}>
          <Layers size={14} color={theme.authorityPrimary} />
          <Text style={{ color: theme.authorityPrimary, fontSize: 11, fontWeight: '800' }}>OpenStreetMap</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 10, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <View style={{ flex: 1, backgroundColor: theme.card, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700' }}>TOTAL PINNED</Text>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900' }}>{markers.length}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: theme.card, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700' }}>CRITICAL</Text>
          <Text style={{ color: theme.citizenPrimary, fontSize: 18, fontWeight: '900' }}>
            {markers.filter(m => m.status === 'Critical' || m.urgency === 'urgent').length}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: theme.card, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '700' }}>STATE RESOLVED</Text>
          <Text style={{ color: theme.authorityPrimary, fontSize: 18, fontWeight: '900' }}>
            {markers.filter(m => m.status === 'Resolved').length}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.authorityPrimary} />
          <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading OpenStreetMap spatial data...</Text>
        </View>
      ) : (
        <View style={[styles.mapContainer, { borderColor: theme.border }]}>
          <LeafletMap
            mode="view"
            initialLatitude={23.5}
            initialLongitude={85.8}
            initialZoom={8}
            markers={markers}
            height={520}
            isDarkMode={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 16,
    borderWidth: 1,
  },
});