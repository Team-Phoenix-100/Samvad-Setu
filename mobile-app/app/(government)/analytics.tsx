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
  PieChart,
  BarChart2,
  TrendingUp,
  Award,
  Building2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { useGovStore } from '../../store/govStore';

export default function GovernmentAnalyticsScreen() {
  const router = useRouter();
  const { summary, domains, districts, fetchAnalytics, loadingAnalytics } = useGovStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const maxDomainCount = Math.max(...domains.map(d => d.count), 1);
  const maxDistrictCount = Math.max(...districts.map(d => d.count), 1);
  const maxWeeklyResolved = Math.max(...summary.resolutionTrend.map(t => t.resolved), 1);

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
            <Text style={styles.headerTag}>STATEWIDE INTELLIGENCE</Text>
            <Text style={styles.headerTitle}>Innovation Analytics</Text>
          </View>
        </View>

        {/* Primary KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>TOTAL INCIDENTS</Text>
            <Text style={styles.kpiValue}>{summary.totalProblems}</Text>
            <Text style={styles.kpiSub}>Statewide intake</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>DEPLOYED SOLUTIONS</Text>
            <Text style={[styles.kpiValue, { color: '#2F9E8F' }]}>
              {summary.resolvedProblems}
            </Text>
            <Text style={styles.kpiSub}>
              {Math.round((summary.resolvedProblems / (summary.totalProblems || 1)) * 100)}% resolution
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>HEI RESEARCH TEAMS</Text>
            <Text style={[styles.kpiValue, { color: '#4E7AFF' }]}>
              {summary.activeHEIs}
            </Text>
            <Text style={styles.kpiSub}>Active faculty labs</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>CSR PARTNERSHIPS</Text>
            <Text style={[styles.kpiValue, { color: '#A855F7' }]}>
              {summary.activeIndustry}
            </Text>
            <Text style={styles.kpiSub}>Corporate sponsors</Text>
          </View>
        </View>

        {/* Thematic Domain Distribution */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#2F9E8F" />
              <Text style={styles.sectionTitle}>Thematic Domain Distribution</Text>
            </View>
            <Text style={styles.sectionMeta}>{domains.reduce((acc, d) => acc + d.count, 0)} Total</Text>
          </View>

          <View style={styles.barsList}>
            {domains.map((item, index) => {
              const widthPct = Math.round((item.count / maxDomainCount) * 100);
              return (
                <View key={item.domain} style={styles.domainBarItem}>
                  <View style={styles.domainLabelRow}>
                    <Text style={styles.domainName}>{item.domain}</Text>
                    <Text style={styles.domainCountText}>{item.count} reports</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${widthPct}%`,
                          backgroundColor:
                            index === 0
                              ? '#2F9E8F'
                              : index === 1
                              ? '#3B82F6'
                              : index === 2
                              ? '#E8A33D'
                              : index === 3
                              ? '#10B981'
                              : '#A855F7',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* District Breakdown */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="#E8A33D" />
              <Text style={styles.sectionTitle}>District Incident Volume</Text>
            </View>
            <Text style={styles.sectionMeta}>Jharkhand</Text>
          </View>

          <View style={styles.barsList}>
            {districts.map(item => {
              const widthPct = Math.round((item.count / maxDistrictCount) * 100);
              return (
                <View key={item.district} style={styles.domainBarItem}>
                  <View style={styles.domainLabelRow}>
                    <Text style={styles.domainName}>{item.district}</Text>
                    <Text style={styles.domainCountText}>{item.count} incidents</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${widthPct}%`, backgroundColor: '#E8A33D' },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 6-Week Resolution Throughput */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="#2F9E8F" />
              <Text style={styles.sectionTitle}>6-Week Resolution Throughput</Text>
            </View>
            <Text style={styles.sectionMeta}>+18.4% WoW</Text>
          </View>

          <View style={styles.chartContainer}>
            {summary.resolutionTrend.map((item, index) => {
              const heightPct = Math.max((item.resolved / maxWeeklyResolved) * 100, 15);
              return (
                <View key={item.week || index} style={styles.chartCol}>
                  <Text style={styles.chartColValue}>{item.resolved}</Text>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        {
                          height: `${heightPct}%`,
                          backgroundColor:
                            index === summary.resolutionTrend.length - 1
                              ? '#2F9E8F'
                              : '#234449',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartColLabel}>{item.week}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top HEI Leaderboard */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Award size={18} color="#E8A33D" />
              <Text style={styles.sectionTitle}>Top HEI Innovator Rankings</Text>
            </View>
            <Text style={styles.sectionMeta}>Jharkhand DHTE</Text>
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
                <Text style={styles.heiDistrict}>{hei.district} District</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.heiDeployedPill}>
                  <CheckCircle2 size={12} color="#2F9E8F" />
                  <Text style={styles.heiDeployedText}>
                    {hei.projectsDeployed} Deployed
                  </Text>
                </View>
                <Text style={styles.heiRatingText}>★ {hei.rating.toFixed(1)} / 5.0</Text>
              </View>
            </View>
          ))}
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
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#16262A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2F9E8F',
    letterSpacing: 1.1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F2EFE9',
    marginTop: 2,
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
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9BA8A6',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F2EFE9',
  },
  kpiSub: {
    fontSize: 11,
    color: '#9BA8A6',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F2EFE9',
  },
  sectionMeta: {
    fontSize: 11,
    color: '#9BA8A6',
    fontWeight: '600',
  },
  barsList: {
    gap: 12,
  },
  domainBarItem: {
    gap: 6,
  },
  domainLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  domainName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F2EFE9',
  },
  domainCountText: {
    fontSize: 11,
    color: '#9BA8A6',
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#0F1B1E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 16,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartColValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9BA8A6',
    marginBottom: 4,
  },
  chartTrack: {
    width: 24,
    height: 75,
    backgroundColor: '#0F1B1E',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartFill: {
    width: '100%',
    borderRadius: 6,
  },
  chartColLabel: {
    fontSize: 10,
    color: '#9BA8A6',
    marginTop: 6,
    fontWeight: '600',
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
  heiDeployedPill: {
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
  heiDeployedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  heiRatingText: {
    fontSize: 11,
    color: '#E8A33D',
    fontWeight: '700',
    marginTop: 3,
  },
});