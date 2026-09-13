import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Share, ActivityIndicator, Modal, Platform, Alert, TextInput, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, MapPin, Share2, CheckCircle2, Building2, ShieldCheck,
  Calendar, AlertCircle, Clock, ThumbsUp, Camera, Activity, FileCheck, Wrench, X, Trash2, Edit3, RefreshCw, Plus
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProblemStore } from '../../store/problemStore';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useTheme } from '../../context/ThemeContext';
import LeafletMap from '../../components/LeafletMap';
import WorkflowTracker from '../../components/WorkflowTracker';

export default function ProblemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { problems, fetchProblems, updateProblem, deleteProblem } = useProblemStore() as any;
  const { user } = useAuthStore() as any;
  const { showToast } = useToastStore();
  const { theme, isDarkMode } = useTheme();

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [upvotes, setUpvotes] = useState(142);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Edit Modal State - Only what the user inputs (Title, Description, Photos, Location)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImages, setEditImages] = useState<any[]>([]);
  const [editState, setEditState] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editBlock, setEditBlock] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLat, setEditLat] = useState(23.3441);
  const [editLng, setEditLng] = useState(85.3096);

  useEffect(() => {
    if (problems.length === 0) {
      fetchProblems();
    }
  }, []);

  useEffect(() => {
    if (problems && problems.length > 0) {
      const found = problems.find((p: any) => p.id === id || p._id === id);
      setProblem(found || problems[0]);
      setLoading(false);
    }
  }, [id, problems]);

  // Author Verification: citizen who reported the problem or device owner who filed it offline
  const currentUserId = user?._id || user?.id;
  const currentUserEmail = user?.email?.toLowerCase();

  const problemAuthorId =
    (typeof problem?.reportedBy === 'string' ? problem.reportedBy : null) ||
    problem?.reportedBy?._id ||
    problem?.reportedBy?.id ||
    problem?.userId ||
    problem?.citizenId;

  const problemAuthorEmail = problem?.reportedBy?.email?.toLowerCase();
  const isOfflineTicket = Boolean(
    problem?.isOffline ||
    String(problem?._id || problem?.id || '').startsWith('offline_')
  );

  const isAuthor = Boolean(
    (user && currentUserId && problemAuthorId && String(currentUserId) === String(problemAuthorId)) ||
    (user && currentUserEmail && problemAuthorEmail && currentUserEmail === problemAuthorEmail) ||
    isOfflineTicket ||
    (user && user?.role === 'citizen')
  );

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      showToast("Thank you for supporting this issue!", "success");
    }
  };

  const handleShare = async () => {
    if (!problem) return;
    try {
      await Share.share({
        message: `Samvad-Setu Issue [${problem._id || problem.id}]: ${problem.title}\nCategory: ${problem.category}\nView on Samvad Setu.`
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  const handleOpenEdit = () => {
    if (!isAuthor) {
      showToast("Permission denied. You can only edit your own reports.", "error");
      return;
    }
    setEditTitle(problem.title || '');
    setEditDescription(problem.description || '');
    setEditImages(problem.images ? [...problem.images] : []);
    setEditState(problem.location?.state || 'Jharkhand');
    setEditDistrict(problem.location?.district || 'Ranchi');
    setEditBlock(problem.location?.block || '');
    setEditAddress(problem.location?.address || '');
    setEditLat(problem.location?.lat || problem.latitude || 23.3441);
    setEditLng(problem.location?.lng || problem.longitude || 85.3096);
    setIsEditModalOpen(true);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setEditImages(prev => [...prev, { url: asset.uri, uri: asset.uri }]);
      }
    } catch (err) {
      console.error("Error picking photo", err);
      showToast("Could not select photo.", "error");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setEditImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveEdit = async () => {
    if (!isAuthor) {
      showToast("Permission denied. You can only edit your own reports.", "error");
      setIsEditModalOpen(false);
      return;
    }
    if (!editTitle.trim()) {
      showToast("Problem title cannot be empty.", "error");
      return;
    }

    setIsSaving(true);
    // Notice: category and urgency remain untouched (decided by AI background agent)
    const updatedPayload = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      images: editImages,
      location: {
        ...(problem.location || {}),
        state: editState.trim(),
        district: editDistrict.trim(),
        block: editBlock.trim(),
        address: editAddress.trim(),
        lat: editLat,
        lng: editLng,
      },
    };

    const result = await updateProblem(problem._id || problem.id, updatedPayload);
    setIsSaving(false);

    if (result.success || !result.error) {
      setProblem((prev: any) => ({
        ...prev,
        ...updatedPayload,
        location: {
          ...(prev.location || {}),
          ...updatedPayload.location,
        },
      }));
      setIsEditModalOpen(false);
      showToast("Report updated successfully!", "success");
    } else {
      showToast(result.error || "Failed to update report.", "error");
    }
  };

  const handleDelete = () => {
    if (!isAuthor) {
      showToast("Permission denied. You can only delete your own reports.", "error");
      return;
    }

    Alert.alert(
      "Delete Problem",
      "Are you sure you want to delete this problem?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const success = await deleteProblem(problem._id || problem.id);
            if (success) {
              showToast("Problem deleted successfully.", "success");
              router.replace('/(citizen)/home');
            } else {
              showToast("Failed to delete the problem.", "error");
            }
          }
        }
      ]
    );
  };

  if (loading || !problem) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.citizenPrimary} />
        <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading problem details...</Text>
      </SafeAreaView>
    );
  }

  const slaHours = problem.urgency === 'urgent' ? 168 : 336;
  const reportedAt = new Date(problem.createdAt || Date.now()).getTime();
  const dueAt = reportedAt + slaHours * 60 * 60 * 1000;
  const remainingHours = Math.max(0, Math.ceil((dueAt - Date.now()) / (60 * 60 * 1000)));

  const getStatusColor = (status: string) => {
    if (status === 'new' || status === 'open') return theme.citizenPrimary;
    if (status === 'in-progress') return theme.accent;
    if (status === 'resolved' || status === 'closed') return theme.authorityPrimary;
    return theme.subtext;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Navigation */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, marginLeft: -8 }}>
            <ArrowLeft size={20} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, marginLeft: 8, fontSize: 14 }}>Back</Text>
          </TouchableOpacity>
          <View style={{ backgroundColor: isDarkMode ? 'rgba(232, 163, 61, 0.1)' : 'rgba(203, 125, 24, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: isDarkMode ? 'rgba(232, 163, 61, 0.2)' : 'rgba(203, 125, 24, 0.2)' }}>
            <Text style={{ color: theme.citizenPrimary, fontSize: 10, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
              REF: #{String(problem._id || problem.id).substring(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Hero Card */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', marginBottom: 20 }}>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getStatusColor(problem.status) }} />
              <View style={{ backgroundColor: theme.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                  URGENCY: <Text style={{ color: theme.citizenPrimary }}>{problem.urgency?.toUpperCase() || 'MEDIUM'}</Text>
                </Text>
              </View>
              <TouchableOpacity onPress={handleShare} style={{ marginLeft: 'auto', padding: 4 }}>
                <Share2 size={20} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <Text style={{ flex: 1, color: theme.text, fontSize: 24, fontWeight: '800', lineHeight: 32 }}>
                {problem.title}
              </Text>
              {isAuthor && (
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <TouchableOpacity 
                    onPress={handleOpenEdit} 
                    style={{ 
                      paddingHorizontal: 12, 
                      paddingVertical: 8, 
                      backgroundColor: isDarkMode ? 'rgba(47, 158, 143, 0.15)' : 'rgba(47, 158, 143, 0.12)', 
                      borderRadius: 12, 
                      borderWidth: 1, 
                      borderColor: theme.authorityPrimary,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Edit3 size={15} color={theme.authorityPrimary} />
                    <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: '700' }}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleDelete} 
                    style={{ 
                      padding: 8, 
                      backgroundColor: theme.errorBg, 
                      borderRadius: 12, 
                      borderWidth: 1, 
                      borderColor: isDarkMode ? 'rgba(248, 113, 113, 0.3)' : 'rgba(220, 38, 38, 0.2)' 
                    }}
                  >
                    <Trash2 size={18} color={theme.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={14} color={theme.citizenPrimary} style={{ marginRight: 6 }} />
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{problem.location?.district || "Jharkhand"}, {problem.location?.block || "Block"}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={14} color={theme.authorityPrimary} style={{ marginRight: 6 }} />
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Reported {new Date(problem.createdAt || Date.now()).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: theme.borderSubtle, marginBottom: 20 }} />

            <Text style={{ color: theme.text, fontSize: 15, lineHeight: 24, marginBottom: 20 }}>
              {problem.description}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: remainingHours === 0 ? theme.errorBg : (isDarkMode ? 'rgba(232, 163, 61, 0.1)' : 'rgba(203, 125, 24, 0.1)'), padding: 12, borderRadius: 12, borderWidth: 1, borderColor: remainingHours === 0 ? theme.error : theme.border }}>
              <Clock size={18} color={remainingHours === 0 ? theme.error : theme.citizenPrimary} style={{ marginRight: 10 }} />
              <Text style={{ color: remainingHours === 0 ? theme.error : theme.citizenPrimary, fontSize: 13, fontWeight: '600' }}>
                Municipal SLA: {remainingHours ? `${remainingHours} hours remaining` : 'SLA breached'} 
                <Text style={{ opacity: 0.8, fontSize: 11 }}> ({slaHours / 24}-day target)</Text>
              </Text>
            </View>
          </View>

          {/* Citizen Impact Bar */}
          <View style={{ backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.borderSubtle, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.card, borderWidth: 2, borderColor: theme.border, zIndex: 3, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.text, fontSize: 10, fontWeight: 'bold' }}>A</Text></View>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.authorityPrimary, borderWidth: 2, borderColor: theme.card, zIndex: 2, marginLeft: -12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>R</Text></View>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.citizenPrimary, borderWidth: 2, borderColor: theme.card, zIndex: 1, marginLeft: -12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>K</Text></View>
              </View>
              <Text style={{ color: theme.subtext, fontSize: 12 }}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>+{upvotes}</Text> impacted
              </Text>
            </View>

            <TouchableOpacity 
              onPress={handleUpvote}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: hasUpvoted ? theme.citizenPrimary : 'transparent', borderWidth: 1, borderColor: theme.citizenPrimary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
            >
              <ThumbsUp size={14} color={hasUpvoted ? '#FFFFFF' : theme.citizenPrimary} style={{ marginRight: 6 }} />
              <Text style={{ color: hasUpvoted ? '#FFFFFF' : theme.citizenPrimary, fontSize: 12, fontWeight: '700' }}>
                {hasUpvoted ? 'Supported' : 'Support Issue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Media Evidence Display */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.borderSubtle, paddingBottom: 16, marginBottom: 16 }}>
            <Camera size={20} color={theme.citizenPrimary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>Verified Evidence</Text>
          </View>

          {problem.images && problem.images.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {problem.images.map((img: any, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => setPreviewImage(img.url || img.uri || img)}
                  style={{ width: '47%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}
                >
                  <Image source={{ uri: img.url || img.uri || img }} style={{ width: '100%', height: '100%' }} />
                  <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: theme.citizenPrimary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' }}>Expand</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ backgroundColor: theme.errorBg, borderWidth: 1, borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.2)', borderStyle: 'dashed', borderRadius: 12, padding: 24, alignItems: 'center' }}>
              <Camera size={32} color={theme.error} style={{ marginBottom: 12 }} />
              <Text style={{ color: theme.error, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>No Proof Attached</Text>
              <Text style={{ color: theme.subtext, fontSize: 11, textAlign: 'center' }}>Issues without evidence are highly unlikely to be processed.</Text>
            </View>
          )}
        </View>

        {/* Leaflet OpenStreetMap Location */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 18, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MapPin size={18} color={theme.citizenPrimary} />
              <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800' }}>Geographic Location</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(47, 158, 143, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '800' }}>Leaflet (OSM)</Text>
            </View>
          </View>

          <View style={{ height: 180, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
            <LeafletMap
              mode="view"
              initialLatitude={problem.location?.lat || 23.3441}
              initialLongitude={problem.location?.lng || 85.3096}
              initialZoom={14}
              markers={[{
                id: String(problem._id || problem.id),
                latitude: problem.location?.lat || 23.3441,
                longitude: problem.location?.lng || 85.3096,
                title: problem.title,
                category: problem.category,
                status: problem.status,
                urgency: problem.urgency
              }]}
              height={180}
              isDarkMode={false}
            />
          </View>
          <Text style={{ color: theme.subtext, fontSize: 11, marginTop: 8 }}>
            📍 {problem.location?.address || `${problem.location?.district || 'Ranchi'}, Jharkhand`} • ({(problem.location?.lat || 23.3441).toFixed(4)}, {(problem.location?.lng || 85.3096).toFixed(4)})
          </Text>
        </View>

        {/* Dynamic Workflow & Resolution Tracker */}
        <WorkflowTracker problem={problem} />

      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 27, 30, 0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 100, padding: 12, backgroundColor: '#1D3238', borderRadius: 24 }}
            onPress={() => setPreviewImage(null)}
          >
            <X size={24} color="#F2EFE9" />
          </TouchableOpacity>
          {previewImage && (
            <Image 
              source={{ uri: previewImage }} 
              style={{ width: '90%', height: '80%', borderRadius: 16 }} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>

      {/* Edit Problem Modal - Restricted strictly to what the user inputted */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'flex-end' }}
        >
          <View 
            style={{ 
              backgroundColor: theme.card, 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24, 
              borderWidth: 1, 
              borderColor: theme.border, 
              maxHeight: '88%', 
              paddingTop: 20, 
              paddingHorizontal: 20, 
              paddingBottom: Platform.OS === 'ios' ? 34 : 20 
            }}
          >
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text style={{ color: theme.citizenPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Author Edit Mode
                </Text>
                <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', marginTop: 2 }}>
                  Edit Problem Details
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsEditModalOpen(false)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border }}
              >
                <X size={18} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* 1. Problem Title */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 }}>
                  PROBLEM TITLE *
                </Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter problem title"
                  placeholderTextColor={theme.subtext}
                  style={{
                    backgroundColor: theme.inputBg,
                    borderWidth: 1,
                    borderColor: theme.inputBorder,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    color: theme.text,
                    fontSize: 14,
                  }}
                />
              </View>

              {/* 2. Detailed Description */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 }}>
                  DETAILED DESCRIPTION
                </Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Describe the issue in detail..."
                  placeholderTextColor={theme.subtext}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: theme.inputBg,
                    borderWidth: 1,
                    borderColor: theme.inputBorder,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    color: theme.text,
                    fontSize: 14,
                    minHeight: 90,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              {/* 3. Evidence / Photos (User can add new or remove/replace) */}
              <View style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                    ATTACHED PHOTOS
                  </Text>
                  <TouchableOpacity 
                    onPress={handlePickImage}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
                  >
                    <Plus size={12} color={theme.citizenPrimary} />
                    <Text style={{ color: theme.citizenPrimary, fontSize: 11, fontWeight: '700' }}>Add Photo</Text>
                  </TouchableOpacity>
                </View>

                {editImages.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                    {editImages.map((img: any, idx: number) => {
                      const uri = img.url || img.uri || img;
                      return (
                        <View key={idx} style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, position: 'relative' }}>
                          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                          <TouchableOpacity
                            onPress={() => handleRemoveImage(idx)}
                            style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(239, 68, 68, 0.9)', padding: 4, borderRadius: 12 }}
                          >
                            <Trash2 size={12} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <TouchableOpacity
                    onPress={handlePickImage}
                    style={{
                      borderWidth: 1.5,
                      borderColor: theme.border,
                      borderStyle: 'dashed',
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                      backgroundColor: theme.surface,
                    }}
                  >
                    <Camera size={22} color={theme.citizenPrimary} style={{ marginBottom: 4 }} />
                    <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>Tap to attach photo proof</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 4. Location Details (User chosen location) */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: theme.subtext, fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 }}>
                  LOCATION DETAILS
                </Text>
                
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.subtext, fontSize: 10, marginBottom: 4 }}>STATE</Text>
                    <TextInput
                      value={editState}
                      onChangeText={setEditState}
                      style={{
                        backgroundColor: theme.inputBg,
                        borderWidth: 1,
                        borderColor: theme.inputBorder,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: theme.text,
                        fontSize: 13,
                      }}
                      placeholder="State"
                      placeholderTextColor={theme.subtext}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.subtext, fontSize: 10, marginBottom: 4 }}>DISTRICT</Text>
                    <TextInput
                      value={editDistrict}
                      onChangeText={setEditDistrict}
                      style={{
                        backgroundColor: theme.inputBg,
                        borderWidth: 1,
                        borderColor: theme.inputBorder,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: theme.text,
                        fontSize: 13,
                      }}
                      placeholder="District"
                      placeholderTextColor={theme.subtext}
                    />
                  </View>
                </View>

                <View style={{ marginBottom: 10 }}>
                  <Text style={{ color: theme.subtext, fontSize: 10, marginBottom: 4 }}>BLOCK / LOCALITY</Text>
                  <TextInput
                    value={editBlock}
                    onChangeText={setEditBlock}
                    style={{
                      backgroundColor: theme.inputBg,
                      borderWidth: 1,
                      borderColor: theme.inputBorder,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: theme.text,
                      fontSize: 13,
                    }}
                    placeholder="Block / Locality"
                    placeholderTextColor={theme.subtext}
                  />
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: theme.subtext, fontSize: 10, marginBottom: 4 }}>STREET ADDRESS / LANDMARK</Text>
                  <TextInput
                    value={editAddress}
                    onChangeText={setEditAddress}
                    style={{
                      backgroundColor: theme.inputBg,
                      borderWidth: 1,
                      borderColor: theme.inputBorder,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: theme.text,
                      fontSize: 13,
                    }}
                    placeholder="e.g. Near Community Center, Main Road"
                    placeholderTextColor={theme.subtext}
                  />
                </View>

                {/* Interactive Leaflet Pin Adjuster */}
                <View>
                  <Text style={{ color: theme.subtext, fontSize: 10, marginBottom: 4 }}>ADJUST PIN ON MAP</Text>
                  <View style={{ height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                    <LeafletMap
                      mode="picker"
                      selectedLatitude={editLat}
                      selectedLongitude={editLng}
                      onLocationChange={(lat, lng) => {
                        setEditLat(lat);
                        setEditLng(lng);
                      }}
                      height={140}
                      isDarkMode={isDarkMode}
                    />
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.surface,
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: 14, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveEdit}
                  disabled={isSaving}
                  style={{
                    flex: 2,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: theme.citizenPrimary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}