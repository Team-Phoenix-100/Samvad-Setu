import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft, Camera, MapPin, Sparkles, CheckCircle, UploadCloud, RefreshCw, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useProblemStore } from '../../../store/problemStore';
import { useToastStore } from '../../../store/toastStore';

export default function SubmitProblemScreen() {
  const router = useRouter();
  const { addProblem, isLoading } = useProblemStore() as any;
  const { showToast } = useToastStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    district: 'Ranchi',
    block: 'Kanke',
    urgency: 'medium',
    category: 'Infrastructure & Safety',
    imageUploaded: false,
    images: [] as any[],
    previewUrls: [] as string[],
    lat: 23.3441,
    lng: 85.3096,
  });

  const handleNextToAI = () => {
    if (!formData.imageUploaded || formData.images.length === 0) {
      showToast("Uploading valid proof is required before continuing.", "error");
      return;
    }

    let newCategory = formData.category;
    let newUrgency = formData.urgency;

    if (formData.description.toLowerCase().includes('water') || formData.description.toLowerCase().includes('pump')) {
      newCategory = 'Renewable Energy & Water';
      newUrgency = 'urgent';
    } else if (formData.description.toLowerCase().includes('road') || formData.description.toLowerCase().includes('bridge')) {
      newCategory = 'Civil Infrastructure';
      newUrgency = 'high';
    }
    
    setFormData(prev => ({ ...prev, category: newCategory, urgency: newUrgency }));
    setStep(4);
  };

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission to access location was denied', 'error');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData(prev => ({ 
        ...prev, 
        lat: location.coords.latitude, 
        lng: location.coords.longitude 
      }));
      showToast('Location updated successfully', 'success');
    } catch (error) {
      showToast('Failed to get location. Please enable GPS.', 'error');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFormData(prev => ({
          ...prev,
          imageUploaded: true,
          images: [asset],
          previewUrls: [asset.uri]
        }));
        showToast("Photo attached successfully!", "success");
      }
    } catch (error) {
      showToast("Error picking image.", "error");
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      imageUploaded: false,
      images: [],
      previewUrls: []
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
      location: { district: formData.district, block: formData.block, lat: formData.lat, lng: formData.lng },
      images: formData.images,
    };
    
    const created = await addProblem(payload);
    
    if (created && !created.error) {
      showToast("Problem reported successfully!", "success");
      router.replace('/(citizen)/home');
    } else {
      showToast(created?.error || "Failed to submit problem. Please try again.", "error");
    }
  };

  // UI Helpers
  const inputStyle = { backgroundColor: '#0F1B1E', borderRadius: 10, borderWidth: 1, borderColor: '#1D3238', paddingHorizontal: 12, paddingVertical: 12, color: '#F2EFE9', fontSize: 14 };
  const labelStyle = { color: '#9BA8A6', fontSize: 10, letterSpacing: 1, marginBottom: 6, fontWeight: '700' as const, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1B1E' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          
          {/* Header */}
          <View style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#1D3238', paddingBottom: 16 }}>
            <Text style={{ fontSize: 10, color: '#E8A33D', fontWeight: 'bold', letterSpacing: 1, marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
              PHASE 3 • STEP {step} OF 5
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#F2EFE9', marginBottom: 12 }}>Report Civic Problem</Text>
            
            {/* Progress Bar */}
            <View style={{ flexDirection: 'row', height: 4, gap: 4 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={{ flex: 1, backgroundColor: i <= step ? '#E8A33D' : '#1D3238', borderRadius: 2 }} />
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: '#16262A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1D3238' }}>
            
            {/* STEP 1 */}
            {step === 1 && (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F2EFE9', marginBottom: 16 }}>1. Issue Information</Text>
                
                <View style={{ marginBottom: 16 }}>
                  <Text style={labelStyle}>PROBLEM TITLE *</Text>
                  <TextInput
                    value={formData.title}
                    onChangeText={t => setFormData({ ...formData, title: t })}
                    placeholder="e.g., Damaged Solar Water Pump"
                    placeholderTextColor="#9BA8A6"
                    style={inputStyle}
                  />
                </View>

                <View style={{ marginBottom: 24 }}>
                  <Text style={labelStyle}>DETAILED DESCRIPTION</Text>
                  <TextInput
                    value={formData.description}
                    onChangeText={t => setFormData({ ...formData, description: t })}
                    placeholder="Describe the issue in detail..."
                    placeholderTextColor="#9BA8A6"
                    multiline
                    numberOfLines={4}
                    style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
                  />
                </View>

                <TouchableOpacity 
                  onPress={() => {
                    if (!formData.title.trim()) {
                      showToast("Please provide a title.", "error");
                      return;
                    }
                    setStep(2);
                  }}
                  style={{ backgroundColor: '#E8A33D', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#0F1B1E', fontSize: 15, fontWeight: '800', marginRight: 8 }}>Continue to Location</Text>
                  <ArrowRight size={18} color="#0F1B1E" />
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F2EFE9', marginBottom: 16 }}>2. Pin Location</Text>
                
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>DISTRICT</Text>
                    <TextInput value={formData.district} onChangeText={t => setFormData({ ...formData, district: t })} style={inputStyle} placeholderTextColor="#9BA8A6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>BLOCK / LOCALITY</Text>
                    <TextInput value={formData.block} onChangeText={t => setFormData({ ...formData, block: t })} style={inputStyle} placeholderTextColor="#9BA8A6" />
                  </View>
                </View>

                <View style={{ padding: 24, borderWidth: 1, borderColor: '#1D3238', borderStyle: 'dashed', borderRadius: 12, backgroundColor: '#0F1B1E', alignItems: 'center', marginBottom: 24 }}>
                  <MapPin color="#E8A33D" size={32} style={{ marginBottom: 12 }} />
                  <Text style={{ color: '#9BA8A6', fontSize: 12, marginBottom: 8 }}>GPS Auto-Location</Text>
                  <View style={{ backgroundColor: 'rgba(47, 158, 143, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 16 }}>
                    <Text style={{ color: '#2F9E8F', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                      Lat: {formData.lat.toFixed(4)}, Lng: {formData.lng.toFixed(4)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleGetLocation} style={{ borderWidth: 1, borderColor: '#1D3238', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
                    <Text style={{ color: '#F2EFE9', fontSize: 12 }}>Use Current Location</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setStep(1)} style={{ flex: 1, borderWidth: 1, borderColor: '#1D3238', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color="#F2EFE9" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#F2EFE9', fontSize: 14, fontWeight: '600' }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStep(3)} style={{ flex: 1, backgroundColor: '#E8A33D', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#0F1B1E', fontSize: 14, fontWeight: '800', marginRight: 8 }}>Media</Text>
                    <ArrowRight size={16} color="#0F1B1E" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F2EFE9' }}>3. Upload Photos</Text>
                  {formData.imageUploaded && (
                    <View style={{ backgroundColor: 'rgba(47, 158, 143, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                      <CheckCircle size={12} color="#2F9E8F" style={{ marginRight: 4 }} />
                      <Text style={{ color: '#2F9E8F', fontSize: 10, fontWeight: '700' }}>Ready</Text>
                    </View>
                  )}
                </View>

                {formData.imageUploaded && formData.previewUrls.length > 0 ? (
                  <View style={{ backgroundColor: '#0F1B1E', borderWidth: 1, borderColor: '#1D3238', borderRadius: 16, padding: 16, marginBottom: 24 }}>
                    <Image source={{ uri: formData.previewUrls[0] }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }} resizeMode="cover" />
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1D3238', paddingTop: 16 }}>
                      <View>
                        <Text style={{ color: '#2F9E8F', fontSize: 12, fontWeight: 'bold' }}>Photo Attached</Text>
                        <Text style={{ color: '#9BA8A6', fontSize: 10 }}>Ready for submission</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity onPress={handlePickImage} style={{ backgroundColor: '#1D3238', padding: 8, borderRadius: 8 }}>
                          <RefreshCw size={16} color="#F2EFE9" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleRemovePhoto} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: 8 }}>
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handlePickImage} style={{ padding: 32, borderWidth: 2, borderColor: '#1D3238', borderStyle: 'dashed', borderRadius: 16, backgroundColor: '#0F1B1E', alignItems: 'center', marginBottom: 24 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#16262A', borderWidth: 1, borderColor: '#1D3238', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Camera size={28} color="#E8A33D" />
                    </View>
                    <Text style={{ color: '#F2EFE9', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Tap to select photo</Text>
                    <Text style={{ color: '#9BA8A6', fontSize: 11 }}>Supports JPG, PNG</Text>
                  </TouchableOpacity>
                )}

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setStep(2)} style={{ flex: 1, borderWidth: 1, borderColor: '#1D3238', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color="#F2EFE9" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#F2EFE9', fontSize: 14, fontWeight: '600' }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextToAI} style={{ flex: 1, backgroundColor: '#E8A33D', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {formData.imageUploaded ? (
                      <Text style={{ color: '#0F1B1E', fontSize: 14, fontWeight: '800', marginRight: 8 }}>Submit</Text>
                    ) : (
                      <Text style={{ color: '#0F1B1E', fontSize: 13, fontWeight: '800', marginRight: 8 }}>AI Engine</Text>
                    )}
                    {formData.imageUploaded ? <ArrowRight size={16} color="#0F1B1E" /> : <Sparkles size={16} color="#0F1B1E" />}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Sparkles size={20} color="#2F9E8F" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2F9E8F' }}>4. AI Analysis & Routing</Text>
                </View>

                <View style={{ backgroundColor: '#0F1B1E', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1D3238', marginBottom: 24, gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#9BA8A6', fontSize: 12 }}>Detected Category:</Text>
                    <Text style={{ color: '#E8A33D', fontSize: 12, fontWeight: 'bold' }}>{formData.category}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#9BA8A6', fontSize: 12 }}>Calculated Urgency:</Text>
                    <Text style={{ color: '#2F9E8F', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>{formData.urgency}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#9BA8A6', fontSize: 12 }}>Suggested Match HEIs:</Text>
                    <Text style={{ color: '#F2EFE9', fontSize: 12, fontWeight: 'bold' }}>BIT Sindri, Ranchi University</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setStep(3)} style={{ flex: 1, borderWidth: 1, borderColor: '#1D3238', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color="#F2EFE9" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#F2EFE9', fontSize: 14, fontWeight: '600' }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStep(5)} style={{ flex: 1, backgroundColor: '#E8A33D', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#0F1B1E', fontSize: 14, fontWeight: '800', marginRight: 8 }}>Review</Text>
                    <ArrowRight size={16} color="#0F1B1E" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F2EFE9', marginBottom: 16 }}>5. Review Your Report</Text>
                
                <View style={{ backgroundColor: '#0F1B1E', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1D3238', marginBottom: 24, gap: 12 }}>
                  <Text style={{ color: '#F2EFE9', fontSize: 13 }}><Text style={{ color: '#9BA8A6' }}>Title:</Text> {formData.title}</Text>
                  <Text style={{ color: '#F2EFE9', fontSize: 13 }}><Text style={{ color: '#9BA8A6' }}>Description:</Text> {formData.description}</Text>
                  <Text style={{ color: '#F2EFE9', fontSize: 13 }}><Text style={{ color: '#9BA8A6' }}>Location:</Text> {formData.district}, {formData.block}</Text>
                  <Text style={{ color: '#F2EFE9', fontSize: 13 }}><Text style={{ color: '#9BA8A6' }}>Category:</Text> {formData.category}</Text>

                  {formData.previewUrls.length > 0 && (
                    <View style={{ borderTopWidth: 1, borderTopColor: '#1D3238', paddingTop: 12, marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
                      <Image source={{ uri: formData.previewUrls[0] }} style={{ width: 48, height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#1D3238', marginRight: 12 }} />
                      <View>
                        <Text style={{ color: '#2F9E8F', fontSize: 12, fontWeight: 'bold' }}>Photo Evidence Attached</Text>
                        <Text style={{ color: '#9BA8A6', fontSize: 10 }}>Ready for submission</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setStep(4)} style={{ flex: 1, borderWidth: 1, borderColor: '#1D3238', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color="#F2EFE9" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#F2EFE9', fontSize: 14, fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={{ flex: 1, backgroundColor: '#E8A33D', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? (
                      <ActivityIndicator color="#0F1B1E" size="small" />
                    ) : (
                      <>
                        <Text style={{ color: '#0F1B1E', fontSize: 14, fontWeight: '800', marginRight: 8 }}>Submit</Text>
                        <CheckCircle size={16} color="#0F1B1E" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}