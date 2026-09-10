import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  Phone,
  Mail,
  AlertOctagon,
  Flame,
  Info,
} from 'lucide-react-native';
import { useGovStore, FlaggedProblem } from '../../../store/govStore';
import { getProblemForReview } from '../../../api/govApi';

const DHTE_DOMAINS = [
  'Civil Infrastructure',
  'Water & Drainage',
  'Mining Hazards',
  'Agriculture & Forestry',
  'Education & Skilling',
  'Healthcare & Sanitation',
  'Clean Energy',
];

export default function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { moderateProblem } = useGovStore();

  const [problem, setProblem] = useState<FlaggedProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [reclassifyModalVisible, setReclassifyModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [reclassifyNote, setReclassifyNote] = useState('');

  useEffect(() => {
    loadProblemDetail();
  }, [id]);

  const loadProblemDetail = async () => {
    setLoading(true);
    try {
      const data = await getProblemForReview(id as string);
      setProblem(data);
      if (data?.category) {
        setNewCategory(data.category);
      }
    } catch (e) {
      console.error('Failed to load problem review detail', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    Alert.alert(
      'Approve Incident',
      'This will clear AI flags and publish the challenge directly to Higher Education Institutions (HEIs) for research claims.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Publish',
          style: 'default',
          onPress: async () => {
            setActionLoading(true);
            const success = await moderateProblem(problem?.id || (id as string), {
              action: 'approve',
              note: 'Approved by DHTE State Administrator',
            });
            setActionLoading(false);
            if (success) {
              Alert.alert('Approved', 'Incident successfully approved and published to HEI queue.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Validation Error', 'Please provide a justification note for rejecting this report.');
      return;
    }
    setActionLoading(true);
    const success = await moderateProblem(problem?.id || (id as string), {
      action: 'reject',
      note: rejectReason,
    });
    setActionLoading(false);
    setRejectModalVisible(false);
    if (success) {
      Alert.alert('Rejected', 'The incident report has been rejected and archived.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleReclassifyConfirm = async () => {
    if (!newCategory) {
      Alert.alert('Validation Error', 'Please select a domain taxonomy.');
      return;
    }
    setActionLoading(true);
    const success = await moderateProblem(problem?.id || (id as string), {
      action: 'reclassify',
      correctedCategory: newCategory,
      note: reclassifyNote || 'Domain reclassified by DHTE officer',
    });
    setActionLoading(false);
    setReclassifyModalVisible(false);
    if (success) {
      Alert.alert('Reclassified', `Successfully reclassified problem to ${newCategory}.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#2F9E8F" size="large" />
      </SafeAreaView>
    );
  }

  if (!problem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#F2EFE9', fontSize: 16 }}>Problem report not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ color: '#2F9E8F', marginTop: 12 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const confidence = problem.aiMetadata?.confidence ?? 0.5;
  const confidencePercent = Math.round(confidence * 100);

  const getConfidenceColor = (conf: number) => {
    if (conf < 50) return '#F87171';
    if (conf <= 75) return '#E8A33D';
    return '#2F9E8F';
  };

  const confColor = getConfidenceColor(confidencePercent);
  const isCritical = problem.urgency === 'critical';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#F2EFE9" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerId}>{problem.id || problem._id}</Text>
            <Text style={styles.headerTitle}>AI Moderation Review</Text>
          </View>
          <View style={styles.dhteTag}>
            <Text style={styles.dhteTagText}>DHTE GOVT</Text>
          </View>
        </View>

        {/* AI Diagnostic Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={18} color="#2F9E8F" />
              <Text style={styles.aiCardTitle}>AI Classification Diagnostics</Text>
            </View>
            <View style={[styles.aiUrgencyBadge, isCritical && { backgroundColor: 'rgba(193, 68, 59, 0.2)' }]}>
              {isCritical && <Flame size={12} color="#F87171" />}
              <Text style={[styles.aiUrgencyText, isCritical ? { color: '#F87171' } : { color: '#E8A33D' }]}>
                {problem.urgency.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Confidence Meter */}
          <View style={styles.meterContainer}>
            <View style={styles.meterLabelRow}>
              <Text style={styles.meterLabel}>Confidence Certainty</Text>
              <Text style={[styles.meterValue, { color: confColor }]}>{confidencePercent}%</Text>
            </View>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${confidencePercent}%`, backgroundColor: confColor },
                ]}
              />
            </View>
          </View>

          {/* Diagnostic Details */}
          <View style={styles.diagnosticDetails}>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Assigned Domain:</Text>
              <Text style={styles.diagValue}>{problem.aiMetadata?.category || problem.category}</Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Trigger Reason:</Text>
              <Text style={[styles.diagValue, { color: '#E8A33D' }]}>
                {problem.aiMetadata?.flagReason === 'low_confidence'
                  ? 'Ambiguous semantic features (<50% threshold)'
                  : problem.aiMetadata?.flagReason === 'signal_discrepancy'
                  ? 'Sensor & geo-location discrepancy'
                  : 'Citizen flagged priority escalation'}
              </Text>
            </View>

            {/* Emergency Override Indicator */}
            {isCritical && (
              <View style={styles.emergencyWarningBox}>
                <AlertOctagon size={16} color="#F87171" />
                <Text style={styles.emergencyWarningText}>
                  Emergency keywords detected ("Cave-in / Contamination / Hazard"). Escalated to DHTE priority dispatch.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Problem Title & Description Card */}
        <View style={styles.contentCard}>
          <Text style={styles.problemTitle}>{problem.title}</Text>
          <Text style={styles.problemDescription}>{problem.description}</Text>

          {/* Image Gallery */}
          {problem.images && problem.images.length > 0 && (
            <View style={styles.mediaContainer}>
              <Text style={styles.sectionSub}>ATTACHED EVIDENCE</Text>
              <View style={styles.imageGallery}>
                {problem.images.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: img.url }}
                    style={styles.attachedImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </View>
          )}

          {/* Location Details */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionSub}>GEOGRAPHIC TRACE</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color="#2F9E8F" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.locationAddress}>{problem.location.address}</Text>
                <Text style={styles.coordsText}>
                  Lat: {problem.location.lat.toFixed(4)}, Lng: {problem.location.lng.toFixed(4)} • District:{' '}
                  {problem.location.district}
                </Text>
              </View>
            </View>
          </View>

          {/* Citizen Reporter Info */}
          {problem.reportedBy && (
            <View style={styles.reporterSection}>
              <Text style={styles.sectionSub}>REPORTING CITIZEN</Text>
              <View style={styles.reporterDetails}>
                <View style={styles.reporterItem}>
                  <User size={14} color="#9BA8A6" />
                  <Text style={styles.reporterText}>{problem.reportedBy.name}</Text>
                </View>
                <View style={styles.reporterItem}>
                  <Mail size={14} color="#9BA8A6" />
                  <Text style={styles.reporterText}>{problem.reportedBy.email}</Text>
                </View>
                <View style={styles.reporterItem}>
                  <Phone size={14} color="#9BA8A6" />
                  <Text style={styles.reporterText}>{problem.reportedBy.phone}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Administrative Action Bar */}
      <View style={styles.actionBar}>
        {actionLoading ? (
          <ActivityIndicator color="#2F9E8F" style={{ flex: 1, padding: 12 }} />
        ) : (
          <View style={styles.actionButtonsRow}>
            {/* Reject Button */}
            <TouchableOpacity
              style={[styles.btnAction, styles.btnReject]}
              onPress={() => setRejectModalVisible(true)}>
              <XCircle size={18} color="#F87171" />
              <Text style={styles.btnRejectText}>Reject</Text>
            </TouchableOpacity>

            {/* Reclassify Button */}
            <TouchableOpacity
              style={[styles.btnAction, styles.btnReclassify]}
              onPress={() => setReclassifyModalVisible(true)}>
              <Edit3 size={18} color="#E8A33D" />
              <Text style={styles.btnReclassifyText}>Reclassify</Text>
            </TouchableOpacity>

            {/* Approve Button */}
            <TouchableOpacity
              style={[styles.btnAction, styles.btnApprove]}
              onPress={handleApprove}>
              <CheckCircle2 size={18} color="#0F1B1E" />
              <Text style={styles.btnApproveText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Reject Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <XCircle size={22} color="#F87171" />
              <Text style={styles.modalTitle}>Reject Incident</Text>
            </View>
            <Text style={styles.modalDesc}>
              Provide a mandatory reason for rejecting this report. This action will be recorded in the audit trail.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Duplicate report, insufficient evidence, or out of DHTE scope..."
              placeholderTextColor="#9BA8A6"
              multiline
              numberOfLines={3}
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmRejectBtn}
                onPress={handleRejectConfirm}>
                <Text style={styles.modalConfirmRejectText}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reclassify Modal */}
      <Modal
        visible={reclassifyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReclassifyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Edit3 size={22} color="#E8A33D" />
              <Text style={styles.modalTitle}>Override Taxonomy</Text>
            </View>
            <Text style={styles.modalDesc}>
              Select the correct domain taxonomy to route this challenge to appropriate university departments:
            </Text>

            <ScrollView style={{ maxHeight: 150, marginBottom: 12 }}>
              {DHTE_DOMAINS.map(domain => {
                const isSelected = newCategory === domain;
                return (
                  <TouchableOpacity
                    key={domain}
                    style={[
                      styles.domainChoiceItem,
                      isSelected && { borderColor: '#2F9E8F', backgroundColor: 'rgba(47, 158, 143, 0.15)' },
                    ]}
                    onPress={() => setNewCategory(domain)}>
                    <Text
                      style={[
                        styles.domainChoiceText,
                        isSelected && { color: '#2F9E8F', fontWeight: '700' },
                      ]}>
                      {domain}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TextInput
              style={styles.modalInput}
              placeholder="Rationale / Moderator note (optional)..."
              placeholderTextColor="#9BA8A6"
              value={reclassifyNote}
              onChangeText={setReclassifyNote}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReclassifyModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmReclassifyBtn}
                onPress={handleReclassifyConfirm}>
                <Text style={styles.modalConfirmReclassifyText}>Apply & Save</Text>
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
    backgroundColor: '#0F1B1E',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#16262A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D3238',
  },
  headerId: {
    fontSize: 11,
    color: '#9BA8A6',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F2EFE9',
  },
  dhteTag: {
    backgroundColor: 'rgba(47, 158, 143, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(47, 158, 143, 0.3)',
  },
  dhteTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2F9E8F',
  },
  aiCard: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2F9E8F',
    marginBottom: 16,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  aiCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F2EFE9',
  },
  aiUrgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(232, 163, 61, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aiUrgencyText: {
    fontSize: 10,
    fontWeight: '800',
  },
  meterContainer: {
    marginBottom: 14,
  },
  meterLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  meterLabel: {
    fontSize: 11,
    color: '#9BA8A6',
    fontWeight: '600',
  },
  meterValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  meterTrack: {
    height: 8,
    backgroundColor: '#0F1B1E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  diagnosticDetails: {
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diagLabel: {
    fontSize: 11,
    color: '#9BA8A6',
  },
  diagValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F2EFE9',
    maxWidth: '65%',
    textAlign: 'right',
  },
  emergencyWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(193, 68, 59, 0.15)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C1443B',
    marginTop: 6,
  },
  emergencyWarningText: {
    fontSize: 11,
    color: '#F87171',
    flex: 1,
    lineHeight: 15,
  },
  contentCard: {
    backgroundColor: '#16262A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 16,
  },
  problemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F2EFE9',
    marginBottom: 8,
  },
  problemDescription: {
    fontSize: 13,
    color: '#9BA8A6',
    lineHeight: 19,
    marginBottom: 16,
  },
  sectionSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9BA8A6',
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  mediaContainer: {
    marginBottom: 16,
  },
  imageGallery: {
    flexDirection: 'row',
    gap: 10,
  },
  attachedImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  locationSection: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F2EFE9',
  },
  coordsText: {
    fontSize: 11,
    color: '#9BA8A6',
    marginTop: 2,
  },
  reporterSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
  },
  reporterDetails: {
    gap: 6,
  },
  reporterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reporterText: {
    fontSize: 12,
    color: '#F2EFE9',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#16262A',
    borderTopWidth: 1,
    borderTopColor: '#1D3238',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnReject: {
    backgroundColor: 'rgba(193, 68, 59, 0.15)',
    borderWidth: 1,
    borderColor: '#C1443B',
  },
  btnRejectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F87171',
  },
  btnReclassify: {
    backgroundColor: 'rgba(232, 163, 61, 0.15)',
    borderWidth: 1,
    borderColor: '#E8A33D',
  },
  btnReclassifyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E8A33D',
  },
  btnApprove: {
    backgroundColor: '#2F9E8F',
  },
  btnApproveText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F1B1E',
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
  modalDesc: {
    fontSize: 12,
    color: '#9BA8A6',
    lineHeight: 16,
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
  modalConfirmRejectBtn: {
    backgroundColor: '#C1443B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalConfirmRejectText: {
    fontSize: 12,
    color: '#F2EFE9',
    fontWeight: '700',
  },
  modalConfirmReclassifyBtn: {
    backgroundColor: '#2F9E8F',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalConfirmReclassifyText: {
    fontSize: 12,
    color: '#0F1B1E',
    fontWeight: '800',
  },
  domainChoiceItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D3238',
    marginBottom: 6,
    backgroundColor: '#0F1B1E',
  },
  domainChoiceText: {
    fontSize: 12,
    color: '#9BA8A6',
  },
});