import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
} from 'lucide-react-native';
import { useGovStore, FlaggedProblem } from '../../store/govStore';

const DOMAIN_OPTIONS = [
  'All',
  'Civil Infrastructure',
  'Water & Drainage',
  'Mining Hazards',
  'Agriculture & Forestry',
  'Education & Skilling',
];

const CONFIDENCE_TIERS = [
  { id: 'all', label: 'All Tiers' },
  { id: 'low', label: '< 50% (High Risk)' },
  { id: 'mid', label: '50% - 75%' },
  { id: 'high', label: '> 75%' },
];

export default function ModerationQueueScreen() {
  const router = useRouter();
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedTier, setSelectedTier] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { moderationQueue, fetchModerationQueue, loadingModeration } = useGovStore();

  useEffect(() => {
    fetchModerationQueue();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchModerationQueue();
    setRefreshing(false);
  };

  const filteredList = useMemo(() => {
    return moderationQueue.filter(item => {
      // Domain filter
      if (selectedDomain !== 'All') {
        const itemDomain = item.aiMetadata?.category || item.category;
        if (itemDomain !== selectedDomain) return false;
      }

      // Confidence tier filter
      const conf = (item.aiMetadata?.confidence ?? 0.5) * 100;
      if (selectedTier === 'low' && conf >= 50) return false;
      if (selectedTier === 'mid' && (conf < 50 || conf > 75)) return false;
      if (selectedTier === 'high' && conf <= 75) return false;

      return true;
    });
  }, [moderationQueue, selectedDomain, selectedTier]);

  const getConfidenceBadgeColor = (confidence: number) => {
    const pct = confidence * 100;
    if (pct < 50) return { bg: 'rgba(193, 68, 59, 0.15)', text: '#F87171', border: '#C1443B' };
    if (pct <= 75) return { bg: 'rgba(232, 163, 61, 0.15)', text: '#E8A33D', border: '#E8A33D' };
    return { bg: 'rgba(47, 158, 143, 0.15)', text: '#2F9E8F', border: '#2F9E8F' };
  };

  const getFlagReasonLabel = (reason?: string) => {
    switch (reason) {
      case 'low_confidence':
        return { label: 'Low AI Confidence', color: '#F87171', bg: 'rgba(193, 68, 59, 0.15)' };
      case 'signal_discrepancy':
        return { label: 'Sensor/Signal Discrepancy', color: '#E8A33D', bg: 'rgba(232, 163, 61, 0.15)' };
      case 'citizen_flagged':
        return { label: 'Citizen Contested', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
      default:
        return { label: 'Needs Review', color: '#9BA8A6', bg: 'rgba(155, 168, 166, 0.15)' };
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const diffHrs = Math.round((Date.now() - new Date(dateStr).getTime()) / (3600 * 1000));
      if (diffHrs < 1) return 'Just now';
      if (diffHrs === 1) return '1h ago';
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.round(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
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
          <View style={styles.taglineBadge}>
            <Sparkles size={14} color="#2F9E8F" />
            <Text style={styles.taglineText}>HUMAN-IN-THE-LOOP ENGINE</Text>
          </View>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>AI Moderation Queue</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{moderationQueue.length} Pending</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Review cases flagged for low model certainty or geo-spatial anomalies before HEI dispatch.
          </Text>
        </View>

        {/* Domain Filter Chips */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>THEMATIC DOMAIN</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}>
            {DOMAIN_OPTIONS.map(domain => {
              const isSelected = selectedDomain === domain;
              return (
                <TouchableOpacity
                  key={domain}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                  onPress={() => setSelectedDomain(domain)}>
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}>
                    {domain}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Confidence Tier Selector */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>AI CONFIDENCE TIER</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}>
            {CONFIDENCE_TIERS.map(tier => {
              const isSelected = selectedTier === tier.id;
              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[
                    styles.tierChip,
                    isSelected ? styles.tierChipSelected : styles.tierChipUnselected,
                  ]}
                  onPress={() => setSelectedTier(tier.id)}>
                  <Text
                    style={[
                      styles.tierChipText,
                      isSelected ? styles.tierChipTextSelected : styles.tierChipTextUnselected,
                    ]}>
                    {tier.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List of Flagged Problems */}
        <View style={styles.queueHeaderRow}>
          <Text style={styles.queueSectionTitle}>
            FLAGGED INCIDENTS ({filteredList.length})
          </Text>
          <Text style={styles.queueHint}>Tap card to inspect AI diagnostics</Text>
        </View>

        {filteredList.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconBox}>
              <CheckCircle2 size={38} color="#2F9E8F" />
            </View>
            <Text style={styles.emptyStateTitle}>Queue Cleared</Text>
            <Text style={styles.emptyStateSubtitle}>
              No pending problems match the selected filters. All AI classifications are validated.
            </Text>
          </View>
        ) : (
          filteredList.map(item => {
            const confidence = item.aiMetadata?.confidence ?? 0.5;
            const confBadge = getConfidenceBadgeColor(confidence);
            const flagBadge = getFlagReasonLabel(item.aiMetadata?.flagReason);
            const isUrgent = item.urgency === 'critical' || item.urgency === 'high';

            return (
              <TouchableOpacity
                key={item.id || item._id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/(government)/ticket/[id]',
                    params: { id: item.id || item._id },
                  } as any)
                }>
                {/* Card Top Row */}
                <View style={styles.cardTopRow}>
                  <View style={styles.badgesGroup}>
                    {/* Urgency Badge */}
                    <View
                      style={[
                        styles.urgencyPill,
                        isUrgent
                          ? { backgroundColor: 'rgba(193, 68, 59, 0.2)' }
                          : { backgroundColor: 'rgba(232, 163, 61, 0.2)' },
                      ]}>
                      {isUrgent && <Flame size={12} color="#F87171" />}
                      <Text
                        style={[
                          styles.urgencyText,
                          isUrgent ? { color: '#F87171' } : { color: '#E8A33D' },
                        ]}>
                        {item.urgency.toUpperCase()}
                      </Text>
                    </View>

                    {/* Flag Reason */}
                    <View style={[styles.flagReasonPill, { backgroundColor: flagBadge.bg }]}>
                      <AlertTriangle size={11} color={flagBadge.color} />
                      <Text style={[styles.flagReasonText, { color: flagBadge.color }]}>
                        {flagBadge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Confidence Badge */}
                  <View
                    style={[
                      styles.confidenceBadge,
                      { backgroundColor: confBadge.bg, borderColor: confBadge.border },
                    ]}>
                    <Text style={[styles.confidenceText, { color: confBadge.text }]}>
                      {(confidence * 100).toFixed(0)}% Conf
                    </Text>
                  </View>
                </View>

                {/* Title & Description */}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Location & Time */}
                <View style={styles.metaRow}>
                  <View style={styles.locationContainer}>
                    <MapPin size={13} color="#9BA8A6" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.location.district}
                      {item.location.block ? ` • ${item.location.block}` : ''}
                    </Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <Clock size={13} color="#9BA8A6" />
                    <Text style={styles.timeText}>
                      {formatTimestamp(item.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Card Action Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>
                      {item.aiMetadata?.category || item.category}
                    </Text>
                  </View>
                  <View style={styles.actionPrompt}>
                    <Text style={styles.actionPromptText}>Review & Decide</Text>
                    <ChevronRight size={16} color="#2F9E8F" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F2EFE9',
  },
  badgeCount: {
    backgroundColor: '#C1443B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F2EFE9',
  },
  subtitle: {
    fontSize: 12,
    color: '#9BA8A6',
    marginTop: 4,
    lineHeight: 16,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9BA8A6',
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#2F9E8F',
    borderColor: '#2F9E8F',
  },
  chipUnselected: {
    backgroundColor: '#16262A',
    borderColor: '#1D3238',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#0F1B1E',
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: '#9BA8A6',
  },
  tierChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierChipSelected: {
    backgroundColor: '#1E373D',
    borderColor: '#2F9E8F',
  },
  tierChipUnselected: {
    backgroundColor: '#16262A',
    borderColor: '#1D3238',
  },
  tierChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tierChipTextSelected: {
    color: '#2F9E8F',
    fontWeight: '700',
  },
  tierChipTextUnselected: {
    color: '#9BA8A6',
  },
  queueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  queueSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9BA8A6',
    letterSpacing: 1,
  },
  queueHint: {
    fontSize: 10,
    color: '#2F9E8F',
  },
  card: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  urgencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '800',
  },
  flagReasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  flagReasonText: {
    fontSize: 10,
    fontWeight: '700',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F2EFE9',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: '#9BA8A6',
    lineHeight: 17,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 11,
    color: '#9BA8A6',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#9BA8A6',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: '#0F1B1E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  emptyStateContainer: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1D3238',
    marginTop: 20,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(47, 158, 143, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F2EFE9',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#9BA8A6',
    textAlign: 'center',
    lineHeight: 17,
  },
});
