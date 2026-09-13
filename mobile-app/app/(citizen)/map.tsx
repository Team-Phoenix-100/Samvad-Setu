import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, AlertCircle } from 'lucide-react-native';
import LeafletMap from '../../components/LeafletMap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext'; // Import theme hook

const hotspots = [
  { name: 'Howrah Station', count: 18, type: 'Water & Drainage', status: 'Critical' },
  { name: 'Rajabazar', count: 12, type: 'Street Lighting', status: 'Moderate' },
  { name: 'Liluah', count: 9, type: 'Waste Collection', status: 'Watchlist' },
  { name: 'Bally', count: 7, type: 'Road Repairs', status: 'Moderate' }
];

export default function CitizenMapScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const { theme, isDarkMode } = useTheme(); // Pull theme variables

  useFocusEffect(
    React.useCallback(() => {
      loadTickets();
    }, [])
  );

  const loadTickets = async () => {
    try {
      const stored = await AsyncStorage.getItem('@citizen_tickets');
      if (stored) setTickets(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to load tickets for map', error);
    }
  };

  const howrahRegion = {
    latitude: 22.5958,
    longitude: 88.2636,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 11, color: theme.subtext, letterSpacing: 1.2, marginBottom: 4 }}>LIVE INFRASTRUCTURE VIEW</Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text }}>Civic Heat Map</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, marginBottom: 4 }}>ACTIVE ISSUES</Text>
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800' }}>{tickets.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 10, marginBottom: 4 }}>PENDING</Text>
            <Text style={{ color: theme.citizenPrimary, fontSize: 22, fontWeight: '800' }}>
              {tickets.filter(t => t.status === 'Pending').length}
            </Text>
          </View>
        </View>

        {/* Live Interactive Leaflet OpenStreetMap Box */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>Jharkhand Service Zone</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(47, 158, 143, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.authorityPrimary }} />
              <Text style={{ color: theme.authorityPrimary, fontSize: 11, fontWeight: '700' }}>Leaflet (OSM)</Text>
            </View>
          </View>

          <View style={{ height: 260, backgroundColor: theme.background, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
            <LeafletMap
              mode="view"
              initialLatitude={23.3441}
              initialLongitude={85.3096}
              initialZoom={12}
              markers={
                tickets.length > 0
                  ? tickets
                      .filter(t => t.latitude && t.longitude)
                      .map((t, idx) => ({
                        id: t.id || String(idx),
                        latitude: parseFloat(t.latitude),
                        longitude: parseFloat(t.longitude),
                        title: t.title || t.category || 'Civic Report',
                        category: t.category,
                        status: t.status || 'Active',
                        urgency: t.urgency,
                      }))
                  : [
                      { id: '1', latitude: 23.3441, longitude: 85.3096, title: 'Ranchi Main Road Repair', category: 'Civil Works', status: 'In Progress' },
                      { id: '2', latitude: 23.3550, longitude: 85.3250, title: 'Solar Water Pump Outage', category: 'Water Supply', status: 'Pending' },
                      { id: '3', latitude: 23.3320, longitude: 85.2980, title: 'Street Light Grid Breakdown', category: 'Electrical', status: 'Critical' },
                    ]
              }
              height={260}
              isDarkMode={isDarkMode}
            />
          </View>
        </View>

        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Hotspots near you</Text>

        {hotspots.map((spot) => (
          <View key={spot.name} style={{ backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: spot.status === 'Critical' ? (isDarkMode ? 'rgba(232, 163, 61, 0.12)' : 'rgba(212, 138, 34, 0.12)') : (isDarkMode ? 'rgba(47, 158, 143, 0.12)' : 'rgba(35, 122, 110, 0.12)'), alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              {spot.status === 'Critical' ? <AlertCircle size={20} color={theme.citizenPrimary} /> : <MapPin size={20} color={theme.authorityPrimary} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700', marginBottom: 2 }}>{spot.name}</Text>
              <Text style={{ color: theme.subtext, fontSize: 12 }}>{spot.type}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: spot.status === 'Critical' ? theme.citizenPrimary : theme.authorityPrimary, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>{spot.status}</Text>
              <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }}>{spot.count} reports</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}