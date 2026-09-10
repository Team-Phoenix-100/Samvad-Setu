import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Edit3,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useGovStore, AuditLogItem } from '../../store/govStore';

export default function AuditLogScreen() {
  const router = useRouter();
  const { auditLogs, fetchAuditLogs, loadingAuditLogs } = useGovStore();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAuditLogs();
    setRefreshing(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getActionBadge = (action: string, details: any) => {
    if (action === 'PROBLEM_MODERATED') {
      if (details?.action === 'approve') {
        return {
          label: 'PROBLEM APPROVED',
          color: '#2F9E8F',
          bg: 'rgba(47, 158, 143, 0.15)',
          icon: <CheckCircle2 size={13} color="#2F9E8F" />,
        };
      }
      if (details?.action === 'reject') {
        return {
          label: 'PROBLEM REJECTED',
          color: '#F87171',
          bg: 'rgba(193, 68, 59, 0.15)',
          icon: <XCircle size={13} color="#F87171" />,
        };
      }
      return {
        label: 'TAXONOMY OVERRIDE',
        color: '#E8A33D',
        bg: 'rgba(232, 163, 61, 0.15)',
        icon: <Edit3 size={13} color="#E8A33D" />,
      };
    }

    if (action === 'INSTITUTION_VERIFIED') {
      if (details?.approved) {
        return {
          label: 'INSTITUTION AUTHORIZED',
          color: '#2F9E8F',
          bg: 'rgba(47, 158, 143, 0.15)',
          icon: <CheckCircle2 size={13} color="#2F9E8F" />,
        };
      }
      return {
        label: 'ACCREDITATION DECLINED',
        color: '#F87171',
        bg: 'rgba(193, 68, 59, 0.15)',
        icon: <XCircle size={13} color="#F87171" />,
      };
    }

    return {
      label: action,
      color: '#9BA8A6',
      bg: '#1D3238',
      icon: <FileText size={13} color="#9BA8A6" />,
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0F1B1E' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2F9E8F"
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#F2EFE9" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.taglineBadge}>
              <ShieldCheck size={12} color="#2F9E8F" />
              <Text style={styles.taglineText}>IMMUTABLE COMPLIANCE LEDGER</Text>
            </View>
            <Text style={styles.title}>Administrative Audit Trail</Text>
            <Text style={styles.subtitle}>
              Chronological log of all moderation, classification, and verification actions.
            </Text>
          </View>
        </View>

        {/* Audit Log Entries */}
        <View style={styles.logList}>
          {auditLogs.map((log, index) => {
            const badge = getActionBadge(log.action, log.details);
            const isExpanded = expandedId === log._id;

            return (
              <View key={log._id || index} style={styles.card}>
                {/* Card Header */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.actionBadge, { backgroundColor: badge.bg }]}>
                    {badge.icon}
                    <Text style={[styles.actionBadgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                  <Text style={styles.timestampText}>
                    {formatTimestamp(log.timestamp)}
                  </Text>
                </View>

                {/* Target Information */}
                <View style={styles.targetRow}>
                  <Text style={styles.targetEntity}>
                    {log.targetEntity}:{' '}
                    <Text style={styles.targetId}>{log.targetId}</Text>
                  </Text>
                  {log.details?.title && (
                    <Text style={styles.targetSubTitle} numberOfLines={1}>
                      "{log.details.title}"
                    </Text>
                  )}
                  {log.details?.name && (
                    <Text style={styles.targetSubTitle} numberOfLines={1}>
                      {log.details.name}
                    </Text>
                  )}
                </View>

                {/* Action Summary / Note */}
                {log.details?.note && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>Moderator Note:</Text>
                    <Text style={styles.noteText}>{log.details.note}</Text>
                  </View>
                )}

                {log.details?.reason && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>Accreditation Reason:</Text>
                    <Text style={styles.noteText}>{log.details.reason}</Text>
                  </View>
                )}

                {log.details?.correctedCategory && (
                  <View style={styles.reclassBox}>
                    <Text style={styles.reclassLabel}>New Assigned Taxonomy:</Text>
                    <Text style={styles.reclassValue}>{log.details.correctedCategory}</Text>
                  </View>
                )}

                {/* Officer Meta & Inspector Toggle */}
                <TouchableOpacity
                  style={styles.cardFooter}
                  onPress={() => toggleExpand(log._id)}>
                  <View style={styles.actorContainer}>
                    <User size={13} color="#9BA8A6" />
                    <Text style={styles.actorText}>
                      {log.actor.name} ({log.actor.email})
                    </Text>
                  </View>
                  <View style={styles.expandRow}>
                    <Text style={styles.expandText}>
                      {isExpanded ? 'Hide Payload' : 'Inspect Details'}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={14} color="#2F9E8F" />
                    ) : (
                      <ChevronDown size={14} color="#2F9E8F" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Expanded Payload JSON */}
                {isExpanded && (
                  <View style={styles.jsonPayloadBox}>
                    <Text style={styles.jsonTitle}>IMMUTABLE EVENT PAYLOAD</Text>
                    <Text style={styles.jsonContent}>
                      {JSON.stringify(
                        {
                          logId: log._id,
                          timestamp: log.timestamp,
                          actor: log.actor,
                          action: log.action,
                          target: { entity: log.targetEntity, id: log.targetId },
                          metadata: log.details,
                        },
                        null,
                        2
                      )}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
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
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#16262A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginTop: 4,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2F9E8F',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F2EFE9',
  },
  subtitle: {
    fontSize: 12,
    color: '#9BA8A6',
    marginTop: 4,
    lineHeight: 16,
  },
  logList: {
    gap: 12,
  },
  card: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timestampText: {
    fontSize: 11,
    color: '#9BA8A6',
  },
  targetRow: {
    marginBottom: 8,
  },
  targetEntity: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9BA8A6',
  },
  targetId: {
    color: '#2F9E8F',
    fontWeight: '800',
  },
  targetSubTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F2EFE9',
    marginTop: 2,
  },
  noteBox: {
    backgroundColor: '#0F1B1E',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 8,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9BA8A6',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 12,
    color: '#F2EFE9',
  },
  reclassBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(232, 163, 61, 0.1)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(232, 163, 61, 0.25)',
    marginBottom: 8,
  },
  reclassLabel: {
    fontSize: 11,
    color: '#E8A33D',
    fontWeight: '600',
  },
  reclassValue: {
    fontSize: 11,
    color: '#F2EFE9',
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
  },
  actorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  actorText: {
    fontSize: 11,
    color: '#9BA8A6',
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  jsonPayloadBox: {
    marginTop: 10,
    backgroundColor: '#0A1214',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  jsonTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2F9E8F',
    letterSpacing: 1,
    marginBottom: 6,
  },
  jsonContent: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#9BA8A6',
    lineHeight: 14,
  },
});
