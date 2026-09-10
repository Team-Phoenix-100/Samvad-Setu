import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Filter,
  ShieldCheck,
  Search,
} from 'lucide-react-native';
import { useGovStore, InstitutionItem } from '../../store/govStore';

const STATUS_TABS = [
  { id: 'pending_verification', label: 'Pending' },
  { id: 'active', label: 'Active Verified' },
  { id: 'rejected', label: 'Rejected' },
];

const TYPE_TOGGLES = ['All', 'HEI', 'Industry'];

const DISTRICT_LIST = ['All', 'Ranchi', 'Dhanbad', 'East Singhbhum', 'Bokaro', 'Hazaribagh'];

export default function InstitutionsScreen() {
  const { institutions, fetchInstitutions, verifyInstitution, loadingInstitutions } = useGovStore();

  const [activeTab, setActiveTab] = useState<'pending_verification' | 'active' | 'rejected'>('pending_verification');
  const [typeFilter, setTypeFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Verification modal state
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [selectedInst, setSelectedInst] = useState<InstitutionItem | null>(null);
  const [isApproving, setIsApproving] = useState(true);
  const [verificationNote, setVerificationNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInstitutions();
    setRefreshing(false);
  };

  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      // Status filter
      if (inst.verificationStatus !== activeTab) return false;

      // Type filter
      if (typeFilter !== 'All' && inst.type !== typeFilter) return false;

      // District filter
      if (districtFilter !== 'All' && inst.district !== districtFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = inst.name.toLowerCase().includes(q);
        const matchesReg = inst.registrationNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesReg) return false;
      }

      return true;
    });
  }, [institutions, activeTab, typeFilter, districtFilter, searchQuery]);

  const pendingCount = institutions.filter(i => i.verificationStatus === 'pending_verification').length;
  const activeCount = institutions.filter(i => i.verificationStatus === 'active').length;
  const rejectedCount = institutions.filter(i => i.verificationStatus === 'rejected').length;

  const openVerifyModal = (inst: InstitutionItem, approve: boolean) => {
    setSelectedInst(inst);
    setIsApproving(approve);
    setVerificationNote(
      approve
        ? `${inst.type === 'HEI' ? 'AISHE' : 'CIN'} registry validated against DHTE database.`
        : ''
    );
    setVerifyModalVisible(true);
  };

  const handleVerifySubmit = async () => {
    if (!selectedInst) return;
    if (!isApproving && !verificationNote.trim()) {
      Alert.alert('Validation Error', 'Please provide a reason for rejecting this institution.');
      return;
    }

    setActionLoading(true);
    const success = await verifyInstitution(selectedInst.id || selectedInst._id || '', {
      approved: isApproving,
      reason: verificationNote,
    });
    setActionLoading(false);
    setVerifyModalVisible(false);

    if (success) {
      Alert.alert(
        isApproving ? 'Institution Verified' : 'Institution Rejected',
        isApproving
          ? `${selectedInst.name} is now approved to claim and fund challenges.`
          : `${selectedInst.name} accreditation has been declined.`
      );
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
            <ShieldCheck size={14} color="#2F9E8F" />
            <Text style={styles.taglineText}>OFFICIAL REGISTRY & ACCREDITATION</Text>
          </View>
          <Text style={styles.title}>Institutions & CSR Partners</Text>
          <Text style={styles.subtitle}>
            Authenticate Higher Education Institutions (AISHE) and Industry CSR bodies (CIN).
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color="#9BA8A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or AISHE / CIN number..."
            placeholderTextColor="#9BA8A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status Tabs */}
        <View style={styles.statusTabs}>
          {STATUS_TABS.map(tab => {
            const isSelected = activeTab === tab.id;
            const count =
              tab.id === 'pending_verification'
                ? pendingCount
                : tab.id === 'active'
                ? activeCount
                : rejectedCount;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.statusTabBtn,
                  isSelected && styles.statusTabBtnActive,
                ]}
                onPress={() => setActiveTab(tab.id as any)}>
                <Text
                  style={[
                    styles.statusTabText,
                    isSelected && styles.statusTabTextActive,
                  ]}>
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.statusCountBadge,
                    isSelected && { backgroundColor: '#2F9E8F' },
                  ]}>
                  <Text
                    style={[
                      styles.statusCountText,
                      isSelected && { color: '#0F1B1E' },
                    ]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Type Filter Pills */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {TYPE_TOGGLES.map(type => {
              const isSelected = typeFilter === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    isSelected && styles.typeChipActive,
                  ]}
                  onPress={() => setTypeFilter(type)}>
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && styles.typeChipTextActive,
                    ]}>
                    {type === 'HEI' ? 'HEIs (Universities)' : type === 'Industry' ? 'Industry / CSR' : 'All Types'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* District Filter Pills */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {DISTRICT_LIST.map(dist => {
              const isSelected = districtFilter === dist;
              return (
                <TouchableOpacity
                  key={dist}
                  style={[
                    styles.districtChip,
                    isSelected && styles.districtChipActive,
                  ]}
                  onPress={() => setDistrictFilter(dist)}>
                  <Text
                    style={[
                      styles.districtChipText,
                      isSelected && styles.districtChipTextActive,
                    ]}>
                    {dist === 'All' ? 'All Districts' : dist}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Institutions List */}
        <View style={styles.listContainer}>
          {filteredInstitutions.length === 0 ? (
            <View style={styles.emptyState}>
              <Building2 size={36} color="#9BA8A6" />
              <Text style={styles.emptyStateTitle}>No Records Found</Text>
              <Text style={styles.emptyStateSub}>
                No institutional profiles match the current filter selection.
              </Text>
            </View>
          ) : (
            filteredInstitutions.map(inst => {
              const isHEI = inst.type === 'HEI';
              const isPending = inst.verificationStatus === 'pending_verification';
              const isActive = inst.verificationStatus === 'active';

              return (
                <View key={inst.id || inst._id} style={styles.card}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.typeBadge}>
                      {isHEI ? (
                        <GraduationCap size={13} color="#4E7AFF" />
                      ) : (
                        <Briefcase size={13} color="#A855F7" />
                      )}
                      <Text
                        style={[
                          styles.typeBadgeText,
                          { color: isHEI ? '#4E7AFF' : '#A855F7' },
                        ]}>
                        {inst.type}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isActive
                          ? { backgroundColor: 'rgba(47, 158, 143, 0.15)', borderColor: '#2F9E8F' }
                          : isPending
                          ? { backgroundColor: 'rgba(232, 163, 61, 0.15)', borderColor: '#E8A33D' }
                          : { backgroundColor: 'rgba(193, 68, 59, 0.15)', borderColor: '#C1443B' },
                      ]}>
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isActive
                            ? { color: '#2F9E8F' }
                            : isPending
                            ? { color: '#E8A33D' }
                            : { color: '#F87171' },
                        ]}>
                        {isActive ? 'VERIFIED' : isPending ? 'PENDING REVIEW' : 'REJECTED'}
                      </Text>
                    </View>
                  </View>

                  {/* Institution Name */}
                  <Text style={styles.instName}>{inst.name}</Text>

                  {/* Registration ID */}
                  <View style={styles.regBox}>
                    <Text style={styles.regLabel}>
                      {isHEI ? 'AISHE CODE' : 'CORPORATE CIN'}:
                    </Text>
                    <Text style={styles.regValue}>{inst.registrationNumber}</Text>
                  </View>

                  {/* Details */}
                  <View style={styles.metaContainer}>
                    <View style={styles.metaRow}>
                      <MapPin size={13} color="#9BA8A6" />
                      <Text style={styles.metaText}>{inst.district}, Jharkhand</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Mail size={13} color="#9BA8A6" />
                      <Text style={styles.metaText}>{inst.contactEmail}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Phone size={13} color="#9BA8A6" />
                      <Text style={styles.metaText}>{inst.contactPhone}</Text>
                    </View>
                  </View>

                  {/* Action Buttons for Pending */}
                  {isPending && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.btnRejectInst]}
                        onPress={() => openVerifyModal(inst, false)}>
                        <XCircle size={15} color="#F87171" />
                        <Text style={styles.btnRejectText}>Reject</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.btnVerifyInst]}
                        onPress={() => openVerifyModal(inst, true)}>
                        <CheckCircle2 size={15} color="#0F1B1E" />
                        <Text style={styles.btnVerifyText}>Verify & Authorize</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Verified Stamp */}
                  {isActive && (
                    <View style={styles.verifiedStamp}>
                      <CheckCircle2 size={14} color="#2F9E8F" />
                      <Text style={styles.verifiedStampText}>
                        DHTE Authorized Innovation Node
                      </Text>
                    </View>
                  )}

                  {/* Rejection Note */}
                  {inst.verificationStatus === 'rejected' && inst.rejectionReason && (
                    <View style={styles.rejectionBox}>
                      <AlertCircle size={14} color="#F87171" />
                      <Text style={styles.rejectionText}>
                        Reason: {inst.rejectionReason}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Verify / Reject Modal */}
      <Modal
        visible={verifyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVerifyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {isApproving ? (
                <ShieldCheck size={22} color="#2F9E8F" />
              ) : (
                <XCircle size={22} color="#F87171" />
              )}
              <Text style={styles.modalTitle}>
                {isApproving ? 'Authorize Organization' : 'Reject Accreditation'}
              </Text>
            </View>

            <Text style={styles.modalInstName}>{selectedInst?.name}</Text>
            <Text style={styles.modalSub}>
              {selectedInst?.type === 'HEI' ? 'AISHE Code' : 'Corporate CIN'}:{' '}
              {selectedInst?.registrationNumber}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder={
                isApproving
                  ? 'Verification note (e.g. AISHE code validated with UGC/AICTE portal)...'
                  : 'Mandatory reason for rejecting accreditation...'
              }
              placeholderTextColor="#9BA8A6"
              multiline
              numberOfLines={3}
              value={verificationNote}
              onChangeText={setVerificationNote}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setVerifyModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  { backgroundColor: isApproving ? '#2F9E8F' : '#C1443B' },
                ]}
                onPress={handleVerifySubmit}>
                <Text
                  style={[
                    styles.modalSubmitText,
                    { color: isApproving ? '#0F1B1E' : '#F2EFE9' },
                  ]}>
                  {isApproving ? 'Confirm Authorization' : 'Reject Application'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: '800',
    color: '#F2EFE9',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#9BA8A6',
    marginTop: 4,
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16262A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D3238',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F2EFE9',
    fontSize: 13,
    padding: 0,
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#16262A',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 12,
  },
  statusTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusTabBtnActive: {
    backgroundColor: '#0F1B1E',
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9BA8A6',
  },
  statusTabTextActive: {
    color: '#F2EFE9',
    fontWeight: '700',
  },
  statusCountBadge: {
    backgroundColor: '#1D3238',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9BA8A6',
  },
  filterRow: {
    marginBottom: 10,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#16262A',
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  typeChipActive: {
    backgroundColor: 'rgba(47, 158, 143, 0.15)',
    borderColor: '#2F9E8F',
  },
  typeChipText: {
    fontSize: 11,
    color: '#9BA8A6',
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#2F9E8F',
    fontWeight: '700',
  },
  districtChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#16262A',
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  districtChipActive: {
    backgroundColor: '#1E373D',
    borderColor: '#2F9E8F',
  },
  districtChipText: {
    fontSize: 11,
    color: '#9BA8A6',
  },
  districtChipTextActive: {
    color: '#2F9E8F',
    fontWeight: '700',
  },
  listContainer: {
    marginTop: 6,
    gap: 12,
  },
  card: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0F1B1E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  instName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F2EFE9',
    marginBottom: 8,
  },
  regBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F1B1E',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 10,
  },
  regLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9BA8A6',
  },
  regValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  metaContainer: {
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#9BA8A6',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnRejectInst: {
    backgroundColor: 'rgba(193, 68, 59, 0.15)',
    borderWidth: 1,
    borderColor: '#C1443B',
  },
  btnRejectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F87171',
  },
  btnVerifyInst: {
    backgroundColor: '#2F9E8F',
  },
  btnVerifyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F1B1E',
  },
  verifiedStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
  },
  verifiedStampText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F9E8F',
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
  },
  rejectionText: {
    fontSize: 11,
    color: '#F87171',
  },
  emptyState: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1D3238',
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F2EFE9',
    marginTop: 10,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#9BA8A6',
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 27, 30, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#16262A',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F2EFE9',
  },
  modalInstName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F9E8F',
    marginTop: 4,
  },
  modalSub: {
    fontSize: 11,
    color: '#9BA8A6',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#0F1B1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D3238',
    color: '#F2EFE9',
    padding: 12,
    fontSize: 13,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  modalCancelText: {
    fontSize: 12,
    color: '#9BA8A6',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalSubmitText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
