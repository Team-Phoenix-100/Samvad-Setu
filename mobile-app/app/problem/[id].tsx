import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Share, ActivityIndicator, Modal, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, MapPin, Share2, CheckCircle2, Building2, ShieldCheck,
  Calendar, AlertCircle, Clock, ThumbsUp, Camera, Activity, FileCheck, Wrench, X, Trash2
} from 'lucide-react-native';
import { useProblemStore } from '../../store/problemStore';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

const LIFECYCLE_STAGES = [
  { stage: "Reported & Classified", actor: "Citizen & AI Engine", icon: FileCheck, color: '#3B82F6', active: true },
  { stage: "Verified by Authority", actor: "Municipal Admin", icon: ShieldCheck, color: '#10B981', active: true },
  { stage: "Assigned to Tech Partner", actor: "Ranchi University", icon: Building2, color: '#8B5CF6', active: true },
  { stage: "CSR Funds Pledged", actor: "Tata Steel CSR", icon: AlertCircle, color: '#E8A33D', active: true },
  { stage: "Work in Progress", actor: "Local Contractor", icon: Wrench, color: '#1D3238', active: false },
  { stage: "Resolved", actor: "Admin", icon: CheckCircle2, color: '#1D3238', active: false }
];

export default function ProblemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { problems, fetchProblems, deleteProblem } = useProblemStore() as any;
  const { user } = useAuthStore() as any;
  const { showToast } = useToastStore();

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [upvotes, setUpvotes] = useState(142);
  const [hasUpvoted, setHasUpvoted] = useState(false);

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

  const handleDelete = () => {
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1B1E', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E8A33D" />
        <Text style={{ color: '#9BA8A6', marginTop: 12 }}>Loading problem details...</Text>
      </SafeAreaView>
    );
  }

  const slaHours = problem.urgency === 'urgent' ? 168 : 336;
  const reportedAt = new Date(problem.createdAt || Date.now()).getTime();
  const dueAt = reportedAt + slaHours * 60 * 60 * 1000;
  const remainingHours = Math.max(0, Math.ceil((dueAt - Date.now()) / (60 * 60 * 1000)));

  const getStatusColor = (status: string) => {
    if (status === 'new' || status === 'open') return '#E8A33D';
    if (status === 'in-progress') return '#3B82F6';
    if (status === 'resolved' || status === 'closed') return '#2F9E8F';
    return '#9BA8A6';
  };

  const isOwner = user && (
    user.id === problem.reportedBy?._id || 
    user.id === problem.reportedBy?.id || 
    user.id === problem.reportedBy || 
    user._id === problem.reportedBy?._id || 
    user._id === problem.reportedBy
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1B1E' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Navigation */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, marginLeft: -8 }}>
            <ArrowLeft size={20} color="#9BA8A6" />
            <Text style={{ color: '#9BA8A6', marginLeft: 8, fontSize: 14 }}>Back</Text>
          </TouchableOpacity>
          <View style={{ backgroundColor: 'rgba(232, 163, 61, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(232, 163, 61, 0.2)' }}>
            <Text style={{ color: '#E8A33D', fontSize: 10, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
              REF: #{String(problem._id || problem.id).substring(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Hero Card */}
        <View style={{ backgroundColor: '#16262A', borderRadius: 20, borderWidth: 1, borderColor: '#1D3238', overflow: 'hidden', marginBottom: 20 }}>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getStatusColor(problem.status) }} />
              <View style={{ backgroundColor: '#1D3238', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: '#9BA8A6', fontSize: 10, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                  URGENCY: <Text style={{ color: '#E8A33D' }}>{problem.urgency?.toUpperCase() || 'MEDIUM'}</Text>
                </Text>
              </View>
              <TouchableOpacity onPress={handleShare} style={{ marginLeft: 'auto', padding: 4 }}>
                <Share2 size={20} color="#9BA8A6" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <Text style={{ flex: 1, color: '#F2EFE9', fontSize: 26, fontWeight: '800', lineHeight: 32 }}>
                {problem.title}
              </Text>
              {isOwner && (
                <TouchableOpacity onPress={handleDelete} style={{ padding: 8, backgroundColor: 'rgba(248, 113, 113, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)' }}>
                  <Trash2 size={20} color="#F87171" />
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={14} color="#E8A33D" style={{ marginRight: 6 }} />
                <Text style={{ color: '#9BA8A6', fontSize: 13 }}>{problem.location?.district || "Jharkhand"}, {problem.location?.block || "Block"}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={14} color="#2F9E8F" style={{ marginRight: 6 }} />
                <Text style={{ color: '#9BA8A6', fontSize: 13 }}>Reported {new Date(problem.createdAt || Date.now()).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#1D3238', marginBottom: 20 }} />

            <Text style={{ color: '#F2EFE9', fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
              {problem.description}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: remainingHours === 0 ? 'rgba(193, 68, 59, 0.1)' : 'rgba(232, 163, 61, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: remainingHours === 0 ? 'rgba(193, 68, 59, 0.3)' : 'rgba(232, 163, 61, 0.3)' }}>
              <Clock size={18} color={remainingHours === 0 ? '#C1443B' : '#E8A33D'} style={{ marginRight: 10 }} />
              <Text style={{ color: remainingHours === 0 ? '#F87171' : '#E8A33D', fontSize: 13, fontWeight: '600' }}>
                Municipal SLA: {remainingHours ? `${remainingHours} hours remaining` : 'SLA breached'} 
                <Text style={{ opacity: 0.8, fontSize: 11 }}> ({slaHours / 24}-day target)</Text>
              </Text>
            </View>
          </View>

          {/* Citizen Impact Bar */}
          <View style={{ backgroundColor: '#0F1B1E', borderTopWidth: 1, borderTopColor: '#1D3238', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#1D3238', borderWidth: 2, borderColor: '#0F1B1E', zIndex: 3, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 10 }}>A</Text></View>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#2F9E8F', borderWidth: 2, borderColor: '#0F1B1E', zIndex: 2, marginLeft: -12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 10 }}>R</Text></View>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8A33D', borderWidth: 2, borderColor: '#0F1B1E', zIndex: 1, marginLeft: -12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 10 }}>K</Text></View>
              </View>
              <Text style={{ color: '#9BA8A6', fontSize: 12 }}>
                <Text style={{ color: '#F2EFE9', fontWeight: 'bold' }}>+{upvotes}</Text> impacted
              </Text>
            </View>

            <TouchableOpacity 
              onPress={handleUpvote}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: hasUpvoted ? '#E8A33D' : 'transparent', borderWidth: 1, borderColor: '#E8A33D', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
            >
              <ThumbsUp size={14} color={hasUpvoted ? '#0F1B1E' : '#E8A33D'} style={{ marginRight: 6 }} />
              <Text style={{ color: hasUpvoted ? '#0F1B1E' : '#E8A33D', fontSize: 12, fontWeight: '700' }}>
                {hasUpvoted ? 'Supported' : 'Support Issue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Media Evidence Display */}
        <View style={{ backgroundColor: '#16262A', borderRadius: 20, borderWidth: 1, borderColor: '#1D3238', padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1D3238', paddingBottom: 16, marginBottom: 16 }}>
            <Camera size={20} color="#E8A33D" style={{ marginRight: 8 }} />
            <Text style={{ color: '#F2EFE9', fontSize: 16, fontWeight: '700' }}>Verified Evidence</Text>
          </View>

          {problem.images && problem.images.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {problem.images.map((img: any, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => setPreviewImage(img.url)}
                  style={{ width: '47%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#1D3238' }}
                >
                  <Image source={{ uri: img.url }} style={{ width: '100%', height: '100%' }} />
                  <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: '#E8A33D', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: '#0F1B1E', fontSize: 9, fontWeight: 'bold' }}>Expand</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderStyle: 'dashed', borderRadius: 12, padding: 24, alignItems: 'center' }}>
              <Camera size={32} color="rgba(239, 68, 68, 0.5)" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#F87171', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>No Proof Attached</Text>
              <Text style={{ color: 'rgba(239, 68, 68, 0.7)', fontSize: 11, textAlign: 'center' }}>Issues without evidence are highly unlikely to be processed.</Text>
            </View>
          )}
        </View>

        {/* Resolution Tracker */}
        <View style={{ backgroundColor: '#16262A', borderRadius: 20, borderWidth: 1, borderColor: '#1D3238', padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <Activity size={20} color="#2F9E8F" style={{ marginRight: 8 }} />
            <Text style={{ color: '#F2EFE9', fontSize: 16, fontWeight: '700' }}>Resolution Tracker</Text>
          </View>

          <View style={{ marginLeft: 8 }}>
            {LIFECYCLE_STAGES.map((item, index) => {
              const isLast = index === LIFECYCLE_STAGES.length - 1;
              return (
                <View key={index} style={{ flexDirection: 'row', opacity: item.active ? 1 : 0.4 }}>
                  <View style={{ alignItems: 'center', marginRight: 16 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: item.color, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#16262A', zIndex: 2 }}>
                      <item.icon size={12} color={item.active ? '#0F1B1E' : '#9BA8A6'} />
                    </View>
                    {!isLast && (
                      <View style={{ width: 2, height: 40, backgroundColor: '#1D3238', marginTop: -4, marginBottom: -4, zIndex: 1 }} />
                    )}
                  </View>
                  <View style={{ paddingBottom: isLast ? 0 : 24, paddingTop: 4 }}>
                    <Text style={{ color: item.active ? '#F2EFE9' : '#9BA8A6', fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>{item.stage}</Text>
                    <Text style={{ color: item.active ? item.color : '#9BA8A6', fontSize: 12, marginBottom: 6 }}>{item.actor}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

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

    </SafeAreaView>
  );
}