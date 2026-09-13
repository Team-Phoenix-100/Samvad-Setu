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
  const { theme, isDarkMode } = useTheme();
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

  const resolutionTrend = summary?.resolutionTrend || [];
  const leaderboard = summary?.leaderboard || [];

  const resolutionRate =
    (summary?.totalProblems || 0) > 0
      ? Math.round(((summary?.resolvedProblems || 0) / summary.totalProblems) * 100)
      : 0;

  // Max value for resolution trend bar graph
  const maxWeeklyResolved = Math.max(
    ...resolutionTrend.map(t => t.resolved),
    1
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.authorityPrimary}
            colors={[theme.authorityPrimary]}
          />
        }>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.taglineBadge}>
              <View style={[styles.statusDot, { backgroundColor: theme.authorityPrimary }]} />
              <Text style={[styles.taglineText, { color: theme.authorityPrimary }]}>GOVT. OF JHARKHAND • DHTE</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Statewide Oversight</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              Institutional Innovation & AI Moderation Console
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.auditIconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push('/(government)/audit-log' as any)}>
            <FileText size={18} color={theme.authorityPrimary} />
            <Text style={[styles.auditBtnText, { color: theme.authorityPrimary }]}>Audit</Text>
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
        <Text style={[styles.sectionHeader, { color: theme.subtext }]}>STATEWIDE IMPACT METRICS</Text>
        <View style={styles.kpiGrid}>
          {/* Total Problems */}
          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.kpiTopRow}>
              <Text style={[styles.kpiLabel, { color: theme.subtext }]}>TOTAL PROBLEMS</Text>
              <AlertTriangle size={16} color={theme.citizenPrimary} />
            </View>
            <Text style={[styles.kpiValue, { color: theme.text }]}>{summary.totalProblems}</Text>
            <Text style={[styles.kpiSub, { color: theme.subtext }]}>Crowdsourced statewide</Text>
          </View>

          {/* Resolved */}
          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.kpiTopRow}>
              <Text style={[styles.kpiLabel, { color: theme.subtext }]}>RESOLVED</Text>
              <CheckCircle2 size={16} color={theme.authorityPrimary} />
            </View>
            <Text style={[styles.kpiValue, { color: theme.authorityPrimary }]}>
              {summary.resolvedProblems}
            </Text>
            <Text style={[styles.kpiSub, { color: theme.subtext }]}>{resolutionRate}% completion rate</Text>
          </View>

          {/* HEIs */}
          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.kpiTopRow}>
              <Text style={[styles.kpiLabel, { color: theme.subtext }]}>ACTIVE HEIs</Text>
              <GraduationCap size={16} color="#4E7AFF" />
            </View>
            <Text style={[styles.kpiValue, { color: '#4E7AFF' }]}>
              {summary.activeHEIs}
            </Text>
            <Text style={[styles.kpiSub, { color: theme.subtext }]}>State universities & IITs</Text>
          </View>

          {/* Industry CSR */}
          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.kpiTopRow}>
              <Text style={[styles.kpiLabel, { color: theme.subtext }]}>INDUSTRY / CSR</Text>
              <Briefcase size={16} color="#A855F7" />
            </View>
            <Text style={[styles.kpiValue, { color: '#A855F7' }]}>
              {summary.activeIndustry}
            </Text>
            <Text style={[styles.kpiSub, { color: theme.subtext }]}>Active funding partners</Text>
          </View>
        </View>

        {/* 6-Week Resolution Throughput Trend */}
        {/* 6-Week Resolution Throughput Trend */}
        <View style={[styles.trendCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.trendHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Resolution Throughput</Text>
              <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>
                6-Week trajectory of deployed solutions
              </Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)' }]}>
              <TrendingUp size={14} color={theme.authorityPrimary} />
              <Text style={[styles.trendBadgeText, { color: theme.authorityPrimary }]}>+18.4% WoW</Text>
            </View>
          </View>

          <View style={styles.barsContainer}>
            {resolutionTrend.map((item, index) => {
              const heightPercent = Math.max(
                (item.resolved / maxWeeklyResolved) * 100,
                12
              );
              return (
                <View key={item.week || index} style={styles.barColumn}>
                  <Text style={[styles.barValueText, { color: theme.subtext }]}>{item.resolved}</Text>
                  <View style={[styles.barTrack, { backgroundColor: theme.surface }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor:
                            index === resolutionTrend.length - 1
                              ? theme.authorityPrimary
                              : (isDarkMode ? '#234449' : '#B8D5D0'),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: theme.subtext }]}>{item.week}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top HEI Leaderboard */}
        <View style={[styles.leaderboardCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.leaderboardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Award size={20} color={theme.citizenPrimary} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Top HEI Innovators</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(government)/analytics' as any)}>
              <Text style={[styles.viewAllText, { color: theme.authorityPrimary }]}>Full Analytics →</Text>
            </TouchableOpacity>
          </View>

          {leaderboard.map((hei, index) => (
            <View
              key={hei.name || index}
              style={[
                styles.heiRow,
                { borderBottomColor: theme.borderSubtle },
                index === leaderboard.length - 1 && { borderBottomWidth: 0 },
              ]}>
              <View
                style={[
                  styles.heiRankBadge,
                  index === 0
                    ? { backgroundColor: isDarkMode ? 'rgba(232, 163, 61, 0.2)' : 'rgba(203, 125, 24, 0.15)', borderColor: theme.citizenPrimary }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
                ]}>
                <Text
                  style={[
                    styles.heiRankText,
                    { color: theme.textSecondary },
                    index === 0 && { color: theme.citizenPrimary, fontWeight: '800' },
                  ]}>
                  #{index + 1}
                </Text>
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.heiName, { color: theme.text }]}>{hei.name}</Text>
                <Text style={[styles.heiDistrict, { color: theme.subtext }]}>District: {hei.district}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <View style={[styles.projectsPill, { backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(5, 150, 105, 0.12)' }]}>
                  <CheckCircle2 size={12} color={theme.authorityPrimary} />
                  <Text style={[styles.projectsPillText, { color: theme.authorityPrimary }]}>
                    {hei.projectsDeployed} Deployed
                  </Text>
                </View>
                <Text style={[styles.heiRating, { color: theme.citizenPrimary }]}>★ {hei.rating.toFixed(1)} / 5.0</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Audit Log Quick Link */}
        <TouchableOpacity
          style={[styles.auditLogFooterBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/(government)/audit-log' as any)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} color={theme.authorityPrimary} />
            <View>
              <Text style={[styles.auditFooterTitle, { color: theme.text }]}>Administrative Audit Trail</Text>
              <Text style={[styles.auditFooterSubtitle, { color: theme.subtext }]}>
                View immutable blockchain/DHTE logs of moderation & approvals
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={theme.subtext} />
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