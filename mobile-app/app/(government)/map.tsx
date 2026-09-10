import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { MapPin, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext'; // Import theme hook

const { width, height } = Dimensions.get('window');

export default function GovernmentMapScreen() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, isDarkMode } = useTheme(); // Pull theme variables

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

  const initialRegion = {
    latitude: 23.3441,
    longitude: 85.3096,
    latitudeDelta: 2.5,
    longitudeDelta: 2.5,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <Text style={{ fontSize: 10, color: theme.subtext, letterSpacing: 1.2, fontWeight: '700' }}>
          SPATIAL ANALYTICS
        </Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text, marginTop: 2 }}>
          Live Innovation Map
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.authorityPrimary} />
          <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading spatial data...</Text>
        </View>
      ) : (
        <View style={[styles.mapContainer, { borderColor: theme.border }]}>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            userInterfaceStyle={isDarkMode ? "dark" : "light"}
          >
            {challenges.map((challenge, index) => {
              const lat = challenge.latitude || 23.3441 + (Math.random() * 0.1);
              const lng = challenge.longitude || 85.3096 + (Math.random() * 0.1);

              return (
                <Marker
                  key={challenge.id || index}
                  coordinate={{ latitude: lat, longitude: lng }}
                >
                  <View style={[styles.customMarker, { backgroundColor: isDarkMode ? 'rgba(15, 27, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)' }]}>
                    <MapPin size={24} color={theme.citizenPrimary} fill="#C1443B" />
                  </View>
                  <Callout tooltip>
                    <View style={[styles.calloutContainer, { backgroundColor: theme.card, borderColor: theme.authorityPrimary }]}>
                      <Text style={[styles.calloutTitle, { color: theme.citizenPrimary }]}>{challenge.domain}</Text>
                      <Text style={[styles.calloutDesc, { color: theme.text }]} numberOfLines={2}>
                        {challenge.title}
                      </Text>
                      <View style={[styles.calloutBadge, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Text style={[styles.badgeText, { color: theme.subtext }]}>{challenge.stage}</Text>
                      </View>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>
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
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    borderRadius: 20,
    padding: 4,
  },
  calloutContainer: {
    borderRadius: 12,
    padding: 12,
    width: 220,
    borderWidth: 1,
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  calloutDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  calloutBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});