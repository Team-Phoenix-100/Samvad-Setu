import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCircle2, Clock3, ArrowLeft, AlertCircle, Wrench, ShieldAlert } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useProblemStore } from '../../store/problemStore';
import { useAuthStore } from '../../store/authStore';

interface NotificationItem {
  id: string;
  problemId?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  date: string;
  type: 'resolved' | 'in-progress' | 'pending' | 'alert';
}

export default function CitizenNotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { problems, fetchProblems } = useProblemStore() as any;
  const { user } = useAuthStore() as any;
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'resolved'>('all');
  const [offlineTickets, setOfflineTickets] = useState<any[]>([]);

  useEffect(() => {
    loadOfflineTickets();
    fetchProblems();
  }, []);

  const loadOfflineTickets = async () => {
    try {
      const stored = await AsyncStorage.getItem('@citizen_tickets');
      if (stored) {
        setOfflineTickets(JSON.parse(stored));
      }
    } catch {
      // Ignore async storage error
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadOfflineTickets(), fetchProblems()]);
    setRefreshing(false);
  };

  // Compile notifications from both store problems (belonging to current user) and local tickets
  const notifications = useMemo(() => {
    const list: NotificationItem[] = [];
    const currentUserId = user?._id || user?.id;

    // From live problems
    problems.forEach((p: any) => {
      const authorId = p.reportedBy?._id || p.reportedBy?.id || p.reportedBy || p.userId;
      const isMyProblem = (authorId && currentUserId && String(authorId) === String(currentUserId)) || !currentUserId;
      
      if (!isMyProblem) return;

      const pId = p._id || p.id || 'N/A';
      const isResolved = p.status === 'resolved' || p.status === 'closed';
      const isInProgress = p.status === 'in-progress';

      let type: NotificationItem['type'] = 'pending';
      let title = `Grievance Registered: ${p.title || 'Civic Issue'}`;
      let desc = `Your report under ${p.category || 'General'} has been received by municipal administrators.`;

      if (isResolved) {
        type = 'resolved';
        title = `Issue Resolved: ${p.title || 'Civic Issue'}`;
        desc = `The municipal authority has marked this issue as resolved. Thank you for making your community better.`;
      } else if (isInProgress) {
        type = 'in-progress';
        title = `Work In Progress: ${p.title || 'Civic Issue'}`;
        desc = `Ground response team or partner institution has commenced remediation work.`;
      }

      const dateStr = p.createdAt 
        ? new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      list.push({
        id: `notif-${pId}`,
        problemId: pId,
        title,
        description: desc,
        category: p.category || 'Civic',
        status: p.status || 'open',
        date: dateStr,
        type,
      });
    });

    // From offline / cached tickets
    offlineTickets.forEach((t: any, idx: number) => {
      const tId = t.id || `offline-${idx}`;
      if (!list.some(item => item.problemId === tId)) {
        list.push({
          id: `offline-notif-${tId}`,
          problemId: tId,
          title: `Status Update: ${t.category || 'Grievance'}`,
          description: t.description || 'Your submitted report is queued for sync.',
          category: t.category || 'General',
          status: t.status || 'Pending',
          date: t.date || 'Offline Queue',
          type: t.status === 'Resolved' ? 'resolved' : 'pending',
        });
      }
    });

    // Fallback if empty
    if (list.length === 0) {
      list.push(
        {
          id: 'welcome-1',
          title: 'Welcome to Samvad-Setu',
          description: 'Report civic issues like potholes, streetlights, or water shortages. Track real-time progress from submission to resolution.',
          category: 'System',
          status: 'Info',
          date: 'Today',
          type: 'alert',
        }
      );
    }

    return list.filter(item => {
      if (activeFilter === 'resolved') return item.type === 'resolved';
      if (activeFilter === 'unread') return item.type !== 'resolved';
      return true;
    });
  }, [problems, offlineTickets, user, activeFilter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: theme.surface,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>
            Notifications & Alerts
          </Text>
          <Text style={{ fontSize: 11, color: theme.subtext }}>
            Live civic updates & status changes
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, gap: 8 }}>
        {(['all', 'unread', 'resolved'] as const).map((filterKey) => {
          const isActive = activeFilter === filterKey;
          const label = filterKey === 'all' ? 'All Updates' : filterKey === 'unread' ? 'Active' : 'Resolved';
          return (
            <TouchableOpacity
              key={filterKey}
              onPress={() => setActiveFilter(filterKey)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: isActive ? theme.citizenPrimary : theme.surface,
                borderWidth: 1,
                borderColor: isActive ? theme.citizenPrimary : theme.border,
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: isActive ? '#FFFFFF' : theme.subtext,
                textTransform: 'capitalize',
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notification List */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.citizenPrimary}
            colors={[theme.citizenPrimary]}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={{
            backgroundColor: theme.card,
            padding: 36,
            borderRadius: 20,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
            marginTop: 20,
          }}>
            <Bell size={36} color={theme.subtext} style={{ marginBottom: 12, opacity: 0.6 }} />
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
              No notifications
            </Text>
            <Text style={{ color: theme.subtext, fontSize: 13, textAlign: 'center' }}>
              You do not have any {activeFilter !== 'all' ? activeFilter : ''} notifications right now.
            </Text>
          </View>
        ) : (
          notifications.map((item) => {
            const isResolved = item.type === 'resolved';
            const isInProgress = item.type === 'in-progress';
            const isAlert = item.type === 'alert';

            const iconBg = isResolved
              ? 'rgba(47, 158, 143, 0.15)'
              : isInProgress
              ? 'rgba(56, 189, 248, 0.15)'
              : isAlert
              ? 'rgba(232, 163, 61, 0.15)'
              : 'rgba(232, 163, 61, 0.15)';

            const iconColor = isResolved
              ? theme.authorityPrimary || '#2F9E8F'
              : isInProgress
              ? '#38BDF8'
              : '#E8A33D';

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={item.problemId && !item.problemId.startsWith('notif-welcome') ? 0.7 : 1}
                onPress={() => {
                  if (item.problemId && !item.problemId.startsWith('notif-welcome') && !item.problemId.startsWith('welcome')) {
                    router.push(`/problem/${item.problemId}` as any);
                  }
                }}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.border,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: iconBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}>
                  {isResolved ? (
                    <CheckCircle2 size={22} color={iconColor} />
                  ) : isInProgress ? (
                    <Wrench size={20} color={iconColor} />
                  ) : isAlert ? (
                    <AlertCircle size={22} color={iconColor} />
                  ) : (
                    <Bell size={22} color={iconColor} />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14, flex: 1, marginRight: 8 }} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 10, fontWeight: '600' }}>
                      {item.date}
                    </Text>
                  </View>

                  <Text style={{ color: theme.subtext, fontSize: 12, lineHeight: 18 }}>
                    {item.description}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock3 size={11} color={theme.subtext} style={{ marginRight: 5 }} />
                      <Text style={{ color: theme.subtext, fontSize: 11, textTransform: 'capitalize' }}>
                        {item.category} • Status: {item.status}
                      </Text>
                    </View>

                    {item.problemId && !item.problemId.startsWith('welcome') && (
                      <Text style={{ color: theme.citizenPrimary, fontSize: 11, fontWeight: '700' }}>
                        View Ticket →
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}