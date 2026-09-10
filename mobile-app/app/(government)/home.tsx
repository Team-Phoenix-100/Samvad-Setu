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
  Building2,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  FileText,
  Award,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { useGovStore } from '../../store/govStore';
import { useTheme } from '../../context/ThemeContext';

export default function GovernmentHomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const {
    summary,
    moderationQueue,
    institutions,
    fetchAnalytics,
    fetchModerationQueue,
    fetchInstitutions,
  } = useGovStore();

  useEffect(() => {
    fetchAnalytics();
    fetchModerationQueue();
    fetchInstitutions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAnalytics(),
      fetchModerationQueue(),
      fetchInstitutions(),
    ]);
    setRefreshing(false);
  };

  const pendingModerationCount = moderationQueue.length;
  const pendingInstCount = institutions.filter(
    i => i.verificationStatus === 'pending_verification'
  ).length;

  const resolutionRate =
    summary.totalProblems > 0
      ? Math.round((summary.resolvedProblems / summary.totalProblems) * 100)
      : 0;

  // Max value for resolution trend bar graph
  const maxWeeklyResolved = Math.max(
    ...summary.resolutionTrend.map(t => t.resolved),
    1
  );

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
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.taglineBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.taglineText}>GOVT. OF JHARKHAND • DHTE</Text>
            </View>
            <Text style={styles.title}>Statewide Oversight</Text>
            <Text style={styles.subtitle}>
              Institutional Innovation & AI Moderation Console
            </Text>
          </View>
          <TouchableOpacity
            style={styles.auditIconBtn}
            onPress={() => router.push('/(government)/audit-log' as any)}>
            <FileText size={18} color="#2F9E8F" />
            <Text style={styles.auditBtnText}>Audit</Text>
          </TouchableOpacity>
        </View>

        {/* Action Banners */}
        {pendingModerationCount > 0 && (
          <TouchableOpacity
            style={[styles.bannerCard, { borderColor: '#C1443B' }]}
            onPress={() => router.push('/(government)/moderation' as any)}>
            <View style={[styles.bannerIconBox, { backgroundColor: 'rgba(193, 68, 59, 0.15)' }]}>
              <ShieldAlert size={22} color="#C1443B" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.bannerHeaderRow}>
                <Text style={[styles.bannerTitle, { color: '#F87171' }]}>
                  AI Flagged Queue
                </Text>
                <View style={[styles.countBadge, { backgroundColor: '#C1443B' }]}>
                  <Text style={styles.countBadgeText}>{pendingModerationCount} Actionable</Text>
                </View>
              </View>
              <Text style={styles.bannerSubtitle}>
                Problems flagged with low confidence or sensor signal discrepancy requiring human approval.
              </Text>
            </View>
            <ChevronRight size={18} color="#9BA8A6" />
          </TouchableOpacity>
        )}

        {pendingInstCount > 0 && (
          <TouchableOpacity
            style={[styles.bannerCard, { borderColor: '#E8A33D' }]}
            onPress={() => router.push('/(government)/institutions' as any)}>
            <View style={[styles.bannerIconBox, { backgroundColor: 'rgba(232, 163, 61, 0.15)' }]}>
              <Building2 size={22} color="#E8A33D" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.bannerHeaderRow}>
                <Text style={[styles.bannerTitle, { color: '#E8A33D' }]}>
                  Institutional Registry
                </Text>
                <View style={[styles.countBadge, { backgroundColor: '#E8A33D' }]}>
                  <Text style={[styles.countBadgeText, { color: '#0F1B1E' }]}>
                    {pendingInstCount} Pending
                  </Text>
                </View>
              </View>
              <Text style={styles.bannerSubtitle}>
                New HEI research labs and Industry CSR partnerships awaiting AISHE / CIN credentials verification.
              </Text>
            </View>
            <ChevronRight size={18} color="#9BA8A6" />
          </TouchableOpacity>
        )}

        {/* 4 Primary KPI Grid */}
        <Text style={styles.sectionHeader}>STATEWIDE IMPACT METRICS</Text>
        <View style={styles.kpiGrid}>
          {/* Total Problems */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <Text style={styles.kpiLabel}>TOTAL PROBLEMS</Text>
              <AlertTriangle size={16} color="#E8A33D" />
            </View>
            <Text style={styles.kpiValue}>{summary.totalProblems}</Text>
            <Text style={styles.kpiSub}>Crowdsourced statewide</Text>
          </View>

          {/* Resolved */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <Text style={styles.kpiLabel}>RESOLVED</Text>
              <CheckCircle2 size={16} color="#2F9E8F" />
            </View>
            <Text style={[styles.kpiValue, { color: '#2F9E8F' }]}>
              {summary.resolvedProblems}
            </Text>
            <Text style={styles.kpiSub}>{resolutionRate}% completion rate</Text>
          </View>

          {/* HEIs */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <Text style={styles.kpiLabel}>ACTIVE HEIs</Text>
              <GraduationCap size={16} color="#4E7AFF" />
            </View>
            <Text style={[styles.kpiValue, { color: '#4E7AFF' }]}>
              {summary.activeHEIs}
            </Text>
            <Text style={styles.kpiSub}>State universities & IITs</Text>
          </View>

          {/* Industry CSR */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <Text style={styles.kpiLabel}>INDUSTRY / CSR</Text>
              <Briefcase size={16} color="#A855F7" />
            </View>
            <Text style={[styles.kpiValue, { color: '#A855F7' }]}>
              {summary.activeIndustry}
            </Text>
            <Text style={styles.kpiSub}>Active funding partners</Text>
          </View>
        </View>

        {/* 6-Week Resolution Throughput Trend */}
        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <View>
              <Text style={styles.cardTitle}>Resolution Throughput</Text>
              <Text style={styles.cardSubtitle}>
                6-Week trajectory of deployed solutions
              </Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingUp size={14} color="#2F9E8F" />
              <Text style={styles.trendBadgeText}>+18.4% WoW</Text>
            </View>
          </View>

          <View style={styles.barsContainer}>
            {summary.resolutionTrend.map((item, index) => {
              const heightPercent = Math.max(
                (item.resolved / maxWeeklyResolved) * 100,
                12
              );
              return (
                <View key={item.week || index} style={styles.barColumn}>
                  <Text style={styles.barValueText}>{item.resolved}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor:
                            index === summary.resolutionTrend.length - 1
                              ? '#2F9E8F'
                              : '#234449',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.week}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top HEI Leaderboard */}
        <View style={styles.leaderboardCard}>
          <View style={styles.leaderboardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Award size={20} color="#E8A33D" />
              <Text style={styles.cardTitle}>Top HEI Innovators</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(government)/analytics' as any)}>
              <Text style={styles.viewAllText}>Full Analytics →</Text>
            </TouchableOpacity>
          </View>

          {summary.leaderboard.map((hei, index) => (
            <View
              key={hei.name}
              style={[
                styles.heiRow,
                index === summary.leaderboard.length - 1 && { borderBottomWidth: 0 },
              ]}>
              <View
                style={[
                  styles.heiRankBadge,
                  index === 0
                    ? { backgroundColor: 'rgba(232, 163, 61, 0.2)', borderColor: '#E8A33D' }
                    : { backgroundColor: '#1A2F33', borderColor: '#1D3238' },
                ]}>
                <Text
                  style={[
                    styles.heiRankText,
                    index === 0 && { color: '#E8A33D', fontWeight: '800' },
                  ]}>
                  #{index + 1}
                </Text>
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.heiName}>{hei.name}</Text>
                <Text style={styles.heiDistrict}>District: {hei.district}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.projectsPill}>
                  <CheckCircle2 size={12} color="#2F9E8F" />
                  <Text style={styles.projectsPillText}>
                    {hei.projectsDeployed} Deployed
                  </Text>
                </View>
                <Text style={styles.heiRating}>★ {hei.rating.toFixed(1)} / 5.0</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Audit Log Quick Link */}
        <TouchableOpacity
          style={styles.auditLogFooterBtn}
          onPress={() => router.push('/(government)/audit-log' as any)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} color="#2F9E8F" />
            <View>
              <Text style={styles.auditFooterTitle}>Administrative Audit Trail</Text>
              <Text style={styles.auditFooterSubtitle}>
                View immutable blockchain/DHTE logs of moderation & approvals
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#9BA8A6" />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2F9E8F',
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2F9E8F',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F2EFE9',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#9BA8A6',
    marginTop: 2,
  },
  auditIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16262A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  auditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  bannerCard: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F2EFE9',
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#9BA8A6',
    lineHeight: 15,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9BA8A6',
    letterSpacing: 1.1,
    marginTop: 10,
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9BA8A6',
    letterSpacing: 0.8,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F2EFE9',
  },
  kpiSub: {
    fontSize: 11,
    color: '#9BA8A6',
    marginTop: 4,
  },
  trendCard: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 20,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F2EFE9',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#9BA8A6',
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(47, 158, 143, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(47, 158, 143, 0.3)',
  },
  trendBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 16,
    paddingBottom: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9BA8A6',
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    height: 80,
    backgroundColor: '#0F1B1E',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    color: '#9BA8A6',
    marginTop: 6,
    fontWeight: '600',
  },
  leaderboardCard: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 20,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  heiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1D3238',
  },
  heiRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heiRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9BA8A6',
  },
  heiName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F2EFE9',
  },
  heiDistrict: {
    fontSize: 11,
    color: '#9BA8A6',
    marginTop: 2,
  },
  projectsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(47, 158, 143, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(47, 158, 143, 0.25)',
  },
  projectsPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  heiRating: {
    fontSize: 11,
    color: '#E8A33D',
    fontWeight: '700',
    marginTop: 3,
  },
  auditLogFooterBtn: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D3238',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auditFooterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F2EFE9',
  },
  auditFooterSubtitle: {
    fontSize: 11,
    color: '#9BA8A6',
    marginTop: 2,
    maxWidth: 240,
  },
});