import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCircle2, Clock3 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function NotificationsScreen() {
  const { theme, isDarkMode } = useTheme();
  const [tickets, setTickets] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('@citizen_tickets');
      if (stored) {
        setTickets(JSON.parse(stored));
      } else {
        setTickets([
          { id: 'TKT-2026-8432', category: 'Water Supply', description: 'Broken handpump near block market', status: 'Pending', date: '2 hrs ago' },
          { id: 'TKT-2026-8721', category: 'Street Lighting', description: 'Streetlight outage near Rajabazar Crossing', status: 'In Review', date: 'Today, 8:40 AM' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 11, color: theme.subtext, letterSpacing: 1.2, marginBottom: 4 }}>UPDATES</Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text }}>Alerts & notifications</Text>
          <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4 }}>Real-time updates on submitted grievances</Text>
        </View>

        {tickets.length === 0 ? (
          <View style={{ backgroundColor: theme.card, padding: 30, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, fontSize: 14 }}>No notifications available yet.</Text>
          </View>
        ) : (
          tickets.map((item, index) => {
            const isResolved = item.status === 'Resolved';

            return (
              <View key={index} style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isResolved ? 'rgba(47, 158, 143, 0.12)' : 'rgba(232, 163, 61, 0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  {isResolved ? <CheckCircle2 size={18} color={theme.authorityPrimary} /> : <Bell size={18} color={theme.citizenPrimary} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>
                      {isResolved ? 'Issue resolved' : 'Status update'} [{item.id}]
                    </Text>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 10 }}>{item.date || 'Just now'}</Text>
                  </View>
                  <Text style={{ color: theme.subtext, fontSize: 12, lineHeight: 18 }}>
                    {isResolved
                      ? `Your report for "${item.description}" has been marked as resolved by the municipal team.`
                      : `Your complaint regarding "${item.description}" is currently ${item.status || 'under review'} under the ${item.category} department.`}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Clock3 size={12} color={theme.subtext} style={{ marginRight: 6 }} />
                    <Text style={{ color: theme.subtext, fontSize: 10 }}>{item.status || 'Pending'} status</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}